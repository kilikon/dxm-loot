# 枫记 (Maple Log) - MapleStory 升级效率监控工具

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

一个 **纯前端网页版** 的冒险岛升级效率监控工具。使用浏览器 Screen Capture API 获取游戏画面，通过本地 OCR 识别游戏数据，所有数据 100% 保存在本地浏览器，零上传敏感信息。

## ✨ 特色功能

- 🎮 **实时监控** - 通过屏幕捕获 API 获取游戏窗口画面
- 🧠 **本地 OCR 识别** - 使用 Tesseract.js 进行离线文字识别
- 💾 **本地数据存储** - 所有数据保存在 IndexedDB，100% 本地离线
- 📊 **效率分析** - 实时计算升级效率和趋势统计
- 🌙 **深色模式** - 支持浅色/深色主题切换
- 📱 **响应式设计** - 完美支持桌面、平板、手机设备
- 🔒 **隐私优先** - 无账号登录、无密码输入、无数据上传
- 🌍 **国际化** - 支持简体中文、繁体中文、英文

## 🚀 快速开始

### 前置要求

- Node.js 16+ 和 npm/yarn
- 现代浏览器（支持 Screen Capture API）
- Git

### 本地开发

```bash
# 1. 克隆仓库
git clone https://github.com/你的用户名/maple-log.git
cd maple-log

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 浏览器打开 http://localhost:5173
```

### 构建生产版本

```bash
npm run build

# 生成的文件在 dist/ 文件夹中
```

### 预览构建结果

```bash
npm run preview
```

## 📦 部署到 GitHub Pages

### 方案 1：自动化部署（推荐）

1. **推送代码到 GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/你的用户名/maple-log.git
   git branch -M main
   git push -u origin main
   ```

2. **启用 GitHub Pages**
   - 进入仓库 Settings → Pages
   - 在 "Build and deployment" 中选择 "GitHub Actions"
   - 工作流会自动运行，生成网站

3. **访问网站**
   - 网址：`https://你的用户名.github.io/maple-log/`

### 方案 2：手动部署

```bash
# 1. 构建项目
npm run build

# 2. 创建 gh-pages 分支
git subtree push --prefix dist origin gh-pages

# 3. 在 GitHub Settings 中启用 GitHub Pages
# 选择 gh-pages 分支作为源
```

## 🎯 使用教程

### 基本流程

1. **打开应用** → 访问 `https://你的用户名.github.io/maple-log/`

2. **创建会话**
   - 输入角色名、职业、等级
   - 点击"开始监控"按钮

3. **授权屏幕共享**
   - 浏览器会弹出系统选择器
   - 选择要监控的游戏窗口
   - 确认授权

4. **自动识别**
   - 工具自动捕获游戏画面
   - 每秒进行 OCR 识别
   - 实时展示经验、金币、HP/MP 等数据

5. **查看统计**
   - 控制面板显示实时效率
   - 历史记录保存所有会话
   - 可导出数据为 JSON 格式

### 功能详解

#### 控制面板
- 当前会话信息（角色、职业、等级）
- 实时经验统计（总获取、耗时、效率）
- 识别状态指示
- 快速操作按钮

#### 识别校准
- 调整 OCR 识别区域（ROI）
- 微调亮度和对比度
- 支持多个分辨率配置

#### 历史记录
- 时间轴展示所有升级会话
- 查看会话详情（逐帧识别结果）
- 数据导出功能

#### 设置
- 主题切换（浅色/深色）
- 识别精度调节
- 隐私与安全信息
- 数据备份与恢复

## 🔒 隐私与安全

### ✅ 本工具做的事

- ✓ 读取你授权的屏幕窗口
- ✓ 进行本地 OCR 识别
- ✓ 保存识别结果到本地 IndexedDB
- ✓ 计算升级效率统计

### ❌ 本工具不做的事

