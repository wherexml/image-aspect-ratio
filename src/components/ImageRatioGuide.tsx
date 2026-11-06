import { approxNumber, frac, roundFrac, simplifyRatio, solve, type Frac } from "@/lib/ratio";

// Same familiar ratios and 3% tolerance as the homepage canvas hint (Calculator.tsx KNOWN/canvasRatio).
const COMMON_RATIOS: [number, number][] = [
  [1, 1],
  [4, 3],
  [3, 4],
  [3, 2],
  [2, 3],
  [4, 5],
  [5, 4],
  [16, 9],
  [9, 16],
  [16, 10],
  [21, 9],
  [32, 9],
  [2, 1],
];
const NEAR_TOLERANCE = 0.03;

type RatioDescription = {
  /** Reduced integer ratio, e.g. "400:267". Always the value to copy. */
  exact: string;
  /** Ratio per 1 unit of height, two decimals, prefixed with ≈ when rounded. */
  decimal: string;
  orientation: "Square" | "Landscape" | "Portrait";
  /** Familiar ratio: exact by rational equality, or within NEAR_TOLERANCE relative difference. */
  match:
    | { kind: "exact"; label: string }
    | { kind: "near"; label: string; sameWidthHeight: bigint }
    | null;
};

/** Pure description of a width/height pair; never substitutes a near match for the exact ratio. */
function describeRatio(w: Frac, h: Frac): RatioDescription {
  const [a, b] = simplifyRatio(w, h);
  const value = approxNumber({ n: a, d: b });
  const scaled = roundFrac({ n: a * 100n, d: b });
  const decimalText = `${scaled / 100n}.${(scaled % 100n).toString().padStart(2, "0")}`.replace(
    /\.?0+$/,
    "",
  );
  const decimal = `${scaled * b === a * 100n ? "" : "≈"}${decimalText}`;
  const orientation = a === b ? "Square" : a > b ? "Landscape" : "Portrait";
  const exactMatch = COMMON_RATIOS.find(([x, y]) => a * BigInt(y) === b * BigInt(x));
  if (exactMatch)
    return {
      exact: `${a}:${b}`,
      decimal,
      orientation,
      match: { kind: "exact", label: `${exactMatch[0]}:${exactMatch[1]}` },
    };
  const nearest = COMMON_RATIOS.map(([x, y]) => ({
    x,
    y,
    diff: Math.abs(value / (x / y) - 1),
  })).sort((p, q) => p.diff - q.diff)[0]!;
  if (nearest.diff > NEAR_TOLERANCE)
    return { exact: `${a}:${b}`, decimal, orientation, match: null };
  const sameWidthHeight = roundFrac(
    solve(frac(BigInt(nearest.x)), frac(BigInt(nearest.y)), w, "height"),
  );
  return {
    exact: `${a}:${b}`,
    decimal,
    orientation,
    match: { kind: "near", label: `${nearest.x}:${nearest.y}`, sameWidthHeight },
  };
}

// Sizes chosen to show reduced, near and unmatched results; they do not repeat the examples list on the page.
const EXAMPLES: [number, number, string][] = [
  [4032, 3024, "12 MP phone photo"],
  [1200, 801, "Web export one pixel taller than 3:2"],
  [1080, 1349, "Portrait post one pixel shorter than 4:5"],
  [3840, 2160, "4K UHD frame"],
  [1170, 2532, "Phone screenshot"],
];

function matchText(d: RatioDescription, w: number): string {
  if (!d.match) return "None within 3%";
  if (d.match.kind === "exact") return `${d.match.label} exactly`;
  return `${d.match.label} · ${w} × ${d.match.sameWidthHeight} would be exact`;
}

/**
 * Reference table explaining an unfamiliar exact ratio. Computed at render with the shared BigInt math.
 * No page container: rendered through Calculator's children slot, inside <main> before the related-calculators nav.
 */
export function ImageRatioGuide() {
  const rows = EXAMPLES.map(([w, h, source]) => ({
    w,
    h,
    source,
    d: describeRatio(frac(BigInt(w)), frac(BigInt(h))),
  }));
  return (
    <section
      aria-labelledby="image-ratio-guide"
      data-testid="image-ratio-guide"
      className="mt-10 space-y-4"
    >
      <h2 id="image-ratio-guide" className="font-display text-2xl font-bold tracking-tight">
        When the exact ratio looks unfamiliar
      </h2>
      <p className="max-w-3xl text-sm text-muted-foreground">
        The calculator above reports the reduced ratio of the pixel dimensions, so a photo trimmed or
        resized by a pixel shows a value such as 400:267. This table lists, for a few typical sizes,
        the common ratio within 3% and the height that would make it exact.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <th scope="col" className="p-3">
                Image size
              </th>
              <th scope="col" className="p-3">
                Exact ratio
              </th>
              <th scope="col" className="p-3">
                Decimal
              </th>
              <th scope="col" className="p-3">
                Nearest common ratio
              </th>
              <th scope="col" className="p-3">
                Typical source
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ w, h, source, d }) => (
              <tr key={`${w}x${h}`} data-testid={`guide-row-${w}x${h}`} className="border-t">
                <td className="num p-3 whitespace-nowrap">
                  {w} × {h}
                </td>
                <td className="num p-3 font-semibold">{d.exact}</td>
                <td className="num p-3 whitespace-nowrap">{d.decimal}:1</td>
                <td className="num p-3">{matchText(d, w)}</td>
                <td className="p-3 text-muted-foreground">
                  {source} · {d.orientation}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        Reaching a common ratio means cropping or padding in your editor; this page only previews
        it.
      </p>
    </section>
  );
}
