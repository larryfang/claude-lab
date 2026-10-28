import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(new URL("../assets/js/markdown.js", import.meta.url), "utf8"), sandbox);
const MD = sandbox.window.MD;
const render = (md) => MD.render(md, { lessonId: "t" });

test("a loose ordered list with blank lines between items stays one numbered list", () => {
  const html = render("Intro:\n\n1. **First.** one\n\n2. **Second.** two\n\n3. **Third.** three\n");
  assert.equal((html.match(/<ol>/g) || []).length, 1, html);
  assert.equal((html.match(/<li>/g) || []).length, 3, html);
});

test("an ordered list that starts above 1 keeps its start number", () => {
  const html = render("4. four\n5. five\n");
  assert.match(html, /<ol start="4">/);
});

test("a table directly after a paragraph line is rendered as a table", () => {
  const html = render("Intro line\n| a | b |\n|---|---|\n| 1 | 2 |\n");
  assert.match(html, /<p>Intro line<\/p>/);
  assert.match(html, /<table/);
});

test("bare asterisks in arithmetic are not emphasis", () => {
  assert.doesNotMatch(MD.parseInline("5 * 3 = 15 and 2 * 4 = 8"), /<em>/);
  assert.match(MD.parseInline("a *real* emphasis"), /<em>real<\/em>/);
});

test("an ampersand or angle bracket in a link target or alt text is escaped once", () => {
  assert.match(MD.parseInline("[x](https://e.com/?a=1&b=2)"), /href="https:\/\/e\.com\/\?a=1&amp;b=2"/);
  assert.match(MD.parseInline("![a<b](i.png)"), /alt="a&lt;b"/);
});

test("the once-only escaping does not weaken the URL and attribute sanitising", () => {
  assert.match(MD.parseInline("[x](javascript:alert(1))"), /href="#"/);
  assert.match(MD.parseInline('![a](x"onerror=alert(1) "t")'), /src="x&quot;onerror=alert\(1"/);
  assert.match(MD.parseInline("[x](a&amp;lt;b)"), /href="a&amp;amp;lt;b"/);
  assert.doesNotMatch(MD.parseInline("[x](a&amp;lt;b)"), /<b|a<b/);
});
