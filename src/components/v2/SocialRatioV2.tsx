"use client";

import { Button } from "@ui-sdk/react/button";
import { Field, FieldLabel } from "@ui-sdk/react/field";
import { Input } from "@ui-sdk/react/input";
import { Radio, RadioGroup } from "@ui-sdk/react/radio";
import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, ChevronDown, Copy, Instagram, Music2, RotateCcw, Youtube } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IMAGE_PLACEMENTS, PLACEMENT_DETAILS, PLACEMENTS_CHECKED } from "@/content/image-placements";
import { SOCIAL_PAGES, SOCIAL_UPDATED, type SocialRatioPage } from "@/content/social-ratios";
import {
  approxNumber,
  decimalString,
  fmtInt,
  frac,
  isInteger,
  MAX_VALUE,
  parsePositive,
  roundFrac,
  simplifyRatio,
  solve,
} from "@/lib/ratio";
import { useToolTracking } from "@/lib/tool-analytics";
import { copyTextSafe } from "@/lib/v2-clipboard";

const CHECKED_LABEL = new Date(`${PLACEMENTS_CHECKED}T00:00:00Z`).toLocaleDateString("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

function displayOrder(sizes: SocialRatioPage["sizes"]): number[] {
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

export function getSocialPageByPath(path: SocialRatioPage["path"]): SocialRatioPage {
  const found = SOCIAL_PAGES.find(p => p.path === path);
  if (!found) throw new Error(`Unknown social page: ${path}`);
  return found;
}

export function SocialPlatformStudioV2({ path }: { path: SocialRatioPage["path"] }) {
  const page = useMemo(() => getSocialPageByPath(path), [path]);

  const [presetIndex, setPresetIndex] = useState("0");
  const [knownSide, setKnownSide] = useState<"width" | "height">("width");
  const [knownValue, setKnownValue] = useState(page.sizes[0]?.width ?? "1080");
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const [workspaceWidth, setWorkspaceWidth] = useState(560);

  useEffect(() => {
    setPresetIndex("0");
    setKnownSide("width");
    setKnownValue(page.sizes[0]?.width ?? "1080");
    setCopied(false);
  }, [page]);

  useEffect(() => {
    const el = workspaceRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width;
      if (w && w > 0) setWorkspaceWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(
    () => () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    },
    [],
  );

  const selectedPreset = page.sizes[Number(presetIndex)] ?? page.sizes[0]!;
  const platformKey = page.path.replace(/^\//, "");
  const tracking = useToolTracking(
    "social",
    "solve",
    `${platformKey}:${presetIndex}:${knownSide}:${knownValue}`,
  );

  const handleSelectCanvas = useCallback(
    (val: string | null) => {
      if (!val) return;
      const next = page.sizes[Number(val)];
      if (!next) return;
      tracking.preset(`${platformKey}:${val}`);
      tracking.changed();
      setCopied(false);
      setPresetIndex(val);
      setKnownValue(knownSide === "width" ? next.width : next.height);
    },
    [page.sizes, knownSide, platformKey, tracking],
  );

  const handleReset = useCallback(() => {
    const first = page.sizes[0]!;
    tracking.cancel();
    setCopied(false);
    setPresetIndex("0");
    setKnownSide("width");
    setKnownValue(first.width);
  }, [page.sizes, tracking]);

  const solved = useMemo(() => {
    const pw = parsePositive(selectedPreset.width);
    const ph = parsePositive(selectedPreset.height);
    const pv = parsePositive(knownValue);
    if (!pw.ok || !ph.ok) {
      return { ok: false as const, error: "Invalid preset dimensions." };
    }
    const [rw, rh] = simplifyRatio(pw.value, ph.value);
    const ar = approxNumber(pw.value) / Math.max(1e-9, approxNumber(ph.value));
    if (!pv.ok) {
      return {
        ok: false as const,
        error: pv.error,
        ratioLabel: `${rw}:${rh}`,
        ar,
      };
    }
    const targetSide = knownSide === "width" ? "height" : "width";
    const other = solve(pw.value, ph.value, pv.value, targetSide);
    const subpixel = pv.value.n < pv.value.d || other.n < other.d;
    const tooLarge = other.n > BigInt(MAX_VALUE) * other.d;
    if (subpixel || tooLarge) {
      return {
        ok: false as const,
        error: subpixel
          ? "Both dimensions must be at least 1 px. Increase the known size."
          : "The calculated dimension exceeds 1,000,000 px. Enter a smaller size.",
        ratioLabel: `${rw}:${rh}`,
        ar,
      };
    }
    const rKnown = roundFrac(pv.value);
    const rOther = roundFrac(other);
    const outW = knownSide === "width" ? rKnown : rOther;
    const outH = knownSide === "width" ? rOther : rKnown;
    return {
      ok: true as const,
      ratioLabel: `${rw}:${rh}`,
      ar,
      other,
      targetSide,
      width: outW,
      height: outH,
      exact: isInteger(pv.value) && isInteger(other),
      copyText: `${outW} × ${outH}`,
      formatted: `${fmtInt(outW)} × ${fmtInt(outH)} px`,
    };
  }, [selectedPreset, knownSide, knownValue]);

  const stageBox = useMemo(() => {
    const ar = "ar" in solved && solved.ar ? solved.ar : 9 / 16;
    const maxW = Math.min(360, Math.max(150, workspaceWidth - 96));
    const maxH = 250;
    const width = ar >= maxW / maxH ? maxW : Math.round(maxH * ar);
    const height = Math.max(64, Math.round(width / ar));
    return { width, height };
  }, [solved, workspaceWidth]);

  const handleCopy = useCallback(async () => {
    if (!solved.ok) return;
    if (await copyTextSafe(solved.copyText)) {
      tracking.copy(solved.copyText);
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 1800);
    }
  }, [solved, tracking]);

  return (
    <div className="mt-8 space-y-12">
      <section aria-labelledby="v2-social-calc-heading" className="space-y-4">
        <div>
          <h2 id="v2-social-calc-heading" className="font-display text-2xl font-bold">
            Calculate {page.name} dimensions
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose an example canvas on the right, then enter the width or height you know.
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_25rem]">
          <figure className="order-2 min-w-0 lg:order-1">
            <div ref={workspaceRef} className="v2-stage-card min-h-[19rem] sm:min-h-[23rem]">
              <div className="relative flex items-center justify-center">
                {solved.ok && (
                  <>
                    <span className="num absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-semibold text-muted-foreground">
                      {fmtInt(solved.width)} px
                    </span>
                    <span className="num absolute top-1/2 -left-3 -translate-x-full -translate-y-1/2 whitespace-nowrap text-xs font-semibold text-muted-foreground">
                      {fmtInt(solved.height)} px
                    </span>
                  </>
                )}
                <div
                  className="v2-calc-box"
                  style={{ width: `${stageBox.width}px`, height: `${stageBox.height}px` }}
                >
                  <span className="v2-calc-box-grid" />
                  <div className="relative z-10 px-3 text-center">
                    <p className="font-display text-2xl font-bold text-foreground">
                      {"ratioLabel" in solved ? solved.ratioLabel : ""}
                    </p>
                    <p className="num mt-0.5 text-xs font-medium text-muted-foreground">
                      {solved.ok ? solved.formatted : "Enter valid size"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <figcaption className="mt-2.5 text-xs text-muted-foreground">
              Target proportions shown at scale. This tool calculates geometry using square pixels;
              it does not upload or transcode media.
            </figcaption>
          </figure>

          <div className="v2-panel order-1 space-y-4 lg:order-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground" id="v2-social-canvases-lbl">
                  Example canvases
                </span>
                <Button
                  aria-label="Reset"
                  onClick={handleReset}
                  className="v2-icon-btn !h-7 !w-7"
                >
                  <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
                </Button>
              </div>

              <RadioGroup
                aria-labelledby="v2-social-canvases-lbl"
                value={presetIndex}
                onValueChange={handleSelectCanvas}
                className="grid grid-cols-3 gap-1.5"
              >
                {displayOrder(page.sizes).map(idx => {
                  const choice = page.sizes[idx]!;
                  return (
                    <Radio
                      key={choice.label}
                      value={String(idx)}
                      className="v2-preset-card v2-preset-card--left"
                      data-testid={`v2-social-pill-${idx}`}
                    >
                      <span className="text-xs font-semibold text-foreground">{choice.label}</span>
                      <span className="num text-[11px] text-muted-foreground">
                        {choice.width} × {choice.height}
                      </span>
                    </Radio>
                  );
                })}
              </RadioGroup>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Known side</span>
                <SegmentedControl
                  aria-label="Known dimension side"
                  value={knownSide}
                  onValueChange={val => {
                    if (val === "width" || val === "height") {
                      tracking.changed();
                      setCopied(false);
                      setKnownSide(val);
                      setKnownValue(
                        val === "width" ? selectedPreset.width : selectedPreset.height,
                      );
                    }
                  }}
                  className="v2-seg v2-seg--sm"
                  data-testid="v2-social-known-control"
                >
                  <SegmentedControlIndicator className="v2-seg-indicator" />
                  <SegmentedControlItem
                    value="width"
                    className="v2-seg-item"
                    data-testid="v2-social-known-width"
                  >
                    Width
                  </SegmentedControlItem>
                  <SegmentedControlItem
                    value="height"
                    className="v2-seg-item"
                    data-testid="v2-social-known-height"
                  >
                    Height
                  </SegmentedControlItem>
                </SegmentedControl>
              </div>

              <Field className="v2-field" invalid={!solved.ok}>
                <FieldLabel className="v2-field-label">
                  {knownSide === "width" ? "Width (px)" : "Height (px)"}
                </FieldLabel>
                <div className="v2-input-box">
                  <Input
                    inputMode="decimal"
                    autoComplete="off"
                    value={knownValue}
                    aria-invalid={!solved.ok}
                    onValueChange={val => {
                      tracking.changed();
                      setCopied(false);
                      setKnownValue(val);
                    }}
                    className="v2-input num"
                    data-testid="v2-social-px-input"
                  />
                  <span className="v2-readout-unit num" aria-hidden="true">
                    px
                  </span>
                </div>
              </Field>

              {!solved.ok && (
                <p role="alert" className="text-xs font-medium text-destructive">
                  {solved.error}
                </p>
              )}
            </div>

            <div
              className="v2-result-box space-y-2"
              aria-live="polite"
              data-testid="v2-social-result"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Target ratio{" "}
                    <span className="num text-foreground">
                      {"ratioLabel" in solved ? solved.ratioLabel : ""}
                    </span>
                  </p>
                  <p className="num mt-1 break-words text-2xl font-bold leading-tight text-foreground">
                    {solved.ok ? solved.formatted : "—"}
                  </p>
                </div>

                <Button
                  disabled={!solved.ok}
                  focusableWhenDisabled
                  onClick={() => void handleCopy()}
                  className="v2-btn v2-btn--primary v2-btn--sm shrink-0"
                  data-testid="v2-social-copy"
                >
                  {copied ? (
                    <Check aria-hidden="true" className="h-3.5 w-3.5" />
                  ) : (
                    <Copy aria-hidden="true" className="h-3.5 w-3.5" />
                  )}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </Button>
              </div>

              {solved.ok && (
                <>
                  <p className="text-xs text-muted-foreground">
                    {solved.exact
                      ? "Exact whole-pixel dimensions."
                      : "Calculated side rounded to the nearest pixel."}
                  </p>
                  <details className="group border-t border-border pt-2 text-xs">
                    <summary className="inline-flex cursor-pointer list-none items-center gap-1 font-medium text-muted-foreground hover:text-foreground">
                      <ChevronDown
                        aria-hidden="true"
                        className="h-3.5 w-3.5 transition-transform group-open:rotate-180"
                      />
                      <span>Exact calculation</span>
                    </summary>
                    <p className="num mt-1.5 break-words text-muted-foreground">
                      {solved.targetSide === "height" ? "Height" : "Width"} ={" "}
                      {solved.other.n.toString()}/{solved.other.d.toString()} ={" "}
                      {decimalString(solved.other)} px
                    </p>
                  </details>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
        {page.sections.map(sec => {
          const cited = sec.source !== undefined ? page.sources[sec.source] : undefined;
          return (
            <section key={sec.title} className="space-y-2.5">
              <h2 className="font-display text-2xl font-bold tracking-tight">{sec.title}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{sec.text}</p>
              {cited && (
                <a
                  href={cited.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm font-medium underline underline-offset-4 hover:text-primary"
                >
                  {cited.title}
                </a>
              )}
            </section>
          );
        })}
      </div>

      {page.questions.length > 0 && (
        <section aria-label={`${page.name} questions`} className="max-w-3xl">
          <h2 className="font-display text-2xl font-bold tracking-tight">
            {page.name} aspect ratio questions
          </h2>
          <div className="mt-3">
            {page.questions.map(q => (
              <details key={q.question} className="border-b py-4">
                <summary className="cursor-pointer text-sm font-semibold leading-6">
                  {q.question}
                </summary>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{q.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      <section aria-label="Sources and scope" className="max-w-3xl space-y-2.5 border-t pt-6 text-sm">
        <h2 className="font-display text-xl font-bold">Sources and scope</h2>
        <p className="text-muted-foreground">
          Guidance checked <time dateTime={SOCIAL_UPDATED}>November 4, 2026</time>. Platform
          requirements can change; consult the linked documentation for current upload rules.
        </p>
        <ul className="space-y-1.5">
          {page.sources.map(source => (
            <li key={source.url}>
              <a
                className="underline underline-offset-4 hover:text-primary"
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {source.title}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function SocialPlatformRelatedNav({
  currentPath,
  rootLinks = false,
}: {
  currentPath: SocialRatioPage["path"];
  rootLinks?: boolean;
}) {
  return (
    <nav aria-label="Plan another format" className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t pt-6 text-sm">
      {SOCIAL_PAGES.map(item => (
        <Link
          key={item.path}
          to={(rootLinks ? item.path : `/v2${item.path}`) as "/tiktok-aspect-ratio"}
          aria-current={item.path === currentPath ? "page" : undefined}
          className="font-medium underline-offset-4 hover:underline aria-[current=page]:text-primary"
        >
          {item.name} aspect ratio
        </Link>
      ))}
      {rootLinks && (
        <>
          <Link to="/safe-zone-checker" className="font-medium underline-offset-4 hover:underline">
            9:16 safe zone checker
          </Link>
          <Link to="/instagram-grid-splitter" className="font-medium underline-offset-4 hover:underline">
            Instagram 3:4 grid &amp; carousel
          </Link>
          <Link to="/fit-photo-to-instagram" className="font-medium underline-offset-4 hover:underline">
            Fit photo to Instagram
          </Link>
          <Link to="/og-image-safe-zone" className="font-medium underline-offset-4 hover:underline">
            OG 1200×630 safe zone
          </Link>
        </>
      )}
      <Link
        to={rootLinks ? "/social-media" : "/v2/social-media"}
        className="font-medium underline-offset-4 hover:underline"
      >
        All social platforms
      </Link>
    </nav>
  );
}

const HUB_GROUPS = [
  {
    name: "Instagram",
    icon: Instagram,
    links: [
      { to: "/v2/instagram-reel-aspect-ratio", rootTo: "/instagram-reel-aspect-ratio", label: "Reels", ratio: "9:16", example: "1080 × 1920 px" },
      { to: "/v2/instagram-story-aspect-ratio", rootTo: "/instagram-story-aspect-ratio", label: "Stories", ratio: "9:16", example: "1080 × 1920 px" },
    ],
    rootExtra: [
      { rootTo: "/instagram-grid-splitter", label: "Grid & Carousel", ratio: "3:4", example: "1080 × 1440 / 1350 px" },
      { rootTo: "/fit-photo-to-instagram", label: "Fit Photo", ratio: "4:5", example: "1080 × 1350 no-crop" },
    ],
  },
  {
    name: "YouTube",
    icon: Youtube,
    links: [
      { to: "/v2/youtube-aspect-ratio", rootTo: "/youtube-aspect-ratio", label: "Video", ratio: "16:9", example: "1920 × 1080 px" },
      { to: "/v2/youtube-shorts-aspect-ratio", rootTo: "/youtube-shorts-aspect-ratio", label: "Shorts", ratio: "9:16", example: "1080 × 1920 px" },
    ],
    rootExtra: [],
  },
  {
    name: "TikTok & Cards",
    icon: Music2,
    links: [
      { to: "/v2/tiktok-aspect-ratio", rootTo: "/tiktok-aspect-ratio", label: "TikTok Video", ratio: "9:16", example: "1080 × 1920 px" },
    ],
    rootExtra: [
      { rootTo: "/safe-zone-checker", label: "Safe Zones", ratio: "9:16", example: "TikTok / Reels / Shorts" },
      { rootTo: "/og-image-safe-zone", label: "OG Safe Zone", ratio: "1.91:1", example: "1200 × 630 link cards" },
    ],
  },
] as const;

export function SocialMediaHubV2({ rootLinks = false }: { rootLinks?: boolean } = {}) {
  return (
    <div className="mt-8 space-y-14">
      <section aria-label="Platform calculators" className="grid gap-5 sm:grid-cols-3">
        {HUB_GROUPS.map(({ name, icon: Icon, links, rootExtra }) => {
          const items = rootLinks
            ? [
                ...rootExtra.map(x => ({ to: x.rootTo, label: x.label, ratio: x.ratio, example: x.example })),
                ...links.map(x => ({ to: x.rootTo, label: x.label, ratio: x.ratio, example: x.example })),
              ]
            : links.map(x => ({ to: x.to, label: x.label, ratio: x.ratio, example: x.example }));
          return (
          <div key={name} className="v2-panel space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-secondary/60 text-foreground">
                <Icon aria-hidden="true" className="h-4 w-4" />
              </span>
              <h2 className="font-display text-lg font-bold">{rootLinks ? name : name.replace(" & Cards", "")}</h2>
            </div>

            <div className="grid gap-2">
              {items.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="group flex items-center justify-between rounded-xl border border-border bg-secondary/25 px-3.5 py-2.5 text-sm transition-colors hover:border-foreground/35 hover:bg-secondary/65"
                >
                  <div>
                    <p className="font-semibold text-foreground">{link.label}</p>
                    <p className="num text-xs text-muted-foreground">{link.example}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="v2-mp-chip num">{link.ratio}</span>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
                    />
                  </span>
                </Link>
              ))}
            </div>
          </div>
          );
        })}
      </section>

      <section aria-labelledby="v2-image-sizes">
        <h2 id="v2-image-sizes" className="mb-4 font-display text-2xl font-bold">
          Image sizes
        </h2>
        <table className="w-full table-fixed text-left text-sm" aria-labelledby="v2-image-sizes">
          <thead>
            <tr className="border-b text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              <th scope="col" className="w-[38%] py-3 pr-3">
                Placement
              </th>
              <th scope="col" className="w-[37%] py-3 pr-3">
                Dimensions
              </th>
              <th scope="col" className="py-3">
                Ratio
              </th>
            </tr>
          </thead>
          <tbody>
            {IMAGE_PLACEMENTS.map(p => (
              <tr key={p.id} data-testid={`placement-${p.id}`} className="border-b align-top">
                <th scope="row" className="break-words py-3 pr-3 font-medium">
                  {p.placement}
                </th>
                <td className="num break-words py-3 pr-3">{p.dimensions}</td>
                <td className="num break-words py-3">{p.ratio}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <details className="group mt-5 text-sm">
          <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 font-semibold">
            <span>Specifications and sources</span>
            <ChevronDown
              aria-hidden="true"
              className="h-4 w-4 transition-transform group-open:rotate-180"
            />
          </summary>
          <div className="mt-3 max-w-3xl space-y-5 text-muted-foreground">
            <p>
              Checked <time dateTime={PLACEMENTS_CHECKED}>{CHECKED_LABEL}</time>. These image
              placements are separate from the video-frame calculators above.
            </p>
            {PLACEMENT_DETAILS.map(d => (
              <section key={d.title}>
                <h3 className="mb-1 font-semibold text-foreground">{d.title}</h3>
                <p>{d.text}</p>
                <p className="mt-1">
                  Source:{" "}
                  <a
                    href={d.source}
                    rel="noopener noreferrer"
                    target="_blank"
                    className="break-all underline underline-offset-4 hover:text-foreground"
                  >
                    {d.source}
                  </a>
                </p>
              </section>
            ))}
          </div>
        </details>
      </section>
    </div>
  );
}
