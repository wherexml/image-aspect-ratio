"use client";

import { createAgent, registerTools } from "@ui-sdk/react/agent";
import { Button } from "@ui-sdk/react/button";
import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerAreaThumb,
  ColorPickerInput,
  ColorPickerSlider,
  ColorPickerSliderThumb,
  ColorPickerSwatches,
  ColorPickerSwatchItem,
} from "@ui-sdk/react/color-picker";
import { Field, FieldLabel } from "@ui-sdk/react/field";
import { Input } from "@ui-sdk/react/input";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@ui-sdk/react/popover";
import { Radio, RadioGroup } from "@ui-sdk/react/radio";
import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectItemIndicator,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  type ListData,
} from "@ui-sdk/react/select";
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@ui-sdk/react/slider";
import { Switch, SwitchThumb } from "@ui-sdk/react/switch";
import { Toggle, ToggleGroup, ToggleIcon } from "@ui-sdk/react/toggle";
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarSeparator,
} from "@ui-sdk/react/toolbar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  createTooltipController,
} from "@ui-sdk/react/tooltip";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent as ReactDragEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { ERR_DOWNLOAD } from "@/lib/image-input";
import type { SquareFormat } from "@/lib/square";
import { useToolTracking } from "@/lib/tool-analytics";
import { copyPngBlobSafe, useImageCopySupported } from "@/lib/v2-clipboard";
import { consumeV2PendingImage } from "@/lib/v2-image-handoff";
import {
  ANNOTATION_COLORS,
  BLURRED_PRESETS,
  DEFAULT_BALANCE,
  DEFAULT_CUSTOM_GRADIENT,
  DEFAULT_STUDIO_STYLE,
  ERR_BYTES,
  ERR_PIXELS,
  ERR_READ,
  FULL_CROP,
  GRADIENT_PRESETS,
  INPUT_MAX_BYTES,
  INPUT_MAX_PIXELS,
  MIN_CROP_PX,
  PLAIN_COLORS_PASTEL,
  PLAIN_COLORS_PRIMARY,
  STUDIO_RATIOS,
  WALLPAPER_PRESETS,
  analyzeAutoBalance,
  clamp01,
  clampRange,
  studioAnnotationBounds,
  translateAnnotation,
  DEFAULT_ANNOTATION_BOUNDS,
  computeBoxCreation,
  computeBoxResize,
  computeStudioLayout,
  contrastTextForHex,
  cursorForHandle,
  customGradientCss,
  doesStyleMatchPreset,
  exportStudioBlob,
  hitTestAnnotation,
  isCandidateType,
  measureTextBoundsPx,
  normalizeBox,
  renderStudioScene,
  reprojectAnnotationsForCrop,
  resolveTextFgColor,
  resolveTextPillColor,
  scaleAnnotationUniformly,
  scaleFreehandPoints,
  snapLineEndpoint,
  sourceCropPixels,
  studioFilename,
  stylePreviewSwatchCss,
  synthesizeSampleScreenshotFile,
  type ActiveAngleGuide,
  type ActiveSizeGuide,
  type AnnotationItem,
  type AnnotationBounds,
  type AnnotationTool,
  type BalanceAnalysis,
  type BoxAnnotation,
  type CropRect,
  type DragModifiers,
  type HandleKind,
  type SavedStylePreset,
  type StudioRatioId,
  type StudioStyle,
  type StudioWindowBar,
} from "@/lib/screenshot-studio";

const PRESET_STORAGE_KEY = "screenshot-studio-presets-v2";
const DRAG_CREATE_THRESHOLD_PX = 6;
const STROKE_OPTIONS = [2, 3, 4, 6, 8, 12] as const;
const STROKE_ITEMS: ListData = STROKE_OPTIONS.map(pt => ({ value: String(pt), label: `${pt} pt` }));
const FORMAT_ITEMS: ListData = [
  { value: "png", label: "PNG" },
  { value: "jpeg", label: "JPG" },
];

type StudioAgent = ReturnType<typeof createAgent>;
let studioAgentInstance: StudioAgent | null = null;
export function getStudioAgent(): StudioAgent {
  studioAgentInstance ??= createAgent();
  return studioAgentInstance;
}

const BUILTIN_PRESETS: readonly SavedStylePreset[] = [
  {
    id: "preset-pine",
    name: "Northern Light",
    style: {
      backgroundId: "pine",
      customColor: "#F4F4F5",
      customGradient: DEFAULT_CUSTOM_GRADIENT,
      padding: 48,
      autoBalance: false,
      shadow: 40,
      radius: 12,
      ratio: "auto",
    },
  },
  {
    id: "preset-clean",
    name: "Clean Gray",
    style: {
      backgroundId: "solid-zinc",
      customColor: "#F4F4F5",
      customGradient: DEFAULT_CUSTOM_GRADIENT,
      padding: 48,
      autoBalance: false,
      shadow: 40,
      radius: 12,
      ratio: "auto",
    },
  },
  {
    id: "preset-bloom",
    name: "Clean Bloom",
    style: {
      backgroundId: "bloom",
      customColor: "#F4F4F5",
      customGradient: DEFAULT_CUSTOM_GRADIENT,
      padding: 56,
      autoBalance: false,
      shadow: 55,
      radius: 14,
      ratio: "auto",
    },
  },
  {
    id: "preset-wide",
    name: "16:9 Slide",
    style: {
      backgroundId: "ocean",
      customColor: "#F4F4F5",
      customGradient: DEFAULT_CUSTOM_GRADIENT,
      padding: 64,
      autoBalance: false,
      shadow: 60,
      radius: 16,
      ratio: "16:9",
    },
  },
  {
    id: "preset-blur",
    name: "Blurred Glass",
    style: {
      backgroundId: "blur-vivid",
      customColor: "#F4F4F5",
      customGradient: DEFAULT_CUSTOM_GRADIENT,
      padding: 56,
      autoBalance: false,
      shadow: 60,
      radius: 14,
      ratio: "auto",
    },
  },
  {
    id: "preset-showcase",
    name: "Glass Showcase",
    style: {
      backgroundId: "candy-mesh",
      customColor: "#F4F4F5",
      customGradient: DEFAULT_CUSTOM_GRADIENT,
      padding: 56,
      autoBalance: false,
      shadow: 60,
      radius: 14,
      ratio: "auto",
      windowBar: "dark",
      glassBezel: true,
    },
  },
];

type CustomWallpaper = {
  id: string;
  name: string;
  url: string;
  img: HTMLImageElement;
};

type Snapshot = {
  crop: CropRect;
  annotations: AnnotationItem[];
};

type LoadedImage = {
  name: string;
  url: string;
  img: HTMLImageElement;
  width: number;
  height: number;
};

type ActiveDrag =
  | {
      kind: "pending-create";
      pointerId: number;
      tool: Exclude<AnnotationTool, "select" | "counter" | "text" | "crop">;
      startClientX: number;
      startClientY: number;
      startNx: number;
      startNy: number;
      baseCrop: CropRect;
      baseAnnotations: AnnotationItem[];
    }
  | {
      kind: "creating-line";
      pointerId: number;
      id: string;
      startNx: number;
      startNy: number;
    }
  | {
      kind: "creating-box";
      pointerId: number;
      id: string;
      boxKind: BoxAnnotation["kind"];
      startNx: number;
      startNy: number;
    }
  | {
      kind: "creating-freehand";
      pointerId: number;
      id: string;
    }
  | {
      kind: "manipulate";
      pointerId: number;
      id: string;
      handle: HandleKind;
      startNx: number;
      startNy: number;
      originItem: AnnotationItem;
      baseCrop: CropRect;
      baseAnnotations: AnnotationItem[];
      recordedHistory: boolean;
    }
  | {
      kind: "crop";
      pointerId: number;
      startClientX: number;
      startClientY: number;
      startNx: number;
      startNy: number;
      active: boolean;
    };

