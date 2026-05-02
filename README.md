# DormInOne - 宿舍全能管家

一个功能完整的宿舍管理系统，提供室友管理、值日排班、AA记账、用电监控、物品借用等功能。

![DormInOne](https://img.shields.io/badge/DormInOne-%E5%AE%BF%E8%88%8D%E5%85%A8%E8%83%BD%E5%AE%B6%E5%AE%B6-blue)
![Vue3](https://img.shields.io/badge/Vue-3.x-green)
![Node.js](https://img.shields.io/badge/Node.js-18.x-blue)

## 🏠 项目介绍

DormInOne 是一款专为宿舍生活打造的全能管理工具，帮助室友们更好地管理日常事务。

## ✨ 功能特性

- **🏠 室友管理** - 添加、编辑、删除室友信息
- **📅 值日排班** - 每周清洁任务分配
- **💰 AA记账** - 记录支出和收入，支持费用分摊
- **⚡ 用电监控** - 记录用电量和电费
- **📦 物品借用** - 管理共享物品的借用状态
- **⚙️ 系统设置** - 深色模式、数据管理

## 🛠️ 技术栈

| 分类 | 技术 |
|------|------|
| 前端框架 | Vue 3 + Vite |
| 状态管理 | Pinia |
| 路由 | Vue Router |
| UI样式 | Tailwind CSS 3 |
| 图标 | Lucide Vue |
| 后端 | Node.js + Express |
| 实时通信 | Socket.io |
| 数据存储 | JSON 文件 |

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 启动方式

#### 方式一：一键启动（推荐）

```bash
# Windows PowerShell
.\start.ps1
```

#### 方式二：手动启动

**启动后端服务：**

```bash
cd server
npm install
node server.js
```

**启动前端服务：**

```bash
cd client
npm install
npm run dev
```

### 访问地址

- 前端页面: http://localhost:5173
- 后端API: http://localhost:3000

## 📁 项目结构

```
dorminone/
├── client/                    # 前端项目
│   ├── src/
│   │   ├── components/        # 组件
│   │   │   ├── Header.vue     # 顶部导航
│   │   │   ├── Sidebar.vue    # 侧边栏
│   │   │   ├── Toast.vue      # 提示组件
│   │   │   ├── ToastContainer.vue
│   │   │   └── ConfirmModal.vue  # 确认对话框
│   │   ├── views/             # 页面视图
│   │   │   ├── Dashboard.vue  # 首页仪表盘
│   │   │   ├── Roommates.vue  # 室友管理
│   │   │   ├── Schedule.vue   # 值日排班
│   │   │   ├── Bills.vue      # AA记账
│   │   │   ├── Electricity.vue # 用电监控
│   │   │   ├── Items.vue      # 物品借用
│   │   │   └── Settings.vue   # 系统设置
│   │   ├── stores/            # Pinia状态管理
│   │   ├── services/          # API服务
│   │   ├── composables/       # 组合式函数
│   │   └── router/            # 路由配置
│   └── package.json
├── server/                    # 后端项目
│   ├── data/                  # JSON数据文件
│   ├── server.js              # 服务器入口
│   └── package.json
├── start.ps1                  # 一键启动脚本
└── README.md
```

## 🔌 API 接口

| 模块 | 方法 | 路径 | 描述 |
|------|------|------|------|
| 室友 | GET | /api/roommates | 获取所有室友 |
| 室友 | POST | /api/roommates | 添加室友 |
| 室友 | PUT | /api/roommates/:id | 更新室友 |
| 室友 | DELETE | /api/roommates/:id | 删除室友 |
| 排班 | GET | /api/schedule | 获取排班表 |
| 排班 | POST | /api/schedule | 添加排班 |
| 账单 | GET | /api/bills | 获取账单 |
| 账单 | POST | /api/bills | 添加账单 |
| 用电 | GET | /api/electricity | 获取用电记录 |
| 用电 | POST | /api/electricity | 添加用电记录 |
| 物品 | GET | /api/items | 获取物品列表 |
| 物品 | POST | /api/items | 添加物品 |

## 🎨 界面预览

### 深色模式
支持一键切换深色/浅色模式，保护眼睛。

### Toast 提醒
美观的动画提示，替代原生弹窗。

### 确认对话框
优雅的模态对话框，带有动画效果。

*DormInOne(DIO) team built with ❤️*