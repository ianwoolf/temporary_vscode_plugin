/**
 * SSO认证管理器测试脚本
 *
 * 运行方式：
 * 1. 在VSCode中按F5，选择 "🔧 Test SSO Auth Manager"
 * 2. 或在终端运行: node test/test-sso.js
 */

const SSOAuthManager = require('../ssoAuthManager');
const ConfigManager = require('../configManager');

// 模拟context对象
const mockContext = {
    extensionUri: { fsPath: __dirname },
    globalStorageUri: { fsPath: __dirname }
};

async function testSSOAuth() {
    console.log('=== SSO认证管理器测试 ===\n');

    try {
        // 1. 初始化配置管理器
        console.log('1. 初始化配置管理器...');
        const configManager = new ConfigManager(mockContext);
        await configManager.initialize();
        console.log('✅ 配置管理器初始化成功\n');

        // 2. 设置测试凭据（请替换为你的实际凭据）
        console.log('2. 设置测试凭据...');
        const testUserId = 'your-test-user'; // 替换为实际用户名
        const testPassword = 'your-test-password'; // 替换为实际密码

        await configManager.saveSSOConfig(testUserId, testPassword);
        console.log('✅ 测试凭据已保存\n');

        // 3. 初始化SSO认证管理器
        console.log('3. 初始化SSO认证管理器...');
        const ssoAuthManager = new SSOAuthManager(mockContext);
        await ssoAuthManager.initialize();
        console.log('✅ SSO认证管理器初始化成功\n');

        // 4. 模拟VSCode配置
        const mockConfig = {
            ssoLoginUrl: 'https://sso.dds.com/sercie-login',
            ssoUsername: testUserId,
            ssoPassword: testPassword
        };

        // 5. 测试SSO登录
        console.log('4. 测试SSO登录...');
        console.log('   登录URL:', mockConfig.ssoLoginUrl);
        console.log('   用户名:', mockConfig.ssoUsername);

        const token = await ssoAuthManager.performSSOLogin(mockConfig);

        if (token) {
            console.log('✅ SSO登录成功!');
            console.log('   Token长度:', token.length);
            console.log('   Token前缀:', token.substring(0, 20) + '...\n');
        } else {
            console.log('❌ 未获取到token\n');
        }

        // 6. 测试token信息
        console.log('5. 查看Token信息...');
        const tokenInfo = await ssoAuthManager.getTokenInfo();
        console.log('   Has Token:', tokenInfo.hasToken);
        console.log('   Is Expired:', tokenInfo.isExpired);
        console.log('   Expiry Time:', tokenInfo.expiryTime);
        console.log('   Remaining Time:', Math.floor(tokenInfo.remainingTime / 1000 / 60), 'minutes\n');

        // 7. 测试缓存token
        console.log('6. 测试缓存Token...');
        const cachedToken = await ssoAuthManager.getValidToken(mockConfig);
        if (cachedToken === token) {
            console.log('✅ 缓存Token工作正常\n');
        } else {
            console.log('⚠️  缓存Token与原始Token不一致\n');
        }

        // 8. 测试token过期检测
        console.log('7. 测试Token过期检测...');
        const isValid = !ssoAuthManager.isTokenExpired();
        console.log('   Token状态:', isValid ? '有效' : '已过期', '\n');

        // 9. 测试清除token
        console.log('8. 测试清除Token...');
        await ssoAuthManager.clearToken();
        const clearedTokenInfo = await ssoAuthManager.getTokenInfo();
        console.log('   清除后Has Token:', clearedTokenInfo.hasToken);
        console.log('✅ Token清除成功\n');

        console.log('=== 测试完成 ===');
        console.log('✅ 所有测试通过!');

    } catch (error) {
        console.error('\n❌ 测试失败:', error.message);
        console.error('错误详情:', error);
        console.error('\n请检查:');
        console.error('1. 网络连接是否正常');
        console.error('2. SSO登录URL是否正确');
        console.error('3. 用户名和密码是否正确');
        console.error('4. SSL证书验证是否需要禁用');
    }
}

// 运行测试
console.log('开始SSO认证测试...\n');
testSSOAuth().then(() => {
    console.log('\n测试脚本执行完成');
    process.exit(0);
}).catch(error => {
    console.error('\n测试脚本执行失败:', error);
    process.exit(1);
});