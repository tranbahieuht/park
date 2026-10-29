"use client";

import { useEffect, useRef } from "react";
import { Icon } from "../Icons";
import { asset, navH } from "../lib/dom";
import { useLang } from "../lib/i18n";
import { useUI } from "../lib/ui";

/* Fixed header. Transparent/dark while the middle of the bar sits over a
   section marked data-nav="dark" (photo sections), solid beige otherwise. */
export function Nav() {
  const { lang, setLang, html, t } = useLang();
  const { drawerOpen, openDrawer } = useUI();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const darkSecs = Array.from(document.querySelectorAll<HTMLElement>('[data-nav="dark"]'));
    if (!darkSecs.length) {
      nav.classList.add("is-solid");
      return;
    }
    let ticking = false;
    const sync = () => {
      ticking = false;
      const y = navH() / 2;
      const dark = darkSecs.some((s) => {
        const r = s.getBoundingClientRect();
        return r.top <= y && r.bottom > y;
      });
      nav.classList.toggle("is-solid", !dark);
    };
    const req = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(sync);
      }
    };
    window.addEventListener("scroll", req, { passive: true });
    window.addEventListener("resize", req);
    sync();
    return () => {
      window.removeEventListener("scroll", req);
      window.removeEventListener("resize", req);
    };
  }, []);

  return (
    <header className="nav" id="nav" ref={navRef}>
      <div className="nav-in">
        <div className="lang" role="group" aria-label={t("ui.language")}>
          <button type="button" data-lang="vi" className={lang === "vi" ? "on" : undefined} aria-pressed={lang === "vi"} onClick={() => setLang("vi")}>
            VI
          </button>
          <i aria-hidden="true">/</i>
          <button type="button" data-lang="en" className={lang === "en" ? "on" : undefined} aria-pressed={lang === "en"} onClick={() => setLang("en")}>
            EN
          </button>
        </div>
        <div className="nav-brands">
          <a href="#top" className="brand" aria-label="Norton Park">
            <img className="brand-light" src={asset("assets/logos/norton-park-logo-primary-beige.svg")} alt="Norton Park, A Gamuda Land Community" width={1200} height={200} />
            <img className="brand-dark" src={asset("assets/logos/norton-park-logo-primary.svg")} alt="" aria-hidden="true" width={1200} height={200} />
          </a>
          <img className="nav-brand-mark" src={asset("assets/logos/quacho-symbol-bronze.png")} alt="" aria-hidden="true" width={254} height={322} />
        </div>
        <div className="nav-actions">
          <a className="btn-vr btn-eye" href="https://360.nortonpark.com.vn/" target="_blank" rel="noopener" data-cta="vr_nav">
            <Icon name="360" small />
            <span className="btn-vr-t" {...html("nav.vr")} />
          </a>
          <a href="#register" className="cta cta--sm nav-cta" data-cta="nav">
            <span {...html("nav.cta")} />
          </a>
          <button
            type="button"
            className="btn-burger"
            id="burger"
            aria-label={t("ui.menu")}
            aria-expanded={drawerOpen}
            aria-controls="drawer"
            onClick={openDrawer}
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
