import test from "node:test";
import assert from "node:assert/strict";
import { classify, extractUrls } from "./link-status.mjs";

test("Reddit and Substack 403s are bot blocks, not broken links", () => {
  assert.equal(classify("https://www.reddit.com/r/ClaudeAI/comments/1rd7b9i/am_i_using_claude_cowork_wrong/", 403), "blocked");
  assert.equal(classify("https://haverin.substack.com/p/claude-cowork-for-product-managers", 403), "blocked");
});

test("a dead page on a bot-blocking host still fails", () => {
  assert.equal(classify("https://www.reddit.com/r/ClaudeAI/comments/gone/", 404), "broken");
  assert.equal(classify("https://haverin.substack.com/p/gone", 500), "broken");
});

test("a 403 on any other host still fails", () => {
  assert.equal(classify("https://docs.anthropic.com/private", 403), "broken");
  assert.equal(classify("https://notreddit.com/x", 403), "broken");
  assert.equal(classify("https://reddit.com.evil.test/x", 403), "broken");
});

test("existing rules are unchanged", () => {
  assert.equal(classify("https://docs.anthropic.com/", 200), "ok");
  assert.equal(classify("https://docs.anthropic.com/", 301), "ok");
  assert.equal(classify("https://mcp.example.org/sse", 401), "ok");
  assert.equal(classify("https://api.example.org/mcp", 401), "ok");
  assert.equal(classify("https://claude.ai/code", 403), "ok");
  assert.equal(classify("https://docs.anthropic.com/gone", 404), "broken");
});

test("the private usage report requires authentication", () => {
  assert.equal(classify("https://claude-lab-usage.vercel.app/report", 401), "protected");
});

test("the private report exception does not hide broken pages or unrelated authentication errors", () => {
  const report = "https://claude-lab-usage.vercel.app/report";
  for (const status of [403, 404, 500]) assert.equal(classify(report, status), "broken");
  for (const url of [
    "https://claude-lab-usage.vercel.app/other",
    "https://other.vercel.app/report",
    "https://claude-lab-usage.vercel.app.evil.test/report",
  ]) assert.equal(classify(url, 401), "broken");
  assert.equal(classify(report, 200), "ok");
});

test("URLs inside inline code or followed by punctuation are extracted cleanly", () => {
  assert.deepEqual(extractUrls("Use `https://mcp.atlassian.com/v2/mcp` (current)."), ["https://mcp.atlassian.com/v2/mcp"]);
  assert.deepEqual(extractUrls("See [docs](https://code.claude.com/docs/en/hooks), then https://claude.com/blog."), ["https://code.claude.com/docs/en/hooks", "https://claude.com/blog"]);
});
