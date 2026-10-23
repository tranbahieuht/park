"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { EN, VI, type Dict, type Lang } from "../data/i18n";
import { push } from "./dom";

const DICTS: Record<Lang, Dict> = { vi: VI, en: EN };

const TITLE: Record<Lang, string> = {
  vi: "Norton Park — Gamuda Land | Toạ độ xứng tầm tại Bình Dương",
  en: "Norton Park | A Gamuda Land Community",
};

interface LangValue {
  lang: Lang;
  setLang: (next: Lang) => void;
  /** Translated string (may contain markup, like the source innerHTML swap). */
  t: (key: string) => string;
  /** Spread onto an element to render a translated string as its innerHTML. */
  html: (key: string) => { dangerouslySetInnerHTML: { __html: string } };
}

const LangContext = createContext<LangValue | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("vi");

  const setLang = useCallback(
    (next: Lang) => {
      if (next === lang) return;
      setLangState(next);
      document.documentElement.lang = next;
      document.title = TITLE[next];
      push("language_change", { language: next });
    },
    [lang],
  );

  const value = useMemo<LangValue>(() => {
    const t = (key: string) => DICTS[lang][key] ?? VI[key] ?? "";
    return { lang, setLang, t, html: (key) => ({ dangerouslySetInnerHTML: { __html: t(key) } }) };
  }, [lang, setLang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const v = useContext(LangContext);
  if (!v) throw new Error("useLang must be used inside <LangProvider>");
  return v;
}
