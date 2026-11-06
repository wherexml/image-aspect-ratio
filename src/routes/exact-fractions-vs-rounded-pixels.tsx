import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Maximize2 } from "lucide-react";
import { ThemeControl } from "@/components/ThemeControl";
import { previewSeoMeta, seoLinks, seoScripts } from "@/lib/seo";
import "./exact-fractions-vs-rounded-pixels.css";

const PATH = "/exact-fractions-vs-rounded-pixels";
const TITLE = "Exact fractions vs rounded pixels: why 1366 × 768 isn't 16:9";
const DESCRIPTION = "1366 × 768 reduces to 683:384, not 16:9. How to reduce, scale, round and crop pixel sizes without losing the exact ratio, with JavaScript and CSS examples.";
const UPDATED = "2026-10-27";

export const Route = createFileRoute("/exact-fractions-vs-rounded-pixels")({
  component: ExactFractionsArticle,
  head: () => ({
    meta: previewSeoMeta(TITLE, DESCRIPTION, PATH),
    links: seoLinks(PATH),
    scripts: seoScripts(TITLE, DESCRIPTION, PATH, false, UPDATED),
  }),
});

const sections = [
  { id: "reduce-with-the-gcd", title: "Reduce with the GCD", short: "Reduce with the GCD" },
  { id: "scaling-to-a-target-ratio", title: "Scaling to a target ratio", short: "Scale to a target" },
  { id: "round-floor-or-ceil", title: "round, floor or ceil?", short: "round, floor or ceil" },
  { id: "crops-4-5-and-9-16", title: "Crops: 4:5 and 9:16", short: "Crops: 4:5 and 9:16" },
  { id: "css-aspect-ratio", title: "CSS: let the browser keep the fraction", short: "CSS aspect-ratio" },
  { id: "checking-dimensions", title: "Checking dimensions with the calculator", short: "Check with the calculator" },
] as const;
type SectionId = typeof sections[number]["id"];

const gcdCode = `// Assumes positive integers.
function gcd(a, b) {
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

function reduceRatio(width, height) {
  const g = gcd(width, height);
  return [width / g, height / g]; // exact: g divides both
}

reduceRatio(1920, 1080); // [16, 9]    (GCD 120)
reduceRatio(1366, 768);  // [683, 384] (GCD 2)`;

const heightForCode = `// Assumes positive integers and a reduced ratio. width, rh, rw and the
// product width * rh must all be <= Number.MAX_SAFE_INTEGER.
function heightFor(width, [rw, rh], mode = "round") {
  const product = width * rh;
  return {
    isWhole: product % rw === 0,   // exact integer test
    approx: product / rw,          // floating-point result
    px: Math[mode](product / rw),
  };
}

heightFor(1200, [16, 9]); // { isWhole: true,  approx: 675,      px: 675 }
heightFor(1001, [16, 9]); // { isWhole: false, approx: 563.0625, px: 563 }`;

const cropCode = `// Assumes positive integers and a reduced ratio.
function largestExactCrop(srcW, srcH, [rw, rh]) {
  const k = Math.min(Math.floor(srcW / rw), Math.floor(srcH / rh));
  return k > 0 ? [rw * k, rh * k] : null; // null: source smaller than rw × rh
}

largestExactCrop(1920, 1080, [9, 16]); // [603, 1072]
largestExactCrop(4032, 3024, [4, 5]);  // [2416, 3020]
largestExactCrop(400, 300, [683, 384]); // null`;

const cssCode = `.video { width: 100%; aspect-ratio: 16 / 9; }
.panel { width: 100%; aspect-ratio: 1366 / 768; } /* the real shape */
.thumb { width: 270px; aspect-ratio: 4 / 5; }     /* 337.5px tall */

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;   /* Fill: cover the box, crop the overflow */
}
.preview img { object-fit: contain; } /* Fit: whole image, with bars */`;

