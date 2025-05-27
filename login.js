// 登录页面JavaScript
import { auth } from './user-manager.js';

document.addEventListener('DOMContentLoaded', function() {
    // DOM元素
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginError = document.getElementById('loginError');
    const registerError = document.getElementById('registerError');
    const registerSuccess = document.getElementById('registerSuccess');
    const anonymousLoginBtn = document.getElementById('anonymousLoginBtn');
    
    // 正确初始化模态框
    let loadingModal;
    try {
        loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    } catch (error) {
        console.error('Modal初始化失败:', error);
    }
    
    const loadingMessage = document.getElementById('loadingMessage');
    
    // 显示/隐藏密码
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            // 切换密码可见性
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('bi-eye');
                icon.classList.add('bi-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('bi-eye-slash');
                icon.classList.add('bi-eye');
            }
        });
    });
    
    // 处理登录表单提交
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('登录表单提交');
        
        // 获取表单数据
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // 验证表单
        if (!email || !password) {
            showError(loginError, '请填写所有必填字段');
            return;
        }
        
        try {
            // 显示加载中
            showLoading('登录中，请稍候...');
            
            // 调用登录方法
            const result = await auth.signIn(email, password);
            
            // 隐藏加载中
            hideLoading();
            
            if (result.success) {
                // 登录成功，重定向到首页或来源页面
                redirectAfterAuth();
            } else {
                // 登录失败，显示错误信息
                showError(loginError, result.message || '登录失败，请检查邮箱和密码');
            }
        } catch (error) {
            hideLoading();
            showError(loginError, error.message || '登录过程中发生错误');
            console.error('登录失败:', error);
        }
    });
    
    // 处理注册表单提交
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('注册表单提交');
        
        // 获取表单数据
        const email = document.getElementById('registerEmail').value;
        const displayName = document.getElementById('registerName').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // 验证表单
        if (!email || !password || !confirmPassword) {
            showError(registerError, '请填写所有必填字段');
            return;
        }
        
        if (password.length < 6) {
            showError(registerError, '密码至少需要6个字符');
            return;
        }
        
        if (password !== confirmPassword) {
            showError(registerError, '两次输入的密码不一致');
            return;
        }
        
        try {
            // 显示加载中
            showLoading('注册中，请稍候...');
            
            // 调用注册方法
            const result = await auth.registerUser(email, password, displayName);
            
            // 隐藏加载中
            hideLoading();
            
            if (result.success) {
                // 注册成功，显示成功消息并清空表单
                registerForm.reset();
                hideError(registerError);
                showSuccess(registerSuccess, '注册成功！即将跳转到首页...');
                
                // 3秒后重定向
                setTimeout(() => {
                    redirectAfterAuth();
                }, 3000);
            } else {
                // 注册失败，显示错误信息
                showError(registerError, result.message || '注册失败，请重试');
            }
        } catch (error) {
            hideLoading();
            showError(registerError, error.message || '注册过程中发生错误');
            console.error('注册失败:', error);
        }
    });
    
    // 匿名登录
    anonymousLoginBtn.addEventListener('click', async function() {
        try {
            // 显示加载中
            showLoading('处理中，请稍候...');
            
            // 调用匿名登录方法
            const result = await auth.signInAnonymously();
            
            // 隐藏加载中
            hideLoading();
            
            if (result.success) {
                // 登录成功，重定向到首页
                redirectAfterAuth();
            } else {
                // 登录失败，显示错误信息
                showError(loginError, result.message || '匿名登录失败，请重试');
            }
        } catch (error) {
            hideLoading();
            showError(loginError, error.message || '匿名登录过程中发生错误');
            console.error('匿名登录失败:', error);
        }
    });
    
    // 检查用户是否已登录，如果已登录则重定向
    if (auth.currentUser) {
        redirectAfterAuth();
    }
    
    // 辅助函数：显示错误信息
    function showError(element, message) {
        element.textContent = message;
        element.style.display = 'block';
    }
    
    // 辅助函数：隐藏错误信息
    function hideError(element) {
        element.style.display = 'none';
    }
    
    // 辅助函数：显示成功信息
    function showSuccess(element, message) {
        element.textContent = message;
        element.style.display = 'block';
    }
    
    // 辅助函数：显示加载中
    function showLoading(message) {
        if (loadingMessage) {
            loadingMessage.textContent = message || '处理中，请稍候...';
        }
        if (loadingModal) {
            try {
                loadingModal.show();
            } catch (error) {
                console.error('无法显示加载模态框:', error);
                alert(message || '处理中，请稍候...');
            }
        } else {
            alert(message || '处理中，请稍候...');
        }
    }
    
    // 辅助函数：隐藏加载中
    function hideLoading() {
        if (loadingModal) {
            try {
                loadingModal.hide();
            } catch (error) {
                console.error('无法隐藏加载模态框:', error);
            }
        }
    }
    
    // 辅助函数：登录后重定向
    function redirectAfterAuth() {
        // 检查URL中是否有重定向参数
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect');
        
        if (redirect) {
            // 重定向到指定页面
            window.location.href = redirect;
        } else {
            // 默认重定向到首页
            window.location.href = 'index.html';
        }
    }
    
    console.log('登录页面脚本加载完成');
    
    // 添加注册按钮直接点击事件作为备用
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', function(e) {
            console.log('注册按钮点击');
            if (!registerForm.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
                registerForm.classList.add('was-validated');
                return;
            }
            
            // 如果表单有效，手动触发表单提交事件
            const submitEvent = new Event('submit', {
                bubbles: true,
                cancelable: true
            });
            registerForm.dispatchEvent(submitEvent);
        });
    }
}); 