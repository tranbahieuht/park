import { LeadError, claimSubmission, limitRequest } from "@/lib/leads/abuse";
import { sendLead } from "@/lib/leads/mail";
import { validateLead } from "@/lib/leads/validation";
import { deliveryError } from "@/lib/leads/errors";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";
export const maxDuration = 60;
const response = (status: number, code: string, requestId: string) => Response.json({ ok: status === 200, code }, {
  status, headers: { "Cache-Control": "no-store", "X-Request-Id": requestId, ...(status === 429 ? { "Retry-After": "600" } : {}) },
});

async function readBody(request: Request) {
  if (Number(request.headers.get("content-length") || 0) > 8192) throw new RangeError();
  const reader = request.body?.getReader();
  if (!reader) throw new SyntaxError();
  const chunks: Uint8Array[] = []; let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > 8192) { await reader.cancel(); throw new RangeError(); }
    chunks.push(value);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const expected = new URL(request.url), supplied = new URL(origin);
    // Next may canonicalize request.url to localhost behind its HTTP server.
    // Host is the actual request authority and cannot be overridden by browser JS.
    const host = request.headers.get("host");
    if (host) {
      if (!/^[a-z0-9.:[\]-]+$/i.test(host)) return false;
      expected.host = host;
    }
    const forwardedProtocol = request.headers.get("x-forwarded-proto");
    if (process.env.VERCEL === "1" && ["http", "https"].includes(forwardedProtocol || "")) expected.protocol = forwardedProtocol + ":";
    return supplied.origin === origin && supplied.origin === expected.origin;
  } catch { return false; }
}

export async function POST(request: Request) {
  const requestId = randomUUID();
  const reply = (status: number, code: string) => response(status, code, requestId);
  // Only server-generated IDs and internal enums; no input, provider text or PII.
  const diagnostic = (reason: string) => console.error(JSON.stringify({ event: "lead_service_error", requestId, reason }));
  if (!sameOrigin(request) || request.headers.get("sec-fetch-site") === "cross-site") return reply(403, "FORBIDDEN");
  if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") return reply(415, "INVALID");
  try {
    await limitRequest(request);
    const lead = validateLead(await readBody(request));
    if (!lead) return reply(400, "INVALID");
    // Same contact/interest is one submission across both forms for 24 hours.
    const claim = await claimSubmission(JSON.stringify([lead.name.toLowerCase(), lead.phone.replace(/\D/g, ""), lead.email.toLowerCase(), lead.unit]));
    if (claim.duplicate) return reply(200, "ACCEPTED");
    try { await sendLead(lead); }
    catch (cause) {
      const error = deliveryError(cause);
      diagnostic(error.reason);
      // A lost SMTP response may follow acceptance. Retain the 120 s lock in
      // that ambiguous case instead of allowing an immediate duplicate send.
      if (error.reason !== "SMTP_TIMEOUT") await claim.finish(false).catch(() => diagnostic("DEDUPE_RELEASE_FAILED"));
      return reply(503, error.reason === "SMTP_TIMEOUT" ? "DELIVERY_UNCONFIRMED"
        : ["SMTP_CONFIGURATION", "SMTP_AUTH"].includes(error.reason) ? "SERVICE_UNAVAILABLE" : "DELIVERY_FAILED");
    }
    // Email has already been accepted by SMTP. Never tell the client to retry
    // just because persisting the completed marker failed.
    await claim.finish(true).catch(() => diagnostic("DEDUPE_COMPLETION_FAILED"));
    return reply(200, "ACCEPTED");
  } catch (error) {
    if (error instanceof LeadError) {
      if (error.code === "UNAVAILABLE") diagnostic(error.reason);
      return reply(error.code === "RATE_LIMITED" ? 429 : error.code === "BUSY" ? 409 : 503, error.code === "UNAVAILABLE" ? "SERVICE_UNAVAILABLE" : error.code);
    }
    if (error instanceof RangeError) return reply(413, "INVALID");
    if (error instanceof SyntaxError) return reply(400, "INVALID");
    diagnostic("UNEXPECTED_SERVICE_ERROR");
    return reply(503, "SERVICE_UNAVAILABLE");
  }
}
