# Calculator components

Production release (2026-11-11): TASK-9, TASK-29, compact navigation and accepted preview refinements are live in Worker version `9ab0cf51-2e2a-4222-932e-579d77ba3694`. Independent production acceptance: `../../../reports/2026-11-11/task9-task29-release/README.md`. Local candidate evidence below is retained as history.

## Current contract (2026-11-07)

The [product specification](../../docs/product-spec.md) defines current routes and acceptance. This section supersedes dated historical descriptions below when they differ. `/` is upload-only Image; `/calculator` is the manual tool. There are no Enter dimensions/Choose image tabs. Image state is local to its mounted page and never writes manual dimensions. Video retains editable source fields and its existing numeric disclosure.

General ratios display narrow-to-wide: 9:16, 2:3, 3:4, 4:5, 1:1, 5:4, 4:3, 3:2, 16:10, 16:9; More ratios contains 2:1. Display indices preserve stable source identity, so default and Reset remain 16:9 at width 1920. Ultrawide displays commercial sizes ascending, then 32:9 comparison and strict 21:9; default remains 3440 at 43:18. Social matching-ratio examples sort by size, comparisons last; defaults remain landscape 1920×1080 or portrait 1080×1920.

Social and manual desktop layouts place preview left and controls/results right; narrow screens place controls/results first. Shared navigation is Image, Calculator, Video, Social Media, Ultrawide, with exact tool-route activity and social child activity.

## Historical implementation notes

- `Calculator.tsx` owns all numeric state; route files only select context and metadata.
- Find size computes one missing dimension. Find ratio simplifies source dimensions. Resize preserves the original width/height ratio while accepting a new target width or height.
- Explicit transfer buttons preserve exact source inputs when moving to Find size, and transfer displayed rounded pixel dimensions when moving back. Never transfer a Near hint as the exact ratio. Disable transfer for invalid/subpixel/out-of-range results.
- Nine general presets in reading order: 1:1, 4:3, 3:4 / 3:2, 2:3, 4:5 / 16:9, 9:16, 16:10. Three columns group common landscape/portrait choices; each button shows a concise use label. Match presets by rational equality (16:10 = 8:5); default remains 16:9.
- `RatioCanvas.tsx`: geometry updates immediately; pointer events are coalesced once per animation frame. Pending frames are flushed on pointer release and canceled on unmount. Resize and ultrawide keep source proportions locked.
- `MediaPreview.tsx`: previews source dimensions from Find ratio/Resize. File selection, drag/drop and native Cmd+V/Ctrl+V image paste read only in the browser through one shared path: any `image/*` or empty/generic-type file is decoded by the browser via `<img>` (no inline SVG), non-image types are rejected, and files over 20 MB or 50 MP (or with zero dimensions) are rejected; dimensions reflect browser decoding/orientation. URLs are revoked on replacement/removal/unmount; stale reads cannot replace newer selections.
- Fit uses contain; Fill uses centered cover. Visible area is min(source/target,target/source). Video assumes square pixels. This is a calculator/preview, not a file resizing, crop-export or video-transcoding tool.
- Custom manually edited dimensions show diagrams instead of distorting the uploaded image.
- Navigation uses TanStack Link. Local preview is noindex. Full interactive calculator is enabled after hydration.
- Acceptance and repeat steps: `../../verification/workflows-report.html`. No new unit tests; browser journeys cover the changed behavior.

## Stable layout and page-specific entry (2026-10-17)
- Image/Video lead with MediaPreview: image file input, editable source dimensions and Fit/Fill comparisons. No generic RatioCanvas on media pages. Numeric solve/resize tools remain in a collapsed disclosure.
- Home/Ultrawide retain RatioCanvas; desktop stage stays 460px, mobile 240px. Mode input/result blocks follow their content height so results stay close to inputs; the card may resize when switching modes. General presets use three columns and three rows so all nine ratios and use labels are visible without horizontal scrolling; min-width:0 prevents grid overflow. Ultrawide retains its separate source layout.
- Mode changes use opacity-only 140ms feedback, never animate the entire layout; reduced motion disables this feedback. Canvas drag remains immediate.
- Solve and Resize own independent target values and sides. Re-clicking or returning to Resize never initializes/overwrites the target. Explicit Reset restores both modes. Source dimensions remain shared with Find ratio and media preview.
- Latest checks and initial failed attempts with passing retests are retained in `verification/stability-fix/checks.json`. Report: `verification/stability-fix/report.html`.

