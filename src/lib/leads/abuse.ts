import "server-only";
import { createHmac, randomUUID } from "node:crypto";
import { isIP } from "node:net";

const WINDOW = 600;
type LocalCounters = Map<string, { value: string; expires: number }>;
const developmentGlobal = globalThis as typeof globalThis & { npLeadCounters?: LocalCounters };
const local: LocalCounters = process.env.NODE_ENV === "development"
  ? (developmentGlobal.npLeadCounters ??= new Map()) : new Map();
export class LeadError extends Error {
  constructor(public code: "RATE_LIMITED" | "BUSY" | "UNAVAILABLE", public reason: "ABUSE_UNAVAILABLE" | "RATE_SECRET_MISSING" | "RATE_SECRET_INVALID" | "REDIS_CONFIGURATION" | "REDIS_UNAVAILABLE" = "ABUSE_UNAVAILABLE") { super(code); }
}

const production = () => process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
export function digest(value: string) {
  const secret = process.env.LEAD_RATE_LIMIT_SECRET;
  if (production()) {
    if (!secret) throw new LeadError("UNAVAILABLE", "RATE_SECRET_MISSING");
    if (secret.trim().length < 32) throw new LeadError("UNAVAILABLE", "RATE_SECRET_INVALID");
  }
  return createHmac("sha256", secret || "local-development-only").update(value).digest("hex");
}

async function redis(command: (string | number)[]): Promise<unknown> {
  const url = process.env.UPSTASH_REDIS_REST_URL || "", token = process.env.UPSTASH_REDIS_REST_TOKEN || "";
  // This is the REST database root, not a dashboard URL or Redis command URL.
  // Reject locally before attaching the bearer token to an invalid endpoint.
  try {
    const endpoint = new URL(url || "");
    if (!token || /\s/.test(token) || endpoint.protocol !== "https:" || endpoint.username || endpoint.password
      || endpoint.pathname !== "/" || endpoint.search || endpoint.hash) throw new Error();
  } catch { throw new LeadError("UNAVAILABLE", "REDIS_CONFIGURATION"); }
  try {
    const response = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(command), cache: "no-store", redirect: "error", signal: AbortSignal.timeout(4000) });
    if (!response.ok) throw new Error();
    const result = await response.json();
    if (!result || typeof result !== "object" || Array.isArray(result) || result.error || !("result" in result)) throw new Error();
    return result.result;
  } catch { throw new LeadError("UNAVAILABLE", "REDIS_UNAVAILABLE"); }
}
function shared() {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) return true;
  if (production() || process.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_TOKEN) throw new LeadError("UNAVAILABLE", "REDIS_CONFIGURATION");
  for (const [key, item] of local) if (item.expires <= Date.now()) local.delete(key);
  if (local.size > 5000) throw new LeadError("UNAVAILABLE");
  return false;
}

export async function limitRequest(request: Request) {
  // Vercel overwrites this header. Outside Vercel, use a common bucket rather
  // than trusting arbitrary client-supplied forwarding headers.
  const forwarded = process.env.VERCEL === "1" ? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() : null;
  const ip = forwarded && isIP(forwarded) ? forwarded : "local-or-untrusted-proxy";
  const key = "np:rate:" + digest(ip);
  let count: number;
  if (shared()) {
    const result = await redis(["EVAL", "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]) end; return n", 1, key, WINDOW]);
    // INCR returns a positive integer. Coercion would accept null/false as 0.
    if (typeof result !== "number" || !Number.isSafeInteger(result) || result < 1) throw new LeadError("UNAVAILABLE", "REDIS_UNAVAILABLE");
    count = result;
  } else {
    const previous = local.get(key);
    count = Number(previous?.value || 0) + 1;
    local.set(key, { value: String(count), expires: previous?.expires || Date.now() + WINDOW * 1000 });
  }
  if (count > 5) throw new LeadError("RATE_LIMITED");
}

/** Only opaque HMAC keys and status/owner tokens are persisted, never lead data. */
export async function claimSubmission(fingerprint: string) {
  const key = "np:lead:" + digest(fingerprint), owner = randomUUID();
  const distributed = shared();
  let previous: unknown;
  if (distributed) {
    previous = await redis(["EVAL", "local v=redis.call('GET',KEYS[1]); if v then return v end; redis.call('SET',KEYS[1],ARGV[1],'EX',120); return ''", 1, key, owner]);
    if (typeof previous !== "string" || (previous !== "" && previous !== "done" && !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(previous))) {
      throw new LeadError("UNAVAILABLE", "REDIS_UNAVAILABLE");
    }
  } else {
    previous = local.get(key)?.value;
    if (!previous) local.set(key, { value: owner, expires: Date.now() + 120000 });
  }
  if (previous && previous !== "done") throw new LeadError("BUSY");
  return {
    duplicate: previous === "done",
    async finish(success: boolean) {
      if (distributed) {
        const result = await redis(["EVAL", "if redis.call('GET',KEYS[1])~=ARGV[1] then return 0 end; if ARGV[2]=='1' then redis.call('SET',KEYS[1],'done','EX',86400) else redis.call('DEL',KEYS[1]) end; return 1", 1, key, owner, success ? "1" : "0"]);
        if (result !== 1) throw new LeadError("UNAVAILABLE", "REDIS_UNAVAILABLE");
      } else if (local.get(key)?.value === owner) {
        if (success) local.set(key, { value: "done", expires: Date.now() + 86400000 }); else local.delete(key);
      }
    },
  };
}
