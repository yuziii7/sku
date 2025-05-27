// 主页JavaScript
import { auth, onAuthStateChanged } from './user-manager.js';
import { skuDatabase, fbaDatabase } from './database-factory.js';

document.addEventListener('DOMContentLoaded', function() {
    // 获取元素
    const loginNavItem = document.getElementById('loginNavItem');
    const userNavItem = document.getElementById('userNavItem');
    const userNameElement = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');
    const showHistoryBtn = document.getElementById('showHistory');
    const historySection = document.getElementById('historySection');
    const historyContent = document.getElementById('historyContent');
    const historyLoading = document.getElementById('historyLoading');
    const closeHistoryBtn = document.getElementById('closeHistory');
    const toggleSkuHistoryBtn = document.getElementById('toggleSkuHistory');
    const toggleCalcHistoryBtn = document.getElementById('toggleCalcHistory');
    const userWelcome = document.getElementById('userWelcome');
    
    // 当前历史记录类型
    let currentHistoryType = 'sku';
    
    // 监听用户登录状态
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // 用户已登录
            loginNavItem.style.display = 'none';
            userNavItem.style.display = 'block';
            userNameElement.textContent = user.displayName || user.email?.split('@')[0] || '用户';
            userWelcome.style.display = 'block';
            
            // 如果是匿名用户，显示不同的欢迎消息
            if (user.isAnonymous) {
                userWelcome.textContent = '您正在匿名使用。登录账户可以保存和同步您的数据。';
            }
        } else {
            // 用户未登录
            loginNavItem.style.display = 'block';
            userNavItem.style.display = 'none';
            userWelcome.style.display = 'none';
            // 如果历史记录区域打开，则关闭
            historySection.style.display = 'none';
        }
    });
    
    // 退出登录
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        auth.signOut().then(() => {
            // 退出成功，显示登录按钮
            loginNavItem.style.display = 'block';
            userNavItem.style.display = 'none';
            // 关闭历史记录区域
            historySection.style.display = 'none';
            // 清除本地存储的用户ID
            localStorage.removeItem('userId');
            // 提示用户已退出
            alert('您已成功退出登录');
        }).catch((error) => {
            console.error('退出登录失败:', error);
            alert('退出登录失败，请重试');
        });
    });
    
    // 显示历史记录
    showHistoryBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // 显示历史记录区域
        historySection.style.display = 'block';
        // 加载SKU历史记录（默认）
        loadSkuHistory();
    });
    
    // 关闭历史记录
    closeHistoryBtn.addEventListener('click', function() {
        historySection.style.display = 'none';
    });
    
    // 切换到SKU历史
    toggleSkuHistoryBtn.addEventListener('click', function() {
        if (currentHistoryType !== 'sku') {
            currentHistoryType = 'sku';
            loadSkuHistory();
            
            // 更新按钮状态
            toggleSkuHistoryBtn.classList.add('btn-primary');
            toggleSkuHistoryBtn.classList.remove('btn-outline-secondary');
            toggleCalcHistoryBtn.classList.remove('btn-primary');
            toggleCalcHistoryBtn.classList.add('btn-outline-secondary');
        }
    });
    
    // 切换到计算历史
    toggleCalcHistoryBtn.addEventListener('click', function() {
        if (currentHistoryType !== 'calc') {
            currentHistoryType = 'calc';
            loadCalcHistory();
            
            // 更新按钮状态
            toggleCalcHistoryBtn.classList.add('btn-primary');
            toggleCalcHistoryBtn.classList.remove('btn-outline-secondary');
            toggleSkuHistoryBtn.classList.remove('btn-primary');
            toggleSkuHistoryBtn.classList.add('btn-outline-secondary');
        }
    });
    
    // 加载SKU历史记录
    async function loadSkuHistory() {
        // 显示加载中
        historyLoading.style.display = 'block';
        historyContent.innerHTML = '';
        
        try {
            const result = await skuDatabase.getSkuHistory(5);
            
            // 隐藏加载中
            historyLoading.style.display = 'none';
            
            if (result.success) {
                if (result.history.length === 0) {
                    historyContent.innerHTML = '<div class="text-center py-4">暂无SKU历史记录</div>';
                    return;
                }
                
                // 构建历史记录HTML
                let historyHTML = '<div class="list-group">';
                
                result.history.forEach(item => {
                    const date = new Date(item.createdAt);
                    const dateStr = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                    
                    historyHTML += `
                        <div class="history-item" onclick="window.location.href='sku.html'">
                            <div class="d-flex w-100 justify-content-between">
                                <h6 class="mb-1">${item.sku}</h6>
                                <small class="text-muted">${dateStr}</small>
                            </div>
                            <p class="mb-1 small">${item.brand || ''} ${item.category || ''} ${item.productName || ''}</p>
                        </div>
                    `;
                });
                
                historyHTML += '</div>';
                historyContent.innerHTML = historyHTML;
            } else {
                historyContent.innerHTML = `<div class="text-center py-4 text-danger">加载失败：${result.message}</div>`;
            }
        } catch (error) {
            historyLoading.style.display = 'none';
            historyContent.innerHTML = '<div class="text-center py-4 text-danger">加载出错，请重试</div>';
            console.error('加载SKU历史记录出错:', error);
        }
    }
    
    // 加载计算历史记录
    async function loadCalcHistory() {
        // 显示加载中
        historyLoading.style.display = 'block';
        historyContent.innerHTML = '';
        
        try {
            const result = await fbaDatabase.getCalculationHistory(null, 5);
            
            // 隐藏加载中
            historyLoading.style.display = 'none';
            
            if (result.success) {
                if (result.history.length === 0) {
                    historyContent.innerHTML = '<div class="text-center py-4">暂无计算历史记录</div>';
                    return;
                }
                
                // 构建历史记录HTML
                let historyHTML = '<div class="list-group">';
                
                result.history.forEach(item => {
                    const date = new Date(item.createdAt);
                    const dateStr = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                    
                    const calculationTypeText = {
                        'shipping': '物流配送费',
                        'storage': '仓储费',
                        'commission': '佣金',
                        'all': '全部费用'
                    }[item.calculationType] || item.calculationType;
                    
                    historyHTML += `
                        <div class="history-item" onclick="window.location.href='fba.html'">
                            <div class="d-flex w-100 justify-content-between">
                                <h6 class="mb-1">${calculationTypeText}</h6>
                                <small class="text-muted">${dateStr}</small>
                            </div>
                            <p class="mb-1 small">总费用: $${item.resultData.totalFee?.toFixed(2) || '0.00'}</p>
                        </div>
                    `;
                });
                
                historyHTML += '</div>';
                historyContent.innerHTML = historyHTML;
            } else {
                historyContent.innerHTML = `<div class="text-center py-4 text-danger">加载失败：${result.message}</div>`;
            }
        } catch (error) {
            historyLoading.style.display = 'none';
            historyContent.innerHTML = '<div class="text-center py-4 text-danger">加载出错，请重试</div>';
            console.error('加载计算历史记录出错:', error);
        }
    }
    
    // 初始状态下设置历史按钮样式
    toggleSkuHistoryBtn.classList.add('btn-primary');
    toggleSkuHistoryBtn.classList.remove('btn-outline-secondary');
}); 