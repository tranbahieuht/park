"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { LIFE } from "../data/content";
import { asset, cx, push, reduceMotion } from "../lib/dom";
import { useLang } from "../lib/i18n";

const N = LIFE.length;
const mod = (k: number) => ((k % N) + N) % N;

/* Horizontal 16:9 carousel: active slide centred, neighbours peek out on both
   sides. Infinite loop via three copies of the list; after a move that leaves
   the middle copy, jump (without transition) to the matching middle slide.
   Driven by drag/swipe with snap, click on a neighbour, horizontal wheel /
   trackpad, arrow keys and the dots. Vertical wheel still scrolls the page. */
export function Lifestyle() {
  const { lang, html } = useLang();
  const [pos, setPos] = useState(N);
  const lifeI = mod(pos);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(pos);
  const xRef = useRef(0);
  const animNext = useRef(false);
  const moved = useRef(false);

  const place = useCallback((anim: boolean) => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage || !track.children.length) return;
    const sw = (track.children[0] as HTMLElement).offsetWidth;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const x = stage.clientWidth / 2 - (posRef.current * (sw + gap) + sw / 2);
    const still = !anim || reduceMotion();
    track.style.transition = still ? "none" : "";
    xRef.current = Math.round(x);
    track.style.transform = `translate3d(${xRef.current}px,0,0)`;
    if (still) {
      void track.offsetWidth;
      track.style.transition = "";
    }
  }, []);

  const go = useCallback((k: number) => {
    animNext.current = true;
    setPos(k);
    push("lifestyle_slide", { amenity: LIFE[mod(k)].id });
  }, []);

  useLayoutEffect(() => {
    posRef.current = pos;
    place(animNext.current);
    animNext.current = false;
  }, [pos, place]);

  useEffect(() => {
    const stage = stageRef.current;
    const track = trackRef.current;
    if (!stage || !track) return;
    let drag: { x: number; y: number; id: number; dx: number; on: boolean } | null = null;

    const onDown = (e: PointerEvent) => {
      if (e.button !== undefined && e.button !== 0) return;
      drag = { x: e.clientX, y: e.clientY, id: e.pointerId, dx: 0, on: false };
      moved.current = false;
    };
    const onMove = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      if (!drag.on) {
        if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(dy)) {
          if (Math.abs(dy) > 10) drag = null; /* vertical scroll: let it go */
          return;
        }
        drag.on = true;
        moved.current = true;
        stage.classList.add("is-drag");
        track.style.transition = "none";
      }
      drag.dx = dx;
      track.style.transform = `translate3d(${xRef.current + dx}px,0,0)`;
    };
    const onEnd = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag;
      drag = null;
      stage.classList.remove("is-drag");
      if (!d.on) return;
      track.style.transition = "";
      const sw = (track.children[0] as HTMLElement).offsetWidth;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      const step = sw + gap;
      let n = Math.round(-d.dx / step);
      if (n === 0 && Math.abs(d.dx) > step * 0.12) n = d.dx < 0 ? 1 : -1;
      if (n) go(posRef.current + n);
      else place(true);
      setTimeout(() => {
        moved.current = false;
      }, 0);
    };
    const onDragStart = (e: DragEvent) => e.preventDefault();
    let wAcc = 0;
    let wLock = 0;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      const now = Date.now();
      if (now < wLock) return;
      wAcc += e.deltaX;
      if (Math.abs(wAcc) > 40) {
        go(posRef.current + (wAcc > 0 ? 1 : -1));
        wAcc = 0;
        wLock = now + 650;
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(posRef.current + 1);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(posRef.current - 1);
      }
    };
    const onTransitionEnd = (e: TransitionEvent) => {
      if (e.target !== track) return;
      const p = posRef.current;
      if (p < N || p >= 2 * N) {
        animNext.current = false;
        setPos(N + mod(p));
      }
    };
    const onResize = () => place(false);

    stage.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);
    stage.addEventListener("dragstart", onDragStart);
    stage.addEventListener("wheel", onWheel, { passive: false });
    stage.addEventListener("keydown", onKey);
    track.addEventListener("transitionend", onTransitionEnd);
    window.addEventListener("resize", onResize);
    window.addEventListener("load", onResize);
    return () => {
      stage.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
      stage.removeEventListener("dragstart", onDragStart);
      stage.removeEventListener("wheel", onWheel);
      stage.removeEventListener("keydown", onKey);
      track.removeEventListener("transitionend", onTransitionEnd);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onResize);
    };
  }, [go, place]);

  /* Dots take the shortest way round from the current slide. */
  const goLife = (i: number) => {
    let d = (((i - lifeI) % N) + N) % N;
    if (d > N / 2) d -= N;
    go(pos + d);
  };

  return (
    <section className="life bay" id="lifestyle">
      <div className="wrap">
        <div className="life-head">
          <img className="smark" src={asset("assets/logos/quacho-symbol-bronze.webp")} alt="Họa tiết quả chò nâu biểu tượng Norton Park" aria-hidden="true" width={256} height={322} data-mo="fade" />
          <span className="eyebrow" data-mo="t" {...html("life.eyebrow")} />
          <h2 className="d2" data-mo="t" {...html("life.title")} />
        </div>
        <div
          className="life-stage"
          ref={stageRef}
          tabIndex={0}
          aria-roledescription="carousel"
          aria-label="Tiện ích, kéo hoặc vuốt để chuyển ảnh"
          data-mo="card"
        >
          <div className="life-track" id="lifeTrack" ref={trackRef}>
            {[0, 1, 2].map((c) =>
              LIFE.map((it, i) => {
                const k = c * N + i;
                return (
                  <figure
                    key={k}
                    className={cx("life-slide", k === pos && "on")}
                    data-i={i}
                    aria-hidden={c === 1 ? undefined : "true"}
                    onClick={() => {
                      if (moved.current) return;
                      if (k !== pos) go(k);
                    }}
                  >
                    <img src={asset(it.img)} alt={c === 1 ? it.shot[lang] : ""} loading="lazy" />
                    <figcaption className="life-cap">
                      <span className="life-k">{it.name[lang]}</span>
                      <span className="life-t">{it.tag[lang]}</span>
                      <span className="life-d">{it.desc[lang]}</span>
                    </figcaption>
                  </figure>
                );
              }),
            )}
          </div>
        </div>
        <p className="life-desc" id="lifeDesc" data-mo="t">
          {LIFE[lifeI].desc[lang]}
        </p>
        <div className="life-dots" id="lifeDots" role="tablist" aria-label="Nhóm tiện ích" data-mo="fade">
          {LIFE.map((it, i) => (
            <button
              key={it.id}
              type="button"
              role="tab"
              data-i={i}
              className={i === lifeI ? "on" : undefined}
              aria-selected={i === lifeI}
              aria-label={it.name[lang]}
              onClick={() => goLife(i)}
            ></button>
          ))}
        </div>
      </div>
    </section>
  );
}
