// SQLite WebAssembly数据库管理器
import initSqlJs from 'sql.js';
import { SQLiteFS } from '@jlongster/sql.js-persist';
import IndexedDBBackend from '@jlongster/sql.js-persist/dist/indexeddb-backend';

// 单例模式的数据库管理器
class SQLiteManager {
  constructor() {
    this.db = null;
    this.initialized = false;
    this.initPromise = null;
    this.SQL = null;
    this.sqlFS = null;
  }

  // 初始化数据库
  async init() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise(async (resolve, reject) => {
      try {
        // 初始化SQL.js
        this.SQL = await initSqlJs({
          locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        });

        // 配置IndexedDB后端
        const backend = new IndexedDBBackend();
        this.sqlFS = new SQLiteFS(this.SQL.FS, backend);
        
        // 注册文件系统
        this.SQL.register_for_idb(this.sqlFS);

        // 确保目录存在
        this.SQL.FS.mkdir('/sql');
        this.SQL.FS.mount(this.sqlFS, {}, '/sql');
        
        // 同步文件系统
        await this.sqlFS.syncfs();
        
        // 打开数据库
        const path = '/sql/app-database.sqlite';
        
        // 检查数据库是否已存在
        if (!this.SQL.FS.analyzePath(path).exists) {
          this.db = new this.SQL.Database();
          await this.setupTables();
          this.SQL.FS.writeFile(path, this.db.export());
          this.db.close();
        }
        
        // 打开数据库
        this.db = new this.SQL.Database(path, { filename: true });
        
        this.initialized = true;
        resolve();
      } catch (error) {
        console.error('初始化SQLite数据库失败:', error);
        reject(error);
      }
    });

    return this.initPromise;
  }

  // 创建数据库表
  async setupTables() {
    // SKU表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS skus (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        sku TEXT NOT NULL,
        brand TEXT,
        category TEXT,
        productName TEXT,
        color TEXT,
        size TEXT,
        additional TEXT,
        createdAt INTEGER NOT NULL
      )
    `);

    // 计算结果表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS calculations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        calculationType TEXT NOT NULL,
        inputData TEXT NOT NULL,
        resultData TEXT NOT NULL,
        createdAt INTEGER NOT NULL
      )
    `);
    
    // 创建索引
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_skus_userId ON skus(userId);
      CREATE INDEX IF NOT EXISTS idx_calculations_userId ON calculations(userId);
    `);
  }

  // 保存到文件系统
  async persist() {
    if (!this.initialized) {
      await this.init();
    }
    
    try {
      await this.sqlFS.syncfs();
      return true;
    } catch (error) {
      console.error('持久化数据库失败:', error);
      return false;
    }
  }

  // 执行SQL查询
  async exec(sql, params = []) {
    if (!this.initialized) {
      await this.init();
    }
    
    try {
      const stmt = this.db.prepare(sql);
      stmt.bind(params);
      
      const results = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      
      stmt.free();
      return results;
    } catch (error) {
      console.error('执行SQL查询失败:', error);
      throw error;
    }
  }

  // 执行写入操作
  async run(sql, params = []) {
    if (!this.initialized) {
      await this.init();
    }
    
    try {
      const stmt = this.db.prepare(sql);
      stmt.bind(params);
      stmt.step();
      stmt.free();
      
      // 获取最后插入行的ID
      const lastId = this.db.exec('SELECT last_insert_rowid() as id')[0].values[0][0];
      
      // 持久化更改
      await this.persist();
      
      return { 
        success: true, 
        id: lastId 
      };
    } catch (error) {
      console.error('执行SQL写入操作失败:', error);
      return { 
        success: false, 
        message: error.message 
      };
    }
  }

  // 关闭数据库
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initialized = false;
      this.initPromise = null;
    }
  }
}

// 创建并导出单例实例
export const sqliteManager = new SQLiteManager();

// 获取当前时间戳
export function getCurrentTimestamp() {
  return Math.floor(Date.now() / 1000);
}

// 转换时间戳为Date对象
export function timestampToDate(timestamp) {
  return new Date(timestamp * 1000);
} 