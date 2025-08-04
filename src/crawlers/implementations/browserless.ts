import type {
  ICrawlerConfig,
  ICrawlResult,
  IFilterOptions,
} from '../../types/crawler'
import type { BaseCrawlerOptions } from './base'
import {
  BROWSERLESS_BLOCK_ADS,
  BROWSERLESS_STEALTH_MODE,
  BROWSERLESS_TOKEN,
  BROWSERLESS_URL,
} from '../../env'
import { CrawlerError, CrawlerErrorType } from '../../errors/crawler'
import { createRequest } from '../../request'
import { htmlToMarkdown } from '../../utils/html2Md'
import { BaseCrawler } from './base'

/**
 * Browserless 爬虫实现
 * 基于 Browserless 服务的网页爬取和 Markdown 转换
 */
export class BrowserlessCrawler extends BaseCrawler {
  readonly type = 'browserless'
  readonly name = 'Browserless Crawler'
  readonly description
    = '基于 Browserless 服务的高质量网页爬取和 Markdown 转换'

  private readonly config: ICrawlerConfig
  private readonly request: ReturnType<typeof createRequest>

  constructor(options: BaseCrawlerOptions) {
    super(options)
    this.config = this.getConfig()
    this.request = createRequest({
      baseUrl: this.config.url || '',
    })
  }

  /**
   * 获取爬虫配置
   */
  getConfig(): ICrawlerConfig {
    return {
      url: BROWSERLESS_URL,
      token: BROWSERLESS_TOKEN,
      blockAds: BROWSERLESS_BLOCK_ADS,
      stealthMode: BROWSERLESS_STEALTH_MODE,
    }
  }

  /**
   * 检查爬虫是否可用
   */
  async isAvailable(): Promise<boolean> {
    const { token } = this.config
    try {
      await this.request.get('sessions', {
        searchParams: {
          token,
        },
      })
    }
    catch {
      return false
    }
    return true
  }

  /**
   * 爬取网页内容
   */
  async crawl(
    url: string,
    options: IFilterOptions = { enableReadability: true, pureText: false },
  ): Promise<ICrawlResult | undefined> {
    try {
      // 检查必需配置
      if (!(await this.isAvailable())) {
        throw new CrawlerError(
          CrawlerErrorType.CONFIGURATION_ERROR,
          'Browserless /sessions available check failed, please double check your BROWSERLESS_URL and BROWSERLESS_TOKEN envs',
        )
      }

      // 获取原始HTML内容
      const html = await this.fetchHtml(url)
      if (!html) {
        return undefined
      }

      // 转换为Markdown，并提取元信息
      const result = htmlToMarkdown(html, { filterOptions: options, url })

      return { ...result, contentType: 'text', url }
    }
    catch (error) {
      if (error instanceof CrawlerError) {
        throw error
      }

      throw new CrawlerError(
        CrawlerErrorType.NETWORK_ERROR,
        `Browserless 爬取失败: ${
          error instanceof Error ? error.message : '未知错误'
        }`,
        error,
      )
    }
  }

  /**
   * 从 Browserless 获取原始HTML
   */
  private async fetchHtml(url: string): Promise<string | undefined> {
    const { token, blockAds = '0', stealthMode } = this.config

    // 构建请求体
    const requestBody = {
      gotoOptions: { waitUntil: 'networkidle2' },
      rejectRequestPattern: [this.getRejectPattern()],
      url,
    }

    try {
      const response = await this.request.post('content', {
        searchParams: {
          token,
          blockAds: blockAds as string,
          launch: JSON.stringify({ stealth: stealthMode }),
        },
        json: requestBody,
      })

      const html = await response.text()

      // 检查Cloudflare拦截
      if (html.includes('Just a moment...')) {
        throw new CrawlerError(
          CrawlerErrorType.CONTENT_EXTRACTION_ERROR,
          '页面被 Cloudflare 拦截，无法访问',
        )
      }

      // 检查内容是否为空
      if (!html.trim()) {
        throw new CrawlerError(
          CrawlerErrorType.CONTENT_EXTRACTION_ERROR,
          '获取的页面内容为空',
        )
      }

      return html
    }
    catch (error) {
      if (error instanceof CrawlerError) {
        throw error
      }

      throw new CrawlerError(
        CrawlerErrorType.NETWORK_ERROR,
        `获取HTML失败: ${error instanceof Error ? error.message : '网络错误'}`,
        error,
      )
    }
  }

  /**
   * 获取资源过滤正则表达式
   */
  private getRejectPattern(): string {
    // 过滤掉非必要的资源文件，只保留核心内容类型
    return '.*\\.(?!(html|css|js|json|xml|webmanifest|txt|md)(\\?|#|$))[\\w-]+(?:[\\?#].*)?$'
  }
}
