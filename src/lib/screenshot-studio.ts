import { INPUT_MAX_BYTES, INPUT_MAX_PIXELS, type SquareFormat } from "./square";
import { ERR_BYTES, ERR_PIXELS, ERR_READ, isCandidateType } from "./image-input";

export { INPUT_MAX_BYTES, INPUT_MAX_PIXELS, ERR_BYTES, ERR_PIXELS, ERR_READ, isCandidateType };

export const STUDIO_MAX_SIDE = 4096;
export const MIN_CROP_PX = 12;

export type CropRect = { x: number; y: number; w: number; h: number };
export const FULL_CROP: CropRect = { x: 0, y: 0, w: 1, h: 1 };

export type AnnotationTool =
  | "select"
  | "rect"
  | "filled"
  | "ellipse"
  | "line"
  | "arrow"
  | "freehand"
  | "text"
  | "blur"
  | "pixelate"
  | "spotlight"
  | "counter"
  | "highlight"
  | "crop";

export type BaseAnnotation = {
  id: string;
  color: string;
  strokeWidth: number;
};

type LineGeometry = BaseAnnotation & {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** Signed curve midpoint offset normal to the shaft (0 = straight). */
  bend: number;
};

export type ArrowAnnotation = LineGeometry & { kind: "arrow" };
export type LineAnnotation = LineGeometry & { kind: "line" };
export type LineOrArrowAnnotation = ArrowAnnotation | LineAnnotation;

type BoxGeometry = BaseAnnotation & {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type BoxAnnotation =
  | (BoxGeometry & { kind: "rect" })
  | (BoxGeometry & { kind: "filled" })
  | (BoxGeometry & { kind: "ellipse" })
  | (BoxGeometry & { kind: "highlight" })
  | (BoxGeometry & { kind: "blur" })
  | (BoxGeometry & { kind: "pixelate" })
  | (BoxGeometry & { kind: "spotlight" });

export type CounterAnnotation = BaseAnnotation & {
  kind: "counter";
  x: number;
  y: number;
  step: number;
  scale?: number;
};

export type FreehandAnnotation = BaseAnnotation & {
  kind: "freehand";
  points: { x: number; y: number }[];
};

export type TextAnnotation = BaseAnnotation & {
  kind: "text";
  x: number;
  y: number;
  text: string;
  fontSize: number;
  pill: boolean;
  /** Explicit pill background hex when `pill` is true (defaults to `color`). */
  pillColor?: string | undefined;
  /** Explicit font color hex (defaults to auto-contrast when `pill` is true, or `color` when `pill` is false). */
  textColor?: string | undefined;
};

export type AnnotationItem =
  | LineOrArrowAnnotation
  | FreehandAnnotation
  | BoxAnnotation
  | CounterAnnotation
  | TextAnnotation;

export type HandleKind =
  | "move"
  | "start"
  | "mid"
  | "end"
  | "nw"
  | "n"
  | "ne"
  | "e"
  | "se"
  | "s"
  | "sw"
  | "w"
  | "scale";

export type GradientOrb = {
  x: number;
  y: number;
  r: number;
  color: string;
};

export type GradientPreset = {
  id: string;
  name: string;
  stops: readonly [string, string, string];
  angleDeg: number;
  orbs?: readonly GradientOrb[];
  css: string;
};

export type CustomGradientSpec = {
  start: string;
  mid: string;
  end: string;
  angle: number;
};

export const DEFAULT_CUSTOM_GRADIENT: CustomGradientSpec = {
  start: "#6366F1",
  mid: "#EC4899",
  end: "#FDBA74",
  angle: 135,
};

export function customGradientCss(spec: CustomGradientSpec): string {
  return `linear-gradient(${spec.angle}deg, ${spec.start} 0%, ${spec.mid} 52%, ${spec.end} 100%)`;
}

/* 20 CleanShot-inspired multi-stop & radial-mesh gradients (4 rows × 5 columns). */
export const GRADIENT_PRESETS: readonly GradientPreset[] = [
  {
    id: "candy-mesh",
    name: "Candy Mesh",
    stops: ["#7C3AED", "#EC4899", "#FCA5A5"],
    angleDeg: 135,
    orbs: [{ x: 0.85, y: 0.2, r: 0.7, color: "rgba(244, 63, 94, 0.55)" }],
    css: "radial-gradient(circle at 85% 20%, rgba(244,63,94,0.55), transparent 70%), linear-gradient(135deg, #7C3AED 0%, #EC4899 52%, #FCA5A5 100%)",
  },
  {
    id: "iris-glow",
    name: "Iris Glow",
    stops: ["#312E81", "#6D28D9", "#EC4899"],
    angleDeg: 140,
    orbs: [{ x: 0.2, y: 0.15, r: 0.65, color: "rgba(96, 165, 250, 0.45)" }],
    css: "radial-gradient(circle at 20% 15%, rgba(96,165,250,0.45), transparent 65%), linear-gradient(140deg, #312E81 0%, #6D28D9 52%, #EC4899 100%)",
  },
  {
    id: "ocean",
    name: "Sapphire",
    stops: ["#0EA5E9", "#2563EB", "#1E1B4B"],
    angleDeg: 135,
    orbs: [{ x: 0.25, y: 0.8, r: 0.65, color: "rgba(56, 189, 248, 0.45)" }],
    css: "radial-gradient(circle at 25% 80%, rgba(56,189,248,0.45), transparent 65%), linear-gradient(135deg, #0EA5E9 0%, #2563EB 52%, #1E1B4B 100%)",
  },
  {
    id: "aurora",
    name: "Mint Air",
    stops: ["#34D399", "#14B8A6", "#0284C7"],
    angleDeg: 135,
    orbs: [{ x: 0.8, y: 0.85, r: 0.65, color: "rgba(167, 243, 208, 0.45)" }],
    css: "radial-gradient(circle at 80% 85%, rgba(167,243,208,0.45), transparent 65%), linear-gradient(135deg, #34D399 0%, #14B8A6 52%, #0284C7 100%)",
  },
  {
    id: "rose",
    name: "Sunset Coral",
    stops: ["#FB7185", "#F43F5E", "#FB923C"],
    angleDeg: 130,
    orbs: [{ x: 0.15, y: 0.2, r: 0.6, color: "rgba(253, 186, 116, 0.5)" }],
    css: "radial-gradient(circle at 15% 20%, rgba(253,186,116,0.5), transparent 60%), linear-gradient(130deg, #FB7185 0%, #F43F5E 52%, #FB923C 100%)",
  },
  {
    id: "aurora-violet",
    name: "Violet Mesh",
    stops: ["#8B5CF6", "#C084FC", "#F472B6"],
    angleDeg: 125,
    orbs: [{ x: 0.18, y: 0.85, r: 0.65, color: "rgba(56, 189, 248, 0.5)" }],
    css: "radial-gradient(circle at 18% 85%, rgba(56,189,248,0.5), transparent 65%), linear-gradient(125deg, #8B5CF6 0%, #C084FC 52%, #F472B6 100%)",
  },
  {
    id: "mist",
    name: "Silver Mist",
    stops: ["#F8FAFC", "#E2E8F0", "#CBD5E1"],
    angleDeg: 135,
    css: "linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 52%, #CBD5E1 100%)",
  },
  {
    id: "frost-air",
    name: "Frost Slate",
    stops: ["#E2E8F0", "#CBD5E1", "#94A3B8"],
    angleDeg: 145,
    orbs: [{ x: 0.8, y: 0.2, r: 0.6, color: "rgba(248, 250, 252, 0.7)" }],
    css: "radial-gradient(circle at 80% 20%, rgba(248,250,252,0.7), transparent 60%), linear-gradient(145deg, #E2E8F0 0%, #CBD5E1 52%, #94A3B8 100%)",
  },
  {
    id: "ice",
    name: "Glacier",
    stops: ["#BAE6FD", "#60A5FA", "#818CF8"],
    angleDeg: 135,
    orbs: [{ x: 0.85, y: 0.8, r: 0.65, color: "rgba(224, 242, 254, 0.65)" }],
    css: "radial-gradient(circle at 85% 80%, rgba(224,242,254,0.65), transparent 65%), linear-gradient(135deg, #BAE6FD 0%, #60A5FA 52%, #818CF8 100%)",
  },
  {
    id: "obsidian",
    name: "Midnight Ink",
    stops: ["#09090B", "#1E1B4B", "#312E81"],
    angleDeg: 135,
    orbs: [{ x: 0.82, y: 0.22, r: 0.6, color: "rgba(99, 102, 241, 0.35)" }],
    css: "radial-gradient(circle at 82% 22%, rgba(99,102,241,0.35), transparent 60%), linear-gradient(135deg, #09090B 0%, #1E1B4B 52%, #312E81 100%)",
  },
  {
    id: "horizon-gold",
    name: "Coastal Dawn",
    stops: ["#0F172A", "#1D4ED8", "#FDE68A"],
    angleDeg: 165,
    css: "linear-gradient(165deg, #0F172A 0%, #1D4ED8 52%, #FDE68A 100%)",
  },
  {
    id: "cloud-blush",
    name: "Cloud Blush",
    stops: ["#93C5FD", "#E0E7FF", "#FBCFE8"],
    angleDeg: 150,
    css: "linear-gradient(150deg, #93C5FD 0%, #E0E7FF 52%, #FBCFE8 100%)",
  },
  {
    id: "lavender",
    name: "Soft Lilac",
    stops: ["#C4B5FD", "#DDD6FE", "#F5D0FE"],
    angleDeg: 135,
    orbs: [{ x: 0.25, y: 0.25, r: 0.6, color: "rgba(167, 139, 250, 0.5)" }],
    css: "radial-gradient(circle at 25% 25%, rgba(167,139,250,0.5), transparent 60%), linear-gradient(135deg, #C4B5FD 0%, #DDD6FE 52%, #F5D0FE 100%)",
  },
  {
    id: "crimson-ember",
    name: "Velvet Berry",
    stops: ["#4C0519", "#881337", "#334155"],
    angleDeg: 135,
    css: "linear-gradient(135deg, #4C0519 0%, #881337 52%, #334155 100%)",
  },
  {
    id: "twilight",
    name: "Neon Dusk",
    stops: ["#0F172A", "#6D28D9", "#EC4899"],
    angleDeg: 130,
    orbs: [{ x: 0.15, y: 0.85, r: 0.55, color: "rgba(14, 165, 233, 0.45)" }],
    css: "radial-gradient(circle at 15% 85%, rgba(14,165,233,0.45), transparent 55%), linear-gradient(130deg, #0F172A 0%, #6D28D9 52%, #EC4899 100%)",
  },
  {
    id: "cotton-candy",
    name: "Cotton Candy",
    stops: ["#A5B4FC", "#F9A8D4", "#FDE68A"],
    angleDeg: 125,
    css: "linear-gradient(125deg, #A5B4FC 0%, #F9A8D4 52%, #FDE68A 100%)",
  },
  {
    id: "prism-flame",
    name: "Ruby Flare",
    stops: ["#DC2626", "#F43F5E", "#FDE047"],
    angleDeg: 135,
    orbs: [{ x: 0.8, y: 0.2, r: 0.6, color: "rgba(244, 63, 94, 0.65)" }],
    css: "radial-gradient(circle at 80% 20%, rgba(244,63,94,0.65), transparent 60%), linear-gradient(135deg, #DC2626 0%, #F43F5E 52%, #FDE047 100%)",
  },
  {
    id: "pine",
    name: "Northern Light",
    stops: ["#0F766E", "#0284C7", "#FDE047"],
    angleDeg: 155,
    orbs: [{ x: 0.2, y: 0.2, r: 0.65, color: "rgba(15, 23, 42, 0.65)" }],
    css: "radial-gradient(circle at 20% 20%, rgba(15,23,42,0.65), transparent 65%), linear-gradient(155deg, #0F766E 0%, #0284C7 52%, #FDE047 100%)",
  },
  {
    id: "nebula",
    name: "Nebula",
    stops: ["#18181B", "#9F1239", "#FB7185"],
    angleDeg: 140,
    orbs: [{ x: 0.75, y: 0.25, r: 0.55, color: "rgba(139, 92, 246, 0.45)" }],
    css: "radial-gradient(circle at 75% 25%, rgba(139,92,246,0.45), transparent 55%), linear-gradient(140deg, #18181B 0%, #9F1239 52%, #FB7185 100%)",
  },
  {
    id: "bloom",
    name: "Clean Bloom",
    stops: ["#818CF8", "#F472B6", "#FDBA74"],
    angleDeg: 135,
    orbs: [
      { x: 0.82, y: 0.18, r: 0.7, color: "rgba(236, 72, 153, 0.58)" },
      { x: 0.18, y: 0.82, r: 0.7, color: "rgba(99, 102, 241, 0.52)" },
    ],
    css: "radial-gradient(circle at 82% 18%, rgba(236,72,153,0.58), transparent 70%), radial-gradient(circle at 18% 82%, rgba(99,102,241,0.52), transparent 70%), linear-gradient(135deg, #818CF8 0%, #F472B6 52%, #FDBA74 100%)",
  },
] as const;

export const WALLPAPER_PRESETS = [
  {
    id: "wp-horizon",
    name: "Sonoma Horizon",
    css: "linear-gradient(165deg, #60A5FA 0%, #818CF8 42%, #F472B6 76%, #FDBA74 100%)",
  },
  {
    id: "wp-dune",
    name: "Silk Dune",
    css: "linear-gradient(150deg, #E2E8F0 0%, #CBD5E1 48%, #94A3B8 100%)",
  },
  {
    id: "wp-beams",
    name: "Noir Beams",
    css: "linear-gradient(135deg, #09090B 0%, #18181B 50%, #27272A 100%)",
  },
] as const;

export const BLURRED_PRESETS = [
  {
    id: "blur-soft",
    name: "Soft Blur",
    css: "linear-gradient(145deg, #93C5FD 0%, #C4B5FD 55%, #E2E8F0 100%)",
  },
  {
    id: "blur-vivid",
    name: "Vivid Blur",
    css: "linear-gradient(145deg, #1E293B 0%, #3B82F6 50%, #0F172A 100%)",
  },
  {
    id: "blur-dark",
    name: "Dark Blur",
    css: "linear-gradient(145deg, #09090B 0%, #1E293B 55%, #09090B 100%)",
  },
] as const;

/* Two 8-slot rows in CleanShot's Plain Color section: Row 1 bold + Transparent, Row 2 pastel + Custom picker. */
export const PLAIN_COLORS_PRIMARY = [
  { id: "solid-black", name: "Black", color: "#09090B" },
  { id: "solid-white", name: "White", color: "#FFFFFF" },
  { id: "solid-rose", name: "Red", color: "#EF4444" },
  { id: "solid-orange", name: "Orange", color: "#F97316" },
  { id: "solid-amber", name: "Yellow", color: "#EAB308" },
  { id: "solid-emerald", name: "Green", color: "#10B981" },
  { id: "solid-blue", name: "Blue", color: "#2563EB" },
] as const;

export const PLAIN_COLORS_PASTEL = [
  { id: "solid-dark", name: "Charcoal", color: "#27272A" },
  { id: "solid-zinc", name: "Soft Gray", color: "#F4F4F5" },
  { id: "solid-pastel-rose", name: "Soft Rose", color: "#FDA4AF" },
  { id: "solid-pastel-peach", name: "Soft Peach", color: "#FDBA74" },
  { id: "solid-pastel-cream", name: "Soft Cream", color: "#FDE68A" },
  { id: "solid-pastel-mint", name: "Soft Mint", color: "#A7F3D0" },
  { id: "solid-pastel-sky", name: "Soft Sky", color: "#BFDBFE" },
] as const;

export const PLAIN_COLORS = [...PLAIN_COLORS_PRIMARY, ...PLAIN_COLORS_PASTEL] as const;

export const ANNOTATION_COLORS = [
  { id: "red", label: "Red", hex: "#EF4444" },
  { id: "blue", label: "Blue", hex: "#2563EB" },
  { id: "emerald", label: "Green", hex: "#10B981" },
  { id: "violet", label: "Purple", hex: "#8B5CF6" },
  { id: "amber", label: "Yellow", hex: "#F59E0B" },
  { id: "dark", label: "Black", hex: "#18181B" },
  { id: "white", label: "White", hex: "#FFFFFF" },
] as const;

export type StudioRatioId = "auto" | "16:9" | "4:3" | "3:2" | "1:1" | "4:5" | "9:16";

export const STUDIO_RATIOS: readonly { id: StudioRatioId; label: string; w?: number; h?: number }[] = [
  { id: "auto", label: "Auto" },
  { id: "16:9", label: "16:9", w: 16, h: 9 },
  { id: "4:3", label: "4:3", w: 4, h: 3 },
  { id: "3:2", label: "3:2", w: 3, h: 2 },
  { id: "1:1", label: "1:1", w: 1, h: 1 },
  { id: "4:5", label: "4:5", w: 4, h: 5 },
  { id: "9:16", label: "9:16", w: 9, h: 16 },
] as const;

export type StudioWindowBar = "none" | "light" | "dark";

export type StudioStyle = {
  backgroundId: string;
  customColor: string;
  customGradient: CustomGradientSpec;
  padding: number;
  autoBalance: boolean;
  shadow: number;
  radius: number;
  ratio: StudioRatioId;
  format: SquareFormat;
  windowBar?: StudioWindowBar | undefined;
  glassBezel?: boolean | undefined;
};

export const DEFAULT_STUDIO_STYLE: StudioStyle = {
  backgroundId: "pine",
  customColor: "#F4F4F5",
  customGradient: DEFAULT_CUSTOM_GRADIENT,
  padding: 48,
  autoBalance: false,
  shadow: 40,
  radius: 12,
  ratio: "auto",
  format: "png",
  windowBar: "none",
  glassBezel: false,
};

export type SavedStylePreset = {
  id: string;
  name: string;
  style: Omit<StudioStyle, "format">;
};

export type BalanceAnalysis = {
  edgeColor: string;
  shiftX: number;
  shiftY: number;
  isUniformEdge: boolean;
  hasTransparency: boolean;
};

export const DEFAULT_BALANCE: BalanceAnalysis = {
  edgeColor: "#FFFFFF",
  shiftX: 0,
  shiftY: 0,
  isUniformEdge: true,
  hasTransparency: false,
};

export type DragModifiers = {
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  ctrlKey?: boolean;
};

export type ActiveAngleGuide = {
  anchorX: number;
  anchorY: number;
  targetX: number;
  targetY: number;
  angleDeg: number;
  snapped: boolean;
};

export type ActiveSizeGuide = {
  x: number;
  y: number;
  w: number;
  h: number;
  widthPx: number;
  heightPx: number;
};

export type StudioGeometry = {
  outW: number;
  outH: number;
  scale: number;
  cardX: number;
  cardY: number;
  cardW: number;
  cardH: number;
  cardRadius: number;
  imgX: number;
  imgY: number;
  imgW: number;
  imgH: number;
  sx: number;
  sy: number;
  sw: number;
  sh: number;
};

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const clampRange = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(Math.max(lo, hi), v));

