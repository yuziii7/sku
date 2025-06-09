// 使用IndexedDB的用户管理器
import { indexedDBManager, getCurrentTimestamp } from './indexed-db-manager.js';

// 存储用户信息的键
const USER_KEY = 'current_user';

// 简化后的认证状态监听器数组
const authStateListeners = [];

// 虚拟用户信息
const dummyUser = {
  uid: 'anonymous',
  email: '',
  displayName: 'Guest User',
  isAnonymous: true
};

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

// 简化的认证管理器
class UserManager {
  constructor() {
    // 初始化为匿名用户
    this.currentUser = null;
    console.log('认证功能已禁用，所有用户将以访客模式访问');
  }

  // 登录方法 - 返回成功但不做任何事
  async signIn() {
    console.log('登录功能已禁用');
    return {
      success: false,
      message: '登录功能已禁用'
    };
  }

  // 注册方法 - 返回成功但不做任何事
  async registerUser() {
    console.log('注册功能已禁用');
    return {
      success: false,
      message: '注册功能已禁用'
    };
  }

  // 匿名登录方法 - 返回成功但不做任何事
  async signInAnonymously() {
    console.log('匿名登录功能已禁用');
    return {
      success: true,
      user: dummyUser
    };
  }

  // 登出方法 - 返回成功但不做任何事
  async signOut() {
    console.log('登出功能已禁用');
    return {
      success: true
    };
  }

  // 监听认证状态变化 - 直接调用一次回调并返回空函数
  onAuthStateChanged(listener) {
    if (typeof listener === 'function') {
      listener(null);
    }
    
    // 返回取消监听的函数
    return () => {};
  }
}

// 创建并导出单例实例
export const auth = new UserManager();

// 导出认证状态监听器函数
export const onAuthStateChanged = (listener) => auth.onAuthStateChanged(listener); 