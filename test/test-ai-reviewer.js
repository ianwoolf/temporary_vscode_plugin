/**
 * AI审查器测试脚本
 *
 * 运行方式：
 * 1. 在VSCode中按F5，选择 "🔧 Test AI Reviewer"
 * 2. 或在终端运行: node test/test-ai-reviewer.js
 */

const AiReviewer = require('../aiReviewer');
const SSOAuthManager = require('../ssoAuthManager');
const ConfigManager = require('../configManager');

// 模拟context对象
const mockContext = {
    extensionUri: { fsPath: __dirname },
    globalStorageUri: { fsPath: __dirname }
};

async function testAIReviewer() {
    console.log('=== AI审查器测试 ===\n');

    try {
        // 1. 初始化配置管理器
        console.log('1. 初始化配置管理器...');
        const configManager = new ConfigManager(mockContext);
        await configManager.initialize();

        // 设置测试配置（请替换为你的实际配置）
        const testConfig = {
            // 启用内部LLM
            enableInternalLLM: true,

            // SSO配置
            ssoLoginUrl: 'https://sso.dds.com/sercie-login',
            ssoUsername: 'your-test-user', // 替换为实际用户名
            ssoPassword: 'your-test-password', // 替换为实际密码

            // 内部LLM配置
            internalLLMUrl: 'https://your-llm-endpoint.com/v1/messages', // 替换为实际LLM地址
            internalLLMModel: 'claude-3-5-sonnet-20241022',
            disableSSLVerification: true
        };

        console.log('✅ 配置管理器初始化成功\n');

        // 2. 设置SSO凭据
        console.log('2. 设置SSO凭据...');
        await configManager.saveSSOConfig(
            testConfig.ssoUsername,
            testConfig.ssoPassword,
            testConfig.ssoLoginUrl
        );
        console.log('✅ SSO凭据已保存\n');

        // 3. 初始化AI审查器
        console.log('3. 初始化AI审查器...');
        const aiReviewer = new AiReviewer();
        console.log('✅ AI审查器初始化成功\n');

        // 4. 准备测试用的git diff
        console.log('4. 准备测试数据...');
        const testDiff = `diff --git a/test.js b/test.js
index 1234567..abcdefg 100644
--- a/test.js
+++ b/test.js
@@ -1,5 +1,10 @@
 function calculateSum(a, b) {
-    return a + b;
+    // TODO: Add error handling
+    if (typeof a !== 'number' || typeof b !== 'number') {
+        throw new Error('Invalid input');
+    }
+    return a + b;
 }

 function calculateProduct(a, b) {
     return a * b;
 }`;
        console.log('✅ 测试diff已准备');
        console.log('   Diff长度:', testDiff.length, '字符\n');

        // 5. 执行AI审查
        console.log('5. 执行AI审查...');
        console.log('   使用内部LLM:', testConfig.internalLLMUrl);
        console.log('   模型:', testConfig.internalLLMModel);
        console.log('   SSL验证:', testConfig.disableSSLVerification ? '禁用' : '启用');
        console.log('');

        const startTime = Date.now();

        const reviewResult = await aiReviewer.review(testDiff, {
            apiUrl: testConfig.internalLLMUrl,
            model: testConfig.internalLLMModel,
            targetBranch: 'main',
            currentBranch: 'feature/test',
            config: testConfig,
            context: mockContext
        });

        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        console.log('✅ AI审查完成!');
        console.log('   耗时:', duration, '秒');
        console.log('   成功:', reviewResult.success);
        console.log('   模型:', reviewResult.metadata.model);
        console.log('   服务:', reviewResult.metadata.service);
        console.log('   重试:', reviewResult.metadata.retried ? '是' : '否');
        console.log('');

        // 6. 显示审查结果
        console.log('6. 审查结果:');
        console.log('='.repeat(80));
        console.log(reviewResult.review);
        console.log('='.repeat(80));
        console.log('');

        // 7. 显示元数据
        console.log('7. 元数据:');
        console.log('   目标分支:', reviewResult.metadata.targetBranch);
        console.log('   当前分支:', reviewResult.metadata.currentBranch);
        console.log('   Diff大小:', reviewResult.metadata.diffSize, '字符');
        console.log('   时间戳:', reviewResult.metadata.timestamp);
        console.log('');

        console.log('=== 测试完成 ===');
        console.log('✅ AI审查器测试通过!');

        return reviewResult;

    } catch (error) {
        console.error('\n❌ 测试失败:', error.message);
        console.error('错误详情:', error);

        // 提供详细的错误诊断信息
        console.error('\n错误诊断:');

        if (error.message.includes('SSO login failed')) {
            console.error('1. SSO登录失败，请检查:');
            console.error('   - 用户名和密码是否正确');
            console.error('   - SSO登录URL是否可访问');
            console.error('   - 网络连接是否正常');
        } else if (error.message.includes('401') || error.message.includes('403')) {
            console.error('1. 认证失败，请检查:');
            console.error('   - Token是否有效');
            console.error('   - SSO凭据是否正确');
            console.error('   - Token是否已过期');
        } else if (error.message.includes('Internal LLM endpoint not found')) {
            console.error('1. LLM端点未找到，请检查:');
            console.error('   - internalLLMUrl配置是否正确');
            console.error('   - LLM服务是否运行中');
        } else if (error.message.includes('No response received')) {
            console.error('1. 未收到响应，请检查:');
            console.error('   - 网络连接是否正常');
            console.error('   - LLM服务是否可访问');
            console.error('   - 防火墙设置是否正确');
        } else {
            console.error('1. 未知错误，请检查:');
            console.error('   - 查看详细错误信息');
            console.error('   - 检查.ada_plugin/logs/error.log日志文件');
        }

        throw error;
    }
}

// 运行测试
console.log('开始AI审查器测试...\n');
testAIReviewer().then(() => {
    console.log('\n测试脚本执行完成');
    process.exit(0);
}).catch(error => {
    console.error('\n测试脚本执行失败:', error);
    process.exit(1);
});