/**
 * 屏幕捕获服务
 * 使用 Screen Capture API 获取游戏窗口画面
 */

export interface CaptureOptions {
  displaySurface?: 'monitor' | 'window' | 'browser'
  cursor?: 'always' | 'motion' | 'never'
  frameRate?: number
}

export class ScreenCaptureService {
  private stream: MediaStream | null = null
  private videoTrack: MediaStreamVideoTrack | null = null
  private isCapturing = false
  private frameCallback: ((frame: ImageBitmap) => void) | null = null
  private animationFrameId: number | null = null

  /**
   * 请求屏幕共享权限并获取视频流
   */
  async requestScreenCapture(options: CaptureOptions = {}): Promise<MediaStream> {
    const constraints: DisplayMediaStreamOptions = {
      video: {
        displaySurface: options.displaySurface || 'window',
        cursor: options.cursor || 'never',
        frameRate: { ideal: options.frameRate || 30 }
      },
      audio: false // 音频强制禁用
    }

    try {
      this.stream = await navigator.mediaDevices.getDisplayMedia(constraints)
      this.videoTrack = this.stream.getVideoTracks()[0]

      // 监听用户停止共享
      this.videoTrack.onended = () => {
        this.stopCapture()
      }

      return this.stream
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        throw new Error('用户未授权屏幕共享')
      } else if (error.name === 'NotFoundError') {
        throw new Error('未找到屏幕捕获源')
      }
      throw error
    }
  }

  /**
   * 开始持续捕获帧
   */
  startCapture(onFrame: (frame: ImageBitmap) => void): void {
    if (!this.stream) {
      throw new Error('未初始化媒体流，请先调用 requestScreenCapture')
    }

    this.frameCallback = onFrame
    this.isCapturing = true
    this.captureFrame()
  }

  /**
   * 捕获单个帧并传给回调函数
   */
  private captureFrame = async (): Promise<void> => {
    if (!this.isCapturing || !this.frameCallback) return

    try {
      const video = document.createElement('video')
      video.srcObject = this.stream
      video.play()

      // 等待视频加载
      await new Promise(resolve => {
        const onCanPlay = () => {
          video.removeEventListener('canplay', onCanPlay)
          resolve(true)
        }
        video.addEventListener('canplay', onCanPlay)
      })

      // 使用 Canvas 转换为 ImageBitmap
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas 上下文获取失败')

      ctx.drawImage(video, 0, 0)

      const imageBitmap = await createImageBitmap(canvas)
      this.frameCallback(imageBitmap)

      video.pause()
    } catch (error) {
      console.error('帧捕获失败:', error)
    }

    // 下一帧
    this.animationFrameId = requestAnimationFrame(this.captureFrame)
  }

  /**
   * 停止捕获
   */
  stopCapture(): void {
    this.isCapturing = false

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
    }

    this.frameCallback = null
  }

  /**
   * 完全释放媒体资源
   */
  releaseStream(): void {
    this.stopCapture()

    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop()
      })
    }

    this.stream = null
    this.videoTrack = null
  }

  /**
   * 检查浏览器是否支持 Screen Capture API
   */
  static isSupported(): boolean {
    return !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getDisplayMedia
    )
  }

  /**
   * 获取当前流状态
   */
  getState(): {
    isCapturing: boolean
    hasStream: boolean
    videoTrack: MediaStreamVideoTrack | null
  } {
    return {
      isCapturing: this.isCapturing,
      hasStream: !!this.stream,
      videoTrack: this.videoTrack
    }
  }
}

export const captureService = new ScreenCaptureService()
