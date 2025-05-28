import * as process from 'node:process'
import { FastMCP } from 'fastmcp'
import { z } from 'zod'
import { createRequest } from './request'

const request = createRequest({ baseUrl: process.env.CRAWL4AI_URL || '', authorization: process.env.CRAWL4AI_API_TOKEN })
const server = new FastMCP({
  name: 'My Server',
  version: '0.0.1',
})

server.addTool({
  name: 'fetch_web',
  description: 'fetch web url content and return in markdown',
  parameters: z.object({
    url: z.string(),
  }),
  execute: async (args, { log }) => {
    if (!args.url) {
      return 'No url provided'
    }
    try {
      const result = await request.post('crawl', { json: { urls: [args.url], crawler_config: {
        type: 'CrawlerRunConfig',
        params: { css_selector: undefined, excluded_tags: undefined, stream: false, cache_mode: 'BYPASS' },
      } } })
      const resp: { task_id: string } = await result.json()
      log.info('fetch_web crawl result', resp)
      while (true) {
        const task = await request.get(`task/${resp.task_id}`)
        const taskResp: Record<string, any> = await task.json()
        log.info('fetch_web task result', taskResp)
        if (taskResp.status === 'completed') {
          return taskResp.results[0]?.markdown_v2?.raw_markdown || 'Empty content'
        }
        await new Promise<true>((resolve) => {
          setTimeout(() => {
            resolve(true)
          }, 2000)
        })
      }
    }
    catch (error) {
      log.error('fetch_web error', { error })
      if (error.name === 'HTTPError') {
        const errorJson = await error.response.json()
        log.error('fetch_web http error', { errorJson })
        return errorJson
      }
      return error?.message ?? 'unknown error'
    }
  },
})

server.start({
  transportType: 'httpStream',
  httpStream: { port: 8585 },
})
