"use client";

import { useEffect, useRef } from "react";
import { asset, LOCK_MQ, vars } from "../lib/dom";
import { useLang } from "../lib/i18n";

const TRAMS = [
  { mod: "tram--nl", img: "assets/images/cgi/tram-nang-luong.jpg", alt: "Hồ bơi trung tâm giữa tầng cây xanh", h: 1264, n: "tram.n1", p: "tram.p1" },
  { mod: "tram--hs", img: "assets/images/cgi/tram-hieu-suat.jpg", alt: "Không gian Work Hub ngập ánh sáng tự nhiên", h: 1187, n: "tram.n2", p: "tram.p2" },
  { mod: "tram--hk", img: "assets/images/drive/story-skatepark.webp", alt: "Trẻ em vui chơi trên sân trượt ván giữa khu vườn nội khu", h: 1118, n: "tram.n3", p: "tram.p3" },
];

export function Story() {
  const { lang, html } = useLang();
  const listRef = useRef<HTMLUListElement>(null);

  /* Section is locked to 100dvh on desktop and the card images keep their
     ratio, so the cards must get narrower on short screens. Text height grows
     as cards narrow, which CSS cannot solve: shrink --cw until the tallest
     card fits. Titles all switch to two lines (.is-stack) as soon as any one
     wraps, so the three cards stay alike. */
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const lock = window.matchMedia(LOCK_MQ);
    const titles = () => {
      list.classList.remove("is-stack");
      let wrap = false;
      list.querySelectorAll(".tram-n").forEach((h) => {
        const k = h.querySelector(".tram-k");
        const v = h.querySelector(".tram-v");
        if (k && v && v.getBoundingClientRect().top >= k.getBoundingClientRect().bottom - 1) wrap = true;
      });
      if (wrap) list.classList.add("is-stack");
    };
    const fit = () => {
      titles();
      if (!lock.matches) {
        list.style.removeProperty("--cw");
        return;
      }
      const H = list.clientHeight;
      const gap = parseFloat(getComputedStyle(list).columnGap) || 0;
      const cards = list.children;
      const n = cards.length || 1;
      let w = Math.floor((list.clientWidth - (n - 1) * gap) / n);
      let best = w;
      let bestH = Infinity;
      let fits = false;
      for (let i = 0; i < 60 && w > 140; i++) {
        list.style.setProperty("--cw", w + "px");
        let tall = 0;
        for (let k = 0; k < cards.length; k++) tall = Math.max(tall, cards[k].scrollHeight);
        if (tall <= H) {
          fits = true;
          break;
        }
        if (tall < bestH) {
          bestH = tall;
          best = w;
        }
        w -= Math.max(3, Math.round(w * 0.025));
      }
      if (!fits) list.style.setProperty("--cw", best + "px");
    };
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(fit);
    };
    window.addEventListener("resize", onResize);
    let alive = true;
    document.fonts?.ready.then(() => alive && fit());
    let lastW = 0;
    const ro = new ResizeObserver(() => {
      if (list.clientWidth === lastW) return;
      lastW = list.clientWidth;
      titles();
    });
    ro.observe(list);
    fit();
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
  }, [lang]);

  return (
    <section className="story" id="story" data-nav="dark">
      <div className="story-glow" aria-hidden="true"></div>
      <div className="wrap story-in">
        <div className="story-top">
          <div className="story-head">
            <span className="eyebrow" data-mo="t" {...html("story.eyebrow")} />
            <div className="rule" aria-hidden="true" data-mo="rule"></div>
            <h2 className="d2" data-mo="t" {...html("story.title")} />
            <div className="rule rule--b" aria-hidden="true" data-mo="rule"></div>
          </div>
          <p className="story-body" data-mo="t" {...html("story.body")} />
        </div>
        <ul className="tram-list" ref={listRef}>
          {TRAMS.map((tr, i) => (
            <li key={tr.mod} className={`tram ${tr.mod}`} style={i ? vars({ "--i": i }) : undefined} data-mo="card">
              <figure className="tram-fig">
                <img src={asset(tr.img)} alt={tr.alt} loading="lazy" width={1100} height={tr.h} />
              </figure>
              <div className="tram-txt">
                <h3 className="tram-n" {...html(tr.n)} />
                <p {...html(tr.p)} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
