"use client";

import { useEffect } from "react";

export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

/** Copy campaign parameters from the URL into every form's hidden utm_* inputs (as the source does). */
export function useUtm() {
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    UTM_KEYS.forEach((k) => {
      const v = p.get(k);
      if (!v) return;
      document.querySelectorAll<HTMLInputElement>(`input[name="${k}"]`).forEach((i) => {
        i.value = v;
      });
    });
  }, []);
}
