/**
 * Google Sheets 变体管理器
 * 用于管理SKU生成器的变体数据
 * Sheet ID: 1bT2cXdcyx91esIfs3sIbq2lDUe1NVZ8LrHSwuAOZqag
 */

class GoogleSheetsManager {
    constructor() {
        this.sheetId = '1bT2cXdcyx91esIfs3sIbq2lDUe1NVZ8LrHSwuAOZqag';
        this.apiKey = ''; // 需要用户设置
        this.baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
        this.isConnected = false;
        this.cache = new Map(); // 本地缓存
        this.lastSyncTime = null;
        
        // 工作表配置
        this.sheets = {
            colors: 'Colors',
            animals: 'Animals', 
            professions: 'Professions',
            humor: 'Humor',
            roles: 'Roles',
            festivals: 'Garments',
            styles: 'Accessories',
            crowdSizes: 'Inflatables'
        };
    }

    /**
     * 设置API密钥并测试连接
     */
    async setApiKey(apiKey) {
        this.apiKey = apiKey;
        try {
            await this.testConnection();
            this.isConnected = true;
            localStorage.setItem('googleSheetsApiKey', apiKey);
            return { success: true, message: '连接成功！' };
        } catch (error) {
            this.isConnected = false;
            return { success: false, message: `连接失败: ${error.message}` };
        }
    }