Media preview visual refresh: scoped .mp-* styles; keep Fit/Fill math and local file lifecycle intact. Device bezels reserve12px within the stage. Verification: verification/media-design/report.html.

Video fit clarity: shared media readouts distinguish exact match, contain letterboxing direction, and cover crop direction. Exact match uses BigInt cross multiplication; preview percentages remain approximate. Video frames retain realistic device shells with narrow bezels; screen geometry remains independent of shell padding. No exterior ghost outlines; image frames retain their geometry. Latest visual acceptance: `../../verification/device-preview/README.md`. See `../../verification/video-fit-clarity/README.md`.

Image/navigation follow-up: all four image formats use the same neutral stage and outlined target frame; aspect ratios remain true, so matching 16:9 has no internal letterboxing. Removed the image preview-only footnote. Shared navigation uses labeled Lucide icons with a four-column mobile layout. Browser evidence: `../../verification/image-nav/`.

Real-photo acceptance: `../../verification/photo-flow/report.html` includes repeatable 1200×800 fixture, desktop and390px upload/Fit/Fill screenshots and per-frame geometry checks. Copy uses inverted neutral theme tokens; homepage and ultrawide clipboard checks included.

Local SEO follow-up: context-specific Image/Video intro, full Ultrawide H1, real href links in related tools and the homepage ultrawide example. Calculations unchanged. See `../../verification/seo-local/report.html`.

## General preset contract (2026-10-23)

The general Find size selector uses the same three-column grid on desktop and narrow screens. Each button contains a ratio thumbnail, exact ratio and short use label; the label also remains its title. Selection is exposed through `aria-pressed`, and clicking updates the ratio without changing the known dimension. Default and Reset stay 16:9 at 1920 wide. Ultrawide keeps its own two-column source selector, including the full-width mathematical ratio entry. Image/Video reuse these general presets when their numeric tools are expanded and Find size is selected.

Acceptance checklist: verify all nine choices in the documented order; select 4:5 at width 1920 and expect 1920 × 2400; Reset must restore 1920 × 1080 and 16:9 selection. Check labels/overflow at desktop and 390px, rational matching (8:5 selects 16:10), and the independent Ultrawide layout. Local evidence is stored under ignored `verification/presets-closeout/`; a local browser result does not establish production deployment or indexation.

## Mobile task priority and direct ratio copy (2026-10-24)

- Below 1024px, the homepage renders its controls and result before the canvas. The preset toggle shares the action row; all nine presets remain available in the existing grid. Desktop keeps the full grid and canvas/control columns. Ultrawide is unchanged.
- Image/Video expose Copy ratio next to Exact ratio, independent of the collapsed numeric calculator. The value uses exact fraction simplification. Invalid dimensions, pending/failed image loads and removed images cannot copy old results; removing an image clears its dimensions. Editing dimensions clears a file error and returns to manual calculation.
- Clipboard success resets on source changes. A rejected clipboard write shows a selectable manual-copy field instead of success.
- Acceptance evidence and replay scripts: `../../verification/mobile-priority-20261024/README.md`. This is a local change, not a production release.

## Ratio selection guide (2026-10-24)
The homepage guide applies 16:9, 9:16, 3:2, 1:1 or 4:5 in Calculate size, preserving that mode's known dimension and side. Its ultrawide link is a normal crawlable link. Ultrawide adds 5120×1440 (32:9), with a distinct source ID from 5120×2160 (64:27). Source restoration and Reset retain their existing behavior. Local acceptance: `../../verification/ratio-guide-20261024/README.md`.

## Ratio completion (2026-10-24)
The nine primary presets retain their order. More ratios exposes 5:4 Landscape print and 2:1 Wide video, matching by rational equality. Homepage guide offers ten ratios (including 4:5) and a separate actual-monitor resolution link. Guide switches to Calculate size and preserves its known dimension and side. Image and Video pages explain worked Fit/Fill examples below their tools. Acceptance and release evidence: ../../verification/ratio-completion-20261024/README.md.

