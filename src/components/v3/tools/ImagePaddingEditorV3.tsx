"use client";

import { Button } from "@ui-sdk/react/button";
import { Field, FieldLabel } from "@ui-sdk/react/field";
import { Input } from "@ui-sdk/react/input";
import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control";
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
} from "@ui-sdk/react/slider";
import { Check, Copy, Download } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useToolTracking } from "@/lib/tool-analytics";
import { copyPngBlobSafe, useImageCopySupported } from "@/lib/v2-clipboard";
import { V3StageEmptyDropzone, V3ToolFileBar } from "./V3ToolFileBar";
import {
  createSyntheticSampleFile,
  triggerBlobDownload,
  useLocalToolImage,
} from "./useLocalToolImage";

type PaddingStyleId = "uniform" | "polaroid" | "custom";
type CanvasTargetId = "expand" | "4:5" | "3:4" | "1:1" | "16:9";
type FillKind = "white" | "cream" | "black" | "transparent" | "custom";

const FILL_SWATCHES: readonly { id: FillKind; label: string; hex: string }[] = [
  { id: "white", label: "White", hex: "#FFFFFF" },
  { id: "cream", label: "Gallery Cream", hex: "#FAF8F5" },
  { id: "black", label: "Black", hex: "#09090B" },
  { id: "transparent", label: "Transparent", hex: "transparent" },
  { id: "custom", label: "Custom", hex: "#DBEAFE" },
];

