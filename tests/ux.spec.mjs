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

test("a guest's account button carries no sync state", async ({ page }) => {
  await page.goto("/#/cowork/welcome");
  await expect(page.locator("#accountBtn")).toHaveAccessibleName("Sign in to save progress");
  await expect(page.locator("#accountBtn")).not.toHaveAttribute("data-sync", /.+/);
});

test("each course home names the lessons checked against Claude on the latest pass", async ({ page }) => {
  await page.goto("/#/");
  const courses = await page.evaluate(() => window.COURSES.map((c) => c.id));
  for (const id of courses) {
    await page.goto(`/#/${id}`);
    const strip = page.locator(".verified-strip");
    await expect(strip).toBeVisible();
    // the same whole-day arithmetic the page uses: within 30 UTC days of the newest verification
    const expected = await page.evaluate((cid) => {
      const c = window.COURSES.find((x) => x.id === cid);
      const day = (iso) => Math.floor(Date.parse(iso + "T00:00:00Z") / 864e5);
      const days = Object.values(c.freshness).map((f) => day(f.verifiedDate));
      const newest = Math.max(...days);
      return { count: days.filter((d) => newest - d <= 30).length };
    }, id);
    await expect(strip.locator("h2")).toContainText("Checked against Claude on");
    await expect(strip.locator("p").first()).toHaveText(new RegExp(`^${expected.count} lessons? (was|were) re-verified`));
    await strip.locator("summary").click();
    await expect(strip.locator(".verified-list li")).toHaveCount(expected.count);
    await expect(strip.locator(".verified-list li").first()).toContainText("2026");
  }
  await expect(page.locator(".verified-strip p a[href='#/claude-code/cc-whats-new']")).toBeVisible();
  await page.locator(".verified-list a").first().click();
  await expect(page.locator("article.lesson h1")).toBeVisible();
});

test("the re-verified strip fits a 320px phone without horizontal scroll", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/#/claude-code");
  const strip = page.locator(".verified-strip");
  await expect(strip).toBeVisible();
  await strip.locator("summary").click();
  await expect(strip.locator(".verified-list li").first()).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  const box = await strip.boundingBox();
  expect(box.x + box.width).toBeLessThanOrEqual(320);
});

