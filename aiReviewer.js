const axios = require('axios');
const crypto = require('crypto');

class AiReviewer {
    constructor() {
        this.defaultPrompt = `你是一个代码审查专家。请分析以下 git diff，并提供：
1. 整体评估（简要总结）
2. 潜在问题（bug、安全、性能）
3. 改进建议
4. 最佳实践违规
5. 积极亮点（发现的良好实践）

请简洁明了，使用 markdown 格式。`;
    }

    // 生成智谱AI的JWT token
    generateZhipuToken(apiKey) {
        try {
            const [id, secret] = apiKey.split('.');

            if (!id || !secret) {
                throw new Error('Invalid API key format');
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

            const headerEncoded = this.base64UrlEncode(JSON.stringify(header));
            const payloadEncoded = this.base64UrlEncode(JSON.stringify(payload));

            const signature = crypto
                .createHmac('sha256', secret)
                .update(`${headerEncoded}.${payloadEncoded}`)
                .digest('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=/g, '');

            return `${headerEncoded}.${payloadEncoded}.${signature}`;
        } catch (error) {
            console.error('Error generating token:', error);
            // 如果token生成失败，直接返回原始API key
            return apiKey;
        }
    }

    base64UrlEncode(str) {
        return Buffer.from(str)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }

    async review(diff, options) {
        const { apiUrl, apiKey, model, targetBranch, currentBranch } = options;

        if (!diff || diff.trim().length === 0) {
            throw new Error('No diff content to review');
        }

        const prompt = `${this.defaultPrompt}

分支: ${currentBranch} → ${targetBranch}

Diff:
\`\`\`diff
${diff}
\`\`\`
`;

        try {
            // 检测是否是智谱AI
            const isZhipuAI = apiUrl.includes('bigmodel.cn') || model.toLowerCase().includes('glm');

            let requestData, requestHeaders, response;

            if (isZhipuAI) {
                // 智谱AI的请求格式
                const token = this.generateZhipuToken(apiKey);

                // 修正智谱AI的API端点
                let correctedUrl = apiUrl;
                if (apiUrl.includes('/api/anthropic')) {
                    correctedUrl = apiUrl.replace('/api/anthropic', '/api/paas/v4/chat/completions');
                } else if (!apiUrl.includes('/chat/completions')) {
                    correctedUrl = apiUrl + '/api/paas/v4/chat/completions';
                }

                requestData = {
                    model: model || 'GLM-4.7',
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    top_p: 0.9,
                    max_tokens: 4096,
                    stream: false
                };

                requestHeaders = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                };

                response = await axios.post(correctedUrl, requestData, {
                    headers: requestHeaders,
                    timeout: 120000 // 120 seconds for智谱AI
                });
            } else {
                // Claude API 或其他兼容格式
                requestData = {
                    model: model,
                    max_tokens: 4096,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ]
                };

                requestHeaders = {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                };

                response = await axios.post(apiUrl, requestData, {
                    headers: requestHeaders,
                    timeout: 60000
                });
            }

            // 处理不同的API响应格式
            let reviewText = '';

            if (isZhipuAI) {
                // 智谱AI的响应格式: { choices: [{ message: { content: "..." } }] }
                reviewText = response.data.choices?.[0]?.message?.content || '';
            } else if (response.data.content) {
                // Claude API格式
                reviewText = response.data.content[0]?.text || response.data.content;
            } else if (response.data.choices) {
                // OpenAI格式
                reviewText = response.data.choices[0]?.message?.content || '';
            } else if (response.data.message) {
                reviewText = response.data.message;
            } else {
                reviewText = JSON.stringify(response.data, null, 2);
            }

            if (!reviewText) {
                throw new Error('Empty response from AI API');
            }

            return {
                success: true,
                review: reviewText,
                metadata: {
                    model: model,
                    targetBranch: targetBranch,
                    currentBranch: currentBranch,
                    diffSize: diff.length,
                    timestamp: new Date().toISOString()
                }
            };

        } catch (error) {
            if (error.response) {
                const errorMsg = `AI API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
                console.error('API Error Details:', error.response.data);
                throw new Error(errorMsg);
            } else if (error.request) {
                throw new Error('AI API request failed: No response received');
            } else {
                throw new Error('AI API request failed: ' + error.message);
            }
        }
    }
}

module.exports = AiReviewer;
