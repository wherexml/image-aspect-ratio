"use client";

import { Link } from "@tanstack/react-router";
import { Button } from "@ui-sdk/react/button";
import { Field, FieldLabel } from "@ui-sdk/react/field";
import {
  FileInput,
  FileInputDropzone,
  FileInputTrigger,
  createFileInputController,
  type FileRejection,
} from "@ui-sdk/react/file-input";
import { Input } from "@ui-sdk/react/input";
import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control";
import { ArrowUpRight, Check, Copy, ImagePlus, RefreshCw, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ERR_BYTES, ERR_PIXELS, ERR_READ, isCandidateType } from "@/lib/image-input";
import { fmtInt, frac, roundFrac, simplifyRatio, type Frac } from "@/lib/ratio";
import { loadSamplePhotoFile } from "@/lib/sample-photo";
import { INPUT_MAX_BYTES, INPUT_MAX_PIXELS } from "@/lib/square";
import { useToolTracking } from "@/lib/tool-analytics";
import { copyTextSafe } from "@/lib/v2-clipboard";
import { setV2PendingImage } from "@/lib/v2-image-handoff";

export type InspectorTargetRoute =
  | "/v2/change-image-aspect-ratio"
  | "/v2/make-image-square"
  | "/v2/screenshot-beautifier";

type FitMode = "contain" | "cover";

type InspectedPhoto = {
  url: string;
  name: string;
  width: number;
  height: number;
};

const COMMON_FRAMES = [
  {
    id: "1:1",
    w: 1,
    h: 1,
    name: "Square",
    refSize: "1080 × 1080 px",
    refUse: "Feed posts & avatars",
  },
  {
    id: "4:5",
    w: 4,
    h: 5,
    name: "Portrait post",
    refSize: "1080 × 1350 px",
    refUse: "Vertical feed posts",
  },
  {
    id: "9:16",
    w: 9,
    h: 16,
    name: "Story",
    refSize: "1080 × 1920 px",
    refUse: "Stories, Reels & Shorts",
  },
] as const;

function compactRatioDecimal(f: Frac): string {
  const scaled = roundFrac({ n: f.n * 100n, d: f.d });
  if (scaled === 0n && f.n > 0n) return "<0.01:1";
  const value = `${scaled / 100n}.${(scaled % 100n).toString().padStart(2, "0")}`.replace(
    /\.?0+$/,
    "",
  );
  return `${scaled * f.d === f.n * 100n ? "" : "≈"}${value}:1`;
}

function PlaceholderGlyph() {
  return (
    <svg
      viewBox="0 0 36 36"
      aria-hidden="true"
      className="v2-mp-placeholder-icon"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="6.5" width="26" height="23" rx="3.5" />
      <circle cx="13" cy="14" r="2.25" />
      <path d="m7 26 7.2-6.8a1.8 1.8 0 0 1 2.5 0L22 24.2l3.3-3.1a1.8 1.8 0 0 1 2.5 0L31 24" />
    </svg>
  );
}

