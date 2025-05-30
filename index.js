// 主页JavaScript - 认证功能已禁用

document.addEventListener('DOMContentLoaded', function() {
    console.log('主页加载 - 认证功能已禁用');
    
    // 隐藏登录/用户相关UI元素
    hideAuthUI();
    
    // 历史记录部分可以保留但无需认证
    setupHistorySection();
});

/**
 * 隐藏所有认证相关UI
 */
function hideAuthUI() {
    // 隐藏登录按钮
    const loginNavItem = document.getElementById('loginNavItem');
    if (loginNavItem) {
        loginNavItem.style.display = 'none';
    }
    
    // 隐藏用户下拉菜单
    const userNavItem = document.getElementById('userNavItem');
    if (userNavItem) {
        userNavItem.style.display = 'none';
    }
    
    // 隐藏欢迎消息
    const userWelcome = document.getElementById('userWelcome');
    if (userWelcome) {
        userWelcome.style.display = 'none';
    }
}

/**
 * 设置历史记录部分 (无需认证)
 */
function setupHistorySection() {
    const showHistoryBtn = document.getElementById('showHistory');
    const historySection = document.getElementById('historySection');
    const closeHistoryBtn = document.getElementById('closeHistory');
    
    // 隐藏历史按钮，因为没有登录功能
    if (showHistoryBtn) {
        showHistoryBtn.style.display = 'none';
    }
    
    // 确保历史记录区域隐藏
    if (historySection) {
        historySection.style.display = 'none';
    }
    
    // 仍然保留关闭按钮功能（以防万一）
    if (closeHistoryBtn) {
        closeHistoryBtn.addEventListener('click', function() {
            if (historySection) {
                historySection.style.display = 'none';
            }
        });
    }
} 