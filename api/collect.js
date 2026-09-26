import { cleanEvent } from "../analytics/report.mjs";
import { saveEvents } from "../analytics/blob-store.mjs";

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type",
  "access-control-max-age": "86400",
  "cache-control": "no-store"
};
const rates = new Map();

function allow(visitor, now) {
  if (rates.size > 2000) {
    for (const [key, slot] of rates) if (now - slot.start > 60000) rates.delete(key);
  }
  let slot = rates.get(visitor);
  if (!slot || now - slot.start > 60000) slot = { start: now, n: 0 };
  if (slot.n >= 90) {
    rates.set(visitor, slot);
    return false;
  }
  slot.n += 1;
  rates.set(visitor, slot);
  return true;
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    if (req.body != null && req.body !== "") {
      if (typeof req.body === "string") return resolve(req.body);
      if (Buffer.isBuffer(req.body)) return resolve(req.body.toString("utf8"));
      if (typeof req.body === "object") return resolve(JSON.stringify(req.body));
    }
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

export default async function collect(req, res) {
  for (const [key, value] of Object.entries(cors)) res.setHeader(key, value);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).end();
  let raw = "";
  try { raw = await readBody(req, 64 * 1024); } catch (error) {
    return res.status(error.status || 400).end();
  }
  let body;
  try { body = JSON.parse(raw || "null"); } catch { return res.status(400).end(); }
  const list = Array.isArray(body) ? body : body && body.events;
  if (!Array.isArray(list)) return res.status(400).end();
  const now = Date.now();
  const kept = [];
  const accept = [];
  const reject = [];
  const seen = new Set();
  for (const item of list.slice(0, 30)) {
    const event = cleanEvent(item, now);
    const id = item && item.id ? String(item.id) : "";
    if (!event) {
      if (id) reject.push(id);
      continue;
    }
    if (event.id && seen.has(event.id)) {
      accept.push(event.id);
      continue;
    }
    if (!allow(event.visitor, now)) continue;
    if (event.id) seen.add(event.id);
    kept.push(event);
    if (event.id) accept.push(event.id);
  }
  try {
    if (kept.length) await saveEvents(kept);
  } catch {
    return res.status(500).end();
  }
  res.setHeader("content-type", "application/json");
  return res.status(200).end(JSON.stringify({ accept, reject }));
}
