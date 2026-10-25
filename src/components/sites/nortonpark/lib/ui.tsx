"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

/* Cross-section UI state: the drawer and chat panel talk to each other, and the
   Facts type links pick a tab in Residences. */
interface UIValue {
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  chatOpen: boolean;
  openChat: (trigger?: HTMLElement | null) => void;
  closeChat: () => void;
  chatReturnFocus: React.RefObject<HTMLElement | null>;
  resiIndex: number;
  setResiIndex: (i: number) => void;
}

const UIContext = createContext<UIValue | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [resiIndex, setResiIndex] = useState(0);
  const chatReturnFocus = useRef<HTMLElement | null>(null);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const openChat = useCallback(
    (trigger?: HTMLElement | null) => {
      chatReturnFocus.current = trigger ?? (document.activeElement as HTMLElement | null);
      /* Opening chat from the drawer closes the drawer and returns focus to the burger. */
      if (drawerOpen) {
        setDrawerOpen(false);
        chatReturnFocus.current = document.getElementById("burger");
      }
      setChatOpen(true);
    },
    [drawerOpen],
  );
  const closeChat = useCallback(() => setChatOpen(false), []);

  const value = useMemo(
    () => ({ drawerOpen, openDrawer, closeDrawer, chatOpen, openChat, closeChat, chatReturnFocus, resiIndex, setResiIndex }),
    [drawerOpen, openDrawer, closeDrawer, chatOpen, openChat, closeChat, resiIndex],
  );
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const v = useContext(UIContext);
  if (!v) throw new Error("useUI must be used inside <UIProvider>");
  return v;
}
