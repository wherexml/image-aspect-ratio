"use client";

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
import {
  FileInput,
  FileInputDropzone,
  FileInputTrigger,
  createFileInputController,
  type FileRejection,
} from "@ui-sdk/react/file-input";
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
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
} from "@ui-sdk/react/slider";
import { Check, Copy, Download, ImagePlus, Minus, Plus, RefreshCw, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { ERR_BYTES, ERR_DOWNLOAD, ERR_PIXELS, ERR_READ, isCandidateType } from "@/lib/image-input";
import {
  FIT,
  ZOOM_STEP,
  clampPlacement,
  fillPlacement,
  movePlacement,
  placementLayout,
  zoomBounds,
  zoomPlacementAt,
  type Placement,
} from "@/lib/placement";
import { frac, parsePositive, roundFrac, simplifyRatio } from "@/lib/ratio";
import { loadSamplePhotoFile } from "@/lib/sample-photo";
import {
  EDGE_DEFAULT,
  EDGE_MAX,
  EDGE_MIN,
  FORMAT_MIME,
  INPUT_MAX_BYTES,
  INPUT_MAX_PIXELS,
  frameFilename,
  parseEdge,
  type FrameLayout,
  type SquareFormat,
} from "@/lib/square";
import { useToolTracking } from "@/lib/tool-analytics";
import { copyPngBlobSafe, useImageCopySupported } from "@/lib/v2-clipboard";
import { consumeV2PendingImage } from "@/lib/v2-image-handoff";

type LoadedImage = {
  img: HTMLImageElement;
  url: string;
  name: string;
  width: number;
  height: number;
};

type RatioOption = {
  id: string;
  label: string;
  w: number;
  h: number;
  defaultWidth: number;
  suffix: string;
};

const V2_RATIO_PRESETS: readonly RatioOption[] = [
  { id: "1:1", label: "1:1", w: 1, h: 1, defaultWidth: 1080, suffix: "1x1" },
  { id: "4:5", label: "4:5", w: 4, h: 5, defaultWidth: 1080, suffix: "4x5" },
  { id: "3:4", label: "3:4", w: 3, h: 4, defaultWidth: 1080, suffix: "3x4" },
  { id: "9:16", label: "9:16", w: 9, h: 16, defaultWidth: 1080, suffix: "9x16" },
  { id: "16:9", label: "16:9", w: 16, h: 9, defaultWidth: 1920, suffix: "16x9" },
  { id: "4:3", label: "4:3", w: 4, h: 3, defaultWidth: 1600, suffix: "4x3" },
  { id: "3:2", label: "3:2", w: 3, h: 2, defaultWidth: 1800, suffix: "3x2" },
  { id: "21:9", label: "21:9", w: 21, h: 9, defaultWidth: 2520, suffix: "21x9" },
  { id: "custom", label: "Custom", w: 16, h: 10, defaultWidth: 1920, suffix: "custom" },
];

const SQUARE_SIZE_PRESETS = ["512", "1080", "1440", "2048"] as const;

type BackdropMode =
  | "solid-white"
  | "solid-zinc"
  | "solid-cream"
  | "solid-slate"
  | "solid-charcoal"
  | "solid-black"
  | "blur"
  | "transparent"
  | "custom";

const BACKDROP_SWATCHES: readonly { id: BackdropMode; label: string; color: string }[] = [
  { id: "solid-white", label: "Pure White", color: "#FFFFFF" },
  { id: "solid-zinc", label: "Clean Zinc", color: "#F4F4F5" },
  { id: "solid-cream", label: "Warm Stone", color: "#F5F5F4" },
  { id: "solid-slate", label: "Slate Mist", color: "#CBD5E1" },
  { id: "solid-charcoal", label: "Charcoal", color: "#18181B" },
  { id: "solid-black", label: "Pure Black", color: "#09090B" },
];

const ERR_WIDTH = "Enter a whole number from 1 to 4096 pixels.";

function drawFramedScene(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  layout: FrameLayout,
  outW: number,
  outH: number,
  backdropMode: BackdropMode,
  solidColor: string,
  scale: number,
  options: { previewCheckerboard: boolean; exportFormat?: SquareFormat },
) {
  ctx.save();
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, outW, outH);

  if (backdropMode === "transparent") {
    if (options.exportFormat === "jpeg") {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, outW, outH);
    } else if (options.previewCheckerboard) {
      const tile = Math.max(8, Math.round(14 / Math.max(0.25, scale)));
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, outW, outH);
      ctx.fillStyle = "#E4E4E7";
      for (let y = 0; y < outH; y += tile) {
        for (let x = 0; x < outW; x += tile) {
          if ((Math.floor(x / tile) + Math.floor(y / tile)) % 2 === 1) {
            ctx.fillRect(x, y, Math.min(tile, outW - x), Math.min(tile, outH - y));
          }
        }
      }
    }
  } else if (backdropMode === "blur") {
    ctx.save();
    ctx.fillStyle = "#18181B";
    ctx.fillRect(0, 0, outW, outH);
    const coverScale =
      Math.max(outW / Math.max(1, img.naturalWidth), outH / Math.max(1, img.naturalHeight)) * 1.16;
    const bw = img.naturalWidth * coverScale;
    const bh = img.naturalHeight * coverScale;
    ctx.filter = `blur(${Math.max(18, Math.round(Math.min(outW, outH) * 0.045))}px) saturate(1.25) brightness(0.92)`;
    ctx.drawImage(img, (outW - bw) / 2, (outH - bh) / 2, bw, bh);
    ctx.restore();
  } else {
    ctx.fillStyle = solidColor;
    ctx.fillRect(0, 0, outW, outH);
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, layout.sx, layout.sy, layout.sw, layout.sh, layout.dx, layout.dy, layout.dw, layout.dh);
  ctx.restore();
}

