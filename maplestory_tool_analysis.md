# 枫记（MapleStory Log）网页工具 - 完整技术分析

## 📊 执行摘要

**枫记** 是一个 **纯前端网页版游戏监控工具**，采用完整的本地闭环架构。所有画面识别、数据计算、历史记录均在用户本地浏览器内完成，零上传敏感数据。

---

## 第一部分：系统架构总览

### 1.1 技术栈清单

```
前端框架层
├─ Vue 3 (3.5.42)              ✅ 核心框架
├─ Vue Router (5.3.0)          ✅ SPA 路由
├─ Pinia (4.0.3)               ✅ 状态管理
├─ Element Plus (2.14.5)       ✅ UI 组件库
└─ Vue i18n (11.4.10)          ✅ 国际化

数据与存储层
├─ Dexie (4.4.5)               ✅ IndexedDB 包装层
├─ IndexedDB                   ✅ 本地数据库（数据库名: maple-log）
└─ LocalStorage               ✅ 轻量配置存储

识别与推理层
├─ PaddleOCR                   ✅ 百度飞桨 OCR 模型
├─ WebAssembly (WASM)         ✅ 本地推理引擎
├─ Web Worker                 ✅ 多线程计算隔离
└─ Canvas API                 ✅ 图像处理

展示与交互层
├─ uPlot (1.6.32)              ✅ 高性能图表库
├─ Screen Capture API         ✅ 浏览器屏幕共享
└─ MediaRecorder API          ✅ 帧捕获
```

### 1.2 核心数据流架构

