import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const warn = [];
const fail = (message) => errors.push(message);

for (const file of fs.readdirSync(path.join(root, "assets/js")).filter((f) => f.endsWith(".js")).map((f) => `assets/js/${f}`)) {
  const check = spawnSync(process.execPath, ["--check", path.join(root, file)], { encoding: "utf8" });
  if (check.status !== 0) fail(`${file}: JavaScript syntax error\n${check.stderr.trim()}`);
}

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "assets/js/content.js"), "utf8"), sandbox, { filename: "content.js" });
const courses = sandbox.window.COURSES || [];
const registered = new Set();
const ids = new Set();
let lessonCount = 0;

for (const course of courses) {
  const courseIds = new Set();
  for (const module of course.modules || []) {
    if (!module.id || !module.title || !Array.isArray(module.lessons)) fail(`${course.id}: malformed module`);
    for (const lesson of module.lessons || []) {
      lessonCount++;
      if (ids.has(lesson.id)) fail(`duplicate lesson id: ${lesson.id}`);
      ids.add(lesson.id); courseIds.add(lesson.id); registered.add(lesson.file);
      const full = path.join(root, "content", lesson.file);
      if (!fs.existsSync(full)) { fail(`${lesson.id}: missing content/${lesson.file}`); continue; }
      const md = fs.readFileSync(full, "utf8");
      const outsideFences = md.replace(/```[\s\S]*?```/g, "");
      const h1s = outsideFences.match(/^#\s+.+$/gm) || [];
      if (h1s.length !== 1) fail(`${lesson.file}: expected exactly one H1, found ${h1s.length}`);
      const opens = (outsideFences.match(/^:::(?:tip|note|warning|concept|try|lab|details|faq)(?:\s|$)/gm) || []).length;
      const closes = (outsideFences.match(/^:::\s*$/gm) || []).length;
      if (opens !== closes) fail(`${lesson.file}: custom block imbalance (${opens} opens, ${closes} closes)`);
      for (const block of md.matchAll(/```quiz\s*\n([\s\S]*?)```/g)) {
        const questions = block[1].split(/^Q:\s*/m).slice(1);
        if (!questions.length) fail(`${lesson.file}: empty quiz block`);
        questions.forEach((q, i) => {
          const correct = (q.match(/^\+\s+/gm) || []).length;
          const wrong = (q.match(/^-\s+/gm) || []).length;
          if (correct !== 1 || wrong < 1) fail(`${lesson.file}: quiz question ${i + 1} needs one correct answer and at least one distractor`);
        });
      }
      for (const block of md.matchAll(/```flashcards\s*\n([\s\S]*?)```/g)) {
        const fronts = (block[1].match(/^Q:/gm) || []).length, backs = (block[1].match(/^A:/gm) || []).length;
        if (fronts < 2 || fronts !== backs) fail(`${lesson.file}: flashcards need at least two Q:/A: pairs (found ${fronts} Q, ${backs} A)`);
      }
      // A card's saved id is lessonId + hash(front), so a repeated front would share one review record.
      const allFronts = [...md.matchAll(/```flashcards\s*\n([\s\S]*?)```/g)].flatMap((b) => [...b[1].matchAll(/^Q:\s*(.*)$/gm)].map((m) => m[1].trim()));
      const dupes = allFronts.filter((f, i) => allFronts.indexOf(f) !== i);
      if (dupes.length) fail(`${lesson.file}: duplicate flashcard front "${dupes[0]}"`);
      for (const block of md.matchAll(/```order\s*\n([\s\S]*?)```/g)) {
        if ((block[1].match(/^\d+\.\s+/gm) || []).length < 3) fail(`${lesson.file}: order block needs at least three numbered items`);
      }
      for (const block of md.matchAll(/```scenario\s*\n([\s\S]*?)```/g)) {
        block[1].split(/^S:/m).slice(1).forEach((scn, i) => {
          const best = (scn.match(/^\+\s+/gm) || []).length, opts = (scn.match(/^[+~-]\s+/gm) || []).length, fbs = (scn.match(/^>\s*/gm) || []).length;
          if (best !== 1 || opts < 2 || fbs < opts) fail(`${lesson.file}: scenario ${i + 1} needs one best (+) option, at least two options, and a > consequence for each`);
        });
      }
      for (const block of md.matchAll(/```spot\s*\n([\s\S]*?)```/g)) {
        const flaws = [...block[1].matchAll(/\[\[([\s\S]*?)\]\]/g)];
        if (flaws.length < 2 || flaws.some((f) => !/\|\s*\S/.test(f[1]))) fail(`${lesson.file}: spot block needs at least two [[flaw|explanation]] marks`);
      }
    }
  }
  for (const route of course.fastPaths || []) {
    if (!route.id || !route.title || !route.audience || !route.desc || !route.lessons?.length) fail(`${course.id}: malformed fast path`);
    const seen = new Set();
    for (const id of route.lessons || []) {
      if (!courseIds.has(id)) fail(`${course.id}/${route.id}: unknown lesson ${id}`);
      if (seen.has(id)) fail(`${course.id}/${route.id}: duplicate lesson ${id}`);
      seen.add(id);
    }
  }
  for (const [id, meta] of Object.entries(course.freshness || {})) {
    if (!courseIds.has(id)) fail(`${course.id}: freshness metadata references unknown lesson ${id}`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.verifiedDate || "")) fail(`${course.id}/${id}: invalid verifiedDate`);
    if (!/^https:\/\//.test(meta.sourceUrl || "") || !meta.sourceLabel) fail(`${course.id}/${id}: freshness source must have an HTTPS URL and label`);
  }
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
}
for (const file of walk(path.join(root, "content")).filter((f) => f.endsWith(".md"))) {
  const rel = path.relative(path.join(root, "content"), file).split(path.sep).join("/");
  if (!registered.has(rel)) fail(`orphan lesson file: content/${rel}`);
  const md = fs.readFileSync(file, "utf8");
  for (const match of md.matchAll(/\]\(#\/([^\s)]+)\)/g)) {
    const bits = match[1].split("/").filter(Boolean);
    const id = bits[0] === "lesson" ? bits.slice(1).join("/") : bits.slice(1).join("/");
    if (id && id !== "path" && !ids.has(id)) fail(`${rel}: broken internal lesson link #/${match[1]}`);
  }
}

const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const versions = [...html.matchAll(/assets\/[^"']+\.(?:css|js)\?v=([^"']+)/g)].map((m) => m[1]);
const scripts = fs.readdirSync(path.join(root, "assets/js")).filter((f) => f.endsWith(".js"));
for (const f of scripts) if (!html.includes(`assets/js/${f}?v=`)) fail(`index.html: assets/js/${f} is not loaded with a ?v= version`);
if (versions.length !== scripts.length + 1 || new Set(versions).size !== 1) fail(`index.html: every asset URL must carry the same ?v= (found ${versions.join(", ")})`);
if (courses.length !== 2) warn.push(`expected 2 courses, found ${courses.length}`);

if (errors.length) {
  console.error(`Course verification failed with ${errors.length} issue(s):\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log(`Course verification passed: ${courses.length} courses, ${lessonCount} lessons, ${registered.size} registered files, ${ids.size} unique routes.`);
warn.forEach((message) => console.warn(`Warning: ${message}`));
