// reference to https://github.com/lobehub/lobe-chat/blob/f97c62e196717a81c16836f0356192adb9c8ad45/packages/web-crawler/src/utils/htmlToMarkdown.ts
import type { TranslatorConfigObject } from 'node-html-markdown'
import type { IFilterOptions } from '../types/crawler'
import { Readability } from '@mozilla/readability'
import { Window } from 'happy-dom'
import {
  NodeHtmlMarkdown,

} from 'node-html-markdown'

interface HtmlToMarkdownOutput {
  author?: string
  content: string
  description?: string
  dir?: string
  lang?: string
  length?: number
  publishedTime?: string
  siteName?: string
  title?: string
}

export function htmlToMarkdown(html: string, { url, filterOptions }: { filterOptions: IFilterOptions, url: string }): HtmlToMarkdownOutput {
  const window = new Window({ url })

  const document = window.document
  document.body.innerHTML = html

  // @ts-expect-error reason: Readability expects a Document type
  const parsedContent = new Readability(document).parse()

  const useReadability = filterOptions.enableReadability ?? true

  let htmlNode = html

  if (useReadability && parsedContent?.content) {
    htmlNode = parsedContent?.content
  }

  const customTranslators = (
    filterOptions.pureText
      ? {
          a: {
            postprocess: (_: string, content: string) => content,
          },
          img: {
            ignore: true,
          },
        }
      : {}
  ) as TranslatorConfigObject

  const nodeHtmlMarkdown = new NodeHtmlMarkdown({}, customTranslators)

  const content = nodeHtmlMarkdown.translate(htmlNode)

  const result = {
    author: parsedContent?.byline,
    content,
    description: parsedContent?.excerpt,
    dir: parsedContent?.dir,
    lang: parsedContent?.lang,
    length: parsedContent?.length,
    publishedTime: parsedContent?.publishedTime,
    siteName: parsedContent?.siteName,
    title: parsedContent?.title,
  }

  return result as HtmlToMarkdownOutput
}