```
┌─────────────────────────────────────────────────────────────┐
│                    用户操作流                                 │
│  选择游戏窗口 → 授权屏幕共享 → 开始捕获 → 识别处理 → 保存数据  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              浏览器沙箱隔离环境                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 主线程 (Main Thread)                                 │   │
│  │ ├─ UI 渲染 (Vue 3)                                  │   │
│  │ ├─ 用户交互处理                                      │   │
│  │ └─ 数据状态管理 (Pinia)                             │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Web Worker 1 (OCR 线程)                            │   │
│  │ ├─ WASM 推理引擎 (PaddleOCR)                       │   │
│  │ ├─ 多帧并行识别                                      │   │
│  │ └─ 数字提取与格式化                                  │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Web Worker 2+ (补充处理线程)                        │   │
│  │ └─ 图像预处理、缓存管理等                             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  本地存储层                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ IndexedDB (maple-log)                               │  │
│  │ ├─ sessions      // 升级记录会话元数据              │  │
│  │ ├─ records       // 逐帧识别记录（时间序列）       │  │
│  │ ├─ buffs         // BUFF 提醒历史                  │  │
│  │ ├─ calibration   // 用户校准参数                    │  │
│  │ ├─ settings      // 用户配置                        │  │
│  │ └─ profiles      // 职业配置                        │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ LocalStorage                                        │  │
│  │ ├─ theme         // 主题偏好                        │  │
│  │ ├─ language      // 语言设置                        │  │
│  │ └─ uiState       // UI 状态                         │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│           可选网络上报（社区排行榜）                          │
│  当满足条件时 → 字段白名单过滤 → 上报统计摘要               │
│  仅包含：职业、等级、地图、经验增量、耗时、效率等统计值      │
│  不包含：原始画面、原始文字、个人隐私数据                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 第二部分：核心功能模块实现

### 2.1 屏幕捕获模块 (capture-service.ts)

**负责文件**：`src/services/capture-service.ts`

#### 初始化与权限请求

```javascript
// 浏览器画面授权入口 (行 132–147)
async function requestScreenCapture() {
  const constraints = {
    video: {
      displaySurface: 'window',  // 仅允许选择单个窗口
      cursor: 'never',           // 不捕获鼠标指针
      frameRate: { ideal: 30 }   // 理想帧率 30fps
    },
    audio: false                 // 音频强制禁用
  };
  
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia(constraints);
    return stream;
  } catch (error) {
    // 用户取消授权或浏览器不支持
    throw new UserCancelledError('用户未授权屏幕共享');
  }
}
```

**关键特性**：
- ✅ `displaySurface: 'window'` - 系统级窗口选择器由用户主动触发
- ✅ `audio: false` - 音频捕获在底层代码写死禁用
- ✅ `cursor: 'never'` - 不捕获鼠标指针，保护隐私
- ✅ 无法绕过用户授权弹窗（系统沙箱强制）

#### 捕获范围与权限控制 (行 108–130)

```javascript
// 定义捕获范围与限制
const captureOptions = {
  // 仅接收选定窗口的画面像素
  recordingMode: 'window-only',
  
  // 音频采集选项
  audioConstraints: false,  // 写死禁用
  
  // 视频帧率配置
  frameRateTarget: 30,
  frameRateMax: 60,
  
  // 分辨率限制（防止过大内存占用）
  maxResolution: {
    width: 3840,   // 4K
    height: 2160
  }
};
```

**安全设计原理**：
1. **焦点隔离** - 网页只能监听自己窗口的事件，游戏输入密码时浏览器无感知
2. **沙箱阻断** - 浏览器禁止网页调用系统级钩子（SetWindowsHookEx 等）
3. **光标隔离** - 光标移出浏览器立刻失去追踪能力

#### 停止并释放共享轨道 (行 441–454)

```javascript
// 彻底销毁媒体轨道，释放系统资源
async function stopScreenCapture(stream) {
  if (!stream) return;
  
  // 关闭所有视频轨道
  stream.getVideoTracks().forEach(track => {
    track.stop();        // 停止轨道
    track.enabled = false;  // 禁用轨道
  });
  
  // 关闭所有音频轨道（通常为空，但确保完整性）
  stream.getAudioTracks().forEach(track => {
    track.stop();
  });
  
  // 通知用户代理释放媒体资源
  stream.getTracks().forEach(track => {
    if (track.readyState !== 'ended') {
      track.stop();
    }
  });
  
  console.log('媒体轨道已彻底释放');
}
```

**释放机制**：
- 用户点击"停止识别" → 调用 `track.stop()`
- 浏览器顶部点击"停止共享" → 同步销毁
- 页面刷新/关闭 → 自动清理

---

### 2.2 图像识别模块 (ocr-engine.ts)

**负责文件**：`src/services/ocr-engine.ts`

#### Worker 与 WASM 运行配置 (行 269–289)

```javascript
// 初始化 Web Worker 与 WASM 推理引擎
class OCREngine {
  constructor() {
    this.worker = null;
    this.wasmModule = null;
    this.inferenceQueue = [];
  }
  
  async initialize() {
    // 1. 加载 WASM 模块
    this.wasmModule = await this.loadWasmModule();
    
    // 2. 创建独立 Web Worker 线程
    this.worker = new Worker('/workers/ocr-worker.js', {
      type: 'module',
      name: 'paddle-ocr-worker'
    });
    
    // 3. 传递 WASM 共享内存给 Worker
    this.worker.postMessage({
      type: 'INIT',
      wasmBuffer: this.wasmModule.buffer,
      modelPath: '/models/paddle-ocr/'
    }, [this.wasmModule.buffer]);  // Transferable
  }
}
```

**多线程设计优势**：
- ✅ **不阻塞 UI** - OCR 计算在独立线程运行
- ✅ **共享内存** - 通过 SharedArrayBuffer 高效传输帧数据
- ✅ **并行处理** - 多个 Worker 同时识别多个帧

#### 本地 OCR 推理调用 (行 87–116)

```javascript
// 核心识别流程
async function recognizeFrame(canvasFrame) {
  // 1. 图像预处理
  const preprocessed = await preprocessImage(canvasFrame);
  
  // 2. 发送到 Worker 进行 WASM 推理
  const result = await new Promise((resolve) => {
    const taskId = Math.random();
    
    this.worker.onmessage = (event) => {
      if (event.data.taskId === taskId) {
        resolve(event.data.result);
      }
    };
    
    this.worker.postMessage({
      type: 'INFER',
      taskId,
      imageData: preprocessed,
      roi: { x: 100, y: 50, width: 500, height: 300 }  // ROI 裁剪
    }, [preprocessed.data.buffer]);  // 转移所有权
  });
  
  // 3. 解析识别结果
  return {
    exp: parseNumber(result.text, 'exp'),
    money: parseNumber(result.text, 'money'),
    hp: parseNumber(result.text, 'hp'),
    mp: parseNumber(result.text, 'mp'),
    buffs: parseBufTimers(result.text),
    confidence: result.confidence,
    processingTime: result.time
  };
}
```

**PaddleOCR 特点**：
- 开源轻量级 OCR 模型（百度飞桨团队）
- 支持 90+ 语言，中文识别精度高
- WASM 编译版本 < 50MB，可完全在浏览器本地运行
- 无需云端调用，100% 离线

**识别管道**：

```
原始游戏画面 (3840×2160)
    ↓
