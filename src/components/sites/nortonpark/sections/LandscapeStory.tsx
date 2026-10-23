"use client";

import { asset } from "../lib/dom";
import { useLang } from "../lib/i18n";

export function LandscapeStory() {
  const { html } = useLang();
  return (
    <section className="lstory" id="landscape-story" data-nav="dark">
      <div className="lstory-media">
        <img
          src={asset("assets/images/cgi/landscape-story.jpg")}
          alt="Lối chạy bộ giữa rừng cây trong công viên nội khu Norton Park"
          loading="lazy"
          width={2400}
          height={1350}
          data-mo="bg"
        />
      </div>
      <div className="lstory-in wrap">
        <div className="lstory-panel" data-mo="fade">
          <span className="eyebrow" data-mo="t" {...html("ls.eyebrow")} />
          <div className="rule" aria-hidden="true" data-mo="rule"></div>
          <h2 className="d2" data-mo="t" {...html("ls.title")} />
          <p className="lstory-body" data-mo="t" {...html("ls.p1")} />
          <p className="lstory-body" data-mo="t" {...html("ls.p2")} />
        </div>
      </div>
    </section>
  );
}
