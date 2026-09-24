// Hosts that answer 403 to GitHub Actions runner IPs but 200 to a normal client.
const BOT_BLOCKING_HOSTS = ["reddit.com", "substack.com"];

export function classify(url, status) {
  const authExpected = (((/^https:\/\/mcp\./.test(url) || /\/mcp\/?(?:$|\?)/.test(url)) && status === 401) || (url === "https://claude.ai/code" && status === 403));
  if (status >= 200 && status < 400) return "ok";
  if (authExpected) return "ok";
  const host = new URL(url).hostname;
  if (status === 403 && BOT_BLOCKING_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) return "blocked";
  return "broken";
}
