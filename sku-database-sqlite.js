// SKU生成器SQLite数据库工具
import { sqliteManager, getCurrentTimestamp, timestampToDate } from './sqlite-manager.js';
import { auth } from './user-manager.js';

// 保存生成的SKU
export async function saveSku(skuData) {
    try {
        const user = auth.currentUser;
        
        // 检查用户是否登录
        if (!user) {
            throw new Error('用户未登录');
        }
        
        // 准备插入数据
        const sql = `
            INSERT INTO skus (userId, sku, brand, category, productName, color, size, additional, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            user.uid,
            skuData.sku,
            skuData.brand || '',
            skuData.category || '',
            skuData.productName || '',
            skuData.color || '',
            skuData.size || '',
            skuData.additional || '',
            getCurrentTimestamp()
        ];
        
        // 执行SQL插入
        const result = await sqliteManager.run(sql, params);
        
        if (result.success) {
            return {
                success: true,
                id: result.id,
                message: 'SKU已保存'
            };
        } else {
            throw new Error(result.message || '保存SKU失败');
        }
    } catch (error) {
        console.error("Error saving SKU: ", error);
        return {
            success: false,
            message: error.message
        };
    }
}

// 获取用户的SKU历史
export async function getSkuHistory(limitCount = 20) {
    try {
        const user = auth.currentUser;
        
        // 检查用户是否登录
        if (!user) {
            throw new Error('用户未登录');
        }
        
        // 准备查询
        const sql = `
            SELECT id, sku, brand, category, productName, color, size, additional, createdAt
            FROM skus
            WHERE userId = ?
            ORDER BY createdAt DESC
            LIMIT ?
        `;
        
        // 执行查询
        const results = await sqliteManager.exec(sql, [user.uid, limitCount]);
        
        // 处理结果
        const history = results.map(row => {
            return {
                id: row.id,
                sku: row.sku,
                brand: row.brand,
                category: row.category,
                productName: row.productName,
                color: row.color,
                size: row.size,
                additional: row.additional,
                createdAt: timestampToDate(row.createdAt)
            };
        });
        
        return {
            success: true,
            history: history
        };
    } catch (error) {
        console.error("Error getting SKU history: ", error);
        return {
            success: false,
            message: error.message
        };
    }
}

// 删除SKU记录
export async function deleteSku(skuId) {
    try {
        const user = auth.currentUser;
        
        // 检查用户是否登录
        if (!user) {
            throw new Error('用户未登录');
        }
        
        // 准备删除语句
        const sql = `
            DELETE FROM skus
            WHERE id = ? AND userId = ?
        `;
        
        // 执行删除
        await sqliteManager.run(sql, [skuId, user.uid]);
        
        return {
            success: true,
            message: 'SKU已删除'
        };
    } catch (error) {
        console.error("Error deleting SKU: ", error);
        return {
            success: false,
            message: error.message
        };
    }
}

// 搜索SKU记录
export async function searchSkus(searchTerm) {
    try {
        const user = auth.currentUser;
        
        // 检查用户是否登录
        if (!user) {
            throw new Error('用户未登录');
        }
        
        // 准备模糊搜索
        const term = `%${searchTerm}%`;
        
        // 准备查询语句
        const sql = `
            SELECT id, sku, brand, category, productName, color, size, additional, createdAt
            FROM skus
            WHERE userId = ? AND (
                sku LIKE ? OR
                brand LIKE ? OR
                category LIKE ? OR
                productName LIKE ? OR
                color LIKE ? OR
                size LIKE ? OR
                additional LIKE ?
            )
            ORDER BY createdAt DESC
            LIMIT 50
        `;
        
        // 执行查询
        const params = [user.uid, term, term, term, term, term, term, term];
        const results = await sqliteManager.exec(sql, params);
        
        // 处理结果
        const matches = results.map(row => {
            return {
                id: row.id,
                sku: row.sku,
                brand: row.brand,
                category: row.category,
                productName: row.productName,
                color: row.color,
                size: row.size,
                additional: row.additional,
                createdAt: timestampToDate(row.createdAt)
            };
        });
        
        return {
            success: true,
            results: matches
        };
    } catch (error) {
        console.error("Error searching SKUs: ", error);
        return {
            success: false,
            message: error.message
        };
    }
} 