import {LogoGithubIcon} from 'tdesign-icons-vue';
import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/git',
    component: Layout,
    redirect: '/git/base',
    name: 'git',
    meta: {
      title: 'Git仓库管理',
      icon: LogoGithubIcon,
    },
    children: [
      {
        path: 'overView',
        name: 'overView',
        component: () => import('@/pages/git/index.vue'),
        meta: {title: '概览'},
      },
      {
        path: 'gitRepo',
        name: 'gitRepo',
        component: () => import('@/pages/git/list/index.vue'),
        meta: {title: '仓库列表'},
      },
      {
        path: 'codeSpace',
        name: 'codeSpace',
        component: () => import('@/pages/git/codespace/index.vue'),
        meta: {title: '代码空间'},
      },
      {
        path: 'gitToken',
        name: 'gitToken',
        component: () => import('@/pages/git/token/list/index.vue'),
        meta: {title: 'Token管理'},
      },
    ],
  },
]
