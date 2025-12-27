import {ImageIcon} from 'tdesign-icons-vue';
import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/wallpaper',
    name: 'wallpaper',
    component: () => import('@/pages/wallpaper/list/index.vue'),
  },
]
