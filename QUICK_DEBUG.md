# 快速调试指南

## 🎯 三种调试方式

### 1️⃣ VSCode调试器（最推荐）

**步骤：**
1. 按 `F5` 或点击左侧调试图标 🐛
2. 选择调试配置：
   - `🚀 Run Extension` - 调试完整扩展
   - `🧪 Run Extension (No Build)` - 快速调试
   - `🔍 Run Extension with Debug Logging` - 详细日志
   - `🔧 Test SSO Auth Manager` - 测试SSO登录
   - `🔧 Test AI Reviewer` - 测试AI审查

**优点：**
- 可以设置断点
- 查看变量值
- 单步执行代码
- 完整的调试体验

### 2️⃣ 开发者工具控制台

**步骤：**
1. 按 `F5` 启动扩展开发主机
2. 在新窗口中按 `F12` 打开开发者工具
3. 切换到 "Console" 标签页
4. 查看 `console.log()` 输出

**优点：**
- 实时查看日志
- 无需修改代码
- 可以执行JavaScript代码

### 3️⃣ 命令行测试脚本

**步骤：**
```bash
# 测试SSO认证
npm run test:sso
# 或
node test/test-sso.js

# 测试AI审查器
npm run test:ai
# 或
node test/test-ai-reviewer.js
```

**优点：**
- 快速验证功能
- 易于调试特定模块
- 可以直接修改测试参数

## 🔥 热门调试场景

### 调试SSO登录问题

```javascript
// 1. 修改 test/test-sso.js
const testUserId = 'your-username';     // 改为实际用户名
const testPassword = 'your-password';   // 改为实际密码

// 2. 运行测试
node test/test-sso.js

// 3. 查看输出
✅ SSO登录成功!
   Token长度: 1234
   Token前缀: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 调试AI审查问题

```javascript
// 1. 修改 test/test-ai-reviewer.js
const testConfig = {
    ssoUsername: 'your-username',
    ssoPassword: 'your-password',
    internalLLMUrl: 'https://your-llm-url.com/v1/messages'
};

// 2. 运行测试
node test/test-ai-reviewer.js

// 3. 查看完整的审查结果
```

### 查看详细日志

1. **在扩展开发主机中**
   - 按 `F12` 打开开发者工具
   - 查看Console中的所有日志

2. **在日志文件中**
   ```bash
   # 查看错误日志
   cat .ada_plugin/logs/error.log

   # 实时监控日志
   tail -f .ada_plugin/logs/error.log
   ```

3. **启用详细日志**
   ```javascript
   // 在代码中添加
   console.log('详细调试信息:', data);
   console.error('错误详情:', error);
   console.warn('警告信息:', warning);
   ```

## 💡 快速技巧

### 快速查看变量值
```javascript
// 方法1: 使用console.log
console.log('变量值:', variable);

// 方法2: 使用console.table（适合数组/对象）
console.table(arrayVariable);

// 方法3: 使用JSON.stringify
console.log('完整对象:', JSON.stringify(object, null, 2));
```

### 快速测试函数
```javascript
// 创建临时测试文件 test-temp.js
const YourClass = require('./yourFile');

async function quickTest() {
    const instance = new YourClass();
    const result = await instance.someMethod();
    console.log('结果:', result);
}

quickTest();

// 运行: node test-temp.js
```

### 快速检查配置
```bash
# 查看当前配置
cat .ada_plugin/config.json

# 查看token状态
cat .ada_plugin/cache/token.json

# 查看会话信息
cat .ada_plugin/cache/session.json
```

## 🚨 常见问题快速修复

### 问题：看不到console.log输出
**解决：**
1. 按 `F12` 打开开发者工具
2. 切换到Console标签
3. 确保在"扩展开发主机"窗口中打开F12

### 问题：测试脚本报错 "Cannot find module"
**解决：**
```bash
# 重新安装依赖
npm install

# 确认当前目录
pwd  # 应该显示 .../vscode_plugin
```

### 问题：SSO登录失败
**解决：**
1. 检查网络连接
2. 确认用户名密码正确
3. 查看详细错误: `cat .ada_plugin/logs/error.log`

### 问题：扩展无法加载
**解决：**
```bash
# 1. 清理并重新安装
rm -rf node_modules
npm install

# 2. 检查package.json语法
cat package.json | head -20

# 3. 查看扩展主机日志
# 在扩展开发主机的F12中查看
```

## 📊 调试命令参考

```bash
# VSCode调试
F5                    # 启动调试
Shift+F5             # 停止调试
Ctrl+Shift+P         # 命令面板
F12                  # 开发者工具

# 终端命令
npm run test:sso     # 测试SSO
npm run test:ai      # 测试AI审查
node test/test-sso.js  # 直接运行测试

# 日志查看
cat .ada_plugin/logs/error.log    # 查看错误日志
tail -f .ada_plugin/logs/error.log # 实时监控
cat .ada_plugin/cache/token.json   # 查看token缓存
```

## 🎯 调试检查清单

开始调试前：
- [ ] 已运行 `npm install`
- [ ] 已修改测试配置（用户名、密码等）
- [ ] 网络连接正常
- [ ] 端口未被占用

调试过程中：
- [ ] 能看到console.log输出
- [ ] 断点正常工作
- [ ] 可以查看变量值
- [ ] 网络请求可见（F12 -> Network）

调试完成后：
- [ ] 问题已解决
- [ ] 清理调试代码
- [ ] 更新文档
- [ ] 测试验证

## 📞 获取帮助

1. **查看详细调试指南**: `DEBUG_GUIDE.md`
2. **查看配置指南**: `INTERNAL_LLM_SETUP.md`
3. **查看错误日志**: `.ada_plugin/logs/error.log`
4. **查看VSCode输出**: `View -> Output`

---

**记住**: 调试是开发过程的重要组成部分，善用调试工具可以大大提高效率！