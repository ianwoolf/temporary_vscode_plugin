const vscode = require('vscode');
const GitDiffProvider = require('./gitDiffProvider');
const AiReviewer = require('./aiReviewer');
const ReviewPanel = require('./webview/ReviewPanel');
const SidebarProvider = require('./sidebarProvider');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('Git Diff AI Reviewer is now active!');

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
            const aiApiUrl = config.get('aiApiUrl', '');
            const aiApiKey = config.get('aiApiKey', '');
            const aiModel = config.get('aiModel', 'claude-3-5-sonnet-20241022');
            const maxDiffSize = config.get('maxDiffSize', 100000);

            // Validate configuration
            if (!aiApiUrl || !aiApiKey) {
                vscode.window.showErrorMessage('Please configure AI API URL and API Key in settings');
                return;
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
                    apiUrl: aiApiUrl,
                    apiKey: aiApiKey,
                    model: aiModel,
                    targetBranch: targetBranch,
                    currentBranch: await gitDiffProvider.getCurrentBranch()
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

    // Register all commands
    context.subscriptions.push(reviewCommand);
    context.subscriptions.push(refreshCommand);
    context.subscriptions.push(configureCommand);
    context.subscriptions.push(historyCommand);
}

function deactivate() {
    console.log('Git Diff AI Reviewer is now deactivated!');
}

module.exports = {
    activate,
    deactivate
};
