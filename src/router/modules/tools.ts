import {ToolsIcon} from 'tdesign-icons-vue';
import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/tools',
    component: Layout,
    redirect: '/tools/base',
    name: 'tools',
    meta: {
      title: '工具管理',
      icon: ToolsIcon,
    },
    children: [
      {
        path: 'overView',
        name: 'overView',
        component: () => import('@/pages/git/index.vue'),
        meta: {title: '概览'},
      },
      {
        path: "https://hubproxy.gpg123.vip",
        name: 'hubProxy',
        meta: {title: '加速服务'},
      },
      {
        path: 'pages',
        name: 'pages',
        component: () => import('@/pages/tools/card/index.vue'),
        meta: {title: '小工具列表'},
      },
      {
        path: 'access',
        name: 'access',
        component: () => import('@/pages/git/token/index.vue'),
        meta: {title: '配置列表'},
      },
    ],
  },
]
