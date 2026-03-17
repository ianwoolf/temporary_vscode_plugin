# 🎉 新增：完整的 Internal LLM 测试工具

## 📌 概要

已为你的项目创建了一套**完整的 Internal LLM 测试和诊断系统**。

## 🚀 快速开始（30秒）

```bash
# 第1步：显示帮助
node test/cli.js help

# 第2步：快速诊断
node test/cli.js test:quick

# 第3步：运行完整测试
export LLM_URL="https://your-llm-endpoint.com/v1/messages"
export SSO_USER="your-username"
export SSO_PASSWORD="your-password"
node test/cli.js test:llm
```

## 📦 创建了什么？

### 新增文件列表

```
test/
├── cli.js                    ← 主命令行工具 (推荐使用) ⭐
├── test-internal-llm.js      ← 完整的 Internal LLM 测试
├── test-sso.js               ← SSO 认证测试
├── test-ai-reviewer.js       ← AI 代码审查测试
├── quick-test.js             ← 快速功能测试
├── START_HERE.md             ← 开始阅读这个 ⭐
├── QUICKSTART.md             ← 快速指南
├── README.md                 ← 完整参考文档
├── TEST_SUMMARY.md           ← 技术总结
├── COMMANDS.sh               ← 命令参考
└── INDEX.md                  ← 文档索引

.vscode/
└── launch.json               ← VSCode 调试配置 (F5 运行测试)
```

## 🎯 主要功能

### 1. CLI 命令行工具 (cli.js)
最推荐使用的方式

**常用命令**：
```bash
node test/cli.js help              # 显示帮助
node test/cli.js test:quick        # 快速诊断
node test/cli.js test:sso          # SSO 测试
node test/cli.js test:llm          # LLM 测试
node test/cli.js test:all          # 所有测试
node test/cli.js config:show       # 查看配置
node test/cli.js config:set <k> <v> # 修改配置
node test/cli.js logs:tail [行数]  # 查看日志
```

### 2. 完整测试脚本 (test-internal-llm.js)
包含5个完整的测试阶段

**测试内容**：
- ✓ HTTPS Agent 创建
- ✓ SSO 认证流程
- ✓ LLM 连接测试
- ✓ 代码审查请求
- ✓ AiReviewer 集成

**运行**：
```bash
node test/test-internal-llm.js
```

### 3. 完整文档系统
12个精心编写的文档文件

**推荐阅读顺序**：
1. [START_HERE.md](test/START_HERE.md) - 5 分钟了解全貌
2. [QUICKSTART.md](test/QUICKSTART.md) - 快速配置指南
3. [README.md](test/README.md) - 完整参考文档
4. [TEST_SUMMARY.md](test/TEST_SUMMARY.md) - 技术深入

## 📊 测试覆盖范围

| 组件 | 测试项 | 验证 |
|------|--------|------|
| HTTPS | SSL 验证、证书、连接 | ✓ |
| SSO | 认证、Token、缓存 | ✓ |
| LLM | 连接、请求、响应 | ✓ |
| AI 审查 | 完整流程、结果 | ✓ |
| 集成 | 端到端工作流 | ✓ |

## 🎮 使用方式

### 方式 1：命令行（推荐）
```bash
node test/cli.js test:llm
```

### 方式 2：VSCode 调试（F5）
在 VSCode 中按 F5，选择调试配置。

### 方式 3：脚本直接运行
```bash
node test/test-internal-llm.js
```

## 📝 配置管理

### 保存配置（一次性设置，多次使用）
```bash
node test/cli.js config:set llm.url https://your-llm.com/v1/messages
node test/cli.js config:set sso.username your-user
node test/cli.js config:set llm.model claude-3-5-sonnet-20241022
```

### 查看已保存配置
```bash
node test/cli.js config:show
```

### 使用环境变量（临时）
```bash
export LLM_URL="https://..."
export SSO_USER="your-user"
export SSO_PASSWORD="your-pass"
node test/cli.js test:llm
```

## ✅ 预期输出示例

### 快速诊断
```
✓ Node.js版本: v22.14.0
✓ 工作目录: /path/to/project
✓ 配置文件存在
✓ 环境变量设置
✓ 依赖库已安装
```

### 完整测试
```
[TEST 1] HTTPS Agent 创建
✓ HTTPS Agent创建成功

[TEST 2] SSO 认证流程
✓ SSO认证成功

[TEST 3] LLM 连接性测试
✓ LLM连接成功

[TEST 4] 代码审查请求
✓ 代码审查请求成功 (12.34 秒)

[TEST 5] AiReviewer 集成测试
✓ AiReviewer集成测试成功

总计: 5 个测试
通过: 5 个
✅ 所有测试通过！
```

