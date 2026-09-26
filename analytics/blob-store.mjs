// Permanent event store for the Vercel collector. Each event is one private blob.
import { get, list, put } from "@vercel/blob";
import crypto from "node:crypto";

const PREFIX = "events/";

export async function saveEvents(events) {
  await Promise.all(events.map((event) => put(
    event.id
      ? `${PREFIX}id/${event.id}.json`
      : `${PREFIX}${event.t}-${event.visitor.slice(0, 12)}-${crypto.randomBytes(4).toString("hex")}.json`,
    JSON.stringify(event),
    { access: "private", contentType: "application/json", addRandomSuffix: false, allowOverwrite: true }
  )));
}

async function readBlob(pathname) {
  const result = await get(pathname, { access: "private", useCache: false });
  if (!result || !result.stream) return null;
  const text = await new Response(result.stream).text();
  try { return JSON.parse(text); } catch { return null; }
}

export async function readEvents() {
  const found = [];
  let cursor;
  do {
    const page = await list({ prefix: PREFIX, limit: 1000, cursor });
    found.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor && found.length < 5000);
  found.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  const chosen = found.slice(0, 5000);
  const events = [];
  for (let i = 0; i < chosen.length; i += 20) {
    const chunk = await Promise.all(chosen.slice(i, i + 20).map((blob) => readBlob(blob.pathname)));
    for (const event of chunk) if (event) events.push(event);
  }
  return events;
}
