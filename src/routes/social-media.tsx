import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { CalculatorNavigation } from "@/components/CalculatorNavigation";
import { SocialPlatformLinks } from "@/components/SocialPlatformLinks";
import { ThemeControl } from "@/components/ThemeControl";
import { IMAGE_PLACEMENTS, PLACEMENT_DETAILS, PLACEMENTS_CHECKED } from "@/content/image-placements";
// Visible check date derived from the registry date (UTC so SSR and client agree).
const CHECKED_LABEL = new Date(`${PLACEMENTS_CHECKED}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
import { previewSeoMeta, seoLinks, seoScripts } from "@/lib/seo";
const TITLE = "Social Media Aspect Ratios — Instagram, YouTube & TikTok";
const DESCRIPTION = "Find aspect ratios and calculate dimensions for Instagram Reels and Stories, YouTube videos and Shorts, and TikTok.";
export const Route = createFileRoute("/social-media")({
  head: () => ({ meta: previewSeoMeta(TITLE, DESCRIPTION, "/social-media"), links: seoLinks("/social-media"), scripts: seoScripts(TITLE, DESCRIPTION, "/social-media", false, PLACEMENTS_CHECKED) }),
  component: SocialMedia,
});
function SocialMedia() {
  return <div className="min-h-screen">
    <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 pt-5 sm:px-6">
      <Link to="/" aria-label="Image Aspect Ratio home" className="flex items-center gap-2.5 font-display text-sm font-bold"><img src="/brand-mark.svg" width="28" height="28" alt="" />Image Aspect Ratio</Link>
      <ThemeControl />
    </header>
    <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <CalculatorNavigation />
      <h1 className="mb-12 mt-8 font-display text-4xl font-extrabold tracking-tight sm:text-6xl">Social Media <span className="text-primary">Aspect Ratios</span></h1>
      <SocialPlatformLinks hub />
      <ImageSizes />
    </main>
  </div>;
}

// Sourced image-placement guidance (TASK-29): read-only, no apply or export action.
function ImageSizes() {
  return <section aria-labelledby="image-sizes" className="mt-14">
    <h2 id="image-sizes" className="mb-4 font-display text-2xl font-bold">Image sizes</h2>
    <table className="w-full table-fixed text-left text-sm" aria-labelledby="image-sizes">
      <thead>
        <tr className="border-b text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          <th scope="col" className="w-[38%] py-3 pr-3">Placement</th>
          <th scope="col" className="w-[37%] py-3 pr-3">Dimensions</th>
          <th scope="col" className="py-3">Ratio</th>
        </tr>
      </thead>
      <tbody>
        {IMAGE_PLACEMENTS.map(p => <tr key={p.id} data-testid={`placement-${p.id}`} className="border-b align-top">
          <th scope="row" className="break-words py-3 pr-3 font-medium">{p.placement}</th>
          <td className="num break-words py-3 pr-3">{p.dimensions}</td>
          <td className="num break-words py-3">{p.ratio}</td>
        </tr>)}
      </tbody>
    </table>
    <details className="group mt-6 text-sm">
      <summary className="flex min-h-11 cursor-pointer items-center gap-2 font-semibold focus-visible:outline-2 focus-visible:outline-primary">
        Specifications and sources<ChevronDown aria-hidden="true" className="h-4 w-4 transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-3 max-w-3xl space-y-5 text-muted-foreground">
        <p>Checked <time dateTime={PLACEMENTS_CHECKED}>{CHECKED_LABEL}</time>. These image placements are separate from the video-frame examples above.</p>
        {PLACEMENT_DETAILS.map(d => <section key={d.title}>
          <h3 className="mb-1 font-semibold text-foreground">{d.title}</h3>
          <p>{d.text}</p>
          <p className="mt-1">Source: <a href={d.source} rel="noopener" className="break-all underline underline-offset-4 hover:text-foreground">{d.source}</a></p>
        </section>)}
      </div>
    </details>
  </section>;
}
