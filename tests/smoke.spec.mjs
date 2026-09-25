import { test, expect } from "@playwright/test";

// Uses every interactive block on every lesson once, on a phone-sized screen, and fails on any browser error.
test("every interactive block on every lesson works without errors", async ({ page }) => {
  test.setTimeout(240000);
  await page.setViewportSize({ width: 390, height: 844 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await page.goto("/#/");
  const lessons = await page.evaluate(() => window.COURSES.flatMap((c) => c.modules.flatMap((m) => m.lessons.map((l) => `${c.id}/${l.id}`))));
  let used = 0;
  for (const route of lessons) {
    await page.goto(`/#/${route}`);
    await expect(page.locator("article.lesson h1"), route).toBeVisible();
    const scope = page.locator("article.lesson");
    for (const deck of await scope.locator(".flash").all()) { await deck.locator(".flash-card").click(); await deck.locator('.flash-grade[data-rate="good"]').click(); used++; }
    for (const scn of await scope.locator("[data-scn]").all()) { await scn.locator(".scn-opt").first().click(); await expect(scn.locator(".scn-fb:visible"), route).toHaveCount(1); used++; }
    for (const ord of await scope.locator(".order").all()) { await ord.locator(".order-item").first().locator(".order-down").click(); await ord.locator(".order-check").click(); await expect(ord.locator(".order-result"), route).not.toBeEmpty(); used++; }
    for (const spot of await scope.locator(".spot").all()) { await spot.locator(".spot-seg").first().click(); await spot.locator(".spot-check").click(); await expect(spot.locator(".spot-result"), route).toContainText("planted errors"); used++; }
    for (const box of await scope.locator(".reflect textarea").all()) { await box.fill("smoke"); used++; }
    for (const lint of await scope.locator("[data-lint]").all()) { await lint.locator("textarea").fill("I am a PM. Produce `output/a.md`."); await lint.locator(".lint-run").click(); await expect(lint.locator(".lint-num"), route).toBeVisible(); used++; }
    for (const quiz of await scope.locator(".quiz").all()) {
      for (const q of await quiz.locator(".quiz-q").all()) await q.locator(".quiz-opt").first().click();
      await expect(quiz.locator(".quiz-score"), route).toBeVisible(); used++;
    }
  }
  expect(errors).toEqual([]);
  expect(used).toBeGreaterThan(150); // 188 blocks at the time of writing; a floor, so a broken renderer cannot pass silently
});
