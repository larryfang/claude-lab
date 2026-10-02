import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";

test.use({ reducedMotion: "reduce" });

test("practice studio compares briefs, reviews evidence, corrects mistakes and resets", async ({ page }) => {
  await page.goto("/#/studio");
  const studio = page.locator(".practice-studio");
  await studio.locator('[data-brief-mode="vague"]').click();
  await expect(studio.locator("[data-brief-copy]")).toContainText("Be accurate");
  await studio.locator('[data-brief-mode="clear"]').click();
  await expect(studio.locator("[data-brief-copy]")).toContainText("Never fill a missing amount");
  await studio.locator('[data-studio-next="1"]').click();
  await expect(studio.locator('[role=tab][aria-selected=true]')).toHaveText("02Plan");
  await studio.locator('[data-studio-next="2"]').click();
  await expect(studio.locator(".source-table")).toBeVisible();
  await studio.locator('[data-claim="0"] [data-verdict="supported"]').click();
  await expect(studio.locator('[data-claim="0"] .claim-feedback')).toContainText("$30,000");
  await expect(studio.locator(".review-tally")).toHaveText("0 / 3 checked");
  for (const [claim, verdict] of [[0, "unsupported"], [1, "supported"], [2, "unsupported"]]) {
    await studio.locator(`[data-claim="${claim}"] [data-verdict="${verdict}"]`).click();
  }
  await expect(studio.locator(".studio-review-done")).toBeVisible();
  // Changing a correct answer must remove its credit, rather than accumulating points.
  await studio.locator('[data-claim="1"] [data-verdict="unsupported"]').click();
  await expect(studio.locator(".review-tally")).toHaveText("2 / 3 checked");
  await expect(studio.locator(".studio-review-done")).toBeHidden();
  await studio.locator("[data-studio-reset]").click();
  await expect(studio.locator('[role=tab][aria-selected=true]')).toHaveText("01Brief");
  await expect(studio.locator(".claim-feedback:visible")).toHaveCount(0);
  await expect(studio.locator(".review-tally")).toHaveText("0 / 3 checked");
});

test("studio tabs support arrows, Home and End with one tab stop", async ({ page }) => {
  await page.goto("/#/");
  const tabs = page.locator(".studio-tabs [role=tab]");
  await tabs.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(1)).toBeFocused();
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("End");
  await expect(tabs.nth(2)).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.first()).toBeFocused();
  await page.keyboard.press("End");
  await page.keyboard.press("Home");
  await expect(tabs.first()).toBeFocused();
  await expect(page.locator('.studio-tabs [tabindex="0"]')).toHaveCount(1);
  await expect(page.locator('.studio-panel:visible')).toHaveCount(1);
});

test("practice kit downloads the evidence, copies edited text, and checks locally", async ({ page }) => {
  const sent = [];
  await page.addInitScript(() => {
    localStorage.setItem("claudelab.usage.allow", "1");
    Object.defineProperty(navigator, "clipboard", { value: { writeText: async (text) => { window.copiedBrief = text; } } });
  });
  await page.route("**/api/collect", async (route) => {
    sent.push(route.request().postData());
    await route.fulfill({ status: 204, body: "" });
  });
  await page.goto("/#/studio");
  const downloaded = page.waitForEvent("download");
  await page.locator("#practiceDownload").click();
  const file = await downloaded;
  expect(file.suggestedFilename()).toBe("practice-pipeline.csv");
  const csv = await fs.readFile(await file.path(), "utf8");
  expect(csv).toContain("D-03,Larch,,Negotiation");
  expect(csv.trim().split("\n")).toHaveLength(4);
  const sum = csv.trim().split("\n").slice(1).reduce((total, row) => total + Number(row.split(",")[2]), 0);
  expect(sum).toBe(30000);
  await page.locator("#practiceCheck").click();
  await expect(page.locator("#practiceCheckResult")).toContainText("5 / 5 signals");
  const privateText = "My internal rehearsal phrase stays in the browser";
  await page.locator("#practiceBrief").fill(privateText);
  await page.locator("#practiceCheck").click();
  await expect(page.locator("#practiceCheckResult")).toContainText("0 / 5 signals");
  await page.locator("#practiceCopy").click();
  expect(await page.evaluate(() => window.copiedBrief)).toBe(privateText);
  await expect.poll(() => sent.length).toBeGreaterThan(0);
  expect(sent.join(" ")).not.toContain(privateText);
});

