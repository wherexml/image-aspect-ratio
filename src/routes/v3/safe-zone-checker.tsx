import { createFileRoute } from "@tanstack/react-router";
import { Crop, Grid2x2, Share2 } from "lucide-react";
import { SafeZoneCheckerV3 } from "@/components/v3/tools/SafeZoneCheckerV3";
import {
  buildV3RouteHead,
  V3Editorial,
  type V3FaqItem,
  type V3FeatureItem,
  type V3StepItem,
} from "@/components/v3/V3Editorial";
import { V3PageShell } from "@/components/v3/V3PageShell";

const PAGE_TITLE = "TikTok, Reels & Shorts Safe Zone Checker Online (1080×1920)";
const DESCRIPTION =
  "Preview 1080×1920 vertical covers against TikTok, Instagram Reels, and YouTube Shorts UI overlays. Download a free transparent PNG safe-zone guide.";

const STEPS: readonly V3StepItem[] = [
  {
    title: "Select platform or Universal 3-in-1",
    description:
      "Choose TikTok, Instagram Reels, YouTube Shorts, or Universal All-3 mode to apply exact 1080×1920 UI danger margins.",
  },
  {
    title: "Drop or paste your 9:16 frame",
    description:
      "Drag a video screenshot or thumbnail onto the phone stage (or press Cmd+V) to inspect whether captions or buttons cover your text.",
  },
  {
    title: "Download transparent guide PNG",
    description:
      "Export a 1080×1920 transparent guide PNG to drop onto Track 2 in CapCut, Premiere, or Final Cut — or save an annotated review image.",
  },
];

const FEATURES: readonly V3FeatureItem[] = [
  {
    title: "Combined Universal 9:16 Safe Box",
    description:
      "Cross-posting one vertical video everywhere? Universal mode highlights the exact 792 × 1020 px core clear across TikTok, Reels, and Shorts simultaneously.",
  },
  {
    title: "Downloadable 1080×1920 Alpha Guide",
    description:
      "Export a crisp transparent PNG safe-zone overlay in one click — ready to place on your timeline in CapCut, Premiere Pro, DaVinci, or Figma.",
  },
  {
    title: "Simulated App Button & Caption Chrome",
    description:
      "Toggle realistic right-side engagement stacks, top navigation pills, and bottom caption/music bars to see why margins matter.",
  },
  {
    title: "3:4 Profile Grid Cover Crop Line",
    description:
      "Enable the Y: 240–1680 px guide to verify your 9:16 Reel cover still centers cleanly on Instagram’s modern 3:4 profile grid.",
  },
  {
    title: "Zero Upload Client-Side Privacy",
    description:
      "Unreleased campaign frames and creator thumbnails decode locally inside your browser tab — nothing is uploaded to external servers.",
  },
  {
    title: "Adjustable Danger Mask Opacity",
    description:
      "Slide danger tint opacity from 15% to 85% so dark or bright video frames remain easy to read during layout checks.",
  },
];

const SAFE_ZONE_TABLE = [
  {
    platform: "Universal Safe Core (All 3)",
    top: "250 px",
    bottom: "650 px",
    leftRight: "120 px L · 168 px R",
    safeBox: "792 × 1020 px",
  },
  {
    platform: "TikTok (1080 × 1920)",
    top: "180 px",
    bottom: "560 px",
    leftRight: "64 px L · 168 px R",
    safeBox: "848 × 1180 px",
  },
  {
    platform: "Instagram Reels (1080 × 1920)",
    top: "220 px",
    bottom: "640 px",
    leftRight: "60 px L · 132 px R",
    safeBox: "888 × 1060 px",
  },
  {
    platform: "YouTube Shorts (1080 × 1920)",
    top: "192 px",
    bottom: "540 px",
    leftRight: "60 px L · 156 px R",
    safeBox: "864 × 1188 px",
  },
] as const;

const FAQS: readonly V3FaqItem[] = [
  {
    question: "What is the safest area for text when cross-posting to TikTok, Reels, and Shorts?",
    answer:
      "On a standard 1080 × 1920 px (9:16) canvas, keeping titles, burned-in subtitles, and logos inside X: 120–912 px and Y: 250–1270 px (792 × 1020 px) avoids top search bars, right-hand engagement icons, and multi-line bottom captions across all three platforms.",
  },
  {
    question: "How do I use the downloaded transparent safe zone PNG in CapCut or Premiere Pro?",
    answer:
      "Click Download Transparent Guide PNG (1080×1920), import the PNG into your video editor on a top video track above your footage, align your subtitles inside the green dashed box, and mute or delete the guide track before final export.",
  },
  {
    question: "How does an Instagram Reel 9:16 cover crop on the 3:4 profile grid?",
    answer:
      "Instagram displays profile grid thumbnails in a 3:4 vertical ratio (1080 × 1440 px centered inside 1080 × 1920 px), trimming 240 px from the top and 240 px from the bottom. Turn on the 3:4 profile grid crop switch in the checker to preview both boundaries together.",
  },
  {
    question: "Do I have to upload an image just to get the safe zone template?",
    answer:
      "No. You can pick any platform preset and click Download Transparent Guide PNG immediately without uploading a file.",
  },
];

