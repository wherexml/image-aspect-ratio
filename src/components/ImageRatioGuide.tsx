import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
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

// Lookup sizes for the second table. They repeat neither EXAMPLES above nor the examples list on the page.
// Each ratio is computed at render; the third value is only where the size is commonly met.
const COMMON_SIZES: [number, number, string][] = [
  [1920, 1080, "Full HD photo, screenshot or video frame"],
  [1280, 720, "HD thumbnail or video frame"],
  [2560, 1440, "QHD display or screenshot"],
  [1366, 768, "Laptop display"],
  [1920, 1200, "16:10 display or screenshot"],
  [1024, 768, "XGA display or classic slide"],
  [1920, 1440, "4:3 photo at 1920 wide"],
  [2048, 1536, "3 MP photo or tablet display"],
  [1200, 800, "3:2 web image"],
  [1024, 683, "3:2 photo scaled to 1024 wide"],
  [5184, 3456, "18 MP camera photo"],
  [1080, 1920, "Vertical phone frame"],
  [1080, 1440, "3:4 portrait image"],
  [1200, 630, "Link preview image"],
  [1500, 500, "Profile header banner"],
];

/** Familiar-ratio note beside an exact ratio; empty when the exact ratio already is the familiar one. */
function familiarNote(d: RatioDescription): string {
  if (!d.match) return "";
  if (d.match.kind === "near") return `near ${d.match.label}`;
  return d.match.label === d.exact ? "" : `same as ${d.match.label}`;
}

/**
 * Homepage reference content: a table explaining an unfamiliar exact ratio, a lookup table of common
 * image sizes and a short question list. Ratios are computed at render with the shared BigInt math.
 * No page container: rendered through Calculator's children slot, inside <main> before the related-calculators nav.
 */
