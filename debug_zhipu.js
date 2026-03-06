const axios = require('axios');
const crypto = require('crypto');

// 从VSCode配置读取API信息
const API_KEY = 'your Key'; // 请替换为你的实际API Key
const MODEL = 'GLM-5';
const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

// 生成智谱AI的JWT token
function generateZhipuToken(apiKey) {
    try {
        console.log('📝 API Key format check...');
        const parts = apiKey.split('.');
        console.log('✓ API Key parts:', parts.length);

        const [id, secret] = parts;
        console.log('✓ API ID:', id.substring(0, 10) + '...');
        console.log('✓ API Secret exists:', !!secret);

        if (!id || !secret) {
            throw new Error('Invalid API key format. Expected: id.secret');
        }

        const now = Date.now();
        const timestamp = now;
        const exp = now + 3600 * 1000; // 1小时过期

        const header = {
            alg: 'HS256',
            sign_type: 'SIGN'
        };

        const payload = {
            api_key: id,
            exp: exp,
            timestamp: timestamp
        };

        const headerEncoded = base64UrlEncode(JSON.stringify(header));
        const payloadEncoded = base64UrlEncode(JSON.stringify(payload));

        const signature = crypto
            .createHmac('sha256', secret)
            .update(`${headerEncoded}.${payloadEncoded}`)
            .digest('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');

        const token = `${headerEncoded}.${payloadEncoded}.${signature}`;
        console.log('✓ JWT Token generated successfully');
        console.log('✓ Token preview:', token.substring(0, 50) + '...');

        return token;
    } catch (error) {
        console.error('❌ Token generation error:', error.message);
        throw error;
    }
}

function base64UrlEncode(str) {
    return Buffer.from(str)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

async function testZhipuAI() {
    console.log('🚀 Testing Zhipu AI API');
    console.log('='.repeat(60));

    try {
        // Step 1: Generate token
        console.log('\n1️⃣ Generating JWT token...');
        const token = generateZhipuToken(API_KEY);

        // Step 2: Prepare request
        console.log('\n2️⃣ Preparing request...');
        const requestData = {
            model: MODEL,
            messages: [
                {
                    role: 'user',
                    content: '你好，请用一句话介绍你自己。'
                }
            ],
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 100,
            stream: false
        };
        console.log('✓ Request data prepared');
        console.log('✓ Model:', MODEL);
        console.log('✓ Message length:', requestData.messages[0].content.length);

        // Step 3: Make API call
        console.log('\n3️⃣ Calling API...');
        console.log('✓ URL:', API_URL);

        const response = await axios.post(API_URL, requestData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            timeout: 30000
        });

        console.log('\n✅ SUCCESS!');
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(response.data, null, 2));

        if (response.data.choices && response.data.choices[0]) {
            console.log('\n📝 AI Response:', response.data.choices[0].message.content);
        }

    } catch (error) {
        console.log('\n❌ ERROR!');

        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Error Data:', JSON.stringify(error.response.data, null, 2));
            console.log('Headers:', JSON.stringify(error.response.config.headers, null, 2));

            // 分析错误
            console.log('\n🔍 Error Analysis:');
            if (error.response.data?.error?.code === '1302') {
                console.log('⚠️  Rate Limit Error (1302)');
                console.log('Possible causes:');
                console.log('  1. API Key is invalid or expired');
                console.log('  2. Too many requests in a short time');
                console.log('  3. Free tier quota exceeded');
                console.log('  4. Token generation issue');
                console.log('\n💡 Solutions:');
                console.log('  - Check your API Key at: https://open.bigmodel.cn/usercenter/apikeys');
                console.log('  - Wait a few minutes and try again');
                console.log('  - Check your quota usage');
            } else if (error.response.data?.error?.code === '1301') {
                console.log('⚠️  Authentication Error (1301)');
                console.log('Possible causes:');
                console.log('  - Invalid API Key');
                console.log('  - Token generation failed');
            }
        } else if (error.request) {
            console.log('No response received');
            console.log('Request was sent but no response');
        } else {
            console.log('Request setup error:', error.message);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('Debug complete!');
}

// 运行测试
console.log('⚠️  Please update API_KEY in this file before running!');
console.log('⚠️  Replace "你的智谱AI API Key" with your actual key\n');

// 检查是否已设置API Key
if (API_KEY.includes('你的智谱AI API Key') || API_KEY === '') {
    console.log('❌ ERROR: Please set your API Key first!');
    console.log('\nHow to get your API Key:');
    console.log('1. Visit: https://open.bigmodel.cn/usercenter/apikeys');
    console.log('2. Create or copy your API Key');
    console.log('3. Update API_KEY in this file');
    console.log('4. Run: node debug_zhipu.js\n');
} else {
    testZhipuAI();
}
