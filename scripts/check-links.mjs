import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { classify } from "./link-status.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const files = ["README.md", "CONTRIBUTING.md", ...walk(path.join(root, "content")).filter((f) => f.endsWith(".md"))];
const urls = new Set();
for (const file of files) {
  const full = path.isAbsolute(file) ? file : path.join(root, file);
  const text = fs.readFileSync(full, "utf8");
  for (const match of text.matchAll(/https:\/\/[^\s)<>"']+/g)) urls.add(match[0].replace(/[.,;:]$/, ""));
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
}
const skipped = [...urls].filter((url) => /example\.com|github\.com\/acme\/|YOUR_|\[|localhost|127\.0\.0\.1/.test(url));
const queue = [...urls].filter((url) => !skipped.includes(url));
const failures = [];
const blocked = [];
let checked = 0;

async function worker() {
  while (queue.length) {
    const url = queue.shift();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(url, { redirect: "follow", signal: controller.signal, headers: { "user-agent": "Claude-Lab-Link-Check/1.0" } });
      checked++;
      const result = classify(url, response.status);
      if (result === "blocked") blocked.push(`${response.status} ${url}`);
      if (result === "broken") failures.push(`${response.status} ${url}`);
    } catch (error) {
      checked++;
      failures.push(`${error.name}: ${url}`);
    } finally { clearTimeout(timer); }
  }
}
await Promise.all(Array.from({ length: 8 }, worker));
for (const entry of blocked) console.log(`::warning title=Link UNVERIFIED (host blocks CI)::${entry}`);
if (failures.length) {
  console.error(`Link check failed (${failures.length}/${checked}):\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log(`Link check passed: ${checked - blocked.length} live URLs checked, ${blocked.length} UNVERIFIED (host blocks CI), ${skipped.length} placeholders/local URLs skipped.`);
