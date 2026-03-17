#!/bin/bash
# Internal LLM 测试命令参考 - 快速复制粘贴

# ============================================
# 📋 快速命令 (复制粘贴使用)
# ============================================

# 1️⃣ 显示帮助信息
node test/cli.js help

# 2️⃣ 快速诊断系统
node test/cli.js test:quick

# 3️⃣ 测试 SSO 认证流程
node test/cli.js test:sso

# 4️⃣ 测试 Internal LLM 接口 (核心)
node test/cli.js test:llm

# 5️⃣ 运行所有测试
node test/cli.js test:all

# 6️⃣ 查看当前配置
node test/cli.js config:show

# ============================================
# ⚙️ 配置命令
# ============================================

# 设置 LLM 地址
node test/cli.js config:set llm.url https://your-llm-endpoint.com/v1/messages

# 设置 LLM 模型
node test/cli.js config:set llm.model claude-3-5-sonnet-20241022

# 设置 SSO 用户名
node test/cli.js config:set sso.username your-username

# 设置 SSO URL
node test/cli.js config:set sso.url https://sso.dds.com/sercie-login

# 禁用 SSL 验证
node test/cli.js config:set llm.verifySsl false

# ============================================
# 📊 日志命令
# ============================================

# 查看最后 20 行日志
node test/cli.js logs:tail

# 查看最后 50 行日志
node test/cli.js logs:tail 50

# 查看最后 100 行日志
node test/cli.js logs:tail 100

# 查看原始日志文件
cat .ada_plugin/logs/error.log

# ============================================
# 🔧 环境变量设置 (会话生效)
# ============================================

# 方法 1: 单行设置
export LLM_URL="https://your-llm-endpoint.com/v1/messages" && \
export LLM_MODEL="claude-3-5-sonnet-20241022" && \
export SSO_URL="https://sso.dds.com/sercie-login" && \
export SSO_USER="your-username" && \
export SSO_PASSWORD="your-password" && \
export VERIFY_SSL="false" && \
echo "✓ 环境变量已设置"

# 方法 2: 分行设置
export LLM_URL="https://your-llm-endpoint.com/v1/messages"
export LLM_MODEL="claude-3-5-sonnet-20241022"
export SSO_URL="https://sso.dds.com/sercie-login"
export SSO_USER="your-username"
export SSO_PASSWORD="your-password"
export VERIFY_SSL="false"
export TIMEOUT="60000"

# ============================================
# 🧪 高级测试命令
# ============================================

# 直接运行完整的 Internal LLM 测试脚本
node test/test-internal-llm.js

# 直接运行 SSO 测试脚本
node test/test-sso.js

# 直接运行 AI Reviewer 测试脚本
node test/test-ai-reviewer.js

# 直接运行快速测试脚本
node test/quick-test.js

# ============================================
# 🔍 诊断和排查
# ============================================

# 快速诊断 + SSO 测试 + LLM 测试
node test/cli.js test:quick && \
node test/cli.js test:sso && \
node test/cli.js test:llm && \
echo "✅ 完整诊断通过"

# 测试 + 查看日志
node test/cli.js test:llm && node test/cli.js logs:tail 50

# 检查网络连接到 LLM
ping -c 3 your-llm-endpoint.com

# 验证 SSL 证书
openssl s_client -connect your-llm-endpoint.com:443

# ============================================
# 💾 配置备份/恢复
# ============================================

# 备份配置
cp .ada_plugin/config.json .ada_plugin/config.json.backup

# 查看备份
cat .ada_plugin/config.json.backup

# 恢复配置
cp .ada_plugin/config.json.backup .ada_plugin/config.json

# 清除配置
rm .ada_plugin/config.json

# ============================================
# 🚀 推荐工作流
# ============================================

# 流程 1: 首次设置
echo "=== 首次设置流程 ==="
node test/cli.js test:quick                                    # 诊断环境
node test/cli.js config:set llm.url https://your-llm.com/v1    # 配置 LLM
node test/cli.js config:set sso.username your-user             # 配置 SSO
node test/cli.js config:show                                   # 验证配置
node test/cli.js test:llm                                      # 运行完整测试

# 流程 2: 日常验证
echo "=== 日常验证流程 ==="
node test/cli.js test:quick        # 检查环境
node test/cli.js test:llm          # 运行 LLM 测试
node test/cli.js logs:tail 20      # 查看最近日志

# 流程 3: 问题排查
echo "=== 问题排查流程 ==="
node test/cli.js test:quick        # 诊断环境
node test/cli.js test:sso          # 测试 SSO
node test/cli.js test:llm          # 测试 LLM
node test/cli.js logs:tail 100     # 查看详细日志

# ============================================
# 📌 常用技巧
# ============================================

# 禁用 SSL 查看详细错误
export VERIFY_SSL="false"
node test/cli.js test:llm | head -50

# 设置更长的超时时间
export TIMEOUT="120000"
node test/cli.js test:llm

# 同时运行多个测试
(node test/cli.js test:quick) & \
(node test/cli.js test:sso) & \
wait

# 记录测试输出到文件
node test/cli.js test:llm > test-output.log 2>&1
cat test-output.log

# ============================================
# 🎯 按场景快速命令
# ============================================

# 场景 1: 验证 LLM 是否正常工作
echo "场景 1: 验证 LLM"
node test/cli.js test:llm

# 场景 2: 查找连接问题
echo "场景 2: 诊断连接"
node test/cli.js test:quick
node test/cli.js test:sso
node test/cli.js logs:tail 50

# 场景 3: 更新 LLM 配置
echo "场景 3: 更新配置"
node test/cli.js config:set llm.url https://new-endpoint.com/v1/messages
node test/cli.js config:show

# 场景 4: 完整系统检查
echo "场景 4: 完整检查"
node test/cli.js test:all

# ============================================
# 💡 调试技巧
# ============================================

# 显示详细的请求/响应信息（编辑脚本后使用）
DEBUG=* node test/test-internal-llm.js

# 只显示错误
node test/cli.js test:llm 2>&1 | grep -E "(Error|✗|❌)"

# 显示成功的部分
node test/cli.js test:llm 2>&1 | grep -E "(✓|✅|Success)"

# 统计测试时间
time node test/cli.js test:llm

# ============================================
# 📝 配置示例
# ============================================

# 完整配置示例
cat > .ada_plugin/config.json << EOF
{
  "llm.url": "https://your-llm-endpoint.com/v1/messages",
  "llm.model": "claude-3-5-sonnet-20241022",
  "llm.verifySsl": false,
  "sso.username": "your-username",
  "sso.url": "https://sso.dds.com/sercie-login"
}
EOF

# 验证配置
cat .ada_plugin/config.json

# ============================================
# 清理和重置
# ============================================

# 清除所有缓存数据
rm -rf .ada_plugin/

# 清除日志
rm -f .ada_plugin/logs/error.log

# 清除配置
rm -f .ada_plugin/config.json

# 重新初始化
mkdir -p .ada_plugin/logs

# ============================================
# 使用提示
# ============================================
# 1. 复制需要的命令粘贴到终端
# 2. 修改示例中的 URL 和用户名
# 3. 根据提示信息调整参数
# 4. 保存工作的配置命令以便重复使用
# ============================================
