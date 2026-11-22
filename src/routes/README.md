# Routes

Production release (2026-11-11): `/make-image-square`, the four-row image-size table on `/social-media` and the accepted compact tool navigation are live in Worker version `9ab0cf51-2e2a-4222-932e-579d77ba3694`. Production HTTP/browser acceptance and screenshots: `../../../reports/2026-11-11/task9-task29-release/README.md`. This release record supersedes older local/not-deployed labels for this scope.

Current source contract: [product specification](../../docs/product-spec.md). `/` is Image; `/calculator` is the manual calculator; `/image-aspect-ratio` is a compatibility redirect. This current contract supersedes earlier dated route inventories below; historical release records do not imply this revision is deployed.

TanStack Start uses **file-based routing**. Every `.tsx` file in this directory
defines a route. Do **not** create `src/pages/`, `src/routes/_app/index.tsx`, or
`app/layout.tsx` — those are Next.js / Remix conventions. The only root layout
is `src/routes/__root.tsx`.

## Conventions

| File | URL |
| --- | --- |
| `index.tsx` | `/` |
| `about.tsx` | `/about` |
| `users/index.tsx` | `/users` |
| `users/$id.tsx` | `/users/:id` (dynamic — bare `$`, no curly braces) |
| `posts/{-$category}.tsx` | `/posts/:category?` (optional segment) |
| `files/$.tsx` | `/files/*` (splat — read via `_splat` param, never `*`) |
| `_layout.tsx` | layout route (renders children via `<Outlet />`) |
| `__root.tsx` | app shell — wraps every page; preserve `<Outlet />` |

`routeTree.gen.ts` is auto-generated. Don't edit it by hand.

## Aspect ratio tools

- `/calculator`: general numeric calculator, simplify ratio and compute missing dimension (was `/` until 2026-11-07).
- `/ultrawide-aspect-ratio-calculator`: locked source ratios: strict 21:9; 3440x1440 = 43:18; 2560x1080 and 5120x2160 = 64:27; 3840x1600 = 12:5.
- Both routes share the `Calculator` component (`src/components/Calculator.tsx`) and BigInt rational math. Switching ultrawide presets preserves the known dimension. Reset restores width 3440 and 43:18 on the ultrawide route.
- If either resulting dimension is below 1px, show a warning and disable copy. Exact values remain visible. Preview clamping is disclosed; it never changes the calculation.
- General canvas pointer/keyboard controls change ratios without preset snapping. Ultrawide canvas is read-only to preserve source proportions.
- Keep noindex during local preview. Production domain/canonical and index settings are a separate release step.
- E2E replay: `ego-browser nodejs < verification/ultrawide-check.mjs`. Results are written incrementally to `verification/ultrawide-results.json`; a browser-control stop is not a product failure.

## Navigation and full result refinement
- Brand link always returns home. All four tools use a shared navigation bar and client-side links.
- Ultrawide source buttons show exact ratios; strict 21:9 occupies its own row and has no source-size action.
- Use original size restores the selected source width or height according to the current known-side selection; it keeps the ratio and side unchanged.
- Solve results show full width x height plus px, using exactly the same dimension string as clipboard output. Ratio mode stays a simplified ratio.
- Chrome verification: `verification/refinement-results.json` (21 checks passed), desktop and 390px screenshots in `verification/refinement-*.png`. Types and build passed; no deployment.
- Repeat: change known size, restore each of four source sizes in Width and Height modes; compare visible result with copied text; verify strict mode hides source-size button; return home via logo; check both pages at 390px.

## Compact precision display (2026-10-17)
- Canvas preserves short exact target ratios (including 21:9 and 2.39:1). Other custom ratios use at most two decimal places with an approximation sign when rounded; tiny positive ratios display <0.01, never zero. Exact simplified ratios remain available in Find ratio.
- Solve results default to complete rounded pixel dimensions. Precision detail starts closed in both modes and exposes the exact fraction/ratio and decimal expansion. Presentation formatting never feeds back into calculation.
- Ultrawide examples cover all four source resolutions at half size and strict21:9 at3440px.
- Repeatable Chrome acceptance: `../../verification/precision-report.html`. 24 passing checks; one pointer location miss corrected and retested.

