import { createFileRoute } from "@tanstack/react-router";
import { Calculator, Image as ImageIcon, Maximize2 } from "lucide-react";
import { StudioFrameEditorV2 } from "@/components/v2/StudioFrameEditorV2";
import {
  buildV3RouteHead,
  V3Editorial,
  type V3FaqItem,
  type V3FeatureItem,
  type V3StepItem,
} from "@/components/v3/V3Editorial";
import { V3PageShell } from "@/components/v3/V3PageShell";

const PAGE_TITLE = "Change Image Aspect Ratio Online — 16:9, 4:5 & 9:16 Resizer";
const DESCRIPTION =
  "Crop or pad any photo to 1:1, 4:5, 3:4, 9:16, 16:9, or custom aspect ratios without stretching. Export crisp PNG or JPG files locally in browser.";

const STEPS: readonly V3StepItem[] = [
  {
    title: "Select a target aspect ratio",
    description:
      "Pick a common frame like 1:1, 4:5, 9:16, 16:9, 4:3, 3:2, or 21:9 — or choose Custom to enter any W : H proportion.",
  },
  {
    title: "Choose Fit whole or Crop to fill",
    description:
      "Keep 100% of your photo with clean solid, blurred, or transparent margins — or crop to cover the frame and drag to re-center.",
  },
  {
    title: "Set pixel width & download",
    description:
      "Check the Export canvas pixel readout, choose lossless PNG or compact JPG, and download up to 4096 px.",
  },
];

const FEATURES: readonly V3FeatureItem[] = [
  {
    title: "Zero Stretching or Squashing",
    description:
      "Source proportions are strictly preserved using exact rational math — switch freely between letterboxed padding and edge-to-edge cropping.",
  },
  {
    title: "Ambient Photo Blur & Alpha Backdrops",
    description:
      "Fill letterbox bars with a soft blurred echo of your own photo, a true transparent PNG alpha channel, or any custom hex color.",
  },
  {
    title: "Interactive Drag & Zoom Reframing",
    description:
      "Pan directly on the live canvas and fine-tune zoom with smooth logarithmic scaling when cropping portraits or product shots.",
  },
  {
    title: "Exact BigInt Pixel Calculation",
    description:
      "Custom ratios (including decimal forms like 1.91:1 or 1200:630) compute exact output heights without floating-point drift.",
  },
  {
    title: "Social & Presentation Ready",
    description:
      "Defaults to standard publishing widths (1080 px for 1:1, 4:5, 9:16 and 1920 px for 16:9) while letting you enter any width from 1 to 4096 px.",
  },
  {
    title: "Private Local Browser Encoding",
    description:
      "Photos up to 20 MB and 50 MP are framed and encoded inside your browser — personal photos and campaign drafts never upload.",
  },
];

const PLATFORM_TABLE = [
  {
    destination: "Instagram Feed Portrait / Grid",
    ratio: "4:5 · 3:4",
    pixels: "1080 × 1350 / 1080 × 1440 px",
    notes: "4:5 classic portrait & 3:4 native profile grid (official 1.91:1–3:4 range)",
  },
  {
    destination: "Instagram / LinkedIn Square",
    ratio: "1:1",
    pixels: "1080 × 1080 px",
    notes: "Classic square post, avatar frame, and carousel card",
  },
  {
    destination: "Stories, Reels, TikTok & Shorts",
    ratio: "9:16",
    pixels: "1080 × 1920 px",
    notes: "Full-screen vertical mobile frame",
  },
  {
    destination: "YouTube Thumbnail & Widescreen",
    ratio: "16:9",
    pixels: "1920 × 1080 px",
    notes: "Full HD video cover, presentation slide, and hero image",
  },
  {
    destination: "Open Graph / X / LinkedIn Link",
    ratio: "1.91:1 (40:21)",
    pixels: "1200 × 630 px",
    notes: "Standard social link-preview card (og:image)",
  },
  {
    destination: "Classic Presentation & Tablet",
    ratio: "4:3",
    pixels: "1600 × 1200 px",
    notes: "Editorial photo frame, iPad canvas, and traditional decks",
  },
] as const;