type Cell = ReactNode;
const reduceTable: Cell[][] = [
  ["Size", "GCD", "Reduced ratio", "Width ÷ height"],
  ["1920 × 1080", "120", "16:9", "≈ 1.7778"],
  ["1366 × 768", "2", "683:384", "≈ 1.7786"],
  ["1360 × 768", "16", "85:48", "≈ 1.7708"],
  ["1440 × 900", "180", "8:5", "1.6"],
  ["3440 × 1440", "80", "43:18", "≈ 2.3889"],
];
const scaleTable: Cell[][] = [
  ["Width", "Target", "Exact height", "Rounded", "Resulting ratio", "Shape error"],
  ["1200", "16:9", "675", "675", "16:9", "0"],
  ["1001", "16:9", "9009/16 = 563.0625", "563", "1001:563", "≈ +0.011%"],
  ["1000", "9:16", "16000/9 ≈ 1777.78", "1778", "500:889", "≈ −0.012%"],
  ["1081", "4:5", "5405/4 = 1351.25", "1351", "1081:1351", "≈ +0.019%"],
  ["3440", "21:9", "10320/7 ≈ 1474.29", "1474", "1720:737", "≈ +0.019%"],
];
const roundingTable: Cell[][] = [
  ["Method", "Use when", "Example"],
  [<code>Math.round</code>, "You want the closest shape", "16:9 at 1001 wide: 563.0625 → 563"],
  [<code>Math.floor</code>, "The result must fit inside a source, container or maximum", "9:16 crop from 1920 × 1080: 607.5 → 607 wide"],
  [<code>Math.ceil</code>, "The result must cover an area or meet a minimum", "4:5 at 1081 wide, minimum height: 1351.25 → 1352"],
];
const cropTable: Cell[][] = [
  ["Source", "Target", "Largest crop (exact)", <>After <code>floor</code></>, "Largest whole-pixel crop at exact ratio"],
  ["6000 × 4000", "4:5", "3200 × 4000", "3200 × 4000", "3200 × 4000"],
  ["4032 × 3024", "4:5", "2419.2 × 3024", "2419 × 3024", "2416 × 3020"],
  ["1920 × 1080", "9:16", "607.5 × 1080", "607 × 1080", "603 × 1072"],
];

function DataTable({ rows, label }: { rows: Cell[][]; label: string }) {
  const [head, ...body] = rows;
  return <div className="xf-scroll xf-table-wrap" tabIndex={0} role="region" aria-label={`${label} (scrollable table)`}>
    <table>
      <caption className="sr-only">{label}</caption>
      <thead><tr>{head!.map((cell, i) => <th scope="col" key={i}>{cell}</th>)}</tr></thead>
      <tbody>{body.map((row, r) => <tr key={r}>{row.map((cell, i) => i === 0 ? <th scope="row" key={i}>{cell}</th> : <td key={i}>{cell}</td>)}</tr>)}</tbody>
    </table>
  </div>;
}

function CodeBlock({ code, language, label }: { code: string; language: "JavaScript" | "CSS"; label: string }) {
  return <div className="xf-code">
    <div className="xf-code-lang" aria-hidden>{language}</div>
    <pre className="xf-scroll" tabIndex={0} aria-label={`${language} example: ${label}`}><code>{code}</code></pre>
  </div>;
}

function Illustration({ name, alt, caption, eager = false }: { name: string; alt: string; caption: ReactNode; eager?: boolean }) {
  const src = `/illustrations/exact-fractions/${name}.png`;
  return <figure className="xf-figure">
    <img src={src} width={1536} height={1024} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" />
    <figcaption>
      <span>{caption}</span>
      <a className="xf-fullsize" href={src} target="_blank" rel="noopener">
        <Maximize2 size={13} aria-hidden /> Open full-size image<span className="sr-only"> (opens in a new tab)</span>
      </a>
    </figcaption>
  </figure>;
}

function Section({ id, index, children }: { id: SectionId; index: number; children: ReactNode }) {
  const section = sections.find(s => s.id === id)!;
  return <section id={id} aria-labelledby={`${id}-title`}>
    <div className="xf-section-label" aria-hidden>{String(index + 1).padStart(2, "0")}</div>
    <h2 id={`${id}-title`}>{section.title}</h2>
    {children}
  </section>;
}

