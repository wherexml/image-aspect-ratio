# Product specification

## Confirmed V2 editor feedback fixes (local, 2026-11-16)

All V2 inspectors use the same 268px left rail above 859px and follow the canvas below that breakpoint. Screenshot Studio uses this shared layout and retains its sidebar toggle. Empty image editors have one Choose image entry; the toolbar offers Replace only after decoding an image. The ratio/square editor keeps its output-width input and one Export canvas summary; source dimensions, the empty-frame size tag, duplicate derived height and the corner output badge are removed. Framing and Zoom require a decoded image. PNG copy is disabled when the current browser origin cannot provide image clipboard writes; Download remains usable on LAN HTTP.

Screenshot Studio annotations remain anchored to source-image coordinates, with editable bounds extended across the composed output. Arrows, lines, shapes, text, step badges, pixelation and spotlight can use the added background. Selection, dragging, resizing, keyboard movement, duplication and scale shortcuts use those same bounds. Crop remains restricted to the source image; crop/restore reprojects source annotations and background margins with Undo/Redo. Pixelation samples the rendered background and screenshot composition, and export uses the same render path without selection handles.

Failure cases and local acceptance: `../../reports/2026-11-16/aspectratio-feedback-fix/`. These changes are local only; no publication is authorized by this specification.

Current source contract, 2026-11-11. This document describes behavior to preserve; it is not a production release announcement. Dated module notes retain earlier evidence and are superseded where they conflict with this specification.

## Entry points

| Route | Workflow |
| --- | --- |
| `/` | Image: local upload, read-only decoded dimensions and exact ratio, Fit/Fill previews |
| `/calculator` | Manual Calculate size, Aspect ratio and Scale dimensions |
| `/16-9-aspect-ratio-calculator` | Known width or height → exact 16:9 counterpart in whole pixels, copy, reset, five applicable resolution examples |
| `/make-image-square` | Local photo → Pad or Crop → square PNG/JPEG download (1–4096 px) |
| `/change-image-aspect-ratio` | Local photo → 1:1, 4:5, 9:16 or 16:9 frame → continuous Fit/Fill/zoom/pan placement → PNG/JPEG download (each side 1–4096 px) |
| `/image-aspect-ratio` | Legacy compatibility redirect to `/` |
| `/video-aspect-ratio` | Existing editable video dimensions and numeric tools |
| `/ultrawide-aspect-ratio-calculator` | Exact screen-size ratios and strict 21:9 comparison |
| `/social-media` | Instagram, YouTube and TikTok link groups |
| Five social detail routes | Platform-specific dimension examples and exact calculations |
| Two educational guides | Aspect-ratio concepts and exact fractions versus rounded pixels |

Shared navigation orders Image, Calculator, Video, Social Media and Ultrawide. Logos return to `/`. Photo-inspection links target `/`; manual-calculation links target `/calculator`. Image is a disclosure containing real links to Image ratio (`/`) and Make square (`/make-image-square`) on every tool page. It is the selected section on those two routes, with exactly one current destination inside its disclosure. The desktop menu has one text row and no permanent child row. Below 600px, one current-tool disclosure contains all destination links, grouped by purpose. Disclosures close on navigation, outside pointer/focus and Escape; Escape returns focus to the trigger. Other tool entries are active only for their exact path; Social Media includes its child pages. Do not redirect `/` to the manual calculator. The legacy image path redirects with 308 on HTTP GET/HEAD, preserving its query; client routing also resolves it to Image.

## State and calculation

Image begins empty and has no manual numeric tools. Read-only dimensions, ratio/copy, Fit/Fill and four preview frames are always visible. Before selection, values stay blank, Copy is disabled, and a pale square generated placeholder demonstrates fitting. A successful local decode replaces the placeholder and fills the values. Replacing, removing or failing a file clears its displayed image results while retaining the placeholder layout; asynchronous stale reads cannot win. State is not promised to survive navigation or reload. Video's editable workflow is distinct and unchanged.

Manual modes retain independent target dimensions and known sides. Reset restores the established defaults; selecting a different presentation order must never redefine default state. BigInt fractions remain authoritative; floating-point approximations are for drawing only. Copy never substitutes a nearby common ratio or reports success after failure.