export type AnnotationBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

export const DEFAULT_ANNOTATION_BOUNDS: AnnotationBounds = {
  minX: 0,
  maxX: 1,
  minY: 0,
  maxY: 1,
};

export function freehandBounds(points: readonly { x: number; y: number }[]): {
  x: number;
  y: number;
  w: number;
  h: number;
} {
  if (points.length === 0) return { x: 0, y: 0, w: 0.01, h: 0.01 };
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const pt of points) {
    if (pt.x < minX) minX = pt.x;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.y > maxY) maxY = pt.y;
  }
  return {
    x: minX,
    y: minY,
    w: Math.max(0.008, maxX - minX),
    h: Math.max(0.008, maxY - minY),
  };
}

export function translateAnnotation(item: AnnotationItem, dx: number, dy: number, bounds: AnnotationBounds): AnnotationItem {
  if (item.kind === "arrow" || item.kind === "line") {
    const mx = clampRange(dx, bounds.minX - Math.min(item.x1, item.x2), bounds.maxX - Math.max(item.x1, item.x2));
    const my = clampRange(dy, bounds.minY - Math.min(item.y1, item.y2), bounds.maxY - Math.max(item.y1, item.y2));
    return { ...item, x1: item.x1 + mx, y1: item.y1 + my, x2: item.x2 + mx, y2: item.y2 + my };
  }
  if (item.kind === "freehand") {
    const b = freehandBounds(item.points);
    const mx = clampRange(dx, bounds.minX - b.x, bounds.maxX - (b.x + b.w));
    const my = clampRange(dy, bounds.minY - b.y, bounds.maxY - (b.y + b.h));
    return {
      ...item,
      points: item.points.map(p => ({ x: p.x + mx, y: p.y + my })),
    };
  }
  const w = "w" in item ? item.w : 0;
  const h = "h" in item ? item.h : 0;
  return { ...item, x: clampRange(item.x + dx, bounds.minX, bounds.maxX - w), y: clampRange(item.y + dy, bounds.minY, bounds.maxY - h) };
}

/**
 * Full-canvas normalized bounds in screenshot-anchored UV coordinates:
 * `(0, 0)..(1, 1)` is the inner screenshot; negative / `> 1` values cover the entire padded background frame `(0, 0)..(outW, outH)`.
 */
export function studioAnnotationBounds(
  geometry: Pick<StudioGeometry, "outW" | "outH" | "imgX" | "imgY" | "imgW" | "imgH">,
): AnnotationBounds {
  const safeW = Math.max(1, geometry.imgW);
  const safeH = Math.max(1, geometry.imgH);
  return {
    minX: -geometry.imgX / safeW,
    maxX: (geometry.outW - geometry.imgX) / safeW,
    minY: -geometry.imgY / safeH,
    maxY: (geometry.outH - geometry.imgY) / safeH,
  };
}

export function normalizeBox(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  bounds: AnnotationBounds = DEFAULT_ANNOTATION_BOUNDS,
) {
  const x = clampRange(Math.min(x1, x2), bounds.minX, bounds.maxX);
  const y = clampRange(Math.min(y1, y2), bounds.minY, bounds.maxY);
  const right = clampRange(Math.max(x1, x2), bounds.minX, bounds.maxX);
  const bottom = clampRange(Math.max(y1, y2), bounds.minY, bounds.maxY);
  return { x, y, w: Math.max(0.008, right - x), h: Math.max(0.008, bottom - y) };
}

export function sourceCropPixels(naturalWidth: number, naturalHeight: number, crop: CropRect) {
  const sx = Math.max(0, Math.min(naturalWidth - 1, Math.round(clamp01(crop.x) * naturalWidth)));
  const sy = Math.max(0, Math.min(naturalHeight - 1, Math.round(clamp01(crop.y) * naturalHeight)));
  const maxW = Math.max(1, naturalWidth - sx);
  const maxH = Math.max(1, naturalHeight - sy);
  const sw = Math.max(1, Math.min(maxW, Math.round(clamp01(crop.w) * naturalWidth)));
  const sh = Math.max(1, Math.min(maxH, Math.round(clamp01(crop.h) * naturalHeight)));
  return { sx, sy, sw, sh };
}

export function doesStyleMatchPreset(style: StudioStyle, presetStyle: Omit<StudioStyle, "format">): boolean {
  if (style.backgroundId !== presetStyle.backgroundId) return false;
  if (style.backgroundId !== "none") {
    if (
      style.padding !== presetStyle.padding ||
      style.radius !== presetStyle.radius ||
      style.shadow !== presetStyle.shadow ||
      style.ratio !== presetStyle.ratio ||
      style.autoBalance !== presetStyle.autoBalance ||
      (style.windowBar ?? "none") !== (presetStyle.windowBar ?? "none") ||
      Boolean(style.glassBezel) !== Boolean(presetStyle.glassBezel)
    ) {
      return false;
    }
  }
  if (style.backgroundId === "custom") {
    return style.customColor.trim().toUpperCase() === presetStyle.customColor.trim().toUpperCase();
  }
  if (style.backgroundId === "custom-gradient") {
    return (
      style.customGradient.angle === presetStyle.customGradient.angle &&
      style.customGradient.start.trim().toUpperCase() === presetStyle.customGradient.start.trim().toUpperCase() &&
      style.customGradient.mid.trim().toUpperCase() === presetStyle.customGradient.mid.trim().toUpperCase() &&
      style.customGradient.end.trim().toUpperCase() === presetStyle.customGradient.end.trim().toUpperCase()
    );
  }
  return true;
}

/**
 * Re-projects normalized `[0..1]` annotations from `fromCrop` into `toCrop` via full-image UV space
 * so cropping or restoring full image keeps annotations pinned to their exact source pixels.
 */
export function reprojectAnnotationsForCrop(
  annotations: readonly AnnotationItem[],
  fromCrop: CropRect,
  toCrop: CropRect,
  naturalWidth = 1,
  naturalHeight = 1,
  fromBounds: AnnotationBounds = DEFAULT_ANNOTATION_BOUNDS,
  toBounds: AnnotationBounds = DEFAULT_ANNOTATION_BOUNDS,
): AnnotationItem[] {
  const fromW = Math.max(1e-6, fromCrop.w);
  const fromH = Math.max(1e-6, fromCrop.h);
  const toW = Math.max(1e-6, toCrop.w);
  const toH = Math.max(1e-6, toCrop.h);
  const srcW = Math.max(1, naturalWidth);
  const srcH = Math.max(1, naturalHeight);
  const fromDiagPx = Math.hypot(fromW * srcW, fromH * srcH);
  const toDiagPx = Math.max(1e-6, Math.hypot(toW * srcW, toH * srcH));
  const diagRatio = fromDiagPx / toDiagPx;

  const mapInnerX = (nx: number) => (fromCrop.x + nx * fromW - toCrop.x) / toW;
  const mapInnerY = (ny: number) => (fromCrop.y + ny * fromH - toCrop.y) / toH;

  const mapWithMarginX = (nx: number) => {
    if (nx < 0 && fromBounds.minX < -1e-6) {
      return clampRange((nx / fromBounds.minX) * toBounds.minX, toBounds.minX, 0);
    }
    if (nx > 1 && fromBounds.maxX > 1 + 1e-6) {
      return clampRange(1 + ((nx - 1) / (fromBounds.maxX - 1)) * Math.max(0, toBounds.maxX - 1), 1, toBounds.maxX);
    }
    return clampRange(mapInnerX(nx), toBounds.minX, toBounds.maxX);
  };

  const mapWithMarginY = (ny: number) => {
    if (ny < 0 && fromBounds.minY < -1e-6) {
      return clampRange((ny / fromBounds.minY) * toBounds.minY, toBounds.minY, 0);
    }
    if (ny > 1 && fromBounds.maxY > 1 + 1e-6) {
      return clampRange(1 + ((ny - 1) / (fromBounds.maxY - 1)) * Math.max(0, toBounds.maxY - 1), 1, toBounds.maxY);
    }
    return clampRange(mapInnerY(ny), toBounds.minY, toBounds.maxY);
  };

  const out: AnnotationItem[] = [];
  for (const item of annotations) {
    if (item.kind === "counter" || item.kind === "text") {
      const inMargin = item.x < -0.001 || item.x > 1.001 || item.y < -0.001 || item.y > 1.001;
      if (inMargin) {
        out.push({
          ...item,
          x: mapWithMarginX(item.x),
          y: mapWithMarginY(item.y),
        });
        continue;
      }
      const ux = mapInnerX(item.x);
      const uy = mapInnerY(item.y);
      if (ux < -0.02 || ux > 1.02 || uy < -0.02 || uy > 1.02) continue;
      out.push({ ...item, x: clamp01(ux), y: clamp01(uy) });
      continue;
    }

    if (item.kind === "freehand") {
      if (item.points.length === 0) continue;
      const inMargin = item.points.some(
        p => p.x < -0.001 || p.x > 1.001 || p.y < -0.001 || p.y > 1.001,
      );
      if (inMargin) {
        out.push({
          ...item,
          points: item.points.map(p => ({
            x: mapWithMarginX(p.x),
            y: mapWithMarginY(p.y),
          })),
        });
        continue;
      }
      const mapped = item.points.map(p => ({
        x: mapInnerX(p.x),
        y: mapInnerY(p.y),
      }));
      const b = freehandBounds(mapped);
      if (b.x > 1.02 || b.y > 1.02 || b.x + b.w < -0.02 || b.y + b.h < -0.02) continue;
      out.push({
        ...item,
        points: mapped.map(p => ({ x: clamp01(p.x), y: clamp01(p.y) })),
      });
      continue;
    }

    if (item.kind === "arrow" || item.kind === "line") {
      const inMargin =
        item.x1 < -0.001 ||
        item.x1 > 1.001 ||
        item.y1 < -0.001 ||
        item.y1 > 1.001 ||
        item.x2 < -0.001 ||
        item.x2 > 1.001 ||
        item.y2 < -0.001 ||
        item.y2 > 1.001;
      if (inMargin) {
        const nx1 = mapWithMarginX(item.x1);
        const ny1 = mapWithMarginY(item.y1);
        const nx2 = mapWithMarginX(item.x2);
        const ny2 = mapWithMarginY(item.y2);
        if (Math.hypot(nx2 - nx1, ny2 - ny1) < 0.008) continue;
        out.push({
          ...item,
          x1: nx1,
          y1: ny1,
          x2: nx2,
          y2: ny2,
          bend: Math.max(-0.45, Math.min(0.45, item.bend * diagRatio)),
        });
        continue;
      }

      const x1 = mapInnerX(item.x1);
      const y1 = mapInnerY(item.y1);
      const x2 = mapInnerX(item.x2);
      const y2 = mapInnerY(item.y2);
      let t0 = 0;
      let t1 = 1;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const clipEdge = (p: number, q: number) => {
        if (Math.abs(p) < 1e-9) return q >= 0;
        const r = q / p;
        if (p < 0) {
          if (r > t1) return false;
          if (r > t0) t0 = r;
        } else {
          if (r < t0) return false;
          if (r < t1) t1 = r;
        }
        return true;
      };
      if (!clipEdge(-dx, x1) || !clipEdge(dx, 1 - x1) || !clipEdge(-dy, y1) || !clipEdge(dy, 1 - y1)) {
        continue;
      }
      const nx1 = clamp01(x1 + t0 * dx);
      const ny1 = clamp01(y1 + t0 * dy);
      const nx2 = clamp01(x1 + t1 * dx);
      const ny2 = clamp01(y1 + t1 * dy);
      if (Math.hypot(nx2 - nx1, ny2 - ny1) < 0.008) continue;
      const chordScale = Math.max(0.1, t1 - t0);
      out.push({
        ...item,
        x1: nx1,
        y1: ny1,
        x2: nx2,
        y2: ny2,
        bend: item.bend * diagRatio * chordScale,
      });
      continue;
    }

    const inMargin =
      item.x < -0.001 ||
      item.y < -0.001 ||
      item.x + item.w > 1.001 ||
      item.y + item.h > 1.001;
    if (inMargin) {
      const cx1 = mapWithMarginX(item.x);
      const cy1 = mapWithMarginY(item.y);
      const cx2 = mapWithMarginX(item.x + item.w);
      const cy2 = mapWithMarginY(item.y + item.h);
      if (cx2 - cx1 < 0.008 || cy2 - cy1 < 0.008) continue;
      out.push({
        ...item,
        x: cx1,
        y: cy1,
        w: cx2 - cx1,
        h: cy2 - cy1,
      });
      continue;
    }

    const x1 = mapInnerX(item.x);
    const y1 = mapInnerY(item.y);
    const x2 = mapInnerX(item.x + item.w);
    const y2 = mapInnerY(item.y + item.h);
    const cx1 = clamp01(x1);
    const cy1 = clamp01(y1);
    const cx2 = clamp01(x2);
    const cy2 = clamp01(y2);
    if (cx2 - cx1 < 0.008 || cy2 - cy1 < 0.008) continue;
    out.push({
      ...item,
      x: cx1,
      y: cy1,
      w: cx2 - cx1,
      h: cy2 - cy1,
    });
  }
  return out;
}

