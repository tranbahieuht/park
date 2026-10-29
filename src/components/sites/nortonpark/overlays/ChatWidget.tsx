"use client";

import { SAVILLS_CONTACT } from "../data/contact";

import { useCallback, useEffect, useRef, useState } from "react";
import { CHAT_COPY } from "../data/chat-copy";
import { trapTab } from "../lib/dom";
import { useLang } from "../lib/i18n";
import { useUI } from "../lib/ui";

const MAX_INPUT_CHARS = 500;
const OA_URL = SAVILLS_CONTACT.zaloUrl;

/* Greeting served by the source's /api/public-config. */
const GREETING = {
  vi: "Mình là trợ lý AI về Norton Park. Nội dung dựa trên dữ liệu dự án hiện có, có thể có sai sót hoặc chưa cập nhật; thông tin giao dịch cần đối chiếu tài liệu được phê duyệt và hợp đồng.",
  en: "I am an AI assistant for Norton Park. My answers use the available project data and may contain errors or be out of date; transaction details need to be checked against approved documents and the contract.",
};

interface Msg {
  id: number;
  role: "bot" | "user";
  text: string;
  time: string;
  /** Offer Zalo OA / hotline links under this bubble. */
  contact?: boolean;
}

const now = () => {
  const d = new Date();
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
};

/* Chat panel UI from the source widget. The assistant itself runs on the
   source's server (/api/chat), which this clone does not call: the panel shows
   the greeting and quick questions, and a sent question gets the widget's own
   "could not complete the request" reply plus the Zalo / hotline links. */
export function ChatWidget() {
  const { lang } = useLang();
  const { chatOpen, closeChat, chatReturnFocus } = useUI();
  const copy = CHAT_COPY[lang];
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [chips, setChips] = useState(false);
  const [typing, setTyping] = useState(false);
  const [value, setValue] = useState("");
  const popupRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);
  const timer = useRef(0);
  const wasOpen = useRef(false);

  const reset = useCallback(() => {
    clearTimeout(timer.current);
    setTyping(false);
    setMsgs([{ id: ++idRef.current, role: "bot", text: GREETING[lang], time: now() }]);
    setChips(true);
  }, [lang]);

  /* Launchers fire np:chat-open (as on the source); the first one loads the conversation. */
  const loaded = msgs.length > 0;
  useEffect(() => {
    const onOpen = () => {
      if (!loaded) reset();
    };
    document.addEventListener("np:chat-open", onOpen);
    return () => document.removeEventListener("np:chat-open", onOpen);
  }, [loaded, reset]);

  /* Focus moves into the panel while open and back to the launcher on close. */
  useEffect(() => {
    if (chatOpen) {
      wasOpen.current = true;
      const f = () => inputRef.current?.focus();
      requestAnimationFrame(() => requestAnimationFrame(f));
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          closeChat();
        }
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      if (chatReturnFocus.current?.isConnected) chatReturnFocus.current.focus();
    }
  }, [chatOpen, closeChat, chatReturnFocus]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, typing, chips]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const send = (text?: string) => {
    if (typing) return;
    const userText = (text ?? value).trim();
    if (!userText) return;
    if (userText.length > MAX_INPUT_CHARS) {
      setMsgs((m) => [...m, { id: ++idRef.current, role: "bot", text: copy.limit, time: now() }]);
      return;
    }
    setChips(false);
    setMsgs((m) => [...m, { id: ++idRef.current, role: "user", text: userText, time: now() }]);
    setValue("");
    setTyping(true);
    timer.current = window.setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { id: ++idRef.current, role: "bot", text: copy.error + " " + copy.retry, time: now(), contact: true }]);
    }, 700);
  };

  return (
    <div id="npChatContainer">
      <div className={chatOpen ? "np-chat-backdrop is-open" : "np-chat-backdrop"} id="npChatBackdrop" onClick={closeChat}></div>
      <div
        ref={popupRef}
        className={chatOpen ? "np-chat-popup is-open" : "np-chat-popup"}
        id="npChatPopup"
        role="dialog"
        aria-label={copy.dialog}
        aria-hidden={!chatOpen}
        aria-modal="true"
        tabIndex={-1}
        inert={!chatOpen}
        onKeyDown={(e) => trapTab(e.nativeEvent, popupRef.current, 'button, input, a[href], textarea, select, [tabindex="0"]')}
      >
        <div className="np-chat-header">
          <div className="np-chat-header-profile">
            <div className="np-chat-avatar">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 1.82.49 3.53 1.35 5L2 22l5.13-1.32C8.58 21.52 10.24 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
              </svg>
            </div>
            <div className="np-chat-title-group">
              <h3>Norton Park AI</h3>
              <div className="np-chat-status-text">
                <span className="np-chat-callout-dot"></span>
                <span id="npChatAvailability">{copy.disconnected}</span>
              </div>
            </div>
          </div>
          <button type="button" className="np-chat-reset" id="npChatResetBtn" title={copy.reset} onClick={reset}>
            {copy.newChat}
          </button>
          <button type="button" className="np-chat-header-close" id="npChatCloseBtn" aria-label={copy.close} onClick={closeChat}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="np-chat-messages" id="npChatMessages" ref={listRef}>
          {msgs.map((m) => (
            <div key={m.id} className={`np-msg np-msg--${m.role}`}>
              <div className="np-msg-bubble">
                {m.text.split("\n").map((line, i) => (
                  <span key={i}>
                    {i ? <br /> : null}
                    {line}
                  </span>
                ))}
              </div>
              {m.contact ? (
                <div className="np-quick-actions">
                  <a className="np-quick-act-btn np-quick-act-btn--zalo" href={OA_URL} target="_blank" rel="noopener">
                    {copy.oa}
                  </a>
                  <a className="np-quick-act-btn" href={SAVILLS_CONTACT.phoneHref}>
                    {copy.hotline}
                  </a>
                </div>
              ) : null}
              <div className="np-msg-time">{m.time}</div>
            </div>
          ))}
          {chips ? (
            <div className="np-quick-chips">
              {copy.chips.map((c) => (
                <button key={c} type="button" className="np-chip" onClick={() => send(c)}>
                  {c}
                </button>
              ))}
            </div>
          ) : null}
          {typing ? (
            <div className="np-typing-indicator">
              <span className="np-typing-dot"></span>
              <span className="np-typing-dot"></span>
              <span className="np-typing-dot"></span>
            </div>
          ) : null}
        </div>

        <div className="np-chat-footer">
          <div className="np-chat-input-row">
            <input
              ref={inputRef}
              type="text"
              id="npChatInput"
              aria-label={copy.placeholder}
              className="np-chat-input"
              placeholder={copy.placeholder}
              maxLength={MAX_INPUT_CHARS}
              autoComplete="off"
              value={value}
              disabled={typing}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            <button type="button" id="npChatSendBtn" className="np-chat-send-btn" aria-label={copy.send} disabled={typing} onClick={() => send()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
          <div className="np-chat-footer-info">
            <span>{copy.footer}</span>
            <span id="npCharCounter">
              {value.length}/{MAX_INPUT_CHARS}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
