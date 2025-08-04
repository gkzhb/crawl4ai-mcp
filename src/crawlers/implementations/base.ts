import type {
  ICrawler,
  ICrawlerConfig,
  ICrawlerLogger,
  ICrawlResult,
  IFilterOptions,
} from '../../types/crawler'

export interface BaseCrawlerOptions {
  log: ICrawlerLogger
}
export abstract class BaseCrawler implements ICrawler {
  constructor(options: BaseCrawlerOptions) {
    this.log = options.log
  }

  log: ICrawlerLogger
  type: string
  name: string
  description: string

  abstract isAvailable(): Promise<boolean>
  abstract crawl(
    url: string,
    options?: IFilterOptions
  ): Promise<ICrawlResult | undefined>
  abstract getConfig(): ICrawlerConfig
}
