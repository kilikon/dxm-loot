<template>
  <div id="app" class="app-container">
    <el-container>
      <el-header class="app-header">
        <div class="header-content">
          <div class="logo">
            <span class="logo-icon">🍁</span>
            <span class="logo-text">枫记</span>
          </div>
          <el-menu
            :default-active="$route.path"
            mode="horizontal"
            @select="(key: string) => $router.push(key)"
            class="nav-menu"
          >
            <el-menu-item index="/">控制面板</el-menu-item>
            <el-menu-item index="/calibration">识别校准</el-menu-item>
            <el-menu-item index="/history">历史记录</el-menu-item>
            <el-menu-item index="/settings">设置</el-menu-item>
          </el-menu>
          <div class="header-actions">
            <el-button
              :icon="isDarkMode ? 'Sunny' : 'Moon'"
              circle
              text
              @click="toggleTheme"
            />
          </div>
        </div>
      </el-header>

      <el-main class="app-main">
        <RouterView />
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterView } from 'vue-router'

const isDarkMode = ref(false)

onMounted(() => {
  // 从 localStorage 读取主题设置
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDarkMode.value = true
    document.documentElement.setAttribute('data-theme', 'dark')
  }
})

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  const theme = isDarkMode.value ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
}
</script>

<style scoped>
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: #fff;
  border-bottom: 1px solid #ebeef5;
  padding: 0 20px;
  display: flex;
  align-items: center;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: bold;
  margin-right: 40px;
  white-space: nowrap;
}

.logo-icon {
  font-size: 24px;
}

.logo-text {
  color: #333;
}

.nav-menu {
  flex: 1;
  border-bottom: none;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.app-main {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f5f7fa;
}

/* 深色模式 */
:global([data-theme='dark']) {
  color-scheme: dark;
}

:global([data-theme='dark']) .app-header {
  background: #1b1d1f;
  border-bottom-color: #2d2d2d;
}

:global([data-theme='dark']) .logo-text {
  color: #fff;
}

:global([data-theme='dark']) .app-main {
  background: #0a0e27;
  color: #e4e6eb;
}
</style>
