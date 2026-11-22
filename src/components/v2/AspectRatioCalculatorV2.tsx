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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  createTooltipController,
} from "@ui-sdk/react/tooltip";
import { ArrowLeftRight, Check, ChevronDown, Copy, RotateCcw } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  approxNumber,
  decimalString,
  fmtInt,
  frac,
  isInteger,
  mul,
  parsePositive,
  roundFrac,
  simplifyRatio,
  solve,
  type Frac,
} from "@/lib/ratio";
import { copyTextSafe } from "@/lib/v2-clipboard";

type CalcMode = "solve" | "identify" | "scale";
type KnownSide = "width" | "height";

export type CalculatorVariant = "all" | "16:9" | "ultrawide";

const GENERAL_PRESETS = [
  { id: "9:16", w: "9", h: "16", hint: "Vertical video" },
  { id: "2:3", w: "2", h: "3", hint: "Portrait photo" },
  { id: "3:4", w: "3", h: "4", hint: "Portrait" },
  { id: "4:5", w: "4", h: "5", hint: "Social post" },
  { id: "1:1", w: "1", h: "1", hint: "Square" },
  { id: "4:3", w: "4", h: "3", hint: "Classic" },
  { id: "3:2", w: "3", h: "2", hint: "Photo" },
  { id: "16:10", w: "16", h: "10", hint: "Laptop" },
  { id: "16:9", w: "16", h: "9", hint: "Widescreen" },
  { id: "5:4", w: "5", h: "4", hint: "Print" },
  { id: "2:1", w: "2", h: "1", hint: "Wide video" },
] as const;

const PRIMARY_PRESET_COUNT = 9;

const ULTRAWIDE_PRESETS = [
  { id: "uw-fhd", label: "2560 × 1080", rw: "64", rh: "27", origW: "2560", origH: "1080" },
  { id: "uwqhd", label: "3440 × 1440", rw: "43", rh: "18", origW: "3440", origH: "1440" },
  { id: "uw-3840", label: "3840 × 1600", rw: "12", rh: "5", origW: "3840", origH: "1600" },
  { id: "uw-5k2k", label: "5120 × 2160", rw: "64", rh: "27", origW: "5120", origH: "2160" },
  { id: "dqhd", label: "5120 × 1440", rw: "32", rh: "9", origW: "5120", origH: "1440" },
  { id: "strict", label: "Strict 21:9", rw: "21", rh: "9", origW: "", origH: "" },
] as const;

const KNOWN_RATIOS: readonly [number, number, string][] = [
  [16, 10, "16:10"],
  [16, 9, "16:9"],
  [9, 16, "9:16"],
  [4, 3, "4:3"],
  [3, 4, "3:4"],
  [3, 2, "3:2"],
  [2, 3, "2:3"],
  [1, 1, "1:1"],
  [21, 9, "21:9"],
  [32, 9, "32:9"],
  [4, 5, "4:5"],
  [5, 4, "5:4"],
  [2, 1, "2:1"],
  [2.39, 1, "2.39:1"],
];

const RES_SHORTCUTS = [
  { id: "720p", label: "720p", w: "1280", h: "720" },
  { id: "1080p", label: "1080p", w: "1920", h: "1080" },
  { id: "1440p", label: "1440p", w: "2560", h: "1440" },
  { id: "4k", label: "4K", w: "3840", h: "2160" },
] as const;

const SCALE_SHORTCUTS = [
  { label: "0.5×", factor: "0.5" },
  { label: "1.5×", factor: "1.5" },
  { label: "2×", factor: "2" },
  { label: "4×", factor: "4" },
] as const;

function Thumb({ w, h, active }: { w: number; h: number; active: boolean }) {
  const r = w / h;
  const bw = r >= 1 ? 24 : 24 * r;
  const bh = r >= 1 ? 24 / r : 24;
  return (
    <svg viewBox="0 0 30 30" className="h-7 w-7" aria-hidden="true">
      <rect
        x={15 - bw / 2}
        y={15 - bh / 2}
        width={bw}
        height={bh}
        rx="2"
        className={active ? "fill-primary/20 stroke-primary" : "fill-transparent stroke-current"}
        strokeWidth="1.6"
      />
    </svg>
  );
}

