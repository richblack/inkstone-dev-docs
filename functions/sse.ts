export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  // 將請求代理到真正的 MCP Worker
  const targetUrl = `https://u6u-mcp.uncle6-me.workers.dev/sse${url.search}`;
  
  // 複製原始請求的 Headers (包含 API Key)
  const newRequest = new Request(targetUrl, context.request);
  
  return fetch(newRequest);
};