General presets run from narrow to wide, ten primary choices plus 2:1 in More. Social examples of the same ratio run small-to-large, comparisons last. Ultrawide uses ascending commercial sizes, followed by the 32:9 example and strict 21:9. Stable preset IDs/original indices connect selection to restoration. Details: [components](../src/components/README.md).

## Make image square (TASK-9, implemented 2026-11-07; released 2026-11-11)

One page produces a real file: choose, drop or paste one image, then choose Pad (whole photo on a solid background) or Crop (square region positioned with Zoom, Horizontal position, Vertical position, Reset crop and pointer drag). Output size is a whole number from 1 to 4096 (default 1080). Format is PNG or JPEG, and both fill the chosen background first, so JPEG alpha flattens to that color. There is no transparent output in this slice. Download is the only success path. It is disabled for invalid size, while reading, and while encoding. Input guards match Image (20 MB, 50 MP, decode required). Visible strings are the reviewed copy in the TASK-9 report folder. The route belongs to Image and is exposed through the Image navigation disclosure, the footer Tools & guides group and the Image page's related links. Details and limits: [components](../src/components/README.md#make-image-square-2026-11-07).

## Square canvas interactions (released 2026-11-11)

Mode buttons are ordered Crop, Pad; the existing Pad default is preserved. In Crop, Command/Control + wheel over the preview zooms around the pointer using the existing 1–10× bound (or the smaller source-pixel limit). Control-wheel trackpad pinch events follow the same path. The focused Crop preview also accepts Command/Control + plus/minus for centered zoom and Command/Control + 0 to reset the crop. Direct primary-pointer drag remains available. Normal wheel scrolling, Pad and empty previews keep their native behavior. Modifier gestures are consumed without editing while export is pending; an active pointer drag is not interrupted by another zoom gesture. Existing sliders and real file export use the same crop geometry. No instructional UI is added.

## Social image sizes (TASK-29, implemented 2026-11-07; released 2026-11-11)

The combined production release and independent acceptance are recorded in [deployment](deployment.md). Source guidance was rechecked on November 11; the accepted registry retains its November 7 checked date.

`/social-media` adds an "Image sizes" table (Placement, Dimensions, Ratio) below the existing platform link groups. It covers four image placements only: YouTube video thumbnail 3840 × 2160 (16:9), YouTube Shorts thumbnail 2160 × 3840 (9:16), Instagram feed photo (1080 px wide; 566–1440 px high; 1.91:1 to 3:4) and Instagram Reel cover 420 × 654 (exact 70:109). A native "Specifications and sources" disclosure holds the reviewed provenance, minimums, device-specific limits and caveats, with a checked date. Records live in `src/content/image-placements.ts` and keep recommendations, minimums, ranges, rounded labels and exact ratios as separate fields; unknown values are null. This is guidance: there are no new routes, no apply or download actions, and no changes to video calculators or their presets.

## Layout and content

Manual and social desktop tools place preview left and controls/results right; mobile places controls/results first. Image is a separate upload page, with no manual numeric-input modes. Its Image disclosure switches between two real image-tool routes. Preserve the single brand token, existing dark/light themes, English product content and uncluttered UI. No explanatory badges or status text are required by this specification.

## SEO, delivery and privacy

Every canonical route participates in SITE_PAGES; the legacy image redirect does not. Route titles, JSON-LD and canonical paths match the actual workflow. The site origin is an explicit public build setting, never inferred from request Host. With no configured origin, omit canonical identity URLs; noindex previews have empty sitemaps. Production indexability is a separate authorized release concern.

Framework-managed inline CSS and licensed local font subsets preserve initial rendering. Retain original fonts and licenses. Tool measurement sends categorical outcomes, not dimensions, filenames or image data. GEO relay credentials are runtime secrets, never public VITE settings. See [performance](performance.md), [measurement](tool-analytics.md) and [deployment history](deployment.md).

## Acceptance and release boundary

Record failure cases before changes; prefer repeatable browser E2E. Check direct/SPA routes, unique navigation activity, Image upload/Remove/error isolation, manual default/calculation/Reset, desktop/mobile geometry, affected related links and SSR/noindex behavior. Smoke-check existing Video, Ultrawide and Social tools after shared changes. Keep local screenshots, fixtures, logs and reports outside committed application inputs.

