import VueRouter from 'vue-router';
import baseRouters from './modules/base';
// 个人
import componentsRouters from './modules/components';
// 其他
import othersRouters from './modules/others';
// 构建
import buildRouters from './modules/build';
// 域名
import domainRouters from './modules/domain';
// 监控
import prometheusRouters from "@/router/modules/prometheus";
// 应用
import appRouters from "@/router/modules/app";
// 仓库
import dockerRouters from "@/router/modules/docker";
// traefik
import traefikRouters from "@/router/modules/traefik";
// 集群
import clusterRouters from "@/router/modules/cluster";
// coredns
import corednsRouters from "@/router/modules/coredns";
// caddy
import caddyRouters from "@/router/modules/caddy";
// backup
import backupRouters from "@/router/modules/backup";
// tracing
import tracingRouters from "@/router/modules/tracing";
// git
import gitRouters from "@/router/modules/git";
// devops
import devopsRouters from "@/router/modules/devops";
// ai
import AiRouters from "@/router/modules/ai";
// test
import testRouters from "@/router/modules/test";
// userInfo
import userInfoRouters from "@/router/modules/userinfo";
// discovery
import discoveryRouters from "@/router/modules/discovery";
// nas
import nasRouters from "@/router/modules/nas";
// 消息
import noticeRouters from "@/router/modules/notice";
// 调度
import scheduleRouters from "@/router/modules/scheduling";
// 工具
import toolsRouters from "@/router/modules/tools";
// 壁纸
import wallpaperRouters from "@/router/modules/wallpaper";

const env = import.meta.env.MODE || 'development';
import proxy from '@/config/host';
// 开发模式
const devRouterList = [...domainRouters, ...gitRouters, ...devopsRouters, ...discoveryRouters, ...prometheusRouters, ...tracingRouters, ...appRouters, ...dockerRouters, ...traefikRouters, ...clusterRouters, ...caddyRouters, ...corednsRouters, ...nasRouters, ...backupRouters, ...scheduleRouters, ...toolsRouters, ...othersRouters]
// 生产模式
const prodRouterList = [...gitRouters, ...devopsRouters, ...appRouters, ...prometheusRouters, ...tracingRouters, ...traefikRouters, ...clusterRouters, ...dockerRouters, ...caddyRouters, ...corednsRouters, ...nasRouters, ...AiRouters, ...backupRouters]
// 独立nas-frp
const nasRouterList = [...nasRouters]
// 独立
const wallpaperRouterList = [...wallpaperRouters]
// 基础路由
export const asyncRouterList = [...baseRouters]
const envName = proxy[env].NAME
// 存放动态路由
switch (envName) {
  case "development":
    asyncRouterList.push(...devRouterList)
    asyncRouterList.push(...noticeRouters)
    break;
  case "k8s":
    asyncRouterList.push(...devRouterList)
    break;
  case "prod":
    asyncRouterList.push(...prodRouterList)
    break;
  case "nas":
    asyncRouterList.push(...nasRouterList)
    break;
  case "wallpaper":
    asyncRouterList.push(...wallpaperRouterList)
    break;
  default:
    break;
}

//export const asyncRouterList = (proxy[env].NAME === "development" ? devRouterList : prodRouterList)
//[...baseRouters, ...componentsRouters, ...othersRouters];

// 存放固定的路由
const defaultRouterList = [
  // 登陆
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/login/index.vue'),
  },
  {
    path: '*',
    redirect: '/dashboard/base',
  },
  ...asyncRouterList,
];

const createRouter = () =>
  new VueRouter({
    mode: 'history',
    base: env === 'site' ? '/starter/vue/' : null,
    routes: defaultRouterList,
    scrollBehavior() {
      return {x: 0, y: 0};
    },
  });

const router = createRouter();

export function resetRouter() {
  const newRouter = createRouter();
  router.matcher = newRouter.matcher; // reset router
}

export default router;
