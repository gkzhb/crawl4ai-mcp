import * as process from 'node:process'
import { ECrawlImpl } from './constants'

/** crawl implementation, use browserless or crawl4ai */
export const CRAWL_IMPL = process.env.CRAWL_IMPL || ECrawlImpl.Crawl4AI
export const CRAWL4AI_URL = process.env.CRAWL4AI_URL || ''
export const CRAWL4AI_API_TOKEN = process.env.CRAWL4AI_API_TOKEN
export const SERVER_PORT = Number(process.env.SERVER_PORT || '8585')

/** browserless configuration */
export const BROWSERLESS_URL = process.env.BROWSERLESS_URL || 'https://chrome.browserless.io'
export const BROWSERLESS_TOKEN = process.env.BROWSERLESS_TOKEN
export const BROWSERLESS_BLOCK_ADS = process.env.BROWSERLESS_BLOCK_ADS === '1'
export const BROWSERLESS_STEALTH_MODE = process.env.BROWSERLESS_STEALTH_MODE === '1'