export function ImagePaddingEditorV3() {
  const sampleLoadingRef = useRef(false);
  const autoDemoLoadingRef = useRef(false);
  const [isDemoSample, setIsDemoSample] = useState<boolean>(false);
  const tracking = useToolTracking("add_padding", "frame", null);
  const trackingRef = useRef(tracking);
  trackingRef.current = tracking;
  const { loaded, reading, inputError, readFile, clearImage } = useLocalToolImage(img => {
    const isAutoDemo = autoDemoLoadingRef.current;
    autoDemoLoadingRef.current = false;
    setIsDemoSample(sampleLoadingRef.current);
    sampleLoadingRef.current = false;
    if (!isAutoDemo) {
      trackingRef.current.imageRead(`${img.width}x${img.height}`);
    }
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const autoDemoRef = useRef(false);
  const imageCopySupported = useImageCopySupported();

  const loadSample = (fromAutoDemo = false) => {
    void createSyntheticSampleFile("photo-4x3").then(f => {
      sampleLoadingRef.current = true;
      autoDemoLoadingRef.current = fromAutoDemo;
      void readFile(f);
    });
  };

  useEffect(() => {
    if (autoDemoRef.current) return;
    autoDemoRef.current = true;
    if (typeof navigator !== "undefined" && /jsdom/i.test(navigator.userAgent)) return;
    loadSample(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [padStyle, setPadStyle] = useState<PaddingStyleId>("uniform");
  const [uniformPx, setUniformPx] = useState<number>(80);
  const [padTop, setPadTop] = useState<number>(60);
  const [padRight, setPadRight] = useState<number>(60);
  const [padBottom, setPadBottom] = useState<number>(180);
  const [padLeft, setPadLeft] = useState<number>(60);

  const [canvasTarget, setCanvasTarget] = useState<CanvasTargetId>("expand");
  const [fillKind, setFillKind] = useState<FillKind>("white");
  const [customHex, setCustomHex] = useState<string>("#DBEAFE");
  const [photoRadius, setPhotoRadius] = useState<number>(0);
  const [photoShadow, setPhotoShadow] = useState<number>(0);
  const [format, setFormat] = useState<"png" | "jpeg">("png");
  const [copied, setCopied] = useState<boolean>(false);

  const activeMargins = useMemo(() => {
    if (padStyle === "uniform") {
      return { top: uniformPx, right: uniformPx, bottom: uniformPx, left: uniformPx };
    }
    if (padStyle === "polaroid") {
      const side = Math.max(24, uniformPx);
      return { top: side, right: side, bottom: Math.round(side * 2.8), left: side };
    }
    return { top: padTop, right: padRight, bottom: padBottom, left: padLeft };
  }, [padStyle, uniformPx, padTop, padRight, padBottom, padLeft]);

  const scene = useMemo(() => {
    const srcW = loaded?.width ?? 1200;
    const srcH = loaded?.height ?? 900;
    const { top, right, bottom, left } = activeMargins;

    if (canvasTarget === "expand") {
      const rawW = srcW + left + right;
      const rawH = srcH + top + bottom;
      const cap = Math.min(1, 4096 / Math.max(rawW, rawH));
      return {
        outW: Math.max(1, Math.round(rawW * cap)),
        outH: Math.max(1, Math.round(rawH * cap)),
        imgX: left * cap,
        imgY: top * cap,
        imgW: srcW * cap,
        imgH: srcH * cap,
        scale: cap,
      };
    }

    const ratioMap: Record<Exclude<CanvasTargetId, "expand">, [number, number]> = {
      "4:5": [1080, 1350],
      "3:4": [1080, 1440],
      "1:1": [1080, 1080],
      "16:9": [1920, 1080],
    };
    const [outW, outH] = ratioMap[canvasTarget];
    const availW = Math.max(40, outW - left - right);
    const availH = Math.max(40, outH - top - bottom);
    const fitScale = Math.min(availW / srcW, availH / srcH);
    const imgW = srcW * fitScale;
    const imgH = srcH * fitScale;
    const imgX = left + (availW - imgW) / 2;
    const imgY = top + (availH - imgH) / 2;
    return { outW, outH, imgX, imgY, imgW, imgH, scale: fitScale };
  }, [loaded, activeMargins, canvasTarget]);

  const resolvedFillHex =
    fillKind === "white"
      ? "#FFFFFF"
      : fillKind === "cream"
        ? "#FAF8F5"
        : fillKind === "black"
          ? "#09090B"
          : customHex;

  function renderPaddingCanvas(ctx: CanvasRenderingContext2D, previewCheckerboard: boolean, exportFmt: "png" | "jpeg") {
    const { outW, outH, imgX, imgY, imgW, imgH } = scene;
    ctx.clearRect(0, 0, outW, outH);

    if (fillKind === "transparent") {
      if (exportFmt === "jpeg") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, outW, outH);
      } else if (previewCheckerboard) {
        const tile = Math.max(12, Math.round(Math.min(outW, outH) / 42));
        ctx.fillStyle = "#FAFAFA";
        ctx.fillRect(0, 0, outW, outH);
        ctx.fillStyle = "#E4E4E7";
        for (let y = 0; y < outH; y += tile) {
          for (let x = (Math.floor(y / tile) % 2) * tile; x < outW; x += tile * 2) {
            ctx.fillRect(x, y, tile, tile);
          }
        }
      }
    } else {
      ctx.fillStyle = resolvedFillHex;
      ctx.fillRect(0, 0, outW, outH);
    }

    if (loaded) {
      const r = Math.min(photoRadius, imgW / 2, imgH / 2);
      if (photoShadow > 0) {
        ctx.save();
        ctx.shadowColor = `rgba(15, 23, 42, ${(0.08 + (photoShadow / 100) * 0.28).toFixed(2)})`;
        ctx.shadowBlur = (photoShadow / 100) * 48;
        ctx.shadowOffsetY = (photoShadow / 100) * 16;
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.roundRect(imgX, imgY, imgW, imgH, r);
        ctx.fill();
        ctx.restore();
      }

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, imgW, imgH, r);
      ctx.clip();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(loaded.img, imgX, imgY, imgW, imgH);
      ctx.restore();
    } else {
      ctx.save();
      ctx.fillStyle = "rgba(148, 163, 184, 0.22)";
      ctx.strokeStyle = "rgba(100, 116, 139, 0.5)";
      ctx.lineWidth = 3;
      ctx.setLineDash([12, 10]);
      ctx.beginPath();
      ctx.roundRect(imgX, imgY, imgW, imgH, Math.min(photoRadius, 24));
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = fillKind === "black" ? "#FAFAFA" : "#334155";
      ctx.textAlign = "center";
      ctx.font = "700 34px system-ui, -apple-system, sans-serif";
      ctx.fillText("Drop or Paste Photo Here (Cmd+V)", outW / 2, outH / 2);
      ctx.restore();
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = scene.outW;
    canvas.height = scene.outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    renderPaddingCanvas(ctx, true, format);
  });

  async function buildExportBlob(targetFormat: "png" | "jpeg"): Promise<Blob | null> {
    const off = document.createElement("canvas");
    off.width = scene.outW;
    off.height = scene.outH;
    const ctx = off.getContext("2d");
    if (!ctx) return null;
    renderPaddingCanvas(ctx, false, targetFormat);
    const mime = targetFormat === "jpeg" ? "image/jpeg" : "image/png";
    const blob = await new Promise<Blob | null>(r =>
      off.toBlob(r, mime, targetFormat === "jpeg" ? 0.92 : undefined),
    );
    off.width = 0;
    off.height = 0;
    return blob;
  }

  async function handleDownload() {
    if (!loaded) return;
    const blob = await buildExportBlob(format);
    if (!blob) return;
    const ext = format === "jpeg" ? "jpg" : "png";
    triggerBlobDownload(blob, `padded-image-${scene.outW}x${scene.outH}.${ext}`);
    trackingRef.current.imageExport(format);
  }

  async function handleCopy() {
    if (!loaded || !imageCopySupported) return;
    const res = await copyPngBlobSafe(async () => {
      const b = await buildExportBlob("png");
      if (!b) throw new Error("encode");
      return b;
    });
    if (res.ok) {
      trackingRef.current.copy("png");
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  return (
    <section
      aria-label="Add Padding and White Border to Image"
      className="mt-8 space-y-4"
      onDragOver={e => e.preventDefault()}
      onDrop={e => {
        e.preventDefault();
        const f = e.dataTransfer.files?.[0];
        if (f) {
          sampleLoadingRef.current = false;
          void readFile(f);
        }
      }}
      data-testid="padding-editor"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        className="sr-only"
        aria-label="Upload image to add padding or white border"
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) {
            sampleLoadingRef.current = false;
            void readFile(f);
          }
          e.currentTarget.value = "";
        }}
      />

      <V3ToolFileBar
        loaded={loaded}
        isDemoSample={isDemoSample}
        reading={reading}
        onChooseFile={() => fileInputRef.current?.click()}
        onTrySample={() => loadSample(false)}
        onClear={() => {
          setIsDemoSample(false);
          clearImage();
        }}
        uploadTestId="padding-upload-btn"
        sampleTestId="padding-try-sample"
      />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22.5rem]">
        {/* Left Live Stage */}
        <div className="v2-stage-card min-h-[24rem] sm:min-h-[29rem]">
          {!loaded ? (
            <V3StageEmptyDropzone
              reading={reading}
              inputError={inputError}
              hint="Add uniform gallery white borders, Polaroid mats, or transparent PNG margins"
              onChooseFile={() => fileInputRef.current?.click()}
              onTrySample={() => loadSample(false)}
              uploadTestId="padding-upload-btn"
              sampleTestId="padding-try-sample"
            />
          ) : (
            <>
              <canvas
                ref={canvasRef}
                className="max-h-[480px] max-w-full border border-border shadow-md"
                data-testid="padding-canvas"
              />
              <p className="mt-3 text-center text-xs text-muted-foreground">
                <span className="num font-medium text-foreground">
                  {loaded.width} × {loaded.height} px
                </span>{" "}
                → Padded{" "}
                <span className="num font-semibold text-foreground">
                  {scene.outW} × {scene.outH} px
                </span>
              </p>
              {inputError && (
                <p role="alert" className="mt-2 text-xs font-medium text-destructive">
                  {inputError}
                </p>
              )}
            </>
          )}
        </div>

        {/* Right Controls Panel */}
        <div className="v2-panel space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Canvas aspect</span>
              <span className="num text-xs font-semibold text-foreground">
                {canvasTarget === "expand" ? "Auto expand" : canvasTarget}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5" role="group" aria-label="Canvas aspect target">
              {(
                [
                  { id: "expand", label: "Auto" },
                  { id: "4:5", label: "4:5" },
                  { id: "3:4", label: "3:4" },
                  { id: "1:1", label: "1:1" },
                  { id: "16:9", label: "16:9" },
                ] as const
              ).map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={canvasTarget === opt.id}
                  onClick={() => setCanvasTarget(opt.id)}
                  className={`rounded-lg border px-2 py-1.5 text-xs font-semibold transition ${
                    canvasTarget === opt.id
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid={`pad-target-${opt.id}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <SegmentedControl
              aria-label="Padding style"
              value={padStyle}
              onValueChange={v => {
                if (v === "uniform" || v === "polaroid" || v === "custom") setPadStyle(v);
              }}
              className="v2-seg v2-seg--sm w-full"
            >
              <SegmentedControlIndicator className="v2-seg-indicator" />
              <SegmentedControlItem value="uniform" className="v2-seg-item flex-1">
                Uniform
              </SegmentedControlItem>
              <SegmentedControlItem value="polaroid" className="v2-seg-item flex-1">
                Polaroid
              </SegmentedControlItem>
              <SegmentedControlItem value="custom" className="v2-seg-item flex-1">
                4-Side
              </SegmentedControlItem>
            </SegmentedControl>

            {padStyle !== "custom" ? (
              <Field>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <FieldLabel className="font-medium text-foreground">
                    {padStyle === "polaroid" ? "Base border thickness" : "Padding thickness"}
                  </FieldLabel>
                  <span className="num text-muted-foreground">{uniformPx} px</span>
                </div>
                <Slider min={0} max={320} step={4} value={uniformPx} onValueChange={setUniformPx}>
                  <SliderControl>
                    <SliderTrack>
                      <SliderIndicator />
                      <SliderThumb aria-label="Padding thickness" />
                    </SliderTrack>
                  </SliderControl>
                </Slider>
              </Field>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { label: "Top (px)", val: padTop, set: setPadTop },
                    { label: "Bottom (px)", val: padBottom, set: setPadBottom },
                    { label: "Left (px)", val: padLeft, set: setPadLeft },
                    { label: "Right (px)", val: padRight, set: setPadRight },
                  ] as const
                ).map(side => (
                  <Field key={side.label} className="space-y-1">
                    <FieldLabel className="text-[11px] font-medium text-muted-foreground">
                      {side.label}
                    </FieldLabel>
                    <Input
                      type="number"
                      min={0}
                      max={600}
                      value={String(side.val)}
                      onChange={e =>
                        side.set(Math.max(0, Math.min(600, Number(e.target.value) || 0)))
                      }
                      className="num h-8 text-xs"
                    />
                  </Field>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <span className="block text-xs font-semibold text-muted-foreground">
              Background / border color
            </span>
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Padding color">
              {FILL_SWATCHES.map(sw => (
                <button
                  key={sw.id}
                  type="button"
                  aria-label={sw.label}
                  aria-pressed={fillKind === sw.id}
                  onClick={() => {
                    setFillKind(sw.id);
                    if (sw.id === "transparent") setFormat("png");
                  }}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                    fillKind === sw.id
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid={`pad-fill-${sw.id}`}
                >
                  <span
                    aria-hidden="true"
                    className="inline-block h-3.5 w-3.5 rounded-full border border-zinc-300 dark:border-zinc-600"
                    style={{
                      background:
                        sw.id === "transparent"
                          ? "repeating-conic-gradient(#a1a1aa 0% 25%, #ffffff 0% 50%) 50% / 6px 6px"
                          : sw.id === "custom"
                            ? customHex
                            : sw.hex,
                    }}
                  />
                  <span>{sw.label}</span>
                </button>
              ))}
            </div>

            {fillKind === "custom" && (
              <Field className="space-y-1">
                <FieldLabel className="text-xs font-medium text-muted-foreground">
                  Custom Hex Color
                </FieldLabel>
                <Input
                  value={customHex}
                  onChange={e => setCustomHex(e.target.value)}
                  placeholder="#DBEAFE"
                  className="num h-8 text-xs"
                />
              </Field>
            )}

            <Field>
              <div className="mb-1 flex items-center justify-between text-xs">
                <FieldLabel className="font-medium text-foreground">Inner corner radius</FieldLabel>
                <span className="num text-muted-foreground">{photoRadius} px</span>
              </div>
              <Slider min={0} max={64} step={2} value={photoRadius} onValueChange={setPhotoRadius}>
                <SliderControl>
                  <SliderTrack>
                    <SliderIndicator />
                    <SliderThumb aria-label="Inner corner radius" />
                  </SliderTrack>
                </SliderControl>
              </Slider>
            </Field>

            <Field>
              <div className="mb-1 flex items-center justify-between text-xs">
                <FieldLabel className="font-medium text-foreground">Photo elevation shadow</FieldLabel>
                <span className="num text-muted-foreground">{photoShadow}%</span>
              </div>
              <Slider min={0} max={80} step={5} value={photoShadow} onValueChange={setPhotoShadow}>
                <SliderControl>
                  <SliderTrack>
                    <SliderIndicator />
                    <SliderThumb aria-label="Photo elevation shadow" />
                  </SliderTrack>
                </SliderControl>
              </Slider>
            </Field>
          </div>

          <div className="space-y-2.5 border-t border-border pt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Export canvas</span>
              <span className="num font-semibold text-foreground">
                {scene.outW} × {scene.outH} px
              </span>
            </div>

            <SegmentedControl
              aria-label="Export file format"
              value={format}
              onValueChange={v => {
                if (v === "png" || v === "jpeg") setFormat(v);
              }}
              className="v2-seg v2-seg--sm w-full"
            >
              <SegmentedControlIndicator className="v2-seg-indicator" />
              <SegmentedControlItem value="png" className="v2-seg-item flex-1">
                PNG (Alpha)
              </SegmentedControlItem>
              <SegmentedControlItem value="jpeg" className="v2-seg-item flex-1">
                JPG (Compact)
              </SegmentedControlItem>
            </SegmentedControl>

            <div className="flex gap-2">
              {imageCopySupported && (
                <Button
                  disabled={!loaded}
                  focusableWhenDisabled
                  onClick={() => void handleCopy()}
                  className="v2-btn text-xs"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? "Copied" : "Copy PNG"}</span>
                </Button>
              )}
              <Button
                disabled={!loaded}
                focusableWhenDisabled
                onClick={() => void handleDownload()}
                className="v2-btn v2-btn--primary flex-1 justify-center text-xs"
                data-testid="padding-download-btn"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>Download {format.toUpperCase()}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
