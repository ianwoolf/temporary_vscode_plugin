# 配置示例

将以下配置添加到 VSCode 的 `settings.json` 文件中（可通过 `Cmd+,` / `Ctrl+,` 打开设置，或手动编辑 `~/.vscode/settings.json`）：

```json
{
  // Git Diff AI Reviewer 配置

  // 目标分支（用于比较的基准分支）
  "gitDiffAiReviewer.targetBranch": "main",

  // AI API 接口地址（必填）
  "gitDiffAiReviewer.aiApiUrl": "https://your-ai-api-endpoint.com/v1/messages",

  // AI API 密钥（必填）
  "gitDiffAiReviewer.aiApiKey": "your-api-key-here",

  // AI 模型名称
  "gitDiffAiReviewer.aiModel": "claude-3-5-sonnet-20241022",

  // 最大 diff 大小（字符数），超过此大小会提示确认
  "gitDiffAiReviewer.maxDiffSize": 100000
}
```

## 使用自定义 AI 接口的注意事项

### 智谱AI (GLM-4) 示例 ⭐推荐

```json
{
  "gitDiffAiReviewer.aiApiUrl": "https://open.bigmodel.cn/api/paas/v4/chat/completions",
  "gitDiffAiReviewer.aiModel": "glm-4",
  "gitDiffAiReviewer.aiApiKey": "your-api-key-here"
}
```

**注意**：智谱AI的API Key格式为 `id.secret`，插件会自动生成JWT token进行认证。

支持的模型：
- `glm-4` - 智谱AI最新模型
- `glm-3-turbo` - 快速响应模型
- `glm-4-flash` - 闪速模型

### Claude API 示例

```json
{
  "gitDiffAiReviewer.aiApiUrl": "https://api.anthropic.com/v1/messages",
  "gitDiffAiReviewer.aiModel": "claude-3-5-sonnet-20241022",
  "gitDiffAiReviewer.aiApiKey": "sk-ant-xxx"
}
```

请求头：
```
x-api-key: your-api-key
anthropic-version: 2023-06-01
Content-Type: application/json
```

### OpenAI API 示例

```json
{
  "gitDiffAiReviewer.aiApiUrl": "https://api.openai.com/v1/chat/completions",
  "gitDiffAiReviewer.aiModel": "gpt-4",
  "gitDiffAiReviewer.aiApiKey": "sk-..."
}
```

### 自定义 API 示例

如果你使用的是自定义的 AI 接口，请确保：
1. 接口支持 POST 请求
2. 请求体格式与代码中的格式兼容
3. 响应包含审查结果文本

插件已内置支持：
- ✅ 智谱AI (自动检测 bigmodel.cn)
- ✅ Claude API
- ✅ OpenAI 兼容格式

你可以在 `aiReviewer.js` 中根据实际 API 格式调整请求和响应处理逻辑。
