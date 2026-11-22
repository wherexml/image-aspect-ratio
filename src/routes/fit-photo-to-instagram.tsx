import { createFileRoute } from "@tanstack/react-router";
import { Grid2x2, Maximize2, ShieldCheck } from "lucide-react";
import { StudioFrameEditorV2 } from "@/components/v2/StudioFrameEditorV2";
import {
  buildV3RouteHead,
  V3Editorial,
  type V3FaqItem,
  type V3FeatureItem,
  type V3StepItem,
} from "@/components/v3/V3Editorial";
import { V3PageShell } from "@/components/v3/V3PageShell";

const PAGE_TITLE = "Fit Photo to Instagram Without Cropping (Blur & Border)";
const DESCRIPTION =
  "Fit full landscape or 9:16 photos into Instagram 4:5, 3:4, or 1:1 frames without cropping. Add blurred or white borders locally in your browser.";

const STEPS: readonly V3StepItem[] = [
  {
    title: "Select your full photo",
    description:
      "Drop or paste any wide 16:9 / 3:2 landscape shot or tall 9:16 phone photo — no mobile app installation or account needed.",
  },
  {
    title: "Pick 4:5, 3:4, or 9:16 + Blur or White",
    description:
      "The editor defaults to 4:5 (1080×1350) Fit mode with an ambient blurred backdrop; switch to 3:4 Grid, 9:16 Story, Pure White, or Black in one click.",
  },
  {
    title: "Download crisp 1080 px PNG or JPG",
    description:
      "Save a ready-to-post 1080×1350, 1080×1440, or 1080×1920 image so Instagram never cuts off heads, feet, or scenery.",
  },
];

const FEATURES: readonly V3FeatureItem[] = [
  {
    title: "Ambient Blurred Photo Backdrop",
    description:
      "Fills empty top/bottom or side bars with a soft, color-matched Gaussian blur sampled directly from your own photo.",
  },
  {
    title: "Pre-Set to Instagram’s Official Ratios",
    description:
      "Starts at 4:5 (1080×1350 classic portrait) with instant toggles for 3:4 (1080×1440 tall feed & native profile grid), 9:16 (1080×1920 Stories/Reels), and 1:1.",
  },
  {
    title: "Clean White, Black & Custom Borders",
    description:
      "Prefer a minimalist gallery look over blur? Switch to Pure White (#FFFFFF), Charcoal, Pure Black, or any custom brand color.",
  },
  {
    title: "Interactive Zoom & Pan Placement",
    description:
      "Keep Fit active to show 100% of your image, or gently zoom and drag on the canvas to fine-tune composition.",
  },
  {
    title: "No App Download or Watermarks",
    description:
      "Avoid ad-heavy mobile “No Crop” apps and subscription paywalls — export full-resolution files right in Safari or Chrome.",
  },
  {
    title: "100% Private Local Canvas",
    description:
      "Personal travel, portrait, and client photos never leave your device — processing runs entirely in browser memory.",
  },
];

const IG_FORMATS_TABLE = [
  { placement: "Feed Portrait (Universal)", ratio: "4:5", pixels: "1080 × 1350 px", note: "Classic portrait feed standard compatible across single posts & carousels" },
  { placement: "Tall Feed & Profile Grid Native", ratio: "3:4", pixels: "1080 × 1440 px", note: "Tallest official feed ratio (1.91:1–3:4 range) & matches 3:4 profile thumbnails" },
  { placement: "Stories & Reels Canvas", ratio: "9:16", pixels: "1080 × 1920 px", note: "Full-screen vertical frame for horizontal photos with blurred backdrop" },
  { placement: "Classic Square / Wide Feed", ratio: "1:1 · ≈1.91:1", pixels: "1080 × 1080 / 1080 × 566 px", note: "1:1 square or wide landscape (1080×566 is whole-pixel approx. of 1.91:1)" },
] as const;

const FAQS: readonly V3FaqItem[] = [
  {
    question: "Why does Instagram crop my wide or tall photos when I upload them?",
    answer:
      "Instagram restricts feed posts to aspect ratios between 1.91:1 (landscape) and 4:5 / 3:4 (tall portrait), and often forces multi-photo carousels to match the first photo’s ratio. Placing your photo onto a pre-padded 1080×1350 (4:5) or 1080×1920 (9:16) canvas prevents Instagram from cropping anything.",
  },
  {
    question: "Should I use a blurred background or a white border for Instagram?",
    answer:
      "Blurred backgrounds work best for 9:16 Stories, Reels covers, and vibrant travel shots where stark white bars feel distracting. Pure white or black borders work best for photography portfolios and clean editorial feeds.",
  },
  {
    question: "What pixel width keeps photos sharpest on Instagram?",
    answer:
      "Exporting at 1080 px wide (1080×1350 for 4:5, 1080×1440 for 3:4, or 1080×1920 for 9:16) matches Instagram’s native display width so its server compression doesn’t awkwardly downscale or soften fine details.",
  },
  {
    question: "Are my personal photos uploaded to your servers?",
    answer:
      "No. Everything runs locally inside your browser’s HTML5 Canvas — your photos stay 100% on your phone or computer.",
  },
];

