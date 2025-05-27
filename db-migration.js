// 数据库迁移工具 - 从Firebase迁移到SQLite
import { db, auth } from './firebase-config.js';
import { 
    collection, 
    getDocs, 
    query, 
    where, 
    orderBy,
    limit as firestoreLimit
} from "firebase/firestore";

import { sqliteManager, getCurrentTimestamp } from './sqlite-manager.js';

// 迁移状态跟踪
const migrationStatus = {
    inProgress: false,
    skuTotal: 0,
    skuMigrated: 0,
    calculationsTotal: 0,
    calculationsMigrated: 0,
    errors: []
};

// 获取迁移状态
export function getMigrationStatus() {
    return { ...migrationStatus };
}

// 开始迁移
export async function startMigration(progressCallback = null) {
    try {
        const user = auth.currentUser;
        
        // 检查用户是否登录
        if (!user) {
            throw new Error('用户未登录');
        }
        
        // 检查是否已在迁移
        if (migrationStatus.inProgress) {
            throw new Error('迁移已在进行中');
        }
        
        // 重置状态
        migrationStatus.inProgress = true;
        migrationStatus.skuTotal = 0;
        migrationStatus.skuMigrated = 0;
        migrationStatus.calculationsTotal = 0;
        migrationStatus.calculationsMigrated = 0;
        migrationStatus.errors = [];
        
        // 确保SQLite已初始化
        await sqliteManager.init();
        
        // 并行迁移SKU和计算结果
        await Promise.all([
            migrateSkus(user.uid, progressCallback),
            migrateCalculations(user.uid, progressCallback)
        ]);
        
        // 完成迁移
        migrationStatus.inProgress = false;
        
        if (progressCallback) {
            progressCallback({
                type: 'complete',
                status: getMigrationStatus()
            });
        }
        
        return {
            success: true,
            status: getMigrationStatus()
        };
    } catch (error) {
        console.error("迁移失败: ", error);
        
        migrationStatus.inProgress = false;
        migrationStatus.errors.push(error.message);
        
        if (progressCallback) {
            progressCallback({
                type: 'error',
                message: error.message
            });
        }
        
        return {
            success: false,
            message: error.message,
            status: getMigrationStatus()
        };
    }
}

// 迁移SKU数据
async function migrateSkus(userId, progressCallback = null) {
    try {
        // 创建查询
        const q = query(
            collection(db, "skus"), 
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
        );
        
        // 执行查询
        const querySnapshot = await getDocs(q);
        
        // 更新总数
        migrationStatus.skuTotal = querySnapshot.size;
        
        if (progressCallback) {
            progressCallback({
                type: 'start',
                entity: 'skus',
                total: migrationStatus.skuTotal
            });
        }
        
        // 批量处理结果
        const batchSize = 50;
        const batches = [];
        let currentBatch = [];
        let count = 0;
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            currentBatch.push(data);
            count++;
            
            if (currentBatch.length >= batchSize) {
                batches.push([...currentBatch]);
                currentBatch = [];
            }
        });
        
        // 添加最后一批
        if (currentBatch.length > 0) {
            batches.push(currentBatch);
        }
        
        // 逐批插入SQLite
        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            
            // 创建批量插入语句
            const valuesPlaceholders = batch.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
            const sql = `
                INSERT INTO skus (userId, sku, brand, category, productName, color, size, additional, createdAt)
                VALUES ${valuesPlaceholders}
            `;
            
            // 准备参数
            const params = [];
            batch.forEach(item => {
                params.push(
                    userId,
                    item.sku || '',
                    item.brand || '',
                    item.category || '',
                    item.productName || '',
                    item.color || '',
                    item.size || '',
                    item.additional || '',
                    item.createdAt?.seconds || getCurrentTimestamp()
                );
            });
            
            // 执行插入
            await sqliteManager.run(sql, params);
            
            // 更新进度
            migrationStatus.skuMigrated += batch.length;
            
            if (progressCallback) {
                progressCallback({
                    type: 'progress',
                    entity: 'skus',
                    migrated: migrationStatus.skuMigrated,
                    total: migrationStatus.skuTotal
                });
            }
        }
        
        return {
            success: true,
            migrated: migrationStatus.skuMigrated
        };
    } catch (error) {
        console.error("迁移SKU失败: ", error);
        migrationStatus.errors.push(`SKU迁移错误: ${error.message}`);
        throw error;
    }
}

// 迁移计算结果数据
async function migrateCalculations(userId, progressCallback = null) {
    try {
        // 创建查询
        const q = query(
            collection(db, "calculations"), 
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
        );
        
        // 执行查询
        const querySnapshot = await getDocs(q);
        
        // 更新总数
        migrationStatus.calculationsTotal = querySnapshot.size;
        
        if (progressCallback) {
            progressCallback({
                type: 'start',
                entity: 'calculations',
                total: migrationStatus.calculationsTotal
            });
        }
        
        // 批量处理结果
        const batchSize = 50;
        const batches = [];
        let currentBatch = [];
        let count = 0;
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            currentBatch.push(data);
            count++;
            
            if (currentBatch.length >= batchSize) {
                batches.push([...currentBatch]);
                currentBatch = [];
            }
        });
        
        // 添加最后一批
        if (currentBatch.length > 0) {
            batches.push(currentBatch);
        }
        
        // 逐批插入SQLite
        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            
            // 创建批量插入语句
            const valuesPlaceholders = batch.map(() => '(?, ?, ?, ?, ?)').join(', ');
            const sql = `
                INSERT INTO calculations (userId, calculationType, inputData, resultData, createdAt)
                VALUES ${valuesPlaceholders}
            `;
            
            // 准备参数
            const params = [];
            batch.forEach(item => {
                params.push(
                    userId,
                    item.calculationType || 'unknown',
                    JSON.stringify(item.inputData || {}),
                    JSON.stringify(item.resultData || {}),
                    item.createdAt?.seconds || getCurrentTimestamp()
                );
            });
            
            // 执行插入
            await sqliteManager.run(sql, params);
            
            // 更新进度
            migrationStatus.calculationsMigrated += batch.length;
            
            if (progressCallback) {
                progressCallback({
                    type: 'progress',
                    entity: 'calculations',
                    migrated: migrationStatus.calculationsMigrated,
                    total: migrationStatus.calculationsTotal
                });
            }
        }
        
        return {
            success: true,
            migrated: migrationStatus.calculationsMigrated
        };
    } catch (error) {
        console.error("迁移计算结果失败: ", error);
        migrationStatus.errors.push(`计算结果迁移错误: ${error.message}`);
        throw error;
    }
} 