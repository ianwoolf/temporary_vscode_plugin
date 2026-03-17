const axios = require('axios');
const crypto = require('crypto');
const HttpsAgentFactory = require('./httpsAgent');
const SSOAuthManager = require('./ssoAuthManager');

class AiReviewer {
    constructor() {
        this.defaultPrompt = `You are a code review expert. Please analyze the following git diff and provide:
1. Overall Assessment (Brief summary)
2. Potential Issues (bugs, security, performance)
3. Suggestions for Improvements
4. Best Practices Violations
5. Positive Highlights (good practices found)

Please be concise and specific. Format your response in markdown.`;
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
        const { apiUrl, apiKey, model, targetBranch, currentBranch, config, context } = options;

        if (!diff || diff.trim().length === 0) {
            throw new Error('No diff content to review');
        }

        const prompt = `${this.defaultPrompt}

Branch: ${currentBranch} → ${targetBranch}

Diff:
\`\`\`diff
${diff}
\`\`\`
`;

        try {
            // 检测是否是内部LLM
            const enableInternalLLM = config?.enableInternalLLM || false;
            const isInternalLLM = enableInternalLLM && (apiUrl.includes('dds.com') || apiUrl.includes('internal') || config?.internalLLMUrl);

            if (isInternalLLM) {
                return await this.reviewWithInternalLLM(diff, options, prompt);
            }

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

    /**
     * 使用内部LLM进行代码审查
     * @param {string} diff - 代码差异内容
     * @param {Object} options - 配置选项
     * @param {string} prompt - 审查提示词
     * @returns {Promise<Object>} - 审查结果
     */
    async reviewWithInternalLLM(diff, options, prompt) {
        const { config, context, targetBranch, currentBranch } = options;
        const maxRetries = 1; // 最大重试次数
        let retryCount = 0;

        const attemptReview = async () => {
            try {
                // 1. 初始化SSO认证管理器
                const ssoAuthManager = new SSOAuthManager(context);
                await ssoAuthManager.initialize();

                // 2. 获取有效的token
                const token = await ssoAuthManager.getValidToken(config);

                // 3. 获取内部LLM配置
                const internalLLMUrl = config.internalLLMUrl || options.apiUrl;
                const internalLLMModel = config.internalLLMModel || options.model || 'claude-3-5-sonnet-20241022';
                const disableSSL = config.disableSSLVerification !== false; // 默认禁用SSL验证

                console.log(`Using internal LLM: ${internalLLMUrl}`);
                console.log(`Model: ${internalLLMModel}`);
                console.log(`SSL verification: ${disableSSL ? 'disabled' : 'enabled'}`);
                if (retryCount > 0) {
                    console.log(`Retry attempt ${retryCount}/${maxRetries}`);
                }

                // 4. 创建HTTPS Agent（禁用SSL验证）
                const httpsAgent = HttpsAgentFactory.createAgent(disableSSL, 120000);

                // 5. 构建请求数据（Anthropic格式）
                const requestData = {
                    model: internalLLMModel,
                    max_tokens: 4096,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ]
                };

                // 6. 构建请求头
                const requestHeaders = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'anthropic-version': '2023-06-01'
                };

                // 7. 发送请求
                const response = await axios.post(internalLLMUrl, requestData, {
                    headers: requestHeaders,
                    httpsAgent: httpsAgent,
                    timeout: 120000 // 120秒超时
                });

                // 8. 处理响应（兼容多种格式）
                let reviewText = '';

                if (response.data.content) {
                    // Claude/Anthropic格式: { content: [{ text: "..." }] }
                    if (Array.isArray(response.data.content)) {
                        reviewText = response.data.content[0]?.text || '';
                    } else {
                        reviewText = response.data.content;
                    }
                } else if (response.data.choices) {
                    // OpenAI格式: { choices: [{ message: { content: "..." } }] }
                    reviewText = response.data.choices[0]?.message?.content || '';
                } else if (response.data.message) {
                    // 简单格式: { message: "..." }
                    reviewText = response.data.message;
                } else if (typeof response.data === 'string') {
                    // 纯文本响应
                    reviewText = response.data;
                } else {
                    // 其他情况，尝试转换为JSON字符串
                    reviewText = JSON.stringify(response.data, null, 2);
                }

                if (!reviewText) {
                    throw new Error('Empty response from internal LLM API');
                }

                console.log('Internal LLM review completed successfully');

                return {
                    success: true,
                    review: reviewText,
                    metadata: {
                        model: internalLLMModel,
                        targetBranch: targetBranch,
                        currentBranch: currentBranch,
                        diffSize: diff.length,
                        timestamp: new Date().toISOString(),
                        service: 'internal-llm',
                        retried: retryCount > 0
                    }
                };

            } catch (error) {
                // 错误处理
                if (error.response) {
                    const status = error.response.status;

                    // 处理401/403认证错误 - 自动重新登录并重试
                    if ((status === 401 || status === 403) && retryCount < maxRetries) {
                        console.log(`Authentication failed (HTTP ${status}), attempting re-login...`);

                        try {
                            // 清除旧token
                            const ssoAuthManager = new SSOAuthManager(context);
                            await ssoAuthManager.clearToken();

                            // 强制刷新token
                            await ssoAuthManager.forceRefreshToken(config);
                            console.log('Token refreshed successfully');

                            // 增加重试计数并重试
                            retryCount++;
                            return await attemptReview();

                        } catch (refreshError) {
                            console.error('Failed to refresh token:', refreshError);
                            throw new Error(`Authentication failed and token refresh failed: ${refreshError.message}`);
                        }
                    }

                    // 其他错误处理
                    let errorMessage = `Internal LLM API Error: ${status}`;
                    if (status === 401 || status === 403) {
                        errorMessage = 'Authentication failed: Token expired and refresh failed. Please check your credentials.';
                    } else if (status === 404) {
                        errorMessage = 'Internal LLM endpoint not found. Please check the URL configuration.';
                    } else {
                        errorMessage += ` - ${JSON.stringify(error.response.data)}`;
                    }

                    console.error('API Error Details:', error.response.data);
                    throw new Error(errorMessage);

                } else if (error.request) {
                    throw new Error('Internal LLM request failed: No response received. Please check network connection.');
                } else {
                    throw new Error(`Internal LLM request failed: ${error.message}`);
                }
            }
        };

        // 开始尝试审查
        return await attemptReview();
    }
}

module.exports = AiReviewer;