The latest local route acceptance recorded 36 browser assertions and 10 HTTP checks; its evidence resides in the parent SEO workspace under reports/2026-11-07/task51-home-image-routes. This is historical local evidence, not a clean-checkout or remote-CI result. A Git push, passing build or accepted preview does not authorize deployment. Inspect current CI and hosting integrations before pushing; report absent checks as absent rather than passed.

## 16:9 calculator and image ratio changer (implemented locally 2026-11-14; not released)

Brief: `../../reports/2026-11-14/imageaspectratio-new-pages/implementation-brief.md` (parent workspace). Failure cases are in the same folder.

`/16-9-aspect-ratio-calculator` (H1 "16:9 Aspect Ratio Calculator") renders `SixteenNineCalculator`. A Width/Height radiogroup chooses the known side; each side keeps its own entry, and an exact result carries its counterpart when the side switches. Input uses the shared exact parser plus a whole-pixel rule (1 to 1,000,000). The counterpart is `known × 9/16` or `known × 16/9` in BigInt fractions, rounded half up. The visible result and clipboard use the same `W × H` string. Only rounded results add a line, stating the exact decimal and the resulting pixel ratio, labelled as not exactly 16:9; exact and empty results add no explanatory copy. Reset restores Width 1920 (and stored height 1080); no other route's defaults change. A table of 640×360, 1280×720, 1920×1080, 2560×1440 and 3840×2160 has Use buttons that apply both dimensions. Related links: Calculator, Video, Change image aspect ratio. It is reached from the Calculator related links and the footer, not from a top-level navigation item. Calculator is marked as the current section there (`aria-current="location"`, not `page`), and the mobile trigger names it "16:9 Calculator".

`/change-image-aspect-ratio` (H1 "Change Image Aspect Ratio") renders `ImageRatioChanger`. It shares the square tool's input guards and reviewed error strings through `src/lib/image-input.ts`, and mirrors its paste/drop/picker path, generation counters and object-URL cleanup. Ratio options are 1:1, 4:5, 9:16 and 16:9 (default 16:9); Fit is Crop/Pad (default Pad). Width (px) is a whole number 1–4096; height is derived at the exact ratio with BigInt rounding and must also be 1–4096. Both output sides are shown before download; invalid sizes show an actionable error and disable Download. Choosing a ratio restores that ratio's default width (1080, or 1920 for 16:9) and recentres the crop. Preview and export share `frameLayout`; Crop uses a source region with the output's aspect, not a square. Background is solid; PNG and JPEG both fill it first. Download filenames end in `-1x1`, `-4x5`, `-9x16` or `-16x9`. The route is in the Image disclosure ("Change ratio"), the footer, the Image page and the Make square page related links. `/make-image-square` defaults, strings and output are unchanged; its helpers are now equal-side wrappers of the frame helpers.

Both routes are in SITE_PAGES/SITE_LABELS (sitemap, canonical, trailing-slash 308 and JSON-LD WebApplication with review date 2026-11-14) and keep the noindex preview default. Builds, type checks, tests and browser acceptance were not run by the implementer.

Mac acceptance (2026-11-14): 69 browser assertions, 13 independently verified image downloads, 10 HTTP checks, build and no-emit TypeScript check passed against the frozen noindex candidate. Evidence: `../../reports/2026-11-14/imageaspectratio-new-pages/README.md`. This is local acceptance, not a release.

## Calculator menu and continuous image placement (local, 2026-11-14; supersedes conflicting notes above)

Brief, research and failure cases: `../../reports/2026-11-14/imageaspectratio-editor-ux/` (parent workspace).

Navigation: the five primary sections stay Image, Calculator, Video, Social Media and Ultrawide. Calculator is now a native disclosure like Image and Social Media, containing All ratios (`/calculator`) and 16:9 (`/16-9-aspect-ratio-calculator`). The summary is the current section on either route; the exact route is the only current page in the menu. Below 600px the single Tools disclosure has a Calculator group with the same two links; its trigger reads "Calculator" or "16:9 Calculator". Close-on-navigation, outside pointer/focus and Escape-to-trigger are unchanged. The 16:9 page is a fixed-ratio shortcut with a resolution table, using the same exact math.

