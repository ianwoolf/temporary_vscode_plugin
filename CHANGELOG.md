# 更新日志

## [0.0.1] - 2026-03-06

### 新增功能
- ✨ 初始版本发布
- 🔄 支持获取当前分支与目标分支的 git diff
- 🤖 支持调用自定义 AI 接口进行代码审查
- 📊 在 Webview 页面中美观展示审查结果
- 📱 侧边栏集成，提供快捷操作入口
- 📜 审查历史记录功能（最多保存 10 条）
- ⚙️ 灵活的配置系统
- 💾 支持导出审查结果为 Markdown 文件
- 🎨 支持浅色和深色主题图标

### 侧边栏功能
- 🚀 一键启动代码审查
- 🔄 刷新侧边栏
- ⚙️ 快速打开设置
- 📜 查看历史审查记录

### 配置选项
- `gitDiffAiReviewer.targetBranch` - 目标分支名称（默认：main）
- `gitDiffAiReviewer.aiApiUrl` - AI API 接口地址
- `gitDiffAiReviewer.aiApiKey` - AI API 密钥
- `gitDiffAiReviewer.aiModel` - AI 模型名称
- `gitDiffAiReviewer.maxDiffSize` - 最大 diff 大小

### Webview 功能
- 📋 复制审查结果到剪贴板
- 💾 保存审查结果为 Markdown 文件
- 🎨 格式化显示审查内容
- 📊 显示审查元数据（分支、模型、时间等）

---

## 计划中的功能

### [0.0.2] - 计划中
- [ ] 支持多个 AI 服务提供商的预设配置
- [ ] 支持自定义审查模板
- [ ] 支持批量审查多个文件
- [ ] 添加审查结果的评分系统
- [ ] 支持导出为 PDF 格式
- [ ] 添加审查统计功能
- [ ] 支持团队共享配置
