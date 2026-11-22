import { createFileRoute } from "@tanstack/react-router";
import { Crop, Droplets, PenLine } from "lucide-react";
import { ScreenshotStudio } from "@/components/ScreenshotStudio";
import {
  buildV3RouteHead,
  V3Editorial,
  type V3FaqItem,
  type V3FeatureItem,
  type V3StepItem,
} from "@/components/v3/V3Editorial";
import { V3PageShell } from "@/components/v3/V3PageShell";

const PAGE_TITLE = "Screenshot Beautifier — Add Backgrounds & Frames Online";
const DESCRIPTION =
  "Free online screenshot beautifier to add gradient, blurred, or solid backgrounds, rounded window frames, drop shadows, and crisp callouts in your browser.";

const STEPS: readonly V3StepItem[] = [
  {
    title: "Drop or paste your capture",
    description:
      "Drag a PNG, JPG, or WebP screenshot onto the canvas, click Choose screenshot, or press Cmd+V / Ctrl+V directly from your clipboard.",
  },
  {
    title: "Add background, frame & shadow",
    description:
      "Pick a studio gradient, ambient blur backdrop, wallpaper, or solid color, then dial in balanced padding, corner radius, glass bezel, and elevation.",
  },
  {
    title: "Annotate & export crisp PNG",
    description:
      "Add curved arrows, step badges, pill or transparent labels, or Gaussian blur redaction, then copy or download up to 4096 px.",
  },
];

const FEATURES: readonly V3FeatureItem[] = [
  {
    title: "Curated Gradients, Blur & Custom Stops",
    description:
      "Add a clean background to any screenshot using studio mesh gradients, ambient image blur, custom 3-stop gradients, or reusable saved presets.",
  },
  {
    title: "Auto-Balanced Padding & Glass Bezels",
    description:
      "Wrap raw captures in rounded corners, subtle drop shadows, optional translucent glass bezels, and edge-color-matched inset balance.",
  },
  {
    title: "Full-Canvas Callouts & Margin Notes",
    description:
      "Place curved arrows, numbered steps, freehand strokes, and transparent or pill text labels anywhere — including across the outer background margin.",
  },
  {
    title: "Built-In Blur, Mosaic & Spotlight",
    description:
      "Hide private emails or tokens with smooth Gaussian blur (B) or coarse mosaic blocks, or dim surrounding UI with a spotlight cutout.",
  },
  {
    title: "Exact Social & Presentation Ratios",
    description:
      "Keep natural screenshot proportions with Auto, or lock export frames to 16:9, 4:3, 3:2, 1:1, 4:5, or 9:16 for slides, X, LinkedIn, and docs.",
  },
  {
    title: "100% Client-Side Privacy",
    description:
      "Decoding, background framing, annotation rendering, and PNG/JPG encoding run entirely on an HTML5 canvas inside your browser — zero server uploads.",
  },
];

const EXPORT_SPECS = [
  { preset: "Auto (Fit capture)", ratio: "Source + padding", typical: "Docs, GitHub PRs, changelogs, Slack" },
  { preset: "Widescreen Deck", ratio: "16:9", typical: "Slide decks, YouTube chapters, hero banners" },
  { preset: "Presentation Classic", ratio: "4:3 · 3:2", typical: "Blog illustrations, Notion & Substack embeds" },
  { preset: "Square Feed", ratio: "1:1", typical: "LinkedIn carousels, Instagram grid, community posts" },
  { preset: "Portrait & Vertical", ratio: "4:5 · 9:16", typical: "Mobile showcases, Instagram Portrait, Stories" },
] as const;

const FAQS: readonly V3FaqItem[] = [
  {
    question: "Is Screenshot Beautifier completely free without watermarks?",
    answer:
      "Yes. Every gradient background, custom preset, annotation tool, aspect ratio lock, and high-resolution PNG or JPG export is free to use with zero watermarks or sign-up gates.",
  },
  {
    question: "How do I add a background to a screenshot without losing text sharpness?",
    answer:
      "Paste or open your capture, pick a gradient, solid, or blurred backdrop in the framing sidebar, and adjust Padding and Shadow. Your screenshot stays crisp at native resolution and exports cleanly as lossless PNG up to 4096 px.",
  },
  {
    question: "Are my screenshots uploaded to an external server?",
    answer:
      "No. Your image is decoded locally in browser memory and rendered on an HTML5 canvas on your device. Neither image bytes nor text annotations leave your browser.",
  },
  {
    question: "Can I draw arrows or place text labels outside the screenshot on the background?",
    answer:
      "Yes. Once padding is greater than zero, curved arrows, freehand pen lines, step counters, shapes, and transparent or pill text labels can sit directly on the outer background frame.",
  },
  {
    question: "Can I use the exported visuals in commercial products, SaaS landing pages, or client decks?",
    answer:
      "Yes. All built-in backgrounds and vector annotations carry no licensing restrictions — you retain full rights to publish exported images in commercial sites, changelogs, docs, and ads.",
  },
];

