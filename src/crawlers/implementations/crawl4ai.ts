import type {
  ICrawlerConfig,
  ICrawlResult,
  IFilterOptions,
} from '../../types/crawler'
import type { BaseCrawlerOptions } from './base'
import { ECrawlImpl } from '../../constants'
import { CRAWL4AI_API_TOKEN, CRAWL4AI_URL } from '../../env'
import { CrawlerError, CrawlerErrorType } from '../../errors/crawler'
import { createRequest } from '../../request'
import { BaseCrawler } from './base'

/**
 * Crawl4AI 爬虫实现
 */
export class Crawl4AICrawler extends BaseCrawler {
  public readonly type = ECrawlImpl.Crawl4AI
  public readonly name = 'Crawl4AI'
  public readonly description
    = '基于 Crawl4AI 服务的智能网页内容提取和 Markdown 转换'

  private readonly request: ReturnType<typeof createRequest>
  private config: ICrawlerConfig

  constructor(options: BaseCrawlerOptions) {
    super(options)
    this.config = this.getConfig()
    this.request = createRequest({
      baseUrl: this.config.url,
      authorization: this.config.token,
    })
  }

  /**
   * 获取爬虫配置
   */
  getConfig(): ICrawlerConfig {
    return {
      url: CRAWL4AI_URL,
      token: CRAWL4AI_API_TOKEN,
      excludedTags: ['script', 'style', 'noscript'],
    }
  }

  /**
   * 抓取页面内容
   * @param url 目标URL
   * @param options 过滤选项
   * @returns 爬虫结果
   */
  async crawl(
    url: string,
    _options?: IFilterOptions,
  ): Promise<ICrawlResult | undefined> {
    if (!this.validateUrl(url)) {
      throw CrawlerError.invalidUrlError(url)
    }

    try {
      // 验证爬虫是否可用
      const isAvailable = await this.isAvailable()
      if (!isAvailable) {
        throw CrawlerError.crawlerUnavailableError(this.name)
      }

      // 构建请求参数
      const requestBody = {
        urls: [url],
        crawler_config: {
          type: 'CrawlerRunConfig',
          params: {
            excluded_tags: this.config.excludedTags,
            stream: false,
            cache_mode: 'BYPASS',
          },
        },
      }

      // 调用 crawl4ai 服务
      const response = await this.request.post('crawl', {
        json: requestBody,
      })

      const data = (await response.json()) as any
      this.log.info('fetch_web result', data)

      if (data.success === false) {
        throw new CrawlerError(
          CrawlerErrorType.NETWORK_ERROR,
          `Crawl4AI 爬取失败: ${data.message || 'Crawl failed'}`,
          data,
        )
      }

      const firstResult = data.results[0]
      if (!firstResult) {
        throw new CrawlerError(
          CrawlerErrorType.CONTENT_EXTRACTION_ERROR,
          '获取的页面内容为空',
        )
      }

      // 构建爬虫结果
      const result: ICrawlResult = {
        title: firstResult.metadata?.['og:title'] || firstResult.metadata?.title || '',
        content: firstResult.markdown?.raw_markdown || '',
        url,
        contentType: 'text',
      }

      return result
    }
    catch (error) {
      if (error instanceof CrawlerError) {
        throw error
      }

      throw CrawlerError.contentExtractionError(
        `Failed to crawl ${url}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        url,
        error instanceof Error ? error : undefined,
      )
    }
  }

  /**
   * 验证URL是否有效
   * @param url 目标URL
   * @returns 是否有效
   */
  validateUrl(url: string): boolean {
    try {
      const urlObj = new URL(url)
      return ['http:', 'https:'].includes(urlObj.protocol)
    }
    catch {
      return false
    }
  }

  /**
   * 检查爬虫是否可用
   * @returns 是否可用
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await this.request.get('health', {
        timeout: 5000,
      })

      return response.ok
    }
    catch {
      return false
    }
  }
}
