// Firebase认证调试脚本
import { auth } from './firebase-config.js';
import { 
    getAuth, 
    onAuthStateChanged, 
    connectAuthEmulator,
    createUserWithEmailAndPassword 
} from "firebase/auth";

// 检查auth对象
console.log('Auth对象:', auth);
console.log('当前用户:', auth.currentUser);

// 测试创建用户功能
async function testCreateUser() {
    try {
        const testEmail = `test-${Date.now()}@example.com`;
        const testPassword = 'Password123!';
        
        console.log(`尝试创建测试用户: ${testEmail}`);
        
        const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
        console.log('用户创建成功:', userCredential.user);
        return '成功: 用户创建功能正常';
    } catch (error) {
        console.error('创建用户失败:', error.code, error.message);
        return `失败: ${error.code} - ${error.message}`;
    }
}

// 查看当前Firebase项目配置
function getFirebaseConfig() {
    // 检查firebase-config.js中导出的auth对象
    const config = {
        apiKey: auth.app.options.apiKey,
        authDomain: auth.app.options.authDomain,
        projectId: auth.app.options.projectId
    };
    
    return config;
}

// 显示调试信息
document.addEventListener('DOMContentLoaded', async function() {
    // 创建调试信息容器
    const debugContainer = document.createElement('div');
    debugContainer.style.padding = '20px';
    debugContainer.style.margin = '20px auto';
    debugContainer.style.maxWidth = '800px';
    debugContainer.style.backgroundColor = '#f8f9fa';
    debugContainer.style.borderRadius = '5px';
    debugContainer.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
    
    // 添加标题
    const title = document.createElement('h2');
    title.textContent = 'Firebase Authentication 调试信息';
    debugContainer.appendChild(title);
    
    // 添加Firebase配置信息
    const configInfo = document.createElement('div');
    configInfo.innerHTML = `<h4>Firebase配置:</h4>
        <pre>${JSON.stringify(getFirebaseConfig(), null, 2)}</pre>`;
    debugContainer.appendChild(configInfo);
    
    // 添加认证状态信息
    const authStateInfo = document.createElement('div');
    authStateInfo.innerHTML = `<h4>认证状态:</h4>
        <p>Auth对象存在: ${auth ? '是' : '否'}</p>
        <p>当前用户: ${auth.currentUser ? auth.currentUser.email : '未登录'}</p>`;
    debugContainer.appendChild(authStateInfo);
    
    // 测试用户创建功能
    const testButton = document.createElement('button');
    testButton.textContent = '测试用户创建';
    testButton.className = 'btn btn-primary';
    testButton.onclick = async function() {
        const resultElement = document.getElementById('testResult');
        resultElement.textContent = '测试中...';
        
        const result = await testCreateUser();
        resultElement.textContent = result;
    };
    
    const testResult = document.createElement('div');
    testResult.id = 'testResult';
    testResult.style.marginTop = '10px';
    testResult.style.padding = '10px';
    testResult.style.backgroundColor = '#e9ecef';
    testResult.style.borderRadius = '3px';
    
    const testContainer = document.createElement('div');
    testContainer.innerHTML = '<h4>测试用户创建:</h4>';
    testContainer.appendChild(testButton);
    testContainer.appendChild(testResult);
    debugContainer.appendChild(testContainer);
    
    // 添加到页面
    document.body.appendChild(debugContainer);
}); 