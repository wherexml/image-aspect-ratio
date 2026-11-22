<p align="center"><img src="public/favicon.svg" width="96" alt="Image Aspect Ratio icon"></p>
<h1 align="center">Image Aspect Ratio</h1>
<p align="center">Find your image aspect ratio. Calculate the dimensions you need.</p>
<p align="center"><a href="https://imageaspectratio.com/">Open the calculator</a> · <a href="https://github.com/wherexml/image-aspect-ratio/issues">Report an issue</a> · <a href="LICENSE">MIT license</a></p>

Image Aspect Ratio is a free, browser-based calculator for image dimensions and proportions. Calculate an exact ratio from width and height, find a matching dimension, and compare Fit and Fill previews. Separate tools cover video and ultrawide dimensions.

## A closer look

### Calculate without losing precision

Open `/calculator` and switch between **Calculate size**, **Aspect ratio** and **Scale dimensions**. Choose from ten primary ratios and one additional ratio, enter your dimensions and copy the result. Exact fractions remain available alongside rounded pixel values.

### Preview an image in a different frame

In this source revision, `/` opens the Image tool. Select a local image and inspect its read-only dimensions. Compare **Fit** and **Fill** to see padding or the visible crop area. The selected image is read locally in your browser.

### Compare video and ultrawide proportions

[Video aspect ratio](https://imageaspectratio.com/video-aspect-ratio) compares horizontal and vertical frames using entered dimensions. The [Ultrawide calculator](https://imageaspectratio.com/ultrawide-aspect-ratio-calculator) distinguishes exact screen-resolution ratios from the familiar 21:9 category.

### Understand aspect ratio

The `/what-is-aspect-ratio` guide explains proportions, pixel dimensions and framing with original SVG diagrams, worked examples and links to primary documentation.

## Features

- **Exact ratio math:** BigInt fractions preserve the calculation; rounding is labeled.
- **Ordered presets:** eleven ratios from portrait to wide; social examples order matching ratios by size and place comparisons last.
- **Related workflows:** carry results between dimension, ratio and resize modes.
- **Fit/Fill previews:** inspect framing before deciding how to prepare an image or video.
- **Responsive interface:** shared navigation and system, light and dark themes.

`/make-image-square` pads or crops one local photo and downloads a square PNG or JPEG (1–4096 px) rendered in the browser. `/change-image-aspect-ratio` does the same for 1:1, 4:5, 9:16 or 16:9 output (each side 1–4096 px). `/screenshot-beautifier` (**Screenshot Studio**) opens or pastes one local screenshot, crops, adds directly editable annotations (3-handle curved arrows and lines, 8-handle shapes, highlights, step counters, inline text callouts, spotlight and irreversible block pixelation), frames with auto-balanced gradients or plain backgrounds, and exports PNG or JPEG (up to 4096 px). `/16-9-aspect-ratio-calculator` solves the missing width or height at exact 16:9 and applies common resolutions. The other tools calculate numbers and preview framing; they do **not** export files, transcode videos, or change display settings. Video calculations assume square pixels.

## Run locally

Verified with **Bun 1.3.14** and **Node.js 22.23.1**. Dependencies are pinned in `bun.lock`.

```sh
git clone https://github.com/wherexml/image-aspect-ratio.git
cd image-aspect-ratio
bun install --frozen-lockfile
npm run dev -- --host 127.0.0.1 --port 18786 --strictPort
```

Open [the local preview](http://127.0.0.1:18786/). Development is noindex by default. Do not put credentials in public `VITE_*` settings.

## Build from source

```sh
bunx tsc --noEmit
npm run build
node scripts/prepare-worker.mjs
npm run preview
```

The built Worker runs locally at [127.0.0.1:18767](http://127.0.0.1:18767/). Production builds use `.env.production`, including the public canonical domain and indexability settings. Run the HTTP acceptance checks in another terminal:

```sh
python3 scripts/verify-http.py http://127.0.0.1:18767 https://imageaspectratio.com indexable
```

The application uses React, TypeScript, TanStack Start and Tailwind CSS, with Cloudflare Workers SSR and Static Assets. Deployment requires separate authorization. Verify repository workflows and connected hosting integrations before pushing; a historical CI configuration is not proof of current automation. See [deployment and rollback](docs/deployment.md) and [source reproduction](docs/release-reproduction.md).

## Privacy and scope

Local image selection is processed in the browser. The application does not upload selected image files for its preview. Hosting requests are subject to the live site's [Privacy](https://imageaspectratio.com/privacy) and [Terms](https://imageaspectratio.com/terms) pages. Avoid including private images, credentials or account information when reporting an issue.

## Project documentation

- [Current product specification](docs/product-spec.md)
- [Measurement and privacy](docs/tool-analytics.md)
- [Rendering and font delivery](docs/performance.md)
- [Component workflows](src/components/README.md)
- [Routes and SEO contracts](src/routes/README.md)
- [Design principles](DESIGN.md)
- [Contributor instructions](AGENTS.md)

New content, documentation, code comments and GitHub records use English. Older documents are being updated incrementally. Historical verification paths refer to local evidence and are not required to build a checkout.

## Project status

Maintained by [wherexml](https://github.com/wherexml). Originally exported from [Lovable](https://lovable.dev); provenance is recorded in `LOCAL-EXPORT.json`. The repository remains connected to Lovable, so published Git history must not be rewritten.

The public site is **imageaspectratio.com**. This README describes the source revision, not a claim that its latest routes are deployed. Deployment, ownership verification and indexing are separate checks; indexing requests do not guarantee inclusion or ranking. [Report an issue](https://github.com/wherexml/image-aspect-ratio/issues) with the page, input dimensions, expected result and steps to reproduce.
