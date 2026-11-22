# Aspect Ratio Canvas theme

V2 editor follow-up (local, 2026-11-16): use one 268px left inspector rail on desktop and put it below the canvas at widths below 860px. Keep one empty-stage upload entry, loaded Replace/Remove, one output-size summary and no duplicate source/corner dimensions. Empty placement and unavailable image-copy actions use the existing ui-sdk disabled state. Background annotations use the same canvas interaction and export styling as annotations over the source. Evidence: `../reports/2026-11-16/aspectratio-feedback-fix/`.

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

## Make image square (2026-11-07)
Square preview stage uses the neutral muted surface and muted-foreground edge from the image cards. Brand appears only as range `accent-color` and the solid Download button (dark text per the solid-button rule). Errors use `destructive`. Scoped `.sq-*` selectors in `src/styles.css`.

Canvas interaction follow-up (2026-11-11, local): Mode reads Crop, Pad. Crop supports pointer-anchored modifier-wheel zoom and direct dragging; keyboard focus has an inset ring using the existing ring token. Keep the existing controls and add no shortcut legend or explanatory text.

Preview styling correction (2026-11-11, local): The left preview stage uses square corners in empty, Pad and Crop states. Crop / Pad retains its original pill shape. Enabled mode options use a pointer cursor; pending export retains the disabled cursor. Keep the existing size, colors and selection state.

## Image tool navigation (2026-11-11, local)
Use one compact text navigation tier: Image, Calculator, Video, Social Media and Ultrawide. Image discloses Image ratio and Make square; Social Media discloses the overview and existing platform tools. Current sections use a neutral underline, with the exact page selected inside its disclosure. Remove the permanent child row, orange navigation icons and filled top-level pills. Below 600px, one current-tool disclosure exposes all destinations in grouped, scrollable links. Preserve 44px link targets, visible focus, native disclosure semantics and theme tokens. This supersedes the earlier two-row Image navigation candidate. No explanatory copy is added.

## Social image sizes (2026-11-11, local review)
Keep the four-row image table separate from the existing video destinations. Specifications and sources stays collapsed by default; its native summary includes a small chevron that rotates when expanded. Preserve the concise table, source text and historical checked date. Local review evidence: `../reports/2026-11-11/task29-local-review/`.

## Browser identity
`public/favicon.svg` retains the orange bar and dark horizontal frame, with a fixed pure-white circular backplate and a pixel-aligned 48-unit grid for small sizes. Search and browser icons use the same appearance in light and dark environments. PNG fallbacks are 96/192px, the touch icon is 180px, and the ICO includes 16/32/48/64/96/128/256px frames. Root head links declare actual dimensions; keep their URLs stable after this release. `public/brand-mark.svg` preserves the original adaptive, transparent header mark for the guide; the calculator header keeps its existing inline geometry. Local acceptance: `verification/search-appearance-20261027/README.md`. These assets are not proof of Google cache refresh.

## General ratio presets
Use a three-column, three-row selector with a thumbnail, ratio and concise use label per button. Preserve the separate Ultrawide source layout. Behavior and acceptance: [component contract](src/components/README.md#general-preset-contract-2026-10-23).

## Font and mobile readability candidate — 2026-10-27

The original Bricolage Grotesque, Instrument Sans and JetBrains Mono Latin fonts are now served from public/fonts with their OFL licenses; retain swap display and the existing font-family tokens. Common UI glyph subsets are embedded in production CSS; original fonts supply all remaining glyphs through complementary unicode ranges. Separate font preloads are removed. Glyph shapes and variable weight/optical-size ranges are preserved. Small result captions use the theme foreground to meet contrast requirements. On narrow screens, media source dimensions occupy two equal columns and the ratio/copy row spans both. Local verification: verification/search-appearance-20261027/README.md.


## Mobile first-render delivery — 2026-10-27

Production uses TanStack Start manifest-managed inline CSS and Vite inline font URLs. Preserve all used CSS rules, original fallback WOFF2 files, theme tokens and calculator behavior. Exclude unused component-library/test/documentation utility candidates; do not exclude classes used by product routes. Generate UI font subsets with scripts/build-font-subsets.py; retain full original glyph coverage through fallback faces. Initial 390px screenshots matched the prior release pixel-for-pixel. The tradeoff is a larger initial HTML document in exchange for removing CSS/font request chains; SPA navigation retains the styles. Evidence: `verification/mobile-performance-20261027/README.md`.

## Calculator menu and image editor (2026-11-14, local)

The Calculator section uses the same native disclosure, popover, 44px menu links and current-state styling as Image and Social Media; no navigation tier is added. The image ratio editor keeps the square-corner stage (`.ar-stage`, height capped at `min(30rem, 68svh)`), uses the existing `seg` segmented control for Framing (Fit whole image / Crop to fill; full-width, 44px buttons, `aria-pressed` with the standard foreground fill for the selected state, ring-token focus outline), outlined pill buttons for Replace and Remove, and uses round 44px Zoom out/in buttons beside a brand-accented range slider. After load, the dashed upload area becomes a compact `.ar-file-row` using the same border and surface tokens. No helper or hint text is added.

Unified editor (2026-11-14, local): Make image square uses the same editor surface as Change image aspect ratio. That covers the square-corner `.ar-stage` (here 1:1), Framing segmented control, round zoom buttons and slider, compact `.ar-file-row`, and existing upload, Background, Format and Download styling. The former Crop/Pad pill, position sliders and Reset crop link are retired from the UI. `.sq-stage` and `.sq-mode` rules remain in CSS but are unused.


## Screenshot Studio (2026-11-14, local)

Scoped `.ss-*` rules in `src/styles.css` style `/screenshot-beautifier` as a pure white / monochrome CleanShot & Linear-inspired studio shell without altering `--brand` on other routes. The top toolbar uses crisp 18×18 icon-only buttons (`34×34 px`) wrapped in `.ss-tip-wrap` for instant floating `.ss-tooltip` pills (even when disabled), custom `.ss-select-btn` / `.ss-menu` popovers (zero native OS `<select>`), monochrome active states (`#18181B` light / `#FAFAFA` dark), and a monochrome `[Download icon] + Download` primary button; the collapsible `238 px` left Background sidebar (Gradients, Wallpapers, Blurred, 2×8 Plain color with dark-mode inner rings) stacks below the canvas on `< 768 px` screens so 390px mobile retains zero horizontal overflow. Evidence: `../reports/2026-11-14/screenshot-studio/README.md`.

## Image page outputs and reference content (2026-11-14, local)

Width and Height on the Image page are outputs, not inputs: `.mp-readout-field` gives them the border token, a 3% foreground tint on the card surface and a default cursor, with no hover change. They stay focusable so the values can be selected. The common-sizes table is capped at `max-w-3xl`, uses three fixed columns that wrap at 390px instead of scrolling, and keeps ratios in the mono `num` style. Questions use a two-column grid on desktop with rule separators; answer links use foreground text with an underline, not the brand color. No new colors, badges or helper text in the tool area. Evidence: `../reports/2026-11-14/imageaspectratio-home-audit/README.md`.
