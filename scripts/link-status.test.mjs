import test from "node:test";
import assert from "node:assert/strict";
import { classify } from "./link-status.mjs";

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
