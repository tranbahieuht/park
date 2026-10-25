"use client";

import { Icon } from "../Icons";
import { asset, calcHref } from "../lib/dom";
import { useLang } from "../lib/i18n";

/* Teaser for the separate price-calculator page (/calculator/ on the source).
   Areas and layout counts come from the source's layout data. */
const TYPES: Array<{ hash: string; name: string; area: string; from: boolean; count: number; ltd?: boolean }> = [
  { hash: "#type=studio", name: "form.u1", area: "42,12 m²", from: true, count: 3 },
  { hash: "#type=1pn_plus", name: "calc.t2", area: "50,45 m²", from: true, count: 8 },
  { hash: "#type=2pn", name: "calc.t3", area: "66,38 m²", from: true, count: 20 },
  { hash: "#type=2pn_plus", name: "calc.t4", area: "86,93 m²", from: true, count: 3 },
  { hash: "#type=3pn", name: "calc.t5", area: "95,36 m²", from: true, count: 11 },
  { hash: "#type=pes", name: "form.u6", area: "51,08 m²", from: true, count: 6, ltd: true },
  { hash: "#type=duplex", name: "form.u7", area: "140,21 m²", from: true, count: 2, ltd: true },
  { hash: "#type=gduplex", name: "form.u8", area: "139,86 m²", from: false, count: 1, ltd: true },
  { hash: "#type=shophouse", name: "form.u9", area: "141,70 m²", from: true, count: 9, ltd: true },
];

export function Calc() {
  const { lang, html } = useLang();
  return (
    <section className="calc bay" id="calc">
      <div className="wrap calc-in">
        <div className="calc-head">
          <img className="smark" src={asset("assets/logos/quacho-symbol-bronze.webp")} alt="Họa tiết quả chò nâu biểu tượng Norton Park" aria-hidden="true" width={256} height={322} data-mo="fade" />
          <span className="eyebrow" data-mo="t" {...html("calc.eyebrow")} />
          <h2 className="d2" data-mo="t" {...html("calc.title")} />
          <p className="calc-sub" data-mo="t" {...html("calc.sub")} />
          <a className="cta" data-calc="" href={calcHref("", lang)} data-cta="calc_open" data-mo="t">
            <span {...html("calc.cta")} />
            <Icon name="arrow" small />
          </a>
        </div>
        <div className="calc-types">
          {TYPES.map((ct) => (
            <a key={ct.hash} className={ct.ltd ? "ct ct--ltd" : "ct"} data-calc={ct.hash} href={calcHref(ct.hash, lang)} data-cta="calc_type" data-mo="card">
              <span className="ct-n" {...html(ct.name)} />
              <span className="ct-a">
                {ct.from ? (
                  <>
                    <span {...html("calc.from")} /> {ct.area}
                  </>
                ) : (
                  ct.area
                )}
              </span>
              <span className="ct-c">
                <span>{ct.count}</span> <span {...html(ct.count === 1 ? "calc.code1" : "calc.codes")} />
              </span>
              <Icon name="arrow" small />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
