// 管理员控制面板 JavaScript
import { auth, onAuthStateChanged } from './indexed-db-user-manager.js';
import { indexedDBManager } from './indexed-db-manager.js';
import { skuDatabase, fbaDatabase } from './indexed-db-factory.js';

// 全局变量
let currentUser = null;
let currentSelectedUser = null;
let allUsers = [];
let userSkus = [];
let userCalcs = [];

// 在页面加载时执行
document.addEventListener('DOMContentLoaded', function() {
    console.log('管理员页面加载...');
    
    // 检查是否登录为管理员
    checkAdminAuth();
    
    // 初始化UI事件监听器
    initEventListeners();
});

/**
 * 检查是否是管理员用户，否则重定向到登录页面
 */
function checkAdminAuth() {
    // 监听用户登录状态
    onAuthStateChanged((user) => {
        currentUser = user;
        
        if (user) {
            console.log('用户已登录:', user.email);
            
            // 检查是否是管理员账号
            const isAdmin = user.email === 'admin' || 
                           user.uid.startsWith('admin_') || 
                           user.email === 'admin@admin.com';
                           
            if (isAdmin) {
                console.log('已验证为管理员账号');
                // 更新UI
                document.getElementById('adminName').textContent = user.displayName || user.email;
                
                // 加载统计数据和用户列表
                loadStatistics();
                loadAllUsers();
            } else {
                console.warn('非管理员账号尝试访问管理页面');
                alert('您没有管理员权限，即将跳转到登录页面');
                redirectToLogin();
            }
        } else {
            console.log('用户未登录，重定向到登录页面');
            redirectToLogin();
        }
    });
}

/**
 * 初始化事件监听器
 */
function initEventListeners() {
    // 登出按钮
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // 用户搜索按钮
    document.getElementById('searchUsersBtn').addEventListener('click', handleSearchUsers);
    
    // 用户删除按钮
    document.getElementById('deleteUserBtn').addEventListener('click', function() {
        if (currentSelectedUser) {
            showDeleteConfirmModal(currentSelectedUser);
        }
    });
    
    // 重置密码按钮
    document.getElementById('resetPasswordBtn').addEventListener('click', function() {
        if (currentSelectedUser) {
            showResetPasswordModal(currentSelectedUser);
        }
    });
    
    // 确认删除按钮
    document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
        if (currentSelectedUser) {
            deleteUser(currentSelectedUser.uid);
        }
    });
    
    // 确认重置密码按钮
    document.getElementById('confirmResetBtn').addEventListener('click', function() {
        if (currentSelectedUser) {
            resetUserPassword(currentSelectedUser.uid);
        }
    });
    
    // SKU搜索功能
    document.getElementById('skuSearch').addEventListener('input', function() {
        filterSkuTable(this.value);
    });
    
    // 计算历史搜索功能
    document.getElementById('calcSearch').addEventListener('input', function() {
        filterCalcTable(this.value);
    });
}

/**
 * 加载统计数据
 */
async function loadStatistics() {
    try {
        // 确保数据库已初始化
        await indexedDBManager.ensureDbReady();
        
        // 获取用户总数
        const userCountRequest = await indexedDBManager.exec('SELECT COUNT(*) as count FROM users');
        const userCount = userCountRequest && userCountRequest[0] ? userCountRequest[0].count : 0;
        
        // 获取SKU总数
        const skuCountRequest = await indexedDBManager.exec('SELECT COUNT(*) as count FROM skus');
        const skuCount = skuCountRequest && skuCountRequest[0] ? skuCountRequest[0].count : 0;
        
        // 获取计算历史总数
        const calcCountRequest = await indexedDBManager.exec('SELECT COUNT(*) as count FROM calculations');
        const calcCount = calcCountRequest && calcCountRequest[0] ? calcCountRequest[0].count : 0;
        
        // 更新UI
        document.getElementById('totalUsers').textContent = userCount;
        document.getElementById('totalRecords').textContent = (skuCount + calcCount);
    } catch (error) {
        console.error('加载统计数据失败:', error);
    }
}

/**
 * 加载所有用户
 */
