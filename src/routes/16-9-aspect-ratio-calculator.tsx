import { createFileRoute, Link } from "@tanstack/react-router";
import { CalculatorNavigation } from "@/components/CalculatorNavigation";
import { SixteenNineCalculator } from "@/components/SixteenNineCalculator";
import { ThemeControl } from "@/components/ThemeControl";
import { previewSeoMeta, seoLinks, seoScripts } from "@/lib/seo";

const PATH = "/16-9-aspect-ratio-calculator";
const TITLE = "16:9 Aspect Ratio Calculator — Width & Height in Pixels";
const DESCRIPTION = "Enter a width or height to get the matching 16:9 size in whole pixels, with exact and rounded results. Apply 720p, 1080p, 1440p or 4K in one click.";

export const Route = createFileRoute("/16-9-aspect-ratio-calculator")({
  head: () => ({
    scripts: seoScripts(TITLE, DESCRIPTION, PATH, true, "2026-11-16"),
    meta: previewSeoMeta(TITLE, DESCRIPTION, PATH),
    links: seoLinks(PATH),
  }),
  component: SixteenNinePage,
});

function SixteenNinePage() {
  return <div className="min-h-screen">
    <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 pt-5 sm:px-6">
      <Link to="/" aria-label="Image Aspect Ratio home" className="flex items-center gap-2.5 font-display text-sm font-bold"><img src="/brand-mark.svg" width="28" height="28" alt="" />Image Aspect Ratio</Link>
      <ThemeControl />
    </header>
    <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <CalculatorNavigation />
      <h1 className="mt-6 font-display text-[2.1rem] font-extrabold leading-[0.95] tracking-[-0.035em] sm:text-6xl">16:9 Aspect Ratio <span className="text-primary">Calculator</span></h1>
      <SixteenNineCalculator />
    </main>
  </div>;
}
