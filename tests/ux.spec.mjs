import { test, expect } from "@playwright/test";

test("one button completes the lesson and continues; on a done lesson it undoes", async ({ page }) => {
  await page.goto("/#/cowork/welcome");
  const btn = page.locator("#completeBtn");
  await expect(btn).toContainText("Complete and continue");
  await btn.click();
  await expect(page).toHaveURL(/#\/cowork\/what-is-cowork$/);
  await expect(page.locator("#topbarProgress")).toHaveAttribute("aria-valuenow", /[1-9]\d*/);
  await page.goto("/#/cowork/welcome");
  await expect(btn).toContainText("Completed");
  await btn.click();
  await expect(page).toHaveURL(/#\/cowork\/welcome$/);
  await expect(btn).toContainText("Complete and continue");
});

test.describe("on a touch phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("glossary popover opens fully on screen", async ({ page }) => {
    await page.goto("/#/cowork/steering");
    const term = page.locator("article.lesson .term").first();
    await term.waitFor();
    await term.evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - window.innerHeight + 40));
    await term.tap();
    const box = await page.locator("#termPop").boundingBox();
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(844);
  });

  test("breadcrumb stays on one line and flashcards say tap", async ({ page }) => {
    await page.goto("/#/cowork/the-brief");
    const top = await page.locator(".lesson-top").boundingBox();
    expect(top.height).toBeLessThanOrEqual(56);
    await expect(page.locator(".flash-hint").first()).toContainText("Tap the card");
  });
});

test("arrow keys do not change lesson while a control that uses them has focus", async ({ page }) => {
  await page.goto("/#/cowork/verify");
  await expect(page.locator("article.lesson h1")).toBeVisible();
  const segment = page.locator(".spot-seg").first();
  await segment.focus();
  await expect(segment).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(page).toHaveURL(/#\/cowork\/verify$/);
  await expect(segment).toBeFocused();
  await page.locator("#main").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page).toHaveURL(/#\/cowork\/failure-clinic/);
});

test("answering a quiz from the keyboard keeps focus inside the question", async ({ page }) => {
  await page.goto("/#/cowork/what-is-cowork");
  const quiz = page.locator(".quiz-q").first();
  await quiz.locator(".quiz-opt").first().focus();
  await page.keyboard.press("Enter");
  await expect(quiz).toHaveClass(/answered/);
  const inside = await page.evaluate(() => document.activeElement !== document.body && !!document.activeElement.closest(".quiz-q"));
  expect(inside).toBe(true);
});

test("arrow keys scroll a focused code example only when it overflows", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/#/claude-code/cc-tour");
  await expect(page.locator("article.lesson h1")).toBeVisible();
  const pre = page.locator(".codeblock pre").first();
  await pre.focus();
  await expect(pre).toBeFocused();
  const overflows = await pre.evaluate((el) => el.scrollWidth > el.clientWidth);
  await page.keyboard.press("ArrowRight");
  if (overflows) await expect(page).toHaveURL(/#\/claude-code\/cc-tour$/);
  else await expect(page).toHaveURL(/#\/claude-code\/cc-first/);
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto("/#/claude-code/cc-tour");
  const wide = page.locator(".codeblock pre").first();
  await wide.focus();
  const stillOverflows = await wide.evaluate((el) => el.scrollWidth > el.clientWidth);
  await page.keyboard.press("ArrowRight");
  if (stillOverflows) await expect(page).toHaveURL(/#\/claude-code\/cc-tour$/);
  else await expect(page).toHaveURL(/#\/claude-code\/cc-first/);
});

test("search snippets highlight every query word without corrupting their own markup", async ({ page }) => {
  await page.goto("/#/");
  await page.keyboard.press("/");
  await page.locator("#searchInput").fill("plan mark");
  await expect(page.locator(".sr-snippet").first()).toBeVisible();
  await expect.poll(async () => page.locator(".sr-loading").count()).toBe(0);
  const snippets = await page.locator(".sr-snippet").evaluateAll((els) => els.map((el) => ({ html: el.innerHTML, text: el.textContent })));
  expect(snippets.length).toBeGreaterThan(0);
  for (const s of snippets) {
    expect(s.html).not.toContain("<!--");
    expect(s.text).not.toMatch(/<\/?mark>/);
    expect(s.html).toMatch(/<mark>plan<\/mark>/i);
  }
  // the second word is the one the old highlighter corrupted, so at least one snippet must show it marked
  expect(snippets.some((s) => /<mark>mark/i.test(s.html))).toBe(true);
});

test("search sections link only to headings that exist on the page", async ({ page }) => {
  await page.goto("/#/");
  await page.keyboard.press("/");
  await page.locator("#searchInput").fill("deal feels stalled");
  await expect(page.locator("#searchResults a").first()).toBeVisible();
  await expect.poll(async () => page.locator(".sr-loading").count()).toBe(0);
  const hrefs = await page.locator("#searchResults a").evaluateAll((els) => els.map((a) => a.getAttribute("href")));
  const sectioned = hrefs.filter((h) => h.includes("?s="));
  expect(sectioned.length).toBeGreaterThan(0);
  for (const href of sectioned) {
    const slug = decodeURIComponent(href.split("?s=")[1]);
    await page.goto("/" + href);
    await expect(page.locator("article.lesson h1")).toBeVisible();
    expect(await page.locator(`[id="${slug}"]`).count(), href).toBe(1);
  }
});

test("choosing the search result for the current lesson returns to the top of it", async ({ page }) => {
  await page.goto("/#/cowork/the-brief");
  await expect(page.locator("article.lesson h1")).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 1200));
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(400);
  await page.keyboard.press("/");
  await page.locator("#searchInput").fill("The B.R.I.E.F. Framework");
  await expect(page.locator('#searchResults a[href="#/cowork/the-brief"]').first()).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.locator("#searchModal")).toBeHidden();
  await expect.poll(async () => page.evaluate(() => window.scrollY)).toBeLessThan(100);
});

test("the phone menu still opens while focus mode is on", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/#/cowork/the-brief");
  await expect(page.locator("article.lesson h1")).toBeVisible();
  await page.locator("#focusBtn").click();
  await expect(page.locator("#focusBtn")).toHaveAttribute("aria-pressed", "true");
  await page.locator("#navToggle").click();
  await expect(page.locator("#sidebar")).toHaveClass(/open/);
  await expect(page.locator("#sidebar .nav-link").first()).toBeVisible();
  await expect(page.locator("#sidebar")).toBeInViewport();
});