async function loadAllUsers() {
    try {
        // 显示加载中
        document.getElementById('userListLoading').style.display = 'block';
        
        // 查询所有用户
        const users = await indexedDBManager.exec('SELECT * FROM users ORDER BY createdAt DESC');
        
        // 隐藏加载中
        document.getElementById('userListLoading').style.display = 'none';
        
        // 保存用户列表
        allUsers = users || [];
        
        // 更新用户列表UI
        updateUserListUI(allUsers);
    } catch (error) {
        console.error('加载用户列表失败:', error);
        document.getElementById('userListLoading').style.display = 'none';
        document.getElementById('userList').innerHTML = `
            <div class="text-center py-3 text-danger">
                <i class="bi bi-exclamation-triangle"></i> 加载失败
            </div>
        `;
    }
}

/**
 * 更新用户列表UI
 */
function updateUserListUI(users) {
    const userListElement = document.getElementById('userList');
    const userListCountElement = document.getElementById('userListCount');
    
    // 清空现有内容，除了加载指示器
    const loadingElement = document.getElementById('userListLoading');
    userListElement.innerHTML = '';
    userListElement.appendChild(loadingElement);
    loadingElement.style.display = 'none';
    
    if (users && users.length > 0) {
        // 更新用户数量
        userListCountElement.textContent = users.length;
        
        // 添加用户列表项
        users.forEach(user => {
            const userItem = createUserListItem(user);
            userListElement.appendChild(userItem);
        });
    } else {
        // 无用户或加载失败
        userListCountElement.textContent = '0';
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'text-center py-3 text-muted';
        emptyMessage.innerHTML = '<i class="bi bi-people"></i> 没有找到用户';
        userListElement.appendChild(emptyMessage);
    }
}

/**
 * 创建用户列表项
 */
