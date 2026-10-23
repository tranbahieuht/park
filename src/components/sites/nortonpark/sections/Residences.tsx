"use client";

import { useRef } from "react";
import { Icon } from "../Icons";
import { COL, RESI, RESI_L, type Collection } from "../data/content";
import { asset, push } from "../lib/dom";
import { useLang } from "../lib/i18n";
import { useUI } from "../lib/ui";

const GROUPS: Collection[] = ["std", "ltd"];

export function Residences() {
  const { lang, html } = useLang();
  const { resiIndex, setResiIndex } = useUI();
  const tabsRef = useRef<HTMLDivElement>(null);
  const cur = RESI[resiIndex];
  const L = RESI_L[lang];
  const m2 = (v: string) => (lang === "en" ? v.replace(",", ".") : v) + " m²";

  const goResi = (i: number, focus: boolean) => {
    const n = RESI.length;
    const next = ((i % n) + n) % n;
    setResiIndex(next);
    if (focus) tabsRef.current?.querySelector<HTMLButtonElement>(`button[data-i="${next}"]`)?.focus();
    push("residence_tab", { residence: RESI[next].id });
  };

  const alt = (lang === "en" ? "Floor plan " : "Mặt bằng ") + cur.name[lang] + " " + cur.code;
  /* Spec rows; garden area carries a footnote marker. */
  const rows: Array<[string, string, boolean?]> = [
    [L.rooms, cur.rooms[lang]],
    [cur.total ? L.gfaT : L.gfa, m2(cur.gfa)],
    [cur.total ? L.nuaT : L.nua, m2(cur.nua)],
  ];
  if (cur.garden) rows.push([L.garden, m2(cur.garden), true]);
  if (cur.floors) rows.push([L.floors, cur.floors[lang]]);
  if (cur.view) rows.push([L.view, cur.view[lang]]);

  return (
    <section className="resi bay" id="residences" data-col={cur.col}>
      <div className="wrap">
        <div className="resi-head">
          <img className="smark" src={asset("assets/logos/quacho-symbol-bronze.webp")} alt="Họa tiết quả chò nâu biểu tượng Norton Park" aria-hidden="true" width={256} height={322} data-mo="fade" />
          <span className="eyebrow" data-mo="t" {...html("resi.eyebrow")} />
          <h2 className="d2" data-mo="t" {...html("resi.title")} />
          <div className="resi-tabs" role="tablist" aria-label="Loại căn hộ" id="resiTabs" ref={tabsRef} data-mo="t">
            {GROUPS.map((g) => (
              <div key={g} className={`rt-group rt-${g}`}>
                <span className="rt-k" data-col={g}>
                  {COL[g][lang]}
                </span>
                <div className="rt-row">
                  {RESI.map((r, i) =>
                    r.col === g ? (
                      <button
                        key={r.id}
                        type="button"
                        role="tab"
                        data-i={i}
                        aria-selected={i === resiIndex}
                        tabIndex={i === resiIndex ? 0 : -1}
                        onClick={() => goResi(i, false)}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowRight") {
                            e.preventDefault();
                            goResi(i + 1, true);
                          }
                          if (e.key === "ArrowLeft") {
                            e.preventDefault();
                            goResi(i - 1, true);
                          }
                        }}
                      >
                        {r.tab[lang]}
                      </button>
                    ) : null,
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="resi-grid">
          <div className="resi-media" data-mo="card">
            <figure className="resi-plan" id="resiPlan">
              {cur.levels ? (
                /* Two-level units: one figure per level, flex-grow = native width so
                   both levels keep the same scale as the leaflet. */
                <div className="resi-lv">
                  {cur.levels.map((v, k) => {
                    const lv = (lang === "en" ? "Level " : "Tầng ") + (k + 1);
                    return (
                      <figure key={v.img} style={{ flex: `${v.w} 1 0` }}>
                        <img src={asset(v.img)} width={v.w} height={v.h} alt={alt + ", " + lv} />
                        <figcaption>{lv}</figcaption>
                      </figure>
                    );
                  })}
                </div>
              ) : (
                <img key={cur.img} src={asset(cur.img)} alt={alt} />
              )}
            </figure>
          </div>
          <div className="resi-info" data-mo="t">
            <span className="tag" id="resiTag">
              {COL[cur.col][lang]}
            </span>
            <span className="resi-code" id="resiCode">
              {L.code + " " + cur.code}
            </span>
            <h3 className="d3" id="resiName">
              {cur.name[lang]}
            </h3>
            {/* The client hid the unit description (09/10/2026); data is kept in RESI[].desc. */}
            <p className="resi-desc" id="resiDesc" hidden></p>
            <dl className="resi-spec" id="resiSpec">
              {rows.map(([k, v, note]) => (
                <div key={k}>
                  <dt>
                    {k}
                    {note ? <sup>*</sup> : null}
                  </dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <p className="resi-gnote" id="resiGNote" hidden={!cur.garden}>
              {cur.garden ? (
                <>
                  <sup>*</sup>
                  {L.gNote}
                </>
              ) : null}
            </p>
            <a className="resi-cta" href="#register" data-cta="resi">
              <span {...html("resi.cta")} />
              <Icon name="arrow" small />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
