import {ImageIcon} from 'tdesign-icons-vue';
import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/wallpaper',
    name: 'wallpaper',
    component: Layout,
    meta: {
      title: '壁纸中心',
      icon: ImageIcon,
    },
    children: [
      {
        path: 'overView',
        name: 'overView',
        component: () => import('@/pages/wallpaper/index.vue'),
        meta: {title: '概览'},
      },
      {
        path: 'list',
        name: 'list',
        component: () => import('@/pages/wallpaper/list/index.vue'),
        meta: {title: '壁纸商店'},
      },
      {
        path: 'access',
        name: 'access',
        component: () => import('@/pages/wallpaper/mine/index.vue'),
        meta: {title: '我的壁纸'},
      },
    ],
  },
]
