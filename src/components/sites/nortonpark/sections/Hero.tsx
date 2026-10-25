"use client";

import { Icon } from "../Icons";
import { asset } from "../lib/dom";
import { useLang } from "../lib/i18n";

export function Hero() {
  const { html } = useLang();
  return (
    <section className="hero" data-nav="dark">
      <div className="hero-media">
        <picture>
          {/* Portrait screens get a crop centred on the right-hand tower cluster. */}
          <source
            media="(max-width:640px), (max-width:1040px) and (orientation:portrait)"
            srcSet={asset("assets/images/cgi/hero-facade-plot-portrait.jpg")}
            width={1053}
            height={1350}
          />
          <img
            src={asset("assets/images/cgi/design-story-facade.jpg")}
            alt="Hai cụm tháp Norton Park nhìn trực diện từ trục đường nội khu"
            fetchPriority="high"
            width={2400}
            height={1350}
            data-mo="bg"
          />
        </picture>
      </div>
      <div className="hero-scrim" aria-hidden="true"></div>
      <div className="hero-in">
        <span className="eyebrow" data-mo="t" {...html("hero.eyebrow")} />
        <h1 className="d1" data-mo="t">
          <span className="map-sr" {...html("hero.sr")} />
          <span {...html("hero.quote")} />
        </h1>
        <div className="hero-cta">
          <a href="#register" className="cta" data-cta="hero" data-mo="t">
            <span {...html("cta.main")} />
            <Icon name="arrow" small />
          </a>
          <a href="#design-story" className="cta cta--onimg cta--down" data-cta="hero_explore" data-mo="t">
            <span {...html("cta.explore")} />
            <Icon name="down" small />
          </a>
        </div>
      </div>
    </section>
  );
}
