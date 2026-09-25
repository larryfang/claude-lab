import { test, expect } from "@playwright/test";

test("every curated route keeps its own lesson order through completion", async ({ page }) => {
  test.setTimeout(180000);
  await page.goto("/#/");
  const routes = await page.evaluate(() => window.COURSES.flatMap((course) =>
    (course.fastPaths || []).map((path) => ({ course: course.id, id: path.id, lessons: path.lessons }))));

  for (const path of routes) {
    await page.evaluate(() => localStorage.clear());
    await page.goto(`/#/${path.course}/path/${path.id}`);
    await page.reload();
    await expect(page.locator(".path-list a")).toHaveCount(path.lessons.length);
    await expect(page.locator(".path-list a").first()).toHaveAttribute("href", `#/${path.course}/${path.lessons[0]}?path=${path.id}`);
    await page.locator(".path-hero .btn-primary").click();
    await expect(page.locator("article.lesson h1")).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(page).toHaveURL(new RegExp(`#/${path.course}/${path.lessons[1]}\\?path=${path.id}$`));
    await page.keyboard.press("ArrowLeft");
    await expect(page).toHaveURL(new RegExp(`#/${path.course}/${path.lessons[0]}\\?path=${path.id}$`));

    for (let i = 0; i < path.lessons.length; i++) {
      await expect(page).toHaveURL(new RegExp(`#/${path.course}/${path.lessons[i]}\\?path=${path.id}$`));
      await expect(page.locator(".path-context")).toContainText(`Step ${i + 1} of ${path.lessons.length}`);
      await expect(page.locator("article.lesson h1")).toBeVisible();
      if (i === path.lessons.length - 1) {
        await expect(page.locator("#completeBtn")).toContainText("Complete this route");
        await expect(page.locator(".pager .next")).toHaveAttribute("href", `#/${path.course}/path/${path.id}`);
        await page.locator("#completeBtn").click();
        await expect(page).toHaveURL(new RegExp(`#/${path.course}/path/${path.id}$`));
        await expect(page.locator(".path-list .path-step").filter({ hasText: "✓" })).toHaveCount(path.lessons.length);
      } else {
        await page.locator("#completeBtn").click();
      }
    }
  }
});

test("a slow earlier lesson cannot overwrite the current lesson", async ({ page }) => {
  await page.route("**/content/00-welcome.md", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.continue();
  });
  await page.goto("/#/cowork/welcome");
  await expect(page.locator(".loading")).toBeVisible();
  await page.evaluate(() => { location.hash = "#/cowork/what-is-cowork"; });
  await expect(page.locator("article.lesson h1")).toHaveText("Cowork in Eight Minutes");
  await page.waitForTimeout(600);
  await expect(page.locator("article.lesson h1")).toHaveText("Cowork in Eight Minutes");
});
