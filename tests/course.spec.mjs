import { test, expect } from "@playwright/test";

test("every registered lesson renders without browser errors", async ({ page }) => {
  const errors = [];
  page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#/");
  const lessons = await page.evaluate(() => window.COURSES.flatMap((course) => course.modules.flatMap((module) => module.lessons.map((lesson) => ({ course: course.id, id: lesson.id })))));
  expect(lessons).toHaveLength(71);
  for (const lesson of lessons) {
    await page.goto(`/#/${lesson.course}/${lesson.id}`);
    await expect(page.locator("article.lesson h1")).toBeVisible();
    await expect(page.locator(".error-box")).toHaveCount(0);
    const text = await page.locator("article.lesson").innerText();
    expect(text, `${lesson.id} leaks block syntax`).not.toMatch(/^\s*(```|:::)/m);
    expect(text, `${lesson.id} leaks spot markup`).not.toContain("[[");
  }
  expect(errors).toEqual([]);
});

test("progress, checklist, quiz, search, theme, and keyboard navigation work", async ({ page }) => {
  await page.goto("/#/cowork/welcome");
  const check = page.locator('.check-item input[type="checkbox"]').first();
  await page.locator(".check-item").first().click();
  await expect(check).toBeChecked();
  await page.reload();
  await expect(page.locator('.check-item input[type="checkbox"]').first()).toBeChecked();
  await page.locator("#completeBtn").click();
  await expect(page.locator("#topbarProgress")).toHaveAttribute("aria-valuenow", /[1-9]\d*/);
  await page.goto("/#/cowork/what-is-cowork");
  const quiz = page.locator(".quiz-q").first();
  await quiz.locator('.quiz-opt[data-correct="0"]').first().click();
  await expect(quiz.locator(".quiz-opt.wrong")).toHaveCount(1);
  await expect(quiz.locator(".quiz-opt.correct")).toHaveCount(1);
  const oldTheme = await page.locator("html").getAttribute("data-theme");
  await page.locator("#themeBtn").click();
  await expect(page.locator("html")).not.toHaveAttribute("data-theme", oldTheme);
  await page.locator("#searchBtn").click();
  await page.locator("#searchInput").fill("plan mode");
  await expect(page.locator("#searchResults a").first()).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#searchBtn")).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(page).toHaveURL(/#\/cowork\/lab-setup$/);
});

test("guided simulator rejects mismatches and completes expected steps", async ({ page }) => {
  await page.goto("/#/claude-code/cc-tour");
  const sim = page.locator(".ccsim").first();
  await sim.locator("[data-input]").fill("not the expected command");
  await sim.locator("[data-run]").click();
  await expect(sim.locator(".ccsim-mismatch")).toBeVisible();
  await expect(sim.locator(".ccsim-line")).toHaveCount(0);
  await sim.locator("[data-input]").fill("");
  await sim.locator("[data-run]").click();
  await expect(sim.locator(".ccsim-line")).toHaveCount(1);
});

test("route pages and freshness evidence render", async ({ page }) => {
  await page.goto("/#/cowork");
  await expect(page.locator(".fast-path-card")).toHaveCount(5);
  await page.locator('.fast-path-card[href="#/cowork/path/essentials"]').click();
  await expect(page.locator(".path-list li")).toHaveCount(8);
  await page.goto("/#/claude-code/cc-subagents");
  await expect(page.locator(".freshness")).toContainText("Verified 26 Aug 2026");
});

for (const width of [390, 320]) {
  test(`mobile layout has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/#/cowork");
    const metrics = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth, right: document.querySelector(".topbar-actions").getBoundingClientRect().right }));
    expect(metrics.scroll).toBeLessThanOrEqual(metrics.client);
    expect(metrics.right).toBeLessThanOrEqual(width);
    await page.locator("#navToggle").click();
    await expect(page.locator("#sidebar")).toHaveClass(/open/);
    await expect(page.locator("#navToggle")).toHaveAttribute("aria-expanded", "true");
  });
}

test("collapsible navigation exposes its state", async ({ page }) => {
  await page.goto("/#/cowork/welcome");
  const button = page.locator(".nav-group-btn").first();
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await button.click();
  await expect(button).toHaveAttribute("aria-expanded", "false");
  await expect(button).toHaveAttribute("aria-controls", /nav-cowork-/);
});
