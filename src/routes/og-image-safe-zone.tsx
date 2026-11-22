import { createFileRoute } from "@tanstack/react-router";
import { Crop, ShieldCheck, Sparkles } from "lucide-react";
import { OgSafeZonePreviewerV3 } from "@/components/v3/tools/OgSafeZonePreviewerV3";
import {
  buildV3RouteHead,
  V3Editorial,
  type V3FaqItem,
  type V3FeatureItem,
  type V3StepItem,
} from "@/components/v3/V3Editorial";
import { V3PageShell } from "@/components/v3/V3PageShell";

const PAGE_TITLE = "OG Image Safe Zone Tester — 1200×630 & WhatsApp 1:1 Crop";
const DESCRIPTION =
  "Test unpublished local 1200×630 Open Graph images before deploying. Preview X, LinkedIn, Discord, and WhatsApp 1:1 square crops privately in your browser.";

const STEPS: readonly V3StepItem[] = [
  {
    title: "Drop your local og:image",
    description:
      "Select or paste an unpublished PNG, JPG, or WebP design straight from Figma or disk — no public staging URL or ngrok tunnel needed.",
  },
  {
    title: "Inspect WhatsApp 1:1 & X badge crops",
    description:
      "Check whether your headline and logo stay inside the center 630×630 square for WhatsApp compact link bubbles and clear X’s domain pill.",
  },
  {
    title: "Export <280 KB WhatsApp-safe 1200×630",
    description:
      "Download an automatically size-budgeted 1200×630 JPG (<280 KB) so mobile messaging apps never drop your preview thumbnail.",
  },
];

const FEATURES: readonly V3FeatureItem[] = [
  {
    title: "Test Before Deploying to Production",
    description:
      "Unlike URL-scraper debuggers that require a live HTTPS page, drop local design drafts directly into your browser before writing meta tags.",
  },
  {
    title: "WhatsApp 1:1 Square Crop Guard",
    description:
      "Visualizes the exact 285 px left and right wings of a 1200×630 card that get sliced off inside WhatsApp’s 1:1 compact chat bubble.",
  },
  {
    title: "Automatic < 300 KB File Size Check & Fix",
    description:
      "Flags oversized PNGs that WhatsApp silently refuses to unfurl, and encodes a crisp 1200×630 JPG guaranteed under 280 KB in one click.",
  },
  {
    title: "X Domain Pill Exclusion Overlay",
    description:
      "Shows the exact bottom-left corner where X (Twitter) overlays your domain badge so small subtitles or logos aren’t covered.",
  },
  {
    title: "Live 4-Platform Feed Simulation",
    description:
      "Preview WhatsApp, X Large Summary Card, LinkedIn Feed Card, and Discord/Slack unfurls side-by-side with editable og:title and og:description.",
  },
  {
    title: "100% Private Local Inspection",
    description:
      "Stealth product launches, embargoed announcements, and private pitch links stay offline inside your browser memory.",
  },
];

const OG_SPECS_TABLE = [
  { platform: "Universal Recommended Master", ratio: "1.91:1", pixels: "1200 × 630 px", limit: "< 300 KB (for WhatsApp parity)" },
  { platform: "WhatsApp Compact Chat Bubble", ratio: "1:1 (Center crop)", pixels: "Center 630 × 630 px", limit: "Strict ~300–600 KB timeout threshold" },
  { platform: "X (Twitter) summary_large_image", ratio: "1.91:1", pixels: "1200 × 628 / 630 px", limit: "< 5 MB (bottom-left domain badge)" },
  { platform: "LinkedIn Feed Link Preview", ratio: "1.91:1", pixels: "1200 × 627 / 630 px", limit: "< 5 MB (aggressive 7-day URL cache)" },
  { platform: "Discord & Slack Rich Unfurl", ratio: "1.91:1", pixels: "1200 × 630 px", limit: "Renders inline below title & description" },
] as const;

const FAQS: readonly V3FaqItem[] = [
  {
    question: "Why does WhatsApp cut off the sides of my 1200×630 Open Graph image?",
    answer:
      "While desktop and large header link previews use the full 1.91:1 (1200×630 px) width, WhatsApp’s compact chat link bubble center-crops og:image into a 1:1 square — keeping only the middle 630×630 px and trimming 285 px off both left and right edges.",
  },
  {
    question: "Why is my og:image showing on X and LinkedIn, but completely missing on WhatsApp?",
    answer:
      "The most common culprit is file size: lossless 1200×630 PNGs often weigh 700 KB to 2 MB, exceeding WhatsApp’s strict mobile fetch budget (~300 KB). Use the Export WhatsApp-Safe 1200×630 JPG (<280 KB) button above to guarantee fast mobile unfurling.",
  },
  {
    question: "How is this different from OpenGraph.xyz or LinkedIn Post Inspector?",
    answer:
      "URL debuggers scrape an already-deployed public webpage to read HTML <meta> tags. This tool solves the earlier design step: testing local, unpublished image files for multi-platform cropping and KB weight before you commit or deploy.",
  },
  {
    question: "Are embargoed launch graphics safe to test here?",
    answer:
      "Yes. Your image file is decoded locally inside your browser tab via HTML5 Canvas and is never uploaded to any server.",
  },
];

