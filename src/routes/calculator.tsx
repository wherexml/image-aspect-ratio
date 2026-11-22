import { createFileRoute } from "@tanstack/react-router";
import { ArrowUp, Crop, Image as ImageIcon, Sparkles } from "lucide-react";
import { useState } from "react";
import { AspectRatioCalculatorV2 } from "@/components/v2/AspectRatioCalculatorV2";
import {
  buildV3RouteHead,
  V3Editorial,
  type V3FaqItem,
  type V3FeatureItem,
  type V3StepItem,
} from "@/components/v3/V3Editorial";
import { V3PageShell } from "@/components/v3/V3PageShell";

const PAGE_TITLE = "Aspect Ratio Calculator — Resize Width & Height in Pixels";
const DESCRIPTION =
  "Calculate exact aspect ratios and resize width or height in pixels using exact fraction math. Compare 16:9, 9:16, 4:5, 3:4, and 21:9 instantly.";

const STEPS: readonly V3StepItem[] = [
  {
    title: "Select Solve size or Find ratio",
    description:
      "Pick a preset ratio (16:9, 9:16, 4:5, 1:1, 21:9) to solve a missing side, or switch to Find ratio to simplify any W × H pixel pair.",
  },
  {
    title: "Enter your known dimension",
    description:
      "Type your target width or height — or click quick resolution chips like 720p, 1080p, 1440p, or 4K — or drag the proportional frame handle.",
  },
  {
    title: "Copy exact or rounded pixels",
    description:
      "Inspect exact rational results alongside nearest whole-pixel rounding, then copy the dimension pair in one click.",
  },
];

const FEATURES: readonly V3FeatureItem[] = [
  {
    title: "Exact BigInt Rational Arithmetic",
    description:
      "All ratios and missing dimensions are solved with arbitrary-precision integer fractions — eliminating IEEE-754 floating-point rounding bugs.",
  },
  {
    title: "Explicit Exact vs. Rounded Labels",
    description:
      "Whenever a target width does not divide evenly (such as 1000 px at 16:9 = 562.5 px), both the exact fraction and rounded whole pixel are shown clearly.",
  },
  {
    title: "Interactive Proportional Stage",
    description:
      "Visualize the exact shape with a rule-of-thirds composition grid and drag the corner handle to explore live scaled dimensions.",
  },
  {
    title: "Ultrawide & True 21:9 Distinction",
    description:
      "Distinguishes real monitor pixel grids like 3440 × 1440 (43:18) and 2560 × 1080 (64:27) from strict mathematical 21:9 (7:3).",
  },
  {
    title: "Decimal & Custom Ratio Support",
    description:
      "Enter cinema or web ratios like 2.39:1, 1.91:1, or 1.85:1 directly — decimals convert losslessly into reduced integer fractions.",
  },
  {
    title: "Instant Copy for CSS & Editors",
    description:
      "One-click result copying formats clean dimensions ready to paste into Figma, Premiere, DaVinci Resolve, FFmpeg, or CSS aspect-ratio rules.",
  },
];

const RESOLUTION_TABLE = [
  { name: "720p HD", rw: "16", rh: "9", ratio: "16:9", size: "1280 × 720 px", use: "Lightweight web video & thumbnails" },
  { name: "1080p Full HD", rw: "16", rh: "9", ratio: "16:9", size: "1920 × 1080 px", use: "Standard broadcast, YouTube & slides" },
  { name: "Vertical HD", rw: "9", rh: "16", ratio: "9:16", size: "1080 × 1920 px", use: "Reels, TikTok, YouTube Shorts, Stories" },
  { name: "Social Portrait", rw: "4", rh: "5", ratio: "4:5", size: "1080 × 1350 px", use: "Instagram portrait feed posts" },
  { name: "1440p QHD", rw: "16", rh: "9", ratio: "16:9", size: "2560 × 1440 px", use: "Desktop monitors & crisp screen captures" },
  { name: "4K UHD", rw: "16", rh: "9", ratio: "16:9", size: "3840 × 2160 px", use: "Ultra HD mastering & large displays" },
  { name: "UWQHD Ultrawide", rw: "43", rh: "18", ratio: "43:18 (≈2.39:1)", size: "3440 × 1440 px", use: "34-inch curved ultrawide displays" },
] as const;

