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
import { Download, Eye, ImagePlus, Layers } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useToolTracking } from "@/lib/tool-analytics";
import { V3ToolFileBar } from "./V3ToolFileBar";
import {
  createSyntheticSampleFile,
  triggerBlobDownload,
  useLocalToolImage,
} from "./useLocalToolImage";

export type SafeZonePlatformId = "universal" | "tiktok" | "reels" | "shorts";

type PlatformSpec = {
  id: SafeZonePlatformId;
  label: string;
  shortLabel: string;
  headerText: string;
  topPx: number;
  bottomPx: number;
  leftPx: number;
  rightPx: number;
  note: string;
};

export const SAFE_ZONE_SPECS: Record<SafeZonePlatformId, PlatformSpec> = {
  universal: {
    id: "universal",
    label: "Universal (TikTok + Reels + Shorts)",
    shortLabel: "All 3 Safe",
    headerText: "Following  |  For You",
    topPx: 250,
    bottomPx: 650,
    leftPx: 120,
    rightPx: 168,
    note: "Combined safe box (792 × 1020 px) — text placed inside the green box stays unblocked on TikTok, Reels, and Shorts.",
  },
  tiktok: {
    id: "tiktok",
    label: "TikTok (9:16)",
    shortLabel: "TikTok",
    headerText: "LIVE   Following  |  For You",
    topPx: 180,
    bottomPx: 560,
    leftPx: 64,
    rightPx: 168,
    note: "Avoids TikTok’s top For You tabs, right-side Avatar / Like / Bookmark buttons, and bottom caption + music ticker.",
  },
  reels: {
    id: "reels",
    label: "Instagram Reels (9:16)",
    shortLabel: "Reels",
    headerText: "Reels",
    topPx: 220,
    bottomPx: 640,
    leftPx: 60,
    rightPx: 132,
    note: "Avoids Instagram’s top Reels header, right Like / Comment / Share column, and bottom creator handle + audio pill.",
  },
  shorts: {
    id: "shorts",
    label: "YouTube Shorts (9:16)",
    shortLabel: "Shorts",
    headerText: "Shorts",
    topPx: 192,
    bottomPx: 540,
    leftPx: 60,
    rightPx: 156,
    note: "Avoids YouTube’s top Search bar, right Thumbs / Comment / Remix column, and bottom Subscribe + title bar.",
  },
};

function drawHeartIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(cx, cy + r * 0.85);
  ctx.bezierCurveTo(cx - r * 1.3, cy + r * 0.1, cx - r * 1.2, cy - r * 0.9, cx, cy - r * 0.35);
  ctx.bezierCurveTo(cx + r * 1.2, cy - r * 0.9, cx + r * 1.3, cy + r * 0.1, cx, cy + r * 0.85);
  ctx.closePath();
  ctx.fill();
}

function drawCommentIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  ctx.arc(cx, cy - 2, r * 0.85, 0.25 * Math.PI, 2.05 * Math.PI);
  ctx.lineTo(cx - r * 0.78, cy + r * 0.88);
  ctx.closePath();
  ctx.fill();
}

function drawShareArrow(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(cx + r * 0.85, cy - r * 0.2);
  ctx.lineTo(cx + r * 0.1, cy - r * 0.85);
  ctx.lineTo(cx + r * 0.1, cy - r * 0.42);
  ctx.quadraticCurveTo(cx - r * 0.85, cy - r * 0.35, cx - r * 0.85, cy + r * 0.75);
  ctx.quadraticCurveTo(cx - r * 0.4, cy + r * 0.08, cx + r * 0.1, cy + r * 0.08);
  ctx.lineTo(cx + r * 0.1, cy + r * 0.5);
  ctx.closePath();
  ctx.fill();
}

