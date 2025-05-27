// 主页JavaScript
import { auth } from './firebase-config.js';
import { signOut, onAuthStateChanged } from "firebase/auth";
import { getSkuHistory } from './sku-database.js';
import { getCalculationHistory } from './fba-database.js';

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
            userNameElement.textContent = user.email.split('@')[0];
            userWelcome.style.display = 'block';
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
        
        signOut(auth).then(() => {
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
            const result = await getSkuHistory();
            
            // 隐藏加载中
            historyLoading.style.display = 'none';
            
            if (result.success) {
                if (result.history.length === 0) {
                    historyContent.innerHTML = '<div class="text-center py-4">暂无SKU历史记录</div>';
                    return;
                }
                
                // 构建历史记录HTML
                let historyHTML = '';
                
                result.history.forEach(item => {
                    const date = new Date(item.createdAt);
                    const dateStr = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                    
                    historyHTML += `
                        <div class="history-item" data-id="${item.id}">
                            <div class="d-flex justify-content-between">
                                <strong>${item.sku}</strong>
                                <small class="text-muted">${dateStr}</small>
                            </div>
                            <div class="small text-muted mt-1">
                                ${item.brand} | ${item.category} | ${item.productName} | ${item.color || ''} ${item.size || ''}
                            </div>
                        </div>
                    `;
                });
                
                historyContent.innerHTML = historyHTML;
                
                // 添加点击事件，跳转到SKU生成器
                document.querySelectorAll('.history-item').forEach(item => {
                    item.addEventListener('click', function() {
                        const skuId = this.getAttribute('data-id');
                        // 保存要查看的SKU ID到本地存储
                        localStorage.setItem('viewSkuId', skuId);
                        // 跳转到SKU生成器
                        window.location.href = 'sku.html';
                    });
                });
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
            const result = await getCalculationHistory();
            
            // 隐藏加载中
            historyLoading.style.display = 'none';
            
            if (result.success) {
                if (result.history.length === 0) {
                    historyContent.innerHTML = '<div class="text-center py-4">暂无计算历史记录</div>';
                    return;
                }
                
                // 构建历史记录HTML
                let historyHTML = '';
                
                result.history.forEach(item => {
                    const date = new Date(item.createdAt);
                    const dateStr = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                    
                    let calculationTypeText = '';
                    switch (item.calculationType) {
                        case 'shipping':
                            calculationTypeText = '物流配送费';
                            break;
                        case 'storage':
                            calculationTypeText = '仓储费';
                            break;
                        case 'commission':
                            calculationTypeText = '佣金费';
                            break;
                        case 'all':
                            calculationTypeText = '总费用';
                            break;
                        default:
                            calculationTypeText = '未知计算';
                    }
                    
                    // 根据计算类型获取结果
                    let resultText = '';
                    if (item.resultData) {
                        if (item.calculationType === 'all') {
                            resultText = `总费用: $${parseFloat(item.resultData.totalFee).toFixed(2)}`;
                        } else if (item.calculationType === 'shipping') {
                            resultText = `物流费: $${parseFloat(item.resultData.shippingFee).toFixed(2)}`;
                        } else if (item.calculationType === 'storage') {
                            resultText = `仓储费: $${parseFloat(item.resultData.storageFee).toFixed(2)}`;
                        } else if (item.calculationType === 'commission') {
                            resultText = `佣金: $${parseFloat(item.resultData.commissionFee).toFixed(2)}`;
                        }
                    }
                    
                    historyHTML += `
                        <div class="history-item" data-id="${item.id}">
                            <div class="d-flex justify-content-between">
                                <strong>${calculationTypeText}</strong>
                                <small class="text-muted">${dateStr}</small>
                            </div>
                            <div class="small text-muted mt-1">
                                ${resultText}
                            </div>
                        </div>
                    `;
                });
                
                historyContent.innerHTML = historyHTML;
                
                // 添加点击事件，跳转到FBA计算器
                document.querySelectorAll('.history-item').forEach(item => {
                    item.addEventListener('click', function() {
                        const calcId = this.getAttribute('data-id');
                        // 保存要查看的计算ID到本地存储
                        localStorage.setItem('viewCalcId', calcId);
                        // 跳转到FBA计算器
                        window.location.href = 'fba.html';
                    });
                });
            } else {
                historyContent.innerHTML = `<div class="text-center py-4 text-danger">加载失败：${result.message}</div>`;
            }
        } catch (error) {
            historyLoading.style.display = 'none';
            historyContent.innerHTML = '<div class="text-center py-4 text-danger">加载出错，请重试</div>';
            console.error('加载计算历史记录出错:', error);
        }
    }
}); 