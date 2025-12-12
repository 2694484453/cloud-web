import {AppIcon} from 'tdesign-icons-vue';
import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/docker',
    name: 'docker',
    component: Layout,
    //redirect: '/repo/base',
    meta: {title: 'docker管理', icon: AppIcon},
    children: [
      {
        path: 'imageMarket',
        name: 'imageMarketBase',
        component: () => import('@/pages/docker/market/list/index.vue'),
        meta: {title: '镜像市场'},
      },
      {
        path: 'image',
        name: 'imageBase',
        component: () => import('@/pages/docker/image/index.vue'),
        meta: {title: '本地镜像'},
      },
      {
        path: 'host',
        name: 'host',
        component: () => import('@/pages/docker/host/index.vue'),
        meta: {title: '服务主机'},
      },
      {
        path: 'hubAuth',
        name: 'hubAuth',
        component: () => import('@/pages/docker/access/list/index.vue'),
        meta: {title: '仓库认证'},
      },
      // {
      //   path: 'image',
      //   name: 'ImageBase',
      //   component: () => import('@/pages/repo/image/list/index.vue'),
      //   meta: {title: '标签管理'},
      // },
    ],
  }
]
