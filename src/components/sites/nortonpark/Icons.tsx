import { cx } from "./lib/dom";

/* Icon sprite copied from the source page (<svg><defs><symbol id="i-…">). */
export function IconSprite() {
  return (
    <svg width="0" height="0" className="np-sprite" aria-hidden="true" focusable="false">
      <defs>
        <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M4 12h15M13 6l6 6-6 6" /></symbol>
        <symbol id="i-up" viewBox="0 0 24 24"><path d="M12 19V5M6 11l6-6 6 6" /></symbol>
        <symbol id="i-down" viewBox="0 0 24 24"><path d="M12 5v14M6 13l6 6 6-6" /></symbol>
        <symbol id="i-prev" viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" /></symbol>
        <symbol id="i-next" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" /></symbol>
        <symbol id="i-phone" viewBox="0 0 24 24"><path d="M15.7 21C7.6 21 3 16.4 3 8.3 3 6.5 4.5 5 6.3 5h1.2c.6 0 1.1.4 1.2 1l.7 2.8c.1.5-.1 1-.5 1.3l-1 .7a10.7 10.7 0 0 0 4.3 4.3l.7-1c.3-.4.8-.6 1.3-.5l2.8.7c.6.1 1 .6 1 1.2v1.2c0 1.8-1.5 3.3-3.3 3.3Z" /></symbol>
        <symbol id="i-zalo" viewBox="0 0 24 24"><path d="M20 11.3c0 3.9-3.6 7.1-8 7.1-.9 0-1.8-.1-2.6-.4L5 19.5l1.1-3A6.7 6.7 0 0 1 4 11.3C4 7.4 7.6 4.2 12 4.2s8 3.2 8 7.1Z" /><path d="M9.6 9.4h4l-4 5.1h4.2" /></symbol>
        <symbol id="i-mail" viewBox="0 0 24 24"><path d="M3 6h18v12H3zM3 7l9 6 9-6" /></symbol>
        <symbol id="i-bot" viewBox="0 0 24 24"><rect x="4.6" y="8.2" width="14.8" height="10.8" rx="3.6" /><path d="M12 8.2V5.4" /><circle cx="12" cy="4.3" r="1.1" /><path d="M2.6 12.4v3.2M21.4 12.4v3.2" /><circle cx="9.3" cy="13.1" r="1.15" fill="currentColor" stroke="none" /><circle cx="14.7" cy="13.1" r="1.15" fill="currentColor" stroke="none" /><path d="M10 16.3h4" /></symbol>
        <symbol id="i-fb" viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="4.5" /><path d="M15.6 8.2h-1.5c-1.2 0-1.9.7-1.9 1.9V20.5M10 12.7h5" /></symbol>
        <symbol id="i-close" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" /></symbol>
        <symbol id="i-expand" viewBox="0 0 24 24"><path d="M9 4H4v5M15 4h5v5M15 20h5v-5M9 20H4v-5" /></symbol>
        <symbol id="i-tower" viewBox="0 0 24 24"><path d="M4 21V9l5-3v15M14 21V4l6 3v14M4 21h16M8 12h1M8 16h1M17 10h1M17 14h1M17 18h1" /></symbol>
        <symbol id="i-leaf" viewBox="0 0 24 24"><path d="M5 20c0-8 5-13 14-14 0 9-4 13-9 13-2 0-3.5-.6-5 1Z" /><path d="M5 20c2-5 5-8 9-10" /></symbol>
        <symbol id="i-plan" viewBox="0 0 24 24"><path d="M3 5h18v14H3zM9 5v14M3 12h6M15 9h4M15 14h4" /></symbol>
        <symbol id="i-water" viewBox="0 0 24 24"><path d="M12 3c3.5 4 6 7 6 10a6 6 0 0 1-12 0c0-3 2.5-6 6-10Z" /><path d="M9.5 13.5c0 1.6 1.1 2.8 2.5 2.8" /></symbol>
        <symbol id="i-desk" viewBox="0 0 24 24"><path d="M3 8h18M4 8v11M20 8v11M8 8V5h8v3M8 13h8" /></symbol>
        <symbol id="i-park" viewBox="0 0 24 24"><path d="M12 15V21M7 15h10l-5-11-5 11ZM9 10h6" /></symbol>
        <symbol id="i-pin" viewBox="0 0 24 24"><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" /><circle cx="12" cy="10" r="2.6" /></symbol>
        <symbol id="i-mall" viewBox="0 0 24 24"><path d="M5 8h14l-1 12H6L5 8ZM9 8V6a3 3 0 0 1 6 0v2" /></symbol>
        <symbol id="i-check" viewBox="0 0 24 24"><path d="M4 12.5 9.5 18 20 6.5" /></symbol>
        <symbol id="i-chat" viewBox="0 0 24 24"><path d="M20 11.4c0 3.9-3.6 7-8 7-.9 0-1.8-.1-2.6-.4L5 19.4l1.1-3A6.6 6.6 0 0 1 4 11.4c0-3.9 3.6-7 8-7s8 3.1 8 7Z" /><circle cx="8.7" cy="11.5" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="11.5" r="1" fill="currentColor" stroke="none" /><circle cx="15.3" cy="11.5" r="1" fill="currentColor" stroke="none" /></symbol>
        <symbol id="i-360" viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="9.4" ry="5" /><path d="M6.6 8.3A9.4 9.4 0 0 1 12 6.6a9.4 9.4 0 0 1 5.4 1.7" /><path d="m15.6 5 2 1.6-2 1.6" /><circle cx="12" cy="12" r="1.7" /></symbol>
        <symbol id="i-calc" viewBox="0 0 24 24"><rect x="5" y="2.6" width="14" height="18.8" rx="2.3" /><rect x="7.3" y="5" width="9.4" height="4.2" rx="0.8" /><circle cx="8.4" cy="13.4" r="0.8" /><circle cx="12" cy="13.4" r="0.8" /><circle cx="15.6" cy="13.4" r="0.8" /><circle cx="8.4" cy="17.2" r="0.8" /><circle cx="12" cy="17.2" r="0.8" /><circle cx="15.6" cy="17.2" r="0.8" /></symbol>
      </defs>
    </svg>
  );
}

export type IconName =
  | "arrow" | "up" | "down" | "prev" | "next" | "phone" | "zalo" | "mail" | "bot" | "fb" | "close"
  | "expand" | "tower" | "leaf" | "plan" | "water" | "desk" | "park" | "pin" | "mall" | "check"
  | "chat" | "360" | "calc";

export function Icon({ name, small, hidden }: { name: IconName; small?: boolean; hidden?: boolean }) {
  return (
    <svg className={cx("ic", small && "ic-s")} aria-hidden={hidden ? "true" : undefined}>
      <use href={`#i-${name}`} />
    </svg>
  );
}
