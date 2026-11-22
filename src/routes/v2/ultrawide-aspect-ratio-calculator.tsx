import { createFileRoute, Link } from "@tanstack/react-router";
import { AspectRatioCalculatorV2 } from "@/components/v2/AspectRatioCalculatorV2";
import { V2PageShell } from "@/components/v2/V2PageShell";

const ULTRAWIDE_ROWS = [
  ["3440 × 1440", "43:18", "1720 × 720"],
  ["2560 × 1080", "64:27", "1280 × 540"],
  ["3840 × 1600", "12:5", "1920 × 800"],
  ["5120 × 2160", "64:27", "2560 × 1080"],
  ["5120 × 1440", "32:9", "2560 × 720"],
] as const;

export const Route = createFileRoute("/v2/ultrawide-aspect-ratio-calculator")({
  head: () => ({
    meta: [
      { title: "Ultrawide Aspect Ratio Calculator (V2 Preview)" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: UltrawideCalculatorV2Page,
});

function UltrawideCalculatorV2Page() {
  return (
    <V2PageShell
      title="Ultrawide Aspect Ratio Calculator"
      v1To="/ultrawide-aspect-ratio-calculator"
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

      <section className="mt-12 space-y-4" aria-labelledby="v2-real-ratios">
        <h2 id="v2-real-ratios" className="font-display text-2xl font-bold">
          21:9 is a category, not every screen’s exact ratio
        </h2>
        <p className="max-w-3xl text-sm text-muted-foreground">
          3440 × 1440 reduces to 43:18. Scaling it to 1720 pixels wide gives 720 pixels high. Strict
          21:9 at 3440 wide gives approximately 1474.29 pixels high instead of 1440.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full max-w-3xl text-left text-sm">
            <thead>
              <tr className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <th className="p-3">Resolution</th>
                <th className="p-3">Exact ratio</th>
                <th className="p-3">Half-size example</th>
              </tr>
            </thead>
            <tbody>
              {ULTRAWIDE_ROWS.map(row => (
                <tr key={row[0]} className="border-t">
                  {row.map(cell => (
                    <td key={cell} className="num p-3">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Link className="inline-block text-sm font-medium underline underline-offset-4" to="/v2/calculator">
          Aspect ratio calculator — find the ratio of any other resolution
        </Link>
      </section>
    </V2PageShell>
  );
}