## Familiar ratio hints
- Common matches use exact rational equality. Otherwise, within 3% relative difference, show `Near 3:4` (or the nearest common ratio), never an exact label. Portrait 3:4 and 2:3 are included.
- Actual ultrawide ratios 43:18, 64:27 and 12:5 keep their exact labels.
- Find ratio shows the familiar approximation with an explicit not-exact note; precision details and clipboard retain the exact reduced ratio. Calculations and canvas proportions are unchanged.
- Chrome evidence: `verification/familiar-results.json` and `verification/familiar-ratio.png` at project root.
- Replay: enter 0.7597:1 at width1920 (Near3:4,1920x2527), expand details; enter3:4 (exact),1.2:1 (6:5,no forced match); Find ratio1920x2527 (Near3:4,copy1920:2527); check ultrawide43:18 remains exact.

## Image, video and workflow expansion (2026-10-17)
- `/` (formerly `/image-aspect-ratio`): local image dimension detection and 1:1, 4:5, 9:16, 16:9 fit/center-crop preview.
- `/video-aspect-ratio`: numeric dimensions and 16:9 / 9:16 screen simulator.
- Shared state and rendering contract: [components/README.md](../components/README.md).
- Current acceptance: [workflows-report.html](../../verification/workflows-report.html).

Latest local stability update: Image/Video now have task-specific first screens; generic numeric tools are collapsed below. Stable canvas/results and isolated Resize targets verified on desktop and 390px mobile. See [acceptance](../../verification/stability-fix/report.html).

## Local SEO metadata (2026-10-17)
All four routes use `src/lib/seo.ts` previewSeoMeta: unique title/description plus matching OG/Twitter text. Noindex/nofollow is mandatory for this local version. No production canonical/domain or sitemap is guessed. Image highlights local-photo previews; Video highlights dimension-based screen simulation; Ultrawide has the full H1. Evidence: `../../verification/seo-local/report.html`.

## Site configuration and crawl endpoints (2026-10-17)
- `src/lib/site.ts` is the public build-time source of truth. `.env.example` documents `VITE_SITE_URL` (blank until confirmed HTTPS origin) and `VITE_SITE_INDEXABLE=false` (default). Vite rejects malformed origins, invalid booleans and indexability without an origin. Rebuild after changing values.
- With no origin, omit canonical/og:url instead of emitting a fake or loopback URL. With an origin, each known route gets its own canonical and og:url, without query parameters.
- Preview always sends noindex/nofollow in page metadata and HTML X-Robots-Tag. A configured domain alone never enables indexability.
- `src/server.ts` serves GET/HEAD `/sitemap.xml` and `/robots.txt` dynamically. Sitemap is a valid empty urlset while non-indexable; only an explicitly indexable configuration includes the four known canonical URLs and a robots Sitemap directive. No invented lastmod values.
- GET/HEAD known routes with trailing slashes redirect 308 to slashless paths, preserving query strings. Unknown routes retain 404. No Host-based canonical or cross-host redirect.
- Default build targets Cloudflare. `bun run preview` uses pinned Wrangler in local mode at 127.0.0.1:18767; it does not deploy. The previous vite preview command looked for a different output layout and returned 500.
- Evidence and repeatable HTTP checks: `verification/seo-infrastructure/`. Formal domain, indexability approval, production deployment and GSC remain separate release work.

## SEO 文案与索引验收（2026-10-23）

首页 Title 为 `Aspect Ratio Calculator for Images & Videos`；首句及示例突出图片和视频用途。导航采用 Image ratio / Video ratio，各工具说明和示例标题明确对应 aspect ratio 主题；计算与文件处理能力不变。

当前仍为预览 noindex，开放索引未获本轮授权。现有 canonical、robots、sitemap 生成逻辑已在本地 Worker 的两种构建模式下验收；`scripts/verify-http.py` 新增 indexable 模式，默认仍为 preview。详情见 [发布说明](../../docs/deployment.md)；本机截图和 22 条 HTTP 结果保存在 `verification/seo-copy-index/`（本地验收目录，不随源码提交）。


## Information pages and schema (2026-10-23)

Added /about, /privacy and /terms, linked from the shared footer. Contact remains unset at user request. seoScripts emits one SSR JSON-LD graph per route (WebSite and WebApplication or WebPage). Identity URLs require configured origin. Site name is Aspect Ratio Calculator. No invented author, date or social profiles.

Calculate size / Aspect ratio replace Find size / Find ratio labels. Homepage explains the ratio and GCD example; calculation logic is unchanged. Privacy covers local image handling, theme storage, external fonts and preview error hooks. Terms describes tool usage and output limits.

This supersedes earlier crawl-endpoint documentation: robots announces a configured origin sitemap independently of noindex. Preview sitemap stays empty; indexable sitemap contains all seven routes. Local verification: verification/seo-entities/README.md. No deployment.

