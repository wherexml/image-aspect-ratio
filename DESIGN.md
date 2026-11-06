# Aspect Ratio Canvas theme

Single brand source: `--brand: #D96A1B` in `src/styles.css`.
Both light and dark modes alias primary, frame, signal and ring to this token.
Use `color-mix` with this same token for subtle surfaces; do not add independent orange hues.
Solid brand buttons use dark text. Error colors and neutral text remain semantic.
The logo uses the opaque brand color; hover uses an outline rather than brightness shifts.

Verification: `verification/theme-results.json` records computed colors in both themes and a 390px overflow check. `verification/theme-build.log` records the production build. Screenshot capture timed out, so no screenshot-based visual acceptance is claimed.

Detailed feature comparison: `../reports/2026-10-16/canvas-competitor-comparison/report.html`.

## Media previews (2026-10-17)
MediaPreview uses neutral dotted stages, hatched empty areas, subtle brand-tinted source frames, neutral frame edges and monitor/phone bezels. Brand remains --brand. Keep .mp-* selectors scoped; stage height stays256px. Readouts distinguish exact fit, empty-space direction and crop direction. Fit reports frame coverage; Fill reports source retained. No unlabeled progress meter. Evidence: verification/media-design/report.html.

Theme follow-up: light stage and result surfaces use light neutral tokens with foreground text; dark tokens remain dark. Decorative orange corner pseudo-elements removed from all media previews. Browser checks and screenshots: `verification/theme-followup/`.

Video clarity: retain realistic monitor/phone shells with narrow 5px bezels, metallic monitor stand, phone camera island and home indicator. Screen aperture preserves the exact target ratio independently of the shell. Video stage stays 304px high; monitor screen is up to 400px wide and phone screen 252px tall. No exterior crop ghosts. Empty screen areas carry labels; exact-fit messaging uses rational equality. Evidence: `verification/device-preview/README.md`.

Copy action uses theme foreground as its background and theme background as its text/icon color for strong contrast in both themes. This neutral control replaces the earlier solid orange Copy button. Browser evidence: `verification/photo-flow/report.html`.

## Browser identity
`public/favicon.svg` retains the orange bar and dark horizontal frame, with a fixed pure-white circular backplate and a pixel-aligned 48-unit grid for small sizes. Search and browser icons use the same appearance in light and dark environments. PNG fallbacks are 96/192px, the touch icon is 180px, and the ICO includes 16/32/48/64/96/128/256px frames. Root head links declare actual dimensions; keep their URLs stable after this release. `public/brand-mark.svg` preserves the original adaptive, transparent header mark for the guide; the calculator header keeps its existing inline geometry. Local acceptance: `verification/search-appearance-20261027/README.md`. These assets are not proof of Google cache refresh.

## General ratio presets
Use a three-column, three-row selector with a thumbnail, ratio and concise use label per button. Preserve the separate Ultrawide source layout. Behavior and acceptance: [component contract](src/components/README.md#general-preset-contract-2026-10-23).

## Font and mobile readability candidate — 2026-10-27

The original Bricolage Grotesque, Instrument Sans and JetBrains Mono Latin fonts are now served from public/fonts with their OFL licenses; retain swap display and the existing font-family tokens. Common UI glyph subsets are embedded in production CSS; original fonts supply all remaining glyphs through complementary unicode ranges. Separate font preloads are removed. Glyph shapes and variable weight/optical-size ranges are preserved. Small result captions use the theme foreground to meet contrast requirements. On narrow screens, media source dimensions occupy two equal columns and the ratio/copy row spans both. Local verification: verification/search-appearance-20261027/README.md.


## Mobile first-render delivery — 2026-10-27

Production uses TanStack Start manifest-managed inline CSS and Vite inline font URLs. Preserve all used CSS rules, original fallback WOFF2 files, theme tokens and calculator behavior. Exclude unused component-library/test/documentation utility candidates; do not exclude classes used by product routes. Generate UI font subsets with scripts/build-font-subsets.py; retain full original glyph coverage through fallback faces. Initial 390px screenshots matched the prior release pixel-for-pixel. The tradeoff is a larger initial HTML document in exchange for removing CSS/font request chains; SPA navigation retains the styles. Evidence: `verification/mobile-performance-20261027/README.md`.
