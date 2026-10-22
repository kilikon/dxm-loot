import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '@/services/database'
import type { GameSession, GameRecord } from '@/services/database'

export const useGameStore = defineStore('game', () => {
  // 状态
  const currentSession = ref<GameSession | null>(null)
  const sessions = ref<GameSession[]>([])
  const currentRecords = ref<GameRecord[]>([])
  const isMonitoring = ref(false)
  const totalExpGain = ref(0)
  const totalDuration = ref(0)
  const currentEfficiency = ref(0)

  // 计算属性
  const sessionCount = computed(() => sessions.value.length)
  const averageEfficiency = computed(() => {
    if (sessions.value.length === 0) return 0
    const total = sessions.value.reduce((sum, s) => sum + s.efficiency, 0)
    return (total / sessions.value.length).toFixed(2)
  })

  // 方法
  const startSession = async (characterName: string, characterClass: string, level: number) => {
    const sessionId = await db.createSession({
      characterName,
      characterClass,
      level,
      startTime: Date.now(),
      totalExp: 0,
      totalMoney: 0,
      duration: 0,
      efficiency: 0,
      mapStats: {}
    })

    currentSession.value = {
      id: sessionId,
      characterName,
      characterClass,
      level,
      startTime: Date.now(),
      totalExp: 0,
      totalMoney: 0,
      duration: 0,
      efficiency: 0,
      mapStats: {}
    }

    isMonitoring.value = true
    totalExpGain.value = 0
    totalDuration.value = 0
    currentEfficiency.value = 0

    return sessionId
  }

  const addRecord = async (record: Omit<GameRecord, 'id'>) => {
    if (!currentSession.value?.id) return

    const recordId = await db.saveRecord(record)
    currentRecords.value.push({
      ...record,
      id: recordId
    })

    // 实时更新统计
    totalExpGain.value = record.exp - (currentRecords.value[0]?.exp || 0)
    totalDuration.value = (Date.now() - (currentSession.value.startTime || Date.now())) / 1000
    currentEfficiency.value = totalExpGain.value / totalDuration.value
  }

  const endSession = async () => {
    if (!currentSession.value?.id) return

    const endTime = Date.now()
    const duration = (endTime - currentSession.value.startTime) / 1000

    await db.updateSessionStats(currentSession.value.id, {
      endTime,
      duration,
      totalExp: totalExpGain.value,
      efficiency: currentEfficiency.value
    })

    isMonitoring.value = false
    await loadSessions()
  }

  const loadSessions = async () => {
    const allSessions = await db.sessions.toArray()
    sessions.value = allSessions
  }

  const loadSessionRecords = async (sessionId: number) => {
    const records = await db.getSessionRecords(sessionId)
    currentRecords.value = records
  }

  const deleteSession = async (sessionId: number) => {
    await db.deleteSession(sessionId)
    await loadSessions()
  }

  const clearAllData = async () => {
    await db.clearAllData()
    sessions.value = []
    currentRecords.value = []
    currentSession.value = null
    isMonitoring.value = false
  }

  return {
    // 状态
    currentSession,
    sessions,
    currentRecords,
    isMonitoring,
    totalExpGain,
    totalDuration,
    currentEfficiency,

    // 计算属性
    sessionCount,
    averageEfficiency,

    // 方法
    startSession,
    addRecord,
    endSession,
    loadSessions,
    loadSessionRecords,
    deleteSession,
    clearAllData
  }
})
