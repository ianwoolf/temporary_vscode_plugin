# Internal LLM 接口测试 - 快速启动

## 📌 场景概述

你已经有以下测试脚本可以使用：

| 脚本 | 用途 | 命令 |
|------|------|------|
| **test-internal-llm.js** | 🔴 完整的 Internal LLM 测试套件 | `node test/test-internal-llm.js` |
| **test-sso.js** | 🟠 SSO 认证流程测试 | `node test/test-sso.js` |
| **test-ai-reviewer.js** | 🟡 AI 代码审查测试 | `node test/test-ai-reviewer.js` |
| **quick-test.js** | 🟢 基础功能测试 | `node test/quick-test.js` |
| **cli.js** | 🔵 命令行工具 (推荐) | `node test/cli.js [命令]` |

## 🚀 第一步：快速诊断（1分钟）

```bash
node test/cli.js test:quick
```

这会检查：
- ✓ Node.js 环境
- ✓ 项目结构
- ✓ 配置文件
- ✓ 环境变量
- ✓ 依赖库

## 🔧 第二步：配置 Internal LLM

### 方法 A：使用环境变量（推荐用于测试）

```bash
# 设置 Internal LLM 配置
export LLM_URL="https://your-llm-endpoint.com/v1/messages"
export LLM_MODEL="claude-3-5-sonnet-20241022"

# 设置 SSO 认证配置
export SSO_URL="https://sso.dds.com/sercie-login"
export SSO_USER="your-username"
export SSO_PASSWORD="your-password"

# 根据 LLM 的 SSL 设置
export VERIFY_SSL="false"    # 如果使用自签名证书
export TIMEOUT="60000"       # 可选：请求超时
```

### 方法 B：使用 CLI 工具保存配置（推荐用于持久化）

```bash
node test/cli.js config:set llm.url https://your-llm-endpoint.com/v1/messages
node test/cli.js config:set sso.username your-username
node test/cli.js config:set llm.model claude-3-5-sonnet-20241022
```

### 查看已保存的配置

```bash
node test/cli.js config:show
```

## 📊 第三步：执行测试

### 测试 SSO 认证（5-10秒）

```bash
node test/cli.js test:sso
```

**验证内容**：
- ✓ SSO 凭据保存
- ✓ SSO 管理器初始化
- ✓ Token 获取
- ✓ Token 信息查看
- ✓ Token 缓存机制
- ✓ Token 过期检测

### 测试 Internal LLM（10-30秒）

```bash
node test/cli.js test:llm
```

**验证内容**：
1. **HTTPS Agent** - 创建安全连接
2. **SSO 认证** - 获取访问 Token
3. **LLM 连接** - 测试基本连接
4. **代码审查请求** - 完整的审查流程
5. **AiReviewer 集成** - 端到端集成测试

**预期输出**：
```
[TEST 1] HTTPS Agent 创建
✓ HTTPS Agent创建成功
  - keepAlive: true
  - timeout: 60000
  - rejectUnauthorized: false

[TEST 2] SSO 认证流程
✓ SSO认证成功
  - Token长度: 1234
  - Token前缀: eyJhbGciOi...

[TEST 3] LLM 连接性测试
✓ LLM连接成功
  - 状态码: 200
  - 响应格式: Anthropic

[TEST 4] 代码审查请求
✓ 代码审查请求成功
  - 响应时间: 12.34 秒
  - 审查结果长度: 2048 字符

[TEST 5] AiReviewer 集成测试
✓ AiReviewer集成测试成功
  - 响应时间: 12.45 秒
  - 审查成功: true
```

### 完整测试套件（30-60秒）

```bash
node test/cli.js test:all
```

运行所有测试并生成完整报告。

## 🔍 第四步：查看日志

```bash
# 查看最后 20 行日志
node test/cli.js logs:tail 20

# 查看最后 50 行日志
node test/cli.js logs:tail 50

# 直接查看日志文件
cat .ada_plugin/logs/error.log
```

## ✅ 已实现的功能

### 在 test-internal-llm.js 中

```javascript
// 1. HTTPS Agent 工厂
const agent = HttpsAgentFactory.createAgent(disableSSL, timeout);

// 2. SSO 认证管理
const ssoAuthManager = new SSOAuthManager(context);
const token = await ssoAuthManager.getValidToken(config);

// 3. LLM 连接测试
const response = await axios.post(llmUrl, requestData, {
    headers: { 'Authorization': `Bearer ${token}` },
    httpsAgent: agent
});

// 4. 代码审查
const reviewResult = await aiReviewer.review(diff, {
    config: { 'llm.enableInternal': true },
    context: mockContext
});

// 5. 完整的错误诊断和报告
```

### 在 cli.js 中

