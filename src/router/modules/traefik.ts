import {RectangleIcon} from 'tdesign-icons-vue';
import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/traefik',
    name: 'traefik',
    component: Layout,
    meta: {title: 'traefik管理', icon: RectangleIcon},
    children: [
      {
        path: 'dashboard',
        name: 'DashboardBase',
        component: () => import('@/pages/traefik/dashboard/index.vue'),
        meta: {title: '服务面板'},
      },
      {
        path: 'monitor',
        name: 'MonitorBase',
        component: () => import('@/pages/traefik/frame/index.vue'),
        meta: {title: '监控面板'},
      },
      {
        path: "list",
        name: 'AddBase',
        component: () => import("@/pages/traefik/list/index.vue"),
        meta: {title: '配置列表'},
      }
    ],
  },
  {
    path: '/traefikCloud',
    name: 'traefikCloud',
    component: Layout,
    meta: {title: 'traefikCloud管理', icon: RectangleIcon},
    children: [
      {
        path: 'dashboard',
        name: 'DashboardBase',
        component: () => import('@/pages/traefikCloud/dashboard/index.vue'),
        meta: {title: '服务面板'},
      },
      {
        path: 'monitor',
        name: 'MonitorBase',
        component: () => import('@/pages/traefikCloud/frame/index.vue'),
        meta: {title: '监控面板'},
      },
      {
        path: "list",
        name: 'AddBase',
        component: () => import("@/pages/traefikCloud/list/index.vue"),
        meta: {title: '配置列表'},
      },
    ]
  }
]
