# 更新日志

## [0.0.2] - 2026-03-17

### 新增功能
- 🏢 默认启用公司内部 LLM 服务作为默认 AI 后端
- 🔐 集成 SSO 认证与 Token 缓存机制
- 🔄 支持 Token 自动刷新和失败重试

### 优化改进
- 📦 精简项目结构，删除调试和测试文件
- 📝 优化 README 文档，突出内部 LLM 配置流程
- 🎯 简化 aiReviewer.js 中的 API 选择逻辑
- 🔌 改进了 extension.js 默认配置

### 配置变化
- `gitDiffAiReviewer.enableInternalLLM` 默认值从 `false` 改为 `true`
- 新增内部 LLM 相关配置项（SSO、Token 缓存过期时间等）
- 重新组织 README 中的配置表格

### 文件变化
- ❌ 删除 `debug_test.js`、`debug_zhipu.js`、`test_git.js` 调试文件
- ❌ 删除 `QUICK_DEBUG.md`、`DEBUG_GUIDE.md` 调试文档
- ❌ 删除 `test/` 目录及所有测试文件
- ❌ 删除 `LICENSE` 文件
- ✏️ 更新 `package.json` 脚本配置
- ✏️ 更新 `README.md` 使用指南

---

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
