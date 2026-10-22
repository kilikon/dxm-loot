<template>
  <div class="dashboard">
    <!-- 欢迎提示 -->
    <el-alert
      v-if="!gameStore.isMonitoring"
      title="准备就绪"
      type="info"
      description="点击下方按钮选择游戏窗口并开始监控升级效率"
      :closable="false"
      class="welcome-alert"
    />

    <!-- 会话信息卡片 -->
    <el-row :gutter="20" class="info-section">
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <span>当前会话</span>
            </div>
          </template>
          <div v-if="gameStore.currentSession" class="stat-content">
            <div class="stat-item">
              <span class="label">角色</span>
              <span class="value">{{ gameStore.currentSession.characterName }}</span>
            </div>
            <div class="stat-item">
              <span class="label">职业</span>
              <span class="value">{{ gameStore.currentSession.characterClass }}</span>
            </div>
            <div class="stat-item">
              <span class="label">等级</span>
              <span class="value">Lv. {{ gameStore.currentSession.level }}</span>
            </div>
          </div>
          <div v-else class="empty-state">
            <p>暂无会话</p>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <span>经验统计</span>
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-item">
              <span class="label">总获取</span>
              <span class="value">{{ formatNumber(gameStore.totalExpGain) }}</span>
            </div>
            <div class="stat-item">
              <span class="label">耗时</span>
              <span class="value">{{ formatTime(gameStore.totalDuration) }}</span>
            </div>
            <div class="stat-item">
              <span class="label">效率</span>
              <span class="value">{{ gameStore.currentEfficiency.toFixed(0) }}/s</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <span>识别状态</span>
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-item">
              <span class="label">识别引擎</span>
              <el-tag :type="ocrState.isInitialized ? 'success' : 'info'">
                {{ ocrState.isInitialized ? '就绪' : '未初始化' }}
              </el-tag>
            </div>
            <div class="stat-item">
              <span class="label">屏幕共享</span>
              <el-tag :type="captureState.hasStream ? 'success' : 'info'">
                {{ captureState.hasStream ? '已连接' : '未连接' }}
              </el-tag>
            </div>
            <div class="stat-item">
              <span class="label">监控状态</span>
              <el-tag :type="gameStore.isMonitoring ? 'success' : 'warning'">
                {{ gameStore.isMonitoring ? '运行中' : '已停止' }}
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <span>统计数据</span>
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-item">
              <span class="label">总会话数</span>
              <span class="value">{{ gameStore.sessionCount }}</span>
            </div>
            <div class="stat-item">
              <span class="label">平均效率</span>
              <span class="value">{{ gameStore.averageEfficiency }}/s</span>
            </div>
            <div class="stat-item">
              <span class="label">记录条数</span>
              <span class="value">{{ gameStore.currentRecords.length }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 控制按钮区 -->
    <el-card class="control-section">
      <template #header>
        <div class="card-header">
          <span>控制面板</span>
        </div>
      </template>

      <el-form :model="sessionForm" label-width="100px" class="form-container">
        <el-form-item label="角色名">
          <el-input v-model="sessionForm.characterName" placeholder="输入角色名" />
        </el-form-item>
        <el-form-item label="职业">
          <el-select v-model="sessionForm.characterClass" placeholder="选择职业">
            <el-option label="战士" value="战士" />
            <el-option label="魔法师" value="魔法师" />
            <el-option label="弓箭手" value="弓箭手" />
            <el-option label="盗贼" value="盗贼" />
            <el-option label="海盗" value="海盗" />
          </el-select>
        </el-form-item>
        <el-form-item label="等级">
          <el-input-number v-model="sessionForm.level" :min="1" :max="300" />
        </el-form-item>
      </el-form>

      <div class="button-group">
        <el-button
          type="primary"
          size="large"
          @click="handleStartMonitoring"
          :disabled="gameStore.isMonitoring"
          :loading="isStarting"
        >
          <el-icon><VideoPlay /></el-icon>
          开始监控
        </el-button>

        <el-button
          type="warning"
          size="large"
          @click="handleStopMonitoring"
          :disabled="!gameStore.isMonitoring"
        >
          <el-icon><VideoPause /></el-icon>
          停止监控
        </el-button>

        <el-button
          type="danger"
          size="large"
          @click="handleClearData"
        >
          <el-icon><Delete /></el-icon>
          清空数据
        </el-button>
      </div>
    </el-card>

    <!-- 最近会话列表 -->
    <el-card class="history-section">
      <template #header>
        <div class="card-header">
          <span>最近会话</span>
        </div>
      </template>

      <el-table :data="gameStore.sessions.slice(-10)" stripe>
        <el-table-column prop="characterName" label="角色" width="120" />
        <el-table-column prop="characterClass" label="职业" width="100" />
        <el-table-column prop="level" label="等级" width="80" />
        <el-table-column label="耗时" width="100">
          <template #default="{ row }">
            {{ formatTime(row.duration) }}
          </template>
        </el-table-column>
        <el-table-column label="经验" width="150">
          <template #default="{ row }">
            {{ formatNumber(row.totalExp) }}
          </template>
        </el-table-column>
        <el-table-column label="效率" width="100">
          <template #default="{ row }">
            {{ row.efficiency.toFixed(0) }}/s
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              size="small"
              @click="() => gameStore.loadSessionRecords(row.id!)"
            >
              查看
            </el-button>
            <el-button
              link
              type="danger"
              size="small"
              @click="() => gameStore.deleteSession(row.id!)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { VideoPlay, VideoPause, Delete } from '@element-plus/icons-vue'
import { useGameStore } from '@/stores/game'
import { captureService } from '@/services/capture-service'
import { ocrEngine } from '@/services/ocr-engine'

const gameStore = useGameStore()
const isStarting = ref(false)

const sessionForm = reactive({
  characterName: '小淳',
  characterClass: '弓箭手',
  level: 240
})

const captureState = ref({
  hasStream: false,
  isCapturing: false
})

const ocrState = ref({
  isInitialized: false,
  isProcessing: false
})

// 初始化 OCR 引擎
onMounted(async () => {
  try {
    await ocrEngine.initialize()
    ocrState.value = ocrEngine.getState()
  } catch (error) {
    ElMessage.error('OCR 引擎初始化失败')
    console.error(error)
  }

  await gameStore.loadSessions()
})

// 清理资源
onUnmounted(() => {
  captureService.releaseStream()
})

// 格式化数字
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// 格式化时间
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  }
  return `${secs}s`
}

