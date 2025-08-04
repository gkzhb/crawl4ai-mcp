#!/usr/bin/env node
/* eslint-disable no-console */
import type { SerializableValue } from 'fastmcp'
import type { ICrawlerLogger } from './types/crawler'
import { FastMCP } from 'fastmcp'
import { z } from 'zod'
import { ECrawlImpl } from './constants'
import { crawlerFactory } from './crawlers/factory'
import { BrowserlessCrawler } from './crawlers/implementations/browserless'
import { Crawl4AICrawler } from './crawlers/implementations/crawl4ai'
import { CRAWL_IMPL, SERVER_PORT } from './env'
import { CrawlerError } from './errors/crawler'

// 注册所有爬虫实现
crawlerFactory.register('crawl4ai', Crawl4AICrawler)
crawlerFactory.register('browserless', BrowserlessCrawler)
const crawlerType = z.enum([ECrawlImpl.Browserless, ECrawlImpl.Crawl4AI])
const server = new FastMCP({
  name: 'Crawl4AI MCP Server',
  version: '0.0.5', // version as `${number}.${number}.${number}`,
})

server.addTool({
  name: 'fetch_web',
  description: 'fetch web url content and return in markdown',
  parameters: z.object({
    url: z.string().url().describe('要抓取的网页URL'),
    timeout: z
      .number()
      .min(1000)
      .max(300000)
      .optional()
      .describe('超时时间（毫秒）'),
    crawlerType: crawlerType
      .optional()
      .describe('使用的爬虫类型，不指定则使用环境变量配置的默认类型'),
  }),
  execute: async (args, { log }) => {
    if (!args.url) {
      return 'No url provided'
    }

    try {
      // 确定使用的爬虫类型
      const crawlerType = args.crawlerType || CRAWL_IMPL

      // 获取爬虫实例
      const crawler = crawlerFactory.create(crawlerType, { log })

      // 抓取内容
      const result = await crawler.crawl(args.url)

      log.info('fetch_web result', {
        url: args.url,
        title: result?.title,
        crawlerType,
        contentLength: result?.length,
      })

      return result?.content || 'No content found'
    }
    catch (error) {
      log.error('fetch_web error', { error, url: args.url })

      if (error instanceof CrawlerError) {
        return `Crawler error: ${error.message} (type: ${error.type})`
      }

      return `Error: ${error?.message ?? 'Unknown error'}`
    }
  },
})

server.addTool({
  name: 'check_crawler_availability',
  description: '检查爬虫服务是否可用',
  parameters: z.object({
    crawlerType: crawlerType
      .optional()
      .describe('要检查的爬虫类型，不指定则检查默认类型'),
  }),
  execute: async (args, { log }) => {
    try {
      const crawlerType = args.crawlerType || CRAWL_IMPL
      const crawler = crawlerFactory.create(crawlerType, { log })
      const isAvailable = await crawler.isAvailable()

      log.info('check_crawler_availability result', {
        crawlerType,
        isAvailable,
      })

      return `Crawler ${crawlerType} is ${
        isAvailable ? 'available' : 'not available'
      }`
    }
    catch (error) {
      log.error('check_crawler_availability error', { error })
      return `Error checking availability: ${
        error?.message ?? 'Unknown error'
      }`
    }
  },
})

server.addTool({
  name: 'list_crawlers',
  description: '列出所有可用的爬虫类型',
  parameters: z.object({}),
  execute: async (_args, { log }) => {
    try {
      const availableTypes = crawlerFactory.getAvailableTypes()
      const defaultType = CRAWL_IMPL

      log.info('list_crawlers result', {
        availableTypes,
        defaultType,
      })

      return `Available crawlers: ${availableTypes.join(
        ', ',
      )}\nDefault: ${defaultType}`
    }
    catch (error) {
      log.error('list_crawlers error', { error })
      return `Error listing crawlers: ${error?.message ?? 'Unknown error'}`
    }
  },
})

server.addTool({
  name: 'get_crawler_config',
  description: '获取爬虫配置信息',
  parameters: z.object({
    crawlerType: z
      .enum(['crawl4ai', 'browserless'])
      .optional()
      .describe('要获取配置的爬虫类型'),
  }),
  execute: async (args, { log }) => {
    try {
      const crawlerType = args.crawlerType || CRAWL_IMPL
      const crawler = crawlerFactory.create(crawlerType, { log })
      const config = crawler.getConfig()

      log.info('get_crawler_config result', {
        crawlerType,
        config: JSON.stringify(config),
      })

      return JSON.stringify(
        {
          type: crawlerType,
          name: crawler.name,
          description: crawler.description,
          config,
          isDefault: crawlerType === CRAWL_IMPL,
        },
        null,
        2,
      )
    }
    catch (error) {
      log.error('get_crawler_config error', { error })
      return `Error getting config: ${error?.message ?? 'Unknown error'}`
    }
  },
})

function getLog(): ICrawlerLogger {
  return {
    debug: (message: string, meta?: SerializableValue) => {
      console.info(`[DEBUG] ${message}`, meta || '')
    },
    info: (message: string, meta?: SerializableValue) => {
      console.info(`[INFO] ${message}`, meta || '')
    },
    error: (message: string, meta?: SerializableValue) => {
      console.error(`[ERROR] ${message}`, meta || '')
    },
    warn: (message: string, meta?: SerializableValue) => {
      console.warn(`[WARN] ${message}`, meta || '')
    },
  }
}
// 启动时检查默认爬虫可用性
async function checkDefaultCrawler() {
  try {
    const crawler = crawlerFactory.create(CRAWL_IMPL, { log: getLog() })
    const isAvailable = await crawler.isAvailable()

    if (!isAvailable) {
      console.warn(
        `Warning: Default crawler "${CRAWL_IMPL}" is not available. Please check configuration.`,
      )
    }
  }
  catch (error) {
    console.error(`Error initializing default crawler "${CRAWL_IMPL}":`, error)
  }
}

// 立即检查默认爬虫
checkDefaultCrawler()

server.start({
  transportType: 'httpStream',
  httpStream: { port: SERVER_PORT },
})