export const Route = createFileRoute("/og-image-safe-zone")({
  head: () =>
    buildV3RouteHead({
    forceNoindex: false,
      title: PAGE_TITLE,
      description: DESCRIPTION,
      canonicalPath: "/og-image-safe-zone",
      appName: "OG Image Size & Safe Zone Tester",
      howToTitle: "How to Test Open Graph Image Cropping & WhatsApp Safe Zones Locally",
      steps: STEPS,
      faqs: FAQS,
    }),
  component: OgImageSafeZonePage,
});

function OgImageSafeZonePage() {
  return (
    <V3PageShell
      title="OG Image Safe Zone Tester"
      hero={{
        title: (
          <>
            OG Image <span className="text-primary">Safe Zone</span> &amp; Crop Tester
          </>
        ),
        description:
          "Drop an unpublished local 1200×630 image to preview WhatsApp 1:1 square crops, X domain badges, LinkedIn cards, and <300 KB mobile limits before deploying.",
      }}
    >
      <OgSafeZonePreviewerV3 />

      <V3Editorial
        overview={{
          eyebrow: "Pre-Deploy Social Card QA",
          heading: "Catch Clipped Logos & Missing WhatsApp Previews Before You Ship",
          lead: "Designing a 1200 × 630 Open Graph card (exact 40:21 ≈ 1.905:1) looks easy until WhatsApp slices 285 px off each side into a 1:1 square thumbnail — or drops your 900 KB PNG completely. Test local drafts in your browser with zero localhost tunnels.",
        }}
        visualGuide={{
          eyebrow: "1.91:1 vs. 1:1 Safe Box",
          heading: "How WhatsApp Crops a 1200 × 630 og:image Into a 630 × 630 Square",
          src: "/previews/og-whatsapp-crop-guide.webp",
          width: 1120,
          height: 500,
          alt: "Open Graph 1200x630 social card safe-zone diagram showing 285px left and right red side wings trimmed by WhatsApp 1:1 compact chat bubbles, X bottom-left domain pill overlay, and the safe center 630x630 square box",
          caption:
            "Keep headlines and brand marks inside the center 630 × 630 px square and export under ~280 KB so X, LinkedIn, Discord, Slack, and mobile WhatsApp all unfurl cleanly (verified 2026-11).",
        }}
        howTo={{
          heading: "How to Verify Your 1200×630 og:image Across Every Platform",
          steps: STEPS,
        }}
        features={{
          heading: "Purpose-Built for Developers, Indie Makers & Growth Teams",
          items: FEATURES,
        }}
        referenceSection={
          <section aria-labelledby="v3-og-specs-heading" className="space-y-4">
            <div className="space-y-1">
              <p className="v3-eyebrow">Cross-Platform Specs</p>
              <h2
                id="v3-og-specs-heading"
                className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl"
              >
                Open Graph Image Dimensions &amp; File Size Limits
              </h2>
            </div>

            <div className="v3-table-wrap">
              <table className="v3-table">
                <thead>
                  <tr>
                    <th scope="col">Platform / Card Style</th>
                    <th scope="col">Aspect Ratio</th>
                    <th scope="col">Visible Pixels</th>
                    <th scope="col">Key Constraint</th>
                  </tr>
                </thead>
                <tbody>
                  {OG_SPECS_TABLE.map(row => (
                    <tr key={row.platform}>
                      <td className="font-semibold text-foreground">{row.platform}</td>
                      <td className="num font-semibold text-primary">{row.ratio}</td>
                      <td className="num text-foreground">{row.pixels}</td>
                      <td className="text-muted-foreground">{row.limit}</td>
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
              to: "/screenshot-beautifier",
              title: "Screenshot Beautifier",
              description:
                "Frame product screenshots in locked 16:9 or custom gradient cards for launch posts.",
              icon: <Sparkles className="h-4 w-4" />,
            },
            {
              to: "/safe-zone-checker",
              title: "9:16 Safe Zone Checker",
              description:
                "Preview vertical video safe zones across TikTok, Instagram Reels, and YouTube Shorts.",
              icon: <ShieldCheck className="h-4 w-4" />,
            },
            {
              to: "/change-image-aspect-ratio",
              title: "Change Image Aspect Ratio",
              description:
                "Resize or pad any image to custom aspect ratios like 1.91:1, 16:9, or 4:5.",
              icon: <Crop className="h-4 w-4" />,
            },
          ],
        }}
      />
    </V3PageShell>
  );
}
