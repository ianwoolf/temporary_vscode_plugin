# 使用指南

## 首次使用

### 1. 安装插件

```bash
# 在插件目录中
npm install

# 在 VSCode 中按 F5 启动扩展开发主机进行测试
```

### 2. 配置 AI API

在 VSCode 中打开设置（`Cmd+,` 或 `Ctrl+,`），搜索 `Git Diff AI Reviewer`，配置以下必需项：

```json
{
  "gitDiffAiReviewer.aiApiUrl": "https://api.anthropic.com/v1/messages",
  "gitDiffAiReviewer.aiApiKey": "your-api-key-here",
  "gitDiffAiReviewer.targetBranch": "main"
}
```

### 3. 开始使用

在 VSCode 左侧活动栏找到 Git Diff AI Reviewer 图标，点击打开侧边栏。

## 侧边栏功能

### 🚀 Start Review

点击此按钮开始代码审查流程：

1. 自动获取当前分支与目标分支的 git diff
2. 调用配置的 AI 接口进行审查
3. 在 Webview 面板中展示审查结果

### 📜 Review History

查看历史审查记录（最多保存 10 条）：

- 显示每次审查的时间
- 可以重新查看历史审查结果

### 🔄 Refresh

刷新侧边栏视图。

### ⚙️ Configure

快速打开插件设置页面。

## Webview 面板功能

审查结果展示面板包含：

- **元数据信息**：目标分支、当前分支、使用的模型、时间等
- **📋 Copy Review**：将审查结果复制到剪贴板
- **💾 Save Review**：将审查结果保存为 Markdown 文件
- **审查内容**：格式化的 AI 审查结果

## 常见问题

### Q: 提示 "No diff found"？

A: 确保当前分支与目标分支之间存在差异。可以尝试：

```bash
# 检查当前分支
git branch

# 检查与目标分支的差异
git diff main...HEAD
```

### Q: Diff 太大导致审查失败？

A: 可以调整配置中的 `maxDiffSize` 参数，或者分批提交代码。

### Q: AI 审查速度慢？

A: 这取决于：
- 网络连接速度
- AI API 的响应时间
- Diff 的大小

建议在配置中设置合理的 `maxDiffSize`。

### Q: 如何更换 AI 服务提供商？

A: 只需在设置中更改 `aiApiUrl` 和 `aiModel` 参数即可。插件支持任何兼容的 AI API。

## 高级配置

### 自定义 Prompt

编辑 `aiReviewer.js` 文件中的 `this.defaultPrompt` 来自定义审查提示词。

### 调整最大 Diff 大小

```json
{
  "gitDiffAiReviewer.maxDiffSize": 200000
}
```

### 使用不同的目标分支

```json
{
  "gitDiffAiReviewer.targetBranch": "develop"
}
```

## 开发和调试

### 调试插件

1. 在 VSCode 中打开此项目
2. 按 `F5` 启动扩展开发主机
3. 在新窗口中测试插件功能
4. 查看调试控制台查看日志

### 打包插件

```bash
# 安装 vsce（如果还没安装）
npm install -g @vscode/vsce

# 打包
vsce package

# 安装打包好的插件
code --install-extension git-diff-ai-reviewer-0.0.1.vsix
```

## 最佳实践

1. **定期审查**：在每次合并 PR 前进行 AI 审查
2. **合理配置**：根据项目大小调整 `maxDiffSize`
3. **保护密钥**：不要在代码中硬编码 API Key
4. **查看历史**：利用历史记录功能追踪代码质量变化
5. **结合使用**：将 AI 审查与人工 Code Review 结合使用

## 反馈和建议

如有问题或建议，欢迎在项目仓库中提交 Issue。
