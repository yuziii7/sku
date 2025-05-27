// 检查Firebase项目配置
import { auth } from './firebase-config.js';
import { 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    fetchSignInMethodsForEmail,
    deleteUser
} from "firebase/auth";

// 测试用户信息
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'Test12345!';

// 测试Firebase身份验证设置
async function testFirebaseAuth() {
    console.log('开始测试Firebase Auth配置...');
    
    const results = {
        auth_initialized: false,
        project_valid: false,
        email_auth_enabled: false,
        test_results: []
    };
    
    try {
        // 测试 #1: 检查Auth对象是否正确初始化
        results.auth_initialized = !!auth && !!auth.app;
        results.test_results.push({
            name: '检查Auth对象初始化',
            success: results.auth_initialized,
            message: results.auth_initialized ? 'Auth对象已正确初始化' : 'Auth对象初始化失败'
        });
        
        if (!results.auth_initialized) {
            throw new Error('Auth对象未初始化，无法继续测试');
        }
        
        // 测试 #2: 检查项目配置是否有效
        try {
            results.project_valid = !!auth.app.options.apiKey && 
                                   !!auth.app.options.authDomain && 
                                   !!auth.app.options.projectId;
            
            results.test_results.push({
                name: '检查项目配置',
                success: results.project_valid,
                message: results.project_valid ? '项目配置有效' : '项目配置缺少必要字段'
            });
        } catch (error) {
            results.test_results.push({
                name: '检查项目配置',
                success: false,
                message: `获取项目配置失败: ${error.message}`
            });
        }
        
        // 测试 #3: 检查邮箱/密码认证是否启用
        try {
            // 尝试获取登录方法，如果能成功调用API，表示项目配置正确
            await fetchSignInMethodsForEmail(auth, TEST_EMAIL)
                .then(() => {
                    results.email_auth_enabled = true;
                })
                .catch(error => {
                    // 即使返回错误，只要不是与配置相关的错误，也可能表示服务正常
                    if (error.code === 'auth/invalid-email' || 
                        error.code === 'auth/user-not-found') {
                        results.email_auth_enabled = true;
                    } else {
                        throw error;
                    }
                });
                
            results.test_results.push({
                name: '检查邮箱/密码认证',
                success: results.email_auth_enabled,
                message: results.email_auth_enabled ? 
                    '邮箱/密码认证已启用' : 
                    '邮箱/密码认证可能未启用，请在Firebase控制台检查'
            });
        } catch (error) {
            results.test_results.push({
                name: '检查邮箱/密码认证',
                success: false,
                message: `检查邮箱认证失败: ${error.code} - ${error.message}`
            });
        }
        
        // 测试 #4: 尝试创建测试用户
        try {
            // 首先检查测试用户是否已存在
            const methods = await fetchSignInMethodsForEmail(auth, TEST_EMAIL);
            
            if (methods.length > 0) {
                // 用户已存在，尝试登录
                results.test_results.push({
                    name: '创建测试用户',
                    success: true,
                    message: '测试用户已存在，跳过创建'
                });
                
                // 尝试登录
                try {
                    const userCredential = await signInWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
                    results.test_results.push({
                        name: '登录测试用户',
                        success: true,
                        message: '成功登录测试用户'
                    });
                    
                    // 登录成功后删除用户
                    try {
                        await deleteUser(userCredential.user);
                        results.test_results.push({
                            name: '删除测试用户',
                            success: true,
                            message: '成功删除测试用户'
                        });
                    } catch (error) {
                        results.test_results.push({
                            name: '删除测试用户',
                            success: false,
                            message: `删除测试用户失败: ${error.code} - ${error.message}`
                        });
                    }
                } catch (error) {
                    // 登录失败，可能是密码不正确
                    results.test_results.push({
                        name: '登录测试用户',
                        success: false,
                        message: `登录测试用户失败: ${error.code} - ${error.message}`
                    });
                    
                    // 由于无法登录，尝试创建新用户
                    try {
                        // 使用不同的邮箱
                        const newTestEmail = `test-${Date.now()}@example.com`;
                        const userCredential = await createUserWithEmailAndPassword(auth, newTestEmail, TEST_PASSWORD);
                        
                        results.test_results.push({
                            name: '创建新测试用户',
                            success: true,
                            message: `成功创建新测试用户: ${newTestEmail}`
                        });
                        
                        // 创建成功后删除用户
                        try {
                            await deleteUser(userCredential.user);
                            results.test_results.push({
                                name: '删除新测试用户',
                                success: true,
                                message: '成功删除新测试用户'
                            });
                        } catch (error) {
                            results.test_results.push({
                                name: '删除新测试用户',
                                success: false,
                                message: `删除新测试用户失败: ${error.code} - ${error.message}`
                            });
                        }
                    } catch (error) {
                        results.test_results.push({
                            name: '创建新测试用户',
                            success: false,
                            message: `创建新测试用户失败: ${error.code} - ${error.message}`
                        });
                    }
                }
            } else {
                // 用户不存在，尝试创建
                try {
                    const userCredential = await createUserWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
                    
                    results.test_results.push({
                        name: '创建测试用户',
                        success: true,
                        message: '成功创建测试用户'
                    });
                    
                    // 创建成功后删除用户
                    try {
                        await deleteUser(userCredential.user);
                        results.test_results.push({
                            name: '删除测试用户',
                            success: true,
                            message: '成功删除测试用户'
                        });
                    } catch (error) {
                        results.test_results.push({
                            name: '删除测试用户',
                            success: false,
                            message: `删除测试用户失败: ${error.code} - ${error.message}`
                        });
                    }
                } catch (error) {
                    results.test_results.push({
                        name: '创建测试用户',
                        success: false,
                        message: `创建测试用户失败: ${error.code} - ${error.message}`
                    });
                }
            }
        } catch (error) {
            results.test_results.push({
                name: '测试用户操作',
                success: false,
                message: `测试用户操作失败: ${error.code} - ${error.message}`
            });
        }
        
    } catch (error) {
        console.error('Firebase Auth测试失败:', error);
        results.test_results.push({
            name: '整体测试',
            success: false,
            message: `测试中断: ${error.message}`
        });
    }
    
    return results;
}