## Tool outcome measurement and image checker (2026-10-26)

Calculator and MediaPreview report valid outcomes after explicit user edits, successful local image reads, and successful clipboard writes. Default results, no-op selections, Reset, invalid/subpixel values and failed reads are excluded; identical recent outcomes are deduplicated per mounted tool. Test mode uses separate QA event names. See `../../docs/tool-analytics.md` and `../../verification/tool-analytics-20261026/README.md` for parameters, privacy boundaries and repeatable browser checks.

Calculator accepts optional children before its related-tools navigation. The image route uses this slot for a five-row exact-ratio guide; the live result and clipboard remain exact and do not substitute a nearby common ratio. Image checker copy names the existing read/preview task and accepted file formats; it does not add editing/export functionality. Source changes are locally verified and await deployment confirmation.

## Social dimensions calculator (2026-11-04)

SocialRatioPage uses the existing BigInt fraction functions and RatioCanvas to solve width or height for a selected example canvas. Example buttons replace the known dimension with the corresponding source size; switching the known side preserves the entered number. Reset restores the page default. Route changes remount the calculator by path.

Invalid inputs, calculated sizes over 1,000,000 px and subpixel dimensions disable copy and the preview. Fractional outputs retain their exact fraction and decimal expansion; whole-pixel rounding is labeled. Copy failures expose a selectable value; input changes and unmount invalidate pending copy results. Existing tool tracking excludes defaults and Reset, and no dimensions or platform filenames are sent.

Acceptance: verify defaults on all five routes; width/height solving; square Shorts selection; reset; invalid/subpixel/overflow values; rounding; clipboard success/failure and stale-copy cancellation; client navigation; desktop and 390px geometry; local SSR metadata, 404, sitemap and noindex.

## Calculator navigation

`CalculatorNavigation` is shared by the general/media calculators and social platform pages. Four primary tools and a Social Media disclosure appear before the page title. The disclosure groups five links under Instagram, YouTube and TikTok; the /social-media hub link was removed from the panel on 2026-11-06 and remains reachable from the footer's Social platforms group. Desktop uses an overlay panel; narrow screens expand it in document flow. Navigation, Escape and outside pointer interaction close the panel; active links expose aria-current. Acceptance and repeat steps: `../../verification/social-navigation/README.md`.

2026-11-06 design feedback: the shared footer is a full-width neutral `bg-muted` block with three labelled groups (Tools & guides, Social platforms, Information) styled by `.footer-group`/`.site-footer`; Calculator's related links dropped their top divider. MediaPreview uses fixed-width Width/Height inputs and places the Fit/Fill radiogroup beside the source summary directly above the previews (image and video). Math, analytics and copy behaviour are unchanged. Failure cases: `../../verification/design-feedback-20261106/failure-cases.md`; browser acceptance belongs to the Mac host.

## Superseded: unified image entry (2026-11-06)

Home and /image-aspect-ratio render the same calculator with Enter dimensions and Choose image inputs. Image previews stay mounted when hidden so switching retains the file and shares source dimensions with numeric modes. Guide presets return to numeric input. Primary navigation is Image Aspect Ratio, Video, Social Media, Ultrawide. The existing image URL and metadata remain available. Resize is labeled Scale dimensions. Local acceptance: ../../verification/unified-image-20261106/. No production deployment.

## Separate Image and Calculator pages (updated 2026-11-07)

Primary navigation is Image (/), Calculator (/calculator), Video, Social Media, Ultrawide. Each entry is active only on its exact route; Social Media is active on its child routes. /calculator is the manual calculator only, with no image upload or input tabs. / renders `Calculator media="image"`, which shows only `MediaPreview` with `uploadOnly`: read-only dimensions, ratio, copy, Fit/Fill and four empty preview frames remain visible before image selection. Values and photos populate after a successful load and clear on a new file, an error or Remove; the layout stays visible. It has no numeric tools. Video keeps editable dimensions and its numeric tools. Image state is not shared with or persisted across routes.

