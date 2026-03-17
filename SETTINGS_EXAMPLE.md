# 配置示例

将以下配置添加到 VSCode 的 `settings.json` 文件中（可通过 `Cmd+,` / `Ctrl+,` 打开设置，或手动编辑 `~/.vscode/settings.json`）：

## 内部 LLM 配置示例（推荐）

```json
{
  // Git Diff AI Reviewer 配置 - 内部LLM

  // 启用内部 LLM 服务
  "gitDiffAiReviewer.llm.enableInternal": true,

  // 目标分支（用于比较的基准分支）
  "gitDiffAiReviewer.targetBranch": "main",

  // 内部 LLM 接口地址（必填）
  "gitDiffAiReviewer.llm.url": "https://your-internal-llm-url.com/v1/messages",

  // 内部 LLM 模型名称
  "gitDiffAiReviewer.llm.model": "claude-3-5-sonnet-20241022",

  // SSO 用户名（必填）
  "gitDiffAiReviewer.sso.username": "your-username",

  // SSO 密码（必填）
  "gitDiffAiReviewer.sso.password": "your-password",

  // SSO 登录 URL（可选，通常有默认值）
  "gitDiffAiReviewer.sso.loginUrl": "https://sso.dds.com/sercie-login",

  // 验证 SSL 证书（可选，开发环境推荐为 false）
  "gitDiffAiReviewer.llm.verifySsl": false,

  // Token 缓存时间（秒）
  "gitDiffAiReviewer.llm.tokenCacheDurationSeconds": 3600,

  // 最大 diff 大小（字符数），超过此大小会提示确认
  "gitDiffAiReviewer.maxDiffSize": 100000
}
```

## 外部 AI 服务配置示例（可选）

禁用内部 LLM，使用外部 AI 服务：

```json
{
  "gitDiffAiReviewer.llm.enableInternal": false,
  "gitDiffAiReviewer.targetBranch": "main",
  "gitDiffAiReviewer.maxDiffSize": 100000
}
```

### 智谱AI (GLM-4) 示例 ⭐推荐

```json
{
  "gitDiffAiReviewer.llm.enableInternal": false,
  "gitDiffAiReviewer.externalAi.url": "https://open.bigmodel.cn/api/paas/v4/chat/completions",
  "gitDiffAiReviewer.externalAi.model": "glm-4",
  "gitDiffAiReviewer.externalAi.apiKey": "your-api-key-here"
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
  "gitDiffAiReviewer.llm.enableInternal": false,
  "gitDiffAiReviewer.externalAi.url": "https://api.anthropic.com/v1/messages",
  "gitDiffAiReviewer.externalAi.model": "claude-3-5-sonnet-20241022",
  "gitDiffAiReviewer.externalAi.apiKey": "sk-ant-xxx"
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
  "gitDiffAiReviewer.llm.enableInternal": false,
  "gitDiffAiReviewer.externalAi.url": "https://api.openai.com/v1/chat/completions",
  "gitDiffAiReviewer.externalAi.model": "gpt-4",
  "gitDiffAiReviewer.externalAi.apiKey": "sk-..."
}
```

### 自定义 API 示例

如果你使用的是自定义的 AI 接口，请确保：
1. 接口支持 POST 请求
2. 请求体格式与 Claude API 兼容
3. 响应包含审查结果文本

```json
{
  "gitDiffAiReviewer.llm.enableInternal": false,
  "gitDiffAiReviewer.externalAi.url": "https://your-custom-api.com/api/v1/messages",
  "gitDiffAiReviewer.externalAi.model": "your-model-name",
  "gitDiffAiReviewer.externalAi.apiKey": "your-api-key"
}

