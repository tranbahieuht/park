import type { Lang } from "../data/i18n";

/** Public folder for this site's downloaded assets. */
export const ASSET_ROOT = "/sites/nortonpark/";
export const asset = (p: string) => ASSET_ROOT + p.replace(/^\/+/, "");

/** Same breakpoint as the "Screen Lock" block in page.css / brand-tokens.css. */
export const LOCK_MQ = "(min-width:1041px) and (min-height:600px)";

export const reduceMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type DataLayerWindow = Window & { dataLayer?: Record<string, unknown>[] };

/** dataLayer event, same shape as the source push(). No tag manager is loaded in the clone. */
export function push(event: string, data: Record<string, unknown> = {}) {
  const w = window as DataLayerWindow;
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ ...data, event, page_variant: "norton_park_lead_a" });
}

/* Drawer, popup, legal docs and the lightbox all lock page scroll. A counter
   keeps closing one from unlocking another; scroll-snap is turned off too or
   the browser keeps snapping underneath the overlay. */
let lockCount = 0;
export function lockScroll(lock: boolean) {
  lockCount = Math.max(0, lockCount + (lock ? 1 : -1));
  document.body.style.overflow = lockCount > 0 ? "hidden" : "";
  document.documentElement.style.scrollSnapType = lockCount > 0 ? "none" : "";
}

/** Real height of the fixed nav (its token is a clamp() expression). */
export function navH() {
  const el = document.querySelector(".nav");
  const h = el ? Math.round(el.getBoundingClientRect().height) : 0;
  return h || 62;
}

/* The calculator and news pages are separate routes on the source origin and
   are not part of this clone, so they link to the live site. */
export const SOURCE_ORIGIN = "https://www.nortonpark.com.vn";
export function calcHref(hash: string, lang: Lang) {
  let h = hash;
  if (lang === "en") h += (h ? "&" : "#") + "lang=en";
  return SOURCE_ORIGIN + "/calculator/" + h;
}

const LEAD_KEY = "np_lead_sent";
export function markLeadSent() {
  try {
    localStorage.setItem(LEAD_KEY, "1");
  } catch {}
}
export function leadSent() {
  try {
    return localStorage.getItem(LEAD_KEY) === "1";
  } catch {
    return false;
  }
}

export function validPhone(v: string) {
  const d = v.replace(/[^0-9]/g, "");
  return d.length >= 9 && d.length <= 12;
}

/** Focus trap for dialogs: keep Tab inside `panel`. */
export function trapTab(e: KeyboardEvent, panel: HTMLElement | null, selector = "a[href],button:not([disabled])") {
  if (e.key !== "Tab" || !panel) return;
  const f = Array.from(panel.querySelectorAll<HTMLElement>(selector));
  if (!f.length) return;
  const first = f[0];
  const last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

export type CSSVars = React.CSSProperties & Record<`--${string}`, string | number>;
/** Per-element CSS custom properties (the source sets style="--i:1"). */
export const vars = (v: Record<`--${string}`, string | number>) => v as CSSVars;
