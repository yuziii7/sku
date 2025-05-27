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
    console.log('SQLiteManager实例已创建');
  }

  // 初始化数据库
  async init() {
    if (this.initPromise) {
      console.log('SQLite初始化已在进行中，返回现有Promise');
      return this.initPromise;
    }

    console.log('开始SQLite初始化...');
    this.initPromise = new Promise(async (resolve, reject) => {
      try {
        // 初始化SQL.js
        console.log('加载SQL.js WebAssembly模块...');
        this.SQL = await initSqlJs({
          locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        });
        console.log('SQL.js加载成功');

        // 配置IndexedDB后端
        console.log('配置IndexedDB后端...');
        const backend = new IndexedDBBackend();
        this.sqlFS = new SQLiteFS(this.SQL.FS, backend);
        
        // 注册文件系统
        console.log('注册SQLite文件系统...');
        this.SQL.register_for_idb(this.sqlFS);

        // 确保目录存在
        console.log('创建/sql目录...');
        try {
          this.SQL.FS.mkdir('/sql');
        } catch (e) {
          if (e.code !== 'EEXIST') {
            throw e;
          }
          console.log('/sql目录已存在');
        }
        
        console.log('挂载SQL文件系统...');
        this.SQL.FS.mount(this.sqlFS, {}, '/sql');
        
        // 同步文件系统
        console.log('同步文件系统...');
        await this.sqlFS.syncfs();
        
        // 打开数据库
        const path = '/sql/app-database.sqlite';
        console.log('检查数据库文件:', path);
        
        // 检查数据库是否已存在
        const pathExists = this.SQL.FS.analyzePath(path).exists;
        console.log('数据库文件存在状态:', pathExists);
        
        if (!pathExists) {
          console.log('数据库文件不存在，创建新数据库...');
          this.db = new this.SQL.Database();
          console.log('设置数据库表...');
          await this.setupTables();
          console.log('导出并保存数据库文件...');
          this.SQL.FS.writeFile(path, this.db.export());
          this.db.close();
          console.log('数据库文件已创建');
        } else {
          console.log('数据库文件已存在，直接打开');
        }
        
        // 打开数据库
        console.log('打开数据库连接...');
        this.db = new this.SQL.Database(path, { filename: true });
        console.log('数据库连接已建立');
        
        this.initialized = true;
        console.log('SQLite初始化完成');
        resolve();
      } catch (error) {
        console.error('初始化SQLite数据库失败:', error);
        // 清理资源
        if (this.db) {
          try {
            this.db.close();
          } catch (e) {
            console.error('关闭数据库连接失败:', e);
          }
          this.db = null;
        }
        this.initialized = false;
        this.initPromise = null;
        reject(error);
      }
    });

    return this.initPromise;
  }

  // 创建数据库表
  async setupTables() {
    console.log('创建SKU表...');
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

    console.log('创建计算结果表...');
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
    
    console.log('创建用户表...');
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        uid TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        displayName TEXT,
        password TEXT,
        isAnonymous INTEGER,
        createdAt INTEGER
      )
    `);
    
    console.log('创建索引...');
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_skus_userId ON skus(userId);
      CREATE INDEX IF NOT EXISTS idx_calculations_userId ON calculations(userId);
    `);
    
    console.log('表创建完成');
  }

  // 保存到文件系统
  async persist() {
    if (!this.initialized) {
      console.log('数据库未初始化，先进行初始化');
      await this.init();
    }
    
    try {
      console.log('同步文件系统...');
      await this.sqlFS.syncfs();
      console.log('同步完成');
      return true;
    } catch (error) {
      console.error('持久化数据库失败:', error);
      return false;
    }
  }

  // 执行SQL查询
  async exec(sql, params = []) {
    if (!this.initialized) {
      console.log('数据库未初始化，先进行初始化');
      await this.init();
    }
    
    try {
      console.log('执行SQL查询:', sql.substring(0, 50) + '...');
      console.log('参数:', params);
      const stmt = this.db.prepare(sql);
      stmt.bind(params);
      
      const results = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      
      stmt.free();
      console.log('查询完成，返回结果数:', results.length);
      return results;
    } catch (error) {
      console.error('执行SQL查询失败:', error);
      throw error;
    }
  }

  // 执行写入操作
  async run(sql, params = []) {
    if (!this.initialized) {
      console.log('数据库未初始化，先进行初始化');
      await this.init();
    }
    
    try {
      console.log('执行SQL写入操作:', sql.substring(0, 50) + '...');
      console.log('参数:', params);
      const stmt = this.db.prepare(sql);
      stmt.bind(params);
      stmt.step();
      stmt.free();
      
      // 获取最后插入行的ID
      const lastId = this.db.exec('SELECT last_insert_rowid() as id')[0].values[0][0];
      console.log('写入操作完成，最后插入ID:', lastId);
      
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
      console.log('关闭数据库连接');
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