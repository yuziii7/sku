import tkinter as tk
from tkinter import ttk
import json
import os

class SKUGenerator:
    def __init__(self, root):
        self.root = root
        self.root.title("SKU生成器")
        self.root.geometry("1100x750")  # 增加窗口高度以容纳更多内容
        
        # 自定义选项文件路径
        self.custom_options_path = "custom_options.json"
        self.custom_options = self.load_custom_options()
        
        # 定义映射表
        self.setup_mappings()
        
        # 创建自定义样式
        style = ttk.Style()
        style.configure("Delete.TButton", 
                       padding=0,
                       relief="flat",
                       borderwidth=0,
                       font=("Arial", 8))
        
        # 创建主容器
        main_container = ttk.Frame(root)
        main_container.pack(fill=tk.BOTH, expand=True)
        
        # 创建固定的顶部区域（不滚动）
        top_frame = ttk.Frame(main_container)
        top_frame.pack(fill=tk.X, padx=15, pady=10)
        
        # 创建SKU选项区域
        dropdown_frame = ttk.LabelFrame(top_frame, text="SKU选项", padding="18 12 18 12")
        dropdown_frame.pack(fill=tk.X, padx=5, pady=8, ipady=4)
        
        # 节日下拉框及添加/删除
        label_festival = ttk.Label(dropdown_frame, text="节日:", width=10)
        label_festival.grid(row=0, column=0, sticky="w", pady=5)
        festival_row = ttk.Frame(dropdown_frame)
        festival_row.grid(row=0, column=1, columnspan=3, sticky="ew", padx=2)
        self.festival_var = tk.StringVar()
        self.festival_combobox = ttk.Combobox(festival_row, textvariable=self.festival_var, values=self.get_all_festivals(), state="readonly", width=15)
        self.festival_combobox.pack(side=tk.LEFT, padx=0)
        self.festival_combobox.set("")

        # 创建四个类别框架
        label_category = ttk.Label(dropdown_frame, text="类别:", width=10)
        label_category.grid(row=1, column=0, sticky="w", pady=5)
        category_frame = ttk.Frame(dropdown_frame)
        category_frame.grid(row=1, column=1, columnspan=10, sticky="w", padx=5)
        # 动物类别
        animal_frame = ttk.LabelFrame(category_frame, text="动物")
        animal_frame.pack(side=tk.LEFT, padx=5)
        self.animal_var = tk.StringVar()
        self.animal_combo = ttk.Combobox(animal_frame, textvariable=self.animal_var, values=self.get_all_animals(), state="readonly", width=15)
        self.animal_combo.pack(side=tk.LEFT, padx=5, pady=5)
        btn_animal_add = ttk.Button(animal_frame, text="+", width=2, command=lambda:self.add_category_option("animal"))
        btn_animal_add.pack(side=tk.LEFT, padx=1)
        btn_animal_del = ttk.Button(animal_frame, text="-", width=2, command=lambda:self.delete_category_option("animal"))
        btn_animal_del.pack(side=tk.LEFT, padx=1)
        # 职业类别
        profession_frame = ttk.LabelFrame(category_frame, text="职业")
        profession_frame.pack(side=tk.LEFT, padx=5)
        self.profession_var = tk.StringVar()
        self.profession_combo = ttk.Combobox(profession_frame, textvariable=self.profession_var, values=self.get_all_professions(), state="readonly", width=15)
        self.profession_combo.pack(side=tk.LEFT, padx=5, pady=5)
        btn_prof_add = ttk.Button(profession_frame, text="+", width=2, command=lambda:self.add_category_option("profession"))
        btn_prof_add.pack(side=tk.LEFT, padx=1)
        btn_prof_del = ttk.Button(profession_frame, text="-", width=2, command=lambda:self.delete_category_option("profession"))
        btn_prof_del.pack(side=tk.LEFT, padx=1)
        # 幽默类别
        humor_frame = ttk.LabelFrame(category_frame, text="幽默")
        humor_frame.pack(side=tk.LEFT, padx=5)
        self.humor_var = tk.StringVar()
        self.humor_combo = ttk.Combobox(humor_frame, textvariable=self.humor_var, values=self.get_all_humors(), state="readonly", width=15)
        self.humor_combo.pack(side=tk.LEFT, padx=5, pady=5)
        btn_humor_add = ttk.Button(humor_frame, text="+", width=2, command=lambda:self.add_category_option("humor"))
        btn_humor_add.pack(side=tk.LEFT, padx=1)
        btn_humor_del = ttk.Button(humor_frame, text="-", width=2, command=lambda:self.delete_category_option("humor"))
        btn_humor_del.pack(side=tk.LEFT, padx=1)
        # 角色类别
        role_frame = ttk.LabelFrame(category_frame, text="角色")
        role_frame.pack(side=tk.LEFT, padx=5)
        self.role_var = tk.StringVar()
        self.role_combo = ttk.Combobox(role_frame, textvariable=self.role_var, values=self.get_all_roles(), state="readonly", width=15)
        self.role_combo.pack(side=tk.LEFT, padx=5, pady=5)
        btn_role_add = ttk.Button(role_frame, text="+", width=2, command=lambda:self.add_category_option("role"))
        btn_role_add.pack(side=tk.LEFT, padx=1)
        btn_role_del = ttk.Button(role_frame, text="-", width=2, command=lambda:self.delete_category_option("role"))
        btn_role_del.pack(side=tk.LEFT, padx=1)

        # 绑定选择事件
        def on_category_selected(event=None):
            selected_animal = self.animal_var.get()
            selected_profession = self.profession_var.get()
            selected_humor = self.humor_var.get()
            selected_role = self.role_var.get()
            # 四选一互斥
            if event.widget == self.animal_combo and selected_animal:
                self.profession_var.set("")
                self.humor_var.set("")
                self.role_var.set("")
            elif event.widget == self.profession_combo and selected_profession:
                self.animal_var.set("")
                self.humor_var.set("")
                self.role_var.set("")
            elif event.widget == self.humor_combo and selected_humor:
                self.animal_var.set("")
                self.profession_var.set("")
                self.role_var.set("")
            elif event.widget == self.role_combo and selected_role:
                self.animal_var.set("")
                self.profession_var.set("")
                self.humor_var.set("")
        self.animal_combo.bind("<<ComboboxSelected>>", on_category_selected)
        self.profession_combo.bind("<<ComboboxSelected>>", on_category_selected)
        self.humor_combo.bind("<<ComboboxSelected>>", on_category_selected)
        self.role_combo.bind("<<ComboboxSelected>>", on_category_selected)

        # 款式下拉框及添加/删除
        label_style = ttk.Label(dropdown_frame, text="款式:", width=10)
        label_style.grid(row=2, column=0, sticky="w", pady=5)
        style_row = ttk.Frame(dropdown_frame)
        style_row.grid(row=2, column=1, columnspan=3, sticky="ew", padx=2)
        self.style_var = tk.StringVar()
        self.style_combobox = ttk.Combobox(style_row, textvariable=self.style_var, values=self.get_all_styles(), state="readonly", width=15)
        self.style_combobox.pack(side=tk.LEFT, padx=0)
        self.style_combobox.set("")

        # 人群多选及添加/删除
        label_crowd = ttk.Label(dropdown_frame, text="人群:", width=10)
        label_crowd.grid(row=3, column=0, sticky="w", pady=5)
        crowd_row = ttk.Frame(dropdown_frame)
        crowd_row.grid(row=3, column=1, columnspan=3, sticky="ew", padx=2)
        self.crowd_vars = {}
        self.crowd_frame = ttk.Frame(crowd_row)
        self.crowd_frame.pack(side=tk.LEFT)
        self.refresh_crowd_checkboxes(self.crowd_frame)

        # 尺码多选及添加/删除
        label_size = ttk.Label(dropdown_frame, text="尺码:", width=10)
        label_size.grid(row=4, column=0, sticky="w", pady=5)
        size_row = ttk.Frame(dropdown_frame)
        size_row.grid(row=4, column=1, columnspan=3, sticky="ew", padx=2)
        self.size_vars = {}
        self.size_frame = ttk.Frame(size_row)
        self.size_frame.pack(side=tk.LEFT)
        self.refresh_size_checkboxes(self.size_frame)

        # 颜色多选复选框
        label_color = ttk.Label(dropdown_frame, text="颜色:", width=10)
        label_color.grid(row=5, column=0, sticky="w", pady=5)
        color_row = ttk.Frame(dropdown_frame)
        color_row.grid(row=5, column=1, columnspan=3, sticky="ew", padx=2)
        self.color_vars = {}
        self.color_frame = ttk.Frame(color_row)
        self.color_frame.pack(side=tk.LEFT)
        btn_color_add = ttk.Button(color_row, text="+", width=2, command=self.add_color_option)
        btn_color_add.pack(side=tk.LEFT, padx=1)
        btn_color_del = ttk.Button(color_row, text="-", width=2, command=self.delete_color_option)
        btn_color_del.pack(side=tk.LEFT, padx=1)
        self.refresh_color_checkboxes(self.color_frame)

        # 创建生成按钮
        button_frame = ttk.Frame(top_frame)
        button_frame.pack(fill=tk.X, padx=5, pady=5)
        
        self.generate_button = ttk.Button(button_frame, text="生成SKU", command=self.generate_sku, width=20)
        self.generate_button.pack(pady=10, ipadx=10, ipady=5)
        
        # 创建父SKU结果显示区域
        self.result_frame = ttk.LabelFrame(top_frame, text="父SKU结果", padding="15")
        self.result_frame.pack(fill=tk.X, padx=5, pady=5)
        
        # 创建结果显示标签
        self.result_var = tk.StringVar()
        self.result_label = ttk.Label(self.result_frame, textvariable=self.result_var, font=("Arial", 18, "bold"))
        self.result_label.pack(pady=15)
        
        # 创建复制按钮（父SKU结果区）
        button_row = ttk.Frame(self.result_frame)
        button_row.pack(pady=8)
        self.copy_button = ttk.Button(button_row, text="复制SPU", command=self.copy_sku, width=15)
        self.copy_button.pack(side=tk.LEFT, ipadx=5, ipady=2)
        self.copy_all_button = ttk.Button(button_row, text="复制所有SKU", command=self.copy_all_skus, width=15)
        self.copy_all_button.pack(side=tk.LEFT, padx=15, ipadx=5, ipady=2)
        self.undo_button = ttk.Button(button_row, text="撤销删除", command=self.undo_delete, width=12)
        self.undo_button.pack(side=tk.LEFT, padx=15, ipadx=5, ipady=2)
        
        # 创建SKU结果显示区域
        result_container = ttk.Frame(main_container)
        result_container.pack(fill=tk.BOTH, expand=True, padx=15, pady=10)
        
        # 创建多个SKU结果显示区域
        self.all_skus_frame = ttk.LabelFrame(result_container, text="所有SKU组合结果", padding="15")
        self.all_skus_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # 创建文本框和按钮的容器
        list_container = ttk.Frame(self.all_skus_frame)
        list_container.pack(fill=tk.BOTH, expand=True, pady=5)
        
        # 创建文本框
        self.all_skus_text = tk.Text(list_container, font=("Courier New", 12), height=15, wrap=tk.NONE)
        self.all_skus_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        # 创建水平滚动条
        h_scrollbar = ttk.Scrollbar(list_container, orient=tk.HORIZONTAL, command=self.all_skus_text.xview)
        h_scrollbar.pack(side=tk.BOTTOM, fill=tk.X)
        self.all_skus_text.configure(xscrollcommand=h_scrollbar.set)
        
        # 创建垂直滚动条
        v_scrollbar = ttk.Scrollbar(list_container, orient=tk.VERTICAL, command=self.all_skus_text.yview)
        v_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        self.all_skus_text.configure(yscrollcommand=v_scrollbar.set)
        
        # 存储SKU和删除按钮的字典
        self.sku_buttons = {}
        
        # 绑定单击事件
        self.all_skus_text.bind("<Button-1>", self.on_sku_click)

        # 撤销删除按钮
        self.undo_stack = []  # 只保留栈定义
    
    def setup_mappings(self):
        # 颜色映射
        self.color_mapping = {
            "黑色": "BK", "红色": "RD", "橙色": "OG", "黄色": "YL", 
            "绿色": "GN", "紫色": "PL", "棕色": "BN", "蓝色": "BL", 
            "青色": "CY", "粉色": "PK", "粉红色": "NP", "粉紫色": "VI", 
            "白色": "WH", "灰色": "GY", "金色": "GD", "银色": "SV", 
            "彩色": "MU", "透明": "CR", "褐色": "TN", "卡其色": "KI", 
            "豹纹": "LD", "墨绿色": "DG", "酒红色": "BU", "古铜色": "BR",
            "反光": "RE", "夜光": "LU"
        }
        
        # 节日映射
        self.festival_mapping = {
            "圣诞节": "C", 
            "万圣节": "H"
        }
        
        # 动物映射
        self.animal_mapping = {
            "蜜蜂": "A036", "火烈鸟": "A035", "狼": "A034", "海马": "A033", 
            "浣熊": "A032", "鸡": "A031", "海豚": "A030", "怪兽": "A029", 
            "蝾螈": "A028", "瓢虫": "A027", "熊猫": "A026", "长颈鹿": "A025", 
            "青蛙": "A024", "老虎": "A023", "豹": "A022", "企鹅": "A021", 
            "鼹鼠": "A020", "猪": "A019", "驴": "A018", "狮子": "A017", 
            "狗": "A016", "牛": "A015", "狐狸": "A014", "猴子": "A013", 
            "熊": "A012", "鹿": "A011", "猫": "A010", "老鼠": "A009", 
            "兔子": "A008", "章鱼": "A007", "鲨鱼": "A006", "蝙蝠": "A005", 
            "蝴蝶": "A004", "龙": "A003", "独角兽": "A002", "恐龙": "A001"
        }
        
        # 职业映射
        self.profession_mapping = {
            "屠夫": "F021", "赛事宝贝": "F020", "宇航员": "F019", "医生护士": "F018", 
            "银行抢劫犯": "F017", "修女牧师": "F016", "船长": "F015", "军人": "F014", 
            "赛博朋克": "F013", "明星": "F012", "运动员": "F011", "帮派分子": "F010", 
            "女郎": "F009", "飞行员": "F008", "啤酒节": "F007", "摇滚": "F006", 
            "消防员": "F005", "囚犯": "F004", "警察": "F003", "FBI": "F002", 
            "啦啦队": "F001"
        }
        
        # 幽默映射
        self.humor_mapping = {
            "植物": "H013", "茄子": "H012", "富人": "H011", "彩虹": "H010", 
            "毕业季": "H009", "雪花": "H008", "食物": "H007", "找茬": "H006", 
            "马桶": "H005", "光头": "H004", "老太太": "H003", "蘑菇": "H002", 
            "南瓜": "H001"
        }
        
        # 角色映射
        self.role_mapping = {
            "外星人": "C037", "经典": "C036", "咆哮鬼": "C035", "精灵": "C034", "野人": "C033", "骑士": "C032", "女王": "C031", "法师": "C030", "瘟疫医生": "C029", "年代服": "C028", "牛仔": "C027", "遗皮": "C026", "香肠人": "C025", "罗马战士": "C024", "中世纪": "C023", "狼人": "C022", "稻草人": "C021", "小丑": "C020", "海盗": "C019", "女神": "C018", "美人鱼": "C017", "王子": "C016", "仙女": "C015", "公主": "C014", "灰姑娘": "C013", "小红帽": "C012", "吸血鬼": "C011", "亡灵": "C010", "埃及": "C009", "天使": "C008", "恶魔": "C007", "鬼": "C006", "骷髅": "C005", "死神": "C004", "丧尸": "C003", "忍者": "C002", "女巫": "C001"
        }
        
        # 款式映射
        self.style_mapping = {
            "成衣": "A",
            "配件": "B",
            "充气": "C"
        }
        
        # 人群和尺码映射
        self.crowd_size_mapping = {
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
        }
        
    def create_festival_tab(self):
        pass  # 移除未使用的方法

    def create_category_tab(self):
        pass  # 移除未使用的方法

    def create_crowd_size_tab(self):
        pass  # 移除未使用的方法

    def create_color_tab(self):
        pass  # 移除未使用的方法

    def create_style_tab(self):
        pass  # 移除未使用的方法

    def copy_sku(self):
        """复制SKU到剪贴板"""
        sku = self.result_var.get()
        if sku and not sku.startswith("错误"):
            self.root.clipboard_clear()
            self.root.clipboard_append(sku)
            # 临时显示复制成功信息
            original_text = sku
            self.result_var.set("✓ 复制成功!")
            # 1秒后恢复原始文本
            self.root.after(1000, lambda: self.result_var.set(original_text))
    
    def on_sku_click(self, event):
        """处理SKU点击事件"""
        try:
            # 获取点击位置的行号
            index = self.all_skus_text.index(f"@{event.x},{event.y}")
            line = int(index.split(".")[0])
            
            # 获取该行的SKU文本
            line_text = self.all_skus_text.get(f"{line}.0", f"{line}.end")
            sku = line_text.strip()
            
            # 删除该行
            self.delete_single_sku(line - 1)
            
        except tk.TclError:
            pass  # 点击位置无效
    
    def generate_sku(self):
        # 获取选择的值
        festival = self.festival_var.get()
        # 获取类别选择
        selected_animal = self.animal_var.get()
        selected_profession = self.profession_var.get()
        selected_humor = self.humor_var.get()
        selected_role = self.role_var.get()
        
        # 确定选中的类别和对应的映射
        if selected_animal:
            category = "animal"
            selected_item = selected_animal
        elif selected_profession:
            category = "profession"
            selected_item = selected_profession
        elif selected_humor:
            category = "humor"
            selected_item = selected_humor
        elif selected_role:
            category = "role"
            selected_item = selected_role
        else:
            category = ""
            selected_item = ""

        # 获取款式选择
        style = self.style_var.get()
        
        # 获取多选的人群
        selected_crowds = [k for k, v in self.crowd_vars.items() if v.get()]
        # 获取多选的尺码
        selected_sizes = [k for k, v in self.size_vars.items() if v.get()]
        # 获取多选的颜色
        selected_colors = [color for color, var in self.color_vars.items() if var.get()]

        # 检查必填项
        if not selected_crowds:
            self.result_var.set("错误: 必须选择至少一个人群!")
            self.result_label.configure(foreground="#cc0000")
            return
        if not selected_sizes:
            self.result_var.set("错误: 必须选择至少一个尺码!")
            self.result_label.configure(foreground="#cc0000")
            return
        if not selected_colors:
            self.result_var.set("错误: 必须选择至少一个颜色!")
            self.result_label.configure(foreground="#cc0000")
            return
        if not festival:
            self.result_var.set("错误: 必须选择节日!")
            self.result_label.configure(foreground="#cc0000")
            return
        if not category:
            self.result_var.set("错误: 必须选择一个类别!")
            self.result_label.configure(foreground="#cc0000")
            return
        if not style:
            self.result_var.set("错误: 必须选择款式!")
            self.result_label.configure(foreground="#cc0000")
            return

        # 生成父SKU
        festival_code = self.get_festival_code(festival)
        category_code = self.get_category_code(category, selected_item)
        style_code = self.get_style_code(style)
        parent_sku = f"{festival_code}{category_code}{style_code}"
        
        # 显示父SKU
        self.result_var.set(parent_sku)
        self.result_label.configure(foreground="#0066cc")

        # 生成所有变体SKU组合
        all_skus = []
        valid_combinations = 0
        
        # 遍历所有可能的人群-尺码组合
        for crowd in selected_crowds:
            for size in selected_sizes:
                # 检查人群-尺码组合是否有效
                key = f"{crowd}-{size}"
                if key not in self.crowd_size_mapping:
                    continue
                
                crowd_code = self.get_crowd_code(crowd)
                size_code = self.get_size_code(size)
                
                # 为每个有效的人群-尺码组合生成所有颜色变体
                for color in selected_colors:
                    color_code = self.get_color_code(color)
                    # 生成变体SKU
                    variant_sku = f"{parent_sku}{crowd_code}-{color_code}-{size_code}"
                    all_skus.append(variant_sku)
                    valid_combinations += 1

        # 清空之前的结果
        self.all_skus_text.delete(1.0, tk.END)
        # 清除所有删除按钮
        for button in self.sku_buttons.values():
            button.destroy()
        self.sku_buttons.clear()
        
        # 如果没有有效的组合，显示提示信息
        if not valid_combinations:
            self.result_var.set("错误: 没有有效的人群-尺码组合!")
            self.result_label.configure(foreground="#cc0000")
            return
            
        # 显示所有有效的SKU组合
        for i, sku in enumerate(all_skus):
            # 解析组合
            # parent_sku + crowd_code-color_code-size_code
            # 需要找到人群、尺码、颜色的中文
            # 反查crowd_code, size_code, color_code
            # 先找到当前组合的crowd/size/color
            # 组合key: crowd-size
            for crowd in selected_crowds:
                for size in selected_sizes:
                    key = f"{crowd}-{size}"
                    if key in self.crowd_size_mapping:
                        crowd_code = self.get_crowd_code(crowd)
                        size_code = self.get_size_code(size)
                        for color in selected_colors:
                            color_code = self.get_color_code(color)
                            variant_sku = f"{parent_sku}{crowd_code}-{color_code}-{size_code}"
                            if variant_sku == sku:
                                # 注释内容
                                comment = f"# {crowd}-{size}-{color}"
                                self.all_skus_text.insert(tk.END, f"{sku}  {comment}\n")
                                break

        # 更新结果数量显示
        self.all_skus_frame.configure(text=f"所有SKU组合结果 (共{len(all_skus)}个)")
        
        # 闪烁效果提示用户查看结果
        self.result_frame.configure(relief="raised", borderwidth=3)
        self.all_skus_frame.configure(relief="raised", borderwidth=3)
        self.root.after(200, lambda: self.result_frame.configure(relief="groove"))
        self.root.after(200, lambda: self.all_skus_frame.configure(relief="groove"))
        self.root.after(400, lambda: self.result_frame.configure(relief="raised"))
        self.root.after(400, lambda: self.all_skus_frame.configure(relief="raised"))
        self.root.after(600, lambda: self.result_frame.configure(relief="groove"))
        self.root.after(600, lambda: self.all_skus_frame.configure(relief="groove"))

    def delete_single_sku(self, index):
        """删除单个SKU，并记录到撤销栈"""
        # 获取被删除的SKU文本
        start_line = f"{index+1}.0"
        end_line = f"{index+2}.0"
        deleted_text = self.all_skus_text.get(start_line, end_line).rstrip("\n")
        # 删除SKU文本
        self.all_skus_text.delete(start_line, end_line)
        # 记录到撤销栈（行号，内容）
        self.undo_stack.append((index, deleted_text))
        # 更新结果数量
        count = int(self.all_skus_text.index("end-1c").split(".")[0])
        self.all_skus_frame.configure(text=f"所有SKU组合结果 (共{count}个)")

    def copy_selected_sku(self):
        """复制选中的SKU到剪贴板"""
        try:
            # 获取选中的文本
            selected_text = self.all_skus_text.get("sel.first", "sel.last")
            # 复制到剪贴板
            self.root.clipboard_clear()
            self.root.clipboard_append(selected_text.strip())
            # 临时显示复制成功信息
            self.result_var.set(f"✓ 已复制: {selected_text.strip()}")
            # 1秒后恢复原始文本
            self.root.after(1000, lambda: self.result_var.set(self.result_var.get().replace("✓ 已复制: ", "")))
        except tk.TclError:
            pass  # 没有选中文本
    
    def copy_all_skus(self):
        """复制所有SKU到剪贴板（不带注释）"""
        # 获取所有文本
        all_text = self.all_skus_text.get(1.0, tk.END)
        # 只取每行第一个空格前内容
        skus = [line.split()[0] for line in all_text.split("\n") if line.strip()]
        if skus:
            self.root.clipboard_clear()
            self.root.clipboard_append("\n".join(skus))
            # 临时显示复制成功信息
            self.result_var.set("✓ 所有SKU已复制!")
            # 1秒后恢复原始文本
            self.root.after(1000, lambda: self.result_var.set("已生成多个SKU组合"))

    def undo_delete(self):
        """撤销上一次SKU删除"""
        if self.undo_stack:
            index, text = self.undo_stack.pop()
            # 在指定行插入被删除的SKU
            self.all_skus_text.insert(f"{index+1}.0", text + "\n")
            # 更新结果数量
            count = int(self.all_skus_text.index("end-1c").split(".")[0])
            self.all_skus_frame.configure(text=f"所有SKU组合结果 (共{count}个)")

    def load_custom_options(self):
        # 加载自定义选项文件
        if not os.path.exists(self.custom_options_path):
            # 初始化结构
            data = {"color": [], "size": [], "crowd": [], "animal": [], "profession": [], "humor": [], "role": [], "festival": [], "style": []}
            with open(self.custom_options_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            return data
        with open(self.custom_options_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        # 自动修正旧颜色数据
        fixed = False
        new_color_list = []
        for item in data.get("color", []):
            if isinstance(item, list) and len(item) == 2:
                new_color_list.append(item)
            elif isinstance(item, str):
                new_color_list.append([item, "XX"])
                fixed = True
        if fixed:
            data["color"] = new_color_list
            with open(self.custom_options_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        return data

    def save_custom_options(self):
        with open(self.custom_options_path, "w", encoding="utf-8") as f:
            json.dump(self.custom_options, f, ensure_ascii=False, indent=2)

    def refresh_color_checkboxes(self, color_frame):
        # 清除原有
        for widget in color_frame.winfo_children():
            widget.destroy()
        # 合并颜色选项
        all_colors = list(self.color_mapping.keys())
        # 加入自定义颜色（中文）
        custom_colors = [item[0] for item in self.custom_options.get("color", [])]
        all_colors += custom_colors
        all_colors = list(dict.fromkeys(all_colors))  # 去重保序
        self.color_vars.clear()
        
        # 每行最多显示15个选项
        max_per_row = 15
        for i, color in enumerate(all_colors):
            row = i // max_per_row
            col = i % max_per_row
            var = tk.BooleanVar()
            cb = ttk.Checkbutton(color_frame, text=color, variable=var)
            cb.grid(row=row, column=col, sticky="w", padx=2)
            self.color_vars[color] = var

    def add_color_option(self):
        # 弹窗输入新颜色（中文和英文缩写）
        def on_ok():
            zh = entry_zh.get().strip()
            en = entry_en.get().strip().upper()
            # 检查重复
            exists = zh in self.color_mapping or any(zh == item[0] for item in self.custom_options["color"])
            exists_en = en in self.color_mapping.values() or any(en == item[1] for item in self.custom_options["color"])
            if zh and en and not exists and not exists_en:
                self.custom_options["color"].append([zh, en])
                self.save_custom_options()
                # 确保使用正确的颜色框架引用
                self.refresh_color_checkboxes(self.color_frame)
                top.destroy()
            else:
                if exists:
                    tk.messagebox.showerror("错误", f"颜色 '{zh}' 已存在!")
                elif exists_en:
                    tk.messagebox.showerror("错误", f"颜色代码 '{en}' 已存在!")
                else:
                    tk.messagebox.showerror("错误", "颜色名称和代码都不能为空!")
                
        top = tk.Toplevel(self.root)
        top.title("添加颜色")
        tk.Label(top, text="中文名称：").pack(padx=10, pady=2)
        entry_zh = tk.Entry(top)
        entry_zh.pack(padx=10, pady=2)
        entry_zh.focus()
        tk.Label(top, text="英文缩写：").pack(padx=10, pady=2)
        entry_en = tk.Entry(top)
        entry_en.pack(padx=10, pady=2)
        tk.Button(top, text="确定", command=on_ok).pack(pady=8)
        # 居中
        top.update_idletasks()
        w, h = 220, 140
        x = self.root.winfo_x() + (self.root.winfo_width() - w) // 2
        y = self.root.winfo_y() + (self.root.winfo_height() - h) // 2
        top.geometry(f"{w}x{h}+{x}+{y}")
        top.transient(self.root)
        top.grab_set()

    def delete_color_option(self):
        # 弹窗选择要删除的自定义颜色
        custom_colors = [item[0] for item in self.custom_options.get("color", []) if isinstance(item, list) and len(item) == 2]
        if not custom_colors:
            tk.messagebox.showinfo("提示", "没有可删除的自定义颜色！")
            return
        top = tk.Toplevel(self.root)
        top.title("删除颜色")
        tk.Label(top, text="选择要删除的颜色：").pack(padx=10, pady=5)
        var = tk.StringVar()
        var.set(custom_colors[0])
        option = ttk.Combobox(top, textvariable=var, values=custom_colors, state="readonly")
        option.pack(padx=10, pady=5)
        def on_ok():
            color_to_del = var.get()
            self.custom_options["color"] = [item for item in self.custom_options["color"] if not (isinstance(item, list) and item[0] == color_to_del)]
            self.save_custom_options()
            # 确保使用正确的颜色框架引用
            self.refresh_color_checkboxes(self.color_frame)
            top.destroy()
        tk.Button(top, text="删除", command=on_ok).pack(pady=8)
        # 居中
        top.update_idletasks()
        w, h = 220, 120
        x = self.root.winfo_x() + (self.root.winfo_width() - w) // 2
        y = self.root.winfo_y() + (self.root.winfo_height() - h) // 2
        top.geometry(f"{w}x{h}+{x}+{y}")
        top.transient(self.root)
        top.grab_set()

    def get_color_code(self, color):
        # 优先查内置
        if color in self.color_mapping:
            return self.color_mapping[color]
        # 查自定义，兼容旧数据
        for item in self.custom_options.get("color", []):
            if isinstance(item, list) and len(item) == 2:
                zh, en = item
                if color == zh:
                    return en
            elif isinstance(item, str):
                # 旧数据，自动补全
                if color == item:
                    return "XX"
        return "XX"  # 未知

    # 工具方法：获取所有节日、款式
    def get_all_festivals(self):
        return list(self.festival_mapping.keys()) + [f for f in self.custom_options.get("festival", []) if f not in self.festival_mapping]
    def get_all_styles(self):
        return list(self.style_mapping.keys()) + [s for s in self.custom_options.get("style", []) if s not in self.style_mapping]

    # 添加/删除节日
    def add_festival_option(self):
        return
    def delete_festival_option(self):
        return
    # 添加/删除款式
    def add_style_option(self):
        return
    def delete_style_option(self):
        return
    # 添加/删除人群
    def add_crowd_option(self):
        self._add_simple_option("crowd", None, "人群")
    def delete_crowd_option(self):
        self._delete_simple_option("crowd", None, "人群")
    # 添加/删除类别（动物/职业/幽默/角色）
    def add_category_option(self, cat):
        self._add_simple_option(cat, getattr(self, f"{cat}_combo"), {"animal":"动物","profession":"职业","humor":"幽默","role":"角色"}[cat])
    def delete_category_option(self, cat):
        self._delete_simple_option(cat, getattr(self, f"{cat}_combo"), {"animal":"动物","profession":"职业","humor":"幽默","role":"角色"}[cat])
    # 通用添加/删除方法
    def _add_simple_option(self, key, combobox, label):
        # 如果是人群或尺码，直接返回
        if key in ["crowd", "size"]:
            return
            
        top = tk.Toplevel(self.root)
        top.title(f"添加{label}")
        tk.Label(top, text=f"新{label}中文名称：").pack(padx=10, pady=2)
        entry_zh = tk.Entry(top)
        entry_zh.pack(padx=10, pady=2)
        entry_zh.focus()
        tk.Label(top, text=f"新{label}英文缩写：").pack(padx=10, pady=2)
        entry_en = tk.Entry(top)
        entry_en.pack(padx=10, pady=2)

        # 如果是人群，添加尺码映射输入
        size_frame = None
        size_entries = {}
        if key == "crowd":
            size_frame = ttk.LabelFrame(top, text="尺码映射")
            size_frame.pack(padx=10, pady=5, fill=tk.X)
            # 默认尺码列表
            default_sizes = ["6M", "12M", "XS", "S", "M", "L", "XL", "2X", "SM", "LXL", "O"]
            for i, size in enumerate(default_sizes):
                row = i // 3
                col = i % 3
                frame = ttk.Frame(size_frame)
                frame.grid(row=row, column=col, padx=5, pady=2, sticky="w")
                ttk.Label(frame, text=f"{size}:").pack(side=tk.LEFT)
                entry = ttk.Entry(frame, width=8)
                entry.pack(side=tk.LEFT, padx=2)
                size_entries[size] = entry

        def on_ok():
            zh = entry_zh.get().strip()
            en = entry_en.get().strip().upper()
            # 检查重复
            exists_zh = any(zh == item[0] for item in self.custom_options.get(key, []))
            exists_en = any(en == item[1] for item in self.custom_options.get(key, []))
            if zh and en and not exists_zh and not exists_en:
                # 添加新选项
                self.custom_options[key].append([zh, en])
                
                # 如果是人群，添加尺码映射
                if key == "crowd":
                    # 获取尺码映射
                    size_mappings = {}
                    for size, entry in size_entries.items():
                        code = entry.get().strip().upper()
                        if code:  # 只添加有输入的尺码映射
                            size_mappings[size] = code
                            # 如果尺码不在自定义列表中，添加它
                            if not any(size == item[0] for item in self.custom_options.get("size", [])):
                                self.custom_options["size"].append([size, code])
                    
                    # 更新crowd_size_mapping
                    for size, code in size_mappings.items():
                        self.crowd_size_mapping[f"{zh}-{size}"] = f"{en}-{code}"

                self.save_custom_options()
                if combobox:
                    combobox["values"] = self.get_all_festivals() if key=="festival" else self.get_all_styles()
            top.destroy()
            self.root.after(100, self.refresh_all_option_ui)

        tk.Button(top, text="确定", command=on_ok).pack(pady=8)
        top.update_idletasks()
        w, h = 220, 140
        if key == "crowd":
            h = 300  # 增加窗口高度以容纳尺码映射
        x = self.root.winfo_x() + (self.root.winfo_width() - w) // 2
        y = self.root.winfo_y() + (self.root.winfo_height() - h) // 2
        top.geometry(f"{w}x{h}+{x}+{y}")
        top.transient(self.root)
        top.grab_set()

    def _delete_simple_option(self, key, combobox, label):
        # 如果是人群或尺码，直接返回
        if key in ["crowd", "size"]:
            return
            
        options = [item[0] for item in self.custom_options.get(key, [])]
        if not options:
            tk.messagebox.showinfo("提示", f"没有可删除的自定义{label}！")
            return
        top = tk.Toplevel(self.root)
        top.title(f"删除{label}")
        tk.Label(top, text=f"选择要删除的{label}：").pack(padx=10, pady=5)
        var = tk.StringVar()
        var.set(options[0])
        option = ttk.Combobox(top, textvariable=var, values=options, state="readonly")
        option.pack(padx=10, pady=5)
        def on_ok():
            val = var.get()
            self.custom_options[key] = [item for item in self.custom_options[key] if item[0] != val]
            self.save_custom_options()
            if combobox:
                combobox["values"] = self.get_all_festivals() if key=="festival" else self.get_all_styles()
            top.destroy()
            self.root.after(100, self.refresh_all_option_ui)
        tk.Button(top, text="删除", command=on_ok).pack(pady=8)
        top.update_idletasks()
        w, h = 220, 120
        x = self.root.winfo_x() + (self.root.winfo_width() - w) // 2
        y = self.root.winfo_y() + (self.root.winfo_height() - h) // 2
        top.geometry(f"{w}x{h}+{x}+{y}")
        top.transient(self.root)
        top.grab_set()

    def get_festival_code(self, festival):
        # 优先查自定义
        for item in self.custom_options.get("festival", []):
            if item[0] == festival:
                return item[1]
        # 再查内置
        return self.festival_mapping.get(festival, "XX")

    def get_category_code(self, category, selected_item):
        # 优先查自定义
        for item in self.custom_options.get(category, []):
            if item[0] == selected_item:
                return item[1]
        # 再查内置
        if category == "animal":
            return self.animal_mapping.get(selected_item, "XX")
        elif category == "profession":
            return self.profession_mapping.get(selected_item, "XX")
        elif category == "humor":
            return self.humor_mapping.get(selected_item, "XX")
        elif category == "role":
            return self.role_mapping.get(selected_item, "XX")
        return "XX"

    def get_style_code(self, style):
        # 优先查自定义
        for item in self.custom_options.get("style", []):
            if item[0] == style:
                return item[1]
        # 再查内置
        return self.style_mapping.get(style, "XX")

    def get_crowd_code(self, crowd):
        # 优先查自定义
        for item in self.custom_options.get("crowd", []):
            if item[0] == crowd:
                return item[1]
        # 再查内置
        for key, value in self.crowd_size_mapping.items():
            if key.startswith(f"{crowd}-"):
                return value.split("-")[0]
        return "XX"

    def get_size_code(self, size):
        # 优先查自定义
        for item in self.custom_options.get("size", []):
            if item[0] == size:
                return item[1]
        # 再查内置
        for key, value in self.crowd_size_mapping.items():
            if key.endswith(f"-{size}"):
                return value.split("-")[1]
        return "XX"

    def get_all_animals(self):
        return list(self.animal_mapping.keys()) + [item[0] for item in self.custom_options.get("animal", []) if item[0] not in self.animal_mapping]
    def get_all_professions(self):
        return list(self.profession_mapping.keys()) + [item[0] for item in self.custom_options.get("profession", []) if item[0] not in self.profession_mapping]
    def get_all_humors(self):
        return list(self.humor_mapping.keys()) + [item[0] for item in self.custom_options.get("humor", []) if item[0] not in self.humor_mapping]
    def get_all_roles(self):
        return list(self.role_mapping.keys()) + [item[0] for item in self.custom_options.get("role", []) if item[0] not in self.role_mapping]

    def refresh_all_option_ui(self):
        self.festival_combobox["values"] = self.get_all_festivals()
        self.style_combobox["values"] = self.get_all_styles()
        # 刷新类别下拉框
        self.animal_combo["values"] = self.get_all_animals()
        self.profession_combo["values"] = self.get_all_professions()
        self.humor_combo["values"] = self.get_all_humors()
        self.role_combo["values"] = self.get_all_roles()
        # 刷新人群
        self.refresh_crowd_checkboxes(self.crowd_frame)
        # 刷新尺码
        self.refresh_size_checkboxes(self.size_frame)
        # 刷新颜色
        self.refresh_color_checkboxes(self.color_frame)

    def refresh_crowd_checkboxes(self, crowd_frame):
        for widget in crowd_frame.winfo_children():
            widget.destroy()
        # 指定人群顺序
        crowd_order = ["婴童", "幼童", "女童", "男童", "儿童", "女性", "男性", "成人"]
        # 从内置映射获取人群
        builtin_crowds = set(k.split("-")[0] for k in self.crowd_size_mapping.keys())
        # 按指定顺序排序
        ordered_crowds = [c for c in crowd_order if c in builtin_crowds]
        self.crowd_vars.clear()
        for i, crowd in enumerate(ordered_crowds):
            var = tk.BooleanVar()
            cb = ttk.Checkbutton(crowd_frame, text=crowd, variable=var)
            cb.grid(row=0, column=i, sticky="w")
            self.crowd_vars[crowd] = var

    def refresh_size_checkboxes(self, size_frame):
        for widget in size_frame.winfo_children():
            widget.destroy()
        size_order = ["6M", "12M", "XS", "S", "M", "L", "XL", "2X", "SM", "LXL", "O"]
        # 显示名称映射
        size_display_map = {
            "6M": "6-12M",
            "12M": "12-18M",
            "XS": "X-Small",
            "S": "Small",
            "M": "Medium",
            "L": "Large",
            "XL": "X-Large",
            "2X": "XX-Large",
            "SM": "Small/Medium",
            "LXL": "Large/X-Large",
            "O": "One-size"
        }
        # 从内置映射获取尺码
        builtin_sizes = set(k.split("-")[1] for k in self.crowd_size_mapping.keys())
        # 按指定顺序排序
        ordered_sizes = [s for s in size_order if s in builtin_sizes]
        self.size_vars.clear()
        for i, size in enumerate(ordered_sizes):
            var = tk.BooleanVar()
            display_text = size_display_map.get(size, size)
            cb = ttk.Checkbutton(size_frame, text=display_text, variable=var)
            cb.grid(row=0, column=i, sticky="w")
            self.size_vars[size] = var

# 主程序
def main():
    root = tk.Tk()
    app = SKUGenerator(root)
    root.mainloop()

if __name__ == "__main__":
    main()