function createUserListItem(user) {
    const listItem = document.createElement('a');
    listItem.href = '#';
    listItem.className = 'list-group-item list-group-item-action';
    listItem.dataset.userId = user.uid;
    
    // 判断用户类型
    let userTypeClass = '';
    let userTypeBadge = '';
    
    if (user.isAnonymous === 1) {
        userTypeClass = 'text-muted';
        userTypeBadge = '<span class="badge bg-secondary badge-role float-end">匿名</span>';
    } else if (user.email === 'admin' || user.uid.startsWith('admin_') || user.email === 'admin@admin.com') {
        userTypeClass = 'fw-bold';
        userTypeBadge = '<span class="badge bg-danger badge-role float-end">管理员</span>';
    }
    
    // 获取格式化的时间
    const createdDate = user.createdAt ? new Date(user.createdAt * 1000).toLocaleString() : '未知';
    
    // 设置内容
    listItem.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <div class="${userTypeClass}">
                <div>${user.displayName || user.email || '匿名用户'}</div>
                <small class="text-muted">${createdDate}</small>
            </div>
            ${userTypeBadge}
        </div>
    `;
    
    // 添加点击事件
    listItem.addEventListener('click', function() {
        // 移除其他项的选中状态
        document.querySelectorAll('#userList .list-group-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // 添加选中状态
        this.classList.add('active');
        
        // 加载用户详情
        loadUserDetail(user);
    });
    
    return listItem;
}

/**
 * 加载用户详情
 */
async function loadUserDetail(user) {
    // 保存当前选中的用户
    currentSelectedUser = user;
    
    // 隐藏欢迎区域，显示用户详情区域
    document.getElementById('welcomeSection').classList.add('d-none');
    document.getElementById('userDetailSection').classList.remove('d-none');
    
    // 更新用户基本信息
    document.getElementById('detailUserName').textContent = user.displayName || user.email || '匿名用户';
    document.getElementById('detailUserId').textContent = user.uid;
    document.getElementById('detailUserEmail').textContent = user.email || '无邮箱';
    document.getElementById('detailUserCreated').textContent = user.createdAt ? 
        new Date(user.createdAt * 1000).toLocaleString() : '未知';
    
    // 设置用户类型标签
    const userTypeElement = document.getElementById('detailUserType');
    if (user.isAnonymous === 1) {
        userTypeElement.textContent = '匿名用户';
        userTypeElement.className = 'badge bg-secondary';
    } else if (user.email === 'admin' || user.uid.startsWith('admin_') || user.email === 'admin@admin.com') {
        userTypeElement.textContent = '管理员';
        userTypeElement.className = 'badge bg-danger';
    } else {
        userTypeElement.textContent = '注册用户';
        userTypeElement.className = 'badge bg-primary';
    }
    
    // 加载用户的SKU数据
    loadUserSkus(user.uid);
    
    // 加载用户的计算历史数据
    loadUserCalculations(user.uid);
    
    // 如果是管理员账号，禁用删除和重置密码按钮
    const isAdmin = user.email === 'admin' || user.uid.startsWith('admin_') || user.email === 'admin@admin.com';
    document.getElementById('deleteUserBtn').disabled = isAdmin;
    document.getElementById('resetPasswordBtn').disabled = isAdmin;
}

/**
 * 加载用户的SKU数据
 */
async function loadUserSkus(userId) {
    try {
        // 显示加载中
        document.getElementById('skuLoadingIndicator').classList.remove('d-none');
        document.getElementById('skuEmptyMessage').classList.add('d-none');
        document.getElementById('skuTable').innerHTML = '';
        
        // 查询用户的SKU
        const result = await skuDatabase.getSkuHistory(userId, 1000);
        
        // 隐藏加载中
        document.getElementById('skuLoadingIndicator').classList.add('d-none');
        
        // 保存SKU数据
        userSkus = result.success ? result.history : [];
        
        // 更新SKU表格
        updateSkuTable(userSkus);
    } catch (error) {
        console.error('加载用户SKU数据失败:', error);
        document.getElementById('skuLoadingIndicator').classList.add('d-none');
        document.getElementById('skuTable').innerHTML = `
            <tr><td colspan="5" class="text-center text-danger">加载SKU数据失败</td></tr>
        `;
    }
}

/**
 * 更新SKU表格
 */
function updateSkuTable(skus) {
    const tableElement = document.getElementById('skuTable');
    
    if (skus && skus.length > 0) {
        // 显示数据
        let tableContent = '';
        
        skus.forEach(sku => {
            // 获取格式化的时间
            const createdDate = sku.createdAt ? 
                new Date(sku.createdAt * 1000).toLocaleString() : '未知';
                
            // 构建品牌/分类信息
            const categoryInfo = [
                sku.brand || '',
                sku.category ? (sku.category + (sku.productName ? ': ' + sku.productName : '')) : '',
                sku.additional || ''
            ].filter(Boolean).join(' - ') || '无';
            
            tableContent += `
                <tr>
                    <td>${sku.id}</td>
                    <td>${sku.sku}</td>
                    <td>${categoryInfo}</td>
                    <td>${createdDate}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary view-sku-btn" data-sku-id="${sku.id}">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-sku-btn" data-sku-id="${sku.id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        tableElement.innerHTML = tableContent;
        
        // 添加按钮点击事件
        document.querySelectorAll('.view-sku-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const skuId = this.getAttribute('data-sku-id');
                const skuData = skus.find(s => s.id == skuId);
                if (skuData) {
                    showSkuDetailModal(skuData);
                }
            });
        });
        
        document.querySelectorAll('.delete-sku-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const skuId = this.getAttribute('data-sku-id');
                if (confirm('确定要删除这个SKU记录吗？')) {
                    deleteSku(skuId, currentSelectedUser.uid);
                }
            });
        });
    } else {
        // 显示空数据提示
        document.getElementById('skuEmptyMessage').classList.remove('d-none');
    }
}

/**
 * 过滤SKU表格
 */
function filterSkuTable(searchText) {
    if (!searchText) {
        // 如果搜索框为空，显示所有SKU
        updateSkuTable(userSkus);
        return;
    }
    
    const lowerSearchText = searchText.toLowerCase();
    
    // 过滤匹配的SKU
    const filteredSkus = userSkus.filter(sku => {
        return (
            sku.sku.toLowerCase().includes(lowerSearchText) ||
            (sku.brand && sku.brand.toLowerCase().includes(lowerSearchText)) ||
            (sku.category && sku.category.toLowerCase().includes(lowerSearchText)) ||
            (sku.productName && sku.productName.toLowerCase().includes(lowerSearchText))
        );
    });
    
    // 更新表格
    updateSkuTable(filteredSkus);
}

/**
 * 删除SKU记录
 */
async function deleteSku(skuId, userId) {
    try {
        // 调用API删除SKU
        const result = await skuDatabase.deleteSku(skuId);
        
        if (result.success) {
            // 成功删除，重新加载SKU列表
            loadUserSkus(userId);
            
            // 更新统计数据
            loadStatistics();
            
            // 显示成功提示
            alert('SKU记录已成功删除');
        } else {
            throw new Error(result.message || '删除SKU失败');
        }
    } catch (error) {
        console.error('删除SKU失败:', error);
        alert('删除SKU失败: ' + error.message);
    }
}

