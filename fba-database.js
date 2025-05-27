// FBA计算器数据库工具
import { db, auth } from './firebase-config.js';
import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    orderBy, 
    limit,
    deleteDoc,
    doc,
    Timestamp
} from "firebase/firestore";

// 保存计算结果
export async function saveCalculation(calculationType, inputData, resultData) {
    try {
        const user = auth.currentUser;
        
        // 检查用户是否登录
        if (!user) {
            throw new Error('用户未登录');
        }
        
        const calculationData = {
            userId: user.uid,
            calculationType: calculationType, // 'shipping', 'storage', 'commission', 'all'
            inputData: inputData,
            resultData: resultData,
            createdAt: Timestamp.now()
        };
        
        // 添加到Firestore
        const docRef = await addDoc(collection(db, "calculations"), calculationData);
        
        return {
            success: true,
            id: docRef.id,
            message: '计算结果已保存'
        };
    } catch (error) {
        console.error("Error saving calculation: ", error);
        return {
            success: false,
            message: error.message
        };
    }
}

// 获取用户历史计算结果
export async function getCalculationHistory(calculationType = null, limitCount = 10) {
    try {
        const user = auth.currentUser;
        
        // 检查用户是否登录
        if (!user) {
            throw new Error('用户未登录');
        }
        
        // 创建查询
        let q;
        if (calculationType) {
            q = query(
                collection(db, "calculations"), 
                where("userId", "==", user.uid),
                where("calculationType", "==", calculationType),
                orderBy("createdAt", "desc"),
                limit(limitCount)
            );
        } else {
            q = query(
                collection(db, "calculations"), 
                where("userId", "==", user.uid),
                orderBy("createdAt", "desc"),
                limit(limitCount)
            );
        }
        
        // 执行查询
        const querySnapshot = await getDocs(q);
        
        // 处理结果
        const history = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            history.push({
                id: doc.id,
                calculationType: data.calculationType,
                inputData: data.inputData,
                resultData: data.resultData,
                createdAt: data.createdAt.toDate()
            });
        });
        
        return {
            success: true,
            history: history
        };
    } catch (error) {
        console.error("Error getting calculation history: ", error);
        return {
            success: false,
            message: error.message
        };
    }
}

// 删除计算结果
export async function deleteCalculation(calculationId) {
    try {
        const user = auth.currentUser;
        
        // 检查用户是否登录
        if (!user) {
            throw new Error('用户未登录');
        }
        
        // 删除文档
        await deleteDoc(doc(db, "calculations", calculationId));
        
        return {
            success: true,
            message: '计算结果已删除'
        };
    } catch (error) {
        console.error("Error deleting calculation: ", error);
        return {
            success: false,
            message: error.message
        };
    }
} 