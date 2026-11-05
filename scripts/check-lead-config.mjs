// Local operator check: names/status only. Never print credentials or contact data.
import nextEnv from "@next/env";
nextEnv.loadEnvConfig(process.cwd(), false, { info() {}, error() {} });
const required = ["SMTP_HOST", "SMTP_PORT", "SMTP_SECURE", "SMTP_USER", "SMTP_PASSWORD", "SMTP_FROM", "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN", "LEAD_RATE_LIMIT_SECRET"];
const missing = required.filter(key => !process.env[key]);
const invalid = [];
const e = process.env;
if (e.SMTP_PORT && (!Number.isInteger(Number(e.SMTP_PORT)) || Number(e.SMTP_PORT) < 1 || Number(e.SMTP_PORT) > 65535)) invalid.push("SMTP_PORT");
if (e.SMTP_SECURE && !["true", "false"].includes(e.SMTP_SECURE)) invalid.push("SMTP_SECURE");
if (e.SMTP_PORT === "465" && e.SMTP_SECURE === "false") invalid.push("SMTP_SECURE");
if (e.SMTP_HOST && /[\s\u0000-\u001f]/.test(e.SMTP_HOST)) invalid.push("SMTP_HOST");
for (const key of ["SMTP_USER", "SMTP_FROM"]) if (e[key] && !/^[^\s<>@,;"\\]+@[^\s<>@,;"\\]+\.[^\s<>@,;"\\]+$/.test(e[key])) invalid.push(key);
if (e.SMTP_FROM && e.SMTP_USER && e.SMTP_FROM.toLowerCase() !== e.SMTP_USER.toLowerCase()) invalid.push("SMTP_FROM");
if (e.LEAD_RATE_LIMIT_SECRET && e.LEAD_RATE_LIMIT_SECRET.trim().length < 32) invalid.push("LEAD_RATE_LIMIT_SECRET");
if (e.UPSTASH_REDIS_REST_TOKEN && /\s/.test(e.UPSTASH_REDIS_REST_TOKEN)) invalid.push("UPSTASH_REDIS_REST_TOKEN");
if (e.UPSTASH_REDIS_REST_URL) {
  try { const url = new URL(e.UPSTASH_REDIS_REST_URL); if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/" || url.search || url.hash) invalid.push("UPSTASH_REDIS_REST_URL"); }
  catch { invalid.push("UPSTASH_REDIS_REST_URL"); }
}
console.log(JSON.stringify({ scope: "local process / local env files; not Vercel dashboard", missing, invalid: [...new Set(invalid)], connectivityTested: false }, null, 2));
if (missing.length || invalid.length) process.exitCode = 1;
