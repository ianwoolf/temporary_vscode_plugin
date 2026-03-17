#!/usr/bin/env node

/**
 * Git Diff AI Reviewer - 测试命令行工具
 *
 * 功能：
 * - 快速诊断 Internal LLM 配置
 * - 执行各种测试
 * - 显示系统信息
 *
 * 使用方法：
 *   node test/cli.js [命令] [选项]
 *
 * 命令列表：
 *   test:llm              - 测试 Internal LLM 接口
 *   test:sso              - 测试 SSO 认证
 *   test:quick            - 快速诊断
 *   test:all              - 运行所有测试
 *   config:show           - 显示配置
 *   config:set <key> <value> - 设置配置
 *   logs:tail             - 显示最新日志
 *   help                  - 显示帮助信息
 */

const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

// 颜色输出
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    blue: '\x1b[34m',
    gray: '\x1b[90m'
};

function log(color, ...args) {
    console.log(color + args.join(' ') + colors.reset);
}

function emphasize(text) {
    return colors.bright + colors.cyan + text + colors.reset;
}

async function loadConfig() {
    try {
        const configPath = path.join(process.cwd(), '.ada_plugin', 'config.json');
        const content = await fs.readFile(configPath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        return {};
    }
}

async function saveConfig(config) {
    try {
        const dir = path.join(process.cwd(), '.ada_plugin');
        await fs.mkdir(dir, { recursive: true });
        const configPath = path.join(dir, 'config.json');
        await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    } catch (error) {
        log(colors.red, '❌ 保存配置失败:', error.message);
    }
}

async function showHelp() {
    log(colors.bright + colors.blue, '\n╔════════════════════════════════════════════════════════╗');
    log(colors.bright + colors.blue, '║  Git Diff AI Reviewer - 测试工具                        ║');
    log(colors.bright + colors.blue, '╚════════════════════════════════════════════════════════╝\n');

    log(colors.yellow, '📋 可用命令:\n');

    const commands = [
        {
            cmd: 'test:llm',
            desc: '测试 Internal LLM 接口',
            usage: 'node test/cli.js test:llm'
        },
        {
            cmd: 'test:sso',
            desc: '测试 SSO 认证',
            usage: 'node test/cli.js test:sso'
        },
        {
            cmd: 'test:quick',
            desc: '快速诊断所有配置',
            usage: 'node test/cli.js test:quick'
        },
        {
            cmd: 'test:all',
            desc: '运行完整测试套件',
            usage: 'node test/cli.js test:all'
        },
        {
            cmd: 'config:show',
            desc: '显示当前配置',
            usage: 'node test/cli.js config:show'
        },
        {
            cmd: 'config:set',
            desc: '设置配置值',
            usage: 'node test/cli.js config:set llm.url https://llm.example.com/v1/messages'
        },
        {
            cmd: 'logs:tail',
            desc: '显示最新日志',
            usage: 'node test/cli.js logs:tail [行数]'
        },
        {
            cmd: 'help',
            desc: '显示此帮助信息',
            usage: 'node test/cli.js help'
        }
    ];

    commands.forEach(cmd => {
        log(colors.cyan, `  ${cmd.cmd}`);
        log(colors.gray, `    ${cmd.desc}`);
        log(colors.gray, `    $> ${cmd.usage}\n`);
    });

    log(colors.yellow, '🔧 环境变量:\n');
    log(colors.gray, '  LLM_URL          - Internal LLM 地址');
    log(colors.gray, '  LLM_MODEL        - 使用的模型名称');
    log(colors.gray, '  SSO_URL          - SSO 登录地址');
    log(colors.gray, '  SSO_USER         - SSO 用户名');
    log(colors.gray, '  SSO_PASSWORD     - SSO 密码');
    log(colors.gray, '  VERIFY_SSL       - SSL 验证 (true/false)');
    log(colors.gray, '  TIMEOUT          - 请求超时时间 (ms)\n');
}

async function showConfig() {
    log(colors.blue, '\n📋 当前配置:\n');

    const config = await loadConfig();
    
    if (Object.keys(config).length === 0) {
        log(colors.yellow, '⚠️  未找到配置文件');
        log(colors.gray, '   配置位置: .ada_plugin/config.json\n');
        return;
    }

    for (const [key, value] of Object.entries(config)) {
        const displayValue = typeof value === 'string' && value.length > 50
            ? value.substring(0, 47) + '...'
            : value;
        log(colors.cyan, `  ${key}:`, displayValue);
    }

    log(colors.gray, '');
}

async function setConfig(key, value) {
    const config = await loadConfig();
    config[key] = value;
    await saveConfig(config);
    log(colors.green, `✓ 配置已更新: ${key} = ${value}\n`);
}

async function showLogs(numLines = 20) {
    try {
        const logsDir = path.join(process.cwd(), '.ada_plugin', 'logs');
        const errorLogPath = path.join(logsDir, 'error.log');
        
        const content = await fs.readFile(errorLogPath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        const recentLines = lines.slice(Math.max(0, lines.length - numLines));
        
        log(colors.blue, '\n📄 最近日志 (最后 ' + numLines + ' 行):\n');
        
        if (recentLines.length === 0) {
            log(colors.gray, '   (无日志)\n');
        } else {
            recentLines.forEach(line => {
                if (line.includes('ERROR') || line.includes('❌')) {
                    log(colors.red, '  ' + line);
                } else if (line.includes('WARN') || line.includes('⚠️')) {
                    log(colors.yellow, '  ' + line);
                } else {
                    log(colors.gray, '  ' + line);
                }
            });
        }
        log(colors.gray, '');
    } catch (error) {
        log(colors.yellow, '⚠️  无法读取日志:', error.message);
        log(colors.gray, '   日志位置: .ada_plugin/logs/error.log\n');
    }
}

async function runTest(testFile) {
    return new Promise((resolve, reject) => {
        const testPath = path.join(__dirname, testFile);
        
        log(colors.blue, `\n🧪 运行测试: ${testFile}\n`);
        
        const proc = spawn('node', [testPath], {
            stdio: 'inherit',
            cwd: process.cwd()
        });
        
        proc.on('exit', (code) => {
            if (code === 0) {
                log(colors.green, `\n✓ 测试完成 (${testFile})\n`);
                resolve(code);
            } else {
                log(colors.red, `\n✗ 测试失败 (${testFile})\n`);
                reject(new Error(`Test failed with exit code ${code}`));
            }
        });
        
        proc.on('error', (error) => {
            log(colors.red, '❌ 运行测试失败:', error.message);
            reject(error);
        });
    });
}

async function quickDiagnostic() {
    log(colors.bright + colors.blue, '\n╔════════════════════════════════════════╗');
    log(colors.bright + colors.blue, '║  快速诊断                               ║');
    log(colors.bright + colors.blue, '╚════════════════════════════════════════╝\n');

    // 1. 检查Node.js版本
    log(colors.cyan, '✓ Node.js版本:', process.version);

    // 2. 检查目录结构
    log(colors.cyan, '✓ 工作目录:', process.cwd());

    try {
        await fs.access(path.join(process.cwd(), '.ada_plugin'));
        log(colors.green, '✓ .ada_plugin 目录存在');
    } catch {
        log(colors.yellow, '⚠️  .ada_plugin 目录不存在 (首次运行会自动创建)');
    }

    // 3. 检查配置
    const config = await loadConfig();
    if (Object.keys(config).length > 0) {
        log(colors.green, '✓ 配置文件已存在');
    } else {
        log(colors.yellow, '⚠️  配置文件为空或不存在');
    }

    // 4. 检查环境变量
    log(colors.cyan, '\n环境变量:');
    const envVars = {
        'LLM_URL': process.env.LLM_URL,
        'LLM_MODEL': process.env.LLM_MODEL,
        'SSO_URL': process.env.SSO_URL,
        'SSO_USER': process.env.SSO_USER
    };

    for (const [key, value] of Object.entries(envVars)) {
        if (value) {
            const display = value.length > 40 ? value.substring(0, 37) + '...' : value;
            log(colors.green, `  ✓ ${key}: ${display}`);
        } else {
            log(colors.gray, `  - ${key}: (未设置)`);
        }
    }

    // 5. 检查必要的依赖
    log(colors.cyan, '\n依赖检查:');
    const deps = ['axios', 'vscode'];
    for (const dep of deps) {
        try {
            require.resolve(dep);
            log(colors.green, `  ✓ ${dep}`);
        } catch {
            log(colors.yellow, `  ⚠️  ${dep} (可能未安装)`);
        }
    }

    log(colors.gray, '');
}

async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'help';

    try {
        switch (command) {
            case 'test:llm':
                await runTest('test-internal-llm.js');
                break;

            case 'test:sso':
                await runTest('test-sso.js');
                break;

            case 'test:ai':
                await runTest('test-ai-reviewer.js');
                break;

            case 'test:quick':
                await quickDiagnostic();
                break;

            case 'test:all':
                log(colors.blue, '\n🧪 运行所有测试\n');
                await runTest('test-internal-llm.js');
                break;

            case 'config:show':
                await showConfig();
                break;

            case 'config:set':
                if (args.length < 3) {
                    log(colors.red, '❌ 用法: node test/cli.js config:set <key> <value>');
                } else {
                    await setConfig(args[1], args[2]);
                }
                break;

            case 'logs:tail':
                const numLines = parseInt(args[1]) || 20;
                await showLogs(numLines);
                break;

            case 'help':
            default:
                await showHelp();
                break;
        }
    } catch (error) {
        log(colors.red, '❌ 错误:', error.message);
        process.exit(1);
    }
}

main();
