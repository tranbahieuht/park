"use client";

import { SAVILLS_CONTACT } from "../data/contact";

import { Icon } from "../Icons";
import { useLang } from "../lib/i18n";

/* The client's floating contact group: phone and confirmed Savills Zalo only. */
export function Fab() {
  const { t } = useLang();

  return (
    <div className="fab">
      <a className="fab-call" href={SAVILLS_CONTACT.phoneHref} data-cta="call" aria-label={t("dr.call")}>
        <Icon name="phone" />
      </a>
      <a className="fab-zl" href={SAVILLS_CONTACT.zaloUrl} target="_blank" rel="noopener noreferrer" data-cta="zalo" aria-label={t("dr.zalo")}>
        <Icon name="zalo" />
      </a>
    </div>
  );
}
