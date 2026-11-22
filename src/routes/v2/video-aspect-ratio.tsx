import { createFileRoute, Link } from "@tanstack/react-router";
import { VideoAspectRatioV2 } from "@/components/v2/VideoAspectRatioV2";
import { V2PageShell } from "@/components/v2/V2PageShell";

const VIDEO_EXAMPLES = [
  ["Full HD 1920 × 1080", "16:9"],
  ["Vertical 1080 × 1920", "9:16"],
  ["4K UHD 3840 × 2160", "16:9"],
  ["1920 × 1080 → 9:16 Fill", "31.6% visible"],
] as const;

export const Route = createFileRoute("/v2/video-aspect-ratio")({
  head: () => ({
    meta: [
      { title: "Video Aspect Ratio Calculator (V2 Preview)" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: VideoAspectRatioV2Page,
});

function VideoAspectRatioV2Page() {
  return (
    <V2PageShell
      title="Video Aspect Ratio"
      v1To="/video-aspect-ratio"
      hero={{
        title: (
          <>
            Video Aspect Ratio <span className="text-primary">Calculator</span>
          </>
        ),
        description:
          "Enter video dimensions to compare Fit and Fill on a widescreen display and a vertical phone.",
      }}
    >
      <VideoAspectRatioV2 />

      <section className="mt-14 grid gap-10 text-sm md:grid-cols-2" aria-labelledby="v2-video-how">
        <div className="space-y-3">
          <h2 id="v2-video-how" className="font-display text-2xl font-bold tracking-tight">
            Video framing: widescreen and vertical
          </h2>
          <p className="text-muted-foreground">
            A 16:9 clip inside a 9:16 vertical phone frame preserves the full image with top and
            bottom letterboxing in Fit mode, or fills the screen in Fill mode by cropping the left
            and right edges (leaving 31.6% of the original area visible).
          </p>
        </div>

        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Video aspect ratio examples
          </h2>
          <ul className="mt-4 divide-y">
            {VIDEO_EXAMPLES.map(([label, val]) => (
              <li key={label} className="flex items-baseline justify-between gap-4 py-2.5">
                <span className="text-muted-foreground">{label}</span>
                <span className="num text-right font-medium">{val}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <nav aria-label="Related calculators" className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <Link to="/v2/calculator" className="font-medium underline-offset-4 hover:underline">
          Aspect ratio calculator
        </Link>
        <Link to="/v2" className="font-medium underline-offset-4 hover:underline">
          Image aspect ratio — check an image
        </Link>
        <Link to="/v2/social-media" className="font-medium underline-offset-4 hover:underline">
          Social media aspect ratios
        </Link>
      </nav>
    </V2PageShell>
  );
}
