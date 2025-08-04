/**
 * 爬虫结果接口
 */
export interface ICrawlResult {
  /** 页面标题 */
  title?: string
  /** 页面描述 */
  description?: string
  /** 网站名称 */
  siteName?: string
  /** 内容长度 */
  length?: number
  /** 页面内容（Markdown格式） */
  content?: string
  /** 内容类型 */
  contentType: 'text'
  /** 原始URL */
  url: string
}

/**
 * 过滤选项接口
 */
export interface IFilterOptions {
  /** 是否启用Readability内容提取 */
  enableReadability?: boolean
  /** 是否转换为纯文本 */
  pureText?: boolean
}

/**
 * 爬虫配置接口
 */
export interface ICrawlerConfig {
  /** 服务URL */
  url?: string
  /** API令牌 */
  token?: string
  /** 额外配置 */
  [key: string]: unknown
}

/**
 * 爬虫接口
 */
export interface ICrawler {
  /** 爬虫类型标识 */
  readonly type: string

  /** 爬虫名称 */
  readonly name: string

  /** 爬虫描述 */
  readonly description: string

  /**
   * 检查爬虫是否可用
   * @returns 是否可用
   */
  isAvailable: () => Promise<boolean>

  /**
   * 爬取网页内容
   * @param url 目标URL
   * @param options 过滤选项
   * @returns 爬取结果，失败时返回undefined
   */
  crawl: (url: string, options?: IFilterOptions) => Promise<ICrawlResult | undefined>

  /**
   * 获取爬虫配置
   * @returns 爬虫配置
   */
  getConfig: () => ICrawlerConfig
}

/**
 * 爬虫工厂接口
 */
export interface ICrawlerFactory {
  /**
   * 创建爬虫实例
   * @param type 爬虫类型
   * @returns 爬虫实例
   */
  create: (type: string) => ICrawler

  /**
   * 注册爬虫类型
   * @param type 爬虫类型
   * @param crawlerClass 爬虫类
   */
  register: (type: string, crawlerClass: new () => ICrawler) => void

  /**
   * 获取可用的爬虫类型列表
   * @returns 爬虫类型列表
   */
  getAvailableTypes: () => string[]

  /**
   * 检查爬虫类型是否已注册
   * @param type 爬虫类型
   * @returns 是否已注册
   */
  isRegistered: (type: string) => boolean
}
