const vscode = require('vscode');

class ReviewPanel {
    constructor(extensionUri, reviewData, targetBranch) {
        this.reviewData = reviewData;
        this.targetBranch = targetBranch;

        this.panel = vscode.window.createWebviewPanel(
            'gitDiffReview',
            'Git Diff AI Review',
            vscode.ViewColumn.Two,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [extensionUri]
            }
        );

        this.panel.webview.html = this.getHtmlContent(extensionUri);

        // Handle messages from the webview
        this.panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'copyReview':
                        vscode.env.clipboard.writeText(this.reviewData.review);
                        vscode.window.showInformationMessage('Review copied to clipboard');
                        break;
                    case 'saveReview':
                        this.saveReview();
                        break;
                }
            },
            undefined,
            undefined
        );
    }

    getHtmlContent(extensionUri) {
        const reviewData = this.reviewData;
        const targetBranch = this.targetBranch;

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Git Diff AI Review</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            font-weight: var(--vscode-font-weight);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
            line-height: 1.6;
        }

        .header {
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid var(--vscode-panel-border);
        }

        .header h1 {
            margin: 0 0 10px 0;
            font-size: 24px;
            color: var(--vscode-foreground);
        }

        .metadata {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 15px;
        }

        .metadata-item {
            margin: 5px 0;
        }

        .button-container {
            display: none;
        }

        .fix-button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 4px 12px;
            font-size: 12px;
            cursor: pointer;
            border-radius: 2px;
            margin-left: 8px;
            display: inline-block;
        }

        .fix-button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }

        .review-content {
            background-color: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            padding: 20px;
            overflow-x: auto;
        }

        .review-content h1,
        .review-content h2,
        .review-content h3 {
            color: var(--vscode-foreground);
            margin-top: 8px;
            margin-bottom: 4px;
        }

        .review-content h1 {
            font-size: 28px;
            border-bottom: 1px solid var(--vscode-panel-border);
            padding-bottom: 6px;
            margin-top: 16px;
        }

        .review-content h2 {
            font-size: 22px;
            margin-top: 10px;
        }

        .review-content h3 {
            font-size: 18px;
            margin-top: 8px;
        }

        .issue-item {
            background-color: var(--vscode-editor-lineHighlightBackground);
            border-left: 4px solid var(--vscode-button-background);
            padding: 12px 15px;
            margin: 8px 0;
            border-radius: 3px;
            display: block;
        }

        .issue-critical {
            border-left-color: var(--vscode-errorForeground);
            background-color: rgba(244, 67, 54, 0.1);
        }

        .issue-warning {
            border-left-color: var(--vscode-editorWarning-foreground);
            background-color: rgba(255, 152, 0, 0.1);
        }

        .issue-info {
            border-left-color: var(--vscode-editorInfo-foreground);
            background-color: rgba(33, 150, 243, 0.1);
        }

        .issue-icon {
            font-weight: bold;
            margin-right: 8px;
        }

        .issue-critical .issue-icon {
            color: var(--vscode-errorForeground);
        }

        .issue-warning .issue-icon {
            color: var(--vscode-editorWarning-foreground);
        }

        .issue-info .issue-icon {
            color: var(--vscode-editorInfo-foreground);
        }

        .review-content ul,
        .review-content ol {
            padding-left: 20px;
        }

        .review-content li {
            margin: 5px 0;
        }

        .review-content code {
            background-color: var(--vscode-textCodeBlock-background);
            padding: 2px 6px;
            border-radius: 3px;
            font-family: var(--vscode-editor-font-family);
        }

        .review-content pre {
            background-color: var(--vscode-textCodeBlock-background);
            padding: 15px;
            border-radius: 4px;
            overflow-x: auto;
            margin: 10px 0;
        }

        .review-content pre code {
            background-color: transparent;
            padding: 0;
        }

        .review-content blockquote {
            border-left: 4px solid var(--vscode-textLink-foreground);
            padding-left: 15px;
            margin: 15px 0;
            color: var(--vscode-descriptionForeground);
        }

        .review-content strong {
            font-weight: bold;
        }

        .status-success {
            color: var(--vscode-testing-iconPassed);
        }

        .status-error {
            color: var(--vscode-errorForeground);
        }

        .loading {
            text-align: center;
            padding: 40px;
            color: var(--vscode-descriptionForeground);
        }

        .spinner {
            border: 3px solid var(--vscode-panel-border);
            border-top: 3px solid var(--vscode-button-background);
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🤖 Git Diff AI Review</h1>
        <div class="metadata">
            <div class="metadata-item"><strong>Target Branch:</strong> ${targetBranch}</div>
            <div class="metadata-item"><strong>Current Branch:</strong> ${reviewData.metadata?.currentBranch || 'N/A'}</div>
            <div class="metadata-item"><strong>Model:</strong> ${reviewData.metadata?.model || 'N/A'}</div>
            <div class="metadata-item"><strong>Diff Size:</strong> ${reviewData.metadata?.diffSize || 0} characters</div>
            <div class="metadata-item"><strong>Time:</strong> ${reviewData.metadata?.timestamp || new Date().toISOString()}</div>
        </div>
    </div>

    <div class="button-container">
        <button id="copyBtn">📋 Copy Review</button>
        <button id="saveBtn">💾 Save Review</button>
    </div>

    <div class="review-content">
        ${this.renderMarkdown(reviewData.review)}
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        function toggleFix(elementId) {
            const element = document.getElementById(elementId);
            if (element) {
                element.style.display = element.style.display === 'none' ? 'block' : 'none';
            }
        }

        document.getElementById('copyBtn')?.addEventListener('click', () => {
            vscode.postMessage({ command: 'copyReview' });
        });

        document.getElementById('saveBtn')?.addEventListener('click', () => {
            vscode.postMessage({ command: 'saveReview' });
        });
    </script>
</body>
</html>`;
    }

    renderMarkdown(text) {
        if (!text) return '<p class="status-error">No review content available</p>';

        // Simple markdown to HTML conversion
        let html = text
            // Escape HTML但保留特殊标记
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // 处理问题标记 - 保留原始标记以便后续识别
        html = html
            // Headers
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            // Bold
            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.*?)\*/gim, '<em>$1</em>')
            // Code blocks
            .replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre><code>$2</code></pre>')
            // Inline code
            .replace(/`([^`]+)`/gim, '<code>$1</code>');

        // 将内容按行分割处理
        let lines = html.split('\n');
        let processedLines = [];
        let issueCounter = 0;

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];

            // 检测问题类型并对应处理
            const criticalPatterns = [
                /\[CRITICAL\]|\[致命\]|\[严重\]|🔴|❌/i,
                /security|安全|vulnerability|漏洞|injection|注入|xss|sql|未授权|无权限/i,
                /crash|memor leak|内存泄漏|溢出|死锁|deadlock|infinite loop/i
            ];

            const warningPatterns = [
                /\[WARNING\]|\[警告\]|\[重要\]|🟠|⚠️/i,
                /logical error|逻辑错误|null pointer|空指针|常量|deprecated|已弃用/i,
                /performance|性能|inefficient|低效|循环|大对象/i
            ];

            const infoPatterns = [
                /\[INFO\]|\[信息\]|\[建议\]|🔵|ℹ️/i,
                /suggestion|建议|improve|改进|consideration|考虑|best practice|最佳实践/i
            ];

            let isCritical = false;
            let isWarning = false;
            let isInfo = false;

            for (let pattern of criticalPatterns) {
                if (pattern.test(line)) {
                    isCritical = true;
                    break;
                }
            }

            if (!isCritical) {
                for (let pattern of warningPatterns) {
                    if (pattern.test(line)) {
                        isWarning = true;
                        break;
                    }
                }
            }

            if (!isCritical && !isWarning) {
                for (let pattern of infoPatterns) {
                    if (pattern.test(line)) {
                        isInfo = true;
                        break;
                    }
                }
            }

            // 如果是列表项且是问题相关，添加样式和按钮
            if ((isCritical || isWarning || isInfo) && (line.includes('<li>') || line.match(/^\s*[-*•]/))) {
                let issueLevel = isCritical ? 'critical' : (isWarning ? 'warning' : 'info');
                let icon = isCritical ? '🔴' : (isWarning ? '🟠' : '🔵');
                let fixContentId = `fix-content-${issueCounter}`;
                
                // 收集修复信息
                let fixInfo = '';
                if (i + 1 < lines.length) {
                    let nextLine = lines[i + 1];
                    if (nextLine.includes('How to fix') || nextLine.includes('如何修复')) {
                        fixInfo = nextLine
                            .replace(/.*?(How to fix|如何修复):\s*/i, '')
                            .replace(/<\/?[^>]+(>|$)/g, '')
                            .trim();
                        // 标记下一行已处理
                        lines[i + 1] = '';
                    }
                }

                issueCounter++;
                
                if (line.includes('<li>')) {
                    const fixContent = fixInfo || 'Review the issue description above and implement the recommended changes step by step. Consider adding tests to verify the fix.';
                    line = `<li class="issue-item issue-${issueLevel}"><span class="issue-icon">${icon}</span>${line.substring(4)} <button class="fix-button" onclick="toggleFix('${fixContentId}')">💡 How to fix</button><div id="${fixContentId}" style="display:none; margin-top: 8px; padding: 8px 12px; background-color: var(--vscode-editor-lineHighlightBackground); border-radius: 3px; font-size: 12px; border-left: 3px solid var(--vscode-button-background);"><strong>Fix:</strong> ${fixContent}</div></li>`;
                }
            }

            processedLines.push(line);
        }

        html = processedLines.filter(line => line !== '').join('\n');

        // 处理列表
        html = html.replace(/(<li>.*?<\/li>)/gims, (match) => {
            return `<ul>${match}</ul>`;
        });
        html = html.replace(/<\/ul>\s*<ul>/gim, '');

        // Line breaks
        html = html
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');

        // Wrap in paragraph if not already wrapped
        if (!html.startsWith('<h') && !html.startsWith('<p>')) {
            html = '<p>' + html + '</p>';
        }

        return html;
    }

    saveReview() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `git-diff-review-${timestamp}.md`;
        const content = `# Git Diff AI Review\n\n**Target Branch:** ${this.targetBranch}\n**Current Branch:** ${this.reviewData.metadata?.currentBranch || 'N/A'}\n**Model:** ${this.reviewData.metadata?.model || 'N/A'}\n**Time:** ${this.reviewData.metadata?.timestamp || new Date().toISOString()}\n\n---\n\n${this.reviewData.review}`;

        const uri = vscode.Uri.file(
            vscode.workspace.workspaceFolders?.[0]?.uri.fsPath + '/' + filename
        );

        vscode.workspace.fs.writeFile(uri, Buffer.from(content)).then(() => {
            vscode.window.showInformationMessage(`Review saved to ${filename}`);
        });
    }

    dispose() {
        this.panel.dispose();
    }
}

module.exports = ReviewPanel;
