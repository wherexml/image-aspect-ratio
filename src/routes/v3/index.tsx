import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Calculator, Crop, Sparkles } from "lucide-react";
import { ImageInspectorV2 } from "@/components/v2/ImageInspectorV2";
import {
  buildV3RouteHead,
  V3Editorial,
  type V3FaqItem,
  type V3FeatureItem,
  type V3StepItem,
} from "@/components/v3/V3Editorial";
import { V3PageShell } from "@/components/v3/V3PageShell";
import { approxNumber, frac, roundFrac, simplifyRatio, solve } from "@/lib/ratio";

const PAGE_TITLE = "Image Aspect Ratio Calculator — Photo Dimensions & 300 DPI";
const DESCRIPTION =
  "Free image aspect ratio calculator & finder: check photo pixel dimensions, picture ratio, 300 DPI print size, and Fit/Fill frames locally in browser.";

const STEPS: readonly V3StepItem[] = [
  {
    title: "Drop or paste any image",
    description:
      "Select a JPG, PNG, WebP, GIF, or AVIF file — or paste directly from your clipboard with Cmd+V / Ctrl+V.",
  },
  {
    title: "Read exact & near ratios",
    description:
      "See the reduced mathematical ratio (e.g. 16:9 or 400:267), decimal form, and whether it sits within 3% of a standard frame.",
  },
  {
    title: "Preview Fit/Fill or hand off",
    description:
      "Compare how your photo fits 1:1, 4:5, and 9:16 frames, or send it straight into Make Square, Change Ratio, or Screenshot Beautifier.",
  },
];

const FEATURES: readonly V3FeatureItem[] = [
  {
    title: "True Reduced GCD Ratio",
    description:
      "Reports your file’s genuine mathematical ratio without silently rounding off-by-one crops like 1080 × 1349 into 4:5.",
  },
  {
    title: "3% Near-Match Detection",
    description:
      "Automatically highlights when an awkward ratio like 400:267 (1200 × 801) is just 1 pixel away from standard 3:2.",
  },
  {
    title: "Side-by-Side Frame Previews",
    description:
      "Toggle Fit (keep all) and Fill (crop) across Square, Portrait, and Story frames before editing.",
  },
  {
    title: "One-Click Studio Handoff",
    description:
      "Pass your loaded image directly into Make Square, Change Ratio, or Screenshot Beautifier in memory without re-selecting the file.",
  },
  {
    title: "EXIF-Aware Local Decoding",
    description:
      "Respects phone camera orientation metadata and supports files up to 20 MB and 50 megapixels.",
  },
  {
    title: "Zero Network Transfer",
    description:
      "Your browser reads image dimensions locally on your device — private photos and unreleased designs stay offline.",
  },
];

const NEAR_EXAMPLES: readonly [number, number, string][] = [
  [4032, 3024, "12 MP phone camera photo"],
  [1200, 801, "Web export 1 px taller than 3:2"],
  [1080, 1349, "Portrait crop 1 px shorter than 4:5"],
  [3840, 2160, "4K UHD video frame"],
  [1170, 2532, "Modern iPhone screenshot"],
];

const COMMON_RATIOS: [number, number][] = [
  [1, 1],
  [4, 3],
  [3, 4],
  [3, 2],
  [2, 3],
  [4, 5],
  [5, 4],
  [16, 9],
  [9, 16],
  [16, 10],
  [21, 9],
];

function summarizeExample(w: number, h: number) {
  const wf = frac(BigInt(w));
  const hf = frac(BigInt(h));
  const [a, b] = simplifyRatio(wf, hf);
  const val = approxNumber({ n: a, d: b });
  const decScaled = roundFrac({ n: a * 100n, d: b });
  const decStr = `${decScaled / 100n}.${(decScaled % 100n).toString().padStart(2, "0")}`.replace(
    /\.?0+$/,
    "",
  );
  const exactCommon = COMMON_RATIOS.find(([x, y]) => a * BigInt(y) === b * BigInt(x));
  if (exactCommon) {
    return {
      exact: `${a}:${b}`,
      decimal: `${decScaled * b === a * 100n ? "" : "≈"}${decStr}:1`,
      near: `${exactCommon[0]}:${exactCommon[1]} exact`,
    };
  }
  const nearest = COMMON_RATIOS.map(([x, y]) => ({
    x,
    y,
    diff: Math.abs(val / (x / y) - 1),
  })).sort((p, q) => p.diff - q.diff)[0]!;
  if (nearest.diff > 0.03) {
    return {
      exact: `${a}:${b}`,
      decimal: `≈${decStr}:1`,
      near: "Custom (outside 3%)",
    };
  }
  const exactH = roundFrac(solve(frac(BigInt(nearest.x)), frac(BigInt(nearest.y)), wf, "height"));
  return {
    exact: `${a}:${b}`,
    decimal: `≈${decStr}:1`,
    near: `Near ${nearest.x}:${nearest.y} (${w} × ${exactH} exact)`,
  };
}

