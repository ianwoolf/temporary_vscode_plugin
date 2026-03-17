/**
 * Internal LLM 完整测试脚本
 *
 * 测试 Internal LLM 的接口、认证、请求和响应流程
 *
 * 运行方式：
 * 1. 在终端运行: node test/test-internal-llm.js
 * 2. 或设置环境变量后运行: 
 *    export LLM_URL=https://your-llm.com/v1/messages
 *    export LLM_MODEL=claude-3-5-sonnet-20241022
 *    export SSO_URL=https://sso.dds.com/sercie-login
 *    export SSO_USER=your-username
 *    export SSO_PASSWORD=your-password
 *    node test/test-internal-llm.js
 */

const axios = require('axios');
const HttpsAgentFactory = require('../httpsAgent');
const SSOAuthManager = require('../ssoAuthManager');
const ConfigManager = require('../configManager');
const AiReviewer = require('../aiReviewer');

// 颜色输出
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    blue: '\x1b[34m'
};

function log(color, ...args) {
    console.log(color + args.join(' ') + colors.reset);
}

// Mock Context
const mockContext = {
    extensionUri: { fsPath: __dirname },
    globalStorageUri: { fsPath: __dirname }
};

// 测试配置 - 从环境变量或提示获取
const testConfig = {
    llmUrl: process.env.LLM_URL || 'https://your-llm-endpoint.com/v1/messages',
    llmModel: process.env.LLM_MODEL || 'claude-3-5-sonnet-20241022',
    ssoLoginUrl: process.env.SSO_URL || 'https://sso.dds.com/sercie-login',
    ssoUsername: process.env.SSO_USER || 'your-test-user',
    ssoPassword: process.env.SSO_PASSWORD || 'your-test-password',
    verifySsl: process.env.VERIFY_SSL !== 'true', // 默认禁用SSL验证
    timeout: parseInt(process.env.TIMEOUT || '60000')
};

async function testHttpsAgent() {
    log(colors.blue, '\n[TEST 1] HTTPS Agent 创建');
    log(colors.cyan, '========================================');
    
    try {
        const agent = HttpsAgentFactory.createAgent(testConfig.verifySsl, testConfig.timeout);
        
        if (!agent) {
            throw new Error('Agent创建失败');
        }
        
        log(colors.green, '✓ HTTPS Agent创建成功');
        log(colors.cyan, '  - keepAlive:', agent.keepAlive);
        log(colors.cyan, '  - timeout:', agent.timeout);
        log(colors.cyan, '  - rejectUnauthorized:', agent.rejectUnauthorized);
        return agent;
    } catch (error) {
        log(colors.red, '✗ HTTPS Agent创建失败:', error.message);
        throw error;
    }
}

async function testSSOAuthentication() {
    log(colors.blue, '\n[TEST 2] SSO 认证流程');
    log(colors.cyan, '========================================');
    
    try {
        // 初始化配置管理器
        log(colors.cyan, '初始化配置管理器...');
        const configManager = new ConfigManager(mockContext);
        await configManager.initialize();
        log(colors.green, '✓ 配置管理器初始化成功');
        
        // 保存SSO凭据
        log(colors.cyan, '保存SSO凭据...');
        await configManager.saveSSOConfig(
            testConfig.ssoUsername,
            testConfig.ssoPassword,
            testConfig.ssoLoginUrl
        );
        log(colors.green, '✓ SSO凭据保存成功');
        
        // 获取SSO凭据
        log(colors.cyan, '读取SSO凭据...');
        const credentials = await configManager.getSSOConfig();
        if (!credentials || !credentials.username) {
            throw new Error('SSO凭据读取失败');
        }
        log(colors.green, '✓ SSO凭据读取成功');
        log(colors.cyan, '  - 用户名:', credentials.username);
        
        // 初始化SSO认证管理器
        log(colors.cyan, '初始化SSO认证管理器...');
        const ssoAuthManager = new SSOAuthManager(mockContext);
        await ssoAuthManager.initialize();
        log(colors.green, '✓ SSO认证管理器初始化成功');
        
        // 获取token
        log(colors.cyan, '执行SSO登录获取Token...');
        const loginConfig = {
            ssoLoginUrl: testConfig.ssoLoginUrl,
            ssoUsername: testConfig.ssoUsername,
            ssoPassword: testConfig.ssoPassword
        };
        
        const token = await ssoAuthManager.getValidToken(loginConfig);
        if (!token) {
            throw new Error('未获取到有效Token');
        }
        
        log(colors.green, '✓ SSO认证成功');
        log(colors.cyan, '  - Token长度:', token.length);
        log(colors.cyan, '  - Token前缀:', token.substring(0, 30) + '...');
        
        return { ssoAuthManager, token };
    } catch (error) {
        log(colors.red, '✗ SSO认证失败:', error.message);
        throw error;
    }
}

