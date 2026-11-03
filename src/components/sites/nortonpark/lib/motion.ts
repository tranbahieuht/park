"use client";

import { useEffect } from "react";
import { LOCK_MQ } from "./dom";

/* One-shot section/element entrances. IntersectionObserver queues only entries
   entering the viewport: no scroll-time DOM sweeps or layout measurements.
   Desktop keeps section snap; smaller viewports keep the original free scroll. */
type Kind = "t" | "rule" | "card" | "fade" | "bg" | "mask";
const MO_CFG: Record<string, Array<[Kind, string]>> = {
  hero: [["bg", ".hero-media img"], ["t", ".hero-in .eyebrow"], ["t", ".hero-in h1"], ["t", ".hero-cta .cta"]],
  "design-story": [["bg", ".dstory-media img"], ["t", ".dstory-in .eyebrow"], ["rule", ".dstory-in .rule"], ["t", ".dstory-in h2"],
    ["t", ".dstory-body"], ["fade", ".dstory-mark"]],
  "landscape-story": [["bg", ".lstory-media img"], ["fade", ".lstory-panel"], ["t", ".lstory-panel .eyebrow"], ["rule", ".lstory-panel .rule"],
    ["t", ".lstory-panel h2"], ["t", ".lstory-body"]],
  story: [["t", ".story-head .eyebrow"], ["rule", ".story-head .rule:not(.rule--b)"], ["t", ".story-head h2"],
    ["rule", ".story-head .rule--b"], ["t", ".story-body"], ["card", ".tram"]],
  facts: [["fade", ".smark"], ["t", ".eyebrow"], ["t", "h2"], ["card", ".fact"], ["rule", ".facts-rule"], ["card", ".cat"], ["t", ".facts-foot"]],
  position: [["mask", ".loc-fig"], ["t", ".loc-r h2"], ["t", ".loc-lead .lead"], ["fade", ".loc-mark"]],
  lifestyle: [["fade", ".life-head .smark"], ["t", ".life-head .eyebrow"], ["t", ".life-head h2"], ["card", ".life-stage"],
    ["t", ".life-desc"], ["fade", ".life-dots"]],
  blocks: [["fade", ".smark"], ["t", ".eyebrow"], ["t", "h2"], ["card", ".blk"]],
  residences: [["fade", ".resi-head .smark"], ["t", ".resi-head .eyebrow"], ["t", ".resi-head h2"], ["t", ".resi-tabs"],
    ["card", ".resi-media"], ["t", ".resi-info"]],
  news: [["fade", ".news-head .smark"], ["t", ".news-head .eyebrow"], ["t", ".news-head h2"], ["fade", ".news-nav"],
    ["card", ".ncard"], ["fade", ".news-dots"]],
  register: [["bg", ".reg-bg img"], ["card", ".reg-card"]],
  developer: [["fade", ".dev-head .smark"], ["t", ".dev-head .eyebrow"], ["t", ".dev-head h2"], ["t", ".dev-head .gam"],
    ["t", ".dev-body"], ["t", ".blk-h"], ["card", "#devTeam > *"]],
  calc: [["fade", ".calc-head .smark"], ["t", ".calc-head .eyebrow"], ["t", ".calc-head h2"], ["t", ".calc-sub"],
    ["t", ".calc-head .cta"], ["card", ".ct"]],
  savills: [["t", ".savills-heading"], ["mask", ".savills-certificate"]],
  "savills-about": [["t", ".savills-intro"], ["t", ".savills-promises > h3"], ["t", ".savills-commitments li"]],
};

const $$ = <T extends Element = HTMLElement>(s: string, c: ParentNode = document) => Array.from(c.querySelectorAll<T & HTMLElement>(s));
const moSec = (key: string) => (key === "hero" ? document.querySelector<HTMLElement>(".hero") : document.getElementById(key));

/** Tag a section's elements with data-mo and --mo-i (re-run just before playing to catch late content). */
function moTag(sec: HTMLElement, key: string) {
  const seen = new Set<HTMLElement>();
  let k = 0;
  MO_CFG[key].forEach(([kind, sel]) => {
    $$(sel, sec).forEach((el) => {
      if (seen.has(el)) return;
      seen.add(el);
      el.setAttribute("data-mo", kind);
      if (kind === "bg") {
        el.style.setProperty("--mo-i", "0");
        return;
      }
      el.style.setProperty("--mo-i", String(Math.min(k++, 6)));
    });
  });
}

export function useMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const lock = matchMedia(LOCK_MQ);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const sections: HTMLElement[] = [];
    Object.keys(MO_CFG).forEach(key => {
      const section = moSec(key);
      if (!section) return;
      moTag(section, key);
      sections.push(section);
    });
    root.classList.add("mo-ready", "mo-ok");
    let observer: IntersectionObserver | null = null;
    const connect = () => {
      observer?.disconnect();
      if (reduced.matches || !("IntersectionObserver" in window)) {
        root.classList.remove("mo");
        return;
      }
      root.classList.add("mo");
      if (lock.matches) {
        observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("mo-in");
            observer?.unobserve(entry.target);
          });
        }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });
        sections.filter(section => !section.classList.contains("mo-in")).forEach(section => observer!.observe(section));
      } else {
        const targets = new Map<Element, HTMLElement[]>();
        sections.filter(section => !section.classList.contains("mo-in")).forEach(section => {
          $$("[data-mo]:not(.in)", section).forEach(element => {
            const kind = element.dataset.mo;
            const box = ["rule", "mask", "bg"].includes(kind || "") ? element.parentElement || element : element;
            targets.set(box, [...(targets.get(box) || []), element]);
          });
        });
        observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            targets.get(entry.target)?.forEach(element => {
              element.style.setProperty("--mo-i", "0");
              element.classList.add("in");
            });
            observer?.unobserve(entry.target);
          });
        }, { rootMargin: "0px 0px -8% 0px", threshold: 0 });
        targets.forEach((_, box) => observer!.observe(box));
      }
    };
    connect();
    lock.addEventListener("change", connect);
    reduced.addEventListener("change", connect);
    return () => {
      observer?.disconnect();
      lock.removeEventListener("change", connect);
      reduced.removeEventListener("change", connect);
    };
  }, []);
}