export function analyzeAutoBalance(
  img: HTMLImageElement,
  naturalWidth: number,
  naturalHeight: number,
  crop: CropRect,
): BalanceAnalysis {
  if (typeof document === "undefined") return DEFAULT_BALANCE;
  try {
    const { sx, sy, sw, sh } = sourceCropPixels(naturalWidth, naturalHeight, crop);
    const sampleW = Math.max(8, Math.min(96, sw));
    const sampleH = Math.max(8, Math.min(96, sh));
    const canvas = document.createElement("canvas");
    canvas.width = sampleW;
    canvas.height = sampleH;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return DEFAULT_BALANCE;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sampleW, sampleH);
    const data = ctx.getImageData(0, 0, sampleW, sampleH).data;

    let hasTransparency = false;
    for (let i = 3; i < data.length; i += 4) {
      if ((data[i] ?? 255) < 250) {
        hasTransparency = true;
        break;
      }
    }

    const edgeSamples: [number, number, number][] = [];
    type SideBucket = { r: number; g: number; b: number; n: number };
    const sideSums: [SideBucket, SideBucket, SideBucket, SideBucket] = [
      { r: 0, g: 0, b: 0, n: 0 }, // top
      { r: 0, g: 0, b: 0, n: 0 }, // bottom
      { r: 0, g: 0, b: 0, n: 0 }, // left
      { r: 0, g: 0, b: 0, n: 0 }, // right
    ];

    const samplePixel = (x: number, y: number, side: 0 | 1 | 2 | 3) => {
      const idx = (y * sampleW + x) * 4;
      if ((data[idx + 3] ?? 255) < 235) return;
      const r = data[idx] ?? 255;
      const g = data[idx + 1] ?? 255;
      const b = data[idx + 2] ?? 255;
      edgeSamples.push([r, g, b]);
      const bucket = sideSums[side];
      bucket.r += r;
      bucket.g += g;
      bucket.b += b;
      bucket.n++;
    };

    for (let x = 0; x < sampleW; x++) {
      samplePixel(x, 0, 0);
      samplePixel(x, sampleH - 1, 1);
    }
    for (let y = 1; y < sampleH - 1; y++) {
      samplePixel(0, y, 2);
      samplePixel(sampleW - 1, y, 3);
    }

    if (edgeSamples.length === 0) {
      return { ...DEFAULT_BALANCE, isUniformEdge: false, hasTransparency };
    }

    let rSum = 0;
    let gSum = 0;
    let bSum = 0;
    for (const [r, g, b] of edgeSamples) {
      rSum += r;
      gSum += g;
      bSum += b;
    }
    const er = Math.round(rSum / edgeSamples.length);
    const eg = Math.round(gSum / edgeSamples.length);
    const eb = Math.round(bSum / edgeSamples.length);
    const edgeColor = `rgb(${er}, ${eg}, ${eb})`;

    // Verify that all 4 sides actually share a single flat UI background color (rejects photos & illustrations).
    let maxSideDiff = 0;
    let populatedSides = 0;
    for (const side of sideSums) {
      if (side.n === 0) continue;
      populatedSides++;
      const d =
        Math.abs(side.r / side.n - er) +
        Math.abs(side.g / side.n - eg) +
        Math.abs(side.b / side.n - eb);
      if (d > maxSideDiff) maxSideDiff = d;
    }
    let withinTolerance = 0;
    for (const [r, g, b] of edgeSamples) {
      if (Math.abs(r - er) + Math.abs(g - eg) + Math.abs(b - eb) <= 24) {
        withinTolerance++;
      }
    }
    const uniformFraction = withinTolerance / edgeSamples.length;
    const isUniformEdge = !hasTransparency && populatedSides === 4 && maxSideDiff <= 18 && uniformFraction >= 0.88;

    if (!isUniformEdge) {
      return { edgeColor, shiftX: 0, shiftY: 0, isUniformEdge: false, hasTransparency };
    }

    let weightSum = 0;
    let wx = 0;
    let wy = 0;
    for (let y = 0; y < sampleH; y++) {
      for (let x = 0; x < sampleW; x++) {
        const idx = (y * sampleW + x) * 4;
        const diff =
          Math.abs((data[idx] ?? er) - er) +
          Math.abs((data[idx + 1] ?? eg) - eg) +
          Math.abs((data[idx + 2] ?? eb) - eb);
        if (diff > 36) {
          weightSum += diff;
          wx += ((x + 0.5) / sampleW - 0.5) * diff;
          wy += ((y + 0.5) / sampleH - 0.5) * diff;
        }
      }
    }
    if (weightSum <= 0) return { edgeColor, shiftX: 0, shiftY: 0, isUniformEdge: true, hasTransparency };
    return {
      edgeColor,
      shiftX: Math.max(-0.045, Math.min(0.045, -(wx / weightSum) * 0.32)),
      shiftY: Math.max(-0.045, Math.min(0.045, -(wy / weightSum) * 0.32)),
      isUniformEdge: true,
      hasTransparency,
    };
  } catch {
    return DEFAULT_BALANCE;
  }
}

export function computeStudioLayout(
  naturalWidth: number,
  naturalHeight: number,
  crop: CropRect,
  style: StudioStyle,
  balance: BalanceAnalysis = DEFAULT_BALANCE,
): StudioGeometry {
  const { sx, sy, sw, sh } = sourceCropPixels(naturalWidth, naturalHeight, crop);
  const noFrame = style.backgroundId === "none";
  const pad = noFrame ? 0 : Math.max(0, Math.min(200, style.padding));
  const useBalance = !noFrame && style.autoBalance && pad > 0 && balance.isUniformEdge;
  const autoInset = useBalance ? Math.round(Math.min(sw, sh) * 0.02) : 0;
  const extraX = useBalance ? Math.round(Math.abs(balance.shiftX) * sw) : 0;
  const extraY = useBalance ? Math.round(Math.abs(balance.shiftY) * sh) : 0;
  const barH = !noFrame && (style.windowBar === "light" || style.windowBar === "dark") ? 32 : 0;

  const cardLogicalW = sw + (autoInset + extraX) * 2;
  const cardLogicalH = sh + barH + (autoInset + extraY) * 2;

  let frameLogicalW = cardLogicalW + pad * 2;
  let frameLogicalH = cardLogicalH + pad * 2;

  if (!noFrame) {
    const ratioSpec = STUDIO_RATIOS.find(r => r.id === style.ratio);
    if (ratioSpec?.w && ratioSpec?.h) {
      const targetAspect = ratioSpec.w / ratioSpec.h;
      if (frameLogicalW / frameLogicalH > targetAspect) {
        frameLogicalH = frameLogicalW / targetAspect;
      } else {
        frameLogicalW = frameLogicalH * targetAspect;
      }
    }
  }

  let outW = Math.max(1, Math.round(frameLogicalW));
  let outH = Math.max(1, Math.round(frameLogicalH));
  if (outW > STUDIO_MAX_SIDE || outH > STUDIO_MAX_SIDE) {
    const factor = STUDIO_MAX_SIDE / Math.max(outW, outH);
    outW = Math.max(1, Math.round(outW * factor));
    outH = Math.max(1, Math.round(outH * factor));
  }
  const scale = Math.min(outW / frameLogicalW, outH / frameLogicalH);

  const cardW = Math.max(1, cardLogicalW * scale);
  const cardH = Math.max(1, cardLogicalH * scale);
  const shadowLift = useBalance ? Math.min(pad * 0.12, (style.shadow / 100) * 8) * scale : 0;
  const cardX = (outW - cardW) / 2;
  const cardY = (outH - cardH) / 2 - shadowLift;
  const cardRadius = noFrame ? 0 : Math.min(cardW / 2, cardH / 2, Math.max(0, style.radius) * scale);

  const imgW = Math.max(1, sw * scale);
  const imgH = Math.max(1, sh * scale);
  const barScaled = barH * scale;
  const offsetX = useBalance ? balance.shiftX * sw * scale : 0;
  const offsetY = useBalance ? balance.shiftY * sh * scale : 0;
  const imgX = cardX + (cardW - imgW) / 2 + offsetX;
  const imgY = cardY + barScaled + (cardH - barScaled - imgH) / 2 + offsetY;

  return {
    outW,
    outH,
    scale,
    cardX,
    cardY,
    cardW,
    cardH,
    cardRadius,
    imgX,
    imgY,
    imgW,
    imgH,
    sx,
    sy,
    sw,
    sh,
  };
}

/**
 * Snaps a line or arrow endpoint in true image pixel space:
 * - Hold `Shift`: locks angle in exact 15° increments (0°, 15°, 30°, 45°, 60°, 75°, 90°…).
 * - Default (unless `Alt`/`Meta`/`Ctrl` held): softly magnet-snaps within ±4° of 0° horizontal or 90° vertical.
 * - Ray-clamps against image bounds so clamping never distorts the snapped angle.
 */
export function snapLineEndpoint(
  anchorNx: number,
  anchorNy: number,
  rawTargetNx: number,
  rawTargetNy: number,
  imgW: number,
  imgH: number,
  mods: DragModifiers = {},
  bounds: AnnotationBounds = DEFAULT_ANNOTATION_BOUNDS,
): { nx: number; ny: number; angleDeg: number; snapped: boolean } {
  const safeW = Math.max(1, imgW);
  const safeH = Math.max(1, imgH);
  const minX = bounds.minX * safeW;
  const maxX = bounds.maxX * safeW;
  const minY = bounds.minY * safeH;
  const maxY = bounds.maxY * safeH;
  const ax = clampRange(anchorNx, bounds.minX, bounds.maxX) * safeW;
  const ay = clampRange(anchorNy, bounds.minY, bounds.maxY) * safeH;
  const tx = clampRange(rawTargetNx, bounds.minX, bounds.maxX) * safeW;
  const ty = clampRange(rawTargetNy, bounds.minY, bounds.maxY) * safeH;
  const dx = tx - ax;
  const dy = ty - ay;
  const rawLen = Math.hypot(dx, dy);
  if (rawLen < 0.5) {
    return {
      nx: clampRange(rawTargetNx, bounds.minX, bounds.maxX),
      ny: clampRange(rawTargetNy, bounds.minY, bounds.maxY),
      angleDeg: 0,
      snapped: false,
    };
  }

  const rawDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
  let deg = rawDeg;
  let snapped = false;

  if (mods.shiftKey) {
    deg = Math.round(rawDeg / 15) * 15;
    snapped = true;
  } else if (!mods.altKey && !mods.metaKey && !mods.ctrlKey && rawLen >= 10) {
    const cardinal = Math.round(rawDeg / 90) * 90;
    if (Math.abs(rawDeg - cardinal) <= 4) {
      deg = cardinal;
      snapped = true;
    }
  }

  const rad = (deg * Math.PI) / 180;
  let ux = Math.cos(rad);
  let uy = Math.sin(rad);
  if (Math.abs(ux) < 1e-9) ux = 0;
  if (Math.abs(uy) < 1e-9) uy = 0;

  let maxLen = rawLen;
  if (ux > 0) maxLen = Math.min(maxLen, (maxX - ax) / ux);
  else if (ux < 0) maxLen = Math.min(maxLen, (minX - ax) / ux);
  if (uy > 0) maxLen = Math.min(maxLen, (maxY - ay) / uy);
  else if (uy < 0) maxLen = Math.min(maxLen, (minY - ay) / uy);
  const finalLen = Math.max(0, maxLen);

  const nx = clampRange((ax + ux * finalLen) / safeW, bounds.minX, bounds.maxX);
  const ny = clampRange((ay + uy * finalLen) / safeH, bounds.minY, bounds.maxY);
  const angleDeg = Math.round((Math.atan2(Math.abs(uy), Math.abs(ux)) * 180) / Math.PI);
  return { nx, ny, angleDeg, snapped };
}

/**
 * Creates a box in true pixel space with Figma / Photoshop modifier support:
 * - `Shift`: 1:1 geometric square / perfect circle in pixel space.
 * - `Alt` (`Option`): draws symmetrically outward from the center start point.
 */
export function computeBoxCreation(
  startNx: number,
  startNy: number,
  curNx: number,
  curNy: number,
  imgW: number,
  imgH: number,
  mods: DragModifiers = {},
  bounds: AnnotationBounds = DEFAULT_ANNOTATION_BOUNDS,
): { x: number; y: number; w: number; h: number } {
  const safeW = Math.max(1, imgW);
  const safeH = Math.max(1, imgH);
  const minX = bounds.minX * safeW;
  const maxX = bounds.maxX * safeW;
  const minY = bounds.minY * safeH;
  const maxY = bounds.maxY * safeH;
  const spanW = Math.max(1, maxX - minX);
  const spanH = Math.max(1, maxY - minY);
  const sx = clampRange(startNx, bounds.minX, bounds.maxX) * safeW;
  const sy = clampRange(startNy, bounds.minY, bounds.maxY) * safeH;
  const cx = clampRange(curNx, bounds.minX, bounds.maxX) * safeW;
  const cy = clampRange(curNy, bounds.minY, bounds.maxY) * safeH;
  let dx = cx - sx;
  let dy = cy - sy;
  const minPx = Math.max(6, Math.min(safeW, safeH) * 0.008);

  if (mods.shiftKey) {
    let side = Math.max(minPx, Math.max(Math.abs(dx), Math.abs(dy)));
    if (mods.altKey) {
      side = Math.min(side, sx - minX, maxX - sx, sy - minY, maxY - sy);
    } else {
      const availX = dx >= 0 ? maxX - sx : sx - minX;
      const availY = dy >= 0 ? maxY - sy : sy - minY;
      side = Math.min(side, availX, availY);
    }
    dx = (dx < 0 ? -1 : 1) * side;
    dy = (dy < 0 ? -1 : 1) * side;
  }

  let x1: number;
  let x2: number;
  let y1: number;
  let y2: number;
  if (mods.altKey) {
    const hw = Math.min(Math.max(minPx / 2, Math.abs(dx)), sx - minX, maxX - sx);
    const hh = Math.min(Math.max(minPx / 2, Math.abs(dy)), sy - minY, maxY - sy);
    x1 = sx - hw;
    x2 = sx + hw;
    y1 = sy - hh;
    y2 = sy + hh;
  } else {
    x1 = Math.max(minX, Math.min(sx, sx + dx));
    x2 = Math.min(maxX, Math.max(sx, sx + dx));
    y1 = Math.max(minY, Math.min(sy, sy + dy));
    y2 = Math.min(maxY, Math.max(sy, sy + dy));
  }

  const wPx = Math.min(spanW, Math.max(minPx, x2 - x1));
  const hPx = Math.min(spanH, Math.max(minPx, y2 - y1));
  return {
    x: clampRange(Math.min(maxX - wPx, x1) / safeW, bounds.minX, bounds.maxX),
    y: clampRange(Math.min(maxY - hPx, y1) / safeH, bounds.minY, bounds.maxY),
    w: clampRange(wPx / safeW, 0.004, bounds.maxX - bounds.minX),
    h: clampRange(hPx / safeH, 0.004, bounds.maxY - bounds.minY),
  };
}