async function testLLMConnectivity(agent, token) {
    log(colors.blue, '\n[TEST 3] LLM 连接性测试');
    log(colors.cyan, '========================================');
    
    try {
        log(colors.cyan, '准备简单请求测试连接...');
        log(colors.cyan, '  - 目标地址:', testConfig.llmUrl);
        log(colors.cyan, '  - 模型:', testConfig.llmModel);
        log(colors.cyan, '  - SSL验证:', testConfig.verifySsl ? '启用' : '禁用');
        
        const testPrompt = 'Say "hello" in one word.';
        
        const response = await axios.post(
            testConfig.llmUrl,
            {
                model: testConfig.llmModel,
                max_tokens: 100,
                messages: [
                    {
                        role: 'user',
                        content: testPrompt
                    }
                ]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'anthropic-version': '2023-06-01'
                },
                httpsAgent: agent,
                timeout: testConfig.timeout
            }
        );
        
        log(colors.green, '✓ LLM连接成功');
        log(colors.cyan, '  - 状态码:', response.status);
        log(colors.cyan, '  - 响应格式:', response.data.content ? 'Anthropic' : 'Unknown');
        
        // 解析响应
        let content = '';
        if (response.data.content && Array.isArray(response.data.content)) {
            content = response.data.content[0]?.text || '';
        } else if (response.data.choices) {
            content = response.data.choices[0]?.message?.content || '';
        }
        
        log(colors.cyan, '  - 响应内容:', content.substring(0, 100));
        
        return response;
    } catch (error) {
        log(colors.red, '✗ LLM连接失败:', error.message);
        if (error.response) {
            log(colors.red, '  - 状态码:', error.response.status);
            log(colors.red, '  - 错误信息:', JSON.stringify(error.response.data, null, 2));
        }
        throw error;
    }
}

