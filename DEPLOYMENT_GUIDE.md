# 🚀 GitHub Pages 部署操作指南

> 跟随本指南，5-10 分钟内完成项目部署

---

## 📋 部署前检查清单

- [ ] 已安装 Git (下载地址: https://git-scm.com/)
- [ ] 已安装 Node.js 16+ (下载地址: https://nodejs.org/)
- [ ] 拥有 GitHub 账号 (注册地址: https://github.com/)
- [ ] 网络连接正常

---

## 🎯 分步部署指南

### 第 1 步：打开命令行工具 (1 分钟)

**Windows 用户**：
1. 按 `Win + R` 打开运行对话框
2. 输入 `powershell` 回车
3. 或直接在项目文件夹中按 `Shift + 右键` 选择"在此处打开 PowerShell"

**Mac/Linux 用户**：
- 打开终端（Terminal）

**VS Code 用户**：
1. 打开 VS Code
2. 按 `Ctrl + ~` (或 `Cmd + ~`) 打开集成终端
3. 自动位于项目根目录

### 第 2 步：进入项目目录 (30 秒)

```bash
cd D:\07.SY\Other\sum_tool
```

**验证**：输入以下命令，应该看到项目文件列表
```bash
dir
# 或
ls
```

**预期输出**：
```
package.json
vite.config.ts
tsconfig.json
index.html
src/
.github/
README.md
```

### 第 3 步：初始化 Git (1 分钟)

```bash
# 初始化 Git 仓库
git init

# 配置用户信息（替换为你的信息）
git config user.email "2268253933@qq.com"
git config user.name "kilikon"

# 验证配置
git config --list
```

**预期输出**：
```
user.email=你的邮箱@example.com
user.name=你的用户名
```

### 第 4 步：添加所有文件到 Git (30 秒)

```bash
git add .
```

**验证**：
```bash
git status
```

**预期输出**：
```
On branch master

No commits yet

Changes to be committed:
  new file:   package.json
  new file:   vite.config.ts
  new file:   index.html
  ...
  (所有文件都是 green "new file")
```

### 第 5 步：创建首次提交 (30 秒)

```bash
git commit -m "Initial commit: Complete maple-log application"
```

**预期输出**：
```
create mode 100644 .github/workflows/deploy.yml
create mode 100644 .gitignore
create mode 100644 README.md
...
 20 files changed, 5000+ insertions(+)
```

### 第 6 步：在 GitHub 创建仓库 (2 分钟)

1. 访问 https://github.com/new
2. 填写以下信息：

   | 字段 | 值 |
   |------|-----|
   | Repository name | `maple-log` |
   | Description | `冒险岛升级效率监控工具 - 纯前端网页版` |
   | Public/Private | **Public**（公开） |
   | Add .gitignore | ❌ 不勾选 |
   | Add license | ❌ 不勾选 |

3. 点击 **Create repository** 按钮

**成功标志**：看到类似以下页面：
```
Quick setup — if you've done this kind of thing before

or

HTTPS: https://github.com/kilikon/dxm-loot.git
SSH:   git@github.com:kilikon/dxm-loot.git
```

### 第 7 步：添加远程仓库 (30 秒)

回到命令行，执行：

```bash
# 替换 YOUR_USERNAME 为你的 GitHub 用户名
git remote add origin https://github.com/kilikon/dxm-loot.git

# 验证
git remote -v
```

**预期输出**：
```
origin  https://github.com/YOUR_USERNAME/maple-log.git (fetch)
origin  https://github.com/YOUR_USERNAME/maple-log.git (push)
```

### 第 8 步：重命名分支为 main (30 秒)

```bash
git branch -M main

# 验证
git branch
```

**预期输出**：
```
* main
```

### 第 9 步：推送代码到 GitHub (1-3 分钟)

```bash
git push -u origin main
```

**首次推送可能需要认证**：
- 如果出现认证窗口，输入 GitHub 用户名和密码
- 或使用 GitHub Personal Access Token

**预期输出**：
```
Enumerating objects: 25, done.
Counting objects: 100% (25/25), done.
Compressing objects: 100% (22/22), done.
Writing objects: 100% (25/25), 5.12 KiB | 1.28 MiB/s, done.
Total 25 (delta 0), reused 0 (delta 0), pack-reused 0
To https://github.com/YOUR_USERNAME/maple-log.git
 * [new branch]      main -> main
Branch 'main' is tracking 'origin/main'.
```

✅ **推送成功！**

### 第 10 步：启用 GitHub Pages (1 分钟)

1. 打开你的仓库：`https://github.com/YOUR_USERNAME/maple-log`

2. 点击上方 **Settings** 标签

3. 左侧菜单找到 **Pages**

4. 在 "Build and deployment" 部分：
   - Source 选择 **GitHub Actions**
   - 会自动运行工作流

5. 等待 2-5 分钟，刷新页面

**成功标志**：看到绿色消息：
```
✓ Your site is live at https://YOUR_USERNAME.github.io/maple-log/
```

### 第 11 步：验证网站上线 (1 分钟)

1. 访问：`https://YOUR_USERNAME.github.io/maple-log/`

2. 应该看到枫记应用的首页：
   - 顶部导航栏（控制面板、识别校准、历史记录、设置）
   - 欢迎信息
   - 统计卡片
   - 控制按钮

3. 测试基本功能：
   - [ ] 主题切换按钮（月亮/太阳图标）
   - [ ] 导航菜单切换
   - [ ] 页面响应正常

✅ **部署完成！**

---

## 🔍 常见错误及解决方案

### ❌ 错误 1: "fatal: not a git repository"

**原因**：没有进入项目目录或没有初始化 Git

**解决**：
```bash
# 确保在正确的目录
cd D:\07.SY\Other\sum_tool

# 重新初始化
git init
```

---

### ❌ 错误 2: "Permission denied (publickey)"

**原因**：SSH 密钥未配置

**解决**：使用 HTTPS 而不是 SSH
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/maple-log.git
```

---

### ❌ 错误 3: GitHub Actions 工作流失败

**检查步骤**：

1. 进入仓库 → **Actions** 标签
2. 点击失败的工作流
3. 查看错误日志

**常见原因和解决**：

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| `Cannot find module 'vue'` | 依赖未安装 | 检查 package.json，重新提交 |
| `vue-tsc compilation error` | TypeScript 错误 | 检查源代码是否有语法错误 |
| `No matching branch 'gh-pages'` | GitHub Pages 配置错误 | 在 Settings → Pages 选择 GitHub Actions |

---

### ❌ 错误 4: 网站显示空白

**原因**：路由配置错误或资源加载失败

**解决**：
1. 打开浏览器 F12 开发者工具
2. 查看 Console 标签（控制台）
3. 查看是否有错误信息
4. 检查 `vite.config.ts` 中的 `base: '/maple-log/'` 是否正确

---

### ❌ 错误 5: 网站地址不对

**预期地址格式**：
```
https://你的GitHub用户名.github.io/maple-log/
```

**不是**：
- ❌ https://github.com/你的用户名/maple-log
- ❌ https://maple-log.github.io
- ❌ https://github.io/你的用户名/maple-log

如果仍然不对，检查仓库设置中 GitHub Pages 的网址。

---

## 📊 部署验收标准

### ✅ 必须满足

- [ ] 代码成功推送到 GitHub
- [ ] GitHub Actions 工作流显示 ✅（绿色）
- [ ] GitHub Pages 显示 "Your site is live"
- [ ] 网站可以正常访问（无 404 错误）
- [ ] 应用首页可以加载
- [ ] 导航菜单可以点击
- [ ] 页面不显示 JavaScript 错误

### ⭐ 推荐测试

- [ ] 打开浏览器 F12 → Console，无红色错误
- [ ] 打开浏览器 F12 → Network，检查资源加载
- [ ] 测试主题切换（深色/浅色）
- [ ] 各个页面都能切换
- [ ] 打开手机浏览器，检查响应式设计

### 🎯 高级验证（可选）

- [ ] 点击"开始监控"，检查屏幕捕获权限请求
- [ ] 打开浏览器开发者工具 F12 → Application，查看 IndexedDB 中的 maple-log-db 数据库
- [ ] 打开 F12 → Sources，查看源代码是否可读
- [ ] 网络速度测试：首屏加载时间应在 1-3 秒内

---

## 🔄 后续更新流程

部署后，如果要更新代码，只需：

```bash
# 修改你的代码...

# 添加更改
git add .

# 提交更改
git commit -m "修复 XXX 功能"

# 推送到 GitHub
git push

# GitHub Actions 会自动构建和部署
# 等待 2-5 分钟，网站自动更新
```

---

## 📱 分享你的成果

部署成功后，你可以：

1. **分享链接**：
   ```
   https://YOUR_USERNAME.github.io/maple-log/
   ```

2. **分享 GitHub 仓库**：
   ```
   https://github.com/YOUR_USERNAME/maple-log
   ```

3. **在 README 中展示**：
   ![Demo](https://raw.githubusercontent.com/YOUR_USERNAME/maple-log/main/screenshot.png)

---

## 🎓 深入学习资源

部署完成后，你可以进一步学习：

### 版本控制
- Git 官方文档：https://git-scm.com/book/en/v2
- GitHub 初学者指南：https://guides.github.com/

### 前端开发
- Vue 3 官方文档：https://vuejs.org/
- Vite 官方文档：https://vitejs.dev/

### 部署
- GitHub Pages 官方文档：https://pages.github.com/
- GitHub Actions 文档：https://docs.github.com/en/actions

---

## ⏱️ 时间估算

| 步骤 | 预计时间 | 累计时间 |
|------|--------|---------|
| 1. 打开命令行 | 1 分钟 | 1 分钟 |
| 2. 进入目录 | 30 秒 | 1.5 分钟 |
| 3. Git 初始化 | 1 分钟 | 2.5 分钟 |
| 4. 添加文件 | 30 秒 | 3 分钟 |
| 5. 创建提交 | 30 秒 | 3.5 分钟 |
| 6. 创建 GitHub 仓库 | 2 分钟 | 5.5 分钟 |
| 7. 添加远程仓库 | 30 秒 | 6 分钟 |
| 8. 重命名分支 | 30 秒 | 6.5 分钟 |
| 9. 推送代码 | 2 分钟 | 8.5 分钟 |
| 10. 启用 GitHub Pages | 1 分钟 | 9.5 分钟 |
| 11. 验证网站 | 1 分钟 | 10.5 分钟 |
| **总计** | | **~10 分钟** |

---

## ✅ 部署成功标志

当你看到以下情况时，说明部署完全成功：

```
✅ GitHub 仓库创建成功
✅ 代码推送到 main 分支
✅ GitHub Actions 工作流完成（绿色对勾）
✅ GitHub Pages 显示网站已上线
✅ 网站可以正常访问和交互
✅ 应用功能运行正常
```

---

## 🎉 恭喜！

如果你能看到这条信息，说明你已经：

1. ✅ 成功创建了完整的 Vue 3 项目
2. ✅ 实现了屏幕捕获和 OCR 识别功能
3. ✅ 集成了本地数据存储
4. ✅ 配置了自动化部署流程
5. ✅ 成功将应用部署到 GitHub Pages

**你现在拥有一个完全功能性的网页应用，可以被全世界通过网络访问！**

---

## 📞 需要帮助？

如果遇到问题，可以：

1. 查看 [DEPLOYMENT_VERIFICATION.md](./DEPLOYMENT_VERIFICATION.md) 中的常见问题
2. 阅读 [README.md](./README.md) 中的完整说明
3. 检查 GitHub Actions 工作流的错误日志
4. 在浏览器 F12 开发者工具中查看错误信息

---

**祝部署顺利！🚀**

生成时间：2026-10-22 14:15
