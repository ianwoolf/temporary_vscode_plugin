const vscode = require('vscode');

class SidebarProvider {
    constructor(context, reviewCallback) {
        this.context = context;
        this.reviewCallback = reviewCallback;

        this._view = vscode.window.createTreeView('gitDiffAiReviewerSidebar', {
            treeDataProvider: this,
            showCollapseAll: false
        });

        this.disposables = [];
    }

    refresh() {
        this._view = vscode.window.createTreeView('gitDiffAiReviewerSidebar', {
            treeDataProvider: this,
            showCollapseAll: false
        });
    }

    getTreeItem(element) {
        return element;
    }

    getChildren(element) {
        if (!element) {
            // Root level items
            return Promise.resolve([
                new ReviewItem(
                    '🚀 Start Review',
                    vscode.TreeItemCollapsibleState.None,
                    'Start a new code review'
                ),
                new HistoryItem(
                    '📜 Review History',
                    vscode.TreeItemCollapsibleState.None,
                    'View past reviews'
                )
            ]);
        }
        return Promise.resolve([]);
    }

    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
}

class ReviewItem extends vscode.TreeItem {
    constructor(label, collapsibleState, description) {
        super(label, collapsibleState);
        this.description = description;
        this.tooltip = description;
        this.iconPath = new vscode.ThemeIcon('rocket');
        this.command = {
            command: 'gitDiffAiReviewer.review',
            title: 'Start Review'
        };
    }
}

class HistoryItem extends vscode.TreeItem {
    constructor(label, collapsibleState, description) {
        super(label, collapsibleState);
        this.description = description;
        this.tooltip = description;
        this.iconPath = new vscode.ThemeIcon('history');
        this.contextValue = 'history';
    }
}

module.exports = SidebarProvider;
