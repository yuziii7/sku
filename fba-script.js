document.addEventListener('DOMContentLoaded', function() {
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
    document.getElementById('startDate').value = todayFormatted;
    document.getElementById('endDate').value = todayFormatted;
    document.getElementById('detail-startDate').value = todayFormatted;
    document.getElementById('detail-endDate').value = todayFormatted;

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
                const additional_weight = Math.ceil((chargeable_weight - 48) / 0.5);
                return 6.92 + additional_weight * 0.16;
            }
        }
        
        // 默认返回值
        return 0;
    }

    // 计算和显示物流费用
    function calculateAndDisplayShipping(source = 'main') {
        try {
            // 获取输入值（根据来源选择不同的输入框）
            const lengthElement = source === 'main' ? 'length' : 'shipping-length';
            const widthElement = source === 'main' ? 'width' : 'shipping-width';
            const heightElement = source === 'main' ? 'height' : 'shipping-height';
            const weightElement = source === 'main' ? 'weight' : 'shipping-weight';
            const resultElement = source === 'main' ? 'shippingResult' : 'shipping-detailed-result';
            
            const length_cm = parseFloat(document.getElementById(lengthElement).value);
            const width_cm = parseFloat(document.getElementById(widthElement).value);
            const height_cm = parseFloat(document.getElementById(heightElement).value);
            const actual_weight_g = parseFloat(document.getElementById(weightElement).value);
            
            // 验证输入
            if (isNaN(length_cm) || isNaN(width_cm) || isNaN(height_cm) || isNaN(actual_weight_g)) {
                throw new Error('请输入有效的数字');
            }
            
            if (length_cm <= 0 || width_cm <= 0 || height_cm <= 0 || actual_weight_g <= 0) {
                throw new Error('所有数值必须大于0');
            }
            
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
            
            document.getElementById(resultElement).textContent = result_text;
            
            // 同步另一个视图的输入框（如果计算来自主视图，则同步到详细视图，反之亦然）
            if (source === 'main') {
                document.getElementById('shipping-length').value = length_cm;
                document.getElementById('shipping-width').value = width_cm;
                document.getElementById('shipping-height').value = height_cm;
                document.getElementById('shipping-weight').value = actual_weight_g;
                document.getElementById('shipping-detailed-result').textContent = result_text;
            } else {
                document.getElementById('length').value = length_cm;
                document.getElementById('width').value = width_cm;
                document.getElementById('height').value = height_cm;
                document.getElementById('weight').value = actual_weight_g;
                document.getElementById('shippingResult').textContent = result_text;
            }
            
        } catch (error) {
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
    function calculateAndDisplayCommission(source = 'main') {
        try {
            // 获取输入值
            const priceElement = source === 'main' ? 'price' : 'detail-price';
            const resultElement = source === 'main' ? 'commissionResult' : 'commission-detailed-result';
            
            const total_price = parseFloat(document.getElementById(priceElement).value);
            const quantity = source === 'main' ? 1 : parseInt(document.getElementById('detail-quantity-commission').value || 1);
            
            // 验证输入
            if (isNaN(total_price) || total_price <= 0) {
                throw new Error('请输入有效的商品价格（大于0）');
            }
            
            if (isNaN(quantity) || quantity <= 0) {
                throw new Error('请输入有效的商品数量（大于0）');
            }
            
            // 计算基础佣金和固定手续费
            const base_fee = calculateCommission(total_price);
            const fixed_fee = 0.99; // 固定手续费
            
            // 计算总费用和每件商品的费用
            const total_fee_per_item = base_fee + fixed_fee;
            const total_fee = total_fee_per_item * quantity;
            
            // 保存佣金费用
            feeData.commissionFee = total_fee;
            updateTotalDisplay();
            
            // 显示结果
            let result_text;
            
            if (quantity === 1) {
                result_text = `商品总价：$${total_price.toFixed(2)}

基础佣金：$${base_fee.toFixed(2)} (${(base_fee / total_price * 100).toFixed(1)}%)
固定手续费：$${fixed_fee.toFixed(2)}
应收总费用：$${total_fee.toFixed(2)}`;
            } else {
                result_text = `商品单价：$${total_price.toFixed(2)}
商品数量：${quantity}件
商品总价：$${(total_price * quantity).toFixed(2)}

单件佣金：$${base_fee.toFixed(2)} (${(base_fee / total_price * 100).toFixed(1)}%)
单件固定手续费：$${fixed_fee.toFixed(2)}
单件费用合计：$${total_fee_per_item.toFixed(2)}

应收总费用：$${total_fee.toFixed(2)}`;
            }
            
            document.getElementById(resultElement).textContent = result_text;
            
            // 同步另一个视图的输入框
            if (source === 'main') {
                document.getElementById('detail-price').value = total_price;
                document.getElementById('commission-detailed-result').textContent = result_text;
            } else {
                document.getElementById('price').value = total_price;
                document.getElementById('commissionResult').textContent = result_text;
            }
            
        } catch (error) {
            alert(error.message || '计算出错，请检查输入');
        }
    }

    // ======== 仓储费用计算 ========
    
    // 计算基础仓储费用
    function calculateBaseStorageCost(length_cm, width_cm, height_cm, start_date, end_date, quantity) {
        try {
            // 验证输入
            if (length_cm <= 0 || width_cm <= 0 || height_cm <= 0 || quantity <= 0) {
                throw new Error('所有数值必须大于0');
            }
            
            // 转换厘米到英寸
            const length_in = length_cm * 0.393701;
            const width_in = width_cm * 0.393701;
            const height_in = height_cm * 0.393701;
            
            // 计算体积（立方英寸和立方英尺）
            const volume_cubic_in = length_in * width_in * height_in;
            const volume_cubic_ft = volume_cubic_in / 1728;
            
            // 计算日期差异（天数）
            const start = new Date(start_date);
            const end = new Date(end_date);
            const total_days = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1; // 包括开始和结束日期
            
            if (total_days <= 0) {
                throw new Error('结束日期必须在开始日期之后');
            }
            
            // 计算存储时间（周）
            const duration_weeks = total_days / 7;
            
            // 计算基础存储费用
            let base_storage_cost = 0;
            let current_date = new Date(start);
            
            // 遍历每个月计算费用
            while (current_date <= end) {
                const month = current_date.getMonth() + 1; // 获取月份（1-12）
                const year = current_date.getFullYear();
                
                // 获取当月天数
                const days_in_month = new Date(year, month, 0).getDate();
                
                // 计算当月中的存储天数
                let days_in_current_month;
                
                if (current_date.getMonth() === end.getMonth() && current_date.getFullYear() === end.getFullYear()) {
                    days_in_current_month = end.getDate() - current_date.getDate() + 1;
                } else {
                    days_in_current_month = days_in_month - current_date.getDate() + 1;
                }
                
                // 确保不超过当月剩余天数
                days_in_current_month = Math.min(days_in_current_month, days_in_month);
                
                // 根据月份确定费率
                const rate = (month >= 1 && month <= 9) ? 0.78 : 2.4;
                
                // 计算当月存储费用
                const monthly_cost = volume_cubic_ft * rate * (days_in_current_month / days_in_month);
                base_storage_cost += monthly_cost;
                
                // 移动到下个月的第一天
                if (current_date.getMonth() === 11) { // 12月
                    current_date = new Date(current_date.getFullYear() + 1, 0, 1); // 下一年1月1日
                } else {
                    current_date = new Date(current_date.getFullYear(), current_date.getMonth() + 1, 1); // 下月1日
                }
            }
            
            // 计算每件商品的费用
            const per_item_cost = base_storage_cost / quantity;
            
            return {
                length_in,
                width_in,
                height_in,
                volume_cubic_in,
                volume_cubic_ft,
                total_days,
                duration_weeks,
                base_storage_cost,
                per_item_cost
            };
            
        } catch (error) {
            throw error;
        }
    }

    // 计算长期存储附加费
    function calculateAdditionalStorageCost(volume_cubic_ft, duration_weeks) {
        let additional_rate = 0;
        
        if (duration_weeks >= 22 && duration_weeks < 28) {
            additional_rate = 0.44;
        } else if (duration_weeks >= 28 && duration_weeks < 36) {
            additional_rate = 0.76;
        } else if (duration_weeks >= 36 && duration_weeks < 44) {
            additional_rate = 1.16;
        } else if (duration_weeks >= 44 && duration_weeks < 52) {
            additional_rate = 1.58;
        } else if (duration_weeks >= 52) {
            additional_rate = 1.88;
        }
        
        return volume_cubic_ft * additional_rate;
    }

    // 计算和显示基础仓储费用
    function calculateAndDisplayBaseStorage(source = 'main') {
        try {
            // 获取输入值
            const lengthElement = source === 'main' ? 'storageLength' : 'detail-storageLength';
            const widthElement = source === 'main' ? 'storageWidth' : 'detail-storageWidth';
            const heightElement = source === 'main' ? 'storageHeight' : 'detail-storageHeight';
            const startDateElement = source === 'main' ? 'startDate' : 'detail-startDate';
            const endDateElement = source === 'main' ? 'endDate' : 'detail-endDate';
            const quantityElement = source === 'main' ? 'quantity' : 'detail-quantity';
            const resultElement = source === 'main' ? 'storageResult' : 'storage-detailed-result';
            
            const length_cm = parseFloat(document.getElementById(lengthElement).value);
            const width_cm = parseFloat(document.getElementById(widthElement).value);
            const height_cm = parseFloat(document.getElementById(heightElement).value);
            const start_date = document.getElementById(startDateElement).value;
            const end_date = document.getElementById(endDateElement).value;
            const quantity = parseInt(document.getElementById(quantityElement).value);
            
            // 验证输入
            if (isNaN(length_cm) || isNaN(width_cm) || isNaN(height_cm) || isNaN(quantity)) {
                throw new Error('请输入有效的数字');
            }
            
            if (!start_date || !end_date) {
                throw new Error('请选择有效的日期');
            }
            
            // 计算基础仓储费用
            const { 
                length_in, 
                width_in, 
                height_in, 
                volume_cubic_in, 
                volume_cubic_ft, 
                total_days, 
                duration_weeks,
                base_storage_cost, 
                per_item_cost 
            } = calculateBaseStorageCost(length_cm, width_cm, height_cm, start_date, end_date, quantity);
            
            // 保存仓储费用
            feeData.storageFee = base_storage_cost;
            updateTotalDisplay();
            
            // 格式化开始和结束日期用于显示
            const start_date_formatted = new Date(start_date).toLocaleDateString();
            const end_date_formatted = new Date(end_date).toLocaleDateString();
            
            // 显示结果
            const result_text = `箱体尺寸：${length_cm.toFixed(2)} × ${width_cm.toFixed(2)} × ${height_cm.toFixed(2)} 厘米
装箱商品数量：${quantity}
存储时间：${start_date_formatted} 至 ${end_date_formatted} (${total_days}天)

体积：${volume_cubic_in.toFixed(2)} 立方英寸 (${volume_cubic_ft.toFixed(4)} 立方英尺)
基础仓储费用：$${base_storage_cost.toFixed(2)}
每件商品仓储费用：$${per_item_cost.toFixed(4)}`;
            
            document.getElementById(resultElement).textContent = result_text;
            
            // 同步另一个视图的输入框
            if (source === 'main') {
                document.getElementById('detail-storageLength').value = length_cm;
                document.getElementById('detail-storageWidth').value = width_cm;
                document.getElementById('detail-storageHeight').value = height_cm;
                document.getElementById('detail-startDate').value = start_date;
                document.getElementById('detail-endDate').value = end_date;
                document.getElementById('detail-quantity').value = quantity;
                document.getElementById('storage-detailed-result').textContent = result_text;
            } else {
                document.getElementById('storageLength').value = length_cm;
                document.getElementById('storageWidth').value = width_cm;
                document.getElementById('storageHeight').value = height_cm;
                document.getElementById('startDate').value = start_date;
                document.getElementById('endDate').value = end_date;
                document.getElementById('quantity').value = quantity;
                document.getElementById('storageResult').textContent = result_text;
            }
            
        } catch (error) {
            alert(error.message || '计算出错，请检查输入');
        }
    }

    // 计算和显示全部仓储费用（包括长期存储附加费）
    function calculateAndDisplayStorage(source = 'main') {
        try {
            // 获取输入值
            const lengthElement = source === 'main' ? 'storageLength' : 'detail-storageLength';
            const widthElement = source === 'main' ? 'storageWidth' : 'detail-storageWidth';
            const heightElement = source === 'main' ? 'storageHeight' : 'detail-storageHeight';
            const startDateElement = source === 'main' ? 'startDate' : 'detail-startDate';
            const endDateElement = source === 'main' ? 'endDate' : 'detail-endDate';
            const quantityElement = source === 'main' ? 'quantity' : 'detail-quantity';
            const resultElement = source === 'main' ? 'storageResult' : 'storage-detailed-result';
            
            const length_cm = parseFloat(document.getElementById(lengthElement).value);
            const width_cm = parseFloat(document.getElementById(widthElement).value);
            const height_cm = parseFloat(document.getElementById(heightElement).value);
            const start_date = document.getElementById(startDateElement).value;
            const end_date = document.getElementById(endDateElement).value;
            const quantity = parseInt(document.getElementById(quantityElement).value);
            
            // 验证输入
            if (isNaN(length_cm) || isNaN(width_cm) || isNaN(height_cm) || isNaN(quantity)) {
                throw new Error('请输入有效的数字');
            }
            
            if (!start_date || !end_date) {
                throw new Error('请选择有效的日期');
            }
            
            // 计算基础仓储费用
            const { 
                length_in, 
                width_in, 
                height_in, 
                volume_cubic_in, 
                volume_cubic_ft, 
                total_days, 
                duration_weeks,
                base_storage_cost, 
                per_item_cost 
            } = calculateBaseStorageCost(length_cm, width_cm, height_cm, start_date, end_date, quantity);
            
            // 计算长期存储附加费
            const additional_cost = calculateAdditionalStorageCost(volume_cubic_ft, duration_weeks);
            
            // 计算总费用
            const total_storage_cost = base_storage_cost + additional_cost;
            const total_per_item_cost = total_storage_cost / quantity;
            
            // 保存仓储费用
            feeData.storageFee = total_storage_cost;
            updateTotalDisplay();
            
            // 格式化开始和结束日期用于显示
            const start_date_formatted = new Date(start_date).toLocaleDateString();
            const end_date_formatted = new Date(end_date).toLocaleDateString();
            
            // 显示结果
            const result_text = `箱体尺寸：${length_cm.toFixed(2)} × ${width_cm.toFixed(2)} × ${height_cm.toFixed(2)} 厘米
装箱商品数量：${quantity}
存储时间：${start_date_formatted} 至 ${end_date_formatted} (${total_days}天，约${duration_weeks.toFixed(1)}周)

体积：${volume_cubic_in.toFixed(2)} 立方英寸 (${volume_cubic_ft.toFixed(4)} 立方英尺)
基础仓储费用：$${base_storage_cost.toFixed(2)}
长期存储附加费：$${additional_cost.toFixed(2)}
总仓储费用：$${total_storage_cost.toFixed(2)}
每件商品仓储费用：$${total_per_item_cost.toFixed(4)}`;
            
            document.getElementById(resultElement).textContent = result_text;
            
            // 同步另一个视图的输入框
            if (source === 'main') {
                document.getElementById('detail-storageLength').value = length_cm;
                document.getElementById('detail-storageWidth').value = width_cm;
                document.getElementById('detail-storageHeight').value = height_cm;
                document.getElementById('detail-startDate').value = start_date;
                document.getElementById('detail-endDate').value = end_date;
                document.getElementById('detail-quantity').value = quantity;
                document.getElementById('storage-detailed-result').textContent = result_text;
            } else {
                document.getElementById('storageLength').value = length_cm;
                document.getElementById('storageWidth').value = width_cm;
                document.getElementById('storageHeight').value = height_cm;
                document.getElementById('startDate').value = start_date;
                document.getElementById('endDate').value = end_date;
                document.getElementById('quantity').value = quantity;
                document.getElementById('storageResult').textContent = result_text;
            }
            
        } catch (error) {
            alert(error.message || '计算出错，请检查输入');
        }
    }

    // ======== 总费用计算 ========
    
    // 更新总费用显示
    function updateTotalDisplay() {
        const totalFee = feeData.shippingFee + feeData.storageFee + feeData.commissionFee;
        
        document.getElementById('shippingFee').textContent = feeData.shippingFee.toFixed(2);
        document.getElementById('storageFee').textContent = feeData.storageFee.toFixed(2);
        document.getElementById('commissionFee').textContent = feeData.commissionFee.toFixed(2);
        document.getElementById('totalFee').textContent = totalFee.toFixed(2);
    }

    // 计算总费用（仅更新显示）
    function calculateTotal() {
        updateTotalDisplay();
        
        // 添加高亮效果
        document.getElementById('totalFee').parentElement.classList.add('highlight');
        setTimeout(() => {
            document.getElementById('totalFee').parentElement.classList.remove('highlight');
        }, 2000);
    }

    // 清除所有费用
    function clearAllFees() {
        feeData.shippingFee = 0.0;
        feeData.storageFee = 0.0;
        feeData.commissionFee = 0.0;
        
        updateTotalDisplay();
        
        // 清除所有结果区域
        document.getElementById('shippingResult').textContent = '';
        document.getElementById('storageResult').textContent = '';
        document.getElementById('commissionResult').textContent = '';
        document.getElementById('shipping-detailed-result').textContent = '';
        document.getElementById('storage-detailed-result').textContent = '';
        document.getElementById('commission-detailed-result').textContent = '';
    }

    // ======== 事件监听器 ========
    
    // 主视图按钮事件
    document.getElementById('calculateShipping').addEventListener('click', () => calculateAndDisplayShipping('main'));
    document.getElementById('calculateStorage').addEventListener('click', () => calculateAndDisplayStorage('main'));
    document.getElementById('calculateBaseStorage').addEventListener('click', () => calculateAndDisplayBaseStorage('main'));
    document.getElementById('calculateCommission').addEventListener('click', () => calculateAndDisplayCommission('main'));
    document.getElementById('calculateTotal').addEventListener('click', calculateTotal);
    document.getElementById('clearAll').addEventListener('click', clearAllFees);
    
    // 详细视图按钮事件
    document.getElementById('shipping-calculate').addEventListener('click', () => calculateAndDisplayShipping('detail'));
    document.getElementById('detail-calculateStorage').addEventListener('click', () => calculateAndDisplayStorage('detail'));
    document.getElementById('detail-calculateBaseStorage').addEventListener('click', () => calculateAndDisplayBaseStorage('detail'));
    document.getElementById('detail-calculateCommission').addEventListener('click', () => calculateAndDisplayCommission('detail'));
    
    // 初始化
    updateTotalDisplay();
}); 