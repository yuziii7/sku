/**
 * 变体管理器 - 用于管理SKU生成器的变体数据
 * 集成Google Sheets和本地存储
 */

class VariantManager {
    constructor() {
        this.sheetsManager = window.googleSheetsManager;
        this.isInitialized = false;
        this.currentVariants = {};
        
        // 变体类别映射
        this.categoryMapping = {
            'colors': { label: '颜色', selectId: 'colorSelect' },
            'animals': { label: '动物', selectId: 'animal' },
            'professions': { label: '职业', selectId: 'profession' },
            'humor': { label: '幽默', selectId: 'humor' },
            'roles': { label: '角色', selectId: 'role' },
            'festivals': { label: '节日', selectId: 'festival' },
            'styles': { label: '配件', selectId: 'style' },
            'crowdSizes': { label: '充气', selectId: 'crowdSize' }
        };
    }

    /**
     * 初始化变体管理器
     */
    async initialize() {
        if (this.isInitialized) return;
        
        try {
            // 加载保存的API密钥
            this.sheetsManager.loadApiKey();
            
            // 创建管理界面
            this.createManagementUI();
            
            // 绑定事件
            this.bindEvents();
            
            // 加载变体数据
            await this.loadAllVariants();
            
            this.isInitialized = true;
            console.log('变体管理器初始化完成');
        } catch (error) {
            console.error('变体管理器初始化失败:', error);
        }
    }

    /**
     * 创建管理界面
     */
    createManagementUI() {
        // 检查是否已存在管理界面
        if (document.getElementById('variantManagement')) {
            return;
        }

        // 创建变体管理标签页
        const navTabs = document.querySelector('.nav-tabs');
        if (!navTabs) {
            // 如果没有标签页，创建一个
            this.createTabsStructure();
        }

        // 添加变体管理标签
        const managementTab = document.createElement('li');
        managementTab.className = 'nav-item';
        managementTab.innerHTML = `
            <a class="nav-link" id="variant-management-tab" data-bs-toggle="tab" href="#variantManagement" role="tab">
                <i class="bi bi-gear me-1"></i>变体管理
            </a>
        `;
        
        // 插入到适当位置
        const existingTabs = document.querySelector('.nav-tabs');
        if (existingTabs) {
            existingTabs.appendChild(managementTab);
        }

        // 创建标签页内容
        const tabContent = document.querySelector('.tab-content');
        if (tabContent) {
            const managementPane = document.createElement('div');
            managementPane.className = 'tab-pane fade';
            managementPane.id = 'variantManagement';
            managementPane.innerHTML = this.getManagementHTML();
            tabContent.appendChild(managementPane);
        }
    }

    /**
     * 创建标签页结构（如果不存在）
     */
    createTabsStructure() {
        const container = document.querySelector('.container');
        if (!container) return;

        // 查找SKU选项卡片
        const skuCard = document.querySelector('.card');
        if (!skuCard) return;

        // 创建标签页结构
        const tabsHTML = `
            <ul class="nav nav-tabs mb-3" id="mainTabs" role="tablist">
                <li class="nav-item" role="presentation">
                    <a class="nav-link active" id="sku-generator-tab" data-bs-toggle="tab" href="#skuGenerator" role="tab">
                        <i class="bi bi-upc-scan me-1"></i>SKU生成器
                    </a>
                </li>
            </ul>
            <div class="tab-content" id="mainTabContent">
                <div class="tab-pane fade show active" id="skuGenerator" role="tabpanel">
                    <!-- 现有的SKU生成器内容将移动到这里 -->
                </div>
            </div>
        `;

        // 插入标签页结构
        skuCard.insertAdjacentHTML('beforebegin', tabsHTML);
        
        // 移动现有内容到标签页
        const skuGeneratorPane = document.getElementById('skuGenerator');
        if (skuGeneratorPane) {
            skuGeneratorPane.appendChild(skuCard);
        }
    }

