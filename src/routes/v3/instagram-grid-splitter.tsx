import { createFileRoute } from "@tanstack/react-router";
import { Crop, Maximize2, ShieldCheck } from "lucide-react";
import { InstagramGridSplitterV3 } from "@/components/v3/tools/InstagramGridSplitterV3";
import {
  buildV3RouteHead,
  V3Editorial,
  type V3FaqItem,
  type V3FeatureItem,
  type V3StepItem,
} from "@/components/v3/V3Editorial";
import { V3PageShell } from "@/components/v3/V3PageShell";

const PAGE_TITLE = "Instagram 3:4 Grid & 4:5 Carousel Splitter Online";
const DESCRIPTION =
  "Split panoramas or carousels into 3×1, 3×2, or 3×3 tiles aligned to Instagram's 3:4 profile grid (1080×1350 / 1012.5×1350) with one-click ZIP download.";

const STEPS: readonly V3StepItem[] = [
  {
    title: "Pick Carousel or 3:4 Profile Grid",
    description:
      "Select Seamless Carousel (2–10 slides at 4:5 or 3:4) or 3:4 Profile Grid (3×1, 3×2, 3×3, or 3×4 tiles at 1080×1440 px each).",
  },
  {
    title: "Drop artwork & inspect seams",
    description:
      "Upload your panorama or poster, preview exact swipe seams, and check Slide 1’s 68 px profile-grid trim warning.",
  },
  {
    title: "Save individual tiles or .zip",
    description:
      "Tap individual numbered tiles to save directly on iPhone/Android, or download all slices in one zero-watermark .zip archive on desktop.",
  },
];

const FEATURES: readonly V3FeatureItem[] = [
  {
    title: "Built for Modern 3:4 Instagram Grids",
    description:
      "Unlike legacy 1:1 square splitters, exports true 3:4 (1080 × 1440 px) profile grid cells so multi-post banners align without cutoffs.",
  },
  {
    title: "Seamless 4:5 (1080×1350) Carousels",
    description:
      "Slice 2 to 10 continuous horizontal slides at Instagram’s maximum tall feed resolution for smooth panoramic swipes.",
  },
  {
    title: "Slide 1 Profile Trim Guard (68 px)",
    description:
      "When posting a 4:5 (1080×1350) carousel, Instagram’s 3:4 profile grid trims ~34 px off both left and right edges — preview that crop live before exporting.",
  },
  {
    title: "Reverse Upload Order Numbering",
    description:
      "Profile grid tiles are automatically badged Post #1 (bottom-right) through Post #N (top-left) so your puzzle never stacks backwards.",
  },
  {
    title: "iOS Safari Safe + Single-Tap Save",
    description:
      "Slices one offscreen tile at a time to avoid mobile browser memory crashes, offering both tap-to-save tiles and desktop .zip download.",
  },
  {
    title: "100% Local & Watermark-Free",
    description:
      "Client-side HTML5 Canvas slicing keeps campaign visuals private in your browser with zero watermarks or sign-up walls.",
  },
];

const CANVAS_MATH_TABLE = [
  { layout: "2-Slide 4:5 Carousel", master: "2160 × 1350 px", perTile: "1080 × 1350 px", order: "Chronological (1 → 2)" },
  { layout: "3-Slide 4:5 Carousel", master: "3240 × 1350 px", perTile: "1080 × 1350 px", order: "Chronological (1 → 2 → 3)" },
  { layout: "5-Slide 4:5 Carousel", master: "5400 × 1350 px", perTile: "1080 × 1350 px", order: "Chronological (1 → 5)" },
  { layout: "3 × 1 Profile Banner (3:4)", master: "3240 × 1440 px", perTile: "1080 × 1440 px", order: "Reverse (Post #1 right → #3 left)" },
  { layout: "3 × 3 Profile Puzzle (3:4)", master: "3240 × 4320 px", perTile: "1080 × 1440 px", order: "Reverse (Post #1 bottom-right → #9)" },
] as const;

const FAQS: readonly V3FaqItem[] = [
  {
    question: "Did Instagram change its profile grid from 1:1 squares to 3:4 rectangles?",
    answer:
      "Yes. Modern Instagram profiles display post thumbnails in a vertical 3:4 ratio (equivalent to 1080 × 1440 px) rather than legacy 1:1 squares. Splitting profile banners at 3:4 prevents horizontal misalignment across rows.",
  },
  {
    question: "Should I design seamless carousels at 4:5 (1080×1350) or 3:4 (1080×1440)?",
    answer:
      "4:5 (1080 × 1350 px per slide) remains the universal feed carousel standard, while 3:4 (1080 × 1440 px) matches the profile grid 1:1. If you choose 4:5, keep essential text on Slide 1 at least 34 px away from the left and right edges so the 3:4 profile thumbnail doesn’t clip it.",
  },
  {
    question: "In what order do I upload a 3×3 Instagram profile grid?",
    answer:
      "Because Instagram pushes older posts down and to the right as you publish new ones, upload Post #1 (the bottom-right tile) first, continue right-to-left up each row, and upload the top-left tile last.",
  },
  {
    question: "Can I save individual carousel slides on an iPhone without unzipping a file?",
    answer:
      "Yes. Click Slice into Individual Tiles to render tap-to-download cards right below the preview canvas, or use Download All (.zip) when working on Mac or Windows.",
  },
];

