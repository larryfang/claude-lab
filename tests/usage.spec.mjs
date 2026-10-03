import { test, expect } from "@playwright/test";

test("an automated browser does not record usage", async ({ page }) => {
  const sent = [];
  page.on("request", (req) => {
    if (req.url().includes("/api/collect")) sent.push(req.url());
  });
  await page.goto("/#/cowork/the-brief");
  await page.locator(".quiz-opt").first().click();
  await page.locator("#completeBtn").click();
  await page.waitForTimeout(2500);
  expect(sent).toEqual([]);
  expect(await page.evaluate(() => localStorage.getItem("claudelab.usage"))).toBeNull();
});

test("two people keep their own sessions, including a second visit", async ({ browser }) => {
  test.setTimeout(60000);

  async function browse(context, startHash, secondHash) {
    const page = await context.newPage();
    const bodies = [];
    await page.addInitScript(() => localStorage.setItem("claudelab.usage.allow", "1"));
    await page.route("**/api/collect", async (route) => {
      bodies.push(JSON.parse(route.request().postData() || "{}"));
      await route.fulfill({ status: 204, contentType: "text/plain", body: "" });
    });
    const events = () => bodies.flatMap((body) => body.events || []);
    await page.goto(startHash);
    await page.locator(".quiz-opt[data-correct='0']").first().click();
    await page.locator("#searchBtn").click();
    await page.locator("#searchInput").fill("plan mode");
    await page.keyboard.press("Escape");
    await page.locator("#completeBtn").click();
    await page.goto("/#/");
    await expect.poll(() => events().map((event) => event.type), { timeout: 8000 }).toEqual(
      expect.arrayContaining(["session", "view", "quiz", "search", "complete", "leave"])
    );
    const first = events();
    const visitor = first[0].visitor;
    const session = first[0].session;
    expect(first.every((event) => event.visitor === visitor && event.session === session)).toBe(true);
    expect(first.find((event) => event.type === "quiz")).toMatchObject({ correct: false, page: "lesson" });
    expect(first.find((event) => event.type === "search")).toMatchObject({ q: "plan mode" });
    expect(first.find((event) => event.type === "complete")).toMatchObject({ done: true });
    expect(first.filter((event) => event.type === "leave").length).toBeGreaterThan(0);

    await page.evaluate(() => sessionStorage.removeItem("claudelab.usage.session"));
    await page.goto(secondHash);
    await expect.poll(() => new Set(events().map((event) => event.session)).size, { timeout: 8000 }).toBe(2);
    const second = events().filter((event) => event.session !== session);
    expect(second.length).toBeGreaterThan(0);
    expect(second.every((event) => event.visitor === visitor)).toBe(true);
    expect(second.some((event) => event.type === "view" && event.page === "lesson")).toBe(true);
    await page.evaluate(() => { window.SITE.analytics = ""; });
    await page.close();
    return { visitor, events: events() };
  }

  const ada = await browser.newContext();
  const bea = await browser.newContext();
  const [first, second] = await Promise.all([
    browse(ada, "/#/cowork/the-brief", "/#/cowork/verify"),
    browse(bea, "/#/claude-code/cc-what", "/#/cowork/the-brief")
  ]);
  expect(first.visitor).not.toBe(second.visitor);
  expect(first.events.some((event) => event.visitor === second.visitor)).toBe(false);
  expect(second.events.some((event) => event.visitor === first.visitor)).toBe(false);
  await ada.close();
  await bea.close();
});

test('sign-in button clicks record only the provider and no email or account identity',async({page})=>{
 const events=[];await page.addInitScript(()=>localStorage.setItem('claudelab.usage.allow','1'));
 await page.route('**/api/collect',async r=>{events.push(...JSON.parse(r.request().postData()||'{}').events||[]);await r.fulfill({status:204,body:''});});
 await page.route('**/auth/v1/authorize?**',r=>r.abort());
 await page.goto('/#/account');await page.locator('#googleSignIn').click();
 await expect.poll(()=>events.filter(e=>e.type==='auth').length).toBe(1);
 const start=events.find(e=>e.type==='auth');expect(start.provider).toBe('google');expect(start.page).toBe('account');
 expect(start.email).toBeUndefined();expect(start.user_id).toBeUndefined();expect(start.access_token).toBeUndefined();
 await page.evaluate(()=>{if(window.SITE)window.SITE.analytics='';});
});

test('admin visits and finished-session pages are not mistaken for unknown lessons',async({page})=>{
 const events=[];await page.addInitScript(()=>localStorage.setItem('claudelab.usage.allow','1'));
 await page.route('**/api/collect',async r=>{events.push(...JSON.parse(r.request().postData()||'{}').events||[]);await r.fulfill({status:204,body:''});});
 await page.goto('/#/admin');await expect(page.locator('#content')).toContainText('Sign in with the course owner');
 await page.waitForTimeout(2200);expect(events).toEqual([]);
 await page.goto('/#/cowork/session?path=essentials&session=welcome');await expect.poll(()=>events.filter(e=>e.type==='view').length).toBeGreaterThan(0);
 expect(events.find(e=>e.type==='view')).toMatchObject({page:'session-summary',course:'cowork'});expect(events.some(e=>e.lesson==='session')).toBe(false);
 await page.evaluate(()=>{if(window.SITE)window.SITE.analytics='';});
});
