import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";

// Exercise the route and server modules without booting Next; only SMTP is
// stubbed here. A separate local TLS SMTP fixture verifies real Nodemailer I/O.
const root = path.resolve(import.meta.dirname, "..");
const require = createRequire(import.meta.url);
function loader(stubs = {}) {
  const cache = new Map();
  function load(file) {
    const full = path.resolve(root, file);
    if (cache.has(full)) return cache.get(full).exports;
    const record = { exports: {} }; cache.set(full, record);
    const code = ts.transpileModule(fs.readFileSync(full, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017, esModuleInterop: true } }).outputText;
    const localRequire = id => {
      if (id === "server-only") return {};
      if (id in stubs) return stubs[id];
      if (id.startsWith("@/")) return load("src/" + id.slice(2) + ".ts");
      if (id.startsWith(".")) return load(path.relative(root, path.resolve(path.dirname(full), id + ".ts")));
      return require(id);
    };
    vm.runInThisContext(`(function(require,module,exports){${code}\n})`, { filename: full })(localRequire, record, record.exports);
    return record.exports;
  }
  return load;
}
const input = { name: "QA Test", phone: "0901234567", email: "qa@example.test", unit: "Studio", source: "popup", language: "vi", consent: true, website: "", registeredAt: new Date().toISOString() };
const load = loader();
const { validateLead, validLeadEmail } = load("src/lib/leads/validation.ts");

test("every consultation source validates without allowing arbitrary metadata", () => {
  const { LEAD_SOURCES } = load("src/lib/leads/validation.ts");
  for (const source of LEAD_SOURCES) assert.equal(validateLead({ ...input, source }).source, source);
});

test("SMTP transport fixes recipient, uses configured sender, validates Reply-To and reports actual acceptance", async () => {
  const env = { ...process.env };
  Object.assign(process.env, { SMTP_HOST: "smtp.example.test", SMTP_PORT: "465", SMTP_SECURE: "true",
    SMTP_USER: "sender@example.test", SMTP_PASSWORD: "synthetic-test-only", SMTP_FROM: "sender@example.test",
    LEAD_RECEIVER_EMAIL: "attacker@example.test" });
  let mail, options, closed = 0, outcome = "accepted";
  const { sendLead, smtpConfig } = loader({ nodemailer: { createTransport(config) {
    options = config;
    return { async sendMail(message) {
      mail = message;
      if (outcome === "auth") throw Object.assign(Error("private provider detail"), { code: "EAUTH" });
      if (outcome === "timeout") throw Object.assign(Error("private provider detail"), { code: "ETIMEDOUT" });
      return outcome === "accepted" ? { accepted: ["sales@savills.com.vn"], rejected: [] } : { accepted: [], rejected: ["sales@savills.com.vn"] };
    }, close() { closed++; } };
  } } })("src/lib/leads/mail.ts");
  try {
    await sendLead({ ...input, source: "pricing_calculator", unit: "Duplex" });
    assert.equal(mail.to.address, "sales@savills.com.vn");
    assert.equal(mail.from.address, "sender@example.test");
    assert.equal(mail.replyTo.address, "qa@example.test");
    assert.ok(mail.text.includes("pricing_calculator")); assert.ok(mail.text.includes("Duplex"));
    assert.ok(mail.subject.includes("Norton Park"));
    assert.equal(options.logger, false); assert.equal(options.debug, false);
    await sendLead({ ...input, email: "" }); assert.equal(mail.replyTo, undefined);
    for (outcome of ["auth", "timeout", "rejected"]) await assert.rejects(sendLead(input));
    assert.equal(closed, 5);
    process.env.SMTP_FROM = "sales@savills.com.vn"; assert.throws(smtpConfig, /unavailable/);
    process.env.SMTP_FROM = "sender@example.test";
    delete process.env.SMTP_PASSWORD; assert.throws(smtpConfig, /unavailable/);
  } finally {
    for (const key of Object.keys(process.env)) if (!(key in env)) delete process.env[key];
    Object.assign(process.env, env);
  }
});

