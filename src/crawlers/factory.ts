import type { ICrawler } from '../types/crawler'
import type { BaseCrawler, BaseCrawlerOptions } from './implementations/base'
import { CrawlerError, CrawlerErrorType } from '../errors/crawler'

type CrawlerClass = new (options: BaseCrawlerOptions) => BaseCrawler
/**
 * 爬虫工厂实现
 */
export class CrawlerFactory {
  /** 已注册的爬虫映射 */
  private readonly crawlers: Map<string, CrawlerClass> = new Map()

  /**
   * 创建爬虫实例
   * @param type 爬虫类型
   * @returns 爬虫实例
   * @throws CrawlerError 当爬虫类型未注册时
   */
  create(type: string, options: BaseCrawlerOptions): ICrawler {
    const CrawlerClass = this.crawlers.get(type)

    if (!CrawlerClass) {
      throw new CrawlerError(
        CrawlerErrorType.CONFIGURATION_ERROR,
        `Crawler type '${type}' is not registered`,
        undefined,
        { availableTypes: Array.from(this.crawlers.keys()) },
      )
    }

    return new CrawlerClass(options)
  }

  /**
   * 注册爬虫类型
   * @param type 爬虫类型
   * @param crawlerClass 爬虫类
   */
  register(
    type: string,
    crawlerClass: CrawlerClass,
  ): void {
    this.crawlers.set(type, crawlerClass)
  }

  /**
   * 获取可用的爬虫类型列表
   * @returns 爬虫类型列表
   */
  getAvailableTypes(): string[] {
    return Array.from(this.crawlers.keys())
  }

  /**
   * 检查爬虫类型是否已注册
   * @param type 爬虫类型
   * @returns 是否已注册
   */
  isRegistered(type: string): boolean {
    return this.crawlers.has(type)
  }

  /**
   * 注销爬虫类型
   * @param type 爬虫类型
   */
  unregister(type: string): void {
    this.crawlers.delete(type)
  }
}

// 创建全局工厂实例
export const crawlerFactory = new CrawlerFactory()
