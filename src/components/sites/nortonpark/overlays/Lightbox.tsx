"use client";

import { Icon } from "../Icons";
import { useLang } from "../lib/i18n";

/* Map zoom overlay from the source markup. The current map is the iframe
   widget (it has its own zoom), so nothing on the page opens this; it is
   kept closed for parity. */
export function Lightbox() {
  const { html } = useLang();
  return (
    <div className="lb" id="lightbox" role="dialog" aria-modal="true" aria-label="Bản đồ phóng to">
      <button type="button" className="lb-close" id="lbClose" aria-label="Đóng">
        <Icon name="close" />
      </button>
      <div className="lb-img" id="lbScroll">
        <img id="lbImg" alt="Hình ảnh chi tiết dự án Norton Park" />
      </div>
      <p className="lb-hint" {...html("map.hint")} />
    </div>
  );
}
