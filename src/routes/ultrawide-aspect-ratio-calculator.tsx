import { createFileRoute } from "@tanstack/react-router";
import { Calculator } from "@/components/Calculator";
import { previewSeoMeta, seoLinks, seoScripts } from "@/lib/seo";

const TITLE = "Ultrawide Aspect Ratio Calculator — True Pixel Ratios & 21:9";
const DESCRIPTION = "Free ultrawide aspect ratio calculator. Scale 3440×1440, 2560×1080 and other resolutions using exact ratios, or compare strict 21:9.";

export const Route = createFileRoute("/ultrawide-aspect-ratio-calculator")({
  head: () => ({ scripts: seoScripts(TITLE, DESCRIPTION, "/ultrawide-aspect-ratio-calculator", true, "2026-10-27"), meta: previewSeoMeta(TITLE, DESCRIPTION, "/ultrawide-aspect-ratio-calculator"), links: seoLinks("/ultrawide-aspect-ratio-calculator") }),
  component: () => <Calculator ultrawide />,
});
