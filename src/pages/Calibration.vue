<template>
  <div class="calibration">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>识别校准</span>
        </div>
      </template>

      <el-alert
        title="校准说明"
        type="info"
        description="调整以下参数以优化 OCR 识别效果。这些设置仅影响识别范围，不影响屏幕共享权限。"
        :closable="false"
        class="calibration-alert"
      />

      <el-form :model="calibrationForm" label-width="120px" class="form-container">
        <el-form-item label="ROI 宽度">
          <el-input-number
            v-model="calibrationForm.roiWidth"
            :min="100"
            :max="1920"
            :step="10"
          />
          <span class="help-text">识别区域宽度（像素）</span>
        </el-form-item>

        <el-form-item label="ROI 高度">
          <el-input-number
            v-model="calibrationForm.roiHeight"
            :min="50"
            :max="1080"
            :step="10"
          />
          <span class="help-text">识别区域高度（像素）</span>
        </el-form-item>

        <el-form-item label="X 偏移">
          <el-input-number
            v-model="calibrationForm.screenOffsetX"
            :min="-1920"
            :max="1920"
            :step="5"
          />
          <span class="help-text">水平偏移量</span>
        </el-form-item>

        <el-form-item label="Y 偏移">
          <el-input-number
            v-model="calibrationForm.screenOffsetY"
            :min="-1080"
            :max="1080"
            :step="5"
          />
          <span class="help-text">垂直偏移量</span>
        </el-form-item>

        <el-form-item label="亮度">
          <el-slider
            v-model="calibrationForm.brightness"
            :min="0.5"
            :max="2"
            :step="0.1"
            show-stops
          />
          <span class="help-text">{{ calibrationForm.brightness.toFixed(1) }}x</span>
        </el-form-item>

        <el-form-item label="对比度">
          <el-slider
            v-model="calibrationForm.contrast"
            :min="0.5"
            :max="2"
            :step="0.1"
            show-stops
          />
          <span class="help-text">{{ calibrationForm.contrast.toFixed(1) }}x</span>
        </el-form-item>
      </el-form>

      <div class="button-group">
        <el-button type="primary" @click="handleSaveCalibration">
          保存校准
        </el-button>
        <el-button @click="handleResetCalibration">
          重置为默认
        </el-button>
      </div>

      <el-divider />

      <el-alert
        title="技术信息"
        type="success"
        :closable="false"
      >
        <template #default>
          <p>✓ 所有校准数据保存在本地 IndexedDB</p>
          <p>✓ 不上传到服务器</p>
          <p>✓ 支持多个不同游戏分辨率的配置</p>
        </template>
      </el-alert>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { db } from '@/services/database'

const calibrationForm = reactive({
  screenOffsetX: 0,
  screenOffsetY: 0,
  roiWidth: 500,
  roiHeight: 100,
  brightness: 1.0,
  contrast: 1.0
})

onMounted(async () => {
  const saved = await db.getCalibration()
  if (saved) {
    Object.assign(calibrationForm, saved)
  }
})

const handleSaveCalibration = async () => {
  await db.saveCalibration({
    screenOffsetX: calibrationForm.screenOffsetX,
    screenOffsetY: calibrationForm.screenOffsetY,
    roiWidth: calibrationForm.roiWidth,
    roiHeight: calibrationForm.roiHeight,
    brightness: calibrationForm.brightness,
    contrast: calibrationForm.contrast
  })
  ElMessage.success('校准已保存')
}

const handleResetCalibration = () => {
  calibrationForm.screenOffsetX = 0
  calibrationForm.screenOffsetY = 0
  calibrationForm.roiWidth = 500
  calibrationForm.roiHeight = 100
  calibrationForm.brightness = 1.0
  calibrationForm.contrast = 1.0
  ElMessage.info('已重置为默认值')
}
</script>

<style scoped>
.calibration {
  max-width: 600px;
}

.card-header {
  font-weight: 600;
}

.calibration-alert {
  margin-bottom: 20px;
}

.form-container {
  margin: 20px 0;
}

.help-text {
  margin-left: 12px;
  color: #909399;
  font-size: 12px;
}

.button-group {
  display: flex;
  gap: 12px;
  margin: 20px 0;
}
</style>
