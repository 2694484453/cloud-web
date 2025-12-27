import {PreciseMonitorIcon, MirrorIcon, NotificationIcon} from 'tdesign-icons-vue';
import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/prometheus',
    name: 'prometheus',
    component: Layout,
    //redirect: '/prometheus/base',
    meta: {title: '监控告警中心', icon: PreciseMonitorIcon},
    children: [
      {
        path: 'overView',
        name: 'OverViewBase',
        component: () => import('@/pages/prometheus/index.vue'),
        meta: {title: '概览'},
      },
      {
         path: 'dashboard',
         name: 'DashboardBase',
         component: () => import('@/pages/prometheus/frame/index.vue'),
         meta: {title: '控制面板'},
      },
      {
        path: 'exporter',
        name: 'exporter',
        component: () => import('@/pages/prometheus/exporter/index.vue'),
        meta: {title: '端点接入'},
      },
      {
        path: "rules",
        name: 'rules',
        component: () => import("@/pages/prometheus/rule/index.vue"),
        meta: {title: '告警规则'},
      },
      {
        path: "alerts",
        name: 'alerts',
        component: () => import("@/pages/prometheus/alert/index.vue"),
        meta: {title: '告警信息'},
      }
    ],
  },
  {
    path: '/grafana',
    name: 'grafana',
    component: Layout,
    meta: {title: 'grafana图表', icon: MirrorIcon},
    children: [
      {
        path: 'dashboard',
        name: 'DashboardBase',
        component: () => import('@/pages/grafana/dashboard.vue'),
        meta: {title: '服务面板'},
      }
    ],
  },
]
