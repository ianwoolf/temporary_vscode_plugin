# Git Diff AI Reviewer

一个 VSCode 插件，用于自动获取当前分支与目标分支的 git diff，并调用自定义 AI 接口进行代码审查。

## 功能特性

- 🔄 自动获取当前分支与目标分支的 git diff
- 🤖 调用自定义 AI 接口进行代码审查
- 📊 在 Webview 页面中美观地展示审查结果
- 📱 侧边栏集成，一键启动审查
- 📜 审查历史记录，方便查看过往审查
- ⚙️ 通过配置文件灵活设置目标分支和 AI 接口
- 💾 支持导出审查结果为 Markdown 文件

## 安装

1. 克隆或下载此项目到本地
2. 在 VSCode 中，按 `F5` 启动扩展开发主机，或使用以下命令打包安装：

```bash
npm install
vsce package
code --install-extension git-diff-ai-reviewer-0.0.1.vsix
```

## 配置

在 VSCode 设置中搜索 `Git Diff AI Reviewer`，配置以下选项：

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `gitDiffAiReviewer.targetBranch` | 目标分支名称 | `main` |
| `gitDiffAiReviewer.aiApiUrl` | AI API 接口地址 | 必填 |
| `gitDiffAiReviewer.aiApiKey` | AI API 密钥 | 必填 |
| `gitDiffAiReviewer.aiModel` | AI 模型名称 | `claude-3-5-sonnet-20241022` |
| `gitDiffAiReviewer.maxDiffSize` | 最大 diff 大小（字符数） | `100000` |

### API 接口要求

自定义 AI 接口需要支持类似 Claude API 的请求格式：

```json
{
  "model": "your-model-name",
  "max_tokens": 4096,
  "messages": [
    {
      "role": "user",
      "content": "审查内容..."
    }
  ]
}
```

响应格式应包含：
- `content[0].text` 或 `message` 字段返回审查结果

## 使用方法

### 方法一：使用侧边栏（推荐）

1. 在 VSCode 左侧活动栏找到 Git Diff AI Reviewer 图标
2. 点击侧边栏中的 "🚀 Start Review" 按钮
3. 等待 AI 完成审查
4. 在打开的 Webview 面板中查看审查结果
5. 可以点击按钮复制或保存审查结果
6. 使用 "📜 Review History" 查看过往审查记录

### 方法二：使用命令面板

1. 确保当前在 Git 仓库中
2. 打开命令面板（`Cmd+Shift+P` / `Ctrl+Shift+P`）
3. 输入并选择 `Git Diff AI Reviewer: Review Git Diff with AI`
4. 等待 AI 完成审查
5. 在打开的 Webview 面板中查看审查结果

### 侧边栏按钮说明

- **🚀 Start Review** - 开始新的代码审查
- **📜 Review History** - 查看历史审查记录（最多保存 10 条）
- **🔄 Refresh** - 刷新侧边栏
- **⚙️ Configure** - 打开插件设置页面

## 项目结构

```
.
├── package.json          # 插件配置清单
├── extension.js          # 插件入口
├── gitDiffProvider.js    # Git diff 获取逻辑
├── aiReviewer.js         # AI 接口调用逻辑
├── sidebarProvider.js    # 侧边栏视图逻辑
├── webview/
│   └── ReviewPanel.js    # Webview 面板逻辑
├── assets/               # 图标资源
│   ├── icon.svg          # 活动栏图标
│   ├── light/            # 浅色主题图标
│   └── dark/             # 深色主题图标
└── README.md
```

## 开发

```bash
# 安装依赖
npm install

# 在 VSCode 中按 F5 启动扩展开发主机进行调试
```

remove license