export const Route = createFileRoute("/v3/safe-zone-checker")({
  head: () =>
    buildV3RouteHead({
      title: PAGE_TITLE,
      description: DESCRIPTION,
      canonicalPath: "/safe-zone-checker",
      appName: "TikTok, Reels & Shorts Safe Zone Checker",
      howToTitle: "How to Check TikTok, Reels & Shorts Safe Zones Online",
      steps: STEPS,
      faqs: FAQS,
    }),
  component: SafeZoneCheckerPage,
});

function SafeZoneCheckerPage() {
  return (
    <V3PageShell
      title="Safe Zone Checker"
      compareV2To="/v2/tiktok-aspect-ratio"
      hero={{
        title: (
          <>
            TikTok, Reels &amp; Shorts <span className="text-primary">Safe Zone</span> Checker
          </>
        ),
        description:
          "Test 1080×1920 (9:16) video frames and covers against real UI button and caption overlays — or download a transparent safe-zone guide PNG.",
      }}
    >
      <SafeZoneCheckerV3 />

      <V3Editorial
        overview={{
          eyebrow: "9:16 Vertical Video Guardrails",
          heading: "Stop Losing Subtitles & Hooks Behind App Buttons",
          lead: "Even when your video exports at an exact 1080 × 1920 (9:16) aspect ratio, TikTok, Instagram Reels, and YouTube Shorts cover up to 34% of the bottom screen with captions, audio tickers, and right-rail action stacks. Preview your frame locally before publishing.",
        }}
        visualGuide={{
          eyebrow: "Visual Overlay Guide",
          heading: "9:16 App Button Danger Zones vs. Universal 792 × 1020 Safe Box",
          src: "/previews/safe-zone-9x16-comparison.webp",
          width: 1120,
          height: 500,
          alt: "Comparison of a 1080x1920 vertical creator video frame showing red TikTok, Instagram Reels, and YouTube Shorts UI occlusion zones on the left versus the green 792x1020 universal cross-posting safe zone and 3:4 profile grid crop lines on the right",
          caption:
            "Left: red regions covered by search headers, right-side engagement buttons, and bottom captions. Right: Universal 792 × 1020 px safe box plus gold 3:4 Instagram profile grid crop lines (Y: 240–1680 px).",
        }}
        howTo={{
          heading: "How to Check 9:16 Safe Zones & Export an Editor Overlay",
          steps: STEPS,
        }}
        features={{
          heading: "Built for Short-Form Creators & Social Editors",
          items: FEATURES,
        }}
        referenceSection={
          <section aria-labelledby="v3-safezone-specs" className="space-y-4">
            <div className="space-y-1">
              <p className="v3-eyebrow">1080 × 1920 Pixel Reference</p>
              <h2
                id="v3-safezone-specs"
                className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl"
              >
                TikTok vs. Instagram Reels vs. YouTube Shorts Safe Margins
              </h2>
            </div>

            <div className="v3-table-wrap">
              <table className="v3-table">
                <thead>
                  <tr>
                    <th scope="col">Platform</th>
                    <th scope="col">Top Clear</th>
                    <th scope="col">Bottom Clear</th>
                    <th scope="col">Side Clearances</th>
                    <th scope="col">Inner Safe Area</th>
                  </tr>
                </thead>
                <tbody>
                  {SAFE_ZONE_TABLE.map(row => (
                    <tr key={row.platform}>
                      <td className="font-semibold text-foreground">{row.platform}</td>
                      <td className="num text-muted-foreground">{row.top}</td>
                      <td className="num text-muted-foreground">{row.bottom}</td>
                      <td className="num text-muted-foreground">{row.leftRight}</td>
                      <td className="num font-semibold text-primary">{row.safeBox}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Provenance (verified 2026-11): Canvas geometry uses standard 9:16 (1080 × 1920 px;
              YouTube Help recommends up to 2160 × 3840 px for Shorts thumbnails, and Instagram
              Help lists 420 × 654 px — exact ratio 70:109, approx. 1:1.55 — for standalone Reel
              cover uploads). Top/bottom/side pixel clearances above reflect empirical organic
              in-app UI overlays and remain separate from paid ad placement specifications.
            </p>
          </section>
        }
        faq={{ items: FAQS }}
        relatedTools={{
          items: [
            {
              to: "/v3/instagram-grid-splitter",
              title: "Instagram 3:4 Grid & Carousel Splitter",
              description:
                "Slice seamless 4:5 panoramic carousels and preview 3:4 profile grid crops.",
              icon: <Grid2x2 className="h-4 w-4" />,
            },
            {
              to: "/v3/fit-photo-to-instagram",
              title: "Fit Photo to Instagram",
              description:
                "Place horizontal or portrait photos into 9:16 Stories or 4:5 posts with blurred borders.",
              icon: <Crop className="h-4 w-4" />,
            },
            {
              to: "/v3/og-image-safe-zone",
              title: "OG Image Safe Zone Tester",
              description:
                "Check 1200×630 link cards across WhatsApp 1:1 square thumbnails, X, and LinkedIn.",
              icon: <Share2 className="h-4 w-4" />,
            },
          ],
        }}
      />
    </V3PageShell>
  );
}
