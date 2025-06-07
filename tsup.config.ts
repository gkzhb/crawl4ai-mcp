import type { Options } from 'tsup'
import { defineConfig } from 'tsup'

const commonOptions: Options = {
  entry: { 'crawl4ai-mcp': 'src/index.ts' },
}
export default defineConfig((options) => {
  const buildOptions: Options = {
    ...commonOptions,
    name: 'Build',
    splitting: false,
    minify: true,
  }
  const devOptions: Options = {
    ...commonOptions,
    name: 'Develop',
    onSuccess: 'node dist/crawl4ai-mcp.js',
  }
  return options.watch ? devOptions : buildOptions
})
