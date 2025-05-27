# 亚马逊卖家工具集

这是一个为亚马逊卖家设计的实用工具集，包括FBA费用计算器和SKU生成器。该项目使用纯前端技术构建，结合Firebase实现数据存储和用户管理功能。

## 功能特点

- **FBA费用计算器**：计算亚马逊FBA的物流配送费、仓储费和销售佣金
- **SKU生成器**：快速生成规范的SKU编码，支持多种品牌、类别和变体组合
- **用户账户系统**：支持用户注册和登录
- **历史记录**：保存计算结果和生成的SKU，方便随时查看和重用
- **云端存储**：所有数据存储在Firebase云数据库中，支持跨设备访问

## 技术栈

- HTML5/CSS3
- JavaScript (ES6+)
- Bootstrap 5
- Firebase Authentication
- Firebase Firestore

## 部署到GitHub Pages

要将项目部署到GitHub Pages，请按照以下步骤操作：

1. 创建一个GitHub仓库
2. 将项目文件推送到仓库主分支
3. 在仓库设置中启用GitHub Pages，选择主分支作为源

```bash
# 在项目根目录执行
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/仓库名称.git
git push -u origin main
```

## Firebase 设置

要使用Firebase功能，您需要创建一个Firebase项目并更新配置。

### 创建Firebase项目

1. 访问 [Firebase控制台](https://console.firebase.google.com/)
2. 点击"添加项目"并按照提示创建一个新项目
3. 项目创建完成后，点击"继续"进入项目控制台

### 添加Web应用

1. 在项目控制台中，点击"Web"图标（</>）添加Web应用
2. 输入应用昵称（例如"亚马逊卖家工具集"）
3. 勾选"同时设置Firebase托管"（可选）
4. 点击"注册应用"

### 获取Firebase配置

注册应用后，Firebase会显示一段配置代码。复制其中的配置对象，如下所示：

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 更新Firebase配置

1. 打开项目中的`firebase-config.js`文件
2. 将Firebase提供的配置对象替换现有的配置对象
3. 保存文件

### 启用Firebase服务

#### 启用身份验证

1. 在Firebase控制台中，点击"构建"菜单下的"Authentication"
2. 点击"开始使用"
3. 选择"电子邮件/密码"提供商，并启用它
4. 点击"保存"

#### 设置Firestore数据库

1. 在Firebase控制台中，点击"构建"菜单下的"Firestore Database"
2. 点击"创建数据库"
3. 选择"以测试模式启动"（注意：生产环境应使用规则进行安全设置）
4. 选择数据库位置，然后点击"启用"

### 设置安全规则

在生产环境中，您应该设置适当的安全规则。以下是一个基本示例：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 只允许已登录的用户读取和写入自己的数据
    match /calculations/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /skus/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

## 使用方法

1. 打开项目主页
2. 注册账户或登录（可选，但需要保存历史记录）
3. 选择您需要的工具：
   - FBA费用计算器：输入产品尺寸、重量和价格，计算各种费用
   - SKU生成器：输入产品信息，生成标准化的SKU编码

## 开发和测试

本地开发和测试时，您可以使用任何本地服务器。例如，使用VS Code的Live Server扩展或Node.js的http-server：

```bash
# 使用npm安装http-server
npm install -g http-server

# 在项目根目录运行
http-server
```

## 许可证

MIT

## 联系方式

如有问题或建议，请通过GitHub Issues联系我们。
