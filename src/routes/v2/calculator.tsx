import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AspectRatioCalculatorV2 } from "@/components/v2/AspectRatioCalculatorV2";
import { V2PageShell } from "@/components/v2/V2PageShell";

const CHOOSE_RATIO_ITEMS = [
  ["16", "9", "Widescreen video & presentations"],
  ["9", "16", "Vertical video & Reels"],
  ["4", "3", "Classic TV & presentations"],
  ["3", "2", "Landscape photography"],
  ["1", "1", "Square images & avatars"],
  ["4", "5", "Portrait photos & posts"],
  ["5", "4", "Landscape prints"],
  ["2", "1", "Wide video"],
  ["21", "9", "Ultrawide frames"],
  ["32", "9", "Super ultrawide frames"],
] as const;

export const Route = createFileRoute("/v2/calculator")({
  head: () => ({
    meta: [
      { title: "Aspect Ratio Calculator (V2 Preview)" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CalculatorV2Page,
});

function CalculatorV2Page() {
  const [presetSignal, setPresetSignal] = useState<{
    rw: string;
    rh: string;
    seq: number;
  } | null>(null);

  return (
    <V2PageShell
      title="Aspect Ratio Calculator"
      v1To="/calculator"
      hero={{
        title: (
          <>
            Aspect Ratio <span className="text-primary">Calculator</span>
          </>
        ),
        description: "Find your image’s aspect ratio and calculate the exact dimensions you need.",
      }}
    >
      <AspectRatioCalculatorV2 variant="all" externalPresetSignal={presetSignal} />

      <section className="mt-12 space-y-4" aria-labelledby="v2-choose-ratio">
        <h2 id="v2-choose-ratio" className="font-display text-2xl font-bold">
          Which aspect ratio should I choose?
        </h2>
        <div className="grid gap-x-8 sm:grid-cols-2">
          {CHOOSE_RATIO_ITEMS.map(([w, h, label]) => (
            <button
              key={`${w}:${h}`}
              type="button"
              onClick={() => {
                setPresetSignal(prev => ({ rw: w, rh: h, seq: (prev?.seq ?? 0) + 1 }));
                document
                  .querySelector<HTMLElement>('[aria-label="Calculator"]')
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="flex min-h-12 cursor-pointer items-center justify-between gap-4 border-b py-3 text-left text-sm hover:text-primary"
            >
              <span>{label}</span>
              <span className="num shrink-0 font-semibold">
                {w}:{h}
              </span>
            </button>
          ))}
          <Link
            to="/v2/ultrawide-aspect-ratio-calculator"
            className="flex min-h-12 items-center justify-between gap-4 border-b py-3 text-sm hover:text-primary"
          >
            <span>Calculate actual monitor resolutions</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <nav aria-label="Related calculators" className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <Link to="/v2" className="font-medium underline-offset-4 hover:underline">
          Image aspect ratio — check an image
        </Link>
        <Link
          to="/v2/16-9-aspect-ratio-calculator"
          className="font-medium underline-offset-4 hover:underline"
        >
          16:9 aspect ratio calculator
        </Link>
        <Link
          to="/v2/video-aspect-ratio"
          className="font-medium underline-offset-4 hover:underline"
        >
          Video aspect ratio calculator
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
