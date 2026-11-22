import { createFileRoute, Link } from "@tanstack/react-router";
import { StudioFrameEditorV2 } from "@/components/v2/StudioFrameEditorV2";
import { V2PageShell } from "@/components/v2/V2PageShell";

export const Route = createFileRoute("/v2/change-image-aspect-ratio")({
  head: () => ({
    meta: [
      { title: "Change Image Aspect Ratio (V2 Preview)" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ChangeImageAspectRatioV2Page,
});

function ChangeImageAspectRatioV2Page() {
  return (
    <V2PageShell
      title="Change Image Aspect Ratio"
      v1To="/change-image-aspect-ratio"
      hero={{
        title: (
          <>
            Change Image <span className="text-primary">Aspect Ratio</span>
          </>
        ),
        description:
          "Crop or pad a photo to 1:1, 4:5, 9:16, 16:9 or any custom ratio in your browser, then download a crisp PNG or JPG.",
      }}
    >
      <StudioFrameEditorV2 mode="ratio" />

      <section aria-labelledby="v2-change-ratio-guide" className="mt-14 grid gap-10 text-sm md:grid-cols-2">
        <div className="space-y-3">
          <h2 id="v2-change-ratio-guide" className="font-display text-2xl font-bold tracking-tight">
            Crop or pad a photo without stretching it
          </h2>
          <p className="text-muted-foreground">
            Changing an image’s aspect ratio without distortion requires either fitting the whole
            photo inside the new shape with background bars, or cropping the edges to fill the frame
            completely.
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <strong className="font-semibold text-foreground">Fit whole image:</strong> keeps 100%
              of the source photo and fills any remaining margin with a solid color, blurred photo
              backdrop, or transparency.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Crop to fill:</strong> scales the
              photo to cover the entire target frame; drag on the canvas or use the zoom slider to
              reframe the subject.
            </li>
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
            Enter any output width so both sides stay within 1–4096 px; non-integer heights round to
            the nearest whole pixel and are labeled. Processing happens locally in your browser.
          </p>
        </div>
      </section>

      <nav aria-label="Related tools" className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <Link to="/v2" className="font-medium underline-offset-4 hover:underline">
          Image aspect ratio
        </Link>
        <Link to="/v2/make-image-square" className="font-medium underline-offset-4 hover:underline">
          Make image square
        </Link>
        <Link
          to="/v2/screenshot-beautifier"
          className="font-medium underline-offset-4 hover:underline"
        >
          Screenshot Studio
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
