const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Claude Lab usage collector</title>
<style>
  body { font: 18px/1.5 system-ui, sans-serif; max-width: 38rem; margin: 4rem auto; padding: 0 1.25rem; color: #1c1917; }
  a { color: #9a3412; }
</style>
</head>
<body>
<p>This address collects anonymous usage for Claude Lab and serves the private report.</p>
<p>The course stays at <a href="https://larryfang.github.io/claude-lab/">larryfang.github.io/claude-lab</a>.</p>
</body>
</html>
`;

export default function home(req, res) {
  res.setHeader("content-type", "text/html; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.setHeader("x-robots-tag", "noindex");
  if (req.method !== "GET" && req.method !== "HEAD") return res.status(405).end();
  res.status(200).end(req.method === "HEAD" ? "" : html);
}
