<template>
  <div class="history">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>历史记录</span>
          <el-button text type="danger" size="small" @click="handleExportData">
            导出数据
          </el-button>
        </div>
      </template>

      <el-empty v-if="gameStore.sessions.length === 0" description="暂无历史记录" />

      <el-timeline v-else>
        <el-timeline-item
          v-for="session in gameStore.sessions"
          :key="session.id"
          :timestamp="`${new Date(session.startTime).toLocaleString()}`"
          placement="top"
        >
          <el-card class="session-card">
            <div class="session-header">
              <h4>{{ session.characterName }} - {{ session.characterClass }}</h4>
              <el-tag>Lv. {{ session.level }}</el-tag>
            </div>

            <el-row :gutter="20" class="session-stats">
              <el-col :xs="12" :sm="6">
                <div class="stat">
                  <span class="label">耗时</span>
                  <span class="value">{{ formatTime(session.duration) }}</span>
                </div>
              </el-col>
              <el-col :xs="12" :sm="6">
                <div class="stat">
                  <span class="label">经验</span>
                  <span class="value">{{ formatNumber(session.totalExp) }}</span>
                </div>
              </el-col>
              <el-col :xs="12" :sm="6">
                <div class="stat">
                  <span class="label">金币</span>
                  <span class="value">{{ formatNumber(session.totalMoney) }}</span>
                </div>
              </el-col>
              <el-col :xs="12" :sm="6">
                <div class="stat">
                  <span class="label">效率</span>
                  <span class="value">{{ session.efficiency.toFixed(0) }}/s</span>
                </div>
              </el-col>
            </el-row>

            <div class="session-actions">
              <el-button text type="primary" size="small" @click="handleViewDetails(session)">
                查看详情
              </el-button>
              <el-button text type="danger" size="small" @click="handleDeleteSession(session.id!)">
                删除
              </el-button>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailsVisible" title="会话详情" width="80%">
      <el-table :data="gameStore.currentRecords" stripe max-height="400">
        <el-table-column prop="timestamp" label="时间" width="180">
          <template #default="{ row }">
            {{ new Date(row.timestamp).toLocaleTimeString() }}
          </template>
        </el-table-column>
        <el-table-column prop="exp" label="经验" width="120">
          <template #default="{ row }">
            {{ formatNumber(row.exp) }}
          </template>
        </el-table-column>
        <el-table-column prop="money" label="金币" width="120">
          <template #default="{ row }">
            {{ formatNumber(row.money) }}
          </template>
        </el-table-column>
        <el-table-column prop="hp" label="HP" width="80" />
        <el-table-column prop="mp" label="MP" width="80" />
        <el-table-column prop="level" label="等级" width="80" />
        <el-table-column prop="confidence" label="识别信度" width="100">
          <template #default="{ row }">
            {{ (row.confidence * 100).toFixed(0) }}%
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useGameStore } from '@/stores/game'
import type { GameSession } from '@/services/database'

const gameStore = useGameStore()
const detailsVisible = ref(false)

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

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

const handleViewDetails = async (session: GameSession) => {
  if (!session.id) return
  await gameStore.loadSessionRecords(session.id)
  detailsVisible.value = true
}

const handleDeleteSession = (sessionId: number) => {
  ElMessageBox.confirm(
    '确定要删除这条记录吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      await gameStore.deleteSession(sessionId)
      ElMessage.success('已删除')
    })
    .catch(() => {
      ElMessage.info('已取消')
    })
}

const handleExportData = () => {
  const data = {
    sessions: gameStore.sessions,
    records: gameStore.currentRecords,
    exportTime: new Date().toISOString()
  }

  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `maple-log-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)

  ElMessage.success('数据已导出')
}
</script>

<style scoped>
.history {
  max-width: 900px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.session-card {
  margin-bottom: 12px;
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.session-header h4 {
  margin: 0;
  color: #303133;
}

.session-stats {
  margin: 12px 0;
  padding: 12px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
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

.session-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}
</style>
