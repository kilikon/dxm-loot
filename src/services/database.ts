import Dexie, { Table } from 'dexie'

export interface GameSession {
  id?: number
  characterName: string
  characterClass: string
  level: number
  startTime: number
  endTime?: number
  totalExp: number
  totalMoney: number
  duration: number // 秒
  efficiency: number // exp/sec
  mapStats: Record<string, { exp: number; time: number }>
}

export interface GameRecord {
  id?: number
  sessionId: number
  timestamp: number
  exp: number
  money: number
  hp: number
  mp: number
  mapId: string
  mapName: string
  level: number
  confidence: number
}

export interface BuffRecord {
  id?: number
  sessionId: number
  timestamp: number
  buffName: string
  duration: number
  isActive: boolean
}

export interface CalibrationData {
  key: 'calibration'
  screenOffsetX: number
  screenOffsetY: number
  roiWidth: number
  roiHeight: number
  brightness: number
  contrast: number
  lastUpdated: number
}

export interface UserSettings {
  key: string
  theme: 'light' | 'dark'
  language: 'zh-CN' | 'en-US'
  enableAutoSubmit: boolean
  ocrAccuracy: 'low' | 'medium' | 'high'
  lastUpdated: number
}

export class GameDatabase extends Dexie {
  sessions!: Table<GameSession>
  records!: Table<GameRecord>
  buffs!: Table<BuffRecord>
  calibration!: Table<CalibrationData>
  settings!: Table<UserSettings>

  constructor() {
    super('maple-log-db')
    this.version(1).stores({
      sessions: '++id, startTime, characterName',
      records: '++id, sessionId, timestamp',
      buffs: '++id, sessionId, timestamp, buffName',
      calibration: 'key',
      settings: 'key'
    })
  }

  // 创建新的会话
  async createSession(data: Omit<GameSession, 'id'>) {
    return this.sessions.add({
      ...data,
      startTime: Date.now(),
      mapStats: {}
    })
  }

  // 保存识别记录
  async saveRecord(record: Omit<GameRecord, 'id'>) {
    return this.records.add(record)
  }

  // 获取当前会话的所有记录
  async getSessionRecords(sessionId: number) {
    return this.records
      .where('sessionId')
      .equals(sessionId)
      .toArray()
  }

  // 更新会话统计
  async updateSessionStats(sessionId: number, stats: Partial<GameSession>) {
    return this.sessions.update(sessionId, stats)
  }

  // 获取校准数据
  async getCalibration(): Promise<CalibrationData | undefined> {
    return this.calibration.get('calibration')
  }

  // 保存校准数据
  async saveCalibration(data: Omit<CalibrationData, 'lastUpdated'>) {
    return this.calibration.put({
      ...data,
      key: 'calibration',
      lastUpdated: Date.now()
    })
  }

  // 获取用户设置
  async getUserSettings(): Promise<UserSettings | undefined> {
    return this.settings.get('settings')
  }

  // 保存用户设置
  async saveUserSettings(data: Omit<UserSettings, 'lastUpdated'>) {
    return this.settings.put({
      ...data,
      key: 'settings',
      lastUpdated: Date.now()
    })
  }

  // 删除会话及其所有记录
  async deleteSession(sessionId: number) {
    await this.records.where('sessionId').equals(sessionId).delete()
    await this.buffs.where('sessionId').equals(sessionId).delete()
    return this.sessions.delete(sessionId)
  }

  // 清空所有数据
  async clearAllData() {
    await Promise.all([
      this.sessions.clear(),
      this.records.clear(),
      this.buffs.clear()
    ])
  }
}

export const db = new GameDatabase()
