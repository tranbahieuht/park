"use client";

import { TEAM } from "../data/content";
import { asset } from "../lib/dom";
import { useLang } from "../lib/i18n";

export function Developer() {
  const { lang, html } = useLang();
  return (
    <section className="dev bay" id="developer">
      <div className="wrap">
        <div className="dev-top">
          <div className="dev-head">
            <img className="smark" src={asset("assets/logos/quacho-symbol-bronze.webp")} alt="Họa tiết quả chò nâu biểu tượng Norton Park" aria-hidden="true" width={256} height={322} data-mo="fade" />
            <span className="eyebrow" data-mo="t" {...html("dev.eyebrow")} />
            <h2 className="d2" data-mo="t" {...html("dev.title")} />
            <img className="gam" src={asset("assets/logos/gamuda-land-logo.webp")} alt="Gamuda Land" loading="lazy" width={700} height={73} data-mo="t" />
          </div>
          <p className="dev-body" data-nosnippet="" data-mo="t" {...html("dev.body")} />
        </div>
        {/* Hidden on the source until the second partner's details are confirmed. */}
        <div className="dev-investors" hidden>
          <div className="dev-inv dev-inv--ph">
            <span className="tag" {...html("dev.role2")} />
            <div className="slot-box dev-inv-logo">
              <span {...html("ph.logo2")} />
            </div>
            <p {...html("dev.body2")} />
          </div>
        </div>
        <div className="dev-bottom">
          <div className="blk-team">
            <span className="blk-h" data-mo="t" {...html("dev.team")} />
            <div className="team" id="devTeam">
              {TEAM.map((x) => (
                <div key={x.logo} className="slot slot--logo" data-mo="card">
                  <span className="slot-k">{x.role[lang]}</span>
                  <div className="slot-box">
                    <img src={asset(x.logo)} alt={x.name || x.role[lang]} loading="lazy" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
