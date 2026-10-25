"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Icon } from "../Icons";
import { CAT, NEWS } from "../data/content";
import { EN } from "../data/i18n";
import { asset, push } from "../lib/dom";
import { useLang } from "../lib/i18n";

/* Cards per page by viewport width (server render assumes desktop). */
const perPage = () => {
  const w = window.innerWidth;
  return w <= 820 ? 1 : w <= 1040 ? 2 : 3;
};
const onResize = (cb: () => void) => {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
};

/* Publish month for cards with a confirmed date; otherwise the card shows its source. */
function fmtDate(iso: string, lang: "vi" | "en") {
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  if (lang === "en") return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  return "Tháng " + (d.getMonth() + 1) + ", " + d.getFullYear();
}

/* Cards shown at first paint take part in the section's entrance motion;
   cards swapped in later just appear, as in the source. */
const FIRST_IDS = new Set(NEWS.slice(0, 3).map((n) => n.id));

export function News() {
  const { lang, html } = useLang();
  const per = useSyncExternalStore(onResize, perPage, () => 3);
  /* The page index belongs to a per-page count; a different count starts over at page 0. */
  const [nav, setNav] = useState({ per: 3, page: 0 });
  const [paged, setPaged] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const pages = Math.max(1, Math.ceil(NEWS.length / per));
  const page = nav.per === per ? nav.page : 0;
  const cur = page >= pages ? 0 : page;
  const setPage = (p: number) => setNav({ per, page: p });
  const slice = NEWS.slice(cur * per, cur * per + per);
  const single = pages < 2;

  const go = (d: number) => {
    setPaged(true);
    setPage((cur + (d % pages) + pages) % pages);
  };
  const goRef = useRef(go);
  useEffect(() => {
    goRef.current = go;
  });

  /* Horizontal swipe on touch screens (must clearly beat vertical movement). */
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let x0: number | null = null;
    let y0: number | null = null;
    const start = (e: TouchEvent) => {
      x0 = e.touches[0].clientX;
      y0 = e.touches[0].clientY;
    };
    const end = (e: TouchEvent) => {
      if (x0 == null || y0 == null) return;
      const dx = e.changedTouches[0].clientX - x0;
      const dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.6) goRef.current(dx < 0 ? 1 : -1);
      x0 = y0 = null;
    };
    el.addEventListener("touchstart", start, { passive: true });
    el.addEventListener("touchend", end, { passive: true });
    return () => {
      el.removeEventListener("touchstart", start);
      el.removeEventListener("touchend", end);
    };
  }, []);

  return (
    <section className="news bay" id="news">
      <div className="wrap">
        <div className="news-head">
          <div>
            <img className="smark" src={asset("assets/logos/quacho-symbol-beige.webp")} alt="Họa tiết quả chò nâu biểu tượng Norton Park" aria-hidden="true" width={256} height={322} data-mo="fade" />
            <span className="eyebrow" data-mo="t" {...html("news.eyebrow")} />
            <h2 className="d2" data-mo="t" {...html("news.title")} />
          </div>
          <div className="news-act">
            {/* Locked on the source (the /tin-tuc/ page is not open yet). */}
            <a className="news-all" data-newsall="" aria-disabled="true" rel="nofollow" data-cta="news_all">
              <span {...html("news.all")} />
              <Icon name="arrow" small />
            </a>
            <div className="news-nav" hidden={single} data-mo="fade">
              <button type="button" id="newsPrev" aria-label="Tin trước" disabled={single} onClick={() => go(-1)}>
                <Icon name="prev" />
              </button>
              <button type="button" id="newsNext" aria-label="Tin sau" disabled={single} onClick={() => go(1)}>
                <Icon name="next" />
              </button>
            </div>
          </div>
        </div>
        <div className="news-track" id="newsTrack" ref={trackRef}>
          {slice.map((it) => {
            const ext = /^https?:/.test(it.url);
            const when = it.date ? fmtDate(it.date, lang) : it.source || "";
            return (
              <a
                key={it.id}
                className="ncard"
                href={it.url}
                target={ext ? "_blank" : undefined}
                rel={ext ? "noopener" : undefined}
                data-news={it.id}
                data-cat={it.cat}
                data-mo={!paged && FIRST_IDS.has(it.id) ? "card" : undefined}
                onClick={() => push("news_click", { id: it.id, cat: it.cat })}
              >
                <div className="ncard-fig">
                  <img src={asset(it.img)} alt={it.imgAlt} loading="lazy" />
                </div>
                <div className="nmeta">
                  <span className="ncat">{CAT[it.cat][lang]}</span>
                  {when ? <span className="ndate">{when}</span> : null}
                </div>
                <h3>{it.title[lang]}</h3>
                <p className="nexc">{it.excerpt[lang]}</p>
                <span className="nlink">
                  {lang === "en" ? EN["news.more"] : "Xem chi tiết"}
                  <Icon name="arrow" small />
                </span>
              </a>
            );
          })}
        </div>
        <div className="news-dots" id="newsDots" hidden={single} data-mo="fade">
          {Array.from({ length: pages }, (_, p) => (
            <button
              key={p}
              type="button"
              className={p === cur ? "on" : ""}
              aria-label={(lang === "en" ? "Page " : "Trang ") + (p + 1)}
              onClick={() => {
                setPaged(true);
                setPage(p);
              }}
            ></button>
          ))}
        </div>
      </div>
    </section>
  );
}
