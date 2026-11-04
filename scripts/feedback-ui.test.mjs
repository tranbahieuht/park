// Local browser QA. API responses are intercepted: no email is sent.
// npm install --prefix temp/qa-tools --no-save --package-lock=false playwright
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const { chromium } = await import("playwright").catch(() => import(new URL("../temp/qa-tools/node_modules/playwright/index.mjs", import.meta.url)));
const base = process.env.QA_BASE_URL || "http://127.0.0.1:3100";
const out = new URL("../temp/feedback-qa/", import.meta.url);
await fs.mkdir(out, { recursive: true });
const results = [], errors = [];
const widths = process.env.QA_WIDTHS?.split(",").map(Number) || [1920, 1440, 1366, 1024, 768, 430, 390, 375];
const channels = process.env.QA_CHANNELS?.split(",") || ["chrome", "msedge"];
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const whatsappUrl = "https://wa.me/qr/ZTIBEMDEW7LZE1";
async function checkWhatsApp(link, language) {
  assert.equal(await link.count(), 1);
  assert.equal(await link.getAttribute("href"), whatsappUrl);
  assert.equal(await link.getAttribute("target"), "_blank");
  const rel = (await link.getAttribute("rel")).split(/\s+/);
  assert.ok(rel.includes("noopener") && rel.includes("noreferrer"));
  assert.equal(await link.getAttribute("aria-label"), language === "vi" ? "Chat qua WhatsApp" : "Chat on WhatsApp");
}
for (const channel of channels) {
  const browser = await chromium.launch({ channel, headless: true });
  try {
    for (const width of widths) {
      const context = await browser.newContext({ viewport: { width, height: width > 1040 ? 900 : 844 } });
      await context.addInitScript(() => localStorage.setItem("np_lead_sent", "1"));
      const page = await context.newPage();
      page.on("pageerror", error => errors.push({ channel, width, error: error.message }));
      let requests = [], responseCode = 503;
      await page.route("**/api/leads", async route => {
        requests.push(route.request().postDataJSON());
        await delay(200);
        await route.fulfill({ status: responseCode, contentType: "application/json", body: JSON.stringify({ ok: responseCode === 200, code: responseCode === 200 ? "ACCEPTED" : "UNAVAILABLE" }) });
      });
      await page.goto(base);
      await page.evaluate(() => document.fonts.ready);
      for (const language of ["vi", "en"]) {
        await page.locator(`button[data-lang="${language}"]`).click();
        const metrics = await page.evaluate(() => ({
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          heading: getComputedStyle(document.querySelector("h1")).fontFamily,
          body: getComputedStyle(document.body).fontFamily,
          fontReady: document.fonts.check('16px "Playfair Display"') && document.fonts.check('16px "Montserrat"'),
          sections: [...document.querySelectorAll("main > section")].map(section => section.id || "hero"),
        }));
        assert.ok(metrics.overflow <= 1, `${channel} ${width} ${language}: horizontal overflow ${metrics.overflow}`);
        assert.ok(metrics.heading.startsWith('"Playfair Display"'));
        assert.ok(metrics.body.startsWith("Montserrat")); assert.ok(metrics.fontReady);
        assert.equal(metrics.sections.length, 16);
        assert.equal(await page.locator('a[href*="/calculator/"]').count(), 0);
        assert.equal(await page.locator('a[href*="zalo"]').count(), 0);
        assert.equal(await page.locator('.f-list [data-calc]').count(), 0);
        await checkWhatsApp(page.locator('a.fab-whatsapp'), language);
        await page.locator('[data-cta="hero"]').click();
        await page.waitForSelector("#pop.is-open");
        assert.equal(await page.locator('#popForm input[name="form_position"]').inputValue(), "hero_consultation");
        const box = await page.locator(".pop-panel").boundingBox();
        assert.ok(box.x >= -1 && box.x + box.width <= width + 1, `popup width ${width}`);
        assert.ok(await page.locator(".pop-close").isVisible());
        await page.screenshot({ path: new URL(`${channel}-${width}-${language}-popup.png`, out).pathname.replace(/^\/(\w:)/, "$1") });
        await page.keyboard.press("Escape");
        await page.waitForSelector("#pop:not(.is-open)", { state: "attached" });
        assert.equal(await page.evaluate(() => document.body.style.overflow), "");
        await page.locator("#burger").click();
        assert.ok(await page.locator("#drawer.is-open").count());
        await checkWhatsApp(page.locator(`#drawer a[href="${whatsappUrl}"]`), language);
        await page.locator('#drawer a[href="#register"]:not([data-calc])').click();
        await page.waitForSelector("#pop.is-open");
        assert.equal(await page.locator('#popForm input[name="form_position"]').inputValue(), width <= 1040 ? "mobile_consultation" : "sidebar_consultation");
        await page.goBack();
        await page.waitForSelector("#pop:not(.is-open)", { state: "attached" });
        // Actual anchor navigation retains section scrolling and never changes origin.
        await page.locator('[data-cta="hero_explore"]').click();
        await page.waitForFunction(() => Math.abs(document.getElementById("design-story").getBoundingClientRect().top) < 100);
        await page.locator('#calc [data-cta="calc_type"]').nth(6).click();
        await page.waitForSelector("#pop.is-open");
        assert.equal(await page.locator("#pUnit").inputValue(), "Duplex");
        assert.equal(await page.locator('#popForm input[name="form_position"]').inputValue(), "pricing_calculator");
        assert.equal(new URL(page.url()).origin, new URL(base).origin);
        await page.locator(".pop-close").click();
        await page.waitForSelector("#pop:not(.is-open)", { state: "attached" });
        // Same iframe is retained through language switches; legend and controls survive.
        await page.locator("#location").scrollIntoViewIfNeeded();
        const frame = page.frameLocator("#locMap");
        await frame.locator(".legend .lg").first().waitFor({ state: "attached" });
        await frame.locator('button[data-sec="filter"]').click();
        await frame.locator(".legend .lg").first().waitFor();
        assert.equal(await frame.locator(".cats button").count(), 0);
        assert.ok(await frame.locator(".legend .lg").count() > 5);
        assert.equal(await frame.locator("html").getAttribute("lang"), language);
        if (await frame.locator("#board").evaluate(board => board.classList.contains("up"))) {
          await frame.locator('button[data-sec="filter"]').click();
        }
        const oldView = await frame.locator("#art").getAttribute("viewBox");
        await frame.locator("#zIn").click();
        const mapFrame = page.frames().find(frame => frame.url().includes("location-map.html"));
        await mapFrame.waitForFunction(old => document.getElementById("art").getAttribute("viewBox") !== old, oldView, { timeout: 5000 });
        await delay(350);
        await frame.locator("#zOut").click();
        await frame.locator("#zFit").click();
        await frame.locator("#replay").click();
        await page.locator(".nav-brands").click();
        await page.waitForFunction(() => window.scrollY < 10);
        results.push({ channel, width, language, status: "PASS", overflow: metrics.overflow });
        await fs.writeFile(new URL(`results-${channel}.json`, out), JSON.stringify({ results, errors }, null, 2));
      }
      // Invalid input, pending lock, server failure, retry and confirmed success.
      await page.locator('[data-cta="hero"]').click();
      await page.locator('#popForm button[type="submit"]').click();
      assert.equal(requests.length, 0);
      await page.locator("#pName").fill("Synthetic QA");
      await page.locator("#pPhone").fill("0901234567");
      await page.locator("#pEmail").fill("qa@example.test");
      await page.locator("#pConsent").check();
      await page.locator('#popForm button[type="submit"]').click();
      assert.ok(await page.locator('#popForm button[type="submit"]').isDisabled());
      await page.locator('#popForm [role="alert"]').waitFor();
      assert.equal(await page.locator("#pName").inputValue(), "Synthetic QA");
      assert.equal(await page.locator("#popOk.on").count(), 0);
      responseCode = 200;
      await page.locator('#popForm button[type="submit"]').evaluate(button => { button.click(); button.click(); });
      await page.locator("#popOk.on").waitFor();
      assert.equal(requests.length, 2);
      assert.equal(requests[1].source, "hero_consultation");
      assert.equal(requests[1].language, "en");
      await context.close();
      process.stdout.write(`PASS ${channel} ${width}: VI/EN, popup/history, CTA context, map, form states\n`);
    }
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(base);
    assert.equal(await page.locator("html.mo").count(), 0);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.waitForSelector("html.mo", { state: "attached" });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.waitForSelector("html:not(.mo)", { state: "attached" });
    await context.close();
  } finally { await browser.close(); }
}
assert.deepEqual(errors, []);
await fs.writeFile(new URL(`results-${channels.join("-")}.json`, out), JSON.stringify({ results, errors }, null, 2));
process.stdout.write(`${results.length} browser/viewport/language checks passed; no page errors.\n`);
