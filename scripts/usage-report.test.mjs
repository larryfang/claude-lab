import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cleanEvent, loadCatalog, renderReport, summarize } from "../analytics/report.mjs";
import { createServer } from "../analytics/server.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function people(count) {
  return Array.from({ length: count }, (_, i) => `person${i.toString(16).padStart(8, "0")}`);
}
function catalog() {
  const lessons = new Map();
  lessons.set("cowork/the-brief", {
    key: "cowork/the-brief", course: "cowork", id: "the-brief", title: "The B.R.I.E.F. Framework",
    minutes: 11, reference: false, order: 2, nextKey: "cowork/verify",
    quizzes: [["Which part of B.R.I.E.F. prevents Cowork silently resolving an ambiguity?"]]
  });
  lessons.set("cowork/verify", {
    key: "cowork/verify", course: "cowork", id: "verify", title: "Verify Before You Send",
    minutes: 12, reference: false, order: 3, nextKey: "",
    quizzes: []
  });
  lessons.set("cowork/glossary", {
    key: "cowork/glossary", course: "cowork", id: "glossary", title: "Glossary",
    minutes: 0, reference: true, order: 0, nextKey: "", quizzes: []
  });
  lessons.paths = [];
  return lessons;
}
function stamp(visitor, type, extra) {
  return Object.assign({
    t: Date.now(),
    type,
    visitor,
    session: `${visitor}sess`.slice(0, 24),
    narrow: false
  }, extra);
}
function lessonVisit(ids, key, dwell) {
  const [course, lesson] = key.split("/");
  return ids.flatMap((visitor, index) => {
    const t = Date.now() + index;
    return [
      stamp(visitor, "view", { t, page: "lesson", course, lesson }),
      stamp(visitor, "leave", { t: t + dwell, page: "lesson", course, lesson, dwell, scroll: 80 })
    ];
  });
}

test("search text that looks like an email or a key is not stored", () => {
  const email = cleanEvent(stamp("person00000000", "search", { q: "ada@example.com", hits: 0, page: "hub" }));
  const key = cleanEvent(stamp("person00000000", "search", { q: "sk-live-secret-value", hits: 0 }));
  const topic = cleanEvent(stamp("person00000000", "search", { q: "plan mode", hits: 2 }));
  assert.equal(email.q, "");
  assert.equal(email.redacted, true);
  assert.equal(JSON.stringify(email).includes("ada@example.com"), false);
  assert.equal(key.q, "");
  assert.equal(topic.q, "plan mode");
  const noisy = cleanEvent(Object.assign(stamp("person00000000", "view", { page: "hub" }), { email: "ada@example.com", ip: "203.0.113.8" }));
  assert.equal(JSON.stringify(noisy).includes("example.com"), false);
  assert.equal(JSON.stringify(noisy).includes("203.0.113.8"), false);
});

test("seven missed answers do not recommend a quiz rewrite", () => {
  const events = people(7).map((visitor) => stamp(visitor, "quiz", {
    page: "lesson", course: "cowork", lesson: "the-brief", quiz: 0, question: 0, correct: false
  }));
  const report = summarize(events, catalog());
  assert.equal(report.actions.some((action) => action.id.startsWith("quiz:")), false);
});

test("one person answering eight times does not recommend a quiz rewrite", () => {
  const events = Array.from({ length: 8 }, () => stamp("person00000000", "quiz", {
    page: "lesson", course: "cowork", lesson: "the-brief", quiz: 0, question: 0, correct: false
  }));
  const report = summarize(events, catalog());
  assert.equal(report.actions.concat(report.early).some((action) => action.id.startsWith("quiz:")), false);
});

test("eight people missing a question recommends a rewrite and quotes it", () => {
  const events = people(8).map((visitor) => stamp(visitor, "quiz", {
    page: "lesson", course: "cowork", lesson: "the-brief", quiz: 0, question: 0, correct: false
  }));
  const report = summarize(events, catalog());
  const action = report.actions.find((item) => item.id === "quiz:cowork/the-brief:0:0");
  assert.ok(action);
  assert.match(action.detail, /Question 1/);
  assert.match(action.detail, /prevents Cowork/);
  const html = renderReport(report);
  assert.match(html, /prevents Cowork/);
  assert.equal(html.includes("person00000000"), false);
});