/**
 * Resizes an existing box in true pixel space (tldraw / Excalidraw / Photoshop / Figma hybrid):
 * - 4 Corner handles (`nw, ne, se, sw`): proportional aspect-locked scaling by default; hold `Shift` for free aspect; hold `Alt`/`Option` to scale symmetrically from center.
 * - 4 Edge handles (`n, e, s, w`): 1D axis stretch by default; hold `Alt`/`Option` for symmetric 2-sided stretch; hold `Shift` for proportional scaling.
 */
export function computeBoxResize(
  orig: { x: number; y: number; w: number; h: number },
  handle: HandleKind,
  dxN: number,
  dyN: number,
  imgW: number,
  imgH: number,
  mods: DragModifiers = {},
  bounds: AnnotationBounds = DEFAULT_ANNOTATION_BOUNDS,
): { x: number; y: number; w: number; h: number } {
  const safeW = Math.max(1, imgW);
  const safeH = Math.max(1, imgH);
  const minX = bounds.minX * safeW;
  const maxX = bounds.maxX * safeW;
  const minY = bounds.minY * safeH;
  const maxY = bounds.maxY * safeH;
  const spanW = Math.max(1, maxX - minX);
  const spanH = Math.max(1, maxY - minY);
  const maxNormW = bounds.maxX - bounds.minX;
  const maxNormH = bounds.maxY - bounds.minY;
  const ox = orig.x * safeW;
  const oy = orig.y * safeH;
  const ow = Math.max(6, orig.w * safeW);
  const oh = Math.max(6, orig.h * safeH);
  const cx = ox + ow / 2;
  const cy = oy + oh / 2;
  const dxPx = dxN * safeW;
  const dyPx = dyN * safeH;
  const minPx = 8;

  if (handle === "nw" || handle === "ne" || handle === "se" || handle === "sw") {
    const dirX = handle === "ne" || handle === "se" ? 1 : -1;
    const dirY = handle === "sw" || handle === "se" ? 1 : -1;
    const proportional = !mods.shiftKey;
    const fromCenter = !!mods.altKey;
    const mx = (dirX > 0 ? ox + ow : ox) + dxPx;
    const my = (dirY > 0 ? oy + oh : oy) + dyPx;

    if (fromCenter) {
      let hw = Math.max(minPx / 2, Math.abs(mx - cx));
      let hh = Math.max(minPx / 2, Math.abs(my - cy));
      if (proportional) {
        const owHalf = ow / 2;
        const ohHalf = oh / 2;
        const denom = owHalf * owHalf + ohHalf * ohHalf || 1;
        let s = Math.max(minPx / Math.min(ow, oh), (hw * owHalf + hh * ohHalf) / denom);
        const maxScaleX = Math.max(0, Math.min(cx - minX, maxX - cx)) / Math.max(0.5, owHalf);
        const maxScaleY = Math.max(0, Math.min(cy - minY, maxY - cy)) / Math.max(0.5, ohHalf);
        s = Math.min(s, maxScaleX, maxScaleY);
        hw = Math.max(minPx / 2, owHalf * s);
        hh = Math.max(minPx / 2, ohHalf * s);
      } else {
        hw = Math.min(hw, Math.max(minPx / 2, cx - minX), Math.max(minPx / 2, maxX - cx));
        hh = Math.min(hh, Math.max(minPx / 2, cy - minY), Math.max(minPx / 2, maxY - cy));
      }
      return {
        x: clampRange((cx - hw) / safeW, bounds.minX, bounds.maxX),
        y: clampRange((cy - hh) / safeH, bounds.minY, bounds.maxY),
        w: clampRange((hw * 2) / safeW, 0.004, maxNormW),
        h: clampRange((hh * 2) / safeH, 0.004, maxNormH),
      };
    }

    const ax = dirX > 0 ? ox : ox + ow;
    const ay = dirY > 0 ? oy : oy + oh;
    const vx = mx - ax;
    const vy = my - ay;
    const signX = vx === 0 ? dirX : Math.sign(vx);
    const signY = vy === 0 ? dirY : Math.sign(vy);
    const availW = signX > 0 ? maxX - ax : ax - minX;
    const availH = signY > 0 ? maxY - ay : ay - minY;
    let nwPx = Math.max(minPx, Math.abs(vx));
    let nhPx = Math.max(minPx, Math.abs(vy));

    if (proportional) {
      const denom = ow * ow + oh * oh || 1;
      let s = Math.max(minPx / Math.min(ow, oh), (nwPx * ow + nhPx * oh) / denom);
      s = Math.min(s, Math.max(minPx / ow, availW / ow), Math.max(minPx / oh, availH / oh));
      nwPx = Math.max(minPx, ow * s);
      nhPx = Math.max(minPx, oh * s);
    } else {
      nwPx = Math.min(nwPx, Math.max(minPx, availW));
      nhPx = Math.min(nhPx, Math.max(minPx, availH));
    }

    const rx = signX > 0 ? ax : ax - nwPx;
    const ry = signY > 0 ? ay : ay - nhPx;
    return {
      x: clampRange(Math.max(minX, rx) / safeW, bounds.minX, bounds.maxX),
      y: clampRange(Math.max(minY, ry) / safeH, bounds.minY, bounds.maxY),
      w: clampRange(nwPx / safeW, 0.004, maxNormW),
      h: clampRange(nhPx / safeH, 0.004, maxNormH),
    };
  }

  if (handle === "e" || handle === "w") {
    const fromCenter = !!mods.altKey;
    let x1 = ox;
    let x2 = ox + ow;
    if (fromCenter) {
      const mx = (handle === "e" ? ox + ow : ox) + dxPx;
      const hw = Math.min(Math.max(minPx / 2, Math.abs(mx - cx)), Math.max(minPx / 2, cx - minX), Math.max(minPx / 2, maxX - cx));
      x1 = cx - hw;
      x2 = cx + hw;
    } else if (handle === "e") {
      x2 = Math.min(maxX, Math.max(ox + minPx, ox + ow + dxPx));
    } else {
      x1 = Math.max(minX, Math.min(ox + ow - minPx, ox + dxPx));
    }
    const nwPx = Math.max(minPx, x2 - x1);
    let y1 = oy;
    let nhPx = oh;
    if (mods.shiftKey) {
      nhPx = Math.min(spanH, Math.max(minPx, oh * (nwPx / ow)));
      y1 = Math.max(minY, Math.min(maxY - nhPx, cy - nhPx / 2));
    }
    return {
      x: clampRange(x1 / safeW, bounds.minX, bounds.maxX),
      y: clampRange(y1 / safeH, bounds.minY, bounds.maxY),
      w: clampRange(nwPx / safeW, 0.004, maxNormW),
      h: clampRange(nhPx / safeH, 0.004, maxNormH),
    };
  }

  if (handle === "n" || handle === "s") {
    const fromCenter = !!mods.altKey;
    let y1 = oy;
    let y2 = oy + oh;
    if (fromCenter) {
      const my = (handle === "s" ? oy + oh : oy) + dyPx;
      const hh = Math.min(Math.max(minPx / 2, Math.abs(my - cy)), Math.max(minPx / 2, cy - minY), Math.max(minPx / 2, maxY - cy));
      y1 = cy - hh;
      y2 = cy + hh;
    } else if (handle === "s") {
      y2 = Math.min(maxY, Math.max(oy + minPx, oy + oh + dyPx));
    } else {
      y1 = Math.max(minY, Math.min(oy + oh - minPx, oy + dyPx));
    }
    const nhPx = Math.max(minPx, y2 - y1);
    let x1 = ox;
    let nwPx = ow;
    if (mods.shiftKey) {
      nwPx = Math.min(spanW, Math.max(minPx, ow * (nhPx / oh)));
      x1 = Math.max(minX, Math.min(maxX - nwPx, cx - nwPx / 2));
    }
    return {
      x: clampRange(x1 / safeW, bounds.minX, bounds.maxX),
      y: clampRange(y1 / safeH, bounds.minY, bounds.maxY),
      w: clampRange(nwPx / safeW, 0.004, maxNormW),
      h: clampRange(nhPx / safeH, 0.004, maxNormH),
    };
  }

  return {
    x: clampRange(orig.x + dxN, bounds.minX, Math.max(bounds.minX, bounds.maxX - orig.w)),
    y: clampRange(orig.y + dyN, bounds.minY, Math.max(bounds.minY, bounds.maxY - orig.h)),
    w: orig.w,
    h: orig.h,
  };
}

export function counterRadiusPx(item: CounterAnnotation, unitScale: number): number {
  return Math.max(10, (11 + item.strokeWidth * 1.5) * (item.scale ?? 1) * unitScale);
}

/**
 * Scales any annotation proportionally around its geometric center (used by `[` / `]` and `-` / `=` shortcuts).
 */
export function scaleAnnotationUniformly(
  item: AnnotationItem,
  factor: number,
  imgW: number,
  imgH: number,
  bounds: AnnotationBounds = DEFAULT_ANNOTATION_BOUNDS,
): AnnotationItem {
  const safeW = Math.max(1, imgW);
  const safeH = Math.max(1, imgH);
  const minX = bounds.minX * safeW;
  const maxX = bounds.maxX * safeW;
  const minY = bounds.minY * safeH;
  const maxY = bounds.maxY * safeH;
  const spanW = Math.max(1, maxX - minX);
  const spanH = Math.max(1, maxY - minY);
  if (item.kind === "text") {
    return {
      ...item,
      fontSize: Math.max(10, Math.min(96, Math.round(item.fontSize * factor))),
    };
  }
  if (item.kind === "counter") {
    const nextScale = Math.max(0.55, Math.min(3.2, Number(((item.scale ?? 1) * factor).toFixed(3))));
    return { ...item, scale: nextScale };
  }
  if (item.kind === "arrow" || item.kind === "line") {
    const mx = (item.x1 + item.x2) / 2;
    const my = (item.y1 + item.y2) / 2;
    const hx = ((item.x2 - item.x1) / 2) * factor;
    const hy = ((item.y2 - item.y1) / 2) * factor;
    return {
      ...item,
      x1: clampRange(mx - hx, bounds.minX, bounds.maxX),
      y1: clampRange(my - hy, bounds.minY, bounds.maxY),
      x2: clampRange(mx + hx, bounds.minX, bounds.maxX),
      y2: clampRange(my + hy, bounds.minY, bounds.maxY),
    };
  }
  if (item.kind === "freehand") {
    const b = freehandBounds(item.points);
    const cx = b.x + b.w / 2;
    const cy = b.y + b.h / 2;
    return {
      ...item,
      points: item.points.map(p => ({
        x: clampRange(cx + (p.x - cx) * factor, bounds.minX, bounds.maxX),
        y: clampRange(cy + (p.y - cy) * factor, bounds.minY, bounds.maxY),
      })),
    };
  }
  const cx = item.x * safeW + (item.w * safeW) / 2;
  const cy = item.y * safeH + (item.h * safeH) / 2;
  const maxFactor = Math.min(
    spanW / Math.max(8, item.w * safeW),
    spanH / Math.max(8, item.h * safeH),
  );
  const clampedFactor = Math.min(factor, maxFactor);
  const nwPx = Math.max(8, item.w * safeW * clampedFactor);
  const nhPx = Math.max(8, item.h * safeH * clampedFactor);
  const nxPx = Math.max(minX, Math.min(maxX - nwPx, cx - nwPx / 2));
  const nyPx = Math.max(minY, Math.min(maxY - nhPx, cy - nhPx / 2));
  return {
    ...item,
    x: clampRange(nxPx / safeW, bounds.minX, bounds.maxX),
    y: clampRange(nyPx / safeH, bounds.minY, bounds.maxY),
    w: clampRange(nwPx / safeW, 0.004, bounds.maxX - bounds.minX),
    h: clampRange(nhPx / safeH, 0.004, bounds.maxY - bounds.minY),
  };
}

function roundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export function stylePreviewSwatchCss(style: Omit<StudioStyle, "format">): string {
  if (style.backgroundId === "none") return "#FFFFFF";
  if (style.backgroundId === "transparent") {
    return "repeating-conic-gradient(#d4d4d8 0% 25%, #ffffff 0% 50%) 50% / 6px 6px";
  }
  if (style.backgroundId === "custom") return style.customColor || "#F4F4F5";
  if (style.backgroundId === "custom-gradient") return customGradientCss(style.customGradient);
  const solid = PLAIN_COLORS.find(p => p.id === style.backgroundId);
  if (solid) return solid.color;
  const wp = WALLPAPER_PRESETS.find(w => w.id === style.backgroundId);
  if (wp) return wp.css;
  const bl = BLURRED_PRESETS.find(b => b.id === style.backgroundId);
  if (bl) return bl.css;
  const gr = GRADIENT_PRESETS.find(g => g.id === style.backgroundId);
  return gr?.css ?? "#F4F4F5";
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
) {
  if (sw <= 0 || sh <= 0 || dw <= 0 || dh <= 0) return;
  const scale = Math.max(dw / sw, dh / sh);
  const rw = sw * scale;
  const rh = sh * scale;
  const rx = dx + (dw - rw) / 2;
  const ry = dy + (dh - rh) / 2;
  ctx.drawImage(source, sx, sy, sw, sh, rx, ry, rw, rh);
}