async function testCodeReviewRequest(agent, token) {
    log(colors.blue, '\n[TEST 4] 代码审查请求');
    log(colors.cyan, '========================================');
    
    try {
        log(colors.cyan, '准备代码审查请求...');
        
        const testDiff = `diff --git a/utils.js b/utils.js
index 1234567..abcdefg 100644
--- a/utils.js
+++ b/utils.js
@@ -1,5 +1,15 @@
 function fetchData(url) {
-    return fetch(url).then(r => r.json());
+    // TODO: Add error handling
+    if (!url || typeof url !== 'string') {
+        throw new Error('Invalid URL');
+    }
+    return fetch(url)
+        .then(r => {
+            if (!r.ok) throw new Error(\`HTTP \${r.status}\`);
+            return r.json();
+        })
+        .catch(e => console.error('Fetch failed:', e));
 }`;

        const reviewPrompt = `You are a code review expert. Please analyze the following git diff and provide a structured code review with severity classification.

Organize your response with:
1. Overall Assessment
2. [CRITICAL] Issues (severity: critical)
3. [WARNING] Issues (severity: warning)  
4. [INFO] Suggestions (severity: info)

For each issue include a "How to fix" section.

Diff:
\`\`\`diff
${testDiff}
\`\`\``;

        log(colors.cyan, '  - Diff大小:', testDiff.length, '字符');
        log(colors.cyan, '  - 提示词长度:', reviewPrompt.length, '字符');
        
        const startTime = Date.now();
        
        const response = await axios.post(
            testConfig.llmUrl,
            {
                model: testConfig.llmModel,
                max_tokens: 2048,
                messages: [
                    {
                        role: 'user',
                        content: reviewPrompt
                    }
                ]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'anthropic-version': '2023-06-01'
                },
                httpsAgent: agent,
                timeout: testConfig.timeout
            }
        );
        
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        
        log(colors.green, '✓ 代码审查请求成功');
        log(colors.cyan, '  - 响应时间:', duration, '秒');
        log(colors.cyan, '  - 状态码:', response.status);
        
        // 解析审查结果
        let reviewContent = '';
        if (response.data.content && Array.isArray(response.data.content)) {
            reviewContent = response.data.content[0]?.text || '';
        } else if (response.data.choices) {
            reviewContent = response.data.choices[0]?.message?.content || '';
        }
        
        log(colors.cyan, '  - 审查结果长度:', reviewContent.length, '字符');
        log(colors.cyan, '  - 审查结果预览:');
        const preview = reviewContent.substring(0, 300).replace(/\n/g, '\n    ');
        log(colors.cyan, '    ' + preview + '...');
        
        return { response, reviewContent, duration };
    } catch (error) {
        log(colors.red, '✗ 代码审查请求失败:', error.message);
        if (error.response) {
            log(colors.red, '  - 状态码:', error.response.status);
            log(colors.red, '  - 错误:', JSON.stringify(error.response.data, null, 2));
        }
        throw error;
    }
}

async function testAiReviewerIntegration() {
    log(colors.blue, '\n[TEST 5] AiReviewer 集成测试');
    log(colors.cyan, '========================================');
    
    try {
        log(colors.cyan, '初始化AiReviewer...');
        const aiReviewer = new AiReviewer();
        log(colors.green, '✓ AiReviewer初始化成功');
        
        // 初始化配置
        log(colors.cyan, '初始化配置管理器...');
        const configManager = new ConfigManager(mockContext);
        await configManager.initialize();
        
        await configManager.saveSSOConfig(
            testConfig.ssoUsername,
            testConfig.ssoPassword,
            testConfig.ssoLoginUrl
        );
        
        log(colors.cyan, '准备审查请求...');
        const testDiff = `diff --git a/security.js b/security.js
index abc1234..def5678 100644
--- a/security.js
+++ b/security.js
@@ -1,3 +1,8 @@
 function validateInput(input) {
-    return input != null;
+    // Security check
+    if (typeof input !== 'string') {
+        return false;
+    }
+    return input.trim().length > 0;
 }`;

        const startTime = Date.now();
        
        const reviewResult = await aiReviewer.review(testDiff, {
            apiUrl: testConfig.llmUrl,
            apiKey: 'temp-key', // 不需要，会使用SSO token
            model: testConfig.llmModel,
            targetBranch: 'main',
            currentBranch: 'feature/security',
            config: {
                'llm.enableInternal': true,
                'llm.url': testConfig.llmUrl,
                'llm.model': testConfig.llmModel,
                'llm.verifySsl': testConfig.verifySsl,
                'sso.loginUrl': testConfig.ssoLoginUrl,
                'sso.username': testConfig.ssoUsername,
                'sso.password': testConfig.ssoPassword
            },
            context: mockContext
        });
        
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        
        log(colors.green, '✓ AiReviewer集成测试成功');
        log(colors.cyan, '  - 响应时间:', duration, '秒');
        log(colors.cyan, '  - 审查成功:', reviewResult.success);
        log(colors.cyan, '  - 使用模型:', reviewResult.metadata.model);
        log(colors.cyan, '  - 审查结果长度:', reviewResult.review.length, '字符');
        
        return reviewResult;
    } catch (error) {
        log(colors.red, '✗ AiReviewer集成测试失败:', error.message);
        throw error;
    }
}

