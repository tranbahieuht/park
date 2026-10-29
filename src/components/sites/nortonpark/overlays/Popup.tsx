"use client";

import { SAVILLS_CONTACT } from "../data/contact";

import { useEffect, useRef, useState } from "react";
import { Icon } from "../Icons";
import { ERR } from "../data/i18n";
import { asset, leadSent, lockScroll, markLeadSent, push, trapTab } from "../lib/dom";
import { useLang } from "../lib/i18n";
import { validLeadPhone } from "@/lib/leads/validation";
import { useLeadSubmission } from "../lib/useLeadSubmission";

const UNITS_STD: Array<[string, string]> = [
  ["Studio", "form.u1"],
  ["1 phòng ngủ+", "form.u2"],
  ["2 phòng ngủ", "form.u3"],
  ["2 phòng ngủ+", "form.u4"],
  ["3 phòng ngủ", "form.u5"],
];
const UNITS_LTD: Array<[string, string]> = [
  ["Căn hộ sân vườn", "form.u6"],
  ["Duplex", "form.u7"],
  ["Duplex sân vườn", "form.u8"],
  ["Podium Shop", "form.u9"],
  ["Standalone Shop", "form.u10"],
];

const MAPS_URL =
  "https://www.google.com/maps/place/Norton+Park+Gamuda+Land/@10.9311995,106.712967,19z/data=!4m6!3m5!1s0x3174d711342cd6b1:0x1c66dbf89b9b27df!8m2!3d10.9311995!4d106.712967!16s%2Fg%2F11p1_4vk9l";

/* While the drawer, lightbox or a legal doc is open, or the visitor is already
   at the Register section, the popup waits. */
function blocked() {
  if (document.querySelector("#drawer.is-open, #lightbox.is-open, .ldoc.is-open")) return true;
  const reg = document.getElementById("register");
  if (reg) {
    const r = reg.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.6 && r.bottom > 0) return true;
  }
  return false;
}

/* Lead popup: opens 5 s after every page load (retrying each second while
   blocked) unless a lead was already sent. Submissions are accepted only after the shared SMTP API succeeds. */
