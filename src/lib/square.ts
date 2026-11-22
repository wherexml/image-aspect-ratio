// Image frame geometry and rendering shared by /make-image-square and /change-image-aspect-ratio.
// One layout source: the export draws at scale 1, the preview draws the same layout scaled down.
// Square helpers below are the frame helpers with equal output sides; their results are unchanged.
import { frac, roundFrac } from "./ratio";

export type SquareMode = "pad" | "crop";
/** Crop position: x/y are fractions (0..1) of the available travel; zoom ≥ 1 narrows the source region. */
export type CropState = { zoom: number; x: number; y: number };
/** Source rectangle (image pixels) drawn into the destination rectangle (output pixels). */
export type SquareLayout = { sx: number; sy: number; sw: number; sh: number; dx: number; dy: number; dw: number; dh: number };
export type FrameLayout = SquareLayout;

export const EDGE_MIN = 1;
export const EDGE_MAX = 4096;
export const EDGE_DEFAULT = 1080;
export const INPUT_MAX_BYTES = 20 * 1024 * 1024;
export const INPUT_MAX_PIXELS = 50_000_000;
export const ZOOM_LIMIT = 10;
export const CENTERED: CropState = { zoom: 1, x: 0.5, y: 0.5 };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Number.isFinite(v) ? v : lo));

/** Whole number 1..4096 written with digits only; anything else (decimals, signs, exponents, blank) is invalid. */
export function parseEdge(text: string): number | null {
  const t = text.trim();
  if (!/^\d{1,5}$/.test(t)) return null;
  const n = Number(t);
  return n >= EDGE_MIN && n <= EDGE_MAX ? n : null;
}

/** Largest source rectangle with the output's aspect ratio that fits inside a w × h image (zoom 1). */
function cropBase(w: number, h: number, outW: number, outH: number) {
  return w * outH >= h * outW ? { bw: (h * outW) / outH, bh: h } : { bw: w, bh: (w * outH) / outW };
}

/** Highest zoom that keeps the shorter crop side at least one source pixel. */
export function frameMaxZoom(w: number, h: number, outW: number, outH: number) {
  const { bw, bh } = cropBase(w, h, outW, outH);
  return Math.max(1, Math.min(ZOOM_LIMIT, Math.min(bw, bh)));
}

/** Keep the image point beneath an anchor fixed while zooming, clamping at image edges. */
export function zoomFrameCropAt(w: number, h: number, outW: number, outH: number, crop: CropState, zoom: number, anchor = { x: 0.5, y: 0.5 }): CropState {
  const limit = frameMaxZoom(w, h, outW, outH);
  const nextZoom = clamp(zoom, 1, limit);
  if (nextZoom === crop.zoom) return crop;
  const { bw, bh } = cropBase(w, h, outW, outH);
  const oldZoom = clamp(crop.zoom, 1, limit);
  const position = (size: number, base: number, value: number, point: number) => {
    const oldSide = base / oldZoom;
    const side = base / nextZoom;
    const travel = size - side;
    if (travel <= 0) return 0.5;
    const sourcePoint = (size - oldSide) * clamp(value, 0, 1) + clamp(point, 0, 1) * oldSide;
    return clamp((sourcePoint - clamp(point, 0, 1) * side) / travel, 0, 1);
  };
  return { zoom: nextZoom, x: position(w, bw, crop.x, anchor.x), y: position(h, bh, crop.y, anchor.y) };
}

export function frameLayout(w: number, h: number, outW: number, outH: number, mode: SquareMode, crop: CropState): FrameLayout {
  if (mode === "pad") {
    // Contain: the limiting side spans the output; integer size, floor-centered, never below 1 px.
    const scale = Math.min(outW / w, outH / h);
    const dw = clamp(Math.round(w * scale), 1, outW);
    const dh = clamp(Math.round(h * scale), 1, outH);
    return { sx: 0, sy: 0, sw: w, sh: h, dx: Math.floor((outW - dw) / 2), dy: Math.floor((outH - dh) / 2), dw, dh };
  }
  // Crop: a source region with the output's aspect ratio, narrowed by zoom and positioned within the available travel.
  const { bw, bh } = cropBase(w, h, outW, outH);
  const zoom = clamp(crop.zoom, 1, frameMaxZoom(w, h, outW, outH));
  const sw = bw / zoom, sh = bh / zoom;
  return {
    sx: (w - sw) * clamp(crop.x, 0, 1), sy: (h - sh) * clamp(crop.y, 0, 1), sw, sh,
    dx: 0, dy: 0, dw: outW, dh: outH,
  };
}

