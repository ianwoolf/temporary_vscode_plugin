const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

/**
 * 配置管理器
 * 负责管理 .ada_plugin 目录下的配置文件
 */
class ConfigManager {
    constructor(context) {
        this.context = context;
        this.workspacePath = context?.extensionUri?.fsPath ||
            context?.globalStorageUri?.fsPath ||
            __dirname;

        // .ada_plugin 目录路径
        this.adaPluginDir = path.join(this.workspacePath, '.ada_plugin');
        this.configFile = path.join(this.adaPluginDir, 'config.json');
        this.cacheDir = path.join(this.adaPluginDir, 'cache');
        this.logsDir = path.join(this.adaPluginDir, 'logs');

        this.tokenCacheFile = path.join(this.cacheDir, 'token.json');
        this.sessionCacheFile = path.join(this.cacheDir, 'session.json');
        this.errorLogFile = path.join(this.logsDir, 'error.log');
    }

    /**
     * 初始化配置目录和文件
     */
    async initialize() {
        try {
            // 确保目录存在
            await fs.mkdir(this.cacheDir, { recursive: true });
            await fs.mkdir(this.logsDir, { recursive: true });

            // 如果config.json不存在，创建默认配置
            try {
                await fs.access(this.configFile);
            } catch {
                await this.saveConfig({});
            }

            // 初始化token缓存文件
            try {
                await fs.access(this.tokenCacheFile);
            } catch {
                await this.saveTokenCache({});
            }

            console.log('ConfigManager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize ConfigManager:', error);
            throw error;
        }
    }

    /**
     * 读取配置文件
     * @returns {Promise<Object>} - 配置对象
     */
    async readConfig() {
        try {
            const data = await fs.readFile(this.configFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                return {}; // 文件不存在，返回空配置
            }
            throw error;
        }
    }

    /**
     * 保存配置文件
     * @param {Object} config - 配置对象
     */
    async saveConfig(config) {
        try {
            await fs.writeFile(
                this.configFile,
                JSON.stringify(config, null, 2),
                'utf8'
            );
        } catch (error) {
            console.error('Failed to save config:', error);
            throw error;
        }
    }

    /**
     * 获取SSO配置
     * @returns {Promise<Object>} - SSO配置对象
     */
    async getSSOConfig() {
        const config = await this.readConfig();
        return {
            userid: config.ssoUsername || '',
            password: config.ssoPassword || '',
            loginUrl: config.ssoLoginUrl || 'https://sso.dds.com/sercie-login'
        };
    }

    /**
     * 保存SSO配置
     * @param {string} userid - 用户名
     * @param {string} password - 密码（会加密存储）
     * @param {string} loginUrl - 登录URL
     */
    async saveSSOConfig(userid, password, loginUrl = 'https://dds.com/sercie-login') {
        const config = await this.readConfig();
        config.ssoUsername = userid;
        config.ssoPassword = this.encrypt(password); // 加密存储密码
        config.ssoLoginUrl = loginUrl;
        config.updatedAt = new Date().toISOString();

        await this.saveConfig(config);
    }

    /**
     * 读取token缓存
     * @returns {Promise<Object>} - token缓存对象
     */
    async readTokenCache() {
        try {
            const data = await fs.readFile(this.tokenCacheFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            return { token: '', expiry: 0 };
        }
    }

    /**
     * 保存token缓存
     * @param {string} token - token字符串
     * @param {number} expiry - 过期时间戳
     */
    async saveTokenCache(token, expiry = 0) {
        try {
            const cacheData = {
                token: token,
                expiry: expiry,
                updatedAt: new Date().toISOString()
            };
            await fs.writeFile(
                this.tokenCacheFile,
                JSON.stringify(cacheData, null, 2),
                'utf8'
            );
        } catch (error) {
            console.error('Failed to save token cache:', error);
            throw error;
        }
    }

    /**
     * 清除token缓存
     */
    async clearTokenCache() {
        await this.saveTokenCache('', 0);
    }

    /**
     * 简单加密（用于密码存储）
     * 注意：这只是基础加密，生产环境应使用更安全的方案
     * @param {string} text - 要加密的文本
     * @returns {string} - 加密后的文本
     */
    encrypt(text) {
        if (!text) return '';
        const algorithm = 'aes-256-cbc';
        const key = crypto.scryptSync('ada-plugin-secret', 'salt', 32);
        const iv = crypto.randomBytes(16);

        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        return iv.toString('hex') + ':' + encrypted;
    }

    /**
     * 解密
     * @param {string} encryptedText - 加密的文本
     * @returns {string} - 解密后的文本
     */
    decrypt(encryptedText) {
        if (!encryptedText) return '';

        try {
            const algorithm = 'aes-256-cbc';
            const key = crypto.scryptSync('ada-plugin-secret', 'salt', 32);

            const parts = encryptedText.split(':');
            const iv = Buffer.from(parts[0], 'hex');
            const encrypted = parts[1];

            const decipher = crypto.createDecipheriv(algorithm, key, iv);
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        } catch (error) {
            console.error('Decryption failed:', error);
            return ''; // 解密失败返回空字符串
        }
    }

    /**
     * 获取解密后的密码
     * @returns {Promise<string>} - 解密后的密码
     */
    async getPassword() {
        const config = await this.readConfig();
        return this.decrypt(config.ssoPassword || '');
    }

    /**
     * 记录错误日志
     * @param {string} message - 错误信息
     * @param {Error} error - 错误对象
     */
    async logError(message, error) {
        try {
            const timestamp = new Date().toISOString();
            const logMessage = `[${timestamp}] ${message}\n${error.stack}\n\n`;

            await fs.appendFile(this.errorLogFile, logMessage, 'utf8');
        } catch (logError) {
            console.error('Failed to write error log:', logError);
        }
    }

    /**
     * 清理所有缓存和配置（用于登出）
     */
    async clearAll() {
        try {
            await this.clearTokenCache();
            const config = await this.readConfig();
            delete config.ssoUsername;
            delete config.ssoPassword;
            await this.saveConfig(config);
        } catch (error) {
            console.error('Failed to clear all data:', error);
            throw error;
        }
    }
}

module.exports = ConfigManager;