const FAQS: readonly V3FaqItem[] = [
  {
    question: "What is the formula for calculating a missing width or height?",
    answer:
      "For a target aspect ratio W : H, multiply your known width by (H ÷ W) to get height, or multiply your known height by (W ÷ H) to get width. For example, at 16:9 with a width of 1920 px: 1920 × 9 ÷ 16 = 1080 px.",
  },
  {
    question: "How do you simplify pixel dimensions like 1920 × 1080 into an aspect ratio?",
    answer:
      "Find the greatest common divisor (GCD) of width and height and divide both numbers by it. For 1920 and 1080, the GCD is 120 — dividing both by 120 yields 16:9.",
  },
  {
    question: "Why does 3440 × 1440 show 43:18 instead of 21:9?",
    answer:
      "“21:9” is a marketing class name for ultrawide monitors. Dividing 3440 and 1440 by their greatest common divisor (80) gives the true mathematical ratio 43:18 (≈2.39:1), whereas strict 21:9 at 1440 px tall would be 3360 × 1440.",
  },
  {
    question: "What happens when a target ratio produces a half-pixel like 562.5 px?",
    answer:
      "Raster image and video files require whole integer pixels, while CSS and vector canvases accept fractional units. The calculator displays both the rounded whole-pixel value and the exact unrounded number so you can pick the nearest clean multiple (such as 1024 × 576 for exact 16:9).",
  },
];

export const Route = createFileRoute("/calculator")({
  head: () =>
    buildV3RouteHead({
    forceNoindex: false,
      title: PAGE_TITLE,
      description: DESCRIPTION,
      canonicalPath: "/calculator",
      appName: "Aspect Ratio Calculator",
      howToTitle: "How to Calculate Aspect Ratio and Pixel Dimensions",
      steps: STEPS,
      faqs: FAQS,
    }),
  component: CalculatorV3Page,
});

function CalculatorV3Page() {
  const [presetSignal, setPresetSignal] = useState<{
    rw: string;
    rh: string;
    seq: number;
  } | null>(null);

  const handleApplyRatio = (rw: string, rh: string) => {
    setPresetSignal(prev => ({ rw, rh, seq: (prev?.seq ?? 0) + 1 }));
    document
      .querySelector<HTMLElement>('[aria-label="Calculator"]')
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <V3PageShell
      title="Aspect Ratio Calculator"
      hero={{
        title: (
          <>
            Aspect Ratio <span className="text-primary">Calculator</span>
          </>
        ),
        description: "Find your image’s aspect ratio and calculate the exact dimensions you need.",
      }}
    >
      <AspectRatioCalculatorV2 variant="all" externalPresetSignal={presetSignal} />

      <V3Editorial
        overview={{
          eyebrow: "Precision Dimension Math",
          heading: "Scale Images, Video Timelines & Responsive Layouts Without Guesswork",
          lead: "Whether you are sizing a responsive video embed, choosing an even-pixel FFmpeg encode, or checking if a cropped banner matches 16:9, exact fraction arithmetic tells you immediately which dimensions divide cleanly and which require rounding.",
        }}
        howTo={{
          heading: "How to Use the Aspect Ratio Calculator",
          steps: STEPS,
        }}
        features={{
          heading: "Built for Designers, Video Editors & Frontend Engineers",
          items: FEATURES,
        }}
        referenceSection={
          <section aria-labelledby="v3-resolutions-heading" className="space-y-4">
            <div className="space-y-1">
              <p className="v3-eyebrow">Cheat Sheet</p>
              <h2
                id="v3-resolutions-heading"
                className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl"
              >
                Standard Video, Display &amp; Social Resolutions
              </h2>
            </div>

            <div className="v3-table-wrap">
              <table className="v3-table">
                <thead>
                  <tr>
                    <th scope="col">Standard</th>
                    <th scope="col">Exact Ratio</th>
                    <th scope="col">Dimensions</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {RESOLUTION_TABLE.map(row => (
                    <tr key={row.name}>
                      <td>
                        <div className="font-semibold text-foreground">{row.name}</div>
                        <div className="text-xs text-muted-foreground">{row.use}</div>
                      </td>
                      <td className="num font-semibold text-foreground whitespace-nowrap">
                        {row.ratio}
                      </td>
                      <td className="num font-medium text-foreground whitespace-nowrap">
                        {row.size}
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleApplyRatio(row.rw, row.rh)}
                          className="v3-apply-btn"
                        >
                          <ArrowUp className="h-3 w-3 text-primary" aria-hidden="true" />
                          <span>Load</span>
                        </button>
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
              to: "/",
              title: "Image Aspect Ratio Calculator",
              description:
                "Drop any local photo to read its pixel dimensions, exact GCD ratio, and Fit/Fill previews.",
              icon: <ImageIcon className="h-4 w-4" />,
            },
            {
              to: "/change-image-aspect-ratio",
              title: "Change Image Aspect Ratio",
              description:
                "Apply your calculated target ratio directly to a photo and export PNG or JPG.",
              icon: <Crop className="h-4 w-4" />,
            },
            {
              to: "/screenshot-beautifier",
              title: "Screenshot Beautifier",
              description:
                "Add clean backgrounds and frame screenshots in locked 16:9, 4:3, or 1:1 canvases.",
              icon: <Sparkles className="h-4 w-4" />,
            },
          ],
        }}
      />
    </V3PageShell>
  );
}
