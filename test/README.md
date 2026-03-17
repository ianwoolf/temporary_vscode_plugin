# Internal LLM 测试指南

这个文件夹包含用于测试和诊断 Internal LLM 接口配置的测试脚本。

## 快速开始

### 1. 设置环境变量

```bash
# 设置 Internal LLM 配置
export LLM_URL="https://your-llm-endpoint.com/v1/messages"
export LLM_MODEL="claude-3-5-sonnet-20241022"

# 设置 SSO 认证配置
export SSO_URL="https://sso.dds.com/sercie-login"
export SSO_USER="your-username"
export SSO_PASSWORD="your-password"

# 可选：禁用 SSL 验证（开发环境）
export VERIFY_SSL="false"

# 可选：设置请求超时（毫秒）
export TIMEOUT="60000"
```

### 2. 运行测试

#### 使用 CLI 工具（推荐）

```bash
# 显示帮助信息
node test/cli.js help

# 快速诊断系统配置
node test/cli.js test:quick

# 测试 Internal LLM 接口
node test/cli.js test:llm

# 测试 SSO 认证
node test/cli.js test:sso

# 运行完整测试
node test/cli.js test:all

# 查看配置
node test/cli.js config:show

# 设置配置值
node test/cli.js config:set llm.url https://new-llm-endpoint.com/v1/messages

# 查看日志（最后20行）
node test/cli.js logs:tail 20
```

#### 直接运行测试脚本

```bash
# Internal LLM 完整测试
node test/test-internal-llm.js

# SSO 认证测试
node test/test-sso.js

# AI Reviewer 测试
node test/test-ai-reviewer.js

# 快速功能测试
node test/quick-test.js
```

## 测试脚本说明

### test-internal-llm.js
**目的**：完整测试 Internal LLM 的接口、认证和流程

**测试内容**：
1. ✓ HTTPS Agent 创建
2. ✓ SSO 认证流程
3. ✓ LLM 连接性测试
4. ✓ 代码审查请求
5. ✓ AiReviewer 集成测试

**输出**：
- 每个测试的详细步骤
- 成功/失败状态
- 响应时间统计
- 错误诊断建议

### test-sso.js
**目的**：测试 SSO 认证管理

**测试内容**：
- SSO 登录
- Token 获取
- Token 缓存
- Token 过期检测
- Token 清除

### test-ai-reviewer.js
**目的**：测试 AI 代码审查功能

**测试内容**：
- 配置初始化
- AI 审查执行
- 结果验证
- 错误处理

### test/cli.js
**目的**：命令行工具，便捷访问各种测试和诊断功能

## 典型使用场景

### 场景1：首次部署 Internal LLM

```bash
# 1. 设置环境变量
export LLM_URL="https://..."
export SSO_USER="..."
export SSO_PASSWORD="..."

# 2. 运行诊断
node test/cli.js test:quick

# 3. 运行完整测试
node test/cli.js test:llm

# 4. 检查日志
node test/cli.js logs:tail 50
```

### 场景2：排查连接问题

```bash
# 1. 快速诊断
node test/cli.js test:quick

# 2. 测试 SSO
node test/cli.js test:sso

# 3. 测试 LLM 接口
node test/cli.js test:llm

# 4. 查看错误日志
node test/cli.js logs:tail
```

### 场景3：测试代码审查功能

```bash
# 1. 保证 SSO 认证工作
node test/cli.js test:sso

# 2. 测试 AI 审查
node test/cli.js test:ai

# 3. 查看审查结果
# 在输出中查看审查内容
```

## 配置文件存储

配置文件位于：`.ada_plugin/config.json`

### 获取和修改配置

```bash
# 查看所有配置
node test/cli.js config:show

# 更新 LLM 地址
node test/cli.js config:set llm.url https://new-endpoint.com/v1/messages

# 更新 SSO 用户名
node test/cli.js config:set sso.username newuser

# 禁用 SSL 验证
node test/cli.js config:set llm.verifySsl false
```

## 日志和诊断

### 查看日志

