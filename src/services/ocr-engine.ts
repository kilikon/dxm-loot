/**
 * OCR 识别服务
 * 使用 Tesseract.js 进行本地离线文字识别
 */

import Tesseract from 'tesseract.js'

export interface RecognitionResult {
  exp: number
  money: number
  hp: number
  mp: number
  level: number
  confidence: number
  processingTime: number
  rawText: string
}

export class OCREngine {
  private worker: Tesseract.Worker | null = null
  private isInitialized = false
  private processingQueue: ImageBitmap[] = []
  private isProcessing = false

  /**
   * 初始化 OCR Worker
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      this.worker = await Tesseract.createWorker({
        logger: (m) => {
          if (m.status === 'recognizing') {
            console.log(`OCR 进度: ${Math.round(m.progress * 100)}%`)
          }
        }
      })

      await this.worker.loadLanguage('chi_sim')
      await this.worker.initialize('chi_sim')
      await this.worker.setParameters({
        tessedit_char_whitelist: '0123456789,.\\/+-'
      })

      this.isInitialized = true
      console.log('OCR 引擎初始化完成')
    } catch (error) {
      console.error('OCR 初始化失败:', error)
      throw error
    }
  }

  /**
   * 识别单个帧
   */
  async recognizeFrame(imageBitmap: ImageBitmap): Promise<RecognitionResult> {
    if (!this.worker || !this.isInitialized) {
      throw new Error('OCR 引擎未初始化')
    }

    const startTime = performance.now()

    try {
      // 转换 ImageBitmap 到 Canvas
      const canvas = document.createElement('canvas')
      canvas.width = imageBitmap.width
      canvas.height = imageBitmap.height

      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas 上下文获取失败')

      ctx.drawImage(imageBitmap, 0, 0)

      // 预处理：增强对比度和清晰度
      const processedCanvas = this.preprocessImage(canvas)

      // 执行 OCR 识别
      const result = await this.worker.recognize(processedCanvas)
      const text = result.data.text

      // 解析结果
      const parsed = this.parseGameData(text)

      const processingTime = performance.now() - startTime

      return {
        ...parsed,
        confidence: result.data.confidence,
        processingTime,
        rawText: text
      }
    } catch (error) {
      console.error('识别失败:', error)
      throw error
    }
  }

  /**
   * 图像预处理：增强对比度和清晰度
   */
  private preprocessImage(canvas: HTMLCanvasElement): HTMLCanvasElement {
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 上下文获取失败')

    // 获取图像数据
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // 转换为灰度并增强对比度
    for (let i = 0; i < data.length; i += 4) {
      // 计算灰度值
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114

      // 二值化处理（黑白转换）
      const threshold = 128
      const value = gray > threshold ? 255 : 0

      data[i] = value      // R
      data[i + 1] = value  // G
      data[i + 2] = value  // B
      // data[i + 3] 保持 Alpha 不变
    }

    ctx.putImageData(imageData, 0, 0)
    return canvas
  }

  /**
   * 解析游戏数据
   */
  private parseGameData(text: string): Omit<RecognitionResult, 'confidence' | 'processingTime' | 'rawText'> {
    // 提取经验值（示例格式：12345678）
    const expMatch = text.match(/\d+(?:,\d{3})*/g)
    let exp = 0
    if (expMatch) {
      exp = parseInt(expMatch[0].replace(/,/g, ''), 10)
    }

    // 提取金币（示例格式：98765432）
    const moneyMatch = text.match(/金币[:\s]*(\d+)/i)
    const money = moneyMatch ? parseInt(moneyMatch[1], 10) : 0

    // 提取 HP/MP
    const hpMatch = text.match(/HP[:\s]*(\d+)/i)
    const mpMatch = text.match(/MP[:\s]*(\d+)/i)
    const hp = hpMatch ? parseInt(hpMatch[1], 10) : 0
    const mp = mpMatch ? parseInt(mpMatch[1], 10) : 0

    // 提取等级
    const levelMatch = text.match(/Lv\.?\s*(\d+)/i)
    const level = levelMatch ? parseInt(levelMatch[1], 10) : 1

    return {
      exp: Math.max(0, exp),
      money: Math.max(0, money),
      hp: Math.max(0, hp),
      mp: Math.max(0, mp),
      level: Math.max(1, level)
    }
  }

  /**
   * 释放资源
   */
  async dispose(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate()
      this.worker = null
      this.isInitialized = false
    }
  }

  /**
   * 检查是否已初始化
   */
  getState(): {
    isInitialized: boolean
    isProcessing: boolean
  } {
    return {
      isInitialized: this.isInitialized,
      isProcessing: this.isProcessing
    }
  }
}

export const ocrEngine = new OCREngine()
