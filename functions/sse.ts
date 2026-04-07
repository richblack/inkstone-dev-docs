export const onRequest: PagesFunction<{ MCP_SERVER: Fetcher }> = async (context) => {
  const url = new URL(context.request.url);
  const isPreflight = context.request.method === "OPTIONS";

  // 1. 處理 Preflight
  if (isPreflight) {
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
    let response: Response;
    // 2. 代理請求
    if (context.env.MCP_SERVER) {
      response = await context.env.MCP_SERVER.fetch(context.request.clone());
    } else {
      const targetUrl = `https://u6u-mcp.uncle6-me.workers.dev/sse${url.search}`;
      response = await fetch(targetUrl, context.request);
    }

    // 3. 建立支援 CORS 的回應，並確保串流不被緩存
    const newResponse = new Response(response.body, response);
    newResponse.headers.set("Access-Control-Allow-Origin", "*");
    newResponse.headers.set("Cache-Control", "no-cache");
    newResponse.headers.set("Connection", "keep-alive");
    
    return newResponse;
  } catch (e) {
    return new Response(`Proxy Error: ${e.message}`, { status: 502, headers: { "Access-Control-Allow-Origin": "*" } });
  }
};