async function runAllTests() {
    log(colors.bright + colors.blue, '╔════════════════════════════════════════╗');
    log(colors.bright + colors.blue, '║  Internal LLM 完整测试套件             ║');
    log(colors.bright + colors.blue, '╚════════════════════════════════════════╝');
    
    log(colors.yellow, '\n📋 测试配置信息:');
    log(colors.cyan, '  LLM地址:     ', testConfig.llmUrl);
    log(colors.cyan, '  LLM模型:     ', testConfig.llmModel);
    log(colors.cyan, '  SSO地址:     ', testConfig.ssoLoginUrl);
    log(colors.cyan, '  SSL验证:     ', testConfig.verifySsl ? '启用' : '禁用');
    log(colors.cyan, '  请求超时:    ', testConfig.timeout, 'ms');
    
    let testResults = {
        total: 0,
        passed: 0,
        failed: 0,
        errors: []
    };
    
    const tests = [
        { name: 'HTTPS Agent', fn: testHttpsAgent },
        { name: 'SSO认证', fn: testSSOAuthentication },
        { name: 'LLM连接', fn: testLLMConnectivity },
        { name: '代码审查请求', fn: testCodeReviewRequest },
        { name: 'AiReviewer集成', fn: testAiReviewerIntegration }
    ];
    
    let previousResults = {};
    
    for (const test of tests) {
        testResults.total++;
        
        try {
            if (test.name === 'LLM连接') {
                const agent = previousResults.httpsAgent;
                const { token } = previousResults.ssoAuth;
                await test.fn(agent, token);
            } else if (test.name === '代码审查请求') {
                const agent = previousResults.httpsAgent;
                const { token } = previousResults.ssoAuth;
                previousResults.codeReview = await test.fn(agent, token);
            } else {
                previousResults[test.name.replace(/[^a-zA-Z0-9]/g, '')] = await test.fn();
            }
            
            testResults.passed++;
        } catch (error) {
            testResults.failed++;
            testResults.errors.push({
                test: test.name,
                error: error.message
            });
        }
    }
    
    // 汇总报告
    log(colors.bright + colors.blue, '\n╔════════════════════════════════════════╗');
    log(colors.bright + colors.blue, '║  测试汇总报告                           ║');
    log(colors.bright + colors.blue, '╚════════════════════════════════════════╝');
    
    log(colors.cyan, '\n总计:  ', testResults.total, '个测试');
    log(colors.green, '通过:  ', testResults.passed, '个');
    
    if (testResults.failed > 0) {
        log(colors.red, '失败:  ', testResults.failed, '个');
        log(colors.red, '\n失败详情:');
        testResults.errors.forEach(err => {
            log(colors.red, '  ✗', err.test + ':', err.error);
        });
    }
    
    // 建议
    log(colors.yellow, '\n💡 测试建议:');
    if (testResults.failed === 0) {
        log(colors.green, '✓ 所有测试通过！Internal LLM 配置正确。');
    } else {
        log(colors.yellow, '✓ 部分测试失败。请检查:');
        log(colors.cyan, '  1. LLM服务是否正常运行');
        log(colors.cyan, '  2. SSO凭据是否正确');
        log(colors.cyan, '  3. 网络连接是否正常');
        log(colors.cyan, '  4. SSL证书是否有效');
        log(colors.cyan, '  5. 防火墙设置是否正确');
    }
    
    log(colors.cyan, '\n📁 日志文件位置: .ada_plugin/logs/');
    log(colors.cyan, '🔧 配置文件位置: .ada_plugin/config.json');
    
    log(colors.bright + colors.blue, '\n✅ 测试完成！\n');
    
    return testResults.failed === 0 ? 0 : 1;
}

// 主函数
async function main() {
    try {
        const exitCode = await runAllTests();
        process.exit(exitCode);
    } catch (error) {
        log(colors.red, '测试脚本意外终止:', error.message);
        process.exit(1);
    }
}

// 运行测试
main();