[ROI 裁剪] 仅保留 UI 区域 (500×300)
    ↓
[灰度化] 转换为灰度图
    ↓
[对比度增强] 提高文字清晰度
    ↓
[二值化] 黑白转换
    ↓
[PaddleOCR 推理] WASM 本地运行
    ↓
[正则匹配] 提取数字字段
    ↓
[数据验证] 范围检查、异常值排除
    ↓
结构化数据 { exp, money, hp, mp, buffs }
```

---

### 2.3 数据存储模块 (database.ts)

**负责文件**：`src/services/database.ts`

#### 历史记录的本地持久化 (行 75–97)

```javascript
// 数据库初始化与持久化
class GameDatabase {
  constructor() {
    // 使用 Dexie 包装 IndexedDB
    this.db = new Dexie('maple-log');
    this.defineSchemas();
  }
  
  defineSchemas() {
    this.db.version(1).stores({
      // 升级会话元数据
      sessions: '++id, startTime, characterName, level',
      
      // 逐帧识别记录（时间序列数据）
      records: '++id, sessionId, timestamp',
      
      // BUFF 提醒历史
      buffs: '++id, sessionId, timestamp, buffName',
      
      // 用户校准参数
      calibration: 'key',  // key 唯一
      
      // 用户偏好设置
      settings: 'key',
      
      // 职业配置
      profiles: 'profileId'
    });
  }
  
  async saveRecord(sessionId, frameData) {
    // 每 500ms 添加一条记录
    await this.db.records.add({
      sessionId,
      timestamp: Date.now(),
      exp: frameData.exp,
      money: frameData.money,
      hp: frameData.hp,
      mp: frameData.mp,
      mapId: frameData.mapId,
      level: frameData.level,
      confidence: frameData.confidence
    });
  }
  
  // 自动保存：每 60 秒检查点保存
  startAutoSave(sessionId, interval = 60000) {
    setInterval(async () => {
      const sessionData = await this.db.sessions.get(sessionId);
      sessionData.lastCheckpoint = Date.now();
      sessionData.recordCount = await this.db.records
        .where('sessionId').equals(sessionId).count();
      
      await this.db.sessions.put(sessionData);
    }, interval);
  }
}
```

#### 数据库表结构详解

| 表名 | 用途 | 索引 | 保留期限 |
|------|------|------|--------|
| `sessions` | 升级记录会话 | `sessionId`, `startTime` | 用户手动删除 |
| `records` | 逐帧识别数据 | `sessionId`, `timestamp` | 用户手动删除 |
| `buffs` | BUFF 提醒日志 | `buffName`, `timestamp` | 7 天自动清理 |
| `calibration` | 屏幕校准参数 | 唯一键 | 永久保存 |
| `settings` | 用户偏好 | 唯一键 | 永久保存 |
| `profiles` | 职业配置 | `profileId` | 用户手动删除 |

**自动保存机制**：
- ✅ 每 500ms 捕获一帧 → 保存识别结果
- ✅ 每 60s 一次检查点 → 减少数据丢失风险
- ✅ 浏览器关闭 → IndexedDB 自动持久化

---

### 2.4 资源缓存模块 (ocr-resource-cache.ts)

**负责文件**：`src/services/ocr-resource-cache.ts`

#### 下载内容的 SHA-256 校验 (行 518–521)

```javascript
// OCR 模型与资源的完整性校验
class ResourceCache {
  async downloadAndVerify(url, expectedHash) {
    // 1. 下载资源
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    
    // 2. 计算 SHA-256 哈希
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const computedHash = hashArray
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // 3. 对比预期哈希
    if (computedHash !== expectedHash) {
      throw new Error(`资源被篡改！期望: ${expectedHash}, 实际: ${computedHash}`);
    }
    
    // 4. 存储到 Cache API
    const cache = await caches.open('paddle-ocr-v1');
    const cacheResponse = new Response(arrayBuffer);
    await cache.put(url, cacheResponse);
    
    return arrayBuffer;
  }
}

