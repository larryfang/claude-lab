// Serves the course, accepts anonymous usage, and shows a token-gated report.
import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cleanEvent, loadCatalog, renderReport, summarize } from "./report.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json"
};

function readOrCreateToken(dataDir) {
  const file = path.join(dataDir, "token");
  try {
    const existing = fs.readFileSync(file, "utf8").trim();
    if (/^[a-f0-9]{24,}$/.test(existing)) return existing;
  } catch { /* create one below */ }
  fs.mkdirSync(dataDir, { recursive: true });
  const token = crypto.randomBytes(24).toString("hex");
  fs.writeFileSync(file, `${token}\n`, { mode: 0o600 });
  return token;
}

function sameToken(given, token) {
  const a = Buffer.from(String(given));
  const b = Buffer.from(String(token));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let settled = false;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        settled = true;
        reject(Object.assign(new Error("too big"), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => { if (!settled) resolve(Buffer.concat(chunks).toString("utf8")); });
    req.on("error", () => { if (!settled) { settled = true; reject(Object.assign(new Error("read"), { status: 400 })); } });
  });
}

function send(res, status, headers, body) {
  if (res.writableEnded || res.destroyed) return;
  res.writeHead(status, headers);
  res.end(body || "");
}

function publicOrigin(req) {
  const proto = String(req.headers["x-forwarded-proto"] || "http").split(",")[0].trim();
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0].trim();
  if (proto !== "http" && proto !== "https") return "";
  if (!/^[A-Za-z0-9.-]+(?::\d+)?$/.test(host)) return "";
  return `${proto}://${host}`;
}