const FAQS: readonly V3FaqItem[] = [
  {
    question: "How do I change an image’s aspect ratio without stretching it?",
    answer:
      "You have two distortion-free choices: Fit whole image keeps the entire photo intact and fills the extra space with a solid color, blurred photo backdrop, or transparency; Crop to fill enlarges the photo to cover the new frame so you can drag to position the subject.",
  },
  {
    question: "What pixel size should I use for Instagram posts?",
    answer:
      "Use 1080 × 1350 px (4:5 portrait) for maximum vertical feed presence, 1080 × 1080 px (1:1) for square posts, and 1080 × 1920 px (9:16) for Stories and Reels.",
  },
  {
    question: "Why does JPG export turn transparent margins white?",
    answer:
      "The JPEG format does not support an alpha transparency channel. If you want transparent padding around a fitted image, keep the export format set to PNG.",
  },
  {
    question: "Can I enter a custom pixel width like 1200 px or 2560 px?",
    answer:
      "Yes. Type any whole-pixel width from 1 to 4096 px into Width (px); the matching height updates automatically in Export canvas while keeping both sides within 4096 px.",
  },
];

export const Route = createFileRoute("/v3/change-image-aspect-ratio")({
  head: () =>
    buildV3RouteHead({
      title: PAGE_TITLE,
      description: DESCRIPTION,
      canonicalPath: "/change-image-aspect-ratio",
      appName: "Change Image Aspect Ratio",
      howToTitle: "How to Change an Image Aspect Ratio Without Distortion",
      steps: STEPS,
      faqs: FAQS,
    }),
  component: ChangeImageAspectRatioV3Page,
});

function ChangeImageAspectRatioV3Page() {
  return (
    <V3PageShell
      title="Change Image Aspect Ratio"
      compareV2To="/v2/change-image-aspect-ratio"
      hero={{
        title: (
          <>
            Change Image <span className="text-primary">Aspect Ratio</span>
          </>
        ),
        description:
          "Crop or pad a photo to 1:1, 4:5, 9:16, 16:9 or any custom ratio in your browser, then download a crisp PNG or JPG.",
      }}
    >
      <StudioFrameEditorV2 mode="ratio" />

      <V3Editorial
        overview={{
          eyebrow: "Distortion-Free Framing",
          heading: "Convert Any Photo to Exact Social & Web Dimensions",
          lead: "Every platform crops differently: a 3:2 camera shot loses its edges in an Instagram 4:5 portrait feed, while a vertical phone capture gets sliced in a 16:9 YouTube thumbnail. Preview Fit vs. Crop live and export exact pixel dimensions in one step.",
        }}
        howTo={{
          heading: "How to Change Image Aspect Ratio",
          steps: STEPS,
        }}
        features={{
          heading: "Designed for Fast Social & Publishing Workflows",
          items: FEATURES,
        }}
        referenceSection={
          <section aria-labelledby="v3-social-sizes-heading" className="space-y-4">
            <div className="space-y-1">
              <p className="v3-eyebrow">Reference Sizes</p>
              <h2
                id="v3-social-sizes-heading"
                className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl"
              >
                Popular Social Media &amp; Web Pixel Dimensions
              </h2>
            </div>

            <div className="v3-table-wrap">
              <table className="v3-table">
                <thead>
                  <tr>
                    <th scope="col">Destination</th>
                    <th scope="col">Aspect Ratio</th>
                    <th scope="col">Recommended Pixels</th>
                  </tr>
                </thead>
                <tbody>
                  {PLATFORM_TABLE.map(row => (
                    <tr key={row.destination}>
                      <td>
                        <div className="font-semibold text-foreground">{row.destination}</div>
                        <div className="text-xs text-muted-foreground">{row.notes}</div>
                      </td>
                      <td className="num font-semibold text-foreground whitespace-nowrap">
                        {row.ratio}
                      </td>
                      <td className="num font-medium text-foreground whitespace-nowrap">
                        {row.pixels}
                      </td>
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
              to: "/v3/make-image-square",
              title: "Make Image Square",
              description:
                "Pad or crop any landscape or portrait photo into a clean 1:1 square avatar or post.",
              icon: <Maximize2 className="h-4 w-4" />,
            },
            {
              to: "/v3",
              title: "Image Aspect Ratio Calculator",
              description:
                "Check any photo’s exact reduced ratio, 300 DPI print size, and nearest standard frame.",
              icon: <ImageIcon className="h-4 w-4" />,
            },
            {
              to: "/v3/calculator",
              title: "Aspect Ratio Calculator",
              description:
                "Calculate missing widths, heights, and exact fractions for any custom resolution.",
              icon: <Calculator className="h-4 w-4" />,
            },
          ],
        }}
      />
    </V3PageShell>
  );
}
