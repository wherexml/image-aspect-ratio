import { createFileRoute } from "@tanstack/react-router";
import { Crop, Image as ImageIcon, Sparkles } from "lucide-react";
import { StudioFrameEditorV2 } from "@/components/v2/StudioFrameEditorV2";
import {
  buildV3RouteHead,
  V3Editorial,
  type V3FaqItem,
  type V3FeatureItem,
  type V3StepItem,
} from "@/components/v3/V3Editorial";
import { V3PageShell } from "@/components/v3/V3PageShell";

const PAGE_TITLE = "Make Image Square Without Cropping — Free 1:1 Photo Tool";
const DESCRIPTION =
  "Make any landscape or portrait photo a 1:1 square without cropping. Add white, blurred, dark, or transparent PNG borders locally in your browser.";

const STEPS: readonly V3StepItem[] = [
  {
    title: "Drop or paste your photo",
    description:
      "Select a landscape or portrait image up to 20 MB and 50 MP, or paste directly from your clipboard.",
  },
  {
    title: "Pad whole image or crop 1:1",
    description:
      "Choose Fit whole image to add clean white, dark, blurred, or transparent borders — or Crop to fill to drag and zoom.",
  },
  {
    title: "Pick output size & export",
    description:
      "Select 512, 1080, 1440, or 2048 px (or enter any custom edge up to 4096 px) and download crisp PNG or JPG.",
  },
];

const FEATURES: readonly V3FeatureItem[] = [
  {
    title: "No-Crop Square Padding",
    description:
      "Fit tall portraits or wide panoramas into a 1:1 square without slicing off heads, shoulders, or product edges.",
  },
  {
    title: "Blurred, Solid & Transparent Borders",
    description:
      "Match marketplace rules with pure `#FFFFFF` white, blend naturally with blurred photo borders, or export transparent PNGs.",
  },
  {
    title: "Precision 1:1 Crop & Pan",
    description:
      "Switch to Crop to fill to center faces for profile avatars using direct canvas dragging and smooth zoom.",
  },
  {
    title: "One-Click Square Presets",
    description:
      "Jump instantly between 512 px avatars, 1080 px Instagram posts, 1440 px HD carousels, and 2048 px e-commerce catalog listings.",
  },
  {
    title: "Lossless PNG & Compact JPG",
    description:
      "Choose PNG for logos, UI graphics, and transparency, or 92%-quality JPG for lightweight photographic uploads.",
  },
  {
    title: "100% On-Device Processing",
    description:
      "Your image stays inside your browser tab from start to finish — zero cloud uploads or watermarks.",
  },
];

const SQUARE_SIZES = [
  { size: "512 × 512 px", use: "Slack, GitHub, Discord & profile avatars" },
  { size: "1080 × 1080 px", use: "Instagram square feed, LinkedIn & community posts" },
  { size: "1440 × 1440 px", use: "High-DPI Retina carousels & digital album art" },
  { size: "2048 × 2048 px", use: "Shopify, Amazon & Etsy zoomable product listings" },
] as const;

const FAQS: readonly V3FaqItem[] = [
  {
    question: "How can I make a photo square without cropping anything out?",
    answer:
      "Keep Framing set to Fit whole image. The entire photo scales proportionally inside the 1:1 frame while the remaining top/bottom or left/right bars fill with white, black, ambient blur, or transparency.",
  },
  {
    question: "What square pixel size is best for e-commerce product photos?",
    answer:
      "Most storefronts (including Shopify, Amazon, and Etsy) recommend 2048 × 2048 px on a pure white background so customer hover-zoom remains sharp.",
  },
  {
    question: "Can I export a square PNG with transparent borders?",
    answer:
      "Yes. Select the checkerboard Transparent swatch under Background and keep Format set to PNG.",
  },
  {
    question: "Are my personal or product photos uploaded anywhere?",
    answer:
      "No. Everything runs locally on an HTML5 canvas inside your browser.",
  },
];

export const Route = createFileRoute("/make-image-square")({
  head: () =>
    buildV3RouteHead({
    forceNoindex: false,
      title: PAGE_TITLE,
      description: DESCRIPTION,
      canonicalPath: "/make-image-square",
      appName: "Make Image Square",
      howToTitle: "How to Make an Image Square Without Cropping",
      steps: STEPS,
      faqs: FAQS,
    }),
  component: MakeImageSquareV3Page,
});

function MakeImageSquareV3Page() {
  return (
    <V3PageShell
      title="Make Image Square"
      hero={{
        title: (
          <>
            Make Image <span className="text-primary">Square</span>
          </>
        ),
        description:
          "Fit a whole photo inside a 1:1 square with clean borders, or crop to fill — privately in your browser.",
      }}
    >
      <StudioFrameEditorV2 mode="square" />

      <V3Editorial
        overview={{
          eyebrow: "1:1 Square Framing",
          heading: "Convert Landscape or Portrait Photos Into Clean 1:1 Squares",
          lead: "Avatars, album covers, and e-commerce catalogs require equal width and height. Frame the full image with clean padding or crop tightly around your subject in seconds.",
        }}
        howTo={{
          heading: "How to Make an Image Square",
          steps: STEPS,
        }}
        features={{
          heading: "Built for Avatars, Social Grids & Product Listings",
          items: FEATURES,
        }}
        referenceSection={
          <section aria-labelledby="v3-square-sizes" className="space-y-4">
            <div className="space-y-1">
              <p className="v3-eyebrow">Common Sizes</p>
              <h2
                id="v3-square-sizes"
                className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl"
              >
                Standard 1:1 Square Pixel Sizes
              </h2>
            </div>

            <div className="v3-table-wrap">
              <table className="v3-table">
                <thead>
                  <tr>
                    <th scope="col">Square Resolution</th>
                    <th scope="col">Typical Destination</th>
                  </tr>
                </thead>
                <tbody>
                  {SQUARE_SIZES.map(row => (
                    <tr key={row.size}>
                      <td className="num font-semibold text-foreground whitespace-nowrap">
                        {row.size}
                      </td>
                      <td className="text-muted-foreground">{row.use}</td>
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
              to: "/change-image-aspect-ratio",
              title: "Change Image Aspect Ratio",
              description:
                "Frame or crop photos into 4:5, 9:16, 16:9, 4:3, or any custom aspect ratio.",
              icon: <Crop className="h-4 w-4" />,
            },
            {
              to: "/",
              title: "Image Aspect Ratio Calculator",
              description:
                "Inspect any image’s pixel dimensions, exact reduced GCD ratio, and 300 DPI print size.",
              icon: <ImageIcon className="h-4 w-4" />,
            },
            {
              to: "/screenshot-beautifier",
              title: "Screenshot Beautifier",
              description:
                "Add gradient backgrounds, rounded corners, shadow, and callouts to captures.",
              icon: <Sparkles className="h-4 w-4" />,
            },
          ],
        }}
      />
    </V3PageShell>
  );
}
