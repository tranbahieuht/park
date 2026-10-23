"use client";

import { useEffect, useRef, useState } from "react";
import { LEGAL_CLOSE, LEGAL_DOCS, LEGAL_KICKER, type LegalKey } from "../data/legal";
import { lockScroll, push, trapTab } from "../lib/dom";
import { useLang } from "../lib/i18n";

const KEYS = Object.keys(LEGAL_DOCS) as LegalKey[];
const isKey = (k: string | null): k is LegalKey => !!k && (KEYS as string[]).includes(k);
const HASH_RE = /^#(chinh-sach-bao-mat|dieu-khoan-su-dung|mien-tru-trach-nhiem|cong-bo-phap-ly|canh-bao-gia-mao|thong-tin-phap-nhan)$/;

/* Shared legal popup. Any element with data-legal="privacy|terms|…" opens the
   matching document (captured at document level, so links inside translated
   strings work too). Direct links such as /#chinh-sach-bao-mat open it on load. */
export function LegalDoc() {
  const { lang } = useLang();
  const [cur, setCur] = useState<LegalKey | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const open = cur !== null;

  useEffect(() => {
    const openKey = (key: LegalKey) => {
      if (!document.querySelector(".ldoc.is-open")) lastFocus.current = document.activeElement as HTMLElement | null;
      setCur(key);
      push("legal_open", { legal_doc: key });
    };
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("[data-legal]");
      if (!a) return;
      const key = a.getAttribute("data-legal");
      e.preventDefault();
      e.stopPropagation();
      if (isKey(key)) openKey(key);
    };
    const fromHash = () => {
      const h = window.location.hash.slice(1);
      const key = KEYS.find((k) => LEGAL_DOCS[k].hash === h);
      if (key) openKey(key);
    };
    document.addEventListener("click", onClick, true);
    window.addEventListener("hashchange", fromHash);
    fromHash();
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("hashchange", fromHash);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCur(null);
      else trapTab(e, panelRef.current, 'a[href],button,[tabindex="0"]');
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      lockScroll(false);
      if (HASH_RE.test(window.location.hash)) {
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }
      lastFocus.current?.focus?.();
    };
  }, [open]);

  /* New document or language: start at the top and focus the close button. */
  useEffect(() => {
    if (!cur) return;
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
    closeRef.current?.focus();
  }, [cur, lang]);

  const d = cur ? LEGAL_DOCS[cur][lang] : null;
  return (
    <div className={open ? "ldoc is-open" : "ldoc"} id="legalDoc">
      <div className="ldoc-backdrop" data-ldoc-close="" onClick={() => setCur(null)}></div>
      <div className="ldoc-panel" role="dialog" aria-modal="true" aria-labelledby="ldocTitle" ref={panelRef}>
        <div className="ldoc-head">
          <span className="ldoc-k">{LEGAL_KICKER[lang]}</span>
          <h2 className="ldoc-title" id="ldocTitle">
            {d?.title}
          </h2>
          <span className="ldoc-upd" hidden={!d?.upd}>
            {d?.upd}
          </span>
        </div>
        <div className="ldoc-body" tabIndex={0} ref={bodyRef} dangerouslySetInnerHTML={{ __html: d?.html ?? "" }} />
        <button type="button" className="ldoc-close" data-ldoc-close="" aria-label={LEGAL_CLOSE[lang]} ref={closeRef} onClick={() => setCur(null)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
