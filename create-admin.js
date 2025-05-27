// 创建admin用户账号脚本
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

// Firebase配置
const firebaseConfig = {
  apiKey: "AIzaSyDA9RiclBlogSSy8UbiBaKN6jk6TYPyIpI",
  authDomain: "fir-72b37.firebaseapp.com",
  projectId: "fir-72b37",
  storageBucket: "fir-72b37.firebasestorage.app",
  messagingSenderId: "265840869050",
  appId: "1:265840869050:web:428b0b2627ac77d15dcc83",
  measurementId: "G-F6L0K29PHZ"
};

// 初始化Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 创建admin用户
const email = "admin"; // 注意：Firebase要求邮箱格式，所以这里用admin@admin.com
const password = "admin";

console.log(`尝试创建管理员用户: ${email}`);

// 创建用户
createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // 创建成功
    const user = userCredential.user;
    console.log('创建成功!');
    console.log('用户ID:', user.uid);
    console.log('用户邮箱:', user.email);
  })
  .catch((error) => {
    // 创建失败
    console.error('创建失败:', error.code, error.message);
    
    // 处理特定错误
    if (error.code === 'auth/invalid-email') {
      console.log('\n错误: "admin"不是有效的邮箱格式');
      console.log('尝试使用"admin@admin.com"创建用户...');
      
      // 尝试使用有效邮箱格式
      createUserWithEmailAndPassword(auth, "admin@admin.com", password)
        .then((userCredential) => {
          // 创建成功
          const user = userCredential.user;
          console.log('创建成功!');
          console.log('用户ID:', user.uid);
          console.log('用户邮箱:', user.email);
          console.log('\n请使用以下信息登录:');
          console.log('邮箱: admin@admin.com');
          console.log('密码: admin');
        })
        .catch((err) => {
          console.error('再次尝试失败:', err.code, err.message);
          if (err.code === 'auth/email-already-in-use') {
            console.log('\n用户"admin@admin.com"已存在，可以直接使用密码"admin"登录');
          } else if (err.code === 'auth/weak-password') {
            console.log('\n错误: 密码太弱，Firebase要求至少6个字符');
            console.log('尝试使用"admin123"作为密码...');
            
            // 尝试使用更强的密码
            createUserWithEmailAndPassword(auth, "admin@admin.com", "admin123")
              .then((userCredential) => {
                const user = userCredential.user;
                console.log('创建成功!');
                console.log('用户ID:', user.uid);
                console.log('用户邮箱:', user.email);
                console.log('\n请使用以下信息登录:');
                console.log('邮箱: admin@admin.com');
                console.log('密码: admin123');
              })
              .catch((finalError) => {
                console.error('最终尝试失败:', finalError.code, finalError.message);
              });
          }
        });
    } else if (error.code === 'auth/weak-password') {
      console.log('\n错误: 密码太弱，Firebase要求至少6个字符');
      console.log('尝试使用"admin123"作为密码...');
      
      // 尝试使用更强的密码
      createUserWithEmailAndPassword(auth, "admin@admin.com", "admin123")
        .then((userCredential) => {
          const user = userCredential.user;
          console.log('创建成功!');
          console.log('用户ID:', user.uid);
          console.log('用户邮箱:', user.email);
          console.log('\n请使用以下信息登录:');
          console.log('邮箱: admin@admin.com');
          console.log('密码: admin123');
        })
        .catch((err) => {
          console.error('再次尝试失败:', err.code, err.message);
        });
    } else if (error.code === 'auth/email-already-in-use') {
      console.log('\n用户"admin"已存在，可以直接使用密码"admin"登录');
    }
  }); 