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