function compactDecimal(f: Frac): string {
  const scaled = roundFrac({ n: f.n * 100n, d: f.d });
  if (scaled === 0n && f.n > 0n) return "<0.01";
  const value = `${scaled / 100n}.${(scaled % 100n).toString().padStart(2, "0")}`.replace(
    /\.?0+$/,
    "",
  );
  return `${scaled * f.d === f.n * 100n ? "" : "≈"}${value}`;
}

function canvasRatioLabel(w: Frac, h: Frac): string {
  const [a, b] = simplifyRatio(w, h);
  if (["43:18", "64:27", "12:5"].includes(`${a}:${b}`)) return `${a}:${b}`;
  const exact = KNOWN_RATIOS.find(
    ([x, y]) => a * BigInt(Math.round(y * 100)) === b * BigInt(Math.round(x * 100)),
  );
  if (exact) return exact[2];
  const value = approxNumber({ n: a, d: b });
  const nearest = KNOWN_RATIOS.map(([x, y, label]) => ({
    label,
    diff: Math.abs(value / (x / y) - 1),
  })).sort((p, q) => p.diff - q.diff)[0]!;
  if (nearest.diff <= 0.03) return `Near ${nearest.label}`;
  if (a <= 100n && b <= 100n) return `${a}:${b}`;
  return `${compactDecimal({ n: a, d: b })}:1`;
}

