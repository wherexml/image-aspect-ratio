// Continuous image placement for the shared ImageFrameEditor (/make-image-square and /change-image-aspect-ratio).
// The output frame is fixed; the whole source image is scaled and moved inside it, and the canvas clips.
// Zoom 1 is the Fit (contain) scale. Position is the image centre as a fraction of the output size,
// so a placement survives output-size and ratio changes. The legacy crop helpers in square.ts assume coverage
// and are no longer used by either tool; square output is this geometry with equal sides.
import type { FrameLayout } from "./square";

export type Placement = { zoom: number; cx: number; cy: number };

export const FIT: Placement = { zoom: 1, cx: 0.5, cy: 0.5 };
export const ZOOM_MIN = 0.01;
export const ZOOM_MAX = 10;
export const ZOOM_STEP = 1.1;

const finite = (v: number, fallback: number) => (Number.isFinite(v) ? v : fallback);
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Output pixels per source pixel at Fit. */
const fitScale = (w: number, h: number, outW: number, outH: number) => Math.min(outW / w, outH / h);

/** Zoom at which the image covers the frame (Fill); ≥ 1. */
export const fillZoom = (w: number, h: number, outW: number, outH: number) =>
  Math.max(outW / w, outH / h) / fitScale(w, h, outW, outH);

/** Usual range 1%–1000% of Fit; the maximum extends to Fill for extreme source ratios, and the minimum keeps the longer side ≥ 1 output px. */
export function zoomBounds(w: number, h: number, outW: number, outH: number) {
  const fit = fitScale(w, h, outW, outH);
  const min = Math.min(1, Math.max(ZOOM_MIN, 1 / (Math.max(w, h) * fit)));
  return { min, max: Math.max(ZOOM_MAX, fillZoom(w, h, outW, outH)) };
}

/**
 * Per axis: an image larger than the frame must keep covering it (no new empty space);
 * a smaller image must stay entirely inside it. Both rules meet at equal size, so there is no jump.
 */
function clampCentre(c: number, size: number, out: number) {
  const half = size / 2;
  const lo = Math.min(half, out - half), hi = Math.max(half, out - half);
  return clamp(c * out, lo, hi) / out;
}

/** Clamp zoom to its bounds and the centre to the valid travel for this frame. */
export function clampPlacement(w: number, h: number, outW: number, outH: number, p: Placement): Placement {
  const { min, max } = zoomBounds(w, h, outW, outH);
  const zoom = clamp(finite(p.zoom, 1), min, max);
  const s = fitScale(w, h, outW, outH) * zoom;
  return { zoom, cx: clampCentre(finite(p.cx, 0.5), w * s, outW), cy: clampCentre(finite(p.cy, 0.5), h * s, outH) };
}

export const fillPlacement = (w: number, h: number, outW: number, outH: number): Placement =>
  clampPlacement(w, h, outW, outH, { zoom: fillZoom(w, h, outW, outH), cx: 0.5, cy: 0.5 });

/** Zoom while the image point under `anchor` (fractions of the frame) stays fixed, then clamp. */
export function zoomPlacementAt(w: number, h: number, outW: number, outH: number, p: Placement, zoom: number, anchor = { x: 0.5, y: 0.5 }): Placement {
  const current = clampPlacement(w, h, outW, outH, p);
  const { min, max } = zoomBounds(w, h, outW, outH);
  const next = clamp(finite(zoom, current.zoom), min, max);
  if (next === current.zoom) return current;
  const k = next / current.zoom;
  const ax = clamp(finite(anchor.x, 0.5), 0, 1), ay = clamp(finite(anchor.y, 0.5), 0, 1);
  return clampPlacement(w, h, outW, outH, { zoom: next, cx: ax + (current.cx - ax) * k, cy: ay + (current.cy - ay) * k });
}

/** Move by output pixels (positive = image moves right/down), then clamp. */
export function movePlacement(w: number, h: number, outW: number, outH: number, p: Placement, dx: number, dy: number): Placement {
  return clampPlacement(w, h, outW, outH, { ...p, cx: p.cx + finite(dx, 0) / outW, cy: p.cy + finite(dy, 0) / outH });
}

/** Whole source mapped to a scaled, possibly offset destination; drawFrame/exportFrame fill the background and the canvas clips. */
export function placementLayout(w: number, h: number, outW: number, outH: number, p: Placement): FrameLayout {
  const { zoom, cx, cy } = clampPlacement(w, h, outW, outH, p);
  const s = fitScale(w, h, outW, outH) * zoom;
  const dw = w * s, dh = h * s;
  return { sx: 0, sy: 0, sw: w, sh: h, dx: cx * outW - dw / 2, dy: cy * outH - dh / 2, dw, dh };
}
