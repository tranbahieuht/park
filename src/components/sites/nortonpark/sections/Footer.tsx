"use client";

import { SAVILLS_CONTACT } from "../data/contact";

import { Icon } from "../Icons";
import { asset, calcHref } from "../lib/dom";
import { useLang } from "../lib/i18n";

const FAQ = ["1", "2", "3", "4", "5", "6"];

const LEGAL: Array<[string, string, string]> = [
  ["chinh-sach-bao-mat", "privacy", "f.l1"],
  ["dieu-khoan-su-dung", "terms", "f.l2"],
  ["mien-tru-trach-nhiem", "disclaimer", "f.l5"],
  ["cong-bo-phap-ly", "notice", "f.l3"],
  ["canh-bao-gia-mao", "fraud", "f.l4"],
  ["thong-tin-phap-nhan", "entity", "f.entity"],
];

/* Product table from the source's visually hidden SEO block. */
const PRODUCTS: string[][] = [
  ["Bộ sưu tập chuẩn sống toàn cầu", "Studio", "ST1.1a", "42,12 m²", "38,13 m²", "1 phòng ngủ, 1 phòng vệ sinh"],
  ["Bộ sưu tập chuẩn sống toàn cầu", "1 phòng ngủ+", "A1.1a", "50,65 m²", "46,57 m²", "1 phòng ngủ, 1 phòng vệ sinh"],
  ["Bộ sưu tập chuẩn sống toàn cầu", "2 phòng ngủ", "B1.4a", "79,24 m²", "72,07 m²", "2 phòng ngủ, 2 phòng vệ sinh"],
  ["Bộ sưu tập chuẩn sống toàn cầu", "2 phòng ngủ+", "B2.2a", "87,20 m²", "80,00 m²", "2 phòng ngủ, 2 phòng vệ sinh"],
  ["Bộ sưu tập chuẩn sống toàn cầu", "3 phòng ngủ", "C4.1a", "113,65 m²", "106,54 m²", "3 phòng ngủ, 2 phòng vệ sinh"],
  ["Bộ sưu tập chuẩn sống đặc tuyển", "Căn hộ sân vườn", "C3.1c.PES", "95,44 m² (dải từ 51,08 m²)", "88,55 m² (dải từ 47,15 m²)", "3 phòng ngủ, 2 phòng vệ sinh (kèm sân vườn riêng 64,00 m²)"],
  ["Bộ sưu tập chuẩn sống đặc tuyển", "Duplex", "D2.1c", "156,07 m²", "143,01 m²", "3 phòng ngủ, 3 phòng vệ sinh (Tầng 1: 95,04 m² · Tầng 2: 61,03 m²)"],
  ["Bộ sưu tập chuẩn sống đặc tuyển", "Duplex sân vườn", "D1.1c", "139,86 m²", "128,96 m²", "3 phòng ngủ, 3 phòng vệ sinh (Tầng 1: 76,14 m² · Tầng 2: 63,72 m² · Sân vườn 60,20 m²)"],
  ["Bộ sưu tập chuẩn sống đặc tuyển", "Podium Shop", "SH04", "189,01 m² (dải từ 141,70 m²)", "174,99 m²", "2 tầng, mặt tiền thương mại khối đế (kèm sân vườn 68,10 m²)"],
];

const PRESS: Array<[string, string, string, string]> = [
  ["https://thanhnien.vn/norton-park-khi-loi-the-canh-tranh-bat-dau-tu-tu-duy-quy-hoach-ben-vung-185261019111828875.htm", "Thanh Niên: Norton Park: Khi lợi thế cạnh tranh bắt đầu từ tư duy quy hoạch bền vững", "2026-10-19", "19/10/2026"],
  ["https://cafef.vn/nguon-cung-nang-hang-gia-can-ho-phia-bac-tphcm-thiet-lap-mat-bang-moi-188261013104820842.chn", "CafeF: Nguồn cung nâng hạng, giá căn hộ phía Bắc TP.HCM thiết lập mặt bằng mới", "2026-10-14", "14/10/2026"],
  ["https://vietnamnet.vn/gamuda-land-dua-chuan-song-quoc-te-den-phia-bac-tp-hcm-2563454.html", "VietNamNet: Gamuda Land đưa chuẩn sống quốc tế đến phía Bắc TP.HCM", "2026-10-12", "12/10/2026"],
  ["https://en.vneconomy.vn/norton-park-makes-a-striking-debut-at-the-sync-show-drawing-2000-sales-professionals.htm", "VnEconomy: Norton Park makes a striking debut at The Sync Show, drawing 2,000 sales professionals", "2026-10-10", "10/10/2026"],
  ["https://vnexpress.net/hon-2-000-nguoi-tham-gia-le-ra-quan-du-an-norton-park-5130441.html", "VnExpress: Hơn 2.000 người tham gia lễ ra quân dự án Norton Park", "2026-10-09", "09/10/2026"],
  ["https://vietnamnet.vn/bat-dong-san-phia-bac-tp-hcm-buoc-vao-cuoc-dua-nang-chuan-khong-gian-song-2561812.html", "VietNamNet: Bất động sản phía bắc TP.HCM bước vào ‘cuộc đua’ nâng chuẩn không gian sống", "2026-10-06", "06/10/2026"],
  ["https://cafeland.vn/tin-tuc/tu-thu-phu-cong-nghiep-den-cuc-tang-truong-moi-thi-truong-bat-dong-san-phia-bac-tphcm-buoc-vao-cuoc-dua-nang-chuan-155552.html", "Cafeland: Từ “thủ phủ công nghiệp” đến cực tăng trưởng mới: thị trường bất động sản phía Bắc TP.HCM bước vào cuộc đua nâng chuẩn", "2026-10-06", "06/10/2026"],
];

