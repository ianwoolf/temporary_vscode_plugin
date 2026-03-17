const https = require('https');
const http = require('http');

/**
 * HTTPS Agent Factory
 * 用于创建禁用SSL证书校验的HTTPS代理
 */
class HttpsAgentFactory {
    /**
     * 创建HTTPS Agent
     * @param {boolean} disableSSL - 是否禁用SSL证书校验
     * @param {number} timeout - 超时时间（毫秒）
     * @returns {https.Agent | undefined} - HTTPS Agent实例
     */
    static createAgent(disableSSL = true, timeout = 60000) {
        if (disableSSL) {
            return new https.Agent({
                rejectUnauthorized: false, // 禁用SSL证书验证
                timeout: timeout
            });
        }
        return undefined; // 使用默认Agent
    }

    /**
     * 创建HTTP Agent（用于非HTTPS请求）
     * @param {number} timeout - 超时时间（毫秒）
     * @returns {http.Agent} - HTTP Agent实例
     */
    static createHttpAgent(timeout = 60000) {
        return new http.Agent({
            timeout: timeout
        });
    }

    /**
     * 根据URL自动创建Agent
     * @param {string} url - 目标URL
     * @param {boolean} disableSSL - 是否禁用SSL证书校验
     * @param {number} timeout - 超时时间（毫秒）
     * @returns {http.Agent | https.Agent | undefined} - Agent实例
     */
    static createAgentForUrl(url, disableSSL = true, timeout = 60000) {
        if (url.startsWith('https://')) {
            return this.createAgent(disableSSL, timeout);
        } else if (url.startsWith('http://')) {
            return this.createHttpAgent(timeout);
        }
        return undefined;
    }
}

module.exports = HttpsAgentFactory;