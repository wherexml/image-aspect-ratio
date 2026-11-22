import { createFileRoute, Link } from "@tanstack/react-router";
import { SIXTEEN_NINE_EXAMPLES } from "@/components/SixteenNineCalculator";
import { AspectRatioCalculatorV2 } from "@/components/v2/AspectRatioCalculatorV2";
import { V2PageShell } from "@/components/v2/V2PageShell";

export const Route = createFileRoute("/v2/16-9-aspect-ratio-calculator")({
  head: () => ({
    meta: [
      { title: "16:9 Aspect Ratio Calculator (V2 Preview)" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SixteenNineCalculatorV2Page,
});

function SixteenNineCalculatorV2Page() {
  return (
    <V2PageShell
      title="16:9 Aspect Ratio Calculator"
      v1To="/16-9-aspect-ratio-calculator"
      hero={{
        title: (
          <>
            16:9 Aspect Ratio <span className="text-primary">Calculator</span>
          </>
        ),
        description:
          "Enter a known width or height to solve exact 16:9 widescreen pixel dimensions for HD, Full HD, QHD and 4K.",
      }}
    >
      <AspectRatioCalculatorV2 variant="16:9" />

      <section className="mt-12 space-y-3" aria-labelledby="v2-16-9-table">
        <h2 id="v2-16-9-table" className="font-display text-2xl font-bold">
          Common 16:9 resolutions
        </h2>
        <table className="w-full max-w-2xl table-fixed border-collapse text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
              <th scope="col" className="py-2.5 font-semibold">
                Standard
              </th>
              <th scope="col" className="py-2.5 font-semibold">
                Dimensions (px)
              </th>
            </tr>
          </thead>
          <tbody>
            {SIXTEEN_NINE_EXAMPLES.map(([w, h, name]) => (
              <tr key={w} className="border-b">
                <th scope="row" className="py-2.5 pr-3 text-left font-medium">
                  {name}
                </th>
                <td className="num py-2.5 font-semibold">
                  {w} × {h}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <nav aria-label="Related tools" className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <Link to="/v2/calculator" className="font-medium underline-offset-4 hover:underline">
          Aspect ratio calculator
        </Link>
        <Link
          to="/v2/video-aspect-ratio"
          className="font-medium underline-offset-4 hover:underline"
        >
          Video aspect ratio
        </Link>
        <Link
          to="/v2/youtube-aspect-ratio"
          className="font-medium underline-offset-4 hover:underline"
        >
          YouTube aspect ratio
        </Link>
        <Link
          to="/v2/change-image-aspect-ratio"
          className="font-medium underline-offset-4 hover:underline"
        >
          Change image aspect ratio
        </Link>
      </nav>
    </V2PageShell>
  );
}
