# 配置名称重构总结 - 2026年3月17日

## 概述

为了让编写配置时更清楚明白，进行了全面的配置名称重构，引入分类前缀使配置结构更清晰。

## 配置名称映射

### 基础配置（保持不变）

| 旧名称 | 新名称 | 说明 |
|--------|--------|------|
| `targetBranch` | `targetBranch` | 目标分支 |
| `maxDiffSize` | `maxDiffSize` | 最大 diff 大小 |

### 内部 LLM 配置（`llm.*` 前缀）

| 旧名称 | 新名称 | 说明 |
|--------|--------|------|
| `enableInternalLLM` | `llm.enableInternal` | 启用内部 LLM |
| `internalLLMUrl` | `llm.url` | 内部 LLM 接口地址 |
| `internalLLMModel` | `llm.model` | 内部 LLM 模型名称 |
| `disableSSLVerification` | `llm.verifySsl` | SSL 验证（注意：改为正逻辑） |
| `tokenCacheExpiry` | `llm.tokenCacheDurationSeconds` | Token 缓存时长 |

### SSO 认证配置（`sso.*` 前缀）

| 旧名称 | 新名称 | 说明 |
|--------|--------|------|
| `ssoLoginUrl` | `sso.loginUrl` | SSO 登录 URL |
| `ssoUsername` | `sso.username` | SSO 用户名 |
| `ssoPassword` | `sso.password` | SSO 密码 |

### 外部 AI 配置（`externalAi.*` 前缀）

| 旧名称 | 新名称 | 说明 |
|--------|--------|------|
| `aiApiUrl` | `externalAi.url` | 外部 AI API 地址 |
| `aiApiKey` | `externalAi.apiKey` | 外部 AI API 密钥 |
| `aiModel` | `externalAi.model` | 外部 AI 模型名称 |

## 重要变更

### 1. SSL 验证逻辑改变

**旧逻辑（负数）**：
```
disableSSLVerification: true  (禁用 SSL 验证)
disableSSLVerification: false (启用 SSL 验证)
```

**新逻辑（正数，更直观）**：
```
llm.verifySsl: true   (验证 SSL 证书)
llm.verifySsl: false  (不验证 SSL 证书，推荐用于开发）
```

**默认值**：
- 旧：`disableSSLVerification: true`（禁用，即允许不安全连接）
- 新：`llm.verifySsl: false`（不验证，即允许不安全连接）

### 2. Token 缓存参数更名

**旧名称**：`tokenCacheExpiry`（含义模糊）
**新名称**：`llm.tokenCacheDurationSeconds`（含义明确，单位为秒）

## 迁移指南

### 从旧配置迁移

如果你的 VSCode 设置中有旧的配置，请按以下方式迁移：

#### 内部 LLM 配置迁移

**旧配置**：
```json
{
  "gitDiffAiReviewer.enableInternalLLM": true,
  "gitDiffAiReviewer.ssoLoginUrl": "https://sso.dds.com/sercie-login",
  "gitDiffAiReviewer.ssoUsername": "username",
  "gitDiffAiReviewer.ssoPassword": "password",
  "gitDiffAiReviewer.internalLLMUrl": "https://llm.internal.com/v1/messages",
  "gitDiffAiReviewer.internalLLMModel": "claude-3-5-sonnet-20241022",
  "gitDiffAiReviewer.disableSSLVerification": true,
  "gitDiffAiReviewer.tokenCacheExpiry": 3600
}
```

**新配置**：
```json
{
  "gitDiffAiReviewer.llm.enableInternal": true,
  "gitDiffAiReviewer.sso.loginUrl": "https://sso.dds.com/sercie-login",
  "gitDiffAiReviewer.sso.username": "username",
  "gitDiffAiReviewer.sso.password": "password",
  "gitDiffAiReviewer.llm.url": "https://llm.internal.com/v1/messages",
  "gitDiffAiReviewer.llm.model": "claude-3-5-sonnet-20241022",
  "gitDiffAiReviewer.llm.verifySsl": false,
  "gitDiffAiReviewer.llm.tokenCacheDurationSeconds": 3600
}
```

