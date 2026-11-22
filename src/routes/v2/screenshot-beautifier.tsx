import { createFileRoute, Link } from "@tanstack/react-router";
import { ScreenshotStudio } from "@/components/ScreenshotStudio";
import { V2PageShell } from "@/components/v2/V2PageShell";

export const Route = createFileRoute("/v2/screenshot-beautifier")({
  head: () => ({
    meta: [
      { title: "Screenshot Studio (V2 Preview)" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ScreenshotBeautifierV2Page,
});

function ScreenshotBeautifierV2Page() {
  return (
    <V2PageShell
      title="Screenshot Studio"
      v1To="/screenshot-beautifier"
      hero={{
        title: (
          <>
            Screenshot <span className="text-primary">Studio</span>
          </>
        ),
        description:
          "Frame screenshots on gradients or clean backdrops, add curved arrows, callouts and mosaic redaction, and export PNG or JPG in your browser.",
      }}
    >
      <ScreenshotStudio />

      <section aria-labelledby="v2-studio-guide" className="mt-14 grid gap-10 text-sm md:grid-cols-2">
        <div className="space-y-3">
          <h2 id="v2-studio-guide" className="font-display text-2xl font-bold tracking-tight">
            Annotate and beautify screenshots in your browser
          </h2>
          <p className="text-muted-foreground">
            Screenshot Studio frames a local capture on a gradient, ambient blur, custom wallpaper
            or solid background, and adds vector-sharp callouts without uploading your image to a
            server.
          </p>
          <ol className="space-y-2.5 pt-1">
            <li className="flex gap-3">
              <span className="num flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                1
              </span>
              <span>
                <strong className="font-semibold">Open or paste.</strong>{" "}
                <span className="text-muted-foreground">
                  Choose a PNG, JPG or WebP file, or paste a clipboard capture directly with Cmd+V /
                  Ctrl+V.
                </span>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="num flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                2
              </span>
              <span>
                <strong className="font-semibold">Crop &amp; annotate.</strong>{" "}
                <span className="text-muted-foreground">
                  Trim edges, draw curved 3-point arrows, boxes, ellipses, angle-snapped lines,
                  numbered steps, pill text labels, spotlight dimming or pixelation blocks.
                </span>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="num flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                3
              </span>
              <span>
                <strong className="font-semibold">Frame &amp; export.</strong>{" "}
                <span className="text-muted-foreground">
                  Pick Auto or a locked aspect ratio (16:9, 4:3, 3:2, 1:1, 4:5, 9:16) on the right,
                  adjust padding, corners and shadow, then copy PNG or download PNG / JPG.
                </span>
              </span>
            </li>
          </ol>
        </div>

        <div className="space-y-3">
          <h2 className="font-display text-2xl font-bold tracking-tight">
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
              <span className="num text-right font-medium">PNG or JPG · up to 4096 px</span>
            </li>
            <li className="flex items-baseline justify-between gap-4 py-2.5">
              <span className="text-muted-foreground">Saved style presets</span>
              <span className="text-right font-medium">Stored locally in browser storage</span>
            </li>
          </ul>
        </div>
      </section>

      <nav aria-label="Related tools" className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <Link
          to="/v2/change-image-aspect-ratio"
          className="font-medium underline-offset-4 hover:underline"
        >
          Change image aspect ratio
        </Link>
        <Link to="/v2/make-image-square" className="font-medium underline-offset-4 hover:underline">
          Make image square
        </Link>
        <Link to="/v2" className="font-medium underline-offset-4 hover:underline">
          Image aspect ratio
        </Link>
        <Link
          to="/v2/16-9-aspect-ratio-calculator"
          className="font-medium underline-offset-4 hover:underline"
        >
          16:9 aspect ratio calculator
        </Link>
      </nav>
    </V2PageShell>
  );
}