test("keyboard users can see focus on the simulator, the import control, and scroll tables and terminal output", async ({ page }) => {
  await page.goto("/#/claude-code/cc-first");
  const input = page.locator(".ccsim-input").first();
  await input.focus();
  expect(await page.locator(".ccsim-inputline").first().evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe("none");
  await expect(page.locator(".ccsim-screen").first()).toHaveAttribute("tabindex", "0");
  await page.goto("/#/cowork/the-brief");
  await expect(page.locator(".table-wrap").first()).toHaveAttribute("tabindex", "0");
  await page.goto("/#/me");
  await page.locator("#progressImport").focus();
  expect(await page.locator(".file-btn").first().evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe("none");
  // the light-theme focus ring is the darker clay so it stands out on the page background
  await page.locator("#progressExport").focus();
  await page.keyboard.press("Shift+Tab"); await page.keyboard.press("Tab");
  expect(await page.locator("#progressExport").evaluate((el) => getComputedStyle(el).outlineColor)).toBe("rgb(156, 69, 41)");
  // form-control boundaries use the 3:1 control colour, including the planner selects styled in the later stylesheet
  await page.goto("/#/");
  expect(await page.locator(".planner-controls select").first().evaluate((el) => getComputedStyle(el).borderTopColor)).toBe("rgb(133, 127, 117)");
  await page.goto("/#/cowork/what-is-cowork");
  expect(await page.locator(".quiz-opt").first().evaluate((el) => getComputedStyle(el).borderTopColor)).toBe("rgb(133, 127, 117)");
  await page.goto("/#/studio");
  expect(await page.locator("#practiceBrief").evaluate((el) => getComputedStyle(el).borderTopColor)).toBe("rgb(133, 127, 117)");
  // focus on the textarea is shown by the global ring in the focus colour
  await page.locator("#practiceBrief").focus();
  await page.keyboard.press("Shift+Tab"); await page.keyboard.press("Tab");
  expect(await page.locator("#practiceBrief").evaluate((el) => getComputedStyle(el).outlineColor)).toBe("rgb(156, 69, 41)");
  // dark theme carries its own control colour
  await page.locator("#themeBtn").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.goto("/#/cowork/what-is-cowork");
  expect(await page.locator(".quiz-opt").first().evaluate((el) => getComputedStyle(el).borderTopColor)).toBe("rgb(132, 126, 116)");
});

test("the glossary popover takes focus and gives it back, and the page outline precedes the article", async ({ page }) => {
  await page.goto("/#/claude-code/cc-hooks");
  const term = page.locator("article.lesson button.term").first();
  await term.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#termPop")).toBeVisible();
  expect(await page.evaluate(() => document.getElementById("termPop").contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Tab");
  await expect(page.locator("#termPop .term-add")).toBeFocused();
  // activating Add disables the button; focus must stay inside the popover and Escape returns to the term
  await page.keyboard.press("Enter");
  await expect(page.locator("#termPop .term-add")).toBeDisabled();
  expect(await page.evaluate(() => document.getElementById("termPop").contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.locator("#termPop")).toBeHidden();
  await expect(term).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#termPop")).toBeVisible();
  await page.keyboard.press("Tab");
  // leaving the popover's last control closes it and returns to the term
  const controls = await page.locator("#termPop a[href], #termPop button:not([disabled])").count();
  for (let i = 1; i < controls; i++) await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(page.locator("#termPop")).toBeHidden();
  await expect(term).toBeFocused();
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto("/#/cowork/the-brief");
  await expect(page.locator(".toc-rail nav[aria-label='On this page']")).toHaveCount(1);
  expect(await page.evaluate(() => !!(document.querySelector(".toc-rail").compareDocumentPosition(document.querySelector(".lesson-main")) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/#/cowork/the-brief");
  const [rail, main] = await Promise.all([page.locator(".toc-rail").boundingBox(), page.locator(".lesson-main").boundingBox()]);
  expect(rail.x).toBeGreaterThan(main.x + main.width - 1);
});

test("headings, landmarks and the theme button describe the page honestly", async ({ page }) => {
  await page.addInitScript(() => {
    const activity = {};
    for (let d = 0; d < 112; d += 7) activity[new Date(Date.now() - d * 864e5).toISOString().slice(0, 10)] = 2;
    localStorage.setItem("claudelab.v2", JSON.stringify({ courses: {}, activity }));
  });
  const levels = () => page.locator("#content h1, #content h2, #content h3").evaluateAll((els) => els.map((el) => Number(el.tagName[1])));
  await page.goto("/#/me");
  const me = await levels();
  expect(me[0]).toBe(1);
  await expect(page.locator("#content [data-guest-prompt] h2")).toBeVisible();
  await page.goto("/#/cowork");
  expect(await page.locator(".dash-info h2").evaluate((el) => getComputedStyle(el).fontFamily)).toMatch(/Space Grotesk|Fraunces/);
  await page.goto("/#/review");
  expect(await levels()).not.toContain(3);
  await page.goto("/#/studio");
  const studio = await levels();
  expect(studio.indexOf(3) === -1 || studio.indexOf(2) < studio.indexOf(3)).toBe(true);
  await expect(page.locator(".studio-workbench")).toHaveAttribute("aria-label", "Practice kit");
  await page.goto("/#/cowork/certificate");
  await expect(page.locator("#content h1")).toHaveCount(1);
  await expect(page.locator("#nav")).toHaveAttribute("aria-label", "Course lessons");
  await expect(page.locator("#themeBtn")).toHaveAttribute("aria-pressed", "false");
  await page.locator("#themeBtn").click();
  await expect(page.locator("#themeBtn")).toHaveAttribute("aria-pressed", "true");
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/#/me");
  const heat = page.locator(".heat");
  await expect(heat).toHaveAttribute("tabindex", "0");
  await expect(heat).toHaveAttribute("role", "region");
  await expect(heat).toHaveAttribute("aria-label", /newest week on the right/);
  expect(await heat.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
  expect(await heat.evaluate((el) => el.scrollLeft > 0 && el.scrollLeft + el.clientWidth >= el.scrollWidth - 1)).toBe(true);
  // the heading levels changed for structure, not size
  await page.goto("/#/cowork");
  expect(await page.locator(".dash-info h2").evaluate((el) => parseFloat(getComputedStyle(el).fontSize))).toBeLessThan(20);
});
