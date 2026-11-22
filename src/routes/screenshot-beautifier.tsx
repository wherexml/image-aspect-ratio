import { createFileRoute, Link } from "@tanstack/react-router";
import { CalculatorNavigation } from "@/components/CalculatorNavigation";
import { ScreenshotStudio } from "@/components/ScreenshotStudio";
import { ThemeControl } from "@/components/ThemeControl";
import { previewSeoMeta, seoLinks, seoScripts } from "@/lib/seo";

const PATH = "/screenshot-beautifier";
const TITLE = "Screenshot Studio — Annotate & Beautify Screenshots";
const DESCRIPTION =
  "Open or paste a screenshot, crop, annotate with curved arrows, shapes, steps, text, spotlight and pixelation, add clean gradients or plain backgrounds, and export PNG or JPEG in your browser.";

export const Route = createFileRoute("/screenshot-beautifier")({
  head: () => ({
    scripts: seoScripts(TITLE, DESCRIPTION, PATH, true, "2026-11-16"),
    meta: previewSeoMeta(TITLE, DESCRIPTION, PATH),
    links: seoLinks(PATH),
  }),
  component: ScreenshotBeautifierPage,
});

function ScreenshotBeautifierPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-background">
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 pt-5 sm:px-6">
        <Link
          to="/"
          aria-label="Image Aspect Ratio home"
          className="flex items-center gap-2.5 font-display text-sm font-bold"
        >
          <img src="/brand-mark.svg" width="28" height="28" alt="" />
          Image Aspect Ratio
        </Link>
        <ThemeControl />
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <CalculatorNavigation />
        <h1 className="mt-5 text-lg font-semibold tracking-[-0.02em] text-zinc-900 dark:text-zinc-100">
          Screenshot Studio
        </h1>
        <ScreenshotStudio />

        <section aria-labelledby="studio-guide" className="mt-14 grid gap-10 text-sm md:grid-cols-2">
          <div className="space-y-3">
            <h2 id="studio-guide" className="font-display text-2xl font-bold tracking-tight text-foreground">
              Annotate and beautify screenshots in your browser
            </h2>
            <p className="text-muted-foreground">
              Screenshot Studio frames a local capture on a clean gradient, ambient blur, custom wallpaper or solid background, and adds vector-sharp callouts without uploading your image to a server.
            </p>
            <ol className="space-y-2.5 pt-1">
              <li className="flex gap-3">
                <span className="num flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">1</span>
                <span><strong className="font-semibold">Open or paste.</strong> <span className="text-muted-foreground">Choose a PNG, JPG or WebP file, or paste a clipboard capture directly with Cmd+V / Ctrl+V.</span></span>
              </li>
              <li className="flex gap-3">
                <span className="num flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">2</span>
                <span><strong className="font-semibold">Crop &amp; annotate.</strong> <span className="text-muted-foreground">Trim edges, draw curved 3-point arrows, boxes, ellipses, angle-snapped lines, numbered steps, pill text labels, spotlight dimming or pixelation blocks.</span></span>
              </li>
              <li className="flex gap-3">
                <span className="num flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">3</span>
                <span><strong className="font-semibold">Frame &amp; export.</strong> <span className="text-muted-foreground">Pick Auto or a locked aspect ratio (16:9, 4:3, 3:2, 1:1, 4:5, 9:16), adjust padding, corners and shadow, then copy PNG or download PNG / JPEG.</span></span>
              </li>
            </ol>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Capabilities, aspect ratios and privacy limits
            </h2>
            <ul className="divide-y">
              <li className="flex items-baseline justify-between gap-4 py-2.5">
                <span className="text-muted-foreground">Target frame ratios</span>
                <span className="num text-right font-medium">Auto, 16:9, 4:3, 3:2, 1:1, 4:5, 9:16</span>
              </li>
              <li className="flex items-baseline justify-between gap-4 py-2.5">
                <span className="text-muted-foreground">Input limits</span>
                <span className="num text-right font-medium">Up to 20 MB · 50 megapixels</span>
              </li>
              <li className="flex items-baseline justify-between gap-4 py-2.5">
                <span className="text-muted-foreground">Export ceiling</span>
                <span className="num text-right font-medium">PNG or JPEG · up to 4096 px</span>
              </li>
              <li className="flex items-baseline justify-between gap-4 py-2.5">
                <span className="text-muted-foreground">Saved style presets</span>
                <span className="text-right font-medium">Stored locally in browser storage</span>
              </li>
            </ul>
            <p className="pt-1 text-xs text-muted-foreground">
              Screenshots are decoded and rendered on an HTML canvas inside your browser; no image bytes or annotation text are sent to an external server. Single-image still export only — no video recording, OCR or cloud hosting.
            </p>
          </div>
        </section>

        <nav aria-label="Related tools" className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link to="/change-image-aspect-ratio" className="font-medium underline-offset-4 hover:text-foreground hover:underline">
            Change image aspect ratio
          </Link>
          <Link to="/make-image-square" className="font-medium underline-offset-4 hover:text-foreground hover:underline">
            Make image square
          </Link>
          <Link to="/" className="font-medium underline-offset-4 hover:text-foreground hover:underline">
            Image aspect ratio
          </Link>
          <Link to="/16-9-aspect-ratio-calculator" className="font-medium underline-offset-4 hover:text-foreground hover:underline">
            16:9 aspect ratio calculator
          </Link>
        </nav>
      </main>
    </div>
  );
}
