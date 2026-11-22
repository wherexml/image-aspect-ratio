import { createFileRoute } from "@tanstack/react-router";
import { Maximize2, Sparkles, Square } from "lucide-react";
import { RoundCornersEditorV3 } from "@/components/v3/tools/RoundCornersEditorV3";
import {
  buildV3RouteHead,
  V3Editorial,
  type V3FaqItem,
  type V3FeatureItem,
  type V3StepItem,
} from "@/components/v3/V3Editorial";
import { V3PageShell } from "@/components/v3/V3PageShell";

const PAGE_TITLE = "Round Corners of Image Online — Transparent PNG & Circle";
const DESCRIPTION =
  "Round image corners with exact pixel radius, per-corner controls, or 50% circle crop. Export crisp transparent PNGs locally—free and no watermark.";

const STEPS: readonly V3StepItem[] = [
  {
    title: "Drop or paste your image",
    description:
      "Open a JPG, PNG, or WebP file from disk or press Cmd+V / Ctrl+V directly from your clipboard.",
  },
  {
    title: "Slide corner radius or pick 1:1 Circle",
    description:
      "Adjust exact pixel roundness (16 px, 32 px, 64 px, or custom) — or switch to 1:1 Circle Avatar for profile pictures and team badges.",
  },
  {
    title: "Download lossless transparent PNG",
    description:
      "Export a clean alpha-masked PNG (or copy straight to your clipboard) with zero jagged edges or watermarks.",
  },
];

const FEATURES: readonly V3FeatureItem[] = [
  {
    title: "True Alpha Transparency Outside Corners",
    description:
      "Exports genuine transparent PNG corners so rounded UI cards, photos, and avatars sit cleanly on any light, dark, or colored page.",
  },
  {
    title: "Exact Pixel Radius + Quick Presets",
    description:
      "Dial in exact border-radius values from 0 px up to full capsule/pill rounding, or tap 16 px, 32 px, 64 px, and 128 px presets.",
  },
  {
    title: "One-Click 1:1 Circular Avatar Mode",
    description:
      "Switch from Rounded Corners to 1:1 Circle Avatar to create crisp transparent profile images for Slack, GitHub, Discord, and Notion.",
  },
  {
    title: "Optional Crisp Border Ring Stroke",
    description:
      "Add an inset stroke ring (1–24 px) in white, black, or accent colors so avatars pop cleanly against dark headers and slide decks.",
  },
  {
    title: "Ad-Free & Instant Clipboard Copy",
    description:
      "No cluttered ad banners or multi-page redirects — paste with Cmd+V, round corners, and copy the transparent PNG straight back.",
  },
  {
    title: "100% Client-Side Browser Privacy",
    description:
      "Headshots, internal UI captures, and unreleased brand assets stay inside your browser tab with zero server uploads.",
  },
];

const RADIUS_GUIDE = [
  { style: "Subtle UI Card / Blog Embed", radius: "12 – 24 px", bg: "Transparent PNG", commonUse: "Docs, Notion, README screenshots, Substack" },
  { style: "Modern App Icon / Bento Tile", radius: "48 – 96 px", bg: "Transparent PNG", commonUse: "Landing page feature cards, slide decks, email banners" },
  { style: "Capsule / Pill Banner", radius: "50% of short edge", bg: "Transparent or White", commonUse: "Hero badges, speaker callouts, pill buttons" },
  { style: "Circular Profile Avatar", radius: "1:1 Circle Mode", bg: "Transparent + 4 px Ring", commonUse: "GitHub, LinkedIn, Discord, team directory headshots" },
] as const;