// 显示测试结果
function displayResults(results) {
    console.log('Firebase Auth测试结果:', results);
    
    // 计算总体状态
    const totalTests = results.test_results.length;
    const passedTests = results.test_results.filter(test => test.success).length;
    const overall = {
        success: passedTests === totalTests,
        message: `测试结果: ${passedTests}/${totalTests} 通过`
    };
    
    // 返回HTML格式的结果
    return `
        <div class="test-results">
            <h3>Firebase设置检查结果</h3>
            
            <div class="alert ${overall.success ? 'alert-success' : 'alert-warning'}">
                ${overall.message}
            </div>
            
            <div class="mb-3">
                <strong>基本状态:</strong>
                <ul class="list-group mb-3">
                    <li class="list-group-item ${results.auth_initialized ? 'list-group-item-success' : 'list-group-item-danger'}">
                        Firebase Auth初始化: ${results.auth_initialized ? '成功' : '失败'}
                    </li>
                    <li class="list-group-item ${results.project_valid ? 'list-group-item-success' : 'list-group-item-danger'}">
                        项目配置: ${results.project_valid ? '有效' : '无效'}
                    </li>
                    <li class="list-group-item ${results.email_auth_enabled ? 'list-group-item-success' : 'list-group-item-danger'}">
                        邮箱/密码认证: ${results.email_auth_enabled ? '已启用' : '未启用或配置错误'}
                    </li>
                </ul>
            </div>
            
            <div>
                <strong>详细测试结果:</strong>
                <div class="accordion" id="testResultsAccordion">
                    ${results.test_results.map((test, index) => `
                        <div class="accordion-item">
                            <h2 class="accordion-header" id="heading${index}">
                                <button class="accordion-button ${test.success ? '' : 'bg-light text-danger'} collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}">
                                    ${test.name}: ${test.success ? '✅ 通过' : '❌ 失败'}
                                </button>
                            </h2>
                            <div id="collapse${index}" class="accordion-collapse collapse" data-bs-parent="#testResultsAccordion">
                                <div class="accordion-body">
                                    ${test.message}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="mt-4">
                <h4>诊断建议</h4>
                <ul class="list-group">
                    ${!results.auth_initialized ? `
                        <li class="list-group-item list-group-item-danger">
                            Firebase初始化失败，请检查firebase-config.js文件中的配置信息
                        </li>
                    ` : ''}
                    
                    ${!results.project_valid ? `
                        <li class="list-group-item list-group-item-danger">
                            项目配置无效，请确保在Firebase控制台中正确设置了项目，并且配置信息完整
                        </li>
                    ` : ''}
                    
                    ${!results.email_auth_enabled ? `
                        <li class="list-group-item list-group-item-danger">
                            邮箱/密码认证可能未启用，请在Firebase控制台中的"Authentication > Sign-in method"中启用邮箱/密码登录
                        </li>
                    ` : ''}
                    
                    ${results.test_results.some(test => !test.success && test.name.includes('创建测试用户')) ? `
                        <li class="list-group-item list-group-item-warning">
                            无法创建测试用户，可能是由于以下原因：<br>
                            1. 邮箱/密码认证未在Firebase控制台中启用<br>
                            2. 您的Firebase项目可能有特殊的安全规则限制<br>
                            3. 网络连接问题<br>
                            4. 域名未被授权（检查Firebase控制台中的"Authentication > Settings > Authorized domains"）
                        </li>
                    ` : ''}
                    
                    ${results.auth_initialized && results.project_valid && results.email_auth_enabled ? `
                        <li class="list-group-item list-group-item-success">
                            Firebase基本配置正确，如果仍有问题，请检查：<br>
                            1. 网络连接<br>
                            2. 控制台错误信息<br>
                            3. Firebase项目的安全规则<br>
                            4. 域名授权设置
                        </li>
                    ` : ''}
                </ul>
            </div>
        </div>
    `;
}

// 导出测试函数
export { testFirebaseAuth, displayResults }; 