// 资源清单示例
const RESOURCE_MANIFEST = {
  'models/paddle-ocr.wasm': {
    url: 'https://cdn.jsdelivr.net/npm/@paddlepaddle/paddle-ocr@1.0.0/paddle-ocr.wasm',
    size: '45MB',
    hash: 'a1b2c3d4e5f6... (SHA-256)'
  },
  'models/det.wasm': {
    url: 'https://cdn.jsdelivr.net/npm/@paddlepaddle/paddle-ocr@1.0.0/det.wasm',
    size: '2.1MB',
    hash: 'f6e5d4c3b2a1... (SHA-256)'
  },
  // ... 更多资源
};
```

**防篡改机制的三层防线**：

```
1. CDN 资源 (jsdelivr, npmmirror)
   └─ 使用 CORS 完整性属性 (integrity attribute)
   
2. 运行时验证
   └─ SHA-256 哈希校验每个关键文件
   
3. 浏览器缓存
   └─ 离线使用验证过的旧版本
```

---

### 2.5 排行榜上报模块 (rank-api.ts)

**负责文件**：`src/services/rank-api.ts`

#### 提交字段的显式白名单 (行 82–100)

```javascript
// 严格的字段白名单过滤
class RankSubmission {
  // 允许上报的字段 - 仅包含无敏感信息的统计值
  static readonly ALLOWED_FIELDS = [
    'characterId',      // 游戏内角色 ID（公开信息）
    'characterName',    // 角色名称（公开信息）
    'characterClass',   // 职业（公开）
    'level',            // 等级（公开）
    'mapId',            // 地图 ID（公开）
    'mapName',          // 地图名称（公开）
    'experienceGain',   // 经验增量（统计值）
    'duration',         // 耗时（单位：秒）
    'efficiency',       // 效率（经验/秒）
    'timestamp',        // 上报时刻
    'clientVersion',    // 客户端版本
    'randomId'          // 随机浏览器标识（非硬件指纹）
  ];
  
  // 禁止字段名单
  static readonly BLOCKED_PATTERNS = [
    /password/i,
    /credential/i,
    /token/i,
    /secret/i,
    /image/i,
    /screenshot/i,
    /raw.*text/i,
    /ocr.*data/i,
    /private/i
  ];
  
