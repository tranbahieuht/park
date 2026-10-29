"use client";

import { useLang } from "../lib/i18n";
import { asset } from "../lib/dom";

function ArchitecturalLines() {
  return (
    <svg viewBox="0 0 360 840" fill="none" aria-hidden="true" focusable="false">
      <g stroke="currentColor" strokeWidth=".85" vectorEffect="non-scaling-stroke">
        <path className="savills-art-outline" pathLength="1" d="M28 824V226L152 158V824M152 158l156 72v594M48 812V242l83-46v616M174 812V200l112 50v562M28 226l124 56 156-52M152 282v542" />
        <path d="M74 228v584M104 212v600M199 211v601M228 224v588M257 237v575M28 322l124 46 156-42M28 402l124 36 156-32M28 482l124 26 156-22M28 562l124 16 156-12M28 642l124 6 156-2M28 722l124-4 156 8M28 802l124-14 156 18" />
        <path d="M4 814h336M8 832h344M80 180V84l70-39 130 60v99M101 168V97l49-27 108 49v75M150 45v113M150 104l130 58M101 132l49-28" />
        <path d="M12 176C12 80 100 12 194 12M324 410c26 68 30 142 15 222M8 756c37-36 89-54 143-49" />
      </g>
    </svg>
  );
}

/** Distributor section — visible in both VI and EN.
 *  All copy is sourced from the i18n dictionary; names, tax IDs, hotline,
 *  email and URL are language-neutral and shared across both locales. */
export function Savills() {
  const { lang, t } = useLang();

  return (
    <>
    <section className="savills savills-partner bay" id="savills" lang={lang} aria-labelledby="savills-title">
      <div className="savills-decoration" aria-hidden="true">
        <div className="savills-art savills-art--right"><ArchitecturalLines /></div>
        <div className="savills-art savills-art--left"><ArchitecturalLines /></div>
      </div>
      <div className="wrap savills-partner-grid">
        <div className="savills-heading" data-mo="t">
          <span className="savills-heading-rule" aria-hidden="true" />
          <h2 className="d2" id="savills-title">
            {t("sv.title")}
          </h2>
        </div>
        <figure className="savills-certificate" data-mo="mask">
          <a href={asset("assets/images/drive/savills-official.png")} target="_blank" rel="noopener noreferrer" aria-label={t("sv.imageAlt")}>
            <img src={asset("assets/images/drive/savills-official.png")} alt={t("sv.imageAlt")} width={1920} height={1920} loading="lazy" />
          </a>
        </figure>
      </div>
    </section>
    <section className="savills savills-about bay" id="savills-about" lang={lang} aria-labelledby="savills-global-title savills-residential-title">
      <div className="savills-decoration" aria-hidden="true">
        <div className="savills-art savills-art--left"><ArchitecturalLines /></div>
      </div>
      <div className="wrap">
        <div className="savills-copy">
          <div className="savills-intro savills-intro--global" data-mo="t">
            <h3 className="d3" id="savills-global-title">{t("sv.h3.global")}</h3>
            <p>{t("sv.p.global")}</p>
          </div>
          <div className="savills-intro savills-intro--residential" data-mo="t">
            <h3 className="d3" id="savills-residential-title">{t("sv.h3.resi")}</h3>
            <p>{t("sv.p.resi")}</p>
          </div>
        </div>
        <div className="savills-promises">
          <h3 className="d3" data-mo="t">{t("sv.commitments")}</h3>
          <ol className="savills-commitments" role="list">
            <li data-mo="t">
              <span className="savills-number" aria-hidden="true">01</span>
              <div className="savills-promise-copy">
                <strong dangerouslySetInnerHTML={{ __html: t("sv.c1.title") }} />{" "}
                <span>{t("sv.c1.body")}</span>
              </div>
            </li>
            <li data-mo="t">
              <span className="savills-number" aria-hidden="true">02</span>
              <div className="savills-promise-copy">
                <strong dangerouslySetInnerHTML={{ __html: t("sv.c2.title") }} />{" "}
                <span>{t("sv.c2.body")}</span>
              </div>
            </li>
            <li data-mo="t">
              <span className="savills-number" aria-hidden="true">03</span>
              <div className="savills-promise-copy">
                <strong dangerouslySetInnerHTML={{ __html: t("sv.c3.title") }} />{" "}
                <span>{t("sv.c3.body")}</span>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </section>
    </>
  );
}
