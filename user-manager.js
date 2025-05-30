// 本地用户管理器 - 替代Firebase认证系统
import { sqliteManager, getCurrentTimestamp } from './sqlite-manager.js';

// 存储用户信息的键
const USER_KEY = 'current_user';

// 模拟认证事件监听器
const authStateListeners = [];

// 本地用户类
class User {
  constructor(data) {
    this.uid = data.uid || '';
    this.email = data.email || '';
    this.displayName = data.displayName || '';
    this.isAnonymous = data.isAnonymous || false;
    this.createdAt = data.createdAt || getCurrentTimestamp();
  }
}

// 认证管理器
class UserManager {
  constructor() {
    // 从本地存储中恢复用户状态
    this.currentUser = null;
    this.isInitialized = false;
    this._init();
  }

  // 初始化用户管理器
  async _init() {
    try {
      // 首先尝试从本地存储恢复用户
      const savedUser = localStorage.getItem(USER_KEY);
      if (savedUser) {
        try {
          this.currentUser = new User(JSON.parse(savedUser));
          // 通知监听器用户已登录
          this._notifyAuthStateChanged();
        } catch (e) {
          console.error('解析保存的用户数据失败:', e);
          localStorage.removeItem(USER_KEY); // 清除无效数据
        }
      }
      
      // 尝试初始化数据库，但不要阻止应用继续
      try {
        // 确保用户表已创建
        await this._createUserTable();
        
        // 创建默认的admin账户
        await this._createAdminUser();
        
        this.isInitialized = true;
      } catch (err) {
        console.error('初始化用户表失败:', err);
        // 不要阻止应用继续，使用内存用户
      }
    } catch (error) {
      console.error('初始化用户管理器失败:', error);
      // 即使初始化失败，也允许应用继续运行
    }
  }

  // 保存用户状态到本地存储
  _saveUserState() {
    if (this.currentUser) {
      try {
        localStorage.setItem(USER_KEY, JSON.stringify(this.currentUser));
      } catch (e) {
        console.error('保存用户状态失败:', e);
        // 继续运行，但用户状态不会持久化
      }
    } else {
      try {
        localStorage.removeItem(USER_KEY);
      } catch (e) {
        console.error('移除用户状态失败:', e);
      }
    }
  }

  // 通知认证状态变化
  _notifyAuthStateChanged() {
    authStateListeners.forEach(listener => {
      try {
        listener(this.currentUser);
      } catch (error) {
        console.error('通知认证状态变化失败:', error);
      }
    });
  }

  // 创建用户数据库表
  async _createUserTable() {
    console.log('正在初始化用户表...');
    try {
      await sqliteManager.init();
      
      console.log('创建users表...');
      await sqliteManager.run(`
        CREATE TABLE IF NOT EXISTS users (
          uid TEXT PRIMARY KEY,
          email TEXT UNIQUE,
          displayName TEXT,
          password TEXT,
          isAnonymous INTEGER,
          createdAt INTEGER
        )
      `);
      console.log('用户表创建成功');
      return true;
    } catch (error) {
      console.error('创建用户表失败:', error);
      return false;
    }
  }

  // 创建admin测试账户
  async _createAdminUser() {
    try {
      console.log('检查admin账户...');
      // 检查admin账户是否已存在
      const existingAdmin = await sqliteManager.exec(
        'SELECT * FROM users WHERE email = ?', 
        ['admin']
      );
      
      // 如果已存在，不需要再创建
      if (existingAdmin.length > 0) {
        console.log('Admin测试账户已存在', existingAdmin[0]);
        return;
      }
      
      // 创建admin账户
      const uid = 'admin_' + Math.random().toString(36).substr(2, 9);
      const timestamp = getCurrentTimestamp();
      
      console.log('创建Admin测试账户...');
      
      // 将用户信息存入数据库
      const result = await sqliteManager.run(
        'INSERT INTO users (uid, email, displayName, password, isAnonymous, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
        [uid, 'admin', 'Admin用户', 'admin', 0, timestamp]
      );
      
      if (result.success) {
        console.log('Admin测试账户创建成功:', result);
      } else {
        console.error('创建Admin测试账户失败:', result.message);
      }
    } catch (error) {
      console.error('创建Admin测试账户出错:', error);
    }
  }

