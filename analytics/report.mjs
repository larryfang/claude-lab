// Provider usage report. Anonymous events in, a course-edit report out.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const ACT = { viewers: 8, answers: 8, people: 5, searches: 3, views: 10, jumps: 5 };
const EARLY = { viewers: 3, answers: 3, people: 3, searches: 2, views: 4, jumps: 3 };
const PAGES = new Set(["hub", "lesson", "review", "notebook", "progress", "path", "certificate", "course"]);
const SLUG = /^[a-z0-9-]{1,80}$/;
const ID = /^[a-z0-9]{8,64}$/;
const HOST = /^[a-z0-9.-]{1,120}$/;
const TYPES = new Set(["session", "view", "leave", "complete", "quiz", "search"]);
const COURSE_ORIGIN = "https://larryfang.github.io/claude-lab";
const PAGE_LABELS = {
  hub: "Home",
  review: "Review deck",
  notebook: "Notebook",
  progress: "Progress",
  certificate: "Certificate",
  course: "Course overview"
};

export function redactQuery(raw) {
  const q = String(raw || "").replace(/\s+/g, " ").trim();
  if (q.length < 3 || q.length > 80 || q.split(" ").length > 8) return "";
  if (/@/.test(q)) return "";
  if (/(sk-|xox[baprs]-|ghp_|github_pat_|akia|bearer\s|api[_-]?key|secret|token)/i.test(q)) return "";
  if (/\b[a-f0-9]{16,}\b/i.test(q)) return "";
  return q;
}

function clamp(n, min, max) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

export function cleanEvent(raw, now = Date.now()) {
  if (!raw || typeof raw !== "object" || !TYPES.has(raw.type)) return null;
  const visitor = String(raw.visitor || "");
  const session = String(raw.session || "");
  if (!ID.test(visitor) || !ID.test(session)) return null;
  const t = Number(raw.t);
  if (!Number.isFinite(t) || t < now - 400 * 864e5 || t > now + 5 * 60 * 1000) return null;
  const ev = { t, type: raw.type, visitor, session, narrow: !!raw.narrow };
  if (ID.test(String(raw.id || ""))) ev.id = String(raw.id);
  if (SLUG.test(raw.course || "")) ev.course = raw.course;
  if (SLUG.test(raw.lesson || "")) ev.lesson = raw.lesson;
  if (PAGES.has(raw.page)) ev.page = raw.page;
  if (raw.type === "leave") {
    ev.dwell = clamp(Number(raw.dwell) || 0, 0, 2 * 3600 * 1000);
    ev.scroll = clamp(Math.round(Number(raw.scroll) || 0), 0, 100);
  }
  if (raw.type === "complete") {
    ev.done = raw.done !== false;
    ev.dwell = clamp(Number(raw.dwell) || 0, 0, 2 * 3600 * 1000);
  }
  if (raw.type === "quiz") {
    ev.quiz = clamp(Math.round(Number(raw.quiz) || 0), 0, 20);
    ev.question = clamp(Math.round(Number(raw.question) || 0), 0, 40);
    ev.correct = raw.correct === true;
  }
  if (raw.type === "search") {
    ev.q = redactQuery(raw.q);
    ev.hits = clamp(Math.round(Number(raw.hits) || 0), 0, 50);
    ev.redacted = !ev.q && (raw.redacted === true || String(raw.q || "").trim().length > 0);
    if (!ev.q && !ev.redacted) return null;
  }
  if (raw.type === "session") {
    const ref = String(raw.ref || "").toLowerCase();
    if (HOST.test(ref)) ev.ref = ref;
  }
  return ev;
}

function readQuizzes(root, file) {
  if (!file) return [];
  let md = "";
  try { md = fs.readFileSync(path.join(root, "content", file), "utf8"); } catch { return []; }
  const quizzes = [];
  for (const block of md.matchAll(/```quiz\r?\n([\s\S]*?)```/g)) {
    const questions = [];
    for (const line of block[1].split(/\r?\n/)) {
      const match = line.match(/^Q:\s*(.+)$/i);
      if (match) questions.push(match[1].trim());
    }
    if (questions.length) quizzes.push(questions);
  }
  return quizzes;
}