/**
 * 显示SKU详情模态框
 */
function showSkuDetailModal(skuData) {
    // 填充SKU数据
    document.getElementById('modalSkuCode').textContent = skuData.sku;
    document.getElementById('modalSkuTitle').textContent = skuData.title || skuData.sku;
    document.getElementById('modalSkuDesc').textContent = skuData.description || '无描述';
    
    // 构建分类信息
    const categoryInfo = [
        skuData.brand || '',
        skuData.category ? (skuData.category + (skuData.productName ? ': ' + skuData.productName : '')) : '',
        skuData.additional || ''
    ].filter(Boolean).join(' - ') || '无';
    document.getElementById('modalSkuCategory').textContent = categoryInfo;
    
    // 设置创建时间
    document.getElementById('modalSkuCreated').textContent = skuData.createdAt ? 
        new Date(skuData.createdAt * 1000).toLocaleString() : '未知';
    
    // 填充子SKU列表
    const childListElement = document.getElementById('modalSkuChildList');
    childListElement.innerHTML = '';
    
    if (skuData.childSkus && skuData.childSkus.length > 0) {
        skuData.childSkus.forEach(childSku => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${childSku.sku}</td>
                <td>${childSku.color || '-'}</td>
                <td>${childSku.size || '-'}</td>
            `;
            childListElement.appendChild(tr);
        });
    } else {
        childListElement.innerHTML = '<tr><td colspan="3" class="text-center">无子SKU</td></tr>';
    }
    
    // 显示模态框
    const modal = new bootstrap.Modal(document.getElementById('skuDetailModal'));
    modal.show();
}

/**
 * 加载用户的计算历史数据
 */
async function loadUserCalculations(userId) {
    try {
        // 显示加载中
        document.getElementById('calcLoadingIndicator').classList.remove('d-none');
        document.getElementById('calcEmptyMessage').classList.add('d-none');
        document.getElementById('calcTable').innerHTML = '';
        
        // 查询用户的计算历史
        const result = await fbaDatabase.getCalculationHistory(userId, null, 1000);
        
        // 隐藏加载中
        document.getElementById('calcLoadingIndicator').classList.add('d-none');
        
        // 保存计算历史数据
        userCalcs = result.success ? result.history : [];
        
        // 更新计算历史表格
        updateCalcTable(userCalcs);
    } catch (error) {
        console.error('加载用户计算历史失败:', error);
        document.getElementById('calcLoadingIndicator').classList.add('d-none');
        document.getElementById('calcTable').innerHTML = `
            <tr><td colspan="5" class="text-center text-danger">加载计算历史失败</td></tr>
        `;
    }
}

/**
 * 更新计算历史表格
 */
function updateCalcTable(calcs) {
    const tableElement = document.getElementById('calcTable');
    
    if (calcs && calcs.length > 0) {
        // 显示数据
        let tableContent = '';
        
        calcs.forEach(calc => {
            // 获取格式化的时间
            const createdDate = calc.createdAt ? 
                new Date(calc.createdAt * 1000).toLocaleString() : '未知';
                
            // 解析结果数据
            let totalFee = '0.00';
            try {
                const resultData = calc.resultData;
                totalFee = resultData.totalFee ? resultData.totalFee.toFixed(2) : '0.00';
            } catch (e) {
                console.warn('解析计算结果数据失败:', e);
            }
            
            // 格式化计算类型
            const calcTypeText = {
                'shipping': '物流配送费',
                'storage': '仓储费',
                'commission': '佣金',
                'all': '全部费用'
            }[calc.calculationType] || calc.calculationType;
            
            tableContent += `
                <tr>
                    <td>${calc.id}</td>
                    <td>${calcTypeText}</td>
                    <td>$${totalFee}</td>
                    <td>${createdDate}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary view-calc-btn" data-calc-id="${calc.id}">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-calc-btn" data-calc-id="${calc.id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        tableElement.innerHTML = tableContent;
        
        // 添加按钮点击事件
        document.querySelectorAll('.view-calc-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const calcId = this.getAttribute('data-calc-id');
                const calcData = calcs.find(c => c.id == calcId);
                if (calcData) {
                    showCalcDetailModal(calcData);
                }
            });
        });
        
        document.querySelectorAll('.delete-calc-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const calcId = this.getAttribute('data-calc-id');
                if (confirm('确定要删除这个计算记录吗？')) {
                    deleteCalculation(calcId, currentSelectedUser.uid);
                }
            });
        });
    } else {
        // 显示空数据提示
        document.getElementById('calcEmptyMessage').classList.remove('d-none');
    }
}

