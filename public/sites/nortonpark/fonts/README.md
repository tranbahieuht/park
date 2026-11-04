# Typography sources

- Playfair Display: https://github.com/google/fonts/tree/main/ofl/playfairdisplay
- Montserrat: https://github.com/google/fonts/tree/main/ofl/montserrat
- Both use the SIL Open Font License, included alongside the WOFF2 files.
  Playfair Display uses the original, unmodified Google Fonts WOFF2 binaries
  for Latin, Latin Extended and Vietnamese (including the Reserved Font Name).
  Source CSS: https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400..900&display=swap
  Montserrat is subset to Latin, Latin Extended, combining marks, Vietnamese,
  punctuation and currency symbols. Its family name is unchanged.
- Montserrat is the temporary geometric sans serif fallback requested in the brief.
  Existing Gotham and map SVN-Gotham files were copied from the source website
  (see `docs/research/nortonpark/asset-map.md`). No webfont licence or entitlement
  accompanies them. They are retained as assets but are not loaded.
- To activate Gotham, obtain licensed webfonts with Vietnamese glyphs, record the
  entitlement privately, add authorized `@font-face` rules to `typography.css`,
  replace Montserrat in `--font-body` and update the body preload in layout.tsx.

The Norton Park and Savills logos remain the original image assets.