2026-11-07 Image uploader: under `uploadOnly` the drop surface is a centered column with the prompt, a custom "Choose image" button (the native input is visually hidden and out of the tab order) and the status/error/file row. No native filename text and no permanent format/size hint; errors appear only after a failed read. A document `paste` listener (Image only, removed on unmount) takes the first clipboard image file, ignores text-only pastes and pastes into inputs, textareas, selects or contenteditable, and calls `preventDefault` only when it takes an image. Files without a name show as "Pasted image". Video and the legacy non-uploadOnly branch are unchanged.

2026-11-07 Image result layout: `uploadOnly` restores two expanding dimension columns and the ratio/copy column on desktop; mobile keeps two equal dimension columns with the ratio below. Fit/Fill always appears beside the section heading. On clipboard write failure, the existing ratio is selected for native copy with a short keyboard hint instead of an additional input. The uploader, image paste handler, preview cards and Video layout are unchanged.

The Image empty state uses a neutral square placeholder with a centered image icon in each frame. Fit/Fill previews this 1:1 placeholder without filling dimensions or ratio; a real image replaces it, and Remove restores it.

## Make image square (2026-11-07)

Navigation redesign (2026-11-11, local): `CalculatorNavigation` uses one text row with Image and Social Media disclosures plus direct Calculator, Video and Ultrawide links. Image contains Image ratio and Make square on all tool routes. Section summaries use `aria-current="location"`; exact destination links use the router's `aria-current="page"` semantics and ignore search parameters. Below 600px a current-tool disclosure groups all real links in a bounded, scrollable panel. Native details/summary preserve keyboard activation. Opening one disclosure closes its siblings; navigation, outside pointer/focus and Escape close it, and Escape restores trigger focus. No menu/menubar role or custom arrow-key model is introduced. Local acceptance: reports/2026-11-11/tool-navigation-redesign/. This supersedes the earlier two-row candidate in image-tool-navigation/ while preserving that evidence.

`SquareImageMaker` (route `/make-image-square`) is the only component that exports a file. Its geometry and rendering live in `src/lib/square.ts`:

Interaction follow-up (2026-11-11, local): Mode is ordered Crop, Pad without changing the default. `zoomCropAt` preserves the source point under a normalized preview anchor and clamps at the existing source/zoom limits. A native, non-passive wheel listener is scoped to the preview and reads the latest handler through a ref. Only loaded Crop previews consume Command/Control-wheel; focused previews also support Command/Control plus/minus and 0. Normal scrolling is retained. Primary-pointer drag focuses the preview; export and active-drag guards prevent conflicting edits. Keyboard focus uses the existing ring token. Local acceptance is recorded in the parent workspace at reports/2026-11-11/square-canvas-interactions/.

Preview styling correction (2026-11-11, local): `.sq-stage` uses square corners in empty, Pad and Crop states. Crop / Pad retains its original pill shape; `.sq-mode` adds only a pointer cursor on enabled options. Format and other segmented controls keep their existing appearance. Current local browser evidence: reports/2026-11-11/square-preview-corners/ in the parent workspace. This supersedes the square toggle shape in reports/2026-11-11/square-toggle-style/.

- `squareLayout(w, h, edge, mode, crop)` is the single geometry source. Pad scales the longer side to the edge, rounds the inner size to whole pixels (minimum 1) and centers with floor offsets: 1200×800 → 1080 draws 1080×720 at y=180. Crop takes a square source of side `min(w,h)/zoom`. Its x/y are fractions of the remaining travel (0.5 = centered), so 1200×800 centered samples x 200–1000. Zoom runs from 1 to `min(10, shorter side)`.
- `drawSquare` fills the background and then draws. The preview calls it with scale `canvasPx / edge`, and `exportSquare` calls it at scale 1 on an edge×edge canvas. Preview and file therefore share one layout.
- `exportSquare` rejects a null or empty blob, or a blob whose type differs from the requested PNG/JPEG (browser fallback). JPEG quality is 0.92. Filenames are `<sanitized base>-square.png|jpg`.
- Input mirrors Image's guards (image/*, empty or octet-stream types; 20 MB; `<img>` decode; 50 MP; nonzero size) with its own generation counter, object-URL cleanup and document paste listener. `MediaPreview` was deliberately left untouched. Replacing or removing the image during encoding discards the blob. While encoding, Pad/Crop, crop sliders, Reset crop, preview drag, Output size, Background and Format are disabled, so the file always matches the visible settings; Choose/drop/paste and Remove stay available and discard the pending blob.
- Keyboard: Pad/Crop and Format radiogroups, native range sliders, Reset crop, Output size field, native color input, Download. Pointer drag on the crop preview moves the image with the pointer (`touch-action: none` in Crop only).
- Visible copy is the Gemini-reviewed list. Errors appear only after the relevant failure. The SEO title/description and the Terms/About/Privacy sentences are proposed and still need review.