export function AspectRatioCalculatorV2({
  variant = "all",
  externalPresetSignal,
}: {
  variant?: CalculatorVariant;
  externalPresetSignal?: { rw: string; rh: string; seq: number } | null;
}) {
  const [shellEl, setShellEl] = useState<HTMLElement | null>(null);
  const tooltip = useMemo(() => createTooltipController<string>(), []);

  const [mode, setMode] = useState<CalcMode>("solve");
  const [ultraPresetId, setUltraPresetId] = useState<string>("uwqhd");
  const [ratioW, setRatioW] = useState(variant === "ultrawide" ? "43" : "16");
  const [ratioH, setRatioH] = useState(variant === "ultrawide" ? "18" : "9");
  const [knownSide, setKnownSide] = useState<KnownSide>("width");
  const [knownPx, setKnownPx] = useState(variant === "ultrawide" ? "3440" : "1920");

  const [dimW, setDimW] = useState(variant === "ultrawide" ? "3440" : "1920");
  const [dimH, setDimH] = useState(variant === "ultrawide" ? "1440" : "1080");
  const [targetSide, setTargetSide] = useState<KnownSide>("width");
  const [targetPx, setTargetPx] = useState(variant === "ultrawide" ? "6880" : "3840");

  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const [workspaceWidth, setWorkspaceWidth] = useState(560);
  const dragActiveRef = useRef(false);

  useEffect(() => {
    if (!externalPresetSignal) return;
    setRatioW(externalPresetSignal.rw);
    setRatioH(externalPresetSignal.rh);
    setMode("solve");
  }, [externalPresetSignal]);

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

  const effectiveMode: CalcMode = variant === "all" ? mode : "solve";
  const effectiveRatioW = variant === "16:9" ? "16" : ratioW;
  const effectiveRatioH = variant === "16:9" ? "9" : ratioH;

  const pRW = parsePositive(effectiveMode === "scale" ? dimW : effectiveRatioW);
  const pRH = parsePositive(effectiveMode === "scale" ? dimH : effectiveRatioH);
  const activeKnownInput = effectiveMode === "scale" ? targetPx : knownPx;
  const activeKnownSide = effectiveMode === "scale" ? targetSide : knownSide;
  const pKnown = parsePositive(activeKnownInput);
  const pDW = parsePositive(dimW);
  const pDH = parsePositive(dimH);

  const matchedGeneralPresetId = useMemo(() => {
    if (!pRW.ok || !pRH.ok) return "";
    const [a, b] = simplifyRatio(pRW.value, pRH.value);
    const found = GENERAL_PRESETS.find(p => a * BigInt(p.h) === b * BigInt(p.w));
    return found ? found.id : "";
  }, [pRW, pRH]);

  const result = useMemo(() => {
    if (effectiveMode !== "identify") {
      if (!pRW.ok || !pRH.ok || !pKnown.ok) return null;
      const solveTarget = activeKnownSide === "width" ? "height" : "width";
      const out = solve(pRW.value, pRH.value, pKnown.value, solveTarget);
      const roundedOut = roundFrac(out);
      const roundedKnown = roundFrac(pKnown.value);
      const w = activeKnownSide === "width" ? pKnown.value : out;
      const h = activeKnownSide === "width" ? out : pKnown.value;
      const wRounded = activeKnownSide === "width" ? roundedKnown : roundedOut;
      const hRounded = activeKnownSide === "width" ? roundedOut : roundedKnown;
      const exact = isInteger(out) && isInteger(pKnown.value);
      const subpixel = w.n < w.d || h.n < h.d;
      return {
        kind: "solve" as const,
        out,
        solveTarget,
        exact,
        subpixel,
        wRounded,
        hRounded,
        copy: `${wRounded} × ${hRounded}`,
        formatted: `${fmtInt(wRounded)} × ${fmtInt(hRounded)} px`,
        ratio: approxNumber(w) / Math.max(1e-9, approxNumber(h)),
        wLabel: `${fmtInt(wRounded)} px`,
        hLabel: `${fmtInt(hRounded)} px`,
        center: canvasRatioLabel(pRW.value, pRH.value),
        targetRatio:
          effectiveMode === "scale"
            ? `${dimW.trim()}:${dimH.trim()}`
            : `${effectiveRatioW.trim()}:${effectiveRatioH.trim()}`,
      };
    }

    if (!pDW.ok || !pDH.ok) return null;
    const [a, b] = simplifyRatio(pDW.value, pDH.value);
    const dec = { n: a, d: b };
    return {
      kind: "identify" as const,
      a,
      b,
      dec,
      copy: `${a}:${b}`,
      formatted: `${a}:${b}`,
      ratio: approxNumber(dec),
      wLabel: `${decimalString(pDW.value)} px`,
      hLabel: `${decimalString(pDH.value)} px`,
      center: canvasRatioLabel(pDW.value, pDH.value),
    };
  }, [
    effectiveMode,
    pRW,
    pRH,
    pKnown,
    activeKnownSide,
    pDW,
    pDH,
    dimW,
    dimH,
    effectiveRatioW,
    effectiveRatioH,
  ]);

  const copyAllowed = Boolean(result && !(result.kind === "solve" && result.subpixel));

  const handleCopy = useCallback(async () => {
    if (!result || !copyAllowed) return;
    if (await copyTextSafe(result.copy)) {
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 1800);
    }
  }, [result, copyAllowed]);

  const handleSwap = () => {
    setCopied(false);
    if (effectiveMode === "solve") {
      setRatioW(ratioH);
      setRatioH(ratioW);
    } else {
      setDimW(dimH);
      setDimH(dimW);
    }
  };

  const handleReset = () => {
    setCopied(false);
    if (variant === "ultrawide") {
      setUltraPresetId("uwqhd");
      setRatioW("43");
      setRatioH("18");
      setKnownSide("width");
      setKnownPx("3440");
      return;
    }
    setRatioW("16");
    setRatioH("9");
    setKnownSide("width");
    setKnownPx("1920");
    setDimW("1920");
    setDimH("1080");
    setTargetSide("width");
    setTargetPx("3840");
  };

  const applyScaleFactor = (factorStr: string) => {
    const pf = parsePositive(factorStr);
    const base = targetSide === "width" ? pDW : pDH;
    if (!pf.ok || !base.ok) return;
    setTargetPx(roundFrac(mul(base.value, pf.value)).toString());
    setCopied(false);
  };

  const stageGeometry = useMemo(() => {
    const rawAr = result?.ratio ?? 16 / 9;
    const clampedAr = Math.min(8, Math.max(0.15, rawAr));
    const maxW = Math.max(160, Math.min(390, workspaceWidth - 96));
    const maxH = 250;
    const width = clampedAr >= maxW / maxH ? maxW : Math.round(maxH * clampedAr);
    const height = Math.max(54, Math.round(width / clampedAr));
    return { width, height, limited: rawAr > 8 || rawAr < 0.15 };
  }, [result?.ratio, workspaceWidth]);

  const canDragCorner = variant === "all" && effectiveMode !== "scale";

  const onCornerPointerDown = (e: ReactPointerEvent<HTMLSpanElement>) => {
    if (!canDragCorner) return;
    e.preventDefault();
    dragActiveRef.current = true;
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {
      // Synthetic pointer fallback.
    }
  };

  const onCornerPointerMove = (e: ReactPointerEvent<HTMLSpanElement>) => {
    if (!dragActiveRef.current || !workspaceRef.current) return;
    const rect = workspaceRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const hw = Math.max(16, Math.abs(e.clientX - cx));
    const hh = Math.max(16, Math.abs(e.clientY - cy));
    const nextR = Math.min(20, Math.max(0.05, hw / hh));
    setCopied(false);
    if (effectiveMode === "solve") {
      setRatioW(nextR.toFixed(2).replace(/\.?0+$/, ""));
      setRatioH("1");
    } else if (pDW.ok) {
      setDimH(String(Math.max(1, Math.round(approxNumber(pDW.value) / nextR))));
    }
  };

  const onCornerPointerEnd = () => {
    dragActiveRef.current = false;
  };

  const activeUltraPreset = ULTRAWIDE_PRESETS.find(p => p.id === ultraPresetId);

  return (
    <section
      ref={setShellEl}
      aria-label="Calculator"
      className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_25.5rem]"
    >
      <div className="order-2 flex flex-col lg:order-1 lg:sticky lg:top-6">
        <div ref={workspaceRef} className="v2-stage-card min-h-[20rem] sm:min-h-[26rem]">
          {result ? (
            <div className="relative flex items-center justify-center">
              <span className="num absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-semibold text-muted-foreground">
                {result.wLabel}
              </span>
              <span className="num absolute top-1/2 -left-3 -translate-x-full -translate-y-1/2 whitespace-nowrap text-xs font-semibold text-muted-foreground">
                {result.hLabel}
              </span>

              <div
                className="v2-calc-box"
                style={{
                  width: `${stageGeometry.width}px`,
                  height: `${stageGeometry.height}px`,
                }}
              >
                <span className="v2-calc-box-grid" />
                <div className="relative z-10 px-3 text-center">
                  <p className="font-display text-2xl font-bold tracking-tight text-foreground">
                    {result.center}
                  </p>
                  <p className="num mt-0.5 text-xs font-medium text-muted-foreground">
                    {result.kind === "solve"
                      ? result.formatted
                      : `${compactDecimal(result.dec)}:1`}
                  </p>
                </div>

                {canDragCorner && (
                  <span
                    aria-hidden="true"
                    onPointerDown={onCornerPointerDown}
                    onPointerMove={onCornerPointerMove}
                    onPointerUp={onCornerPointerEnd}
                    onPointerCancel={onCornerPointerEnd}
                    className="v2-calc-corner"
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-border px-8 py-10 text-center text-xs text-muted-foreground">
              Enter valid positive numbers to preview proportions
            </div>
          )}

          {stageGeometry.limited && (
            <p className="mt-5 text-xs text-muted-foreground">
              Preview compressed for visibility. Calculations use the exact ratio.
            </p>
          )}
        </div>

        <p className="mt-2.5 text-xs text-muted-foreground">
          {!canDragCorner
            ? "Ratio stays locked to your selection. Change the known dimension on the right to scale."
            : "Drag the corner handle to reshape interactively, or choose a preset on the right."}
        </p>
      </div>

      <div className="v2-panel order-1 space-y-4 lg:order-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {variant === "all" ? (
            <SegmentedControl
              aria-label="Calculation mode"
              value={mode}
              onValueChange={val => {
                if (val === "solve" || val === "identify" || val === "scale") {
                  setCopied(false);
                  if (val === "scale" && pRW.ok && pRH.ok && pKnown.ok) {
                    const out = solve(
                      pRW.value,
                      pRH.value,
                      pKnown.value,
                      knownSide === "width" ? "height" : "width",
                    );
                    const wR = knownSide === "width" ? roundFrac(pKnown.value) : roundFrac(out);
                    const hR = knownSide === "width" ? roundFrac(out) : roundFrac(pKnown.value);
                    setDimW(wR.toString());
                    setDimH(hR.toString());
                    setTargetSide("width");
                    setTargetPx((wR * 2n).toString());
                  }
                  setMode(val);
                }
              }}
              className="v2-seg v2-seg--sm flex-1"
              data-testid="v2-calc-mode"
            >
              <SegmentedControlIndicator className="v2-seg-indicator" />
              <SegmentedControlItem
                value="solve"
                className="v2-seg-item flex-1"
                data-testid="v2-calc-mode-solve"
              >
                Calculate size
              </SegmentedControlItem>
              <SegmentedControlItem
                value="identify"
                className="v2-seg-item flex-1"
                data-testid="v2-calc-mode-identify"
              >
                Aspect ratio
              </SegmentedControlItem>
              <SegmentedControlItem
                value="scale"
                className="v2-seg-item flex-1"
                data-testid="v2-calc-mode-scale"
              >
                Scale
              </SegmentedControlItem>
            </SegmentedControl>
          ) : (
            <span className="text-sm font-semibold text-foreground">
              {variant === "16:9" ? "Locked 16:9 widescreen" : "Scale ultrawide resolution"}
            </span>
          )}

          <div className="flex items-center gap-1.5">
            {variant === "all" && (
              <TooltipTrigger
                controller={tooltip}
                payload="Swap width & height"
                render={
                  <Button
                    aria-label="Swap orientation"
                    onClick={handleSwap}
                    className="v2-icon-btn"
                  />
                }
              >
                <ArrowLeftRight aria-hidden="true" className="h-3.5 w-3.5" />
              </TooltipTrigger>
            )}
            <TooltipTrigger
              controller={tooltip}
              payload="Reset values"
              render={
                <Button aria-label="Reset" onClick={handleReset} className="v2-icon-btn" />
              }
            >
              <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
            </TooltipTrigger>
          </div>
        </div>

        {effectiveMode === "solve" && variant === "all" && (
          <div className="space-y-3">
            <RadioGroup
              aria-label="Ratio presets"
              value={matchedGeneralPresetId}
              onValueChange={val => {
                const found = GENERAL_PRESETS.find(p => p.id === val);
                if (!found) return;
                setCopied(false);
                setRatioW(found.w);
                setRatioH(found.h);
              }}
              className="grid grid-cols-3 gap-1.5"
            >
              {GENERAL_PRESETS.slice(0, PRIMARY_PRESET_COUNT).map(p => (
                <Radio
                  key={p.id}
                  value={p.id}
                  className="v2-preset-card"
                  data-testid={`v2-calc-preset-${p.id}`}
                >
                  <Thumb w={Number(p.w)} h={Number(p.h)} active={matchedGeneralPresetId === p.id} />
                  <span className="num text-xs font-semibold text-foreground">{p.id}</span>
                  <span className="text-[11px] leading-tight">{p.hint}</span>
                </Radio>
              ))}
            </RadioGroup>

            <details className="group text-xs">
              <summary className="inline-flex cursor-pointer list-none items-center gap-1 font-semibold text-muted-foreground hover:text-foreground">
                <span>More ratios</span>
                <ChevronDown
                  aria-hidden="true"
                  className="h-3.5 w-3.5 transition-transform group-open:rotate-180"
                />
              </summary>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                {GENERAL_PRESETS.slice(PRIMARY_PRESET_COUNT).map(p => (
                  <button
                    key={p.id}
                    type="button"
                    data-active={matchedGeneralPresetId === p.id ? "" : undefined}
                    onClick={() => {
                      setCopied(false);
                      setRatioW(p.w);
                      setRatioH(p.h);
                    }}
                    className="v2-chip-btn justify-between"
                    data-testid={`v2-calc-preset-${p.id}`}
                  >
                    <span className="num font-semibold">{p.id}</span>
                    <span className="text-muted-foreground">{p.hint}</span>
                  </button>
                ))}
              </div>
            </details>

            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-2">
              <Field className="v2-field" invalid={!pRW.ok}>
                <FieldLabel className="v2-field-label">Ratio W</FieldLabel>
                <div className="v2-input-box">
                  <Input
                    inputMode="decimal"
                    autoComplete="off"
                    value={ratioW}
                    aria-invalid={!pRW.ok}
                    onValueChange={val => {
                      setCopied(false);
                      setRatioW(val);
                    }}
                    className="v2-input num"
                    data-testid="v2-calc-rw"
                  />
                </div>
              </Field>
              <span className="pb-2 font-display text-lg font-bold text-muted-foreground" aria-hidden="true">
                :
              </span>
              <Field className="v2-field" invalid={!pRH.ok}>
                <FieldLabel className="v2-field-label">Ratio H</FieldLabel>
                <div className="v2-input-box">
                  <Input
                    inputMode="decimal"
                    autoComplete="off"
                    value={ratioH}
                    aria-invalid={!pRH.ok}
                    onValueChange={val => {
                      setCopied(false);
                      setRatioH(val);
                    }}
                    className="v2-input num"
                    data-testid="v2-calc-rh"
                  />
                </div>
              </Field>
            </div>
          </div>
        )}

        {variant === "ultrawide" && (
          <div className="space-y-3">
            <RadioGroup
              aria-label="Ultrawide screens"
              value={ultraPresetId}
              onValueChange={val => {
                const found = ULTRAWIDE_PRESETS.find(p => p.id === val);
                if (!found) return;
                setCopied(false);
                setUltraPresetId(found.id);
                setRatioW(found.rw);
                setRatioH(found.rh);
              }}
              className="grid grid-cols-2 gap-1.5"
            >
              {ULTRAWIDE_PRESETS.map(p => (
                <Radio
                  key={p.id}
                  value={p.id}
                  className="v2-preset-card v2-preset-card--left"
                  data-testid={`v2-ultra-${p.id}`}
                >
                  <span className="num text-xs font-semibold text-foreground">{p.label}</span>
                  <span className="num text-[11px] text-muted-foreground">
                    {p.id === "strict" ? "Mathematical 21:9" : `${p.rw}:${p.rh} exact ratio`}
                  </span>
                </Radio>
              ))}
            </RadioGroup>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-muted-foreground" data-testid="v2-locked-ratio">
                Locked ratio <strong className="num text-foreground">{ratioW}:{ratioH}</strong>
              </span>
              {activeUltraPreset?.origW && (
                <button
                  type="button"
                  onClick={() => {
                    setCopied(false);
                    setKnownPx(
                      knownSide === "width" ? activeUltraPreset.origW : activeUltraPreset.origH,
                    );
                  }}
                  className="v2-chip-btn num"
                >
                  Use {activeUltraPreset.origW} × {activeUltraPreset.origH}
                </button>
              )}
            </div>
          </div>
        )}

        {effectiveMode === "solve" && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-muted-foreground">I know the</span>
              <SegmentedControl
                aria-label="Known side"
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

            <Field className="v2-field" invalid={!pKnown.ok}>
              <FieldLabel className="v2-field-label">
                {knownSide === "width" ? "Width (px)" : "Height (px)"}
              </FieldLabel>
              <div className="v2-input-box">
                <Input
                  inputMode="decimal"
                  autoComplete="off"
                  value={knownPx}
                  aria-invalid={!pKnown.ok}
                  onValueChange={val => {
                    setCopied(false);
                    setKnownPx(val);
                  }}
                  className="v2-input num"
                  data-testid="v2-calc-known-px"
                />
                <span className="v2-readout-unit num" aria-hidden="true">
                  px
                </span>
              </div>
            </Field>

            {variant !== "ultrawide" && (
              <div className="grid grid-cols-4 gap-1.5">
                {RES_SHORTCUTS.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setCopied(false);
                      setKnownPx(knownSide === "width" ? s.w : s.h);
                    }}
                    className="v2-chip-btn num"
                    data-testid={`v2-calc-res-${s.id}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {effectiveMode !== "solve" && (
          <div className="space-y-3">
            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-2">
              <Field className="v2-field" invalid={!pDW.ok}>
                <FieldLabel className="v2-field-label">Width (px)</FieldLabel>
                <div className="v2-input-box">
                  <Input
                    inputMode="decimal"
                    autoComplete="off"
                    value={dimW}
                    aria-invalid={!pDW.ok}
                    onValueChange={val => {
                      setCopied(false);
                      setDimW(val);
                    }}
                    className="v2-input num"
                    data-testid="v2-calc-dim-w"
                  />
                </div>
              </Field>
              <span className="pb-2 font-display text-base font-bold text-muted-foreground" aria-hidden="true">
                ×
              </span>
              <Field className="v2-field" invalid={!pDH.ok}>
                <FieldLabel className="v2-field-label">Height (px)</FieldLabel>
                <div className="v2-input-box">
                  <Input
                    inputMode="decimal"
                    autoComplete="off"
                    value={dimH}
                    aria-invalid={!pDH.ok}
                    onValueChange={val => {
                      setCopied(false);
                      setDimH(val);
                    }}
                    className="v2-input num"
                    data-testid="v2-calc-dim-h"
                  />
                </div>
              </Field>
            </div>

            {effectiveMode === "scale" && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">Scale by</span>
                  <SegmentedControl
                    aria-label="Target dimension"
                    value={targetSide}
                    onValueChange={val => {
                      if (val === "width" || val === "height") {
                        setCopied(false);
                        setTargetSide(val);
                      }
                    }}
                    className="v2-seg v2-seg--sm"
                  >
                    <SegmentedControlIndicator className="v2-seg-indicator" />
                    <SegmentedControlItem value="width" className="v2-seg-item">
                      Target width
                    </SegmentedControlItem>
                    <SegmentedControlItem value="height" className="v2-seg-item">
                      Target height
                    </SegmentedControlItem>
                  </SegmentedControl>
                </div>

                <Field className="v2-field" invalid={!pKnown.ok}>
                  <FieldLabel className="v2-field-label">
                    {targetSide === "width" ? "Target width (px)" : "Target height (px)"}
                  </FieldLabel>
                  <div className="v2-input-box">
                    <Input
                      inputMode="decimal"
                      autoComplete="off"
                      value={targetPx}
                      aria-invalid={!pKnown.ok}
                      onValueChange={val => {
                        setCopied(false);
                        setTargetPx(val);
                      }}
                      className="v2-input num"
                      data-testid="v2-calc-target-px"
                    />
                    <span className="v2-readout-unit num" aria-hidden="true">
                      px
                    </span>
                  </div>
                </Field>

                <div className="grid grid-cols-4 gap-1.5">
                  {SCALE_SHORTCUTS.map(sc => (
                    <button
                      key={sc.label}
                      type="button"
                      onClick={() => applyScaleFactor(sc.factor)}
                      className="v2-chip-btn num"
                    >
                      {sc.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {effectiveMode === "identify" && (
              <Button
                disabled={!pDW.ok || !pDH.ok}
                onClick={() => {
                  if (!pDW.ok || !pDH.ok) return;
                  const [a, b] = simplifyRatio(pDW.value, pDH.value);
                  setRatioW(a.toString());
                  setRatioH(b.toString());
                  setKnownSide("width");
                  setKnownPx(dimW);
                  setMode("solve");
                }}
                className="v2-btn v2-btn--outline v2-btn--sm w-full"
              >
                <span>Use this ratio → Calculate size</span>
              </Button>
            )}
          </div>
        )}

        <div className="v2-result-box space-y-2.5" aria-live="polite" data-testid="v2-calc-result-summary">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {result
                  ? result.kind === "solve"
                    ? `${result.solveTarget === "height" ? "Height" : "Width"} · ${result.exact ? "exact" : "rounded px"}`
                    : result.center.startsWith("Near ")
                      ? "Approximate ratio"
                      : "Simplified ratio"
                  : "Result"}
              </p>
              <p className="num mt-1 break-words text-2xl font-bold leading-tight text-foreground">
                {result
                  ? result.kind === "solve"
                    ? result.subpixel
                      ? "Below 1 px"
                      : result.formatted
                    : result.formatted
                  : "—"}
              </p>
            </div>

            <Button
              disabled={!copyAllowed}
              focusableWhenDisabled
              onClick={() => void handleCopy()}
              className="v2-btn v2-btn--primary v2-btn--sm shrink-0"
              data-testid="v2-calc-copy"
            >
              {copied ? (
                <Check aria-hidden="true" className="h-3.5 w-3.5" />
              ) : (
                <Copy aria-hidden="true" className="h-3.5 w-3.5" />
              )}
              <span>{copied ? "Copied" : "Copy"}</span>
            </Button>
          </div>

          {result?.kind === "solve" && !result.subpixel && (
            <p className="text-xs text-muted-foreground">
              {result.exact
                ? "Whole pixels — no rounding needed."
                : "Rounded to the nearest whole pixel."}
            </p>
          )}

          {result?.kind === "solve" && result.subpixel && (
            <p role="alert" className="text-xs font-medium text-destructive">
              Both dimensions must be at least 1 px. Increase the known dimension.
            </p>
          )}

          {result?.kind === "identify" && (
            <p className="num text-xs text-muted-foreground">
              {compactDecimal(result.dec)}:1
              {result.center.startsWith("Near ") ? ` · ${result.center}` : ""}
            </p>
          )}

          {result && (
            <details className="group border-t border-border pt-2 text-xs">
              <summary className="inline-flex cursor-pointer list-none items-center gap-1 font-medium text-muted-foreground hover:text-foreground">
                <ChevronDown
                  aria-hidden="true"
                  className="h-3.5 w-3.5 transition-transform group-open:rotate-180"
                />
                <span>Precision detail</span>
              </summary>
              <dl className="num mt-2 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 text-foreground/90">
                {result.kind === "solve" ? (
                  <>
                    <dt className="text-muted-foreground">Target ratio</dt>
                    <dd className="break-all">{result.targetRatio}</dd>
                    <dt className="text-muted-foreground">Exact {result.solveTarget}</dt>
                    <dd className="break-all">
                      {result.out.n.toString()}/{result.out.d.toString()} px
                    </dd>
                    <dt className="text-muted-foreground">Decimal</dt>
                    <dd className="break-all">{decimalString(result.out)} px</dd>
                  </>
                ) : (
                  <>
                    <dt className="text-muted-foreground">Exact ratio</dt>
                    <dd className="break-all">
                      {result.a.toString()}:{result.b.toString()}
                    </dd>
                    <dt className="text-muted-foreground">Decimal</dt>
                    <dd className="break-all">{decimalString(result.dec)}:1</dd>
                  </>
                )}
              </dl>
            </details>
          )}
        </div>
      </div>

      <Tooltip container={shellEl} controller={tooltip} delay={80} closeDelay={0}>
        <TooltipContent<string>
          aria-label="Control hint"
          side="bottom"
          sideOffset={6}
          collisionPadding={10}
          className="v2-tooltip"
        >
          {state => state.payload}
        </TooltipContent>
      </Tooltip>
    </section>
  );
}