function drawSafeZoneOverlay(
  ctx: CanvasRenderingContext2D,
  spec: PlatformSpec,
  veilOpacity: number,
  showMockUi: boolean,
  showGridCrop: boolean,
) {
  const W = 1080;
  const H = 1920;
  const safeX = spec.leftPx;
  const safeY = spec.topPx;
  const safeW = W - spec.leftPx - spec.rightPx;
  const safeH = H - spec.topPx - spec.bottomPx;

  // 1. Red danger zone tint outside the safe rectangle
  ctx.save();
  ctx.fillStyle = `rgba(220, 38, 38, ${(veilOpacity / 100).toFixed(2)})`;
  ctx.fillRect(0, 0, W, safeY);
  ctx.fillRect(0, safeY + safeH, W, H - (safeY + safeH));
  ctx.fillRect(0, safeY, safeX, safeH);
  ctx.fillRect(safeX + safeW, safeY, W - (safeX + safeW), safeH);
  ctx.restore();

  // 2. Crisp emerald safe-zone dashed boundary + clear explanatory badge
  ctx.save();
  ctx.strokeStyle = "#34D399";
  ctx.lineWidth = 6;
  ctx.setLineDash([18, 12]);
  ctx.strokeRect(safeX + 3, safeY + 3, safeW - 6, safeH - 6);
  ctx.setLineDash([]);

  const badgeText = `✓ SAFE ZONE FOR TITLES & SUBTITLES (${safeW}×${safeH})`;
  ctx.font = "700 22px system-ui, -apple-system, sans-serif";
  const tw = Math.min(safeW - 24, ctx.measureText(badgeText).width + 32);
  ctx.fillStyle = "rgba(6, 78, 59, 0.94)";
  ctx.beginPath();
  ctx.roundRect(safeX + 14, safeY + 14, tw, 46, 12);
  ctx.fill();
  ctx.fillStyle = "#6EE7B7";
  ctx.textBaseline = "middle";
  ctx.fillText(badgeText, safeX + 30, safeY + 37, tw - 30);
  ctx.restore();

  // 3. Optional 3:4 Profile Grid Crop lines (centered 1080 × 1440 inside 1080 × 1920 -> Y: 240..1680)
  if (showGridCrop) {
    const gridTop = 240;
    const gridBottom = 1680;
    ctx.save();
    ctx.strokeStyle = "#38BDF8";
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(0, gridTop);
    ctx.lineTo(W, gridTop);
    ctx.moveTo(0, gridBottom);
    ctx.lineTo(W, gridBottom);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(12, 74, 110, 0.92)";
    ctx.beginPath();
    ctx.roundRect(safeX + 14, gridTop + 12, 360, 38, 8);
    ctx.fill();
    ctx.fillStyle = "#7DD3FC";
    ctx.font = "700 20px system-ui, -apple-system, sans-serif";
    ctx.textBaseline = "middle";
    ctx.fillText("IG 3:4 Profile Grid Crop (Y: 240–1680)", safeX + 28, gridTop + 31);
    ctx.restore();
  }

  // 4. Recognizable TikTok / Reels / Shorts App UI Overlay (status bar, header, right buttons, bottom handle & caption!)
  if (showMockUi) {
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
    ctx.shadowBlur = 8;

    // Phone status bar (9:41 + signal/battery)
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.font = "700 28px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("9:41", 64, 58);
    // Dynamic island pill
    ctx.fillStyle = "#09090B";
    ctx.beginPath();
    ctx.roundRect(410, 26, 260, 48, 24);
    ctx.fill();
    // Battery icon right
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 3;
    ctx.strokeRect(950, 36, 54, 26);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(955, 41, 38, 16);

    // Top app navigation bar
    ctx.font = "700 34px system-ui, -apple-system, sans-serif";
    if (spec.id === "reels" || spec.id === "shorts") {
      ctx.textAlign = "left";
      ctx.fillText(spec.headerText, 56, 146);
    } else {
      ctx.textAlign = "center";
      ctx.fillText(spec.headerText, W / 2, 146);
    }
    // Search icon top-right
    ctx.beginPath();
    ctx.arc(992, 134, 18, 0, Math.PI * 2);
    ctx.lineWidth = 4.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(1005, 147);
    ctx.lineTo(1020, 162);
    ctx.stroke();

    // Right-side engagement button stack (Avatar, Heart, Comment, Bookmark, Share, Audio Disc)
    const iconX = W - Math.max(76, spec.rightPx / 2);

    // Creator Avatar + red follow '+'
    ctx.beginPath();
    ctx.arc(iconX, 900, 44, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#FFFFFF";
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(iconX, 944, 16, 0, Math.PI * 2);
    ctx.fillStyle = "#EF4444";
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "800 22px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("+", iconX, 945);

    // Heart + 24.8K
    ctx.fillStyle = "#FFFFFF";
    drawHeartIcon(ctx, iconX, 1065, 32);
    ctx.font = "700 23px system-ui, -apple-system, sans-serif";
    ctx.fillText("24.8K", iconX, 1122);

    // Comment + 342
    drawCommentIcon(ctx, iconX, 1220, 30);
    ctx.fillText("342", iconX, 1276);

    // Bookmark + 4.1K
    ctx.beginPath();
    ctx.moveTo(iconX - 22, 1345);
    ctx.lineTo(iconX + 22, 1345);
    ctx.lineTo(iconX + 22, 1402);
    ctx.lineTo(iconX, 1384);
    ctx.lineTo(iconX - 22, 1402);
    ctx.closePath();
    ctx.fill();
    ctx.fillText("4.1K", iconX, 1432);

    // Share + label
    drawShareArrow(ctx, iconX, 1520, 30);
    ctx.fillText("Share", iconX, 1574);

    // Spinning Audio Disc at bottom right
    ctx.beginPath();
    ctx.arc(iconX, 1715, 38, 0, Math.PI * 2);
    ctx.fillStyle = "#18181B";
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(iconX, 1715, 13, 0, Math.PI * 2);
    ctx.fillStyle = "#F59E0B";
    ctx.fill();

    // Bottom Creator Handle + Follow Pill + Video Caption + Audio Bar
    const botStart = H - spec.bottomPx + 82;
    ctx.textAlign = "left";
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "800 34px system-ui, -apple-system, sans-serif";
    ctx.fillText("@barista.daily", 52, botStart);

    // Follow pill
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(308, botStart - 24, 118, 46, 12);
    ctx.stroke();
    ctx.font = "700 22px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Follow", 367, botStart - 1);

    // 2-line video description
    ctx.textAlign = "left";
    ctx.font = "500 27px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.94)";
    ctx.fillText("Dialing in silky microfoam in 60s ☕✨", 52, botStart + 64);
    ctx.fillStyle = "rgba(255,255,255,0.78)";
    ctx.fillText("#latteart #creator #reels #vlog", 52, botStart + 106);

    // Scrolling Original Audio pill at bottom
    ctx.fillStyle = "rgba(9, 9, 11, 0.55)";
    ctx.beginPath();
    ctx.roundRect(48, H - 156, 510, 52, 26);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "600 23px system-ui, -apple-system, sans-serif";
    ctx.fillText("♫  Original Audio · Morning Cafe Session", 74, H - 130);

    // Home indicator bar at very bottom
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.beginPath();
    ctx.roundRect(360, H - 34, 360, 12, 6);
    ctx.fill();

    ctx.restore();
  }
}

