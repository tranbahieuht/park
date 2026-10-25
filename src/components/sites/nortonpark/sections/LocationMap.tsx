"use client";

import { useCallback, useEffect, useRef } from "react";
import { LOCATION_MAP_VI } from "../data/location-map-i18n";
import { asset, push } from "../lib/dom";
import { useLang } from "../lib/i18n";

/* The interactive location map is the source's own standalone SVG widget
   (public/sites/nortonpark/assets/map/location-map.html, its own CSS + JS),
   embedded in an iframe exactly as the source page does. It reports
   interactions via postMessage and is told to "sleep" (release the wheel)
   once the section scrolls out of view. */
export function LocationMap() {
  const { lang, html, t } = useLang();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const secRef = useRef<HTMLElement>(null);

  // Keep the same iframe/window alive: changing its URL would reset map state.
  const syncLocale = useCallback(() => {
    const copy = Object.fromEntries(Object.keys(LOCATION_MAP_VI).map((key) => [key, t(key)]));
    frameRef.current?.contentWindow?.postMessage(
      { np: "locmap-cmd", cmd: "locale", lang, copy }, window.location.origin,
    );
  }, [lang, t]);

  useEffect(() => { syncLocale(); }, [syncLocale]);

  useEffect(() => {
    const fr = frameRef.current;
    const sec = secRef.current;
    if (!fr || !sec) return;
    const onMsg = (e: MessageEvent) => {
      const d = e.data as { np?: string; ev?: string; label?: string } | null;
      if (e.origin !== window.location.origin || e.source !== fr.contentWindow || !d || d.np !== "locmap") return;
      if (d.ev === "ready") { syncLocale(); return; }
      push("map_interact", { action: d.ev, item: d.label });
    };
    window.addEventListener("message", onMsg);
    const o = new IntersectionObserver(
      (es) => {
        if (es[0].isIntersecting) return;
        try {
          fr.contentWindow?.postMessage({ np: "locmap-cmd", cmd: "sleep" }, "*");
        } catch {}
      },
      { threshold: 0 },
    );
    o.observe(sec);
    return () => {
      window.removeEventListener("message", onMsg);
      o.disconnect();
    };
  }, [syncLocale]);

  return (
    <section className="map bay" id="location" ref={secRef}>
      <div className="wrap">
        {/* Kept for SEO / screen readers, visually hidden like the source. */}
        <h2 className="map-sr" {...html("map.title")} />
        <div className="map-frame">
          <iframe
            ref={frameRef}
            id="locMap"
            src={asset("assets/map/location-map.html")}
            title={t("map.ui.frame")}
            onLoad={syncLocale}
            loading="lazy"
            allow="fullscreen"
          ></iframe>
        </div>
      </div>
    </section>
  );
}