test("server validation rejects forged consent, invalid phone/email, controls, oversized fields and honeypot", () => {
  assert.ok(validateLead(input));
  const withoutEmail = { ...input }; delete withoutEmail.email;
  assert.ok(validateLead(withoutEmail));
  for (const patch of [{ consent: false }, { consent: "true" }, { name: "a" }, { name: "a\r\nBcc:x" }, { phone: "abcdef123456789" }, { phone: "++84901234567" }, { email: "a@example.com\r\nBcc:x@y.test" }, { email: "bad" }, { unit: "a".repeat(101) }, { website: "bot" }, { source: "other" }, { language: "fr" }, { registeredAt: "not-date" }]) assert.equal(validateLead({ ...input, ...patch }), null);
  assert.equal(validLeadEmail("a@example\0.com"), false);
});
test("HTML escapes customer content and plain text is present; receipt time is server-controlled", () => {
  const { leadMessage } = load("src/lib/leads/mail.ts");
  const mail = leadMessage({ ...input, name: '<img src="x">', unit: "<b>Studio</b>" }, new Date("2026-01-01T00:00:00Z"));
  assert.ok(mail.html.includes("&lt;img")); assert.ok(!mail.html.includes('<img src="x">'));
  assert.ok(mail.text.includes("qa@example.test")); assert.ok(mail.text.includes("2026")); assert.ok(!mail.text.includes("undefined"));
});
test("API validation, SMTP rejection, retry, deduplication and throttling", async () => {
  const previous = process.env.NODE_ENV; process.env.NODE_ENV = "test";
  let attempts = 0, fail = true;
  const route = loader({ "@/lib/leads/mail": { sendLead: async () => { attempts++; if (fail) throw Error("sensitive SMTP detail"); } } })("src/app/api/leads/route.ts");
  const request = (body, headers = {}) => new Request("http://localhost/api/leads", { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body) });
  try {
    assert.equal((await route.POST(request(input, { Origin: "https://evil.test" }))).status, 403);
    assert.equal((await route.POST(request({ ...input, consent: false }))).status, 400);
    const failure = await route.POST(request(input)); assert.equal(failure.status, 503); assert.deepEqual(await failure.json(), { ok: false, code: "UNAVAILABLE" });
    fail = false;
    assert.equal((await route.POST(request({ ...input, to: "attacker@example.test", from: "attacker@example.test" }))).status, 200);
    assert.equal((await route.POST(request({ ...input, source: "contact_form" }))).status, 200); assert.equal(attempts, 2);
    assert.equal((await route.POST(request({ ...input, unit: "x".repeat(9000) }))).status, 413);
    assert.equal((await route.POST(request(input))).status, 429);
  } finally { if (previous === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previous; }
});
test("concurrent submissions share a lock; failed SMTP releases it for retry", async () => {
  const previous = process.env.NODE_ENV; process.env.NODE_ENV = "test";
  try {
    const { claimSubmission } = loader()("src/lib/leads/abuse.ts");
    const a = await claimSubmission("same"); await assert.rejects(claimSubmission("same"), /BUSY/);
    await a.finish(false); const b = await claimSubmission("same"); assert.equal(b.duplicate, false);
    await b.finish(true); assert.equal((await claimSubmission("same")).duplicate, true);
  } finally { if (previous === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previous; }
});
test("production fails closed without shared state or a signing secret", async () => {
  const previous = process.env.NODE_ENV; process.env.NODE_ENV = "production";
  try { const { claimSubmission } = loader()("src/lib/leads/abuse.ts"); await assert.rejects(claimSubmission("x"), /UNAVAILABLE/); }
  finally { if (previous === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previous; }
});
test("shared rate limit uses an atomic expiring counter and never falls back after Redis failure", async () => {
  const env = { ...process.env }, originalFetch = globalThis.fetch;
  process.env.NODE_ENV = "production"; process.env.VERCEL = "1";
  process.env.LEAD_RATE_LIMIT_SECRET = "a".repeat(32); process.env.UPSTASH_REDIS_REST_URL = "https://redis.example.test"; process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
  const commands = [];
  globalThis.fetch = async (_, options) => { commands.push(JSON.parse(options.body)); return Response.json({ result: 6 }); };
  try {
    const { limitRequest } = loader()("src/lib/leads/abuse.ts");
    await assert.rejects(limitRequest(new Request("http://localhost", { headers: { "x-forwarded-for": "192.0.2.1" } })), /RATE_LIMITED/);
    assert.equal(commands[0][0], "EVAL"); assert.ok(commands[0][1].includes("EXPIRE")); assert.ok(!JSON.stringify(commands).includes("192.0.2.1"));
    globalThis.fetch = async () => { throw Error("offline"); };
    await assert.rejects(limitRequest(new Request("http://localhost")), /UNAVAILABLE/);
  } finally { globalThis.fetch = originalFetch; for (const key of Object.keys(process.env)) if (!(key in env)) delete process.env[key]; Object.assign(process.env, env); }
});
