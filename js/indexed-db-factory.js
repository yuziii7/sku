// IndexedDB数据库工厂 - 禁用功能版本

// 导出SKU数据库方法（所有方法都不执行实际功能）
export const skuDatabase = {
    /**
     * 保存生成的SKU（禁用版）
     */
    saveSku: async function() {
        console.log('SKU保存功能已禁用');
        return {
            success: false,
            message: 'SKU保存功能已禁用'
        };
    },
    
    /**
     * 获取用户的SKU历史（禁用版）
     */
    getSkuHistory: async function() {
        console.log('SKU历史功能已禁用');
        return {
            success: true,
            history: []
        };
    },
    
    /**
     * 删除SKU记录（禁用版）
     */
    deleteSku: async function() {
        console.log('SKU删除功能已禁用');
        return {
            success: false,
            message: 'SKU删除功能已禁用'
        };
    },
    
    /**
     * 搜索SKU记录（禁用版）
     */
    searchSkus: async function() {
        console.log('SKU搜索功能已禁用');
        return {
            success: true,
            results: []
        };
    }
};

// 导出FBA计算器数据库方法（所有方法都不执行实际功能）
export const fbaDatabase = {
    /**
     * 保存计算结果（禁用版）
     */
    saveCalculation: async function() {
        console.log('计算结果保存功能已禁用');
        return {
            success: false,
            message: '计算结果保存功能已禁用'
        };
    },
    
    /**
     * 获取用户历史计算结果（禁用版）
     */
    getCalculationHistory: async function() {
        console.log('计算历史功能已禁用');
        return {
            success: true,
            history: []
        };
    },
    
    /**
     * 删除计算结果（禁用版）
     */
    deleteCalculation: async function() {
        console.log('计算结果删除功能已禁用');
        return {
            success: false,
            message: '计算结果删除功能已禁用'
        };
    },
    
    /**
     * 搜索计算结果（禁用版）
     */
    searchCalculations: async function() {
        console.log('计算结果搜索功能已禁用');
        return {
            success: true,
            results: []
        };
    }
}; 