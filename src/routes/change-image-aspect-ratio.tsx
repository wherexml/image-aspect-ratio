import { createFileRoute, Link } from "@tanstack/react-router";
import { CalculatorNavigation } from "@/components/CalculatorNavigation";
import { ImageRatioChanger } from "@/components/ImageRatioChanger";
import { ThemeControl } from "@/components/ThemeControl";
import { previewSeoMeta, seoLinks, seoScripts } from "@/lib/seo";

const PATH = "/change-image-aspect-ratio";
const TITLE = "Change Image Aspect Ratio — Crop or Pad to 1:1, 4:5, 9:16, 16:9";
const DESCRIPTION = "Change a photo's aspect ratio in your browser. Crop or pad it to 1:1, 4:5, 9:16 or 16:9, see the exact output size, then download a PNG or JPEG.";

export const Route = createFileRoute("/change-image-aspect-ratio")({
  head: () => ({
    scripts: seoScripts(TITLE, DESCRIPTION, PATH, true, "2026-11-16"),
    meta: previewSeoMeta(TITLE, DESCRIPTION, PATH),
    links: seoLinks(PATH),
  }),
  component: ChangeImageAspectRatio,
});

function ChangeImageAspectRatio() {
  return <div className="min-h-screen">
    <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 pt-5 sm:px-6">
      <Link to="/" aria-label="Image Aspect Ratio home" className="flex items-center gap-2.5 font-display text-sm font-bold"><img src="/brand-mark.svg" width="28" height="28" alt="" />Image Aspect Ratio</Link>
      <ThemeControl />
    </header>
    <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <CalculatorNavigation />
      <h1 className="mt-6 font-display text-[2.1rem] font-extrabold leading-[0.95] tracking-[-0.035em] sm:text-6xl">Change Image <span className="text-primary">Aspect Ratio</span></h1>
      <ImageRatioChanger />

      <section aria-labelledby="change-ratio-guide" className="mt-14 grid gap-10 text-sm md:grid-cols-2">
        <div className="space-y-3">
          <h2 id="change-ratio-guide" className="font-display text-2xl font-bold tracking-tight">
            Crop or pad a photo without stretching it
          </h2>
          <p className="text-muted-foreground">
            Changing an image’s aspect ratio without distortion requires either fitting the whole photo inside the new shape with background bars, or cropping the edges to fill the frame completely.
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li><strong className="font-semibold text-foreground">Fit whole image:</strong> keeps 100% of the source photo and fills any remaining margin with your chosen solid background color.</li>
            <li><strong className="font-semibold text-foreground">Crop to fill:</strong> scales the photo to cover the entire target frame; drag on the canvas or use the zoom slider to reframe the subject.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Preset output sizes and browser limits
          </h2>
          <ul className="divide-y">
            <li className="flex items-baseline justify-between gap-4 py-2.5">
              <span className="text-muted-foreground">1:1 Square</span>
              <span className="num text-right font-medium">Default 1080 × 1080 px</span>
            </li>
            <li className="flex items-baseline justify-between gap-4 py-2.5">
              <span className="text-muted-foreground">4:5 Portrait feed</span>
              <span className="num text-right font-medium">Default 1080 × 1350 px</span>
            </li>
            <li className="flex items-baseline justify-between gap-4 py-2.5">
              <span className="text-muted-foreground">9:16 Vertical Story / Reel</span>
              <span className="num text-right font-medium">Default 1080 × 1920 px</span>
            </li>
            <li className="flex items-baseline justify-between gap-4 py-2.5">
              <span className="text-muted-foreground">16:9 Widescreen</span>
              <span className="num text-right font-medium">Default 1920 × 1080 px</span>
            </li>
          </ul>
          <p className="pt-1 text-xs text-muted-foreground">
            Enter any output width so both sides stay within 1–4096 px; non-integer heights round to the nearest whole pixel and are labeled. Processing happens locally in your browser (inputs up to 20 MB and 50 MP, one still PNG or JPEG export, no server upload).
          </p>
        </div>
      </section>

      <nav aria-label="Related tools" className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <Link to="/" className="font-medium underline-offset-4 hover:underline">Image aspect ratio</Link>
        <Link to="/make-image-square" className="font-medium underline-offset-4 hover:underline">Make image square</Link>
        <Link to="/screenshot-beautifier" className="font-medium underline-offset-4 hover:underline">Screenshot Beautifier</Link>
        <Link to="/16-9-aspect-ratio-calculator" className="font-medium underline-offset-4 hover:underline">16:9 aspect ratio calculator</Link>
      </nav>
    </main>
  </div>;
}