test("copy failure selects the brief and explains how to copy it", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", { value: { writeText: () => Promise.reject(new Error("Denied")) } }));
  await page.goto("/#/studio");
  await page.locator("#practiceCopy").click();
  await expect(page.locator("#practiceBrief")).toBeFocused();
  await expect(page.locator("#toast")).toContainText("Copy action");
  expect(await page.locator("#practiceBrief").evaluate((el) => el.selectionEnd - el.selectionStart)).toBeGreaterThan(100);
});

test("session planner persists preferences and resumes inside the selected route", async ({ page }) => {
  await page.goto("/#/");
  await page.locator("[data-open-planner]").click();
  await expect(page.locator("#learningGoal")).toBeFocused();
  await page.locator("#learningGoal").selectOption("finance");
  await page.locator("#learningTime").selectOption("30");
  await expect(page.locator("#sessionRecommendation .btn-primary")).toHaveAttribute("href", "#/cowork/welcome?path=finance");
  await expect(page.locator("#sessionRecommendation")).toContainText("The route continues beyond this session");
  await page.reload();
  await expect(page.locator("#learningGoal")).toHaveValue("finance");
  await expect(page.locator("#learningTime")).toHaveValue("30");
  await page.locator("#sessionRecommendation .btn-primary").click();
  await page.locator("#completeBtn").click();
  await expect(page).toHaveURL(/cowork\/what-is-cowork\?path=finance$/);
  await page.goto("/#/");
  await expect(page.locator(".resume-card")).toHaveAttribute("href", "#/cowork/what-is-cowork?path=finance");
  await expect(page.locator("#sessionRecommendation .btn-primary")).toHaveAttribute("href", "#/cowork/what-is-cowork?path=finance");
  await page.locator("#learningGoal").selectOption("code");
  await expect(page.locator("#sessionRecommendation .btn-primary")).toHaveAttribute("href", "#/claude-code/cc-what?path=foundations");
});

test("planner explains an over-budget lesson and offers review for a finished route", async ({ page }) => {
  await page.goto("/#/");
  await page.evaluate(() => {
    const store = JSON.parse(localStorage.getItem("claudelab.v2"));
    const lessons = window.COURSES[0].fastPaths.find((p) => p.id === "finance").lessons;
    store.courses.cowork.completed = Object.fromEntries(lessons.filter((id) => id !== "lab-variance").map((id) => [id, true]));
    store.learning = { goal: "finance", minutes: 15 };
    localStorage.setItem("claudelab.v2", JSON.stringify(store));
  });
  await page.reload();
  await expect(page.locator("#sessionRecommendation")).toContainText("longer than your time slot");
  await expect(page.locator("#sessionRecommendation .btn-primary")).toHaveAttribute("href", "#/cowork/lab-variance?path=finance");
  await page.evaluate(() => {
    const store = JSON.parse(localStorage.getItem("claudelab.v2"));
    store.courses.cowork.completed["lab-variance"] = true;
    localStorage.setItem("claudelab.v2", JSON.stringify(store));
  });
  await page.reload();
  await expect(page.locator("#sessionRecommendation .btn-primary")).toContainText("Review");
});

test("focus mode persists, leaves exercises usable, and restores navigation", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/#/cowork/steering");
  await page.locator("#focusBtn").click();
  await expect(page.locator("#focusBtn")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#sidebar")).toBeHidden();
  await page.locator(".quiz-opt").first().click();
  await expect(page.locator(".quiz-q.answered")).toHaveCount(1);
  await page.reload();
  await expect(page.locator("#focusBtn")).toHaveAttribute("aria-label", "Exit focus mode");
  await expect(page.locator("#sidebar")).toBeHidden();
  await page.locator("#focusBtn").click();
  await expect(page.locator("#sidebar")).toBeVisible();
  await page.locator("#focusBtn").click();
  await page.goto("/#/me");
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("#resetBtn").click();
  await page.goto("/#/cowork/steering");
  await expect(page.locator("#focusBtn")).toHaveAttribute("aria-pressed", "true");
  await page.locator("#focusBtn").click();
  await expect(page.locator("#focusBtn")).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("#sidebar")).toBeVisible();
  await page.goto("/#/");
  await expect(page.locator("#focusBtn")).toBeHidden();
});

test("phone outline jumps to a section without losing the curated route", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/cowork/the-brief?path=finance");
  const outline = page.locator(".lesson-outline");
  await expect(outline).not.toHaveAttribute("open");
  await outline.locator("summary").click();
  await expect(outline).toHaveAttribute("open");
  const target = await outline.locator(".toc a").nth(1).getAttribute("data-target");
  await outline.locator(".toc a").nth(1).click();
  await expect(outline).not.toHaveAttribute("open");
  await expect(page).toHaveURL(/the-brief\?path=finance$/);
  await expect.poll(() => page.locator(`[id="${target}"]`).evaluate((el) => el.getBoundingClientRect().top)).toBeLessThan(180);
  expect(await page.locator(`[id="${target}"]`).evaluate((el) => el.getBoundingClientRect().top)).toBeGreaterThanOrEqual(60);
});

