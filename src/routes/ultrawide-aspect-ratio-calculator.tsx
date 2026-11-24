import { createFileRoute, Link } from "@tanstack/react-router";
import { AspectRatioCalculatorV2 } from "@/components/v2/AspectRatioCalculatorV2";
import { V3PageShell } from "@/components/v3/V3PageShell";
import { previewSeoMeta, seoLinks, seoScripts } from "@/lib/seo";

const TITLE = "Ultrawide Aspect Ratio Calculator — True Pixel Ratios & 21:9";
const DESCRIPTION =
  "Free ultrawide aspect ratio calculator. Scale 3440×1440, 2560×1080 and other resolutions using exact ratios, or compare strict 21:9.";

const ULTRAWIDE_ROWS = [
  ["3440 × 1440", "43:18", "1720 × 720"],
  ["2560 × 1080", "64:27", "1280 × 540"],
  ["3840 × 1600", "12:5", "1920 × 800"],
  ["5120 × 2160", "64:27", "2560 × 1080"],
  ["5120 × 1440", "32:9", "2560 × 720"],
] as const;

const ULTRAWIDE_RELATED_TOOLS = [
  {
    to: "/calculator",
    title: "General aspect ratio calculator",
    description: "Solve any width, height, or custom decimal ratio beyond ultrawide displays.",
  },
  {
    to: "/video-aspect-ratio",
    title: "Video aspect ratio simulator",
    description: "Compare how 16:9 widescreen and 9:16 vertical footage fits different screens.",
  },
  {
    to: "/make-image-square",
    title: "Make image square (1:1)",
    description: "Convert wide screenshots or photos into 1:1 squares with padding or crop.",
  },
  {
    to: "/social-media",
    title: "Social media aspect ratios",
    description: "See pixel dimensions for TikTok, Instagram Reels, Stories, and YouTube.",
  },
  {
    to: "/tiktok-aspect-ratio",
    title: "TikTok aspect ratio",
    description: "Check 9:16 (1080 × 1920) vertical video sizing when repurposing widescreen clips.",
  },
  {
    to: "/instagram-reel-aspect-ratio",
    title: "Instagram Reel aspect ratio",
    description: "Plan 9:16 Reels frames and verify how wide visuals crop on profile grids.",
  },
] as const;

export const Route = createFileRoute("/ultrawide-aspect-ratio-calculator")({
  head: () => ({
    scripts: seoScripts(TITLE, DESCRIPTION, "/ultrawide-aspect-ratio-calculator", true, "2026-11-22"),
    meta: previewSeoMeta(TITLE, DESCRIPTION, "/ultrawide-aspect-ratio-calculator"),
    links: seoLinks("/ultrawide-aspect-ratio-calculator"),
  }),
  component: UltrawidePage,
});

function UltrawidePage() {
  return (
    <V3PageShell
      title="Ultrawide Aspect Ratio Calculator"
      hero={{
        title: (
          <>
            Ultrawide Aspect Ratio <span className="text-primary">Calculator</span>
          </>
        ),
        description: "Scale using your screen’s actual pixel ratio, or choose strict 21:9.",
      }}
    >
      <AspectRatioCalculatorV2 variant="ultrawide" />

      <section className="mt-12 space-y-4" aria-labelledby="ultrawide-real-ratios">
        <h2 id="ultrawide-real-ratios" className="font-display text-2xl font-bold">
          21:9 is a category, not every screen’s exact ratio
        </h2>
        <p className="max-w-3xl text-sm text-muted-foreground">
          3440 × 1440 reduces to 43:18. Scaling it to 1720 pixels wide gives 720 pixels high. Strict
          21:9 at 3440 wide gives approximately 1474.29 pixels high instead of 1440. For standard
          16:9, 4:3, or custom pixel ratios, use the{" "}
          <Link
            to="/calculator"
            className="font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
          >
            aspect ratio calculator
          </Link>
          .
        </p>
        <div className="v3-table-wrap max-w-3xl">
          <table className="v3-table">
            <thead>
              <tr>
                <th scope="col">Resolution</th>
                <th scope="col">Exact ratio</th>
                <th scope="col">Half-size example</th>
              </tr>
            </thead>
            <tbody>
              {ULTRAWIDE_ROWS.map(row => (
                <tr key={row[0]}>
                  {row.map(cell => (
                    <td key={cell} className="num">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section
        aria-labelledby="ultrawide-related-tools"
        data-testid="ultrawide-internal-links"
        className="mt-14 space-y-4"
      >
        <h2 id="ultrawide-related-tools" className="font-display text-2xl font-bold tracking-tight">
          Other aspect ratio calculators &amp; social format guides
        </h2>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Reframing ultrawide gameplay, cinema footage, or desktop captures for standard displays
          and vertical social feeds? Use these calculators and platform guides directly.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ULTRAWIDE_RELATED_TOOLS.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className="group rounded-xl border bg-card p-4 transition-colors hover:border-foreground/30 hover:bg-accent/40"
            >
              <p className="text-sm font-semibold text-foreground underline-offset-4 group-hover:underline">
                {item.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </V3PageShell>
  );
}
