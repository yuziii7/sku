// FBA计算器SQLite数据库工具
import { sqliteManager, getCurrentTimestamp, timestampToDate } from './sqlite-manager.js';
import { auth } from './user-manager.js';

// 保存计算结果
export async function saveCalculation(calculationType, inputData, resultData) {
    try {
        const user = auth.currentUser;
        
        // 检查用户是否登录
        if (!user) {
            throw new Error('用户未登录');
        }
        
        // 准备插入数据
        const sql = `
            INSERT INTO calculations (userId, calculationType, inputData, resultData, createdAt)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        // 将对象转换为JSON字符串
        const inputJson = JSON.stringify(inputData);
        const resultJson = JSON.stringify(resultData);
        
        const params = [
            user.uid,
            calculationType,
            inputJson,
            resultJson,
            getCurrentTimestamp()
        ];
        
        // 执行SQL插入
        const result = await sqliteManager.run(sql, params);
        
        if (result.success) {
            return {
                success: true,
                id: result.id,
                message: '计算结果已保存'
            };
        } else {
            throw new Error(result.message || '保存计算结果失败');
        }
    } catch (error) {
        console.error("Error saving calculation: ", error);
        return {
            success: false,
            message: error.message
        };
    }
}

// 获取用户历史计算结果
export async function getCalculationHistory(calculationType = null, limitCount = 10) {
    try {
        const user = auth.currentUser;
        
        // 检查用户是否登录
        if (!user) {
            throw new Error('用户未登录');
        }
        
        // 准备查询
        let sql, params;
        
        if (calculationType) {
            sql = `
                SELECT id, calculationType, inputData, resultData, createdAt
                FROM calculations
                WHERE userId = ? AND calculationType = ?
                ORDER BY createdAt DESC
                LIMIT ?
            `;
            params = [user.uid, calculationType, limitCount];
        } else {
            sql = `
                SELECT id, calculationType, inputData, resultData, createdAt
                FROM calculations
                WHERE userId = ?
                ORDER BY createdAt DESC
                LIMIT ?
            `;
            params = [user.uid, limitCount];
        }
        
        // 执行查询
        const results = await sqliteManager.exec(sql, params);
        
        // 处理结果
        const history = results.map(row => {
            return {
                id: row.id,
                calculationType: row.calculationType,
                inputData: JSON.parse(row.inputData),
                resultData: JSON.parse(row.resultData),
                createdAt: timestampToDate(row.createdAt)
            };
        });
        
        return {
            success: true,
            history: history
        };
    } catch (error) {
        console.error("Error getting calculation history: ", error);
        return {
            success: false,
            message: error.message
        };
    }
}

// 删除计算结果
export async function deleteCalculation(calculationId) {
    try {
        const user = auth.currentUser;
        
        // 检查用户是否登录
        if (!user) {
            throw new Error('用户未登录');
        }
        
        // 准备删除语句
        const sql = `
            DELETE FROM calculations
            WHERE id = ? AND userId = ?
        `;
        
        // 执行删除
        await sqliteManager.run(sql, [calculationId, user.uid]);
        
        return {
            success: true,
            message: '计算结果已删除'
        };
    } catch (error) {
        console.error("Error deleting calculation: ", error);
        return {
            success: false,
            message: error.message
        };
    }
}

// 按条件搜索计算结果
export async function searchCalculations(searchTerm) {
    try {
        const user = auth.currentUser;
        
        // 检查用户是否登录
        if (!user) {
            throw new Error('用户未登录');
        }
        
        // 准备模糊搜索
        const term = `%${searchTerm}%`;
        
        // 准备查询语句 - 在JSON字段中搜索相当复杂，这里做了简化处理
        const sql = `
            SELECT id, calculationType, inputData, resultData, createdAt
            FROM calculations
            WHERE userId = ? AND (
                calculationType LIKE ? OR
                inputData LIKE ? OR
                resultData LIKE ?
            )
            ORDER BY createdAt DESC
            LIMIT 50
        `;
        
        // 执行查询
        const params = [user.uid, term, term, term];
        const results = await sqliteManager.exec(sql, params);
        
        // 处理结果
        const matches = results.map(row => {
            return {
                id: row.id,
                calculationType: row.calculationType,
                inputData: JSON.parse(row.inputData),
                resultData: JSON.parse(row.resultData),
                createdAt: timestampToDate(row.createdAt)
            };
        });
        
        return {
            success: true,
            results: matches
        };
    } catch (error) {
        console.error("Error searching calculations: ", error);
        return {
            success: false,
            message: error.message
        };
    }
} 