function drawLinearStops(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  angleDeg: number,
  stops: readonly [string, string, string],
) {
  const angle = ((angleDeg - 90) * Math.PI) / 180;
  const cx = w / 2;
  const cy = h / 2;
  const len = (Math.abs(w * Math.cos(angle)) + Math.abs(h * Math.sin(angle))) / 2;
  const grad = ctx.createLinearGradient(
    cx - Math.cos(angle) * len,
    cy - Math.sin(angle) * len,
    cx + Math.cos(angle) * len,
    cy + Math.sin(angle) * len,
  );
  grad.addColorStop(0, stops[0]);
  grad.addColorStop(0.52, stops[1]);
  grad.addColorStop(1, stops[2]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function drawBlurredScreenshotBackdrop(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  img: HTMLImageElement,
  geometry: StudioGeometry,
  mode: "blur-soft" | "blur-vivid" | "blur-dark",
) {
  if (typeof document === "undefined") {
    ctx.fillStyle = mode === "blur-dark" ? "#18181B" : "#CBD5E1";
    ctx.fillRect(0, 0, w, h);
    return;
  }
  const bw = 44;
  const bh = Math.max(24, Math.round((bw * h) / Math.max(1, w)));
  const buf = document.createElement("canvas");
  buf.width = bw;
  buf.height = bh;
  const bctx = buf.getContext("2d", { willReadFrequently: true });
  if (!bctx) return;

  drawCoverImage(bctx, img, geometry.sx, geometry.sy, geometry.sw, geometry.sh, 0, 0, bw, bh);
  try {
    const imgData = bctx.getImageData(0, 0, bw, bh);
    const data = imgData.data;
    const tmp = new Uint8ClampedArray(data.length);
    // 3-pass separable [1, 2, 2, 2, 1]/8 smooth kernel with edge clamping for silky vibrancy
    for (let pass = 0; pass < 3; pass++) {
      for (let y = 0; y < bh; y++) {
        for (let x = 0; x < bw; x++) {
          let r = 0, g = 0, b = 0;
          for (let k = -2; k <= 2; k++) {
            const wt = Math.abs(k) === 2 ? 1 : 2;
            const sx = Math.max(0, Math.min(bw - 1, x + k));
            const i = (y * bw + sx) * 4;
            r += (data[i] ?? 0) * wt;
            g += (data[i + 1] ?? 0) * wt;
            b += (data[i + 2] ?? 0) * wt;
          }
          const o = (y * bw + x) * 4;
          tmp[o] = r >> 3;
          tmp[o + 1] = g >> 3;
          tmp[o + 2] = b >> 3;
          tmp[o + 3] = 255;
        }
      }
      for (let y = 0; y < bh; y++) {
        for (let x = 0; x < bw; x++) {
          let r = 0, g = 0, b = 0;
          for (let k = -2; k <= 2; k++) {
            const wt = Math.abs(k) === 2 ? 1 : 2;
            const sy = Math.max(0, Math.min(bh - 1, y + k));
            const i = (sy * bw + x) * 4;
            r += (tmp[i] ?? 0) * wt;
            g += (tmp[i + 1] ?? 0) * wt;
            b += (tmp[i + 2] ?? 0) * wt;
          }
          const o = (y * bw + x) * 4;
          let rf = r >> 3;
          let gf = g >> 3;
          let bf = b >> 3;
          if (pass === 2 && mode === "blur-vivid") {
            const luma = 0.299 * rf + 0.587 * gf + 0.114 * bf;
            rf = Math.max(0, Math.min(255, Math.round(luma + (rf - luma) * 1.45)));
            gf = Math.max(0, Math.min(255, Math.round(luma + (gf - luma) * 1.45)));
            bf = Math.max(0, Math.min(255, Math.round(luma + (bf - luma) * 1.45)));
          }
          data[o] = rf;
          data[o + 1] = gf;
          data[o + 2] = bf;
          data[o + 3] = 255;
        }
      }
    }
    bctx.putImageData(imgData, 0, 0);
  } catch {
    // Fallback uses smoothed low-res upscale directly.
  }

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(buf, 0, 0, bw, bh, 0, 0, w, h);
  if (mode === "blur-soft") {
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.fillRect(0, 0, w, h);
  } else if (mode === "blur-dark") {
    ctx.fillStyle = "rgba(9, 9, 11, 0.48)";
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();
}

function drawProceduralWallpaper(ctx: CanvasRenderingContext2D, w: number, h: number, id: string) {
  ctx.save();
  if (id === "wp-horizon") {
    drawLinearStops(ctx, w, h, 165, ["#60A5FA", "#818CF8", "#FDBA74"]);
    const waves = [
      { y0: 0.48, cp1: 0.34, cp2: 0.68, y1: 0.56, color: "rgba(236, 72, 153, 0.34)" },
      { y0: 0.64, cp1: 0.82, cp2: 0.52, y1: 0.72, color: "rgba(79, 70, 229, 0.36)" },
      { y0: 0.78, cp1: 0.66, cp2: 0.9, y1: 0.84, color: "rgba(30, 27, 75, 0.28)" },
    ];
    for (const wv of waves) {
      ctx.beginPath();
      ctx.moveTo(0, h * wv.y0);
      ctx.bezierCurveTo(w * 0.35, h * wv.cp1, w * 0.68, h * wv.cp2, w, h * wv.y1);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fillStyle = wv.color;
      ctx.fill();
    }
  } else if (id === "wp-dune") {
    drawLinearStops(ctx, w, h, 150, ["#F8FAFC", "#E2E8F0", "#CBD5E1"]);
    const dunes = [
      { y0: 0.42, cp1: 0.28, cp2: 0.62, y1: 0.46, color: "rgba(255, 255, 255, 0.58)" },
      { y0: 0.62, cp1: 0.78, cp2: 0.48, y1: 0.68, color: "rgba(148, 163, 184, 0.26)" },
    ];
    for (const dn of dunes) {
      ctx.beginPath();
      ctx.moveTo(0, h * dn.y0);
      ctx.bezierCurveTo(w * 0.38, h * dn.cp1, w * 0.66, h * dn.cp2, w, h * dn.y1);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fillStyle = dn.color;
      ctx.fill();
    }
  } else {
    drawLinearStops(ctx, w, h, 135, ["#09090B", "#18181B", "#27272A"]);
    const g1 = ctx.createRadialGradient(w * 0.2, h * 0.15, 0, w * 0.2, h * 0.15, Math.max(w, h) * 0.65);
    g1.addColorStop(0, "rgba(99, 102, 241, 0.26)");
    g1.addColorStop(1, "rgba(99, 102, 241, 0)");
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, w, h);
    const g2 = ctx.createRadialGradient(w * 0.85, h * 0.82, 0, w * 0.85, h * 0.82, Math.max(w, h) * 0.55);
    g2.addColorStop(0, "rgba(244, 244, 245, 0.1)");
    g2.addColorStop(1, "rgba(244, 244, 245, 0)");
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  style: StudioStyle,
  showCheckerboard: boolean,
  screenshotImg: HTMLImageElement,
  geometry: StudioGeometry,
  wallpaperImg?: HTMLImageElement | null,
) {
  if (style.backgroundId === "none") {
    if (!showCheckerboard && style.format === "jpeg") {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, w, h);
    }
    return;
  }

  if (style.backgroundId === "transparent") {
    if (style.format === "jpeg") {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, w, h);
      return;
    }
    if (showCheckerboard) {
      const tile = Math.max(8, Math.round(Math.min(w, h) / 52));
      ctx.fillStyle = "#FAFAFA";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#E4E4E7";
      for (let y = 0; y < h; y += tile) {
        for (let x = (Math.floor(y / tile) % 2) * tile; x < w; x += tile * 2) {
          ctx.fillRect(x, y, tile, tile);
        }
      }
    }
    return;
  }

  if (style.backgroundId === "custom") {
    ctx.fillStyle = style.customColor || "#F4F4F5";
    ctx.fillRect(0, 0, w, h);
    return;
  }

  if (style.backgroundId === "custom-gradient") {
    const cg = style.customGradient ?? DEFAULT_CUSTOM_GRADIENT;
    drawLinearStops(ctx, w, h, cg.angle, [cg.start, cg.mid, cg.end]);
    return;
  }

  if (
    style.backgroundId === "blur-soft" ||
    style.backgroundId === "blur-vivid" ||
    style.backgroundId === "blur-dark"
  ) {
    drawBlurredScreenshotBackdrop(ctx, w, h, screenshotImg, geometry, style.backgroundId);
    return;
  }

  if (style.backgroundId.startsWith("wp-custom:") && wallpaperImg) {
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    drawCoverImage(
      ctx,
      wallpaperImg,
      0,
      0,
      wallpaperImg.naturalWidth || 1,
      wallpaperImg.naturalHeight || 1,
      0,
      0,
      w,
      h,
    );
    ctx.restore();
    return;
  }

  if (WALLPAPER_PRESETS.some(wp => wp.id === style.backgroundId)) {
    drawProceduralWallpaper(ctx, w, h, style.backgroundId);
    return;
  }

  const solid = PLAIN_COLORS.find(p => p.id === style.backgroundId);
  if (solid) {
    ctx.fillStyle = solid.color;
    ctx.fillRect(0, 0, w, h);
    return;
  }

  const gradPreset = GRADIENT_PRESETS.find(g => g.id === style.backgroundId) ?? GRADIENT_PRESETS[0]!;
  drawLinearStops(ctx, w, h, gradPreset.angleDeg, gradPreset.stops);
  if (gradPreset.orbs) {
    const maxDim = Math.max(w, h);
    for (const orb of gradPreset.orbs) {
      const cx = orb.x * w;
      const cy = orb.y * h;
      const rad = orb.r * maxDim;
      const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      rg.addColorStop(0, orb.color);
      rg.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, w, h);
    }
  }
}