test("searches that find nothing become a suggestion after three people", () => {
  const term = (count) => people(count).map((visitor) => stamp(visitor, "search", { q: "worktrees", hits: 0, page: "hub" }));
  const ready = summarize(term(3), catalog());
  assert.ok(ready.actions.some((action) => action.id === "search:worktrees"));
  const early = summarize(term(2), catalog());
  assert.equal(early.actions.some((action) => action.id.startsWith("search:")), false);
  assert.ok(early.early.some((action) => action.id === "search:worktrees"));
});

test("three people missing a question is an early signal, not a course change", () => {
  const events = people(3).map((visitor) => stamp(visitor, "quiz", {
    page: "lesson", course: "cowork", lesson: "the-brief", quiz: 0, question: 0, correct: false
  }));
  const report = summarize(events, catalog());
  assert.equal(report.actions.some((action) => action.id.startsWith("quiz:")), false);
  assert.ok(report.early.some((action) => action.id === "quiz:cowork/the-brief:0:0"));
});

test("a lesson people open and do not finish is flagged, and a reference page is not", () => {
  const ids = people(10);
  const stalled = lessonVisit(ids, "cowork/the-brief", 5 * 60 * 1000);
  stalled.push(
    stamp(ids[0], "complete", { page: "lesson", course: "cowork", lesson: "the-brief", done: true, dwell: 5 * 60 * 1000 }),
    stamp(ids[1], "complete", { page: "lesson", course: "cowork", lesson: "the-brief", done: true, dwell: 5 * 60 * 1000 })
  );
  const stall = summarize(stalled, catalog());
  assert.ok(stall.actions.some((action) => action.id === "stall:cowork/the-brief"));
  const reference = lessonVisit(people(12), "cowork/glossary", 10 * 60 * 1000);
  const glossary = summarize(reference, catalog());
  assert.equal(glossary.actions.concat(glossary.early).some((action) => action.id.startsWith("stall:")), false);
});

test("the report escapes lesson text", () => {
  const lessons = catalog();
  lessons.get("cowork/the-brief").title = "<script>alert(1)</script>";
  const events = lessonVisit(people(1), "cowork/the-brief", 1000);
  const html = renderReport(summarize(events, lessons));
  assert.equal(html.includes("<script>alert"), false);
  assert.match(html, /&lt;script&gt;/);
});

test("two people and two sessions stay separate, and a repeated event counts once", () => {
  const now = Date.now();
  const ada = "person0000000a";
  const bea = "person0000000b";
  const quiz = {
    id: "eventid000000000000000000000001",
    page: "lesson", course: "cowork", lesson: "the-brief", quiz: 0, question: 0, correct: false
  };
  const events = [
    stamp(ada, "session", { t: now, id: "eventid000000000000000000000010", session: "sessiona000000000000001" }),
    stamp(ada, "view", { t: now + 1, id: "eventid000000000000000000000011", session: "sessiona000000000000001", page: "lesson", course: "cowork", lesson: "the-brief" }),
    stamp(ada, "quiz", Object.assign({ t: now + 2, session: "sessiona000000000000001" }, quiz)),
    stamp(ada, "quiz", Object.assign({ t: now + 3, session: "sessiona000000000000001" }, quiz)),
    stamp(ada, "complete", { t: now + 4, id: "eventid000000000000000000000012", session: "sessiona000000000000001", page: "lesson", course: "cowork", lesson: "the-brief", done: true, dwell: 40000 }),
    stamp(ada, "view", { t: now + 5, id: "eventid000000000000000000000013", session: "sessiona000000000000002", page: "lesson", course: "cowork", lesson: "verify" }),
    stamp(bea, "view", { t: now + 6, id: "eventid000000000000000000000014", session: "sessionb000000000000001", page: "lesson", course: "cowork", lesson: "the-brief" }),
    stamp(bea, "quiz", { t: now + 7, id: "eventid000000000000000000000015", session: "sessionb000000000000001", page: "lesson", course: "cowork", lesson: "the-brief", quiz: 0, question: 0, correct: true })
  ];
  const report = summarize(events, catalog());
  assert.equal(report.visitors, 2);
  assert.equal(report.sessions, 3);
  const brief = report.lessons.find((lesson) => lesson.title === "The B.R.I.E.F. Framework");
  const verify = report.lessons.find((lesson) => lesson.title === "Verify Before You Send");
  assert.equal(brief.viewers, 2);
  assert.equal(brief.finishers, 1);
  assert.equal(verify.viewers, 1);
  assert.equal(report.questions[0].answers, 2);
  assert.equal(report.questions[0].misses, 1);
  assert.equal(report.questions[0].people, 2);
  assert.equal(htmlHasVisitor(report), false);
});