Homepage copy refinement: title is `Aspect Ratio Calculator — Image & Video Dimensions`; the lead begins with Calculate image and video dimensions. Instructions name the Calculate size, Aspect ratio and Resize modes while describing image/video tasks; related links include the full calculator name. Local evidence: `verification/seo-keyword-copy/`. Counts use rendered body text, not plugin scores; no indexing or calculation logic changes.

## Production domain migration (2026-10-23)

Production origin is `https://imageaspectratio.com`; the eight-page sitemap includes Contact. SEO URLs and llms.txt use this origin. The server redirects only explicitly listed production aliases (www, legacy workers.dev and HTTP apex) to HTTPS apex with 308, preserving path and query. Local and unknown hosts stay local. Workers Assets serves static files directly. This supersedes earlier notes prohibiting cross-domain redirects. See `../../docs/deployment.md` for deployment and acceptance details.

## Image checker experiment (2026-10-26)

The existing `/image-aspect-ratio` URL keeps its canonical and indexability behavior. Its title, description and H1 now identify an image aspect ratio checker. A supporting guide renders inside the shared main region and explains unfamiliar exact ratios without claiming file editing or export. Local acceptance: `../../verification/tool-analytics-20261026/README.md`; no deployment is implied by this source change.

## Visual aspect ratio guide (2026-10-26)

`/what-is-aspect-ratio` is an English educational guide with SSR content, three original theme-aware SVGs, section anchors, a ratio table and related calculator links. It uses WebPage schema with a page-specific review date, standard canonical/robots metadata and the shared SITE_PAGES sitemap/redirect contract (nine routes in indexable builds). Copy lives in `src/content/aspect-ratio-guide.json`; illustrations live in `public/illustrations/`. The reviewed draft was processed by humanizer-zh through agy with explicit English instructions. Fedora Claude created the SVGs. Local evidence: `verification/task28-guide-20261026/`. No deployment or indexing submission is implied.

## Search appearance candidate — 2026-10-27 (local, unreleased)

The shared SEO graph keeps the established WebSite name and adds the visible short brand as alternateName. Tool routes model WebApplication separately from WebPage and declare real free access without invented reviews. Visible breadcrumbs were removed site-wide on 2026-11-06; BreadcrumbList metadata remains. Shared footer navigation exposes the four tools and guide on all pages. Head metadata serves the white icon set and preloads same-origin licensed fonts; the original header mark is preserved. Evidence and publication boundary: `verification/search-appearance-20261027/README.md`. This implementation does not guarantee sitelinks, ratings or rankings.

## Exact fractions article (2026-10-27)

`/exact-fractions-vs-rounded-pixels` is an SSR English article that explains reduced ratios, whole-pixel scaling, rounding direction, exact crops and CSS `aspect-ratio`. Prose, code and tables live in the route file and follow `../../../reports/2026-10-27/exact-fraction-article/article.md` verbatim. Its three PNG illustrations live in `public/illustrations/exact-fractions/` (1536 × 1024); each has alt text, a caption and a full-size link, and only the first loads eagerly. Styles are scoped to `.exact-fractions`/`.xf-*` in the route CSS; code blocks and tables scroll independently and are keyboard focusable. The route uses WebPage schema with its own review date and the shared SITE_PAGES sitemap/redirect contract (ten routes in indexable builds). It is linked from the shared footer and the guide's calculation section. Failure cases: `verification/exact-fractions-20261027/failure-cases.md`. Browser acceptance belongs to the Mac host; no deployment is implied.

## Social media pages (2026-11-04)

Five English routes cover TikTok, YouTube landscape video, Instagram Reels, Instagram Stories and YouTube Shorts. Each has an independent title, description, H1, self-canonical path, WebApplication graph, worked framing examples and dated primary sources. Content lives in src/content/social-ratios.ts; the shared SocialRatioPage renders the calculator and guidance. All five paths participate in SITE_PAGES, sitemap generation, trailing-slash normalization and the shared footer. Local preview remains noindex/nofollow.

The YouTube page defaults to 1920 × 1080 at 16:9; the others default to 1080 × 1920 at 9:16. Shorts also offers a square comparison. These are calculation examples, not upload validation or media export. Requirements sourced from advertising documentation are explicitly labeled as ad specifications. Source review and local acceptance do not establish a production release or search performance.

## Social navigation hub (2026-11-05)

`/social-media` groups the five existing platform routes under Instagram, YouTube and TikTok. Shared navigation exposes this group from the homepage and calculators. Social detail hierarchy remains in JSON-LD; visible breadcrumbs were removed site-wide on 2026-11-06. The hub participates in SITE_PAGES and indexable sitemap generation. Local acceptance: `../../verification/social-navigation/README.md`. This change has not been deployed.

