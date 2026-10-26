import "server-only";
import { createHmac, randomUUID } from "node:crypto";
import { isIP } from "node:net";

const WINDOW = 600;
type LocalCounters = Map<string, { value: string; expires: number }>;
const developmentGlobal = globalThis as typeof globalThis & { npLeadCounters?: LocalCounters };
const local: LocalCounters = process.env.NODE_ENV === "development"
  ? (developmentGlobal.npLeadCounters ??= new Map()) : new Map();
export class LeadError extends Error {
  constructor(public code: "RATE_LIMITED" | "BUSY" | "UNAVAILABLE") { super(code); }
}

const production = () => process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
export function digest(value: string) {
  const secret = process.env.LEAD_RATE_LIMIT_SECRET;
  if (production() && (!secret || secret.length < 32)) throw new LeadError("UNAVAILABLE");
  return createHmac("sha256", secret || "local-development-only").update(value).digest("hex");
}

async function redis(command: (string | number)[]): Promise<unknown> {
  const url = process.env.UPSTASH_REDIS_REST_URL, token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token || !url.startsWith("https://")) throw new LeadError("UNAVAILABLE");
  try {
    const response = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(command), cache: "no-store", signal: AbortSignal.timeout(4000) });
    if (!response.ok) throw new Error();
    const result = await response.json();
    if (result.error || !("result" in result)) throw new Error();
    return result.result;
  } catch { throw new LeadError("UNAVAILABLE"); }
}
function shared() {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) return true;
  if (production()) throw new LeadError("UNAVAILABLE");
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
    count = Number(await redis(["EVAL", "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]) end; return n", 1, key, WINDOW]));
    if (!Number.isFinite(count)) throw new LeadError("UNAVAILABLE");
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
  } else {
    previous = local.get(key)?.value;
    if (!previous) local.set(key, { value: owner, expires: Date.now() + 120000 });
  }
  if (previous && previous !== "done") throw new LeadError("BUSY");
  return {
    duplicate: previous === "done",
    async finish(success: boolean) {
      if (distributed) {
        await redis(["EVAL", "if redis.call('GET',KEYS[1])~=ARGV[1] then return 0 end; if ARGV[2]=='1' then redis.call('SET',KEYS[1],'done','EX',86400) else redis.call('DEL',KEYS[1]) end; return 1", 1, key, owner, success ? "1" : "0"]);
      } else if (local.get(key)?.value === owner) {
        if (success) local.set(key, { value: "done", expires: Date.now() + 86400000 }); else local.delete(key);
      }
    },
  };
}
