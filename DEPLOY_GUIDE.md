# 亚马逊卖家工具集部署指南

本指南将帮助您将亚马逊卖家工具集部署到GitHub Pages并配置Firebase数据库。

## 前提条件

在开始之前，请确保您已经：

1. 安装了Node.js和npm（https://nodejs.org/）
2. 拥有GitHub账号（https://github.com/）
3. 拥有Firebase账号（https://firebase.google.com/）
4. 安装了Git（https://git-scm.com/）

## 1. 配置项目

首先，安装项目依赖：

```bash
npm install
```

## 2. 配置Firebase

### 2.1 创建Firebase项目

1. 访问 [Firebase控制台](https://console.firebase.google.com/)
2. 点击"添加项目"
3. 输入项目名称（例如"amazon-seller-toolkit"）
4. 按照向导完成项目创建

### 2.2 添加Web应用

1. 在Firebase项目控制台中，点击"Web"图标（</>）
2. 输入应用昵称（例如"亚马逊卖家工具集"）
3. 不需要勾选"Firebase Hosting"（我们将在后续步骤中设置）
4. 点击"注册应用"
5. 记下Firebase配置对象

### 2.3 启用Firebase服务

#### 启用身份验证

1. 在Firebase控制台中，点击左侧菜单的"构建" > "Authentication"
2. 点击"开始使用"
3. 选择"电子邮件/密码"提供商，并点击"启用"按钮
4. 点击"保存"

#### 启用Firestore数据库

1. 在Firebase控制台中，点击左侧菜单的"构建" > "Firestore Database"
2. 点击"创建数据库"
3. 选择"以测试模式启动"（生产环境中应设置更严格的规则）
4. 选择适合您的数据库位置
5. 点击"启用"

### 2.4 使用自动配置脚本

我们提供了一个自动配置脚本，帮助您轻松设置Firebase：

```bash
npm run firebase-init
```

按照提示操作，这将：
- 安装Firebase CLI（如果尚未安装）
- 引导您登录Firebase账户
- 配置您的项目使用正确的Firebase项目
- 更新Firebase配置文件
- 创建必要的Firebase规则和配置文件

## 3. 部署到GitHub Pages

### 3.1 创建GitHub仓库

1. 访问 [GitHub](https://github.com/) 并登录
2. 点击右上角的"+"图标，选择"New repository"
3. 输入仓库名称（例如"amazon-seller-toolkit"）
4. 可以选择将仓库设为公开或私有
5. 点击"Create repository"

### 3.2 推送代码到GitHub

使用以下命令将项目推送到GitHub：

```bash
# 初始化git仓库（如果尚未初始化）
git init

# 添加远程仓库
git remote add origin https://github.com/你的用户名/仓库名.git

# 添加所有文件
git add .

# 提交更改
git commit -m "Initial commit"

# 推送到GitHub
git push -u origin main
```

### 3.3 使用自动部署脚本

我们提供了一个自动部署脚本，帮助您轻松部署到GitHub Pages：

```bash
npm run deploy
```

这将：
- 将您的代码推送到GitHub
- 创建或更新gh-pages分支
- 部署应用到GitHub Pages

## 4. 部署到Firebase Hosting（可选）

如果您希望使用Firebase Hosting而不是GitHub Pages，可以运行：

```bash
npm run deploy-firebase
```

这将把您的应用部署到Firebase Hosting服务。

## 5. 测试部署

### GitHub Pages

您的应用应该在以下URL可用：
```
https://你的用户名.github.io/仓库名/
```

### Firebase Hosting

您的应用应该在以下URL可用：
```
https://你的项目ID.web.app/
```

## 6. 故障排除

### GitHub Pages部署问题

- 确保您的仓库设置中已启用GitHub Pages，并且设置为使用gh-pages分支
- 检查是否有任何部署错误消息
- 确保您的仓库名称在URL中正确使用

### Firebase部署问题

- 运行 `firebase login` 确保您已正确登录
- 运行 `firebase projects:list` 确查看您的项目列表
- 检查 `firebase.json` 文件是否正确配置

### 应用问题

- 检查浏览器控制台是否有任何错误消息
- 确保Firebase配置正确
- 确保身份验证和Firestore服务已正确启用

如果您遇到任何其他问题，请查阅[Firebase文档](https://firebase.google.com/docs)或[GitHub Pages文档](https://docs.github.com/en/pages)获取更多帮助。 