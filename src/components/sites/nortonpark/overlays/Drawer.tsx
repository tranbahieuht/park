"use client";

import { SAVILLS_CONTACT } from "../data/contact";

import { useEffect, useRef } from "react";
import { Icon } from "../Icons";
import { asset, calcHref, lockScroll, push, trapTab } from "../lib/dom";
import { useLang } from "../lib/i18n";
import { useUI } from "../lib/ui";

const LINKS: Array<[string, string, string]> = [
  ["#top", "01", "dr.1"],
  ["#position", "02", "dr.2"],
  ["#lifestyle", "03", "dr.3"],
  ["#residences", "04", "dr.4"],
  ["#news", "05", "dr.5"],
  ["#register", "06", "dr.6"],
];

/* Right-hand menu drawer: scroll lock, focus moves to the close button and
   returns to the burger, Esc closes, Tab stays inside the panel. */
export function Drawer() {
  const { lang, html, t } = useLang();
  const { drawerOpen, closeDrawer } = useUI();
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!drawerOpen) return;
    const lastFocus = document.activeElement as HTMLElement | null;
    lockScroll(true);
    closeRef.current?.focus();
    push("drawer_open", {});
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeDrawer();
        return;
      }
      trapTab(e, panelRef.current);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      lockScroll(false);
      lastFocus?.focus?.();
    };
  }, [drawerOpen, closeDrawer]);

  return (
    <div className={drawerOpen ? "drawer is-open" : "drawer"} id="drawer">
      <div className="drawer-backdrop" data-drawer-close="" aria-hidden="true" onClick={closeDrawer}></div>
      <aside className="drawer-panel" role="dialog" aria-modal="true" aria-label={t("ui.navigation")} ref={panelRef}>
        <div className="drawer-top">
          <img className="drawer-logo" src={asset("assets/logos/norton-park-logo-primary.svg")} alt="Norton Park" width={1200} height={200} loading="lazy" />
          <button type="button" className="drawer-close" data-drawer-close="" aria-label={t("ui.closeMenu")} ref={closeRef} onClick={closeDrawer}>
            <Icon name="close" />
          </button>
        </div>
        <nav className="drawer-nav">
          {LINKS.map(([href, num, key]) => (
            <a
              key={href}
              href={href}
              onClick={() => {
                push("drawer_nav", { target: href });
                closeDrawer();
              }}
            >
              <i aria-hidden="true">{num}</i>
              <span {...html(key)} />
            </a>
          ))}
        </nav>
        <div className="drawer-foot">
          <a className="drawer-act" data-calc="" href={calcHref("", lang)} data-cta="calc_drawer">
            <Icon name="calc" small />
            <span {...html("nav.calc")} />
          </a>
          <a className="drawer-act" href="https://360.nortonpark.com.vn/" target="_blank" rel="noopener" data-cta="vr_drawer">
            <Icon name="360" small />
            <span {...html("nav.vr")} />
          </a>
          <a className="drawer-act" href={SAVILLS_CONTACT.phoneHref} data-cta="call_drawer">
            <Icon name="phone" small />
            <span {...html("dr.call")} />
          </a>
          <a className="drawer-act" href={SAVILLS_CONTACT.zaloUrl} target="_blank" rel="noopener" data-cta="zalo_drawer">
            <Icon name="zalo" small />
            <span {...html("dr.zalo")} />
          </a>
          <p className="drawer-tag">The Global Sanctuary in Your Rhythm</p>
        </div>
      </aside>
    </div>
  );
}