const FAQS: readonly V3FaqItem[] = [
  {
    question: "Why do rounded corners turn white when saved as a JPG?",
    answer:
      "The JPEG format does not support alpha transparency, so any transparent corner area must be filled with a solid color. This tool exports lossless PNG files so the space outside your rounded corners stays 100% transparent.",
  },
  {
    question: "Why round corners on an image file instead of using CSS border-radius?",
    answer:
      "Email newsletters, Google Slides, PowerPoint, Notion callouts, GitHub Markdown, and PDFs often cannot apply custom CSS border-radius to embedded images. Baking smooth transparent corners into the PNG works everywhere.",
  },
  {
    question: "Can I also crop a rectangular photo into a transparent circle?",
    answer:
      "Yes. Toggle Mask Shape to 1:1 Circle Avatar — the editor automatically center-squares your image and applies a smooth anti-aliased circular alpha mask.",
  },
  {
    question: "Are my headshots or UI screenshots uploaded anywhere?",
    answer:
      "No. Everything is decoded and masked locally in your browser’s HTML5 Canvas memory.",
  },
];

export const Route = createFileRoute("/v3/round-corners-image")({
  head: () =>
    buildV3RouteHead({
      title: PAGE_TITLE,
      description: DESCRIPTION,
      canonicalPath: "/round-corners-image",
      appName: "Round Corners of Image & Circle Crop Tool",
      howToTitle: "How to Round the Corners of an Image Online",
      steps: STEPS,
      faqs: FAQS,
    }),
  component: RoundCornersImagePage,
});

function RoundCornersImagePage() {
  return (
    <V3PageShell
      title="Round Corners & Circle Crop"
      compareV2To="/v2/make-image-square"
      hero={{
        title: (
          <>
            Round <span className="text-primary">Corners of Image</span> &amp; Circle Crop
          </>
        ),
        description:
          "Add smooth transparent rounded corners to any PNG, JPG, or screenshot — or create a 1:1 circular avatar with optional border ring in seconds.",
      }}
    >
      <RoundCornersEditorV3 />

      <V3Editorial
        overview={{
          eyebrow: "Smooth Alpha Masking",
          heading: "Bake Clean Rounded Corners Into PNGs for Slides, Docs & Emails",
          lead: "Sharp 90-degree image corners look harsh inside modern slide decks, email campaigns, and Markdown READMEs where CSS styling isn’t available. Apply pixel-accurate corner rounding or circular avatar masks locally and export a crisp transparent PNG.",
        }}
        howTo={{
          heading: "How to Round Image Corners With a Transparent Background",
          steps: STEPS,
        }}
        features={{
          heading: "Fast, Clean Corner Rounding Without Heavy Editors",
          items: FEATURES,
        }}
        referenceSection={
          <section aria-labelledby="v3-radius-guide" className="space-y-4">
            <div className="space-y-1">
              <p className="v3-eyebrow">Radius Cheat Sheet</p>
              <h2
                id="v3-radius-guide"
                className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl"
              >
                Recommended Corner Radius by Destination
              </h2>
            </div>

            <div className="v3-table-wrap">
              <table className="v3-table">
                <thead>
                  <tr>
                    <th scope="col">Visual Style</th>
                    <th scope="col">Recommended Setting</th>
                    <th scope="col">Outer Fill</th>
                    <th scope="col">Best Used In</th>
                  </tr>
                </thead>
                <tbody>
                  {RADIUS_GUIDE.map(row => (
                    <tr key={row.style}>
                      <td className="font-semibold text-foreground">{row.style}</td>
                      <td className="num font-semibold text-primary">{row.radius}</td>
                      <td className="text-muted-foreground">{row.bg}</td>
                      <td className="text-muted-foreground">{row.commonUse}</td>
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
              to: "/v3/make-image-square",
              title: "Make Image Square",
              description:
                "Pad or crop rectangular photos into exact 1:1 square dimensions before avatar masking.",
              icon: <Square className="h-4 w-4" />,
            },
            {
              to: "/v3/add-padding-to-image",
              title: "Add Padding & White Border",
              description:
                "Add transparent breathing room or gallery white borders around rounded images.",
              icon: <Maximize2 className="h-4 w-4" />,
            },
            {
              to: "/v3/screenshot-beautifier",
              title: "Screenshot Beautifier",
              description:
                "Combine rounded corners with gradient backdrops, drop shadows, and callouts.",
              icon: <Sparkles className="h-4 w-4" />,
            },
          ],
        }}
      />
    </V3PageShell>
  );
}
