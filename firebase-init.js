// Firebase初始化脚本
// 用于在部署前配置Firebase项目

const { exec } = require('child_process');
const fs = require('fs');
const readline = require('readline');

// 创建readline接口
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

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

// 询问用户问题
function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

// 主函数
async function initFirebase() {
    try {
        log('开始配置Firebase...', colors.bright + colors.green);
        
        // 检查是否安装了Firebase CLI
        try {
            await execCommand('firebase --version');
        } catch (error) {
            log('未安装Firebase CLI，正在安装...', colors.yellow);
            await execCommand('npm install -g firebase-tools');
        }
        
        // 登录Firebase
        log('请登录您的Firebase账户...', colors.yellow);
        await execCommand('firebase login');
        
        // 询问Firebase项目ID
        const projectId = await askQuestion(colors.cyan + '请输入您的Firebase项目ID: ' + colors.reset);
        
        if (!projectId) {
            throw new Error('未提供项目ID');
        }
        
        // 使用指定的项目
        log(`使用Firebase项目: ${projectId}`, colors.yellow);
        await execCommand(`firebase use ${projectId}`);
        
        // 获取Firebase配置
        log('正在获取Firebase配置...', colors.yellow);
        const configResult = await execCommand(`firebase apps:sdkconfig web`);
        
        // 提取配置对象
        const configMatch = configResult.match(/const firebaseConfig = ({[\s\S]*?});/);
        
        if (!configMatch || !configMatch[1]) {
            throw new Error('无法从输出中提取Firebase配置');
        }
        
        const firebaseConfig = configMatch[1];
        
        // 更新firebase-config.js文件
        log('正在更新firebase-config.js文件...', colors.yellow);
        
        const configFileContent = `// Firebase配置
// 初始化Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// 你的Firebase配置
const firebaseConfig = ${firebaseConfig};

// 初始化Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };`;
        
        fs.writeFileSync('firebase-config.js', configFileContent);
        
        // 初始化Firebase项目
        log('正在初始化Firebase项目...', colors.yellow);
        
        // 创建firebase.json配置文件
        const firebaseJsonContent = {
            "hosting": {
                "public": ".",
                "ignore": [
                    "firebase.json",
                    "**/.*",
                    "**/node_modules/**",
                    "**/*.log",
                    "**/*.md",
                    "**/*.js.map",
                    "**/*.ts",
                    "deploy.js",
                    "firebase-init.js",
                    "package.json",
                    "package-lock.json"
                ],
                "rewrites": [
                    {
                        "source": "**",
                        "destination": "/index.html"
                    }
                ]
            },
            "firestore": {
                "rules": "firestore.rules",
                "indexes": "firestore.indexes.json"
            }
        };
        
        fs.writeFileSync('firebase.json', JSON.stringify(firebaseJsonContent, null, 2));
        
        // 创建firestore.rules文件
        const firestoreRulesContent = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 只允许已登录的用户读取和写入自己的数据
    match /calculations/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /skus/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}`;
        
        fs.writeFileSync('firestore.rules', firestoreRulesContent);
        
        // 创建firestore.indexes.json文件
        const firestoreIndexesContent = {
            "indexes": [],
            "fieldOverrides": []
        };
        
        fs.writeFileSync('firestore.indexes.json', JSON.stringify(firestoreIndexesContent, null, 2));
        
        log('Firebase配置完成！您现在可以运行 npm run deploy-firebase 来部署您的项目。', colors.bright + colors.green);
        
    } catch (error) {
        log(`配置失败: ${error.message}`, colors.red);
    } finally {
        rl.close();
    }
}

// 执行初始化
initFirebase(); 