## 🚨 常见操作

### 诊断连接问题
```bash
# 1. 快速诊断
node test/cli.js test:quick

# 2. 逐项测试
node test/cli.js test:sso   # SSO 是否工作？
node test/cli.js test:llm   # LLM 是否可达？

# 3. 查看详细日志
node test/cli.js logs:tail 100
```

### 禁用 SSL 验证
```bash
export VERIFY_SSL="false"
node test/cli.js test:llm
```

### 增加超时时间
```bash
export TIMEOUT="120000"  # 120 秒
node test/cli.js test:llm
```

### 查看日志
```bash
node test/cli.js logs:tail 50
# 或
cat .ada_plugin/logs/error.log
```

## 📈 性能指标

| 操作 | 预期时间 |
|------|---------|
| 快速诊断 | 1-2 秒 |
| SSO 测试 | 3-5 秒 |
| LLM 连接 | 5-10 秒 |
| 代码审查 | 10-30 秒 |
| 完整测试 | 30-60 秒 |

## 🎓 学习资源

### 新手
1. 📖 [START_HERE.md](test/START_HERE.md) - 完整介绍
2. 🎯 [QUICKSTART.md](test/QUICKSTART.md) - 快速上手
3. 💻 运行 `node test/cli.js help` - 查看命令

### 进阶
1. 📚 [README.md](test/README.md) - 详细参考
2. 🔧 [COMMANDS.sh](test/COMMANDS.sh) - 命令集合
3. 📊 [TEST_SUMMARY.md](test/TEST_SUMMARY.md) - 技术细节

## 🔗 核心模块

这套工具集成了以下核心模块：

- **aiReviewer.js** - AI 代码审查
- **ssoAuthManager.js** - SSO 认证管理
- **configManager.js** - 配置管理
- **httpsAgent.js** - HTTPS 连接工厂

## ✨ 关键特性

✅ **完整的端到端测试** - 验证每个环节
✅ **彩色化输出** - 清晰易读
✅ **配置持久化** - 保存设置，无需重复
✅ **详细诊断** - 问题根源快速定位
✅ **日志查看** - 完整的执行追踪
✅ **VSCode 集成** - F5 快速运行
✅ **环境检查** - 自动诊断系统状态
✅ **完整文档** - 清晰的学习路径

## 🎉 立即开始

### 第 1 步：快速诊断（10秒）
```bash
node test/cli.js test:quick
```

### 第 2 步：阅读指南（5分钟）
打开 [test/START_HERE.md](test/START_HERE.md)

### 第 3 步：配置并测试（5分钟）
```bash
node test/cli.js config:set llm.url https://your-llm.com/v1/messages
node test/cli.js test:llm
```

### 第 4 步：使用插件
在 VSCode 中运行 Git Diff AI Reviewer 进行代码审查

## 📁 文件导航

| 文件 | 用途 |
|------|------|
| **test/cli.js** | 🟢 主要工具 - 推荐使用 |
| [test/START_HERE.md](test/START_HERE.md) | 🟢 开始这里 |
| [test/QUICKSTART.md](test/QUICKSTART.md) | 🟡 快速指南 |
| [test/README.md](test/README.md) | 🟠 完整参考 |
| [test/COMMANDS.sh](test/COMMANDS.sh) | 🟠 命令集合 |
| [test/INDEX.md](test/INDEX.md) | 📚 文档索引 |

## 🤔 常见问题

**Q: 如何开始？**
A: 运行 `node test/cli.js test:quick` 进行诊断

**Q: 如何配置 Internal LLM？**
A: 查看 [test/QUICKSTART.md](test/QUICKSTART.md)

**Q: 如何在 VSCode 中运行？**
A: 按 F5，从调试配置中选择

**Q: 遇到问题怎么办？**
A: 运行 `node test/cli.js test:quick` 诊断，然后查看日志

**Q: 如何保存配置？**
A: 使用 `config:set` 命令保存到 `.ada_plugin/config.json`

## 📞 需要帮助？

1. 📖 查看文档：[test/README.md](test/README.md)
2. 🔧 查看命令：`node test/cli.js help`
3. 📊 查看日志：`node test/cli.js logs:tail 50`
4. 🎯 快速诊断：`node test/cli.js test:quick`

---

## 🎊 总结

你现在拥有：

✅ 完整的 Internal LLM 测试套件  
✅ 方便的命令行工具  
✅ 清晰的文档系统  
✅ VSCode 调试集成  
✅ 详细的诊断功能  
✅ 日志管理系统  

**立即开始**: 
```bash
node test/cli.js help
```

祝你使用愉快！ 🚀

---

**创建时间**: 2026年3月18日  
**版本**: 1.0  
**状态**: ✅ 完整就绪