    /**
     * 测试Google Sheets连接
     */
    async testConnection() {
        const url = `${this.baseUrl}/${this.sheetId}?key=${this.apiKey}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
    }

    /**
     * 从本地存储加载API密钥
     */
    loadApiKey() {
        const savedKey = localStorage.getItem('googleSheetsApiKey');
        if (savedKey) {
            this.apiKey = savedKey;
            return true;
        }
        return false;
    }

    /**
     * 读取指定工作表的数据
     */
    async readSheet(sheetName, range = 'A:X') {
        if (!this.apiKey) {
            throw new Error('请先设置API密钥');
        }

        const fullRange = `${sheetName}!${range}`;
        const url = `${this.baseUrl}/${this.sheetId}/values/${fullRange}?key=${this.apiKey}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`读取失败: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data.values || [];
        } catch (error) {
            console.error('读取工作表失败:', error);
            throw error;
        }
    }

    /**
     * 写入数据到指定工作表
     */
    async writeSheet(sheetName, range, values) {
        if (!this.apiKey) {
            throw new Error('请先设置API密钥');
        }

        const fullRange = `${sheetName}!${range}`;
        const url = `${this.baseUrl}/${this.sheetId}/values/${fullRange}?valueInputOption=RAW&key=${this.apiKey}`;
        
        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    values: values
                })
            });
            
            if (!response.ok) {
                throw new Error(`写入失败: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('写入工作表失败:', error);
            throw error;
        }
    }

    /**
     * 更新指定范围的数据
     */
    async updateSheet(sheetName, range, values) {
        if (!this.apiKey) {
            throw new Error('请先设置API密钥');
        }

        const url = `${this.baseUrl}/${this.sheetId}/values/${range}?valueInputOption=RAW&key=${this.apiKey}`;
        
        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    values: values
                })
            });
            
            if (!response.ok) {
                throw new Error(`更新失败: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('更新工作表失败:', error);
            throw error;
        }
    }

    /**
     * 追加数据到工作表
     */
    async appendToSheet(sheetName, values) {
        if (!this.apiKey) {
            throw new Error('请先设置API密钥');
        }

        const range = `${sheetName}!A:C`;
        const url = `${this.baseUrl}/${this.sheetId}/values/${range}:append?valueInputOption=RAW&key=${this.apiKey}`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    values: [values]
                })
            });
            
            if (!response.ok) {
                throw new Error(`追加失败: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('追加数据失败:', error);
            throw error;
        }
    }

    /**
     * 获取变体数据
     */
    async getVariants(category) {
        try {
            console.log(`正在从Google Sheets获取${category}变体数据`);
            // 所有变体都从colors工作表读取
            const data = await this.readSheet('Colors');
            console.log(`Colors工作表原始数据:`, data);
            
            const variants = this.parseHorizontalVariantData(data, category);
            console.log(`${category}解析后的变体:`, variants);
            
            return variants;
        } catch (error) {
            console.error(`获取${category}变体失败:`, error);
            console.error(`错误详情 - 类别: ${category}, API密钥存在: ${!!this.apiKey}`);
            
            // 如果在线获取失败，尝试从本地存储获取
            const localVariants = this.getLocalVariants(category);
            console.log(`从本地存储获取${category}变体:`, localVariants);
            return localVariants;
        }
    }

    /**
     * 解析变体数据
     */
    parseVariantData(data) {
        if (!data || data.length === 0) {
            return {};
        }

        const variants = {};
        // 跳过标题行
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            if (row.length >= 2) {
                const name = row[1]; // B列：名称
                const code = row[2] || ''; // C列：代码
                if (name) {
                    variants[name] = code;
                }
            }
        }
        
        return variants;
    }

    /**
     * 解析横向排列的变体数据
     * 数据结构：颜色(A-C列)、动物(D-F列)、职业(G-I列)、幽默(J-L列)、角色(M-O列)
     * 每个类别占3列：ID、名称、代码
     */
    parseHorizontalVariantData(data, category) {
        if (!data || data.length === 0) {
            return {};
        }

        // 定义列映射
        const columnMapping = {
            'colors': { start: 0, end: 2 },     // A-C列 (0-2)
            'animals': { start: 3, end: 5 },    // D-F列 (3-5)
            'professions': { start: 6, end: 8 }, // G-I列 (6-8)
            'humor': { start: 9, end: 11 },     // J-L列 (9-11)
            'roles': { start: 12, end: 14 },    // M-O列 (12-14)
            'festivals': { start: 15, end: 17 }, // P-R列 (15-17) - 节日
            'styles': { start: 18, end: 20 },   // S-U列 (18-20) - 配件
            'crowdSizes': { start: 21, end: 23 } // V-X列 (21-23) - 充气
        };

        const mapping = columnMapping[category];
        if (!mapping) {
            console.warn(`未知的变体类别: ${category}`);
            return {};
        }

        const variants = {};
        // 跳过标题行
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            if (row.length > mapping.end) {
                const name = row[mapping.start + 1]; // 名称列
                const code = row[mapping.start + 2] || ''; // 代码列
                if (name && name.trim()) {
                    variants[name.trim()] = code.trim();
                }
            }
        }
        
        console.log(`解析${category}变体，列范围: ${mapping.start}-${mapping.end}，结果:`, variants);
        return variants;
    }

    /**
     * 添加新变体
     */
    async addVariant(category, name, code) {
        // 定义列映射
        const columnMapping = {
            'colors': { start: 0, end: 2 },     // A-C列
            'animals': { start: 3, end: 5 },    // D-F列
            'professions': { start: 6, end: 8 }, // G-I列
            'humor': { start: 9, end: 11 },     // J-L列
            'roles': { start: 12, end: 14 },    // M-O列
            'festivals': { start: 15, end: 17 }, // P-R列 - 节日
            'styles': { start: 18, end: 20 },   // S-U列 - 配件
            'crowdSizes': { start: 21, end: 23 } // V-X列 - 充气
        };

        const mapping = columnMapping[category];
        if (!mapping) {
            throw new Error(`未知的变体类别: ${category}`);
        }

        try {
            // 获取现有数据
            const existingData = await this.readSheet('Colors');
            
            // 找到该类别的下一个可用行
            let nextRow = existingData.length;
            
            // 创建新行数据，初始化为空数组
            const newRowData = new Array(24).fill(''); // 24列 (A-X)
            
            // 计算ID（该类别现有数据的数量 + 1）
            let categoryCount = 0;
            for (let i = 1; i < existingData.length; i++) {
                if (existingData[i][mapping.start + 1]) { // 检查名称列是否有数据
                    categoryCount++;
                }
            }
            
            // 设置新变体数据
            newRowData[mapping.start] = categoryCount + 1; // ID
            newRowData[mapping.start + 1] = name;          // 名称
            newRowData[mapping.start + 2] = code;          // 代码
            
            // 如果是在现有行中添加，需要合并数据
            if (nextRow < existingData.length) {
                // 找到第一个该类别为空的行
                for (let i = 1; i < existingData.length; i++) {
                    if (!existingData[i][mapping.start + 1]) {
                        nextRow = i;
                        break;
                    }
                }
            }
            
            // 使用更新而不是追加
            const range = `Colors!A${nextRow + 1}:X${nextRow + 1}`;
            await this.updateSheet('Colors', range, [newRowData]);
            
            // 清除缓存
            this.cache.delete(`variants_${category}`);
            
            // 同步到本地存储
            this.saveToLocalStorage(category, name, code);
            
            return { success: true, message: '变体添加成功！' };
        } catch (error) {
            console.error('添加变体失败:', error);
            // 如果在线添加失败，保存到本地
            this.saveToLocalStorage(category, name, code);
            return { success: false, message: `添加失败，已保存到本地: ${error.message}` };
        }
    }

    /**
     * 同步所有变体数据
     */
    async syncAllVariants() {
        const results = {};
        const categories = Object.keys(this.sheets);
        
        for (const category of categories) {
            try {
                const variants = await this.getVariants(category);
                results[category] = variants;
            } catch (error) {
                console.error(`同步${category}失败:`, error);
                results[category] = this.getLocalVariants(category);
            }
        }
        
        this.lastSyncTime = new Date();
        localStorage.setItem('lastSyncTime', this.lastSyncTime.toISOString());
        
        return results;
    }

    /**
     * 保存到本地存储
     */
    saveToLocalStorage(category, name, code) {
        const key = `local_variants_${category}`;
        const existing = JSON.parse(localStorage.getItem(key) || '{}');
        existing[name] = code;
        localStorage.setItem(key, JSON.stringify(existing));
    }

    /**
     * 从本地存储获取变体
     */
    getLocalVariants(category) {
        const key = `local_variants_${category}`;
        return JSON.parse(localStorage.getItem(key) || '{}');
    }

    /**
     * 获取连接状态
     */
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            hasApiKey: !!this.apiKey,
            lastSyncTime: this.lastSyncTime
        };
    }

    /**
     * 清除缓存
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * 导出配置
     */
    exportConfig() {
        return {
            sheetId: this.sheetId,
            sheets: this.sheets,
            lastSyncTime: this.lastSyncTime
        };
    }
}

// 创建全局实例
window.googleSheetsManager = new GoogleSheetsManager();