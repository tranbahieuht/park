"use client";

import { useEffect, useRef } from "react";
import { asset, LOCK_MQ, vars } from "../lib/dom";
import { useLang } from "../lib/i18n";

/* Brochure layout: the masterplan image fills the section height. If the
   remaining column is >= 280px the text sits beside it (.loc--split),
   otherwise it overlays the image (.loc--stack). Screen Lock only. */
export function Position() {
  const { html } = useLang();
  const secRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const sec = secRef.current;
    if (!sec) return;
    const lock = window.matchMedia(LOCK_MQ);
    const mode = () => {
      let split = false;
      let stack = false;
      if (lock.matches) {
        const nav = document.getElementById("nav");
        const nh = nav ? nav.getBoundingClientRect().height : 70;
        const panel = sec.clientWidth - ((window.innerHeight - nh) * 2400) / 1797;
        split = panel >= 280;
        stack = !split;
      }
      sec.classList.toggle("loc--split", split);
      sec.classList.toggle("loc--stack", stack);
    };
    mode();
    window.addEventListener("resize", mode);
    return () => window.removeEventListener("resize", mode);
  }, []);

  return (
    <section className="loc bay" id="position" ref={secRef}>
      <div className="wrap loc-in">
        <div className="loc-r">
          <img className="smark" src={asset("assets/logos/quacho-symbol-beige.webp")} alt="Họa tiết quả chò nâu biểu tượng Norton Park" aria-hidden="true" width={256} height={322} />
          <h2 className="d2" data-mo="t" {...html("loc.title")} />
          <div className="loc-lead">
            <p className="lead" data-mo="t" {...html("loc.sub1")} />
            <p className="lead" data-mo="t" {...html("loc.sub2")} />
          </div>
          <span className="loc-mark" aria-hidden="true" data-mo="fade"></span>
        </div>
        <div className="loc-figwrap">
          <figure className="loc-fig" style={vars({ "--i": 1 })} data-mo="mask">
            <img
              src={asset("assets/images/cgi/masterplan-birdview-r16.webp")}
              alt="Phối cảnh Norton Park trong tổng thể khu vực: VSIP 1, AEON Mall Thuận Giao, Tuyến Metro số 2 và Nhà ga C8, Sân Golf Sông Bé, Đại lộ Bình Dương, Công viên Norton Park, Phân khu B, Phân khu C và Trung tâm TP.HCM"
              loading="lazy"
              width={2000}
              height={1498}
            />
          </figure>
        </div>
      </div>
    </section>
  );
}
