import fs from "node:fs";
import { test, expect } from "@playwright/test";

test("every guided simulation completes and can be replayed", async ({ page }) => {
  test.setTimeout(180000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/#/");
  const lessons = await page.evaluate(() => window.COURSES.flatMap((course) =>
    course.modules.flatMap((module) => module.lessons.map((lesson) => ({
      route: `${course.id}/${lesson.id}`, file: lesson.file
    })))));
  const simulations = lessons.filter((lesson) =>
    fs.readFileSync(new URL(`../content/${lesson.file}`, import.meta.url), "utf8").includes("```claude-sim"));
  expect(simulations.length).toBeGreaterThan(0);

  for (const lesson of simulations) {
    // A full navigation prevents the previous lesson's simulator satisfying this wait.
    await page.goto(`/?simulation=${encodeURIComponent(lesson.route)}#/${lesson.route}`);
    await expect(page.locator("article.lesson h1"), lesson.route).toBeVisible();
    for (const sim of await page.locator(".ccsim").all()) {
      const run = sim.locator("[data-run]");
      const input = sim.getByRole("textbox", { name: "Command to try in simulator" });
      let steps = 0;
      while (await sim.locator(".ccsim-done").count() === 0) {
        expect(steps, `${lesson.route} did not finish`).toBeLessThan(30);
        await expect(run).toBeEnabled();
        await run.click();
        steps++;
        await expect(sim.locator(".ccsim-line")).toHaveCount(steps);
        await expect.poll(async () => (await run.isEnabled()) || (await sim.locator(".ccsim-done").count() > 0)).toBe(true);
      }
      expect(steps).toBeGreaterThan(0);
      await expect(input).toBeDisabled();
      await expect(run).toBeDisabled();
      await sim.getByRole("button", { name: "↻ Reset" }).click();
      await expect(sim.locator(".ccsim-line, .ccsim-done")).toHaveCount(0);
      await expect(input).toBeEnabled();
      await expect(run).toBeEnabled();
      await input.fill(await input.getAttribute("placeholder"));
      await input.press("Enter");
      await expect(sim.locator(".ccsim-line")).toHaveCount(1);
      await expect(sim.locator(".ccsim-mismatch")).toHaveCount(0);
    }
  }
  expect(errors).toEqual([]);
});
