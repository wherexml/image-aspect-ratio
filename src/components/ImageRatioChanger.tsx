import { useState } from "react";
import { TARGET_RATIOS, frameSize, type TargetRatio } from "@/lib/square";
import { ImageFrameEditor, Segmented, type FrameSizePx } from "./ImageFrameEditor";

const ERR_WIDTH = "Enter a whole number from 1 to 4096 pixels.";
const errHeight = (height: number) => `Height would be ${height} px. Enter a smaller width so both sides stay within 4096 px.`;
const DEFAULT_RATIO = TARGET_RATIOS.find(r => r.id === "16:9")!;
const RATIO_OPTIONS = TARGET_RATIOS.map(r => [r.id, r.id] as const);

/** /change-image-aspect-ratio: 1:1, 4:5, 9:16 or 16:9 output; width entered, height derived with exact BigInt rounding. */
export function ImageRatioChanger() {
  const [ratio, setRatio] = useState<TargetRatio>(DEFAULT_RATIO);
  const [widthText, setWidthText] = useState(String(DEFAULT_RATIO.defaultWidth));
  const [lastSize, setLastSize] = useState<FrameSizePx>({ width: DEFAULT_RATIO.defaultWidth, height: 1080 });

  const size = frameSize(widthText, ratio);
  // An invalid entry keeps the last valid preview but never enables export.
  const output = size.ok ? { width: size.width, height: size.height } : null;
  const preview = output ?? lastSize;

  function pickRatio(id: string) {
    const next = TARGET_RATIOS.find(r => r.id === id);
    if (!next || next.id === ratio.id) return;
    // A new target restores that ratio's default width (always valid); the photo and its placement are kept.
    const nextSize = frameSize(String(next.defaultWidth), next);
    setRatio(next); setWidthText(String(next.defaultWidth));
    if (nextSize.ok) setLastSize({ width: nextSize.width, height: nextSize.height });
  }
  function onWidth(text: string) {
    setWidthText(text);
    const next = frameSize(text, ratio);
    if (next.ok) setLastSize({ width: next.width, height: next.height });
  }

  return <ImageFrameEditor label="Change image aspect ratio" idPrefix="ratio" analyticsTool="change_ratio" preview={preview} output={output}
    suffix={ratio.suffix} frameKey={`${ratio.id}|${widthText}`} ratioId={ratio.id}
    before={exporting => <div className="space-y-2">
      <p className="text-sm">Aspect ratio</p>
      <Segmented label="Aspect ratio" value={ratio.id} options={RATIO_OPTIONS} onPick={pickRatio} disabled={exporting} className="seg ar-ratios" />
    </div>}
    sizeField={exporting => <label className="min-w-0 text-sm">Width (px)
      <input className="field mt-2" disabled={exporting} inputMode="numeric" autoComplete="off" spellCheck={false} value={widthText}
        aria-invalid={!size.ok} aria-describedby={size.ok ? "ratio-size" : "ratio-size-error"}
        onChange={e => onWidth(e.target.value)} />
    </label>}
    sizeStatus={size.ok
      ? <p id="ratio-size" className="text-sm" aria-live="polite" data-testid="ratio-output-size">
          Output <strong className="num">{size.width} × {size.height} px</strong>
          {!size.exact && <span className="block text-xs text-muted-foreground">Height rounded to the nearest whole pixel.</span>}
        </p>
      : <p id="ratio-size-error" role="alert" className="text-sm text-destructive">{size.height === null ? ERR_WIDTH : errHeight(size.height)}</p>} />;
}
