import { createFileRoute, Link } from "@tanstack/react-router";
import { StudioFrameEditorV2 } from "@/components/v2/StudioFrameEditorV2";
import { V2PageShell } from "@/components/v2/V2PageShell";

export const Route = createFileRoute("/v2/make-image-square")({
  head: () => ({
    meta: [
      { title: "Make Image Square (V2 Preview)" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: MakeImageSquareV2Page,
});

function MakeImageSquareV2Page() {
  return (
    <V2PageShell
      title="Make Image Square"
      v1To="/make-image-square"
      hero={{
        title: (
          <>
            Make Image <span className="text-primary">Square</span>
          </>
        ),
        description:
          "Fit a whole photo inside a 1:1 square with clean borders, or crop to fill — privately in your browser.",
      }}
    >
      <StudioFrameEditorV2 mode="square" />

      <section aria-labelledby="v2-square-guide" className="mt-14 grid gap-10 text-sm md:grid-cols-2">
        <div className="space-y-3">
          <h2 id="v2-square-guide" className="font-display text-2xl font-bold tracking-tight">
            Make a photo 1:1 without cropping or by reframing
          </h2>
          <p className="text-muted-foreground">
            Profile avatars, product thumbnails and square social posts require equal width and
            height. Choose Fit whole image to add clean padding around landscape or portrait photos,
            or Crop to fill to drag and zoom the subject inside the 1:1 frame.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Common 1:1 square sizes
          </h2>
          <ul className="divide-y">
            <li className="flex items-baseline justify-between gap-4 py-2.5">
              <span className="text-muted-foreground">Profile avatar</span>
              <span className="num text-right font-medium">512 × 512 px</span>
            </li>
            <li className="flex items-baseline justify-between gap-4 py-2.5">
              <span className="text-muted-foreground">Standard social square</span>
              <span className="num text-right font-medium">1080 × 1080 px</span>
            </li>
            <li className="flex items-baseline justify-between gap-4 py-2.5">
              <span className="text-muted-foreground">High-res marketplace listing</span>
              <span className="num text-right font-medium">2048 × 2048 px</span>
            </li>
          </ul>
        </div>
      </section>

      <nav aria-label="Related tools" className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <Link to="/v2" className="font-medium underline-offset-4 hover:underline">
          Image aspect ratio
        </Link>
        <Link
          to="/v2/change-image-aspect-ratio"
          className="font-medium underline-offset-4 hover:underline"
        >
          Change image aspect ratio
        </Link>
        <Link
          to="/v2/screenshot-beautifier"
          className="font-medium underline-offset-4 hover:underline"
        >
          Screenshot Studio
        </Link>
      </nav>
    </V2PageShell>
  );
}
