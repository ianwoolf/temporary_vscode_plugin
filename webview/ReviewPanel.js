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
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }

        button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 16px;
            font-size: 13px;
            cursor: pointer;
            border-radius: 2px;
        }

        button:hover {
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
            margin-top: 20px;
            margin-bottom: 10px;
        }

        .review-content h1 {
            font-size: 28px;
            border-bottom: 1px solid var(--vscode-panel-border);
            padding-bottom: 10px;
        }

        .review-content h2 {
            font-size: 22px;
        }

        .review-content h3 {
            font-size: 18px;
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

        document.getElementById('copyBtn').addEventListener('click', () => {
            vscode.postMessage({ command: 'copyReview' });
        });

        document.getElementById('saveBtn').addEventListener('click', () => {
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
            // Escape HTML
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
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
            .replace(/`([^`]+)`/gim, '<code>$1</code>')
            // Lists
            .replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>')
            .replace(/^\s*\d+\.\s+(.*$)/gim, '<li>$1</li>')
            // Line breaks
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');

        // Wrap in paragraph if not already wrapped
        if (!html.startsWith('<h') && !html.startsWith('<p>')) {
            html = '<p>' + html + '</p>';
        }

        // Wrap lists
        html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');
        html = html.replace(/<\/ul><ul>/gim, '');

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