function ExactFractionsArticle() {
  return <div className="exact-fractions">
    <a className="xf-skip" href="#article-content">Skip to article</a>
    <header className="xf-header">
      <Link to="/" aria-label="Image Aspect Ratio home" className="xf-brand">
        <img src="/brand-mark.svg" width="28" height="28" alt="" />
        <span>Image Aspect Ratio</span>
      </Link>
      <ThemeControl />
    </header>
    <main id="article-content" className="xf-main">
      <article>
        <header className="xf-hero">
          <p className="xf-eyebrow">PIXEL MATH</p>
          <h1>Exact fractions vs rounded pixels: why 1366 × 768 isn't 16:9</h1>
          <p className="xf-lead">1366 × 768 reduces to 683:384, not 16:9. Exact 16:9 at 1366 px wide would need a height of 768.375 px, and at 768 px tall a width of 1365⅓ px. Neither is a whole pixel, so the screen is close to 16:9 but not equal to it.</p>
          <div className="xf-meta">Updated <time dateTime={UPDATED}>October 27, 2026</time></div>
        </header>
        <div className="xf-layout">
          <aside>
            <nav aria-label="On this page" className="xf-toc">
              <p>On this page</p>
              {sections.map((s, i) => <a key={s.id} href={`#${s.id}`}><span aria-hidden>{String(i + 1).padStart(2, "0")}</span>{s.short}</a>)}
            </nav>
          </aside>
          <div className="xf-body">
            <div className="xf-intro">
              <p>The distinction matters when you calculate sizes: the ratio can be exact even when the required dimension falls between whole pixels. The examples below assume positive whole-pixel dimensions and, where noted, a ratio reduced to lowest terms. Values marked ≈ are rounded for display.</p>
              <Illustration
                name="exact-vs-near"
                eager
                alt="Two orange rectangles that look identical: 1920 × 1080, labelled 16:9 exact, and 1366 × 768, labelled 683:384 near 16:9. Below them, 1366 ÷ 2 : 768 ÷ 2 = 683:384."
                caption="Schematic illustration: at this size the two shapes look the same, but only one is exactly 16:9. The table below gives the exact reductions."
              />
            </div>

            <Section id="reduce-with-the-gcd" index={0}>
              <p>Divide width and height by their greatest common divisor (GCD). For the basics, see <Link to="/what-is-aspect-ratio">What is aspect ratio?</Link>.</p>
              <CodeBlock code={gcdCode} language="JavaScript" label="reduce a ratio with the GCD" />
              <DataTable rows={reduceTable} label="Screen sizes with their GCD, reduced ratio and decimal width-to-height value" />
              <p>The 1366 × 768 shape differs from 16:9 by about 0.05%. The difference is small, but the dimensions fail a <code>ratio === 16 / 9</code> check or a preset lookup by reduced ratio. Ultrawide labels work the same way: 3440 × 1440 is sold as "21:9" but reduces to 43:18. The <Link to="/ultrawide-aspect-ratio-calculator">ultrawide calculator</Link> uses actual monitor resolutions instead of marketing labels.</p>
              <p>Don't store a ratio as a rounded decimal. With <code>1.78</code> for 16:9, <code>1920 / 1.78</code> is ≈ 1078.65, which rounds to 1079 instead of 1080. <code>1920 * 9 / 16</code> gives 1080. Keep both integers and divide last.</p>
            </Section>

            <Section id="scaling-to-a-target-ratio" index={1}>
              <p>For a target ratio W:H, height = width × H ÷ W. The result is a whole number only when width × H is divisible by W. For a reduced ratio, that means the width must be a multiple of W.</p>
              <p>Test that with integer arithmetic rather than by inspecting a floating-point quotient:</p>
              <CodeBlock code={heightForCode} language="JavaScript" label="test whether a scaled height is a whole pixel" />
              <p>If the inputs and every intermediate product stay within <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER"><code>Number.MAX_SAFE_INTEGER</code></a>, the multiplication and <code>%</code> are exact. The division may not be: 16000 ÷ 9 = 1777.777… has no finite binary form, so <code>16000 / 9</code> returns the nearest double. <code>BigInt</code> removes the size limit, but its division truncates (<code>16000n / 9n</code> is <code>1777n</code>), so you still need to store a non-integer result as a numerator/denominator pair. The site's calculator does this.</p>
              <p>In the table below, shape error = ((width ÷ rounded height) ÷ (W ÷ H) − 1) × 100%.</p>
              <DataTable rows={scaleTable} label="Widths scaled to a target ratio with exact height, rounded height, resulting ratio and shape error" />
              <p>The errors are tiny, but a rounded size is no longer W:H: 1001 × 563 reduces to 1001:563. If you need sizes that are exactly W:H, use multiples of the reduced pair instead. Between 1000 and 1100 px wide, only 1008, 1024, 1040, 1056, 1072 and 1088 give a whole-pixel 16:9 height.</p>
              <Illustration
                name="fraction-to-pixels"
                alt="A number line from 563 to 564 marking 1001 × 9 ÷ 16 = 563.0625 just past 563, with an arrow rounding it down to 563. Side by side: the exact size 1001 × 563.0625 is 16:9; the whole-pixel size 1001 × 563 is 1001:563."
                caption="Schematic illustration of rounding one exact height to a whole pixel. The table above gives the exact heights and resulting ratios."
              />
              <p>Rounding also compounds. Scale 1920 × 1080 to 333 px wide and the height is 187.3125, which rounds to 187. Scale 333 × 187 back to 1920 wide and the height is ≈ 1078.2, which rounds to 1078. Always scale from the original dimensions or the reduced ratio.</p>
              <p>Decimal ratios such as 2.39:1 and 1.85:1 are exact as written, but a JavaScript number usually can't store them exactly. Convert them to integer pairs (239:100, 37:20) and reduce those.</p>
            </Section>

            <Section id="round-floor-or-ceil" index={2}>
              <p>Choose the direction from the layout constraint:</p>
              <DataTable rows={roundingTable} label="When to use Math.round, Math.floor or Math.ceil, with examples" />
              <p>Centring can leave half a pixel over. A 607 px crop centred in 1920 px needs an offset of (1920 − 607) ÷ 2 = 656.5. Flooring it puts the extra pixel on one side. Also note that <code>Math.round(-2.5)</code> is <code>-2</code>, because halves round toward +∞. That matters for offsets that can go negative.</p>
            </Section>

            <Section id="crops-4-5-and-9-16" index={3}>
              <p>1080 × 1350 (4:5) and 1080 × 1920 (9:16) are common portrait export sizes. Check the destination's current requirements before exporting. Crops to those ratios from typical sources often aren't whole pixels:</p>
              <DataTable rows={cropTable} label="Largest crops at 4:5 and 9:16 from common source sizes: exact, floored and largest whole-pixel exact crop" />
              <p>The last column uses the largest whole number k for which W × k by H × k fits in the source:</p>
              <CodeBlock code={cropCode} language="JavaScript" label="largest whole-pixel crop at an exact ratio" />
              <p>If the source is narrower than W or shorter than H, k is 0 and no positive whole-pixel crop at the exact ratio fits. A rounded crop is an option if a small ratio difference is acceptable. For a 12 MP photo, 2419 × 3024 is slightly off 4:5, while 2416 × 3020 is exact. If you resize to 1080 × 1350 afterwards, either works. If later code checks the ratio exactly, use the exact crop.</p>
              <p>The same fractions show how much of a 16:9 image survives in a portrait or square frame. With Fit, the image covers 9/16 = 56.25% of a 1:1 frame, 9/20 = 45% of a 4:5 frame and 81/256 ≈ 31.64% of a 9:16 frame. With Fill, the same share of the image remains visible. In both cases the share is the smaller ratio divided by the larger.</p>
              <Illustration
                name="fit-vs-fill"
                alt="A 16:9 landscape scene shown three ways: the source; Fit in a 9:16 frame, with the whole scene in a band across the middle and empty space above and below; and Fill in a 9:16 frame, with the scene enlarged to cover the frame and its sides cropped."
                caption="Schematic illustration of Fit and Fill in a 9:16 frame; proportions are approximate. The exact share is 81/256 ≈ 31.64%, as calculated above."
              />
            </Section>

            <Section id="css-aspect-ratio" index={4}>
              <p>CSS <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/aspect-ratio"><code>aspect-ratio</code></a> sets a <em>preferred</em> ratio. It applies only when at least one dimension is automatic, so if you set both <code>width</code> and <code>height</code>, those win. Content size and minimum-size constraints can also make the box differ from the preferred ratio.</p>
              <p>It accepts unreduced pairs, so you can use real dimensions:</p>
              <CodeBlock code={cssCode} language="CSS" label="aspect-ratio and object-fit" />
              <p>The browser lays out fractional sizes such as 337.5px and snaps to device pixels when it paints. Rounding in JavaScript first throws that precision away.</p>
              <p>Give each <code>{"<img>"}</code> <code>width</code> and <code>height</code> attributes equal to its actual pixel dimensions, for example <code>width="4032" height="3024"</code>. If CSS leaves the height automatic (<code>height: auto</code>), the browser reserves space at the right ratio before the image loads. The <Link to="/video-aspect-ratio">video page</Link> shows how contain produces letterboxing or pillarboxing.</p>
            </Section>

            <Section id="checking-dimensions" index={5}>
              <p>The <Link to="/calculator">aspect ratio calculator</Link> uses exact fractions:</p>
              <ul>
                <li><strong>Calculate size</strong> finds the missing dimension and says whether the result is whole pixels or rounded to the nearest pixel (halves round up). Precision detail shows the exact value.</li>
                <li><strong>Aspect ratio</strong> reduces a width and height. A "Near" label means the size is close to a common ratio, not an exact match.</li>
                <li><strong>Resize</strong> keeps the original ratio for a new width or height.</li>
              </ul>
              <p>The <Link to="/">image aspect ratio checker</Link> reads a local JPG, PNG, WebP, GIF or AVIF file in your browser and shows its reduced ratio. It previews Fit and Fill in 1:1, 4:5, 9:16 and 16:9 frames. These are visual previews; the tool doesn't crop, resize or export files.</p>
            </Section>

            <section className="xf-next" aria-labelledby="xf-next-title">
              <h2 id="xf-next-title">Check your own dimensions.</h2>
              <div className="xf-next-links">
                <Link to="/calculator" className="xf-action">Open the calculator <ArrowUpRight size={18} aria-hidden /></Link>
                <Link to="/what-is-aspect-ratio" className="xf-related">Read the aspect ratio guide <ArrowUpRight size={15} aria-hidden /></Link>
              </div>
            </section>
          </div>
        </div>
      </article>
    </main>
  </div>;
}
