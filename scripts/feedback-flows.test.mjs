// Detailed local CTA/contact-form regression. All /api/leads responses are mocked.
import assert from "node:assert/strict";
const { chromium } = await import("playwright").catch(() => import(new URL("../temp/qa-tools/node_modules/playwright/index.mjs", import.meta.url)));
const browser = await chromium.launch({ channel: process.env.QA_CHANNEL || "chrome", headless: true });
const base = process.env.QA_BASE_URL || "http://127.0.0.1:3100";
try {
  for (const width of [1440, 390]) for (const language of ["vi", "en"]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    await context.addInitScript(() => localStorage.setItem("np_lead_sent", "1"));
    const page = await context.newPage();
    const errors = [], submissions = [];
    page.on("pageerror", error => errors.push(error.message));
    let status = 503, replyCode = "", networkFailure = false;
    await page.route("**/api/leads", async route => {
      submissions.push(route.request().postDataJSON());
      if (networkFailure) { await route.abort(); return; }
      await new Promise(resolve => setTimeout(resolve, 150));
      await route.fulfill({ status, contentType: "application/json", body: JSON.stringify({ ok: status === 200, code: replyCode || (status === 200 ? "ACCEPTED" : "UNAVAILABLE") }) });
    });
    await page.goto(base);
    await page.locator(`[data-lang="${language}"]`).click();
    const close = async () => {
      await page.locator(".pop-close").click();
      await page.waitForSelector("#pop:not(.is-open)", { state: "attached" });
    };
    const open = async (selector, source, unit) => {
      await page.locator(selector).click();
      await page.waitForSelector("#pop.is-open");
      assert.equal(await page.locator('#popForm [name="form_position"]').inputValue(), source);
      if (unit !== undefined) assert.equal(await page.locator("#pUnit").inputValue(), unit);
      assert.ok(await page.locator("#popForm").isVisible());
    };
    await open('[data-cta="calc_open"]', "pricing_calculator", "");
    await page.locator(".pop-close").focus();
    await page.keyboard.press("Tab"); assert.equal(await page.evaluate(() => document.activeElement.id), "pName");
    await page.keyboard.press("Shift+Tab"); assert.ok(await page.locator(".pop-close").evaluate(el => el === document.activeElement));
    await close();
    const cards = page.locator('#calc [data-cta="calc_type"]');
    for (let i = 0; i < await cards.count(); i++) {
      await cards.nth(i).click();
      await page.waitForSelector("#pop.is-open");
      const expected = await cards.nth(i).getAttribute("data-unit");
      assert.equal(await page.locator("#pUnit").inputValue(), expected);
      await close();
    }
    await open('[data-cta="nav"]', width <= 1040 ? "mobile_consultation" : "header_consultation"); await close();
    await open('.foot a[href="#register"]', "contact_form"); await close();
    await page.locator('.resi-tabs button[data-i="2"]').click();
    await open('[data-cta="resi"]', "residence_consultation");
    const selectedUnit = await page.locator("#pUnit").inputValue(); assert.ok(selectedUnit);
    await close();
    await open('[data-cta="calc_open"]', "pricing_calculator", selectedUnit);
    await page.locator("#pName").fill("Synthetic QA");
    await page.locator("#pPhone").fill("0901234567");
    await page.locator("#pEmail").fill("bad-email");
    await page.locator("#pConsent").check();
    await page.locator('#popForm [type="submit"]').click();
    assert.equal(submissions.length, 0);
    assert.equal(await page.locator("#pEmail").getAttribute("aria-invalid"), "true");
    assert.match(await page.locator("#err-pEmail").innerText(), language === "vi" ? /để trống/ : /leave it blank/);
    await page.locator("#pEmail").fill("qa@example.test");
    for (status of [400, 403, 409, 429, 503]) {
      await page.locator('#popForm [type="submit"]').click();
      await page.locator('#popForm [role="alert"]').waitFor();
      await page.waitForFunction(() => !document.querySelector('#popForm [type="submit"]').disabled);
      assert.equal(await page.locator("#popOk.on").count(), 0);
      assert.equal(await page.locator("#pPhone").inputValue(), "0901234567");
      if (status === 403) assert.match(await page.locator('#popForm [role="alert"]').textContent(), language === "vi" ? /chưa được chấp nhận/ : /not accepted/);
    }
    for (const [code, vi, en] of [["SERVICE_UNAVAILABLE", /tạm gián đoạn/, /temporarily unavailable/], ["DELIVERY_FAILED", /đến Savills/, /sent to Savills/], ["DELIVERY_UNCONFIRMED", /Chưa xác nhận/, /not been confirmed/]]) {
      replyCode = code;
      await page.locator('#popForm [type="submit"]').click();
      await page.locator('#popForm [role="alert"]').waitFor();
      await page.waitForFunction(() => !document.querySelector('#popForm [type="submit"]').disabled);
      assert.match(await page.locator('#popForm [role="alert"]').textContent(), language === "vi" ? vi : en);
      assert.equal(await page.locator("#popOk.on").count(), 0);
    }
    replyCode = ""; networkFailure = true;
    await page.locator('#popForm [type="submit"]').click();
    await page.waitForFunction(() => !document.querySelector('#popForm [type="submit"]').disabled);
    assert.match(await page.locator('#popForm [role="alert"]').textContent(), language === "vi" ? /kết nối mạng/ : /check your connection/);
    networkFailure = false;
    // Exercise the real AbortSignal timeout path without waiting 45 seconds.
    await page.evaluate(() => {
      window.qaOriginalTimeout = AbortSignal.timeout;
      AbortSignal.timeout = () => window.qaOriginalTimeout(30);
    });
    await page.locator('#popForm [type="submit"]').click();
    await page.waitForFunction(() => !document.querySelector('#popForm [type="submit"]').disabled);
    assert.match(await page.locator('#popForm [role="alert"]').textContent(), language === "vi" ? /quá nhiều thời gian/ : /timed out/);
    await page.evaluate(() => { AbortSignal.timeout = window.qaOriginalTimeout; });
    status = 200;
    await page.locator('#popForm [type="submit"]').click(); await page.locator("#popOk.on").waitFor();
    assert.equal(submissions.at(-1).source, "pricing_calculator");
    assert.equal(submissions.at(-1).unit, selectedUnit);
    await close();
    // A completed request must not masquerade as a new request for another unit.
    await cards.first().click(); await page.waitForSelector("#pop.is-open"); assert.ok(await page.locator("#popForm").isVisible());
    assert.equal(await page.locator("#popOk.on").count(), 0); await close();
    // Exercise the original two-step contact form against the same endpoint.
    await page.locator('#register .choice:has(input[value="Duplex"])').click();
    await page.locator("#next").click();
    await page.locator("#back").click();
    assert.ok(await page.locator('#register input[value="Duplex"]').isChecked());
    await page.locator("#next").click();
    await page.locator("#fullname").fill("Synthetic Contact QA");
    await page.locator("#phone").fill("0901234567");
    await page.locator("#email").fill("contact@example.test");
    await page.locator("#consent").check();
    for (const [http, code, vi, en] of [
      [403, "FORBIDDEN", /chưa được chấp nhận/, /not accepted/],
      [400, "INVALID", /kiểm tra họ tên/, /check your name/],
      [409, "BUSY", /đang được xử lý/, /being processed/],
      [429, "RATE_LIMITED", /quá nhiều yêu cầu/, /Too many requests/],
      [503, "SERVICE_UNAVAILABLE", /tạm gián đoạn/, /temporarily unavailable/],
      [503, "DELIVERY_FAILED", /đến Savills/, /sent to Savills/],
      [503, "DELIVERY_UNCONFIRMED", /Chưa xác nhận/, /not been confirmed/],
    ]) {
      status = http; replyCode = code;
      await page.locator('#leadForm [type="submit"]').click();
      await page.waitForFunction(() => !document.querySelector('#leadForm [type="submit"]').disabled);
      assert.match(await page.locator('#leadForm [role="alert"]').textContent(), language === "vi" ? vi : en);
      assert.equal(await page.locator("#success.on").count(), 0);
      assert.equal(await page.locator("#fullname").inputValue(), "Synthetic Contact QA");
    }
    status = 200; replyCode = "";
    await page.locator('#leadForm [type="submit"]').click(); await page.locator("#success.on").waitFor();
    assert.equal(submissions.at(-1).source, "contact_form");
    assert.equal(submissions.at(-1).unit, "Duplex");
    assert.equal(submissions.at(-1).language, language);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth <= 1));
    // Map drag, remaining legend, offscreen suspension and resume.
    await page.locator("#location").scrollIntoViewIfNeeded();
    const map = page.frameLocator("#locMap");
    await map.locator("#art").waitFor();
    await map.locator("#stage").click({ position: { x: 80, y: 180 } });
    assert.ok(await map.locator("#lm.live").count());
    const before = await map.locator("#art").getAttribute("viewBox");
    const box = await map.locator("#stage").boundingBox();
    await page.mouse.move(box.x + 100, box.y + 200); await page.mouse.down();
    await page.mouse.move(box.x + 140, box.y + 240, { steps: 8 }); await page.mouse.up();
    assert.notEqual(await map.locator("#art").getAttribute("viewBox"), before);
    await page.locator(".nav-brands").click();
    await map.locator("#lm.asleep").waitFor({ state: "attached" });
    assert.equal(await map.locator("#lm.live").count(), 0);
    assert.deepEqual(errors, []);
    console.log(`PASS detailed CTA, contact form and map: ${width} ${language}`);
    await context.close();
  }
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  await context.addInitScript(() => localStorage.setItem("np_lead_sent", "1"));
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.goto(base);
  await page.locator('[data-cta="hero_explore"]').click();
  await page.waitForFunction(() => Math.abs(document.getElementById("design-story").getBoundingClientRect().top) < 2);
  assert.match(await page.locator("html").evaluate(el => getComputedStyle(el).scrollSnapType), /mandatory/);
  await page.mouse.move(1200, 400); await page.mouse.wheel(0, 640);
  await page.waitForFunction(() => Math.abs(document.getElementById("landscape-story").getBoundingClientRect().top) < 2);
  console.log("PASS anchor and section snap with simulated 4x CPU slowdown (1366x768)");
  await context.close();
} finally { await browser.close(); }
