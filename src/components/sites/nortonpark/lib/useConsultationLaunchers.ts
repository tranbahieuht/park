"use client";

import { useEffect } from "react";
import type { LeadInput } from "@/lib/leads/validation";
import { RESI } from "../data/content";
import { useUI } from "./ui";

export interface ConsultationContext {
  source: LeadInput["source"];
  unit: string;
  trigger: HTMLElement | null;
}

/** Reuse the existing consultation dialog, including links in translated HTML. */
export function useConsultationLaunchers() {
  const { closeDrawer, resiIndex, resiSelected } = useUI();
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[data-calc], a[href="#register"]');
      if (!link) return;
      event.preventDefault();
      const inDrawer = !!link.closest("#drawer");
      const pricing = link.hasAttribute("data-calc");
      const source: LeadInput["source"] = pricing ? "pricing_calculator"
        : inDrawer ? (matchMedia("(max-width:1040px)").matches ? "mobile_consultation" : "sidebar_consultation")
        : link.dataset.cta === "hero" ? "hero_consultation"
        : link.dataset.cta === "resi" ? "residence_consultation"
        : link.dataset.cta === "nav" ? (matchMedia("(max-width:1040px)").matches ? "mobile_consultation" : "header_consultation")
        : "contact_form";
      const detail: ConsultationContext = {
        source,
        unit: link.dataset.unit || (((pricing && resiSelected) || source === "residence_consultation") ? RESI[resiIndex].name.vi : ""),
        trigger: inDrawer ? document.getElementById("burger") : link,
      };
      closeDrawer();
      document.dispatchEvent(new CustomEvent<ConsultationContext>("np:consultation", { detail }));
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [closeDrawer, resiIndex, resiSelected]);
}
