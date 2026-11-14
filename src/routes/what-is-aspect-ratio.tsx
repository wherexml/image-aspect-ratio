import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { ThemeControl } from "@/components/ThemeControl";
import { guideCommonRatioLinks } from "@/lib/internal-links";
import { previewSeoMeta, seoLinks, seoScripts } from "@/lib/seo";
import guide from "@/content/aspect-ratio-guide.json";
import anatomy from "../../public/illustrations/aspect-ratio-anatomy.svg?raw";
import shapes from "../../public/illustrations/aspect-ratio-shapes.svg?raw";
import fit from "../../public/illustrations/aspect-ratio-fit.svg?raw";
import "./what-is-aspect-ratio.css";

const TITLE = "What Is Aspect Ratio? A Visual Guide with Examples";
const DESCRIPTION =
  "Learn what aspect ratio means, how to calculate it, and how 16:9, 4:3 and other ratios compare. See the difference between cropping, padding and stretching.";
const UPDATED = "2026-10-26";

export const Route = createFileRoute("/what-is-aspect-ratio")({
  component: AspectRatioGuide,
  head: () => ({
    meta: previewSeoMeta(TITLE, DESCRIPTION, "/what-is-aspect-ratio"),
    links: seoLinks("/what-is-aspect-ratio"),
    scripts: seoScripts(TITLE, DESCRIPTION, "/what-is-aspect-ratio", false, UPDATED),
  }),
});

const sources = {
  definition: {
    title: "MDN: Aspect ratio",
    url: "https://developer.mozilla.org/en-US/docs/Glossary/Aspect_ratio",
  },
  sizing: {
    title: "Adobe: Image size and resolution",
    url: "https://helpx.adobe.com/photoshop/using/image-size-resolution.html",
  },
  video: {
    title: "YouTube: Video resolution & aspect ratios",
    url: "https://support.google.com/youtube/answer/6375112?hl=en",
  },
  crop: {
    title: "Adobe: Crop tool options",
    url: "https://helpx.adobe.com/photoshop/desktop/crop-resize-transform/crop-straighten/crop-tool-options.html",
  },
};
const sectionSources: Record<string, keyof typeof sources> = {
  "reading-a-ratio": "definition",
  "ratio-vs-resolution": "sizing",
  "common-ratios": "video",
  "crop-fit-stretch": "crop",
};
const shortTitles = [
  "Read a ratio",
  "Ratio vs. resolution",
  "Common ratios",
  "Calculate a ratio",
  "Crop, fit or stretch",
  "Choose a ratio",
  "Questions",
];

// Only trusted, repository-owned SVG source is inlined; no user content is accepted.
function Diagram({ source, className = "" }: { source: string; className?: string }) {
  return (
    <div
      className={`ratio-guide-diagram ${className}`}
      dangerouslySetInnerHTML={{ __html: source }}
    />
  );
}