    /**
     * 获取管理界面HTML
     */
    getManagementHTML() {
        return `
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">
                        <i class="bi bi-cloud me-2"></i>Google Sheets 变体管理
                    </h5>
                </div>
                <div class="card-body">
                    <!-- 连接状态 -->
                    <div class="row mb-4">
                        <div class="col-12">
                            <div class="alert alert-info" id="connectionStatus">
                                <i class="bi bi-info-circle me-2"></i>
                                <span id="statusText">未连接到Google Sheets</span>
                                <span id="lastSync" class="ms-3 small text-muted"></span>
                            </div>
                        </div>
                    </div>

                    <!-- API密钥设置 -->
                    <div class="row mb-4">
                        <div class="col-md-8">
                            <label class="form-label">Google Sheets API 密钥:</label>
                            <input type="password" id="apiKeyInput" class="form-control" placeholder="输入您的Google Sheets API密钥" value="AIzaSyAJfpSZruf18lKh5YALv13uZ43SBepverM">
                            <div class="form-text">
                                <i class="bi bi-info-circle me-1"></i>
                                需要在Google Cloud Console创建API密钥并启用Google Sheets API
                                <a href="https://console.cloud.google.com/" target="_blank" class="ms-2">
                                    <i class="bi bi-box-arrow-up-right"></i>前往Google Cloud Console
                                </a>
                            </div>
                        </div>
                        <div class="col-md-4 d-flex align-items-end">
                            <button class="btn btn-primary me-2" id="connectBtn">
                                <i class="bi bi-plug me-1"></i>连接
                            </button>
                            <button class="btn btn-success" id="syncBtn" disabled>
                                <i class="bi bi-arrow-clockwise me-1"></i>同步
                            </button>
                        </div>
                    </div>

                    <!-- 变体管理 -->
                    <div class="row">
                        <div class="col-md-12">
                            <div class="card">
                                <div class="card-header">
                                    <h6 class="mb-0">变体预览</h6>
                                </div>
                                <div class="card-body">
                                    <div class="mb-3">
                                        <label class="form-label">选择类别:</label>
                                        <select id="previewCategory" class="form-select">
                                            <option value="">请选择类别</option>
                                            <option value="colors">颜色</option>
                                            <option value="animals">动物</option>
                                            <option value="professions">职业</option>
                                            <option value="humor">幽默</option>
                                            <option value="roles">角色</option>
                                        </select>
                                    </div>
                                    <div id="variantPreview" class="border rounded p-3" style="max-height: 200px; overflow-y: auto;">
                                        <div class="text-muted text-center">请选择类别查看变体</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 操作日志 -->
                    <div class="row mt-4">
                        <div class="col-12">
                            <div class="card">
                                <div class="card-header d-flex justify-content-between align-items-center">
                                    <h6 class="mb-0">操作日志</h6>
                                    <button class="btn btn-sm btn-outline-secondary" id="clearLogBtn">
                                        <i class="bi bi-trash me-1"></i>清除
                                    </button>
                                </div>
                                <div class="card-body">
                                    <div id="operationLog" style="max-height: 150px; overflow-y: auto; font-family: monospace; font-size: 0.9em;">
                                        <div class="text-muted">暂无操作记录</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 连接按钮
        document.getElementById('connectBtn')?.addEventListener('click', () => this.handleConnect());
        
        // 同步按钮
        document.getElementById('syncBtn')?.addEventListener('click', () => this.handleSync());
        
        // 添加变体按钮
        document.getElementById('addVariantBtn')?.addEventListener('click', () => this.handleAddVariant());
        
        // 预览类别选择
        document.getElementById('previewCategory')?.addEventListener('change', (e) => this.handlePreviewCategory(e.target.value));
        
        // 清除日志按钮
        document.getElementById('clearLogBtn')?.addEventListener('click', () => this.clearLog());
        
        // API密钥输入框回车事件
        document.getElementById('apiKeyInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleConnect();
            }
        });
    }

    /**
     * 处理连接
     */
    async handleConnect() {
        const apiKey = document.getElementById('apiKeyInput')?.value.trim();
        if (!apiKey) {
            this.showMessage('请输入API密钥', 'warning');
            return;
        }

        const connectBtn = document.getElementById('connectBtn');
        const originalText = connectBtn.innerHTML;
        connectBtn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>连接中...';
        connectBtn.disabled = true;

        try {
            const result = await this.sheetsManager.setApiKey(apiKey);
            if (result.success) {
                this.updateConnectionStatus(true);
                this.showMessage(result.message, 'success');
                document.getElementById('syncBtn').disabled = false;
                await this.loadAllVariants();
            } else {
                this.showMessage(result.message, 'danger');
            }
        } catch (error) {
            this.showMessage(`连接失败: ${error.message}`, 'danger');
        } finally {
            connectBtn.innerHTML = originalText;
            connectBtn.disabled = false;
        }
    }

    /**
     * 处理同步
     */
    async handleSync() {
        const syncBtn = document.getElementById('syncBtn');
        const originalText = syncBtn.innerHTML;
        syncBtn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i>同步中...';
        syncBtn.disabled = true;

        try {
            const variants = await this.sheetsManager.syncAllVariants();
            this.currentVariants = variants;
            this.updateSKUGeneratorOptions();
            this.updateConnectionStatus(true);
            this.showMessage('同步完成！', 'success');
            this.log('数据同步完成');
        } catch (error) {
            this.showMessage(`同步失败: ${error.message}`, 'danger');
            this.log(`同步失败: ${error.message}`);
        } finally {
            syncBtn.innerHTML = originalText;
            syncBtn.disabled = false;
        }
    }

    /**
     * 处理添加变体（已禁用）
     */
    async handleAddVariant() {
        this.showMessage('添加变体功能已被禁用', 'warning');
        this.log('尝试使用已禁用的添加变体功能');
        return;
    }

    /**
     * 处理预览类别
     */
    async handlePreviewCategory(category) {
        const previewDiv = document.getElementById('variantPreview');
        if (!category) {
            previewDiv.innerHTML = '<div class="text-muted text-center">请选择类别查看变体</div>';
            return;
        }

        // 显示加载状态
        previewDiv.innerHTML = '<div class="text-center"><div class="spinner-border spinner-border-sm me-2"></div>正在加载...</div>';
        
        try {
            console.log(`开始预览${category}类别的变体`);
            const variants = await this.sheetsManager.getVariants(category);
            console.log(`${category}变体数据:`, variants);
            
            if (!variants || Object.keys(variants).length === 0) {
                previewDiv.innerHTML = '<div class="text-muted text-center">该类别暂无变体</div>';
                return;
            }
            
            const html = Object.entries(variants).map(([name, code]) => 
                `<div class="d-flex justify-content-between align-items-center py-1 border-bottom">
                    <span>${name}</span>
                    <code class="text-primary">${code}</code>
                </div>`
            ).join('');
            
            previewDiv.innerHTML = html;
            console.log(`${category}预览渲染完成，共${Object.keys(variants).length}个变体`);
        } catch (error) {
            console.error(`预览${category}失败:`, error);
            const errorMsg = error.message || '未知错误';
            previewDiv.innerHTML = `<div class="text-danger text-center">
                <i class="bi bi-exclamation-triangle me-2"></i>
                加载失败: ${errorMsg}
                <br><small class="text-muted">请检查控制台获取详细错误信息</small>
            </div>`;
        }
    }

    /**
     * 加载所有变体数据
     */
    async loadAllVariants() {
        try {
            this.currentVariants = await this.sheetsManager.syncAllVariants();
            this.updateSKUGeneratorOptions();
            this.log('变体数据加载完成');
        } catch (error) {
            this.log(`加载变体数据失败: ${error.message}`);
        }
    }

    /**
     * 更新SKU生成器选项
     */
    updateSKUGeneratorOptions() {
        // 更新动物选项
        if (this.currentVariants.animals) {
            this.updateSelectOptions('animal', this.currentVariants.animals);
        }
        
        // 更新职业选项
        if (this.currentVariants.professions) {
            this.updateSelectOptions('profession', this.currentVariants.professions);
        }
        
        // 更新幽默选项
        if (this.currentVariants.humor) {
            this.updateSelectOptions('humor', this.currentVariants.humor);
        }
        
        // 更新角色选项
        if (this.currentVariants.roles) {
            this.updateSelectOptions('role', this.currentVariants.roles);
        }
        
        // 更新颜色选项（如果有颜色选择器）
        if (this.currentVariants.colors) {
            this.updateColorOptions(this.currentVariants.colors);
        }
    }

    /**
     * 更新选择框选项
     */
    updateSelectOptions(selectId, options) {
        const select = document.getElementById(selectId);
        if (!select) return;

        // 保存当前选中值
        const currentValue = select.value;
        
        // 清空现有选项（保留第一个默认选项）
        select.innerHTML = '<option value="">请选择</option>';
        
        // 添加新选项
        Object.entries(options).forEach(([name, code]) => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            select.appendChild(option);
        });
        
        // 恢复选中值
        if (currentValue && options[currentValue]) {
            select.value = currentValue;
        }
    }

    /**
     * 更新颜色选项
     */
    updateColorOptions(colors) {
        // 如果有颜色选择器，在这里更新
        // 这个方法可以根据实际的颜色选择器实现来调整
        console.log('更新颜色选项:', colors);
    }

    /**
     * 更新连接状态
     */
    updateConnectionStatus(isConnected) {
        const statusDiv = document.getElementById('connectionStatus');
        const statusText = document.getElementById('statusText');
        const lastSyncSpan = document.getElementById('lastSync');
        
        if (isConnected) {
            statusDiv.className = 'alert alert-success';
            statusText.innerHTML = '<i class="bi bi-check-circle me-2"></i>已连接到Google Sheets';
            const lastSync = this.sheetsManager.lastSyncTime;
            if (lastSync) {
                lastSyncSpan.textContent = `最后同步: ${new Date(lastSync).toLocaleString()}`;
            }
        } else {
            statusDiv.className = 'alert alert-warning';
            statusText.innerHTML = '<i class="bi bi-exclamation-triangle me-2"></i>未连接到Google Sheets';
            lastSyncSpan.textContent = '';
        }
    }

    /**
     * 显示消息
     */
    showMessage(message, type = 'info') {
        // 创建临时提示
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // 3秒后自动移除
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 3000);
    }

    /**
     * 记录日志
     */
    log(message) {
        const logDiv = document.getElementById('operationLog');
        if (!logDiv) return;
        
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = 'text-muted small';
        logEntry.innerHTML = `[${timestamp}] ${message}`;
        
        // 如果是第一条日志，清除默认文本
        if (logDiv.children.length === 1 && logDiv.children[0].textContent === '暂无操作记录') {
            logDiv.innerHTML = '';
        }
        
        logDiv.appendChild(logEntry);
        logDiv.scrollTop = logDiv.scrollHeight;
    }

    /**
     * 清除日志
     */
    clearLog() {
        const logDiv = document.getElementById('operationLog');
        if (logDiv) {
            logDiv.innerHTML = '<div class="text-muted">暂无操作记录</div>';
        }
    }

    /**
     * 获取当前变体数据
     */
    getCurrentVariants() {
        return this.currentVariants;
    }
}

// 创建全局实例
window.variantManager = new VariantManager();