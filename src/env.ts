import * as process from 'node:process'

export const CRAWL4AI_URL = process.env.CRAWL4AI_URL || ''
export const CRAWL4AI_API_TOKEN = process.env.CRAWL4AI_API_TOKEN
export const SERVER_PORT = Number(process.env.SERVER_PORT || '8585')
