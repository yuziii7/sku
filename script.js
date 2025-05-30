import { skuDatabase } from './indexed-db-factory.js';

document.addEventListener('DOMContentLoaded', function() {
    // 初始化数据
    const data = {
        // 颜色映射
        colorMapping: {
            "黑色": "BK", "红色": "RD", "橙色": "OG", "黄色": "YL", 
            "绿色": "GN", "紫色": "PL", "棕色": "BN", "蓝色": "BL", 
            "青色": "CY", "粉色": "PK", "粉红色": "NP", "粉紫色": "VI", 
            "白色": "WH", "灰色": "GY", "金色": "GD", "银色": "SV", 
            "彩色": "MU", "透明": "CR", "褐色": "TN", "卡其色": "KI", 
            "豹纹": "LD", "墨绿色": "DG", "酒红色": "BU", "古铜色": "BR",
            "反光": "RE", "夜光": "LU"
        },
        
        // 节日映射
        festivalMapping: {
            "圣诞节": "C", 
            "万圣节": "H"
        },
        
        // 动物映射
        animalMapping: {
            "蜜蜂": "A036", "火烈鸟": "A035", "狼": "A034", "海马": "A033", 
            "浣熊": "A032", "鸡": "A031", "海豚": "A030", "怪兽": "A029", 
            "蝾螈": "A028", "瓢虫": "A027", "熊猫": "A026", "长颈鹿": "A025", 
            "青蛙": "A024", "老虎": "A023", "豹": "A022", "企鹅": "A021", 
            "鼹鼠": "A020", "猪": "A019", "驴": "A018", "狮子": "A017", 
            "狗": "A016", "牛": "A015", "狐狸": "A014", "猴子": "A013", 
            "熊": "A012", "鹿": "A011", "猫": "A010", "老鼠": "A009", 
            "兔子": "A008", "章鱼": "A007", "鲨鱼": "A006", "蝙蝠": "A005", 
            "蝴蝶": "A004", "龙": "A003", "独角兽": "A002", "恐龙": "A001"
        },
        
        // 职业映射
        professionMapping: {
            "屠夫": "F021", "赛事宝贝": "F020", "宇航员": "F019", "医生护士": "F018", 
            "银行抢劫犯": "F017", "修女牧师": "F016", "船长": "F015", "军人": "F014", 
            "赛博朋克": "F013", "明星": "F012", "运动员": "F011", "帮派分子": "F010", 
            "女郎": "F009", "飞行员": "F008", "啤酒节": "F007", "摇滚": "F006", 
            "消防员": "F005", "囚犯": "F004", "警察": "F003", "FBI": "F002", 
            "啦啦队": "F001"
        },
        
        // 幽默映射
        humorMapping: {
            "植物": "H013", "茄子": "H012", "富人": "H011", "彩虹": "H010", 
            "毕业季": "H009", "雪花": "H008", "食物": "H007", "找茬": "H006", 
            "马桶": "H005", "光头": "H004", "老太太": "H003", "蘑菇": "H002", 
            "南瓜": "H001"
        },
        
        // 角色映射
        roleMapping: {
            "外星人": "C037", "经典": "C036", "咆哮鬼": "C035", "精灵": "C034", 
            "野人": "C033", "骑士": "C032", "女王": "C031", "法师": "C030", 
            "瘟疫医生": "C029", "年代服": "C028", "牛仔": "C027", "遗皮": "C026", 
            "香肠人": "C025", "罗马战士": "C024", "中世纪": "C023", "狼人": "C022", 
            "稻草人": "C021", "小丑": "C020", "海盗": "C019", "女神": "C018", 
            "美人鱼": "C017", "王子": "C016", "仙女": "C015", "公主": "C014", 
            "灰姑娘": "C013", "小红帽": "C012", "吸血鬼": "C011", "亡灵": "C010", 
            "埃及": "C009", "天使": "C008", "恶魔": "C007", "鬼": "C006", 
            "骷髅": "C005", "死神": "C004", "丧尸": "C003", "忍者": "C002", 
            "女巫": "C001"
        },
        
        // 款式映射
        styleMapping: {
            "成衣": "A",
            "配件": "B",
            "充气": "C"
        },
        
        // 人群和尺码映射
        crowdSizeMapping: {
            "婴童-6M": "I-6M", "婴童-12M": "I-12M", 
            "幼童-S": "T-S", "幼童-L": "T-L", 
            "女童-O": "G-O", "女童-S": "G-S", "女童-M": "G-M", "女童-L": "G-L", "女童-XL": "G-XL", 
            "男童-O": "B-O", "男童-S": "B-S", "男童-M": "B-M", "男童-L": "B-L", "男童-XL": "B-XL", 
            "儿童-O": "K-O", "儿童-S": "K-S", "儿童-M": "K-M", "儿童-L": "K-L", "儿童-XL": "K-XL", 
            "儿童-SM": "K-SM", "儿童-LXL": "K-LXL", 
            "女性-O": "W-O", "女性-XS": "W-XS", "女性-S": "W-S", "女性-M": "W-M", 
            "女性-L": "W-L", "女性-XL": "W-XL", "女性-2X": "W-2X", 
            "男性-O": "M-O", "男性-XS": "M-XS", "男性-S": "M-S", "男性-M": "M-M", 
            "男性-L": "M-L", "男性-XL": "M-XL", "男性-2X": "M-2X", 
            "成人-O": "A-O", "成人-XS": "A-XS", "成人-S": "A-S", "成人-M": "A-M", 
            "成人-L": "A-L", "成人-XL": "A-XL", "成人-2X": "A-2X", 
            "成人-SM": "A-SM", "成人-LXL": "A-LXL"
        },
        
        // 自定义选项
        customOptions: {
            color: [],
            size: [],
            crowd: [],
            animal: [],
            profession: [],
            humor: [],
            role: [],
            festival: [],
            style: []
        },
        
        // 撤销栈
        undoStack: []
    };
    
    // 加载本地存储的自定义选项
    function loadCustomOptions() {
        const saved = localStorage.getItem('customOptions');
        if (saved) {
            try {
                data.customOptions = JSON.parse(saved);
            } catch (e) {
                console.error('解析自定义选项失败:', e);
            }
        }
    }
    
    // 保存自定义选项到本地存储
    function saveCustomOptions() {
        localStorage.setItem('customOptions', JSON.stringify(data.customOptions));
    }
    
    // 初始化下拉菜单和选项
    function initializeOptions() {
        // 初始化动物下拉框
        populateSelect('#animal', getAllAnimals());
        
        // 初始化职业下拉框
        populateSelect('#profession', getAllProfessions());
        
        // 初始化幽默下拉框
        populateSelect('#humor', getAllHumors());
        
        // 初始化角色下拉框
        populateSelect('#role', getAllRoles());
        
        // 初始化人群选项
        populateCheckboxes('#crowdOptions', getCrowdOptions(), 'crowd');
        
        // 初始化尺码选项
        populateCheckboxes('#sizeOptions', getSizeOptions(), 'size');
        
        // 初始化颜色选项
        populateCheckboxes('#colorOptions', getColorOptions(), 'color');
    }
    
    // 填充下拉菜单
    function populateSelect(selector, options) {
        const select = document.querySelector(selector);
        if (!select) return;
        
        select.innerHTML = '<option value="">请选择</option>';
        options.forEach(option => {
            const optEl = document.createElement('option');
            optEl.value = option;
            optEl.textContent = option;
            select.appendChild(optEl);
        });
    }
    
    // 填充可点击选项（替代原来的复选框）
    function populateCheckboxes(selector, options, type) {
        const container = document.querySelector(selector);
        if (!container) return;
        
        container.innerHTML = '';
        options.forEach(option => {
            // 创建可点击的选项元素
            const clickableOption = document.createElement('div');
            clickableOption.className = 'clickable-option';
            clickableOption.textContent = option;
            clickableOption.dataset.value = option;
            clickableOption.dataset.type = type;
            
            // 添加点击事件
            clickableOption.addEventListener('click', function() {
                this.classList.toggle('selected');
                updateSelectedCount(type);
            });
            
            container.appendChild(clickableOption);
        });
        
        // 更新初始计数
        updateSelectedCount(type);
    }
    
    // 更新已选择项目的计数
    function updateSelectedCount(type) {
        const countElement = document.getElementById(`${type}SelectedCount`);
        if (countElement) {
            const count = document.querySelectorAll(`#${type}Options .clickable-option.selected`).length;
            countElement.textContent = count;
        }
    }
    
    // 获取所有动物选项
    function getAllAnimals() {
        return [...Object.keys(data.animalMapping), ...data.customOptions.animal.map(item => item[0])];
    }
    
    // 获取所有职业选项
    function getAllProfessions() {
        return [...Object.keys(data.professionMapping), ...data.customOptions.profession.map(item => item[0])];
    }
    
    // 获取所有幽默选项
    function getAllHumors() {
        return [...Object.keys(data.humorMapping), ...data.customOptions.humor.map(item => item[0])];
    }
    
    // 获取所有角色选项
    function getAllRoles() {
        return [...Object.keys(data.roleMapping), ...data.customOptions.role.map(item => item[0])];
    }
    
    // 获取人群选项
    function getCrowdOptions() {
        return ["婴童", "幼童", "女童", "男童", "儿童", "女性", "男性", "成人"];
    }
    
    // 获取尺码选项
    function getSizeOptions() {
        return ["6M", "12M", "XS", "S", "M", "L", "XL", "2X", "SM", "LXL", "O"];
    }
    
    // 获取颜色选项
    function getColorOptions() {
        return [...Object.keys(data.colorMapping), ...data.customOptions.color.map(item => item[0])];
    }
    
    // 互斥的类别选择处理
    function handleCategorySelection() {
        const categorySelects = ['#animal', '#profession', '#humor', '#role'];
        
        categorySelects.forEach(selector => {
            document.querySelector(selector).addEventListener('change', function(e) {
                if (this.value) {
                    categorySelects.forEach(otherSelector => {
                        if (otherSelector !== selector) {
                            document.querySelector(otherSelector).value = '';
                        }
                    });
                }
            });
        });
    }
    
    // 获取节日代码
    function getFestivalCode(festival) {
        // 优先查自定义
        const customFestival = data.customOptions.festival.find(item => item[0] === festival);
        if (customFestival) {
            return customFestival[1];
        }
        // 再查内置
        return data.festivalMapping[festival] || "XX";
    }
    
    // 获取类别代码
    function getCategoryCode(categoryType, selectedItem) {
        // 优先查自定义
        const customCategory = data.customOptions[categoryType].find(item => item[0] === selectedItem);
        if (customCategory) {
            return customCategory[1];
        }
        
        // 再查内置
        switch (categoryType) {
            case 'animal':
                return data.animalMapping[selectedItem] || "XX";
            case 'profession':
                return data.professionMapping[selectedItem] || "XX";
            case 'humor':
                return data.humorMapping[selectedItem] || "XX";
            case 'role':
                return data.roleMapping[selectedItem] || "XX";
            default:
                return "XX";
        }
    }
    
    // 获取款式代码
    function getStyleCode(style) {
        // 优先查自定义
        const customStyle = data.customOptions.style.find(item => item[0] === style);
        if (customStyle) {
            return customStyle[1];
        }
        // 再查内置
        return data.styleMapping[style] || "XX";
    }
    
    // 获取人群代码
    function getCrowdCode(crowd) {
        // 从映射表获取
        for (const key in data.crowdSizeMapping) {
            if (key.startsWith(`${crowd}-`)) {
                return data.crowdSizeMapping[key].split('-')[0];
            }
        }
        return "XX";
    }
    
    // 获取尺码代码
    function getSizeCode(size) {
        // 从映射表获取
        for (const key in data.crowdSizeMapping) {
            if (key.endsWith(`-${size}`)) {
                return data.crowdSizeMapping[key].split('-')[1];
            }
        }
        return "XX";
    }
    
    // 获取颜色代码
    function getColorCode(color) {
        // 优先查内置
        if (data.colorMapping[color]) {
            return data.colorMapping[color];
        }
        // 查自定义
        const customColor = data.customOptions.color.find(item => item[0] === color);
        if (customColor) {
            return customColor[1];
        }
        return "XX";
    }
    
    // 修改获取多选的人群值的方法
    function getSelectedOptions(selector) {
        return [...document.querySelectorAll(`${selector} .clickable-option.selected`)].map(el => el.dataset.value);
    }
    
    // 生成SKU
    function generateSKU() {
        // 获取选择的值
        const festival = document.querySelector('input[name="festival"]:checked')?.value || '';
        
        // 获取类别选择
        const selectedAnimal = document.querySelector('#animal').value;
        const selectedProfession = document.querySelector('#profession').value;
        const selectedHumor = document.querySelector('#humor').value;
        const selectedRole = document.querySelector('#role').value;
        
        // 确定选中的类别和对应的映射
        let category = "";
        let selectedItem = "";
        
        if (selectedAnimal) {
            category = "animal";
            selectedItem = selectedAnimal;
        } else if (selectedProfession) {
            category = "profession";
            selectedItem = selectedProfession;
        } else if (selectedHumor) {
            category = "humor";
            selectedItem = selectedHumor;
        } else if (selectedRole) {
            category = "role";
            selectedItem = selectedRole;
        }
        
        // 获取款式选择
        const style = document.querySelector('input[name="style"]:checked')?.value || '';
        
        // 获取多选的人群、尺码和颜色（使用新的获取方法）
        const selectedCrowds = getSelectedOptions('#crowdOptions');
        const selectedSizes = getSelectedOptions('#sizeOptions');
        const selectedColors = getSelectedOptions('#colorOptions');
        
        // 检查必填项
        const parentSKUElement = document.querySelector('#parentSKU');
        
        if (!selectedCrowds.length) {
            parentSKUElement.textContent = "错误: 必须选择至少一个人群!";
            parentSKUElement.style.color = "#cc0000";
            return;
        }
        if (!selectedSizes.length) {
            parentSKUElement.textContent = "错误: 必须选择至少一个尺码!";
            parentSKUElement.style.color = "#cc0000";
            return;
        }
        if (!selectedColors.length) {
            parentSKUElement.textContent = "错误: 必须选择至少一个颜色!";
            parentSKUElement.style.color = "#cc0000";
            return;
        }
        if (!festival) {
            parentSKUElement.textContent = "错误: 必须选择节日!";
            parentSKUElement.style.color = "#cc0000";
            return;
        }
        if (!category) {
            parentSKUElement.textContent = "错误: 必须选择一个类别!";
            parentSKUElement.style.color = "#cc0000";
            return;
        }
        if (!style) {
            parentSKUElement.textContent = "错误: 必须选择款式!";
            parentSKUElement.style.color = "#cc0000";
            return;
        }
        
        // 生成父SKU
        const festivalCode = getFestivalCode(festival);
        const categoryCode = getCategoryCode(category, selectedItem);
        const styleCode = getStyleCode(style);
        const parentSKU = `${festivalCode}${categoryCode}${styleCode}`;
        
        // 显示父SKU
        parentSKUElement.textContent = parentSKU;
        parentSKUElement.style.color = "#0066cc";
        
        // 生成所有变体SKU组合
        const allSKUs = [];
        let validCombinations = 0;
        
        // 遍历所有可能的人群-尺码组合
        for (const crowd of selectedCrowds) {
            for (const size of selectedSizes) {
                // 检查人群-尺码组合是否有效
                const key = `${crowd}-${size}`;
                if (!data.crowdSizeMapping[key]) {
                    continue;
                }
                
                const crowdCode = getCrowdCode(crowd);
                const sizeCode = getSizeCode(size);
                
                // 为每个有效的人群-尺码组合生成所有颜色变体
                for (const color of selectedColors) {
                    const colorCode = getColorCode(color);
                    // 生成变体SKU
                    const variantSKU = `${parentSKU}${crowdCode}-${colorCode}-${sizeCode}`;
                    allSKUs.push({
                        sku: variantSKU,
                        crowd: crowd,
                        size: size,
                        color: color
                    });
                    validCombinations++;
                }
            }
        }
        
        // 清空之前的结果
        const skuResultsContainer = document.querySelector('#skuResults');
        skuResultsContainer.innerHTML = '';
        
        // 如果没有有效的组合，显示提示信息
        if (!validCombinations) {
            parentSKUElement.textContent = "错误: 没有有效的人群-尺码组合!";
            parentSKUElement.style.color = "#cc0000";
            return;
        }
        
        // 显示所有有效的SKU组合
        const skuItems = [];
        allSKUs.forEach((item, index) => {
            const skuItem = document.createElement('div');
            skuItem.className = 'sku-item';
            skuItem.dataset.index = index;
            
            const skuCode = document.createElement('span');
            skuCode.textContent = item.sku;
            
            const skuComment = document.createElement('small');
            skuComment.className = 'text-muted ms-2';
            skuComment.textContent = `# ${item.crowd}-${item.size}-${item.color}`;
            
            // 添加复制按钮
            const copyButton = document.createElement('button');
            copyButton.className = 'btn btn-sm btn-outline-secondary copy-sku-btn ms-2';
            copyButton.innerHTML = '<i class="bi bi-clipboard"></i>';
            copyButton.title = '复制此SKU';
            copyButton.dataset.sku = item.sku;
            copyButton.onclick = function(e) {
                e.stopPropagation(); // 防止触发删除事件
                copySingleSKU(item.sku);
            };
            
            skuItem.appendChild(skuCode);
            skuItem.appendChild(skuComment);
            skuItem.appendChild(copyButton);
            skuItems.push(skuItem);
        });
        
        // 在页面上显示SKU结果
        skuItems.forEach(item => {
            skuResultsContainer.appendChild(item);
        });

        // 添加保存按钮
        const saveButtonContainer = document.createElement('div');
        saveButtonContainer.innerHTML = `
            <button id="saveSKUs" class="btn btn-success btn-sm mt-3">
                <i class="bi bi-save"></i> 保存SKU到数据库
            </button>
            <div id="saveMessage" class="alert mt-2" style="display: none;"></div>
        `;
        skuResultsContainer.appendChild(saveButtonContainer);

        // 绑定保存按钮事件
        document.getElementById('saveSKUs')?.addEventListener('click', function() {
            // 检查是否有SKU可保存
            if (!window.generatedSKUs || window.generatedSKUs.length === 0) {
                showSaveMessage('error', '没有可保存的SKU');
                return;
            }
            
            // 显示保存模态框
            const saveSkuModal = new bootstrap.Modal(document.getElementById('saveSkuModal'));
            
            // 更新模态框中的信息
            document.getElementById('modalParentSku').textContent = parentSKUElement.textContent;
            document.getElementById('modalSkuCount').textContent = window.generatedSKUs.length;
            
            // 重置表单
            document.getElementById('skuTitle').value = '';
            document.getElementById('skuDescription').value = '';
            document.getElementById('saveAllSkus').checked = true;
            document.getElementById('saveSkuAlert').style.display = 'none';
            
            // 显示模态框
            saveSkuModal.show();
        });
        
        // 更新计数
        document.querySelector('#skuCount').textContent = `${allSKUs.length}个`;
        
        // 全局保存
        window.generatedSKUs = allSKUs;
    }
    
    // 显示保存消息
    function showSaveMessage(type, message) {
        const saveMessage = document.getElementById('saveMessage');
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
    
    // 删除单个SKU
    function deleteSingleSKU(event) {
        if (!event.target.closest('.sku-item')) return;
        
        const skuItem = event.target.closest('.sku-item');
        const index = parseInt(skuItem.dataset.index);
        
        // 保存到撤销栈
        data.undoStack.push({
            element: skuItem.cloneNode(true),
            index: index
        });
        
        // 删除该元素
        skuItem.remove();
        
        // 更新剩余SKU的索引
        const remainingItems = document.querySelectorAll('#skuResults .sku-item');
        remainingItems.forEach((item, idx) => {
            item.dataset.index = idx;
        });
        
        // 更新计数
        document.querySelector('#skuCount').textContent = `${remainingItems.length}个`;
    }
    
    // 撤销删除
    function undoDelete() {
        if (data.undoStack.length === 0) return;
        
        const lastDeleted = data.undoStack.pop();
        const skuResultsContainer = document.querySelector('#skuResults');
        
        // 获取所有当前项
        const currentItems = document.querySelectorAll('#skuResults .sku-item');
        
        // 如果要恢复的项索引小于当前项数，在对应位置插入
        if (lastDeleted.index < currentItems.length) {
            skuResultsContainer.insertBefore(lastDeleted.element, currentItems[lastDeleted.index]);
        } else {
            // 否则添加到末尾
            skuResultsContainer.appendChild(lastDeleted.element);
        }
        
        // 更新所有索引
        const allItems = document.querySelectorAll('#skuResults .sku-item');
        allItems.forEach((item, idx) => {
            item.dataset.index = idx;
        });
        
        // 更新计数
        document.querySelector('#skuCount').textContent = `${allItems.length}个`;
    }
    
    // 复制单个SKU
    function copySingleSKU(sku) {
        if (!sku) return;
        
        navigator.clipboard.writeText(sku)
            .then(() => {
                // 显示复制成功提示
                const tooltip = document.createElement('div');
                tooltip.className = 'copy-success-tooltip';
                tooltip.textContent = '✓ 复制成功';
                tooltip.style.position = 'fixed';
                tooltip.style.top = '50%';
                tooltip.style.left = '50%';
                tooltip.style.transform = 'translate(-50%, -50%)';
                tooltip.style.padding = '8px 16px';
                tooltip.style.backgroundColor = 'rgba(40, 167, 69, 0.9)';
                tooltip.style.color = 'white';
                tooltip.style.borderRadius = '4px';
                tooltip.style.zIndex = '1050';
                tooltip.style.opacity = '0';
                tooltip.style.transition = 'opacity 0.3s ease';
                
                document.body.appendChild(tooltip);
                
                // 显示然后淡出
                setTimeout(() => {
                    tooltip.style.opacity = '1';
                    setTimeout(() => {
                        tooltip.style.opacity = '0';
                        setTimeout(() => {
                            document.body.removeChild(tooltip);
                        }, 300);
                    }, 1500);
                }, 10);
            })
            .catch(err => {
                console.error('复制失败:', err);
            });
    }
    
    // 复制SPU
    function copySPU() {
        const spu = document.querySelector('#parentSKU').textContent;
        if (spu && spu !== '-' && !spu.startsWith('错误')) {
            navigator.clipboard.writeText(spu)
                .then(() => {
                    showCopySuccess('#parentSKU', "✓ 复制成功!");
                })
                .catch(err => {
                    console.error('复制失败:', err);
                });
        }
    }
    
    // 复制所有SKU
    function copyAllSKUs() {
        if (!window.generatedSKUs || window.generatedSKUs.length === 0) return;
        
        const skuTexts = window.generatedSKUs.map(item => item.sku).join('\n');
        
        navigator.clipboard.writeText(skuTexts)
            .then(() => {
                showCopySuccess('#parentSKU', "✓ 所有SKU已复制!");
            })
            .catch(err => {
                console.error('复制失败:', err);
            });
    }
    
    // 显示复制成功提示
    function showCopySuccess(selector, message) {
        const element = document.querySelector(selector);
        const originalText = element.textContent;
        const originalColor = element.style.color;
        
        element.textContent = message;
        element.style.color = '#198754';
        
        // 1秒后恢复
        setTimeout(() => {
            element.textContent = originalText;
            element.style.color = originalColor;
        }, 1000);
    }
    
    // 处理添加自定义选项
    function handleAddOption() {
        const modal = new bootstrap.Modal(document.getElementById('addModal'));
        let currentOptionType = '';
        
        // 添加颜色
        document.querySelector('#addColor').addEventListener('click', function() {
            currentOptionType = 'color';
            document.querySelector('.modal-title').textContent = '添加颜色';
            document.querySelector('#additionalFields').innerHTML = '';
            modal.show();
        });
        
        // 添加类别选项
        document.querySelectorAll('[data-category]').forEach(btn => {
            if (btn.classList.contains('btn-outline-secondary')) {
                btn.addEventListener('click', function() {
                    currentOptionType = this.dataset.category;
                    document.querySelector('.modal-title').textContent = `添加${getCategoryLabel(currentOptionType)}`;
                    document.querySelector('#additionalFields').innerHTML = '';
                    modal.show();
                });
            }
        });
        
        // 保存选项
        document.querySelector('#saveOption').addEventListener('click', function() {
            const name = document.querySelector('#optionName').value.trim();
            const code = document.querySelector('#optionCode').value.trim().toUpperCase();
            
            if (!name || !code) {
                alert('名称和代码不能为空!');
                return;
            }
            
            // 检查是否已存在
            const existsName = data.customOptions[currentOptionType].some(item => item[0] === name);
            const existsCode = data.customOptions[currentOptionType].some(item => item[1] === code);
            
            if (existsName || existsCode) {
                alert('该名称或代码已存在!');
                return;
            }
            
            // 添加到自定义选项
            data.customOptions[currentOptionType].push([name, code]);
            saveCustomOptions();
            
            // 重新初始化选项
            initializeOptions();
            
            // 关闭模态框
            modal.hide();
            document.querySelector('#optionName').value = '';
            document.querySelector('#optionCode').value = '';
        });
    }
    
    // 处理删除自定义选项
    function handleDeleteOption() {
        const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
        let currentOptionType = '';
        
        // 删除颜色
        document.querySelector('#deleteColor').addEventListener('click', function() {
            currentOptionType = 'color';
            const options = data.customOptions.color.map(item => item[0]);
            
            if (options.length === 0) {
                alert('没有可删除的自定义颜色!');
                return;
            }
            
            document.querySelector('.modal-title').textContent = '删除颜色';
            populateDeleteOptions(options);
            modal.show();
        });
        
        // 删除类别选项
        document.querySelectorAll('[data-category]').forEach(btn => {
            if (btn.classList.contains('btn-outline-danger')) {
                btn.addEventListener('click', function() {
                    currentOptionType = this.dataset.category;
                    const options = data.customOptions[currentOptionType].map(item => item[0]);
                    
                    if (options.length === 0) {
                        alert(`没有可删除的自定义${getCategoryLabel(currentOptionType)}!`);
                        return;
                    }
                    
                    document.querySelector('.modal-title').textContent = `删除${getCategoryLabel(currentOptionType)}`;
                    populateDeleteOptions(options);
                    modal.show();
                });
            }
        });
        
        // 确认删除
        document.querySelector('#confirmDelete').addEventListener('click', function() {
            const selectedOption = document.querySelector('#deleteOption').value;
            
            if (!selectedOption) return;
            
            // 从自定义选项中删除
            data.customOptions[currentOptionType] = data.customOptions[currentOptionType].filter(item => item[0] !== selectedOption);
            saveCustomOptions();
            
            // 重新初始化选项
            initializeOptions();
            
            // 关闭模态框
            modal.hide();
        });
    }
    
    // 填充删除选项下拉框
    function populateDeleteOptions(options) {
        const select = document.querySelector('#deleteOption');
        select.innerHTML = '';
        
        options.forEach(option => {
            const optEl = document.createElement('option');
            optEl.value = option;
            optEl.textContent = option;
            select.appendChild(optEl);
        });
    }
    
    // 获取类别标签
    function getCategoryLabel(category) {
        const labels = {
            'animal': '动物',
            'profession': '职业',
            'humor': '幽默',
            'role': '角色'
        };
        return labels[category] || category;
    }
    
    // 初始化事件监听器
    function initEventListeners() {
        // 类别互斥选择
        handleCategorySelection();
        
        // 生成SKU按钮
        document.querySelector('#generateSKU').addEventListener('click', generateSKU);
        
        // SKU点击删除
        document.querySelector('#skuResults').addEventListener('click', deleteSingleSKU);
        
        // 撤销删除
        document.querySelector('#undoDelete').addEventListener('click', undoDelete);
        
        // 复制SPU
        document.querySelector('#copySPU').addEventListener('click', copySPU);
        
        // 复制所有SKU
        document.querySelector('#copyAllSKUs').addEventListener('click', copyAllSKUs);
        
        // 添加选项
        handleAddOption();
        
        // 删除选项
        handleDeleteOption();
    }
    
    // 保存SKU到数据库
    async function saveSKUsToDatabase() {
        showSaveMessage('error', '保存功能已被禁用');
    }
    
    // 初始化
    function init() {
        console.log("初始化SKU生成器...");
        
        try {
            // 加载自定义选项
            loadCustomOptions();
            
            // 初始化选项
            initializeOptions();
            
            // 添加事件监听器
            initEventListeners();
            
            // 默认选中第一个节日和款式选项
            const firstFestivalOption = document.querySelector('input[name="festival"]');
            if (firstFestivalOption) {
                firstFestivalOption.checked = true;
            }
            
            const firstStyleOption = document.querySelector('input[name="style"]');
            if (firstStyleOption) {
                firstStyleOption.checked = true;
            }
            
            console.log("初始化完成");
        } catch (error) {
            console.error("初始化失败:", error);
        }
    }
    
    // 启动应用
    init();
}); 