export function contrastTextForHex(hex: string): string {
  const clean = hex.trim().replace(/^#/, "");
  let full = clean;
  if (clean.length === 3 || clean.length === 4) {
    full = `${clean[0]}${clean[0]}${clean[1]}${clean[1]}${clean[2]}${clean[2]}`;
  } else if (clean.length === 8) {
    full = clean.slice(0, 6);
  }
  if (full.length !== 6) return "#FFFFFF";
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return "#FFFFFF";
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62 ? "#18181B" : "#FFFFFF";
}

/** Computes the visible midpoint and quadratic Bezier control point for a line/arrow in pixel space. */
export function arrowCurvePoints(
  x1Px: number,
  y1Px: number,
  x2Px: number,
  y2Px: number,
  bend: number,
  diagPx: number,
) {
  const mx = (x1Px + x2Px) / 2;
  const my = (y1Px + y2Px) / 2;
  const dx = x2Px - x1Px;
  const dy = y2Px - y1Px;
  const dist = Math.hypot(dx, dy) || 1;
  const nx = -dy / dist;
  const ny = dx / dist;
  const midX = mx + nx * bend * diagPx;
  const midY = my + ny * bend * diagPx;
  // Control point C such that quadratic Bezier B(0.5) passes directly through (midX, midY).
  const ctrlX = 2 * midX - mx;
  const ctrlY = 2 * midY - my;
  return { midX, midY, ctrlX, ctrlY, dist };
}

function drawLineOrArrow(
  ctx: CanvasRenderingContext2D,
  item: LineOrArrowAnnotation,
  imgX: number,
  imgY: number,
  imgW: number,
  imgH: number,
  strokePx: number,
) {
  const x1 = imgX + item.x1 * imgW;
  const y1 = imgY + item.y1 * imgH;
  const x2 = imgX + item.x2 * imgW;
  const y2 = imgY + item.y2 * imgH;
  const diag = Math.hypot(imgW, imgH);
  const { ctrlX, ctrlY, dist } = arrowCurvePoints(x1, y1, x2, y2, item.bend, diag);
  if (dist < 2) return;

  ctx.save();
  ctx.shadowColor = "rgba(15, 23, 42, 0.24)";
  ctx.shadowBlur = Math.max(2, strokePx * 0.85);
  ctx.shadowOffsetY = Math.max(1, strokePx * 0.22);
  ctx.strokeStyle = item.color;
  ctx.fillStyle = item.color;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (item.kind === "line") {
    ctx.lineWidth = strokePx;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    if (Math.abs(item.bend) > 0.004) ctx.quadraticCurveTo(ctrlX, ctrlY, x2, y2);
    else ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
    return;
  }

  const headLen = Math.min(dist * 0.55, Math.max(13, strokePx * 4.1));
  const headHalfWidth = Math.max(6.5, strokePx * 2.1);

  if (Math.abs(item.bend) > 0.004) {
    const endAngle = Math.atan2(y2 - ctrlY, x2 - ctrlX);
    const neckX = x2 - Math.cos(endAngle) * (headLen * 0.7);
    const neckY = y2 - Math.sin(endAngle) * (headLen * 0.7);
    ctx.lineWidth = strokePx;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(ctrlX, ctrlY, neckX, neckY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(
      x2 - Math.cos(endAngle) * headLen + Math.cos(endAngle + Math.PI / 2) * headHalfWidth,
      y2 - Math.sin(endAngle) * headLen + Math.sin(endAngle + Math.PI / 2) * headHalfWidth,
    );
    ctx.lineTo(
      x2 - Math.cos(endAngle) * (headLen * 0.74),
      y2 - Math.sin(endAngle) * (headLen * 0.74),
    );
    ctx.lineTo(
      x2 - Math.cos(endAngle) * headLen + Math.cos(endAngle - Math.PI / 2) * headHalfWidth,
      y2 - Math.sin(endAngle) * headLen + Math.sin(endAngle - Math.PI / 2) * headHalfWidth,
    );
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    return;
  }

  const ux = (x2 - x1) / dist;
  const uy = (y2 - y1) / dist;
  const px = -uy;
  const py = ux;
  const tailHalf = Math.max(1.2, strokePx * 0.28);
  const neckHalf = Math.max(2.1, strokePx * 0.62);
  const neckDist = Math.max(0, dist - headLen * 0.76);
  const neckX = x1 + ux * neckDist;
  const neckY = y1 + uy * neckDist;
  const baseX = x2 - ux * headLen;
  const baseY = y2 - uy * headLen;

  ctx.beginPath();
  ctx.moveTo(x1 + px * tailHalf, y1 + py * tailHalf);
  ctx.lineTo(neckX + px * neckHalf, neckY + py * neckHalf);
  ctx.lineTo(baseX + px * headHalfWidth, baseY + py * headHalfWidth);
  ctx.lineTo(x2, y2);
  ctx.lineTo(baseX - px * headHalfWidth, baseY - py * headHalfWidth);
  ctx.lineTo(neckX - px * neckHalf, neckY - py * neckHalf);
  ctx.lineTo(x1 - px * tailHalf, y1 - py * tailHalf);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function resolveTextPillColor(item: Pick<TextAnnotation, "color" | "pillColor">): string {
  return item.pillColor ?? item.color;
}

export function resolveTextFgColor(
  item: Pick<TextAnnotation, "color" | "pill" | "pillColor" | "textColor">,
): string {
  if (item.textColor) return item.textColor;
  if (item.pill) return contrastTextForHex(resolveTextPillColor(item));
  return item.color;
}

function drawFreehand(
  ctx: CanvasRenderingContext2D,
  item: FreehandAnnotation,
  imgX: number,
  imgY: number,
  imgW: number,
  imgH: number,
  strokePx: number,
) {
  if (item.points.length === 0) return;
  ctx.save();
  ctx.shadowColor = "rgba(15, 23, 42, 0.22)";
  ctx.shadowBlur = Math.max(1.5, strokePx * 0.7);
  ctx.shadowOffsetY = Math.max(0.5, strokePx * 0.18);
  ctx.strokeStyle = item.color;
  ctx.fillStyle = item.color;
  ctx.lineWidth = strokePx;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const pts = item.points.map(p => ({ x: imgX + p.x * imgW, y: imgY + p.y * imgH }));
  if (pts.length === 1) {
    ctx.beginPath();
    ctx.arc(pts[0]!.x, pts[0]!.y, strokePx / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(pts[0]!.x, pts[0]!.y);
  if (pts.length === 2) {
    ctx.lineTo(pts[1]!.x, pts[1]!.y);
  } else {
    for (let i = 1; i < pts.length - 1; i++) {
      const midX = (pts[i]!.x + pts[i + 1]!.x) / 2;
      const midY = (pts[i]!.y + pts[i + 1]!.y) / 2;
      ctx.quadraticCurveTo(pts[i]!.x, pts[i]!.y, midX, midY);
    }
    const last = pts[pts.length - 1]!;
    ctx.lineTo(last.x, last.y);
  }
  ctx.stroke();
  ctx.restore();
}

export function scaleFreehandPoints(
  origPoints: readonly { x: number; y: number }[],
  handle: HandleKind,
  dxN: number,
  dyN: number,
  imgW: number,
  imgH: number,
  mods: DragModifiers = {},
  bounds: AnnotationBounds = DEFAULT_ANNOTATION_BOUNDS,
): { x: number; y: number }[] {
  if (origPoints.length === 0) return [];
  const b = freehandBounds(origPoints);
  const resized = computeBoxResize(b, handle, dxN, dyN, imgW, imgH, mods, bounds);
  const scaleX = resized.w / Math.max(1e-6, b.w);
  const scaleY = resized.h / Math.max(1e-6, b.h);
  return origPoints.map(p => ({
    x: clampRange(resized.x + (p.x - b.x) * scaleX, bounds.minX, bounds.maxX),
    y: clampRange(resized.y + (p.y - b.y) * scaleY, bounds.minY, bounds.maxY),
  }));
}

export function measureTextBoundsPx(
  item: TextAnnotation,
  imgW: number,
  imgH: number,
  unitScale: number,
): { x: number; y: number; w: number; h: number } {
  const fontPx = Math.max(12, item.fontSize * unitScale);
  const content = item.text || " ";
  let textW = content.length * fontPx * 0.56;
  if (typeof document !== "undefined") {
    const c = document.createElement("canvas");
    const ctx = c.getContext("2d");
    if (ctx) {
      ctx.font = `700 ${Math.round(fontPx)}px "Instrument Sans", ui-sans-serif, system-ui, sans-serif`;
      textW = ctx.measureText(content).width;
    }
  }
  const padX = item.pill ? fontPx * 0.56 : fontPx * 0.15;
  const padY = item.pill ? fontPx * 0.36 : fontPx * 0.15;
  const w = Math.max(fontPx * 1.2, textW + padX * 2);
  const h = fontPx + padY * 2;
  const x = item.x * imgW;
  const y = item.y * imgH - h / 2;
  return { x, y, w, h };
}

export type RenderStudioOptions = {
  previewCheckerboard?: boolean;
  selectedId?: string | null;
  editingTextId?: string | null;
  draftCrop?: CropRect | null;
  backingScale?: number;
  wallpaperImg?: HTMLImageElement | null;
  activeAngleGuide?: ActiveAngleGuide | null;
  activeSizeGuide?: ActiveSizeGuide | null;
};

export function renderStudioScene(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  geometry: StudioGeometry,
  style: StudioStyle,
  balance: BalanceAnalysis,
  annotations: readonly AnnotationItem[],
  options: RenderStudioOptions = {},
) {
  const s = options.backingScale ?? 1;
  const W = geometry.outW * s;
  const H = geometry.outH * s;
  const cardX = geometry.cardX * s;
  const cardY = geometry.cardY * s;
  const cardW = geometry.cardW * s;
  const cardH = geometry.cardH * s;
  const cardR = geometry.cardRadius * s;
  const imgX = geometry.imgX * s;
  const imgY = geometry.imgY * s;
  const imgW = geometry.imgW * s;
  const imgH = geometry.imgH * s;
  const unitScale = geometry.scale * s;
  const noFrame = style.backgroundId === "none";
  const useBalance = !noFrame && style.autoBalance && style.padding > 0 && balance.isUniformEdge;

  ctx.clearRect(0, 0, W, H);
  drawBackground(ctx, W, H, style, !!options.previewCheckerboard, img, geometry, options.wallpaperImg);

  if (!noFrame && style.glassBezel && style.padding >= 12) {
    const bezel = Math.min(style.padding * 0.34, 10) * unitScale;
    ctx.save();
    if (style.shadow > 0) {
      const strength = Math.max(0, Math.min(100, style.shadow)) / 100;
      ctx.shadowColor = `rgba(15, 23, 42, ${(0.08 + strength * 0.24).toFixed(3)})`;
      ctx.shadowBlur = Math.max(4, strength * 42 * unitScale);
      ctx.shadowOffsetY = Math.max(2, strength * 14 * unitScale);
    }
    roundedRectPath(
      ctx,
      cardX - bezel,
      cardY - bezel,
      cardW + bezel * 2,
      cardH + bezel * 2,
      cardR + bezel * 0.72,
    );
    ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.48)";
    ctx.lineWidth = Math.max(1, 1.2 * unitScale);
    ctx.stroke();
    ctx.restore();
  }

  if (!noFrame && style.shadow > 0 && style.padding > 0 && (!balance.hasTransparency || useBalance)) {
    const strength = Math.max(0, Math.min(100, style.shadow)) / 100;
    const inset = useBalance ? 0 : Math.min(1.2 * s, cardW * 0.02, cardH * 0.02);
    ctx.save();
    ctx.shadowColor = `rgba(15, 23, 42, ${(0.1 + strength * 0.32).toFixed(3)})`;
    ctx.shadowBlur = Math.max(4, strength * 48 * unitScale);
    ctx.shadowOffsetY = Math.max(2, strength * 18 * unitScale);
    ctx.fillStyle = useBalance ? balance.edgeColor : "#09090B";
    roundedRectPath(
      ctx,
      cardX + inset,
      cardY + inset,
      Math.max(1, cardW - inset * 2),
      Math.max(1, cardH - inset * 2),
      Math.max(0, cardR - inset),
    );
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  roundedRectPath(ctx, cardX, cardY, cardW, cardH, cardR);
  ctx.clip();

  if (useBalance) {
    ctx.fillStyle = balance.edgeColor;
    ctx.fillRect(cardX, cardY, cardW, cardH);
  }

  if (!noFrame && (style.windowBar === "light" || style.windowBar === "dark")) {
    const barH = 32 * unitScale;
    const isDarkBar = style.windowBar === "dark";
    ctx.fillStyle = isDarkBar ? "#181920" : "#F4F4F5";
    ctx.fillRect(cardX, cardY, cardW, barH + 1);
    ctx.fillStyle = isDarkBar ? "rgba(255, 255, 255, 0.09)" : "rgba(15, 23, 42, 0.08)";
    ctx.fillRect(cardX, cardY + barH - Math.max(1, unitScale), cardW, Math.max(1, unitScale));
    const dots = [
      [18, "#FF5F56"],
      [34, "#FFBD2E"],
      [50, "#27C93F"],
    ] as const;
    for (const [dx, dotColor] of dots) {
      ctx.fillStyle = dotColor;
      ctx.beginPath();
      ctx.arc(cardX + dx * unitScale, cardY + barH * 0.5, 5 * unitScale, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, geometry.sx, geometry.sy, geometry.sw, geometry.sh, imgX, imgY, imgW, imgH);
  ctx.restore();

  if (!noFrame) {
    ctx.save();
    roundedRectPath(ctx, cardX, cardY, cardW, cardH, cardR);
    ctx.strokeStyle = "rgba(15, 23, 42, 0.08)";
    ctx.lineWidth = Math.max(1, unitScale);
    ctx.stroke();
    ctx.restore();
  }

  // Gaussian blur & mosaic pixelate layers work across both the screenshot card and outer background canvas.
  for (const item of annotations) {
    if (item.kind !== "pixelate" && item.kind !== "blur") continue;
    const rawRx = imgX + item.x * imgW;
    const rawRy = imgY + item.y * imgH;
    const rx = Math.max(0, rawRx);
    const ry = Math.max(0, rawRy);
    const rw = Math.max(2, Math.min(W, rawRx + Math.max(2, item.w * imgW)) - rx);
    const rh = Math.max(2, Math.min(H, rawRy + Math.max(2, item.h * imgH)) - ry);

    if (item.kind === "blur") {
      const downsample = Math.max(2.5, (item.strokeWidth * 1.35 + 3.5) * unitScale);
      const bw = Math.max(3, Math.min(180, Math.round(rw / downsample)));
      const bh = Math.max(3, Math.min(180, Math.round(rh / downsample)));

      if (typeof document !== "undefined") {
        const buf = document.createElement("canvas");
        buf.width = bw;
        buf.height = bh;
        const bctx = buf.getContext("2d", { willReadFrequently: true });
        if (bctx) {
          bctx.imageSmoothingEnabled = true;
          const backingCanvas = ctx.canvas;
          if (backingCanvas && backingCanvas.width > 0 && backingCanvas.height > 0) {
            bctx.drawImage(backingCanvas, rx, ry, rw, rh, 0, 0, bw, bh);
          } else {
            bctx.drawImage(
              img,
              geometry.sx + clamp01(item.x) * geometry.sw,
              geometry.sy + clamp01(item.y) * geometry.sh,
              Math.max(1, clamp01(item.w) * geometry.sw),
              Math.max(1, clamp01(item.h) * geometry.sh),
              0,
              0,
              bw,
              bh,
            );
          }

          try {
            const imgData = bctx.getImageData(0, 0, bw, bh);
            const data = imgData.data;
            const tmp = new Uint8ClampedArray(data.length);
            // 3-pass separable [1, 2, 2, 2, 1]/8 smooth Gaussian-convergent kernel with edge clamping
            for (let pass = 0; pass < 3; pass++) {
              for (let y = 0; y < bh; y++) {
                for (let x = 0; x < bw; x++) {
                  let r = 0;
                  let g = 0;
                  let b = 0;
                  let aSum = 0;
                  for (let k = -2; k <= 2; k++) {
                    const wt = Math.abs(k) === 2 ? 1 : 2;
                    const sx = Math.max(0, Math.min(bw - 1, x + k));
                    const i = (y * bw + sx) * 4;
                    const a = data[i + 3] ?? 255;
                    r += (data[i] ?? 0) * a * wt;
                    g += (data[i + 1] ?? 0) * a * wt;
                    b += (data[i + 2] ?? 0) * a * wt;
                    aSum += a * wt;
                  }
                  const o = (y * bw + x) * 4;
                  if (aSum > 0) {
                    tmp[o] = Math.round(r / aSum);
                    tmp[o + 1] = Math.round(g / aSum);
                    tmp[o + 2] = Math.round(b / aSum);
                    tmp[o + 3] = aSum >> 3;
                  } else {
                    tmp[o] = 0;
                    tmp[o + 1] = 0;
                    tmp[o + 2] = 0;
                    tmp[o + 3] = 0;
                  }
                }
              }
              for (let y = 0; y < bh; y++) {
                for (let x = 0; x < bw; x++) {
                  let r = 0;
                  let g = 0;
                  let b = 0;
                  let aSum = 0;
                  for (let k = -2; k <= 2; k++) {
                    const wt = Math.abs(k) === 2 ? 1 : 2;
                    const sy = Math.max(0, Math.min(bh - 1, y + k));
                    const i = (sy * bw + x) * 4;
                    const a = tmp[i + 3] ?? 255;
                    r += (tmp[i] ?? 0) * a * wt;
                    g += (tmp[i + 1] ?? 0) * a * wt;
                    b += (tmp[i + 2] ?? 0) * a * wt;
                    aSum += a * wt;
                  }
                  const o = (y * bw + x) * 4;
                  if (aSum > 0) {
                    data[o] = Math.round(r / aSum);
                    data[o + 1] = Math.round(g / aSum);
                    data[o + 2] = Math.round(b / aSum);
                    data[o + 3] = aSum >> 3;
                  } else {
                    data[o] = 0;
                    data[o + 1] = 0;
                    data[o + 2] = 0;
                    data[o + 3] = 0;
                  }
                }
              }
            }
            bctx.putImageData(imgData, 0, 0);
          } catch {
            // Fallback uses smooth bilinear upscale directly.
          }

          ctx.save();
          roundedRectPath(ctx, rx, ry, rw, rh, Math.min(4 * unitScale, rw * 0.18, rh * 0.18));
          ctx.clip();
          if (style.backgroundId === "transparent" && !options.previewCheckerboard) {
            ctx.clearRect(rx, ry, rw, rh);
          }
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(buf, 0, 0, bw, bh, rx, ry, rw, rh);
          ctx.restore();
        }
      }
      continue;
    }

    const blockPx = Math.max(6, (item.strokeWidth * 2.8 + 8) * unitScale);
    const cols = Math.max(2, Math.min(96, Math.round(rw / blockPx)));
    const rows = Math.max(2, Math.min(96, Math.round(rh / blockPx)));

    if (typeof document !== "undefined") {
      const tiny = document.createElement("canvas");
      tiny.width = cols;
      tiny.height = rows;
      const tctx = tiny.getContext("2d");
      if (tctx) {
        tctx.imageSmoothingEnabled = true;
        const backingCanvas = ctx.canvas;
        if (backingCanvas && backingCanvas.width > 0 && backingCanvas.height > 0) {
          tctx.drawImage(backingCanvas, rx, ry, rw, rh, 0, 0, cols, rows);
        } else {
          tctx.drawImage(
            img,
            geometry.sx + clamp01(item.x) * geometry.sw,
            geometry.sy + clamp01(item.y) * geometry.sh,
            Math.max(1, clamp01(item.w) * geometry.sw),
            Math.max(1, clamp01(item.h) * geometry.sh),
            0,
            0,
            cols,
            rows,
          );
        }
        ctx.save();
        ctx.beginPath();
        ctx.rect(rx, ry, rw, rh);
        ctx.clip();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(tiny, 0, 0, cols, rows, rx, ry, rw, rh);
        ctx.restore();
      }
    }
  }

  // Unified Spotlight veil: clips cleanly to the card when all cutouts are inside the screenshot,
  // or covers the full canvas when a spotlight extends onto the outer background frame.
  const spotlights = annotations.filter((a): a is BoxAnnotation => a.kind === "spotlight");
  if (spotlights.length > 0 && typeof document !== "undefined") {
    const spansBackground = spotlights.some(
      sp => sp.x < -0.005 || sp.y < -0.005 || sp.x + sp.w > 1.005 || sp.y + sp.h > 1.005,
    );
    const veilX = spansBackground ? 0 : cardX;
    const veilY = spansBackground ? 0 : cardY;
    const veilW = spansBackground ? W : cardW;
    const veilH = spansBackground ? H : cardH;
    const mask = document.createElement("canvas");
    mask.width = Math.max(1, Math.ceil(veilW));
    mask.height = Math.max(1, Math.ceil(veilH));
    const mctx = mask.getContext("2d");
    if (mctx) {
      mctx.fillStyle = "rgba(9, 13, 22, 0.56)";
      mctx.fillRect(0, 0, mask.width, mask.height);
      mctx.globalCompositeOperation = "destination-out";
      mctx.fillStyle = "#000000";
      for (const sp of spotlights) {
        roundedRectPath(
          mctx,
          imgX - veilX + sp.x * imgW,
          imgY - veilY + sp.y * imgH,
          Math.max(4, sp.w * imgW),
          Math.max(4, sp.h * imgH),
          8 * unitScale,
        );
        mctx.fill();
      }
      ctx.save();
      if (!spansBackground) {
        roundedRectPath(ctx, cardX, cardY, cardW, cardH, cardR);
        ctx.clip();
      }
      ctx.drawImage(mask, veilX, veilY, veilW, veilH);
      ctx.restore();
    }
  }

  // Vector markup layers.
  for (const item of annotations) {
    if (item.id === options.editingTextId) continue;
    const strokePx = Math.max(1.5, item.strokeWidth * unitScale);

    if (item.kind === "highlight") {
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = item.color;
      roundedRectPath(ctx, imgX + item.x * imgW, imgY + item.y * imgH, Math.max(4, item.w * imgW), Math.max(4, item.h * imgH), 4 * unitScale);
      ctx.fill();
      ctx.restore();
    } else if (item.kind === "filled") {
      ctx.save();
      ctx.fillStyle = item.color;
      roundedRectPath(ctx, imgX + item.x * imgW, imgY + item.y * imgH, Math.max(4, item.w * imgW), Math.max(4, item.h * imgH), 5 * unitScale);
      ctx.fill();
      ctx.restore();
    } else if (item.kind === "rect") {
      ctx.save();
      ctx.shadowColor = "rgba(15, 23, 42, 0.18)";
      ctx.shadowBlur = Math.max(2, strokePx * 0.7);
      ctx.strokeStyle = item.color;
      ctx.lineWidth = strokePx;
      roundedRectPath(ctx, imgX + item.x * imgW, imgY + item.y * imgH, Math.max(4, item.w * imgW), Math.max(4, item.h * imgH), 6 * unitScale);
      ctx.stroke();
      ctx.restore();
    } else if (item.kind === "ellipse") {
      const cx = imgX + (item.x + item.w / 2) * imgW;
      const cy = imgY + (item.y + item.h / 2) * imgH;
      ctx.save();
      ctx.shadowColor = "rgba(15, 23, 42, 0.18)";
      ctx.shadowBlur = Math.max(2, strokePx * 0.7);
      ctx.strokeStyle = item.color;
      ctx.lineWidth = strokePx;
      ctx.beginPath();
      ctx.ellipse(cx, cy, Math.max(3, (item.w * imgW) / 2), Math.max(3, (item.h * imgH) / 2), 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else if (item.kind === "arrow" || item.kind === "line") {
      drawLineOrArrow(ctx, item, imgX, imgY, imgW, imgH, strokePx);
    } else if (item.kind === "freehand") {
      drawFreehand(ctx, item, imgX, imgY, imgW, imgH, strokePx);
    } else if (item.kind === "counter") {
      const cx = imgX + item.x * imgW;
      const cy = imgY + item.y * imgH;
      const radius = counterRadiusPx(item, unitScale);
      ctx.save();
      ctx.shadowColor = "rgba(15, 23, 42, 0.28)";
      ctx.shadowBlur = Math.max(4, 8 * unitScale);
      ctx.shadowOffsetY = Math.max(1, 2 * unitScale);
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = item.color;
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.lineWidth = Math.max(1.5, 2 * unitScale);
      ctx.strokeStyle = "#FFFFFF";
      ctx.stroke();
      ctx.fillStyle = contrastTextForHex(item.color);
      ctx.font = `700 ${Math.round(radius * 1.08)}px "Instrument Sans", ui-sans-serif, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(item.step), cx, cy + 0.5 * unitScale);
      ctx.restore();
    } else if (item.kind === "text") {
      const tx = imgX + item.x * imgW;
      const ty = imgY + item.y * imgH;
      const fontPx = Math.max(12, item.fontSize * unitScale);
      const content = item.text;
      if (!content) continue;
      ctx.save();
      ctx.font = `700 ${Math.round(fontPx)}px "Instrument Sans", ui-sans-serif, system-ui, sans-serif`;
      ctx.textBaseline = "middle";
      const metrics = ctx.measureText(content);
      const padX = fontPx * 0.56;
      const padY = fontPx * 0.36;
      const boxW = metrics.width + padX * 2;
      const boxH = fontPx + padY * 2;
      const fgColor = resolveTextFgColor(item);
      if (item.pill) {
        ctx.shadowColor = "rgba(15, 23, 42, 0.22)";
        ctx.shadowBlur = Math.max(4, 9 * unitScale);
        ctx.shadowOffsetY = Math.max(1, 2.5 * unitScale);
        ctx.fillStyle = resolveTextPillColor(item);
        roundedRectPath(ctx, tx, ty - boxH / 2, boxW, boxH, boxH / 2);
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.fillStyle = fgColor;
        ctx.fillText(content, tx + padX, ty + 0.5 * unitScale);
      } else {
        ctx.shadowColor = "rgba(15, 23, 42, 0.28)";
        ctx.shadowBlur = Math.max(2, 4 * unitScale);
        ctx.fillStyle = fgColor;
        ctx.fillText(content, tx, ty);
      }
      ctx.restore();
    }
  }

  // Preview-only live angle guide when drawing/adjusting lines & arrows.
  if (options.activeAngleGuide) {
    const g = options.activeAngleGuide;
    const ax = imgX + g.anchorX * imgW;
    const ay = imgY + g.anchorY * imgH;
    const tx = imgX + g.targetX * imgW;
    const ty = imgY + g.targetY * imgH;
    const dx = tx - ax;
    const dy = ty - ay;
    const len = Math.hypot(dx, dy);
    if (len >= 4) {
      ctx.save();
      const guideColor = g.snapped ? "#2563EB" : "rgba(37, 99, 235, 0.72)";
      ctx.strokeStyle = guideColor;
      ctx.lineWidth = Math.max(1, 1.25 * s);
      ctx.setLineDash?.([4 * s, 4 * s]);

      // Full-canvas snapped axis ray when snapped to 0° / 15° / 45° / 90°; otherwise horizontal reference tick + protractor arc.
      if (g.snapped) {
        const ux = dx / len;
        const uy = dy / len;
        const reach = Math.hypot(W, H);
        ctx.beginPath();
        ctx.moveTo(Math.max(0, Math.min(W, ax - ux * reach)), Math.max(0, Math.min(H, ay - uy * reach)));
        ctx.lineTo(Math.max(0, Math.min(W, ax + ux * reach)), Math.max(0, Math.min(H, ay + uy * reach)));
        ctx.stroke();
      } else {
        const stubLen = Math.min(42 * s, len * 0.75);
        const dirSign = dx >= 0 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax + dirSign * stubLen, ay);
        ctx.stroke();
      }
      ctx.setLineDash?.([]);

      const label = `${g.angleDeg}°`;
      const fontSize = Math.max(10, Math.round(11 * s));
      ctx.font = `600 ${fontSize}px "JetBrains Mono", ui-monospace, monospace`;
      const textW = ctx.measureText(label).width;
      const pillW = textW + 12 * s;
      const pillH = fontSize + 8 * s;
      const px = Math.max(4 * s, Math.min(W - pillW - 4 * s, tx + 12 * s));
      const py = Math.max(4 * s, Math.min(H - pillH - 4 * s, ty - pillH - 8 * s));
      ctx.fillStyle = g.snapped ? "#2563EB" : "rgba(24, 24, 27, 0.88)";
      roundedRectPath(ctx, px, py, pillW, pillH, pillH / 2);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, px + pillW / 2, py + pillH / 2 + 0.5 * s);
      ctx.restore();
    }
  }

  // Preview-only selection chrome & control handles:
  // Figma / tldraw convention: square corner handles = proportional scaling; pill edge handles = 1D axis stretch.
  if (options.selectedId && options.selectedId !== options.editingTextId) {
    const sel = annotations.find(a => a.id === options.selectedId);
    if (sel) {
      ctx.save();
      const accent = "#2563EB";
      const handleR = Math.max(4.5, 5 * s);

      const drawCircleHandle = (hx: number, hy: number, subtle = false) => {
        ctx.beginPath();
        ctx.arc(hx, hy, subtle ? handleR * 0.88 : handleR, 0, Math.PI * 2);
        ctx.fillStyle = subtle ? "#DBEAFE" : "#FFFFFF";
        ctx.fill();
        ctx.lineWidth = Math.max(1.5, 1.75 * s);
        ctx.strokeStyle = accent;
        ctx.stroke();
      };

      const drawCornerSquare = (hx: number, hy: number) => {
        const side = Math.max(7.5, 8.4 * s);
        roundedRectPath(ctx, hx - side / 2, hy - side / 2, side, side, 2 * s);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        ctx.lineWidth = Math.max(1.4, 1.7 * s);
        ctx.strokeStyle = accent;
        ctx.stroke();
      };

      const drawEdgePill = (hx: number, hy: number, horizontal: boolean) => {
        const pw = horizontal ? Math.max(10, 11.5 * s) : Math.max(4.5, 5 * s);
        const ph = horizontal ? Math.max(4.5, 5 * s) : Math.max(10, 11.5 * s);
        roundedRectPath(ctx, hx - pw / 2, hy - ph / 2, pw, ph, Math.min(pw, ph) / 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        ctx.lineWidth = Math.max(1.3, 1.6 * s);
        ctx.strokeStyle = accent;
        ctx.stroke();
      };

      if (sel.kind === "arrow" || sel.kind === "line") {
        const x1 = imgX + sel.x1 * imgW;
        const y1 = imgY + sel.y1 * imgH;
        const x2 = imgX + sel.x2 * imgW;
        const y2 = imgY + sel.y2 * imgH;
        const { midX, midY } = arrowCurvePoints(x1, y1, x2, y2, sel.bend, Math.hypot(imgW, imgH));
        drawCircleHandle(x1, y1);
        drawCircleHandle(midX, midY, true);
        drawCircleHandle(x2, y2);
      } else if (sel.kind === "counter") {
        const cx = imgX + sel.x * imgW;
        const cy = imgY + sel.y * imgH;
        const r = counterRadiusPx(sel, unitScale) + 3 * s;
        ctx.strokeStyle = accent;
        ctx.lineWidth = Math.max(1.2, 1.5 * s);
        ctx.strokeRect(cx - r, cy - r, r * 2, r * 2);
        drawCornerSquare(cx - r, cy - r);
        drawCornerSquare(cx + r, cy - r);
        drawCornerSquare(cx + r, cy + r);
        drawCornerSquare(cx - r, cy + r);
      } else if (sel.kind === "freehand") {
        const b = freehandBounds(sel.points);
        const pad = 5 * s;
        const bx = imgX + b.x * imgW - pad;
        const by = imgY + b.y * imgH - pad;
        const bw = b.w * imgW + pad * 2;
        const bh = b.h * imgH + pad * 2;
        ctx.strokeStyle = accent;
        ctx.lineWidth = Math.max(1.2, 1.5 * s);
        ctx.strokeRect(bx, by, bw, bh);
        drawCornerSquare(bx, by);
        drawCornerSquare(bx + bw, by);
        drawCornerSquare(bx + bw, by + bh);
        drawCornerSquare(bx, by + bh);
      } else if (sel.kind === "text") {
        const b = measureTextBoundsPx(sel, imgW, imgH, unitScale);
        const bx = imgX + b.x;
        const by = imgY + b.y;
        ctx.strokeStyle = accent;
        ctx.lineWidth = Math.max(1.2, 1.5 * s);
        ctx.strokeRect(bx, by, b.w, b.h);
        drawCornerSquare(bx, by);
        drawCornerSquare(bx + b.w, by);
        drawCornerSquare(bx + b.w, by + b.h);
        drawCornerSquare(bx, by + b.h);
      } else {
        const bx = imgX + sel.x * imgW;
        const by = imgY + sel.y * imgH;
        const bw = sel.w * imgW;
        const bh = sel.h * imgH;
        ctx.strokeStyle = accent;
        ctx.lineWidth = Math.max(1.2, 1.5 * s);
        ctx.strokeRect(bx, by, bw, bh);
        if (bw > 24 * s) {
          drawEdgePill(bx + bw / 2, by, true);
          drawEdgePill(bx + bw / 2, by + bh, true);
        }
        if (bh > 24 * s) {
          drawEdgePill(bx + bw, by + bh / 2, false);
          drawEdgePill(bx, by + bh / 2, false);
        }
        drawCornerSquare(bx, by);
        drawCornerSquare(bx + bw, by);
        drawCornerSquare(bx + bw, by + bh);
        drawCornerSquare(bx, by + bh);
      }
      ctx.restore();
    }
  }

  // Preview-only Figma dimension readout while creating or resizing a box.
  if (options.activeSizeGuide) {
    const sg = options.activeSizeGuide;
    const bx = imgX + sg.x * imgW;
    const by = imgY + sg.y * imgH;
    const bw = sg.w * imgW;
    const bh = sg.h * imgH;
    const label = `${sg.widthPx} × ${sg.heightPx}`;
    ctx.save();
    const fontSize = Math.max(10, Math.round(10.5 * s));
    ctx.font = `600 ${fontSize}px "JetBrains Mono", ui-monospace, monospace`;
    const tw = ctx.measureText(label).width;
    const pw = tw + 11 * s;
    const ph = fontSize + 7 * s;
    const px = Math.max(4 * s, Math.min(W - pw - 4 * s, bx + bw / 2 - pw / 2));
    const py = by + bh + 8 * s + ph <= H ? by + bh + 6 * s : Math.max(4 * s, by - ph - 6 * s);
    ctx.fillStyle = "#2563EB";
    roundedRectPath(ctx, px, py, pw, ph, 4 * s);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, px + pw / 2, py + ph / 2 + 0.5 * s);
    ctx.restore();
  }

  if (options.draftCrop) {
    const dc = options.draftCrop;
    const cx = imgX + dc.x * imgW;
    const cy = imgY + dc.y * imgH;
    const cw = dc.w * imgW;
    const ch = dc.h * imgH;
    ctx.save();
    ctx.fillStyle = "rgba(9, 13, 22, 0.46)";
    ctx.beginPath();
    ctx.rect(imgX, imgY, imgW, imgH);
    ctx.rect(cx, cy, cw, ch);
    ctx.fill("evenodd");
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = Math.max(1.5, 2 * s);
    ctx.strokeRect(cx, cy, cw, ch);
    ctx.restore();
  }
}

export async function exportStudioBlob(
  img: HTMLImageElement,
  geometry: StudioGeometry,
  style: StudioStyle,
  balance: BalanceAnalysis,
  annotations: readonly AnnotationItem[],
  forceFormat?: SquareFormat,
  wallpaperImg?: HTMLImageElement | null,
): Promise<Blob> {
  const effectiveFormat = forceFormat ?? style.format;
  const effectiveStyle = effectiveFormat === style.format ? style : { ...style, format: effectiveFormat };
  const canvas = document.createElement("canvas");
  canvas.width = geometry.outW;
  canvas.height = geometry.outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  renderStudioScene(ctx, img, geometry, effectiveStyle, balance, annotations, {
    previewCheckerboard: false,
    backingScale: 1,
    wallpaperImg: wallpaperImg ?? null,
  });
  const mime = effectiveFormat === "jpeg" ? "image/jpeg" : "image/png";
  const blob = await new Promise<Blob | null>(resolve =>
    canvas.toBlob(resolve, mime, effectiveFormat === "jpeg" ? 0.92 : undefined),
  );
  if (!blob) throw new Error("encode");
  return blob;
}

export function studioFilename(sourceName: string, format: SquareFormat): string {
  const stem =
    sourceName
      .replace(/\.[^./\\]+$/, "")
      .trim()
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "screenshot";
  return `${stem}-clean.${format === "jpeg" ? "jpg" : "png"}`;
}

const FALLBACK_SAMPLE_PNG_B64 =
  "iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAUSURBVHhe7cEBDQAAAMKg909tDwcUAPg2n0AAAeXwXfEAAAAASUVORK5CYII=";

/** Synthesizes a clean local HiDPI product dashboard screenshot File so visitors can try framing & markup in 1 click. */
export async function synthesizeSampleScreenshotFile(): Promise<File> {
  if (typeof document !== "undefined") {
    const W = 1040;
    const H = 650;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (ctx && typeof ctx.fillRect === "function") {
      try {
        // Crisp modern light-mode SaaS Analytics UI window (pops cleanly against gradients & blur!)
        ctx.fillStyle = "#F8FAFC";
        ctx.fillRect(0, 0, W, H);

        // Top macOS-style window header bar
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, W, 50);
        ctx.fillStyle = "#E2E8F0";
        ctx.fillRect(0, 49, W, 1);

        const dots = [
          { x: 24, c: "#FF5F56" },
          { x: 44, c: "#FFBD2E" },
          { x: 64, c: "#27C93F" },
        ];
        for (const d of dots) {
          ctx.beginPath();
          ctx.arc(d.x, 25, 6, 0, Math.PI * 2);
          ctx.fillStyle = d.c;
          ctx.fill();
        }

        ctx.fillStyle = "#0F172A";
        ctx.font = '700 14px "Inter", -apple-system, sans-serif';
        ctx.fillText("Lumen Cloud  ·  Q4 Revenue & Growth Overview", 92, 30);

        ctx.fillStyle = "#EFF6FF";
        roundedRectPath(ctx, W - 238, 12, 214, 26, 13);
        ctx.fill();
        ctx.fillStyle = "#1D4ED8";
        ctx.font = '600 12px ui-monospace, SFMono-Regular, monospace';
        ctx.fillText("alex.morgan@lumen.io", W - 222, 29);

        // Left sidebar navigation
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 50, 206, H - 50);
        ctx.fillStyle = "#E2E8F0";
        ctx.fillRect(205, 50, 1, H - 50);

        const navLabels = ["Overview", "Revenue Analytics", "Active Customers", "API Keys & Tokens", "Billing"];
        navLabels.forEach((label, idx) => {
          const ry = 84 + idx * 38;
          if (idx === 1) {
            ctx.fillStyle = "#EEF2FF";
            roundedRectPath(ctx, 14, ry - 16, 178, 32, 8);
            ctx.fill();
          }
          ctx.fillStyle = idx === 1 ? "#4338CA" : "#64748B";
          ctx.font = `${idx === 1 ? "700" : "500"} 13px "Inter", -apple-system, sans-serif`;
          ctx.fillText(label, 28, ry + 4);
        });

        // 3 Colorful KPI Metric Cards
        const kpiCards = [
          { x: 234, title: "MONTHLY RECURRING", val: "$148,920", badge: "+24.6%", badgeBg: "#DCFCE7", badgeFg: "#15803D", bar: "#10B981" },
          { x: 496, title: "ACTIVE SUBSCRIBERS", val: "12,840", badge: "+11.2%", badgeBg: "#DBEAFE", badgeFg: "#1D4ED8", bar: "#3B82F6" },
          { x: 758, title: "AVG RESPONSE TIME", val: "42 ms", badge: "99.98% SLA", badgeBg: "#FEF3C7", badgeFg: "#B45309", bar: "#F59E0B" },
        ];
        for (const c of kpiCards) {
          ctx.fillStyle = "#FFFFFF";
          roundedRectPath(ctx, c.x, 74, 248, 118, 12);
          ctx.fill();
          ctx.strokeStyle = "#E2E8F0";
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = "#64748B";
          ctx.font = '600 11px "Inter", -apple-system, sans-serif';
          ctx.fillText(c.title, c.x + 18, 102);

          ctx.fillStyle = "#0F172A";
          ctx.font = '800 28px "Inter", -apple-system, sans-serif';
          ctx.fillText(c.val, c.x + 18, 142);

          ctx.fillStyle = c.badgeBg;
          roundedRectPath(ctx, c.x + 156, 86, 74, 22, 11);
          ctx.fill();
          ctx.fillStyle = c.badgeFg;
          ctx.font = '700 11px "Inter", -apple-system, sans-serif';
          ctx.fillText(c.badge, c.x + 166, 101);

          ctx.fillStyle = c.bar;
          roundedRectPath(ctx, c.x + 18, 164, 72, 6, 3);
          ctx.fill();
        }

        // Main Chart Card
        ctx.fillStyle = "#FFFFFF";
        roundedRectPath(ctx, 234, 214, 772, 404, 14);
        ctx.fill();
        ctx.strokeStyle = "#E2E8F0";
        ctx.stroke();

        ctx.fillStyle = "#0F172A";
        ctx.font = '700 16px "Inter", -apple-system, sans-serif';
        ctx.fillText("Net Revenue & Conversion Velocity", 260, 250);
        ctx.fillStyle = "#64748B";
        ctx.font = '500 12px ui-monospace, SFMono-Regular, monospace';
        ctx.fillText("Production Key: sk_live_98a4c2f71e  ·  Updated 2 mins ago", 260, 272);

        // Subtle horizontal gridlines
        ctx.strokeStyle = "#F1F5F9";
        for (let gy = 310; gy <= 560; gy += 62) {
          ctx.beginPath();
          ctx.moveTo(260, gy);
          ctx.lineTo(978, gy);
          ctx.stroke();
        }

        const bars = [0.36, 0.48, 0.44, 0.61, 0.58, 0.72, 0.69, 0.81, 0.77, 0.91, 0.86, 0.98];
        bars.forEach((hFrac, i) => {
          const bx = 272 + i * 59;
          const maxH = 250;
          const bh = Math.round(maxH * hFrac);
          const by = 576 - bh;
          const grad = ctx.createLinearGradient(bx, by, bx, 576);
          if (i >= 9) {
            grad.addColorStop(0, "#0EA5E9");
            grad.addColorStop(1, "#4F46E5");
          } else {
            grad.addColorStop(0, "#93C5FD");
            grad.addColorStop(1, "#6366F1");
          }
          ctx.fillStyle = grad;
          roundedRectPath(ctx, bx, by, 38, bh, 8);
          ctx.fill();
        });

        const isJsdom = typeof navigator !== "undefined" && /jsdom/i.test(navigator.userAgent);
        if (!isJsdom && typeof canvas.toBlob === "function") {
          const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/png"));
          if (blob) {
            return new File([blob], "sample-dashboard.png", { type: "image/png" });
          }
        }
      } catch {
        // Fall through to deterministic PNG bytes in stubbed canvas environments.
      }
    }
  }
  const bin = atob(FALLBACK_SAMPLE_PNG_B64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new File([bytes], "sample-dashboard.png", { type: "image/png" });
}

/**
 * Hit-tests handles of the selected item first (generous pixel tolerance in CSS pixels),
 * then tests all annotations top-to-bottom so any shape can be adjusted directly without switching tools.
 */
export function hitTestAnnotation(
  annotations: readonly AnnotationItem[],
  selectedId: string | null,
  nx: number,
  ny: number,
  imgCssW: number,
  imgCssH: number,
  unitCssScale: number,
): { item: AnnotationItem; handle: HandleKind } | null {
  const px = nx * imgCssW;
  const py = ny * imgCssH;
  const diag = Math.hypot(imgCssW, imgCssH);
  const handleR = 11;

  const checkSelectedHandles = (item: AnnotationItem): HandleKind | null => {
    if (item.kind === "arrow" || item.kind === "line") {
      const x1 = item.x1 * imgCssW;
      const y1 = item.y1 * imgCssH;
      const x2 = item.x2 * imgCssW;
      const y2 = item.y2 * imgCssH;
      const { midX, midY } = arrowCurvePoints(x1, y1, x2, y2, item.bend, diag);
      if (Math.hypot(px - x1, py - y1) <= handleR) return "start";
      if (Math.hypot(px - x2, py - y2) <= handleR) return "end";
      if (Math.hypot(px - midX, py - midY) <= handleR) return "mid";
      return null;
    }
    if (item.kind === "freehand") {
      const b = freehandBounds(item.points);
      const pad = 5;
      const bx = b.x * imgCssW - pad;
      const by = b.y * imgCssH - pad;
      const bw = b.w * imgCssW + pad * 2;
      const bh = b.h * imgCssH + pad * 2;
      const corners: [HandleKind, number, number][] = [
        ["nw", bx, by],
        ["ne", bx + bw, by],
        ["se", bx + bw, by + bh],
        ["sw", bx, by + bh],
      ];
      for (const [h, hx, hy] of corners) {
        if (Math.hypot(px - hx, py - hy) <= handleR) return h;
      }
      return null;
    }
    if (item.kind === "text") {
      const b = measureTextBoundsPx(item, imgCssW, imgCssH, unitCssScale);
      const corners: [HandleKind, number, number][] = [
        ["nw", b.x, b.y],
        ["ne", b.x + b.w, b.y],
        ["se", b.x + b.w, b.y + b.h],
        ["sw", b.x, b.y + b.h],
      ];
      for (const [h, hx, hy] of corners) {
        if (Math.hypot(px - hx, py - hy) <= handleR) return h;
      }
      return null;
    }
    if (item.kind === "counter") {
      const cx = item.x * imgCssW;
      const cy = item.y * imgCssH;
      const r = counterRadiusPx(item, unitCssScale) + 3;
      const corners: [HandleKind, number, number][] = [
        ["nw", cx - r, cy - r],
        ["ne", cx + r, cy - r],
        ["se", cx + r, cy + r],
        ["sw", cx - r, cy + r],
      ];
      for (const [h, hx, hy] of corners) {
        if (Math.hypot(px - hx, py - hy) <= handleR) return h;
      }
      return null;
    }

    const bx = item.x * imgCssW;
    const by = item.y * imgCssH;
    const bw = item.w * imgCssW;
    const bh = item.h * imgCssH;
    const handles: [HandleKind, number, number][] = [
      ["nw", bx, by],
      ["ne", bx + bw, by],
      ["se", bx + bw, by + bh],
      ["sw", bx, by + bh],
      ["n", bx + bw / 2, by],
      ["e", bx + bw, by + bh / 2],
      ["s", bx + bw / 2, by + bh],
      ["w", bx, by + bh / 2],
    ];
    for (const [h, hx, hy] of handles) {
      if (Math.hypot(px - hx, py - hy) <= handleR) return h;
    }
    return null;
  };

  if (selectedId) {
    const sel = annotations.find(a => a.id === selectedId);
    if (sel) {
      const h = checkSelectedHandles(sel);
      if (h) return { item: sel, handle: h };
    }
  }

  for (let i = annotations.length - 1; i >= 0; i--) {
    const item = annotations[i]!;
    if (item.kind === "arrow" || item.kind === "line") {
      const x1 = item.x1 * imgCssW;
      const y1 = item.y1 * imgCssH;
      const x2 = item.x2 * imgCssW;
      const y2 = item.y2 * imgCssH;
      if (Math.hypot(px - x1, py - y1) <= handleR) return { item, handle: "start" };
      if (Math.hypot(px - x2, py - y2) <= handleR) return { item, handle: "end" };
      const { ctrlX, ctrlY } = arrowCurvePoints(x1, y1, x2, y2, item.bend, diag);
      // Sample 16 segments along the quadratic Bezier shaft for accurate curved hit-testing.
      let minDist = Infinity;
      let prevX = x1;
      let prevY = y1;
      for (let step = 1; step <= 16; step++) {
        const t = step / 16;
        const mt = 1 - t;
        const qx = mt * mt * x1 + 2 * mt * t * ctrlX + t * t * x2;
        const qy = mt * mt * y1 + 2 * mt * t * ctrlY + t * t * y2;
        const l2 = (qx - prevX) ** 2 + (qy - prevY) ** 2;
        const u = l2 === 0 ? 0 : clamp01(((px - prevX) * (qx - prevX) + (py - prevY) * (qy - prevY)) / l2);
        const d = Math.hypot(px - (prevX + u * (qx - prevX)), py - (prevY + u * (qy - prevY)));
        if (d < minDist) minDist = d;
        prevX = qx;
        prevY = qy;
      }
      if (minDist <= Math.max(10, item.strokeWidth * unitCssScale * 2.2)) {
        return { item, handle: "move" };
      }
    } else if (item.kind === "freehand") {
      if (item.points.length === 1) {
        const p0 = item.points[0]!;
        if (Math.hypot(px - p0.x * imgCssW, py - p0.y * imgCssH) <= Math.max(10, item.strokeWidth * unitCssScale * 2.2)) {
          return { item, handle: "move" };
        }
      } else if (item.points.length >= 2) {
        let minDist = Infinity;
        for (let k = 1; k < item.points.length; k++) {
          const ax = item.points[k - 1]!.x * imgCssW;
          const ay = item.points[k - 1]!.y * imgCssH;
          const bx = item.points[k]!.x * imgCssW;
          const by = item.points[k]!.y * imgCssH;
          const l2 = (bx - ax) ** 2 + (by - ay) ** 2;
          const u = l2 === 0 ? 0 : clamp01(((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / l2);
          const d = Math.hypot(px - (ax + u * (bx - ax)), py - (ay + u * (by - ay)));
          if (d < minDist) minDist = d;
        }
        if (minDist <= Math.max(10, item.strokeWidth * unitCssScale * 2.2)) {
          return { item, handle: "move" };
        }
      }
    } else if (item.kind === "counter") {
      const r = counterRadiusPx(item, unitCssScale) + 4;
      if (Math.hypot(px - item.x * imgCssW, py - item.y * imgCssH) <= r) {
        return { item, handle: "move" };
      }
    } else if (item.kind === "text") {
      const b = measureTextBoundsPx(item, imgCssW, imgCssH, unitCssScale);
      if (px >= b.x - 4 && px <= b.x + b.w + 4 && py >= b.y - 4 && py <= b.y + b.h + 4) {
        return { item, handle: "move" };
      }
    } else {
      const bx = item.x * imgCssW;
      const by = item.y * imgCssH;
      const bw = item.w * imgCssW;
      const bh = item.h * imgCssH;
      if (px >= bx - 4 && px <= bx + bw + 4 && py >= by - 4 && py <= by + bh + 4) {
        return { item, handle: "move" };
      }
    }
  }
  return null;
}

export function cursorForHandle(handle: HandleKind | null, tool: AnnotationTool): string {
  if (!handle) return tool === "select" ? "default" : "crosshair";
  switch (handle) {
    case "nw":
    case "se":
    case "scale":
      return "nwse-resize";
    case "ne":
    case "sw":
      return "nesw-resize";
    case "n":
    case "s":
      return "ns-resize";
    case "e":
    case "w":
      return "ew-resize";
    case "start":
    case "mid":
    case "end":
      return "grab";
    case "move":
      return "move";
  }
}
