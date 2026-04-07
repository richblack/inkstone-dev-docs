export const onRequest: PagesFunction<{ MCP_SERVER: Fetcher }> = async (context) => {
  const url = new URL(context.request.url);
  
  // 1. 處理預檢請求 (Preflight)
  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Api-Key, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  try {
    // 2. 優先使用 Service Binding (如果已在 Dashboard 設定)
    if (context.env.MCP_SERVER) {
      const response = await context.env.MCP_SERVER.fetch(context.request.clone());
      const newResponse = new Response(response.body, response);
      newResponse.headers.set("Access-Control-Allow-Origin", "*");
      return newResponse;
    }

    // 3. Fallback 到外網 Fetch
    const targetUrl = `https://u6u-mcp.uncle6-me.workers.dev/sse${url.search}`;
    const response = await fetch(targetUrl, {
      method: context.request.method,
      headers: context.request.headers,
      body: context.request.body,
    });

    const newResponse = new Response(response.body, response);
    newResponse.headers.set("Access-Control-Allow-Origin", "*");
    return newResponse;
  } catch (e) {
    return new Response(`Proxy Error: ${e.message}`, { status: 502 });
  }
};
