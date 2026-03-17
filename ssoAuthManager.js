const axios = require('axios');
const HttpsAgentFactory = require('./httpsAgent');
const ConfigManager = require('./configManager');

/**
 * SSO认证管理器
 * 负责SSO登录、token获取和缓存管理
 */
class SSOAuthManager {
    constructor(context) {
        this.context = context;
        this.configManager = new ConfigManager(context);
        this.tokenCache = null;
        this.cacheExpiry = 0;
        this.defaultCacheDuration = 3600 * 1000; // 1小时（毫秒）
    }

    /**
     * 初始化SSO认证管理器
     */
    async initialize() {
        await this.configManager.initialize();
        await this.loadTokenFromCache();
    }

    /**
     * 从缓存加载token
     */
    async loadTokenFromCache() {
        try {
            const cacheData = await this.configManager.readTokenCache();
            this.tokenCache = cacheData.token;
            this.cacheExpiry = cacheData.expiry || 0;

            // 检查token是否过期
            if (this.isTokenExpired()) {
                console.log('Token expired, clearing cache');
                await this.clearToken();
            }
        } catch (error) {
            console.error('Failed to load token from cache:', error);
            this.tokenCache = null;
            this.cacheExpiry = 0;
        }
    }

    /**
     * 检查token是否过期
     * @returns {boolean} - 是否过期
     */
    isTokenExpired() {
        if (!this.tokenCache) return true;
        const now = Date.now();
        return now >= this.cacheExpiry;
    }

    /**
     * 获取有效的token（自动处理过期）
     * @param {Object} config - VSCode配置对象
     * @returns {Promise<string>} - 有效的token
     */
    async getValidToken(config) {
        // 首先检查内存中的缓存
        if (!this.isTokenExpired() && this.tokenCache) {
            console.log('Using cached token');
            return this.tokenCache;
        }

        // 如果缓存过期，尝试执行SSO登录
        console.log('Token expired or missing, performing SSO login');
        return await this.performSSOLogin(config);
    }

    /**
     * 执行SSO登录
     * @param {Object} vscodeConfig - VSCode配置对象
     * @returns {Promise<string>} - 获取的token
     */
    async performSSOLogin(vscodeConfig) {
        try {
            // 获取SSO配置
            const ssoConfig = await this.configManager.getSSOConfig();
            const password = await this.configManager.getPassword();

            // 优先使用配置文件中的凭据，如果没有则使用VSCode配置
            const userid = ssoConfig.userid || vscodeConfig?.['sso.username'] || '';
            const userPassword = password || vscodeConfig?.['sso.password'] || '';
            const loginUrl = ssoConfig.loginUrl || vscodeConfig?.['sso.loginUrl'] || 'https://sso.dds.com/sercie-login';

            // 验证必要参数
            if (!userid || !userPassword) {
                throw new Error('SSO username or password missing. Please configure in settings.');
            }

            console.log(`Attempting SSO login for user: ${userid}`);

            // 构建请求数据
            const requestData = {
                userid: userid,
                password: userPassword
            };

            // 创建禁用SSL验证的https agent
            const httpsAgent = HttpsAgentFactory.createAgent(true, 30000);

            // 发送登录请求
            const response = await axios.post(loginUrl, requestData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                httpsAgent: httpsAgent,
                timeout: 30000
            });

            // 解析响应获取token
            let token = '';
            if (response.data) {
                // 尝试不同的响应格式
                token = response.data.token ||
                    response.data.access_token ||
                    response.data.authenticationToken ||
                    response.data.Token ||
                    (typeof response.data === 'string' ? response.data : '');
            }

            if (!token) {
                throw new Error('No token found in SSO response. Response: ' + JSON.stringify(response.data));
            }

            // 计算过期时间（默认1小时后）
            const expiryTime = Date.now() + this.defaultCacheDuration;

            // 更新缓存
            this.tokenCache = token;
            this.cacheExpiry = expiryTime;

            // 保存到文件
            await this.configManager.saveTokenCache(token, expiryTime);

            console.log('SSO login successful, token cached');

            return token;

        } catch (error) {
            // 记录错误日志
            await this.configManager.logError('SSO login failed', error);

            // 提供详细的错误信息
            let errorMessage = 'SSO login failed';

            if (error.response) {
                const status = error.response.status;
                const data = error.response.data;

                if (status === 401) {
                    errorMessage = 'SSO authentication failed: Invalid username or password';
                } else if (status === 403) {
                    errorMessage = 'SSO authentication failed: Access forbidden';
                } else if (status === 404) {
                    errorMessage = 'SSO login endpoint not found. Please check the URL configuration';
                } else {
                    errorMessage = `SSO login failed: HTTP ${status} - ${JSON.stringify(data)}`;
                }
            } else if (error.request) {
                errorMessage = 'SSO login failed: No response from server. Please check network connection';
            } else {
                errorMessage = `SSO login failed: ${error.message}`;
            }

            console.error(errorMessage, error);
            throw new Error(errorMessage);
        }
    }

    /**
     * 清除缓存的token
     */
    async clearToken() {
        this.tokenCache = null;
        this.cacheExpiry = 0;
        await this.configManager.clearTokenCache();
    }

    /**
     * 强制刷新token（忽略缓存）
     * @param {Object} config - VSCode配置对象
     * @returns {Promise<string>} - 新的token
     */
    async forceRefreshToken(config) {
        await this.clearToken();
        return await this.performSSOLogin(config);
    }

    /**
     * 保存SSO配置（用于用户首次设置）
     * @param {string} userid - 用户名
     * @param {string} password - 密码
     * @param {string} loginUrl - 登录URL
     */
    async saveSSOCredentials(userid, password, loginUrl = 'https://sso.dds.com/sercie-login') {
        await this.configManager.saveSSOConfig(userid, password, loginUrl);
    }

    /**
     * 登出（清除所有凭据和缓存）
     */
    async logout() {
        await this.clearToken();
        await this.configManager.clearAll();
        console.log('SSO logout completed');
    }

    /**
     * 获取token信息（用于调试）
     * @returns {Promise<Object>} - token信息
     */
    async getTokenInfo() {
        return {
            hasToken: !!this.tokenCache,
            isExpired: this.isTokenExpired(),
            expiryTime: this.cacheExpiry > 0 ? new Date(this.cacheExpiry).toISOString() : 'N/A',
            remainingTime: this.cacheExpiry > 0 ? Math.max(0, this.cacheExpiry - Date.now()) : 0
        };
    }
}

module.exports = SSOAuthManager;