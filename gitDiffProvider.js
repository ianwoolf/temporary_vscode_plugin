const vscode = require('vscode');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class GitDiffProvider {
    constructor() {
        this.workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!this.workspacePath) {
            throw new Error('No workspace folder found');
        }
    }

    async getCurrentBranch() {
        try {
            const { stdout } = await execAsync('git rev-parse --abbrev-ref HEAD', {
                cwd: this.workspacePath
            });
            return stdout.trim();
        } catch (error) {
            throw new Error('Failed to get current branch: ' + error.message);
        }
    }

    async getDiff(targetBranch) {
        try {
            // Try to fetch latest changes from remote (optional)
            try {
                await execAsync(`git fetch origin ${targetBranch}:${targetBranch}`, {
                    cwd: this.workspacePath
                });
            } catch (fetchError) {
                // Ignore fetch errors, continue with local branches
                console.log('Fetch failed, using local branches');
            }

            // Get diff including uncommitted changes
            // This compares working directory + staged changes + committed changes vs target branch
            const { stdout } = await execAsync(`git diff ${targetBranch}`, {
                cwd: this.workspacePath,
                maxBuffer: 10 * 1024 * 1024 // 10MB buffer
            });

            return stdout;
        } catch (error) {
            // Fallback: try comparing with HEAD only (committed changes)
            try {
                const { stdout } = await execAsync(`git diff ${targetBranch}...HEAD`, {
                    cwd: this.workspacePath,
                    maxBuffer: 10 * 1024 * 1024
                });

                // If no diff in committed changes, check staged changes
                if (!stdout || stdout.trim().length === 0) {
                    const { stdout: staged } = await execAsync(`git diff --staged ${targetBranch}`, {
                        cwd: this.workspacePath,
                        maxBuffer: 10 * 1024 * 1024
                    });
                    return staged;
                }

                return stdout;
            } catch (localError) {
                throw new Error('Failed to get diff: ' + localError.message);
            }
        }
    }

    async getChangedFiles(targetBranch) {
        try {
            // Get all changed files including uncommitted changes
            const { stdout } = await execAsync(`git diff --name-only ${targetBranch}`, {
                cwd: this.workspacePath
            });

            const files = stdout.trim().split('\n').filter(file => file.length > 0);

            // Also check for staged files
            try {
                const { stdout: stagedFiles } = await execAsync(`git diff --staged --name-only ${targetBranch}`, {
                    cwd: this.workspacePath
                });
                const staged = stagedFiles.trim().split('\n').filter(file => file.length > 0);

                // Merge and deduplicate
                return [...new Set([...files, ...staged])];
            } catch (stagedError) {
                return files;
            }
        } catch (error) {
            throw new Error('Failed to get changed files: ' + error.message);
        }
    }

    async getFileDiff(targetBranch, filePath) {
        try {
            // Get file diff including uncommitted changes
            const { stdout } = await execAsync(`git diff ${targetBranch} -- "${filePath}"`, {
                cwd: this.workspacePath
            });

            // If no diff in working directory, check staged changes
            if (!stdout || stdout.trim().length === 0) {
                const { stdout: staged } = await execAsync(`git diff --staged ${targetBranch} -- "${filePath}"`, {
                    cwd: this.workspacePath
                });
                return staged;
            }

            return stdout;
        } catch (error) {
            throw new Error(`Failed to get diff for ${filePath}: ` + error.message);
        }
    }
}

module.exports = GitDiffProvider;
