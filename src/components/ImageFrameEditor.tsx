import { useEffect, useRef, useState, type CSSProperties, type DragEvent as ReactDragEvent, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { Download, ImageIcon, ImagePlus, Minus, Plus } from "lucide-react";
import { INPUT_MAX_BYTES, INPUT_MAX_PIXELS, drawFrame, exportFrame, frameFilename, type SquareFormat } from "@/lib/square";
import {
  FIT, ZOOM_STEP, clampPlacement, fillPlacement, movePlacement, placementLayout, zoomBounds, zoomPlacementAt,
  type Placement,
} from "@/lib/placement";
import { ERR_BYTES, ERR_DOWNLOAD, ERR_PIXELS, ERR_READ, isCandidateType } from "@/lib/image-input";
import { useToolTracking } from "@/lib/tool-analytics";

type Loaded = { img: HTMLImageElement; url: string; name: string; width: number; height: number };
export type FrameSizePx = { width: number; height: number };
type Preset = "fit" | "fill";

/** Segmented radio control in the shared `seg` style; disabled while a file is encoding. */
export function Segmented({ label, value, options, onPick, disabled, className = "seg" }: {
  label: string; value: string; options: readonly (readonly [string, string])[]; onPick: (v: string) => void; disabled: boolean; className?: string;
}) {
  return <div role="radiogroup" aria-label={label} className={className}>
    {options.map(([v, text]) => <button key={v} type="button" role="radio" aria-checked={value === v} disabled={disabled}
      className="disabled:cursor-not-allowed disabled:opacity-40" onClick={() => onPick(v)}>{text}</button>)}
  </div>;
}

export type ImageFrameEditorProps = {
  /** Accessible name of the tool section. */
  label: string;
  /** Prefix for stable hooks: `${idPrefix}-file` input and `${idPrefix}-preview` canvas test ID. */
  idPrefix: string;
  /** Frame drawn in the preview (the last valid size while the size field is invalid). */
  preview: FrameSizePx;
  /** Export size, or null when the size field is invalid (Download disabled). */
  output: FrameSizePx | null;
  /** Download filename suffix, e.g. `square` or `16x9`. */
  suffix: string;
  /** Changes whenever the wrapper's frame inputs change; any active drag is cleared. */
  frameKey: string;
  /** Optional `data-ratio` on the stage. */
  ratioId?: string;
  /** Controls above Framing (e.g. ratio choice). */
  before?: (exporting: boolean) => ReactNode;
  /** Size field placed beside Background. */
  sizeField: (exporting: boolean) => ReactNode;
  /** Size status/error line below the size row. */
  sizeStatus: ReactNode;
  /** Optional categorical analytics tool identifier (`make_square` or `change_ratio`). */
  analyticsTool?: "make_square" | "change_ratio";
};

/**
 * Shared local image frame editor: one decoded photo placed continuously inside a fixed output frame.
 * Preview and export both use `placementLayout` (src/lib/placement.ts) with `drawFrame`; no pixels leave the browser.
 */
export function ImageFrameEditor({ label, idPrefix, preview, output, suffix, frameKey, ratioId, before, sizeField, sizeStatus, analyticsTool }: ImageFrameEditorProps) {
  const tracking = useToolTracking(analyticsTool ?? "make_square", "frame", null);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [reading, setReading] = useState(false);
  const [inputError, setInputError] = useState("");
  const [placement, setPlacement] = useState<Placement>(FIT);
  const [lastPreset, setLastPreset] = useState<Preset>("fit");
  const [background, setBackground] = useState("#ffffff");
  const [format, setFormat] = useState<SquareFormat>("png");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const generation = useRef(0);
  const urls = useRef(new Set<string>());
  const fileInput = useRef<HTMLInputElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [stageWidth, setStageWidth] = useState(0);
  const drag = useRef<{ id: number; x: number; y: number; placement: Placement } | null>(null);

  // The stored placement is kept across frame changes and clamped to whatever frame is current.
  const placed = loaded ? clampPlacement(loaded.width, loaded.height, preview.width, preview.height, placement) : FIT;
  const bounds = loaded ? zoomBounds(loaded.width, loaded.height, preview.width, preview.height) : { min: 1, max: 1 };
  const layout = loaded ? placementLayout(loaded.width, loaded.height, preview.width, preview.height, placed) : null;

  // A ratio or size change ends any drag and clears a stale export error.
  useEffect(() => { drag.current = null; setExportError(""); }, [frameKey]);

  const revoke = (url: string) => { URL.revokeObjectURL(url); urls.current.delete(url); };
  useEffect(() => () => {
    generation.current++;
    urls.current.forEach(url => URL.revokeObjectURL(url));
    urls.current.clear();
  }, []);
  useEffect(() => () => { if (loaded) revoke(loaded.url); }, [loaded]);

  // Picker, drop and paste share this path: type pre-check, byte and pixel limits, decode, generation guard.
  async function readFile(file?: File | null) {
    if (!file) return;
    const id = ++generation.current;
    drag.current = null;
    setInputError(""); setExportError(""); setLoaded(null); setReading(false); setPlacement(FIT); setLastPreset("fit");
    if (!isCandidateType(file.type)) { setInputError(ERR_READ); return; }
    if (file.size > INPUT_MAX_BYTES) { setInputError(ERR_BYTES); return; }
    const url = URL.createObjectURL(file); urls.current.add(url); setReading(true);
    try {
      // <img> decoding applies the browser's EXIF orientation; SVG scripts never run.
      const img = new Image(); img.src = url;
      await img.decode();
      if (id !== generation.current) { revoke(url); return; }
      if (!img.naturalWidth || !img.naturalHeight) throw new Error("decode");
      if (img.naturalWidth * img.naturalHeight > INPUT_MAX_PIXELS) throw new Error("pixels");
      setLoaded({ img, url, name: file.name || "Pasted image", width: img.naturalWidth, height: img.naturalHeight });
      if (analyticsTool) tracking.imageRead(`${file.name}:${file.size}:${img.naturalWidth}x${img.naturalHeight}`);
    } catch (e) {
      revoke(url);
      if (id === generation.current) setInputError(e instanceof Error && e.message === "pixels" ? ERR_PIXELS : ERR_READ);
    } finally { if (id === generation.current) setReading(false); }
  }
  function remove() {
    generation.current++;
    drag.current = null;
    setLoaded(null); setReading(false); setInputError(""); setExportError(""); setPlacement(FIT); setLastPreset("fit");
  }

  // Native Cmd+V / Ctrl+V image paste; text and editable targets keep their default behavior.
  const readRef = useRef(readFile);
  readRef.current = readFile;
  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      if (event.defaultPrevented) return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || target.closest("input, textarea, select, [contenteditable]"))) return;
      const data = event.clipboardData;
      if (!data) return;
      let file: File | null = Array.from(data.files).find(f => isCandidateType(f.type)) ?? null;
      if (!file) for (const item of Array.from(data.items)) {
        if (item.kind === "file" && isCandidateType(item.type)) { file = item.getAsFile(); if (file) break; }
      }
      if (!file) return;
      event.preventDefault();
      void readRef.current(file);
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, []);

  useEffect(() => {
    const node = stage.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(entries => setStageWidth(entries[0]?.contentRect.width ?? 0));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Preview draws the exact export layout scaled to the canvas backing store; one draw per animation frame.
  useEffect(() => {
    const node = canvas.current;
    if (!node || !loaded || !layout || stageWidth <= 0) return;
    const frame = requestAnimationFrame(() => {
      const pxW = Math.max(1, Math.round(stageWidth * (window.devicePixelRatio || 1)));
      const pxH = Math.max(1, Math.round(pxW * preview.height / preview.width));
      if (node.width !== pxW || node.height !== pxH) { node.width = pxW; node.height = pxH; }
      const ctx = node.getContext("2d");
      if (ctx) drawFrame(ctx, loaded.img, layout, preview.width, preview.height, background, pxW / preview.width);
    });
    return () => cancelAnimationFrame(frame);
  }, [loaded, layout?.sx, layout?.sy, layout?.sw, layout?.sh, layout?.dx, layout?.dy, layout?.dw, layout?.dh, preview.width, preview.height, background, stageWidth]);

  const editable = !!loaded && !exporting;
  /** Every placement change goes through the current frame's clamp; nothing changes while encoding. */
  function place(update: (current: Placement, w: number, h: number) => Placement) {
    if (!loaded || exporting) return;
    const { width: w, height: h } = loaded;
    setPlacement(current => update(clampPlacement(w, h, preview.width, preview.height, current), w, h));
  }
  // Fit (also the centered reset) and Fill end any drag so a held pointer cannot move the new placement.
  const fit = () => { drag.current = null; setLastPreset("fit"); place(() => FIT); };
  const fill = () => { drag.current = null; setLastPreset("fill"); place((_, w, h) => fillPlacement(w, h, preview.width, preview.height)); };

  // Pressed state is derived from the current clamped geometry, never stored: any manual zoom/pan or a
  // frame change that moves the image away from a centered preset clears it. When Fit and Fill coincide
  // (photo already matches the frame), only the last explicitly applied preset is shown.
  const near = (a: number, b: number) => Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b));
  const matches = (target: Placement) => near(placed.zoom, target.zoom) && near(placed.cx, target.cx) && near(placed.cy, target.cy);
  const fitTarget = loaded ? clampPlacement(loaded.width, loaded.height, preview.width, preview.height, FIT) : null;
  const fillTarget = loaded ? fillPlacement(loaded.width, loaded.height, preview.width, preview.height) : null;
  const isFit = !!fitTarget && matches(fitTarget);
  const isFill = !!fillTarget && matches(fillTarget);
  const pressed: Preset | null = isFit && isFill ? lastPreset : isFit ? "fit" : isFill ? "fill" : null;

  function zoomTo(zoom: number, anchor = { x: 0.5, y: 0.5 }) {
    if (drag.current) return;
    place((current, w, h) => zoomPlacementAt(w, h, preview.width, preview.height, current, zoom, anchor));
  }
  const zoomBy = (factor: number, anchor?: { x: number; y: number }) => zoomTo(placed.zoom * factor, anchor);

  function onPreviewWheel(event: WheelEvent) {
    // Plain wheel keeps page scrolling; only Command/Control-wheel (and trackpad pinch) over a loaded preview zooms.
    if (event.defaultPrevented || (!event.metaKey && !event.ctrlKey) || !loaded) return;
    event.preventDefault();
    if (exporting || drag.current || !Number.isFinite(event.deltaY)) return;
    const rect = canvas.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) return;
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? rect.height : 1;
    const delta = Math.max(-500, Math.min(500, event.deltaY * unit));
    zoomBy(Math.exp(-delta * 0.002), {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    });
  }
  // A non-passive, preview-only listener prevents browser zoom for editor gestures.
  const wheelRef = useRef(onPreviewWheel);
  wheelRef.current = onPreviewWheel;
  useEffect(() => {
    const node = stage.current;
    if (!node) return;
    const onWheel = (event: WheelEvent) => wheelRef.current(event);
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, []);

  const ARROWS: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  function onPreviewKeyDown(event: ReactKeyboardEvent<HTMLCanvasElement>) {
    if (!loaded || event.altKey) return;
    const arrow = ARROWS[event.key];
    if (arrow && !event.metaKey && !event.ctrlKey) {
      event.preventDefault();
      if (!editable || drag.current) return;
      // 1% of the shorter output side per press; Shift moves ten times as far.
      const step = Math.max(1, Math.min(preview.width, preview.height) * 0.01) * (event.shiftKey ? 10 : 1);
      place((current, w, h) => movePlacement(w, h, preview.width, preview.height, current, arrow[0] * step, arrow[1] * step));
      return;
    }
    if ((!event.metaKey && !event.ctrlKey) || !["+", "=", "-", "0"].includes(event.key)) return;
    event.preventDefault();
    if (!editable || drag.current) return;
    if (event.key === "0") fit();
    else zoomBy(event.key === "-" ? 1 / ZOOM_STEP : ZOOM_STEP);
  }

  // Pointer drag moves the image with the pointer at any zoom; the stage has the output's aspect,
  // so one CSS pixel is the same number of output pixels on both axes.
  function onPointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!editable || event.button !== 0) return;
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, placement: placed };
  }
  function onPointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    const start = drag.current;
    if (!start || start.id !== event.pointerId || !loaded || stageWidth <= 0 || exporting) return;
    const perCss = preview.width / stageWidth;
    setPlacement(movePlacement(loaded.width, loaded.height, preview.width, preview.height, start.placement,
      (event.clientX - start.x) * perCss, (event.clientY - start.y) * perCss));
  }
  function onPointerEnd(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (drag.current?.id === event.pointerId) drag.current = null;
  }

  async function download() {
    if (!loaded || !output || exporting) return;
    const id = generation.current;
    // Settings are captured here; export controls and drag stay disabled until encoding settles.
    const { width, height } = output;
    const name = frameFilename(loaded.name, format, suffix);
    drag.current = null;
    setExporting(true); setExportError("");
    try {
      const blob = await exportFrame(loaded.img, placementLayout(loaded.width, loaded.height, width, height, placement), width, height, background, format);
      if (id !== generation.current) return; // Image replaced, removed or page left during encoding.
      if (analyticsTool) tracking.imageExport(`${loaded.name}:${width}x${height}:${format}:${background}:${placed.zoom.toFixed(3)}`);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url; link.download = name; link.rel = "noopener";
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch {
      if (id === generation.current) setExportError(ERR_DOWNLOAD);
    } finally { setExporting(false); }
  }

  const percent = `${Math.round(placed.zoom * 100)}%`;
  const iconButton = "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40";
  const textButton = "min-h-11 rounded-full border px-4 text-sm font-semibold hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40";
  const stageStyle = { "--ar": String(preview.width / preview.height) } as CSSProperties;
  const onDrop = (e: ReactDragEvent) => { e.preventDefault(); void readFile(e.dataTransfer.files[0]); };

  return <section aria-label={label} className="mt-8 space-y-6">
    <input ref={fileInput} id={`${idPrefix}-file`} type="file" accept="image/*" tabIndex={-1} aria-hidden="true" className="sr-only" onChange={e => { void readFile(e.target.files?.[0]); e.target.value = ""; }} />
    {loaded
      ? <div className="ar-file-row" onDragOver={e => e.preventDefault()} onDrop={onDrop}>
          <span className="min-w-0 break-all text-sm">{loaded.name} · <span className="num">{loaded.width} × {loaded.height}</span></span>
          <span className="flex shrink-0 gap-2">
            <button type="button" className={textButton} onClick={() => fileInput.current?.click()}>Replace</button>
            <button type="button" className={textButton} onClick={remove}>Remove</button>
          </span>
        </div>
      : <div className="mp-drop mp-drop--upload" onDragOver={e => e.preventDefault()} onDrop={onDrop}>
          <div className="mp-upload-target" aria-busy={reading}>
            <button type="button" className="mp-upload-button" onClick={() => fileInput.current?.click()}>
              <ImagePlus aria-hidden="true" className="h-4 w-4" />Choose image
            </button>
            {inputError && <p role="alert" className="text-sm text-destructive">{inputError}</p>}
          </div>
        </div>}

    <div className="sq-layout grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
      <div ref={stage} className="ar-stage" data-ratio={ratioId} style={stageStyle}>
        {loaded
          ? <canvas ref={canvas} role="img" aria-label={`Preview of ${loaded.name} at ${preview.width} × ${preview.height} px, zoom ${percent}`} data-testid={`${idPrefix}-preview`}
              tabIndex={0} onKeyDown={onPreviewKeyDown}
              className="sq-canvas sq-canvas--crop"
              onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerEnd} onPointerCancel={onPointerEnd} />
          : <div className="sq-empty" aria-hidden="true"><ImageIcon className="h-10 w-10" /></div>}
      </div>

      <div className="space-y-5">
        {before?.(exporting)}

        <fieldset disabled={!editable} className="space-y-3">
          <legend className="text-sm">Framing</legend>
          <div role="group" aria-label="Framing" className="seg ar-framing">
            <button type="button" aria-pressed={pressed === "fit"} className="disabled:cursor-not-allowed disabled:opacity-40" onClick={fit}>Fit whole image</button>
            <button type="button" aria-pressed={pressed === "fill"} className="disabled:cursor-not-allowed disabled:opacity-40" onClick={fill}>Crop to fill</button>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className={iconButton} aria-label="Zoom out" onClick={() => zoomBy(1 / ZOOM_STEP)} disabled={!editable || placed.zoom <= bounds.min}><Minus aria-hidden="true" className="h-4 w-4" /></button>
            <label className="ar-zoom">
              <span className="sr-only">Zoom</span>
              {/* Logarithmic internally; assistive technology receives percentages of Fit. */}
              <input type="range" min={Math.log(bounds.min)} max={Math.log(bounds.max)} step={0.001} value={Math.log(placed.zoom)}
                aria-valuemin={Math.round(bounds.min * 100)} aria-valuemax={Math.round(bounds.max * 100)} aria-valuenow={Math.round(placed.zoom * 100)}
                aria-valuetext={percent} onChange={e => zoomTo(Math.exp(Number(e.target.value)))} />
            </label>
            <button type="button" className={iconButton} aria-label="Zoom in" onClick={() => zoomBy(ZOOM_STEP)} disabled={!editable || placed.zoom >= bounds.max}><Plus aria-hidden="true" className="h-4 w-4" /></button>
            <output className="num w-14 shrink-0 text-right text-sm" aria-label="Zoom">{percent}</output>
          </div>
        </fieldset>

        <div className="grid grid-cols-2 gap-4">
          {sizeField(exporting)}
          <label className="min-w-0 text-sm">Background
            <input type="color" className="sq-color mt-2" disabled={exporting} value={background} onChange={e => { setBackground(e.target.value); setExportError(""); }} />
          </label>
        </div>
        {sizeStatus}

        <div className="space-y-2">
          <p className="text-sm">Format</p>
          <Segmented label="Format" value={format} options={[["png", "PNG"], ["jpeg", "JPEG"]]} disabled={exporting}
            onPick={v => { setFormat(v as SquareFormat); setExportError(""); }} />
        </div>

        <button type="button" onClick={() => void download()} disabled={!loaded || !output || exporting || reading} aria-busy={exporting}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:ring-2 hover:ring-foreground disabled:cursor-not-allowed disabled:opacity-40">
          <Download aria-hidden="true" className="h-4 w-4" />Download image
        </button>
        {exportError && <p role="alert" className="text-sm text-destructive">{exportError}</p>}
      </div>
    </div>
  </section>;
}