export function loadCatalog(root) {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, "assets/js/content.js"), "utf8"), sandbox, { filename: "content.js" });
  const lessons = new Map();
  const paths = [];
  for (const course of sandbox.window.COURSES || []) {
    const sequence = [];
    for (const module of course.modules || []) {
      const reference = module.id === "reference";
      for (const lesson of module.lessons || []) {
        const key = `${course.id}/${lesson.id}`;
        if (lessons.has(key)) continue;
        const entry = {
          key,
          course: course.id,
          id: lesson.id,
          title: lesson.title,
          minutes: Number(lesson.minutes) || 0,
          reference: reference || lesson.level === "Reference",
          quizzes: readQuizzes(root, lesson.file),
          order: 0,
          nextKey: ""
        };
        lessons.set(key, entry);
        if (!entry.reference) sequence.push(entry);
      }
    }
    sequence.forEach((entry, index) => {
      entry.order = index + 1;
      entry.nextKey = sequence[index + 1] ? sequence[index + 1].key : "";
    });
    for (const fast of course.fastPaths || []) {
      const lastId = fast.lessons[fast.lessons.length - 1];
      const last = lessons.get(`${course.id}/${lastId}`);
      paths.push({
        course: course.id,
        id: fast.id,
        title: fast.title,
        lastKey: `${course.id}/${lastId}`,
        lastTitle: last ? last.title : lastId
      });
    }
  }
  lessons.paths = paths;
  return lessons;
}

function courseHref(course, id) {
  return `${COURSE_ORIGIN}/#/${course}/${id}`;
}

function lessonKey(ev) {
  if (!ev.course || !ev.lesson || ev.course === "daily") return "";
  return `${ev.course}/${ev.lesson}`;
}

function blankLesson() {
  return {
    views: 0,
    viewers: new Set(),
    finishers: new Set(),
    dwellSum: 0,
    dwellN: 0,
    scrollSum: 0,
    scrollN: 0,
    bounces: 0,
    narrowViewers: new Set(),
    wideViewers: new Set(),
    narrowFinish: new Set(),
    wideFinish: new Set(),
    fast: new Set()
  };
}

