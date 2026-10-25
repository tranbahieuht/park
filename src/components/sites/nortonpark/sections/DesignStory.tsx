"use client";

import { asset } from "../lib/dom";
import { useLang } from "../lib/i18n";

export function DesignStory() {
  const { html } = useLang();
  return (
    <section className="dstory" id="design-story" data-nav="dark">
      <div className="dstory-media">
        <picture>
          <source media="(max-width:640px)" srcSet={asset("assets/images/hero-facade-sunset-portrait.jpg")} width={900} height={1153} />
          <img
            src={asset("assets/images/hero-facade-sunset.jpg")}
            alt="Tầng mái Norton Park lúc hoàng hôn"
            loading="lazy"
            width={2400}
            height={1339}
            data-mo="bg"
          />
        </picture>
      </div>
      <div className="dstory-scrim" aria-hidden="true"></div>
      {/* Hoa dau (Dipterocarpus flower) artwork, transparent PNG/WebP. */}
      <div className="dstory-mark" aria-hidden="true" data-mo="fade">
        <img
          src={asset("assets/images/hoa-dau-artwork.webp")}
          alt="Họa tiết hoa dầu nghệ thuật dự án Norton Park"
          aria-hidden="true"
          width={1117}
          height={635}
          decoding="async"
        />
      </div>
      <div className="wrap dstory-in">
        <span className="eyebrow" data-mo="t" {...html("ds.eyebrow")} />
        <div className="rule" aria-hidden="true" data-mo="rule"></div>
        <h2 className="d2" data-mo="t" {...html("ds.title")} />
        <p className="dstory-body" data-mo="t" {...html("ds.p1")} />
        <p className="dstory-body" data-mo="t" {...html("ds.p2")} />
      </div>
    </section>
  );
}
