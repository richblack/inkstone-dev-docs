export const onRequest: PagesFunction = async (context) => {
  const targetUrl = `https://u6u-mcp.uncle6-me.workers.dev/messages`;
  return fetch(targetUrl, context.request);
};