function encodeFramedBlob(
  img: HTMLImageElement,
  layout: FrameLayout,
  outW: number,
  outH: number,
  backdropMode: BackdropMode,
  solidColor: string,
  format: SquareFormat,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("context");
      drawFramedScene(ctx, img, layout, outW, outH, backdropMode, solidColor, 1, {
        previewCheckerboard: false,
        exportFormat: format,
      });
      const mime = FORMAT_MIME[format];
      canvas.toBlob(
        blob => {
          canvas.width = 0;
          canvas.height = 0;
          if (blob && blob.size > 0 && blob.type === mime) resolve(blob);
          else reject(new Error("encode"));
        },
        mime,
        format === "jpeg" ? 0.92 : undefined,
      );
    } catch (err) {
      reject(err);
    }
  });
}

export function StudioFrameEditorV2({
  mode,
  initialRatioId,
  initialWidth,
  initialBackdropMode = "solid-white",
}: {
  mode: "ratio" | "square";
  initialRatioId?: string;
  initialWidth?: number;
  initialBackdropMode?: BackdropMode;
}) {
  const [fileController] = useState(createFileInputController);
  const [shellEl, setShellEl] = useState<HTMLElement | null>(null);

  const defaultRatioId = mode === "square" ? "1:1" : (initialRatioId ?? "16:9");
  const defaultPreset = V2_RATIO_PRESETS.find(r => r.id === defaultRatioId);
  const startWidth = mode === "square" ? EDGE_DEFAULT : (initialWidth ?? defaultPreset?.defaultWidth ?? 1920);
  const startHeight =
    mode === "square"
      ? EDGE_DEFAULT
      : defaultPreset
        ? Math.round((startWidth * defaultPreset.h) / defaultPreset.w)
        : 1080;

  const [ratioId, setRatioId] = useState<string>(defaultRatioId);
  const [customRatioW, setCustomRatioW] = useState("16");
  const [customRatioH, setCustomRatioH] = useState("10");
  const [widthText, setWidthText] = useState(String(startWidth));
  const [lastValidSize, setLastValidSize] = useState<{ width: number; height: number }>({
    width: startWidth,
    height: startHeight,
  });

  const [loaded, setLoaded] = useState<LoadedImage | null>(null);
  const [reading, setReading] = useState(false);
  const [inputError, setInputError] = useState("");
  const [placement, setPlacement] = useState<Placement>(FIT);
  const [lastPreset, setLastPreset] = useState<"fit" | "fill">("fit");

  const [backdropMode, setBackdropMode] = useState<BackdropMode>(initialBackdropMode);
  const [customColor, setCustomColor] = useState("#DBEAFE");
  const [format, setFormat] = useState<SquareFormat>("png");
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const imageCopySupported = useImageCopySupported();
  const [exportError, setExportError] = useState("");
  const tracking = useToolTracking(mode === "square" ? "make_square" : "change_ratio", "frame", null);
  const trackingRef = useRef(tracking);
  trackingRef.current = tracking;

  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [workspaceWidth, setWorkspaceWidth] = useState(640);
  const [viewportHeight, setViewportHeight] = useState(860);
  const generationRef = useRef(0);
  const urlsRef = useRef(new Set<string>());
  const dragRef = useRef<{
    id: number;
    x: number;
    y: number;
    placement: Placement;
    cssW: number;
  } | null>(null);

  const activeRatio = useMemo(() => {
    if (mode === "square") {
      return { id: "1:1", w: 1n, h: 1n, display: "1:1", suffix: "square" };
    }
    if (ratioId === "custom") {
      const pw = parsePositive(customRatioW);
      const ph = parsePositive(customRatioH);
      if (!pw.ok || !ph.ok) return null;
      const [rw, rh] = simplifyRatio(pw.value, ph.value);
      if (rw <= 0n || rh <= 0n || rw > 999999n || rh > 999999n) return null;
      return {
        id: "custom",
        w: rw,
        h: rh,
        display: `${customRatioW.trim()}:${customRatioH.trim()}`,
        suffix: `${rw}x${rh}`,
      };
    }
    const found = V2_RATIO_PRESETS.find(r => r.id === ratioId) ?? V2_RATIO_PRESETS[3]!;
    return {
      id: found.id,
      w: BigInt(found.w),
      h: BigInt(found.h),
      display: `${found.w}:${found.h}`,
      suffix: found.suffix,
    };
  }, [mode, ratioId, customRatioW, customRatioH]);

  const sizeCalc = useMemo(() => {
    const w = parseEdge(widthText);
    if (w === null) return { ok: false as const, error: ERR_WIDTH };
    if (mode === "square") {
      return { ok: true as const, width: w, height: w, exact: true };
    }
    if (!activeRatio) {
      return { ok: false as const, error: "Enter positive ratio numbers (e.g. 16:9 or 1.91:1)." };
    }
    const exactH = frac(BigInt(w) * activeRatio.h, activeRatio.w);
    const h = Number(roundFrac(exactH));
    if (h < EDGE_MIN || h > EDGE_MAX) {
      return {
        ok: false as const,
        error: `Height would be ${h} px. Enter a smaller width so both sides stay within 4096 px.`,
      };
    }
    return { ok: true as const, width: w, height: h, exact: exactH.d === 1n };
  }, [widthText, mode, activeRatio]);

  useEffect(() => {
    if (sizeCalc.ok) {
      setLastValidSize({ width: sizeCalc.width, height: sizeCalc.height });
    }
  }, [sizeCalc]);

  const previewSize = sizeCalc.ok ? { width: sizeCalc.width, height: sizeCalc.height } : lastValidSize;
  const outputSize = sizeCalc.ok ? { width: sizeCalc.width, height: sizeCalc.height } : null;

  const activeSolidColor = useMemo(() => {
    if (backdropMode === "custom") return customColor;
    const found = BACKDROP_SWATCHES.find(s => s.id === backdropMode);
    return found ? found.color : "#FFFFFF";
  }, [backdropMode, customColor]);

  const placed = useMemo(
    () =>
      loaded
        ? clampPlacement(loaded.width, loaded.height, previewSize.width, previewSize.height, placement)
        : FIT,
    [loaded, previewSize.width, previewSize.height, placement],
  );
  const bounds = useMemo(
    () =>
      loaded
        ? zoomBounds(loaded.width, loaded.height, previewSize.width, previewSize.height)
        : { min: 1, max: 3 },
    [loaded, previewSize.width, previewSize.height],
  );
  const layout = useMemo(
    () =>
      loaded
        ? placementLayout(loaded.width, loaded.height, previewSize.width, previewSize.height, placed)
        : null,
    [loaded, previewSize.width, previewSize.height, placed],
  );

  useEffect(() => {
    const node = workspaceRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width;
      if (w && w > 0) setWorkspaceWidth(w);
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncVh = () => {
      if (window.innerHeight > 0) setViewportHeight(window.innerHeight);
    };
    syncVh();
    window.addEventListener("resize", syncVh);
    return () => window.removeEventListener("resize", syncVh);
  }, []);

  useEffect(
    () => () => {
      generationRef.current++;
      urlsRef.current.forEach(url => URL.revokeObjectURL(url));
      urlsRef.current.clear();
    },
    [],
  );

  const readFile = useCallback(
    async (file?: File | null) => {
      if (!file) return;
      const id = ++generationRef.current;
      dragRef.current = null;
      setInputError("");
      setExportError("");
      if (!isCandidateType(file.type)) {
        setInputError(ERR_READ);
        fileController.clear();
        return;
      }
      if (file.size > INPUT_MAX_BYTES) {
        setInputError(ERR_BYTES);
        fileController.clear();
        return;
      }
      const url = URL.createObjectURL(file);
      urlsRef.current.add(url);
      setReading(true);
      try {
        // Decoding through <img> applies EXIF orientation without executing embedded SVG scripts.
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
            img,
            url,
            name: file.name || "Pasted image",
            width: img.naturalWidth,
            height: img.naturalHeight,
          };
        });
        setPlacement(FIT);
        setLastPreset("fit");
        trackingRef.current.imageRead(`${img.naturalWidth}x${img.naturalHeight}:${file.size}`);
      } catch (err) {
        URL.revokeObjectURL(url);
        urlsRef.current.delete(url);
        if (id === generationRef.current) {
          fileController.clear();
          setInputError(err instanceof Error && err.message === "pixels" ? ERR_PIXELS : ERR_READ);
        }
      } finally {
        if (id === generationRef.current) setReading(false);
      }
    },
    [fileController],
  );

  useEffect(() => {
    const pending = consumeV2PendingImage();
    if (pending) void readFile(pending);
  }, [readFile]);

  const clearImage = useCallback(() => {
    generationRef.current++;
    dragRef.current = null;
    fileController.clear();
    setLoaded(prev => {
      if (prev) {
        URL.revokeObjectURL(prev.url);
        urlsRef.current.delete(prev.url);
      }
      return null;
    });
    setInputError("");
    setExportError("");
    setPlacement(FIT);
    setLastPreset("fit");
  }, [fileController]);

  const handleReject = useCallback((rejected: FileRejection[]) => {
    const first = rejected[0];
    if (!first) return;
    setInputError(first.reasons.includes("file-too-large") ? ERR_BYTES : ERR_READ);
  }, []);

  const stageCssBox = useMemo(() => {
    const ar = previewSize.width / Math.max(1, previewSize.height);
    const maxW = Math.max(200, Math.min(560, workspaceWidth - 40));
    const maxH = Math.max(220, Math.min(460, Math.round(viewportHeight * 0.56)));
    const width = ar >= maxW / maxH ? maxW : Math.round(maxH * ar);
    const height = Math.max(80, Math.round(width / ar));
    return { width, height };
  }, [previewSize.width, previewSize.height, workspaceWidth, viewportHeight]);

  useEffect(() => {
    const node = canvasRef.current;
    if (!node || !loaded || !layout) return;
    const frame = requestAnimationFrame(() => {
      const dpr = window.devicePixelRatio || 1;
      const pxW = Math.max(1, Math.round(stageCssBox.width * dpr));
      const pxH = Math.max(1, Math.round(stageCssBox.height * dpr));
      if (node.width !== pxW || node.height !== pxH) {
        node.width = pxW;
        node.height = pxH;
      }
      const ctx = node.getContext("2d");
      if (ctx) {
        drawFramedScene(
          ctx,
          loaded.img,
          layout,
          previewSize.width,
          previewSize.height,
          backdropMode,
          activeSolidColor,
          pxW / previewSize.width,
          { previewCheckerboard: true },
        );
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [
    loaded,
    layout,
    stageCssBox.width,
    stageCssBox.height,
    previewSize.width,
    previewSize.height,
    backdropMode,
    activeSolidColor,
  ]);

  const editable = Boolean(loaded) && !exporting;

  const updatePlacement = useCallback(
    (updater: (curr: Placement, w: number, h: number) => Placement) => {
      if (!loaded || exporting) return;
      const { width: w, height: h } = loaded;
      setPlacement(curr =>
        updater(clampPlacement(w, h, previewSize.width, previewSize.height, curr), w, h),
      );
    },
    [loaded, exporting, previewSize.width, previewSize.height],
  );

  const applyFit = useCallback(() => {
    dragRef.current = null;
    setLastPreset("fit");
    updatePlacement(() => FIT);
  }, [updatePlacement]);

  const applyFill = useCallback(() => {
    dragRef.current = null;
    setLastPreset("fill");
    updatePlacement((_, w, h) => fillPlacement(w, h, previewSize.width, previewSize.height));
  }, [updatePlacement, previewSize.width, previewSize.height]);

  const activeFramingValue = useMemo(() => {
    if (!loaded) return lastPreset;
    const near = (a: number, b: number) => Math.abs(a - b) <= 1e-5 * Math.max(1, Math.abs(b));
    const matches = (t: Placement) =>
      near(placed.zoom, t.zoom) && near(placed.cx, t.cx) && near(placed.cy, t.cy);
    const fitTarget = clampPlacement(
      loaded.width,
      loaded.height,
      previewSize.width,
      previewSize.height,
      FIT,
    );
    const fillTarget = fillPlacement(
      loaded.width,
      loaded.height,
      previewSize.width,
      previewSize.height,
    );
    const isFit = matches(fitTarget);
    const isFill = matches(fillTarget);
    if (isFit && isFill) return lastPreset;
    if (isFit) return "fit";
    if (isFill) return "fill";
    return null;
  }, [loaded, placed, previewSize.width, previewSize.height, lastPreset]);

  const zoomTo = useCallback(
    (zoom: number, anchor = { x: 0.5, y: 0.5 }) => {
      if (dragRef.current) return;
      updatePlacement((curr, w, h) =>
        zoomPlacementAt(w, h, previewSize.width, previewSize.height, curr, zoom, anchor),
      );
    },
    [updatePlacement, previewSize.width, previewSize.height],
  );

  const zoomBy = useCallback(
    (factor: number, anchor?: { x: number; y: number }) => zoomTo(placed.zoom * factor, anchor),
    [zoomTo, placed.zoom],
  );

  useEffect(() => {
    const node = workspaceRef.current;
    if (!node) return;
    const onWheel = (event: WheelEvent) => {
      // Non-passive listener intercepts Ctrl/Cmd+wheel zoom without zooming the browser page.
      if (event.defaultPrevented || (!event.metaKey && !event.ctrlKey) || !loaded) return;
      event.preventDefault();
      if (exporting || dragRef.current || !Number.isFinite(event.deltaY)) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect || rect.width <= 0 || rect.height <= 0) return;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? rect.height : 1;
      const delta = Math.max(-500, Math.min(500, event.deltaY * unit));
      zoomBy(Math.exp(-delta * 0.002), {
        x: (event.clientX - rect.left) / rect.width,
        y: (event.clientY - rect.top) / rect.height,
      });
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [loaded, exporting, zoomBy]);

  const onCanvasKeyDown = (event: ReactKeyboardEvent<HTMLCanvasElement>) => {
    if (!loaded || event.altKey) return;
    const arrows: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const delta = arrows[event.key];
    if (delta && !event.metaKey && !event.ctrlKey) {
      event.preventDefault();
      if (!editable || dragRef.current) return;
      const step = Math.max(1, Math.min(previewSize.width, previewSize.height) * 0.01) * (event.shiftKey ? 10 : 1);
      updatePlacement((curr, w, h) =>
        movePlacement(w, h, previewSize.width, previewSize.height, curr, delta[0] * step, delta[1] * step),
      );
    }
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!editable || event.button !== 0) return;
    event.currentTarget.focus({ preventScroll: true });
    try {
      event.currentTarget.setPointerCapture?.(event.pointerId);
    } catch {
      // Synthetic pointer events in tests may not have an active hardware pointer.
    }
    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      placement: placed,
      cssW: Math.max(1, stageCssBox.width),
    };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const start = dragRef.current;
    if (!start || start.id !== event.pointerId || !loaded || exporting) return;
    const perCss = previewSize.width / start.cssW;
    setPlacement(
      movePlacement(
        loaded.width,
        loaded.height,
        previewSize.width,
        previewSize.height,
        start.placement,
        (event.clientX - start.x) * perCss,
        (event.clientY - start.y) * perCss,
      ),
    );
  };

  const onPointerEnd = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (dragRef.current?.id === event.pointerId) dragRef.current = null;
  };

  const handleSelectRatio = (nextId: string | null) => {
    if (!nextId) return;
    setRatioId(nextId);
    const preset = V2_RATIO_PRESETS.find(r => r.id === nextId);
    trackingRef.current.preset(nextId);
    if (preset && nextId !== "custom") {
      setWidthText(String(preset.defaultWidth));
    }
    setExportError("");
  };

  const handleDownload = async () => {
    if (!loaded || !outputSize || exporting) return;
    const id = generationRef.current;
    const { width, height } = outputSize;
    const suffix = activeRatio?.suffix ?? "frame";
    dragRef.current = null;
    setExporting(true);
    setExportError("");
    try {
      const exportLayout = placementLayout(loaded.width, loaded.height, width, height, placement);
      const blob = await encodeFramedBlob(
        loaded.img,
        exportLayout,
        width,
        height,
        backdropMode,
        activeSolidColor,
        format,
      );
      if (id !== generationRef.current) return;
      const dlUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = dlUrl;
      link.download = frameFilename(loaded.name, format, suffix);
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(dlUrl), 10_000);
      trackingRef.current.imageExport(`${format}:${width}x${height}`);
    } catch {
      if (id === generationRef.current) setExportError(ERR_DOWNLOAD);
    } finally {
      setExporting(false);
    }
  };

  const handleCopy = async () => {
    if (!loaded || !outputSize || exporting || !imageCopySupported) return;
    const { width, height } = outputSize;
    dragRef.current = null;
    setExporting(true);
    setExportError("");
    try {
      const exportLayout = placementLayout(loaded.width, loaded.height, width, height, placement);
      const res = await copyPngBlobSafe(() =>
        encodeFramedBlob(
          loaded.img,
          exportLayout,
          width,
          height,
          backdropMode,
          activeSolidColor,
          "png",
        ),
      );
      if (res.ok) {
        trackingRef.current.copy(`png:${width}x${height}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } else {
        setExportError(res.message);
      }
    } catch {
      setExportError("Could not copy image to clipboard. Use Download image instead.");
    } finally {
      setExporting(false);
    }
  };

  const zoomSliderSpan = Math.max(0.001, Math.log(Math.max(bounds.max, bounds.min + 0.001)) - Math.log(bounds.min));
  const zoomNormalized = loaded
    ? Math.max(0, Math.min(100, Math.round(((Math.log(placed.zoom) - Math.log(bounds.min)) / zoomSliderSpan) * 100)))
    : 0;
  const zoomPercentText = `${Math.round(placed.zoom * 100)}%`;

  return (
    <section
      ref={setShellEl}
      aria-label={mode === "square" ? "Make image square" : "Change image aspect ratio"}
      className="mt-8 space-y-4"
    >
      <FileInput
        controller={fileController}
        accept={["image/*", "application/octet-stream"]}
        maxSize={INPUT_MAX_BYTES}
        onValueChange={files => {
          const f = files[0];
          if (f) void readFile(f);
        }}
        onReject={handleReject}
      >
        {loaded && (
          <FileInputDropzone
            pasteTarget="document"
            className="v2-dropzone v2-dropzone--loaded"
            data-testid="v2-editor-file-bar"
          >
            <div className="v2-file-bar">
              <div className="flex min-w-0 items-center gap-3">
                <img
                  src={loaded.url}
                  alt=""
                  className="h-9 w-9 shrink-0 rounded-md border border-border bg-muted object-cover"
                />
                <span className="truncate text-sm font-semibold text-foreground">{loaded.name}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <FileInputTrigger
                  className="v2-btn v2-btn--outline v2-btn--sm"
                  disabled={exporting}
                  data-testid="v2-replace-image"
                >
                  <RefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
                  <span>Replace</span>
                </FileInputTrigger>
                <Button
                  onClick={clearImage}
                  disabled={exporting}
                  className="v2-btn v2-btn--ghost v2-btn--sm"
                  data-testid="v2-remove-image"
                >
                  <X aria-hidden="true" className="h-3.5 w-3.5" />
                  <span>Remove</span>
                </Button>
              </div>
            </div>
          </FileInputDropzone>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22.5rem]">
          <div ref={workspaceRef} className="v2-stage-card min-h-[24rem] sm:min-h-[29rem]">
            {!loaded ? (
              <FileInputDropzone
                pasteTarget="document"
                className="v2-dropzone flex flex-col items-center justify-center p-6 text-center"
                style={{
                  width: `${stageCssBox.width}px`,
                  height: `${stageCssBox.height}px`,
                  maxWidth: "100%",
                }}
              >
                <span className="v2-dropzone-icon mb-2" aria-hidden="true">
                  <ImagePlus className="h-4 w-4" />
                </span>
                <p className="text-sm font-semibold text-foreground">
                  Drop or paste an image here
                </p>
                <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2">
                  <FileInputTrigger
                    className="v2-btn v2-btn--primary v2-btn--sm"
                    disabled={reading}
                    data-testid="v2-empty-open"
                  >
                    <ImagePlus aria-hidden="true" className="h-3.5 w-3.5" />
                    <span>Choose image</span>
                  </FileInputTrigger>
                  <Button
                    onClick={() => {
                      void loadSamplePhotoFile("landscape").then(f => readFile(f));
                    }}
                    disabled={reading}
                    className="v2-btn v2-btn--outline v2-btn--sm"
                    data-testid="v2-try-sample"
                  >
                    <span>Try sample</span>
                  </Button>
                </div>
                {inputError && (
                  <p role="alert" className="mt-2.5 text-xs font-medium text-destructive">
                    {inputError}
                  </p>
                )}
              </FileInputDropzone>
            ) : (
              <canvas
                ref={canvasRef}
                role="img"
                aria-label={`Preview of ${loaded.name} at ${previewSize.width} × ${previewSize.height} px, zoom ${zoomPercentText}`}
                data-testid={mode === "square" ? "square-preview" : "ratio-preview"}
                tabIndex={0}
                onKeyDown={onCanvasKeyDown}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerEnd}
                onPointerCancel={onPointerEnd}
                style={{
                  width: `${stageCssBox.width}px`,
                  height: `${stageCssBox.height}px`,
                }}
                className="sq-canvas sq-canvas--crop shadow-[0_0_0_1px_var(--color-muted-foreground),0_16px_36px_-18px_rgba(0,0,0,0.3)]"
              />
            )}
          </div>

          <div className="v2-panel space-y-5">
            {mode === "ratio" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground" id="v2-ratio-lbl">
                    Aspect ratio
                  </span>
                  {activeRatio && (
                    <span className="num text-xs font-semibold text-foreground">
                      {activeRatio.display}
                    </span>
                  )}
                </div>
                <RadioGroup
                  aria-labelledby="v2-ratio-lbl"
                  value={ratioId}
                  disabled={exporting}
                  onValueChange={handleSelectRatio}
                  className="grid grid-cols-4 gap-1.5"
                >
                  {V2_RATIO_PRESETS.map(r => (
                    <Radio
                      key={r.id}
                      value={r.id}
                      className="v2-pill-radio num"
                      data-testid={`v2-ratio-${r.id}`}
                    >
                      {r.label}
                    </Radio>
                  ))}
                </RadioGroup>

                {ratioId === "custom" && (
                  <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-2 pt-1">
                    <Field className="v2-field">
                      <FieldLabel className="v2-field-label">Ratio W</FieldLabel>
                      <div className="v2-input-box">
                        <Input
                          inputMode="decimal"
                          value={customRatioW}
                          disabled={exporting}
                          onValueChange={setCustomRatioW}
                          className="v2-input num"
                          data-testid="v2-custom-ratio-w"
                        />
                      </div>
                    </Field>
                    <span className="pb-2 font-display text-base font-bold text-muted-foreground" aria-hidden="true">
                      :
                    </span>
                    <Field className="v2-field">
                      <FieldLabel className="v2-field-label">Ratio H</FieldLabel>
                      <div className="v2-input-box">
                        <Input
                          inputMode="decimal"
                          value={customRatioH}
                          disabled={exporting}
                          onValueChange={setCustomRatioH}
                          className="v2-input num"
                          data-testid="v2-custom-ratio-h"
                        />
                      </div>
                    </Field>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Framing</span>
                <output className="num text-xs font-medium text-muted-foreground" aria-label="Zoom">
                  {zoomPercentText}
                </output>
              </div>

              <SegmentedControl
                aria-label="Framing"
                value={activeFramingValue}
                disabled={!editable}
                onValueChange={val => {
                  if (val === "fit") applyFit();
                  else if (val === "fill") applyFill();
                }}
                className="v2-seg v2-seg--block"
                data-testid="v2-framing-control"
              >
                <SegmentedControlIndicator className="v2-seg-indicator" />
                <SegmentedControlItem
                  value="fit"
                  className="v2-seg-item"
                  data-testid="v2-framing-fit"
                >
                  Fit whole image
                </SegmentedControlItem>
                <SegmentedControlItem
                  value="fill"
                  className="v2-seg-item"
                  data-testid="v2-framing-fill"
                >
                  Crop to fill
                </SegmentedControlItem>
              </SegmentedControl>

              <div className="flex items-center gap-2 pt-0.5">
                <Button
                  aria-label="Zoom out"
                  disabled={!editable || placed.zoom <= bounds.min + 1e-5}
                  onClick={() => zoomBy(1 / ZOOM_STEP)}
                  className="v2-icon-btn"
                >
                  <Minus aria-hidden="true" className="h-3.5 w-3.5" />
                </Button>

                <Slider
                  aria-label="Zoom level"
                  min={0}
                  max={100}
                  step={1}
                  disabled={!editable}
                  value={zoomNormalized}
                  onValueChange={pct => {
                    if (!loaded) return;
                    const targetLog = Math.log(bounds.min) + (pct / 100) * zoomSliderSpan;
                    zoomTo(Math.exp(targetLog));
                  }}
                  className="v2-slider"
                >
                  <SliderControl>
                    <SliderTrack>
                      <SliderIndicator />
                      <SliderThumb />
                    </SliderTrack>
                  </SliderControl>
                </Slider>

                <Button
                  aria-label="Zoom in"
                  disabled={!editable || placed.zoom >= bounds.max - 1e-5}
                  onClick={() => zoomBy(ZOOM_STEP)}
                  className="v2-icon-btn"
                >
                  <Plus aria-hidden="true" className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Field className="v2-field" invalid={!sizeCalc.ok}>
                <FieldLabel className="v2-field-label">
                  {mode === "square" ? "Output size (px)" : "Width (px)"}
                </FieldLabel>
                <div className="v2-input-box">
                  <Input
                    inputMode="numeric"
                    autoComplete="off"
                    spellCheck={false}
                    disabled={exporting}
                    value={widthText}
                    aria-invalid={!sizeCalc.ok}
                    onValueChange={val => {
                      setWidthText(val);
                      setExportError("");
                    }}
                    className="v2-input num"
                    data-testid="v2-width-input"
                  />
                  <span className="v2-readout-unit num" aria-hidden="true">
                    px
                  </span>
                </div>
              </Field>

              {mode === "square" && (
                <div className="grid grid-cols-4 gap-1.5">
                  {SQUARE_SIZE_PRESETS.map(px => (
                    <button
                      key={px}
                      type="button"
                      disabled={exporting}
                      data-active={widthText.trim() === px ? "" : undefined}
                      onClick={() => {
                        trackingRef.current.preset(`sq_${px}`);
                        setWidthText(px);
                        setExportError("");
                      }}
                      className="v2-chip-btn num"
                      data-testid={`v2-sq-preset-${px}`}
                    >
                      {px}
                    </button>
                  ))}
                </div>
              )}

              {sizeCalc.ok ? (
                <div
                  className="flex items-center justify-between rounded-lg border border-border bg-secondary/45 px-3 py-2 text-xs"
                  aria-live="polite"
                  data-testid="v2-size-summary"
                >
                  <span className="text-muted-foreground">Export canvas</span>
                  <span className="num font-semibold text-foreground">
                    {sizeCalc.width} × {sizeCalc.height} px
                    {!sizeCalc.exact ? " · rounded" : ""}
                  </span>
                </div>
              ) : (
                <p role="alert" className="text-xs font-medium text-destructive">
                  {sizeCalc.error}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground" id="v2-bg-lbl">
                  Background
                </span>
                <Popover
                  container={shellEl}
                  onOpenChange={open => {
                    if (open) setBackdropMode("custom");
                  }}
                >
                  <PopoverTrigger
                    className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                    data-testid="v2-backdrop-spectrum"
                  >
                    <span
                      aria-hidden="true"
                      className="inline-block size-3 rounded-full"
                      style={{
                        background:
                          "conic-gradient(from 90deg, #ef4444, #f59e0b, #10b981, #3b82f6, #8b5cf6, #ec4899, #ef4444)",
                      }}
                    />
                    <span>Custom color</span>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    sideOffset={6}
                    collisionPadding={10}
                    className="v2-popover"
                  >
                    <PopoverTitle>Custom background</PopoverTitle>
                    <ColorPicker
                      aria-label="Background color"
                      space="hsv"
                      format="hex"
                      value={customColor}
                      onValueChange={hex => {
                        setBackdropMode("custom");
                        setCustomColor(hex);
                      }}
                    >
                      <ColorPickerArea>
                        <ColorPickerAreaThumb />
                      </ColorPickerArea>
                      <ColorPickerSlider channel="hue">
                        <ColorPickerSliderThumb />
                      </ColorPickerSlider>
                      <ColorPickerInput aria-label="Hex color" data-testid="v2-backdrop-hex" />
                    </ColorPicker>
                  </PopoverContent>
                </Popover>
              </div>

              <RadioGroup
                aria-labelledby="v2-bg-lbl"
                value={backdropMode}
                disabled={exporting}
                onValueChange={val => {
                  if (val) setBackdropMode(val as BackdropMode);
                }}
                className="flex flex-wrap items-center gap-2"
              >
                {BACKDROP_SWATCHES.map(sw => (
                  <Radio
                    key={sw.id}
                    value={sw.id}
                    aria-label={sw.label}
                    className="v2-swatch"
                    style={{ backgroundColor: sw.color }}
                    data-testid={`v2-bg-${sw.id}`}
                  />
                ))}
                <Radio
                  value="blur"
                  aria-label="Blurred photo backdrop"
                  className="v2-swatch"
                  style={{
                    background: "linear-gradient(135deg, #6366f1 0%, #3b82f6 50%, #0f172a 100%)",
                  }}
                  data-testid="v2-bg-blur"
                />
                <Radio
                  value="transparent"
                  aria-label="Transparent PNG"
                  className="v2-swatch"
                  style={{
                    background: "repeating-conic-gradient(#a1a1aa 0% 25%, #ffffff 0% 50%) 50% / 7px 7px",
                  }}
                  data-testid="v2-bg-transparent"
                />
                <Radio
                  value="custom"
                  aria-label="Custom picked color"
                  className="v2-swatch"
                  style={{ backgroundColor: customColor }}
                  data-testid="v2-bg-custom"
                />
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <span className="block text-xs font-semibold text-muted-foreground">Format</span>
              <SegmentedControl
                aria-label="Format"
                value={format}
                disabled={exporting}
                onValueChange={val => {
                  if (val === "png" || val === "jpeg") {
                    setFormat(val);
                    setExportError("");
                  }
                }}
                className="v2-seg v2-seg--block"
                data-testid="v2-format-control"
              >
                <SegmentedControlIndicator className="v2-seg-indicator" />
                <SegmentedControlItem
                  value="png"
                  className="v2-seg-item"
                  data-testid="v2-format-png"
                >
                  PNG
                </SegmentedControlItem>
                <SegmentedControlItem
                  value="jpeg"
                  className="v2-seg-item"
                  data-testid="v2-format-jpeg"
                >
                  JPG
                </SegmentedControlItem>
              </SegmentedControl>

              {format === "jpeg" && backdropMode === "transparent" && (
                <p
                  className="text-xs text-muted-foreground"
                  data-testid="v2-jpg-alpha-note"
                >
                  JPG has no transparency — empty margin exports as solid white.
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button
                disabled={!loaded || !outputSize || exporting || reading}
                focusableWhenDisabled
                pendingAnnouncement="Encoding image"
                onClick={() => handleDownload()}
                className="v2-btn v2-btn--primary flex-1"
                data-testid="v2-download-btn"
              >
                <Download aria-hidden="true" className="h-4 w-4" />
                <span>{exporting ? "Encoding…" : "Download image"}</span>
              </Button>

              <Button
                disabled={!loaded || !outputSize || exporting || reading || !imageCopySupported}
                focusableWhenDisabled
                onClick={() => handleCopy()}
                className="v2-btn v2-btn--outline px-3"
                data-testid="v2-copy-image-btn"
              >
                {copied ? (
                  <Check aria-hidden="true" className="h-4 w-4" />
                ) : (
                  <Copy aria-hidden="true" className="h-4 w-4" />
                )}
                <span>{copied ? "Copied" : "Copy"}</span>
              </Button>
            </div>

            {exportError && (
              <p role="alert" className="text-xs font-medium text-destructive">
                {exportError}
              </p>
            )}
          </div>
        </div>
      </FileInput>
    </section>
  );
}
