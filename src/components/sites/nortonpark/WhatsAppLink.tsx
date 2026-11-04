"use client";

import { SAVILLS_CONTACT } from "./data/contact";
import { useLang } from "./lib/i18n";

/** One official contact URL for every WhatsApp placement; disable safely if missing. */
export function WhatsAppLink({ className, label = false, cta }: { className: string; label?: boolean; cta: string }) {
  const { t } = useLang();
  const url = SAVILLS_CONTACT.whatsappUrl;
  const content = <><img className="whatsapp-icon" src="/sites/nortonpark/assets/icons/whatsapp.svg" width={24} height={24} alt="" aria-hidden="true" />{label && <span>{t("dr.whatsapp")}</span>}</>;
  return url ? (
    <a className={className} href={url} target="_blank" rel="noopener noreferrer" aria-label={t("whatsapp.label")} data-cta={cta}>{content}</a>
  ) : (
    <button className={className} type="button" disabled aria-label={`${t("whatsapp.label")} — ${t("whatsapp.unavailable")}`} title={t("whatsapp.unavailable")}>{content}</button>
  );
}
