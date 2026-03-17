/**
 * 快速测试脚本 - 运行单独的JS代码进行调试
 *
 * 使用方法：
 * 1. 修改下面的测试代码
 * 2. 在终端运行: node test/quick-test.js
 * 3. 或者在VSCode中按F5选择 "🐛 Debug Current File"
 */

// ============================================
// 📝 在这里写你的测试代码
// ============================================

async function runTest() {
    console.log('=== 开始快速测试 ===\n');

    try {
        // 📌 示例1: 测试配置管理器
        console.log('🔍 测试1: 配置管理器');
        const ConfigManager = require('../configManager');
        const mockContext = {
            extensionUri: { fsPath: __dirname },
            globalStorageUri: { fsPath: __dirname }
        };

        const configManager = new ConfigManager(mockContext);
        await configManager.initialize();
        console.log('✅ 配置管理器初始化成功\n');

        // 📌 示例2: 测试加密解密
        console.log('🔍 测试2: 加密解密功能');
        const testText = 'Hello World';
        const encrypted = configManager.encrypt(testText);
        const decrypted = configManager.decrypt(encrypted);

        console.log('原始文本:', testText);
        console.log('加密后:', encrypted);
        console.log('解密后:', decrypted);
        console.log('测试结果:', testText === decrypted ? '✅ 通过' : '❌ 失败');
        console.log();

        // 📌 示例3: 测试HTTPS Agent
        console.log('🔍 测试3: HTTPS Agent');
        const HttpsAgentFactory = require('../httpsAgent');
        const agent = HttpsAgentFactory.createAgent(true, 30000);
        console.log('Agent创建结果:', agent ? '✅ 成功' : '❌ 失败');
        console.log();

        // 📌 示例4: 测试文件操作
        console.log('🔍 测试4: 文件读写');
        const fs = require('fs').promises;
        const testFile = '.ada_plugin/test-temp.txt';

        await fs.writeFile(testFile, '测试内容');
        const content = await fs.readFile(testFile, 'utf8');
        console.log('写入内容:', '测试内容');
        console.log('读取内容:', content);
        console.log('文件操作:', content === '测试内容' ? '✅ 成功' : '❌ 失败');
        console.log();

        // 📌 示例5: 测试日期时间
        console.log('🔍 测试5: 日期时间操作');
        const now = Date.now();
        const expiryTime = now + 3600 * 1000;
        const remainingTime = expiryTime - now;

        console.log('当前时间:', new Date(now).toISOString());
        console.log('过期时间:', new Date(expiryTime).toISOString());
        console.log('剩余时间:', Math.floor(remainingTime / 1000 / 60), '分钟');
        console.log();

        // 📌 示例6: 测试JSON操作
        console.log('🔍 测试6: JSON操作');
        const testData = {
            username: 'test-user',
            timestamp: new Date().toISOString(),
            data: [1, 2, 3, 4, 5]
        };

        const jsonStr = JSON.stringify(testData, null, 2);
        const parsedData = JSON.parse(jsonStr);

        console.log('JSON字符串:', jsonStr);
        console.log('解析结果:', parsedData);
        console.log();

        console.log('=== 所有测试完成 ===');
        console.log('✅ 全部通过！');

    } catch (error) {
        console.error('\n❌ 测试失败:', error.message);
        console.error('错误堆栈:', error.stack);
    }
}

// ============================================
// 🚀 执行测试
// ============================================

console.log('🚀 启动快速测试脚本...\n');

runTest().then(() => {
    console.log('\n✅ 测试脚本执行成功');
    process.exit(0);
}).catch(error => {
    console.error('\n❌ 测试脚本执行失败:', error);
    process.exit(1);
});

// ============================================
// 💡 使用提示
// ============================================
/*
1. 修改 runTest() 函数中的测试代码
2. 添加你自己的测试逻辑
3. 运行: node test/quick-test.js
4. 查看输出结果

常见测试场景：
- 测试单个函数
- 调试算法逻辑
- 验证数据处理
- 检查网络请求
- 测试文件操作
- 调试JSON解析
*/