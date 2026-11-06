import { createFileRoute } from "@tanstack/react-router";
import { Calculator } from "@/components/Calculator";
import { previewSeoMeta, seoLinks, seoScripts } from "@/lib/seo";

const TITLE = "Video Aspect Ratio Calculator — Screen Fit Simulator";
const DESCRIPTION = "Free video aspect ratio calculator. Compare widescreen and vertical Fit or Fill previews, then calculate matching dimensions. No video upload needed.";

export const Route = createFileRoute("/video-aspect-ratio")({
  head: () => ({ scripts: seoScripts(TITLE, DESCRIPTION, "/video-aspect-ratio", true, "2026-10-27"), meta: previewSeoMeta(TITLE, DESCRIPTION, "/video-aspect-ratio"), links: seoLinks("/video-aspect-ratio") }),
  component: () => <Calculator key="video" media="video" />,
});