export function Popup() {
  const { lang, t, html } = useLang();
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const submission = useLeadSubmission();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [unit, setUnit] = useState("");
  const [consent, setConsent] = useState(false);
  const [hp, setHp] = useState("");
  const [errs, setErrs] = useState<{ name?: boolean; phone?: boolean; consent?: boolean }>({});
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let timer = 0;
    const tryOpen = () => {
      if (leadSent()) return;
      if (blocked()) {
        timer = window.setTimeout(tryOpen, 1000);
        return;
      }
      try {
        sessionStorage.setItem("np_pop_seen", "1");
      } catch {}
      lastFocus.current = document.activeElement as HTMLElement | null;
      setOpen(true);
      push("popup_open", { trigger: "timer_5s" });
    };
    timer = window.setTimeout(tryOpen, 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      else trapTab(e, panelRef.current, '#popForm:not([hidden]) :is(a[href],button:not([disabled]),input:not([type="hidden"]):not([tabindex="-1"]),select), .pop-info a[href], .pop-close');
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      lockScroll(false);
      lastFocus.current?.focus?.();
    };
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hp || submission.pending || sent) return;
    const next = { name: name.trim().length < 2, phone: !validLeadPhone(phone), consent: !consent };
    setErrs(next);
    if (next.name || next.phone || next.consent) return;
    const accepted = await submission.send({ name, phone, email, unit, consent, website: hp, language: lang, source: "popup" });
    if (!accepted) return;
    push("generate_lead", { form_position: "popup", language: lang, unit_interest: unit });
    markLeadSent();
    setSent(true);
  };

  const close = () => setOpen(false);

  return (
    <div className={open ? "pop is-open" : "pop"} id="pop">
      <div className="pop-backdrop" data-pop-close="" aria-hidden="true" onClick={close}></div>
      <div ref={panelRef} className="pop-panel" role="dialog" aria-modal="true" aria-labelledby="popSub">
        <div className="pop-form">
          <img className="pop-logo pop-savills-logo" src={asset("assets/logos/savills-official.png")} alt="Savills" width={158} height={158} loading="lazy" hidden={sent} />
          <p className="pop-sub" id="popSub" hidden={sent} {...html("pop.sub")} />
          <form id="popForm" method="post" noValidate onSubmit={submit} hidden={sent} aria-busy={submission.pending}>
            <div className="two">
              <div className="field">
                <input
                  type="text"
                  maxLength={120}
                  id="pName"
                  name="fullname"
                  autoComplete="name"
                  placeholder={t("pop.name")}
                  aria-describedby="err-pName"
                  aria-invalid={errs.name || undefined}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <span className="err" id="err-pName" aria-live="polite">
                  {errs.name ? ERR[lang].name : ""}
                </span>
              </div>
              <div className="field">
                <input
                  type="tel"
                  maxLength={32}
                  id="pPhone"
                  name="phone"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder={t("pop.phone")}
                  aria-describedby="err-pPhone"
                  aria-invalid={errs.phone || undefined}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <span className="err" id="err-pPhone" aria-live="polite">
                  {errs.phone ? ERR[lang].phone : ""}
                </span>
              </div>
            </div>
            <div className="field">
              <input type="email" maxLength={254} id="pEmail" name="email" autoComplete="email" placeholder={t("pop.email")} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <select id="pUnit" name="unit_interest" value={unit} onChange={(e) => setUnit(e.target.value)}>
                <option value="">{t("pop.unit")}</option>
                <optgroup label={t("facts.c1")}>
                  {UNITS_STD.map(([v, k]) => (
                    <option key={v} value={v}>
                      {t(k)}
                    </option>
                  ))}
                </optgroup>
                <optgroup label={t("facts.c2")}>
                  {UNITS_LTD.map(([v, k]) => (
                    <option key={v} value={v}>
                      {t(k)}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
            <div className="consent">
              <input
                type="checkbox"
                id="pConsent"
                name="consent"
                aria-describedby="err-pConsent"
                aria-invalid={errs.consent || undefined}
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <label htmlFor="pConsent" {...html("form.consent")} />
            </div>
            <span className="err err--consent" id="err-pConsent" aria-live="polite">
              {errs.consent ? ERR[lang].consent : ""}
            </span>
            <div className="hp">
              <label htmlFor="pWebsite">Website</label>
              <input type="text" id="pWebsite" name="website" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
            </div>
            <input type="hidden" name="page_variant" value="norton_park_lead_a" />
            <input type="hidden" name="form_position" value="popup" />
            {submission.error && <p className="err" role="alert">{t("lead." + submission.error)}</p>}
            <button type="submit" className="cta cta--wide" disabled={submission.pending} aria-busy={submission.pending}>
              {submission.pending ? <span>{t("lead.sending")}</span> : <span {...html("pop.cta")} />}
              <Icon name="arrow" small />
            </button>
          </form>
          <div className={sent ? "ok on" : "ok"} id="popOk" role="status">
            <Icon name="check" />
            <h3 className="d3" {...html("form.okt")} />
            <p {...html("form.okb")} />
          </div>
        </div>
        <div className="pop-media">
          <img className="pop-bg" src={asset("assets/images/cgi/amenity-overview-portrait.jpg")} alt="Phối cảnh tổng thể tiện ích dự án Norton Park" aria-hidden="true" loading="lazy" width={900} height={1200} />
          <div className="pop-info">
            <h3 className="d3" {...html("ct.title")} />
            <div>
              <span className="info-k" {...html("ct.hot")} />
              <a className="info-v" href={SAVILLS_CONTACT.phoneHref} data-cta="call_popup">
                {SAVILLS_CONTACT.phone}
              </a>
            </div>
            <div>
              <span className="info-k" {...html("ct.mail")} />
              <a className="info-v" href={SAVILLS_CONTACT.emailHref}>
                {SAVILLS_CONTACT.email}
              </a>
            </div>
            <div>
              <span className="info-k" {...html("ct.fb")} />
              <a className="info-v" href={SAVILLS_CONTACT.fanpageUrl} target="_blank" rel="noopener noreferrer" data-cta="fanpage_popup">{SAVILLS_CONTACT.fanpageName}</a>
            </div>
            <div>
              <span className="info-k">{t("ct.office")}</span>
              <p className="info-v">{SAVILLS_CONTACT.office[lang]}</p>
            </div>
            <div>
              <span className="info-k" {...html("ct.addr")} />
              <a className="info-v" href={MAPS_URL} target="_blank" rel="noopener" data-cta="map_popup" {...html("ct.addrv")} />
            </div>
          </div>
        </div>
        <button type="button" className="pop-close" data-pop-close="" aria-label={t("ui.close")} ref={closeRef} onClick={close}>
          <Icon name="close" />
        </button>
      </div>
    </div>
  );
}
