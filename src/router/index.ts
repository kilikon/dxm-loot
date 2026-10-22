import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory('/maple-log/'),
  routes: [
    {
      path: '/',
      name: 'Dashboard',
      component: () => import('@/pages/Dashboard.vue'),
      meta: { title: '控制面板' }
    },
    {
      path: '/calibration',
      name: 'Calibration',
      component: () => import('@/pages/Calibration.vue'),
      meta: { title: '识别校准' }
    },
    {
      path: '/history',
      name: 'History',
      component: () => import('@/pages/History.vue'),
      meta: { title: '历史记录' }
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('@/pages/Settings.vue'),
      meta: { title: '设置' }
    }
  ]
})

router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title as string} - 枫记`
  next()
})

export default router