Limitations: no transparent output, blur, batch, AI fill, stretching, video or animation (animated inputs export one still frame). Supported input formats are whatever the browser decodes. Orientation follows the browser's `<img>` handling. 4096 px (a 16.8 MP canvas) is an engineering cap, not a measured browser limit; device canvas and memory capability varies and is unmeasured. No analytics event is sent by this tool. Failure cases: `../../../reports/2026-11-07/task9-development/failure-cases.md`.

## Frame geometry, ImageRatioChanger and SixteenNineCalculator (2026-11-14, local)

- `src/lib/square.ts` now exposes rectangular helpers: `frameLayout(w, h, outW, outH, mode, crop)`, `frameMaxZoom`, `zoomFrameCropAt`, `drawFrame`, `exportFrame`, `frameFilename`, `frameSize` and `TARGET_RATIOS`. Pad scales by `min(outW/w, outH/h)`; Crop's zoom-1 source is the largest `outW:outH` rectangle inside the image. The square helpers (`squareLayout`, `maxZoom`, `zoomCropAt`, `drawSquare`, `exportSquare`, `squareFilename`) call them with equal sides and give the same results as before.
- `frameSize(widthText, ratio)` parses whole-pixel width with `parseEdge` and derives height with BigInt `roundFrac`; it is invalid when either side is outside 1–4096. The changer previews the last valid size while the field is invalid but never exports it.
- `ImageRatioChanger` mirrors `SquareImageMaker`'s input, paste, generation, export-lock and URL-cleanup rules. Both components import the reviewed error strings and type guard from `src/lib/image-input.ts`; neither imports from the other. Crop/Pad has no added explanatory copy. Drag converts CSS pixels using the crop width captured at pointer down; because the `.ar-stage` box has the output aspect (`--ar`), horizontal and vertical scale match. `.ar-stage` caps portrait height at 30rem and keeps square corners.
- `SixteenNineCalculator` reuses `src/lib/ratio.ts` (`parsePositive`, `solve`, `roundFrac`, `simplifyRatio`, `decimalString`) and the calculator's result/copy styling. Only rounded results add a detail line; exact and empty states add no instructional copy. It sends no analytics events. Copy uses a generation guard and a manual-select fallback, so a failed write never reports success.

## Continuous placement and Calculator menu (2026-11-14, local)

- `src/lib/placement.ts` owns the converter geometry. `Placement = { zoom, cx, cy }`: zoom is relative to Fit, and cx/cy is the image centre as a fraction of the output size. `zoomBounds` gives min `max(0.01, 1/longer-side-at-Fit)` (capped at 1) and max `max(10, fillZoom)`. `clampPlacement` clamps per axis: covering when larger than the frame, inside when smaller. `zoomPlacementAt` keeps the anchored image point fixed, `movePlacement` pans in output pixels, and `fillPlacement` centers at the cover scale. `placementLayout` maps the full source to a possibly negative or oversized destination, which `drawFrame`/`exportFrame` render with background fill and canvas clipping. The old crop helpers assume coverage and are not lowered or reused here.
- `ImageRatioChanger` stores an unclamped placement and clamps it against the current preview frame for drawing and controls. Download clamps the same stored placement against the export size. Preview and export dimensions are identical whenever export is enabled. Fit doubles as the centered reset (no Reset button; Command/Control+0 applies Fit). The Framing group (`.seg.ar-framing`, `aria-pressed` toggle buttons) computes its pressed state on each render. It compares the clamped placement, within a 1e-6 relative tolerance, against `clampPlacement(FIT)` and `fillPlacement` for the current preview frame. Coincident presets fall back to the `lastPreset` state, which is set only by explicit Fit/Fill/Command/Control+0 and reset to Fit on read/remove. Reading/removing an image, ratio or width changes, Fit/Fill and export start all clear `drag.current`. The log-scale range exposes `aria-valuemin`/`max`/`now` in percent of Fit with matching `aria-valuetext`.
- `CalculatorNavigation` has `calculatorTools` (All ratios, 16:9) in a third `tool-disclosure` (`.tool-calculator`, anchored under its own summary). The earlier `aria-current="location"` workaround for the 16:9 route on the Calculator link is removed.

