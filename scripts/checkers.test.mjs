import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(new URL("../assets/js/checkers.js", import.meta.url), "utf8"), sandbox);
const { brief, claudemd } = sandbox.window.CHECKERS;
const letter = (r, key) => r.letters.find((l) => l.key === key);
const check = (r, id) => r.checks.find((c) => c.id === id);

const GOOD_BRIEF = `I am a PM on a reporting product. We ran eight discovery calls to decide our Q4 focus, and I have to defend the choice to a leadership review on Thursday.
Using only the transcripts in \`discovery/\` and the ticket export \`support-tickets.csv\`, produce two files in \`output/\`: \`themes.csv\` with one row per theme, and \`discovery-report.md\` with the five strongest themes ranked by evidence.
Rules: every claim needs a quote or a ticket ID. Never estimate a missing number. Do not use the web. Write only to \`output/\`.
Flag separately rather than resolving: any two customers who contradicted each other, and anything you inferred rather than read. Show me your plan before you start.`;

test("a lazy prompt scores low and names the missing letters", () => {
  const r = brief("Summarise the customer interviews and tell me what to build.");
  assert.ok(r.score <= 1, `score ${r.score}`);
  assert.equal(letter(r, "R").ok, false);
  assert.equal(letter(r, "F").ok, false);
  assert.match(letter(r, "F").hint, /surface/i);
  assert.ok(r.warnings.some((w) => /short/i.test(w)));
});

test("the course's worked brief scores 5 of 5", () => {
  const r = brief(GOOD_BRIEF);
  assert.equal(r.total, 5);
  assert.equal(r.score, 5, JSON.stringify(r.letters.filter((l) => !l.ok)));
});

test("wishes are called out as wishes", () => {
  const r = brief(GOOD_BRIEF + " Be accurate and make it high quality.");
  assert.ok(r.warnings.some((w) => /be accurate/i.test(w) && /wish/i.test(w)));
});

test("empty input scores zero without throwing", () => {
  assert.equal(brief("   ").score, 0);
  assert.equal(claudemd("").lines, 0);
});

const GOOD_MD = `# Project

## Commands
- Test: \`npm test\`
- Lint: \`npm run lint\`

## Gotchas
- Do not edit generated files in \`dist/\`.
- Dates are stored in UTC; never format them on the server.`;

test("a tight CLAUDE.md passes the structural checks", () => {
  const r = claudemd(GOOD_MD);
  assert.equal(check(r, "commands").level, "pass");
  assert.equal(check(r, "length").level, "pass");
  assert.equal(check(r, "gotchas").level, "pass");
  assert.equal(r.checks.filter((c) => c.level === "fail").length, 0);
});

test("length warns past 200 lines and fails past 300", () => {
  const filler = (n) => GOOD_MD + "\n" + Array.from({ length: n }, (_, i) => `- rule ${i}`).join("\n");
  assert.equal(check(claudemd(filler(220)), "length").level, "warn");
  assert.equal(check(claudemd(filler(320)), "length").level, "fail");
});

test("a secret fails loudly with its line number", () => {
  const r = claudemd(GOOD_MD + "\nAPI_KEY=sk-ant-abcdefghijklmnopqrstuvwxyz0123");
  const c = check(r, "secrets");
  assert.equal(c.level, "fail");
  assert.match(c.detail, /line 10/i);
});

test("vague rules and shouting are flagged", () => {
  const r = claudemd("# Rules\n- Write clean code\n- Follow best practices\nIMPORTANT: you MUST ALWAYS run tests. NEVER skip. CRITICAL. IMPORTANT.");
  assert.equal(check(r, "vague").level, "warn");
  assert.match(check(r, "vague").detail, /line 2/i);
  assert.equal(check(r, "emphasis").level, "warn");
  assert.equal(check(r, "commands").level, "warn");
});

test("a pasted directory tree is flagged as discoverable", () => {
  const r = claudemd(GOOD_MD + "\n├── src\n├── tests\n└── docs");
  assert.equal(check(r, "tree").level, "warn");
});

test("five shouted words already count as inflation", () => {
  assert.equal(check(claudemd(GOOD_MD + "\nIMPORTANT: You MUST ALWAYS do this. NEVER skip. CRITICAL."), "emphasis").level, "warn");
});

test("a tree is not prose, but one long wrapped line is", () => {
  const tree = claudemd(GOOD_MD + "\n├── src\n│   ├── api\n│   └── models\n├── tests\n└── docs");
  assert.equal(check(tree, "prose").level, "pass");
  const long = claudemd(GOOD_MD + "\n" + "The staging cluster is shared by QA and mobile for nightly builds, so do not break it, and deploys go through the pipeline rather than by hand unless there is an emergency that the on-call engineer approves in the incident channel first.");
  assert.equal(check(long, "prose").level, "warn");
  assert.match(check(long, "prose").detail, /line 10/i);
});

test("a shouted NEVER is not a project gotcha", () => {
  assert.equal(check(claudemd("# Rules\nNEVER ignore these rules.\n- Write tests"), "gotchas").level, "warn");
});