`/change-image-aspect-ratio`: the output frame (ratio and width) and the photo placement are independent. There are no Crop/Pad modes. The default is centered Fit. Zoom 1 (100%) is the Fit (contain) scale. Zoom runs from 1% up to 1000% of Fit, and further only when Fill needs it for an extreme source ratio. The minimum also keeps the photo's longer side at least 1 output px. Per axis, an image larger than the frame always covers that axis, while a smaller one stays fully inside with background around it. The two rules meet at equal size, so nothing jumps at Fit or Fill. A Framing segmented control offers Fit whole image (centered Fit) and Crop to fill (centered Fill). Fit whole image is also the reset; there is no separate Reset button. Its pressed state is derived from the current geometry: a button is pressed only while the placement equals that centered preset for the current frame. Manual zoom/pan, or a ratio/width change that moves the image off the preset, clears it. When Fit and Fill coincide, only the last explicitly applied preset is pressed (default Fit, restored on each new or removed image). Zoom has one logarithmic slider with a percentage (it exposes aria-valuemin, aria-valuemax and aria-valuenow in percent of Fit, plus aria-valuetext), Zoom out/in buttons (×1.1), Command/Control plus/minus/0 on the focused preview, and Command/Control-wheel zoom anchored at the pointer. Plain wheel scrolls the page. Drag pans at every zoom. Arrow keys on the focused preview move 1% of the shorter output side, or 10% with Shift. Changing ratio or width keeps the photo and its stored placement, clamped to the new frame. Placement is a fraction of the output size, so preview and export match. Export draws the whole source into the scaled, offset destination over the solid background, and the canvas clips it. Placement, ratio, size, background and format are locked while encoding. A drag is cancelled when export starts, when an image is read or removed, when the ratio or output width changes, and when Fit or Fill is applied. Once a photo is loaded, the upload area becomes a compact name/size row with Replace and Remove. Drop on that row and document paste still work. Input guards, invalid-size handling, rounding disclosure and object-URL cleanup are unchanged. `/make-image-square` and `src/lib/square.ts` geometry, defaults, strings and downloads are untouched.

Mac acceptance of this UX revision (2026-11-14): 61 browser assertions, 20 independently verified image files, 10 HTTP checks, build and no-emit TypeScript check passed. Evidence: `../../reports/2026-11-14/imageaspectratio-editor-ux/README.md`. The candidate is local/noindex and has not been released.

Framing-control follow-up (2026-11-14, local): clearer labels and geometry-derived pressed states passed 31 Mac browser assertions, two independently verified PNG downloads, build and no-emit TypeScript check. Desktop, 390px light/dark, keyboard and export locks are recorded in [acceptance](../../reports/2026-11-14/imageaspectratio-framing-controls/README.md). This follow-up is local/noindex and has not been released.

## Unified image frame editor (local, 2026-11-14; supersedes the Make image square editing notes above)

`/make-image-square` and `/change-image-aspect-ratio` now render one shared editor (`ImageFrameEditor`). Both tools have the same upload, Framing (Fit whole image / Crop to fill with geometry-derived pressed state), zoom, drag, keyboard, Background, Format, Download, export-lock and cleanup behavior described in the continuous-placement section. Make image square no longer has Pad/Crop modes, position sliders or Reset crop. Its frame stays 1:1 with Output size (px) 1–4096 (default 1080), the reviewed "Enter a whole number from 1 to 4096 pixels." error, `square-file`/`square-preview` hooks and `-square` filenames. Defaults are centered Fit, white, PNG. Both empty upload areas show only the Choose image button (no prompt text); picker, drop and paste are unchanged. Input guards (20 MB, 50 MP, decode) and error strings are unchanged. Centered Fit is drawn with the shared floating-point placement, so edge pixels may differ slightly from the former integer-rounded Pad output. The square preview uses the shared `.ar-stage` size cap.