// 开始监控
const handleStartMonitoring = async () => {
  if (!sessionForm.characterName) {
    ElMessage.warning('请输入角色名')
    return
  }

  isStarting.value = true

  try {
    // 初始化会话
    const sessionId = await gameStore.startSession(
      sessionForm.characterName,
      sessionForm.characterClass,
      sessionForm.level
    )

    // 请求屏幕共享
    await captureService.requestScreenCapture({
      displaySurface: 'window'
    })

    captureState.value.hasStream = true
    ElMessage.success('屏幕共享已启动，开始监控中...')

    // 开始捕获帧
    captureService.startCapture(async (frame: ImageBitmap) => {
      try {
        const result = await ocrEngine.recognizeFrame(frame)

        // 保存记录
        await gameStore.addRecord({
          sessionId,
          timestamp: Date.now(),
          exp: result.exp,
          money: result.money,
          hp: result.hp,
          mp: result.mp,
          mapId: 'unknown',
          mapName: '未知地图',
          level: result.level,
          confidence: result.confidence
        })
      } catch (error) {
        console.error('识别失败:', error)
      }
    })
  } catch (error: any) {
    ElMessage.error(error.message || '启动监控失败')
    gameStore.isMonitoring = false
  } finally {
    isStarting.value = false
  }
}

// 停止监控
const handleStopMonitoring = async () => {
  captureService.stopCapture()
  captureService.releaseStream()
  await gameStore.endSession()
  captureState.value.hasStream = false

  ElMessage.success('监控已停止')
}

// 清空数据
const handleClearData = () => {
  ElMessageBox.confirm(
    '确定要清空所有历史数据吗？此操作不可撤销。',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      await gameStore.clearAllData()
      ElMessage.success('数据已清空')
    })
    .catch(() => {
      ElMessage.info('已取消')
    })
}
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.welcome-alert {
  margin-bottom: 20px;
}

.info-section {
  width: 100%;
}

.stat-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.stat-item:last-child {
  border-bottom: none;
}

.label {
  color: #909399;
  font-size: 12px;
}

.value {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.empty-state {
  text-align: center;
  color: #909399;
  padding: 20px 0;
}

.control-section {
  margin-top: 20px;
}

.form-container {
  margin-bottom: 20px;
}

.button-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.history-section {
  margin-top: 20px;
}

@media (max-width: 768px) {
  .button-group {
    flex-direction: column;
  }

  .stat-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
