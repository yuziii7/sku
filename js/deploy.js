// 部署脚本 - 将项目部署到GitHub Pages
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// 颜色控制台输出
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m'
};

// 打印带颜色的消息
function log(message, color = colors.reset) {
    console.log(color + message + colors.reset);
}

// 执行命令并返回Promise
function execCommand(command) {
    return new Promise((resolve, reject) => {
        log(`执行命令: ${command}`, colors.cyan);
        exec(command, (error, stdout, stderr) => {
            if (error) {
                log(`错误: ${error.message}`, colors.red);
                reject(error);
                return;
            }
            if (stderr) {
                log(`警告: ${stderr}`, colors.yellow);
            }
            log(stdout);
            resolve(stdout);
        });
    });
}

// 主部署流程
async function deploy() {
    try {
        log('开始部署到GitHub Pages...', colors.bright + colors.green);

        // 检查git是否已初始化
        const isGitRepo = fs.existsSync(path.join(process.cwd(), '.git'));
        
        if (!isGitRepo) {
            log('初始化git仓库...', colors.yellow);
            await execCommand('git init');
        }

        // 检查是否有未提交的更改
        const status = await execCommand('git status --porcelain');
        
        if (status) {
            log('添加更改到暂存区...', colors.yellow);
            await execCommand('git add .');
            
            log('提交更改...', colors.yellow);
            await execCommand('git commit -m "Deploy to GitHub Pages"');
        } else {
            log('没有更改需要提交', colors.yellow);
        }

        // 检查远程仓库
        try {
            await execCommand('git remote -v');
        } catch (error) {
            // 如果没有远程仓库，提示用户添加
            log('没有配置远程仓库。请运行以下命令添加远程仓库:', colors.red);
            log('git remote add origin https://github.com/你的用户名/仓库名.git', colors.yellow);
            throw new Error('没有配置远程仓库');
        }

        // 推送到主分支
        log('推送到主分支...', colors.yellow);
        await execCommand('git push -u origin HEAD');

        // 检查gh-pages分支是否存在
        try {
            await execCommand('git show-ref --verify --quiet refs/heads/gh-pages');
            log('gh-pages分支已存在', colors.yellow);
        } catch (error) {
            // 如果gh-pages分支不存在，创建它
            log('创建gh-pages分支...', colors.yellow);
            await execCommand('git checkout --orphan gh-pages');
            await execCommand('git reset --hard');
            await execCommand('git commit --allow-empty -m "Initial gh-pages commit"');
            await execCommand('git checkout -');
        }

        // 部署到gh-pages分支
        log('部署到gh-pages分支...', colors.yellow);
        await execCommand('git push origin main:gh-pages');

        log('部署完成！您的网站应该在以下地址可用:', colors.bright + colors.green);
        log('https://你的用户名.github.io/仓库名/', colors.cyan);

    } catch (error) {
        log(`部署失败: ${error.message}`, colors.red);
        process.exit(1);
    }
}

// 执行部署
deploy(); 