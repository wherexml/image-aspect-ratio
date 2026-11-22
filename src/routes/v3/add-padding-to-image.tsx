import { createFileRoute } from "@tanstack/react-router";
import { CircleDot, Crop, Sparkles } from "lucide-react";
import { ImagePaddingEditorV3 } from "@/components/v3/tools/ImagePaddingEditorV3";
import {
  buildV3RouteHead,
  V3Editorial,
  type V3FaqItem,
  type V3FeatureItem,
  type V3StepItem,
} from "@/components/v3/V3Editorial";
import { V3PageShell } from "@/components/v3/V3PageShell";

const PAGE_TITLE = "Add Padding to Image & Add White Border to Photo Online";
const DESCRIPTION =
  "Add uniform pixel padding, transparent PNG margins, gallery white borders, or Polaroid frames to any image online—free, no watermark, browser-based.";

const STEPS: readonly V3StepItem[] = [
  {
    title: "Open or paste your image",
    description:
      "Select a PNG, JPG, or WebP photo — or press Cmd+V / Ctrl+V to paste a logo, product shot, or camera photo from your clipboard.",
  },
  {
    title: "Set pixel padding & canvas ratio",
    description:
      "Keep natural Auto proportions to expand outer margins, or lock 4:5, 3:4, 1:1, or 16:9 frames with Uniform, Polaroid, or 4-Side pixel controls.",
  },
  {
    title: "Choose White, Transparent, or Hex & save",
    description:
      "Pick Pure White, Gallery Cream, Transparent alpha PNG, or any custom hex color and export lossless PNG or compact JPG up to 4096 px.",
  },
];

const FEATURES: readonly V3FeatureItem[] = [
  {
    title: "True Transparent PNG Canvas Expansion",
    description:
      "Add clean transparent pixel padding around tight SVG/PNG logos, app icons, and e-commerce cutouts without flattening alpha channels.",
  },
  {
    title: "Gallery White Borders & Polaroid Frames",
    description:
      "Give street and film photography crisp uniform white mats or classic bottom-heavy Polaroid borders in one click.",
  },
  {
    title: "Auto Expand or Locked Social Ratios",
    description:
      "Expand your image’s existing ratio naturally, or fit it inside exact 1080×1350 (4:5), 1080×1440 (3:4), or 1080×1080 (1:1) social frames.",
  },
  {
    title: "Independent Top, Bottom, Left & Right Pixels",
    description:
      "Switch to 4-Side mode whenever you need asymmetric breathing room for captions, watermarks, or UI safe margins.",
  },
  {
    title: "Optional Inner Rounding & Soft Shadow",
    description:
      "Combine outer white or cream borders with subtle inner corner rounding and elevation for print-like editorial cards.",
  },
  {
    title: "Private Local Canvas Encoding",
    description:
      "Photos and transparent brand assets never leave your device — every pixel renders locally in HTML5 Canvas memory.",
  },
];

const PADDING_USE_CASES = [
  {
    useCase: "Transparent Logo / Icon Breathing Room",
    canvasMode: "Auto (Expand)",
    fill: "Transparent (PNG)",
    tip: "Prevents circular avatars or navbars from clipping tight logo edges",
  },
  {
    useCase: "Instagram Gallery White Mat",
    canvasMode: "4:5 (1080×1350) or 3:4",
    fill: "Pure White (#FFFFFF)",
    tip: "Keeps wide 3:2 camera photos uncropped with clean gallery margins",
  },
  {
    useCase: "Film / Polaroid Print Aesthetic",
    canvasMode: "Auto or 4:5",
    fill: "Gallery Cream (#FAF8F5)",
    tip: "Polaroid preset sets bottom border to 2.8× side border thickness",
  },
  {
    useCase: "E-Commerce Marketplace Product Shot",
    canvasMode: "1:1 (1080×1080)",
    fill: "Pure White (#FFFFFF)",
    tip: "Meets Amazon / Shopify pure-white square margin guidelines",
  },
] as const;

