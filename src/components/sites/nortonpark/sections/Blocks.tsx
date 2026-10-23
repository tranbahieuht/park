"use client";

import { Icon } from "../Icons";
import { asset, vars } from "../lib/dom";
import { useLang } from "../lib/i18n";

export function Blocks() {
  const { html } = useLang();
  return (
    <section className="blocks bay" id="blocks">
      <div className="wrap">
        <img className="smark" src={asset("assets/logos/quacho-symbol-bronze.webp")} alt="Họa tiết quả chò nâu biểu tượng Norton Park" aria-hidden="true" width={256} height={322} data-mo="fade" />
        <span className="eyebrow" data-mo="t" {...html("blk.eyebrow")} />
        <h2 className="d2" data-mo="t" {...html("blk.title")} />
        <div className="blocks-grid">
          <article className="blk" data-mo="card">
            <div className="blk-fig">
              <img src={asset("assets/images/cgi/block-b.jpg")} alt="Phân khu B, lối vào và mặt tiền thương mại" loading="lazy" />
            </div>
            <h3 className="d3" {...html("blk.bt")} />
            <p {...html("blk.bd")} />
            <ul>
              <li>
                <Icon name="mall" />
                <span {...html("blk.b1")} />
              </li>
              <li>
                <Icon name="check" />
                <span {...html("blk.b2")} />
              </li>
              <li>
                <Icon name="desk" />
                <span {...html("blk.b3")} />
              </li>
            </ul>
          </article>
          <article className="blk blk--soon" style={vars({ "--i": 1 })} data-mo="card">
            <div className="blk-fig blk-fig--plan">
              <img src={asset("assets/images/cgi/block-c-plan-r4.jpg")} alt="Mặt bằng tổng thể, Phân khu C được làm nổi bật" loading="lazy" width={2400} height={1200} />
              <span className="blk-pin" {...html("blk.pin")} />
            </div>
            <h3 className="d3" {...html("blk.ct")} />
            <span className="blk-soon" {...html("blk.soon")} />
          </article>
        </div>
      </div>
    </section>
  );
}
