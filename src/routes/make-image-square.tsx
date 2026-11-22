import { createFileRoute, Link } from "@tanstack/react-router";
import { CalculatorNavigation } from "@/components/CalculatorNavigation";
import { SquareImageMaker } from "@/components/SquareImageMaker";
import { ThemeControl } from "@/components/ThemeControl";
import { previewSeoMeta, seoLinks, seoScripts } from "@/lib/seo";

// Proposed SEO strings; the visible UI uses only the reviewed labels.
const TITLE = "Make Image Square — Pad or Crop a Photo";
const DESCRIPTION = "Make a photo square in your browser. Pad it with a solid background or crop and reposition it, then download a PNG or JPEG up to 4096 px.";

export const Route = createFileRoute("/make-image-square")({
  head: () => ({
    scripts: seoScripts(TITLE, DESCRIPTION, "/make-image-square", true, "2026-11-16"),
    meta: previewSeoMeta(TITLE, DESCRIPTION, "/make-image-square"),
    links: seoLinks("/make-image-square"),
  }),
  component: MakeImageSquare,
});

function MakeImageSquare() {
  return <div className="min-h-screen">
    <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 pt-5 sm:px-6">
      <Link to="/" aria-label="Image Aspect Ratio home" className="flex items-center gap-2.5 font-display text-sm font-bold"><img src="/brand-mark.svg" width="28" height="28" alt="" />Image Aspect Ratio</Link>
      <ThemeControl />
    </header>
    <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <CalculatorNavigation />
      <h1 className="mt-6 font-display text-[2.1rem] font-extrabold leading-[0.95] tracking-[-0.035em] sm:text-6xl">Make image <span className="text-primary">square</span></h1>
      <SquareImageMaker />

      <section aria-labelledby="square-guide" className="mt-14 grid gap-10 text-sm md:grid-cols-2">
        <div className="space-y-3">
          <h2 id="square-guide" className="font-display text-2xl font-bold tracking-tight">
            Two ways to turn a rectangular photo into a 1:1 square
          </h2>
          <p className="text-muted-foreground">
            A 1:1 square has equal pixel width and height, such as 1080 × 1080 px. Stretching a landscape or portrait photo into a square distorts faces and objects; padding or cropping keeps proportions intact.
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li><strong className="font-semibold text-foreground">Fit whole image (pad):</strong> places the complete photo inside the square and fills top/bottom or left/right margins with a solid color.</li>
            <li><strong className="font-semibold text-foreground">Crop to fill:</strong> fills the 1:1 canvas edge to edge and lets you drag or zoom to position the subject.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Common square sizes and local processing
          </h2>
          <ul className="divide-y">
            <li className="flex items-baseline justify-between gap-4 py-2.5">
              <span className="text-muted-foreground">Profile avatar or icon</span>
              <span className="num text-right font-medium">512 × 512 px</span>
            </li>
            <li className="flex items-baseline justify-between gap-4 py-2.5">
              <span className="text-muted-foreground">Standard social post</span>
              <span className="num text-right font-medium">1080 × 1080 px</span>
            </li>
            <li className="flex items-baseline justify-between gap-4 py-2.5">
              <span className="text-muted-foreground">Product catalog image</span>
              <span className="num text-right font-medium">2048 × 2048 px</span>
            </li>
          </ul>
          <p className="pt-1 text-xs text-muted-foreground">
            Output size accepts whole pixels from 1 to 4096 px (PNG or JPEG). Your photo is decoded and rendered locally in your browser up to 20 MB / 50 MP and is never uploaded to a server.
          </p>
        </div>
      </section>

      <nav aria-label="Related tools" className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <Link to="/" className="font-medium underline-offset-4 hover:underline">Image aspect ratio</Link>
        <Link to="/change-image-aspect-ratio" className="font-medium underline-offset-4 hover:underline">Change image aspect ratio</Link>
        <Link to="/screenshot-beautifier" className="font-medium underline-offset-4 hover:underline">Screenshot Beautifier</Link>
      </nav>
    </main>
  </div>;
}