/** Fills the solid background, then draws the image. `scale` maps output pixels to canvas pixels. */
export function drawFrame(ctx: CanvasRenderingContext2D, img: CanvasImageSource, layout: FrameLayout, outW: number, outH: number, background: string, scale = 1) {
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, outW, outH);
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, outW, outH);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  const { sx, sy, sw, sh, dx, dy, dw, dh } = layout;
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

export type SquareFormat = "png" | "jpeg";
export const FORMAT_MIME: Record<SquareFormat, string> = { png: "image/png", jpeg: "image/jpeg" };
export const FORMAT_EXT: Record<SquareFormat, string> = { png: "png", jpeg: "jpg" };

/** Renders the full-size frame and encodes it; rejects when the browser cannot produce the requested type. */
export function exportFrame(img: CanvasImageSource, layout: FrameLayout, outW: number, outH: number, background: string, format: SquareFormat): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = outW; canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("context");
      drawFrame(ctx, img, layout, outW, outH, background);
      const mime = FORMAT_MIME[format];
      // Browsers fall back to PNG for unsupported types; a mismatched blob is treated as failure.
      canvas.toBlob(blob => {
        canvas.width = 0; canvas.height = 0;
        if (blob && blob.size > 0 && blob.type === mime) resolve(blob); else reject(new Error("encode"));
      }, mime, format === "jpeg" ? 0.92 : undefined);
    } catch (error) { reject(error); }
  });
}

/** `photo.final.JPG` + `16x9` → `photo-final-16x9.jpg`; unusable names fall back to `image`. */
export function frameFilename(name: string, format: SquareFormat, suffix: string) {
  const base = name.replace(/\.[^.]*$/, "").replace(/[^\w-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "image";
  return `${base}-${suffix}.${FORMAT_EXT[format]}`;
}

// ---- Square wrappers (/make-image-square): equal output sides, identical results to the original square path.

/** Highest zoom that keeps the crop side at least one source pixel. */
export const maxZoom = (w: number, h: number) => frameMaxZoom(w, h, 1, 1);
export const zoomCropAt = (w: number, h: number, crop: CropState, zoom: number, anchor = { x: 0.5, y: 0.5 }) =>
  zoomFrameCropAt(w, h, 1, 1, crop, zoom, anchor);
export const squareLayout = (w: number, h: number, edge: number, mode: SquareMode, crop: CropState) =>
  frameLayout(w, h, edge, edge, mode, crop);
export const drawSquare = (ctx: CanvasRenderingContext2D, img: CanvasImageSource, layout: SquareLayout, edge: number, background: string, scale = 1) =>
  drawFrame(ctx, img, layout, edge, edge, background, scale);
export const exportSquare = (img: CanvasImageSource, layout: SquareLayout, edge: number, background: string, format: SquareFormat) =>
  exportFrame(img, layout, edge, edge, background, format);
/** `photo.final.JPG` → `photo-final-square.jpg`; unusable names fall back to `image`. */
export const squareFilename = (name: string, format: SquareFormat) => frameFilename(name, format, "square");

// ---- Target ratios (/change-image-aspect-ratio).

export type TargetRatio = { id: "1:1" | "4:5" | "9:16" | "16:9"; w: number; h: number; defaultWidth: number; suffix: string };
export const TARGET_RATIOS: readonly TargetRatio[] = [
  { id: "1:1", w: 1, h: 1, defaultWidth: 1080, suffix: "1x1" },
  { id: "4:5", w: 4, h: 5, defaultWidth: 1080, suffix: "4x5" },
  { id: "9:16", w: 9, h: 16, defaultWidth: 1080, suffix: "9x16" },
  { id: "16:9", w: 16, h: 9, defaultWidth: 1920, suffix: "16x9" },
];

export type FrameSize =
  | { ok: true; width: number; height: number; exact: boolean }
  | { ok: false; height: number | null };

/**
 * Output width (whole px, 1..4096) → height at the exact target ratio, rounded half up with BigInt math.
 * Invalid when the width is malformed or the rounded height falls outside 1..4096 px.
 */
export function frameSize(widthText: string, ratio: TargetRatio): FrameSize {
  const width = parseEdge(widthText);
  if (width === null) return { ok: false, height: null };
  const exactHeight = frac(BigInt(width) * BigInt(ratio.h), BigInt(ratio.w));
  const height = Number(roundFrac(exactHeight));
  if (height < EDGE_MIN || height > EDGE_MAX) return { ok: false, height };
  return { ok: true, width, height, exact: exactHeight.d === 1n };
}
