import { CalculatorNavigation } from "./CalculatorNavigation";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  SOCIAL_PAGES,
  SOCIAL_UPDATED,
  type SocialRatioPage as PageContent,
} from "@/content/social-ratios";
import {
  approxNumber,
  decimalString,
  frac,
  isInteger,
  MAX_VALUE,
  parsePositive,
  roundFrac,
  simplifyRatio,
  solve,
} from "@/lib/ratio";
import { fitFillGuideLink } from "@/lib/internal-links";
import { useToolTracking } from "@/lib/tool-analytics";
import { RatioCanvas } from "./RatioCanvas";
import { ThemeControl } from "./ThemeControl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export function SocialRatioLinks({ current }: { current?: string }) {
  return (
    <nav aria-label="Social media aspect ratios" className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
      {SOCIAL_PAGES.map((page) => (
        <Link
          key={page.path}
          to={page.path}
          aria-current={current === page.path ? "page" : undefined}
          className="underline underline-offset-4 hover:text-primary"
        >
          {page.name} aspect ratio
        </Link>
      ))}
    </nav>
  );
}

// Display order only: sizes sharing the default (index 0) ratio first, by ascending
// pixel area, then other-ratio comparisons. Returns original indices so selection,
// default and Reset keep using source positions. Never mutates page.sizes.
function displayOrder(sizes: PageContent["sizes"]): number[] {
  const base = sizes[0]!;
  const group = (index: number) => {
    const s = sizes[index]!;
    return BigInt(s.width) * BigInt(base.height) === BigInt(s.height) * BigInt(base.width) ? 0 : 1;
  };
  const area = (index: number) => BigInt(sizes[index]!.width) * BigInt(sizes[index]!.height);
  return sizes
    .map((_, index) => index)
    .sort((a, b) => {
      const byGroup = group(a) - group(b);
      if (byGroup !== 0) return byGroup;
      const areaA = area(a);
      const areaB = area(b);
      if (areaA !== areaB) return areaA < areaB ? -1 : 1;
      return a - b;
    });
}

