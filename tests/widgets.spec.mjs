import { test, expect } from "@playwright/test";

const stored = (page) => page.evaluate(() => JSON.parse(localStorage.getItem("claudelab.v2") || "{}"));

test("flashcards flip, grade, and join the review deck", async ({ page }) => {
  await page.goto("/#/cowork/the-brief");
  const deck = page.locator(".flash").first();
  await expect(deck).toBeVisible();
  const total = Number((await deck.locator(".flash-count").textContent()).split("/")[1]);
  expect(total).toBeGreaterThan(1);
  await expect(deck.locator(".flash-grade").first()).toBeHidden();
  await deck.locator(".flash-card").click();
  await expect(deck.locator(".flash-card")).toHaveClass(/flipped/);
  await deck.locator('.flash-grade[data-rate="good"]').click();
  await expect(deck.locator(".flash-count")).toHaveText(`2 / ${total}`);
  const s = await stored(page);
  const cards = Object.values(s.cards || {});
  expect(cards.length).toBe(1);
  expect(cards[0]).toMatchObject({ c: "cowork", l: "the-brief", box: 2 });
});

test("ordering exercise checks positions and accepts the correct order", async ({ page }) => {
  await page.goto("/#/claude-code/cc-epcc");
  const ex = page.locator(".order").first();
  const keys = async () => ex.locator(".order-item").evaluateAll((els) => els.map((el) => Number(el.dataset.key)));
  const start = await keys();
  expect(start).not.toEqual([...start].sort((a, b) => a - b));
  await ex.locator(".order-check").click();
  await expect(ex.locator(".order-item.bad").first()).toBeVisible();
  for (let target = 0; target < start.length; target++) {
    let pos = (await keys()).indexOf(target);
    while (pos > target) {
      await ex.locator(`.order-item[data-key="${target}"] .order-up`).click();
      pos--;
    }
  }
  await ex.locator(".order-check").click();
  await expect(ex).toHaveClass(/solved/);
  await expect(ex.locator(".order-item.bad")).toHaveCount(0);
});

test("scenario shows the consequence of each choice and marks the best one", async ({ page }) => {
  await page.goto("/#/cowork/steering");
  const scn = page.locator(".scn").first();
  await scn.locator('.scn-opt:not([data-grade="best"])').first().click();
  await expect(scn.locator(".scn-fb:visible")).toHaveCount(1);
  await expect(scn).not.toHaveClass(/solved/);
  await scn.locator('.scn-opt[data-grade="best"]').click();
  await expect(scn).toHaveClass(/solved/);
});

test("reflection autosaves and survives a reload", async ({ page }) => {
  await page.goto("/#/cowork/lab-first-run");
  const box = page.locator(".reflect textarea").first();
  await box.fill("I will delegate the Monday pipeline summary.");
  await expect(page.locator(".reflect-status").first()).toHaveText(/Saved/);
  await page.reload();
  await expect(page.locator(".reflect textarea").first()).toHaveValue("I will delegate the Monday pipeline summary.");
});

test("find-the-flaw scores hits, misses, and false alarms", async ({ page }) => {
  await page.goto("/#/cowork/verify");
  const spot = page.locator(".spot").first();
  const flaws = await spot.locator('.spot-seg[data-flaw="1"]').count();
  expect(flaws).toBeGreaterThan(1);
  await spot.locator('.spot-seg[data-flaw="1"]').first().click();
  await spot.locator('.spot-seg[data-flaw="0"]').first().click();
  await spot.locator(".spot-check").click();
  await expect(spot.locator(".spot-result")).toContainText(`1 of ${flaws}`);
  await expect(spot.locator(".spot-seg.missed")).toHaveCount(flaws - 1);
  await expect(spot.locator(".spot-seg.false")).toHaveCount(1);
});

test("a finished quiz shows a score and can be retried", async ({ page }) => {
  await page.goto("/#/cowork/what-is-cowork");
  const quiz = page.locator(".quiz").first();
  const questions = await quiz.locator(".quiz-q").count();
  for (let i = 0; i < questions; i++) await quiz.locator(".quiz-q").nth(i).locator('.quiz-opt[data-correct="1"]').click();
  await expect(quiz.locator(".quiz-score")).toContainText(`${questions} / ${questions}`);
  await quiz.locator(".quiz-retry").click();
  await expect(quiz.locator(".quiz-q.answered")).toHaveCount(0);
  const s = await stored(page);
  expect(Object.values(s.courses.cowork.quiz)[0]).toMatchObject({ c: questions, t: questions });
});

test("brief checker scores a lazy prompt low and a full brief 5 of 5", async ({ page }) => {
  await page.goto("/#/cowork/lab-brief");
  const lint = page.locator('[data-lint="brief"]').first();
  await lint.locator("textarea").fill("Summarise the customer interviews and tell me what to build.");
  await lint.locator(".lint-run").click();
  await expect(lint.locator(".lint-letter.miss")).toHaveCount(5);
  await lint.locator("textarea").fill("I am a PM. Using only the transcripts in `discovery/`, produce `output/report.md` with three sections. Never estimate a missing number. Flag any contradiction and show me your plan before you start.");
  await lint.locator(".lint-run").click();
  await expect(lint.locator(".lint-num")).toHaveText("5 / 5");
});

test("CLAUDE.md checker flags the starter file's problems", async ({ page }) => {
  await page.goto("/#/claude-code/cc-lab-claudemd");
  const lint = page.locator('[data-lint="claudemd"]').first();
  await lint.locator(".lint-run").click();
  await expect(lint.locator(".lint-check.warn, .lint-check.fail").first()).toBeVisible();
  await expect(lint.locator(".lint-check")).toHaveCount(9);
});

test("flashcards work from the keyboard alone", async ({ page }) => {
  await page.goto("/#/cowork/the-brief");
  const deck = page.locator(".flash").first();
  const total = (await deck.locator(".flash-count").textContent()).split("/")[1].trim();
  await deck.locator(".flash-card").focus();
  await page.keyboard.press("Space");
  await expect(deck.locator(".flash-card")).toHaveClass(/flipped/);
  await page.keyboard.press("2");
  await expect(deck.locator(".flash-count")).toHaveText(`2 / ${total}`);
  await expect(deck.locator(".flash-card")).toBeFocused();
});
