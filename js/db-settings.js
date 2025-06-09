// 数据库设置页面JavaScript
import { auth, onAuthStateChanged } from './user-manager.js';
import { sqliteManager } from './sqlite-manager.js';

// 用户界面元素
const loginNavItem = document.getElementById('loginNavItem');
const userNavItem = document.getElementById('userNavItem');
const userNameElement = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');
const viewStatsBtn = document.getElementById('viewStats');
const resetDatabaseBtn = document.getElementById('resetDatabase');
const exportDataBtn = document.getElementById('exportData');
const backupDataBtn = document.getElementById('backupData');
const restoreDataBtn = document.getElementById('restoreData');
const confirmResetBtn = document.getElementById('confirmReset');

// 统计信息元素
const databaseStats = document.getElementById('databaseStats');
const dbSizeElement = document.getElementById('dbSize');
const skuCountElement = document.getElementById('skuCount');
const calcCountElement = document.getElementById('calcCount');
const lastModifiedElement = document.getElementById('lastModified');

// 重置确认模态框
const resetConfirmModal = new bootstrap.Modal(document.getElementById('resetConfirmModal'));

// 页面初始化
document.addEventListener('DOMContentLoaded', async function() {
    // 监听用户登录状态
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // 用户已登录
            loginNavItem.classList.add('d-none');
            userNavItem.classList.remove('d-none');
            userNameElement.textContent = user.email ? user.email.split('@')[0] : '用户';
        } else {
            // 用户未登录
            loginNavItem.classList.remove('d-none');
            userNavItem.classList.add('d-none');
        }
    });
    
    // 退出登录
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            auth.signOut().then(() => {
                // 成功退出登录
                alert('您已成功退出登录');
                loginNavItem.classList.remove('d-none');
                userNavItem.classList.add('d-none');
            }).catch((error) => {
                console.error('退出登录失败:', error);
                alert('退出登录失败，请重试');
            });
        });
    }
    
    // 获取数据库统计信息
    async function fetchDatabaseStats() {
        try {
            await sqliteManager.init();
            
            // 获取SKU数量
            const skuResult = await sqliteManager.exec('SELECT COUNT(*) as count FROM skus');
            const skuCount = skuResult[0].count;
            skuCountElement.textContent = skuCount;
            
            // 获取计算结果数量
            const calcResult = await sqliteManager.exec('SELECT COUNT(*) as count FROM calculations');
            const calcCount = calcResult[0].count;
            calcCountElement.textContent = calcCount;
            
            // 获取最后修改时间
            const lastModifiedResult = await sqliteManager.exec(`
                SELECT MAX(createdAt) as lastModified 
                FROM (
                    SELECT MAX(createdAt) as createdAt FROM skus
                    UNION
                    SELECT MAX(createdAt) as createdAt FROM calculations
                )
            `);
            
            const lastModified = lastModifiedResult[0].lastModified;
            if (lastModified) {
                const date = new Date(lastModified * 1000);
                lastModifiedElement.textContent = date.toLocaleString();
            } else {
                lastModifiedElement.textContent = '无数据';
            }
            
            // 估算数据库大小
            // 注意：这只是一个近似值，实际大小取决于IndexedDB实现
            const estimatedSize = (skuCount * 0.5 + calcCount * 2) + 0.1; // 单位：MB
            dbSizeElement.textContent = estimatedSize.toFixed(2) + ' MB';
            
        } catch (error) {
            console.error('获取数据库统计信息失败:', error);
            alert('获取数据库统计信息失败，请重试');
        }
    }
    
    // 重置数据库
    async function resetDatabase() {
        if (!auth.currentUser) {
            alert('请先登录');
            return;
        }
        
        try {
            // 关闭当前数据库连接
            sqliteManager.close();
            
            // 清除IndexedDB数据
            const dbName = 'sql.js';
            const request = indexedDB.deleteDatabase(dbName);
            
            request.onsuccess = function() {
                alert('数据库已成功重置');
                // 重新初始化数据库
                sqliteManager.init().then(() => {
                    // 刷新统计信息
                    fetchDatabaseStats();
                });
            };
            
            request.onerror = function() {
                throw new Error('删除数据库失败');
            };
            
        } catch (error) {
            console.error('重置数据库失败:', error);
            alert('重置数据库失败，请重试');
        }
    }
    
    // 导出数据
    async function exportData() {
        if (!auth.currentUser) {
            alert('请先登录');
            return;
        }
        
        try {
            await sqliteManager.init();
            
            // 获取SKU数据
            const skus = await sqliteManager.exec('SELECT * FROM skus WHERE userId = ?', [auth.currentUser.uid]);
            
            // 获取计算结果数据
            const calculations = await sqliteManager.exec('SELECT * FROM calculations WHERE userId = ?', [auth.currentUser.uid]);
            
            // 创建导出对象
            const exportData = {
                version: '1.0',
                timestamp: Date.now(),
                userId: auth.currentUser.uid,
                data: {
                    skus: skus,
                    calculations: calculations
                }
            };
            
            // 转换为JSON
            const jsonData = JSON.stringify(exportData, null, 2);
            
            // 创建下载链接
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            // 创建下载链接并触发
            const a = document.createElement('a');
            a.href = url;
            a.download = `database-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            
            // 清理
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 0);
            
        } catch (error) {
            console.error('导出数据失败:', error);
            alert('导出数据失败，请重试');
        }
    }
    
    // 导出备份数据
    async function backupData() {
        await exportData();
    }
    
    // 从备份文件恢复数据
    async function restoreData() {
        if (!auth.currentUser) {
            alert('请先登录');
            return;
        }
        
        const fileInput = document.getElementById('restoreFile');
        const file = fileInput.files[0];
        
        if (!file) {
            alert('请选择备份文件');
            return;
        }
        
        try {
            // 读取文件内容
            const reader = new FileReader();
            
            reader.onload = async function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    // 验证备份文件格式
                    if (!data.version || !data.data || !data.data.skus || !data.data.calculations) {
                        throw new Error('无效的备份文件格式');
                    }
                    
                    // 初始化数据库
                    await sqliteManager.init();
                    
                    // 恢复SKU数据
                    for (const sku of data.data.skus) {
                        // 检查记录是否存在
                        const existingResult = await sqliteManager.exec(
                            'SELECT id FROM skus WHERE id = ? AND userId = ?',
                            [sku.id, auth.currentUser.uid]
                        );
                        
                        if (existingResult.length === 0) {
                            // 不存在则插入
                            await sqliteManager.run(
                                `INSERT INTO skus 
                                (id, userId, sku, brand, category, productName, color, size, additional, createdAt)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                                [
                                    sku.id,
                                    auth.currentUser.uid,
                                    sku.sku,
                                    sku.brand || '',
                                    sku.category || '',
                                    sku.productName || '',
                                    sku.color || '',
                                    sku.size || '',
                                    sku.additional || '',
                                    sku.createdAt || Math.floor(Date.now() / 1000)
                                ]
                            );
                        }
                    }
                    
                    // 恢复计算结果数据
                    for (const calc of data.data.calculations) {
                        // 检查记录是否存在
                        const existingResult = await sqliteManager.exec(
                            'SELECT id FROM calculations WHERE id = ? AND userId = ?',
                            [calc.id, auth.currentUser.uid]
                        );
                        
                        if (existingResult.length === 0) {
                            // 不存在则插入
                            await sqliteManager.run(
                                `INSERT INTO calculations 
                                (id, userId, calculationType, inputData, resultData, createdAt)
                                VALUES (?, ?, ?, ?, ?, ?)`,
                                [
                                    calc.id,
                                    auth.currentUser.uid,
                                    calc.calculationType,
                                    calc.inputData,
                                    calc.resultData,
                                    calc.createdAt || Math.floor(Date.now() / 1000)
                                ]
                            );
                        }
                    }
                    
                    alert('数据恢复成功');
                    
                    // 刷新统计信息
                    fetchDatabaseStats();
                    
                    // 清空文件输入
                    fileInput.value = '';
                    
                } catch (error) {
                    console.error('数据恢复失败:', error);
                    alert('数据恢复失败: ' + error.message);
                }
            };
            
            reader.readAsText(file);
            
        } catch (error) {
            console.error('读取备份文件失败:', error);
            alert('读取备份文件失败，请重试');
        }
    }
    
    // 事件监听器
    viewStatsBtn.addEventListener('click', function() {
        // 显示/隐藏统计信息
        const isVisible = databaseStats.style.display !== 'none';
        databaseStats.style.display = isVisible ? 'none' : 'block';
        
        // 如果显示，则获取最新统计信息
        if (!isVisible) {
            fetchDatabaseStats();
        }
    });
    
    resetDatabaseBtn.addEventListener('click', function() {
        resetConfirmModal.show();
    });
    
    confirmResetBtn.addEventListener('click', function() {
        resetDatabase();
        resetConfirmModal.hide();
    });
    
    exportDataBtn.addEventListener('click', exportData);
    backupDataBtn.addEventListener('click', backupData);
    restoreDataBtn.addEventListener('click', restoreData);
    
    // 初始化统计信息
    fetchDatabaseStats();
}); 