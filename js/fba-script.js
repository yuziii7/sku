// FBA计算器脚本 - 修复版
// 认证功能已禁用，仅提供本地计算

document.addEventListener('DOMContentLoaded', function() {
    console.log("FBA计算器脚本已加载");
    
    // 定义一个临时的fbaDatabase对象（如果导入失败时使用）
    let fbaDatabase = {
        saveCalculation: async function() { 
            return { success: false, message: '保存功能已禁用' }; 
        },
        getCalculationHistory: async function() { 
            return { success: true, history: [] }; 
        }
    };
    
    // 尝试异步导入数据库模块
    (async function loadDatabase() {
        try {
            const module = await import('./indexed-db-factory.js');
            if (module && module.fbaDatabase) {
                fbaDatabase = module.fbaDatabase;
                console.log("数据库模块加载成功");
            }
        } catch (error) {
            console.warn("导入数据库模块失败，将使用本地计算模式:", error);
        }
    })();
    
    // 初始化数据
    const feeData = {
        shippingFee: 0.0,
        storageFee: 0.0,
        commissionFee: 0.0
    };

    // 设置当前日期为日期选择器的默认值
    const today = new Date();
    const todayFormatted = today.toISOString().split('T')[0];
    
    // 设置默认开始日期和结束日期
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    if (startDateInput) startDateInput.value = todayFormatted;
    if (endDateInput) endDateInput.value = todayFormatted;

    // 创建保存按钮元素，但隐藏它（认证功能已禁用）
    try {
        const totalFeeContainer = document.querySelector('.card-body');
        if (totalFeeContainer) {
            const saveButtonContainer = document.createElement('div');
            saveButtonContainer.innerHTML = `
                <button id="saveCalculation" class="btn btn-info w-100 mt-3" style="display: none;">
                    <i class="bi bi-cloud-upload"></i> 保存计算结果
                </button>
                <div id="saveMessage" class="alert mt-2" style="display: none;"></div>
            `;
            totalFeeContainer.appendChild(saveButtonContainer);
        }
    } catch (error) {
        console.warn("创建保存按钮失败:", error);
    }
    
    const saveButton = document.getElementById('saveCalculation');
    const saveMessage = document.getElementById('saveMessage');
    
    // 保持保存按钮隐藏（认证功能已禁用）
    if (saveButton) {
        saveButton.style.display = 'none';
    }

    // ======== 滑动效果 ========
    const sliderWrapper = document.getElementById('sliderWrapper');
    const slideToRulesBtn = document.getElementById('slideToRules');
    const slideToCalculatorBtn = document.getElementById('slideToCalculator');
    
    // 确保按钮和滑动容器都存在
    if (sliderWrapper && slideToRulesBtn && slideToCalculatorBtn) {
        // 确保按钮初始状态正确
        function updateButtonVisibility() {
            if (sliderWrapper.classList.contains('show-rules')) {
                slideToRulesBtn.style.display = 'none';
                slideToCalculatorBtn.style.display = 'flex';
            } else {
                slideToRulesBtn.style.display = 'flex';
                slideToCalculatorBtn.style.display = 'none';
            }
        }
        
        // 点击切换到规则页
        slideToRulesBtn.addEventListener('click', function() {
            sliderWrapper.classList.add('show-rules');
            updateButtonVisibility();
        });
        
        // 点击切换到计算器页
        slideToCalculatorBtn.addEventListener('click', function() {
            sliderWrapper.classList.remove('show-rules');
            updateButtonVisibility();
        });
        
        // 初始化按钮状态
        updateButtonVisibility();
    } else {
        console.warn("滑动容器或按钮不存在，滑动功能将不可用");
    }

    // ======== 输入验证辅助函数 ========
    
    // 获取并验证数值输入
    function getNumberInput(id, errorMessage) {
        const input = document.getElementById(id);
        if (!input) {
            throw new Error(`找不到ID为${id}的输入框`);
        }
        
        const value = parseFloat(input.value);
        if (isNaN(value) || value <= 0) {
            throw new Error(errorMessage || `${id}必须是大于0的数值`);
        }
        
        return value;
    }
    
    // 获取并验证日期输入
    function getDateInput(id, errorMessage) {
        const input = document.getElementById(id);
        if (!input) {
            throw new Error(`找不到ID为${id}的日期输入框`);
        }
        
        const value = input.value;
        if (!value) {
            throw new Error(errorMessage || `${id}必须选择有效日期`);
        }
        
        return value;
    }
    
    // 显示计算结果
    function displayResult(id, text) {
        const resultElement = document.getElementById(id);
        if (!resultElement) {
            console.error(`找不到ID为${id}的结果显示区域`);
            alert(`结果显示区域"${id}"不存在，请检查HTML结构`);
            return false;
        }
        
        resultElement.textContent = text;
        return true;
    }

    // ======== 物流配送费计算 ========
    
    // 计算体积重量和计费重量
    function calculateChargeableWeight(length_cm, width_cm, height_cm, actual_weight_g) {
        const actual_weight_kg = actual_weight_g / 1000;
        
        // 转换厘米到英寸
        const length_in = length_cm * 0.3937;
        const width_in = width_cm * 0.3937;
        const height_in = height_cm * 0.3937;
        
        // 转换公斤到盎司
        const actual_weight_oz = actual_weight_kg * 35.273;
        
        // 计算体积重量（盎司）
        const volume_weight_oz = (length_in * width_in * height_in) / 139 * 16;
        
        // 计费重量为体积重量和实际重量的较大者
        const chargeable_weight = Math.max(volume_weight_oz, actual_weight_oz);
        
        return {
            length_in,
            width_in,
            height_in,
            actual_weight_oz,
            volume_weight_oz,
            chargeable_weight
        };
    }

    // 判断是否为小号物件
    function isSmallPackage(length_in, width_in, height_in, actual_weight_oz) {
        const max_side = Math.max(width_in, height_in);
        const min_side = Math.min(width_in, height_in);
        
        return (
            actual_weight_oz <= 16 &&
            length_in <= 15 &&
            max_side <= 12 &&
            min_side <= 0.75
        );
    }

    // 计算物流费用
    function calculateShippingPrice(chargeable_weight, is_small) {
        if (is_small) {
            if (chargeable_weight <= 4) {
                return 3.27;
            } else if (chargeable_weight <= 8) {
                return 3.42;
            } else if (chargeable_weight <= 12) {
                return 3.72;
            } else if (chargeable_weight <= 16) {
                return 3.98;
            }
        } else {
            if (chargeable_weight <= 4) {
                return 4.25;
            } else if (chargeable_weight <= 8) {
                return 4.45;
            } else if (chargeable_weight <= 12) {
                return 4.67;
            } else if (chargeable_weight <= 16) {
                return 5.12;
            } else if (chargeable_weight <= 24) {
                return 5.90;
            } else if (chargeable_weight <= 32) {
                return 6.14;
            } else if (chargeable_weight <= 40) {
                return 6.60;
            } else if (chargeable_weight <= 48) {
                return 6.81;
            } else {
                const additional_weight = Math.ceil((chargeable_weight - 48) / 8);
                return 6.92 + additional_weight * 0.16;
            }
        }
        
        // 默认返回值
        return 0;
    }

    // 计算和显示物流费用
    function calculateAndDisplayShipping() {
        console.log("开始计算物流配送费");
        try {
            // 获取输入值
            const length_cm = getNumberInput('length', '长度必须是大于0的数值');
            const width_cm = getNumberInput('width', '宽度必须是大于0的数值');
            const height_cm = getNumberInput('height', '高度必须是大于0的数值');
            const actual_weight_g = getNumberInput('weight', '重量必须是大于0的数值');
            
            console.log(`输入值: ${length_cm}厘米 x ${width_cm}厘米 x ${height_cm}厘米, ${actual_weight_g}克`);
            
            // 计算
            const { 
                length_in, 
                width_in, 
                height_in, 
                actual_weight_oz, 
                volume_weight_oz, 
                chargeable_weight 
            } = calculateChargeableWeight(length_cm, width_cm, height_cm, actual_weight_g);
            
            // 判断包裹类型
            const is_small = isSmallPackage(length_in, width_in, height_in, actual_weight_oz);
            const size_type = is_small ? "小号物件" : "大号物件";
            
            // 计算价格
            const price = calculateShippingPrice(chargeable_weight, is_small);
            
            // 保存物流费用
            feeData.shippingFee = price;
            updateTotalDisplay();
            
            // 显示结果
            const result_text = `尺寸（英寸）：${length_in.toFixed(2)} × ${width_in.toFixed(2)} × ${height_in.toFixed(2)}
尺寸（厘米）：${length_cm.toFixed(2)} × ${width_cm.toFixed(2)} × ${height_cm.toFixed(2)}

实际重量：${actual_weight_g.toFixed(2)} g (${actual_weight_oz.toFixed(2)} oz)
体积重量：${volume_weight_oz.toFixed(2)} oz
计费重量：${chargeable_weight.toFixed(2)} oz

尺寸类型：${size_type}
计费价格：$${price.toFixed(2)}`;
            
            // 显示结果
            const displaySuccess = displayResult('shippingResult', result_text);
            if (!displaySuccess) return;
            
            console.log("物流配送费计算成功");
        } catch (error) {
            console.error("物流配送费计算失败:", error);
            alert(error.message || '计算出错，请检查输入');
        }
    }

    // ======== 佣金计算 ========
    
    // 计算佣金
    function calculateCommission(total_price) {
        let fee;
        
        if (total_price <= 15.00) {
            fee = total_price * 0.05; // 5%佣金
        } else if (total_price <= 20.00) {
            fee = total_price * 0.10; // 10%佣金
        } else {
            fee = total_price * 0.17; // 17%佣金
        }
        
        // 确保最低佣金为$0.30
        return Math.max(fee, 0.3);
    }

    // 计算和显示佣金
    function calculateAndDisplayCommission() {
        console.log("开始计算佣金");
        try {
            // 获取输入值
            const price = getNumberInput('price', '商品售价必须是大于0的数值');
            
            console.log(`商品售价: $${price}`);
            
            // 计算佣金
            const commission_fee = calculateCommission(price);
            const fixed_fee = 0.99;
            const total_fee = commission_fee + fixed_fee;
            
            // 保存佣金费用
            feeData.commissionFee = total_fee;
            updateTotalDisplay();
            
            // 计算佣金百分比
            let fee_percent;
            if (price <= 15.00) {
                fee_percent = "5%";
            } else if (price <= 20.00) {
                fee_percent = "10%";
            } else {
                fee_percent = "17%";
            }
            
            // 显示结果
            const result_text = `商品价格：$${price.toFixed(2)}
适用佣金比例：${fee_percent}
计算的佣金：$${commission_fee.toFixed(2)}
固定手续费：$${fixed_fee.toFixed(2)}
总佣金费用：$${total_fee.toFixed(2)}`;

            // 显示结果
            const displaySuccess = displayResult('commissionResult', result_text);
            if (!displaySuccess) return;
            
            console.log("佣金计算成功");
        } catch (error) {
            console.error("佣金计算失败:", error);
            alert(error.message || '计算出错');
        }
    }

    // ======== 仓储费计算 ========
    
    // 计算基础仓储费
    function calculateBaseStorageCost(length_cm, width_cm, height_cm, start_date, end_date, quantity) {
        // 转换尺寸为英寸
        const length_in = length_cm * 0.3937;
        const width_in = width_cm * 0.3937;
        const height_in = height_cm * 0.3937;
        
        // 计算单个商品的体积（立方英尺）
        const volume_cubic_inch = length_in * width_in * height_in;
        const volume_cubic_ft = volume_cubic_inch / 1728; // 1728立方英寸 = 1立方英尺
        
        // 计算总体积（所有商品）
        const total_volume_cubic_ft = volume_cubic_ft * quantity;
        
        // 计算存储天数
        const start = new Date(start_date);
        const end = new Date(end_date);
        
        // 验证日期是否有效
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new Error('请输入有效的日期');
        }
        
        // 确保结束日期不早于开始日期
        if (end < start) {
            throw new Error('结束日期必须晚于开始日期');
        }
        
        // 计算存储天数（+1是因为包括开始和结束日）
        const storage_days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        
        // 计算存储月份跨度
        const months = [];
        const current_date = new Date(start);
        
        while (current_date <= end) {
            const month = current_date.getMonth();
            const year = current_date.getFullYear();
            const month_key = `${year}-${month+1}`;
            
            if (!months.includes(month_key)) {
                months.push(month_key);
            }
            
            // 移到下一天
            current_date.setDate(current_date.getDate() + 1);
        }
        
        // 计算每个月的天数
        const month_days = {};
        const current_date_count = new Date(start);
        
        while (current_date_count <= end) {
            const month = current_date_count.getMonth();
            const year = current_date_count.getFullYear();
            const month_key = `${year}-${month+1}`;
            
            if (!month_days[month_key]) {
                month_days[month_key] = 0;
            }
            
            month_days[month_key]++;
            
            // 移到下一天
            current_date_count.setDate(current_date_count.getDate() + 1);
        }
        
        // 计算存储费用
        let total_storage_cost = 0;
        
        for (const month_key in month_days) {
            const days_in_month = month_days[month_key];
            const month = parseInt(month_key.split('-')[1]);
            
            // 1-9月：$0.78/立方英尺/月，10-12月：$2.4/立方英尺/月
            const rate = (month >= 1 && month <= 9) ? 0.78 : 2.40;
            
            // 计算该月的费用
            const month_cost = total_volume_cubic_ft * rate * (days_in_month / 30);
            total_storage_cost += month_cost;
        }
        
        // 计算存储周数
        const storage_weeks = Math.ceil(storage_days / 7);
        
        return {
            total_volume_cubic_ft,
            storage_days,
            storage_weeks,
            total_storage_cost
        };
    }
    
    // 计算长期存储附加费
    function calculateAdditionalStorageCost(volume_cubic_ft, duration_weeks) {
        let additional_cost = 0;
        
        // 基于存储时间的附加费率
        if (duration_weeks >= 52) {
            additional_cost = volume_cubic_ft * 1.88;
        } else if (duration_weeks >= 44) {
            additional_cost = volume_cubic_ft * 1.58;
        } else if (duration_weeks >= 36) {
            additional_cost = volume_cubic_ft * 1.16;
        } else if (duration_weeks >= 28) {
            additional_cost = volume_cubic_ft * 0.76;
        } else if (duration_weeks >= 22) {
            additional_cost = volume_cubic_ft * 0.44;
        }
        
        return additional_cost;
    }
    
    // 计算并显示基本仓储费
    function calculateAndDisplayBaseStorage() {
        console.log("开始计算基础仓储费");
        try {
            // 获取输入值
            const length_cm = getNumberInput('storageLength', '装箱长度必须是大于0的数值');
            const width_cm = getNumberInput('storageWidth', '装箱宽度必须是大于0的数值');
            const height_cm = getNumberInput('storageHeight', '装箱高度必须是大于0的数值');
            const start_date = getDateInput('startDate', '请选择开始日期');
            const end_date = getDateInput('endDate', '请选择结束日期');
            const quantity = getNumberInput('quantity', '商品数量必须是大于0的整数');
            
            console.log(`仓储计算输入: ${length_cm}厘米 x ${width_cm}厘米 x ${height_cm}厘米, 从${start_date}到${end_date}, ${quantity}个商品`);
            
            // 计算基础仓储费
            const { 
                total_volume_cubic_ft,
                storage_days,
                storage_weeks,
                total_storage_cost
            } = calculateBaseStorageCost(length_cm, width_cm, height_cm, start_date, end_date, quantity);
            
            // 保存仓储费用
            feeData.storageFee = total_storage_cost;
            updateTotalDisplay();
            
            // 显示结果
            const result_text = `包装尺寸：${length_cm.toFixed(2)} × ${width_cm.toFixed(2)} × ${height_cm.toFixed(2)} 厘米
商品数量：${quantity}
总体积：${total_volume_cubic_ft.toFixed(4)} 立方英尺
存储时间：${storage_days} 天 (${storage_weeks} 周)
基础仓储费用：$${total_storage_cost.toFixed(2)}`;

            // 显示结果
            const displaySuccess = displayResult('storageResult', result_text);
            if (!displaySuccess) return;
            
            console.log("基础仓储费计算成功");
        } catch (error) {
            console.error("基础仓储费计算失败:", error);
            alert(error.message || '计算出错');
        }
    }
    
    // 计算并显示全部仓储费
    function calculateAndDisplayStorage() {
        console.log("开始计算全部仓储费");
        try {
            // 获取输入值
            const length_cm = getNumberInput('storageLength', '装箱长度必须是大于0的数值');
            const width_cm = getNumberInput('storageWidth', '装箱宽度必须是大于0的数值');
            const height_cm = getNumberInput('storageHeight', '装箱高度必须是大于0的数值');
            const start_date = getDateInput('startDate', '请选择开始日期');
            const end_date = getDateInput('endDate', '请选择结束日期');
            const quantity = getNumberInput('quantity', '商品数量必须是大于0的整数');
            
            console.log(`全部仓储费计算输入: ${length_cm}厘米 x ${width_cm}厘米 x ${height_cm}厘米, 从${start_date}到${end_date}, ${quantity}个商品`);
            
            // 计算基础仓储费
            const { 
                total_volume_cubic_ft,
                storage_days,
                storage_weeks,
                total_storage_cost
            } = calculateBaseStorageCost(length_cm, width_cm, height_cm, start_date, end_date, quantity);
            
            // 计算长期存储附加费
            const additional_cost = calculateAdditionalStorageCost(total_volume_cubic_ft, storage_weeks);
            
            // 计算总仓储费
            const total_cost = total_storage_cost + additional_cost;
            
            // 保存仓储费用
            feeData.storageFee = total_cost;
            updateTotalDisplay();
            
            // 显示结果
            const result_text = `包装尺寸：${length_cm.toFixed(2)} × ${width_cm.toFixed(2)} × ${height_cm.toFixed(2)} 厘米
商品数量：${quantity}
总体积：${total_volume_cubic_ft.toFixed(4)} 立方英尺
存储时间：${storage_days} 天 (${storage_weeks} 周)

基础仓储费用：$${total_storage_cost.toFixed(2)}
长期存储附加费：$${additional_cost.toFixed(2)}
总仓储费用：$${total_cost.toFixed(2)}`;

            // 显示结果
            const displaySuccess = displayResult('storageResult', result_text);
            if (!displaySuccess) return;
            
            console.log("全部仓储费计算成功");
        } catch (error) {
            console.error("全部仓储费计算失败:", error);
            alert(error.message || '计算出错');
        }
    }
    
    // ======== 总费用计算 ========
    
    // 更新总费用显示
    function updateTotalDisplay() {
        try {
            const shippingFeeElement = document.getElementById('shippingFee');
            const storageFeeElement = document.getElementById('storageFee');
            const commissionFeeElement = document.getElementById('commissionFee');
            const totalFeeElement = document.getElementById('totalFee');
            
            if (shippingFeeElement) shippingFeeElement.textContent = feeData.shippingFee.toFixed(2);
            if (storageFeeElement) storageFeeElement.textContent = feeData.storageFee.toFixed(2);
            if (commissionFeeElement) commissionFeeElement.textContent = feeData.commissionFee.toFixed(2);
            
            const total = feeData.shippingFee + feeData.storageFee + feeData.commissionFee;
            if (totalFeeElement) totalFeeElement.textContent = total.toFixed(2);
        } catch (error) {
            console.error("更新总费用显示失败:", error);
        }
    }
    
    // 计算总费用
    function calculateTotal() {
        try {
            const total = feeData.shippingFee + feeData.storageFee + feeData.commissionFee;
            
            const totalFeeElement = document.getElementById('totalFee');
            if (totalFeeElement) totalFeeElement.textContent = total.toFixed(2);
            
            alert(`已计算总费用：$${total.toFixed(2)}`);
            console.log("总费用计算成功: $" + total.toFixed(2));
        } catch (error) {
            console.error("计算总费用失败:", error);
            alert("计算总费用失败: " + error.message);
        }
    }
    
    // 清除所有费用
    function clearAllFees() {
        try {
            feeData.shippingFee = 0.0;
            feeData.storageFee = 0.0;
            feeData.commissionFee = 0.0;
            
            updateTotalDisplay();
            
            // 清除结果区域
            const shippingResultElement = document.getElementById('shippingResult');
            const storageResultElement = document.getElementById('storageResult');
            const commissionResultElement = document.getElementById('commissionResult');
            
            if (shippingResultElement) shippingResultElement.textContent = '';
            if (storageResultElement) storageResultElement.textContent = '';
            if (commissionResultElement) commissionResultElement.textContent = '';
            
            alert('已清除所有费用数据');
            console.log("已清除所有费用数据");
        } catch (error) {
            console.error("清除费用数据失败:", error);
            alert("清除费用数据失败: " + error.message);
        }
    }
    
    // 绑定事件监听器
    function bindEventListeners() {
        console.log("绑定事件监听器");
        
        // 获取所有计算按钮
        const calculateShippingBtn = document.getElementById('calculateShipping');
        const calculateCommissionBtn = document.getElementById('calculateCommission');
        const calculateStorageBtn = document.getElementById('calculateStorage');
        const calculateBaseStorageBtn = document.getElementById('calculateBaseStorage');
        const calculateTotalBtn = document.getElementById('calculateTotal');
        const clearAllBtn = document.getElementById('clearAll');
        
        // 绑定事件处理函数
        if (calculateShippingBtn) {
            calculateShippingBtn.addEventListener('click', calculateAndDisplayShipping);
            console.log("物流配送费计算按钮已绑定");
        } else {
            console.warn("找不到物流配送费计算按钮");
        }
        
        if (calculateCommissionBtn) {
            calculateCommissionBtn.addEventListener('click', calculateAndDisplayCommission);
            console.log("佣金计算按钮已绑定");
        } else {
            console.warn("找不到佣金计算按钮");
        }
        
        if (calculateStorageBtn) {
            calculateStorageBtn.addEventListener('click', calculateAndDisplayStorage);
            console.log("全部仓储费计算按钮已绑定");
        } else {
            console.warn("找不到全部仓储费计算按钮");
        }
        
        if (calculateBaseStorageBtn) {
            calculateBaseStorageBtn.addEventListener('click', calculateAndDisplayBaseStorage);
            console.log("基础仓储费计算按钮已绑定");
        } else {
            console.warn("找不到基础仓储费计算按钮");
        }
        
        if (calculateTotalBtn) {
            calculateTotalBtn.addEventListener('click', calculateTotal);
            console.log("总费用计算按钮已绑定");
        } else {
            console.warn("找不到总费用计算按钮");
        }
        
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', clearAllFees);
            console.log("清除所有费用按钮已绑定");
        } else {
            console.warn("找不到清除所有费用按钮");
        }
        
        console.log("已禁用自动跳转到费用规则的功能");
    }
    
    // 显示规则提示
    function showRulesTip(ruleType) {
        try {
            const tipElement = document.createElement('div');
            tipElement.className = 'rules-tip';
            tipElement.textContent = `查看${ruleType}`;
            document.body.appendChild(tipElement);
            
            setTimeout(() => {
                tipElement.classList.add('show');
            }, 100);
            
            setTimeout(() => {
                tipElement.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(tipElement);
                }, 500);
            }, 2000);
        } catch (error) {
            console.warn("显示规则提示失败:", error);
        }
    }

    // 保存计算结果 - 由于认证已禁用，显示消息
    if (saveButton) {
        saveButton.addEventListener('click', function() {
            showSaveMessage('error', '保存功能已禁用');
        });
    }
    
    // 显示保存消息
    function showSaveMessage(type, message) {
        if (!saveMessage) return;
        
        saveMessage.textContent = message;
        saveMessage.style.display = 'block';
        
        if (type === 'error') {
            saveMessage.className = 'alert alert-danger mt-2';
        } else {
            saveMessage.className = 'alert alert-success mt-2';
        }
        
        // 3秒后自动隐藏
        setTimeout(() => {
            saveMessage.style.display = 'none';
        }, 3000);
    }
    
    // 绑定所有事件监听器
    bindEventListeners();
    
    // 初始化计算器
    console.log("FBA计算器初始化完成");
}); 