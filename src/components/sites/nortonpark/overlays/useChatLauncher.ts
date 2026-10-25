"use client";

import { useCallback } from "react";
import { push } from "../lib/dom";
import { useUI } from "../lib/ui";

/** Click handler for every [data-chat] launcher (floating button, drawer). */
export function useChatLauncher() {
  const { chatOpen, openChat } = useUI();
  const launch = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      const el = e.currentTarget;
      const from = el.getAttribute("data-cta") || "";
      push("chat_open", { from });
      document.dispatchEvent(new CustomEvent("np:chat-open", { detail: { from } }));
      openChat(el);
    },
    [openChat],
  );
  return { chatOpen, launch };
}