function fold(rawEvents, catalog, now) {
  const seen = new Set();
  const events = [];
  for (const event of rawEvents.map((item) => cleanEvent(item, now)).filter(Boolean).sort((a, b) => a.t - b.t)) {
    if (event.id && seen.has(event.id)) continue;
    if (event.id) seen.add(event.id);
    events.push(event);
  }
  const model = {
    visitors: new Set(),
    sessions: new Set(),
    from: null,
    to: null,
    lessonOpens: 0,
    redactedSearches: 0,
    unknown: 0,
    lessons: new Map(),
    questions: new Map(),
    searches: new Map(),
    pages: new Map(),
    referrers: new Map(),
    jumps: new Map(),
    paths: new Map(),
    sequences: new Map()
  };
  const known = (key) => catalog.has(key);
  const lessonOf = (key) => {
    if (!model.lessons.has(key)) model.lessons.set(key, blankLesson());
    return model.lessons.get(key);
  };
  for (const ev of events) {
    model.visitors.add(ev.visitor);
    model.sessions.add(ev.session);
    model.from = model.from == null ? ev.t : Math.min(model.from, ev.t);
    model.to = model.to == null ? ev.t : Math.max(model.to, ev.t);
    const key = lessonKey(ev);
    if (key && ev.page !== "path" && !known(key) && (ev.type === "view" || ev.type === "leave" || ev.type === "complete" || ev.type === "quiz")) model.unknown++;
    if (ev.type === "search") {
      if (ev.redacted || !ev.q) model.redactedSearches++;
      else {
        const term = ev.q.toLowerCase();
        if (!model.searches.has(term)) model.searches.set(term, { q: ev.q, n: 0, zero: 0, people: new Set() });
        const search = model.searches.get(term);
        search.n++;
        search.people.add(ev.visitor);
        if (!ev.hits) search.zero++;
      }
      continue;
    }
    if (ev.type === "session" && ev.ref) {
      if (!model.referrers.has(ev.ref)) model.referrers.set(ev.ref, new Set());
      model.referrers.get(ev.ref).add(ev.session);
    }
    if (ev.type === "view" && ev.page && ev.page !== "lesson" && PAGE_LABELS[ev.page]) {
      if (!model.pages.has(ev.page)) model.pages.set(ev.page, { views: 0, visitors: new Set(), dwellSum: 0, dwellN: 0 });
      const page = model.pages.get(ev.page);
      page.views++;
      page.visitors.add(ev.visitor);
    }
    if (ev.type === "leave" && ev.page && model.pages.has(ev.page)) {
      const page = model.pages.get(ev.page);
      page.dwellSum += ev.dwell;
      page.dwellN++;
    }
    if (ev.type === "view" && ev.page === "path" && key) {
      const pathKey = key;
      if (!model.paths.has(pathKey)) model.paths.set(pathKey, { viewers: new Set(), views: 0 });
      model.paths.get(pathKey).viewers.add(ev.visitor);
      model.paths.get(pathKey).views++;
    }
    if (!key || !known(key)) continue;
    const lesson = lessonOf(key);
    if (ev.type === "view" && ev.page === "lesson") {
      lesson.views++;
      model.lessonOpens++;
      lesson.viewers.add(ev.visitor);
      (ev.narrow ? lesson.narrowViewers : lesson.wideViewers).add(ev.visitor);
      const seq = model.sequences.get(ev.session) || [];
      if (seq[seq.length - 1] !== key) seq.push(key);
      model.sequences.set(ev.session, seq);
      if (seq.length >= 3) {
        const [a, b, c] = seq.slice(-3);
        if (a === c && a !== b) model.jumps.set(`${a}>${b}`, (model.jumps.get(`${a}>${b}`) || 0) + 1);
      }
    }
    if (ev.type === "leave" && ev.page === "lesson") {
      lesson.dwellSum += ev.dwell;
      lesson.dwellN++;
      lesson.scrollSum += ev.scroll;
      lesson.scrollN++;
      if (ev.dwell < 12000) lesson.bounces++;
    }
    if (ev.type === "complete") {
      if (ev.done) {
        lesson.finishers.add(ev.visitor);
        (ev.narrow ? lesson.narrowFinish : lesson.wideFinish).add(ev.visitor);
        if (ev.dwell > 0 && ev.dwell < 20000) lesson.fast.add(ev.visitor);
      } else {
        lesson.finishers.delete(ev.visitor);
        lesson.narrowFinish.delete(ev.visitor);
        lesson.wideFinish.delete(ev.visitor);
        lesson.fast.delete(ev.visitor);
      }
    }
    if (ev.type === "quiz") {
      const qk = `${key}:${ev.quiz}:${ev.question}`;
      if (!model.questions.has(qk)) model.questions.set(qk, { answers: 0, misses: 0, people: new Set(), quiz: ev.quiz, question: ev.question, lesson: key });
      const q = model.questions.get(qk);
      q.answers++;
      q.people.add(ev.visitor);
      if (!ev.correct) q.misses++;
    }
  }
  return model;
}

function pct(part, whole) {
  if (!whole) return "0%";
  return `${Math.round((part / whole) * 100)}%`;
}