function AspectRatioGuide() {
  return (
    <div className="ratio-guide">
      <a className="ratio-guide-skip" href="#guide-content">
        Skip to guide
      </a>
      <header className="ratio-guide-header">
        <Link to="/" aria-label="Image Aspect Ratio home" className="ratio-guide-brand">
          <img src="/brand-mark.svg" width="28" height="28" alt="" />
          <span>Image Aspect Ratio</span>
        </Link>
        <ThemeControl />
      </header>
      <main id="guide-content" className="ratio-guide-main">
        <article>
          <div className="ratio-guide-hero">
            <div>
              <p className="ratio-guide-eyebrow">THE VISUAL GUIDE</p>
              <h1>
                What is
                <br />
                aspect ratio<span className="text-primary">?</span>
              </h1>
              <p className="ratio-guide-lead">{guide.intro}</p>
              <Link to="/calculator" className="ratio-guide-action">
                Calculate a ratio <ArrowUpRight size={18} aria-hidden />
              </Link>
            </div>
            <figure className="ratio-guide-hero-figure">
              <Diagram source={anatomy} />
            </figure>
          </div>
          <div className="ratio-guide-meta">
            Updated <time dateTime={UPDATED}>October 26, 2026</time>
          </div>
          <div className="ratio-guide-layout">
            <aside>
              <nav aria-label="On this page" className="ratio-guide-toc">
                <p>On this page</p>
                {guide.sections.map((section, i) => (
                  <a key={section.id} href={`#${section.id}`}>
                    <span aria-hidden>{String(i + 1).padStart(2, "0")}</span>
                    {shortTitles[i]}
                  </a>
                ))}
              </nav>
            </aside>
            <div className="ratio-guide-body">
              {guide.sections.map((section, i) => (
                <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`}>
                  <div className="ratio-guide-section-label" aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h2 id={`${section.id}-title`}>{section.title}</h2>
                  {section.id === "common-ratios" && (
                    <figure
                      tabIndex={0}
                      role="group"
                      aria-label="Common ratio diagram"
                      className="ratio-guide-figure ratio-guide-shapes"
                    >
                      <Diagram source={shapes} />
                    </figure>
                  )}
                  {section.id === "crop-fit-stretch" && (
                    <figure
                      tabIndex={0}
                      role="group"
                      aria-label="Fit, Fill and Stretch diagram"
                      className="ratio-guide-figure ratio-guide-fit"
                    >
                      <Diagram source={fit} />
                    </figure>
                  )}
                  {section.blocks.map((block, index) =>
                    block.kind === "heading" ? (
                      <h3 key={index}>{block.text}</h3>
                    ) : block.kind === "table" ? (
                      <div className="ratio-guide-table-wrap" key={index}>
                        <table>
                          <caption className="sr-only">
                            Common aspect ratios with example dimensions and uses
                          </caption>
                          <thead>
                            <tr>
                              {block.rows?.[0]?.map((cell) => (
                                <th scope="col" key={cell}>
                                  {cell}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {block.rows?.slice(1).map((row) => (
                              <tr key={row[0]}>
                                {row.map((cell, cellIndex) =>
                                  cellIndex === 0 ? (
                                    <th scope="row" key={cellIndex}>
                                      {cell}
                                    </th>
                                  ) : (
                                    <td key={cellIndex}>{cell}</td>
                                  ),
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p key={index}>{block.text}</p>
                    ),
                  )}
                  {section.id === "calculate-aspect-ratio" && (
                    <div
                      className="ratio-guide-equation"
                      aria-label="Example: at 16 to 9, 1200 pixels wide gives 675 pixels high"
                    >
                      <span>16:9</span>
                      <code>1200 × 9 ÷ 16 = 675 px</code>
                    </div>
                  )}
                  {sectionSources[section.id] && (
                    <a
                      className="ratio-guide-source"
                      href={sources[sectionSources[section.id]!].url}
                    >
                      {sources[sectionSources[section.id]!].title}{" "}
                      <ArrowUpRight size={13} aria-hidden />
                    </a>
                  )}
                  {section.id === "calculate-aspect-ratio" && (
                    <Link className="ratio-guide-related" to="/exact-fractions-vs-rounded-pixels">
                      Why 1366 × 768 isn't exactly 16:9 <ArrowUpRight size={15} aria-hidden />
                    </Link>
                  )}
                  {section.id === "common-ratios" &&
                    guideCommonRatioLinks.map((link) => (
                      <Link key={link.to} className="ratio-guide-related" to={link.to}>
                        {link.label} <ArrowUpRight size={15} aria-hidden />
                      </Link>
                    ))}
                  {section.id === "choosing-a-ratio" && (
                    <Link className="ratio-guide-related" to="/">
                      Check a photo and preview its fit <ArrowUpRight size={15} aria-hidden />
                    </Link>
                  )}
                  {section.id === "faq" && (
                    <Link className="ratio-guide-related" to="/video-aspect-ratio">
                      Compare video frames <ArrowUpRight size={15} aria-hidden />
                    </Link>
                  )}
                </section>
              ))}
              <section className="ratio-guide-next" aria-labelledby="next-title">
                <h2 id="next-title">Find the ratio of your image.</h2>
                <Link to="/calculator" className="ratio-guide-action">
                  Open the calculator <ArrowUpRight size={18} aria-hidden />
                </Link>
              </section>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
