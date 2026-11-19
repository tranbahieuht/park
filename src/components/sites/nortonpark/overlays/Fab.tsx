"use client";

import { useEffect, useState } from "react";
import { SAVILLS_CONTACT } from "../data/contact";

import { Icon } from "../Icons";
import { useLang } from "../lib/i18n";
import { WhatsAppLink } from "../WhatsAppLink";

const FIELD = "input,select,textarea";

/* Hide the buttons only while the visitor is typing in the on-screen contact
   form, so they never cover its fields. `#register:focus-within` alone kept
   them hidden (and unclickable) after the visitor scrolled away, closed the
   keyboard without blurring, or submitted (focus moves to the success note). */
function useTypingInRegister() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const reg = document.getElementById("register");
    if (!reg) return;
    let typing = false;
    let inView = false;
    const sync = () => setHidden(typing && inView);
    const onFocus = () => {
      const el = document.activeElement;
      typing = !!el && reg.contains(el) && el.matches(FIELD);
      sync();
    };
    const onFocusOut = () => setTimeout(onFocus);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    io.observe(reg);
    document.addEventListener("focusin", onFocus);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      io.disconnect();
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);
  return hidden;
}

/* Phone and the shared WhatsApp contact. */
export function Fab() {
  const { t } = useLang();
  const hidden = useTypingInRegister();

  return (
    <div className={hidden ? "fab is-hidden" : "fab"}>
      <a className="fab-call" href={SAVILLS_CONTACT.phoneHref} data-cta="call" aria-label={t("dr.call")}>
        <Icon name="phone" />
      </a>
      <WhatsAppLink className="fab-whatsapp" cta="whatsapp_floating" />
    </div>
  );
}