Image sizes (TASK-29, released 2026-11-11): the hub renders the four sourced records from `src/content/image-placements.ts` below `SocialPlatformLinks`. The table uses fixed widths so it wraps rather than scrolls at 390 px. Sources are plain external links inside one native details element. The hub WebPage dateModified is now 2026-11-07. The route inventory is unchanged. The official sources were rechecked on 2026-11-11; the historical registry checked date remains 2026-11-07.

Site-wide visible breadcrumb removal acceptance: `../../verification/breadcrumb-removal/README.md`.

## Make image square route (2026-11-07)

Navigation redesign (2026-11-11, local): this route and `/` select the Image disclosure. Its Image ratio / Make square links remain available from every tool page, with the exact route marked current. One desktop text row replaces the permanent child row; narrow screens use one current-tool disclosure containing all destinations. Route identity, SEO and export behavior are unchanged. Local evidence: reports/2026-11-11/tool-navigation-redesign/ in the parent workspace. This supersedes the earlier two-row navigation candidate. Released in the combined TASK-9/TASK-29 production version recorded above.

`/make-image-square` renders `SquareImageMaker` with the shared header, `CalculatorNavigation` (Image is selected, with the exact image-tool child selected) and the H1 "Make image square". It is a WebApplication with review date 2026-11-07. It is listed in SITE_PAGES/SITE_LABELS ("Make image square"), so it joins trailing-slash 308s, canonical-with-origin and the indexable sitemap. The preview stays noindex/nofollow with an empty sitemap. `scripts/verify-http.py` and `public/llms.txt` list it. The `routeTree.gen.ts` entry was added in generator format; confirm that a build produces no further diff. Released on 2026-11-11; production is indexable while local preview remains noindex.

## Home image route migration (2026-11-07)

`/` renders the upload-only image checker (`Calculator media="image"` + `ImageRatioGuide`) with the former image title, description and guide; it never redirects. `/calculator` renders the manual calculator (H1 and title `Aspect Ratio Calculator`, unchanged defaults, Reset and preset order). `/image-aspect-ratio` (with or without trailing slash) answers 308 to `/` in `src/server.ts`, keeping the query string; its route also throws a client `redirect` to `/`. It is not in SITE_PAGES, so it is excluded from the sitemap and canonicals. SITE_PAGES lists `/` and `/calculator`; SITE_LABELS names `/` "Image ratio" (breadcrumb home) and `/calculator` "Calculator". Logos stay on `/`; photo-inspection links go to `/`, manual-ratio links go to `/calculator`. Noindex/nofollow and the build-time-origin rule are unchanged. Not deployed.

## 16:9 calculator and image ratio changer (2026-11-14, local, not released)

`/16-9-aspect-ratio-calculator` and `/change-image-aspect-ratio` follow the header/navigation shell of `/make-image-square`, have unique titles/descriptions, WebApplication JSON-LD dated 2026-11-14, and join SITE_PAGES/SITE_LABELS ("16:9 calculator", "Change image aspect ratio"), `scripts/verify-http.py` and `public/llms.txt`. Preview stays noindex/nofollow with an empty sitemap; indexable builds list 19 routes. The Mac build regenerated `routeTree.gen.ts`, including the digit-leading 16:9 route. Behavior contract: [product specification](../../docs/product-spec.md#169-calculator-and-image-ratio-changer-implemented-locally-2026-11-14-not-released).

Mac acceptance (2026-11-14): 69 browser assertions, 13 independently verified image downloads, 10 HTTP checks, build and no-emit TypeScript check passed against the frozen noindex candidate. Evidence: `../../../reports/2026-11-14/imageaspectratio-new-pages/README.md`. This is local acceptance, not a release.

Calculator menu (2026-11-14, local): the Calculator primary section is a disclosure with All ratios and 16:9; both routes select it. See [product specification](../../docs/product-spec.md#calculator-menu-and-continuous-image-placement-local-2026-11-14-supersedes-conflicting-notes-above).


## Screenshot Studio route (2026-11-14, local, not released)

`/screenshot-beautifier` joins `SITE_PAGES`/`SITE_LABELS` ("Screenshot Studio"), `CalculatorNavigation` (`Image` disclosure), shared footer, `scripts/verify-http.py` and `public/llms.txt`, with `WebApplication` JSON-LD dated `2026-11-14`. Preview stays `noindex, nofollow` with an empty sitemap; indexable builds list 20 routes. Acceptance evidence: `../../../reports/2026-11-14/screenshot-studio/README.md`.