export const Route = createFileRoute("/v3/instagram-grid-splitter")({
  head: () =>
    buildV3RouteHead({
      title: PAGE_TITLE,
      description: DESCRIPTION,
      canonicalPath: "/instagram-grid-splitter",
      appName: "Instagram 3:4 Grid & 4:5 Carousel Splitter",
      howToTitle: "How to Split an Image for Instagram 3:4 Grids & 4:5 Carousels",
      steps: STEPS,
      faqs: FAQS,
    }),
  component: InstagramGridSplitterPage,
});

function InstagramGridSplitterPage() {
  return (
    <V3PageShell
      title="Instagram Grid & Carousel Splitter"
      compareV2To="/v2/social-media"
      hero={{
        title: (
          <>
            Instagram <span className="text-primary">3:4 Grid &amp; 4:5 Carousel</span> Splitter
          </>
        ),
        description:
          "Slice wide panoramas into seamless 1080×1350 swipeable carousels or modern 1080×1440 (3:4) profile grids — locally in your browser with zero watermarks.",
      }}
    >
      <InstagramGridSplitterV3 />

      <V3Editorial
        overview={{
          eyebrow: "Updated for 3:4 Profile Grids",
          heading: "Exact Pixel Slicing for Modern Instagram Carousels & Banners",
          lead: "Old 1:1 grid splitters leave awkward cropped gaps on Instagram’s vertical 3:4 profile layout. Calculate exact master canvas widths, preview Slide 1’s ~68 px profile-grid trim (1012.5 × 1350 center window inside 1080 × 1350), and export crisp numbered PNG or JPG tiles in seconds.",
        }}
        visualGuide={{
          eyebrow: "Carousel vs. Grid Slicing",
          heading: "Seamless 4:5 Swipe Carousel & Reverse-Numbered 3:4 Profile Grid",
          src: "/previews/instagram-3x4-grid-split.webp",
          width: 1120,
          height: 500,
          alt: "Diagram comparing a 3-slide 3240x1350 seamless 4:5 Instagram carousel with Slide 1 34px side-trim guides on the left and a 6-tile 3:4 1080x1440 Instagram profile grid numbered in reverse upload order from #1 bottom-right to #6 top-left on the right",
          caption:
            "Left: chronological 4:5 carousel slices (1080 × 1350 px) with amber ~34 px side-trim guards on Slide 1. Right: reverse-numbered 3:4 profile grid tiles (1080 × 1440 px; verified 2026-11).",
        }}
        howTo={{
          heading: "How to Split Panoramas & Grids Without Losing Quality",
          steps: STEPS,
        }}
        features={{
          heading: "Designed Around Real Creator Publishing Pain Points",
          items: FEATURES,
        }}
        referenceSection={
          <section aria-labelledby="v3-ig-math-heading" className="space-y-4">
            <div className="space-y-1">
              <p className="v3-eyebrow">Master Canvas Cheat Sheet</p>
              <h2
                id="v3-ig-math-heading"
                className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl"
              >
                Instagram Carousel &amp; 3:4 Grid Dimensions
              </h2>
            </div>

            <div className="v3-table-wrap">
              <table className="v3-table">
                <thead>
                  <tr>
                    <th scope="col">Layout Type</th>
                    <th scope="col">Master Design Size</th>
                    <th scope="col">Exported Tile Size</th>
                    <th scope="col">Upload Sequence</th>
                  </tr>
                </thead>
                <tbody>
                  {CANVAS_MATH_TABLE.map(row => (
                    <tr key={row.layout}>
                      <td className="font-semibold text-foreground">{row.layout}</td>
                      <td className="num font-medium text-foreground">{row.master}</td>
                      <td className="num text-muted-foreground">{row.perTile}</td>
                      <td className="text-muted-foreground">{row.order}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        }
        faq={{ items: FAQS }}
        relatedTools={{
          items: [
            {
              to: "/v3/fit-photo-to-instagram",
              title: "Fit Photo to Instagram",
              description:
                "Fit full landscape or tall photos into 4:5, 3:4, or 9:16 frames without cropping.",
              icon: <Crop className="h-4 w-4" />,
            },
            {
              to: "/v3/safe-zone-checker",
              title: "9:16 Safe Zone Checker",
              description:
                "Verify Reels, TikTok, and Shorts text placement against app button overlays.",
              icon: <ShieldCheck className="h-4 w-4" />,
            },
            {
              to: "/v3/add-padding-to-image",
              title: "Add Padding & White Border",
              description:
                "Wrap single photos in clean gallery white borders or Polaroid frames.",
              icon: <Maximize2 className="h-4 w-4" />,
            },
          ],
        }}
      />
    </V3PageShell>
  );
}
