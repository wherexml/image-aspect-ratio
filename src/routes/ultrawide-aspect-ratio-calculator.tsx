import { createFileRoute, Link } from "@tanstack/react-router";
import { Calculator } from "@/components/Calculator";
import { previewSeoMeta, seoLinks, seoScripts } from "@/lib/seo";

const TITLE = "Ultrawide Aspect Ratio Calculator — True Pixel Ratios & 21:9";
const DESCRIPTION = "Free ultrawide aspect ratio calculator. Scale 3440×1440, 2560×1080 and other resolutions using exact ratios, or compare strict 21:9.";

const ULTRAWIDE_RELATED_TOOLS = [
  {
    to: "/calculator",
    title: "General aspect ratio calculator",
    description: "Solve any width, height, or custom decimal ratio beyond ultrawide displays.",
  },
  {
    to: "/video-aspect-ratio",
    title: "Video aspect ratio calculator",
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
  {
    to: "/youtube-shorts-aspect-ratio",
    title: "YouTube Shorts aspect ratio",
    description: "Compare vertical 9:16 and square 1:1 Shorts geometry against 16:9 desktop video.",
  },
] as const;

export const Route = createFileRoute("/ultrawide-aspect-ratio-calculator")({
  head: () => ({ scripts: seoScripts(TITLE, DESCRIPTION, "/ultrawide-aspect-ratio-calculator", true, "2026-10-27"), meta: previewSeoMeta(TITLE, DESCRIPTION, "/ultrawide-aspect-ratio-calculator"), links: seoLinks("/ultrawide-aspect-ratio-calculator") }),
  component: () => (
    <Calculator ultrawide>
      <section
        aria-labelledby="ultrawide-related-tools"
        data-testid="ultrawide-internal-links"
        className="mt-14 space-y-4"
      >
        <h2 id="ultrawide-related-tools" className="font-display text-2xl font-bold tracking-tight">
          Other aspect ratio calculators &amp; social format guides
        </h2>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Reframing ultrawide gameplay, cinema footage, or desktop captures for standard displays and
          vertical social feeds? Use these calculators and platform guides directly.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ULTRAWIDE_RELATED_TOOLS.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className="group rounded-xl border bg-card p-4 transition-colors hover:border-foreground/30 hover:bg-accent/40"
            >
              <p className="text-sm font-semibold text-foreground group-hover:underline underline-offset-4">
                {item.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </Calculator>
  ),
});
