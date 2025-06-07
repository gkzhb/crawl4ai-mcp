# Crawl4AI Model Context Protocol Server

This MCP Server helps you connect to your Crawl4AI docker API server before Crawl4AI 0.6.0.

Built with [gkzhb/fastmcp-template: TypeScript MCP Server Template](https://github.com/gkzhb/fastmcp-template).

## Quick Start

Prerequisites:
- Node.js 18+

To start Crawl4AI MCP server:

```bash
export CRAWL4AI_URL=http://your-server-ip:port
npx -y @gkzhb/crawl4ai-mcp
```

Shell environment variables:

| Variable | If Optional | Description |
|:-:|:-:|---|
| `CRAWL4AI_URL` | **Required** | Crawl4AI docker API server URL, eg. `http://localhost:11545` |
| `CRAWL4AI_API_TOKEN` | Optional | If Crawl4AI server enables authentication, you need to use this |
| `SERVER_PORT` | Optional | MCP server port, default value is `8585` |
