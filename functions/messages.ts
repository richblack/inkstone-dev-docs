export const onRequest: PagesFunction<{ MCP_SERVER: Fetcher }> = async (context) => {
  // 1. 處理 Preflight
  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Api-Key, Authorization",
      },
    });
  }

  try {
    let response: Response;
    if (context.env.MCP_SERVER) {
      response = await context.env.MCP_SERVER.fetch(context.request.clone());
    } else {
      const targetUrl = `https://u6u-mcp.uncle6-me.workers.dev/messages`;
      response = await fetch(targetUrl, context.request);
    }

    const newResponse = new Response(response.body, response);
    newResponse.headers.set("Access-Control-Allow-Origin", "*");
    return newResponse;
  } catch (e) {
    return new Response(`Error: ${e.message}`, { status: 502, headers: { "Access-Control-Allow-Origin": "*" } });
  }
};
