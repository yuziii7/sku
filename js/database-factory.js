// 数据库工厂 - SQLite数据库实现
import * as sqliteSku from './sku-database-sqlite.js';
import * as sqliteFba from './fba-database-sqlite.js';

// 导出SKU数据库方法
export const skuDatabase = {
    /**
     * 保存生成的SKU
     * @param {Object} skuData - SKU数据
     * @returns {Promise<Object>} 保存结果
     */
    saveSku: async function(skuData) {
        return sqliteSku.saveSku(skuData);
    },
    
    /**
     * 获取用户的SKU历史
     * @param {number} limitCount - 限制返回的记录数
     * @returns {Promise<Object>} 历史记录
     */
    getSkuHistory: async function(limitCount = 20) {
        return sqliteSku.getSkuHistory(limitCount);
    },
    
    /**
     * 删除SKU记录
     * @param {string|number} skuId - SKU ID
     * @returns {Promise<Object>} 删除结果
     */
    deleteSku: async function(skuId) {
        return sqliteSku.deleteSku(skuId);
    },
    
    /**
     * 搜索SKU记录
     * @param {string} searchTerm - 搜索词
     * @returns {Promise<Object>} 搜索结果
     */
    searchSkus: async function(searchTerm) {
        return sqliteSku.searchSkus(searchTerm);
    }
};

// 导出FBA计算器数据库方法
export const fbaDatabase = {
    /**
     * 保存计算结果
     * @param {string} calculationType - 计算类型
     * @param {Object} inputData - 输入数据
     * @param {Object} resultData - 结果数据
     * @returns {Promise<Object>} 保存结果
     */
    saveCalculation: async function(calculationType, inputData, resultData) {
        return sqliteFba.saveCalculation(calculationType, inputData, resultData);
    },
    
    /**
     * 获取用户历史计算结果
     * @param {string|null} calculationType - 计算类型
     * @param {number} limitCount - 限制返回的记录数
     * @returns {Promise<Object>} 历史记录
     */
    getCalculationHistory: async function(calculationType = null, limitCount = 10) {
        return sqliteFba.getCalculationHistory(calculationType, limitCount);
    },
    
    /**
     * 删除计算结果
     * @param {string|number} calculationId - 计算结果ID
     * @returns {Promise<Object>} 删除结果
     */
    deleteCalculation: async function(calculationId) {
        return sqliteFba.deleteCalculation(calculationId);
    },
    
    /**
     * 搜索计算结果
     * @param {string} searchTerm - 搜索词
     * @returns {Promise<Object>} 搜索结果
     */
    searchCalculations: async function(searchTerm) {
        return sqliteFba.searchCalculations(searchTerm);
    }
}; 