test("phone navigation keeps focus in the open menu and restores it on close", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/cowork/welcome");
  await expect(page.locator("#sidebar")).toHaveAttribute("inert");
  await page.locator("#navToggle").click();
  await expect(page.locator("#sidebar")).not.toHaveAttribute("inert");
  await expect(page.locator("#main")).toHaveAttribute("inert");
  await page.locator("#resetBtn").focus();
  await page.keyboard.press("Tab");
  await expect(page.locator("#navToggle")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator('.nav-learn a').first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator("#navToggle")).toBeFocused();
  await expect(page.locator("#main")).not.toHaveAttribute("inert");
  await expect(page.locator("#sidebar")).toHaveAttribute("inert");
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator("#sidebar")).not.toHaveAttribute("inert");
});

test("course actions, lesson labels and scrollable code remain readable in both themes", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  async function contrast(selector) {
    return page.locator(selector).first().evaluate((el) => {
      const rgba = (s) => { const v = s.match(/[\d.]+/g).map(Number); return [...v.slice(0, 3), v[3] ?? 1]; };
      const blend = (fg, bg) => fg.slice(0, 3).map((n, i) => n * fg[3] + bg[i] * (1 - fg[3]));
      let chain = [], node = el;
      while (node) { chain.unshift(rgba(getComputedStyle(node).backgroundColor)); node = node.parentElement; }
      const bg = chain.reduce((b, f) => blend(f, b), [255, 255, 255]);
      const fg = blend(rgba(getComputedStyle(el).color), bg);
      const luminance = (c) => c.map((v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((v, n, i) => v + n * [0.2126, 0.7152, 0.0722][i], 0);
      const a = luminance(fg), b = luminance(bg);
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    });
  }
  for (const theme of ["light", "dark"]) {
    await page.goto("/#/");
    await page.evaluate((t) => { document.documentElement.dataset.theme = t; }, theme);
    expect(await contrast(".course-card .course-btn")).toBeGreaterThanOrEqual(4.5);
    await page.goto("/#/claude-code/cc-tour");
    await page.evaluate((t) => { document.documentElement.dataset.theme = t; }, theme);
    await expect(page.locator(".codeblock pre").first()).toHaveAttribute("tabindex", "0");
    expect(await contrast(".codeblock pre")).toBeGreaterThanOrEqual(4.5);
    expect(await contrast(".nav-link.active .nav-min")).toBeGreaterThanOrEqual(4.5);
    expect(await contrast(".level-chip.level-beginner")).toBeGreaterThanOrEqual(4.5);
  }
});

test("all 71 lessons have accurate orientation and fit at 320px in both themes", async ({ page }) => {
  test.setTimeout(180000);
  await page.setViewportSize({ width: 320, height: 844 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/#/");
  const lessons = await page.evaluate(() => window.COURSES.flatMap((c) => c.modules.flatMap((m) => m.lessons.map((l) => ({ course: c.id, id: l.id, summary: l.summary, reference: /reference/i.test(m.id) })))));
  expect(lessons).toHaveLength(71);
  for (const l of lessons) {
    await page.goto(`/#/${l.course}/${l.id}`);
    await expect(page.locator(".lesson-orientation p")).toHaveText(l.summary);
    await expect(page.locator(".judgment-check")).toHaveCount(l.reference ? 0 : 1);
    for (const theme of ["light", "dark"]) {
      await page.evaluate((t) => { document.documentElement.dataset.theme = t; }, theme);
      expect(await page.evaluate(() => document.documentElement.scrollWidth), `${l.id} / ${theme}`).toBeLessThanOrEqual(320);
    }
  }
  expect(errors).toEqual([]);
});

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`studio and planner work without overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/#/", "/#/studio"]) {
      await page.goto(route);
      await expect(page.locator('.global-nav a[href="#/me"]')).toBeVisible();
      for (const theme of ["light", "dark"]) {
        await page.evaluate((t) => { document.documentElement.dataset.theme = t; }, theme);
        await page.locator('[data-studio-tab="2"]').click();
        const source = page.locator(".studio-source");
        if ((await source.getAttribute("open")) === null) await source.locator("summary").click();
        await page.locator('[data-claim="0"] [data-verdict="unsupported"]').click();
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
        const actions = await page.locator(".topbar-actions").boundingBox();
        expect(actions.x + actions.width).toBeLessThanOrEqual(width);
      }
    }
  });
}