export function ImageRatioGuide() {
  const rows = EXAMPLES.map(([w, h, source]) => ({
    w,
    h,
    source,
    d: describeRatio(frac(BigInt(w)), frac(BigInt(h))),
  }));
  const sizes = COMMON_SIZES.map(([w, h, use]) => ({
    w,
    h,
    use,
    d: describeRatio(frac(BigInt(w)), frac(BigInt(h))),
  }));
  return (
    <>
      <section
        aria-labelledby="image-ratio-guide"
        data-testid="image-ratio-guide"
        className="mt-10 space-y-4"
      >
        <h2 id="image-ratio-guide" className="font-display text-2xl font-bold tracking-tight">
          When the exact ratio looks unfamiliar
        </h2>
        <p className="max-w-3xl text-sm text-muted-foreground">
          The calculator above reports the reduced ratio of the pixel dimensions, so a photo trimmed
          or resized by a pixel shows a value such as 400:267. This table lists, for a few typical
          sizes, the common ratio within 3% and the height that would make it exact.
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

      <section
        aria-labelledby="common-image-sizes"
        data-testid="common-image-sizes"
        className="mt-14 space-y-4"
      >
        <h2 id="common-image-sizes" className="font-display text-2xl font-bold tracking-tight">
          Aspect ratios of common image sizes
        </h2>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Each ratio is the pixel width and height divided by their greatest common divisor. A size
          that only comes close to a familiar ratio is marked near.
        </p>
        <table className="w-full max-w-3xl table-fixed text-left text-sm">
          <thead>
            <tr className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <th scope="col" className="w-[30%] py-2.5 pr-3 sm:w-[24%]">
                Image size
              </th>
              <th scope="col" className="w-[34%] py-2.5 pr-3 sm:w-[32%]">
                Aspect ratio
              </th>
              <th scope="col" className="py-2.5">
                Typical use
              </th>
            </tr>
          </thead>
          <tbody>
            {sizes.map(({ w, h, use, d }) => {
              const note = familiarNote(d);
              return (
                <tr
                  key={`${w}x${h}`}
                  data-testid={`size-row-${w}x${h}`}
                  className="border-t align-baseline"
                >
                  <th scope="row" className="num py-2.5 pr-3 font-normal">
                    {w} × {h}
                  </th>
                  <td className="py-2.5 pr-3">
                    <span className="num font-semibold">{d.exact}</span>
                    {note && <span className="text-muted-foreground"> · {note}</span>}
                  </td>
                  <td className="py-2.5 text-muted-foreground">{use}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section
        aria-labelledby="image-ratio-tools-hub"
        data-testid="home-internal-links"
        className="mt-14 space-y-4"
      >
        <h2 id="image-ratio-tools-hub" className="font-display text-2xl font-bold tracking-tight">
          Aspect ratio tools &amp; social platform guides
        </h2>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Need to solve exact dimensions, export a square photo, or size vertical video for mobile
          feeds? Jump straight to a dedicated tool or platform specification guide.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CONTEXTUAL_TOOLS.map(item => (
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

      <section aria-labelledby="image-ratio-faq" data-testid="image-ratio-faq" className="mt-14">
        <h2 id="image-ratio-faq" className="font-display text-2xl font-bold tracking-tight">
          Image aspect ratio questions
        </h2>
        <div className="mt-4 grid gap-x-10 md:grid-cols-2">
          {FAQ.map(({ q, a }) => (
            <div key={q} className="border-t py-4">
              <h3 className="font-semibold">{q}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{a}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

const faqLink = "font-medium text-foreground underline underline-offset-4";

const CONTEXTUAL_TOOLS = [
  {
    to: "/calculator",
    title: "Aspect ratio calculator",
    description: "Solve a missing width or height in exact pixels and scale any resolution cleanly.",
  },
  {
    to: "/make-image-square",
    title: "Make image square",
    description: "Pad a photo with clean borders or crop to 1:1 without distortion locally.",
  },
  {
    to: "/video-aspect-ratio",
    title: "Video aspect ratio calculator",
    description: "Compare 16:9 widescreen and 9:16 vertical playback fit across screens.",
  },
  {
    to: "/social-media",
    title: "Social media aspect ratios",
    description: "Browse recommended frame sizes across TikTok, Instagram, and YouTube.",
  },
  {
    to: "/tiktok-aspect-ratio",
    title: "TikTok aspect ratio (9:16)",
    description: "Plan 1080 × 1920 vertical videos and compare organic vs. ad frame dimensions.",
  },
  {
    to: "/instagram-reel-aspect-ratio",
    title: "Instagram Reel aspect ratio",
    description: "Check 9:16 Reel dimensions, accepted feed shapes, and profile cover framing.",
  },
  {
    to: "/youtube-shorts-aspect-ratio",
    title: "YouTube Shorts aspect ratio",
    description: "Compare vertical 9:16 and 1:1 square Shorts geometry and sizing rules.",
  },
] as const;

// Answers state only what the tools do. Limits match MediaPreview (20 MB, 50 MP, browser-decodable formats).
const FAQ: { q: string; a: ReactNode }[] = [
  {
    q: "How do I calculate the aspect ratio of an image?",
    a: (
      <>
        Divide the width and the height by their greatest common divisor. For 1920 × 1080 that
        divisor is 120, which gives 16:9. Choosing a photo above does the same from the file’s pixel
        dimensions.
      </>
    ),
  },
  {
    q: "Can I get a ratio from a width and height without a photo?",
    a: (
      <>
        Yes. Enter the two numbers in the{" "}
        <Link to="/calculator" className={faqLink}>
          aspect ratio calculator
        </Link>{" "}
        to reduce them to an exact ratio or to work out a missing side.
      </>
    ),
  },
  {
    q: "Is my photo uploaded?",
    a: (
      <>
        No. Your browser decodes the image on your device to read its width and height. The file is
        not sent to a server.
      </>
    ),
  },
  {
    q: "Which image files can I check?",
    a: (
      <>
        Any format your browser can open, which usually includes JPG, PNG, WebP, GIF and AVIF. A
        file can be up to 20 MB and 50 megapixels.
      </>
    ),
  },
  {
    q: "Is aspect ratio the same as resolution?",
    a: (
      <>
        No. Resolution counts pixels and aspect ratio describes shape. 1920 × 1080 and 1280 × 720
        are different resolutions with the same 16:9 ratio.
      </>
    ),
  },
  {
    q: "How do I change an image’s aspect ratio?",
    a: (
      <>
        Crop it or pad it. Stretching distorts the picture.{" "}
        <Link to="/change-image-aspect-ratio" className={faqLink}>
          Change image aspect ratio
        </Link>{" "}
        exports a 1:1, 4:5, 9:16 or 16:9 file, and{" "}
        <Link to="/make-image-square" className={faqLink}>
          Make image square
        </Link>{" "}
        covers the square case.
      </>
    ),
  },
];