test("importing a progress file applies its theme and focus preference at once", async ({ page }) => {
  await page.goto("/#/me");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.locator("#progressImport").setInputFiles({ name: "backup.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify({ theme: "dark", focus: true, courses: {} })) });
  await expect(page.locator("#toast")).toContainText("Progress imported");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("#focusBtn")).toHaveAttribute("aria-pressed", "true");
  await page.goto("/#/cowork/the-brief");
  await expect(page.locator("body")).toHaveClass(/focus-mode/);
});

test("the session planner saves a preference only when the learner changes it", async ({ page }) => {
  await page.goto("/#/");
  await expect(page.locator("#learningGoal")).toBeVisible();
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("claudelab.v2") || "{}").learning)).toBeUndefined();
  await page.locator("#learningTime").selectOption("30");
  await expect.poll(async () => page.evaluate(() => JSON.parse(localStorage.getItem("claudelab.v2") || "{}").learning?.minutes)).toBe(30);
});

test("an old lesson bookmark lands on the canonical route with lesson view and quiz keys", async ({ page }) => {
  await page.goto("/#/cowork/lesson/what-is-cowork");
  await expect(page).toHaveURL(/#\/cowork\/what-is-cowork$/);
  await expect(page.locator("article.lesson h1")).toBeVisible();
  await expect(page.locator("body")).toHaveAttribute("data-view", "lesson");
  await expect(page.locator("#focusBtn")).toBeVisible();
  // a score is stored once every question in the block is answered; it must be keyed by the canonical lesson id
  const questions = page.locator(".quiz").first().locator(".quiz-q");
  for (let i = 0; i < await questions.count(); i++) await questions.nth(i).locator('.quiz-opt[data-correct="1"]').click();
  await expect.poll(async () => page.evaluate(() => Object.keys((JSON.parse(localStorage.getItem("claudelab.v2") || "{}").courses?.cowork?.quiz) || {}))).toEqual(["what-is-cowork:0"]);
  // the first course is the Cowork course, so a bare legacy route lands there
  await page.goto("/#/lesson/welcome");
  await expect(page).toHaveURL(/#\/cowork\/welcome$/);
  await expect(page.locator("body")).toHaveAttribute("data-view", "lesson");
  // a route or session chosen on the old form travels with the redirect
  await page.goto("/#/cowork/lesson/the-brief?path=sales");
  await expect(page).toHaveURL(/#\/cowork\/the-brief\?path=sales$/);
  await expect(page.locator("article.lesson h1")).toBeVisible();
});

test("a tick saved by position before the content-keyed scheme still shows and moves to the new key", async ({ page }) => {
  // seed once: an init script would reseed on every reload and hide whether the migrated key persisted
  await page.addInitScript(() => { if (!sessionStorage.getItem("seeded")) { sessionStorage.setItem("seeded", "1"); localStorage.setItem("claudelab.v2", JSON.stringify({ courses: { cowork: { checks: { "welcome:0": true } } } })); } });
  await page.goto("/#/cowork/welcome");
  const first = page.locator(".check-item").first();
  await expect(first.locator("input")).toBeChecked();
  const key = await first.getAttribute("data-check");
  expect(key).toMatch(/^h[0-9a-z]+/);
  const checks = () => page.evaluate(() => JSON.parse(localStorage.getItem("claudelab.v2")).courses.cowork.checks);
  expect((await checks())["welcome:" + key]).toBe(true);
  expect((await checks())["welcome:0"]).toBeUndefined();
  await page.reload();
  await expect(page.locator(".check-item").first().locator("input")).toBeChecked();
  // a position key that arrives later (a merge from a device on the old scheme) is folded in, never counted twice
  await page.evaluate(() => { const s = JSON.parse(localStorage.getItem("claudelab.v2")); s.courses.cowork.checks["welcome:0"] = true; localStorage.setItem("claudelab.v2", JSON.stringify(s)); });
  await page.reload();
  expect(Object.keys(await checks())).toEqual(["welcome:" + key]);
  await page.locator(".check-item").first().click();
  await expect(page.locator(".check-item").first().locator("input")).not.toBeChecked();
  expect(Object.keys(await checks())).toEqual([]);
});
