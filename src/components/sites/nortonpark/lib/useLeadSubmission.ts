"use client";

import { useCallback, useRef, useState } from "react";
import { validateLead, type LeadInput } from "@/lib/leads/validation";

export function useLeadSubmission() {
  const busy = useRef(false), complete = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<"invalid" | "forbidden" | "failed" | "service" | "delivery" | "network" | "rate" | "busy" | "timeout" | null>(null);
  async function send(input: Omit<LeadInput, "consent" | "registeredAt"> & { consent: boolean }) {
    if (busy.current || complete.current) return false;
    setError(null);
    const body = validateLead({ ...input, registeredAt: new Date().toISOString() });
    if (!body) { setError("invalid"); return false; }
    busy.current = true; setPending(true);
    try {
      const response = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body), signal: AbortSignal.timeout(45000) });
      const result = await response.json();
      if (!response.ok || result.ok !== true || result.code !== "ACCEPTED") {
        setError(response.status === 429 ? "rate" : response.status === 409 ? "busy" : response.status === 403 ? "forbidden" : response.status === 400 || response.status === 413 ? "invalid"
          : result.code === "SERVICE_UNAVAILABLE" || result.code === "UNAVAILABLE" ? "service"
          : result.code === "DELIVERY_UNCONFIRMED" ? "timeout" : result.code === "DELIVERY_FAILED" ? "delivery" : "failed");
        return false;
      }
      complete.current = true;
      return true;
    } catch (cause) { setError(cause instanceof Error && ["TimeoutError", "AbortError"].includes(cause.name) ? "timeout" : cause instanceof TypeError ? "network" : "failed"); return false; }
    finally { busy.current = false; setPending(false); }
  }
  const reset = useCallback(() => {
    if (busy.current) return false;
    complete.current = false;
    setError(null);
    return true;
  }, []);
  return { send, pending, error, reset };
}
