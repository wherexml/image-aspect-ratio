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
import { Switch, SwitchThumb } from "@ui-sdk/react/switch";
import { Download, FolderArchive } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useToolTracking } from "@/lib/tool-analytics";
import { buildStoreZip } from "@/lib/zip-store";
import { V3StageEmptyDropzone, V3ToolFileBar } from "./V3ToolFileBar";
import {
  createSyntheticSampleFile,
  triggerBlobDownload,
  useLocalToolImage,
} from "./useLocalToolImage";

type SplitterMode = "carousel" | "grid";
type TileRatioId = "4:5" | "3:4" | "1:1";

const TILE_SIZES: Record<TileRatioId, { w: number; h: number; label: string }> = {
  "4:5": { w: 1080, h: 1350, label: "4:5 Feed (1080×1350)" },
  "3:4": { w: 1080, h: 1440, label: "3:4 Grid (1080×1440)" },
  "1:1": { w: 1080, h: 1080, label: "1:1 Square (1080×1080)" },
};

type GeneratedTile = {
  index: number;
  row: number;
  col: number;
  postOrder: number;
  filename: string;
  previewUrl: string;
  blob: Blob;
};

export function InstagramGridSplitterV3() {
  const sampleLoadingRef = useRef(false);
  const autoDemoLoadingRef = useRef(false);
  const [isDemoSample, setIsDemoSample] = useState<boolean>(false);
  const tracking = useToolTracking("grid_splitter", "frame", null);
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
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const autoDemoRef = useRef(false);

  const loadSample = (fromAutoDemo = false) => {
    void createSyntheticSampleFile("carousel-panorama").then(f => {
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

  const [mode, setMode] = useState<SplitterMode>("carousel");
  const [tileRatio, setTileRatio] = useState<TileRatioId>("4:5");
  const [slideCount, setSlideCount] = useState<number>(3);
  const [gridRows, setGridRows] = useState<number>(3);
  const [scaleMode, setScaleMode] = useState<"cover" | "contain">("cover");
  const [bgColor, setBgColor] = useState<string>("#FFFFFF");
  const [showCoverGridCrop, setShowCoverGridCrop] = useState<boolean>(true);
  const [format, setFormat] = useState<"png" | "jpeg">("png");

  const [tiles, setTiles] = useState<GeneratedTile[]>([]);
  const [slicing, setSlicing] = useState<boolean>(false);
  const tileUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      tileUrlsRef.current.forEach(u => URL.revokeObjectURL(u));
      tileUrlsRef.current = [];
    };
  }, []);

  const effectiveRatio: TileRatioId = mode === "grid" && tileRatio === "4:5" ? "3:4" : tileRatio;
  const tileSpec = TILE_SIZES[effectiveRatio];
  const cols = mode === "carousel" ? slideCount : 3;
  const rows = mode === "carousel" ? 1 : gridRows;
  const totalW = cols * tileSpec.w;
  const totalH = rows * tileSpec.h;

  // Compute source placement onto total master composition (totalW × totalH)
  const placement = useMemo(() => {
    if (!loaded) return { dx: 0, dy: 0, dw: totalW, dh: totalH };
    const srcR = loaded.width / loaded.height;
    const dstR = totalW / totalH;
    let dw = totalW;
    let dh = totalH;
    if (scaleMode === "cover") {
      if (srcR > dstR) {
        dh = totalH;
        dw = totalH * srcR;
      } else {
        dw = totalW;
        dh = totalW / srcR;
      }
    } else {
      if (srcR > dstR) {
        dw = totalW;
        dh = totalW / srcR;
      } else {
        dh = totalH;
        dw = totalH * srcR;
      }
    }
    return {
      dx: (totalW - dw) / 2,
      dy: (totalH - dh) / 2,
      dw,
      dh,
    };
  }, [loaded, totalW, totalH, scaleMode]);

  // Live visual seam & 3:4 profile cover crop preview canvas
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const maxPreviewW = 960;
    const scale = Math.min(1, maxPreviewW / totalW);
    const pw = Math.max(1, Math.round(totalW * scale));
    const ph = Math.max(1, Math.round(totalH * scale));
    canvas.width = pw;
    canvas.height = ph;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, pw, ph);

    if (loaded) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(
        loaded.img,
        placement.dx * scale,
        placement.dy * scale,
        placement.dw * scale,
        placement.dh * scale,
      );
    } else {
      const g = ctx.createLinearGradient(0, 0, pw, ph);
      g.addColorStop(0, "#1E293B");
      g.addColorStop(0.5, "#334155");
      g.addColorStop(1, "#0F172A");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, pw, ph);
    }

    // Draw Slide 1 3:4 Profile Grid trim warning when Carousel is 4:5 (1080×1350 -> profile shows center 1012.5×1350, trimming 33.75px left & right!)
    if (mode === "carousel" && effectiveRatio === "4:5" && showCoverGridCrop) {
      const trimPx = 33.75 * scale;
      const slide1W = tileSpec.w * scale;
      ctx.save();
      ctx.fillStyle = "rgba(239, 68, 68, 0.36)";
      ctx.fillRect(0, 0, trimPx, ph);
      ctx.fillRect(slide1W - trimPx, 0, trimPx, ph);
      ctx.strokeStyle = "#FBBF24";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 5]);
      ctx.strokeRect(trimPx, 1, slide1W - trimPx * 2, ph - 2);
      ctx.restore();
    }

    // Draw crisp seam dividers and tile order badges
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    for (let c = 1; c < cols; c++) {
      const x = Math.round((c * pw) / cols);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, ph);
      ctx.stroke();
    }
    for (let r = 1; r < rows; r++) {
      const y = Math.round((r * ph) / rows);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(pw, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    const totalTiles = rows * cols;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const postNum = mode === "carousel" ? idx + 1 : totalTiles - idx;
        const tx = (c * pw) / cols + 10;
        const ty = (r * ph) / rows + 10;
        const label = mode === "carousel" ? `Slide ${postNum}` : `Post #${postNum}`;
        ctx.font = "700 12px ui-monospace, SFMono-Regular, monospace";
        const w = ctx.measureText(label).width + 14;
        ctx.fillStyle = "rgba(9, 9, 11, 0.82)";
        ctx.beginPath();
        ctx.roundRect(tx, ty, w, 22, 6);
        ctx.fill();
        ctx.fillStyle = "#FFFFFF";
        ctx.textBaseline = "middle";
        ctx.fillText(label, tx + 7, ty + 11);
      }
    }
    ctx.restore();
  }, [loaded, placement, totalW, totalH, cols, rows, bgColor, mode, effectiveRatio, showCoverGridCrop, tileSpec.w]);

  // Clear generated tiles when parameters or image change so stale tiles aren't downloaded
  useEffect(() => {
    tileUrlsRef.current.forEach(u => URL.revokeObjectURL(u));
    tileUrlsRef.current = [];
    setTiles([]);
  }, [loaded, mode, effectiveRatio, slideCount, gridRows, scaleMode, bgColor, format]);

  async function generateSlices(): Promise<GeneratedTile[]> {
    if (!loaded) return [];
    setSlicing(true);
    try {
      const out: GeneratedTile[] = [];
      const newUrls: string[] = [];
      const totalTiles = rows * cols;
      const mime = format === "jpeg" ? "image/jpeg" : "image/png";
      const ext = format === "jpeg" ? "jpg" : "png";

      // Mobile Safari safe: reuse ONE single tile-sized offscreen canvas (1080×1350 or 1080×1440) sequentially!
      const tileCanvas = document.createElement("canvas");
      tileCanvas.width = tileSpec.w;
      tileCanvas.height = tileSpec.h;
      const tctx = tileCanvas.getContext("2d");
      if (!tctx) return [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          const postOrder = mode === "carousel" ? idx + 1 : totalTiles - idx;
          tctx.clearRect(0, 0, tileSpec.w, tileSpec.h);
          tctx.fillStyle = bgColor;
          tctx.fillRect(0, 0, tileSpec.w, tileSpec.h);
          tctx.imageSmoothingEnabled = true;
          tctx.imageSmoothingQuality = "high";

          // Shift master composition so tile (c, r) lands on (0, 0)
          const offsetX = placement.dx - c * tileSpec.w;
          const offsetY = placement.dy - r * tileSpec.h;
          tctx.drawImage(loaded.img, offsetX, offsetY, placement.dw, placement.dh);

          const blob = await new Promise<Blob | null>(res =>
            tileCanvas.toBlob(res, mime, format === "jpeg" ? 0.92 : undefined),
          );
          if (!blob) continue;
          const previewUrl = URL.createObjectURL(blob);
          newUrls.push(previewUrl);

          const paddedOrder = String(postOrder).padStart(2, "0");
          const filename =
            mode === "carousel"
              ? `ig-carousel-slide-${paddedOrder}-${tileSpec.w}x${tileSpec.h}.${ext}`
              : `ig-grid-post-${paddedOrder}-r${r + 1}c${c + 1}-${tileSpec.w}x${tileSpec.h}.${ext}`;

          out.push({
            index: idx,
            row: r,
            col: c,
            postOrder,
            filename,
            previewUrl,
            blob,
          });
        }
      }

      tileCanvas.width = 0;
      tileCanvas.height = 0;
      tileUrlsRef.current.forEach(u => URL.revokeObjectURL(u));
      tileUrlsRef.current = newUrls;
      setTiles(out);
      return out;
    } finally {
      setSlicing(false);
    }
  }

  async function handleDownloadZip() {
    const ready = tiles.length > 0 ? tiles : await generateSlices();
    if (ready.length === 0) return;
    const entries = await Promise.all(
      ready.map(async t => ({
        name: t.filename,
        bytes: new Uint8Array(await t.blob.arrayBuffer()),
      })),
    );
    const zipBlob = buildStoreZip(entries);
    triggerBlobDownload(
      zipBlob,
      mode === "carousel"
        ? `instagram-carousel-${cols}x-${effectiveRatio.replace(":", "x")}.zip`
        : `instagram-3x4-grid-3x${rows}.zip`,
    );
    trackingRef.current.imageExport("zip");
  }

  return (
    <section
      aria-label="Instagram 3:4 Grid and 4:5 Carousel Splitter"
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
      data-testid="ig-grid-splitter"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        className="sr-only"
        aria-label="Upload panoramic or grid image"
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
          setTiles([]);
          clearImage();
        }}
        uploadTestId="ig-upload-btn"
        sampleTestId="ig-try-sample"
      />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22.5rem]">
        {/* Left Live Seam Stage + Individual Mobile-Friendly Tile Downloads */}
        <div className="v2-stage-card min-h-[24rem] justify-between gap-4 sm:min-h-[29rem]">
          {!loaded ? (
            <div className="flex flex-1 items-center justify-center py-6">
              <V3StageEmptyDropzone
                reading={reading}
                inputError={inputError}
                hint="Slice seamless 4:5 panoramic carousels or modern 3:4 profile grids"
                onChooseFile={() => fileInputRef.current?.click()}
                onTrySample={() => loadSample(false)}
                uploadTestId="ig-upload-btn"
                sampleTestId="ig-try-sample"
              />
            </div>
          ) : (
            <div className="flex w-full flex-1 flex-col items-center justify-center">
              <canvas
                ref={previewCanvasRef}
                className="max-h-[460px] max-w-full rounded-lg border border-border shadow-md"
                data-testid="ig-splitter-canvas"
              />
              <p className="mt-3 text-center text-xs text-muted-foreground">
                {mode === "carousel"
                  ? effectiveRatio === "4:5" && showCoverGridCrop
                    ? "Dashed white lines mark swipe seams. Red edges on Slide 1 show the 68 px trimmed on Instagram's 3:4 profile grid."
                    : "Upload in chronological order: Slide 1 → Slide 2 → Slide 3."
                  : "Profile grids stack newest top-left: upload Post #1 (bottom-right) first and finish with top-left!"}
              </p>
              {inputError && (
                <p role="alert" className="mt-2 text-xs font-medium text-destructive">
                  {inputError}
                </p>
              )}
            </div>
          )}

          {tiles.length > 0 && (
            <div className="w-full space-y-2.5 border-t border-border pt-4" data-testid="ig-sliced-tiles">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">
                  Ready to Save ({tiles.length} tiles · tap any tile on iPhone/Android to save directly)
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5">
                {tiles.map(tile => (
                  <button
                    key={tile.filename}
                    type="button"
                    onClick={() => {
                      triggerBlobDownload(tile.blob, tile.filename);
                      trackingRef.current.imageExport("tile");
                    }}
                    aria-label={`Download ${mode === "carousel" ? `Slide ${tile.postOrder}` : `Post ${tile.postOrder}`}`}
                    className="group flex flex-col overflow-hidden rounded-lg border border-border bg-background text-left transition hover:border-primary"
                  >
                    <img
                      src={tile.previewUrl}
                      alt=""
                      className="aspect-[4/5] w-full object-cover"
                    />
                    <div className="flex items-center justify-between px-2 py-1.5 text-[11px] font-semibold">
                      <span className="num">
                        {mode === "carousel" ? `Slide ${tile.postOrder}` : `Post #${tile.postOrder}`}
                      </span>
                      <Download className="h-3 w-3 opacity-60 group-hover:text-primary group-hover:opacity-100" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Controls Panel */}
        <div className="v2-panel space-y-5">
          <div className="space-y-2">
            <span className="block text-xs font-semibold text-muted-foreground">
              Split layout mode
            </span>
            <SegmentedControl
              aria-label="Split mode"
              value={mode}
              onValueChange={v => {
                if (v === "carousel" || v === "grid") {
                  setMode(v);
                  if (v === "grid" && tileRatio === "4:5") setTileRatio("3:4");
                }
              }}
              className="v2-seg v2-seg--sm w-full"
            >
              <SegmentedControlIndicator className="v2-seg-indicator" />
              <SegmentedControlItem value="carousel" className="v2-seg-item flex-1">
                Seamless Carousel
              </SegmentedControlItem>
              <SegmentedControlItem value="grid" className="v2-seg-item flex-1">
                3:4 Profile Grid
              </SegmentedControlItem>
            </SegmentedControl>
          </div>

          {mode === "carousel" ? (
            <div className="space-y-3">
              <Field>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <FieldLabel className="font-medium text-foreground">Carousel slides</FieldLabel>
                  <span className="num font-semibold text-foreground">{slideCount} slides</span>
                </div>
                <Slider min={2} max={10} step={1} value={slideCount} onValueChange={setSlideCount}>
                  <SliderControl>
                    <SliderTrack>
                      <SliderIndicator />
                      <SliderThumb aria-label="Carousel slides" />
                    </SliderTrack>
                  </SliderControl>
                </Slider>
              </Field>

              <div className="space-y-1.5">
                <p className="text-xs font-medium text-foreground">Slide aspect ratio</p>
                <div className="grid grid-cols-3 gap-1.5" role="group" aria-label="Slide aspect ratio">
                  {(["4:5", "3:4", "1:1"] as const).map(r => (
                    <button
                      key={r}
                      type="button"
                      aria-pressed={tileRatio === r}
                      onClick={() => setTileRatio(r)}
                      className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                        tileRatio === r
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-background text-muted-foreground hover:text-foreground"
                      }`}
                      data-testid={`ig-ratio-${r}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {effectiveRatio === "4:5" && (
                <Field className="flex items-center justify-between gap-2 pt-1">
                  <FieldLabel className="text-xs text-muted-foreground">
                    Preview Slide 1 3:4 profile trim (68 px)
                  </FieldLabel>
                  <Switch checked={showCoverGridCrop} onCheckedChange={setShowCoverGridCrop}>
                    <SwitchThumb />
                  </Switch>
                </Field>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-foreground">Profile grid size (3 columns)</p>
                <div className="grid grid-cols-4 gap-1.5" role="group" aria-label="Profile grid rows">
                  {[1, 2, 3, 4].map(r => (
                    <button
                      key={r}
                      type="button"
                      aria-pressed={gridRows === r}
                      onClick={() => setGridRows(r)}
                      className={`num rounded-lg border px-2 py-1.5 text-xs font-semibold transition ${
                        gridRows === r
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-background text-muted-foreground hover:text-foreground"
                      }`}
                      data-testid={`ig-grid-3x${r}`}
                    >
                      3 × {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-medium text-foreground">Grid cell format</p>
                <div className="grid grid-cols-2 gap-1.5" role="group" aria-label="Grid cell format">
                  {(["3:4", "1:1"] as const).map(r => (
                    <button
                      key={r}
                      type="button"
                      aria-pressed={effectiveRatio === r}
                      onClick={() => setTileRatio(r)}
                      className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                        effectiveRatio === r
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-background text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {r === "3:4" ? "3:4 Modern Grid" : "1:1 Legacy"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2.5 border-t border-border pt-4">
            <span className="block text-xs font-semibold text-muted-foreground">
              Framing &amp; format
            </span>
            <div className="grid grid-cols-2 gap-2">
              <SegmentedControl
                aria-label="Image fit mode"
                value={scaleMode}
                onValueChange={v => {
                  if (v === "cover" || v === "contain") setScaleMode(v);
                }}
                className="v2-seg v2-seg--sm"
              >
                <SegmentedControlIndicator className="v2-seg-indicator" />
                <SegmentedControlItem value="cover" className="v2-seg-item flex-1">
                  Fill
                </SegmentedControlItem>
                <SegmentedControlItem value="contain" className="v2-seg-item flex-1">
                  Fit
                </SegmentedControlItem>
              </SegmentedControl>

              <SegmentedControl
                aria-label="Export image format"
                value={format}
                onValueChange={v => {
                  if (v === "png" || v === "jpeg") setFormat(v);
                }}
                className="v2-seg v2-seg--sm"
              >
                <SegmentedControlIndicator className="v2-seg-indicator" />
                <SegmentedControlItem value="png" className="v2-seg-item flex-1">
                  PNG
                </SegmentedControlItem>
                <SegmentedControlItem value="jpeg" className="v2-seg-item flex-1">
                  JPG
                </SegmentedControlItem>
              </SegmentedControl>
            </div>
          </div>

          {/* Master Canvas Math Summary */}
          <div className="rounded-xl border border-border bg-muted/40 p-3 text-xs">
            <p className="font-semibold text-foreground">Recommended Master Canvas</p>
            <p className="num mt-1 text-base font-bold text-primary">
              {totalW} × {totalH} px
            </p>
            <p className="mt-1 text-muted-foreground">
              Outputs {rows * cols} tiles at{" "}
              <span className="num font-medium text-foreground">
                {tileSpec.w} × {tileSpec.h} px
              </span>{" "}
              each ({effectiveRatio}).
            </p>
          </div>

          <div className="space-y-2 border-t border-border pt-4">
            <Button
              disabled={!loaded || slicing}
              focusableWhenDisabled
              onClick={() => void generateSlices()}
              className="v2-btn h-auto min-h-10 w-full justify-center py-2 text-center text-xs leading-snug whitespace-normal"
              data-testid="ig-slice-btn"
            >
              <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{slicing ? "Slicing tiles…" : `Slice into ${rows * cols} Individual Tiles`}</span>
            </Button>
            <Button
              disabled={!loaded || slicing}
              focusableWhenDisabled
              onClick={() => void handleDownloadZip()}
              className="v2-btn v2-btn--primary h-auto min-h-10 w-full justify-center py-2 text-center text-xs leading-snug whitespace-normal"
              data-testid="ig-download-zip"
            >
              <FolderArchive className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Download All {rows * cols} Tiles (.zip)</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
