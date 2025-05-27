// SKU生成器数据库工具
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

// 保存生成的SKU
export async function saveSku(skuData) {
    try {
        const user = auth.currentUser;
        
        // 检查用户是否登录
        if (!user) {
            throw new Error('用户未登录');
        }
        
        const skuDocument = {
            userId: user.uid,
            sku: skuData.sku,
            brand: skuData.brand,
            category: skuData.category,
            productName: skuData.productName,
            color: skuData.color,
            size: skuData.size,
            additional: skuData.additional,
            createdAt: Timestamp.now()
        };
        
        // 添加到Firestore
        const docRef = await addDoc(collection(db, "skus"), skuDocument);
        
        return {
            success: true,
            id: docRef.id,
            message: 'SKU已保存'
        };
    } catch (error) {
        console.error("Error saving SKU: ", error);
        return {
            success: false,
            message: error.message
        };
    }
}

// 获取用户的SKU历史
export async function getSkuHistory(limitCount = 20) {
    try {
        const user = auth.currentUser;
        
        // 检查用户是否登录
        if (!user) {
            throw new Error('用户未登录');
        }
        
        // 创建查询
        const q = query(
            collection(db, "skus"), 
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc"),
            limit(limitCount)
        );
        
        // 执行查询
        const querySnapshot = await getDocs(q);
        
        // 处理结果
        const history = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            history.push({
                id: doc.id,
                sku: data.sku,
                brand: data.brand,
                category: data.category,
                productName: data.productName,
                color: data.color,
                size: data.size,
                additional: data.additional,
                createdAt: data.createdAt.toDate()
            });
        });
        
        return {
            success: true,
            history: history
        };
    } catch (error) {
        console.error("Error getting SKU history: ", error);
        return {
            success: false,
            message: error.message
        };
    }
}

// 删除SKU记录
export async function deleteSku(skuId) {
    try {
        const user = auth.currentUser;
        
        // 检查用户是否登录
        if (!user) {
            throw new Error('用户未登录');
        }
        
        // 删除文档
        await deleteDoc(doc(db, "skus", skuId));
        
        return {
            success: true,
            message: 'SKU已删除'
        };
    } catch (error) {
        console.error("Error deleting SKU: ", error);
        return {
            success: false,
            message: error.message
        };
    }
} 