export function SafeZoneCheckerV3() {
  const sampleLoadingRef = useRef(false);
  const autoDemoLoadingRef = useRef(false);
  const [isDemoSample, setIsDemoSample] = useState<boolean>(false);
  const tracking = useToolTracking("safe_zone", "frame", null);
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

  const [platform, setPlatform] = useState<SafeZonePlatformId>("reels");
  const [veilOpacity, setVeilOpacity] = useState<number>(36);
  const [showMockUi, setShowMockUi] = useState<boolean>(true);
  const [showGridCrop, setShowGridCrop] = useState<boolean>(false);
  const [fitMode, setFitMode] = useState<"cover" | "contain">("cover");

  const loadSample = (fromAutoDemo = false) => {
    void createSyntheticSampleFile("vertical-9x16").then(f => {
      sampleLoadingRef.current = true;
      autoDemoLoadingRef.current = fromAutoDemo;
      void readFile(f);
    });
  };

  // Auto-load the realistic creator latte video sample on initial browser mount so the tool's purpose is 100% obvious immediately!
  useEffect(() => {
    if (autoDemoRef.current) return;
    autoDemoRef.current = true;
    if (typeof navigator !== "undefined" && /jsdom/i.test(navigator.userAgent)) return;
    loadSample(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const spec = SAFE_ZONE_SPECS[platform];
  const safeW = 1080 - spec.leftPx - spec.rightPx;
  const safeH = 1920 - spec.topPx - spec.bottomPx;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, 1080, 1920);
    if (loaded) {
      ctx.fillStyle = "#09090B";
      ctx.fillRect(0, 0, 1080, 1920);
      const srcRatio = loaded.width / loaded.height;
      const dstRatio = 1080 / 1920;
      let dw = 1080;
      let dh = 1920;
      if (fitMode === "cover") {
        if (srcRatio > dstRatio) {
          dh = 1920;
          dw = 1920 * srcRatio;
        } else {
          dw = 1080;
          dh = 1080 / srcRatio;
        }
      } else {
        if (srcRatio > dstRatio) {
          dw = 1080;
          dh = 1080 / srcRatio;
        } else {
          dh = 1920;
          dw = 1920 * srcRatio;
        }
      }
      ctx.drawImage(loaded.img, (1080 - dw) / 2, (1920 - dh) / 2, dw, dh);
    } else {
      const bg = ctx.createLinearGradient(0, 0, 1080, 1920);
      bg.addColorStop(0, "#1E293B");
      bg.addColorStop(0.5, "#334155");
      bg.addColorStop(1, "#0F172A");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 1080, 1920);

      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";
      ctx.font = "700 42px system-ui, -apple-system, sans-serif";
      ctx.fillText("Upload a 9:16 Video Frame", spec.leftPx + safeW / 2, 740);
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.font = "500 28px system-ui, -apple-system, sans-serif";
      ctx.fillText("See whether buttons or captions cover your text", spec.leftPx + safeW / 2, 805);
    }

    drawSafeZoneOverlay(ctx, spec, veilOpacity, showMockUi, showGridCrop);
  }, [loaded, spec, veilOpacity, showMockUi, showGridCrop, fitMode, safeW]);

  async function handleDownloadTransparentTemplate() {
    const off = document.createElement("canvas");
    off.width = 1080;
    off.height = 1920;
    const ctx = off.getContext("2d");
    if (!ctx) return;
    drawSafeZoneOverlay(ctx, spec, veilOpacity, showMockUi, showGridCrop);
    const blob = await new Promise<Blob | null>(r => off.toBlob(r, "image/png"));
    off.width = 0;
    off.height = 0;
    if (blob) {
      triggerBlobDownload(blob, `${spec.id}-safe-zone-guide-1080x1920.png`);
      trackingRef.current.imageExport("template");
    }
  }

  async function handleDownloadAnnotatedFrame() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, "image/png"));
    if (blob) {
      triggerBlobDownload(blob, `${spec.id}-safe-zone-preview-1080x1920.png`);
      trackingRef.current.imageExport("annotated");
    }
  }

  return (
    <section
      aria-label="9:16 Safe Zone Checker"
      className="mt-8 space-y-4"
      onDragOver={e => e.preventDefault()}
      onDrop={e => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
          sampleLoadingRef.current = false;
          void readFile(file);
        }
      }}
      data-testid="safe-zone-checker"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        className="sr-only"
        aria-label="Upload 9:16 cover or frame"
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
        chooseLabel="Upload 9:16 frame"
        replaceLabel="Replace frame"
        onChooseFile={() => fileInputRef.current?.click()}
        onTrySample={() => loadSample(false)}
        onClear={() => {
          setIsDemoSample(false);
          clearImage();
        }}
        uploadTestId="safe-upload-btn"
        sampleTestId="safe-try-sample"
      />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22.5rem]">
        {/* Left Self-Explanatory Phone Preview Stage */}
        <div className="v2-stage-card min-h-[24rem] justify-between gap-4 sm:min-h-[29rem]">
          {/* Instant Visual Legend */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 font-semibold text-emerald-700 dark:text-emerald-300">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Green Box = Safe for Subtitles &amp; Titles
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 font-semibold text-red-700 dark:text-red-300">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              Red Edges = Blocked by App Buttons &amp; Captions
            </span>
          </div>

          {!loaded && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={reading}
                className="v2-btn v2-btn--primary v2-btn--sm"
                data-testid="safe-upload-btn"
              >
                <ImagePlus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Upload 9:16 image</span>
              </Button>
              <Button
                onClick={() => loadSample(false)}
                disabled={reading}
                className="v2-btn v2-btn--outline v2-btn--sm"
                data-testid="safe-try-sample"
              >
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Try sample</span>
              </Button>
            </div>
          )}

          <div className="relative w-full max-w-[336px] overflow-hidden rounded-[32px] border-[6px] border-zinc-900 bg-zinc-950 shadow-2xl dark:border-zinc-700">
            <canvas
              ref={canvasRef}
              className="block h-auto w-full"
              style={{ aspectRatio: "9 / 16" }}
              data-testid="safe-zone-canvas"
            />
          </div>

          <p className="max-w-md text-center text-xs text-muted-foreground">
            {isDemoSample
              ? "Showing sample creator video: notice how the top yellow title stays clear inside the green Safe Zone, while the bottom subtitle gets covered by @barista.daily and captions!"
              : loaded
                ? `${loaded.name} (${loaded.width} × ${loaded.height} px) · Keep all burned-in subtitles inside the green dashed rectangle.`
                : "Upload a screenshot from your video editor to check whether TikTok, Reels, or Shorts buttons will block your text."}
          </p>
          {inputError && (
            <p role="alert" className="text-xs font-medium text-destructive">
              {inputError}
            </p>
          )}
        </div>

        {/* Right Controls Panel */}
        <div className="v2-panel space-y-5">
          <div className="space-y-2">
            <span className="block text-xs font-semibold text-muted-foreground">
              Platform overlay
            </span>
            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Target vertical video platform">
              {(["reels", "tiktok", "shorts", "universal"] as const).map(id => {
                const item = SAFE_ZONE_SPECS[id];
                const active = item.id === platform;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      trackingRef.current.preset(item.id);
                      setPlatform(item.id);
                    }}
                    className={`rounded-lg border px-3 py-2 text-left text-xs font-semibold transition ${
                      active
                        ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary/30"
                        : "border-border bg-background text-muted-foreground hover:text-foreground"
                    }`}
                    data-testid={`safe-platform-${item.id}`}
                  >
                    <div>{item.shortLabel}</div>
                    <div className="num mt-0.5 text-[11px] font-normal opacity-75">
                      Safe {1080 - item.leftPx - item.rightPx}×{1920 - item.topPx - item.bottomPx}
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">{spec.note}</p>
          </div>

          <div className="space-y-3.5 border-t border-border pt-4">
            <span className="block text-xs font-semibold text-muted-foreground">
              Framing &amp; overlay guides
            </span>

            {loaded && (
              <SegmentedControl
                aria-label="Frame scaling"
                value={fitMode}
                onValueChange={v => {
                  if (v === "cover" || v === "contain") setFitMode(v);
                }}
                className="v2-seg v2-seg--sm w-full"
              >
                <SegmentedControlIndicator className="v2-seg-indicator" />
                <SegmentedControlItem value="cover" className="v2-seg-item flex-1">
                  Fill 9:16
                </SegmentedControlItem>
                <SegmentedControlItem value="contain" className="v2-seg-item flex-1">
                  Fit full image
                </SegmentedControlItem>
              </SegmentedControl>
            )}

            <Field>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <FieldLabel className="font-medium text-foreground">Red UI danger tint</FieldLabel>
                <span className="num text-muted-foreground">{veilOpacity}%</span>
              </div>
              <Slider
                min={10}
                max={80}
                step={5}
                value={veilOpacity}
                onValueChange={setVeilOpacity}
              >
                <SliderControl>
                  <SliderTrack>
                    <SliderIndicator />
                    <SliderThumb aria-label="Red UI danger tint" />
                  </SliderTrack>
                </SliderControl>
              </Slider>
            </Field>

            <Field className="flex items-center justify-between gap-3">
              <FieldLabel className="text-xs font-medium text-foreground">
                Show Like buttons, username &amp; caption overlay
              </FieldLabel>
              <Switch checked={showMockUi} onCheckedChange={setShowMockUi}>
                <SwitchThumb />
              </Switch>
            </Field>

            <Field className="flex items-center justify-between gap-3">
              <FieldLabel className="text-xs font-medium text-foreground">
                Show Instagram 3:4 profile cover crop
              </FieldLabel>
              <Switch checked={showGridCrop} onCheckedChange={setShowGridCrop}>
                <SwitchThumb />
              </Switch>
            </Field>
          </div>

          {/* Pixel Coordinate Readout */}
          <div className="rounded-xl border border-border bg-muted/40 p-3 text-xs">
            <p className="font-semibold text-foreground">
              {spec.label} Safe Margins (on 1080 × 1920)
            </p>
            <div className="num mt-2 grid grid-cols-2 gap-1.5 text-[11px] text-muted-foreground">
              <span>Top: {spec.topPx} px</span>
              <span>Bottom: {spec.bottomPx} px</span>
              <span>Left: {spec.leftPx} px</span>
              <span>Right: {spec.rightPx} px</span>
            </div>
            <p className="num mt-2 border-t border-border pt-1.5 font-semibold text-foreground">
              Safe area: {safeW} × {safeH} px
            </p>
          </div>

          {/* Dual Export Actions */}
          <div className="space-y-2 border-t border-border pt-4">
            <Button
              onClick={() => void handleDownloadTransparentTemplate()}
              className="v2-btn v2-btn--primary h-auto min-h-10 w-full justify-center px-3 py-2 text-center text-xs leading-snug whitespace-normal"
              data-testid="safe-download-guide"
            >
              <Layers className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Download Transparent Guide PNG</span>
            </Button>
            <Button
              onClick={() => void handleDownloadAnnotatedFrame()}
              className="v2-btn h-auto min-h-10 w-full justify-center py-2 text-center text-xs leading-snug whitespace-normal"
              data-testid="safe-download-preview"
            >
              <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Save Preview Image</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