export function createServer(options = {}) {
  const root = path.resolve(options.root || ROOT);
  const dataDir = path.resolve(options.dataDir || path.join(root, "analytics", "data"));
  const token = options.token || readOrCreateToken(dataDir);
  const catalog = options.catalog || loadCatalog(root);
  const eventsFile = path.join(dataDir, "events.jsonl");
  const rates = new Map();

  function allow(visitor, now) {
    if (rates.size > 2000) {
      for (const [key, slot] of rates) if (now - slot.start > 60000) rates.delete(key);
    }
    let slot = rates.get(visitor);
    if (!slot || now - slot.start > 60000) slot = { start: now, n: 0 };
    if (slot.n >= 30) {
      rates.set(visitor, slot);
      return false;
    }
    slot.n += 1;
    rates.set(visitor, slot);
    return true;
  }

  function append(events) {
    fs.mkdirSync(dataDir, { recursive: true });
    if (fs.existsSync(eventsFile) && fs.statSync(eventsFile).size > 8 * 1024 * 1024) {
      const previous = `${eventsFile}.1`;
      fs.rmSync(previous, { force: true });
      fs.renameSync(eventsFile, previous);
    }
    fs.appendFileSync(eventsFile, `${events.map((event) => JSON.stringify(event)).join("\n")}\n`);
  }

  function readEvents() {
    const out = [];
    for (const file of [`${eventsFile}.1`, eventsFile]) {
      if (!fs.existsSync(file)) continue;
      for (const line of fs.readFileSync(file, "utf8").split("\n")) {
        if (!line) continue;
        try { out.push(JSON.parse(line)); } catch { /* skip a torn line */ }
      }
    }
    return out.length > 50000 ? out.slice(-50000) : out;
  }

  function collect(req, res) {
    const cors = {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type",
      "access-control-max-age": "86400",
      "cache-control": "no-store"
    };
    if (req.method === "OPTIONS") return send(res, 204, cors);
    if (req.method !== "POST") return send(res, 405, cors);
    readBody(req, 64 * 1024).then((raw) => {
      let body;
      try { body = JSON.parse(raw || "null"); } catch {
        return send(res, 400, cors);
      }
      const list = Array.isArray(body) ? body : body && body.events;
      if (!Array.isArray(list)) return send(res, 400, cors);
      const now = Date.now();
      const kept = [];
      for (const item of list.slice(0, 30)) {
        const event = cleanEvent(item, now);
        if (!event || !allow(event.visitor, now)) continue;
        kept.push(event);
      }
      try {
        if (kept.length) append(kept);
      } catch {
        return send(res, 500, cors);
      }
      return send(res, 204, cors);
    }).catch((error) => send(res, error.status || 400, cors));
  }

  function report(req, res, url) {
    const headers = { "cache-control": "no-store", "x-frame-options": "DENY", "referrer-policy": "same-origin" };
    const given = url.searchParams.get("token") || req.headers["x-analytics-token"] || "";
    if (!sameToken(given, token)) {
      return send(res, 401, { ...headers, "content-type": "text/plain; charset=utf-8" }, "This report needs the token printed when the analytics server started.\n");
    }
    const data = summarize(readEvents(), catalog);
    if (url.pathname === "/api/report") {
      return send(res, 200, { ...headers, "content-type": "application/json; charset=utf-8" }, JSON.stringify(data));
    }
    return send(res, 200, { ...headers, "content-type": "text/html; charset=utf-8" }, renderReport(data));
  }

  function staticFile(req, res, url) {
    if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, { "content-type": "text/plain; charset=utf-8" }, "Method not allowed\n");
    let pathname = "";
    try { pathname = decodeURIComponent(url.pathname); } catch { return send(res, 400, {}, ""); }
    if (pathname.includes("\0") || pathname.split("/").includes("..")) return send(res, 400, {}, "");
    if (pathname.split("/").some((part) => part.startsWith("."))) return send(res, 404, {}, "");
    if (pathname === "/analytics/data" || pathname.startsWith("/analytics/data/")) return send(res, 404, {}, "");
    if (pathname === "/") pathname = "/index.html";
    const file = path.resolve(root, pathname.replace(/^\/+/, ""));
    const blocked = path.resolve(root, "analytics", "data");
    if (file !== root && !file.startsWith(`${root}${path.sep}`)) return send(res, 403, {}, "");
    if (file === blocked || file.startsWith(`${blocked}${path.sep}`) || file === dataDir || file.startsWith(`${dataDir}${path.sep}`)) {
      return send(res, 404, {}, "");
    }
    fs.stat(file, (error, stat) => {
      if (error || !stat.isFile()) return send(res, 404, { "content-type": "text/plain; charset=utf-8" }, "Not found\n");
      if (path.basename(file) === "index.html") {
        const origin = publicOrigin(req);
        let html = fs.readFileSync(file, "utf8");
        if (origin && !html.includes('name="claudelab-analytics"')) {
          const safe = origin.replace(/[^A-Za-z0-9:./-]/g, "");
          html = html.replace("</head>", `<meta name="claudelab-analytics" content="${safe}">\n</head>`);
        }
        return send(res, 200, { "content-type": TYPES[".html"], "cache-control": "no-cache" }, req.method === "HEAD" ? "" : html);
      }
      const type = TYPES[path.extname(file).toLowerCase()] || "application/octet-stream";
      res.writeHead(200, { "content-type": type, "cache-control": "no-cache" });
      if (req.method === "HEAD") return res.end();
      fs.createReadStream(file).pipe(res);
    });
  }

  const server = http.createServer((req, res) => {
    const url = new URL(req.url || "/", "http://127.0.0.1");
    if (url.pathname === "/api/collect") return collect(req, res);
    if (url.pathname === "/report" || url.pathname === "/api/report") return report(req, res, url);
    return staticFile(req, res, url);
  });
  server.token = token;
  return server;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const port = Number(process.env.ANALYTICS_PORT) || 8787;
  const host = process.env.ANALYTICS_HOST || "127.0.0.1";
  const server = createServer({
    token: process.env.ANALYTICS_TOKEN || undefined,
    dataDir: process.env.ANALYTICS_DIR || undefined
  });
  server.listen(port, host, () => {
    const shown = host === "0.0.0.0" || host === "::" ? "127.0.0.1" : host;
    const url = `http://${shown}:${port}`;
    console.log("Claude Lab usage report");
    console.log(`Site    ${url}`);
    console.log(`Report  ${url}/report?token=${server.token}`);
    console.log("");
    console.log("Keep the report URL private. It contains the token.");
    console.log("The published GitHub Pages site sends nothing until window.SITE.analytics");
    console.log("in assets/js/content.js is this server's public origin, with no path.");
  });
}
