export default [
  {
    path: '/',
    name: 'wallpaper',
    component: () => import('@/pages/wallpaper/list/index.vue'),
  },
  {
    path: '/info',
    name: 'info',
    component: () => import('@/pages/wallpaper/info/index.vue'),
  },
  {
    path: '/ai',
    name: 'ai',
    component: () => import('@/pages/wallpaper/ai/index.vue'),
  },
  {
    path: '/sponsor',
    name: 'sponsor',
    component: () => import('@/pages/wallpaper/sponsor/index.vue'),
  }
]
