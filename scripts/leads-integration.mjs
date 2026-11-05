// Production Next API + real Nodemailer/TLS against loopback-only SMTP/Redis fixtures.
// No external delivery. Build first; pass an ephemeral localhost cert and key.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import tls from "node:tls";
import { spawn } from "node:child_process";
import { once } from "node:events";
const [certFile, keyFile] = process.argv.slice(2);
if (!certFile || !keyFile) throw Error("Usage: node scripts/leads-integration.mjs <localhost-cert.pem> <localhost-key.pem>");
const root = path.resolve(import.meta.dirname, "..");
// Never let Next load a real SMTP account from local env files during tests.
for (const name of [".env", ".env.local", ".env.production", ".env.production.local"]) {
  if (fs.existsSync(path.join(root, name))) throw Error(`Refusing integration test while ${name} exists; use an isolated checkout without real credentials`);
}
const credentials = { cert: fs.readFileSync(certFile), key: fs.readFileSync(keyFile) };
const envNames = ["SMTP_HOST", "SMTP_PORT", "SMTP_SECURE", "SMTP_USER", "SMTP_PASSWORD", "SMTP_FROM", "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN", "LEAD_RATE_LIMIT_SECRET", "VERCEL"];
const cleanEnv = { ...process.env, NODE_ENV: "production" };
for (const key of envNames) cleanEnv[key] = "";
const store = new Map(), messages = [], sockets = new Set();
let mode = "accept", redisMode = "ok", app, logs = "";
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const redis = https.createServer(credentials, async (request, response) => {
  if (redisMode === "auth") { response.writeHead(401); response.end("local unauthorized"); return; }
  if (redisMode === "malformed") { response.setHeader("Content-Type", "application/json"); response.end('{"result":null}'); return; }
  let body = ""; for await (const chunk of request) body += chunk;
  const command = JSON.parse(body), script = command[1], key = command[3];
  if (store.get(key)?.expires <= Date.now()) store.delete(key);
  let result;
  if (script.includes("INCR")) {
    const value = store.get(key) || { value: 0, expires: Date.now() + 600000 };
    value.value++; store.set(key, value); result = value.value;
  } else if (script.includes("~=ARGV[1]")) {
    if (store.get(key)?.value !== command[4]) result = 0;
    else {
      if (command[5] === "1") store.set(key, { value: "done", expires: Date.now() + 86400000 }); else store.delete(key);
      result = 1;
    }
  } else {
    result = store.get(key)?.value || "";
    if (!result) store.set(key, { value: command[4], expires: Date.now() + 120000 });
  }
  response.setHeader("Content-Type", "application/json"); response.end(JSON.stringify({ result }));
});
const smtp = tls.createServer(credentials, socket => {
  sockets.add(socket); socket.on("close", () => sockets.delete(socket)); socket.on("error", () => {});
  socket.setEncoding("utf8"); socket.write("220 localhost test-only SMTP\r\n");
  let buffer = "", data = false, lines = [], auth = 0, recipient = "", sender = "";
  socket.on("data", chunk => {
    buffer += chunk;
    while (buffer.includes("\r\n")) {
      const index = buffer.indexOf("\r\n"), line = buffer.slice(0, index); buffer = buffer.slice(index + 2);
      if (data) {
        if (line !== ".") { lines.push(line); continue; }
        data = false;
        if (mode === "timeout") continue;
        const message = lines.join("\r\n"), rejected = mode === "reject";
        setTimeout(() => {
          if (socket.destroyed) return;
          if (rejected) socket.write("451 local test rejection\r\n");
          else { messages.push({ sender, recipient, message }); socket.write("250 accepted by local sink only\r\n"); }
        }, 200);
      } else if (auth) { auth--; socket.write(auth ? "334 UGFzc3dvcmQ6\r\n" : "235 authenticated\r\n"); }
      else if (/^EHLO|^HELO/i.test(line)) socket.write("250-localhost\r\n250 AUTH PLAIN LOGIN\r\n");
      else if (/^AUTH/i.test(line) && mode === "auth") socket.write("535 local test auth failure\r\n");
      else if (/^AUTH PLAIN/i.test(line)) socket.write("235 authenticated\r\n");
      else if (/^AUTH LOGIN/i.test(line)) { auth = 2; socket.write("334 VXNlcm5hbWU6\r\n"); }
      else if (/^MAIL FROM:/i.test(line)) { sender = line.slice(10); socket.write("250 ok\r\n"); }
      else if (/^RCPT TO:/i.test(line)) { recipient = line.slice(8); socket.write("250 ok\r\n"); }
      else if (/^DATA$/i.test(line)) { data = true; lines = []; socket.write("354 end with dot\r\n"); }
      else if (/^QUIT$/i.test(line)) socket.end("221 bye\r\n");
      else socket.write("250 ok\r\n");
    }
  });
});
async function listen(server) { server.listen(0, "127.0.0.1"); await once(server, "listening"); return server.address().port; }
const base = "http://127.0.0.1:3103";
async function start(env) {
  logs = "";
  app = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", "3103"], { cwd: root, env, stdio: ["ignore", "pipe", "pipe"] });
  app.stdout.on("data", data => { logs += data; }); app.stderr.on("data", data => { logs += data; });
  for (let i = 0; i < 100; i++) {
    if (app.exitCode !== null) throw Error("Local Next test server exited");
    if (logs.includes("Ready in")) return;
    await delay(100);
  }
  throw Error("Local Next test server did not become ready");
}
async function stop() {
  if (!app || app.exitCode !== null) return;
  const exited = once(app, "exit"); app.kill(); await exited; app = undefined;
}
const input = { name: "Synthetic Integration QA", phone: "0901234567", email: "", unit: "", language: "vi", source: "hero_consultation", consent: true, website: "", registeredAt: new Date().toISOString() };
const post = (value = input) => fetch(base + "/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(value) });
try {
  await start(cleanEnv);
  const missing = await post(); assert.equal(missing.status, 503); assert.equal((await missing.json()).code, "SERVICE_UNAVAILABLE");
  assert.ok(logs.includes("RATE_SECRET_MISSING")); assert.equal(messages.length, 0);
  console.log("PASS production-mode local API: missing configuration fails safely before SMTP");
  await stop();
  const redisPort = await listen(redis), smtpPort = await listen(smtp);
  await start({ ...cleanEnv, NODE_EXTRA_CA_CERTS: path.resolve(certFile), SMTP_HOST: "127.0.0.1", SMTP_PORT: String(smtpPort), SMTP_SECURE: "true", SMTP_USER: "sender@example.test", SMTP_PASSWORD: "synthetic-local-only", SMTP_FROM: "sender@example.test", UPSTASH_REDIS_REST_URL: `https://127.0.0.1:${redisPort}`, UPSTASH_REDIS_REST_TOKEN: "synthetic-local-only", LEAD_RATE_LIMIT_SECRET: "local-only-test-signing-secret-32-chars" });
  const forbidden = await fetch(base + "/api/leads", { method: "POST", headers: { Origin: "https://foreign.example.test", "Content-Type": "application/json" }, body: JSON.stringify(input) });
  assert.equal(forbidden.status, 403); assert.equal((await forbidden.json()).code, "FORBIDDEN");
  assert.ok(logs.includes(forbidden.headers.get("X-Request-Id"))); assert.equal(messages.length, 0);
  for (redisMode of ["auth", "malformed"]) {
    const unavailable = await post(); assert.equal(unavailable.status, 503);
    assert.equal((await unavailable.json()).code, "SERVICE_UNAVAILABLE"); assert.equal(messages.length, 0);
    assert.ok(logs.includes("REDIS_UNAVAILABLE"));
  }
  redisMode = "ok";
  console.log("PASS production-mode local HTTP: Origin 403, Redis 401 and malformed response fail closed before SMTP");
  assert.equal((await post({ ...input, consent: false })).status, 400);
  mode = "auth"; const auth = await post(); assert.equal((await auth.json()).code, "SERVICE_UNAVAILABLE"); assert.ok(logs.includes("SMTP_AUTH"));
  mode = "reject"; assert.equal((await (await post()).json()).code, "DELIVERY_FAILED");
  mode = "accept"; assert.equal((await post()).status, 200);
  assert.equal((await post()).status, 200); assert.equal(messages.length, 1);
  const limited = await post(); assert.equal(limited.status, 429); assert.equal(limited.headers.get("Retry-After"), "600");
  assert.equal((await limited.json()).code, "RATE_LIMITED"); assert.equal(messages.length, 1);
  assert.equal(messages[0].recipient, "<sales@savills.com.vn>"); assert.equal(messages[0].sender, "<sender@example.test>");
  assert.ok(!messages[0].message.includes("Reply-To:"));
  console.log("PASS real Nodemailer TLS/auth/rejection/retry/optional email/recipient/deduplication, local sink only");
  store.clear(); const before = messages.length;
  const concurrent = await Promise.all([post({ ...input, unit: "Duplex" }), post({ ...input, unit: "Duplex" })]);
  assert.deepEqual(concurrent.map(r => r.status).sort(), [200, 409]); assert.equal(messages.length, before + 1);
  store.clear(); mode = "timeout";
  assert.equal((await (await post()).json()).code, "DELIVERY_UNCONFIRMED");
  assert.equal((await post()).status, 409); assert.equal(messages.length, before + 1);
  console.log("PASS real SMTP socket timeout: unconfirmed response, no immediate resend");
  mode = "accept";
  const { chromium } = await import("playwright").catch(() => import(new URL("../temp/qa-tools/node_modules/playwright/index.mjs", import.meta.url)));
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    for (const width of [1440, 390]) for (const language of ["vi", "en"]) {
      store.clear(); const count = messages.length;
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      await context.addInitScript(() => localStorage.setItem("np_lead_sent", "1"));
      const page = await context.newPage(), payloads = [], errors = [], replies = [];
      page.on("response", async response => {
        if (response.url().endsWith("/api/leads")) replies.push({ status: response.status(), body: await response.json() });
      });
      page.on("pageerror", e => errors.push(e.message));
      page.on("request", req => { if (req.url().endsWith("/api/leads")) payloads.push(req.postDataJSON()); });
      await page.goto(base); await page.locator(`[data-lang="${language}"]`).click();
      await page.locator('[data-cta="hero"]').click();
      await page.locator('#popForm [type="submit"]').click(); assert.equal(payloads.length, 0);
      await page.locator("#pName").fill("Synthetic Browser QA"); await page.locator("#pPhone").fill("abc");
      await page.locator("#pEmail").fill("invalid"); await page.locator('#popForm [type="submit"]').click();
      assert.equal(await page.locator("#pEmail").getAttribute("aria-invalid"), "true"); assert.equal(payloads.length, 0);
      await page.locator("#pPhone").fill("0901234567"); await page.locator("#pEmail").fill("");
      await page.locator('#popForm [type="submit"]').click(); assert.equal(payloads.length, 0);
      await page.locator("#pConsent").check();
      mode = "auth";
      await page.locator('#popForm [type="submit"]').click();
      await page.locator('#popForm [role="alert"]').waitFor();
      assert.match(await page.locator('#popForm [role="alert"]').innerText(), language === "vi" ? /tạm gián đoạn/ : /temporarily unavailable/, JSON.stringify(replies));
      assert.equal(await page.locator("#pName").inputValue(), "Synthetic Browser QA"); assert.equal(messages.length, count);
      mode = "accept";
      await page.locator('#popForm [type="submit"]').evaluate(button => { button.click(); button.click(); });
      assert.ok(await page.locator('#popForm [type="submit"]').isDisabled());
      await page.waitForFunction(() => !document.querySelector('#popForm [type="submit"]').disabled);
      assert.equal(await page.locator("#popOk.on").count(), 1, `Expected confirmed success: ${JSON.stringify(replies)}; ${await page.locator('#popForm [role="alert"]').allTextContents()}`);
      await page.locator("#popOk.on").waitFor(); assert.equal(payloads.length, 2);
      assert.equal(payloads[1].email, ""); assert.equal(payloads[1].unit, ""); assert.equal(payloads[1].consent, true); assert.equal(payloads[1].source, "hero_consultation");
      await page.locator(".pop-close").click(); await page.waitForSelector("#pop:not(.is-open)", { state: "attached" });
      const interested = width === 1440 && language === "vi" ? "" : "Duplex";
      if (interested) await page.locator('#register .choice:has(input[value="Duplex"])').click();
      await page.locator("#next").click(); await page.locator("#back").click();
      assert.equal(await page.locator('#register input[name="unit_interest"]:checked').count(), interested ? 1 : 0);
      await page.locator("#next").click();
      await page.locator("#fullname").fill("Synthetic Contact QA"); await page.locator("#phone").fill("0901234567");
      await page.locator("#email").fill("bad-email"); await page.locator("#consent").check();
      await page.locator('#leadForm [type="submit"]').click(); assert.equal(payloads.length, 2);
      assert.equal(await page.locator("#email").getAttribute("aria-invalid"), "true");
      await page.locator("#email").fill(""); await page.locator('#leadForm [type="submit"]').click(); await page.locator("#success.on").waitFor();
      assert.equal(payloads[2].source, "contact_form"); assert.equal(payloads[2].language, language); assert.equal(payloads[2].unit, interested);
      assert.equal(messages.length, count + 2); assert.deepEqual(errors, []);
      await context.close(); console.log(`PASS browser -> real API -> TLS local sink: ${width} ${language}, both forms, optional email/unit, validation, pending and double click`);
    }
  } finally { await browser.close(); }
  const events = logs.split(/\r?\n/).filter(line => line.startsWith('{"event":"lead_service_error"')).map(line => JSON.parse(line));
  assert.ok(events.length >= 2);
  assert.ok(events.every(e => Object.keys(e).sort().join(",") === "code,event,reason,requestId,status"));
  console.log("PASS diagnostics: generated request IDs and internal reasons only. No external email was sent.");
} catch (error) {
  console.error(logs.split(/\r?\n/).filter(line => line.startsWith('{"event":"lead_service_error"')).join("\n"));
  throw error;
} finally {
  await stop(); for (const socket of sockets) socket.destroy();
  redis.closeAllConnections(); await Promise.all([new Promise(r => redis.close(r)), new Promise(r => smtp.close(r))]);
}
