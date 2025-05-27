// Firebase配置
// 初始化Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";

// 检查配置信息是否完整
const firebaseConfig = {
  apiKey: "AIzaSyDA9RiclBlogSSy8UbiBaKN6jk6TYPyIpI",
  authDomain: "fir-72b37.firebaseapp.com",
  projectId: "fir-72b37",
  storageBucket: "fir-72b37.firebasestorage.app",
  messagingSenderId: "265840869050",
  appId: "1:265840869050:web:428b0b2627ac77d15dcc83",
  measurementId: "G-F6L0K29PHZ"
};

// 验证配置
const validateConfig = (config) => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId'];
  const missingFields = requiredFields.filter(field => !config[field]);
  
  if (missingFields.length > 0) {
    console.error(`Firebase配置缺少必要字段: ${missingFields.join(', ')}`);
    alert(`Firebase配置错误: 缺少必要字段 ${missingFields.join(', ')}`);
    return false;
  }
  
  return true;
};

// 检查当前环境是否支持Firebase
const checkEnvironment = () => {
  try {
    // 检查是否在浏览器环境中
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      console.error('Firebase需要在浏览器环境中运行');
      return false;
    }
    
    // 检查是否可以访问localStorage（部分隐私模式可能不支持）
    try {
      localStorage.setItem('firebase_test', 'test');
      localStorage.removeItem('firebase_test');
    } catch (e) {
      console.warn('localStorage不可用，可能影响Firebase认证持久化');
    }
    
    return true;
  } catch (error) {
    console.error('环境检查失败:', error);
    return false;
  }
};

let app, db, auth;

try {
  // 验证配置和环境
  if (validateConfig(firebaseConfig) && checkEnvironment()) {
    // 初始化Firebase
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    
    console.log('Firebase初始化成功');
    
    // 检查是否在本地开发环境
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1';
    
    // 开发环境下使用Auth模拟器（如果需要）
    if (isLocalhost && window.location.search.includes('useEmulator=true')) {
      try {
        connectAuthEmulator(auth, 'http://localhost:9099');
        console.log('已连接到Firebase Auth模拟器');
      } catch (error) {
        console.warn('连接Firebase Auth模拟器失败:', error);
      }
    }
    
    // 输出Firebase版本信息（如果可用）
    if (app.SDK_VERSION) {
      console.log(`Firebase SDK版本: ${app.SDK_VERSION}`);
    }
  } else {
    throw new Error('Firebase配置或环境验证失败');
  }
} catch (error) {
  console.error('Firebase初始化失败:', error);
  alert('Firebase服务初始化失败，请检查控制台获取详细信息');
  
  // 创建一个空的对象以避免空引用错误
  app = {};
  db = {};
  auth = {
    currentUser: null,
    onAuthStateChanged: () => {}
  };
}

export { db, auth }; 