function Dimensions({ page }: { page: PageContent }) {
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState(0);
  const [knownSide, setKnownSide] = useState<"width" | "height">("width");
  const [known, setKnown] = useState(page.sizes[0]!.width);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const generation = useRef(0);
  useEffect(() => {
    const counter = generation;
    setReady(true);
    return () => {
      counter.current++;
    };
  }, []);
  const size = page.sizes[selected]!;
  const [rw, rh] = simplifyRatio(frac(BigInt(size.width)), frac(BigInt(size.height)));
  const ratio = `${rw}:${rh}`;
  const parsed = parsePositive(known);
  const computed = parsed.ok
    ? solve(frac(rw), frac(rh), parsed.value, knownSide === "width" ? "height" : "width")
    : null;
  const subpixel =
    parsed.ok && computed && (parsed.value.n < parsed.value.d || computed.n < computed.d);
  const tooLarge = computed && computed.n > BigInt(MAX_VALUE) * computed.d;
  const allowed = !!computed && !subpixel && !tooLarge;
  const rounded = computed ? roundFrac(computed).toString() : "";
  const inputText = parsed.ok ? decimalString(parsed.value) : "";
  const width = knownSide === "width" ? inputText : rounded;
  const height = knownSide === "height" ? inputText : rounded;
  const result = allowed ? `${width} × ${height}` : null;
  const tracking = useToolTracking(
    "calculator",
    "solve",
    result ? `${ratio}:${knownSide}:${known.trim()}` : null,
  );
  const clearCopy = () => {
    generation.current++;
    setCopyState("idle");
  };
  const edit = () => {
    tracking.changed();
    clearCopy();
  };

  async function copy() {
    if (!result) return;
    const id = ++generation.current;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(result);
      if (id !== generation.current) return;
      tracking.copy(result);
      setCopyState("copied");
    } catch {
      if (id === generation.current) setCopyState("failed");
    }
  }

  return (
    <section aria-labelledby="dimensions-heading" className="mt-8 rounded-2xl border p-4 sm:p-6">
      <h2 id="dimensions-heading" className="font-display text-2xl font-bold">
        Calculate {page.name} dimensions
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Choose an example canvas, then enter the width or height you know.
      </p>
      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="min-w-0 lg:order-2" inert={!ready}>
          <fieldset>
            <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Example canvases
            </legend>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {displayOrder(page.sizes).map((index) => {
                const choice = page.sizes[index]!;
                return (
                  <button
                    key={choice.label}
                    type="button"
                    aria-pressed={selected === index}
                    onClick={() => {
                      edit();
                      setSelected(index);
                      setKnown(knownSide === "width" ? choice.width : choice.height);
                    }}
                    className={`min-w-0 rounded-xl border px-2 py-3 text-left text-sm focus-visible:outline-2 focus-visible:outline-primary sm:px-3 ${selected === index ? "bg-accent text-accent-foreground" : "hover:bg-secondary"}`}
                  >
                    <span className="block font-semibold">{choice.label}</span>
                    <span className="num mt-1 block text-xs">
                      {choice.width} × {choice.height}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="min-w-0">
              <label htmlFor="social-known-side" className="mb-2 block text-sm font-medium">
                Known side
              </label>
              <Select
                value={knownSide}
                onValueChange={(value) => {
                  edit();
                  setKnownSide(value as "width" | "height");
                }}
              >
                <SelectTrigger
                  id="social-known-side"
                  className="field h-auto w-full rounded-[var(--radius-md)] border-[1.5px] bg-card px-[0.85rem] py-[0.7rem] font-mono text-[1.15rem] shadow-none"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="width">Width</SelectItem>
                  <SelectItem value="height">Height</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-0">
              <label htmlFor="social-known" className="mb-2 block text-sm font-medium">
                {knownSide === "width" ? "Width" : "Height"} (px)
              </label>
              <input
                id="social-known"
                className="field w-full"
                inputMode="decimal"
                autoComplete="off"
                value={known}
                aria-invalid={!parsed.ok}
                aria-describedby="social-input-hint social-error"
                onChange={(event) => {
                  edit();
                  setKnown(event.target.value);
                }}
              />
            </div>
          </div>
          <p id="social-input-hint" className="mt-2 text-xs text-muted-foreground">
            Positive values up to 1,000,000; at most six decimal places.
          </p>
          <p id="social-error" role="status" className="mt-2 min-h-5 text-sm text-destructive">
            {!parsed.ok
              ? parsed.error
              : subpixel
                ? "Both dimensions must be at least 1 px. Increase the known size."
                : tooLarge
                  ? "The calculated dimension exceeds 1,000,000 px. Enter a smaller size."
                  : ""}
          </p>
          <div className="mt-3 rounded-xl bg-secondary p-4" aria-live="polite" aria-atomic="true">
            <p className="text-xs font-semibold uppercase tracking-wider">
              Target ratio <span className="num">{ratio}</span>
            </p>
            <output
              id="social-result"
              className="num mt-2 block break-words text-2xl font-semibold"
            >
              {result ? `${result} px` : "Enter a valid size"}
            </output>
            {computed && allowed && (
              <p className="mt-2 text-sm">
                {isInteger(computed)
                  ? "Exact dimensions."
                  : "Calculated side rounded to the nearest pixel; the final shape differs slightly."}
              </p>
            )}
          </div>
          {computed && allowed && (
            <details className="mt-3 text-sm">
              <summary className="cursor-pointer font-medium">Exact calculation</summary>
              <p className="mt-2 break-words">
                {knownSide === "width" ? "Height" : "Width"} ={" "}
                <span className="num">
                  {computed.n.toString()}/{computed.d.toString()} = {decimalString(computed)} px
                </span>
                . Digits in parentheses repeat.
              </p>
            </details>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={!result}
              onClick={copy}
              className="rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background disabled:cursor-not-allowed disabled:opacity-50"
            >
              Copy dimensions
            </button>
            <button
              type="button"
              onClick={() => {
                tracking.cancel();
                clearCopy();
                setSelected(0);
                setKnownSide("width");
                setKnown(page.sizes[0]!.width);
              }}
              className="rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-secondary"
            >
              Reset
            </button>
            <span role="status" className="text-sm">
              {copyState === "copied"
                ? "Copied"
                : copyState === "failed"
                  ? "Copy unavailable. Select the value below."
                  : ""}
            </span>
          </div>
          {copyState === "failed" && result && (
            <label className="mt-3 block text-sm">
              Select dimensions to copy
              <input
                readOnly
                onFocus={(event) => event.target.select()}
                value={result}
                className="field mt-2 w-full"
              />
            </label>
          )}
        </div>
        <figure className="min-w-0 lg:order-1">
          <div className="h-[260px] sm:h-[320px]">
            <RatioCanvas
              ratio={allowed ? approxNumber(frac(rw, rh)) : null}
              widthLabel={allowed ? width : ""}
              heightLabel={allowed ? height : ""}
              centerLabel={ratio}
            />
          </div>
          <figcaption className="mt-2 text-xs text-muted-foreground">
            Target proportions shown at a reduced scale. Rounded pixel dimensions may differ
            slightly.
          </figcaption>
        </figure>
      </div>
      <p className="mt-5 text-sm text-muted-foreground">
        This tool calculates dimensions using square pixels. It does not upload, resize, crop or
        export media. Example sizes describe geometry, not a guarantee that an upload meets every
        platform rule.
      </p>
    </section>
  );
}

export function SocialRatioPage({ page }: { page: PageContent }) {
  return (
    <div className="min-h-screen">
      <a href="#social-content" className="sr-only focus:not-sr-only focus:block focus:p-4">
        Skip to content
      </a>
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 pt-5 sm:px-6">
        <Link
          to="/"
          aria-label="Image Aspect Ratio home"
          className="flex items-center gap-2.5 font-display text-sm font-bold"
        >
          <img src="/brand-mark.svg" width="28" height="28" alt="" />
          Image Aspect Ratio
        </Link>
        <ThemeControl />
      </header>
      <main id="social-content" className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <CalculatorNavigation />
        <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight sm:text-6xl">
          {page.name} <span className="text-primary">Aspect Ratio</span>
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground">{page.answer}</p>
        <Dimensions key={page.path} page={page} />
        <div className="mt-10 grid gap-x-12 gap-y-8 md:grid-cols-2">
          {page.sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-display text-2xl font-bold tracking-tight">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{section.text}</p>
              {section.source !== undefined && (
                <a
                  className="mt-3 inline-block text-sm underline underline-offset-4"
                  href={page.sources[section.source]!.url}
                >
                  {page.sources[section.source]!.title}
                </a>
              )}
            </section>
          ))}
        </div>
        <section aria-labelledby="social-questions" className="mt-12 max-w-3xl">
          <h2 id="social-questions" className="font-display text-2xl font-bold">
            {page.name} aspect ratio questions
          </h2>
          {page.questions.map((question) => (
            <details key={question.question} className="border-b py-4">
              <summary className="cursor-pointer text-sm font-semibold leading-6">
                {question.question}
              </summary>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{question.answer}</p>
            </details>
          ))}
        </section>
        <section aria-labelledby="social-sources" className="mt-10 max-w-3xl">
          <h2 id="social-sources" className="font-display text-xl font-bold">
            Sources and scope
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Guidance checked <time dateTime={SOCIAL_UPDATED}>November 4, 2026</time>. Platform
            requirements can change. Pixel examples and crop calculations are worked geometry;
            consult the linked platform documentation for upload rules.
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {page.sources.map((source) => (
              <li key={source.url}>
                <a className="underline underline-offset-4" href={source.url}>
                  {source.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="social-related" className="mt-10 border-t pt-6">
          <h2 id="social-related" className="mb-4 font-display text-xl font-bold">
            Plan another format
          </h2>
          <SocialRatioLinks current={page.path} />
          <nav aria-label="Related tools" className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <Link to="/video-aspect-ratio" className="underline underline-offset-4">
              Compare video Fit and Fill
            </Link>
            <Link to="/" className="underline underline-offset-4">
              Check a local photo
            </Link>
            <Link to="/calculator" className="underline underline-offset-4">
              Calculate a custom ratio
            </Link>
            <Link
              to={fitFillGuideLink.to}
              hash={fitFillGuideLink.hash}
              className="underline underline-offset-4"
            >
              {fitFillGuideLink.label}
            </Link>
          </nav>
        </section>
      </main>
    </div>
  );
}