Mac acceptance of this UX revision (2026-11-14): 61 browser assertions, 20 independently verified image files, 10 HTTP checks, build and no-emit TypeScript check passed. Evidence: `../../../reports/2026-11-14/imageaspectratio-editor-ux/README.md`. The candidate is local/noindex and has not been released.

Framing-control follow-up (2026-11-14, local): clearer labels and geometry-derived pressed states passed 31 Mac browser assertions, two independently verified PNG downloads, build and no-emit TypeScript check. Desktop, 390px light/dark, keyboard and export locks are recorded in [acceptance](../../../reports/2026-11-14/imageaspectratio-framing-controls/README.md). This follow-up is local/noindex and has not been released.

## ImageFrameEditor (2026-11-14, local)

`ImageFrameEditor` owns the shared workflow formerly duplicated in both tools:
- **Input:** picker, drop and paste, the guards from `image-input.ts`, the generation counter and object-URL cleanup.
- **Placement:** `placement.ts` geometry, Framing pressed-state derivation and `lastPreset`, zoom bounds, slider ARIA, buttons, the modifier wheel, keyboard and drag.
- **Export and output:** the compact Replace/Remove row after load, Background, Format and Download through `exportFrame`, plus export locks and stale-blob discard.

Wrappers supply `preview` and `output` sizes (`output` is null when invalid), the filename `suffix`, an `idPrefix` for `${prefix}-file`/`${prefix}-preview`, and `frameKey`. The empty upload area has no prompt text for either tool. A `frameKey` change clears any active drag and the export error. They also supply render slots: `before(exporting)` for the ratio choice, `sizeField(exporting)` and `sizeStatus`. `Segmented` is the exported `seg` radiogroup helper.

`SquareImageMaker` passes an equal-sided frame from `parseEdge`, keeping the last valid edge for preview. `ImageRatioChanger` passes the `frameSize` result and its ratio control. Neither wrapper contains editing logic. The legacy square crop/pad helpers in `square.ts` remain for compatibility but are unused by components.

Mac acceptance of the unified editor (2026-11-14): 62 browser assertions, 12 real PNG/JPEG downloads (11 reference pixel comparisons and one 1px structural check), three HTTP/noindex checks, build and no-emit TypeScript check passed. Matching square and ratio-editor 50% exports have identical decoded pixels. Corrected harness artifacts and repeatable scripts: [acceptance](../../../reports/2026-11-14/imageaspectratio-square-unification/README.md). Local/noindex; not released.


## ScreenshotStudio (2026-11-14, local)

`ScreenshotStudio` (`src/components/ScreenshotStudio.tsx`) and `src/lib/screenshot-studio.ts` implement `/screenshot-beautifier` as a self-contained module without modifying `ImageFrameEditor`, `square.ts`, `placement.ts` or `ratio.ts`. Both preview and `exportStudioBlob` call `renderStudioScene` using `computeStudioLayout` and `analyzeAutoBalance`. Browser acceptance and verified 1600×900 PNG output: `../../../reports/2026-11-14/screenshot-studio/README.md`. Local/noindex; not released.
# Local V2 feedback fixes — 2026-11-16

`StudioFrameEditorV2` and `ScreenshotStudio` use the shared left inspector layout, one empty upload entry and capability-gated image copy from `v2-clipboard.ts`. The frame editor has one output summary and disables empty placement controls. `studioAnnotationBounds` extends Screenshot Studio's source-anchored coordinates to the composed canvas; geometry helpers, pointer/keyboard manipulation and crop reprojection share those bounds. Mosaic reads composed pixels so it covers background as well as source content. Preview and export share `renderStudioScene`. Evidence and the pre-change failure checklist live in `../../reports/2026-11-16/aspectratio-feedback-fix/`; no release is implied.
