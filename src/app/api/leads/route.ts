import { LeadError, claimSubmission, limitRequest } from "@/lib/leads/abuse";
import { sendLead } from "@/lib/leads/mail";
import { validateLead } from "@/lib/leads/validation";

export const runtime = "nodejs";
export const maxDuration = 60;
const response = (status: number, code: string) => Response.json({ ok: status === 200, code }, {
  status, headers: { "Cache-Control": "no-store", ...(status === 429 ? { "Retry-After": "600" } : {}) },
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

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if ((origin && origin !== new URL(request.url).origin) || request.headers.get("sec-fetch-site") === "cross-site") return response(403, "INVALID");
  if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") return response(415, "INVALID");
  try {
    await limitRequest(request);
    const lead = validateLead(await readBody(request));
    if (!lead) return response(400, "INVALID");
    // Same contact/interest is one submission across both forms for 24 hours.
    const claim = await claimSubmission(JSON.stringify([lead.name.toLowerCase(), lead.phone.replace(/\D/g, ""), lead.email.toLowerCase(), lead.unit]));
    if (claim.duplicate) return response(200, "ACCEPTED");
    try { await sendLead(lead); }
    catch {
      await claim.finish(false).catch(() => {});
      return response(503, "UNAVAILABLE");
    }
    // Email has already been accepted by SMTP. Never tell the client to retry
    // just because persisting the completed marker failed.
    await claim.finish(true).catch(() => {});
    return response(200, "ACCEPTED");
  } catch (error) {
    if (error instanceof LeadError) return response(error.code === "RATE_LIMITED" ? 429 : error.code === "BUSY" ? 409 : 503, error.code);
    if (error instanceof RangeError) return response(413, "INVALID");
    if (error instanceof SyntaxError) return response(400, "INVALID");
    return response(503, "UNAVAILABLE");
  }
}
