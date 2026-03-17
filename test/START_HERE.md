# ✅ Internal LLM 测试工具 - 完整实现

## 📦 创建的测试工具总结

你现在拥有一套完整的 Internal LLM 测试和诊断系统！

### 🎯 核心工具

| 工具 | 说明 | 使用场景 |
|------|------|--------|
| **test-internal-llm.js** | 完整的测试脚本 | 完整的端到端测试 |
| **cli.js** | 命令行工具 | 日常诊断和管理 |
| **README.md** | 完整文档 | 深入了解和参考 |
| **QUICKSTART.md** | 快速指南 | 快速上手 |
| **COMMANDS.sh** | 命令参考 | 快速复制粘贴 |
| **.vscode/launch.json** | VSCode 调试配置 | 在 VSCode 中运行 |

## 🚀 立即开始

### 最快的方式（10秒）

```bash
# 1. 快速诊断
node test/cli.js test:quick

# 2. 设置 Internal LLM 地址
node test/cli.js config:set llm.url https://your-llm-endpoint.com/v1/messages

# 3. 运行完整测试
node test/cli.js test:llm
```

### 标准流程（3分钟）

```bash
# 1. 查看帮助
node test/cli.js help

# 2. 诊断环境
node test/cli.js test:quick

# 3. 设置配置
export LLM_URL="https://..."
export SSO_USER="your-user"
export SSO_PASSWORD="your-pass"

# 4. 测试 SSO
node test/cli.js test:sso

# 5. 测试 LLM
node test/cli.js test:llm

# 6. 查看日志
node test/cli.js logs:tail
```

## 📚 文档导航

### 快速参考
- 🟢 **5分钟快速开始**: [QUICKSTART.md](test/QUICKSTART.md)
- 💻 **复制粘贴命令**: [COMMANDS.sh](test/COMMANDS.sh)

### 完整文档
- 📖 **详细说明**: [README.md](test/README.md)
- 📊 **技术总结**: [TEST_SUMMARY.md](test/TEST_SUMMARY.md)

### 代码参考
- 🔧 **aiReviewer.js** - AI 审查核心
- 🛡️ **ssoAuthManager.js** - SSO 认证
- ⚙️ **configManager.js** - 配置管理
- 🔐 **httpsAgent.js** - HTTPS 连接

## 🎓 典型使用场景

### 场景 1: 首次部署（推荐）

```bash
# 第1步：诊断环境
node test/cli.js test:quick

# 第2步：配置 Internal LLM（选择其一）
# 方法A：环境变量方式
export LLM_URL="https://..."
export SSO_USER="your-user"
export SSO_PASSWORD="your-pass"

# 方法B：保存配置方式（推荐）
node test/cli.js config:set llm.url https://your-llm-endpoint.com/v1/messages
node test/cli.js config:set sso.username your-user

# 第3步：运行完整测试
node test/cli.js test:llm

# 第4步：验证成功
# 预期：5 个测试全部通过 ✓
```

### 场景 2: 诊断连接问题

```bash
# 第1步：快速诊断
node test/cli.js test:quick

# 第2步：逐项测试
node test/cli.js test:sso      # SSO 是否工作？
node test/cli.js test:llm      # LLM 是否可达？

# 第3步：查看高级信息
node test/cli.js logs:tail 100  # 查看详细日志

# 第4步：针对性修复
# 根据日志信息进行调整
```

### 场景 3: 持续监控

```bash
# 保存配置（一次性）
node test/cli.js config:set llm.url https://prod-llm.com/v1/messages

# 定期测试
node test/cli.js test:llm

# 监控日志
node test/cli.js logs:tail 50
```

## 🔧 五个核心测试

### 1️⃣ HTTPS Agent 创建
```
✓ 创建安全连接
✓ SSL 证书验证
✓ 连接超时设置
✓ 自签名证书支持
```

### 2️⃣ SSO 认证流程
```
✓ 凭据保存和加密
✓ Token 获取
✓ Token 缓存机制
✓ Token 过期检测
```

### 3️⃣ LLM 连接测试
```
✓ 基本连接测试
✓ API 响应验证
✓ 网络超时处理
✓ 各种响应格式支持
```

### 4️⃣ 代码审查请求
```
✓ 构建审查 prompt
✓ 发送完整请求
✓ 解析 LLM 响应
✓ 结果验证
```

### 5️⃣ AiReviewer 集成
```
✓ 完整流程集成
✓ 端到端验证
✓ 性能监测
✓ 完整报告生成
```

## 📊 预期性能

