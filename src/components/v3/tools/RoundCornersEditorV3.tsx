"use client";

import { Button } from "@ui-sdk/react/button";
import { Field, FieldLabel } from "@ui-sdk/react/field";
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

type ShapeMode = "rounded" | "circle";
type CornerBgMode = "transparent" | "white" | "black";

export function RoundCornersEditorV3() {
  const sampleLoadingRef = useRef(false);
  const autoDemoLoadingRef = useRef(false);
  const [isDemoSample, setIsDemoSample] = useState<boolean>(false);
  const tracking = useToolTracking("round_corners", "frame", null);
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

  const [shapeMode, setShapeMode] = useState<ShapeMode>("rounded");
  const [radiusPx, setRadiusPx] = useState<number>(48);
  const [bgMode, setBgMode] = useState<CornerBgMode>("transparent");
  const [ringWidth, setRingWidth] = useState<number>(0);
  const [ringColor, setRingColor] = useState<string>("#FFFFFF");
  const [copied, setCopied] = useState<boolean>(false);

  const dims = useMemo(() => {
    const srcW = loaded?.width ?? 1200;
    const srcH = loaded?.height ?? 900;
    if (shapeMode === "circle") {
      const side = Math.min(srcW, srcH, 2048);
      return {
        outW: side,
        outH: side,
        sx: (srcW - Math.min(srcW, srcH)) / 2,
        sy: (srcH - Math.min(srcW, srcH)) / 2,
        sw: Math.min(srcW, srcH),
        sh: Math.min(srcW, srcH),
        maxRadius: Math.round(side / 2),
      };
    }
    const scale = Math.min(1, 4096 / Math.max(srcW, srcH));
    const outW = Math.max(1, Math.round(srcW * scale));
    const outH = Math.max(1, Math.round(srcH * scale));
    return {
      outW,
      outH,
      sx: 0,
      sy: 0,
      sw: srcW,
      sh: srcH,
      maxRadius: Math.round(Math.min(outW, outH) / 2),
    };
  }, [loaded, shapeMode]);

  const effectiveRadius =
    shapeMode === "circle" ? dims.maxRadius : Math.min(radiusPx, dims.maxRadius);

  function renderRoundedScene(ctx: CanvasRenderingContext2D, previewCheckerboard: boolean) {
    const { outW, outH, sx, sy, sw, sh } = dims;
    ctx.clearRect(0, 0, outW, outH);

    if (bgMode === "transparent") {
      if (previewCheckerboard) {
        const tile = Math.max(12, Math.round(Math.min(outW, outH) / 38));
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
      ctx.fillStyle = bgMode === "white" ? "#FFFFFF" : "#09090B";
      ctx.fillRect(0, 0, outW, outH);
    }

    ctx.save();
    ctx.beginPath();
    if (shapeMode === "circle") {
      ctx.arc(outW / 2, outH / 2, Math.min(outW, outH) / 2, 0, Math.PI * 2);
    } else {
      ctx.roundRect(0, 0, outW, outH, effectiveRadius);
    }
    ctx.clip();

    if (loaded) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(loaded.img, sx, sy, sw, sh, 0, 0, outW, outH);
    } else {
      const g = ctx.createLinearGradient(0, 0, outW, outH);
      g.addColorStop(0, "#0F766E");
      g.addColorStop(0.55, "#0284C7");
      g.addColorStop(1, "#6366F1");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, outW, outH);
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";
      ctx.font = "700 36px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        shapeMode === "circle" ? "1:1 Transparent Circle Avatar" : `Rounded ${effectiveRadius} px Corners`,
        outW / 2,
        outH / 2,
      );
    }
    ctx.restore();

    if (ringWidth > 0) {
      ctx.save();
      ctx.strokeStyle = ringColor;
      ctx.lineWidth = ringWidth * 2;
      ctx.beginPath();
      if (shapeMode === "circle") {
        ctx.arc(outW / 2, outH / 2, Math.max(2, Math.min(outW, outH) / 2 - ringWidth), 0, Math.PI * 2);
      } else {
        ctx.roundRect(
          ringWidth,
          ringWidth,
          outW - ringWidth * 2,
          outH - ringWidth * 2,
          Math.max(0, effectiveRadius - ringWidth),
        );
      }
      ctx.stroke();
      ctx.restore();
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = dims.outW;
    canvas.height = dims.outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    renderRoundedScene(ctx, true);
  });

  async function buildPngBlob(): Promise<Blob | null> {
    const off = document.createElement("canvas");
    off.width = dims.outW;
    off.height = dims.outH;
    const ctx = off.getContext("2d");
    if (!ctx) return null;
    renderRoundedScene(ctx, false);
    const blob = await new Promise<Blob | null>(r => off.toBlob(r, "image/png"));
    off.width = 0;
    off.height = 0;
    return blob;
  }

  async function handleDownload() {
    if (!loaded) return;
    const blob = await buildPngBlob();
    if (!blob) return;
    const prefix = shapeMode === "circle" ? "circle-avatar" : `rounded-${effectiveRadius}px`;
    triggerBlobDownload(blob, `${prefix}-${dims.outW}x${dims.outH}.png`);
    trackingRef.current.imageExport("png");
  }

  async function handleCopy() {
    if (!loaded || !imageCopySupported) return;
    const res = await copyPngBlobSafe(async () => {
      const b = await buildPngBlob();
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
      aria-label="Round Corners and Circle Crop Image"
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
      data-testid="round-corners-editor"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        className="sr-only"
        aria-label="Upload image to round corners or circle crop"
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
        uploadTestId="round-upload-btn"
        sampleTestId="round-try-sample"
      />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22.5rem]">
        {/* Left Live Stage */}
        <div className="v2-stage-card min-h-[24rem] sm:min-h-[29rem]">
          {!loaded ? (
            <V3StageEmptyDropzone
              reading={reading}
              inputError={inputError}
              hint="Export crisp transparent rounded-corner PNGs or 1:1 circular avatars"
              onChooseFile={() => fileInputRef.current?.click()}
              onTrySample={() => loadSample(false)}
              uploadTestId="round-upload-btn"
              sampleTestId="round-try-sample"
            />
          ) : (
            <>
              <canvas
                ref={canvasRef}
                className="max-h-[480px] max-w-full border border-border shadow-md"
                data-testid="round-corners-canvas"
              />
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Checkerboard squares indicate 100% transparent alpha pixels in the downloaded PNG.
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
            <span className="block text-xs font-semibold text-muted-foreground">
              Mask shape &amp; corner radius
            </span>
            <SegmentedControl
              aria-label="Mask shape"
              value={shapeMode}
              onValueChange={v => {
                if (v === "rounded" || v === "circle") setShapeMode(v);
              }}
              className="v2-seg v2-seg--sm w-full"
            >
              <SegmentedControlIndicator className="v2-seg-indicator" />
              <SegmentedControlItem value="rounded" className="v2-seg-item flex-1">
                Rounded Corners
              </SegmentedControlItem>
              <SegmentedControlItem value="circle" className="v2-seg-item flex-1">
                1:1 Circle Avatar
              </SegmentedControlItem>
            </SegmentedControl>

            {shapeMode === "rounded" && (
              <>
                <Field>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <FieldLabel className="font-medium text-foreground">Corner radius</FieldLabel>
                    <span className="num font-semibold text-foreground">{effectiveRadius} px</span>
                  </div>
                  <Slider
                    min={0}
                    max={Math.max(64, dims.maxRadius)}
                    step={2}
                    value={effectiveRadius}
                    onValueChange={setRadiusPx}
                  >
                    <SliderControl>
                      <SliderTrack>
                        <SliderIndicator />
                        <SliderThumb aria-label="Corner radius" />
                      </SliderTrack>
                    </SliderControl>
                  </Slider>
                </Field>

                <div className="grid grid-cols-4 gap-1.5" role="group" aria-label="Quick radius presets">
                  {[16, 32, 64, 128].map(px => (
                    <button
                      key={px}
                      type="button"
                      onClick={() => setRadiusPx(px)}
                      className="num rounded-lg border border-border bg-background px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                    >
                      {px} px
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <span className="block text-xs font-semibold text-muted-foreground">
              Outer corner background &amp; ring
            </span>
            <SegmentedControl
              aria-label="Outer corner background"
              value={bgMode}
              onValueChange={v => {
                if (v === "transparent" || v === "white" || v === "black") setBgMode(v);
              }}
              className="v2-seg v2-seg--sm w-full"
            >
              <SegmentedControlIndicator className="v2-seg-indicator" />
              <SegmentedControlItem value="transparent" className="v2-seg-item flex-1">
                Transparent
              </SegmentedControlItem>
              <SegmentedControlItem value="white" className="v2-seg-item flex-1">
                White
              </SegmentedControlItem>
              <SegmentedControlItem value="black" className="v2-seg-item flex-1">
                Black
              </SegmentedControlItem>
            </SegmentedControl>

            <Field>
              <div className="mb-1 flex items-center justify-between text-xs">
                <FieldLabel className="font-medium text-foreground">Border ring stroke</FieldLabel>
                <span className="num text-muted-foreground">{ringWidth} px</span>
              </div>
              <Slider min={0} max={24} step={1} value={ringWidth} onValueChange={setRingWidth}>
                <SliderControl>
                  <SliderTrack>
                    <SliderIndicator />
                    <SliderThumb aria-label="Border ring stroke" />
                  </SliderTrack>
                </SliderControl>
              </Slider>
            </Field>

            {ringWidth > 0 && (
              <div className="flex gap-2" role="group" aria-label="Ring stroke color">
                {["#FFFFFF", "#18181B", "#3B82F6", "#10B981", "#F59E0B"].map(hex => (
                  <button
                    key={hex}
                    type="button"
                    aria-label={`Ring color ${hex}`}
                    aria-pressed={ringColor === hex}
                    onClick={() => setRingColor(hex)}
                    className={`h-6 w-6 rounded-full border-2 ${
                      ringColor === hex ? "border-primary scale-110" : "border-zinc-300"
                    }`}
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2.5 border-t border-border pt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Export PNG dimensions</span>
              <span className="num font-semibold text-foreground">
                {dims.outW} × {dims.outH} px
              </span>
            </div>
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
                data-testid="round-download-btn"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>Download Transparent PNG</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
