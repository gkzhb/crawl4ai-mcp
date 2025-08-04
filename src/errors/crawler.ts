/**
 * 爬虫错误类型枚举
 */
export enum CrawlerErrorType {
  /** 网络错误 */
  NETWORK_ERROR = 'NETWORK_ERROR',
  /** 超时错误 */
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  /** 无效URL错误 */
  INVALID_URL_ERROR = 'INVALID_URL_ERROR',
  /** 页面加载错误 */
  PAGE_LOAD_ERROR = 'PAGE_LOAD_ERROR',
  /** 内容提取错误 */
  CONTENT_EXTRACTION_ERROR = 'CONTENT_EXTRACTION_ERROR',
  /** 配置错误 */
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  /** 初始化错误 */
  INITIALIZATION_ERROR = 'INITIALIZATION_ERROR',
  /** 内容错误 */
  CONTENT_ERROR = 'CONTENT_ERROR',
  /** 解析错误 */
  PARSING_ERROR = 'PARSING_ERROR',
  /** 爬虫不可用错误 */
  CRAWLER_UNAVAILABLE_ERROR = 'CRAWLER_UNAVAILABLE_ERROR',
  /** 未知错误 */
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * 爬虫错误类
 */
export class CrawlerError extends Error {
  /** 错误类型 */
  public readonly type: CrawlerErrorType

  /** 原始错误（如果有） */
  public readonly originalError?: Error

  /** 错误发生时的上下文信息 */
  public readonly context?: Record<string, any>

  /**
   * 创建爬虫错误实例
   * @param type 错误类型
   * @param message 错误消息
   * @param originalError 原始错误
   * @param context 上下文信息
   */
  constructor(
    type: CrawlerErrorType,
    message: string,
    originalError?: Error,
    context?: Record<string, any>,
  ) {
    super(message)
    this.name = 'CrawlerError'
    this.type = type
    this.originalError = originalError
    this.context = context

    // 保持堆栈跟踪
    if (originalError?.stack) {
      this.stack = originalError.stack
    }
  }

  /**
   * 创建网络错误
   * @param message 错误消息
   * @param originalError 原始错误
   * @param context 上下文信息
   * @returns 网络错误实例
   */
  static networkError(
    message: string,
    originalError?: Error,
    context?: Record<string, any>,
  ): CrawlerError {
    return new CrawlerError(
      CrawlerErrorType.NETWORK_ERROR,
      message,
      originalError,
      context,
    )
  }

  /**
   * 创建超时错误
   * @param message 错误消息
   * @param timeout 超时时间（毫秒）
   * @param context 上下文信息
   * @returns 超时错误实例
   */
  static timeoutError(
    message: string,
    timeout?: number,
    context?: Record<string, any>,
  ): CrawlerError {
    return new CrawlerError(
      CrawlerErrorType.TIMEOUT_ERROR,
      message,
      undefined,
      { ...context, timeout },
    )
  }

  /**
   * 创建无效URL错误
   * @param url 无效的URL
   * @param context 上下文信息
   * @returns 无效URL错误实例
   */
  static invalidUrlError(
    url: string,
    context?: Record<string, any>,
  ): CrawlerError {
    return new CrawlerError(
      CrawlerErrorType.INVALID_URL_ERROR,
      `Invalid URL: ${url}`,
      undefined,
      { ...context, url },
    )
  }

  /**
   * 创建页面加载错误
   * @param message 错误消息
   * @param url 页面URL
   * @param originalError 原始错误
   * @param context 上下文信息
   * @returns 页面加载错误实例
   */
  static pageLoadError(
    message: string,
    url: string,
    originalError?: Error,
    context?: Record<string, any>,
  ): CrawlerError {
    return new CrawlerError(
      CrawlerErrorType.PAGE_LOAD_ERROR,
      message,
      originalError,
      { ...context, url },
    )
  }

  /**
   * 创建内容提取错误
   * @param message 错误消息
   * @param url 页面URL
   * @param originalError 原始错误
   * @param context 上下文信息
   * @returns 内容提取错误实例
   */
  static contentExtractionError(
    message: string,
    url: string,
    originalError?: Error,
    context?: Record<string, any>,
  ): CrawlerError {
    return new CrawlerError(
      CrawlerErrorType.CONTENT_EXTRACTION_ERROR,
      message,
      originalError,
      { ...context, url },
    )
  }

  /**
   * 创建配置错误
   * @param message 错误消息
   * @param config 配置信息
   * @param context 上下文信息
   * @returns 配置错误实例
   */
  static configurationError(
    message: string,
    config?: any,
    context?: Record<string, any>,
  ): CrawlerError {
    return new CrawlerError(
      CrawlerErrorType.CONFIGURATION_ERROR,
      message,
      undefined,
      { ...context, config },
    )
  }

  /**
   * 创建爬虫不可用错误
   * @param crawlerName 爬虫名称
   * @param context 上下文信息
   * @returns 爬虫不可用错误实例
   */
  static crawlerUnavailableError(
    crawlerName: string,
    context?: Record<string, any>,
  ): CrawlerError {
    return new CrawlerError(
      CrawlerErrorType.CRAWLER_UNAVAILABLE_ERROR,
      `Crawler ${crawlerName} is not available`,
      undefined,
      { ...context, crawlerName },
    )
  }

  /**
   * 创建未知错误
   * @param message 错误消息
   * @param originalError 原始错误
   * @param context 上下文信息
   * @returns 未知错误实例
   */
  static unknownError(
    message: string,
    originalError?: Error,
    context?: Record<string, any>,
  ): CrawlerError {
    return new CrawlerError(
      CrawlerErrorType.UNKNOWN_ERROR,
      message,
      originalError,
      context,
    )
  }

  /**
   * 转换为JSON对象
   * @returns JSON对象
   */
  toJSON(): object {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      stack: this.stack,
      originalError: this.originalError?.message,
      context: this.context,
    }
  }
}