const FAQS: readonly V3FaqItem[] = [
  {
    question: "Why does my cropped photo show an unfamiliar ratio like 400:267?",
    answer:
      "Pixel dimensions are reduced by their greatest common divisor. If a 1200 × 800 (3:2) image is exported at 1200 × 801 by a single extra pixel, 1200 and 801 only share a divisor of 3 — giving 400:267. The inspector flags standard ratios within 3% so you can spot off-by-one crops immediately.",
  },
  {
    question: "Is my photo uploaded when checking its aspect ratio?",
    answer:
      "No. Your browser decodes the file locally on your computer or phone to read its width and height. Nothing is sent to a server.",
  },
  {
    question: "What is the difference between aspect ratio and image resolution?",
    answer:
      "Resolution counts total pixels (such as 1920 × 1080 vs. 3840 × 2160), while aspect ratio describes proportional shape (both are 16:9).",
  },
  {
    question: "Which image formats and file sizes can I inspect?",
    answer:
      "Any browser-decodable image format including JPG, PNG, WebP, GIF, and AVIF up to 20 MB and 50 megapixels.",
  },
];

export function ImageAspectRatioV3Content() {
  const navigate = useNavigate();

  const mapV2TargetToV3 = (
    to: "/v2/make-image-square" | "/v2/change-image-aspect-ratio" | "/v2/screenshot-beautifier",
  ) => {
    if (to === "/v2/make-image-square") {
      void navigate({ to: "/v3/make-image-square" });
    } else if (to === "/v2/screenshot-beautifier") {
      void navigate({ to: "/v3/screenshot-beautifier" });
    } else {
      void navigate({ to: "/v3/change-image-aspect-ratio" });
    }
  };

  return (
    <V3PageShell
      title="Image Aspect Ratio"
      compareV2To="/v2"
      hero={{
        title: (
          <>
            Image Aspect Ratio <span className="text-primary">Calculator</span>
          </>
        ),
        description:
          "Instant picture ratio finder: drop or paste any photo to check its pixel dimensions, exact aspect ratio, 300 DPI print size, and Fit/Fill frame previews.",
      }}
    >
      <ImageInspectorV2 onNavigate={mapV2TargetToV3} />

      <V3Editorial
        overview={{
          eyebrow: "Instant File Diagnostics",
          heading: "Know Your Photo’s Exact Picture Ratio & Print Size Before You Crop",
          lead: "Design exports and phone captures often miss standard frames by a single pixel. Use this local photo size ratio calculator and aspect ratio finder to calculate aspect ratio from width and height, check megapixels and 300 DPI print dimensions, and preview 1:1, 4:5, 9:16, and 16:9 framing in one click.",
        }}
        shortcuts={{
          heading: "Quick Actions",
          items: [
            { keys: ["⌘/Ctrl", "V"], action: "Paste image from clipboard" },
            { keys: ["Fit / Fill"], action: "Compare padding vs. center crop" },
            { keys: ["Copy ratio"], action: "Copy reduced W:H fraction" },
          ],
        }}
        howTo={{
          heading: "How to Check an Image’s Aspect Ratio",
          steps: STEPS,
        }}
        features={{
          heading: "Accurate Diagnostics With Zero Guesswork",
          items: FEATURES,
        }}
        referenceSection={
          <section aria-labelledby="v3-unfamiliar-ratios" className="space-y-4">
            <div className="space-y-1">
              <p className="v3-eyebrow">Reference Examples</p>
              <h2
                id="v3-unfamiliar-ratios"
                className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl"
              >
                When an Exact Ratio Looks Unfamiliar
              </h2>
            </div>

            <div className="v3-table-wrap">
              <table className="v3-table">
                <thead>
                  <tr>
                    <th scope="col">Image Size</th>
                    <th scope="col">Exact Ratio</th>
                    <th scope="col">Decimal</th>
                    <th scope="col">Nearest Common Ratio (≤3%)</th>
                  </tr>
                </thead>
                <tbody>
                  {NEAR_EXAMPLES.map(([w, h, source]) => {
                    const s = summarizeExample(w, h);
                    return (
                      <tr key={`${w}x${h}`}>
                        <td>
                          <div className="num font-semibold text-foreground">
                            {w} × {h} px
                          </div>
                          <div className="text-xs text-muted-foreground">{source}</div>
                        </td>
                        <td className="num font-semibold text-foreground">{s.exact}</td>
                        <td className="num text-muted-foreground">{s.decimal}</td>
                        <td className="num text-muted-foreground">{s.near}</td>
                      </tr>
                    );
                  })}
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
              to: "/v3/change-image-aspect-ratio",
              title: "Change Image Aspect Ratio",
              description:
                "Pad or crop any photo to exact Instagram 4:5, Square 1:1, Reels 9:16, or YouTube 16:9 pixels.",
              icon: <Crop className="h-4 w-4" />,
            },
            {
              to: "/v3/screenshot-beautifier",
              title: "Screenshot Beautifier",
              description:
                "Add gradient backgrounds, rounded corners, shadows, and crisp callouts to screenshots.",
              icon: <Sparkles className="h-4 w-4" />,
            },
            {
              to: "/v3/calculator",
              title: "Aspect Ratio Calculator",
              description:
                "Compute missing dimensions from width/height numbers without needing an image file.",
              icon: <Calculator className="h-4 w-4" />,
            },
          ],
        }}
      />
    </V3PageShell>
  );
}

export const imageInspectorHead = () =>
  buildV3RouteHead({
    title: PAGE_TITLE,
    description: DESCRIPTION,
    canonicalPath: "/",
    appName: "Image Aspect Ratio Calculator",
    howToTitle: "How to Find the Aspect Ratio of an Image",
    steps: STEPS,
    faqs: FAQS,
  });

export const Route = createFileRoute("/v3/")({
  head: imageInspectorHead,
  component: ImageAspectRatioV3Content,
});
