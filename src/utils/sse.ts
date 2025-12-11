// utils/sse.ts
interface SSEOptions {
  url: string;
  onMessage: (event: MessageEvent) => void;
  onOpen?: () => void;
  onError?: (error: Event) => void;
  withCredentials?: boolean;
}

class SSEService {
  private eventSource: EventSource | null = null;
  private retryCount: number = 0;
  private maxRetries: number = 3;
  private isConnecting: boolean = false;

  /**
   * 建立SSE连接
   */
  public connect(options: SSEOptions): void {
    if (this.isConnecting) {
      console.warn('SSE连接已存在');
      return;
    }

    // 检查浏览器支持性[3,6](@ref)
    if (typeof EventSource === 'undefined') {
      console.error('当前浏览器不支持SSE');
      return;
    }

    this.isConnecting = true;

    try {
      // 创建EventSource实例[2,8](@ref)
      this.eventSource = new EventSource(options.url, {
        withCredentials: options.withCredentials || false
      });

      // 连接成功回调[3](@ref)
      this.eventSource.onopen = () => {
        this.retryCount = 0;
        this.isConnecting = true;
        console.log('SSE连接已建立');
        options.onOpen?.();
      };

      // 消息处理[5](@ref)
      this.eventSource.onmessage = (event: MessageEvent) => {
        options.onMessage(event);
      };

      // 错误处理[2,6](@ref)
      this.eventSource.onerror = (error: Event) => {
        console.error('SSE连接错误:', error);
        options.onError?.(error);

        // 自动重连逻辑
        if (this.retryCount < this.maxRetries) {
          setTimeout(() => {
            this.retryCount++;
            this.connect(options);
          }, 1000 * this.retryCount);
        } else {
          this.isConnecting = false;
        }
      };

    } catch (error) {
      console.error('SSE连接初始化失败:', error);
      this.isConnecting = false;
    }
  }

  /**
   * 关闭SSE连接[2](@ref)
   */
  public close(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.isConnecting = false;
      this.retryCount = 0;
      console.log('SSE连接已关闭');
    }
  }

  /**
   * 获取连接状态[6](@ref)
   */
  public getReadyState(): number {
    return this.eventSource ? this.eventSource.readyState : 0;
  }

  /**
   * 添加自定义事件监听[3,8](@ref)
   */
  public addEventListener(event: string, listener: (event: MessageEvent) => void): void {
    if (this.eventSource) {
      this.eventSource.addEventListener(event, listener);
    }
  }
}

// 创建单例实例
export const sseService = new SSEService();
export default sseService;
