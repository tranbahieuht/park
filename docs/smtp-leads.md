# Norton Park: SMTP leads

## Configuration

Copy `.env.example` to `.env.local` and supply real values locally. `.gitignore` already excludes `.env.local` and the other local environment files. None of the SMTP variables may use `NEXT_PUBLIC_`.

| Variable | Value |
| --- | --- |
| `SMTP_HOST` | SMTP hostname supplied by the mail provider |
| `SMTP_PORT` | Usually 465 for implicit TLS or 587 for STARTTLS |
| `SMTP_SECURE` | `true` for implicit TLS; `false` requires STARTTLS, never clear-text production mail |
| `SMTP_USER`, `SMTP_PASSWORD` | Provider SMTP credentials/app password |
| `SMTP_FROM` | Single bare sender mailbox, verified/authorized by the provider |
| `LEAD_RECEIVER_EMAIL` | Single bare internal sales-team mailbox |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | HTTPS REST endpoint and write token of a shared Redis database |
| `LEAD_RATE_LIMIT_SECRET` | Independent random secret, at least 32 characters |

Generate the signing secret with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Keep the result out of source control and logs. Do not paste real SMTP credentials into tickets or screenshots.

## Vercel

In Project → Settings → Environment Variables, configure all variables above for the intended Production/Preview environments. Use a separate internal test recipient and SMTP account for Preview. Redeploy manually after changing variables; this implementation does not deploy automatically.

`POST /api/leads` is an App Router Route Handler using `runtime = "nodejs"`, with `maxDuration = 60`. It awaits Nodemailer directly. The deployment must support outbound SMTP connections and the configured function duration. Configure SPF/DKIM and sender permissions with the email provider. Successful API responses mean the SMTP server accepted the recipient/message, not a guarantee of inbox delivery; inspect provider delivery/bounce reports separately.

The API uses Vercel's overwritten `x-forwarded-for` header only when `VERCEL=1`. Outside Vercel it deliberately uses a shared bucket rather than trusting spoofable forwarding headers. If deploying behind a different trusted proxy, implement IP extraction for that proxy before exposing it publicly.

## Abuse prevention and duplicates

- Five POST requests per IP per 10 minutes, counted atomically with Redis `INCR` + expiry in Lua; 429 includes `Retry-After: 600`. Invalid/honeypot requests consume a slot too.
- Honeypot must be empty, consent must be boolean `true`, requests are JSON only and at most 8 KiB. Supplied foreign Origin/cross-site requests are rejected. Origin checks do not replace rate limiting.
- Redis stores only HMAC-derived keys, counts and opaque processing/completed tokens with TTL, never names, phone numbers, emails or raw IPs. SMTP is the only lead destination. No customer database is added.
- Same normalized name/phone/email/unit is deduplicated across both forms for 24 hours. Source/language/client timestamp do not allow bypassing deduplication. Processing lock expires after 120 seconds and is released on a known SMTP failure.
- Production/Vercel fails closed (503) when shared Redis or signing secret is absent/unreachable. An in-memory limiter is allowed **only** outside production/Vercel for local development; it does not protect serverless multi-instance deployments.
- Set Vercel Firewall/WAF rate limiting/bot protection for `/api/leads` as an additional edge control, especially against distributed floods. This is a dashboard deployment configuration, not silently assumed to be enabled.
- SMTP and Redis cannot commit atomically: if the process dies after SMTP accepts the message but before persisting completion, or the provider accepts DATA then loses the response, a later manual retry can duplicate email. There is no automatic send retry. If completion persistence fails after a known SMTP acceptance, the API still reports success to avoid prompting an immediate resend. Exactly-once delivery is not claimed.

## Request and UI behavior

Payload fields: `name` (2–120 chars after trimming), `phone` (9–15 digits plus supported separators), optional `email` (omitted, empty string or valid mailbox, max 254), `unit` (max 100, empty string allowed), `language` (`vi`/`en`), `source` (`popup`/`landing`), `consent` (true), `website` (empty honeypot), `registeredAt` (ISO date string). The email's receipt time comes from the server in Asia/Ho_Chi_Minh time; client time is never trusted as the receipt time. Recipient/from are always read from server configuration; client-supplied routing fields are ignored.

Forms share one submission hook and the same API. Busy state disables submit; failure preserves entries and shows VI/EN errors. Only confirmed API acceptance emits `generate_lead`, sets the existing local lead marker and opens the existing success state. Analytics contains only source/language/unit, not name/phone/email. Both frontend and server validate input. The landing form keeps its two steps. The chatbot currently has no lead-capture form and remains unchanged.

## Checks

```sh
node --test scripts/leads.test.mjs
npm run lint
npm run typecheck
npm run build
```

The existing extracted `New folder` contains unrelated lint failures. For the application-only check, use `npm run lint -- --ignore-pattern "New folder/**"`; do not automatically rewrite the extracted websites.

### Safe local SMTP test (no external mail)

Use OpenSSL to create a short-lived self-signed certificate **outside the repository**:

```sh
openssl req -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem -days 2 -subj /CN=localhost -addext subjectAltName=DNS:localhost,IP:127.0.0.1
node scripts/smtp-sandbox.mjs /absolute/path/cert.pem /absolute/path/key.pem
```

Start `npm run dev` in another terminal with `SMTP_HOST=127.0.0.1`, `SMTP_PORT=2465`, `SMTP_SECURE=true`, `SMTP_USER=sandbox`, `SMTP_PASSWORD=sandbox-only`, `SMTP_FROM=website@example.test`, `LEAD_RECEIVER_EMAIL=sink@example.test`. Set `NODE_EXTRA_CA_CERTS` to the certificate's absolute path **before** launching Node. Omit Redis URL/token only for this local development test. Never disable TLS verification to make a production SMTP connection work.

The sandbox binds only loopback, never forwards mail, and exposes in-memory synthetic messages at `http://127.0.0.1:3102`. Use synthetic names/contact details only. POST `{"reject":true,"delay":1500}` to that loopback endpoint to simulate SMTP 451 failures and a visible pending state; POST `{"reject":false,"delay":1500}` to allow acceptance. The development API rate limit still applies; restart the development process to reset its local counters during repeated QA.

Verify popup and landing form: pending/disabled → failure with retained fields → retry → success; duplicate submissions must not produce another message. Also test VI/EN, optional email, consent, honeypot, oversized/injected values, mobile, 429 and missing/unreachable production configuration. Stop both local servers afterward. Never test against a customer's mailbox without explicit approval.

References: [Nodemailer SMTP](https://nodemailer.com/smtp), [Redis REST API](https://upstash.com/docs/redis/features/restapi), [Vercel request headers](https://vercel.com/docs/headers/request-headers).
