// 登录页面的JavaScript
import { auth } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "firebase/auth";

document.addEventListener('DOMContentLoaded', function() {
    // 获取元素
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const messageDiv = document.getElementById('message');

    // 监听用户登录状态
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // 用户已登录，重定向到主页
            window.location.href = 'index.html';
        }
    });

    // 切换到注册表单
    showRegister.addEventListener('click', function() {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    });

    // 切换到登录表单
    showLogin.addEventListener('click', function() {
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
    });

    // 登录处理
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // 使用Firebase登录
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // 登录成功，保存用户信息到本地存储
                const user = userCredential.user;
                localStorage.setItem('userId', user.uid);
                // 重定向到主页
                window.location.href = 'index.html';
            })
            .catch((error) => {
                // 显示错误消息
                showMessage('error', '登录失败: ' + getErrorMessage(error.code));
            });
    });

    // 注册处理
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // 验证密码
        if (password !== confirmPassword) {
            showMessage('error', '两次输入的密码不一致');
            return;
        }
        
        // 使用Firebase注册
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // 注册成功
                const user = userCredential.user;
                localStorage.setItem('userId', user.uid);
                // 显示成功消息
                showMessage('success', '注册成功，即将跳转到主页...');
                // 延迟后重定向
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            })
            .catch((error) => {
                // 显示错误消息
                showMessage('error', '注册失败: ' + getErrorMessage(error.code));
            });
    });

    // 显示消息函数
    function showMessage(type, message) {
        messageDiv.textContent = message;
        messageDiv.style.display = 'block';
        
        if (type === 'error') {
            messageDiv.className = 'alert alert-danger mt-3';
        } else {
            messageDiv.className = 'alert alert-success mt-3';
        }
        
        // 3秒后自动隐藏
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    }

    // 获取错误消息
    function getErrorMessage(errorCode) {
        switch(errorCode) {
            case 'auth/invalid-email':
                return '邮箱格式不正确';
            case 'auth/user-disabled':
                return '该用户已被禁用';
            case 'auth/user-not-found':
                return '用户不存在';
            case 'auth/wrong-password':
                return '密码错误';
            case 'auth/email-already-in-use':
                return '该邮箱已被注册';
            case 'auth/weak-password':
                return '密码强度太弱';
            default:
                return '未知错误';
        }
    }
}); 