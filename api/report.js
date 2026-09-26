import fs from "node:fs";
import path from "node:path";
import { loadCatalog, renderReport, summarize } from "../analytics/report.mjs";
import { readEvents } from "../analytics/blob-store.mjs";
import { sameToken } from "../analytics/token.mjs";

function openCatalog() {
  const root = process.cwd();
  const snapshot = path.join(root, "analytics/catalog.json");
  try {
    return loadCatalog(root);
  } catch {
    const data = JSON.parse(fs.readFileSync(snapshot, "utf8"));
    const lessons = new Map(data.lessons.map((entry) => [entry.key, entry]));
    lessons.paths = data.paths || [];
    return lessons;
  }
}

const catalog = openCatalog();

export default async function report(req, res) {
  const headers = {
    "cache-control": "no-store",
    "x-frame-options": "DENY",
    "referrer-policy": "same-origin",
    "content-type": "text/html; charset=utf-8"
  };
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { ...headers, "content-type": "text/plain; charset=utf-8" });
    return res.end("Method not allowed\n");
  }
  const token = process.env.ANALYTICS_TOKEN || "";
  const url = new URL(req.url || "/", `https://${req.headers.host || "localhost"}`);
  const given = url.searchParams.get("token") || req.headers["x-analytics-token"] || "";
  if (!sameToken(given, token)) {
    res.writeHead(401, { ...headers, "content-type": "text/plain; charset=utf-8" });
    return res.end("This report needs the token from the collector setup.\n");
  }
  let events = [];
  try { events = await readEvents(); } catch {
    res.writeHead(500, { ...headers, "content-type": "text/plain; charset=utf-8" });
    return res.end("The event store could not be read.\n");
  }
  const html = renderReport(summarize(events, catalog));
  res.writeHead(200, headers);
  return res.end(req.method === "HEAD" ? "" : html);
}
