"use client";

import { Button } from "@ui-sdk/react/button";
import { Field, FieldLabel } from "@ui-sdk/react/field";
import { Input } from "@ui-sdk/react/input";
import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control";
import { Switch, SwitchThumb } from "@ui-sdk/react/switch";
import { AlertTriangle, CheckCircle2, Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useToolTracking } from "@/lib/tool-analytics";
import { V3StageEmptyDropzone, V3ToolFileBar } from "./V3ToolFileBar";
import {
  createSyntheticSampleFile,
  triggerBlobDownload,
  useLocalToolImage,
} from "./useLocalToolImage";

export function OgSafeZonePreviewerV3() {
  const sampleLoadingRef = useRef(false);
  const autoDemoLoadingRef = useRef(false);
  const [isDemoSample, setIsDemoSample] = useState<boolean>(false);
  const tracking = useToolTracking("og_safe_zone", "frame", null);
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
  const masterCanvasRef = useRef<HTMLCanvasElement>(null);
  const autoDemoRef = useRef(false);

  const [siteDomain, setSiteDomain] = useState<string>("travelnotes.co");
  const [cardTitle, setCardTitle] = useState<string>(
    "Amalfi Coast 7-Day Itinerary & Best Beaches",
  );
  const [cardDesc, setCardDesc] = useState<string>(
    "Plan a week from Positano to Ravello with ferry schedules, cliffside cafes, and photo spots.",
  );
  const [fitMode, setFitMode] = useState<"cover" | "contain">("cover");
  const [showSafeGuides, setShowSafeGuides] = useState<boolean>(true);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>("");

  const loadSample = (fromAutoDemo = false) => {
    void createSyntheticSampleFile("og-1200x630").then(f => {
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

  // Render clean 1200×630 card buffer + overlaid master inspector canvas
  useEffect(() => {
    const clean = document.createElement("canvas");
    clean.width = 1200;
    clean.height = 630;
    const cctx = clean.getContext("2d");
    if (!cctx) return;

    cctx.fillStyle = "#09090B";
    cctx.fillRect(0, 0, 1200, 630);
    if (loaded) {
      const srcR = loaded.width / loaded.height;
      const dstR = 1200 / 630;
      let dw = 1200;
      let dh = 630;
      if (fitMode === "cover") {
        if (srcR > dstR) {
          dh = 630;
          dw = 630 * srcR;
        } else {
          dw = 1200;
          dh = 1200 / srcR;
        }
      } else {
        if (srcR > dstR) {
          dw = 1200;
          dh = 1200 / srcR;
        } else {
          dh = 630;
          dw = 630 * srcR;
        }
      }
      cctx.imageSmoothingEnabled = true;
      cctx.imageSmoothingQuality = "high";
      cctx.drawImage(loaded.img, (1200 - dw) / 2, (630 - dh) / 2, dw, dh);
    } else {
      const grad = cctx.createLinearGradient(0, 0, 1200, 630);
      grad.addColorStop(0, "#0F172A");
      grad.addColorStop(0.55, "#1E3A8A");
      grad.addColorStop(1, "#0F766E");
      cctx.fillStyle = grad;
      cctx.fillRect(0, 0, 1200, 630);
      cctx.fillStyle = "#FFFFFF";
      cctx.textAlign = "center";
      cctx.font = "800 54px system-ui, -apple-system, sans-serif";
      cctx.fillText("1200 × 630 Open Graph Canvas", 600, 295);
      cctx.fillStyle = "rgba(255,255,255,0.72)";
      cctx.font = "500 28px system-ui, -apple-system, sans-serif";
      cctx.fillText("Keep logos & headlines inside the center 630×630 square", 600, 355);
    }

    setPreviewDataUrl(clean.toDataURL("image/jpeg", 0.88));

    const master = masterCanvasRef.current;
    if (master) {
      master.width = 1200;
      master.height = 630;
      const mctx = master.getContext("2d");
      if (mctx) {
        mctx.drawImage(clean, 0, 0);
        if (showSafeGuides) {
          // Left & right wings outside center 630×630 square (285 px on each side!) cropped by WhatsApp 1:1 thumbnail!
          mctx.save();
          mctx.fillStyle = "rgba(239, 68, 68, 0.32)";
          mctx.fillRect(0, 0, 285, 630);
          mctx.fillRect(1200 - 285, 0, 285, 630);

          // Center 630×630 WhatsApp 1:1 Safe Box + inner 48px title margin
          mctx.strokeStyle = "#34D399";
          mctx.lineWidth = 4;
          mctx.setLineDash([14, 10]);
          mctx.strokeRect(285, 4, 630, 622);
          mctx.setLineDash([]);

          // Label pills
          mctx.fillStyle = "rgba(6, 78, 59, 0.92)";
          mctx.beginPath();
          mctx.roundRect(305, 18, 430, 38, 8);
          mctx.fill();
          mctx.fillStyle = "#6EE7B7";
          mctx.font = "700 20px ui-monospace, monospace";
          mctx.textBaseline = "middle";
          mctx.fillText("WHATSAPP 1:1 SAFE SQUARE (630×630)", 320, 37);

          // X / Twitter bottom-left domain badge exclusion zone
          mctx.fillStyle = "rgba(24, 24, 27, 0.82)";
          mctx.beginPath();
          mctx.roundRect(24, 566, 220, 40, 8);
          mctx.fill();
          mctx.fillStyle = "#E4E4E7";
          mctx.font = "600 18px system-ui, sans-serif";
          mctx.fillText(`X badge: ${siteDomain || "domain.com"}`, 38, 586);
          mctx.restore();
        }
      }
    }
    clean.width = 0;
    clean.height = 0;
  }, [loaded, fitMode, showSafeGuides, siteDomain]);

  async function renderClean1200x630Canvas(): Promise<HTMLCanvasElement> {
    const off = document.createElement("canvas");
    off.width = 1200;
    off.height = 630;
    const ctx = off.getContext("2d")!;
    ctx.fillStyle = "#09090B";
    ctx.fillRect(0, 0, 1200, 630);
    if (loaded) {
      const srcR = loaded.width / loaded.height;
      const dstR = 1200 / 630;
      let dw = 1200;
      let dh = 630;
      if (fitMode === "cover") {
        if (srcR > dstR) {
          dh = 630;
          dw = 630 * srcR;
        } else {
          dw = 1200;
          dh = 1200 / srcR;
        }
      } else {
        if (srcR > dstR) {
          dw = 1200;
          dh = 1200 / srcR;
        } else {
          dh = 630;
          dw = 630 * srcR;
        }
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(loaded.img, (1200 - dw) / 2, (630 - dh) / 2, dw, dh);
    }
    return off;
  }

  async function handleExportWhatsappSafeJpg() {
    if (!loaded) return;
    const off = await renderClean1200x630Canvas();
    // Step down quality until guaranteed < 280 KB for WhatsApp mobile link preview reliability
    let bestBlob: Blob | null = null;
    for (const q of [0.9, 0.82, 0.74, 0.65, 0.55]) {
      const candidate = await new Promise<Blob | null>(r => off.toBlob(r, "image/jpeg", q));
      if (candidate) {
        bestBlob = candidate;
        if (candidate.size <= 280 * 1024) break;
      }
    }
    off.width = 0;
    off.height = 0;
    if (bestBlob) {
      triggerBlobDownload(bestBlob, "og-image-1200x630-whatsapp-safe.jpg");
      trackingRef.current.imageExport("jpg");
    }
  }

  async function handleExportLosslessPng() {
    if (!loaded) return;
    const off = await renderClean1200x630Canvas();
    const blob = await new Promise<Blob | null>(r => off.toBlob(r, "image/png"));
    off.width = 0;
    off.height = 0;
    if (blob) {
      triggerBlobDownload(blob, "og-image-1200x630.png");
      trackingRef.current.imageExport("png");
    }
  }

  const kb = loaded ? Math.round(loaded.byteSize / 1024) : null;
  const whatsappSizeOk = kb !== null && kb <= 300;
  const exactSizeOk = loaded ? loaded.width === 1200 && loaded.height === 630 : false;

  return (
    <section
      aria-label="Open Graph Image Safe Zone and Platform Crop Previewer"
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
      data-testid="og-safe-zone-previewer"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        className="sr-only"
        aria-label="Upload local Open Graph image"
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
        uploadTestId="og-upload-btn"
        sampleTestId="og-try-sample"
      />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22.5rem]">
        {/* Left Master Safe-Zone Canvas + Live 4-Platform Feed Previews */}
        <div className="min-w-0 space-y-5">
          {!loaded ? (
            <div className="v2-stage-card min-h-[24rem] sm:min-h-[29rem]">
              <V3StageEmptyDropzone
                reading={reading}
                inputError={inputError}
                prompt="Drop or paste your local og:image here"
                hint="Preview WhatsApp 1:1 square crops, X domain badges, LinkedIn cards & <300 KB weight"
                onChooseFile={() => fileInputRef.current?.click()}
                onTrySample={() => loadSample(false)}
                uploadTestId="og-upload-btn"
                sampleTestId="og-try-sample"
              />
            </div>
          ) : (
            <>
              <div className="v2-stage-card items-stretch justify-start gap-2.5 p-4 sm:p-5">
                <p className="text-xs font-semibold text-foreground">
                  Master Safe-Zone Overlay (1200 × 630 px · 1.91:1 vs. Center 630 × 630 Square)
                </p>
                <canvas
                  ref={masterCanvasRef}
                  className="block h-auto w-full rounded-lg border border-border shadow-sm"
                  style={{ aspectRatio: "1200 / 630" }}
                  data-testid="og-master-canvas"
                />
                {inputError && (
                  <p role="alert" className="text-xs font-medium text-destructive">
                    {inputError}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* 1. WhatsApp Chat Square Thumbnail */}
                <div className="rounded-xl border border-border bg-card p-3.5">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    WhatsApp Compact Bubble (1:1 Crop)
                  </p>
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-2.5">
                    {previewDataUrl && (
                      <img
                        src={previewDataUrl}
                        alt="WhatsApp 1:1 square crop preview"
                        className="h-20 w-20 shrink-0 rounded-md object-cover object-center"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-xs font-semibold text-foreground">{cardTitle}</p>
                      <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">{cardDesc}</p>
                      <p className="mt-1 truncate text-[10px] text-muted-foreground">{siteDomain}</p>
                    </div>
                  </div>
                </div>

                {/* 2. X / Twitter Large Card */}
                <div className="rounded-xl border border-border bg-card p-3.5">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    X (Twitter) Large Summary Card (1.91:1)
                  </p>
                  <div className="relative overflow-hidden rounded-xl border border-border">
                    {previewDataUrl && (
                      <img
                        src={previewDataUrl}
                        alt="X large summary card preview"
                        className="aspect-[1200/630] w-full object-cover"
                      />
                    )}
                    <span className="absolute bottom-2 left-2 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      {siteDomain}
                    </span>
                  </div>
                </div>

                {/* 3. LinkedIn Feed Post */}
                <div className="rounded-xl border border-border bg-card p-3.5">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    LinkedIn Feed Link Card (1.91:1)
                  </p>
                  <div className="overflow-hidden rounded-lg border border-border">
                    {previewDataUrl && (
                      <img
                        src={previewDataUrl}
                        alt="LinkedIn card preview"
                        className="aspect-[1200/630] w-full object-cover"
                      />
                    )}
                    <div className="bg-muted/40 px-3 py-2">
                      <p className="line-clamp-1 text-xs font-semibold text-foreground">{cardTitle}</p>
                      <p className="text-[10px] text-muted-foreground">{siteDomain}</p>
                    </div>
                  </div>
                </div>

                {/* 4. Slack / Discord Unfurl */}
                <div className="rounded-xl border border-border bg-card p-3.5">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Discord / Slack Unfurl Embed
                  </p>
                  <div className="rounded-r-lg border-l-4 border-primary bg-muted/30 py-2 pl-3 pr-2">
                    <p className="text-[10px] font-medium text-muted-foreground">{siteDomain}</p>
                    <p className="line-clamp-1 text-xs font-semibold text-primary">{cardTitle}</p>
                    <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">{cardDesc}</p>
                    {previewDataUrl && (
                      <img
                        src={previewDataUrl}
                        alt="Slack and Discord embed preview"
                        className="mt-2 aspect-[1200/630] w-full rounded object-cover"
                      />
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Controls & Metadata Panel */}
        <div className="v2-panel space-y-4">
          {loaded && (
            <div className="space-y-1.5 rounded-xl border border-border bg-muted/40 p-3 text-xs">
              <div className="flex items-center gap-2">
                {exactSizeOk ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                )}
                <span className="num font-medium text-foreground">
                  {loaded.width} × {loaded.height} px{" "}
                  {exactSizeOk ? "(Exact 1200×630)" : "(Resized to 1200×630)"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {whatsappSizeOk ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                )}
                <span className="num text-muted-foreground">
                  File weight: <strong className="text-foreground">{kb} KB</strong>{" "}
                  {whatsappSizeOk
                    ? "(Under WhatsApp 300 KB limit)"
                    : "(Over 300 KB — export JPG below)"}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <span className="block text-xs font-semibold text-muted-foreground">
              Link preview details
            </span>
            <Field>
              <div className="flex items-center justify-between text-xs">
                <FieldLabel className="font-medium text-foreground">Website</FieldLabel>
                <span className="text-[11px] text-muted-foreground">Domain badge</span>
              </div>
              <Input
                value={siteDomain}
                placeholder="yourdomain.com"
                onChange={e => setSiteDomain(e.target.value)}
                data-testid="og-domain-input"
              />
            </Field>
            <Field>
              <div className="flex items-center justify-between text-xs">
                <FieldLabel className="font-medium text-foreground">Page title</FieldLabel>
                <span className="num text-[11px] text-muted-foreground">{cardTitle.length}/60</span>
              </div>
              <Input
                value={cardTitle}
                placeholder="Enter page title…"
                onChange={e => setCardTitle(e.target.value)}
                data-testid="og-title-input"
              />
            </Field>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="og-desc-textarea" className="font-medium text-foreground">
                  Description
                </label>
                <span className="num text-[11px] text-muted-foreground">{cardDesc.length}/155</span>
              </div>
              <textarea
                id="og-desc-textarea"
                rows={2}
                value={cardDesc}
                placeholder="Enter meta description…"
                onChange={e => setCardDesc(e.target.value)}
                className="v3-textarea"
                data-testid="og-desc-input"
              />
            </div>
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <span className="block text-xs font-semibold text-muted-foreground">
              Framing &amp; crop guides
            </span>
            <SegmentedControl
              aria-label="1200x630 fit mode"
              value={fitMode}
              onValueChange={v => {
                if (v === "cover" || v === "contain") setFitMode(v);
              }}
              className="v2-seg v2-seg--sm w-full"
            >
              <SegmentedControlIndicator className="v2-seg-indicator" />
              <SegmentedControlItem value="cover" className="v2-seg-item flex-1">
                Fill frame
              </SegmentedControlItem>
              <SegmentedControlItem value="contain" className="v2-seg-item flex-1">
                Fit whole image
              </SegmentedControlItem>
            </SegmentedControl>

            <Field className="flex items-center justify-between gap-2">
              <FieldLabel className="text-xs font-medium text-foreground">
                Show WhatsApp 1:1 &amp; X crop guides
              </FieldLabel>
              <Switch checked={showSafeGuides} onCheckedChange={setShowSafeGuides}>
                <SwitchThumb />
              </Switch>
            </Field>
          </div>

          <div className="space-y-2 border-t border-border pt-4">
            <Button
              disabled={!loaded}
              focusableWhenDisabled
              onClick={() => void handleExportWhatsappSafeJpg()}
              className="v2-btn v2-btn--primary h-auto min-h-10 w-full justify-center px-3 py-2 text-center text-xs leading-snug whitespace-normal"
              data-testid="og-export-whatsapp-jpg"
            >
              <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Export WhatsApp-Safe JPG (&lt;280 KB)</span>
            </Button>
            <Button
              disabled={!loaded}
              focusableWhenDisabled
              onClick={() => void handleExportLosslessPng()}
              className="v2-btn h-auto min-h-10 w-full justify-center py-2 text-center text-xs leading-snug whitespace-normal"
            >
              <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Export Crisp 1200×630 PNG</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
