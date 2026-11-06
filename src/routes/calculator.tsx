import { createFileRoute } from "@tanstack/react-router";
import { ImageRatioGuide } from "@/components/ImageRatioGuide";
import { Calculator } from "@/components/Calculator";
import { previewSeoMeta, seoLinks, seoScripts } from "@/lib/seo";
const TITLE = "Aspect Ratio Calculator";
const DESC =
  "Free, beautifully designed image aspect ratio calculator. Find ratios and matching dimensions in seconds. No sign-up.";

export const Route = createFileRoute("/calculator")({
  component: () => <Calculator><ImageRatioGuide /></Calculator>,
  head: () => ({ scripts: seoScripts(TITLE, DESC, "/calculator", true, "2026-10-27"),
    meta: previewSeoMeta(TITLE, DESC, "/calculator"),
    links: seoLinks("/calculator"),
  }),
});
