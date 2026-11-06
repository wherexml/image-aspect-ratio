# Calculator components

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
- `MediaPreview.tsx`: previews source dimensions from Find ratio/Resize. File selection reads only in the browser, supports JPG/PNG/WebP/GIF/AVIF, rejects over 20 MB and over 50 MP; dimensions reflect browser decoding/orientation. URLs are revoked on replacement/removal/unmount; stale reads cannot replace newer selections.
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

Primary navigation is Image (/), Calculator (/calculator), Video, Social Media, Ultrawide. Each entry is active only on its exact route; Social Media is active on its child routes. /calculator is the manual calculator only, with no image upload or input tabs. / renders `Calculator media="image"`, which shows only `MediaPreview` with `uploadOnly`: read-only dimensions, ratio, copy and Fit/Fill appear after a successful load and clear on a new file, an error or Remove. It has no numeric tools. Video keeps editable dimensions and its numeric tools. Image state is not shared with or persisted across routes.
