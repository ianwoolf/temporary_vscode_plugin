# VSCode插件调试指南

## 🚀 快速开始

### 方法1: 使用VSCode调试器（推荐）

1. **打开调试面板**
   - 按 `F5` 或点击左侧调试图标
   - 选择调试配置

2. **可用的调试配置**
   - `🚀 Run Extension` - 标准调试模式
   - `🧪 Run Extension (No Build)` - 快速调试（无需重新编译）
   - `🔍 Run Extension with Debug Logging` - 详细日志模式
   - `🔧 Test SSO Auth Manager` - 测试SSO认证
   - `🔧 Test AI Reviewer` - 测试AI审查功能

3. **设置断点**
   - 在代码行号左侧点击设置断点
   - 按F5启动调试
   - 触发功能时会在断点处暂停

### 方法2: 使用控制台日志

1. **查看开发者工具**
   - 在扩展开发主机中按 `F12` 或 `Ctrl+Shift+I`
   - 切换到 "Console" 标签页
   - 查看所有 `console.log()` 输出

2. **添加日志代码**
   ```javascript
   console.log('调试信息:', variable);
   console.error('错误信息:', error);
   console.warn('警告信息:', warning);
   ```

### 方法3: 运行测试脚本

直接运行测试文件调试特定功能：

```bash
# 测试SSO认证
node test/test-sso.js

# 测试AI审查器
node test/test-ai-reviewer.js
```

## 📋 调试步骤

### 调试SSO登录功能

1. **修改测试凭据**
   ```javascript
   // test/test-sso.js
   const testUserId = 'your-actual-username';
   const testPassword = 'your-actual-password';
   ```

2. **运行测试**
   - 按F5选择 "🔧 Test SSO Auth Manager"
   - 或在终端运行: `node test/test-sso.js`

3. **查看输出**
   - 查看终端输出
   - 检查 `.ada_plugin/logs/error.log`

### 调试AI审查功能

1. **配置测试参数**
   ```javascript
   // test/test-ai-reviewer.js
   const testConfig = {
       ssoUsername: 'your-username',
       ssoPassword: 'your-password',
       internalLLMUrl: 'https://your-llm-url.com/v1/messages'
   };
   ```

2. **运行测试**
   - 按F5选择 "🔧 Test AI Reviewer"
   - 或在终端运行: `node test/test-ai-reviewer.js`

### 调试扩展功能

1. **启动扩展开发主机**
   - 按F5选择 "🚀 Run Extension"
   - 会打开一个新的VSCode窗口（扩展开发主机）

2. **在扩展开发主机中测试功能**
   - 使用命令面板 (`Ctrl+Shift+P`)
   - 运行你的扩展命令
   - 触发需要调试的功能

3. **调试断点会暂停执行**
   - 查看变量值
   - 单步执行代码
   - 查看调用堆栈

## 🐛 常用调试技巧

### 1. 查看日志文件

```bash
# 查看错误日志
cat .ada_plugin/logs/error.log

# 查看配置文件
cat .ada_plugin/config.json

# 查看token缓存
cat .ada_plugin/cache/token.json
```

### 2. 使用Chrome DevTools

在扩展开发主机中：
1. 按 `F12` 打开开发者工具
2. 使用 "Console" 查看日志
3. 使用 "Network" 查看网络请求
4. 使用 "Sources" 设置断点调试

### 3. 调试网络请求

```javascript
// 在aiReviewer.js中添加调试日志
console.log('请求数据:', JSON.stringify(requestData, null, 2));
console.log('请求头:', JSON.stringify(requestHeaders, null, 2));
console.log('响应数据:', JSON.stringify(response.data, null, 2));
```

### 4. 测试单个函数

创建临时测试文件：

```javascript
// test-temp.js
const SSOAuthManager = require('./ssoAuthManager');

async function test() {
    const manager = new SSOAuthManager(mockContext);
    const tokenInfo = await manager.getTokenInfo();
    console.log(tokenInfo);
}

test();
```

然后运行: `node test-temp.js`

## 🔧 调试配置说明

### launch.json 配置项

```json
{
  "name": "🚀 Run Extension",
  "type": "extensionHost",        // VSCode扩展主机类型
  "request": "launch",             // 启动请求
  "args": [
    "--extensionDevelopmentPath=${workspaceFolder}"  // 扩展开发路径
  ],
  "outFiles": ["${workspaceFolder}/**/*.js"],       // 输出文件
  "preLaunchTask": "npm: watch"                     // 启动前任务
}
```

### tasks.json 配置项

```json
{
  "label": "npm: watch",          // 任务名称
  "type": "npm",                  // npm任务类型
  "script": "watch",              // npm脚本名称
  "isBackground": true,           // 后台任务
  "problemMatcher": "$tsc-watch"  // 问题匹配器
}
```

## 📊 性能分析

### 测量执行时间

```javascript
const startTime = Date.now();

// 你的代码
await someAsyncFunction();

const endTime = Date.now();
console.log(`执行时间: ${endTime - startTime}ms`);
```

### 内存使用分析

在开发者工具中：
1. 打开 "Memory" 标签页
2. 点击 "Take heap snapshot"
3. 分析内存使用情况

## 🚨 故障排除

### 问题1: 扩展无法加载

**解决方案:**
1. 检查 `package.json` 配置是否正确
2. 查看扩展开发主机的控制台输出
3. 确认所有依赖已安装: `npm install`

### 问题2: 断点不起作用

**解决方案:**
1. 确保使用的是编译后的 `.js` 文件，不是 `.ts` 源文件
2. 检查 `outFiles` 配置是否正确
3. 重启调试会话

### 问题3: 看不到console.log输出

**解决方案:**
1. 打开扩展开发主机的开发者工具 (`F12`)
2. 查看Console标签页
3. 检查日志级别设置
4. 使用 `console.log('调试',变量)` 而不是 `console.log(变量)`

### 问题4: 测试脚本无法运行

**解决方案:**
1. 确保在项目根目录运行
2. 检查Node.js版本: `node --version`
3. 安装依赖: `npm install`
4. 修改测试文件中的配置参数

## 📝 调试检查清单

调试前检查：
- [ ] 已安装所有依赖 (`npm install`)
- [ ] 测试配置已正确设置
- [ ] 日志文件路径正确
- [ ] 网络连接正常
- [ ] SSO凭据有效

调试中检查：
- [ ] 断点正确设置
- [ ] 日志输出可见
- [ ] 变量值可查看
- [ ] 网络请求可追踪

调试后检查：
- [ ] 错误日志已检查
- [ ] 性能指标已记录
- [ ] 修复已验证
- [ ] 文档已更新

## 🎯 最佳实践

1. **使用有意义的日志消息**
   ```javascript
   console.log('✅ SSO登录成功');  // 好的
   console.log('success');         // 不好的
   ```

2. **添加错误处理**
   ```javascript
   try {
       await someFunction();
   } catch (error) {
       console.error('详细错误信息:', error.message, error.stack);
   }
   ```

3. **使用条件断点**
   - 右键点击断点
   - 选择 "Edit Breakpoint"
   - 添加条件: `variable === expectedValue`

4. **清理调试代码**
   - 调试完成后删除不必要的console.log
   - 保留重要的错误日志
   - 添加注释说明调试代码的用途

## 📚 相关资源

- [VSCode扩展调试官方文档](https://code.visualstudio.com/api/working-with-extensions/testing-extension)
- [Chrome DevTools文档](https://developer.chrome.com/docs/devtools/)
- [Node.js调试指南](https://nodejs.org/en/docs/guides/debugging-getting-started/)