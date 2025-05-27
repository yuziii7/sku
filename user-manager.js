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
    this._init();
  }

  // 初始化用户管理器
  _init() {
    try {
      const savedUser = localStorage.getItem(USER_KEY);
      if (savedUser) {
        this.currentUser = new User(JSON.parse(savedUser));
        // 通知监听器用户已登录
        this._notifyAuthStateChanged();
      }
      
      // 确保用户表已创建
      this._createUserTable().catch(err => {
        console.error('初始化用户表失败:', err);
      });
    } catch (error) {
      console.error('初始化用户管理器失败:', error);
    }
  }

  // 保存用户状态到本地存储
  _saveUserState() {
    if (this.currentUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(this.currentUser));
    } else {
      localStorage.removeItem(USER_KEY);
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
    await sqliteManager.init();
    
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
  }

  // 注册新用户
  async registerUser(email, password, displayName = '') {
    try {
      console.log('开始注册用户:', email);
      await this._createUserTable();
      
      // 检查邮箱是否已注册
      const existingUser = await sqliteManager.exec(
        'SELECT * FROM users WHERE email = ?', 
        [email]
      );
      
      if (existingUser.length > 0) {
        throw new Error('该邮箱已被注册');
      }
      
      // 生成用户ID
      const uid = 'user_' + Math.random().toString(36).substr(2, 9);
      const timestamp = getCurrentTimestamp();
      
      console.log('创建新用户记录:', uid);
      
      // 将用户信息存入数据库
      const result = await sqliteManager.run(
        'INSERT INTO users (uid, email, displayName, password, isAnonymous, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
        [uid, email, displayName, password, 0, timestamp]
      );
      
      if (!result.success) {
        throw new Error(result.message || '创建用户记录失败');
      }
      
      console.log('用户记录创建成功');
      
      // 创建用户对象
      this.currentUser = new User({
        uid,
        email,
        displayName,
        isAnonymous: false,
        createdAt: timestamp
      });
      
      this._saveUserState();
      this._notifyAuthStateChanged();
      
      return {
        success: true,
        user: this.currentUser
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
  async signIn(email, password) {
    try {
      await this._createUserTable();
      
      // 查询用户
      const users = await sqliteManager.exec(
        'SELECT * FROM users WHERE email = ? AND password = ?',
        [email, password]
      );
      
      if (users.length === 0) {
        throw new Error('邮箱或密码不正确');
      }
      
      const userData = users[0];
      
      // 创建用户对象
      this.currentUser = new User({
        uid: userData.uid,
        email: userData.email,
        displayName: userData.displayName,
        isAnonymous: userData.isAnonymous === 1,
        createdAt: userData.createdAt
      });
      
      this._saveUserState();
      this._notifyAuthStateChanged();
      
      return {
        success: true,
        user: this.currentUser
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
      await this._createUserTable();
      
      // 生成匿名用户ID
      const uid = 'anon_' + Math.random().toString(36).substr(2, 9);
      const timestamp = getCurrentTimestamp();
      
      // 将匿名用户信息存入数据库
      await sqliteManager.run(
        'INSERT INTO users (uid, email, displayName, password, isAnonymous, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
        [uid, '', 'Anonymous User', '', 1, timestamp]
      );
      
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
}

// 创建并导出单例实例
export const auth = new UserManager();

// 导出认证状态监听器函数
export const onAuthStateChanged = (listener) => auth.onAuthStateChanged(listener); 