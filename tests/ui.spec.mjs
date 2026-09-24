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