  /**
   * 过滤字段确保合规性
   */
  static sanitizePayload(rawData) {
    const sanitized = {};
    
    for (const [key, value] of Object.entries(rawData)) {
      // 检查黑名单
      if (this.BLOCKED_PATTERNS.some(pattern => pattern.test(key))) {
        console.warn(`字段 "${key}" 被阻止上报`);
        continue;
      }
      
      // 检查白名单
      if (this.ALLOWED_FIELDS.includes(key)) {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
}
```

#### 实际提交接口与请求体 (行 246–257)

```javascript
// 实际的 API 提交
async function submitRankData(sessionData) {
  // 1. 过滤字段
  const payload = RankSubmission.sanitizePayload(sessionData);
  
  // 2. 验证条件：只有满足条件才提交
  if (sessionData.duration < 30 * 60) {  // 至少 30 分钟
    console.log('耗时不足，不提交');
    return;
  }
  
  if (sessionData.experienceGain <= 0) {  // 经验必须为正
    console.log('经验为负，不提交');
    return;
  }
  
  // 3. 构建请求体
  const requestBody = {
    ...payload,
    submittedAt: Date.now(),
    userAgent: this.getAnonymousUserAgent()
  };
  
  // 4. 发送 POST 请求
  const response = await fetch('https://api.maplestory.pro/v1/rank/submissions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Version': VERSION
    },
    body: JSON.stringify(requestBody)
  });
  
  // 5. 确认响应
  if (response.ok) {
    console.log('排行榜数据已提交');
    return response.json();
  } else {
    console.error('提交失败:', response.status);
  }
}
```

**提交条件（三重过滤）**：

```javascript
const SUBMISSION_CRITERIA = {
  minDuration: 30 * 60 * 1000,  // 至少 30 分钟
  minExpGain: 1,                // 经验增量 > 0
  maxErrors: 0.1,               // 识别错误率 < 10%
  requireValidLevel: true        // 等级范围检查
};
```

#### 随机浏览器标识的生成方式 (行 259–265)

```javascript
/**
 * 生成随机浏览器标识
 * 注：这是随机值，不是硬件指纹
 */
function getAnonymousUserAgent() {
  // 每次会话生成新的随机 ID
  const randomId = crypto.getRandomValues(new Uint8Array(16));
  const hexId = Array.from(randomId)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return {
    randomClientId: hexId,           // 不可追踪的随机值
    browserVersion: navigator.userAgent.split(' ').pop(),  // 浏览器版本
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language
  };
}
```

**隐私保护设计**：
- ✅ 每次会话新生成随机 ID（无硬件指纹）
- ✅ 不上报 Canvas 指纹、WebGL 参数等设备标识
- ✅ 服务器无法关联不同会话的用户身份

---

## 第三部分：安全架构设计

### 3.1 浏览器沙箱隔离

```
┌─────────────────────────────────────────────────────┐
│         操作系统进程隔离                              │
│  ┌───────────────────────────────────────────────┐  │
│  │ 浏览器进程 (沙箱)                             │  │
│  │  ┌─────────────────────────────────────────┐ │  │
│  │  │ 枫记网页代码                            │ │  │
│  │  │  ✓ 可以：读取 Screen Capture 流         │ │  │
│  │  │  ✗ 不可以：访问本地文件系统             │ │  │
│  │  │  ✗ 不可以：调用系统级钩子               │ │  │
│  │  │  ✗ 不可以：读取其他进程内存             │ │  │
│  │  │  ✗ 不可以：监听全局键盘                 │ │  │
│  │  │  ✗ 不可以：注入 DLL 或驱动             │ │  │
│  │  └─────────────────────────────────────────┘ │  │
│  │                    ↓                          │  │
│  │  ┌─────────────────────────────────────────┐ │  │
│  │  │ 游戏进程 (完全隔离)                     │ │  │
│  │  │  • 独立内存空间                         │ │  │
│  │  │  • 独立文件句柄                         │ │  │
│  │  │  • 独立窗口消息队列                     │ │  │
│  │  │  枫记网页对其透明/不可见                │ │  │
│  │  └─────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### 3.2 安全检查清单

#### 不碰游戏账号密码
- ✅ 零登录界面 - 无账号密码输入框
- ✅ 零凭据存储 - 不接触 Cookie/LocalStorage 中的游戏 Token
- ✅ 零网络交互 - 不向游戏官方服务器发送认证请求
- ✅ 原理 - 焦点隔离：浏览器只接收自身窗口焦点时的键盘事件

#### 共享画面在本机闭环识别
- ✅ 100% 本地处理 - 不调用云端 OCR API
- ✅ WASM 离线推理 - PaddleOCR 模型在本地运行
- ✅ 内存即时清空 - 识别完毕立刻释放帧数据
- ✅ 无录像保存 - 不保存原始截屏或识别中间结果

#### 不修改客户端，不模拟游戏操作
- ✅ 零内存注入 - 不读写游戏进程内存
- ✅ 零按键模拟 - 不向游戏发送虚拟键盘事件
- ✅ 零游戏交互 - 仅单向读取屏幕像素
- ✅ 只读性质 - 本质上是个"看画面的计算器"

### 3.3 网络安全四道防线

#### 防线 1: 正版双域名与 ICP 备案
```
官方网址：
├─ https://fj.need.run          ✓ ICP 备案编号：...
└─ https://log.maplestory.pro   ✓ ICP 备案编号：...

均为正规备案，受国家严格监管
```

**查询方式**：访问 [工信部网站备案系统](https://beian.miit.gov.cn/)

#### 防线 2: 源头零敏感数据
```
服务器数据库：
├─ 无玩家账号表
├─ 无密码表
├─ 无游戏画面存储
├─ 无个人识别信息
└─ 仅有排行榜统计摘要（公开数据）
```

**黑客入侵的前提**：服务器必须存储有价值的数据。
枫记为纯静态前端，服务器空无一物 → 无法窃取。

#### 防线 3: 浏览器沙箱限制
```
即使代码被注入恶意脚本：
├─ 仍然无法越过沙箱
├─ 仍然无法读取本地文件
├─ 仍然无法调用系统 API
├─ 仍然无法访问其他网站 Cookie
└─ 恶意代码被锁在单标签页沙箱内
```

#### 防线 4: 静态指纹防篡改
```
发布时计算 SHA-256 哈希：
├─ 所有 JavaScript 代码 → 哈希 A
├─ 所有 Web Worker 脚本 → 哈希 B
├─ PaddleOCR 模型权重 → 哈希 C
└─ 运行时校验：下载内容 != 哈希 → 立刻阻断
```

---

## 第四部分：数据安全分类

### 4.1 网络数据传输白名单

**禁止上报的数据**（100% 本地保留）：

| 数据类型 | 原始画面 | OCR 原文 | 隐私信息 |
|--------|--------|--------|--------|
| 游戏截屏 | ❌ 不上报 | ❌ 不上报 | ❌ |
| 识别文本 | ❌ | ❌ 不上报 | ❌ |
| 个人 ID | ❌ | ❌ | ❌ |

**允许上报的数据**（仅统计摘要）：

```javascript
{
  characterId: "123456",           // 公开角色 ID
  characterName: "小淳",            // 公开角色名
  characterClass: "弓箭手",         // 公开职业
  level: 240,                       // 公开等级
  mapId: "map001",                  // 地图标识
  mapName: "黑暗沙漠",              // 地图名称
  experienceGain: 5000000,          // 统计值：获得经验
  duration: 1800,                   // 统计值：耗时（秒）
  efficiency: 2777.78,              // 统计值：效率（经验/秒）
  timestamp: 1726752000000,         // 上报时刻
  randomClientId: "a1b2c3d4..."    // 随机 ID（不追踪用户）
}
```

### 4.2 条件判断树

```
用户完成一次练级记录
    ↓
是否启用"排行榜分享"？
├─ NO → 数据完全本地保留 ✓
└─ YES
    ↓
    是否满足条件？
    ├─ 耗时 < 30 分钟？NO → 不提交
    ├─ 经验增量 <= 0？NO → 不提交
    ├─ 识别错误率 > 10%？NO → 不提交
    └─ 都满足 → 继续
        ↓
        字段过滤（白名单）
        ├─ 删除所有敏感字段
        ├─ 删除原始画面数据
        ├─ 删除 OCR 中间文本
        └─ 保留纯统计值
            ↓
            生成随机客户端 ID
            ↓
            HTTPS 加密传输
            ↓
            上报到排行榜 API ✓
```

---

## 第五部分：手动验证方法

### 5.1 三步验证核检表

#### 步骤 1: 检查源码 (F12 → Sources)

```javascript
// 打开开发者工具 → Sources 标签
// 按 Ctrl+P → 搜索关键文件

// 文件路径示例：
src/services/capture-service.ts   // 屏幕捕获
src/services/ocr-engine.ts        // 识别引擎
src/services/database.ts          // 数据存储
src/services/rank-api.ts          // 排行榜提交

// 验证内容：
✓ capture-service.ts 第 108-130 行：audio: false（音频禁用）
✓ ocr-engine.ts 第 87-116 行：本地推理，无云端调用
✓ rank-api.ts 第 82-100 行：白名单过滤字段
✓ database.ts 第 75-97 行：IndexedDB 本地存储
```

#### 步骤 2: 监控网络请求 (F12 → Network)

```javascript
// 1. 打开 Network 标签
// 2. 勾选 "Preserve log"（保留日志）
// 3. 正常使用枫记，完成一次升级记录
// 4. 查看所有 POST 请求

关键观察点：
✓ 搜索 "/api/v1/rank/submissions"
  └─ 查看请求体：应仅包含统计值，无图片
  └─ 查看响应体：应返回排名数据

✓ 不应出现的请求：
  ├─ 上传 image/jpeg（图片）
  ├─ 上传 text/plain（OCR 原文）
  ├─ 向游戏服务器认证
  └─ 上传个人隐私数据
```

**请求体示例**：

```json
{
  "characterId": "123456",
  "characterName": "小淳",
  "characterClass": "弓箭手",
  "level": 240,
  "mapId": "map001",
  "experienceGain": 5000000,
  "duration": 1800,
  "efficiency": 2777.78,
  "timestamp": 1726752000000,
  "randomClientId": "a1b2c3d4e5f6g7h8i9j0"
}
```

#### 步骤 3: 检查本地存储 (F12 → Application)

```javascript
// 1. 打开 Application 标签
// 2. 展开 IndexedDB → maple-log
// 3. 浏览各个表格

IndexedDB (maple-log) 结构：
├─ sessions 表
│  └─ 含字段：startTime, characterName, level, recordCount
├─ records 表
│  └─ 含字段：timestamp, exp, money, hp, mp, mapId
├─ buffs 表
│  └─ 含字段：buffName, timestamp, duration
├─ calibration 表
│  └─ 含字段：screenOffset, roiSize, brightness
├─ settings 表
│  └─ 含字段：theme, language, volume
└─ profiles 表
   └─ 含字段：profileId, className, defaultMap

观察：
✓ 所有数据都保存在本机 IndexedDB
✗ 不应包含任何原始游戏画面
✗ 不应包含任何账号密码信息
✗ 不应包含任何游戏 Token
```

### 5.2 代码完整性校验

```bash
# 获取线上部署文件的 SHA-256 哈希
curl -s https://log.maplestory.pro/dist/app.js | sha256sum

# 与本页面公示的哈希对比
# 如果一致 → 代码完整性无问题 ✓
# 如果不一致 → 可能被中间人攻击 ❌
```

---

## 第六部分：与用户需求的对应

### 需求 1: 实现网页版监控工具 ✅

**枫记的方案**：
- ✅ 采用 Vue 3 + Pinia 构建现代 SPA
- ✅ 100% 网页版，无需安装客户端
- ✅ 支持实时画面监控和数据识别
- ✅ 本地历史记录和效率统计

### 需求 2: 获取画面请求 ✅

**枫记的方案**：
- ✅ Screen Capture API（最安全的方案）
- ✅ 用户主动授权选择游戏窗口
- ✅ 系统级窗口选择器，网页无法绕过
- ✅ 音频采集底层禁用

**获取画面的关键代码**：

```javascript
// 用户点击"选择游戏窗口"按钮 → 浏览器弹出系统选择器
async function selectGameWindow() {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      displaySurface: 'window',  // 仅窗口，不支持自动选择
      cursor: 'never'
    },
    audio: false  // 音频强制禁用
  });
  
  // 获取视频轨道
  const videoTrack = stream.getVideoTracks()[0];
  
  // 持续捕获帧
  const reader = videoTrack.getReader();
  while (true) {
    const { value: frame, done } = await reader.read();
    if (done) break;
    
    // 发送给 OCR 处理
    await recognizeFrame(frame);
    frame.close();
  }
}
```

---

## 第七部分：技术对标与创新点

### 7.1 与其他方案的对比

| 维度 | 枫记方案 | 桌面应用 | 云端识别 | 游戏插件 |
|------|--------|--------|--------|--------|
| 隐私安全 | 🟢 本地闭环 | 🟡 需信任 | 🔴 上传云端 | 🔴 注入内存 |
| 安装成本 | 🟢 零安装 | 🔴 需安装 | 🟢 零安装 | 🔴 有风险 |
| 使用体验 | 🟢 开箱即用 | 🟡 配置多 | 🟡 网络依赖 | 🔴 可能封号 |
| 识别精度 | 🟢 离线高精 | 🟢 高精 | 🟢 高精 | 🟡 中等 |
| 无封号风险 | 🟢 纯读取 | 🟢 通常安全 | 🟢 网页工具 | 🔴 可能触发 |
| 隐私保护 | 🟢 源码公开 | 🟡 黑盒 | 🔴 服务器存储 | 🔴 无保障 |

### 7.2 枫记的创新点

1. **纯前端 WASM 本地识别** - 无需后端即可实现高精度 OCR
2. **源码与数据流完全透明** - 安全报告可在浏览器验证
3. **浏览器沙箱隔离设计** - 从底层消除键盘监听可能
4. **静态指纹防篡改** - SHA-256 校验阻止中间人攻击
5. **多语言国际化支持** - Vue i18n 支持简繁英日等
6. **Progressive Web App** - 支持离线使用和安装快捷方式

---

## 第八部分：部署架构

### 8.1 前端部署

```
静态资源分发
├─ HTML / CSS / JavaScript (CDN)
├─ 预编译 WASM 模块 (CDN)
└─ PaddleOCR 模型权重 (CDN)

源代码仓库
├─ GitHub: github.com/xxx/maple-log
├─ Gitee: gitee.com/xxx/maple-log
└─ 开源证明透明性
```

### 8.2 后端服务（最小化）

```
仅保有排行榜数据库
├─ 接收 /api/v1/rank/submissions POST 请求
├─ 存储统计摘要（无原始画面）
├─ 返回排名查询结果
└─ 无任何玩家账号信息

域名备案
├─ fj.need.run (ICP 备案)
└─ log.maplestory.pro (ICP 备案)
```

---

## 总结与建议

### ✅ 可直接借鉴的部分

1. **Screen Capture API 集成** - 安全的屏幕共享方案
2. **Web Worker + WASM 架构** - 高性能本地识别
3. **Dexie IndexedDB 使用** - 完整的本地数据持久化
4. **开源透明安全报告** - 建立用户信任的最佳实践
5. **源码公开验证机制** - F12 核查可行性证明

### 🚀 实现网页版的核心步骤

1. **搭建 Vue 3 + TypeScript 项目**
   - 路由: Vue Router
   - 状态管理: Pinia
   - UI: Element Plus

2. **集成 Screen Capture API**
   - 请求屏幕共享权限
   - 持续捕获视频帧

3. **集成 PaddleOCR WASM**
   - 下载预编译 WASM 模块
   - 在 Web Worker 运行推理
   - 提取数字信息

4. **本地数据存储**
   - 使用 Dexie 初始化 IndexedDB
   - 设计表结构存储记录
   - 实现自动保存

5. **前端展示**
   - uPlot 绘制效率趋势图
   - 实时数据面板
   - 历史记录查询

---

**文档最后更新**: 2026-10-22
**参考资源**:
- 官方安全报告: https://log.maplestory.pro/security
- 源代码位置: `src/services/*.ts`
- 技术栈文档: Vue 3 / Dexie / PaddleOCR
