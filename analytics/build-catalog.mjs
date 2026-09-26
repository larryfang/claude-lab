// Snapshot the lesson titles and checks the report needs. The Vercel
// collector deploys this file instead of the course.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadCatalog } from "./report.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalog = loadCatalog(root);
const data = { lessons: [...catalog.values()], paths: catalog.paths };
fs.writeFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), "catalog.json"), `${JSON.stringify(data)}\n`);
console.log(`catalog ${data.lessons.length} lessons, ${data.paths.length} paths`);