  // 注册新用户
  async registerUser(username, password, displayName = '') {
    try {
      console.log('开始注册用户:', username);
      
      // 检查数据库是否可用
      const dbStatus = await this._checkDatabaseAvailability();
      
      if (dbStatus.available) {
        // 数据库可用，正常注册流程
        await this._createUserTable();
        
        // 检查用户名是否已注册
        const existingUser = await sqliteManager.exec(
          'SELECT * FROM users WHERE email = ?', 
          [username]
        );
        
        if (existingUser.length > 0) {
          throw new Error('该用户名已被注册');
        }
        
        // 生成用户ID
        const uid = 'user_' + Math.random().toString(36).substr(2, 9);
        const timestamp = getCurrentTimestamp();
        
        console.log('创建新用户记录:', uid);
        
        // 将用户信息存入数据库
        const result = await sqliteManager.run(
          'INSERT INTO users (uid, email, displayName, password, isAnonymous, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
          [uid, username, displayName || username, password, 0, timestamp]
        );
        
        if (!result.success) {
          throw new Error(result.message || '创建用户记录失败');
        }
        
        console.log('用户记录创建成功');
        
        // 创建用户对象
        this.currentUser = new User({
          uid,
          email: username,
          displayName: displayName || username,
          isAnonymous: false,
          createdAt: timestamp
        });
      } else {
        // 数据库不可用，创建内存中的临时用户
        console.warn('数据库不可用，创建内存临时用户');
        
        // 生成临时用户ID
        const uid = 'temp_' + Math.random().toString(36).substr(2, 9);
        const timestamp = getCurrentTimestamp();
        
        // 创建内存用户对象
        this.currentUser = new User({
          uid,
          email: username,
          displayName: displayName || username,
          isAnonymous: false,
          createdAt: timestamp
        });
        
        console.log('创建了临时用户:', this.currentUser);
      }
      
      this._saveUserState();
      this._notifyAuthStateChanged();
      
      return {
        success: true,
        user: this.currentUser,
        isTemporary: !dbStatus.available
      };
    } catch (error) {
      console.error('注册用户失败:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // 用户登录
  async signIn(username, password) {
    try {
      // 检查数据库是否可用
      const dbStatus = await this._checkDatabaseAvailability();
      
      if (dbStatus.available) {
        // 数据库可用，正常登录流程
        await this._createUserTable();
        
        // 特殊处理admin账户
        if (username === 'admin' && password === 'admin') {
          // 确保admin账户存在
          await this._createAdminUser();
        }
        
        // 查询用户
        const users = await sqliteManager.exec(
          'SELECT * FROM users WHERE email = ? AND password = ?',
          [username, password]
        );
        
        if (users.length === 0) {
          throw new Error('用户名或密码不正确');
        }
        
        const userData = users[0];
        
        // 创建用户对象
        this.currentUser = new User({
          uid: userData.uid,
          email: userData.email,
          displayName: userData.displayName || userData.email,
          isAnonymous: userData.isAnonymous === 1,
          createdAt: userData.createdAt
        });
      } else {
        // 数据库不可用，特殊处理admin账户或显示错误
        if (username === 'admin' && password === 'admin') {
          console.warn('数据库不可用，为admin创建临时账户');
          
          // 为admin创建临时账户
          const uid = 'temp_admin_' + Math.random().toString(36).substr(2, 9);
          const timestamp = getCurrentTimestamp();
          
          this.currentUser = new User({
            uid,
            email: 'admin',
            displayName: 'Admin用户',
            isAnonymous: false,
            createdAt: timestamp
          });
        } else {
          // 其他账户显示错误
          throw new Error('登录服务暂时不可用，请稍后重试或使用admin账户');
        }
      }
      
      this._saveUserState();
      this._notifyAuthStateChanged();
      
      return {
        success: true,
        user: this.currentUser,
        isTemporary: !dbStatus.available && username === 'admin'
      };
    } catch (error) {
      console.error('用户登录失败:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // 匿名登录
  async signInAnonymously() {
    try {
      // 检查数据库是否可用
      const dbStatus = await this._checkDatabaseAvailability();
      
      // 生成匿名用户ID
      const uid = 'anon_' + Math.random().toString(36).substr(2, 9);
      const timestamp = getCurrentTimestamp();
      
      if (dbStatus.available) {
        await this._createUserTable();
        
        // 将匿名用户信息存入数据库
        await sqliteManager.run(
          'INSERT INTO users (uid, email, displayName, password, isAnonymous, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
          [uid, '', 'Anonymous User', '', 1, timestamp]
        );
      } else {
        console.warn('数据库不可用，仅创建内存中的匿名用户');
      }
      
      // 创建用户对象
      this.currentUser = new User({
        uid,
        email: '',
        displayName: 'Anonymous User',
        isAnonymous: true,
        createdAt: timestamp
      });
      
      this._saveUserState();
      this._notifyAuthStateChanged();
      
      return {
        success: true,
        user: this.currentUser
      };
    } catch (error) {
      console.error('匿名登录失败:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  // 退出登录
  async signOut() {
    this.currentUser = null;
    this._saveUserState();
    this._notifyAuthStateChanged();
    
    return {
      success: true
    };
  }

  // 监听认证状态变化
  onAuthStateChanged(listener) {
    if (typeof listener === 'function') {
      authStateListeners.push(listener);
      
      // 立即触发一次当前状态
      listener(this.currentUser);
    }
    
    // 返回取消监听的函数
    return () => {
      const index = authStateListeners.indexOf(listener);
      if (index !== -1) {
        authStateListeners.splice(index, 1);
      }
    };
  }
  
  // 检查数据库可用性
  async _checkDatabaseAvailability() {
    try {
      await sqliteManager.init();
      const status = sqliteManager.getInitializationStatus ? 
        sqliteManager.getInitializationStatus() : 
        { initialized: sqliteManager.initialized, error: null };
      
      return {
        available: status.initialized,
        error: status.error
      };
    } catch (error) {
      console.error('检查数据库可用性失败:', error);
      return {
        available: false,
        error: error.message
      };
    }
  }
}

// 创建并导出单例实例
export const auth = new UserManager();

// 导出认证状态监听器函数
export const onAuthStateChanged = (listener) => auth.onAuthStateChanged(listener); 