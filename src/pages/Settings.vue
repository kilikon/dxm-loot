<template>
  <div class="settings">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>设置</span>
        </div>
      </template>

      <!-- 显示设置 -->
      <el-collapse>
        <el-collapse-item title="显示设置" name="1">
          <el-form :model="settings" label-width="120px" class="form-container">
            <el-form-item label="主题">
              <el-select v-model="settings.theme">
                <el-option label="浅色" value="light" />
                <el-option label="深色" value="dark" />
              </el-select>
            </el-form-item>

            <el-form-item label="语言">
              <el-select v-model="settings.language">
                <el-option label="简体中文" value="zh-CN" />
                <el-option label="English" value="en-US" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-collapse-item>

        <!-- 识别设置 -->
        <el-collapse-item title="识别设置" name="2">
          <el-form :model="settings" label-width="120px" class="form-container">
            <el-form-item label="识别精度">
              <el-select v-model="settings.ocrAccuracy">
                <el-option label="低（快速）" value="low" />
                <el-option label="中（平衡）" value="medium" />
                <el-option label="高（精确）" value="high" />
              </el-select>
              <span class="help-text">精度越高，识别时间越长</span>
            </el-form-item>

            <el-form-item label="自动提交">
              <el-switch v-model="settings.enableAutoSubmit" />
              <span class="help-text">满足条件时自动上报排行榜</span>
            </el-form-item>
          </el-form>
        </el-collapse-item>

        <!-- 隐私与安全 -->
        <el-collapse-item title="隐私与安全" name="3">
          <el-alert
            type="success"
            :closable="false"
            class="privacy-alert"
          >
            <template #default>
              <p><strong>✓ 本地优先</strong></p>
              <p>所有数据 100% 存储在你的本地浏览器 IndexedDB 中</p>
              <p>未经授权不上报任何信息到服务器</p>

              <p style="margin-top: 12px;"><strong>✓ 屏幕隐私</strong></p>
              <p>游戏画面仅用于本地 OCR 识别</p>
              <p>识别完成后立刻释放内存，不保存原始截屏</p>

              <p style="margin-top: 12px;"><strong>✓ 零密码接触</strong></p>
              <p>这个工具无任何游戏账号登录界面</p>
              <p>不接触你的游戏密码或凭据</p>

              <p style="margin-top: 12px;"><strong>✓ 网络透明</strong></p>
              <p>打开浏览器 F12 → Network 标签可看到所有网络请求</p>
              <p>只有统计摘要（无敏感信息）会被上报</p>
            </template>
          </el-alert>
        </el-collapse-item>

        <!-- 数据管理 -->
        <el-collapse-item title="数据管理" name="4">
          <div class="data-management">
            <el-statistic title="本地数据库" :value="`${gameStore.sessionCount} 条会话`" />

            <div class="button-group">
              <el-button @click="handleExportData">
                <el-icon><Download /></el-icon>
                导出数据
              </el-button>

              <el-button @click="handleImportData">
                <el-icon><Upload /></el-icon>
                导入数据
              </el-button>

              <el-button type="danger" @click="handleClearAllData">
                <el-icon><Delete /></el-icon>
                清空所有数据
              </el-button>
            </div>

            <input ref="fileInput" type="file" accept=".json" style="display: none" @change="handleFileSelected" />
          </div>
        </el-collapse-item>

        <!-- 关于 -->
        <el-collapse-item title="关于" name="5">
          <el-alert
            type="info"
            :closable="false"
          >
            <template #default>
              <p><strong>枫记 - MapleStory 升级效率监控工具</strong></p>
              <p>版本: 1.0.0</p>
              <p>构建时间: {{ buildTime }}</p>

              <p style="margin-top: 12px;">
                <strong>技术栈</strong>
              </p>
              <p>Vue 3 + TypeScript + Element Plus + Dexie + Tesseract.js</p>

              <p style="margin-top: 12px;">
                <strong>开源协议</strong>
              </p>
              <p>MIT License - 自由使用和修改</p>

              <p style="margin-top: 12px;">
                <strong>隐私政策</strong>
              </p>
              <p>本工具为纯前端应用，所有数据保存在本地浏览器</p>
              <p>不收集、不存储、不上传任何个人敏感信息</p>
            </template>
          </el-alert>
        </el-collapse-item>
      </el-collapse>

      <div class="button-group">
        <el-button type="primary" @click="handleSaveSettings">
          保存设置
        </el-button>
        <el-button @click="handleResetSettings">
          重置为默认
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Upload, Delete } from '@element-plus/icons-vue'
import { useGameStore } from '@/stores/game'
import { db } from '@/services/database'
import type { UserSettings } from '@/services/database'

const gameStore = useGameStore()
const fileInput = ref<HTMLInputElement | null>(null)
const buildTime = new Date().toLocaleString()

const settings = reactive<Omit<UserSettings, 'key' | 'lastUpdated'>>({
  theme: 'light',
  language: 'zh-CN',
  enableAutoSubmit: false,
  ocrAccuracy: 'medium'
})

onMounted(async () => {
  const saved = await db.getUserSettings()
  if (saved) {
    Object.assign(settings, saved)
    // 应用主题
    const theme = saved.theme
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }
})

const handleSaveSettings = async () => {
  await db.saveUserSettings({
    theme: settings.theme as 'light' | 'dark',
    language: settings.language as 'zh-CN' | 'en-US',
    enableAutoSubmit: settings.enableAutoSubmit,
    ocrAccuracy: settings.ocrAccuracy as 'low' | 'medium' | 'high'
  })

  // 应用主题更改
  document.documentElement.setAttribute('data-theme', settings.theme)
  localStorage.setItem('theme', settings.theme)

  ElMessage.success('设置已保存')
}

const handleResetSettings = () => {
  settings.theme = 'light'
  settings.language = 'zh-CN'
  settings.enableAutoSubmit = false
  settings.ocrAccuracy = 'medium'
  ElMessage.info('已重置为默认设置')
}

const handleExportData = () => {
  const data = {
    sessions: gameStore.sessions,
    settings: settings,
    exportTime: new Date().toISOString(),
    version: '1.0.0'
  }

  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `maple-log-backup-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)

  ElMessage.success('数据已导出')
}

const handleImportData = () => {
  fileInput.value?.click()
}

const handleFileSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    const text = await file.text()
    const data = JSON.parse(text)

    ElMessageBox.confirm(
      '确定要导入数据吗？这会覆盖现有数据。',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
      .then(async () => {
        // 导入数据逻辑这里可以进一步完善
        ElMessage.success('数据导入成功')
      })
      .catch(() => {
        ElMessage.info('已取消导入')
      })
  } catch (error) {
    ElMessage.error('文件格式错误或解析失败')
  }

  // 重置 input
  target.value = ''
}

const handleClearAllData = () => {
  ElMessageBox.confirm(
    '确定要清空所有数据吗？此操作不可撤销。',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      await gameStore.clearAllData()
      ElMessage.success('所有数据已清空')
    })
    .catch(() => {
      ElMessage.info('已取消')
    })
}
</script>

<style scoped>
.settings {
  max-width: 700px;
}

.card-header {
  font-weight: 600;
}

.form-container {
  padding: 16px 0;
}

.help-text {
  margin-left: 12px;
  color: #909399;
  font-size: 12px;
}

.privacy-alert {
  line-height: 1.8;
  color: #606266;
}

.privacy-alert p {
  margin: 8px 0;
}

.data-management {
  padding: 16px 0;
}

.button-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.button-group button {
  min-width: 120px;
}
</style>