#### 外部 AI 配置迁移

**旧配置**：
```json
{
  "gitDiffAiReviewer.enableInternalLLM": false,
  "gitDiffAiReviewer.aiApiUrl": "https://api.anthropic.com/v1/messages",
  "gitDiffAiReviewer.aiApiKey": "sk-ant-...",
  "gitDiffAiReviewer.aiModel": "claude-3-5-sonnet-20241022"
}
```

**新配置**：
```json
{
  "gitDiffAiReviewer.llm.enableInternal": false,
  "gitDiffAiReviewer.externalAi.url": "https://api.anthropic.com/v1/messages",
  "gitDiffAiReviewer.externalAi.apiKey": "sk-ant-...",
  "gitDiffAiReviewer.externalAi.model": "claude-3-5-sonnet-20241022"
}
```

## 新配置的优势

### 1. **结构更清晰**

使用分类前缀，相关配置项被归组在一起：
- `llm.*` - 所有 LLM 相关配置
- `sso.*` - 所有 SSO 相关配置
- `externalAi.*` - 所有外部 AI 相关配置

### 2. **更易发现**

在 VSCode 设置中搜索时，相关配置会聚集在一起：
- 搜索 "llm" 可以看到所有内部 LLM 配置
- 搜索 "sso" 可以看到所有 SSO 认证配置
- 搜索 "externalAi" 可以看到所有外部 AI 配置

### 3. **名称更直观**

- `llm.enableInternal` 比 `enableInternalLLM` 更清晰
- `sso.username` 比 `ssoUsername` 更规整
- `externalAi.url` 比 `aiApiUrl` 更明确
- `llm.verifySsl` 比 `disableSSLVerification` 更直观（正逻辑代替负逻辑）

### 4. **可扩展性更好**

新的命名方案为未来的扩展留下了空间：
- 可以轻松添加 `llm.timeout`, `llm.retryCount` 等配置
- 可以轻松添加 `sso.timeout`, `sso.mfaEnabled` 等配置
- 可以轻松添加 `externalAi.timeout`, `externalAi.retryCount` 等配置

## 代码变更总结

### 修改的文件

1. **package.json** - 更新了所有配置定义
2. **extension.js** - 更新了配置读取逻辑
3. **aiReviewer.js** - 更新了内部 LLM 配置使用
4. **ssoAuthManager.js** - 更新了 SSO 配置读取
5. **README.md** - 更新了文档中的配置说明
6. **SETTINGS_EXAMPLE.md** - 更新了配置示例
7. **INTERNAL_LLM_SETUP.md** - 更新了内部 LLM 配置指南
8. **USAGE.md** - 更新了使用说明中的配置
9. **QUICKSTART.md** - 更新了快速开始中的配置示例

### 核心配置读取变更示例

**旧方式**：
```javascript
const enableInternalLLM = config.get('enableInternalLLM', true);
const llmUrl = config.get('internalLLMUrl', '');
const ssoUsername = config.get('ssoUsername', '');
const aiApiUrl = config.get('aiApiUrl', '');
```

**新方式**：
```javascript
const enableInternalLLM = config.get('llm.enableInternal', true);
const llmUrl = config.get('llm.url', '');
const ssoUsername = config.get('sso.username', '');
const externalAiUrl = config.get('externalAi.url', '');
```

## 向后兼容性

⚠️ **重要**：这是一个破坏性变更，旧的配置名称将不再工作。

用户需要手动更新他们的 VSCode 设置中的配置名称（可以参考上面的迁移指南）。

## 结论

新的配置命名方案通过使用分类前缀，使配置结构更加清晰、易于理解和维护。同时改进了一些命名（如使用正逻辑代替负逻辑），提高了代码的可读性和可维护性。
