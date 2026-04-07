export const onRequest: PagesFunction = async (context) => {
  const targetUrl = `https://u6u-mcp.uncle6-me.workers.dev/tools/catalog`;
  return fetch(targetUrl, context.request);
};
