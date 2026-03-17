const vscode = require('vscode');
const GitDiffProvider = require('./gitDiffProvider');
const AiReviewer = require('./aiReviewer');
const ReviewPanel = require('./webview/ReviewPanel');
const SidebarProvider = require('./sidebarProvider');
const ConfigManager = require('./configManager');
const SSOAuthManager = require('./ssoAuthManager');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('Git Diff AI Reviewer is now active!');

    // 初始化配置管理器
    const configManager = new ConfigManager(context);
    configManager.initialize().catch(error => {
        console.error('Failed to initialize ConfigManager:', error);
    });

    const gitDiffProvider = new GitDiffProvider();
    const aiReviewer = new AiReviewer();
    let reviewPanel = null;
    let reviewHistory = [];

    // Create sidebar provider
    const sidebarProvider = new SidebarProvider(context, async () => {
        // Review callback - trigger review command
        await vscode.commands.executeCommand('gitDiffAiReviewer.review');
    });

    // Register review command
    const reviewCommand = vscode.commands.registerCommand('gitDiffAiReviewer.review', async () => {
        try {
            // Get configuration
            const config = vscode.workspace.getConfiguration('gitDiffAiReviewer');
            const targetBranch = config.get('targetBranch', 'main');
            const enableInternalLLM = config.get('enableInternalLLM', false);
            const aiApiUrl = config.get('aiApiUrl', '');
            const aiApiKey = config.get('aiApiKey', '');
            const aiModel = config.get('aiModel', 'claude-3-5-sonnet-20241022');
            const maxDiffSize = config.get('maxDiffSize', 100000);

            // Validate configuration based on LLM type
            if (enableInternalLLM) {
                // 内部LLM配置验证
                const ssoUsername = config.get('ssoUsername', '');
                const ssoPassword = config.get('ssoPassword', '');
                const internalLLMUrl = config.get('internalLLMUrl', '');

                if (!ssoUsername || !ssoPassword) {
                    vscode.window.showErrorMessage('Please configure SSO credentials (username/password) in settings');
                    return;
                }
                if (!internalLLMUrl) {
                    vscode.window.showErrorMessage('Please configure Internal LLM URL in settings');
                    return;
                }

                // 如果密码没有存储在配置文件中，提示用户首次配置
                try {
                    const storedPassword = await configManager.getPassword();
                    if (!storedPassword && ssoPassword) {
                        // 首次配置，保存密码
                        await configManager.saveSSOConfig(ssoUsername, ssoPassword);
                        vscode.window.showInformationMessage('SSO credentials saved successfully');
                    }
                } catch (error) {
                    console.error('Error handling password storage:', error);
                }
            } else {
                // 外部AI服务配置验证
                if (!aiApiUrl || !aiApiKey) {
                    vscode.window.showErrorMessage('Please configure AI API URL and API Key in settings');
                    return;
                }
            }

            // Show progress
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Git Diff AI Reviewer',
                cancellable: false
            }, async (progress) => {
                progress.report({ message: 'Getting git diff...' });

                // Get git diff
                const diff = await gitDiffProvider.getDiff(targetBranch);

                if (!diff || diff.trim().length === 0) {
                    vscode.window.showInformationMessage('No diff found between current branch and ' + targetBranch);
                    return;
                }

                // Check diff size
                if (diff.length > maxDiffSize) {
                    const proceed = await vscode.window.showWarningMessage(
                        `Diff size (${diff.length} chars) exceeds maximum (${maxDiffSize} chars). Continue anyway?`,
                        'Yes',
                        'No'
                    );
                    if (proceed !== 'Yes') {
                        return;
                    }
                }

                progress.report({ message: 'Reviewing with AI...' });

                // Get AI review
                const review = await aiReviewer.review(diff, {
                    apiUrl: enableInternalLLM ? config.get('internalLLMUrl', '') : aiApiUrl,
                    apiKey: aiApiKey,
                    model: enableInternalLLM ? config.get('internalLLMModel', aiModel) : aiModel,
                    targetBranch: targetBranch,
                    currentBranch: await gitDiffProvider.getCurrentBranch(),
                    config: config, // 传递完整配置
                    context: context // 传递context用于SSO认证
                });

                // Add to history
                reviewHistory.unshift({
                    ...review,
                    timestamp: new Date().toISOString()
                });
                if (reviewHistory.length > 10) {
                    reviewHistory.pop();
                }

                // Show results in webview
                if (reviewPanel) {
                    reviewPanel.dispose();
                }
                reviewPanel = new ReviewPanel(context.extensionUri, review, targetBranch);
            });

        } catch (error) {
            vscode.window.showErrorMessage('Error during review: ' + error.message);
            console.error(error);
        }
    });

    // Register refresh command
    const refreshCommand = vscode.commands.registerCommand('gitDiffAiReviewer.refresh', async () => {
        sidebarProvider.refresh();
        vscode.window.showInformationMessage('Sidebar refreshed');
    });

    // Register configure command
    const configureCommand = vscode.commands.registerCommand('gitDiffAiReviewer.configure', async () => {
        vscode.commands.executeCommand('workbench.action.openSettings', 'gitDiffAiReviewer');
    });

    // Register show history command
    const historyCommand = vscode.commands.registerCommand('gitDiffAiReviewer.showHistory', async () => {
        if (reviewHistory.length === 0) {
            vscode.window.showInformationMessage('No review history available');
            return;
        }

        const items = reviewHistory.map((review, index) => ({
            label: `Review ${index + 1}`,
            description: new Date(review.timestamp).toLocaleString(),
            review: review
        }));

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select a review to view'
        });

        if (selected) {
            if (reviewPanel) {
                reviewPanel.dispose();
            }
            reviewPanel = new ReviewPanel(context.extensionUri, selected.review, selected.review.metadata?.targetBranch || 'main');
        }
    });

    // Register SSO login command
    const ssoLoginCommand = vscode.commands.registerCommand('gitDiffAiReviewer.ssoLogin', async () => {
        try {
            const config = vscode.workspace.getConfiguration('gitDiffAiReviewer');

            // 获取用户输入
            const userid = await vscode.window.showInputBox({
                prompt: 'Enter your SSO username',
                placeHolder: 'username',
                ignoreFocusOut: true
            });

            if (!userid) {
                return; // 用户取消输入
            }

            const password = await vscode.window.showInputBox({
                prompt: 'Enter your SSO password',
                placeHolder: 'password',
                password: true, // 隐藏输入
                ignoreFocusOut: true
            });

            if (!password) {
                return; // 用户取消输入
            }

            // 保存凭据
            await configManager.saveSSOConfig(userid, password);

            // 测试登录
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'SSO Login',
                cancellable: false
            }, async (progress) => {
                progress.report({ message: 'Logging in...' });

                const ssoAuthManager = new SSOAuthManager(context);
                await ssoAuthManager.initialize();

                try {
                    await ssoAuthManager.performSSOLogin(config);
                    vscode.window.showInformationMessage('SSO login successful!');
                } catch (error) {
                    vscode.window.showErrorMessage('SSO login failed: ' + error.message);
                    throw error;
                }
            });

        } catch (error) {
            console.error('SSO login command error:', error);
            vscode.window.showErrorMessage('SSO login failed: ' + error.message);
        }
    });

    // Register SSO logout command
    const ssoLogoutCommand = vscode.commands.registerCommand('gitDiffAiReviewer.ssoLogout', async () => {
        try {
            const confirm = await vscode.window.showWarningMessage(
                'Are you sure you want to logout? This will clear your SSO credentials.',
                'Yes',
                'No'
            );

            if (confirm === 'Yes') {
                const ssoAuthManager = new SSOAuthManager(context);
                await ssoAuthManager.logout();
                vscode.window.showInformationMessage('SSO logout successful');
            }
        } catch (error) {
            console.error('SSO logout command error:', error);
            vscode.window.showErrorMessage('SSO logout failed: ' + error.message);
        }
    });

    // Register token info command
    const tokenInfoCommand = vscode.commands.registerCommand('gitDiffAiReviewer.tokenInfo', async () => {
        try {
            const ssoAuthManager = new SSOAuthManager(context);
            await ssoAuthManager.initialize();

            const tokenInfo = await ssoAuthManager.getTokenInfo();

            const message = `
Token Information:
- Has Token: ${tokenInfo.hasToken ? 'Yes' : 'No'}
- Is Expired: ${tokenInfo.isExpired ? 'Yes' : 'No'}
- Expiry Time: ${tokenInfo.expiryTime}
- Remaining Time: ${Math.floor(tokenInfo.remainingTime / 1000 / 60)} minutes
            `.trim();

            vscode.window.showInformationMessage(message);
        } catch (error) {
            console.error('Token info command error:', error);
            vscode.window.showErrorMessage('Failed to get token info: ' + error.message);
        }
    });

    // Register all commands
    context.subscriptions.push(reviewCommand);
    context.subscriptions.push(refreshCommand);
    context.subscriptions.push(configureCommand);
    context.subscriptions.push(historyCommand);
    context.subscriptions.push(ssoLoginCommand);
    context.subscriptions.push(ssoLogoutCommand);
    context.subscriptions.push(tokenInfoCommand);
}

function deactivate() {
    console.log('Git Diff AI Reviewer is now deactivated!');
}

module.exports = {
    activate,
    deactivate
};
