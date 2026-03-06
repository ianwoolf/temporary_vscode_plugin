# 快速开始指南

## 5 分钟上手 Git Diff AI Reviewer

### 第一步：安装依赖

```bash
cd /path/to/vscode_plugin
npm install
```

### 第二步：启动插件

在 VSCode 中：
1. 打开此项目文件夹
2. 按 `F5` 启动扩展开发主机
3. 等待新的 VSCode 窗口打开

### 第三步：配置 API

在新打开的 VSCode 窗口中：

1. 打开一个 Git 仓库
2. 按 `Cmd+,`（Mac）或 `Ctrl+,`（Windows/Linux）打开设置
3. 搜索 `Git Diff AI Reviewer`
4. 填写以下配置：

```json
{
  "gitDiffAiReviewer.aiApiUrl": "你的AI接口地址",
  "gitDiffAiReviewer.aiApiKey": "你的API密钥",
  "gitDiffAiReviewer.targetBranch": "main"
}
```

### 第四步：开始使用

1. 在左侧活动栏找到 **Git Diff AI Reviewer** 图标（🤖）
2. 点击图标打开侧边栏
3. 点击 **🚀 Start Review** 按钮
4. 等待 AI 完成审查
5. 查看审查结果

## 示例配置

### Claude API

```json
{
  "gitDiffAiReviewer.aiApiUrl": "https://api.anthropic.com/v1/messages",
  "gitDiffAiReviewer.aiApiKey": "sk-ant-xxx...",
  "gitDiffAiReviewer.aiModel": "claude-3-5-sonnet-20241022",
  "gitDiffAiReviewer.targetBranch": "main"
}
```

### OpenAI API

```json
{
  "gitDiffAiReviewer.aiApiUrl": "https://api.openai.com/v1/chat/completions",
  "gitDiffAiReviewer.aiApiKey": "sk-...",
  "gitDiffAiReviewer.aiModel": "gpt-4",
  "gitDiffAiReviewer.targetBranch": "main"
}
```

### 自定义 API

确保你的 API 接受以下格式的请求：

```json
{
  "model": "model-name",
  "max_tokens": 4096,
  "messages": [
    {
      "role": "user",
      "content": "..."
    }
  ]
}
```

## 常用操作

| 操作 | 快捷方式 |
|------|---------|
| 打开侧边栏 | 点击活动栏图标 |
| 开始审查 | 点击 🚀 Start Review |
| 查看历史 | 点击 📜 Review History |
| 打开设置 | 点击 ⚙️ Configure |
| 命令面板 | `Cmd+Shift+P` → "Git Diff AI Reviewer" |

## 提示

- 💡 首次使用建议先在小分支上测试
- 💡 可以根据项目大小调整 `maxDiffSize` 配置
- 💡 审查历史会保存最近 10 条记录
- 💡 支持复制和保存审查结果

## 需要帮助？

查看详细文档：
- [使用指南](USAGE.md)
- [配置示例](SETTINGS_EXAMPLE.md)
- [README](README.md)

有问题？在项目仓库提交 Issue。