export const Route = createFileRoute("/fit-photo-to-instagram")({
  head: () =>
    buildV3RouteHead({
    forceNoindex: false,
      title: PAGE_TITLE,
      description: DESCRIPTION,
      canonicalPath: "/fit-photo-to-instagram",
      appName: "Fit Photo to Instagram Without Cropping",
      howToTitle: "How to Fit a Full Photo on Instagram Without Cropping",
      steps: STEPS,
      faqs: FAQS,
    }),
  component: FitPhotoToInstagramPage,
});

function FitPhotoToInstagramPage() {
  return (
    <V3PageShell
      title="Fit Photo to Instagram"
      hero={{
        title: (
          <>
            Fit Full Photo to <span className="text-primary">Instagram</span> (No Crop)
          </>
        ),
        description:
          "Post wide landscapes or full-length vertical portraits on Instagram without losing edges — pre-set to 4:5 (1080×1350) with soft photo-blur or clean white borders.",
      }}
    >
      <StudioFrameEditorV2
        mode="ratio"
        initialRatioId="4:5"
        initialWidth={1080}
        initialBackdropMode="blur"
      />

      <V3Editorial
        overview={{
          eyebrow: "No-Crop Social Framing",
          heading: "Post Full Landscape & Full-Body Shots Without Downloading an App",
          lead: "When a group photo is wider than 1.91:1 or a full-length outfit shot is 9:16, Instagram’s built-in cropper slices off crucial edges. Wrapping your photo inside an exact 1080×1350 (4:5), 1080×1440 (3:4), or 1080×1920 (9:16) canvas with ambient photo blur or clean white margins preserves every pixel.",
        }}
        visualGuide={{
          eyebrow: "Framing Comparison",
          heading: "Forced Crop vs. 4:5 Photo Blur vs. 3:4 Gallery White Border",
          src: "/previews/instagram-fit-no-crop.webp",
          width: 1120,
          height: 500,
          alt: "Three-way Instagram photo framing comparison of an Amalfi Coast landscape photo: default forced crop cutting off 44 percent of the coastline, 4:5 1080x1350 ambient photo blur keeping 100 percent of the image, and 3:4 1080x1440 white gallery border",
          caption:
            "Verified against Instagram Help Center feed guidelines (supported aspect ratios 1.91:1 to 3:4, recommended width 320–1080 px; verified 2026-11).",
        }}
        howTo={{
          heading: "How to Fit Any Photo to Instagram Online",
          steps: STEPS,
        }}
        features={{
          heading: "Clean Browser Alternative to Mobile “No Crop” Apps",
          items: FEATURES,
        }}
        referenceSection={
          <section aria-labelledby="v3-ig-fit-table" className="space-y-4">
            <div className="space-y-1">
              <p className="v3-eyebrow">Instagram Pixel Specs</p>
              <h2
                id="v3-ig-fit-table"
                className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl"
              >
                Which Instagram Aspect Ratio Should You Pick?
              </h2>
            </div>

            <div className="v3-table-wrap">
              <table className="v3-table">
                <thead>
                  <tr>
                    <th scope="col">Destination</th>
                    <th scope="col">Aspect Ratio</th>
                    <th scope="col">Exact Export Size</th>
                    <th scope="col">Why Choose It</th>
                  </tr>
                </thead>
                <tbody>
                  {IG_FORMATS_TABLE.map(row => (
                    <tr key={row.placement}>
                      <td className="font-semibold text-foreground">{row.placement}</td>
                      <td className="num font-semibold text-primary">{row.ratio}</td>
                      <td className="num text-foreground">{row.pixels}</td>
                      <td className="text-muted-foreground">{row.note}</td>
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
              to: "/instagram-grid-splitter",
              title: "Instagram 3:4 Grid & Carousel Splitter",
              description:
                "Slice panoramic photos into seamless swipeable 4:5 carousels or 3:4 profile grids.",
              icon: <Grid2x2 className="h-4 w-4" />,
            },
            {
              to: "/add-padding-to-image",
              title: "Add Padding & White Border",
              description:
                "Add uniform gallery margins, Polaroid frames, or custom 4-side pixel borders.",
              icon: <Maximize2 className="h-4 w-4" />,
            },
            {
              to: "/safe-zone-checker",
              title: "9:16 Safe Zone Checker",
              description:
                "Check Instagram Reels and Story frames so captions and buttons never hide your text.",
              icon: <ShieldCheck className="h-4 w-4" />,
            },
          ],
        }}
      />
    </V3PageShell>
  );
}
