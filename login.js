// 登录页面JavaScript
import { auth } from './user-manager.js';

document.addEventListener('DOMContentLoaded', function() {
    console.log('登录页面加载完成');
    console.log('当前用户状态:', auth.currentUser ? '已登录' : '未登录');

    // DOM元素
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginError = document.getElementById('loginError');
    const registerError = document.getElementById('registerError');
    const registerSuccess = document.getElementById('registerSuccess');
    const anonymousLoginBtn = document.getElementById('anonymousLoginBtn');
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    
    console.log('表单元素:', {
        loginForm: !!loginForm,
        registerForm: !!registerForm,
        loginError: !!loginError,
        registerError: !!registerError,
        registerSuccess: !!registerSuccess,
        adminLoginBtn: !!adminLoginBtn
    });
    
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
    if (loginForm) {
        console.log('添加登录表单提交事件监听器');
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('登录表单提交');
            
            // 获取表单数据
            const username = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            console.log('登录表单数据:', {username: username, password: '***'});
            
            // 验证表单
            if (!username || !password) {
                showError(loginError, '请填写所有必填字段');
                return;
            }
            
            try {
                // 显示加载中
                showLoading('登录中，请稍候...');
                
                // 调用登录方法
                console.log('调用登录方法...');
                const result = await auth.signIn(username, password);
                console.log('登录结果:', result);
                
                // 隐藏加载中
                hideLoading();
                
                if (result.success) {
                    // 登录成功，重定向到首页或来源页面
                    console.log('登录成功，准备重定向');
                    redirectAfterAuth();
                } else {
                    // 登录失败，显示错误信息
                    console.log('登录失败:', result.message);
                    showError(loginError, result.message || '登录失败，请检查用户名和密码');
                }
            } catch (error) {
                hideLoading();
                console.error('登录过程发生错误:', error);
                showError(loginError, error.message || '登录过程中发生错误');
            }
        });
    } else {
        console.error('找不到登录表单元素!');
    }
    
    // 处理注册表单提交
    if (registerForm) {
        console.log('添加注册表单提交事件监听器');
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('注册表单提交');
            
            // 获取表单数据
            const username = document.getElementById('registerEmail').value;
            const displayName = document.getElementById('registerName') ? document.getElementById('registerName').value : '';
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            console.log('注册表单数据:', {
                username: username, 
                displayName: displayName || '(未提供)',
                password: '***'
            });
            
            // 验证表单
            if (!username || !password || !confirmPassword) {
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
                console.log('调用注册方法...');
                const result = await auth.registerUser(username, password, displayName);
                console.log('注册结果:', result);
                
                // 隐藏加载中
                hideLoading();
                
                if (result.success) {
                    // 注册成功，显示成功消息并清空表单
                    console.log('注册成功');
                    registerForm.reset();
                    hideError(registerError);
                    showSuccess(registerSuccess, '注册成功！即将跳转到首页...');
                    
                    // 3秒后重定向
                    setTimeout(() => {
                        redirectAfterAuth();
                    }, 3000);
                } else {
                    // 注册失败，显示错误信息
                    console.log('注册失败:', result.message);
                    showError(registerError, result.message || '注册失败，请重试');
                }
            } catch (error) {
                hideLoading();
                console.error('注册过程发生错误:', error);
                showError(registerError, error.message || '注册过程中发生错误');
            }
        });
    } else {
        console.error('找不到注册表单元素!');
    }
    
    // Admin快速登录
    if (adminLoginBtn) {
        console.log('添加Admin登录按钮事件监听器');
        adminLoginBtn.addEventListener('click', async function() {
            try {
                console.log('点击Admin登录按钮');
                // 填充表单
                document.getElementById('loginEmail').value = 'admin';
                document.getElementById('loginPassword').value = 'admin';
                
                // 显示加载中
                showLoading('登录中，请稍候...');
                
                // 调用登录方法
                console.log('调用Admin登录方法...');
                const result = await auth.signIn('admin', 'admin');
                console.log('Admin登录结果:', result);
                
                // 隐藏加载中
                hideLoading();
                
                if (result.success) {
                    // 登录成功，重定向到首页或来源页面
                    console.log('Admin登录成功，准备重定向');
                    redirectAfterAuth();
                } else {
                    // 登录失败，显示错误信息
                    console.log('Admin登录失败:', result.message);
                    showError(loginError, result.message || 'Admin登录失败，可能是账户尚未创建');
                }
            } catch (error) {
                hideLoading();
                console.error('Admin登录过程发生错误:', error);
                showError(loginError, error.message || 'Admin登录过程中发生错误');
            }
        });
    } else {
        console.error('找不到Admin登录按钮元素!');
    }
    
    // 表单切换
    const showRegisterBtn = document.getElementById('showRegister');
    const showLoginBtn = document.getElementById('showLogin');
    
    if (showRegisterBtn) {
        console.log('添加显示注册表单按钮事件监听器');
        showRegisterBtn.addEventListener('click', function() {
            console.log('切换到注册表单');
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
        });
    }
    
    if (showLoginBtn) {
        console.log('添加显示登录表单按钮事件监听器');
        showLoginBtn.addEventListener('click', function() {
            console.log('切换到登录表单');
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
        });
    }
    
    // 检查用户是否已登录，如果已登录则重定向
    if (auth.currentUser) {
        console.log('用户已登录，重定向到首页');
        redirectAfterAuth();
    }
    
    // 辅助函数：显示错误信息
    function showError(element, message) {
        if (!element) {
            console.error('错误: 错误显示元素不存在', message);
            alert('错误: ' + message);
            return;
        }
        console.log('显示错误:', message);
        element.textContent = message;
        element.style.display = 'block';
    }
    
    // 辅助函数：隐藏错误信息
    function hideError(element) {
        if (!element) return;
        element.style.display = 'none';
    }
    
    // 辅助函数：显示成功信息
    function showSuccess(element, message) {
        if (!element) {
            console.error('错误: 成功显示元素不存在', message);
            alert('成功: ' + message);
            return;
        }
        console.log('显示成功:', message);
        element.textContent = message;
        element.style.display = 'block';
    }
    
    // 辅助函数：显示加载中
    function showLoading(message) {
        console.log('显示加载中:', message);
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
        console.log('隐藏加载中');
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
            console.log('重定向到:', redirect);
            window.location.href = redirect;
        } else {
            // 默认重定向到首页
            console.log('重定向到首页');
            window.location.href = 'index.html';
        }
    }
    
    console.log('登录页面脚本加载完成');
    
    // 添加注册按钮直接点击事件作为备用
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        console.log('添加注册按钮直接点击事件');
        registerBtn.addEventListener('click', function(e) {
            console.log('注册按钮点击');
            
            // 检查表单是否有效
            const form = this.closest('form');
            if (!form) {
                console.error('无法找到表单元素');
                return;
            }
            
            const username = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            console.log('表单数据检查:', {
                hasUsername: !!username,
                hasPassword: !!password,
                passwordsMatch: password === confirmPassword
            });
            
            // 手动验证表单
            if (!username || !password || !confirmPassword) {
                showError(registerError || form.querySelector('.alert'), '请填写所有必填字段');
                return;
            }
            
            if (password.length < 6) {
                showError(registerError || form.querySelector('.alert'), '密码至少需要6个字符');
                return;
            }
            
            if (password !== confirmPassword) {
                showError(registerError || form.querySelector('.alert'), '两次输入的密码不一致');
                return;
            }
            
            // 手动触发表单提交事件
            console.log('手动触发表单提交');
            const submitEvent = new Event('submit', {
                bubbles: true,
                cancelable: true
            });
            form.dispatchEvent(submitEvent);
        });
    }
}); 