function fmtDuration(ms) {
  const seconds = Math.max(0, Math.round(ms / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 90) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem ? `${hours}h ${rem}m` : `${hours}h`;
}

function recommend(model, catalog, mins) {
  const actions = [];
  const push = (action) => actions.push(action);
  for (const [key, lesson] of model.lessons) {
    const meta = catalog.get(key);
    if (!meta) continue;
    const viewers = lesson.viewers.size;
    const finishers = lesson.finishers.size;
    const finishRate = viewers ? finishers / viewers : 0;
    const avgDwell = lesson.dwellN ? lesson.dwellSum / lesson.dwellN : 0;
    const avgScroll = lesson.scrollN ? lesson.scrollSum / lesson.scrollN : 100;
    const href = courseHref(meta.course, meta.id);
    if (!meta.reference && viewers >= mins.viewers && finishRate < 0.4 && avgDwell >= 3 * 60 * 1000) {
      push({
        id: `stall:${key}`,
        severity: "high",
        score: viewers - finishers,
        title: `People stall in “${meta.title}”`,
        detail: `${viewers} people opened it and ${finishers} marked it done, after about ${fmtDuration(avgDwell)}${meta.minutes ? ` on a ${meta.minutes}-minute lesson` : ""}. Move the first exercise up, or split the lesson so the first win comes sooner.`,
        href
      });
    }
    if (viewers >= mins.viewers && lesson.views >= mins.views && lesson.bounces / lesson.views >= 0.6 && finishRate < 0.5) {
      push({
        id: `bounce:${key}`,
        severity: "high",
        score: lesson.bounces,
        title: `“${meta.title}” is opened and left`,
        detail: `${lesson.bounces} of ${lesson.views} visits lasted under 12 seconds. The title or the opening is missing what people came for.`,
        href
      });
    }
    if (!meta.reference && lesson.scrollN >= mins.viewers && avgScroll < 40 && avgDwell > 60 * 1000 && finishRate < 0.45 && meta.minutes >= 8) {
      push({
        id: `shallow:${key}`,
        severity: "medium",
        score: viewers,
        title: `Readers stop partway through “${meta.title}”`,
        detail: `They get about ${Math.round(avgScroll)}% of the way down, after ${fmtDuration(avgDwell)}. Move the useful part higher, or shorten what comes before it.`,
        href
      });
    }
    if (!meta.reference && meta.minutes >= 8 && viewers >= mins.viewers && finishRate >= 0.4 && avgDwell > Math.max(meta.minutes * 1.8, 8) * 60 * 1000) {
      push({
        id: `overtime:${key}`,
        severity: "medium",
        score: avgDwell,
        title: `“${meta.title}” takes longer than the lesson says`,
        detail: `It is marked as ${meta.minutes} minutes, and people who stay spend about ${fmtDuration(avgDwell)}. Cut the lesson, or correct the estimate so the path length is honest.`,
        href
      });
    }
    if (lesson.fast.size >= mins.people && finishers >= mins.people && lesson.fast.size / finishers >= 0.5) {
      push({
        id: `fast:${key}`,
        severity: "medium",
        score: lesson.fast.size,
        title: `“${meta.title}” is being marked done immediately`,
        detail: `${lesson.fast.size} of ${finishers} people who finished it spent under 20 seconds on the page. Put the real task where it cannot be skipped, and keep the completion button after that task.`,
        href
      });
    }
    const narrowV = lesson.narrowViewers.size;
    const wideV = lesson.wideViewers.size;
    if (narrowV >= 15 && wideV >= 15) {
      const narrowRate = lesson.narrowFinish.size / narrowV;
      const wideRate = lesson.wideFinish.size / wideV;
      if (wideRate >= 0.2 && narrowRate < wideRate * 0.65) {
        push({
          id: `mobile:${key}`,
          severity: "medium",
          score: wideV + narrowV,
          title: `Phone users fall behind on “${meta.title}”`,
          detail: `Narrow screens finish ${pct(lesson.narrowFinish.size, narrowV)} of the time (${narrowV} people). Wide screens finish ${pct(lesson.wideFinish.size, wideV)} (${wideV} people). Read the lesson on a phone and fix the part that is hard to use there.`,
          href
        });
      }
    }
  }
  for (const [qk, q] of model.questions) {
    const meta = catalog.get(q.lesson);
    if (!meta || q.answers < mins.answers || q.people.size < mins.people || q.misses / q.answers < 0.45) continue;
    const text = (meta.quizzes[q.quiz] && meta.quizzes[q.quiz][q.question]) || "";
    const quoted = text ? ` “${text.length > 140 ? `${text.slice(0, 137)}…` : text}”` : "";
    push({
      id: `quiz:${qk}`,
      severity: "high",
      score: q.misses,
      title: `A check in “${meta.title}” is being missed`,
      detail: `Question ${q.question + 1} is missed ${pct(q.misses, q.answers)} of the time (${q.misses} of ${q.answers} answers, ${q.people.size} people).${quoted} Teach that point before the check, or rewrite the question so it matches what the lesson taught.`,
      href: courseHref(meta.course, meta.id)
    });
  }
  for (const search of model.searches.values()) {
    if (search.zero < mins.searches || search.zero / search.n < 0.8) continue;
    push({
      id: `search:${search.q.toLowerCase()}`,
      severity: "medium",
      score: search.zero,
      title: `People search for “${search.q}” and find nothing`,
      detail: `${search.zero} of ${search.n} searches for this had no match (${search.people.size} people). Add it to a lesson, the glossary, or that lesson’s keywords.`,
      href: ""
    });
  }
  for (const [id, count] of model.jumps) {
    if (count < mins.jumps) continue;
    const [from, to] = id.split(">");
    const a = catalog.get(from);
    const b = catalog.get(to);
    if (!a || !b || a.reference || b.reference) continue;
    push({
      id: `jump:${id}`,
      severity: "medium",
      score: count,
      title: `People leave “${a.title}” for “${b.title}”, then come back`,
      detail: `This happened ${count} times. “${a.title}” is probably missing an idea that “${b.title}” explains. Move that idea up, or link it where people get stuck.`,
      href: courseHref(a.course, a.id)
    });
  }
  const worst = new Map();
  for (const meta of catalog.values()) {
    if (!meta.nextKey || !meta.order) continue;
    const current = model.lessons.get(meta.key);
    const next = model.lessons.get(meta.nextKey);
    const nextMeta = catalog.get(meta.nextKey);
    if (!current || !next || !nextMeta) continue;
    const viewers = current.viewers.size;
    const nextViewers = next.viewers.size;
    if (viewers < mins.viewers || nextViewers / viewers >= 0.55) continue;
    const drop = viewers - nextViewers;
    const prev = worst.get(meta.course);
    if (!prev || drop > prev.drop) worst.set(meta.course, { meta, nextMeta, viewers, nextViewers, drop });
  }
  for (const drop of worst.values()) {
    push({
      id: `drop:${drop.meta.key}`,
      severity: "high",
      score: drop.drop,
      title: `People stop after “${drop.meta.title}”`,
      detail: `${drop.viewers} people opened it and ${drop.nextViewers} opened the next lesson, “${drop.nextMeta.title}”. Look at the ending of this lesson and the start of the next one.`,
      href: courseHref(drop.meta.course, drop.meta.id)
    });
  }
  for (const fast of catalog.paths || []) {
    const stat = model.paths.get(`${fast.course}/${fast.id}`);
    if (!stat || stat.viewers.size < mins.viewers) continue;
    const last = model.lessons.get(fast.lastKey);
    const finished = last ? [...stat.viewers].filter((visitor) => last.finishers.has(visitor)).length : 0;
    if (finished / stat.viewers.size >= 0.35) continue;
    push({
      id: `path:${fast.course}/${fast.id}`,
      severity: "high",
      score: stat.viewers.size - finished,
      title: `The “${fast.title}” path is not getting finished`,
      detail: `${stat.viewers.size} people opened this path and ${finished} reached the last lesson, “${fast.lastTitle}”. The path is too long, or an early lesson is where they drop.`,
      href: courseHref(fast.course, `path/${fast.id}`)
    });
  }
  const rank = { high: 0, medium: 1 };
  actions.sort((a, b) => rank[a.severity] - rank[b.severity] || b.score - a.score);
  return actions;
}

function questionText(catalog, q) {
  const meta = catalog.get(q.lesson);
  const text = meta && meta.quizzes[q.quiz] && meta.quizzes[q.quiz][q.question];
  return text || "";
}

function publish(model, catalog, actions, early) {
  const lessons = [...model.lessons].filter(([, lesson]) => lesson.views || lesson.finishers.size).map(([key, lesson]) => {
    const meta = catalog.get(key);
    return {
      key,
      title: meta ? meta.title : key,
      minutes: meta ? meta.minutes : 0,
      views: lesson.views,
      viewers: lesson.viewers.size,
      finishers: lesson.finishers.size,
      avgDwell: lesson.dwellN ? Math.round(lesson.dwellSum / lesson.dwellN) : null,
      avgScroll: lesson.scrollN ? Math.round(lesson.scrollSum / lesson.scrollN) : null,
      bounces: lesson.bounces,
      href: meta ? courseHref(meta.course, meta.id) : ""
    };
  }).sort((a, b) => b.viewers - a.viewers || b.views - a.views);

  const questions = [...model.questions.values()].filter((q) => q.answers >= 1).map((q) => {
    const meta = catalog.get(q.lesson);
    return {
      key: `${q.lesson}:${q.quiz}:${q.question}`,
      title: meta ? meta.title : q.lesson,
      quiz: q.quiz,
      question: q.question,
      text: questionText(catalog, q),
      answers: q.answers,
      misses: q.misses,
      people: q.people.size,
      href: meta ? courseHref(meta.course, meta.id) : ""
    };
  }).sort((a, b) => b.misses / b.answers - a.misses / a.answers || b.answers - a.answers).slice(0, 10);

  const searches = [...model.searches.values()].map((search) => ({
    q: search.q,
    n: search.n,
    zero: search.zero,
    people: search.people.size
  })).sort((a, b) => b.zero - a.zero || b.n - a.n).slice(0, 12);

  const pages = [...model.pages].map(([id, page]) => ({
    id,
    label: PAGE_LABELS[id] || id,
    views: page.views,
    visitors: page.visitors.size,
    avgDwell: page.dwellN ? Math.round(page.dwellSum / page.dwellN) : null
  }));
  for (const fast of catalog.paths || []) {
    const stat = model.paths.get(`${fast.course}/${fast.id}`);
    if (!stat || !stat.views) continue;
    pages.push({ id: `path:${fast.id}`, label: `Path · ${fast.title}`, views: stat.views, visitors: stat.viewers.size, avgDwell: null });
  }
  pages.sort((a, b) => b.views - a.views);

  const referrers = [...model.referrers].map(([host, sessions]) => ({ host, sessions: sessions.size }))
    .sort((a, b) => b.sessions - a.sessions).slice(0, 8);

  let completions = 0;
  for (const lesson of model.lessons.values()) completions += lesson.finishers.size;

  return {
    visitors: model.visitors.size,
    sessions: model.sessions.size,
    from: model.from,
    to: model.to,
    lessonOpens: model.lessonOpens,
    completions,
    redactedSearches: model.redactedSearches,
    unknown: model.unknown,
    actions,
    early,
    lessons,
    questions,
    searches,
    pages,
    referrers
  };
}

export function summarize(rawEvents, catalog, now = Date.now()) {
  const model = fold(rawEvents, catalog, now);
  const actions = recommend(model, catalog, ACT).slice(0, 8);
  const seen = new Set(actions.map((action) => action.id));
  const early = recommend(model, catalog, EARLY).filter((action) => !seen.has(action.id)).slice(0, 6);
  return publish(model, catalog, actions, early);
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

function fmtDay(t) {
  if (!t) return "";
  return new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", year: "numeric", timeZone: "Australia/Sydney" }).format(new Date(t));
}

function fmtClock(ms) {
  return ms == null ? "—" : fmtDuration(ms);
}

function actionList(actions) {
  if (!actions.length) return "";
  return actions.map((action) => `<article class="action ${esc(action.severity)}"><h3>${esc(action.title)}</h3><p>${esc(action.detail)}</p>${action.href ? `<a href="${esc(action.href)}">Open it</a>` : ""}</article>`).join("");
}

export function renderReport(report) {
  const range = report.from ? `${fmtDay(report.from)} – ${fmtDay(report.to)}` : "No visits yet";
  const lessonRows = report.lessons.map((lesson) => `<tr><td><a href="${esc(lesson.href)}">${esc(lesson.title)}</a></td><td class="num">${lesson.viewers}</td><td class="num">${lesson.views}</td><td class="num">${lesson.finishers} / ${lesson.viewers}</td><td class="num">${fmtClock(lesson.avgDwell)}</td><td class="num">${lesson.avgScroll == null ? "—" : `${lesson.avgScroll}%`}</td><td class="num">${lesson.bounces}</td></tr>`).join("");
  const questionRows = report.questions.map((q) => `<tr><td><a href="${esc(q.href)}">${esc(q.title)}</a><div class="sub">Question ${q.question + 1}${q.text ? ` · ${esc(q.text)}` : ""}</div></td><td class="num">${q.misses} / ${q.answers}</td><td class="num">${pct(q.misses, q.answers)}</td><td class="num">${q.people}</td></tr>`).join("");
  const searchRows = report.searches.map((search) => `<tr><td>${esc(search.q)}</td><td class="num">${search.n}</td><td class="num">${search.zero}</td><td class="num">${search.people}</td></tr>`).join("");
  const maxPage = report.pages.reduce((max, page) => Math.max(max, page.views), 0);
  const pageRows = report.pages.map((page) => {
    const width = maxPage ? Math.round((page.views / maxPage) * 100) : 0;
    return `<tr><td>${esc(page.label)}</td><td class="num">${page.visitors}</td><td class="num">${page.views}</td><td class="num">${fmtClock(page.avgDwell)}</td><td><span class="bar"><span style="width:${width}%"></span></span></td></tr>`;
  }).join("");
  const referrerRows = report.referrers.map((ref) => `<tr><td>${esc(ref.host)}</td><td class="num">${ref.sessions}</td></tr>`).join("");
  const waiting = report.visitors < 3
    ? `<p class="hint">Tables update from the first visit. A suggestion appears only when several people show the same pattern, so one pass through the course cannot rewrite a lesson.</p>`
    : "";
  const change = report.actions.length
    ? actionList(report.actions)
    : `<p class="hint">Nothing has cleared the bar for a course change.</p>`;
  const notes = [
    report.redactedSearches ? `${report.redactedSearches} search${report.redactedSearches === 1 ? "" : "es"} dropped because the text looked like an email, a key, or a long paste.` : "",
    report.unknown ? `${report.unknown} event${report.unknown === 1 ? "" : "s"} named a lesson that is not in the course.` : ""
  ].filter(Boolean);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<meta name="referrer" content="same-origin">
<title>Claude Lab usage</title>
<style>
  :root { color-scheme: light dark; --bg: #f4f1ec; --ink: #1c1917; --muted: #44403c; --card: #fff; --line: #e7e0d8; --link: #9a3412; --high: #b42318; --mid: #b45309; }
  @media (prefers-color-scheme: dark) {
    :root { --bg: #1c1917; --ink: #f5f0ea; --muted: #d6d3d1; --card: #292524; --line: #44403c; --link: #fdba74; --high: #fca5a5; --mid: #fdba74; }
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--ink); font: 16px/1.5 ui-sans-serif, system-ui, sans-serif; }
  main { max-width: 980px; margin: 0 auto; padding: 32px 20px 72px; }
  h1 { font-size: 1.9rem; line-height: 1.15; margin: 0 0 8px; }
  h2 { font-size: 1.15rem; margin: 32px 0 8px; }
  h3 { font-size: 1rem; margin: 0 0 6px; }
  p { margin: 0 0 10px; }
  a { color: var(--link); }
  .eyebrow { margin: 0; color: var(--muted); font-size: 0.82rem; letter-spacing: 0.04em; text-transform: uppercase; }
  .range { color: var(--muted); }
  .stats { display: flex; flex-wrap: wrap; gap: 10px; margin: 18px 0; padding: 0; list-style: none; }
  .stats li { background: var(--card); border: 1px solid var(--line); border-radius: 12px; min-width: 120px; padding: 10px 12px; }
  .stats b { display: block; font-size: 1.35rem; }
  .stats span { color: var(--muted); font-size: 0.82rem; }
  .action { background: var(--card); border-left: 4px solid var(--mid); border-radius: 0 12px 12px 0; margin: 10px 0; padding: 12px 14px; }
  .action.high { border-left-color: var(--high); }
  .hint { color: var(--muted); }
  .wrap { overflow-x: auto; border: 1px solid var(--line); border-radius: 12px; background: var(--card); }
  table { border-collapse: collapse; width: 100%; min-width: 640px; }
  th, td { border-bottom: 1px solid var(--line); padding: 8px 10px; text-align: left; vertical-align: top; }
  th { color: var(--muted); font-size: 0.75rem; letter-spacing: 0.04em; text-transform: uppercase; }
  tr:last-child td { border-bottom: 0; }
  .num { font-variant-numeric: tabular-nums; text-align: right; white-space: nowrap; }
  .sub { color: var(--muted); font-size: 0.88rem; margin-top: 2px; }
  .bar { background: var(--line); border-radius: 99px; display: block; height: 8px; min-width: 80px; }
  .bar span { background: var(--link); border-radius: 99px; display: block; height: 8px; }
  footer { color: var(--muted); font-size: 0.88rem; margin-top: 28px; }
  .notes { margin-top: 8px; }
</style>
</head>
<body>
<main>
  <p class="eyebrow">Claude Lab · course usage</p>
  <h1>What to change</h1>
  <p class="range">${esc(range)}. Refresh this page for the latest numbers.</p>
  <ul class="stats">
    <li><b>${report.visitors}</b><span>People</span></li>
    <li><b>${report.sessions}</b><span>Sessions</span></li>
    <li><b>${report.lessonOpens}</b><span>Lesson opens</span></li>
    <li><b>${report.completions}</b><span>Lessons finished</span></li>
  </ul>
  ${waiting}
  <h2>Change the course</h2>
  ${change}
  ${report.early.length ? `<h2>Early signals</h2><p class="hint">A few people, not enough to rewrite from. Wait until the same item appears under Change the course.</p>${actionList(report.early)}` : ""}
  <h2>Lessons</h2>
  ${report.lessons.length ? `<div class="wrap"><table><thead><tr><th>Lesson</th><th class="num">People</th><th class="num">Opens</th><th class="num">Finished</th><th class="num">Avg time</th><th class="num">Scroll</th><th class="num">Quick exits</th></tr></thead><tbody>${lessonRows}</tbody></table></div>` : `<p class="hint">No lesson opens yet.</p>`}
  <h2>Quiz questions</h2>
  ${report.questions.length ? `<div class="wrap"><table><thead><tr><th>Question</th><th class="num">Missed</th><th class="num">Miss rate</th><th class="num">People</th></tr></thead><tbody>${questionRows}</tbody></table></div>` : `<p class="hint">No quiz answers yet.</p>`}
  <h2>Searches</h2>
  ${report.searches.length ? `<div class="wrap"><table><thead><tr><th>Term</th><th class="num">Searches</th><th class="num">No results</th><th class="num">People</th></tr></thead><tbody>${searchRows}</tbody></table></div>` : `<p class="hint">No searches yet.</p>`}
  <h2>Where time goes</h2>
  ${report.pages.length ? `<div class="wrap"><table><thead><tr><th>Page</th><th class="num">People</th><th class="num">Opens</th><th class="num">Avg time</th><th>Volume</th></tr></thead><tbody>${pageRows}</tbody></table></div>` : `<p class="hint">No page opens yet.</p>`}
  ${referrerRows ? `<h2>Arrived from</h2><div class="wrap"><table><thead><tr><th>Site</th><th class="num">Sessions</th></tr></thead><tbody>${referrerRows}</tbody></table></div>` : ""}
  <footer>
    <p>Anonymous events only. No names, reflections, prompts, checker text, or IP addresses. Search text is kept only when it is a short topic.</p>
    ${notes.length ? `<p class="notes">${esc(notes.join(" "))}</p>` : ""}
  </footer>
</main>
</body>
</html>`;
}