const FAQS: readonly V3FaqItem[] = [
  {
    question: "How do I add transparent padding around a PNG without turning the background white?",
    answer:
      "Select Transparent in Section 3 (Border / Padding Color) and keep the export format set to PNG. The checkerboard preview represents 100% transparent alpha space in your downloaded file.",
  },
  {
    question: "Can I add a white border to a photo for Instagram without cropping any edges?",
    answer:
      "Yes. Choose 4:5 (1080×1350) or 3:4 (1080×1440) under Canvas Mode and select White. Your entire horizontal or vertical photo scales cleanly inside the padded white frame with zero edge cropping.",
  },
  {
    question: "Can I set different pixel amounts for top, bottom, left, and right borders?",
    answer:
      "Yes. Switch Padding Style from Uniform to 4-Side to enter exact pixel values from 0 to 600 px independently for each edge, or pick Polaroid for an automatic weighted bottom margin.",
  },
  {
    question: "Does adding a border compress or watermark my original photo?",
    answer:
      "No. Exporting as PNG is completely lossless up to 4096 px on the longest side, and there are zero watermarks or account prompts.",
  },
];

export const Route = createFileRoute("/v3/add-padding-to-image")({
  head: () =>
    buildV3RouteHead({
      title: PAGE_TITLE,
      description: DESCRIPTION,
      canonicalPath: "/add-padding-to-image",
      appName: "Add Padding & White Border to Image Tool",
      howToTitle: "How to Add Padding or a White Border to an Image Online",
      steps: STEPS,
      faqs: FAQS,
    }),
  component: AddPaddingToImagePage,
});

function AddPaddingToImagePage() {
  return (
    <V3PageShell
      title="Add Padding & White Border"
      compareV2To="/v2/make-image-square"
      hero={{
        title: (
          <>
            Add <span className="text-primary">Padding &amp; White Border</span> to Image
          </>
        ),
        description:
          "Expand transparent PNG margins, frame photography in crisp gallery white borders, or fit full shots into 4:5 and 1:1 canvases locally in your browser.",
      }}
    >
      <ImagePaddingEditorV3 />

      <V3Editorial
        overview={{
          eyebrow: "Non-Destructive Canvas Expansion",
          heading: "Give Tight Logos, Product Photos & Prints Clean Breathing Room",
          lead: "Whether a PNG logo touches the very edge of its bounding box or a wide 3:2 camera shot gets cropped by social feeds, adding controlled pixel padding solves layout clipping without stretching or distorting your subject.",
        }}
        howTo={{
          heading: "How to Add Pixel Padding or a White Photo Border",
          steps: STEPS,
        }}
        features={{
          heading: "Flexible Margins for Designers, Photographers & Sellers",
          items: FEATURES,
        }}
        referenceSection={
          <section aria-labelledby="v3-padding-presets" className="space-y-4">
            <div className="space-y-1">
              <p className="v3-eyebrow">Common Setups</p>
              <h2
                id="v3-padding-presets"
                className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl"
              >
                Recommended Padding &amp; Border Recipes
              </h2>
            </div>

            <div className="v3-table-wrap">
              <table className="v3-table">
                <thead>
                  <tr>
                    <th scope="col">Scenario</th>
                    <th scope="col">Canvas Target</th>
                    <th scope="col">Fill Mode</th>
                    <th scope="col">Practical Tip</th>
                  </tr>
                </thead>
                <tbody>
                  {PADDING_USE_CASES.map(row => (
                    <tr key={row.useCase}>
                      <td className="font-semibold text-foreground">{row.useCase}</td>
                      <td className="num font-medium text-foreground">{row.canvasMode}</td>
                      <td className="text-muted-foreground">{row.fill}</td>
                      <td className="text-muted-foreground">{row.tip}</td>
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
                "Use blurred photo backdrops or solid borders to post full photos on Instagram without cropping.",
              icon: <Crop className="h-4 w-4" />,
            },
            {
              to: "/v3/round-corners-image",
              title: "Round Corners & Circle Crop",
              description:
                "Export smooth rounded-corner PNGs or 1:1 transparent circular profile avatars.",
              icon: <CircleDot className="h-4 w-4" />,
            },
            {
              to: "/v3/screenshot-beautifier",
              title: "Screenshot Beautifier",
              description:
                "Wrap UI screenshots in vibrant mesh gradients, shadows, and curved arrow callouts.",
              icon: <Sparkles className="h-4 w-4" />,
            },
          ],
        }}
      />
    </V3PageShell>
  );
}
