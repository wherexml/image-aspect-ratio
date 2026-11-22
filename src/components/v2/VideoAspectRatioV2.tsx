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
import { ArrowLeftRight, Check, Copy } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  approxNumber,
  fmtInt,
  frac,
  isInteger,
  parsePositive,
  roundFrac,
  simplifyRatio,
  solve,
} from "@/lib/ratio";
import { copyTextSafe } from "@/lib/v2-clipboard";

type FitMode = "contain" | "cover";

const VIDEO_PRESETS = [
  { id: "16:9", label: "16:9", w: "16", h: "9", defaultW: "1920", defaultH: "1080" },
  { id: "9:16", label: "9:16", w: "9", h: "16", defaultW: "1080", defaultH: "1920" },
  { id: "21:9", label: "21:9", w: "21", h: "9", defaultW: "2520", defaultH: "1080" },
  { id: "4:3", label: "4:3", w: "4", h: "3", defaultW: "1440", defaultH: "1080" },
  { id: "4:5", label: "4:5", w: "4", h: "5", defaultW: "1080", defaultH: "1350" },
  { id: "1:1", label: "1:1", w: "1", h: "1", defaultW: "1080", defaultH: "1080" },
  { id: "2.39:1", label: "2.39:1", w: "239", h: "100", defaultW: "2048", defaultH: "858" },
] as const;

const RESOLUTION_SHORTCUTS = [
  { id: "720p", label: "720p", longEdge: 1280 },
  { id: "1080p", label: "1080p", longEdge: 1920 },
  { id: "1440p", label: "1440p", longEdge: 2560 },
  { id: "4k", label: "4K", longEdge: 3840 },
] as const;

const SCREENS = [
  { id: "display", w: 16, h: 9, title: "On a widescreen display", device: "monitor" as const, base: 310 },
  { id: "phone", w: 9, h: 16, title: "Same video on a vertical phone", device: "phone" as const, base: 236 },
] as const;