/**
 * 过滤计算历史表格
 */
function filterCalcTable(searchText) {
    if (!searchText) {
        // 如果搜索框为空，显示所有计算历史
        updateCalcTable(userCalcs);
        return;
    }
    
    const lowerSearchText = searchText.toLowerCase();
    
    // 过滤匹配的计算历史
    const filteredCalcs = userCalcs.filter(calc => {
        return (
            calc.calculationType.toLowerCase().includes(lowerSearchText) ||
            JSON.stringify(calc.inputData).toLowerCase().includes(lowerSearchText) ||
            JSON.stringify(calc.resultData).toLowerCase().includes(lowerSearchText)
        );
    });
    
    // 更新表格
    updateCalcTable(filteredCalcs);
}

/**
 * 删除计算记录
 */
async function deleteCalculation(calcId, userId) {
    try {
        // 调用API删除计算记录
        const result = await fbaDatabase.deleteCalculation(calcId);
        
        if (result.success) {
            // 成功删除，重新加载计算历史列表
            loadUserCalculations(userId);
            
            // 更新统计数据
            loadStatistics();
            
            // 显示成功提示
            alert('计算记录已成功删除');
        } else {
            throw new Error(result.message || '删除计算记录失败');
        }
    } catch (error) {
        console.error('删除计算记录失败:', error);
        alert('删除计算记录失败: ' + error.message);
    }
}

/**
 * 显示计算详情模态框
 */
function showCalcDetailModal(calcData) {
    // 格式化计算类型
    const calcTypeText = {
        'shipping': '物流配送费',
        'storage': '仓储费',
        'commission': '佣金',
        'all': '全部费用'
    }[calcData.calculationType] || calcData.calculationType;
    
    document.getElementById('modalCalcType').textContent = calcTypeText;
    
    // 设置创建时间
    document.getElementById('modalCalcCreated').textContent = calcData.createdAt ? 
        new Date(calcData.createdAt * 1000).toLocaleString() : '未知';
    
    // 填充输入数据和结果数据
    document.getElementById('modalCalcInput').textContent = 
        JSON.stringify(calcData.inputData, null, 2);
    document.getElementById('modalCalcResult').textContent = 
        JSON.stringify(calcData.resultData, null, 2);
    
    // 设置费用明细
    try {
        const resultData = calcData.resultData;
        document.getElementById('modalShippingFee').textContent = 
            (resultData.shippingFee || 0).toFixed(2);
        document.getElementById('modalStorageFee').textContent = 
            (resultData.storageFee || 0).toFixed(2);
        document.getElementById('modalCommissionFee').textContent = 
            (resultData.commissionFee || 0).toFixed(2);
        document.getElementById('modalTotalFee').textContent = 
            (resultData.totalFee || 0).toFixed(2);
    } catch (e) {
        console.warn('解析计算结果数据失败:', e);
        document.getElementById('modalShippingFee').textContent = '0.00';
        document.getElementById('modalStorageFee').textContent = '0.00';
        document.getElementById('modalCommissionFee').textContent = '0.00';
        document.getElementById('modalTotalFee').textContent = '0.00';
    }
    
    // 显示模态框
    const modal = new bootstrap.Modal(document.getElementById('calcDetailModal'));
    modal.show();
}

/**
 * 处理搜索用户
 */