| 操作 | 时间 |
|------|------|
| 快速诊断 | 1-2 秒 |
| SSO 测试 | 3-5 秒 |
| LLM 连接 | 5-10 秒 |
| 代码审查 | 10-30 秒 |
| 完整套件 | 30-60 秒 |

## ✨ 主要特特性

### CLI 工具 (cli.js)
- 🎨 彩色输出，清晰易读
- 📊 结构化命令系统
- 💾 配置持久化
- 📖 内置帮助系统
- 📉 日志查看功能
- ✅ 环境诊断

### 测试脚本 (test-internal-llm.js)
- 🧪 模块化测试
- 📈 详细的诊断信息
- ⏱️ 性能监测
- 🛡️ 完善的错误处理
- 📊 测试总结报告
- 🔍 自动错误诊断

### 文档系统
- 📋 快速快速指南
- 📚 完整参考文档
- 💡 常见问题解答
- 🎯 场景指导
- 📌 命令参考

## 🛠️ VSCode 集成

在 VSCode 中按 **F5** 选择调试配置：

- 🧪 Test Internal LLM - 完整测试
- 🔐 Test SSO Auth - SSO 测试
- 🤖 Test AI Reviewer - AI 测试
- ⚡ Quick Test - 快速测试
- 🔍 CLI 工具 - 各种 CLI 命令

## 💾 配置管理

### 查看配置
```bash
node test/cli.js config:show
```

### 设置配置
```bash
node test/cli.js config:set llm.url https://...
node test/cli.js config:set sso.username your-user
```

### 配置文件位置
```
.ada_plugin/config.json
```

## 📝 常用命令快速参考

```bash
# 帮助
node test/cli.js help

# 诊断
node test/cli.js test:quick
node test/cli.js test:sso
node test/cli.js test:llm
node test/cli.js test:all

# 配置
node test/cli.js config:show
node test/cli.js config:set <key> <value>

# 日志
node test/cli.js logs:tail [行数]

# 直接运行脚本
node test/test-internal-llm.js
```

## 🎉 现在你可以

✅ **完整测试 Internal LLM 接口**
- 验证连接
- 测试认证
- 运行审查

✅ **诊断配置问题**
- 环境检查
- 网络验证
- SSL 检查

✅ **持久化保存配置**
- 无需重复输入
- 便于复用
- 易于管理

✅ **在 VSCode 中直接测试**
- 点击 F5 选择配置
- 集成化体验
- 快速调试

✅ **查看详细日志**
- 问题诊断
- 性能分析
- 完整追踪

## 🚨 如果遇到问题

### 第1步：快速诊断
```bash
node test/cli.js test:quick
```

### 第2步：查看详细日志
```bash
node test/cli.js logs:tail 100
```

### 第3步：逐步测试
```bash
node test/cli.js test:sso      # 测试 SSO
node test/cli.js test:llm      # 测试 LLM
```

### 第4步：查看完整文档
- 📖 [README.md](test/README.md) - 详细说明
- 📚 [QUICKSTART.md](test/QUICKSTART.md) - 快速指南
- 💡 [COMMANDS.sh](test/COMMANDS.sh) - 命令参考

## 📞 支持信息

- 📖 文档位置：`test/` 目录
- 📊 日志位置：`.ada_plugin/logs/error.log`
- 🔧 配置位置：`.ada_plugin/config.json`
- 📝 代码参考：查看各核心模块

## 🎯 下一步

1. **运行快速诊断**
   ```bash
   node test/cli.js test:quick
   ```

2. **配置 Internal LLM**
   ```bash
   node test/cli.js config:set llm.url https://your-endpoint.com/v1/messages
   ```

3. **测试连接**
   ```bash
   node test/cli.js test:llm
   ```

4. **在 VSCode 中使用插件**
   - 加载扩展
   - 运行代码审查
   - 查看审查结果

## 📈 成功标志

当你看到以下输出时，说明配置成功：

```
[TEST 1] HTTPS Agent 创建
✓ HTTPS Agent创建成功

[TEST 2] SSO 认证流程
✓ SSO认证成功

[TEST 3] LLM 连接性测试
✓ LLM连接成功

[TEST 4] 代码审查请求
✓ 代码审查请求成功

[TEST 5] AiReviewer 集成测试
✓ AiReviewer集成测试成功

总计:  5 个测试
通过:  5 个
✅ 所有测试通过！Internal LLM 配置正确。
```

---

**创建时间**: 2026年3月18日  
**版本**: 1.0  
**状态**: ✅ 完整就绪

🎉 **开始使用**: `node test/cli.js help`
