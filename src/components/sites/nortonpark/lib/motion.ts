"use client";

import { useEffect } from "react";
import { LOCK_MQ } from "./dom";

/* Page-wide entrance motion (source page.js section 16). Text fades and drifts
   up, rules draw from the left, cards rise, backgrounds zoom out. It runs only
   the first time a section is reached.
   - Desktop Screen Lock: a section that is >= 20% visible (or whose top is in
     the upper 80% of the viewport) gets .mo-in and its whole group plays.
   - Narrow / free-scroll: each element gets .in once its box enters the
     bottom 10% of the viewport.
   Kinds (data-mo): t, rule, card, fade, bg, mask. The markup carries data-mo
   statically so html.mo hides it before hydration; this hook assigns the
   stagger index (--mo-i) exactly like the source. */
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
const moVisible = (el: HTMLElement) => el.offsetParent !== null || getComputedStyle(el).position === "fixed";

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
      if (!moVisible(el)) return;
      el.style.setProperty("--mo-i", String(Math.min(k++, 6)));
    });
  });
}

export function useMotion() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("mo-ready");
    if (!root.classList.contains("mo") || !window.requestAnimationFrame) {
      root.classList.remove("mo");
      root.classList.add("mo-ok");
      return;
    }
    const lock = window.matchMedia(LOCK_MQ);
    const secs: HTMLElement[] = [];
    Object.keys(MO_CFG).forEach((key) => {
      const sec = moSec(key);
      if (!sec) return;
      moTag(sec, key);
      sec.setAttribute("data-mo-sec", key);
      secs.push(sec);
    });

    /* Measure on the parent for kinds whose own box is clipped/scaled to zero. */
    const moBox = (el: HTMLElement) => {
      const k = el.getAttribute("data-mo");
      return k === "mask" || k === "rule" || k === "bg" ? el.parentElement || el : el;
    };
    const moFire = (el: HTMLElement) => {
      const parent = el.parentNode;
      const sib = parent ? Array.prototype.indexOf.call(parent.children, el) : 0;
      el.style.setProperty("--mo-i", String(el.getAttribute("data-mo") === "card" ? Math.min(sib, 3) : 0));
      el.classList.add("in");
    };
    const moSecIn = (sec: HTMLElement) => {
      moTag(sec, sec.getAttribute("data-mo-sec") || "");
      sec.classList.add("mo-in");
    };

    let tick = 0;
    let done = false;
    const sweep = () => {
      tick = 0;
      const h = window.innerHeight || document.documentElement.clientHeight;
      let left = 0;
      secs.forEach((sec) => {
        if (sec.classList.contains("mo-in")) return;
        const r = sec.getBoundingClientRect();
        if (!r.height) {
          left++;
          return;
        }
        if (lock.matches) {
          const vis = Math.min(r.bottom, h) - Math.max(r.top, 0);
          if (r.top < h * 0.8 || vis >= Math.min(r.height, h) * 0.2) moSecIn(sec);
          else left++;
          return;
        }
        let wait = 0;
        $$("[data-mo]", sec).forEach((el) => {
          if (el.classList.contains("in")) return;
          if (moBox(el).getBoundingClientRect().top < h * 0.9) moFire(el);
          else wait++;
        });
        if (wait) left++;
      });
      if (!left) {
        done = true;
        detach();
      }
    };
    const queue = () => {
      if (!tick && !done) tick = requestAnimationFrame(sweep);
    };
    const detach = () => {
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      window.removeEventListener("load", queue);
      window.removeEventListener("pageshow", queue);
    };
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    window.addEventListener("load", queue);
    window.addEventListener("pageshow", queue);
    const timers = [0, 250, 800, 1600].map((t) => window.setTimeout(queue, t));
    root.classList.add("mo-ok");

    return () => {
      detach();
      timers.forEach(clearTimeout);
      if (tick) cancelAnimationFrame(tick);
    };
  }, []);
}
