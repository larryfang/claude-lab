import { test, expect } from "@playwright/test";
import fs from "node:fs";

const iso = (offset = 0) => { const d = new Date(); d.setDate(d.getDate() + offset); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
async function seed(page, state) {
  await page.goto("/#/");
  await page.evaluate((s) => localStorage.setItem("claudelab.v2", JSON.stringify(s)), state);
  await page.reload(); // a hash change alone keeps the app's in-memory store
}
const stored = (page) => page.evaluate(() => JSON.parse(localStorage.getItem("claudelab.v2")));

test("review deck shows only due cards and reschedules them", async ({ page }) => {
  await seed(page, { courses: {}, cards: {
    "the-brief:a": { f: "Due front", b: "Due back", c: "cowork", l: "the-brief", box: 2, due: iso(0) },
    "the-brief:b": { f: "Later front", b: "Later back", c: "cowork", l: "the-brief", box: 3, due: iso(5) }
  } });
  await page.goto("/#/review");
  await expect(page.locator(".review-due")).toContainText("1");
  await expect(page.locator(".nav-learn a[href='#/review'] .nav-count")).toHaveText("1");
  await expect(page.locator(".flash-card")).toContainText("Due front");
  await page.locator(".flash-card").click();
  await page.locator('.flash-grade[data-rate="good"]').click();
  await expect(page.locator(".flash-done")).toBeVisible();
  const card = (await stored(page)).cards["the-brief:a"];
  expect(card.box).toBe(3);
  expect(card.due > iso(0)).toBe(true);
});

test("notebook lists reflections and exports them as Markdown", async ({ page }) => {
  await seed(page, { courses: {}, notes: { "lab-first-run:x": { q: "What will you delegate?", a: "The Monday pipeline summary.", c: "cowork", l: "lab-first-run", t: Date.now() } } });
  await page.goto("/#/notebook");
  await expect(page.locator(".note-card")).toHaveCount(1);
  await expect(page.locator(".note-card")).toContainText("The Monday pipeline summary.");
  const [download] = await Promise.all([page.waitForEvent("download"), page.locator("#notebookExport").click()]);
  const text = fs.readFileSync(await download.path(), "utf8");
  expect(text).toContain("What will you delegate?");
  expect(text).toContain("The Monday pipeline summary.");
});

test("progress page shows XP, a streak, and a 16-week heatmap", async ({ page }) => {
  await seed(page, { courses: { cowork: { completed: { welcome: true, "what-is-cowork": true } } }, activity: { [iso(0)]: 3, [iso(-1)]: 2, [iso(-3)]: 1 } });
  await page.goto("/#/me");
  await expect(page.locator(".stat-streak .stat-num")).toHaveText("2");
  expect(Number(await page.locator(".stat-xp .stat-num").textContent())).toBeGreaterThan(0);
  await expect(page.locator(".heat .heat-cell")).toHaveCount(112);
  await expect(page.locator(".heat .heat-cell.l1, .heat .heat-cell.l2, .heat .heat-cell.l3, .heat .heat-cell.l4")).toHaveCount(3);
});

test("progress exports to JSON and imports back", async ({ page }) => {
  await seed(page, { courses: { cowork: { completed: { welcome: true } } } });
  await page.goto("/#/me");
  const [download] = await Promise.all([page.waitForEvent("download"), page.locator("#progressExport").click()]);
  const saved = JSON.parse(fs.readFileSync(await download.path(), "utf8"));
  expect(saved.courses.cowork.completed.welcome).toBe(true);
  saved.courses.cowork.completed["what-is-cowork"] = true;
  await page.locator("#progressImport").setInputFiles({ name: "progress.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(saved)) });
  await expect(page.locator(".toast")).toContainText("imported");
  expect((await stored(page)).courses.cowork.completed["what-is-cowork"]).toBe(true);
});

test("certificate is locked until the course is complete, then personalised", async ({ page }) => {
  await page.goto("/#/cowork/certificate");
  await expect(page.locator(".cert-locked")).toBeVisible();
  const ids = await page.evaluate(() => window.COURSES[0].modules.filter((m) => !/reference/i.test(m.id)).flatMap((m) => m.lessons.map((l) => l.id)));
  await page.evaluate((list) => {
    const completed = Object.fromEntries(list.map((id) => [id, true]));
    localStorage.setItem("claudelab.v2", JSON.stringify({ courses: { cowork: { completed, doneAt: "2026-09-24" } } }));
  }, ids);
  await page.reload();
  await expect(page.locator(".cert")).toContainText("Claude Cowork for Sales, GTM, Product & Finance");
  await page.locator("#certName").fill("Sam Rivera");
  await expect(page.locator(".cert-name")).toHaveText("Sam Rivera");
});