export const Route = createFileRoute("/screenshot-beautifier")({
  head: () =>
    buildV3RouteHead({
    forceNoindex: false,
      title: PAGE_TITLE,
      description: DESCRIPTION,
      canonicalPath: "/screenshot-beautifier",
      appName: "Screenshot Beautifier",
      howToTitle: "How to Beautify & Add a Background to a Screenshot Online",
      steps: STEPS,
      faqs: FAQS,
    }),
  component: ScreenshotBeautifierV3Page,
});

function ScreenshotBeautifierV3Page() {
  return (
    <V3PageShell
      title="Screenshot Beautifier"
      hero={{
        title: (
          <>
            Screenshot <span className="text-primary">Beautifier</span>
          </>
        ),
        description:
          "Add gradient, blurred, or solid backgrounds, rounded frames, drop shadows, and crisp callouts to any screenshot right in your browser.",
      }}
    >
      <ScreenshotStudio />

      <V3Editorial
        overview={{
          eyebrow: "Clean Product Visuals",
          heading: "Add a Clean Background & Frame to Any Screenshot",
          lead: "Unframed browser crops often clash with article backgrounds or get clipped awkwardly by social feeds. Wrapping a capture in balanced padding, subtle elevation, and locked aspect ratios turns raw UI grabs into polished product visuals in seconds — without opening Figma.",
        }}
        visualGuide={{
          eyebrow: "Before & After",
          heading: "Raw Browser Clip vs. Framed Studio Screenshot",
          src: "/previews/screenshot-beautifier-workflow.webp",
          width: 1120,
          height: 500,
          alt: "Before and after screenshot beautifier comparison: raw unframed SaaS billing screenshot on the left versus framed capture on Northern Light gradient background with 12px rounded corners, drop shadow, numbered step badge, and red curved arrow on the right",
          caption:
            "Default Northern Light gradient preset with 48 px balanced padding, 12 px window corner radius, soft elevation shadow, and curved arrow + step callout.",
        }}
        shortcuts={{
          heading: "Studio Shortcuts",
          items: [
            { keys: ["⌘/Ctrl", "V"], action: "Paste capture" },
            { keys: ["A"], action: "Curved arrow" },
            { keys: ["T"], action: "Text callout" },
            { keys: ["N"], action: "Step badge" },
            { keys: ["B"], action: "Blur redact" },
            { keys: ["M"], action: "Mosaic" },
            { keys: ["C"], action: "Crop" },
            { keys: ["[", "]"], action: "Scale markup" },
          ],
        }}
        howTo={{
          heading: "How to Beautify & Add a Background to a Screenshot",
          steps: STEPS,
        }}
        features={{
          heading: "Everything Needed to Frame & Polish Captures",
          items: FEATURES,
        }}
        referenceSection={
          <section aria-labelledby="v3-export-ratios" className="space-y-4">
            <div className="space-y-1">
              <p className="v3-eyebrow">Canvas Ratios</p>
              <h2
                id="v3-export-ratios"
                className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl"
              >
                Recommended Export Frame Ratios
              </h2>
            </div>

            <div className="v3-table-wrap">
              <table className="v3-table">
                <thead>
                  <tr>
                    <th scope="col">Preset</th>
                    <th scope="col">Aspect Ratio</th>
                    <th scope="col">Best Destination</th>
                  </tr>
                </thead>
                <tbody>
                  {EXPORT_SPECS.map(row => (
                    <tr key={row.preset}>
                      <td className="font-semibold text-foreground">{row.preset}</td>
                      <td className="num font-medium text-foreground">{row.ratio}</td>
                      <td className="text-muted-foreground">{row.typical}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        }
        faq={{
          items: FAQS,
        }}
        relatedTools={{
          items: [
            {
              to: "/blur-screenshot",
              title: "Blur & Pixelate Screenshot",
              description:
                "Redact emails, API keys, and sensitive customer data with Gaussian blur or mosaic blocks.",
              icon: <Droplets className="h-4 w-4" />,
            },
            {
              to: "/annotate-screenshot",
              title: "Annotate Screenshot",
              description:
                "Add curved arrows, numbered steps, highlighter bands, and freehand red ink for bug reports.",
              icon: <PenLine className="h-4 w-4" />,
            },
            {
              to: "/change-image-aspect-ratio",
              title: "Change Image Aspect Ratio",
              description:
                "Fit or crop any photo to exact Instagram, YouTube, or Open Graph pixel dimensions.",
              icon: <Crop className="h-4 w-4" />,
            },
          ],
        }}
      />
    </V3PageShell>
  );
}
