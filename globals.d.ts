// 通用声明
declare type ClassName = { [className: string]: any } | ClassName[] | string;

interface ImportMetaEnv {
  readonly VITE_GRAFANA_DOMAIN: string;
  readonly VITE_PROMETHEUS_DOMAIN: string;
  readonly VITE_DATASOURCE: string;
  // 如果有其他 VITE_ 变量，继续在这里声明
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_CN_NAME: string;
  readonly VITE_OTEL_ENDPOINT: string;
  readonly VITE_OTEL_SERVICE_NAME: string;
  readonly VITE_UMAMI_ID: string;
  readonly VITE_UMAMI_HOST: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.svg' {
  const content: string;
  export default content;
}
