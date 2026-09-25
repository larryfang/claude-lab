import { test, expect } from "@playwright/test";

test("hub shows the hero visual, live counts, the four-step method, and a resume card", async ({ page }) => {
  await page.goto("/#/");
  await expect(page.locator(".hero-visual")).toBeVisible();
  const lessons = await page.evaluate(() => window.COURSES.flatMap((c) => c.modules.filter((m) => !/reference/i.test(m.id)).flatMap((m) => m.lessons)).length);
  await expect(page.locator(".stats-strip [data-stat=lessons] b")).toHaveText(String(lessons));
  await expect(page.locator(".how-step")).toHaveCount(4);
  await expect(page.locator(".resume-card")).toHaveCount(0);
  await page.goto("/#/cowork/the-brief");
  await expect(page.locator("article.lesson h1")).toBeVisible();
  await page.goto("/#/");
  await expect(page.locator(".resume-card")).toHaveAttribute("href", "#/cowork/the-brief");
});

test("course home draws the module journey and marks where you are", async ({ page }) => {
  await page.goto("/#/cowork");
  const modules = await page.evaluate(() => window.COURSES[0].modules.filter((m) => !/reference/i.test(m.id)).length);
  await expect(page.locator(".journey-node")).toHaveCount(modules);
  await expect(page.locator(".journey-node.current")).toHaveCount(1);
  await expect(page.locator(".journey-node.current")).toContainText("Start Here");
});

test("lesson page has a position chip, an on-this-page rail, and reading progress", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/#/cowork/the-brief");
  await expect(page.locator(".lesson-pos")).toContainText("Lesson 2 of 6");
  const h2s = await page.locator("article.lesson h2").count();
  await expect(page.locator(".toc a")).toHaveCount(h2s);
  await expect(page.locator(".toc")).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect.poll(async () => Number(await page.locator("#readProgress").getAttribute("aria-valuenow"))).toBeGreaterThan(95);
  await page.locator(".toc a").first().click();
  await expect(page).toHaveURL(/#\/cowork\/the-brief$/);
});

test("search finds words inside lesson bodies and jumps to the section", async ({ page }) => {
  await page.goto("/#/");
  await page.locator("#searchBtn").click();
  await page.locator("#searchInput").fill("confident gap");
  const hit = page.locator("#searchResults a", { hasText: "Plans, Steering" }).first();
  await expect(hit).toBeVisible({ timeout: 15000 });
  await expect(hit.locator(".sr-snippet mark").first()).toBeVisible();
  await hit.click();
  await expect(page).toHaveURL(/#\/cowork\/steering/);
  await expect(page.locator("article.lesson h1")).toHaveText("Plans, Steering & When to Stop");
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(200);
});

test("? opens the keyboard shortcut sheet and Escape closes it", async ({ page }) => {
  await page.goto("/#/cowork/welcome");
  await page.keyboard.press("Shift+Slash");
  await expect(page.locator("#shortcutsModal")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#shortcutsModal")).toBeHidden();
});

for (const width of [390, 320]) {
  test(`new pages have no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    for (const route of ["#/", "#/cowork/great-run", "#/cowork/failure-clinic", "#/claude-code/cc-debug", "#/claude-code/cc-lab-claudemd", "#/me", "#/review", "#/notebook", "#/cowork/certificate"]) {
      await page.goto("/" + route);
      await page.waitForTimeout(150);
      const m = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
      expect(m.scroll, `${route} overflows at ${width}px`).toBeLessThanOrEqual(m.client);
    }
  });
}

test("glossary terms in a lesson open a definition that can join the review deck", async ({ page }) => {
  await page.goto("/#/cowork/connectors-trust");
  const term = page.locator("article.lesson .term", { hasText: "MCP" }).first();
  await expect(term).toBeVisible();
  await expect(page.locator("article.lesson :is(h1, h2, h3, code, a, .quiz, .flash, .scenario) .term")).toHaveCount(0);
  await term.click();
  const pop = page.locator("#termPop");
  await expect(pop).toBeVisible();
  await expect(pop).toContainText("open standard");
  await expect(term).toHaveAttribute("aria-expanded", "true");
  await pop.locator(".term-add").click();
  const cards = await page.evaluate(() => JSON.parse(localStorage.getItem("claudelab.v2")).cards);
  expect(Object.keys(cards).some((k) => k.startsWith("glossary:"))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(pop).toBeHidden();
  await page.goto("/#/cowork/glossary");
  await expect(page.locator("article.lesson h1")).toHaveText("Glossary");
  await expect(page.locator("article.lesson .term")).toHaveCount(0);
});

test("Claude Code lessons link terms from their own glossary", async ({ page }) => {
  await page.goto("/#/claude-code/cc-hooks");
  const term = page.locator("article.lesson .term", { hasText: "PostToolUse" }).first();
  await expect(term).toBeVisible();
  await term.click();
  await expect(page.locator("#termPop .term-def")).toContainText("after a tool runs");
  await expect(page.locator("#termPop a")).toHaveAttribute("href", "#/claude-code/cc-glossary");
  await page.goto("/#/claude-code/cc-what");
  await expect(page.locator("article.lesson .term", { hasText: /context window/i }).first()).toBeVisible();
});

test("plural and lowercase mentions of a term are linked", async ({ page }) => {
  await page.goto("/#/cowork/connectors-trust");
  await expect(page.locator("article.lesson .term").filter({ hasText: /^connectors?$/i }).first()).toBeVisible();
});