export function VideoAspectRatioV2() {
  const [srcW, setSrcW] = useState("1920");
  const [srcH, setSrcH] = useState("1080");
  const [fit, setFit] = useState<FitMode>("contain");

  const [knownSide, setKnownSide] = useState<"width" | "height">("width");
  const [targetPx, setTargetPx] = useState("1920");
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    },
    [],
  );

  const pw = useMemo(() => parsePositive(srcW), [srcW]);
  const ph = useMemo(() => parsePositive(srcH), [srcH]);

  const sourceInfo = useMemo(() => {
    if (!pw.ok || !ph.ok) return null;
    const [a, b] = simplifyRatio(pw.value, ph.value);
    const ar = approxNumber(pw.value) / Math.max(1e-9, approxNumber(ph.value));
    const ratioText = a <= 999n && b <= 999n ? `${a}:${b}` : `${ar.toFixed(2)}:1`;
    const matched = VIDEO_PRESETS.find(
      p => a * BigInt(p.h) === b * BigInt(p.w),
    );
    return {
      a,
      b,
      rw: frac(a),
      rh: frac(b),
      ar,
      ratioText,
      matchedId: matched?.id ?? "",
    };
  }, [pw, ph]);

  const parsedTarget = useMemo(() => parsePositive(targetPx), [targetPx]);

  const solvedTarget = useMemo(() => {
    if (!sourceInfo || !parsedTarget.ok) return null;
    const otherSide = knownSide === "width" ? "height" : "width";
    const solved = solve(sourceInfo.rw, sourceInfo.rh, parsedTarget.value, otherSide);
    const roundedOther = roundFrac(solved);
    const roundedKnown = roundFrac(parsedTarget.value);
    const outW = knownSide === "width" ? roundedKnown : roundedOther;
    const outH = knownSide === "width" ? roundedOther : roundedKnown;
    return {
      width: outW,
      height: outH,
      exact: isInteger(solved) && isInteger(parsedTarget.value),
      copy: `${outW} × ${outH}`,
      formatted: `${fmtInt(outW)} × ${fmtInt(outH)} px`,
    };
  }, [sourceInfo, parsedTarget, knownSide]);

  const handleSelectPreset = useCallback((id: string | null) => {
    if (!id) return;
    const preset = VIDEO_PRESETS.find(p => p.id === id);
    if (!preset) return;
    setCopied(false);
    setSrcW(preset.defaultW);
    setSrcH(preset.defaultH);
    const isPortrait = Number(preset.w) < Number(preset.h);
    setKnownSide(isPortrait ? "height" : "width");
    setTargetPx(isPortrait ? preset.defaultH : preset.defaultW);
  }, []);

  const applyResolutionShortcut = useCallback(
    (longEdge: number) => {
      setCopied(false);
      if (sourceInfo && sourceInfo.ar < 1) {
        setKnownSide("height");
      } else {
        setKnownSide("width");
      }
      setTargetPx(String(longEdge));
    },
    [sourceInfo],
  );

  const handleCopy = useCallback(async () => {
    if (!solvedTarget) return;
    if (await copyTextSafe(solvedTarget.copy)) {
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 1800);
    }
  }, [solvedTarget]);

  return (
    <section
      aria-label="Video aspect ratio simulator"
      className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_23.5rem]"
    >
      <div className="order-2 space-y-3 lg:order-1">
        <div className="grid gap-4 sm:grid-cols-2">
          {SCREENS.map(({ id, w, h, title, device, base }) => {
            const target = w / h;
            const ratio = sourceInfo?.ar ?? null;
            const exact = Boolean(
              pw.ok &&
                ph.ok &&
                pw.value.n * ph.value.d * BigInt(h) === ph.value.n * pw.value.d * BigInt(w),
            );
            const isWide = ratio !== null && ratio > target;
            const cw = !ratio || (fit === "contain" ? isWide : !isWide) ? 100 : (ratio / target) * 100;
            const ch = !ratio || (fit === "contain" ? !isWide : isWide) ? 100 : (target / ratio) * 100;
            const empty = Boolean(ratio && !exact && fit === "contain");
            const emptyPercent = (100 - (isWide ? ch : cw)) / 2;
            const visible = ratio ? Math.min(ratio / target, target / ratio) * 100 : 0;

            const summary = !ratio
              ? "Enter valid dimensions"
              : exact
                ? "Exact fit · no empty space or crop"
                : fit === "contain"
                  ? `Whole video visible · ${isWide ? "space above & below" : "space on both sides"}`
                  : `Fills screen · ${isWide ? "left & right" : "top & bottom"} cropped`;

            const detail = !ratio
              ? "Waiting for positive width & height."
              : exact
                ? "Source and screen have the same ratio."
                : fit === "contain"
                  ? `No cropping · ${Math.min(99.9, visible).toFixed(1)}% of screen covered`
                  : `${Math.min(99.9, visible).toFixed(1)}% of source area visible`;

            return (
              <article
                key={id}
                className="mp-card mp-card--video"
                aria-label={`${title} ${w}:${h}`}
                data-testid={`v2-sim-${id}`}
              >
                <header className="mp-card-head">
                  <h3 className="text-[13px] font-semibold text-foreground">{title}</h3>
                  <span className="v2-mp-chip num">
                    {w}:{h}
                  </span>
                </header>

                <div className="mp-stage">
                  <div className={`mp-device mp-device--${device}`} style={{ maxWidth: "100%" }}>
                    <div
                      className="mp-frame"
                      style={{
                        width: Math.min(base, base * target),
                        aspectRatio: `${w}/${h}`,
                        maxWidth: "100%",
                      }}
                    >
                      <div
                        className="mp-screen"
                        role="group"
                        aria-label={`${w}:${h} screen: ${summary}`}
                      >
                        {empty &&
                          [0, 1].map(side => (
                            <div
                              key={side}
                              className="mp-empty"
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

                        {ratio && (
                          <div
                            className="mp-source"
                            style={{ width: `${cw}%`, height: `${ch}%` }}
                          >
                            <span className="num">{sourceInfo?.ratioText}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="v2-mp-foot">
                  <p className="text-xs font-semibold text-foreground">{summary}</p>
                  <p className="text-xs text-muted-foreground">{detail}</p>
                </div>
              </article>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground">
          Uses pixel dimensions with square pixels. No video upload or transcoding.
        </p>
      </div>

      <div className="v2-panel order-1 space-y-4 lg:order-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Screen fitting</span>
            <span
              className="v2-mp-chip num"
              data-testid="v2-video-ratio-badge"
            >
              {sourceInfo ? sourceInfo.ratioText : "—"}
            </span>
          </div>

          <SegmentedControl
            aria-label="Screen fitting"
            value={fit}
            onValueChange={val => {
              if (val === "contain" || val === "cover") setFit(val);
            }}
            className="v2-seg v2-seg--block"
            data-testid="v2-video-mode-control"
          >
            <SegmentedControlIndicator className="v2-seg-indicator" />
            <SegmentedControlItem
              value="contain"
              className="v2-seg-item"
              data-testid="v2-video-mode-fit"
            >
              Fit · keep all
            </SegmentedControlItem>
            <SegmentedControlItem
              value="cover"
              className="v2-seg-item"
              data-testid="v2-video-mode-fill"
            >
              Fill · crop
            </SegmentedControlItem>
          </SegmentedControl>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground" id="v2-vid-presets-lbl">
              Source format
            </span>
            <Button
              aria-label="Swap video orientation"
              onClick={() => {
                setCopied(false);
                setSrcW(srcH);
                setSrcH(srcW);
              }}
              className="v2-icon-btn !h-7 !w-7"
            >
              <ArrowLeftRight aria-hidden="true" className="h-3.5 w-3.5" />
            </Button>
          </div>

          <RadioGroup
            aria-labelledby="v2-vid-presets-lbl"
            value={sourceInfo?.matchedId ?? ""}
            onValueChange={handleSelectPreset}
            className="grid grid-cols-4 gap-1.5"
          >
            {VIDEO_PRESETS.map(p => (
              <Radio
                key={p.id}
                value={p.id}
                className="v2-pill-radio num"
                data-testid={`v2-video-opt-${p.id}`}
              >
                {p.label}
              </Radio>
            ))}
          </RadioGroup>

          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-2 pt-1">
            <Field className="v2-field" invalid={!pw.ok}>
              <FieldLabel className="v2-field-label">Width (px)</FieldLabel>
              <div className="v2-input-box">
                <Input
                  inputMode="decimal"
                  autoComplete="off"
                  value={srcW}
                  aria-invalid={!pw.ok}
                  onValueChange={val => {
                    setCopied(false);
                    setSrcW(val);
                  }}
                  className="v2-input num"
                  data-testid="v2-video-src-w"
                />
              </div>
            </Field>
            <span className="pb-2 font-display text-base font-bold text-muted-foreground" aria-hidden="true">
              ×
            </span>
            <Field className="v2-field" invalid={!ph.ok}>
              <FieldLabel className="v2-field-label">Height (px)</FieldLabel>
              <div className="v2-input-box">
                <Input
                  inputMode="decimal"
                  autoComplete="off"
                  value={srcH}
                  aria-invalid={!ph.ok}
                  onValueChange={val => {
                    setCopied(false);
                    setSrcH(val);
                  }}
                  className="v2-input num"
                  data-testid="v2-video-src-h"
                />
              </div>
            </Field>
          </div>
        </div>

        <div className="space-y-2.5 border-t border-border pt-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Scale export size</span>
            <SegmentedControl
              aria-label="Known export side"
              value={knownSide}
              onValueChange={val => {
                if (val === "width" || val === "height") {
                  setCopied(false);
                  setKnownSide(val);
                }
              }}
              className="v2-seg v2-seg--sm"
            >
              <SegmentedControlIndicator className="v2-seg-indicator" />
              <SegmentedControlItem value="width" className="v2-seg-item">
                Width
              </SegmentedControlItem>
              <SegmentedControlItem value="height" className="v2-seg-item">
                Height
              </SegmentedControlItem>
            </SegmentedControl>
          </div>

          <Field className="v2-field" invalid={!parsedTarget.ok}>
            <FieldLabel className="v2-field-label">
              {knownSide === "width" ? "Target width (px)" : "Target height (px)"}
            </FieldLabel>
            <div className="v2-input-box">
              <Input
                inputMode="decimal"
                autoComplete="off"
                value={targetPx}
                aria-invalid={!parsedTarget.ok}
                onValueChange={val => {
                  setCopied(false);
                  setTargetPx(val);
                }}
                className="v2-input num"
                data-testid="v2-video-target-px"
              />
              <span className="v2-readout-unit num" aria-hidden="true">
                px
              </span>
            </div>
          </Field>

          <div className="grid grid-cols-4 gap-1.5">
            {RESOLUTION_SHORTCUTS.map(res => (
              <button
                key={res.id}
                type="button"
                onClick={() => applyResolutionShortcut(res.longEdge)}
                className="v2-chip-btn num"
                data-testid={`v2-video-res-${res.id}`}
              >
                {res.label}
              </button>
            ))}
          </div>

          <div
            className="v2-result-box flex items-center justify-between gap-3"
            aria-live="polite"
            data-testid="v2-video-solved-summary"
          >
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {solvedTarget ? (solvedTarget.exact ? "Scaled frame · exact" : "Scaled frame · rounded") : "Scaled frame"}
              </p>
              <p className="num mt-0.5 text-lg font-bold text-foreground">
                {solvedTarget ? solvedTarget.formatted : "—"}
              </p>
            </div>

            <Button
              disabled={!solvedTarget}
              focusableWhenDisabled
              onClick={() => void handleCopy()}
              className="v2-btn v2-btn--primary v2-btn--sm shrink-0"
              data-testid="v2-video-copy"
            >
              {copied ? (
                <Check aria-hidden="true" className="h-3.5 w-3.5" />
              ) : (
                <Copy aria-hidden="true" className="h-3.5 w-3.5" />
              )}
              <span>{copied ? "Copied" : "Copy"}</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
