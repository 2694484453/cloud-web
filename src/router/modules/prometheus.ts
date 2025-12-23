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
        component: () => import("@/pages/prometheus-alertmanager/list/index.vue"),
        meta: {title: '告警规则'},
      },
      {
        path: "alerts",
        name: 'alerts',
        component: () => import("@/pages/prometheus-alertmanager/list/index.vue"),
        meta: {title: '告警信息'},
      }
    ],
  },
  // {
  //   path: '/prometheus-cloud',
  //   name: 'prometheus-cloud',
  //   component: Layout,
  //   //redirect: '/prometheus/base',
  //   meta: {title: '监控中心(cloud)', icon: PreciseMonitorIcon},
  //   children: [
  //     {
  //       path: 'overView',
  //       name: 'OverViewBase',
  //       component: () => import('@/pages/prometheus/index.vue'),
  //       meta: {title: '概览'},
  //     },
  //     {
  //       path: 'integrations',
  //       name: 'integrationsBase',
  //       component: () => import('@/pages/prometheus/exporter/list/index.vue'),
  //       meta: {title: '端点接入'},
  //     },
  //     {
  //       path: 'targetsMonitor',
  //       name: 'targetsMonitorBase',
  //       component: () => import('@/pages/prometheus/targets/index.vue'),
  //       meta: {title: '端点查询'},
  //     },
  //   ],
  // },
  // {
  //   path: '/alert',
  //   name: 'alert',
  //   component: Layout,
  //   meta: {title: '告警中心', icon: NotificationIcon},
  //   children: [
  //     {
  //       path: 'overView',
  //       name: 'OverView',
  //       component: () => import('@/pages/prometheus-alertmanager/index.vue'),
  //       meta: {title: '概览'},
  //     },
  //     {
  //       path: 'dashboard',
  //       name: 'dashboard',
  //       component: () => import('@/pages/prometheus-alertmanager/frame/index.vue'),
  //       meta: {title: '控制面板'},
  //     },
  //   ],
  // },
  // {
  //   path: '/alert-cloud',
  //   name: 'alert-cloud',
  //   component: Layout,
  //   meta: {title: '告警中心', icon: NotificationIcon},
  //   children: [
  //     {
  //       path: 'overView',
  //       name: 'overViewBase',
  //       component: () => import('@/pages/alert-cloud/index.vue'),
  //       meta: {title: '概览'},
  //     },
  //     {
  //       path: 'dashboard',
  //       name: 'DashboardBase',
  //       component: () => import('@/pages/alert-cloud/frame/index.vue'),
  //       meta: {title: '服务面板'},
  //     },
  //     {
  //       path: "ruleConfigList",
  //       name: 'ruleConfigListBase',
  //       component: () => import("@/pages/alert-config/list/index.vue"),
  //       meta: {title: '规则配置'},
  //     },
  //     {
  //       path: "ruleList",
  //       name: 'ruleListBase',
  //       component: () => import("@/pages/alert-rules/list/index.vue"),
  //       meta: {title: '告警规则'},
  //     },
  //     {
  //       path: "alertList",
  //       name: 'alertListBase',
  //       component: () => import("@/pages/alert-message/list/index.vue"),
  //       meta: {title: '告警消息'},
  //     }
  //   ],
  // },
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
