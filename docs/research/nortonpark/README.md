# Norton Park clone — page brief

Source: https://www.nortonpark.com.vn/ (single hand-written static page: `index.html` + `css/*.css` + `js/*.js`, Vercel).
Captured 2026-10-23.

## Route map

| Source | Local | Owner |
|---|---|---|
| `/` | `/` (`src/app/page.tsx`) | `src/components/sites/nortonpark/NortonParkPage.tsx` |
| `/assets/map/location-map.html` (iframe widget) | `public/sites/nortonpark/assets/map/location-map.html` | static asset, embedded by `sections/LocationMap.tsx` |
| `/calculator/`, `/tin-tuc/`, `360.nortonpark.com.vn` | not cloned; links point to the live site | — |

## Structure

- `data/` — generated from the source: `i18n.ts` (VI from the HTML `data-i18n` innerHTML, EN from `page.js`), `content.ts` (amenities, residences, news, team), `legal.ts` (six legal documents), `chat-copy.ts`.
- `styles/` — the source stylesheets, unlayered, loaded after Tailwind (no preflight). `clone.css` holds two small additions.
- `sections/` — one component per source section, same markup/classes as the source.
- `overlays/` — floating buttons, lead popup, drawer, legal popup, chat panel, lightbox.
- `lib/` — language context, cross-section UI state, motion system, DOM helpers.

## Section order (desktop "Screen Lock": ≥1041×600, each section 100dvh, `scroll-snap-type: y mandatory`)

1. Hero (dark nav) · 2. Design story · 3. Landscape story · 4. Storytelling / three "trạm sạc" cards · 5. Facts & figures (count-up) ·
6. Location map (iframe) · 7. Position (masterplan, split/stack by width) · 8. Lifestyle carousel · 9. Plots B & C ·
10. Residences (9 tabs, 2 collections) · 11. News (3/2/1 per page) · 12. Register form (dark nav) · 13. Developer · 14. Price calculator teaser · Footer (FAQ, legal).

Root font-size scales with viewport (`clamp(16px, .62vw + 13.7px, 19px)`, vmin-based in Screen Lock); every size is rem.
Fonts: Norton Seasons (display), Norton Futura (labels), Norton Gotham (body) — the source's own WOFF2 files.

## Behaviors reproduced

- Nav turns solid when its midline leaves a `data-nav="dark"` section.
- VI/EN switch: all strings, document title, number format (1.286 ↔ 1,286), calculator links get `lang=en`.
- Entrance motion (page.js §16): per-section on desktop, per-element on narrow screens, first time only; `data-mo` is in the markup so nothing flashes before hydration.
- Facts count-up (1.4 s easeOutCubic) at 60% visibility, re-run after a language switch.
- Storytelling cards shrink (`--cw`) until they fit the locked height; titles stack together.
- Lifestyle: 3-copy infinite track, drag/swipe with snap, horizontal wheel, arrow keys, dots (shortest path), click neighbour.
- Residences tabs (arrow keys), two-level plans for Duplex / Garden duplex / Podium Shop, garden footnote; Facts type links pick the tab.
- News paging + touch swipe; "Xem tất cả tin tức" locked as on the source.
- Two-step register form + popup form (5 s after load, retried while blocked) with the source validation messages.
- Legal popup from any `data-legal` element and from direct hashes (`/#chinh-sach-bao-mat` …).
- Drawer (focus trap, Esc, scroll lock), floating buttons, back-to-top, content protection, UTM → hidden inputs, `dataLayer` events.

## Deliberate deviations

- **Lead forms do not submit anywhere.** The source posts to its `/api/lead` + Meta CAPI; the clone validates, pushes `generate_lead` to `dataLayer`, stores `np_lead_sent` and shows the success state.
- **Chat panel is UI only.** The assistant runs on the source's server (`/api/chat`). The clone shows the greeting and quick questions; a sent question gets the widget's own "could not complete" reply plus Zalo OA / hotline links, status "Not connected".
- **No GTM, JSON-LD, canonical or Facebook domain verification** in the head.
- **CSS fixes needed for the bundler** (`styles/page.css`): a stray `}` that browsers fold into the next selector is commented out together with the rule browsers drop; one `backdrop-filter` / `-webkit-backdrop-filter` pair was reordered because Lightning CSS otherwise kept only the prefixed one.

## Verification

Screenshots: `source/`, `clone/`, side-by-side sheets in `compare/`.
Geometry (page height, every section offset, ~30 key element boxes) matched the source exactly at 375×812, 768×1024, 1280×640, 1440×900, 1920×1080 and 2560×1440, in dev and in the production build.
