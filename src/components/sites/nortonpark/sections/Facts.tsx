"use client";

import { useEffect, useRef } from "react";
import { RESI } from "../data/content";
import type { Lang } from "../data/i18n";
import { asset, reduceMotion, vars } from "../lib/dom";
import { useLang } from "../lib/i18n";
import { useUI } from "../lib/ui";

interface Fact {
  n: string;
  k: string;
  count?: [number, number, 0 | 1];
}
const FACTS: Fact[] = [
  { n: "facts.n1", k: "facts.k1", count: [7.9, 1, 0] },
  { n: "facts.n3", k: "facts.k3", count: [1286, 0, 1] },
  { n: "facts.n4", k: "facts.k4", count: [20, 0, 0] },
  { n: "facts.n5", k: "facts.k5", count: [2.5, 1, 0] },
  /* "3 : 1" is a ratio: it is not counted, it only fades in with the others. */
  { n: "facts.n6", k: "facts.k6" },
  { n: "facts.n8", k: "facts.k8", count: [2, 0, 0] },
];

const STD = [
  ["studio", "facts.t1", "facts.a1"],
  ["1br", "facts.t2", "facts.a2"],
  ["2br", "facts.t3", "facts.a3"],
  ["2brp", "facts.t4", "facts.a4"],
  ["3br", "facts.t5", "facts.a5"],
];
const LTD = [
  ["pes", "facts.t6", "facts.a6"],
  ["duplex", "facts.t7", "facts.a7"],
  ["gduplex", "facts.t8", "facts.a8"],
  ["shophouse", "facts.t9", "facts.a9"],
];

/* Number format follows the selected language:
   vi: comma decimal, dot thousands (1.286, 17,5); en: the reverse. */
function fmtNum(v: number, dec: number, grp: boolean, lang: Lang) {
  const dp = lang === "en" ? "." : ",";
  const gs = lang === "en" ? "," : ".";
  const s = dec > 0 ? v.toFixed(dec) : String(Math.round(v));
  const parts = s.split(".");
  if (grp) parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, gs);
  return parts.length > 1 ? parts[0] + dp + parts[1] : parts[0];
}

/* Count up from 0 (easeOutCubic, 1.4s). The unit lives in an <i> inside the
   cell and is put back verbatim, keeping the source's original spacing
   ("7,9 <i>ha</i>" vs "20<i>%</i>"). */
function runCount(el: HTMLElement, lang: Lang) {
  const target = parseFloat(el.getAttribute("data-count") || "");
  if (isNaN(target) || reduceMotion()) return;
  const dec = parseInt(el.getAttribute("data-dec") || "0", 10);
  const grp = el.getAttribute("data-grp") === "1";
  const unit = el.querySelector("i");
  let unitHTML = "";
  if (unit) {
    const before = unit.previousSibling;
    const gap = before && before.nodeType === 3 && /\s$/.test(before.nodeValue || "") ? " " : "";
    unitHTML = gap + unit.outerHTML;
  }
  const dur = 1400;
  let t0: number | null = null;
  const step = (ts: number) => {
    if (t0 === null) t0 = ts;
    const p = Math.min((ts - t0) / dur, 1);
    const e = 1 - Math.pow(1 - p, 3);
    el.innerHTML = fmtNum(target * e, dec, grp, lang) + unitHTML;
    if (p < 1) requestAnimationFrame(step);
  };
  el.innerHTML = fmtNum(0, dec, grp, lang) + unitHTML;
  requestAnimationFrame(step);
}

export function Facts() {
  const { lang, html } = useLang();
  const { setResiIndex } = useUI();
  const gridRef = useRef<HTMLDivElement>(null);
  const langRef = useRef(lang);
  const shownLang = useRef(lang);

  useEffect(() => {
    langRef.current = lang;
  }, [lang]);

  /* Count each cell the first time it is 60% visible. */
  useEffect(() => {
    const els = Array.from(gridRef.current?.querySelectorAll<HTMLElement>("[data-count]") ?? []);
    if (!els.length || reduceMotion()) return;
    const o = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          runCount(e.target as HTMLElement, langRef.current);
          o.unobserve(e.target);
        });
      },
      { threshold: 0.6 },
    );
    els.forEach((el) => o.observe(el));
    return () => o.disconnect();
  }, []);

  /* A language switch rewrites the cells; re-run the count for cells on screen. */
  useEffect(() => {
    if (shownLang.current === lang) return;
    shownLang.current = lang;
    if (reduceMotion()) return;
    gridRef.current?.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) runCount(el, lang);
    });
  }, [lang]);

  const goType = (e: React.MouseEvent, rid: string) => {
    e.preventDefault();
    const idx = RESI.findIndex((r) => r.id === rid);
    if (idx > -1) setResiIndex(idx);
    document.getElementById("residences")?.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth" });
  };

  const typeList = (rows: string[][]) => (
    <ul className="cat-list">
      {rows.map(([rid, t, a]) => (
        <li key={rid}>
          <a className="type-link" href="#residences" data-resi={rid} onClick={(e) => goType(e, rid)} {...html(t)} />
          <span className="cat-a" {...html(a)} />
        </li>
      ))}
    </ul>
  );

  return (
    <section className="facts bay" id="facts">
      <div className="wrap">
        <img className="smark" src={asset("assets/logos/quacho-symbol-bronze.webp")} alt="Họa tiết quả chò nâu biểu tượng Norton Park" aria-hidden="true" width={256} height={322} data-mo="fade" />
        <span className="eyebrow" data-mo="t" {...html("facts.eyebrow")} />
        <h2 className="d2" data-mo="t" {...html("facts.title")} />

        <div className="facts-grid" ref={gridRef}>
          {FACTS.map((f, i) => (
            <div key={f.n} className="fact" style={i ? vars({ "--i": i }) : undefined} data-mo="card">
              <span
                className="fact-n"
                data-count={f.count?.[0]}
                data-dec={f.count?.[1]}
                data-grp={f.count?.[2]}
                {...html(f.n)}
              />
              <span className="fact-k" {...html(f.k)} />
            </div>
          ))}
          <div className="fact fact--txt" style={vars({ "--i": 6 })} data-mo="card">
            <span className="fact-n">
              <span className="fact-x" {...html("facts.b2v")} />
            </span>
            <span className="fact-k" {...html("facts.b2t")} />
          </div>
        </div>

        <div className="facts-rule" aria-hidden="true" data-mo="rule"></div>

        <div className="facts-cat">
          <div className="cat cat--std" data-mo="card">
            <div className="cat-head">
              <span className="band-t" {...html("facts.c1")} />
            </div>
            {typeList(STD)}
          </div>
          <div className="cat cat--ltd" data-mo="card">
            <div className="cat-head">
              <span className="band-t" {...html("facts.c2")} />
            </div>
            {typeList(LTD)}
          </div>
        </div>
        <p className="facts-foot" data-mo="t" {...html("facts.foot")} />
      </div>
    </section>
  );
}
