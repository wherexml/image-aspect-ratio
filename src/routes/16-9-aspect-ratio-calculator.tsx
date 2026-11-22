import { createFileRoute, Link } from "@tanstack/react-router";
import { SIXTEEN_NINE_EXAMPLES } from "@/components/SixteenNineCalculator";
import { AspectRatioCalculatorV2 } from "@/components/v2/AspectRatioCalculatorV2";
import { V3PageShell } from "@/components/v3/V3PageShell";
import { previewSeoMeta, seoLinks, seoScripts } from "@/lib/seo";

const PATH = "/16-9-aspect-ratio-calculator";
const TITLE = "16:9 Aspect Ratio Calculator — Width & Height in Pixels";
const DESCRIPTION =
  "Enter a width or height to get the matching 16:9 size in whole pixels, with exact and rounded results. Apply 720p, 1080p, 1440p or 4K in one click.";

export const Route = createFileRoute("/16-9-aspect-ratio-calculator")({
  head: () => ({
    scripts: seoScripts(TITLE, DESCRIPTION, PATH, true, "2026-11-22"),
    meta: previewSeoMeta(TITLE, DESCRIPTION, PATH),
    links: seoLinks(PATH),
  }),
  component: SixteenNinePage,
});

function SixteenNinePage() {
  return (
    <V3PageShell
      title="16:9 Aspect Ratio Calculator"
      hero={{
        title: (
          <>
            16:9 Aspect Ratio <span className="text-primary">Calculator</span>
          </>
        ),
        description:
          "Enter a known width or height to solve exact 16:9 widescreen pixel dimensions for HD, Full HD, QHD, and 4K.",
      }}
    >
      <AspectRatioCalculatorV2 variant="16:9" />

      <section className="mt-12 space-y-3" aria-labelledby="sixteen-nine-table">
        <h2 id="sixteen-nine-table" className="font-display text-2xl font-bold">
          Common 16:9 resolutions
        </h2>
        <div className="v3-table-wrap max-w-2xl">
          <table className="v3-table">
            <thead>
              <tr>
                <th scope="col">Standard</th>
                <th scope="col">Dimensions (px)</th>
              </tr>
            </thead>
            <tbody>
              {SIXTEEN_NINE_EXAMPLES.map(([w, h, name]) => (
                <tr key={w}>
                  <th scope="row" className="py-2.5 pr-3 text-left font-medium text-foreground">
                    {name}
                  </th>
                  <td className="num py-2.5 font-semibold text-foreground">
                    {w} × {h}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <nav aria-label="Related tools" className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <Link to="/calculator" className="font-medium underline-offset-4 hover:underline">
          Aspect ratio calculator
        </Link>
        <Link to="/video-aspect-ratio" className="font-medium underline-offset-4 hover:underline">
          Video aspect ratio
        </Link>
        <Link to="/youtube-aspect-ratio" className="font-medium underline-offset-4 hover:underline">
          YouTube aspect ratio
        </Link>
        <Link
          to="/change-image-aspect-ratio"
          className="font-medium underline-offset-4 hover:underline"
        >
          Change image aspect ratio
        </Link>
      </nav>
    </V3PageShell>
  );
}
