"use client";

import { useEffect, useState } from "react";
import { Icon } from "../Icons";
import { CHAT_COPY } from "../data/chat-copy";
import { calcHref, cx, reduceMotion } from "../lib/dom";
import { useLang } from "../lib/i18n";
import { useChatLauncher } from "./useChatLauncher";

/* Floating actions on the right edge: call, Zalo, chat bot, calculator, back to top. */
export function Fab() {
  const { lang, html } = useLang();
  const { chatOpen, launch } = useChatLauncher();
  const [showTop, setShowTop] = useState(false);

  /* "Back to top" appears once the hero has left the viewport. */
  useEffect(() => {
    const hero = document.querySelector(".hero");
    if (!hero) return;
    const o = new IntersectionObserver((es) => setShowTop(!es[0].isIntersecting), { threshold: 0 });
    o.observe(hero);
    return () => o.disconnect();
  }, []);

  return (
    <div className="fab">
      <a className="fab-call" href="tel:+84938609023" data-cta="call" aria-label="Gọi tư vấn">
        <Icon name="phone" />
      </a>
      <a className="fab-zl" href="https://zalo.me/2522093664370221137" target="_blank" rel="noopener" data-cta="zalo" aria-label="Chat Zalo Norton Park" title="Chat Zalo">
        <Icon name="zalo" />
      </a>
      <button
        type="button"
        className="fab-zalo fab-chat"
        data-chat=""
        data-cta="chat"
        aria-controls="npChatPopup"
        aria-expanded={chatOpen}
        aria-label={CHAT_COPY[lang].open}
        onClick={launch}
      >
        <Icon name="bot" hidden />
        <span className="fab-tip">
          <b {...html("chat.label")} />
          <small {...html("chat.sub")} />
        </span>
      </button>
      <a className="fab-calc" data-calc="" href={calcHref("", lang)} data-cta="calc_fab" aria-label="Xem bảng tính">
        <Icon name="calc" />
      </a>
      <button
        type="button"
        className={cx("fab-top", showTop && "on")}
        id="toTop"
        aria-label="Lên đầu trang"
        onClick={() => document.getElementById("top")?.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth" })}
      >
        <Icon name="up" />
      </button>
    </div>
  );
}
