# Carpool App - 社区拼车与顺风车出行管理系统

## 项目介绍

Carpool App 是一个面向社区的拼车与顺风车出行管理平台，致力于为用户提供便捷、安全、经济的出行服务。系统包含微信小程序（用户端/司机端）和管理后台，支持行程发布、智能匹配、订单管理、信誉评价、投诉处理等完整业务流程。

## 功能特性

### 用户端（微信小程序）

- **用户注册与登录**：手机号快速注册登录，实名认证
- **行程搜索**：按起点、终点、时间搜索可用顺风车行程
- **行程发布**：司机发布可拼车行程，设置座位数、价格、偏好
- **智能匹配**：基于位置和时间的智能行程推荐
- **订单管理**：查看、确认、取消行程订单
- **支付功能**：微信支付集成，支持在线支付
- **收藏路线**：常用路线收藏，开启匹配提醒
- **信誉评价**：行程完成后双向评价打分
- **消息通知**：订单状态变更、匹配成功等实时通知
- **个人中心**：个人资料、信誉等级、订单记录、账户余额

### 司机端（微信小程序）

- **司机认证**：驾照、行驶证、车辆信息认证
- **行程管理**：发布、编辑、取消行程
- **乘客管理**：查看乘客信息，确认/拒绝乘车申请
- **订单处理**：接单、开始行程、结束行程
- **收入统计**：查看收入明细和统计数据
- **信誉系统**：基于评价和完成率的信誉等级

### 管理后台

- **数据概览**：订单量、用户数、收入、匹配率等核心指标
- **用户管理**：用户列表、审核、封禁、信誉调整
- **行程管理**：行程列表、状态管理、详情查看
- **订单管理**：订单查询、处理异常订单、退款
- **评价管理**：查看评价、处理违规评价
- **投诉处理**：投诉受理、处理、记录跟踪
- **财务管理**：收入统计、平台费用、对账管理
- **系统设置**：参数配置、公告管理、运营活动
- **管理员日志**：操作日志记录与审计

## 技术栈

| 模块 | 技术 | 版本 |
|------|------|------|
| 后端服务 | Node.js + Express | 4.18+ |
| 数据库 | MySQL + Sequelize ORM | 8.0+ |
| 缓存 | Redis | 6.0+ |
| 实时通信 | Socket.IO | 4.7+ |
| 小程序 | Taro 3.x + React | 3.6+ |
| UI组件库 | Taro UI | 3.1+ |
| 管理后台 | Vue 3 + Element Plus | - |
| 认证 | JWT | 9.0+ |
| 密码加密 | bcryptjs | 2.4+ |

## 目录结构

```
carpool-app/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── config/         # 配置文件
│   │   ├── controllers/    # 控制器
│   │   ├── middleware/     # 中间件
│   │   ├── models/         # 数据模型
│   │   ├── routes/         # 路由定义
│   │   └── utils/          # 工具函数
│   ├── server.js           # 入口文件
│   ├── package.json
│   ├── .env.example
│   └── .env
├── miniprogram/            # 微信小程序（Taro）
│   ├── config/             # 环境配置
│   ├── src/
│   │   ├── pages/          # 页面
│   │   ├── services/       # API服务
│   │   ├── utils/          # 工具函数
│   │   ├── app.js
│   │   ├── app.config.js
│   │   └── app.scss
│   └── package.json
├── admin/                  # 管理后台（预留）
│   └── package.json
├── scripts/                # 脚本
│   └── start.sh            # 一键启动脚本
├── package.json            # 根package.json（monorepo）
├── .gitignore
└── README.md
```

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0
- MySQL >= 8.0
- Redis >= 6.0

### 安装依赖

在项目根目录执行：

```bash
npm run install-all
```

### 初始化数据库

1. 创建 MySQL 数据库：

```sql
CREATE DATABASE carpool_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 修改 `backend/.env` 中的数据库配置

3. 初始化测试数据：

```bash
npm run seed-data
```

### 启动服务

#### 方式一：分别启动

启动后端服务（端口 3000）：

```bash
npm run dev-backend
```

启动小程序开发：

```bash
npm run dev-miniprogram
```

启动管理后台（需要先创建admin项目）：

```bash
npm run dev-admin
```

#### 方式二：一键启动脚本

```bash
bash scripts/start.sh
```

## 测试账号

运行 `npm run seed-data` 后，系统会创建以下测试账号：

| 角色 | 手机号 | 密码 | 说明 |
|------|--------|------|------|
| 管理员 | 13800000000 | admin123 | 超级管理员 |
| 司机 | 13800000001 | 123456 | 老司机（张三），信誉等级：金牌 |
| 司机 | 13800000002 | 123456 | 顺风车王（李四），信誉等级：铂金 |
| 乘客 | 13800000003 | 123456 | 小明同学（王五），信誉等级：金牌 |
| 乘客 | 13800000004 | 123456 | 白领小李，信誉等级：银牌 |

## API 文档说明

### 认证相关

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 用户登录 |
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/logout` | 用户登出 |

### 用户相关

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/users/profile` | 获取用户信息 |
| PUT | `/api/users/profile` | 更新用户信息 |
| POST | `/api/users/verify` | 实名认证 |
| GET | `/api/users/balance` | 获取账户余额 |

### 行程相关

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/trips` | 搜索行程列表 |
| GET | `/api/trips/:id` | 获取行程详情 |
| POST | `/api/trips` | 发布行程（司机） |
| PUT | `/api/trips/:id` | 更新行程 |
| DELETE | `/api/trips/:id` | 取消行程 |

### 订单相关

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/orders` | 获取订单列表 |
| GET | `/api/orders/:id` | 获取订单详情 |
| POST | `/api/orders` | 创建订单 |
| PUT | `/api/orders/:id/status` | 更新订单状态 |

### 评价相关

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/reviews/:userId` | 获取用户评价 |
| POST | `/api/reviews` | 创建评价 |

### 管理后台

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/stats` | 获取统计数据 |
| GET | `/api/admin/users` | 用户管理列表 |
| GET | `/api/admin/orders` | 订单管理列表 |
| GET | `/api/admin/complaints` | 投诉列表 |
| POST | `/api/admin/complaints/:id/handle` | 处理投诉 |

所有需要认证的接口需在请求头中携带：

```
Authorization: Bearer <token>
```
