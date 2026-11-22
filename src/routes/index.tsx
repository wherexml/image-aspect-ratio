import { createFileRoute } from "@tanstack/react-router";
import { Calculator } from "@/components/Calculator";
import { ImageRatioGuide } from "@/components/ImageRatioGuide";
import { previewSeoMeta, seoLinks, seoScripts } from "@/lib/seo";

// Keep the calculator name while describing local image inspection and framing previews.
const TITLE = "Image Aspect Ratio Calculator — Find Photo Dimensions & Ratio";
const DESCRIPTION =
  "Free image aspect ratio calculator. Read a photo’s dimensions and exact ratio, then preview Fit or Fill. Images stay in your browser.";

export const Route = createFileRoute("/")({
  head: () => ({
    scripts: seoScripts(TITLE, DESCRIPTION, "/", true, "2026-11-14"),
    meta: previewSeoMeta(TITLE, DESCRIPTION, "/"),
    links: seoLinks("/"),
  }),
  component: () => (
    <Calculator media="image">
      <ImageRatioGuide />
    </Calculator>
  ),
});