export function Footer() {
  const { lang, html } = useLang();
  return (
    <footer className="foot">
      <div className="wrap">
        <details className="f-faq" id="faq">
          <summary className="f-faq-sum">
            <span {...html("faq.heading")} />
            <Icon name="down" small hidden />
          </summary>
          <div className="f-faq-grid">
            {FAQ.map((n) => (
              <article key={n} className="f-faq-item">
                <h3 {...html("faq.q" + n)} />
                <p {...html("faq.a" + n)} />
              </article>
            ))}
          </div>
        </details>
        <div className="f-top">
          <div>
            <img className="f-logo" src={asset("assets/logos/norton-park-logo-primary-beige.svg")} alt="Norton Park, A Gamuda Land Community" width={1200} height={200} loading="lazy" />
          </div>
          <div>
            <span className="f-h" {...html("f.explore")} />
            <ul className="f-list">
              <li><a href="#top" {...html("dr.1")} /></li>
              <li><a href="#position" {...html("dr.2")} /></li>
              <li><a href="#lifestyle" {...html("dr.3")} /></li>
              <li><a href="#residences" {...html("dr.4")} /></li>
              <li><a href={calcHref("", lang)} data-calc="" {...html("f.calc")} /></li>
              <li><a href="https://360.nortonpark.com.vn/" target="_blank" rel="noopener" {...html("f.vr")} /></li>
              <li><a href="#register" {...html("dr.6")} /></li>
            </ul>
          </div>
          <div id="footer-contact">
            <span className="f-h" {...html("f.contact")} />
            <div className="f-ct">
              <Icon name="phone" small />
              <div>
                <span className="f-k" {...html("ct.hot")} />
                <a className="f-v" href={SAVILLS_CONTACT.phoneHref} data-cta="call_footer">{SAVILLS_CONTACT.phone}</a>
              </div>
            </div>
            <div className="f-ct">
              <Icon name="mail" small />
              <div>
                <span className="f-k" {...html("ct.mail")} />
                <a className="f-v" href={SAVILLS_CONTACT.emailHref}>{SAVILLS_CONTACT.email}</a>
              </div>
            </div>
            <div className="f-ct">
              <Icon name="fb" small />
              <div>
                <span className="f-k" {...html("ct.fb")} />
                <a className="f-v" href={SAVILLS_CONTACT.fanpageUrl} target="_blank" rel="noopener noreferrer" data-cta="fanpage_footer">{SAVILLS_CONTACT.fanpageName}</a>
              </div>
            </div>
            <div className="f-ct">
              <Icon name="arrow" small />
              <div>
                <span className="f-k">Website</span>
                <a className="f-v" href={SAVILLS_CONTACT.website} target="_blank" rel="noopener noreferrer">{SAVILLS_CONTACT.website}</a>
              </div>
            </div>
          </div>
          <div>
            <span className="f-h" {...html("f.legal")} />
            <ul className="f-list">
              {/* Savills privacy opens the supplied policy; other documents keep their popup. */}
              {LEGAL.map(([hash, key, label]) => (
                <li key={key}>
                  <a href={key === "privacy" ? SAVILLS_CONTACT.privacyPolicy : "#" + hash} data-legal={key === "privacy" ? undefined : key} target={key === "privacy" ? "_blank" : undefined} rel={key === "privacy" ? "noopener noreferrer" : undefined} {...html(label)} />
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="f-cr f-savills-copyright" {...html("f.cr")} />
      </div>

      {/* Visually hidden fact sheet kept from the source (SEO / AI disambiguation). */}
      <div className="map-sr" aria-hidden="true">
        <table data-nosnippet="">
          <caption>Bảng tổng hợp 9 loại hình sản phẩm và thông số diện tích tiêu biểu tại Norton Park</caption>
          <thead>
            <tr>
              <th scope="col">Bộ sưu tập</th>
              <th scope="col">Loại hình sản phẩm</th>
              <th scope="col">Mã căn tiêu biểu</th>
              <th scope="col">Diện tích sàn GFA</th>
              <th scope="col">Diện tích sử dụng NSA</th>
              <th scope="col">Cơ cấu phòng</th>
            </tr>
          </thead>
          <tbody>
            {PRODUCTS.map((r) => (
              <tr key={r[2]}>
                {r.map((c, i) => (
                  <td key={i}>{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <section>
          <h3>Nguồn báo chí chính thống về Norton Park</h3>
          <ul>
            {PRESS.map(([href, label, iso, d]) => (
              <li key={href}>
                <cite><a href={href}>{label}</a></cite>{" "}
                (<time dateTime={iso}>{d}</time>)
              </li>
            ))}
          </ul>
        </section>
      </div>
    </footer>
  );
}
