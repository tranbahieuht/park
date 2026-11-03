"use client";

import { SAVILLS_CONTACT } from "../data/contact";

import { Icon } from "../Icons";
import { useLang } from "../lib/i18n";
import { WhatsAppLink } from "../WhatsAppLink";

/* Phone and the shared WhatsApp contact. */
export function Fab() {
  const { t } = useLang();

  return (
    <div className="fab">
      <a className="fab-call" href={SAVILLS_CONTACT.phoneHref} data-cta="call" aria-label={t("dr.call")}>
        <Icon name="phone" />
      </a>
      <WhatsAppLink className="fab-whatsapp" cta="whatsapp_floating" />
    </div>
  );
}
