"use client";

import { SAVILLS_CONTACT } from "../data/contact";

import { useRef, useState } from "react";
import { Icon } from "../Icons";
import { ERR } from "../data/i18n";
import { asset, markLeadSent, push } from "../lib/dom";
import { useLang } from "../lib/i18n";
import { validLeadPhone } from "@/lib/leads/validation";
import { useLeadSubmission } from "../lib/useLeadSubmission";
import { UTM_KEYS } from "../lib/useUtm";

const STD_UNITS: Array<[string, string]> = [
  ["Studio", "form.u1"],
  ["1 phòng ngủ+", "form.u2"],
  ["2 phòng ngủ", "form.u3"],
  ["2 phòng ngủ+", "form.u4"],
  ["3 phòng ngủ", "form.u5"],
];
const LTD_UNITS: Array<[string, string]> = [
  ["Căn hộ sân vườn", "form.u6"],
  ["Duplex", "form.u7"],
  ["Duplex sân vườn", "form.u8"],
  ["Podium Shop", "form.u9"],
  ["Standalone Shop", "form.u10"],
];

type ErrKey = "name" | "phone" | "consent";

/* Two-step consultation form; shared server-side SMTP API confirms delivery acceptance. */
export function Register() {
  const { lang, html, t } = useLang();
  const [step, setStep] = useState<1 | 2>(1);
  const [unit, setUnit] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [hp, setHp] = useState("");
  const [errs, setErrs] = useState<Partial<Record<ErrKey, boolean>>>({});
  const [sent, setSent] = useState(false);
  const submission = useLeadSubmission();
  const nameRef = useRef<HTMLInputElement>(null);
  const okRef = useRef<HTMLDivElement>(null);

  const next = () => {
    setStep(2);
    requestAnimationFrame(() => nameRef.current?.focus());
    push("form_step", { step: 2, unit_interest: unit });
  };
  const back = () => {
    setStep(1);
    push("form_step", { step: 1 });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hp || submission.pending || sent) return; /* bot trap */
    const nextErrs = { name: name.trim().length < 2, phone: !validLeadPhone(phone), consent: !consent };
    setErrs(nextErrs);
    if (nextErrs.name || nextErrs.phone || nextErrs.consent) return;
    const accepted = await submission.send({ name, phone, email, unit, consent, website: hp, language: lang, source: "landing" });
    if (!accepted) return;
    push("generate_lead", { form_position: "landing", language: lang, unit_interest: unit });
    markLeadSent();
    setSent(true);
    requestAnimationFrame(() => okRef.current?.focus());
  };

  const choices = (rows: Array<[string, string]>) => (
    <div className="choices">
      {rows.map(([value, key]) => (
        <label key={value} className="choice">
          <input type="radio" name="unit_interest" value={value} checked={unit === value} onChange={() => setUnit(value)} />
          <span {...html(key)} />
        </label>
      ))}
    </div>
  );

  return (
    <section className="reg bay" id="register" data-nav="dark">
      <div className="reg-bg" aria-hidden="true">
        <img src={asset("assets/images/hero-facade-sunset.jpg")} alt="Phối cảnh không gian cảnh quan dự án Norton Park" loading="lazy" data-mo="bg" />
      </div>
      <div className="reg-scrim" aria-hidden="true"></div>
      <div className="wrap">
        <div className="reg-card" data-mo="card">
          <div className="reg-form">
            <div id="formHead" hidden={sent}>
              <h2 className="d3" {...html("form.title")} />
              <p className="sub" {...html("form.sub")} />
              <div className="steps" aria-hidden="true">
                <span className="dot on" id="d1"></span>
                <span className={step === 2 ? "dot on" : "dot"} id="d2"></span>
              </div>
            </div>

            <form id="leadForm" method="post" noValidate onSubmit={submit} hidden={sent} aria-busy={submission.pending}>
              <div id="step1" className={step === 1 ? undefined : "hidden"}>
                <p className="step-label" {...html("form.s1")} />
                <fieldset>
                  <legend>
                    <span className="q" {...html("form.unitq")} />
                  </legend>
                  <span className="ch-k" {...html("facts.c1")} />
                  {choices(STD_UNITS)}
                  <span className="ch-k ch-k--ltd" {...html("facts.c2")} />
                  {choices(LTD_UNITS)}
                </fieldset>
                <button type="button" className="cta cta--wide" id="next" onClick={next}>
                  <span {...html("form.next")} />
                  <Icon name="arrow" small />
                </button>
              </div>

              <div id="step2" className={step === 2 ? undefined : "hidden"}>
                <p className="step-label" {...html("form.s2")} />
                <div className="field">
                  <label htmlFor="fullname" {...html("form.name")} />
                  <input
                    ref={nameRef}
                    type="text"
                    id="fullname"
                    maxLength={120}
                    name="fullname"
                    autoComplete="name"
                    aria-describedby="err-fullname"
                    aria-invalid={errs.name || undefined}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <span className="err" id="err-fullname" aria-live="polite">
                    {errs.name ? ERR[lang].name : ""}
                  </span>
                </div>
                <div className="field">
                  <label htmlFor="phone" {...html("form.phone")} />
                  <input
                    type="tel"
                    id="phone"
                    maxLength={32}
                    name="phone"
                    autoComplete="tel"
                    inputMode="tel"
                    aria-describedby="err-phone"
                    aria-invalid={errs.phone || undefined}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <span className="err" id="err-phone" aria-live="polite">
                    {errs.phone ? ERR[lang].phone : ""}
                  </span>
                </div>
                <div className="field">
                  <label htmlFor="email" {...html("form.email")} />
                  <input type="email" maxLength={254} id="email" name="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="consent">
                  <input
                    type="checkbox"
                    id="consent"
                    name="consent"
                    aria-describedby="err-consent"
                    aria-invalid={errs.consent || undefined}
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  <label htmlFor="consent" {...html("form.consent")} />
                </div>
                <span className="err err--consent" id="err-consent" aria-live="polite">
                  {errs.consent ? ERR[lang].consent : ""}
                </span>
                {submission.error && <p className="err" role="alert">{t("lead." + submission.error)}</p>}
                <button type="submit" className="cta cta--wide" disabled={submission.pending} aria-busy={submission.pending}>
                  {submission.pending ? <span>{t("lead.sending")}</span> : <span {...html("cta.main")} />}
                  <Icon name="arrow" small />
                </button>
                <button type="button" className="back" id="back" onClick={back} {...html("form.back")} />
              </div>

              <div className="hp">
                <label htmlFor="website">Website</label>
                <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
              </div>
              {UTM_KEYS.map((k) => (
                <input key={k} type="hidden" name={k} defaultValue="" />
              ))}
              <input type="hidden" name="page_variant" value="norton_park_lead_a" />
              <input type="hidden" name="form_position" value="landing" />
              <p className="privacy" {...html("form.privacy")} />
            </form>

            <div className={sent ? "ok on" : "ok"} id="success" role="status" ref={okRef}>
              <Icon name="check" />
              <h3 className="d3" {...html("form.okt")} />
              <p {...html("form.okb")} />
            </div>
          </div>

          <div className="reg-info">
            <h3 className="d3" {...html("ct.title")} />
            <div className="info-row">
              <Icon name="pin" />
              <div>
                <span className="info-k" {...html("ct.addr")} />
                <a
                  className="info-v"
                  href="https://www.google.com/maps/place/Norton+Park+Gamuda+Land/@10.9311995,106.712967,19z/data=!4m6!3m5!1s0x3174d711342cd6b1:0x1c66dbf89b9b27df!8m2!3d10.9311995!4d106.712967!16s%2Fg%2F11p1_4vk9l"
                  target="_blank"
                  rel="noopener"
                  data-cta="map_contact"
                  {...html("ct.addrv")}
                />
              </div>
            </div>
            <div className="info-row">
              <Icon name="phone" />
              <div>
                <span className="info-k" {...html("ct.hot")} />
                <a className="info-v" href={SAVILLS_CONTACT.phoneHref} data-cta="call_contact">
                  {SAVILLS_CONTACT.phone}
                </a>
              </div>
            </div>
            <div className="info-row">
              <Icon name="mail" />
              <div>
                <span className="info-k" {...html("ct.mail")} />
                <a className="info-v" href={SAVILLS_CONTACT.emailHref} data-cta="mail_contact">
                  {SAVILLS_CONTACT.email}
                </a>
              </div>
            </div>
            <div className="info-row">
              <Icon name="fb" />
              <div>
                <span className="info-k" {...html("ct.fb")} />
                <a className="info-v" href="https://www.facebook.com/NortonParkbyGLVN" target="_blank" rel="noopener" data-cta="fanpage_contact">
                  Norton Park by Gamuda{" "}Land
                </a>
              </div>
            </div>
            <p className="disc" data-nosnippet="" {...html("foot.disclaimer")} />
          </div>
        </div>
      </div>
    </section>
  );
}