Mac acceptance of the unified editor (2026-11-14): 62 browser assertions, 12 real PNG/JPEG downloads (11 reference pixel comparisons and one 1px structural check), three HTTP/noindex checks, build and no-emit TypeScript check passed. Matching square and ratio-editor 50% exports have identical decoded pixels. Corrected harness artifacts and repeatable scripts: [acceptance](../../reports/2026-11-14/imageaspectratio-square-unification/README.md). Local/noindex; not released.


## Screenshot Studio (implemented locally 2026-11-14; not released)

`/screenshot-beautifier` (H1 "Screenshot Studio") renders `ScreenshotStudio` (`src/components/ScreenshotStudio.tsx`) backed by `src/lib/screenshot-studio.ts` inside a pure white / monochrome studio window (icon-only top toolbar with instant `.ss-tooltip` hover pills even on disabled controls, custom `role="listbox"` popover dropdowns with zero native `<select>`, `[Download icon] + Download` primary CTA, and collapsible left Background sidebar; zero `--brand` orange accents). It reads one local screenshot via file picker, drag-and-drop or `Cmd/Ctrl+V` clipboard paste (`image-input.ts` 20 MB / 50 MP guards) with no OS-only Quick Access, floating pin cards or browser screen-capture prompts. Shape creation requires a `>= 6 px` pointer drag so plain clicks never spawn ghost shapes, and existing annotations can be selected, dragged, resized or curved directly without switching tools: 3-handle `Arrow` / `Line` (`start`, `end`, quadratic Bézier `mid` curve-bend), 8-handle `Rectangle` / `Filled` / `Oval` / `Highlight` / `Pixelate` (3×3 checkerboard icon, irreversible block mosaic) / `Spotlight` cutout veil, `Counter` badges, inline on-canvas `Text` input + corner font scaling, `Crop`, keyboard arrow nudging, and `Undo`/`Redo`. Normalized `[0..1]` cropped-image coordinates preserve exact alignment across `None`, 20 multi-stop/mesh gradients (`Show less`/`Show more`) + 3-stop `Custom gradient` builder, built-in & custom uploaded `Wallpapers`, 3 screenshot-derived `Blurred` backdrops (`Soft Blur`, `Vivid Blur`, `Dark Blur`), 2×8 `Plain color` (14 solids + `Transparent` + custom color wheel), `Auto balance`, `Padding`, `Corners`, `Shadow`, `Ratio` (`Auto`, `16:9`, `4:3`, `3:2`, `1:1`, `4:5`, `9:16`), named/deletable `screenshot-studio-presets-v2` presets, and real PNG/JPEG/clipboard export (up to 4096 px). Preview remains `noindex, nofollow`. Evidence: `../../reports/2026-11-14/screenshot-studio/README.md`.

## Homepage audit follow-up (local, 2026-11-14; not released)

Evaluation, failure cases and acceptance: `../../reports/2026-11-14/imageaspectratio-home-audit/README.md` (parent workspace).

- The Image empty state keeps its blank layout. Its placeholder is now `public/images/image-placeholder-light.webp` (640 px, about 3 KB), encoded from the original 1254 px PNG, which stays beside it as the source and is no longer requested.
- Width and Height on `/` are styled as read-only outputs (`.mp-readout-field`). With no photo, the blank exact ratio takes no space, so Copy ratio lines up with its label. Values, Copy, Fit/Fill, Remove and error behavior are unchanged. Video keeps editable fields and its dash.
- `ImageRatioGuide` adds two server-rendered sections after the existing table: "Aspect ratios of common image sizes" (15 sizes, ratios computed with the shared BigInt math, near matches labelled) and "Image aspect ratio questions" (six answers, limited to what the tools do). No FAQ structured data is emitted.
- Navigation group names inside the Social Media menu are paragraphs, so the `<h1>` is the first heading on every tool page. The `/social-media` hub keeps its `<h2>` groups.
- JSON-LD: `WebApplication.name` is the tool part of the title (text before " — "), `WebPage.name` keeps the full title, and `Offer` carries `priceCurrency: "USD"`. Graph order and types are unchanged. The homepage review date is 2026-11-14.
- Preview frames and the source-dimension row have `role="group"` for their existing labels.

Mac acceptance: 64 browser and HTTP assertions, `scripts/verify-http.py` in preview mode, unit tests, build and no-emit TypeScript check passed against an isolated noindex build. This is local acceptance, not a release.