```javascript
// 命令列表
test:llm          - 完整 LLM 测试
test:sso          - SSO 认证测试
test:quick        - 快速诊断
test:all          - 所有测试
config:show       - 查看配置
config:set        - 修改配置
logs:tail         - 查看日志
help              - 帮助信息
```

## 🎯 测试用例和预期结果

### 使用案例 1：验证 Internal LLM 是否正确配置

```bash
# 1. 设置配置
export LLM_URL="https://llm.example.com/v1/messages"
export SSO_USER="test-user"
export SSO_PASSWORD="test-pass"

# 2. 快速诊断
node test/cli.js test:quick

# 3. 运行完整测试
node test/cli.js test:llm

# 预期：所有 5 个测试通过 ✓
```

### 使用案例 2：诊断连接问题

```bash
# 1. 快速诊断
node test/cli.js test:quick

# 如果报警告，按提示修复

# 2. 测试 SSO
node test/cli.js test:sso
# 如果失败 → 检查 SSO 凭据和网络

# 3. 测试 LLM
node test/cli.js test:llm
# 如果失败 → 检查 LLM URL 和网络

# 4. 查看详细日志
node test/cli.js logs:tail 50
```

### 使用案例 3：保存配置供后续使用

```bash
# 一次性设置，多次使用
node test/cli.js config:set llm.url https://stable-llm.com/v1/messages
node test/cli.js config:set sso.username production-user
node test/cli.js config:set llm.model claude-3-5-sonnet-20241022

# 验证保存
node test/cli.js config:show

# 后续只需用 CLI 即可
node test/cli.js test:llm
```

## 🐛 常见问题排查

### 问题：`TIMEOUT - 请求超时`

**原因**：LLM 服务响应慢

**解决**：
```bash
export TIMEOUT="120000"  # 增加到 120 秒
node test/cli.js test:llm
```

### 问题：`SSL certificate problem`

**原因**：自签名或过期的 SSL 证书

**解决**：
```bash
export VERIFY_SSL="false"
node test/cli.js test:llm
```

### 问题：`SSO login failed`

**原因**：SSO 凭据错误

**解决**：
```bash
export SSO_USER="correct-username"
export SSO_PASSWORD="correct-password"
node test/cli.js test:sso
```

### 问题：`Connection refused`

**原因**：LLM 服务未运行或地址错误

**解决**：
```bash
# 验证 LLM 地址
curl https://your-llm-endpoint.com/health

# 查看配置
node test/cli.js config:show

# 重新设置正确的地址
node test/cli.js config:set llm.url https://correct-endpoint.com/v1/messages
```

## 📈 性能基准

| 操作 | 预期时间 |
|------|---------|
| 快速诊断 | 1-2 秒 |
| SSO 登录 | 3-5 秒 |
| LLM 连接测试 | 5-10 秒 |
| 代码审查请求 | 10-30 秒 |
| 完整测试套件 | 30-60 秒 |

## 🎓 进阶用法

### 运行自定义测试

编辑 `test/quick-test.js` 的 `runTest()` 函数添加自己的测试逻辑：

```javascript
async function runTest() {
    // 你的测试代码
    const result = await someFunction();
    console.log('测试结果:', result);
}
```

然后运行：
```bash
node test/quick-test.js
```

### 集成到 CI/CD

```bash
#!/bin/bash
# 在 CI/CD 流程中验证 Internal LLM

# 设置环境变量（从 CI 秘密存储）
export LLM_URL=$CI_LLM_URL
export SSO_USER=$CI_SSO_USER
export SSO_PASSWORD=$CI_SSO_PASSWORD

# 运行测试
node test/cli.js test:llm

# 检查返回码
if [ $? -eq 0 ]; then
    echo "✓ Internal LLM 测试通过"
else
    echo "✗ Internal LLM 测试失败"
    exit 1
fi
```

## 📚 相关文件

- 📖 [完整测试文档](./README.md)
- 🔧 [aiReviewer.js](../aiReviewer.js) - AI 审查核心
- 🛡️ [ssoAuthManager.js](../ssoAuthManager.js) - SSO 认证管理
- ⚙️ [configManager.js](../configManager.js) - 配置管理
- 🔐 [httpsAgent.js](../httpsAgent.js) - HTTPS 连接

## 🎉 下一步

1. ✓ 快速诊断确保环境正确
2. ✓ 配置 Internal LLM 地址和 SSO
3. ✓ 运行完整测试验证功能
4. ✓ 在 VSCode 中使用 Git Diff AI Reviewer 插件

## 💡 提示

- 保存配置后就可以不用每次都设置环境变量
- 所有测试输出都有详细的诊断信息
- 日志文件位置：`.ada_plugin/logs/error.log`
- 出问题时先查看日志和快速诊断

---

**最后更新**: 2026年3月18日  
**测试工具版本**: 1.0
