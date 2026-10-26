"use client";

import { useRef, useState } from "react";
import { validateLead, type LeadInput } from "@/lib/leads/validation";

export function useLeadSubmission() {
  const busy = useRef(false), complete = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<"invalid" | "failed" | "rate" | "busy" | null>(null);
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
        setError(response.status === 429 ? "rate" : response.status === 409 ? "busy" : response.status === 400 || response.status === 413 ? "invalid" : "failed");
        return false;
      }
      complete.current = true;
      return true;
    } catch { setError("failed"); return false; }
    finally { busy.current = false; setPending(false); }
  }
  return { send, pending, error };
}
