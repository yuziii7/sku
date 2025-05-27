// Firebase配置
// 初始化Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// 你的Firebase配置（需要替换为你的实际配置）
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
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth }; 