function htmlHasVisitor(report) {
  const html = renderReport(report);
  return html.includes("person0000000a") || html.includes("person0000000b");
}

test("the course catalog includes lesson titles, quiz text, and reference pages", () => {
  const live = loadCatalog(root);
  const brief = live.get("cowork/the-brief");
  assert.equal(brief.title, "The B.R.I.E.F. Framework");
  assert.equal(brief.reference, false);
  assert.match(brief.quizzes[0][0], /B\.R\.I\.E\.F/);
  assert.equal(live.get("cowork/glossary").reference, true);
  assert.equal(live.get("cowork/glossary").order, 0);
  assert.ok(brief.nextKey);
  assert.ok(live.paths.some((item) => item.course === "cowork" && item.id === "essentials"));
});

test("the collector stores anonymous events and gates the report", async () => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "claudelab-usage-"));
  const server = createServer({ root, dataDir, token: "abc123abc123abc123abc123", catalog: catalog() });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  const ask = (method, pathname, body) => new Promise((resolve, reject) => {
    const req = http.request({
      hostname: "127.0.0.1",
      port,
      method,
      path: pathname,
      headers: body ? { "content-type": "text/plain", "content-length": Buffer.byteLength(body) } : {}
    }, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString("utf8") }));
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
  try {
    const home = await ask("GET", "/");
    assert.equal(home.status, 200);
    assert.match(home.body, new RegExp(`claudelab-analytics" content="http://127\\.0\\.0\\.1:${port}"`));

    const locked = await ask("GET", "/report");
    assert.equal(locked.status, 401);
    const wrong = await ask("GET", "/report?token=nope");
    assert.equal(wrong.status, 401);

    const hidden = await ask("GET", "/analytics/data/events.jsonl");
    assert.equal(hidden.status, 404);

    const email = "ada@example.com";
    const posted = await ask("POST", "/api/collect", JSON.stringify({
      events: [
        stamp("person0000000a", "view", { page: "lesson", course: "cowork", lesson: "the-brief" }),
        stamp("person0000000a", "search", { q: email, hits: 0, page: "hub" }),
        Object.assign(stamp("person0000000a", "view", { page: "hub" }), { ip: "203.0.113.9" })
      ]
    }));
    assert.equal(posted.status, 204);
    assert.equal(posted.headers["access-control-allow-origin"], "*");

    const stored = fs.readFileSync(path.join(dataDir, "events.jsonl"), "utf8");
    assert.equal(stored.includes(email), false);
    assert.equal(stored.includes("203.0.113.9"), false);

    const burst = people(1).flatMap(() => Array.from({ length: 30 }, (_, i) => stamp("person0000000b", "view", {
      t: Date.now() + i, page: "hub"
    })));
    assert.equal((await ask("POST", "/api/collect", JSON.stringify({ events: burst }))).status, 204);
    assert.equal((await ask("POST", "/api/collect", JSON.stringify({ events: [stamp("person0000000b", "view", { page: "hub" })] }))).status, 204);
    const lines = fs.readFileSync(path.join(dataDir, "events.jsonl"), "utf8").trim().split("\n");
    const fromBurst = lines.filter((line) => line.includes("person0000000b"));
    assert.equal(fromBurst.length, 30);

    const report = await ask("GET", "/report?token=abc123abc123abc123abc123");
    assert.equal(report.status, 200);
    assert.match(report.body, /The B\.R\.I\.E\.F\. Framework/);
    assert.equal(report.body.includes(email), false);
    assert.match(report.body, /dropped because the text looked like an email/);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    fs.rmSync(dataDir, { recursive: true, force: true });
  }
});
