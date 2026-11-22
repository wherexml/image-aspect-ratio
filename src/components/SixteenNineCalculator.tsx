import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, Copy, RotateCcw } from "lucide-react";
import { decimalString, frac, isInteger, parsePositive, roundFrac, simplifyRatio, solve, type ParseResult } from "@/lib/ratio";
import { useToolTracking } from "@/lib/tool-analytics";

type Side = "width" | "height";

const DEFAULTS = { side: "width" as Side, width: "1920", height: "1080" };
const RW = frac(16n), RH = frac(9n);
export const SIXTEEN_NINE_EXAMPLES: [number, number, string][] = [
  [640, 360, "nHD"],
  [1280, 720, "HD 720p"],
  [1920, 1080, "Full HD 1080p"],
  [2560, 1440, "QHD 1440p"],
  [3840, 2160, "4K UHD"],
];

/** Positive whole pixels up to 1,000,000; reuses the shared exact parser, then rejects fractions of a pixel. */
function parsePixels(raw: string): ParseResult {
  const parsed = parsePositive(raw);
  if (parsed.ok && !isInteger(parsed.value)) return { ok: false, error: "Use whole pixels" };
  return parsed;
}

/** Focused 16:9 solver: one known side, exact BigInt result, rounded whole-pixel output shown and copied identically. */
export function SixteenNineCalculator() {
  const [side, setSide] = useState<Side>(DEFAULTS.side);
  const [widthText, setWidthText] = useState(DEFAULTS.width);
  const [heightText, setHeightText] = useState(DEFAULTS.height);
  const [copyState, setCopyState] = useState<"idle" | "ok" | "fail">("idle");
  const copyGeneration = useRef(0);
  const timer = useRef<number | undefined>(undefined);
  const resultRef = useRef<HTMLDivElement>(null);

  const knownText = side === "width" ? widthText : heightText;
  const parsed = parsePixels(knownText);
  const result = (() => {
    if (!parsed.ok) return null;
    const exactOther = solve(RW, RH, parsed.value, side === "width" ? "height" : "width");
    const other = roundFrac(exactOther);
    const known = parsed.value.n;
    const w = side === "width" ? known : other;
    const h = side === "width" ? other : known;
    const [a, b] = simplifyRatio(frac(w), frac(h));
    return { w, h, exact: isInteger(exactOther), exactOther, pixelRatio: `${a}:${b}`, usable: other >= 1n, copy: `${w} × ${h}` };
  })();
  const copyAllowed = !!result && result.usable;
  const tracking = useToolTracking("16_9", "solve", copyAllowed && result ? `${side}:${result.copy}` : null);

  useEffect(() => () => { copyGeneration.current++; window.clearTimeout(timer.current); }, []);
  const resetCopy = () => { copyGeneration.current++; window.clearTimeout(timer.current); setCopyState("idle"); };

  async function copy() {
    if (!result || !copyAllowed) return;
    resetCopy();
    const id = copyGeneration.current;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("no clipboard");
      await navigator.clipboard.writeText(result.copy);
      if (id !== copyGeneration.current) return;
      tracking.copy(result.copy);
      setCopyState("ok");
      timer.current = window.setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      if (id !== copyGeneration.current) return;
      setCopyState("fail");
    }
  }

  function pickSide(next: Side) {
    if (next === side) return;
    resetCopy();
    // An exact result carries its counterpart so the pair is unchanged; otherwise each side keeps its own value.
    if (result?.exact) {
      if (next === "height") setHeightText(result.h.toString());
      else setWidthText(result.w.toString());
    }
    setSide(next);
  }
  function edit(text: string) {
    tracking.changed();
    resetCopy();
    (side === "width" ? setWidthText : setHeightText)(text);
  }
  function apply(w: number, h: number) {
    tracking.changed();
    resetCopy();
    setWidthText(String(w)); setHeightText(String(h));
  }
  function reset() {
    tracking.cancel();
    resetCopy();
    setSide(DEFAULTS.side); setWidthText(DEFAULTS.width); setHeightText(DEFAULTS.height);
  }

  const fieldId = "sixteen-nine-known";
  const status = !result ? "Result" : result.exact ? "Exact 16:9" : "Rounded px";

  return <section aria-label="16:9 calculator" className="mt-8">
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground" id="sixteen-nine-side">I know the</span>
          <div className="flex items-center gap-1">
            <div role="radiogroup" aria-labelledby="sixteen-nine-side" className="seg">
              <button type="button" role="radio" aria-checked={side === "width"} onClick={() => pickSide("width")}>Width</button>
              <button type="button" role="radio" aria-checked={side === "height"} onClick={() => pickSide("height")}>Height</button>
            </div>
            <button type="button" onClick={reset} aria-label="Reset" title="Reset"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:h-9 sm:w-9">
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div>
          <label htmlFor={fieldId} className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {side === "width" ? "Width (px)" : "Height (px)"}
          </label>
          <input id={fieldId} className="field" inputMode="numeric" autoComplete="off" spellCheck={false}
            value={knownText} onChange={e => edit(e.target.value)}
            aria-invalid={!parsed.ok} aria-describedby={`${fieldId}-err`} />
          <p id={`${fieldId}-err`} className="mt-1 min-h-4 text-xs font-medium text-destructive" aria-live="polite">{parsed.ok ? "" : parsed.error}</p>
        </div>
      </div>

      <div className="calculator-result rounded-xl bg-stage p-4 text-foreground" aria-live="polite">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em]">{status}</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div ref={resultRef} data-testid="result-value" className="num min-w-0 break-words text-2xl font-bold leading-tight sm:text-3xl">
            {result ? `${result.copy} px` : "—"}
          </div>
          <button type="button" onClick={copy} disabled={!copyAllowed}
            aria-label={copyAllowed && result ? `Copy ${result.copy}` : "Copy unavailable"}
            className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-foreground px-3.5 py-2 text-sm font-semibold text-background transition hover:ring-2 hover:ring-primary hover:ring-offset-2 hover:ring-offset-stage disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-0">
            {copyState === "ok" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copyState === "ok" ? "Copied" : "Copy"}
          </button>
        </div>
        {result && !result.exact && <p className="num mt-3 text-sm opacity-90" data-testid="result-detail">
          {`${side === "width" ? "Height" : "Width"} ${decimalString(result.exactOther)} px rounded to the nearest whole pixel. Pixel ratio ${result.pixelRatio}, not exactly 16:9.`}
        </p>}
        {copyState === "fail" && result && <div role="alert" className="mt-2 text-sm text-signal">
          <p>Couldn’t access the clipboard. Select and copy this value:</p>
          <input aria-label="Copy result manually" readOnly value={result.copy} onFocus={e => e.target.select()} className="mt-2 w-full rounded border bg-card p-2 text-foreground" />
        </div>}
      </div>
    </div>

    <table className="mt-10 w-full table-fixed border-collapse text-sm">
      <caption className="mb-2 text-left font-display text-lg font-bold">Common 16:9 resolutions</caption>
      <thead>
        <tr className="border-b text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
          <th scope="col" className="py-2 font-semibold">Name</th>
          <th scope="col" className="py-2 font-semibold">Size (px)</th>
          <th scope="col" className="w-24 py-2"><span className="sr-only">Action</span></th>
        </tr>
      </thead>
      <tbody>
        {SIXTEEN_NINE_EXAMPLES.map(([w, h, name]) => {
          const active = !!result && result.w === BigInt(w) && result.h === BigInt(h);
          return <tr key={w} className="border-b" data-active={active || undefined}>
            <th scope="row" className="py-2 pr-2 text-left font-medium">{name}</th>
            <td className={`num py-2 pr-2 ${active ? "font-semibold text-primary" : ""}`}>{w} × {h}</td>
            <td className="py-1 text-right">
              <button type="button" onClick={() => apply(w, h)} aria-label={`Use ${w} × ${h}`}
                className="min-h-11 rounded-lg border px-3 py-2 text-xs font-semibold hover:bg-accent">{active ? "In use" : "Use"}</button>
            </td>
          </tr>;
        })}
      </tbody>
    </table>

    <div className="mt-12 grid gap-8 text-sm md:grid-cols-2">
      <section aria-labelledby="sixteen-nine-formula" className="space-y-2">
        <h2 id="sixteen-nine-formula" className="font-display text-xl font-bold tracking-tight">How 16:9 pixel dimensions are calculated</h2>
        <p className="text-muted-foreground">At an exact 16:9 aspect ratio, height equals width × 9 ÷ 16, and width equals height × 16 ÷ 9. Whole-pixel sizes are exact whenever width is a multiple of 16 and height is the matching multiple of 9 — such as 1280 × 720 (80 × 16 by 80 × 9) or 1920 × 1080 (120 × 16 by 120 × 9).</p>
        <p className="text-muted-foreground">When a custom dimension is not divisible by 16 or 9 — for example, 1000 px wide gives 562.5 px high — this calculator shows both the rounded whole-pixel output (1000 × 563 px) and the exact fraction so you can decide whether to round or pick a nearby multiple of 16.</p>
      </section>
      <section aria-labelledby="sixteen-nine-uses" className="space-y-2">
        <h2 id="sixteen-nine-uses" className="font-display text-xl font-bold tracking-tight">Scope and limitations</h2>
        <p className="text-muted-foreground">16:9 is the standard widescreen frame for HD, Full HD and 4K displays, landscape video players, presentation slides and widescreen thumbnails. Calculation happens locally in your browser using exact integer arithmetic.</p>
        <p className="text-muted-foreground">This page computes pixel dimensions only; it does not inspect, resize or export media files. To crop or pad an actual image to 16:9, use <Link to="/change-image-aspect-ratio" className="font-medium text-foreground underline underline-offset-4">Change image aspect ratio</Link>.</p>
      </section>
    </div>

    <nav aria-label="Related tools" className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm">
      <Link to="/calculator" className="font-medium underline-offset-4 hover:underline">Aspect ratio calculator</Link>
      <Link to="/video-aspect-ratio" className="font-medium underline-offset-4 hover:underline">Video aspect ratio</Link>
      <Link to="/youtube-aspect-ratio" className="font-medium underline-offset-4 hover:underline">YouTube aspect ratio</Link>
      <Link to="/change-image-aspect-ratio" className="font-medium underline-offset-4 hover:underline">Change image aspect ratio</Link>
      <Link to="/screenshot-beautifier" className="font-medium underline-offset-4 hover:underline">Screenshot Beautifier</Link>
    </nav>
  </section>;
}