function handleSearchUsers() {
    // 获取搜索关键字
    const searchText = document.getElementById('userSearch').value.toLowerCase();
    
    // 获取选中的用户类型
    const includeRegular = document.getElementById('regularUsers').checked;
    const includeAdmin = document.getElementById('adminUsers').checked;
    const includeAnonymous = document.getElementById('anonymousUsers').checked;
    
    // 过滤用户
    const filteredUsers = allUsers.filter(user => {
        // 检查用户类型
        if (user.isAnonymous === 1 && !includeAnonymous) {
            return false;
        }
        
        const isAdmin = user.email === 'admin' || 
                       user.uid.startsWith('admin_') || 
                       user.email === 'admin@admin.com';
                       
        if (isAdmin && !includeAdmin) {
            return false;
        }
        
        if (!user.isAnonymous && !isAdmin && !includeRegular) {
            return false;
        }
        
        // 如果没有搜索关键字，返回true
        if (!searchText) {
            return true;
        }
        
        // 检查搜索关键字
        return (
            (user.uid && user.uid.toLowerCase().includes(searchText)) ||
            (user.email && user.email.toLowerCase().includes(searchText)) ||
            (user.displayName && user.displayName.toLowerCase().includes(searchText))
        );
    });
    
    // 更新用户列表
    updateUserListUI(filteredUsers);
}

/**
 * 显示删除确认模态框
 */
function showDeleteConfirmModal(user) {
    document.getElementById('deleteUserName').textContent = user.displayName || user.email || '匿名用户';
    document.getElementById('deleteUserId').textContent = user.uid;
    
    const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    modal.show();
}

/**
 * 删除用户
 */
async function deleteUser(userId) {
    try {
        // 确保数据库已初始化
        await indexedDBManager.ensureDbReady();
        
        // 删除用户
        const result = await indexedDBManager.run('DELETE FROM users WHERE uid = ?', [userId]);
        
        if (result.success) {
            // 删除用户关联的SKU数据
            await indexedDBManager.run('DELETE FROM skus WHERE userId = ?', [userId]);
            
            // 删除用户关联的计算历史数据
            await indexedDBManager.run('DELETE FROM calculations WHERE userId = ?', [userId]);
            
            // 隐藏模态框
            bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal')).hide();
            
            // 重新加载用户列表
            await loadAllUsers();
            
            // 更新统计数据
            await loadStatistics();
            
            // 隐藏用户详情，显示欢迎区域
            document.getElementById('welcomeSection').classList.remove('d-none');
            document.getElementById('userDetailSection').classList.add('d-none');
            
            // 清除当前选中的用户
            currentSelectedUser = null;
            
            // 显示成功提示
            alert('用户及其所有数据已成功删除');
        } else {
            throw new Error('删除用户失败');
        }
    } catch (error) {
        console.error('删除用户失败:', error);
        alert('删除用户失败: ' + error.message);
    }
}

/**
 * 显示重置密码模态框
 */
function showResetPasswordModal(user) {
    document.getElementById('resetUserName').textContent = user.displayName || user.email || '匿名用户';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    document.getElementById('passwordResetError').classList.add('d-none');
    
    const modal = new bootstrap.Modal(document.getElementById('resetPasswordModal'));
    modal.show();
}

/**
 * 重置用户密码
 */
async function resetUserPassword(userId) {
    try {
        // 获取输入的密码
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // 验证密码
        if (!newPassword) {
            throw new Error('请输入新密码');
        }
        
        if (newPassword.length < 6) {
            throw new Error('密码长度必须至少为6个字符');
        }
        
        if (newPassword !== confirmPassword) {
            throw new Error('两次输入的密码不一致');
        }
        
        // 确保数据库已初始化
        await indexedDBManager.ensureDbReady();
        
        // 更新密码
        const result = await indexedDBManager.run(
            'UPDATE users SET password = ? WHERE uid = ?', 
            [newPassword, userId]
        );
        
        if (result.success) {
            // 隐藏模态框
            bootstrap.Modal.getInstance(document.getElementById('resetPasswordModal')).hide();
            
            // 显示成功提示
            alert('用户密码已成功重置');
        } else {
            throw new Error('重置密码失败');
        }
    } catch (error) {
        console.error('重置用户密码失败:', error);
        
        // 显示错误提示
        const errorElement = document.getElementById('passwordResetError');
        errorElement.textContent = error.message;
        errorElement.classList.remove('d-none');
    }
}

/**
 * 处理登出
 */
function handleLogout() {
    auth.signOut().then(() => {
        redirectToLogin();
    }).catch(err => {
        console.error('登出失败:', err);
        alert('登出失败: ' + err.message);
    });
}

/**
 * 重定向到登录页面
 */
function redirectToLogin() {
    // 保存当前页面URL，以便登录后返回
    localStorage.setItem('auth_redirect', window.location.href);
    window.location.href = 'login.html';
} 