"use client";

import { useEffect, useRef } from "react";
import { useLang } from "../lib/i18n";

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
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !("IntersectionObserver" in window)) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const targets = Array.from(section.querySelectorAll<HTMLElement>("[data-sv-reveal]"));
    let revealObserver: IntersectionObserver | undefined;
    let viewObserver: IntersectionObserver | undefined;

    const stop = () => {
      revealObserver?.disconnect();
      viewObserver?.disconnect();
      section.removeAttribute("data-sv-motion");
      section.removeAttribute("data-sv-inview");
    };
    const start = () => {
      stop();
      if (reducedMotion.matches) return;

      // Like the site's motion system: visible by default, once-only reveals,
      // the same easing, and no scroll listeners or React state per frame.
      section.setAttribute("data-sv-motion", "on");
      revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("sv-revealed");
          observer.unobserve(entry.target);
        });
      }, { rootMargin: "0px 0px -6% 0px", threshold: .08 });
      targets.filter((target) => !target.classList.contains("sv-revealed"))
        .forEach((target) => revealObserver?.observe(target));

      viewObserver = new IntersectionObserver(([entry]) => {
        section.toggleAttribute("data-sv-inview", entry.isIntersecting);
        if (entry.isIntersecting) section.classList.add("sv-entered");
      }, { threshold: 0 });
      viewObserver.observe(section);
    };

    start();
    reducedMotion.addEventListener("change", start);
    return () => {
      stop();
      reducedMotion.removeEventListener("change", start);
    };
  }, [lang]);

  return (
    <section className="savills bay" id="savills" ref={sectionRef} lang={lang} aria-labelledby="savills-title">
      <div className="savills-decoration" aria-hidden="true">
        <div className="savills-art savills-art--right"><ArchitecturalLines /></div>
        <div className="savills-art savills-art--left"><ArchitecturalLines /></div>
      </div>
      <div className="wrap">
        <div className="savills-heading" data-sv-reveal="heading">
          <span className="savills-heading-rule" aria-hidden="true" />
          <h2 className="d2" id="savills-title">
            {t("sv.title")}
          </h2>
        </div>
        <div className="savills-copy">
          <div className="savills-intro savills-intro--global" data-sv-reveal="intro">
            <h3 className="d3">{t("sv.h3.global")}</h3>
            <p>{t("sv.p.global")}</p>
          </div>
          <div className="savills-intro savills-intro--residential" data-sv-reveal="intro">
            <h3 className="d3">{t("sv.h3.resi")}</h3>
            <p>{t("sv.p.resi")}</p>
          </div>
        </div>
        <div className="savills-promises">
          <h3 className="d3" data-sv-reveal="label">{t("sv.commitments")}</h3>
          <ol className="savills-commitments" role="list">
            <li data-sv-reveal="commitment">
              <span className="savills-number" aria-hidden="true">01</span>
              <div className="savills-promise-copy">
                <strong dangerouslySetInnerHTML={{ __html: t("sv.c1.title") }} />{" "}
                <span>{t("sv.c1.body")}</span>
              </div>
            </li>
            <li data-sv-reveal="commitment">
              <span className="savills-number" aria-hidden="true">02</span>
              <div className="savills-promise-copy">
                <strong dangerouslySetInnerHTML={{ __html: t("sv.c2.title") }} />{" "}
                <span>{t("sv.c2.body")}</span>
              </div>
            </li>
            <li data-sv-reveal="commitment">
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
  );
}