```bash
# 查看最后 20 行
node test/cli.js logs:tail 20

# 查看最后 50 行
node test/cli.js logs:tail 50

# 或直接查看日志文件
cat .ada_plugin/logs/error.log
```

### 错误诊断

如果测试失败，根据错误类型检查：

| 错误 | 可能原因 | 解决方案 |
|------|---------|--------|
| `SSO login failed` | SSO 凭据错误 | 检查用户名/密码 |
| `401 / 403` | Token 无效或过期 | 重新登录，检查 SSO 配置 |
| `Connection timeout` | 网络问题或 LLM 服务不可用 | 检查网络连接和 LLM URL |
| `SSL certificate` | SSL 验证失败 | 设置 `VERIFY_SSL=false` |
| `Empty response` | LLM 返回空数据 | 检查请求格式和 LLM 模型 |

## 环境变量详解

| 变量 | 说明 | 示例 |
|------|------|------|
| `LLM_URL` | Internal LLM API 端点 | `https://llm.example.com/v1/messages` |
| `LLM_MODEL` | 使用的模型名称 | `claude-3-5-sonnet-20241022` |
| `SSO_URL` | SSO 登录地址 | `https://sso.dds.com/sercie-login` |
| `SSO_USER` | SSO 用户名 | `your-username` |
| `SSO_PASSWORD` | SSO 密码 | `your-password` |
| `VERIFY_SSL` | SSL 验证开关 | `true` 或 `false` |
| `TIMEOUT` | 请求超时时间 | `60000` |

## 常见问题

### Q: 如何禁用 SSL 验证？

```bash
export VERIFY_SSL="false"
node test/cli.js test:llm
```

### Q: 如何提高请求超时时间？

```bash
export TIMEOUT="120000"  # 120 秒
node test/cli.js test:llm
```

### Q: 如何保存配置以便下次使用？

```bash
node test/cli.js config:set llm.url https://your-endpoint.com/v1/messages
node test/cli.js config:set sso.username your-user
```

配置会自动保存在 `.ada_plugin/config.json`

### Q: 如何查看详细的测试输出？

直接运行脚本，所有输出会显示在终端：

```bash
node test/test-internal-llm.js
```

### Q: 测试需要多长时间？

- Quick Diagnostic: 1-2 秒
- SSO 测试: 3-5 秒
- LLM 连接测试: 5-10 秒
- 完整代码审查: 10-30 秒（取决于网络和 LLM 响应）

## 测试执行流程图

```
┌─ 快速诊断 (test:quick)
│  ├─ 检查 Node.js 版本
│  ├─ 检查目录结构
│  ├─ 检查配置文件
│  ├─ 检查环境变量
│  └─ 检查依赖

├─ SSO 测试 (test:sso)
│  ├─ 初始化配置管理器
│  ├─ 保存 SSO 凭据
│  ├─ 初始化 SSO 管理器
│  ├─ 执行 SSO 登录
│  ├─ 获取 Token
│  ├─ 验证 Token 信息
│  └─ 测试 Token 缓存

├─ LLM 测试 (test:llm)
│  ├─ 创建 HTTPS Agent
│  ├─ SSO 认证
│  ├─ 测试 LLM 连接
│  ├─ 发送测试请求
│  ├─ 执行代码审查
│  └─ AiReviewer 集成测试

└─ 完整测试 (test:all)
   └─ 运行所有上述测试
```

## 脚本退出码

- `0`: 所有测试通过
- `1`: 测试失败或出错

## 性能优化建议

1. **减少 SSL 验证开销**：在开发环境设置 `VERIFY_SSL=false`
2. **增加超时时间**：对于缓慢网络，增加 `TIMEOUT` 值
3. **使用缓存 Token**：SSO Token 会自动缓存，避免重复登录
4. **批量测试**：使用 `test:all` 而不是多次单独运行

## 获取支持

如果测试仍然失败：

1. 收集输出日志
2. 检查 `.ada_plugin/logs/error.log`
3. 验证网络连接：`ping your-llm-endpoint.com`
4. 检查防火墙规则
5. 验证 SSL 证书有效性

---

**最后更新**: 2026年3月18日
