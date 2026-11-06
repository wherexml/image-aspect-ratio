import { createFileRoute, Link } from "@tanstack/react-router";
import { CalculatorNavigation } from "@/components/CalculatorNavigation";
import { SocialPlatformLinks } from "@/components/SocialPlatformLinks";
import { ThemeControl } from "@/components/ThemeControl";
import { previewSeoMeta, seoLinks, seoScripts } from "@/lib/seo";
const TITLE = "Social Media Aspect Ratios — Instagram, YouTube & TikTok";
const DESCRIPTION = "Find aspect ratios and calculate dimensions for Instagram Reels and Stories, YouTube videos and Shorts, and TikTok.";
export const Route = createFileRoute("/social-media")({
  head: () => ({ meta: previewSeoMeta(TITLE, DESCRIPTION, "/social-media"), links: seoLinks("/social-media"), scripts: seoScripts(TITLE, DESCRIPTION, "/social-media", false, "2026-11-05") }),
  component: SocialMedia,
});
function SocialMedia() {
  return <div className="min-h-screen">
    <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 pt-5 sm:px-6">
      <Link to="/" aria-label="Image Aspect Ratio home" className="flex items-center gap-2.5 font-display text-sm font-bold"><img src="/brand-mark.svg" width="28" height="28" alt="" />Image Aspect Ratio</Link>
      <ThemeControl />
    </header>
    <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <CalculatorNavigation />
      <h1 className="mb-12 mt-8 font-display text-4xl font-extrabold tracking-tight sm:text-6xl">Social Media <span className="text-primary">Aspect Ratios</span></h1>
      <SocialPlatformLinks hub />
    </main>
  </div>;
}