let uidSeq = 1;
const nextUid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${uidSeq++}`;

const Icons = {
  crop: (
    <svg aria-hidden="true" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 2.2v9.3A1.5 1.5 0 0 0 6.5 13h9.3" />
      <path d="M2.2 5h9.3A1.5 1.5 0 0 1 13 6.5v9.3" />
    </svg>
  ),
  openImage: (
    <svg aria-hidden="true" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="3.5" width="11.5" height="11.5" rx="2.2" />
      <circle cx="6.2" cy="7.2" r="1.1" fill="currentColor" stroke="none" />
      <path d="m3.2 13 3.4-3.2 2.4 2.2 2-1.8 2.8 2.8" />
      <path d="M14.5 1.8v3.6M12.7 3.6h3.6" />
    </svg>
  ),
  sidebarBg: (
    <svg aria-hidden="true" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.2" y="2.8" width="13.6" height="12.4" rx="2.4" />
      <path d="M11.2 2.8v12.4" />
    </svg>
  ),
  select: (
    <svg aria-hidden="true" viewBox="0 0 18 18" fill="currentColor">
      <path d="M4.2 2.4a.55.55 0 0 0-.9.42v11.1a.55.55 0 0 0 .93.4l2.92-2.76 1.98 4.18a.55.55 0 0 0 .73.26l1.3-.62a.55.55 0 0 0 .26-.73L9.44 10.5l3.92-.34a.55.55 0 0 0 .34-.96L4.2 2.4Z" />
    </svg>
  ),
  rect: (
    <svg aria-hidden="true" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="3.5" width="12" height="11" rx="2" />
    </svg>
  ),
  filled: (
    <svg aria-hidden="true" viewBox="0 0 18 18" fill="currentColor">
      <rect x="2.8" y="3.3" width="12.4" height="11.4" rx="2.2" />
    </svg>
  ),
  ellipse: (
    <svg aria-hidden="true" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="9" cy="9" r="5.8" />
    </svg>
  ),
  line: (
    <svg aria-hidden="true" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round">
      <path d="M3.5 14.5 14.5 3.5" />
    </svg>
  ),
  arrow: (
    <svg aria-hidden="true" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14 14 4" />
      <path d="M7.5 4H14v6.5" />
    </svg>
  ),
  freehand: (
    <svg aria-hidden="true" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">
      <path d="m11.8 2.6 3.4 3.4-7.4 7.4-3.8.8.8-3.8 7-7.8Z" />
      <path d="M2.8 15.5c2.2 0 3.1-1.3 4.7-1.3s2.3 1.3 4.4 1.3c1.5 0 2.5-.6 3.3-1.3" />
    </svg>
  ),
  text: (
    <svg aria-hidden="true" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 14.5 9 3.5l4.5 11" />
      <path d="M6.1 10.8h5.8" />
    </svg>
  ),
  blur: (
    <svg aria-hidden="true" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 2.4C6.3 5.8 4.4 8.2 4.4 10.9a4.6 4.6 0 0 0 9.2 0C13.6 8.2 11.7 5.8 9 2.4Z" />
      <path d="M6.8 11.2a2.2 2.2 0 0 0 2.2 2.2" opacity="0.55" />
    </svg>
  ),
  pixelate: (
    <svg aria-hidden="true" viewBox="0 0 18 18" fill="none">
      <rect x="2.5" y="2.5" width="13" height="13" rx="2.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="3.4" y="3.4" width="3.7" height="3.7" fill="currentColor" />
      <rect x="10.9" y="3.4" width="3.7" height="3.7" fill="currentColor" />
      <rect x="7.15" y="7.15" width="3.7" height="3.7" fill="currentColor" />
      <rect x="3.4" y="10.9" width="3.7" height="3.7" fill="currentColor" />
      <rect x="10.9" y="10.9" width="3.7" height="3.7" fill="currentColor" />
    </svg>
  ),
  spotlight: (
    <svg aria-hidden="true" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2.3" y="3" width="13.4" height="12" rx="2.3" opacity="0.45" />
      <rect x="5.3" y="5.8" width="7.4" height="6.4" rx="1.2" strokeWidth="1.75" />
    </svg>
  ),
  counter: (
    <svg aria-hidden="true" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="6.5" fill="currentColor" />
      <path d="M9.6 5.7v6.6M7.8 7l1.8-1.3" stroke="var(--ss-icon-cutout, #ffffff)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  highlight: (
    <svg aria-hidden="true" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.4" y="12.4" width="13.2" height="3.2" rx="1" fill="currentColor" fillOpacity="0.32" stroke="none" />
      <path d="m10.8 2.5 3.6 3.6-4.7 4.7H6.1V7.2l4.7-4.7Z" />
      <path d="M6.1 10.8 4.6 12.4h3.8l1.3-1.6" />
    </svg>
  ),
  undo: (
    <svg aria-hidden="true" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 5.5 3.5 8.5l3 3" />
      <path d="M4 8.5h6.8a3.7 3.7 0 1 1 0 7.4H8.5" />
    </svg>
  ),
  redo: (
    <svg aria-hidden="true" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">
      <path d="m11.5 5.5 3 3-3 3" />
      <path d="M14 8.5H7.2a3.7 3.7 0 1 0 0 7.4h2.3" />
    </svg>
  ),
  trash: (
    <svg aria-hidden="true" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 5.2h11M7 5.2V3.6c0-.5.4-.9.9-.9h2.2c.5 0 .9.4.9.9v1.6M5.2 5.2l.6 9.1c0 .7.6 1.2 1.3 1.2h3.8c.7 0 1.3-.5 1.3-1.2l.6-9.1" />
    </svg>
  ),
  copy: (
    <svg aria-hidden="true" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6.2" y="6.2" width="8.8" height="8.8" rx="1.8" />
      <path d="M11.8 6.2V4.6A1.6 1.6 0 0 0 10.2 3H4.6A1.6 1.6 0 0 0 3 4.6v5.6a1.6 1.6 0 0 0 1.6 1.6h1.6" />
    </svg>
  ),
  check: (
    <svg aria-hidden="true" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3.8 9.4 3.4 3.4 7-7.4" />
    </svg>
  ),
  reset: (
    <svg aria-hidden="true" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 4.5v4h4" />
      <path d="M4 8.5a5.5 5.5 0 1 1 1.3 4" />
    </svg>
  ),
  plus: (
    <svg aria-hidden="true" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <path d="M9 3.8v10.4M3.8 9h10.4" />
    </svg>
  ),
  download: (
    <svg aria-hidden="true" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3v8.2M5.8 8.3 9 11.5l3.2-3.2" />
      <path d="M3.5 13.8h11" />
    </svg>
  ),
  chevronDown: (
    <svg aria-hidden="true" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3.5 5.2 3.5 3.6 3.5-3.6" />
    </svg>
  ),
};

const MARKUP_TOOLS: readonly {
  id: Exclude<AnnotationTool, "crop">;
  label: string;
  shortcut?: string;
  icon: ReactNode;
}[] = [
  { id: "select", label: "Pointer", shortcut: "V", icon: Icons.select },
  { id: "rect", label: "Outline box", shortcut: "R", icon: Icons.rect },
  { id: "filled", label: "Filled block", shortcut: "F", icon: Icons.filled },
  { id: "ellipse", label: "Oval", shortcut: "O", icon: Icons.ellipse },
  { id: "line", label: "Straight line", shortcut: "L", icon: Icons.line },
  { id: "arrow", label: "Curved arrow", shortcut: "A", icon: Icons.arrow },
  { id: "freehand", label: "Freehand", shortcut: "P", icon: Icons.freehand },
  { id: "text", label: "Text callout", shortcut: "T", icon: Icons.text },
  { id: "blur", label: "Blur redact", shortcut: "B", icon: Icons.blur },
  { id: "pixelate", label: "Mosaic redact", shortcut: "M", icon: Icons.pixelate },
  { id: "spotlight", label: "Spotlight", shortcut: "S", icon: Icons.spotlight },
  { id: "counter", label: "Step badge", shortcut: "N", icon: Icons.counter },
  { id: "highlight", label: "Highlighter", shortcut: "H", icon: Icons.highlight },
];

export function ScreenshotStudio({
  initialTool = "arrow",
  initialUnframed = false,
}: {
  initialTool?: AnnotationTool;
  initialUnframed?: boolean;
} = {}) {
  const [tooltip] = useState(() => createTooltipController<string>());
  const [loaded, setLoaded] = useState<LoadedImage | null>(null);
  const [reading, setReading] = useState(false);
  const [inputError, setInputError] = useState("");

  const [crop, setCrop] = useState<CropRect>(FULL_CROP);
  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);
  const [past, setPast] = useState<Snapshot[]>([]);
  const [future, setFuture] = useState<Snapshot[]>([]);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [gradientsExpanded, setGradientsExpanded] = useState(true);
  const [tool, setTool] = useState<AnnotationTool>(initialTool);
  const [color, setColor] = useState<string>("#EF4444");
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [textPill, setTextPill] = useState<boolean>(true);
  const [textColorOverride, setTextColorOverride] = useState<string | null>(null);
  const [savePopoverOpen, setSavePopoverOpen] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [draftCrop, setDraftCrop] = useState<CropRect | null>(null);
  const [hoverHandle, setHoverHandle] = useState<HandleKind | null>(null);
  const [activeAngleGuide, setActiveAngleGuide] = useState<ActiveAngleGuide | null>(null);
  const [activeSizeGuide, setActiveSizeGuide] = useState<ActiveSizeGuide | null>(null);

  const [style, setStyle] = useState<StudioStyle>(() =>
    initialUnframed
      ? { ...DEFAULT_STUDIO_STYLE, backgroundId: "none", padding: 0, cornerRadius: 0, shadow: 0 }
      : DEFAULT_STUDIO_STYLE,
  );
  const [activeGradStop, setActiveGradStop] = useState<"start" | "mid" | "end">("start");
  const [savedPresets, setSavedPresets] = useState<SavedStylePreset[]>([]);
  const [activePresetId, setActivePresetId] = useState<string>(initialUnframed ? "none" : "preset-pine");
  const [presetDraftName, setPresetDraftName] = useState<string>("");
  const [customWallpapers, setCustomWallpapers] = useState<CustomWallpaper[]>([]);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [copied, setCopied] = useState(false);
  const imageCopySupported = useImageCopySupported();
  const tracking = useToolTracking("screenshot_studio", "annotate", null);
  const trackingRef = useRef(tracking);
  trackingRef.current = tracking;

  const generationRef = useRef(0);
  const urlsRef = useRef(new Set<string>());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wallpaperInputRef = useRef<HTMLInputElement>(null);
  const [shellEl, setShellEl] = useState<HTMLDivElement | null>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inlineTextInputRef = useRef<HTMLInputElement>(null);
  const editingSessionRef = useRef<{
    id: string;
    isNew: boolean;
    initialText: string;
    finalized: boolean;
  } | null>(null);
  const historyBurstRef = useRef<{ kind: string; id: string; at: number } | null>(null);
  const dragRef = useRef<ActiveDrag | null>(null);
  const [workspaceWidth, setWorkspaceWidth] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    const agent = getStudioAgent();
    return registerTools(agent, { allow: () => true });
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PRESET_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        setSavedPresets(
          parsed
            .filter(
              (p): p is SavedStylePreset =>
                !!p && typeof p === "object" && typeof (p as SavedStylePreset).id === "string" && typeof (p as SavedStylePreset).name === "string",
            )
            .map(p => ({
              ...p,
              style: {
                ...p.style,
                customGradient: p.style.customGradient ?? DEFAULT_CUSTOM_GRADIENT,
              },
            })),
        );
      }
    } catch {
      return;
    }
  }, []);

  useEffect(() => {
    const set = urlsRef.current;
    return () => {
      generationRef.current++;
      set.forEach(u => URL.revokeObjectURL(u));
      set.clear();
    };
  }, []);

  useEffect(() => {
    const syncViewport = () => setViewportHeight(window.innerHeight);
    syncViewport();
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  useEffect(() => {
    const node = workspaceRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    setWorkspaceWidth(node.getBoundingClientRect().width);
    const observer = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width ?? 0;
      if (w > 0) setWorkspaceWidth(w);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [loaded?.url, sidebarOpen]);

  const balance: BalanceAnalysis = useMemo(() => {
    if (!loaded) return DEFAULT_BALANCE;
    return analyzeAutoBalance(loaded.img, loaded.width, loaded.height, crop);
  }, [loaded, crop.x, crop.y, crop.w, crop.h]);

  const geometry = useMemo(() => {
    if (!loaded) return null;
    return computeStudioLayout(loaded.width, loaded.height, crop, style, balance);
  }, [loaded, crop, style, balance]);

  const annotationBounds: AnnotationBounds = useMemo(
    () => (geometry ? studioAnnotationBounds(geometry) : DEFAULT_ANNOTATION_BOUNDS),
    [geometry],
  );

  const isCropped =
    !!loaded && (crop.x > 0.001 || crop.y > 0.001 || crop.w < 0.999 || crop.h < 0.999);

  const activeWallpaperImg = useMemo(() => {
    if (!style.backgroundId.startsWith("wp-custom:")) return null;
    return customWallpapers.find(w => w.id === style.backgroundId)?.img ?? null;
  }, [style.backgroundId, customWallpapers]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !loaded || !geometry) return;
    const availW = Math.max(200, (workspaceWidth || 720) - 48);
    const availH = Math.max(240, Math.min(Math.round((viewportHeight || 900) * 0.72), 820));
    const cssScale = Math.min(1, availW / geometry.outW, availH / geometry.outH, 960 / geometry.outW);
    const displayW = Math.max(1, Math.round(geometry.outW * cssScale));
    const effectiveCssScale = displayW / geometry.outW;
    const frame = requestAnimationFrame(() => {
      const dpr = Math.min(2.5, window.devicePixelRatio || 1);
      const pxW = Math.max(1, Math.round(geometry.outW * effectiveCssScale * dpr));
      const backingScale = pxW / geometry.outW;
      const pxH = Math.max(1, Math.round(geometry.outH * backingScale));
      if (canvas.width !== pxW || canvas.height !== pxH) {
        canvas.width = pxW;
        canvas.height = pxH;
      }
      canvas.style.width = `${displayW}px`;
      canvas.style.height = "auto";
      canvas.style.aspectRatio = `${geometry.outW} / ${geometry.outH}`;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      renderStudioScene(ctx, loaded.img, geometry, style, balance, annotations, {
        previewCheckerboard: true,
        selectedId,
        editingTextId,
        draftCrop,
        backingScale,
        wallpaperImg: activeWallpaperImg,
        activeAngleGuide,
        activeSizeGuide,
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [
    loaded,
    geometry,
    style,
    balance,
    annotations,
    selectedId,
    editingTextId,
    draftCrop,
    workspaceWidth,
    viewportHeight,
    activeWallpaperImg,
    activeAngleGuide,
    activeSizeGuide,
  ]);

  useEffect(() => {
    if (editingTextId) {
      requestAnimationFrame(() => {
        inlineTextInputRef.current?.focus();
        inlineTextInputRef.current?.select();
      });
    }
  }, [editingTextId]);

  const pushHistory = useCallback((prevCrop: CropRect, prevAnnotations: AnnotationItem[]) => {
    historyBurstRef.current = null;
    setPast(p => [...p.slice(-39), { crop: prevCrop, annotations: prevAnnotations }]);
    setFuture([]);
  }, []);

  const pushCoalescedHistory = useCallback(
    (kind: string, id: string, windowMs: number, prevCrop: CropRect, prevAnnotations: AnnotationItem[]) => {
      const now = Date.now();
      const burst = historyBurstRef.current;
      if (!burst || burst.kind !== kind || burst.id !== id || now - burst.at > windowMs) {
        setPast(p => [...p.slice(-39), { crop: prevCrop, annotations: prevAnnotations }]);
        setFuture([]);
      }
      historyBurstRef.current = { kind, id, at: now };
    },
    [],
  );

  const commitInlineText = useCallback(
    (returnCanvasFocus = false) => {
      const session = editingSessionRef.current;
      if (!session || session.finalized) {
        if (editingTextId) {
          setEditingTextId(null);
        }
        return;
      }
      const liveDomVal = inlineTextInputRef.current?.value;
      session.finalized = true;
      editingSessionRef.current = null;
      setEditingTextId(null);

      const found = annotations.find(a => a.id === session.id);
      const rawText =
        typeof liveDomVal === "string"
          ? liveDomVal
          : found && found.kind === "text"
            ? found.text
            : "";
      const trimmed = rawText.trim();

      if (!trimmed) {
        setAnnotations(curr => curr.filter(a => a.id !== session.id));
        setSelectedId(s => (s === session.id ? null : s));
        setPast(p => p.slice(0, -1));
      } else {
        if (!session.isNew && trimmed === session.initialText) {
          setPast(p => p.slice(0, -1));
        }
        setAnnotations(curr =>
          curr.map(a => (a.id === session.id && a.kind === "text" ? { ...a, text: trimmed } : a)),
        );
      }

      if (returnCanvasFocus) {
        canvasRef.current?.focus({ preventScroll: true });
      }
    },
    [annotations, editingTextId],
  );

  const cancelInlineText = useCallback(() => {
    const session = editingSessionRef.current;
    if (!session || session.finalized) {
      setEditingTextId(null);
      return;
    }
    session.finalized = true;
    editingSessionRef.current = null;
    setEditingTextId(null);
    setPast(p => p.slice(0, -1));

    if (session.isNew) {
      setAnnotations(curr => curr.filter(a => a.id !== session.id));
      setSelectedId(s => (s === session.id ? null : s));
    } else {
      setAnnotations(curr =>
        curr.map(a => (a.id === session.id && a.kind === "text" ? { ...a, text: session.initialText } : a)),
      );
    }
    canvasRef.current?.focus({ preventScroll: true });
  }, []);

  const undo = useCallback(() => {
    if (exporting) return;
    if (editingTextId) commitInlineText(false);
    historyBurstRef.current = null;
    dragRef.current = null;
    setDraftCrop(null);
    setActiveAngleGuide(null);
    setActiveSizeGuide(null);
    setPast(p => {
      if (p.length === 0) return p;
      const previous = p[p.length - 1]!;
      setFuture(f => [{ crop, annotations }, ...f].slice(0, 40));
      setCrop(previous.crop);
      setAnnotations(previous.annotations);
      setSelectedId(prev => (prev && previous.annotations.some(a => a.id === prev) ? prev : null));
      return p.slice(0, -1);
    });
  }, [exporting, editingTextId, commitInlineText, crop, annotations]);

  const redo = useCallback(() => {
    if (exporting) return;
    if (editingTextId) commitInlineText(false);
    historyBurstRef.current = null;
    dragRef.current = null;
    setDraftCrop(null);
    setActiveAngleGuide(null);
    setActiveSizeGuide(null);
    setFuture(f => {
      if (f.length === 0) return f;
      const nextSnap = f[0]!;
      setPast(p => [...p.slice(-39), { crop, annotations }]);
      setCrop(nextSnap.crop);
      setAnnotations(nextSnap.annotations);
      setSelectedId(prev => (prev && nextSnap.annotations.some(a => a.id === prev) ? prev : null));
      return f.slice(1);
    });
  }, [exporting, editingTextId, commitInlineText, crop, annotations]);

  const deleteSelected = useCallback(() => {
    if (!selectedId || exporting) return;
    pushHistory(crop, annotations);
    const id = selectedId;
    setSelectedId(null);
    setAnnotations(curr => curr.filter(a => a.id !== id));
  }, [selectedId, exporting, pushHistory, crop, annotations]);

  const readFile = useCallback(async (file?: File | null) => {
    if (!file) return;
    const id = ++generationRef.current;
    historyBurstRef.current = null;
    editingSessionRef.current = null;
    dragRef.current = null;
    setDraftCrop(null);
    setActiveAngleGuide(null);
    setActiveSizeGuide(null);
    setEditingTextId(null);
    setSelectedId(null);
    setInputError("");
    setExportError("");

    if (!isCandidateType(file.type)) {
      setInputError(ERR_READ);
      return;
    }
    if (file.size > INPUT_MAX_BYTES) {
      setInputError(ERR_BYTES);
      return;
    }

    const url = URL.createObjectURL(file);
    urlsRef.current.add(url);
    setReading(true);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      if (id !== generationRef.current) {
        URL.revokeObjectURL(url);
        urlsRef.current.delete(url);
        return;
      }
      if (!img.naturalWidth || !img.naturalHeight) throw new Error("decode");
      if (img.naturalWidth * img.naturalHeight > INPUT_MAX_PIXELS) throw new Error("pixels");

      setLoaded(prev => {
        if (prev) {
          URL.revokeObjectURL(prev.url);
          urlsRef.current.delete(prev.url);
        }
        return {
          name: file.name || "screenshot.png",
          url,
          img,
          width: img.naturalWidth,
          height: img.naturalHeight,
        };
      });
      setCrop(FULL_CROP);
      setAnnotations([]);
      setPast([]);
      setFuture([]);
      if (file.name !== "sample-dashboard.png") {
        trackingRef.current.imageRead(`${file.name}:${file.size}:${img.naturalWidth}x${img.naturalHeight}`);
      }
    } catch (err) {
      URL.revokeObjectURL(url);
      urlsRef.current.delete(url);
      if (id === generationRef.current) {
        setInputError(err instanceof Error && err.message === "pixels" ? ERR_PIXELS : ERR_READ);
      }
    } finally {
      if (id === generationRef.current) setReading(false);
    }
  }, []);

  const readRef = useRef(readFile);
  readRef.current = readFile;

  useEffect(() => {
    const pending = consumeV2PendingImage();
    if (pending) void readRef.current(pending);
  }, []);
  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      if (event.defaultPrevented) return;
      const target = event.target;
      // Let text inputs and open popovers paste plain text undisturbed.
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || target.closest("input, textarea, select, [contenteditable]"))
      ) {
        return;
      }
      const data = event.clipboardData;
      if (!data) return;
      let file: File | null = Array.from(data.files).find(f => isCandidateType(f.type)) ?? null;
      if (!file) {
        for (const item of Array.from(data.items)) {
          if (item.kind === "file" && isCandidateType(item.type)) {
            file = item.getAsFile();
            if (file) break;
          }
        }
      }
      if (!file) return;
      event.preventDefault();
      void readRef.current(file);
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      const target = event.target;
      // Let actual text-entry fields handle all typing, selection, and native input undo undisturbed.
      const isTextEditable =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          Boolean(
            target.closest(
              'input:not([type="range"]):not([type="checkbox"]):not([type="file"]), textarea, select, [contenteditable]',
            ),
          ));
      if (isTextEditable) return;

      const keyLower = event.key.toLowerCase();
      // Global Undo / Redo works from anywhere outside text inputs (including after clicking toolbar/swatch buttons).
      if ((event.metaKey || event.ctrlKey) && !event.altKey) {
        if (keyLower === "z") {
          event.preventDefault();
          if (event.shiftKey) redo();
          else undo();
          return;
        }
        if (keyLower === "y" && !event.shiftKey) {
          event.preventDefault();
          redo();
          return;
        }
      }

      // Let open popovers and select menus handle Escape, Arrow navigation, and typeahead undisturbed.
      const inPopup =
        target instanceof HTMLElement && Boolean(target.closest('[role="dialog"], [role="listbox"]'));
      if (inPopup) return;

      if ((event.metaKey || event.ctrlKey) && keyLower === "d" && selectedId && geometry && !exporting) {
        event.preventDefault();
        const orig = annotations.find(a => a.id === selectedId);
        if (!orig) return;
        pushHistory(crop, annotations);
        const dx = 16 / Math.max(1, geometry.imgW);
        const dy = 16 / Math.max(1, geometry.imgH);
        const dupId = nextUid(orig.kind);
        const shifted = translateAnnotation(orig, dx, dy, annotationBounds);
        const dup: AnnotationItem = shifted.kind === "counter"
          ? { ...shifted, id: dupId, step: annotations.reduce((mx, a) => a.kind === "counter" ? Math.max(mx, a.step) : mx, 0) + 1 }
          : { ...shifted, id: dupId };
        setAnnotations(curr => [...curr, dup]);
        setSelectedId(dupId);
        return;
      }
      if (event.key === "Escape") {
        setActiveAngleGuide(null);
        setActiveSizeGuide(null);
        if (draftCrop || tool === "crop") {
          setDraftCrop(null);
          setTool("select");
          return;
        }
        if (selectedId) setSelectedId(null);
        return;
      }
      if ((event.key === "Backspace" || event.key === "Delete") && selectedId) {
        event.preventDefault();
        deleteSelected();
        return;
      }

      // Figma / Photoshop uniform scale shortcuts: `[` / `-` scales down, `]` / `=` / `+` scales up (hold Shift for larger steps).
      const isScaleDown =
        event.code === "BracketLeft" || event.key === "[" || event.key === "{" || event.key === "-" || event.key === "_";
      const isScaleUp =
        event.code === "BracketRight" || event.key === "]" || event.key === "}" || event.key === "=" || event.key === "+";
      if ((isScaleDown || isScaleUp) && selectedId && geometry && !exporting && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        const factor = isScaleUp ? (event.shiftKey ? 1.25 : 1.12) : event.shiftKey ? 0.8 : 0.9;
        pushCoalescedHistory("scale-key", selectedId, 400, crop, annotations);
        setAnnotations(curr =>
          curr.map(item =>
            item.id === selectedId ? scaleAnnotationUniformly(item, factor, geometry.imgW, geometry.imgH, annotationBounds) : item,
          ),
        );
        return;
      }

      const nudgeMap: Record<string, [number, number]> = {
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
      };
      const delta = nudgeMap[event.key];
      if (delta && selectedId && geometry && !exporting && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        const stepPx = event.shiftKey ? 10 : 2;
        const dw = (delta[0] * stepPx) / Math.max(1, geometry.imgW);
        const dh = (delta[1] * stepPx) / Math.max(1, geometry.imgH);
        const minW = 8 / Math.max(1, geometry.imgW);
        const minH = 8 / Math.max(1, geometry.imgH);
        pushCoalescedHistory("resize-key", selectedId, 450, crop, annotations);
        setAnnotations(curr =>
          curr.map(item => {
            if (item.id !== selectedId) return item;
            if (
              item.kind === "arrow" ||
              item.kind === "line" ||
              item.kind === "freehand" ||
              item.kind === "counter" ||
              item.kind === "text"
            ) {
              const grow = delta[0] > 0 || delta[1] < 0;
              const factor = grow ? (event.shiftKey ? 1.15 : 1.06) : event.shiftKey ? 0.87 : 0.94;
              return scaleAnnotationUniformly(item, factor, geometry.imgW, geometry.imgH, annotationBounds);
            }
            return {
              ...item,
              w: delta[0] !== 0 ? Math.max(minW, Math.min(annotationBounds.maxX - item.x, item.w + dw)) : item.w,
              h: delta[1] !== 0 ? Math.max(minH, Math.min(annotationBounds.maxY - item.y, item.h + dh)) : item.h,
            };
          }),
        );
        return;
      }

      const inSliderOrRoving =
        target instanceof HTMLElement &&
        Boolean(
          target.closest(
            'input[type="range"], [data-slot="slider-thumb"], [role="radiogroup"], [role="toolbar"]',
          ),
        );
      if (delta && selectedId && geometry && !exporting && !event.metaKey && !event.ctrlKey && !inSliderOrRoving) {
        event.preventDefault();
        const stepPx = event.shiftKey ? 10 : 2;
        const dx = (delta[0] * stepPx) / Math.max(1, geometry.imgW);
        const dy = (delta[1] * stepPx) / Math.max(1, geometry.imgH);
        pushCoalescedHistory("nudge", selectedId, 450, crop, annotations);
        setAnnotations(curr =>
          curr.map(item => {
            if (item.id !== selectedId) return item;
            return translateAnnotation(item, dx, dy, annotationBounds);
          }),
        );
        return;
      }

      if (loaded && !exporting && !event.metaKey && !event.ctrlKey && !event.altKey) {
        const toolShortcuts: Record<string, AnnotationTool> = {
          v: "select",
          r: "rect",
          f: "filled",
          o: "ellipse",
          l: "line",
          a: "arrow",
          p: "freehand",
          t: "text",
          b: "blur",
          m: "pixelate",
          s: "spotlight",
          n: "counter",
          h: "highlight",
          c: "crop",
        };
        const nextTool = toolShortcuts[keyLower];
        if (nextTool) {
          event.preventDefault();
          if (editingTextId) commitInlineText(false);
          setTool(nextTool);
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [
    selectedId,
    draftCrop,
    tool,
    geometry,
    annotationBounds,
    loaded,
    exporting,
    crop,
    annotations,
    editingTextId,
    commitInlineText,
    pushHistory,
    pushCoalescedHistory,
    undo,
    redo,
    deleteSelected,
  ]);

  const selectedItem = useMemo(
    () => annotations.find(a => a.id === selectedId) ?? null,
    [annotations, selectedId],
  );

  function pointerMetrics(event: { clientX: number; clientY: number }) {
    const canvas = canvasRef.current;
    if (!canvas || !geometry) return null;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    const cssPerOutX = rect.width / geometry.outW;
    const cssPerOutY = rect.height / geometry.outH;
    const imgCssLeft = rect.left + geometry.imgX * cssPerOutX;
    const imgCssTop = rect.top + geometry.imgY * cssPerOutY;
    const imgCssW = Math.max(1, geometry.imgW * cssPerOutX);
    const imgCssH = Math.max(1, geometry.imgH * cssPerOutY);
    const unitCssScale = geometry.scale * Math.min(cssPerOutX, cssPerOutY);
    const rawX = (event.clientX - imgCssLeft) / imgCssW;
    const rawY = (event.clientY - imgCssTop) / imgCssH;
    const nx = tool === "crop" ? clamp01(rawX) : clampRange(rawX, annotationBounds.minX, annotationBounds.maxX);
    const ny = tool === "crop" ? clamp01(rawY) : clampRange(rawY, annotationBounds.minY, annotationBounds.maxY);
    const insideImage = rawX >= 0 && rawX <= 1 && rawY >= 0 && rawY <= 1;
    return { nx, ny, imgCssW, imgCssH, unitCssScale, insideImage };
  }

  function onCanvasPointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!loaded || !geometry || exporting || event.button !== 0) return;
    if (editingTextId) commitInlineText();
    const m = pointerMetrics(event);
    if (!m) return;

    const pid = event.pointerId ?? 0;
    event.currentTarget.focus({ preventScroll: true });
    try {
      // Synthetic PointerEvents in jsdom throw if pointerId is not active on hardware.
      event.currentTarget.setPointerCapture?.(pid);
    } catch {
      // Ignore synthetic capture error.
    }

    if (tool === "crop") {
      if (!m.insideImage) return;
      dragRef.current = {
        kind: "crop",
        pointerId: pid,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startNx: m.nx,
        startNy: m.ny,
        active: false,
      };
      return;
    }

    const hit = hitTestAnnotation(
      annotations,
      selectedId,
      m.nx,
      m.ny,
      m.imgCssW,
      m.imgCssH,
      m.unitCssScale,
    );
    if (hit) {
      setSelectedId(hit.item.id);
      dragRef.current = {
        kind: "manipulate",
        pointerId: pid,
        id: hit.item.id,
        handle: hit.handle,
        startNx: m.nx,
        startNy: m.ny,
        originItem: hit.item,
        baseCrop: crop,
        baseAnnotations: annotations,
        recordedHistory: false,
      };
      return;
    }

    if (tool === "select") {
      setSelectedId(null);
      return;
    }

    if (tool === "counter") {
      const nextStep = annotations.reduce((mx, a) => (a.kind === "counter" ? Math.max(mx, a.step) : mx), 0) + 1;
      const id = nextUid("cnt");
      const item: AnnotationItem = {
        id,
        kind: "counter",
        color,
        strokeWidth,
        x: m.nx,
        y: m.ny,
        step: nextStep,
      };
      pushHistory(crop, annotations);
      const nextList = [...annotations, item];
      setAnnotations(nextList);
      setSelectedId(id);
      dragRef.current = {
        kind: "manipulate",
        pointerId: pid,
        id,
        handle: "move",
        startNx: m.nx,
        startNy: m.ny,
        originItem: item,
        baseCrop: crop,
        baseAnnotations: nextList,
        recordedHistory: true,
      };
      return;
    }

    if (tool === "text") {
      const id = nextUid("txt");
      const item: AnnotationItem = {
        id,
        kind: "text",
        color,
        strokeWidth,
        x: Math.max(annotationBounds.minX, Math.min(annotationBounds.maxX - 0.12, m.nx)),
        y: m.ny,
        text: "",
        fontSize: 14 + strokeWidth * 2.5,
        pill: textPill,
        pillColor: color,
        ...(textColorOverride ? { textColor: textColorOverride } : {}),
      };
      pushHistory(crop, annotations);
      setAnnotations(curr => [...curr, item]);
      setSelectedId(id);
      editingSessionRef.current = { id, isNew: true, initialText: "", finalized: false };
      setEditingTextId(id);
      return;
    }

    setSelectedId(null);
    dragRef.current = {
      kind: "pending-create",
      pointerId: pid,
      tool,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startNx: m.nx,
      startNy: m.ny,
      baseCrop: crop,
      baseAnnotations: annotations,
    };
  }

  function onCanvasPointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    const m = pointerMetrics(event);
    if (!m) return;

    const drag = dragRef.current;
    if (!drag) {
      if (tool === "crop") {
        setHoverHandle(null);
        return;
      }
      const hit = hitTestAnnotation(
        annotations,
        selectedId,
        m.nx,
        m.ny,
        m.imgCssW,
        m.imgCssH,
        m.unitCssScale,
      );
      setHoverHandle(hit?.handle ?? null);
      return;
    }

    const pid = event.pointerId ?? 0;
    if (drag.pointerId !== pid || exporting || !geometry) return;

    const mods: DragModifiers = {
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
      ctrlKey: event.ctrlKey,
    };

    if (drag.kind === "crop") {
      const dist = Math.hypot(event.clientX - drag.startClientX, event.clientY - drag.startClientY);
      if (!drag.active && dist >= DRAG_CREATE_THRESHOLD_PX) drag.active = true;
      if (drag.active) {
        setDraftCrop(computeBoxCreation(drag.startNx, drag.startNy, m.nx, m.ny, geometry.imgW, geometry.imgH, mods));
      }
      return;
    }

    if (drag.kind === "pending-create") {
      const dist = Math.hypot(event.clientX - drag.startClientX, event.clientY - drag.startClientY);
      if (dist < DRAG_CREATE_THRESHOLD_PX) return;

      const id = nextUid(drag.tool);
      pushHistory(drag.baseCrop, drag.baseAnnotations);

      if (drag.tool === "freehand") {
        const created: AnnotationItem = {
          id,
          kind: "freehand",
          color,
          strokeWidth,
          points: [
            { x: drag.startNx, y: drag.startNy },
            { x: m.nx, y: m.ny },
          ],
        };
        setAnnotations([...drag.baseAnnotations, created]);
        setSelectedId(null);
        setActiveAngleGuide(null);
        setActiveSizeGuide(null);
        dragRef.current = {
          kind: "creating-freehand",
          pointerId: drag.pointerId,
          id,
        };
      } else if (drag.tool === "arrow" || drag.tool === "line") {
        const pt = snapLineEndpoint(drag.startNx, drag.startNy, m.nx, m.ny, geometry.imgW, geometry.imgH, mods, annotationBounds);
        const created: AnnotationItem = {
          id,
          kind: drag.tool,
          color,
          strokeWidth,
          x1: drag.startNx,
          y1: drag.startNy,
          x2: pt.nx,
          y2: pt.ny,
          bend: 0,
        };
        setAnnotations([...drag.baseAnnotations, created]);
        setSelectedId(id);
        setActiveSizeGuide(null);
        setActiveAngleGuide({
          anchorX: drag.startNx,
          anchorY: drag.startNy,
          targetX: pt.nx,
          targetY: pt.ny,
          angleDeg: pt.angleDeg,
          snapped: pt.snapped,
        });
        dragRef.current = {
          kind: "creating-line",
          pointerId: drag.pointerId,
          id,
          startNx: drag.startNx,
          startNy: drag.startNy,
        };
      } else {
        const box = computeBoxCreation(drag.startNx, drag.startNy, m.nx, m.ny, geometry.imgW, geometry.imgH, mods, annotationBounds);
        const created: BoxAnnotation = {
          id,
          kind: drag.tool,
          color,
          strokeWidth,
          ...box,
        };
        setAnnotations([...drag.baseAnnotations, created]);
        setSelectedId(id);
        setActiveAngleGuide(null);
        setActiveSizeGuide({
          ...box,
          widthPx: Math.max(1, Math.round(box.w * geometry.imgW)),
          heightPx: Math.max(1, Math.round(box.h * geometry.imgH)),
        });
        dragRef.current = {
          kind: "creating-box",
          pointerId: drag.pointerId,
          id,
          boxKind: drag.tool,
          startNx: drag.startNx,
          startNy: drag.startNy,
        };
      }
      return;
    }

    if (drag.kind === "creating-freehand") {
      setAnnotations(curr =>
        curr.map(a => {
          if (a.id !== drag.id || a.kind !== "freehand") return a;
          const pts = a.points;
          if (pts.length === 0) return { ...a, points: [{ x: m.nx, y: m.ny }] };
          const prev = pts[pts.length - 1]!;
          const distPx = Math.hypot((m.nx - prev.x) * m.imgCssW, (m.ny - prev.y) * m.imgCssH);
          if (distPx >= 2.2) {
            return { ...a, points: [...pts, { x: m.nx, y: m.ny }] };
          }
          if (pts.length >= 2) {
            return { ...a, points: [...pts.slice(0, -1), { x: m.nx, y: m.ny }] };
          }
          return a;
        }),
      );
      return;
    }

    if (drag.kind === "creating-line") {
      const pt = snapLineEndpoint(drag.startNx, drag.startNy, m.nx, m.ny, geometry.imgW, geometry.imgH, mods, annotationBounds);
      setActiveAngleGuide({
        anchorX: drag.startNx,
        anchorY: drag.startNy,
        targetX: pt.nx,
        targetY: pt.ny,
        angleDeg: pt.angleDeg,
        snapped: pt.snapped,
      });
      setAnnotations(curr =>
        curr.map(a => (a.id === drag.id && (a.kind === "arrow" || a.kind === "line") ? { ...a, x2: pt.nx, y2: pt.ny } : a)),
      );
      return;
    }

    if (drag.kind === "creating-box") {
      const box = computeBoxCreation(drag.startNx, drag.startNy, m.nx, m.ny, geometry.imgW, geometry.imgH, mods, annotationBounds);
      setActiveSizeGuide({
        ...box,
        widthPx: Math.max(1, Math.round(box.w * geometry.imgW)),
        heightPx: Math.max(1, Math.round(box.h * geometry.imgH)),
      });
      setAnnotations(curr =>
        curr.map(a => (a.id === drag.id && a.kind === drag.boxKind ? { ...a, ...box } : a)),
      );
      return;
    }

    if (drag.kind === "manipulate") {
      const dx = m.nx - drag.startNx;
      const dy = m.ny - drag.startNy;
      if (!drag.recordedHistory && Math.hypot(dx * m.imgCssW, dy * m.imgCssH) >= 2) {
        drag.recordedHistory = true;
        pushHistory(drag.baseCrop, drag.baseAnnotations);
      }
      const orig = drag.originItem;
      const [mdx, mdy] =
        drag.handle === "move" && mods.shiftKey
          ? Math.abs(dx * m.imgCssW) >= Math.abs(dy * m.imgCssH)
            ? [dx, 0]
            : [0, dy]
          : [dx, dy];

      if (orig.kind === "arrow" || orig.kind === "line") {
        setActiveSizeGuide(null);
        if (drag.handle === "start") {
          const pt = snapLineEndpoint(orig.x2, orig.y2, orig.x1 + dx, orig.y1 + dy, geometry.imgW, geometry.imgH, mods, annotationBounds);
          setActiveAngleGuide({
            anchorX: orig.x2,
            anchorY: orig.y2,
            targetX: pt.nx,
            targetY: pt.ny,
            angleDeg: pt.angleDeg,
            snapped: pt.snapped,
          });
          setAnnotations(curr => curr.map(a => (a.id === drag.id ? { ...orig, x1: pt.nx, y1: pt.ny } : a)));
          return;
        }
        if (drag.handle === "end") {
          const pt = snapLineEndpoint(orig.x1, orig.y1, orig.x2 + dx, orig.y2 + dy, geometry.imgW, geometry.imgH, mods, annotationBounds);
          setActiveAngleGuide({
            anchorX: orig.x1,
            anchorY: orig.y1,
            targetX: pt.nx,
            targetY: pt.ny,
            angleDeg: pt.angleDeg,
            snapped: pt.snapped,
          });
          setAnnotations(curr => curr.map(a => (a.id === drag.id ? { ...orig, x2: pt.nx, y2: pt.ny } : a)));
          return;
        }
        setActiveAngleGuide(null);
        if (drag.handle === "mid") {
          const x1Px = orig.x1 * m.imgCssW;
          const y1Px = orig.y1 * m.imgCssH;
          const x2Px = orig.x2 * m.imgCssW;
          const y2Px = orig.y2 * m.imgCssH;
          const mx = (x1Px + x2Px) / 2;
          const my = (y1Px + y2Px) / 2;
          const sdx = x2Px - x1Px;
          const sdy = y2Px - y1Px;
          const len = Math.hypot(sdx, sdy) || 1;
          const nxUnit = -sdy / len;
          const nyUnit = sdx / len;
          const ptX = m.nx * m.imgCssW;
          const ptY = m.ny * m.imgCssH;
          const diag = Math.hypot(m.imgCssW, m.imgCssH) || 1;
          const rawBend = ((ptX - mx) * nxUnit + (ptY - my) * nyUnit) / diag;
          const snappedBend = Math.abs(rawBend) < 0.008 ? 0 : Math.max(-0.45, Math.min(0.45, rawBend));
          setAnnotations(curr => curr.map(a => (a.id === drag.id ? { ...orig, bend: snappedBend } : a)));
          return;
        }
        setAnnotations(curr => curr.map(a => a.id === drag.id ? translateAnnotation(orig, mdx, mdy, annotationBounds) : a));
        return;
      }

      setActiveAngleGuide(null);

      if (orig.kind === "freehand") {
        setActiveSizeGuide(null);
        if (drag.handle === "nw" || drag.handle === "ne" || drag.handle === "se" || drag.handle === "sw") {
          const nextPts = scaleFreehandPoints(
            orig.points,
            drag.handle,
            dx,
            dy,
            geometry.imgW,
            geometry.imgH,
            mods,
            annotationBounds,
          );
          setAnnotations(curr => curr.map(a => (a.id === drag.id ? { ...orig, points: nextPts } : a)));
          return;
        }
        setAnnotations(curr =>
          curr.map(a => (a.id === drag.id ? translateAnnotation(orig, mdx, mdy, annotationBounds) : a)),
        );
        return;
      }

      if (orig.kind === "counter") {
        setActiveSizeGuide(null);
        if (drag.handle === "nw" || drag.handle === "ne" || drag.handle === "se" || drag.handle === "sw") {
          const cx = orig.x * m.imgCssW;
          const cy = orig.y * m.imgCssH;
          const startDist = Math.max(8, Math.hypot(drag.startNx * m.imgCssW - cx, drag.startNy * m.imgCssH - cy));
          const curDist = Math.max(4, Math.hypot(m.nx * m.imgCssW - cx, m.ny * m.imgCssH - cy));
          const nextScale = Math.max(0.55, Math.min(3.2, Number(((orig.scale ?? 1) * (curDist / startDist)).toFixed(3))));
          setAnnotations(curr => curr.map(a => (a.id === drag.id ? { ...orig, scale: nextScale } : a)));
          return;
        }
        setAnnotations(curr =>
          curr.map(a => (a.id === drag.id ? translateAnnotation(orig, mdx, mdy, annotationBounds) : a)),
        );
        return;
      }

      if (orig.kind === "text") {
        setActiveSizeGuide(null);
        if (
          drag.handle === "nw" ||
          drag.handle === "ne" ||
          drag.handle === "se" ||
          drag.handle === "sw" ||
          drag.handle === "scale"
        ) {
          const b = measureTextBoundsPx(orig, m.imgCssW, m.imgCssH, m.unitCssScale);
          const tcx = b.x + b.w / 2;
          const tcy = b.y + b.h / 2;
          const startDist = Math.max(8, Math.hypot(drag.startNx * m.imgCssW - tcx, drag.startNy * m.imgCssH - tcy));
          const curDist = Math.max(4, Math.hypot(m.nx * m.imgCssW - tcx, m.ny * m.imgCssH - tcy));
          const nextFont = Math.max(10, Math.min(96, Math.round(orig.fontSize * (curDist / startDist))));
          setAnnotations(curr => curr.map(a => (a.id === drag.id ? { ...orig, fontSize: nextFont } : a)));
          return;
        }
        setAnnotations(curr =>
          curr.map(a => (a.id === drag.id ? translateAnnotation(orig, mdx, mdy, annotationBounds) : a)),
        );
        return;
      }

      if (drag.handle === "move") {
        setActiveSizeGuide(null);
        setAnnotations(curr => curr.map(a => a.id === drag.id ? translateAnnotation(orig, mdx, mdy, annotationBounds) : a));
        return;
      }

      const resized = computeBoxResize(orig, drag.handle, dx, dy, geometry.imgW, geometry.imgH, mods, annotationBounds);
      setActiveSizeGuide({
        ...resized,
        widthPx: Math.max(1, Math.round(resized.w * geometry.imgW)),
        heightPx: Math.max(1, Math.round(resized.h * geometry.imgH)),
      });
      setAnnotations(curr => curr.map(a => (a.id === drag.id ? { ...orig, ...resized } : a)));
    }
  }

  function onCanvasPointerUp(event: ReactPointerEvent<HTMLCanvasElement>) {
    const drag = dragRef.current;
    const pid = event.pointerId ?? 0;
    if (!drag || drag.pointerId !== pid) return;
    dragRef.current = null;
    setActiveAngleGuide(null);
    setActiveSizeGuide(null);

    if (drag.kind === "creating-freehand") {
      setSelectedId(drag.id);
      return;
    }

    if (drag.kind === "crop") {
      const box = draftCrop;
      setDraftCrop(null);
      if (!drag.active || !box || !loaded) return;
      const curDims = sourceCropPixels(loaded.width, loaded.height, crop);
      if (box.w * curDims.sw < MIN_CROP_PX || box.h * curDims.sh < MIN_CROP_PX) return;
      const nextCrop: CropRect = {
        x: clamp01(crop.x + box.x * crop.w),
        y: clamp01(crop.y + box.y * crop.h),
        w: clamp01(box.w * crop.w),
        h: clamp01(box.h * crop.h),
      };
      const nextAnnotations = reprojectAnnotationsForCrop(annotations, crop, nextCrop, loaded.width, loaded.height, annotationBounds,
        studioAnnotationBounds(computeStudioLayout(loaded.width, loaded.height, nextCrop, style, analyzeAutoBalance(loaded.img, loaded.width, loaded.height, nextCrop))));
      pushHistory(crop, annotations);
      setCrop(nextCrop);
      setAnnotations(nextAnnotations);
      setSelectedId(prev => (prev && nextAnnotations.some(a => a.id === prev) ? prev : null));
      setTool("select");
    }
  }

  function onCanvasDoubleClick(event: ReactPointerEvent<HTMLCanvasElement> | ReactMouseEvent<HTMLCanvasElement>) {
    if (!loaded || !geometry || exporting) return;
    const m = pointerMetrics(event);
    if (!m) return;
    const hit = hitTestAnnotation(annotations, selectedId, m.nx, m.ny, m.imgCssW, m.imgCssH, m.unitCssScale);
    if (!hit) return;
    if (hit.item.kind === "text") {
      pushHistory(crop, annotations);
      setSelectedId(hit.item.id);
      editingSessionRef.current = {
        id: hit.item.id,
        isNew: false,
        initialText: hit.item.text,
        finalized: false,
      };
      setEditingTextId(hit.item.id);
    } else if ((hit.item.kind === "arrow" || hit.item.kind === "line") && hit.handle === "mid") {
      pushHistory(crop, annotations);
      setAnnotations(curr =>
        curr.map(a => (a.id === hit.item.id && (a.kind === "arrow" || a.kind === "line") ? { ...a, bend: 0 } : a)),
      );
    }
  }

  function applyColor(hex: string) {
    setColor(hex);
    if (selectedId && !exporting) {
      const current = annotations.find(a => a.id === selectedId);
      if (!current) return;
      if (current.kind === "text") {
        pushCoalescedHistory("color", selectedId, 300, crop, annotations);
        setAnnotations(curr =>
          curr.map(a => {
            if (a.id !== selectedId || a.kind !== "text") return a;
            if (a.pill) {
              const clash = a.textColor && a.textColor.trim().toUpperCase() === hex.trim().toUpperCase();
              return { ...a, color: hex, pillColor: hex, ...(clash ? { textColor: undefined } : {}) };
            }
            return { ...a, color: hex, pillColor: hex, textColor: hex };
          }),
        );
        return;
      }
      if (current.color.trim().toUpperCase() !== hex.trim().toUpperCase()) {
        pushCoalescedHistory("color", selectedId, 300, crop, annotations);
        setAnnotations(curr => curr.map(a => (a.id === selectedId ? { ...a, color: hex } : a)));
      }
    }
  }

  function applyPillBackground(nextPill: boolean, nextHex?: string) {
    setTextPill(nextPill);
    if (nextHex) {
      setColor(nextHex);
      if (textColorOverride && textColorOverride.trim().toUpperCase() === nextHex.trim().toUpperCase()) {
        setTextColorOverride(null);
      }
    }
    if (selectedId && !exporting) {
      const current = annotations.find(a => a.id === selectedId);
      if (current?.kind === "text") {
        pushCoalescedHistory("pill-color", selectedId, 300, crop, annotations);
        setAnnotations(curr =>
          curr.map(a => {
            if (a.id !== selectedId || a.kind !== "text") return a;
            const resolvedPill = nextHex ?? resolveTextPillColor(a);
            const clash =
              nextPill && a.textColor && a.textColor.trim().toUpperCase() === resolvedPill.trim().toUpperCase();
            return {
              ...a,
              pill: nextPill,
              color: resolvedPill,
              pillColor: resolvedPill,
              ...(clash ? { textColor: undefined } : {}),
            };
          }),
        );
      }
    }
  }

  function applyTextColor(nextHex: string | null) {
    setTextColorOverride(nextHex);
    if (selectedId && !exporting) {
      const current = annotations.find(a => a.id === selectedId);
      if (current?.kind === "text") {
        pushCoalescedHistory("text-color", selectedId, 300, crop, annotations);
        setAnnotations(curr =>
          curr.map(a => {
            if (a.id !== selectedId || a.kind !== "text") return a;
            if (!nextHex) {
              const copy = { ...a };
              delete copy.textColor;
              return copy;
            }
            return { ...a, textColor: nextHex, ...(!a.pill ? { color: nextHex } : {}) };
          }),
        );
      }
    }
  }

  function applyStroke(nextWidth: number) {
    setStrokeWidth(nextWidth);
    if (selectedId && !exporting) {
      pushHistory(crop, annotations);
      setAnnotations(curr =>
        curr.map(a =>
          a.id === selectedId
            ? a.kind === "text"
              ? { ...a, strokeWidth: nextWidth, fontSize: 14 + nextWidth * 2.5 }
              : { ...a, strokeWidth: nextWidth }
            : a,
        ),
      );
    }
  }

  async function readWallpaperFile(file?: File | null) {
    if (!file) return;
    if (!isCandidateType(file.type) || file.size > INPUT_MAX_BYTES) {
      setExportError("Invalid wallpaper image.");
      return;
    }
    const url = URL.createObjectURL(file);
    urlsRef.current.add(url);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      if (!img.naturalWidth || !img.naturalHeight || img.naturalWidth * img.naturalHeight > INPUT_MAX_PIXELS) {
        throw new Error("wallpaper");
      }
      const id = `wp-custom:${nextUid("wp")}`;
      const cleanName = file.name.replace(/\.[^.]+$/, "") || "Uploaded scene";
      setCustomWallpapers(prev => [...prev, { id, name: cleanName, url, img }]);
      setStyle(s => ({ ...s, backgroundId: id }));
      setExportError("");
    } catch {
      URL.revokeObjectURL(url);
      urlsRef.current.delete(url);
      setExportError("Could not read wallpaper image.");
    }
  }

  function commitSavePreset() {
    const trimmed = presetDraftName.trim() || `Saved ${savedPresets.length + 1}`;
    const entry: SavedStylePreset = {
      id: nextUid("saved-preset"),
      name: trimmed,
      style: {
        backgroundId: style.backgroundId,
        customColor: style.customColor,
        customGradient: style.customGradient,
        padding: style.padding,
        autoBalance: style.autoBalance,
        shadow: style.shadow,
        radius: style.radius,
        ratio: style.ratio,
      },
    };
    const updated = [...savedPresets, entry];
    setSavedPresets(updated);
    setActivePresetId(entry.id);
    setSavePopoverOpen(false);
    try {
      window.localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      return;
    }
  }

  function deleteSavedPreset(id: string) {
    const updated = savedPresets.filter(p => p.id !== id);
    setSavedPresets(updated);
    if (activePresetId === id || matchedPreset?.id === id) {
      setActivePresetId("preset-pine");
      setStyle(s => ({ ...s, ...BUILTIN_PRESETS[0]!.style }));
    }
    try {
      window.localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      return;
    }
  }

  function selectPresetById(id: string | null) {
    if (!id) return;
    setActivePresetId(id);
    const all = [...BUILTIN_PRESETS, ...savedPresets];
    const found = all.find(p => p.id === id);
    if (found) setStyle(s => ({ ...s, ...found.style }));
  }

  function flushAnnotationsForExport(): AnnotationItem[] {
    if (!editingTextId) return annotations;
    const targetId = editingTextId;
    commitInlineText(false);
    const found = annotations.find(a => a.id === targetId);
    if (!found || found.kind !== "text") return annotations;
    const trimmed = found.text.trim();
    if (!trimmed) return annotations.filter(a => a.id !== targetId);
    return annotations.map(a => (a.id === targetId && a.kind === "text" ? { ...a, text: trimmed } : a));
  }

  async function handleDownload() {
    if (!loaded || !geometry || exporting) return;
    const exportAnnotations = flushAnnotationsForExport();
    dragRef.current = null;
    setExporting(true);
    setExportError("");
    try {
      const blob = await exportStudioBlob(
        loaded.img,
        geometry,
        style,
        balance,
        exportAnnotations,
        undefined,
        activeWallpaperImg,
      );
      const dlUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = dlUrl;
      link.download = studioFilename(loaded.name, style.format);
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(dlUrl), 10_000);
      trackingRef.current.imageExport(
        `${loaded.name}:${geometry.outW}x${geometry.outH}:${style.format}:${style.backgroundId}:${exportAnnotations.length}`,
      );
    } catch {
      setExportError(ERR_DOWNLOAD);
    } finally {
      setExporting(false);
    }
  }

  async function handleCopy() {
    if (!loaded || !geometry || exporting || !imageCopySupported) return;
    const exportAnnotations = flushAnnotationsForExport();
    dragRef.current = null;
    setExporting(true);
    setExportError("");
    try {
      const result = await copyPngBlobSafe(() =>
        exportStudioBlob(
          loaded.img,
          geometry,
          style,
          balance,
          exportAnnotations,
          "png",
          activeWallpaperImg,
        ),
      );
      if (result.ok) {
        trackingRef.current.copy(
          `${loaded.name}:${geometry.outW}x${geometry.outH}:${style.backgroundId}:${exportAnnotations.length}`,
        );
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } else {
        setExportError(result.message);
      }
    } catch {
      setExportError("Could not copy image to clipboard. Tap Download to save the file.");
    } finally {
      setExporting(false);
    }
  }

  const editingTextItem = useMemo(
    () => (editingTextId ? annotations.find(a => a.id === editingTextId && a.kind === "text") ?? null : null),
    [annotations, editingTextId],
  );

  const inlineEditorStyle = useMemo(() => {
    if (!editingTextItem || editingTextItem.kind !== "text" || !geometry || !canvasRef.current) return null;
    const rectW = canvasRef.current.getBoundingClientRect().width;
    const cssW = rectW || parseFloat(canvasRef.current.style.width) || geometry.outW;
    const cssScale = cssW / geometry.outW;
    const cssH = geometry.outH * cssScale;
    const rawLeftPx = (geometry.imgX + editingTextItem.x * geometry.imgW) * cssScale;
    const rawTopPx = (geometry.imgY + editingTextItem.y * geometry.imgH) * cssScale;
    const leftPx = Math.max(4, Math.min(Math.max(4, cssW - 92), rawLeftPx));
    const topPx = Math.max(14, Math.min(Math.max(14, cssH - 14), rawTopPx));
    const fontPx = Math.max(13, Math.round(editingTextItem.fontSize * geometry.scale * cssScale));
    const pillBg = resolveTextPillColor(editingTextItem);
    const fgColor = resolveTextFgColor(editingTextItem);
    const borderColor = editingTextItem.pill
      ? fgColor === "#18181B"
        ? "rgba(24, 24, 27, 0.34)"
        : "rgba(255, 255, 255, 0.92)"
      : "rgba(37, 99, 235, 0.85)";
    return {
      left: `${Math.round(leftPx)}px`,
      top: `${Math.round(topPx)}px`,
      fontSize: `${fontPx}px`,
      backgroundColor: editingTextItem.pill ? pillBg : "transparent",
      color: fgColor,
      borderColor,
      borderStyle: editingTextItem.pill ? "solid" : "dashed",
      textShadow: editingTextItem.pill ? "none" : "0 1px 3px rgba(15, 23, 42, 0.42)",
    };
  }, [editingTextItem, geometry, workspaceWidth, viewportHeight]);

  const isTextContext = tool === "text" || selectedItem?.kind === "text";
  const activeColor = selectedItem?.color ?? color;
  const activePillEnabled = selectedItem?.kind === "text" ? selectedItem.pill : textPill;
  const activePillColor =
    selectedItem?.kind === "text" ? resolveTextPillColor(selectedItem) : color;
  const activeTextColor =
    selectedItem?.kind === "text"
      ? resolveTextFgColor(selectedItem)
      : textColorOverride ?? (textPill ? contrastTextForHex(color) : color);
  const isTextAutoColor =
    selectedItem?.kind === "text" ? !selectedItem.textColor : textColorOverride === null;
  const activeStroke = selectedItem?.strokeWidth ?? strokeWidth;
  const canvasCursor = cursorForHandle(hoverHandle, tool);

  const allPresets = useMemo(() => [...BUILTIN_PRESETS, ...savedPresets], [savedPresets]);
  const matchedPreset = useMemo(() => {
    const preferred = allPresets.find(p => p.id === activePresetId);
    if (preferred && doesStyleMatchPreset(style, preferred.style)) return preferred;
    return allPresets.find(p => doesStyleMatchPreset(style, p.style)) ?? null;
  }, [allPresets, activePresetId, style]);
  const isSavedPresetActive = useMemo(
    () => Boolean(matchedPreset && savedPresets.some(p => p.id === matchedPreset.id)),
    [matchedPreset, savedPresets],
  );
  const presetItems: ListData = useMemo(() => {
    const builtIns = BUILTIN_PRESETS.map(p => ({ value: p.id, label: p.name }));
    if (savedPresets.length === 0) return builtIns;
    return [
      { type: "group", label: "Built-in", items: builtIns },
      { type: "separator" },
      { type: "group", label: "Saved", items: savedPresets.map(p => ({ value: p.id, label: p.name })) },
    ];
  }, [savedPresets]);

  const visibleGradients = gradientsExpanded ? GRADIENT_PRESETS : GRADIENT_PRESETS.slice(0, 10);
  const gradientGroupValue = GRADIENT_PRESETS.some(g => g.id === style.backgroundId) ? style.backgroundId : "";
  const wallpaperGroupValue =
    WALLPAPER_PRESETS.some(w => w.id === style.backgroundId) || style.backgroundId.startsWith("wp-custom:")
      ? style.backgroundId
      : "";
  const blurredGroupValue = BLURRED_PRESETS.some(b => b.id === style.backgroundId) ? style.backgroundId : "";
  const solidGroupValue =
    PLAIN_COLORS_PRIMARY.some(c => c.id === style.backgroundId) ||
    PLAIN_COLORS_PASTEL.some(c => c.id === style.backgroundId) ||
    style.backgroundId === "transparent" ||
    style.backgroundId === "custom"
      ? style.backgroundId
      : "";

  const onDrop = (e: ReactDragEvent) => {
    e.preventDefault();
    void readFile(e.dataTransfer.files[0]);
  };

  return (
    <section aria-label="Screenshot Studio" className="ss-app mt-5" onDragOver={e => e.preventDefault()} onDrop={onDrop}>
      <input
        ref={fileInputRef}
        id="studio-file"
        type="file"
        accept="image/*"
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        onChange={e => {
          void readFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <input
        ref={wallpaperInputRef}
        id="studio-wallpaper-file"
        type="file"
        accept="image/*"
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        onChange={e => {
          void readWallpaperFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      <div ref={setShellEl} className="ss-shell">
        <Toolbar aria-label="Studio toolbar">
          <ToolbarGroup aria-label="Canvas source">
            <TooltipTrigger
              controller={tooltip}
              payload="Crop frame"
              render={
                <Toggle
                  aria-label="Crop frame"
                  pressed={Boolean(loaded) && tool === "crop"}
                  disabled={!loaded || exporting}
                  focusableWhenDisabled
                  onPressedChange={pressed => {
                    if (editingTextId) commitInlineText(false);
                    setTool(pressed ? "crop" : "select");
                  }}
                  data-testid="tool-crop"
                />
              }
            >
              <ToggleIcon>{Icons.crop}</ToggleIcon>
            </TooltipTrigger>

            {isCropped && (
              <TooltipTrigger
                controller={tooltip}
                payload="Restore full image"
                render={
                  <ToolbarButton
                    aria-label="Restore full image"
                    disabled={exporting}
                    onClick={() => {
                      if (editingTextId) commitInlineText(false);
                      pushHistory(crop, annotations);
                      const nextAnnotations = reprojectAnnotationsForCrop(
                        annotations,
                        crop,
                        FULL_CROP,
                        loaded?.width ?? 1,
                        loaded?.height ?? 1,
                        annotationBounds,
                        loaded ? studioAnnotationBounds(computeStudioLayout(loaded.width, loaded.height, FULL_CROP, style, analyzeAutoBalance(loaded.img, loaded.width, loaded.height, FULL_CROP))) : DEFAULT_ANNOTATION_BOUNDS,
                      );
                      setCrop(FULL_CROP);
                      setAnnotations(nextAnnotations);
                    }}
                    data-testid="studio-reset-crop"
                  />
                }
              >
                {Icons.reset}
              </TooltipTrigger>
            )}

            {loaded && (
              <>
                <TooltipTrigger
                  controller={tooltip}
                  payload="Replace image"
                  render={
                    <ToolbarButton
                      aria-label="Replace image"
                      disabled={reading || exporting}
                      onClick={() => fileInputRef.current?.click()}
                      data-testid="studio-choose-image"
                    />
                  }
                >
                  {Icons.openImage}
                </TooltipTrigger>
                <TooltipTrigger
                  controller={tooltip}
                  payload="Clear image"
                  render={
                    <ToolbarButton
                      aria-label="Clear image"
                      disabled={reading || exporting}
                      onClick={() => {
                        generationRef.current++;
                        dragRef.current = null;
                        if (editingTextId) setEditingTextId(null);
                        setSelectedId(null);
                        setLoaded(prev => {
                          if (prev) {
                            URL.revokeObjectURL(prev.url);
                            urlsRef.current.delete(prev.url);
                          }
                          return null;
                        });
                        setCrop(FULL_CROP);
                        setAnnotations([]);
                        setPast([]);
                        setFuture([]);
                        setInputError("");
                        setExportError("");
                      }}
                      data-testid="studio-clear-image"
                    />
                  }
                >
                  {Icons.trash}
                </TooltipTrigger>
              </>
            )}
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToggleGroup
            aria-label="Markup tool"
            value={loaded && tool !== "crop" ? [tool] : []}
            deselectable={false}
            onValueChange={([nextTool]) => {
              if (!nextTool) return;
              if (editingTextId) commitInlineText(false);
              setTool(nextTool as AnnotationTool);
            }}
          >
            {MARKUP_TOOLS.map(item => (
              <TooltipTrigger
                key={item.id}
                controller={tooltip}
                payload={item.shortcut ? `${item.label} (${item.shortcut})` : item.label}
                render={
                  <Toggle
                    value={item.id}
                    aria-label={item.label}
                    disabled={!loaded || exporting}
                    focusableWhenDisabled
                    data-testid={`tool-${item.id}`}
                  />
                }
              >
                <ToggleIcon>{item.icon}</ToggleIcon>
              </TooltipTrigger>
            ))}
          </ToggleGroup>

          <ToolbarSeparator />

          <ToolbarGroup aria-label="Markup attributes">
            <Popover
              container={shellEl}
              onOpenChange={open => {
                if (!open && selectedId) {
                  requestAnimationFrame(() => canvasRef.current?.focus({ preventScroll: true }));
                }
              }}
            >
              <TooltipTrigger
                controller={tooltip}
                payload={isTextContext ? "Pill background" : "Ink palette"}
                render={
                  <ToolbarButton
                    render={<PopoverTrigger />}
                    data-variant={isTextContext ? "toolbar-pill" : undefined}
                    aria-label={isTextContext ? "Pill background" : "Ink palette"}
                    disabled={exporting}
                    data-testid="studio-color-trigger"
                  />
                }
              >
                {isTextContext ? (
                  <>
                    <span
                      className={`ss-color-chip ss-color-chip--pill ${
                        !activePillEnabled ? "ss-color-chip--transparent" : ""
                      }`}
                      style={{ backgroundColor: activePillColor }}
                    />
                    <span>Pill</span>
                  </>
                ) : (
                  <span className="ss-color-chip" style={{ backgroundColor: activeColor }} />
                )}
              </TooltipTrigger>
              <PopoverContent align="start" sideOffset={6} collisionPadding={10}>
                <PopoverTitle>{isTextContext ? "Pill background" : "Ink palette"}</PopoverTitle>
                {isTextContext && (
                  <button
                    type="button"
                    className="ss-popover-quick-btn"
                    data-active={!activePillEnabled ? "" : undefined}
                    onClick={() => applyPillBackground(!activePillEnabled)}
                    data-testid="studio-pill-transparent"
                  >
                    <span className="inline-flex items-center gap-2">
                      <span className="ss-color-chip ss-color-chip--pill ss-color-chip--transparent" />
                      <span>Transparent (No fill)</span>
                    </span>
                    {!activePillEnabled && Icons.check}
                  </button>
                )}
                <ColorPicker
                  aria-label={isTextContext ? "Pill hex" : "Ink hex"}
                  space="hsv"
                  format="hex"
                  value={isTextContext ? activePillColor : activeColor}
                  onValueChange={hex => {
                    if (isTextContext) {
                      applyPillBackground(true, hex);
                    } else {
                      applyColor(hex);
                    }
                  }}
                >
                  <ColorPickerSwatches>
                    {ANNOTATION_COLORS.map(c => (
                      <ColorPickerSwatchItem
                        key={c.id}
                        value={c.hex}
                        aria-label={c.label}
                        data-testid={`color-${c.id}`}
                      />
                    ))}
                  </ColorPickerSwatches>
                  <ColorPickerArea>
                    <ColorPickerAreaThumb />
                  </ColorPickerArea>
                  <ColorPickerSlider channel="hue">
                    <ColorPickerSliderThumb />
                  </ColorPickerSlider>
                  <ColorPickerInput aria-label={isTextContext ? "Pill code" : "Ink code"} />
                </ColorPicker>
              </PopoverContent>
            </Popover>

            {isTextContext && (
              <Popover
                container={shellEl}
                onOpenChange={open => {
                  if (!open && selectedId) {
                    requestAnimationFrame(() => canvasRef.current?.focus({ preventScroll: true }));
                  }
                }}
              >
                <TooltipTrigger
                  controller={tooltip}
                  payload="Text color"
                  render={
                    <ToolbarButton
                      render={<PopoverTrigger />}
                      data-variant="toolbar-pill"
                      aria-label="Text color"
                      disabled={exporting}
                      data-testid="studio-text-color-trigger"
                    />
                  }
                >
                  <span className="font-bold leading-none">A</span>
                  <span className="ss-color-chip !h-3 !w-3" style={{ backgroundColor: activeTextColor }} />
                </TooltipTrigger>
                <PopoverContent align="start" sideOffset={6} collisionPadding={10}>
                  <PopoverTitle>Text color</PopoverTitle>
                  {activePillEnabled && (
                    <button
                      type="button"
                      className="ss-popover-quick-btn"
                      data-active={isTextAutoColor ? "" : undefined}
                      onClick={() => applyTextColor(null)}
                      data-testid="studio-text-color-auto"
                    >
                      <span>Auto contrast</span>
                      {isTextAutoColor && Icons.check}
                    </button>
                  )}
                  <ColorPicker
                    aria-label="Text hex"
                    space="hsv"
                    format="hex"
                    value={activeTextColor}
                    onValueChange={hex => applyTextColor(hex)}
                  >
                    <ColorPickerSwatches>
                      {ANNOTATION_COLORS.map(c => (
                        <ColorPickerSwatchItem
                          key={c.id}
                          value={c.hex}
                          aria-label={`Text ${c.label}`}
                          data-testid={`text-color-${c.id}`}
                        />
                      ))}
                    </ColorPickerSwatches>
                    <ColorPickerArea>
                      <ColorPickerAreaThumb />
                    </ColorPickerArea>
                    <ColorPickerSlider channel="hue">
                      <ColorPickerSliderThumb />
                    </ColorPickerSlider>
                    <ColorPickerInput aria-label="Text code" />
                  </ColorPicker>
                </PopoverContent>
              </Popover>
            )}

            <Select
              container={shellEl}
              items={STROKE_ITEMS}
              value={String(activeStroke)}
              disabled={exporting}
              onValueChange={val => {
                if (val) {
                  applyStroke(Number(val));
                  if (selectedId) {
                    requestAnimationFrame(() => canvasRef.current?.focus({ preventScroll: true }));
                  }
                }
              }}
            >
              <TooltipTrigger
                controller={tooltip}
                payload="Stroke weight"
                render={
                  <ToolbarButton
                    render={<SelectTrigger data-variant="select" />}
                    aria-label="Stroke weight"
                    data-testid="studio-stroke-select"
                  />
                }
              >
                <span className="num">
                  <SelectValue />
                </span>
                {Icons.chevronDown}
              </TooltipTrigger>
              <SelectContent align="start" sideOffset={6} collisionPadding={10}>
                {STROKE_OPTIONS.map(pt => (
                  <SelectItem
                    key={pt}
                    value={String(pt)}
                    label={`${pt} pt`}
                    data-testid={`stroke-opt-${pt}`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className="inline-block w-4 rounded-full bg-current"
                        style={{ height: `${Math.min(7, Math.max(1.5, pt * 0.65))}px` }}
                      />
                      <span className="num">{pt} pt</span>
                    </span>
                    <SelectItemIndicator>{Icons.check}</SelectItemIndicator>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <TooltipTrigger
              controller={tooltip}
              payload="Undo"
              render={
                <ToolbarButton
                  aria-label="Undo"
                  disabled={!loaded || exporting || past.length === 0}
                  onClick={undo}
                  data-testid="studio-undo"
                />
              }
            >
              {Icons.undo}
            </TooltipTrigger>

            <TooltipTrigger
              controller={tooltip}
              payload="Redo"
              render={
                <ToolbarButton
                  aria-label="Redo"
                  disabled={!loaded || exporting || future.length === 0}
                  onClick={redo}
                  data-testid="studio-redo"
                />
              }
            >
              {Icons.redo}
            </TooltipTrigger>

            {selectedItem && (
              <TooltipTrigger
                controller={tooltip}
                payload="Erase item"
                render={
                  <ToolbarButton
                    aria-label="Erase item"
                    disabled={exporting}
                    onClick={deleteSelected}
                    data-testid="studio-delete"
                  />
                }
              >
                {Icons.trash}
              </TooltipTrigger>
            )}
          </ToolbarGroup>

          <div className="ss-bar-actions">
            <TooltipTrigger
              controller={tooltip}
              payload="Framing sidebar"
              render={
                <Toggle
                  aria-label="Framing sidebar"
                  pressed={sidebarOpen}
                  onPressedChange={setSidebarOpen}
                  data-testid="studio-toggle-sidebar"
                />
              }
            >
              <ToggleIcon>{Icons.sidebarBg}</ToggleIcon>
            </TooltipTrigger>

            <Select
              container={shellEl}
              items={FORMAT_ITEMS}
              value={style.format}
              disabled={exporting}
              onValueChange={val => {
                if (val === "png" || val === "jpeg") {
                  setStyle(s => ({ ...s, format: val as SquareFormat }));
                }
              }}
            >
              <TooltipTrigger
                controller={tooltip}
                payload="Export format"
                render={
                  <ToolbarButton
                    render={<SelectTrigger data-variant="select" />}
                    aria-label="Export format"
                    data-testid="studio-format-select"
                  />
                }
              >
                <SelectValue />
                {Icons.chevronDown}
              </TooltipTrigger>
              <SelectContent align="end" sideOffset={6} collisionPadding={10}>
                {(
                  [
                    { id: "png", label: "PNG", hint: "Lossless" },
                    { id: "jpeg", label: "JPG", hint: "Compact" },
                  ] as const
                ).map(fmt => (
                  <SelectItem
                    key={fmt.id}
                    value={fmt.id}
                    label={fmt.label}
                    data-testid={`format-opt-${fmt.id}`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-semibold">{fmt.label}</span>
                      <span className="text-[11px] opacity-65">{fmt.hint}</span>
                    </span>
                    <SelectItemIndicator>{Icons.check}</SelectItemIndicator>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <TooltipTrigger
              controller={tooltip}
              payload={!imageCopySupported ? "Use Download to save this image" : copied ? "Copied PNG" : "Copy PNG"}
              render={
                <ToolbarButton
                  aria-label={copied ? "Copied PNG" : "Copy PNG"}
                  disabled={!loaded || exporting || !imageCopySupported}
                  onClick={() => void handleCopy()}
                  data-testid="studio-copy"
                />
              }
            >
              {copied ? Icons.check : Icons.copy}
            </TooltipTrigger>

            <Button
              data-variant="primary"
              disabled={!loaded || exporting}
              focusableWhenDisabled
              pendingAnnouncement="Saving image"
              onClick={() => handleDownload()}
              data-testid="studio-download"
            >
              {Icons.download}
              <span>{exporting ? "Saving…" : "Download"}</span>
            </Button>
          </div>
        </Toolbar>

        {(() => {
          const framingSidebar = sidebarOpen && (
            <aside aria-label="Canvas framing" className="ss-sidebar ss-sidebar--right">
              <div className="flex items-center gap-1.5">
                <Select
                  container={shellEl}
                  items={presetItems}
                  value={matchedPreset ? matchedPreset.id : null}
                  onValueChange={selectPresetById}
                >
                  <SelectTrigger
                    aria-label="Style preset"
                    data-full=""
                    data-testid="studio-preset-select"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="ss-preset-dot"
                        style={{ background: stylePreviewSwatchCss(matchedPreset ? matchedPreset.style : style) }}
                      />
                      <span className="truncate">
                        <SelectValue placeholder="Custom" />
                      </span>
                    </span>
                    {Icons.chevronDown}
                  </SelectTrigger>
                  <SelectContent align="start" sideOffset={6} collisionPadding={10}>
                    <SelectGroup>
                      <SelectGroupLabel>Built-in</SelectGroupLabel>
                      {BUILTIN_PRESETS.map(p => (
                        <SelectItem
                          key={p.id}
                          value={p.id}
                          label={p.name}
                          data-testid={`preset-opt-${p.id}`}
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <span
                              aria-hidden="true"
                              className="ss-preset-dot"
                              style={{ background: stylePreviewSwatchCss(p.style) }}
                            />
                            <span className="truncate">{p.name}</span>
                          </span>
                          <SelectItemIndicator>{Icons.check}</SelectItemIndicator>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    {savedPresets.length > 0 && (
                      <>
                        <SelectSeparator />
                        <SelectGroup>
                          <SelectGroupLabel>Saved</SelectGroupLabel>
                          {savedPresets.map(p => (
                            <SelectItem
                              key={p.id}
                              value={p.id}
                              label={p.name}
                              data-testid={`preset-opt-${p.id}`}
                            >
                              <span className="flex min-w-0 items-center gap-2">
                                <span
                                  aria-hidden="true"
                                  className="ss-preset-dot"
                                  style={{ background: stylePreviewSwatchCss(p.style) }}
                                />
                                <span className="truncate">{p.name}</span>
                              </span>
                              <SelectItemIndicator>{Icons.check}</SelectItemIndicator>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </>
                    )}
                  </SelectContent>
                </Select>

                {isSavedPresetActive && (
                  <TooltipTrigger
                    controller={tooltip}
                    payload="Remove saved preset"
                    render={
                      <Button
                        data-variant="icon"
                        aria-label="Remove saved preset"
                        onClick={() => matchedPreset && deleteSavedPreset(matchedPreset.id)}
                        data-testid="studio-delete-preset"
                      />
                    }
                  >
                    {Icons.trash}
                  </TooltipTrigger>
                )}

                <Popover
                  container={shellEl}
                  open={savePopoverOpen}
                  onOpenChange={next => {
                    if (next) setPresetDraftName(`Saved ${savedPresets.length + 1}`);
                    setSavePopoverOpen(next);
                  }}
                >
                  <TooltipTrigger
                    controller={tooltip}
                    payload="New preset"
                    render={
                      <PopoverTrigger
                        data-variant="icon"
                        aria-label="New preset"
                        data-testid="studio-save-preset"
                      />
                    }
                  >
                    {Icons.plus}
                  </TooltipTrigger>
                  <PopoverContent data-compact="" align="end" sideOffset={6} collisionPadding={10}>
                    <PopoverTitle className="sr-only">Save preset</PopoverTitle>
                    <form
                      className="ss-inline-row"
                      onSubmit={e => {
                        e.preventDefault();
                        commitSavePreset();
                      }}
                    >
                      <Input
                        aria-label="Preset name"
                        placeholder="Preset name…"
                        value={presetDraftName}
                        onValueChange={setPresetDraftName}
                        data-testid="studio-preset-name-input"
                      />
                      <Button
                        type="submit"
                        data-variant="compact-primary"
                        data-testid="studio-confirm-save-preset"
                      >
                        Save
                      </Button>
                    </form>
                  </PopoverContent>
                </Popover>
              </div>

              <Toggle
                data-variant="none-bar"
                pressed={style.backgroundId === "none"}
                onPressedChange={pressed => {
                  setStyle(s => ({ ...s, backgroundId: pressed ? "none" : "solid-zinc" }));
                }}
                data-testid="bg-none"
              >
                None
              </Toggle>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="ss-section-title">Gradients</p>
                  <div className="flex items-center gap-2">
                    <Popover
                      container={shellEl}
                      onOpenChange={open => {
                        if (open) setStyle(s => ({ ...s, backgroundId: "custom-gradient" }));
                      }}
                    >
                      <PopoverTrigger
                        data-variant="link"
                        data-testid="bg-custom-gradient"
                      >
                        <span
                          aria-hidden="true"
                          className="inline-block size-2.5 rounded-full shadow-[inset_0_0_0_1px_rgba(128,128,128,0.4)]"
                          style={{ background: customGradientCss(style.customGradient) }}
                        />
                        <span>Custom</span>
                      </PopoverTrigger>
                      <PopoverContent align="start" sideOffset={6} collisionPadding={10}>
                        <PopoverTitle>Gradient builder</PopoverTitle>
                        <div className="space-y-2.5">
                          <div
                            aria-hidden="true"
                            className="ss-grad-preview"
                            style={{ background: customGradientCss(style.customGradient) }}
                          />

                          <RadioGroup
                            aria-label="Gradient stop"
                            value={activeGradStop}
                            onValueChange={val => {
                              if (val === "start" || val === "mid" || val === "end") {
                                setActiveGradStop(val);
                              }
                            }}
                            className="ss-stop-tabs"
                          >
                            {(
                              [
                                { key: "start", label: "Start" },
                                { key: "mid", label: "Mid" },
                                { key: "end", label: "End" },
                              ] as const
                            ).map(stop => (
                              <Radio
                                key={stop.key}
                                value={stop.key}
                                data-variant="stop-tab"
                                data-testid={`grad-stop-${stop.key}`}
                              >
                                <span
                                  aria-hidden="true"
                                  className="size-2.5 shrink-0 rounded-full shadow-[inset_0_0_0_1px_rgba(128,128,128,0.45)]"
                                  style={{ backgroundColor: style.customGradient[stop.key] }}
                                />
                                <span>{stop.label}</span>
                              </Radio>
                            ))}
                          </RadioGroup>

                          <ColorPicker
                            key={activeGradStop}
                            aria-label="Stop color"
                            space="hsv"
                            format="hex"
                            value={style.customGradient[activeGradStop]}
                            onValueChange={hex =>
                              setStyle(s => ({
                                ...s,
                                backgroundId: "custom-gradient",
                                customGradient: { ...s.customGradient, [activeGradStop]: hex },
                              }))
                            }
                          >
                            <ColorPickerSwatches>
                              {(
                                [
                                  { id: "indigo", hex: "#6366F1", label: "Indigo" },
                                  { id: "pink", hex: "#EC4899", label: "Pink" },
                                  { id: "peach", hex: "#FDBA74", label: "Peach" },
                                  { id: "sky", hex: "#38BDF8", label: "Sky" },
                                  { id: "mint", hex: "#34D399", label: "Mint" },
                                  { id: "violet", hex: "#8B5CF6", label: "Violet" },
                                  { id: "midnight", hex: "#0F172A", label: "Midnight" },
                                ] as const
                              ).map(c => (
                                <ColorPickerSwatchItem
                                  key={c.id}
                                  value={c.hex}
                                  aria-label={c.label}
                                  data-testid={`grad-swatch-${c.id}`}
                                />
                              ))}
                            </ColorPickerSwatches>
                            <ColorPickerArea>
                              <ColorPickerAreaThumb />
                            </ColorPickerArea>
                            <ColorPickerSlider channel="hue">
                              <ColorPickerSliderThumb />
                            </ColorPickerSlider>
                            <ColorPickerInput aria-label="Stop hex" data-testid="grad-stop-hex-input" />
                          </ColorPicker>

                          <Field>
                            <Slider
                              min={0}
                              max={360}
                              step={5}
                              value={style.customGradient.angle}
                              format={deg => `${deg}°`}
                              onValueChange={angle =>
                                setStyle(s => ({
                                  ...s,
                                  backgroundId: "custom-gradient",
                                  customGradient: { ...s.customGradient, angle },
                                }))
                              }
                            >
                              <div className="ss-slider-head">
                                <FieldLabel>Gradient angle</FieldLabel>
                                <SliderValue />
                              </div>
                              <SliderControl>
                                <SliderTrack>
                                  <SliderIndicator />
                                  <SliderThumb />
                                </SliderTrack>
                              </SliderControl>
                            </Slider>
                          </Field>
                        </div>
                      </PopoverContent>
                    </Popover>

                    <Button
                      data-variant="link"
                      onClick={() => setGradientsExpanded(v => !v)}
                      data-testid="studio-toggle-gradients"
                    >
                      {gradientsExpanded ? "Show less" : "Show more"}
                    </Button>
                  </div>
                </div>

                <RadioGroup
                  aria-label="Mesh gradients"
                  value={gradientGroupValue}
                  onValueChange={val => {
                    if (val) setStyle(s => ({ ...s, backgroundId: val }));
                  }}
                  className="grid grid-cols-5 gap-1.5"
                >
                  {visibleGradients.map(g => (
                    <Radio
                      key={g.id}
                      value={g.id}
                      aria-label={g.name}
                      data-variant="tile"
                      data-testid={`bg-${g.id}`}
                      style={{ background: g.css }}
                    />
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-1.5">
                <p className="ss-section-title">Wallpapers</p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <RadioGroup
                    aria-label="Scene wallpapers"
                    value={wallpaperGroupValue}
                    onValueChange={val => {
                      if (val) setStyle(s => ({ ...s, backgroundId: val }));
                    }}
                    className="flex flex-wrap gap-1.5"
                  >
                    {WALLPAPER_PRESETS.map(wp => (
                      <Radio
                        key={wp.id}
                        value={wp.id}
                        aria-label={wp.name}
                        data-variant="tile"
                        data-fixed-tile=""
                        data-testid={`bg-${wp.id}`}
                        style={{ background: wp.css }}
                      />
                    ))}
                    {customWallpapers.map(cw => (
                      <Radio
                        key={cw.id}
                        value={cw.id}
                        aria-label={cw.name}
                        data-variant="tile"
                        data-fixed-tile=""
                        className="bg-cover bg-center"
                        style={{ backgroundImage: `url("${cw.url}")` }}
                      />
                    ))}
                  </RadioGroup>

                  <TooltipTrigger
                    controller={tooltip}
                    payload="Upload wallpaper"
                    render={
                      <Button
                        aria-label="Upload wallpaper"
                        data-variant="tile-upload"
                        data-testid="studio-upload-wallpaper"
                        onClick={() => wallpaperInputRef.current?.click()}
                        className="ss-dashed-tile"
                      />
                    }
                  >
                    {Icons.plus}
                  </TooltipTrigger>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="ss-section-title">Blurred</p>
                <RadioGroup
                  aria-label="Blurred backdrops"
                  value={blurredGroupValue}
                  onValueChange={val => {
                    if (val) setStyle(s => ({ ...s, backgroundId: val }));
                  }}
                  className="grid grid-cols-5 gap-1.5"
                >
                  {BLURRED_PRESETS.map(bl => (
                    <Radio
                      key={bl.id}
                      value={bl.id}
                      aria-label={bl.name}
                      data-variant="tile"
                      data-testid={`bg-${bl.id}`}
                      className="relative overflow-hidden"
                      style={{ background: bl.css }}
                    >
                      {loaded && (
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 scale-125 bg-cover bg-center"
                          style={{
                            backgroundImage: `url("${loaded.url}")`,
                            filter:
                              bl.id === "blur-vivid"
                                ? "blur(4px) saturate(1.6)"
                                : bl.id === "blur-dark"
                                  ? "blur(4px) brightness(0.52)"
                                  : "blur(4px) brightness(1.08)",
                          }}
                        />
                      )}
                    </Radio>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="ss-section-title">Plain color</p>
                  <Popover
                    container={shellEl}
                    onOpenChange={open => {
                      if (open) setStyle(s => ({ ...s, backgroundId: "custom" }));
                    }}
                  >
                    <PopoverTrigger
                      data-variant="link"
                      data-testid="bg-custom-color-trigger"
                    >
                      <span
                        aria-hidden="true"
                        className="inline-block size-2.5 rounded-full"
                        style={{
                          background:
                            "conic-gradient(from 90deg, #ef4444, #f59e0b, #10b981, #3b82f6, #8b5cf6, #ec4899, #ef4444)",
                        }}
                      />
                      <span>Spectrum</span>
                    </PopoverTrigger>
                    <PopoverContent align="start" sideOffset={6} collisionPadding={10}>
                      <PopoverTitle>Solid backdrop</PopoverTitle>
                      <ColorPicker
                        aria-label="Backdrop color"
                        space="hsv"
                        format="hex"
                        value={style.customColor}
                        onValueChange={hex => setStyle(s => ({ ...s, backgroundId: "custom", customColor: hex }))}
                      >
                        <ColorPickerArea>
                          <ColorPickerAreaThumb />
                        </ColorPickerArea>
                        <ColorPickerSlider channel="hue">
                          <ColorPickerSliderThumb />
                        </ColorPickerSlider>
                        <ColorPickerInput aria-label="Hex value" />
                      </ColorPicker>
                    </PopoverContent>
                  </Popover>
                </div>

                <RadioGroup
                  aria-label="Plain colors"
                  value={solidGroupValue}
                  onValueChange={val => {
                    if (val) setStyle(s => ({ ...s, backgroundId: val }));
                  }}
                  className="grid grid-cols-8 justify-items-center gap-1.5"
                >
                  {PLAIN_COLORS_PRIMARY.map(c => (
                    <Radio
                      key={c.id}
                      value={c.id}
                      aria-label={c.name}
                      data-variant="dot"
                      data-testid={`bg-${c.id}`}
                      style={{ backgroundColor: c.color }}
                    />
                  ))}
                  <Radio
                    value="transparent"
                    aria-label="Transparent"
                    data-variant="dot"
                    data-testid="bg-transparent"
                    style={{
                      background: "repeating-conic-gradient(#a1a1aa 0% 25%, #ffffff 0% 50%) 50% / 7px 7px",
                    }}
                  />

                  {PLAIN_COLORS_PASTEL.map(c => (
                    <Radio
                      key={c.id}
                      value={c.id}
                      aria-label={c.name}
                      data-variant="dot"
                      data-testid={`bg-${c.id}`}
                      style={{ backgroundColor: c.color }}
                    />
                  ))}
                  <Radio
                    value="custom"
                    aria-label="Picked tone"
                    data-variant="dot"
                    data-testid="bg-custom-swatch"
                    style={{ backgroundColor: style.customColor }}
                  />
                </RadioGroup>
              </div>

              {style.backgroundId !== "none" && (
                <div className="space-y-3 border-t border-[var(--ss-border)] pt-3">
                  <Field>
                    <Slider
                      min={0}
                      max={140}
                      step={4}
                      value={style.padding}
                      onValueChange={padding => setStyle(s => ({ ...s, padding }))}
                      data-testid="slider-padding"
                    >
                      <div className="ss-slider-head">
                        <FieldLabel>Padding</FieldLabel>
                        <SliderValue />
                      </div>
                      <SliderControl>
                        <SliderTrack>
                          <SliderIndicator />
                          <SliderThumb />
                        </SliderTrack>
                      </SliderControl>
                    </Slider>
                  </Field>

                  <Field>
                    <Slider
                      min={0}
                      max={36}
                      step={2}
                      value={style.radius}
                      onValueChange={radius => setStyle(s => ({ ...s, radius }))}
                      data-testid="slider-corners"
                    >
                      <div className="ss-slider-head">
                        <FieldLabel>Corners</FieldLabel>
                        <SliderValue />
                      </div>
                      <SliderControl>
                        <SliderTrack>
                          <SliderIndicator />
                          <SliderThumb />
                        </SliderTrack>
                      </SliderControl>
                    </Slider>
                  </Field>

                  <Field>
                    <Slider
                      min={0}
                      max={100}
                      step={5}
                      value={style.shadow}
                      onValueChange={shadow => setStyle(s => ({ ...s, shadow }))}
                      data-testid="slider-shadow"
                    >
                      <div className="ss-slider-head">
                        <FieldLabel>Shadow</FieldLabel>
                        <SliderValue />
                      </div>
                      <SliderControl>
                        <SliderTrack>
                          <SliderIndicator />
                          <SliderThumb />
                        </SliderTrack>
                      </SliderControl>
                    </Slider>
                  </Field>

                  <Field>
                    <FieldLabel className="ss-section-title">Ratio</FieldLabel>
                    <RadioGroup
                      value={style.ratio}
                      onValueChange={val => {
                        if (val) setStyle(s => ({ ...s, ratio: val as StudioRatioId }));
                      }}
                      className="grid grid-cols-4 gap-1"
                    >
                      {STUDIO_RATIOS.map(r => (
                        <Radio
                          key={r.id}
                          value={r.id}
                          data-variant="pill"
                          data-testid={`studio-ratio-${r.id}`}
                        >
                          {r.label}
                        </Radio>
                      ))}
                    </RadioGroup>
                  </Field>

                  <Field>
                    <FieldLabel className="ss-section-title">Window bar</FieldLabel>
                    <SegmentedControl
                      className="ss-seg"
                      value={style.windowBar ?? "none"}
                      onValueChange={val => {
                        if (val === "none" || val === "light" || val === "dark") {
                          setStyle(s => ({ ...s, windowBar: val as StudioWindowBar }));
                        }
                      }}
                      data-testid="studio-windowbar-control"
                    >
                      <SegmentedControlIndicator />
                      <SegmentedControlItem value="none" data-testid="studio-windowbar-none">
                        None
                      </SegmentedControlItem>
                      <SegmentedControlItem value="light" data-testid="studio-windowbar-light">
                        Light
                      </SegmentedControlItem>
                      <SegmentedControlItem value="dark" data-testid="studio-windowbar-dark">
                        Dark
                      </SegmentedControlItem>
                    </SegmentedControl>
                  </Field>

                  <Field className="ss-switch-row">
                    <FieldLabel>Glass bezel</FieldLabel>
                    <Switch
                      checked={Boolean(style.glassBezel)}
                      onCheckedChange={glassBezel => setStyle(s => ({ ...s, glassBezel }))}
                      data-testid="studio-glass-bezel"
                    >
                      <SwitchThumb />
                    </Switch>
                  </Field>

                  <Field className="ss-switch-row">
                    <FieldLabel>Auto balance</FieldLabel>
                    <Switch
                      checked={style.autoBalance}
                      onCheckedChange={autoBalance => setStyle(s => ({ ...s, autoBalance }))}
                      data-testid="studio-auto-balance"
                    >
                      <SwitchThumb />
                    </Switch>
                  </Field>
                </div>
              )}
            </aside>
          );

          const emptyBackdropBg =
            style.backgroundId === "none"
              ? "transparent"
              : style.backgroundId === "transparent"
                ? "repeating-conic-gradient(#d4d4d8 0% 25%, #ffffff 0% 50%) 50% / 12px 12px"
                : stylePreviewSwatchCss(style);

          const emptyCardInner = (
            <div
              className="ss-empty-card"
              style={{
                borderRadius: `${Math.max(10, Math.min(22, style.radius))}px`,
              }}
            >
              {style.backgroundId !== "none" &&
                (style.windowBar === "light" || style.windowBar === "dark") && (
                  <div
                    aria-hidden="true"
                    className={`ss-empty-windowbar ${
                      style.windowBar === "dark"
                        ? "ss-empty-windowbar--dark"
                        : "ss-empty-windowbar--light"
                    }`}
                  >
                    <span className="ss-empty-dot bg-[#FF5F56]" />
                    <span className="ss-empty-dot bg-[#FFBD2E]" />
                    <span className="ss-empty-dot bg-[#27C93F]" />
                  </div>
                )}
              <div className="ss-empty-card-body">
                <span className="ss-empty-icon" aria-hidden="true">
                  {Icons.openImage}
                </span>
                <p className="text-sm font-semibold text-[var(--ss-fg)]">
                  Drop or paste a screenshot here
                </p>
                <p className="max-w-xs text-xs text-[var(--ss-muted-fg)]">
                  Frame captures on gradients or wallpapers, add curved arrows and callouts,
                  then export PNG or JPG locally.
                </p>
                <div className="ss-empty-actions mt-1">
                  <Button
                    data-variant="open-stage"
                    disabled={reading}
                    onClick={() => fileInputRef.current?.click()}
                    data-testid="studio-empty-open"
                  >
                    {Icons.openImage}
                    <span>Choose image</span>
                  </Button>
                  <Button
                    data-variant="ghost-stage"
                    disabled={reading}
                    onClick={() => {
                      void synthesizeSampleScreenshotFile().then(sampleFile =>
                        readFile(sampleFile),
                      );
                    }}
                    data-testid="studio-try-sample"
                  >
                    <span>Try sample</span>
                  </Button>
                </div>
                {inputError && (
                  <p role="alert" className="mt-2 text-xs text-destructive">
                    {inputError}
                  </p>
                )}
              </div>
            </div>
          );

          return (
            <div className={`ss-body ${sidebarOpen ? "ss-body--right-rail" : ""}`}>
              <div ref={workspaceRef} className="ss-workspace">
                {!loaded ? (
                  <div
                    className={style.backgroundId === "none" ? "w-full max-w-[30rem]" : "ss-empty-backdrop"}
                    style={
                      style.backgroundId === "none"
                        ? undefined
                        : {
                            background: emptyBackdropBg,
                            padding: `${Math.max(20, Math.min(44, Math.round(style.padding * 0.65)))}px`,
                          }
                    }
                    aria-busy={reading}
                  >
                    {style.backgroundId !== "none" && style.glassBezel ? (
                      <div className="ss-empty-glass">{emptyCardInner}</div>
                    ) : (
                      emptyCardInner
                    )}
                  </div>
                ) : (
                  <div className="relative inline-flex max-w-full items-center justify-center">
                    <canvas
                      ref={canvasRef}
                      role="img"
                      aria-label={`${loaded.name}, ${geometry?.outW ?? loaded.width} × ${geometry?.outH ?? loaded.height} px`}
                      data-testid="studio-preview-canvas"
                      tabIndex={0}
                      style={{ cursor: canvasCursor }}
                      onPointerDown={onCanvasPointerDown}
                      onPointerMove={onCanvasPointerMove}
                      onPointerUp={onCanvasPointerUp}
                      onPointerCancel={onCanvasPointerUp}
                      onDoubleClick={onCanvasDoubleClick}
                      className="ss-canvas"
                    />

                    {editingTextItem && editingTextItem.kind === "text" && inlineEditorStyle && (
                      <input
                        ref={inlineTextInputRef}
                        type="text"
                        aria-label="Inline text callout"
                        data-testid="studio-inline-text"
                        value={editingTextItem.text}
                        onChange={e => {
                          const val = e.target.value;
                          setAnnotations(curr =>
                            curr.map(a =>
                              a.id === editingTextItem.id && a.kind === "text"
                                ? { ...a, text: val }
                                : a,
                            ),
                          );
                        }}
                        onBlur={() => commitInlineText(false)}
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            e.stopPropagation();
                            commitInlineText(true);
                          } else if (e.key === "Escape") {
                            e.preventDefault();
                            e.stopPropagation();
                            cancelInlineText();
                          }
                        }}
                        style={inlineEditorStyle}
                        className="ss-inline-input"
                      />
                    )}
                  </div>
                )}

                {(inputError && loaded) || exportError ? (
                  <p
                    role="status"
                    aria-live="polite"
                    className="v2-export-notice mt-2"
                    data-testid="v2-export-notice"
                  >
                    {inputError || exportError}
                  </p>
                ) : null}

                {loaded && geometry && (
                  <div className="ss-statusbar flex items-center gap-2">
                    <span className="max-w-[11rem] truncate opacity-80">{loaded.name}</span>
                    <span aria-hidden="true" className="opacity-45">·</span>
                    <span className="num" data-testid="studio-output-size">
                      {geometry.outW} × {geometry.outH}
                    </span>
                  </div>
                )}
              </div>

              {framingSidebar}
            </div>
          );
        })()}

        <Tooltip container={shellEl} controller={tooltip} delay={80} closeDelay={0}>
          <TooltipContent<string> aria-label="Control hint" side="bottom" sideOffset={6} collisionPadding={10}>
            {state => state.payload}
          </TooltipContent>
        </Tooltip>
      </div>
    </section>
  );
}