- ✗ 无任何游戏账号登录界面
- ✗ 不接触你的游戏密码或凭据
- ✗ 不上传原始游戏画面
- ✗ 不上传 OCR 识别文本
- ✗ 不修改游戏客户端
- ✗ 不注入游戏进程
- ✗ 不模拟游戏操作

### 🛡️ 安全机制

1. **浏览器沙箱隔离** - 网页代码完全隔离，无法访问系统资源
2. **本地闭环处理** - 所有识别在本地进行，不调用云端 API
3. **焦点隔离** - 无法监听游戏内密码输入
4. **数据本地存储** - IndexedDB 完全由用户掌控
5. **源码透明** - 开源代码可被审查验证

### 🔍 如何验证

打开浏览器开发者工具（F12）：

1. **Sources 标签** - 查看源代码实现
2. **Network 标签** - 监控网络请求（应为空或仅有静态资源）
3. **Application → IndexedDB** - 查看本地存储数据

详细安全分析见 [SECURITY.md](./SECURITY.md)

## 🛠️ 技术栈

| 层级 | 技术 | 用途 |
|------|------|------|
| **前端框架** | Vue 3 + TypeScript | 现代 SPA 应用 |
| **状态管理** | Pinia | 跨组件状态共享 |
| **UI 组件库** | Element Plus | 完整的组件系统 |
| **路由管理** | Vue Router | 单页面路由 |
| **数据存储** | Dexie + IndexedDB | 本地数据库 |
| **OCR 识别** | Tesseract.js | 离线文字识别 |
| **图表库** | uPlot | 高性能图表 |
| **构建工具** | Vite | 快速构建打包 |
| **部署** | GitHub Pages | 免费静态托管 |

## 📁 项目结构

```
maple-log/
├── src/
│   ├── main.ts                 # 应用入口
│   ├── App.vue                 # 根组件
│   ├── router/
│   │   └── index.ts            # 路由配置
│   ├── pages/
│   │   ├── Dashboard.vue       # 控制面板
│   │   ├── Calibration.vue     # 识别校准
│   │   ├── History.vue         # 历史记录
│   │   └── Settings.vue        # 设置
│   ├── services/
│   │   ├── database.ts         # Dexie 数据库
│   │   ├── capture-service.ts  # 屏幕捕获
│   │   └── ocr-engine.ts       # OCR 识别引擎
│   ├── stores/
│   │   └── game.ts             # 游戏数据状态
│   └── styles/
│       └── main.css            # 全局样式
├── index.html                  # HTML 入口
├── vite.config.ts              # Vite 配置
├── tsconfig.json               # TypeScript 配置
├── package.json                # 项目依赖
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 部署
└── README.md                   # 本文件
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

### 代码规范

- 使用 TypeScript 编写所有代码
- 遵循 Vue 3 Composition API 风格
- 添加必要的注释和 JSDoc
- 组件使用 `<script setup>` 语法

## 📝 许可证

MIT License - 详见 [LICENSE](./LICENSE)

## ⚠️ 免责声明

本工具是为了学习和个人使用而开发的。使用本工具的用户需自行承担风险。作者不对任何因使用本工具而产生的问题负责，包括但不限于账号被封禁等情况。

根据安全分析，本工具为纯前端网页工具，不修改游戏客户端，不注入进程，不模拟游戏操作，理论上不应触发反作弊机制。但游戏运营方对第三方工具的规则拥有最终判定权。

## 📞 联系方式

- 提交 Issue：[GitHub Issues](https://github.com/你的用户名/maple-log/issues)
- 讨论区：[GitHub Discussions](https://github.com/你的用户名/maple-log/discussions)

## 🙏 致谢

- Vue.js 团队 - 提供优秀的前端框架
- Element Plus - UI 组件库
- Tesseract.js - OCR 识别库
- Dexie - IndexedDB 包装库
- GitHub - 免费静态托管

---

**最后更新**: 2026-10-22

**项目状态**: ✅ 稳定可用

**特别提醒**: 本项目为个人学习项目，与官方冒险岛游戏无任何关联。