export function ImageInspectorV2({
  onNavigate,
  handoffPrefix = "/v2",
}: {
  onNavigate?: (to: InspectorTargetRoute) => void;
  handoffPrefix?: "" | "/v2";
} = {}) {
  const [fileController] = useState(createFileInputController);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentUrlRef = useRef<string | null>(null);
  const lastFileRef = useRef<File | null>(null);
  const generationRef = useRef(0);

  const [photo, setPhoto] = useState<InspectedPhoto | null>(null);
  const [fit, setFit] = useState<FitMode>("contain");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const tracking = useToolTracking("image", "ratio", null);
  const trackingRef = useRef(tracking);
  trackingRef.current = tracking;

  useEffect(() => {
    return () => {
      generationRef.current++;
      if (currentUrlRef.current) URL.revokeObjectURL(currentUrlRef.current);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const loadFile = useCallback(
    async (file: File) => {
      const id = ++generationRef.current;
      setError(null);
      setCopied(false);
      if (!isCandidateType(file.type)) {
        setError(ERR_READ);
        fileController.clear();
        return;
      }
      if (file.size > INPUT_MAX_BYTES) {
        setError(ERR_BYTES);
        fileController.clear();
        return;
      }
      const nextUrl = URL.createObjectURL(file);
      setBusy(true);
      try {
        // Decoding through <img> applies EXIF orientation without executing embedded SVG scripts.
        const probe = new Image();
        probe.src = nextUrl;
        await probe.decode();
        if (id !== generationRef.current) {
          URL.revokeObjectURL(nextUrl);
          return;
        }
        const w = probe.naturalWidth;
        const h = probe.naturalHeight;
        if (!w || !h) throw new Error("decode");
        if (w * h > INPUT_MAX_PIXELS) throw new Error("pixels");
        if (currentUrlRef.current) URL.revokeObjectURL(currentUrlRef.current);
        currentUrlRef.current = nextUrl;
        lastFileRef.current = file;
        setPhoto({
          url: nextUrl,
          name: file.name || "Pasted image",
          width: w,
          height: h,
        });
        trackingRef.current.imageRead(`${w}x${h}:${file.size}`);
      } catch (e) {
        URL.revokeObjectURL(nextUrl);
        if (id === generationRef.current) {
          fileController.clear();
          setError(e instanceof Error && e.message === "pixels" ? ERR_PIXELS : ERR_READ);
        }
      } finally {
        if (id === generationRef.current) setBusy(false);
      }
    },
    [fileController],
  );

  const handleReject = useCallback((rejected: FileRejection[]) => {
    const first = rejected[0];
    if (!first) return;
    if (first.reasons.includes("file-too-large")) {
      setError(ERR_BYTES);
    } else {
      setError(ERR_READ);
    }
  }, []);

  const handleTrySample = useCallback(async () => {
    try {
      const file = await loadSamplePhotoFile("landscape");
      await loadFile(file);
    } catch {
      setError("Could not generate sample image in this browser.");
    }
  }, [loadFile]);

  const handleClear = useCallback(() => {
    generationRef.current++;
    if (currentUrlRef.current) {
      URL.revokeObjectURL(currentUrlRef.current);
      currentUrlRef.current = null;
    }
    lastFileRef.current = null;
    fileController.clear();
    setPhoto(null);
    setBusy(false);
    setError(null);
    setCopied(false);
  }, [fileController]);

  const handleHandoffClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, to: InspectorTargetRoute) => {
      if (lastFileRef.current) {
        setV2PendingImage(lastFileRef.current);
      }
      if (onNavigate) {
        e.preventDefault();
        onNavigate(to);
      }
    },
    [onNavigate],
  );

  const inspection = useMemo(() => {
    if (!photo) return null;
    const rw = frac(BigInt(photo.width));
    const rh = frac(BigInt(photo.height));
    const [a, b] = simplifyRatio(rw, rh);
    const orientation =
      photo.width === photo.height ? "Square" : photo.width > photo.height ? "Landscape" : "Portrait";
    const mp = (photo.width * photo.height) / 1_000_000;
    return {
      rw,
      rh,
      exactRatio: `${a}:${b}`,
      decimalText: compactRatioDecimal({ n: a, d: b }),
      ratioFloat: photo.width / photo.height,
      orientation,
      megapixelsText: mp >= 0.1 ? `${mp.toFixed(2)} MP` : `${(mp * 1000).toFixed(0)} KP`,
      dimensionsText: `${fmtInt(BigInt(photo.width))} × ${fmtInt(BigInt(photo.height))} px`,
    };
  }, [photo]);

  const handleCopyRatio = useCallback(async () => {
    if (!inspection) return;
    if (await copyTextSafe(inspection.exactRatio)) {
      trackingRef.current.copy(inspection.exactRatio);
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 1800);
    }
  }, [inspection]);

  return (
    <section aria-labelledby="v2-media-heading" className="mt-8 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="v2-media-heading" className="font-display text-2xl font-bold tracking-tight">
          Check image ratio
        </h2>

        <SegmentedControl
          aria-label="Frame fitting"
          value={fit}
          onValueChange={val => {
            if (val === "contain" || val === "cover") setFit(val);
          }}
          className="v2-seg"
          data-testid="v2-inspector-fit"
        >
          <SegmentedControlIndicator className="v2-seg-indicator" />
          <SegmentedControlItem
            value="contain"
            className="v2-seg-item"
            data-testid="v2-inspector-fit-contain"
          >
            Fit · keep all
          </SegmentedControlItem>
          <SegmentedControlItem
            value="cover"
            className="v2-seg-item"
            data-testid="v2-inspector-fit-cover"
          >
            Fill · crop
          </SegmentedControlItem>
        </SegmentedControl>
      </div>

      <FileInput
        controller={fileController}
        accept={["image/*", "application/octet-stream"]}
        maxSize={INPUT_MAX_BYTES}
        onValueChange={files => {
          const picked = files[0];
          if (picked) void loadFile(picked);
        }}
        onReject={handleReject}
      >
        <FileInputDropzone
          pasteTarget="document"
          className={photo ? "v2-dropzone v2-dropzone--loaded" : "v2-dropzone"}
          data-testid="v2-inspector-dropzone"
        >
          {photo && inspection ? (
            <div className="v2-file-bar">
              <div className="flex min-w-0 items-center gap-3">
                <img
                  src={photo.url}
                  alt=""
                  className="h-10 w-10 shrink-0 rounded-lg border border-border object-cover bg-muted"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{photo.name}</p>
                  <p className="num truncate text-xs text-muted-foreground">
                    {inspection.dimensionsText} · {inspection.orientation} · {inspection.megapixelsText}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <FileInputTrigger
                  className="v2-btn v2-btn--outline v2-btn--sm"
                  data-testid="v2-inspector-replace"
                >
                  <RefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
                  <span>Replace</span>
                </FileInputTrigger>
                <Button
                  onClick={handleClear}
                  className="v2-btn v2-btn--ghost v2-btn--sm"
                  data-testid="v2-inspector-clear"
                >
                  <X aria-hidden="true" className="h-3.5 w-3.5" />
                  <span>Remove</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="v2-dropzone-empty" aria-busy={busy}>
              <span className="v2-dropzone-icon" aria-hidden="true">
                <ImagePlus className="h-4 w-4" />
              </span>
              <p className="text-sm font-semibold text-foreground">
                Drop or paste an image here, or choose a file
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-0.5">
                <FileInputTrigger
                  className="v2-btn v2-btn--primary"
                  data-testid="v2-inspector-choose"
                >
                  <ImagePlus aria-hidden="true" className="h-4 w-4" />
                  <span>Choose image</span>
                </FileInputTrigger>
                <Button
                  onClick={() => void handleTrySample()}
                  className="v2-btn v2-btn--outline"
                  data-testid="v2-inspector-sample"
                >
                  <span>Try sample</span>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, WebP, GIF or AVIF · stays in your browser
              </p>
              {busy && (
                <p role="status" className="text-xs font-medium text-muted-foreground">
                  Reading image…
                </p>
              )}
              {error && (
                <p role="alert" className="text-xs font-medium text-destructive">
                  {error}
                </p>
              )}
            </div>
          )}
        </FileInputDropzone>
      </FileInput>

      {photo && error && (
        <p role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}

      <div
        className="grid grid-cols-2 items-end gap-3.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(17rem,1.15fr)]"
        role="group"
        aria-label="Source dimensions"
      >
        <Field className="v2-field">
          <FieldLabel className="v2-field-label">Width (px)</FieldLabel>
          <div className="v2-readout-group">
            <Input
              readOnly
              value={photo ? String(photo.width) : ""}
              placeholder="—"
              className="v2-readout-input num"
              data-testid="v2-readout-width"
            />
            <span className="v2-readout-unit num" aria-hidden="true">
              px
            </span>
          </div>
        </Field>

        <Field className="v2-field">
          <FieldLabel className="v2-field-label">Height (px)</FieldLabel>
          <div className="v2-readout-group">
            <Input
              readOnly
              value={photo ? String(photo.height) : ""}
              placeholder="—"
              className="v2-readout-input num"
              data-testid="v2-readout-height"
            />
            <span className="v2-readout-unit num" aria-hidden="true">
              px
            </span>
          </div>
        </Field>

        <div className="col-span-2 flex items-end gap-2.5 sm:col-span-1">
          <Field className="v2-field min-w-0 flex-1">
            <FieldLabel className="v2-field-label">Exact ratio</FieldLabel>
            <div className="v2-readout-group v2-readout-group--ratio">
              <Input
                readOnly
                value={inspection ? inspection.exactRatio : ""}
                placeholder="—"
                className="v2-readout-input v2-readout-input--ratio num"
                data-testid="v2-inspector-ratio"
              />
              {inspection && (
                <span className="v2-readout-unit num" aria-hidden="true">
                  {inspection.decimalText}
                </span>
              )}
            </div>
          </Field>

          <Button
            disabled={!inspection || busy}
            focusableWhenDisabled
            onClick={() => void handleCopyRatio()}
            className="v2-btn v2-btn--primary h-[42px] shrink-0 px-3.5"
            data-testid="v2-inspector-copy"
          >
            {copied ? (
              <Check aria-hidden="true" className="h-4 w-4" />
            ) : (
              <Copy aria-hidden="true" className="h-4 w-4" />
            )}
            <span>{copied ? "Copied" : "Copy ratio"}</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {COMMON_FRAMES.map(({ id, w, h, name, refSize, refUse }) => {
          const target = w / h;
          const base = 204;
          const ratio = inspection?.ratioFloat ?? null;
          const exact = Boolean(
            inspection &&
              inspection.rw.n * inspection.rh.d * BigInt(h) ===
                inspection.rh.n * inspection.rw.d * BigInt(w),
          );
          const isWide = ratio !== null && ratio > target;
          const cw = !ratio || (fit === "contain" ? isWide : !isWide) ? 100 : (ratio / target) * 100;
          const ch = !ratio || (fit === "contain" ? !isWide : isWide) ? 100 : (target / ratio) * 100;
          const empty = Boolean(ratio && !exact && fit === "contain");
          const emptyPercent = (100 - (isWide ? ch : cw)) / 2;
          const visible = ratio ? Math.min(ratio / target, target / ratio) * 100 : 0;

          const summary = !ratio
            ? refSize
            : exact
              ? "Exact fit · no empty space or crop"
              : fit === "contain"
                ? `Whole image visible · ${isWide ? "space above & below" : "space on both sides"}`
                : `Fills frame · ${isWide ? "left & right" : "top & bottom"} cropped`;

          const detail = !ratio
            ? refUse
            : exact
              ? "Source and frame have the same ratio."
              : fit === "contain"
                ? `No cropping · ${Math.min(99.9, visible).toFixed(1)}% of frame covered`
                : `${Math.min(99.9, visible).toFixed(1)}% of source area visible`;

          return (
            <article
              key={id}
              className="v2-mp-card"
              aria-label={`${name} ${id}`}
              data-testid={`v2-inspector-card-${id}`}
            >
              <header className="v2-mp-head">
                <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-foreground">
                  {name}
                </h3>
                <span className="v2-mp-chip num">{id}</span>
              </header>

              <div className="v2-mp-stage">
                <div
                  className="v2-mp-frame"
                  style={{
                    width: Math.min(base, base * target),
                    aspectRatio: `${w}/${h}`,
                    maxWidth: "100%",
                  }}
                >
                  <div
                    className="v2-mp-screen"
                    role="group"
                    aria-label={!ratio ? `${id} frame` : `${id} frame: ${summary}`}
                  >
                    {empty &&
                      [0, 1].map(side => (
                        <div
                          key={side}
                          className="v2-mp-empty"
                          aria-hidden="true"
                          style={
                            isWide
                              ? {
                                  left: 0,
                                  right: 0,
                                  height: `${emptyPercent}%`,
                                  ...(side ? { bottom: 0 } : { top: 0 }),
                                }
                              : {
                                  top: 0,
                                  bottom: 0,
                                  width: `${emptyPercent}%`,
                                  ...(side ? { right: 0 } : { left: 0 }),
                                }
                          }
                        >
                          {emptyPercent > 15 && <span>Empty space</span>}
                        </div>
                      ))}

                    {!photo && (
                      <div
                        aria-hidden="true"
                        className="v2-mp-placeholder"
                        style={{
                          width: `${(fit === "contain" ? target <= 1 : target >= 1) ? 100 : 100 / target}%`,
                          height: `${(fit === "contain" ? target >= 1 : target <= 1) ? 100 : target * 100}%`,
                        }}
                        data-testid="v2-image-placeholder"
                      >
                        <PlaceholderGlyph />
                      </div>
                    )}

                    {photo && (
                      <img
                        src={photo.url}
                        alt={`${name} preview of ${photo.name}`}
                        className="absolute inset-0 h-full w-full"
                        style={{ objectFit: fit }}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="v2-mp-foot">
                <p className={!ratio ? "num text-xs font-semibold text-foreground" : "text-xs font-semibold text-foreground"}>
                  {summary}
                </p>
                <p className="text-xs text-muted-foreground">{detail}</p>
              </div>
            </article>
          );
        })}
      </div>

      {photo && (
        <div className="v2-handoff-strip">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>
              <strong className="font-semibold text-foreground">
                {((photo.width * photo.height) / 1_000_000).toFixed(2)} MP
              </strong>{" "}
              · Max crisp 300 DPI print:{" "}
              <span className="num font-medium text-foreground">
                {(photo.width / 300).toFixed(1)} × {(photo.height / 300).toFixed(1)} in
              </span>{" "}
              ({((photo.width / 300) * 2.54).toFixed(1)} × {((photo.height / 300) * 2.54).toFixed(1)} cm)
            </span>
            <span>Export in a new frame:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`${handoffPrefix}/change-image-aspect-ratio`}
              onClick={e => handleHandoffClick(e, "/v2/change-image-aspect-ratio")}
              className="v2-handoff-chip"
              data-testid="v2-inspector-goto-ratio"
            >
              <span>Change aspect ratio</span>
              <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
            </a>
            <a
              href={`${handoffPrefix}/make-image-square`}
              onClick={e => handleHandoffClick(e, "/v2/make-image-square")}
              className="v2-handoff-chip"
              data-testid="v2-inspector-goto-square"
            >
              <span>Make 1:1 square</span>
              <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
            </a>
            <a
              href={`${handoffPrefix}/screenshot-beautifier`}
              onClick={e => handleHandoffClick(e, "/v2/screenshot-beautifier")}
              className="v2-handoff-chip"
            >
              <span>Screenshot Beautifier</span>
              <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      )}
    </section>
  );
}

const HOW_STEPS = [
  [
    "Choose a photo",
    "Select an image to read its original pixel width and height locally in your browser.",
  ],
  ["Check its ratio", "Read Width (px), Height (px) and Exact ratio above."],
  [
    "Compare or copy",
    "Preview Fit or Fill in common frames, then use Copy ratio to copy the exact ratio.",
  ],
] as const;

const IMAGE_EXAMPLES = [
  ["Photo 6000 × 4000", "3:2"],
  ["Portrait 3000 × 4000", "3:4"],
  ["Square 1080 × 1080", "1:1"],
  ["Portrait post 1080 × 1350", "4:5"],
] as const;

export function V2ImageReferenceSections({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <section className="mt-14 grid gap-10 md:grid-cols-2" aria-labelledby="v2-how">
        <div>
          <h2 id="v2-how" className="font-display text-2xl font-bold tracking-tight">
            How to find an image aspect ratio
          </h2>
          <ol className="mt-4 space-y-3 text-sm">
            {HOW_STEPS.map(([title, desc], i) => (
              <li key={title} className="flex gap-3">
                <span className="num flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                  {i + 1}
                </span>
                <span>
                  <strong className="font-semibold">{title}.</strong>{" "}
                  <span className="text-muted-foreground">{desc}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs text-muted-foreground">
            This calculator returns dimensions and aspect ratios; it does not resize or crop files.
          </p>
        </div>

        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Image aspect ratio examples
          </h2>
          <ul className="mt-4 divide-y text-sm">
            {IMAGE_EXAMPLES.map(([label, ratio]) => (
              <li key={label} className="flex items-baseline justify-between gap-4 py-2.5">
                <span className="text-muted-foreground">{label}</span>
                <span className="num text-right font-medium">{ratio}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-10 space-y-4" aria-labelledby="v2-fit-fill-examples">
        <h2 id="v2-fit-fill-examples" className="font-display text-2xl font-bold">
          Fit vs Fill: a photo in a square frame
        </h2>
        <p className="text-sm text-muted-foreground">
          A 6000 × 4000 photo has a 3:2 aspect ratio. Compare it in the 1:1 square preview above.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-xl border bg-card p-4">
            <h3 className="font-semibold">Fit · keep the whole photo</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              The 3:2 photo fits across the square with empty space above and below. Nothing is
              cropped. At 1080 pixels wide, the photo occupies 1080 × 720 pixels within the square.
            </p>
          </article>
          <article className="rounded-xl border bg-card p-4">
            <h3 className="font-semibold">Fill · crop to the frame</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              The square fills completely. A centered crop keeps the middle 4000 × 4000 pixels of
              the 6000 × 4000 photo, trimming 1000 pixels from each side. About 66.7% of the
              original area remains visible.
            </p>
          </article>
        </div>
      </section>

      {children}

      <nav aria-label="Related calculators" className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <Link to="/what-is-aspect-ratio" className="font-medium underline-offset-4 hover:underline">
          What is aspect ratio? — a visual guide
        </Link>
        <Link to="/v2/make-image-square" className="font-medium underline-offset-4 hover:underline">
          Make image square
        </Link>
        <Link
          to="/v2/change-image-aspect-ratio"
          className="font-medium underline-offset-4 hover:underline"
        >
          Change image aspect ratio
        </Link>
        <Link
          to="/v2/screenshot-beautifier"
          className="font-medium underline-offset-4 hover:underline"
        >
          Screenshot Studio
        </Link>
        <Link to="/v2/calculator" className="font-medium underline-offset-4 hover:underline">
          Aspect ratio calculator — find the ratio of any other resolution
        </Link>
        <Link
          to="/v2/video-aspect-ratio"
          className="font-medium underline-offset-4 hover:underline"
        >
          Video aspect ratio calculator — compare screen fit
        </Link>
      </nav>
    </>
  );
}
