#!/usr/bin/env node
import { FastMCP } from 'fastmcp'
import { z } from 'zod'
import { CRAWL4AI_API_TOKEN, CRAWL4AI_URL, SERVER_PORT } from './env'
import { createRequest } from './request'

const request = createRequest({ baseUrl: CRAWL4AI_URL, authorization: CRAWL4AI_API_TOKEN })
const server = new FastMCP({
  name: 'Crawl4AI MCP Server',
  version: '0.0.4', // version as `${number}.${number}.${number}`,
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

    // Process parameters
    const excludedTags = ['script', 'style', 'noscript']
    // const excludedTags = args.excluded_tags
    //   ? args.excluded_tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    //   : ['script', 'style', 'noscript']

    try {
      const response = await request.post('crawl', {
        json: {
          urls: [args.url],
          crawler_config: {
            type: 'CrawlerRunConfig',
            params: {
              // css_selector: args.css_selector,
              excluded_tags: excludedTags,
              stream: false,
              cache_mode: 'BYPASS',
            },
          },
        },
      })

      const result: any = await response.json()
      log.info('fetch_web result', result)

      const firstResult = result.results[0]
      if (!firstResult) {
        return 'Error: No results returned'
      }

      return firstResult.markdown?.raw_markdown || ''
      // switch (args.output_format || 'markdown') {
      //   case 'html':
      //     return firstResult.html || ''
      //   case 'cleaned_html':
      //     return firstResult.cleaned_html || ''
      //   default:
      //     return firstResult.markdown_v2?.raw_markdown || ''
      // }
    }
    catch (error) {
      log.error('fetch_web error', { error })
      if (error.name === 'HTTPError') {
        try {
          const errorJson = await error.response.json()
          return `Crawl4AI service error: ${JSON.stringify(errorJson)}`
        }
        catch {
          return `HTTP error: ${error.message}`
        }
      }
      return `Error: ${error?.message ?? 'Unknown error'}`
    }
  },
})

server.start({
  transportType: 'httpStream',
  httpStream: { port: SERVER_PORT },
})
