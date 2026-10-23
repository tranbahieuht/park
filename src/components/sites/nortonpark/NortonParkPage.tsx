"use client";

import { useEffect } from "react";
import { IconSprite } from "./Icons";
import { push } from "./lib/dom";
import { LangProvider } from "./lib/i18n";
import { useMotion } from "./lib/motion";
import { UIProvider } from "./lib/ui";
import { useUtm } from "./lib/useUtm";
import { ChatWidget } from "./overlays/ChatWidget";
import { Drawer } from "./overlays/Drawer";
import { Fab } from "./overlays/Fab";
import { LegalDoc } from "./overlays/LegalDoc";
import { Lightbox } from "./overlays/Lightbox";
import { Popup } from "./overlays/Popup";
import { Blocks } from "./sections/Blocks";
import { Calc } from "./sections/Calc";
import { DesignStory } from "./sections/DesignStory";
import { Developer } from "./sections/Developer";
import { Facts } from "./sections/Facts";
import { Footer } from "./sections/Footer";
import { Hero } from "./sections/Hero";
import { LandscapeStory } from "./sections/LandscapeStory";
import { Lifestyle } from "./sections/Lifestyle";
import { LocationMap } from "./sections/LocationMap";
import { Nav } from "./sections/Nav";
import { News } from "./sections/News";
import { Position } from "./sections/Position";
import { Register } from "./sections/Register";
import { Residences } from "./sections/Residences";
import { Story } from "./sections/Story";

/* Source content-protection.js: no context menu, image drag, text selection
   or copy inside marketing sections; forms, links and contact rows stay usable. */
const EXEMPT =
  "input,textarea,select,button,a,[contenteditable],form,#npChatContainer,.np-image-dialog,.ldoc,#register,#quote,.info-row,.f-ct,.pop-info,[data-legal],[data-protection-exempt]";
const EXEMPT_CONTROLS =
  "input,textarea,select,button,a,[contenteditable],form,#npChatContainer,.np-image-dialog,.ldoc,.info-row,.f-ct,.pop-info,[data-legal],[data-protection-exempt]";

function useContentProtection() {
  useEffect(() => {
    const element = (node: Node | null | undefined) => (node?.nodeType === 1 ? (node as Element) : node?.parentElement ?? null);
    const protectedTarget = (node: Node | null | undefined) => {
      const target = element(node);
      if (!target || target.closest(EXEMPT_CONTROLS)) return false;
      if (target.closest(".reg-bg.np-protected")) return true;
      return !target.closest(EXEMPT) && !!target.closest(".np-protected");
    };
    document
      .querySelectorAll("main section:not(#register):not(#quote),#lightbox,.reg-bg")
      .forEach((el) => el.classList.add("np-protected"));
    const onContext = (e: Event) => {
      if (protectedTarget(e.target as Node)) e.preventDefault();
    };
    const onDrag = (e: Event) => {
      if (element(e.target as Node)?.closest("img,svg") && protectedTarget(e.target as Node)) e.preventDefault();
    };
    const onSelect = (e: Event) => {
      if (protectedTarget(e.target as Node)) e.preventDefault();
    };
    const onCopy = (e: ClipboardEvent) => {
      if (element(document.activeElement)?.closest(EXEMPT)) return;
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed && (protectedTarget(sel.anchorNode) || protectedTarget(sel.focusNode))) e.preventDefault();
    };
    document.addEventListener("contextmenu", onContext);
    document.addEventListener("dragstart", onDrag);
    document.addEventListener("selectstart", onSelect);
    document.addEventListener("copy", onCopy);
    return () => {
      document.removeEventListener("contextmenu", onContext);
      document.removeEventListener("dragstart", onDrag);
      document.removeEventListener("selectstart", onSelect);
      document.removeEventListener("copy", onCopy);
    };
  }, []);
}

/** dataLayer cta_click for every element carrying data-cta. */
function useCtaTracking() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.("[data-cta]");
      if (el) push("cta_click", { cta: el.getAttribute("data-cta") });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
}

function PageBody() {
  useMotion();
  useContentProtection();
  useCtaTracking();
  useUtm();
  return (
    <>
      <IconSprite />
      <Nav />
      <main id="top">
        <Hero />
        <DesignStory />
        <LandscapeStory />
        <Story />
        <Facts />
        <LocationMap />
        <Position />
        <Lifestyle />
        <Blocks />
        <Residences />
        <News />
        <Register />
        <Developer />
        <Calc />
      </main>
      <Footer />
      <Fab />
      <Lightbox />
      <Popup />
      <Drawer />
      <LegalDoc />
      <ChatWidget />
    </>
  );
}

export function NortonParkPage() {
  return (
    <LangProvider>
      <UIProvider>
        <PageBody />
      </UIProvider>
    </LangProvider>
  );
}
