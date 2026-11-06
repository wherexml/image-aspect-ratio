# Product specification

Current source contract, 2026-11-07. This document describes behavior to preserve; it is not a production release announcement. Dated module notes retain earlier evidence and are superseded where they conflict with this specification.

## Entry points

| Route | Workflow |
| --- | --- |
| `/` | Image: local upload, read-only decoded dimensions and exact ratio, Fit/Fill previews |
| `/calculator` | Manual Calculate size, Aspect ratio and Scale dimensions |
| `/image-aspect-ratio` | Legacy compatibility redirect to `/` |
| `/video-aspect-ratio` | Existing editable video dimensions and numeric tools |
| `/ultrawide-aspect-ratio-calculator` | Exact screen-size ratios and strict 21:9 comparison |
| `/social-media` | Instagram, YouTube and TikTok link groups |
| Five social detail routes | Platform-specific dimension examples and exact calculations |
| Two educational guides | Aspect-ratio concepts and exact fractions versus rounded pixels |

Shared navigation orders Image, Calculator, Video, Social Media and Ultrawide. Logos return to `/`. Photo-inspection links target `/`; manual-calculation links target `/calculator`. Tool entries are active only for their exact path; Social Media includes its child pages. Do not redirect `/` to the manual calculator. The legacy image path redirects with 308 on HTTP GET/HEAD, preserving its query; client routing also resolves it to Image.

## State and calculation

Image begins empty and has no manual numeric tools. Only a successful local decode reveals read-only dimensions, ratio/copy and previews. Replacing, removing or failing a file clears its displayed image results; asynchronous stale reads cannot win. State is not promised to survive navigation or reload. Video's editable workflow is distinct and unchanged.

Manual modes retain independent target dimensions and known sides. Reset restores the established defaults; selecting a different presentation order must never redefine default state. BigInt fractions remain authoritative; floating-point approximations are for drawing only. Copy never substitutes a nearby common ratio or reports success after failure.

General presets run from narrow to wide, ten primary choices plus 2:1 in More. Social examples of the same ratio run small-to-large, comparisons last. Ultrawide uses ascending commercial sizes, followed by the 32:9 example and strict 21:9. Stable preset IDs/original indices connect selection to restoration. Details: [components](../src/components/README.md).

## Layout and content

Manual and social desktop tools place preview left and controls/results right; mobile places controls/results first. Image is a separate upload page, with no secondary input tabs. Preserve the single brand token, existing dark/light themes, English product content and uncluttered UI. No explanatory badges or status text are required by this specification.

## SEO, delivery and privacy

Every canonical route participates in SITE_PAGES; the legacy image redirect does not. Route titles, JSON-LD and canonical paths match the actual workflow. The site origin is an explicit public build setting, never inferred from request Host. With no configured origin, omit canonical identity URLs; noindex previews have empty sitemaps. Production indexability is a separate authorized release concern.

Framework-managed inline CSS and licensed local font subsets preserve initial rendering. Retain original fonts and licenses. Tool measurement sends categorical outcomes, not dimensions, filenames or image data. GEO relay credentials are runtime secrets, never public VITE settings. See [performance](performance.md), [measurement](tool-analytics.md) and [deployment history](deployment.md).

## Acceptance and release boundary

Record failure cases before changes; prefer repeatable browser E2E. Check direct/SPA routes, unique navigation activity, Image upload/Remove/error isolation, manual default/calculation/Reset, desktop/mobile geometry, affected related links and SSR/noindex behavior. Smoke-check existing Video, Ultrawide and Social tools after shared changes. Keep local screenshots, fixtures, logs and reports outside committed application inputs.

The latest local route acceptance recorded 36 browser assertions and 10 HTTP checks; its evidence resides in the parent SEO workspace under reports/2026-11-07/task51-home-image-routes. This is historical local evidence, not a clean-checkout or remote-CI result. A Git push, passing build or accepted preview does not authorize deployment. Inspect current CI and hosting integrations before pushing; report absent checks as absent rather than passed.
