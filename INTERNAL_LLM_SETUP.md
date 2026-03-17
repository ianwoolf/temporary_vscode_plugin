# 公司内部LLM配置指南

## 功能概述

Git Diff AI Reviewer 现在支持接入公司内部的LLM服务，包括：
- SSO登录认证
- Token自动缓存和刷新
- SSL证书校验禁用
- 兼容Anthropic格式的LLM接口

## 配置步骤

### 1. 启用内部LLM服务

在VSCode设置中搜索 `Git Diff AI Reviewer`，设置以下配置：

```json
{
  "gitDiffAiReviewer.enableInternalLLM": true,
  "gitDiffAiReviewer.ssoLoginUrl": "https://sso.dds.com/sercie-login",
  "gitDiffAiReviewer.ssoUsername": "your-username",
  "gitDiffAiReviewer.ssoPassword": "your-password",
  "gitDiffAiReviewer.internalLLMUrl": "https://your-internal-llm-url.com/v1/messages",
  "gitDiffAiReviewer.internalLLMModel": "claude-3-5-sonnet-20241022",
  "gitDiffAiReviewer.disableSSLVerification": true
}
```

### 2. 配置项说明

| 配置项 | 说明 | 默认值 | 必填 |
|--------|------|--------|------|
| `enableInternalLLM` | 启用内部LLM服务 | `false` | 是 |
| `ssoLoginUrl` | SSO登录接口地址 | `https://sso.dds.com/sercie-login` | 否 |
| `ssoUsername` | SSO用户名 | `""` | 是 |
| `ssoPassword` | SSO密码 | `""` | 是 |
| `internalLLMUrl` | 内部LLM接口地址 | `""` | 是 |
| `internalLLMModel` | 模型名称 | `claude-3-5-sonnet-20241022` | 否 |
| `disableSSLVerification` | 禁用SSL证书校验 | `true` | 否 |

### 3. 使用方法

#### 方式1：通过命令面板

1. 打开命令面板 (`Cmd+Shift+P` / `Ctrl+Shift+P`)
2. 输入 `Git Diff AI Reviewer: SSO Login`
3. 输入用户名和密码
4. 等待登录成功提示
5. 使用 `Git Diff AI Reviewer: Review Git Diff with AI` 开始代码审查

#### 方式2：通过配置文件

1. 在VSCode设置中配置上述参数
2. 直接使用审查功能，系统会自动进行SSO登录
3. Token会被缓存，避免频繁登录

### 4. 管理命令

#### SSO登录
```bash
Git Diff AI Reviewer: SSO Login
```
手动进行SSO登录并缓存token。

#### SSO登出
```bash
Git Diff AI Reviewer: SSO Logout
```
清除缓存的token和凭据。

#### 查看Token信息
```bash
Git Diff AI Reviewer: Token Information
```
查看当前token状态和过期时间。

### 5. 目录结构

插件会在项目根目录创建 `.ada_plugin` 目录：

```
.ada_plugin/
├── config.json           # 配置文件（包含加密的密码）
├── cache/
│   ├── token.json        # Token缓存
│   └── session.json      # 会话信息
└── logs/
    └── error.log         # 错误日志
```

**注意：** `.ada_plugin` 目录已加入 `.gitignore`，不会被提交到git仓库。

### 6. 安全说明

1. **密码存储**：密码使用AES加密存储在 `config.json` 中
2. **Token缓存**：Token默认缓存1小时，过期后自动重新登录
3. **目录保护**：`.ada_plugin` 目录不会被git跟踪
4. **SSL警告**：禁用SSL验证仅用于开发测试环境

### 7. 故障排除

#### SSO登录失败
- 检查用户名和密码是否正确
- 确认SSO登录URL可访问
- 查看错误日志：`.ada_plugin/logs/error.log`

#### Token过期自动刷新
- **自动重试机制**：当LLM接口返回401/403错误时，系统会自动：
  1. 清除失效的token
  2. 重新进行SSO登录获取新token
  3. 使用新token重试请求
  4. 最多重试1次
- **查看重试状态**：在审查结果的metadata中会标记`retried: true`表示进行了重试
- **手动干预**：如自动刷新失败，请使用 `Git Diff AI Reviewer: SSO Login` 手动重新登录

#### Token过期手动处理
- 系统会自动检测并重新登录
- 如需手动刷新，使用 `Git Diff AI Reviewer: SSO Login`
- 使用 `Git Diff AI Reviewer: Token Information` 查看token状态

#### SSL连接错误
- 确保 `disableSSLVerification` 设置为 `true`
- 检查网络连接和防火墙设置

### 8. API接口格式

#### SSO登录接口
```
POST https://sso.dds.com/sercie-login
Content-Type: application/json

{
  "userid": "username",
  "password": "password"
}
```

**响应格式：**
```json
{
  "token": "your-auth-token"
  // 或其他包含token的字段
}
```

#### 内部LLM接口
```
POST {internalLLMUrl}
Authorization: Bearer {sso-token}
Content-Type: application/json
anthropic-version: 2023-06-01

{
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 4096,
  "messages": [
    {
      "role": "user",
      "content": "code review prompt..."
    }
  ]
}
```

**响应格式（兼容Anthropic）：**
```json
{
  "content": [
    {
      "text": "code review result..."
    }
  ]
}
```

### 9. 与现有AI服务的兼容性

启用内部LLM后，现有的AI服务（Claude、智谱AI等）仍然可用：

1. 设置 `enableInternalLLM: false` 可切换回外部AI服务
2. 配置参数互不冲突，可同时配置多个服务
3. 系统会根据配置自动选择合适的AI服务

### 10. 示例配置

#### 开发环境配置
```json
{
  "gitDiffAiReviewer.enableInternalLLM": true,
  "gitDiffAiReviewer.ssoUsername": "dev-user",
  "gitDiffAiReviewer.ssoPassword": "dev-password",
  "gitDiffAiReviewer.internalLLMUrl": "https://dev-llm.internal.com/v1/messages",
  "gitDiffAiReviewer.disableSSLVerification": true
}
```

#### 生产环境配置
```json
{
  "gitDiffAiReviewer.enableInternalLLM": true,
  "gitDiffAiReviewer.ssoUsername": "prod-user",
  "gitDiffAiReviewer.ssoPassword": "prod-password",
  "gitDiffAiReviewer.internalLLMUrl": "https://prod-llm.internal.com/v1/messages",
  "gitDiffAiReviewer.disableSSLVerification": false
}
```

## 技术支持

如遇到问题，请：
1. 查看 `.ada_plugin/logs/error.log` 日志文件
2. 使用 `Git Diff AI Reviewer: Token Information` 检查token状态
3. 确认网络连接和API接口可访问性
4. 检查VSCode开发者控制台的错误信息