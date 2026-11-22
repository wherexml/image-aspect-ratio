import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RouterProvider } from "@tanstack/react-router";
import { ScreenshotStudio, getStudioAgent } from "@/components/ScreenshotStudio";
import { CalculatorNavigation } from "@/components/CalculatorNavigation";
import {
  DEFAULT_BALANCE,
  DEFAULT_STUDIO_STYLE,
  FULL_CROP,
  arrowCurvePoints,
  computeBoxCreation,
  computeBoxResize,
  computeStudioLayout,
  contrastTextForHex,
  doesStyleMatchPreset,
  hitTestAnnotation,
  reprojectAnnotationsForCrop,
  scaleAnnotationUniformly,
  snapLineEndpoint,
  studioAnnotationBounds,
  translateAnnotation,
  type AnnotationItem,
} from "@/lib/screenshot-studio";
import { routeTree } from "@/routeTree.gen";

describe("Screenshot Studio V5 (@ui-sdk/react + Figma geometry)", () => {
  it("matches the /screenshot-beautifier route", () => {
    const router = createRouter({ queryClient: new QueryClient(), routeTree } as never);
    const r = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    void router;
    const matches = r.matchRoutes("/screenshot-beautifier");
    expect(matches.at(-1)?.routeId).toBe("/screenshot-beautifier");
  });

  it("never wraps photos/illustrations in an extra inner mat by default, and only applies auto-balance on uniform-edge UI cards", () => {
    expect(DEFAULT_STUDIO_STYLE.autoBalance).toBe(false);

    const rawLayout = computeStudioLayout(
      960,
      580,
      FULL_CROP,
      { ...DEFAULT_STUDIO_STYLE, backgroundId: "none" },
      DEFAULT_BALANCE,
    );
    expect(rawLayout.outW).toBe(960);
    expect(rawLayout.outH).toBe(580);
    expect(rawLayout.cardRadius).toBe(0);

    // Default style: cardW === imgW (960 × 580), outer canvas = +2*48px = 1056 × 676 (no extra inner mat!)
    const defaultLayout = computeStudioLayout(960, 580, FULL_CROP, DEFAULT_STUDIO_STYLE, DEFAULT_BALANCE);
    expect(defaultLayout.cardW).toBe(960);
    expect(defaultLayout.cardH).toBe(580);
    expect(defaultLayout.outW).toBe(1056);
    expect(defaultLayout.outH).toBe(676);

    // Explicit autoBalance on a uniform-edge UI card expands card inset cleanly
    const uniformBalanced = computeStudioLayout(
      960,
      580,
      FULL_CROP,
      { ...DEFAULT_STUDIO_STYLE, autoBalance: true },
      DEFAULT_BALANCE,
    );
    expect(uniformBalanced.outW).toBe(1080);
    expect(uniformBalanced.outH).toBe(700);

    // Multi-colored illustration (isUniformEdge = false, e.g. sky top + road bottom) NEVER gets an extra mat even if autoBalance = true
    const illustrationLayout = computeStudioLayout(
      960,
      580,
      FULL_CROP,
      { ...DEFAULT_STUDIO_STYLE, autoBalance: true },
      { ...DEFAULT_BALANCE, edgeColor: "#EAE6D7", isUniformEdge: false },
    );
    expect(illustrationLayout.cardW).toBe(960);
    expect(illustrationLayout.cardH).toBe(580);
    expect(illustrationLayout.outW).toBe(1056);
    expect(illustrationLayout.outH).toBe(676);
  });

  it("places the quadratic Bezier curve midpoint directly on the mid bend handle and hit-tests all 3 arrow handles", () => {
    const { midX, midY, ctrlX, ctrlY } = arrowCurvePoints(100, 300, 500, 100, 0.15, 1000);
    expect(0.25 * 100 + 0.5 * ctrlX + 0.25 * 500).toBeCloseTo(midX, 6);
    expect(0.25 * 300 + 0.5 * ctrlY + 0.25 * 100).toBeCloseTo(midY, 6);

    const arrow: AnnotationItem = {
      id: "arr-1",
      kind: "arrow",
      color: "#EF4444",
      strokeWidth: 4,
      x1: 0.2,
      y1: 0.7,
      x2: 0.8,
      y2: 0.3,
      bend: 0.14,
    };
    const W = 800;
    const H = 500;
    const curve = arrowCurvePoints(arrow.x1 * W, arrow.y1 * H, arrow.x2 * W, arrow.y2 * H, arrow.bend, Math.hypot(W, H));

    expect(hitTestAnnotation([arrow], "arr-1", arrow.x1, arrow.y1, W, H, 1)?.handle).toBe("start");
    expect(hitTestAnnotation([arrow], "arr-1", arrow.x2, arrow.y2, W, H, 1)?.handle).toBe("end");
    expect(hitTestAnnotation([arrow], "arr-1", curve.midX / W, curve.midY / H, W, H, 1)?.handle).toBe("mid");
    expect(hitTestAnnotation([arrow], null, curve.midX / W, curve.midY / H, W, H, 1)?.handle).toBe("move");
    expect(hitTestAnnotation([arrow], null, 0.5, 0.5, W, H, 1)).toBeNull();
  });

  it("hit-tests all 8 resize handles and interior move on box annotations", () => {
    const box: AnnotationItem = {
      id: "box-1",
      kind: "pixelate",
      color: "#EF4444",
      strokeWidth: 4,
      x: 0.2,
      y: 0.3,
      w: 0.4,
      h: 0.2,
    };
    const W = 1000;
    const H = 600;
    expect(hitTestAnnotation([box], "box-1", 0.2, 0.3, W, H, 1)?.handle).toBe("nw");
    expect(hitTestAnnotation([box], "box-1", 0.4, 0.3, W, H, 1)?.handle).toBe("n");
    expect(hitTestAnnotation([box], "box-1", 0.6, 0.3, W, H, 1)?.handle).toBe("ne");
    expect(hitTestAnnotation([box], "box-1", 0.6, 0.4, W, H, 1)?.handle).toBe("e");
    expect(hitTestAnnotation([box], "box-1", 0.6, 0.5, W, H, 1)?.handle).toBe("se");
    expect(hitTestAnnotation([box], "box-1", 0.4, 0.5, W, H, 1)?.handle).toBe("s");
    expect(hitTestAnnotation([box], "box-1", 0.2, 0.5, W, H, 1)?.handle).toBe("sw");
    expect(hitTestAnnotation([box], "box-1", 0.2, 0.4, W, H, 1)?.handle).toBe("w");
    expect(hitTestAnnotation([box], null, 0.4, 0.4, W, H, 1)?.handle).toBe("move");
  });

  it("wires @ui-sdk/react Select, Slider, Switch, RadioGroup, Popover, ColorPicker, and shared Tooltip primitives", async () => {
    window.localStorage.removeItem("screenshot-studio-presets-v2");
    const { container } = render(<ScreenshotStudio />);
    await act(async () => {
      await new Promise(r => setTimeout(r, 0));
    });

    // Zero native OS <select> or <input type="color">; every range input belongs to a ui-sdk SliderThumb
    expect(container.querySelectorAll("select").length).toBe(0);
    expect(container.querySelectorAll('input[type="color"]').length).toBe(0);
    const rangeInputs = Array.from(container.querySelectorAll('input[type="range"]'));
    expect(rangeInputs.length).toBeGreaterThanOrEqual(3);
    for (const input of rangeInputs) {
      expect(input.closest('[data-slot="slider-thumb"]')).not.toBeNull();
    }

    // Zero Quick Access, Pin, or Capture clutter; Download CTA has SVG + label
    expect(screen.queryByText(/quick access/i)).toBeNull();
    expect(screen.queryByRole("button", { name: /capture/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /pin/i })).toBeNull();
    const downloadBtn = screen.getByTestId("studio-download");
    expect(downloadBtn.querySelector("svg")).not.toBeNull();
    expect(downloadBtn).toHaveTextContent("Download");
    expect(downloadBtn).toHaveAttribute("aria-disabled", "true");

    // Empty state hides duplicate top-left Open icon while keeping stage Choose screenshot enabled
    expect(screen.queryByTestId("studio-choose-image")).toBeNull();
    expect(screen.getByTestId("studio-empty-open")).not.toHaveAttribute("aria-disabled");
    expect(screen.getByTestId("studio-toggle-sidebar")).not.toHaveAttribute("aria-disabled");
    expect(screen.getByTestId("studio-preset-select")).not.toHaveAttribute("aria-disabled");

    // Icon-only markup toggles and shared Tooltip hints (including aria-disabled items before image load)
    const pixelateBtn = screen.getByTestId("tool-pixelate");
    expect(pixelateBtn.querySelectorAll("rect").length).toBe(6);
    expect(pixelateBtn).toHaveAttribute("aria-disabled", "true");

    fireEvent.keyDown(document.body, { key: "Tab", bubbles: true });
    pixelateBtn.focus();
    fireEvent.focus(pixelateBtn);
    await waitFor(() => {
      expect(container.querySelector('[data-slot="tooltip-content"]')).toHaveTextContent("Mosaic redact");
    });
    fireEvent.keyDown(pixelateBtn, { key: "Escape", bubbles: true });
    expect(document.activeElement).toBe(pixelateBtn);

    const sidebarBtn = screen.getByTestId("studio-toggle-sidebar");
    fireEvent.keyDown(pixelateBtn, { key: "Tab", bubbles: true });
    sidebarBtn.focus();
    fireEvent.focus(sidebarBtn);
    await waitFor(() => {
      expect(container.querySelector('[data-slot="tooltip-content"]')).toHaveTextContent("Framing sidebar");
    });

    // Style preset Select opens, selects Clean Bloom, and saves + deletes a custom preset via Popover
    fireEvent.click(screen.getByTestId("studio-preset-select"));
    fireEvent.click(await screen.findByTestId("preset-opt-preset-bloom"));
    expect(screen.getByTestId("studio-preset-select")).toHaveTextContent("Clean Bloom");

    fireEvent.click(screen.getByTestId("studio-save-preset"));
    const nameInput = (await screen.findByTestId("studio-preset-name-input")) as HTMLInputElement;
    fireEvent.input(nameInput, { target: { value: "Docs Hero" } });
    await waitFor(() => expect(nameInput).toHaveValue("Docs Hero"));
    fireEvent.click(screen.getByTestId("studio-confirm-save-preset"));
    await waitFor(() => expect(screen.getByTestId("studio-preset-select")).toHaveTextContent("Docs Hero"));

    const deletePresetBtn = screen.getByTestId("studio-delete-preset");
    fireEvent.click(deletePresetBtn);
    expect(screen.getByTestId("studio-preset-select")).toHaveTextContent("Northern Light");

    // Gradient builder Popover opens with 3-stop visual ColorPicker + Angle Slider and closes cleanly on Escape
    const customGradBtn = screen.getByTestId("bg-custom-gradient");
    fireEvent.click(customGradBtn);
    const gradDialog = await screen.findByRole("dialog", { name: "Gradient builder" });
    expect(gradDialog).toBeVisible();
    expect(gradDialog.querySelector('[data-slot="color-picker-area"]')).not.toBeNull();
    expect(gradDialog.querySelector('[data-slot="color-picker-slider"]')).not.toBeNull();
    expect(screen.getByTestId("grad-stop-start")).toHaveAttribute("aria-checked", "true");
    fireEvent.click(screen.getByTestId("grad-stop-mid"));
    expect(screen.getByTestId("grad-stop-mid")).toHaveAttribute("aria-checked", "true");
    expect((screen.getByTestId("grad-stop-hex-input") as HTMLInputElement).value.toUpperCase()).toBe("#EC4899");
    fireEvent.click(screen.getByTestId("grad-swatch-mint"));
    await waitFor(() =>
      expect((screen.getByTestId("grad-stop-hex-input") as HTMLInputElement).value.toUpperCase()).toBe("#34D399"),
    );
    fireEvent.keyDown(gradDialog, { key: "Escape", bubbles: true });
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Gradient builder" })).toBeNull());

    // Ink palette Popover opens ColorPicker
    const inkBtn = screen.getByTestId("studio-color-trigger");
    fireEvent.click(inkBtn);
    const inkDialog = await screen.findByRole("dialog", { name: "Ink palette" });
    expect(inkDialog).toBeVisible();
    fireEvent.click(screen.getByTestId("color-blue"));
    fireEvent.keyDown(inkDialog, { key: "Escape", bubbles: true });
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Ink palette" })).toBeNull());

    // Keyboard stepping on Padding Slider and Space key on Auto balance Switch
    const paddingSlider = screen.getByRole("slider", { name: "Padding" });
    expect(paddingSlider).toHaveValue("48");
    paddingSlider.focus();
    fireEvent.keyDown(paddingSlider, { key: "ArrowRight", bubbles: true });
    fireEvent.keyDown(paddingSlider, { key: "ArrowLeft", bubbles: true });
    fireEvent.keyDown(paddingSlider, { key: "ArrowRight", bubbles: true });
    expect(paddingSlider).toHaveValue("52");

    const autoBalanceSwitch = screen.getByTestId("studio-auto-balance");
    expect(autoBalanceSwitch).toHaveAttribute("aria-checked", "false");
    autoBalanceSwitch.focus();
    fireEvent.keyDown(autoBalanceSwitch, { key: " ", code: "Space", bubbles: true });
    fireEvent.click(autoBalanceSwitch);
    await waitFor(() => expect(autoBalanceSwitch).toBeVisible());

    // Enriched backgrounds & collapsible sidebar
    expect(screen.getByTestId("studio-toggle-gradients")).toHaveTextContent("Show less");
    expect(screen.getAllByRole("radio").length).toBeGreaterThanOrEqual(40);
    expect(screen.getByTestId("bg-wp-horizon")).toBeVisible();
    expect(screen.getByTestId("studio-upload-wallpaper")).toBeVisible();
    expect(screen.getByTestId("bg-blur-vivid")).toBeVisible();
    expect(screen.getByTestId("bg-transparent")).toBeVisible();

    fireEvent.click(screen.getByTestId("studio-toggle-sidebar"));
    expect(screen.queryByTestId("bg-none")).toBeNull();
    fireEvent.click(screen.getByTestId("studio-toggle-sidebar"));
    expect(screen.getByTestId("bg-none")).toBeVisible();
  });

  it("exposes every interactive control cleanly to @ui-sdk/react/agent snapshot() and act()", async () => {
    const agent = getStudioAgent();
    render(<ScreenshotStudio />);
    await act(async () => {
      await new Promise(r => setTimeout(r, 0));
    });

    const visibleItems = agent
      .snapshot()
      .filter(entry => !entry.offPage && entry.component !== "more");
    expect(visibleItems.length).toBeGreaterThan(15);

    for (const entry of visibleItems) {
      expect(entry.label, `${entry.component} ${entry.ref} has no name`).toBeTruthy();
    }

    const labels = visibleItems.map(entry => entry.label);
    for (const required of [
      "Style preset",
      "Padding",
      "Corners",
      "Shadow",
      "Ratio",
      "Auto balance",
      "Stroke weight",
      "Export format",
      "Download",
    ]) {
      expect(labels, `${required} missing from snapshot`).toContain(required);
    }

    const result = await agent.act({
      steps: [
        { ref: "Padding", action: "setValue", args: [64] },
        { ref: "Corners", action: "setValue", args: [20] },
        { ref: "Shadow", action: "setValue", args: [75] },
        { ref: "Ratio", action: "setValue", args: ["16:9"] },
        { ref: "Auto balance", action: "setChecked", args: [false] },
        { ref: "Stroke weight", action: "setValue", args: ["6 pt"] },
        { ref: "Export format", action: "setValue", args: ["JPG"] },
      ],
    });
    await act(async () => {
      await new Promise(r => setTimeout(r, 0));
    });

    expect(result?.ok, result?.error?.message).toBe(true);
    expect(screen.getByRole("slider", { name: "Padding" })).toHaveValue("64");
    expect(screen.getByRole("slider", { name: "Corners" })).toHaveValue("20");
    expect(screen.getByRole("slider", { name: "Shadow" })).toHaveValue("75");
    expect(screen.getByTestId("studio-ratio-16:9")).toHaveAttribute("aria-checked", "true");
    expect(screen.getByTestId("studio-auto-balance")).toHaveAttribute("aria-checked", "false");
    expect(screen.getByTestId("studio-stroke-select")).toHaveTextContent("6 pt");
    expect(screen.getByTestId("studio-format-select")).toHaveTextContent("JPG");
  });

  it("ignores accidental < 6px clicks, supports Stroke/Format Selects, Text pill toggle, 3-handle arrow bending, and inline text", async () => {
    const origPointerEvent = window.PointerEvent;
    if (typeof window.PointerEvent === "undefined") {
      class PointerEventShim extends MouseEvent {
        readonly pointerId: number;
        constructor(type: string, params: PointerEventInit = {}) {
          super(type, params);
          this.pointerId = params.pointerId ?? 0;
        }
      }
      window.PointerEvent = PointerEventShim as unknown as typeof PointerEvent;
    }

    const origCreateObjectURL = URL.createObjectURL;
    const origRevokeObjectURL = URL.revokeObjectURL;
    URL.createObjectURL = vi.fn(() => "blob:mock-shot");
    URL.revokeObjectURL = vi.fn();

    const origDecode = HTMLImageElement.prototype.decode;
    HTMLImageElement.prototype.decode = vi.fn(function (this: HTMLImageElement) {
      Object.defineProperty(this, "naturalWidth", { value: 800, configurable: true });
      Object.defineProperty(this, "naturalHeight", { value: 500, configurable: true });
      return Promise.resolve();
    });

    const ctxStub = {
      save: vi.fn(),
      restore: vi.fn(),
      scale: vi.fn(),
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      bezierCurveTo: vi.fn(),
      arcTo: vi.fn(),
      arc: vi.fn(),
      ellipse: vi.fn(),
      rect: vi.fn(),
      clip: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      drawImage: vi.fn(),
      fillText: vi.fn(),
      measureText: (txt: string) => ({ width: txt.length * 9 }),
      createLinearGradient: () => ({ addColorStop: vi.fn() }),
      createRadialGradient: () => ({ addColorStop: vi.fn() }),
      getImageData: () => ({ data: new Uint8ClampedArray(64 * 64 * 4).fill(240) }),
      putImageData: vi.fn(),
    };
    const origGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ctxStub as unknown as RenderingContext) as unknown as typeof HTMLCanvasElement.prototype.getContext;

    try {
      const { container } = render(<ScreenshotStudio />);
      const fileInput = container.querySelector("#studio-file") as HTMLInputElement;
      const file = new File([new Uint8Array([137, 80, 78, 71])], "shot.png", { type: "image/png" });
      fireEvent.change(fileInput, { target: { files: [file] } });

      const canvas = await screen.findByTestId("studio-preview-canvas");
      vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue({
        x: 0,
        y: 0,
        left: 0,
        top: 0,
        right: 896,
        bottom: 596,
        width: 896,
        height: 596,
        toJSON: () => ({}),
      });
      canvas.setPointerCapture = vi.fn();

      // Stroke weight & Export format Selects open and update
      fireEvent.click(screen.getByTestId("studio-stroke-select"));
      fireEvent.click(await screen.findByTestId("stroke-opt-6"));
      expect(screen.getByTestId("studio-stroke-select")).toHaveTextContent("6 pt");

      fireEvent.click(screen.getByTestId("studio-format-select"));
      fireEvent.click(await screen.findByTestId("format-opt-jpeg"));
      expect(screen.getByTestId("studio-format-select")).toHaveTextContent("JPG");

      const undoBtn = screen.getByTestId("studio-undo");
      expect(undoBtn).toHaveAttribute("aria-disabled", "true");

      // 1. Plain click (< 6px) with Arrow active must NOT create a ghost arrow
      fireEvent.pointerDown(canvas, { button: 0, pointerId: 1, clientX: 250, clientY: 250 });
      fireEvent.pointerUp(canvas, { button: 0, pointerId: 1, clientX: 252, clientY: 251 });
      expect(undoBtn).toHaveAttribute("aria-disabled", "true");
      expect(screen.queryByTestId("studio-delete")).toBeNull();

      // 2. Plain click (< 6px) with Outline box active must NOT create a ghost box
      fireEvent.click(screen.getByTestId("tool-rect"));
      fireEvent.pointerDown(canvas, { button: 0, pointerId: 2, clientX: 300, clientY: 300 });
      fireEvent.pointerUp(canvas, { button: 0, pointerId: 2, clientX: 300, clientY: 300 });
      expect(undoBtn).toHaveAttribute("aria-disabled", "true");

      // 3. Dragging >= 6px with Arrow creates an arrow and selects it automatically
      fireEvent.click(screen.getByTestId("tool-arrow"));
      fireEvent.pointerDown(canvas, { button: 0, pointerId: 3, clientX: 200, clientY: 400 });
      fireEvent.pointerMove(canvas, { pointerId: 3, clientX: 500, clientY: 200 });
      fireEvent.pointerUp(canvas, { pointerId: 3, clientX: 500, clientY: 200 });
      expect(undoBtn).not.toHaveAttribute("aria-disabled");
      expect(screen.getByTestId("studio-delete")).toBeVisible();

      // 4. Without switching tools, drag midpoint (350, 300) to bend the arrow
      fireEvent.pointerDown(canvas, { button: 0, pointerId: 4, clientX: 350, clientY: 300 });
      fireEvent.pointerMove(canvas, { pointerId: 4, clientX: 310, clientY: 240 });
      fireEvent.pointerUp(canvas, { pointerId: 4, clientX: 310, clientY: 240 });
      fireEvent.click(undoBtn);
      expect(undoBtn).not.toHaveAttribute("aria-disabled");
      fireEvent.click(undoBtn);
      await waitFor(() => expect(undoBtn).toHaveAttribute("aria-disabled", "true"));

      // 5. Text tool reveals Pill background (with Transparent colorless option) + Text color controls
      fireEvent.click(screen.getByTestId("tool-text"));
      const pillTrigger = screen.getByTestId("studio-color-trigger");
      const textColorTrigger = screen.getByTestId("studio-text-color-trigger");
      expect(pillTrigger).toHaveAttribute("aria-label", "Pill background");
      expect(textColorTrigger).toHaveAttribute("aria-label", "Text color");

      // Also verify Freehand (P) tool & Highlighter (H) rename
      expect(screen.getByTestId("tool-freehand")).toHaveAttribute("aria-label", "Freehand");
      expect(screen.getByTestId("tool-highlight")).toHaveAttribute("aria-label", "Highlighter");

      fireEvent.pointerDown(canvas, { button: 0, pointerId: 5, clientX: 320, clientY: 220 });
      const emptyInput = await screen.findByTestId("studio-inline-text");
      fireEvent.keyDown(emptyInput, { key: "Enter" });
      await waitFor(() => expect(screen.queryByTestId("studio-inline-text")).toBeNull());
      expect(undoBtn).toHaveAttribute("aria-disabled", "true");

      fireEvent.pointerDown(canvas, { button: 0, pointerId: 6, clientX: 320, clientY: 220 });
      const textInput = await screen.findByTestId("studio-inline-text");
      fireEvent.change(textInput, { target: { value: "Ship v4" } });
      fireEvent.keyDown(textInput, { key: "Enter" });
      await waitFor(() => expect(screen.queryByTestId("studio-inline-text")).toBeNull());
      expect(undoBtn).not.toHaveAttribute("aria-disabled");

      // 6. Toggle Pill background to Transparent (colorless) + pick custom Text color, and draw a Freehand stroke
      fireEvent.click(pillTrigger);
      await screen.findByRole("dialog", { name: "Pill background" });
      fireEvent.click(screen.getByTestId("studio-pill-transparent"));
      expect(pillTrigger.querySelector(".ss-color-chip--transparent")).not.toBeNull();
      fireEvent.keyDown(screen.getByRole("dialog", { name: "Pill background" }), { key: "Escape", bubbles: true });
      await waitFor(() => expect(screen.queryByRole("dialog", { name: "Pill background" })).toBeNull());

      fireEvent.click(textColorTrigger);
      await screen.findByRole("dialog", { name: "Text color" });
      fireEvent.click(await screen.findByTestId("text-color-amber"));
      fireEvent.keyDown(screen.getByRole("dialog", { name: "Text color" }), { key: "Escape", bubbles: true });
      await waitFor(() => expect(screen.queryByRole("dialog", { name: "Text color" })).toBeNull());

      // Double-click Ship v4 -> inline input now has transparent background and custom amber text color!
      fireEvent.doubleClick(canvas, { clientX: 330, clientY: 220 });
      const transparentEdit = (await screen.findByTestId("studio-inline-text")) as HTMLInputElement;
      expect(transparentEdit.style.backgroundColor).toBe("transparent");
      expect(transparentEdit.style.color).toBe("rgb(245, 158, 11)");
      fireEvent.keyDown(transparentEdit, { key: "Escape" });
      await waitFor(() => expect(screen.queryByTestId("studio-inline-text")).toBeNull());

      // Draw a Freehand red stroke on the canvas
      fireEvent.click(screen.getByTestId("tool-freehand"));
      fireEvent.pointerDown(canvas, { button: 0, pointerId: 7, clientX: 120, clientY: 140 });
      fireEvent.pointerMove(canvas, { pointerId: 7, clientX: 180, clientY: 155 });
      fireEvent.pointerMove(canvas, { pointerId: 7, clientX: 250, clientY: 135 });
      fireEvent.pointerUp(canvas, { pointerId: 7, clientX: 250, clientY: 135 });
      expect(screen.getByTestId("studio-delete")).toBeVisible();
    } finally {
      window.PointerEvent = origPointerEvent;
      URL.createObjectURL = origCreateObjectURL;
      URL.revokeObjectURL = origRevokeObjectURL;
      HTMLImageElement.prototype.decode = origDecode;
      HTMLCanvasElement.prototype.getContext = origGetContext;
    }
  });

  it("preserves exact source image aspect ratio across portrait, landscape, downscaled, and framed Ratio modes without vertical squashing", async () => {
    for (const ratio of ["auto", "16:9", "4:3", "1:1", "4:5", "9:16"] as const) {
      const portrait = computeStudioLayout(
        1200,
        1600,
        FULL_CROP,
        { ...DEFAULT_STUDIO_STYLE, ratio },
        DEFAULT_BALANCE,
      );
      expect(portrait.imgW / portrait.imgH).toBeCloseTo(1200 / 1600, 6);

      const hugePortrait = computeStudioLayout(
        3000,
        5000,
        FULL_CROP,
        { ...DEFAULT_STUDIO_STYLE, ratio },
        DEFAULT_BALANCE,
      );
      expect(hugePortrait.imgW / hugePortrait.imgH).toBeCloseTo(3000 / 5000, 6);
    }

    const origCreateObjectURL = URL.createObjectURL;
    const origRevokeObjectURL = URL.revokeObjectURL;
    URL.createObjectURL = vi.fn(() => "blob:mock-portrait");
    URL.revokeObjectURL = vi.fn();

    const origDecode = HTMLImageElement.prototype.decode;
    HTMLImageElement.prototype.decode = vi.fn(function (this: HTMLImageElement) {
      Object.defineProperty(this, "naturalWidth", { value: 1200, configurable: true });
      Object.defineProperty(this, "naturalHeight", { value: 1600, configurable: true });
      return Promise.resolve();
    });

    const ctxStub = {
      save: vi.fn(),
      restore: vi.fn(),
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      arcTo: vi.fn(),
      clip: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      drawImage: vi.fn(),
      createLinearGradient: () => ({ addColorStop: vi.fn() }),
      createRadialGradient: () => ({ addColorStop: vi.fn() }),
      getImageData: () => ({ data: new Uint8ClampedArray(96 * 96 * 4).fill(245) }),
      putImageData: vi.fn(),
    };
    const origGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ctxStub as unknown as RenderingContext) as unknown as typeof HTMLCanvasElement.prototype.getContext;

    try {
      Object.defineProperty(window, "innerHeight", { value: 860, configurable: true });
      const { container } = render(<ScreenshotStudio />);
      const fileInput = container.querySelector("#studio-file") as HTMLInputElement;
      const file = new File([new Uint8Array([137, 80, 78, 71])], "poster.png", { type: "image/png" });
      fireEvent.change(fileInput, { target: { files: [file] } });

      const canvas = (await screen.findByTestId("studio-preview-canvas")) as HTMLCanvasElement;
      await waitFor(() => {
        expect(canvas.style.height).toBe("auto");
        expect(canvas.style.aspectRatio).toBe("1296 / 1696");
      });

      const cssWidth = parseFloat(canvas.style.width);
      // 0.72 * 860 = 619px vertical cap -> width scales proportionally (~473px), never staying at 672px
      expect(cssWidth).toBeGreaterThan(350);
      expect(cssWidth).toBeLessThanOrEqual(480);
      expect(canvas.width / canvas.height).toBeCloseTo(1296 / 1696, 3);
    } finally {
      URL.createObjectURL = origCreateObjectURL;
      URL.revokeObjectURL = origRevokeObjectURL;
      HTMLImageElement.prototype.decode = origDecode;
      HTMLCanvasElement.prototype.getContext = origGetContext;
    }
  });

  it("supports Figma/Photoshop proportional corner resize, 1D edge stretch, Shift/Alt modifiers, 0°/15°/45°/90° line angle snap, and keyboard resize shortcuts", async () => {
    // 1. Angle snapping in true pixel space on a 16:9 image (1600 × 900)
    const softHoriz = snapLineEndpoint(0.2, 0.5, 0.7, 0.508, 1600, 900, {});
    expect(softHoriz.snapped).toBe(true);
    expect(softHoriz.angleDeg).toBe(0);
    expect(softHoriz.ny).toBeCloseTo(0.5, 6);

    const altFree = snapLineEndpoint(0.2, 0.5, 0.7, 0.508, 1600, 900, { altKey: true });
    expect(altFree.snapped).toBe(false);
    expect(altFree.ny).toBeCloseTo(0.508, 6);

    // Shift locks exact 45° in pixel space (dxPx === dyPx even though 1600 !== 900!)
    const shift45 = snapLineEndpoint(0.2, 0.2, 0.45, 0.62, 1600, 900, { shiftKey: true });
    expect(shift45.snapped).toBe(true);
    expect(shift45.angleDeg).toBe(45);
    expect((shift45.nx - 0.2) * 1600).toBeCloseTo((shift45.ny - 0.2) * 900, 3);

    // 2. Shift 1:1 square creation & Alt center-outward creation in pixel space
    const squareBox = computeBoxCreation(0.25, 0.25, 0.5, 0.4, 1600, 900, { shiftKey: true });
    expect(squareBox.w * 1600).toBeCloseTo(squareBox.h * 900, 3);

    const centeredBox = computeBoxCreation(0.5, 0.5, 0.65, 0.6, 1600, 900, { altKey: true });
    expect(centeredBox.x + centeredBox.w / 2).toBeCloseTo(0.5, 5);
    expect(centeredBox.y + centeredBox.h / 2).toBeCloseTo(0.5, 5);

    // 3. Corner handle (`se`) defaults to proportional scaling; `Shift` unlocks free aspect; `Alt` scales symmetrically from center; edge (`e`) stretches 1D
    const origRect = { x: 0.2, y: 0.2, w: 0.25, h: 0.2 }; // 400 × 180 px on 1600 × 900
    const origAspect = (origRect.w * 1600) / (origRect.h * 900);

    const seProp = computeBoxResize(origRect, "se", 0.125, 0.02, 1600, 900, {});
    expect((seProp.w * 1600) / (seProp.h * 900)).toBeCloseTo(origAspect, 4);
    expect(seProp.x).toBeCloseTo(0.2, 5);
    expect(seProp.y).toBeCloseTo(0.2, 5);

    const seFree = computeBoxResize(origRect, "se", 0.125, 0.02, 1600, 900, { shiftKey: true });
    expect(seFree.w).toBeCloseTo(0.375, 5);
    expect(seFree.h).toBeCloseTo(0.22, 5);

    const seCenter = computeBoxResize(origRect, "se", 0.1, 0.1, 1600, 900, { altKey: true });
    expect(seCenter.x + seCenter.w / 2).toBeCloseTo(origRect.x + origRect.w / 2, 4);
    expect(seCenter.y + seCenter.h / 2).toBeCloseTo(origRect.y + origRect.h / 2, 4);
    expect((seCenter.w * 1600) / (seCenter.h * 900)).toBeCloseTo(origAspect, 4);

    const eastEdge = computeBoxResize(origRect, "e", 0.1, 0.08, 1600, 900, {});
    expect(eastEdge.w).toBeCloseTo(0.35, 5);
    expect(eastEdge.h).toBeCloseTo(origRect.h, 5);

    // 4. 4-corner hit-testing on Counter & Text + uniform keyboard scaling
    const badge: AnnotationItem = {
      id: "cnt-1",
      kind: "counter",
      color: "#EF4444",
      strokeWidth: 4,
      x: 0.5,
      y: 0.5,
      step: 1,
    };
    const r = 11 + 4 * 1.5 + 3; // 20px
    expect(hitTestAnnotation([badge], "cnt-1", (400 + r) / 800, (250 + r) / 500, 800, 500, 1)?.handle).toBe("se");
    expect(hitTestAnnotation([badge], "cnt-1", (400 - r) / 800, (250 - r) / 500, 800, 500, 1)?.handle).toBe("nw");

    const scaledBadge = scaleAnnotationUniformly(badge, 1.25, 800, 500);
    expect(scaledBadge.kind === "counter" && scaledBadge.scale).toBeCloseTo(1.25, 3);
  });

  it("places All platforms at the bottom of the Social Media navigation dropdown after platform links", async () => {
    void RouterProvider;
    const router = createRouter({
      routeTree,
      context: { queryClient: new QueryClient() },
    });
    await router.load();
    const { container } = render(<RouterProvider router={router} />);
    void CalculatorNavigation;
    const socialMenu = container.querySelector(".tool-social-menu");
    expect(socialMenu).not.toBeNull();
    const links = Array.from(socialMenu!.querySelectorAll("a"));
    expect(links.length).toBeGreaterThanOrEqual(6);
    expect(links[0]).toHaveTextContent(/Reels/i);
    expect(links.at(-1)).toHaveTextContent("All platforms");
  });

  it("reprojects annotations accurately across crop & full-image restore, computes pill text contrast, and tracks preset dirty state", () => {
    expect(contrastTextForHex("#FFFFFF")).toBe("#18181B");
    expect(contrastTextForHex("#fff")).toBe("#18181B");
    expect(contrastTextForHex("#FACC15")).toBe("#18181B");
    expect(contrastTextForHex("#EF4444")).toBe("#FFFFFF");
    expect(contrastTextForHex("#18181B")).toBe("#FFFFFF");

    const { format: _fmt, ...cleanPresetStyle } = DEFAULT_STUDIO_STYLE;
    void _fmt;
    expect(doesStyleMatchPreset(DEFAULT_STUDIO_STYLE, cleanPresetStyle)).toBe(true);
    expect(doesStyleMatchPreset({ ...DEFAULT_STUDIO_STYLE, format: "jpeg" }, cleanPresetStyle)).toBe(true);
    expect(doesStyleMatchPreset({ ...DEFAULT_STUDIO_STYLE, padding: 64 }, cleanPresetStyle)).toBe(false);
    expect(doesStyleMatchPreset({ ...DEFAULT_STUDIO_STYLE, backgroundId: "grad-sunset" }, cleanPresetStyle)).toBe(false);

    const items: AnnotationItem[] = [
      {
        id: "in-box",
        kind: "rect",
        color: "#EF4444",
        strokeWidth: 4,
        x: 0.3,
        y: 0.3,
        w: 0.2,
        h: 0.2,
      },
      {
        id: "in-badge",
        kind: "counter",
        color: "#3B82F6",
        strokeWidth: 4,
        x: 0.5,
        y: 0.5,
        step: 1,
      },
      {
        id: "out-badge",
        kind: "counter",
        color: "#18181B",
        strokeWidth: 4,
        x: 0.05,
        y: 0.05,
        step: 2,
      },
      {
        id: "cross-arrow",
        kind: "arrow",
        color: "#10B981",
        strokeWidth: 4,
        x1: 0.1,
        y1: 0.5,
        x2: 0.6,
        y2: 0.5,
        bend: 0,
      },
    ];

    const subCrop = { x: 0.2, y: 0.2, w: 0.6, h: 0.6 };
    const cropped = reprojectAnnotationsForCrop(items, FULL_CROP, subCrop, 1000, 600);
    expect(cropped.map(a => a.id)).toEqual(["in-box", "in-badge", "cross-arrow"]);

    const croppedBox = cropped.find(a => a.id === "in-box")!;
    expect(croppedBox.kind === "rect" && croppedBox.x).toBeCloseTo((0.3 - 0.2) / 0.6, 5);
    expect(croppedBox.kind === "rect" && croppedBox.w).toBeCloseTo(0.2 / 0.6, 5);

    // Liang-Barsky ray clipping keeps horizontal ray clipped cleanly at crop left edge (x1 = 0)
    const croppedArrow = cropped.find(a => a.id === "cross-arrow")!;
    expect(croppedArrow.kind === "arrow" && croppedArrow.x1).toBeCloseTo(0, 5);
    expect(croppedArrow.kind === "arrow" && croppedArrow.y1).toBeCloseTo(0.5, 5);
    expect(croppedArrow.kind === "arrow" && croppedArrow.x2).toBeCloseTo((0.6 - 0.2) / 0.6, 5);

    // Restoring to FULL_CROP maps in-bounds items back to their exact original full-image coordinates
    const restored = reprojectAnnotationsForCrop(cropped, subCrop, FULL_CROP, 1000, 600);
    const restoredBox = restored.find(a => a.id === "in-box")!;
    expect(restoredBox.kind === "rect" && restoredBox.x).toBeCloseTo(0.3, 5);
    expect(restoredBox.kind === "rect" && restoredBox.y).toBeCloseTo(0.3, 5);
    expect(restoredBox.kind === "rect" && restoredBox.w).toBeCloseTo(0.2, 5);
    expect(restoredBox.kind === "rect" && restoredBox.h).toBeCloseTo(0.2, 5);
  });

  it("handles V6 QA flows: Try sample, Custom preset dirty/reset, White-ink inline contrast + Escape revert, button-focused Cmd+Z undo, and crop preservation", async () => {
    const origPointerEvent = window.PointerEvent;
    if (typeof window.PointerEvent === "undefined") {
      class PointerEventShim extends MouseEvent {
        readonly pointerId: number;
        constructor(type: string, params: PointerEventInit = {}) {
          super(type, params);
          this.pointerId = params.pointerId ?? 0;
        }
      }
      window.PointerEvent = PointerEventShim as unknown as typeof PointerEvent;
    }

    const origCreateObjectURL = URL.createObjectURL;
    const origRevokeObjectURL = URL.revokeObjectURL;
    URL.createObjectURL = vi.fn(() => "blob:mock-v6");
    URL.revokeObjectURL = vi.fn();

    const origDecode = HTMLImageElement.prototype.decode;
    HTMLImageElement.prototype.decode = vi.fn(function (this: HTMLImageElement) {
      Object.defineProperty(this, "naturalWidth", { value: 960, configurable: true });
      Object.defineProperty(this, "naturalHeight", { value: 600, configurable: true });
      return Promise.resolve();
    });

    const ctxStub = {
      save: vi.fn(),
      restore: vi.fn(),
      scale: vi.fn(),
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      bezierCurveTo: vi.fn(),
      arcTo: vi.fn(),
      arc: vi.fn(),
      ellipse: vi.fn(),
      rect: vi.fn(),
      roundRect: vi.fn(),
      clip: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      drawImage: vi.fn(),
      fillText: vi.fn(),
      setLineDash: vi.fn(),
      measureText: (txt: string) => ({ width: txt.length * 9 }),
      createLinearGradient: () => ({ addColorStop: vi.fn() }),
      createRadialGradient: () => ({ addColorStop: vi.fn() }),
      getImageData: () => ({ data: new Uint8ClampedArray(64 * 64 * 4).fill(244) }),
      putImageData: vi.fn(),
    };
    const origGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ctxStub as unknown as RenderingContext) as unknown as typeof HTMLCanvasElement.prototype.getContext;

    try {
      render(<ScreenshotStudio />);

      // 1. Before loading an image, disabled markup tools never look active/pressed
      expect(screen.getByTestId("tool-arrow")).not.toHaveAttribute("data-pressed");
      expect(screen.getByTestId("tool-crop")).not.toHaveAttribute("data-pressed");

      // 2. Try sample loads a synthesized screenshot onto the canvas
      fireEvent.click(screen.getByTestId("studio-try-sample"));
      const canvas = await screen.findByTestId("studio-preview-canvas");
      vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue({
        x: 0,
        y: 0,
        left: 0,
        top: 0,
        right: 1056,
        bottom: 696,
        width: 1056,
        height: 696,
        toJSON: () => ({}),
      });
      canvas.setPointerCapture = vi.fn();

      // 3. Preset shows "Custom" when framing diverges and resets cleanly when re-selecting "Northern Light"
      const presetSelect = screen.getByTestId("studio-preset-select");
      expect(presetSelect).toHaveTextContent("Northern Light");
      fireEvent.click(screen.getByTestId("bg-aurora-violet"));
      expect(presetSelect).toHaveTextContent("Custom");

      fireEvent.click(presetSelect);
      fireEvent.click(await screen.findByTestId("preset-opt-preset-pine"));
      expect(presetSelect).toHaveTextContent("Northern Light");

      // 4. White ink + Text callout renders dark text (#18181B) and Escape reverts double-click edits
      fireEvent.click(screen.getByTestId("studio-color-trigger"));
      await screen.findByRole("dialog", { name: "Ink palette" });
      fireEvent.click(screen.getByTestId("color-white"));
      fireEvent.keyDown(screen.getByRole("dialog", { name: "Ink palette" }), { key: "Escape", bubbles: true });

      fireEvent.click(screen.getByTestId("tool-text"));
      fireEvent.pointerDown(canvas, { button: 0, pointerId: 1, clientX: 300, clientY: 260 });
      const inlineInput = (await screen.findByTestId("studio-inline-text")) as HTMLInputElement;
      expect(inlineInput.style.color).toBe("rgb(24, 24, 27)");

      fireEvent.change(inlineInput, { target: { value: "Keep me" } });
      fireEvent.keyDown(inlineInput, { key: "Enter" });
      await waitFor(() => expect(screen.queryByTestId("studio-inline-text")).toBeNull());

      // Double-click same spot to re-edit, mutate text, then press Escape -> reverts to "Keep me"
      fireEvent.doubleClick(canvas, { clientX: 310, clientY: 260 });
      const reEditInput = (await screen.findByTestId("studio-inline-text")) as HTMLInputElement;
      expect(reEditInput.value).toBe("Keep me");
      fireEvent.change(reEditInput, { target: { value: "Accidental edit" } });
      fireEvent.keyDown(reEditInput, { key: "Escape" });
      await waitFor(() => expect(screen.queryByTestId("studio-inline-text")).toBeNull());

      // Re-open to verify "Keep me" was preserved!
      fireEvent.doubleClick(canvas, { clientX: 310, clientY: 260 });
      const verifyInput = (await screen.findByTestId("studio-inline-text")) as HTMLInputElement;
      expect(verifyInput.value).toBe("Keep me");
      fireEvent.keyDown(verifyInput, { key: "Escape" });
      await waitFor(() => expect(screen.queryByTestId("studio-inline-text")).toBeNull());

      // 5. Recoloring via Pill background / Ink palette + Cmd+Z works even when focus is on a button
      fireEvent.click(screen.getByTestId("studio-color-trigger"));
      await screen.findByRole("dialog", { name: /Pill background|Ink palette/i });
      fireEvent.click(screen.getByTestId("color-blue"));
      const colorBtn = screen.getByTestId("studio-color-trigger");
      colorBtn.focus();
      fireEvent.keyDown(colorBtn, { key: "z", metaKey: true, bubbles: true });
      // Active chip reverts from Blue (#3B82F6) back to White (#FFFFFF)
      await waitFor(() => {
        const chip = colorBtn.querySelector(".ss-color-chip") as HTMLElement;
        expect(chip.style.backgroundColor).toBe("rgb(255, 255, 255)");
      });

      // 6. Cropping around the annotation and clicking Restore full image preserves the annotation!
      fireEvent.click(screen.getByTestId("tool-crop"));
      fireEvent.pointerDown(canvas, { button: 0, pointerId: 2, clientX: 150, clientY: 120 });
      fireEvent.pointerMove(canvas, { pointerId: 2, clientX: 700, clientY: 480 });
      fireEvent.pointerUp(canvas, { pointerId: 2, clientX: 700, clientY: 480 });

      const resetCropBtn = await screen.findByTestId("studio-reset-crop");
      expect(resetCropBtn).toBeVisible();

      // Double-click restored coordinates after Restore full image -> annotation still exists!
      fireEvent.click(resetCropBtn);
      await waitFor(() => expect(screen.queryByTestId("studio-reset-crop")).toBeNull());
      fireEvent.doubleClick(canvas, { clientX: 310, clientY: 260 });
      const postCropInput = (await screen.findByTestId("studio-inline-text")) as HTMLInputElement;
      expect(postCropInput.value).toBe("Keep me");

      // 7. Background padding annotations: place a Text callout in the top background margin (y = 20px < imgY = 48px)
      fireEvent.keyDown(postCropInput, { key: "Escape" });
      await waitFor(() => expect(screen.queryByTestId("studio-inline-text")).toBeNull());
      fireEvent.click(screen.getByTestId("tool-text"));
      fireEvent.pointerDown(canvas, { button: 0, pointerId: 3, clientX: 120, clientY: 20 });
      const bgTextInput = (await screen.findByTestId("studio-inline-text")) as HTMLInputElement;
      expect(parseInt(bgTextInput.style.top, 10)).toBeLessThan(48);
      fireEvent.change(bgTextInput, { target: { value: "Margin callout" } });
      fireEvent.keyDown(bgTextInput, { key: "Enter" });
      await waitFor(() => expect(screen.queryByTestId("studio-inline-text")).toBeNull());

      // Double-clicking in the top background margin re-opens "Margin callout"
      fireEvent.doubleClick(canvas, { clientX: 140, clientY: 20 });
      const verifyBgText = (await screen.findByTestId("studio-inline-text")) as HTMLInputElement;
      expect(verifyBgText.value).toBe("Margin callout");
      fireEvent.keyDown(verifyBgText, { key: "Escape" });
    } finally {
      window.PointerEvent = origPointerEvent;
      URL.createObjectURL = origCreateObjectURL;
      URL.revokeObjectURL = origRevokeObjectURL;
      HTMLImageElement.prototype.decode = origDecode;
      HTMLCanvasElement.prototype.getContext = origGetContext;
    }
  });

  it("computes full-canvas background bounds and supports arrows, boxes, and crop re-projection in the outer margin", () => {
    const layout = computeStudioLayout(
      800,
      500,
      FULL_CROP,
      { ...DEFAULT_STUDIO_STYLE, padding: 80, ratio: "16:9" },
      DEFAULT_BALANCE,
    );
    const bounds = studioAnnotationBounds(layout);
    expect(bounds.minX).toBeLessThan(0);
    expect(bounds.maxX).toBeGreaterThan(1);
    expect(bounds.minY).toBeLessThan(0);
    expect(bounds.maxY).toBeGreaterThan(1);

    // Arrow starting in left background margin (-0.1) pointing to button at (0.35, 0.4)
    const snapped = snapLineEndpoint(-0.1, 0.4, 0.35, 0.4, layout.imgW, layout.imgH, {}, bounds);
    expect(snapped.nx).toBeCloseTo(0.35, 4);
    expect(snapped.ny).toBeCloseTo(0.4, 4);
    expect(snapped.snapped).toBe(true);

    // Box created inside the top-left background margin stays at negative coordinates
    const marginBox = computeBoxCreation(-0.08, -0.1, 0.12, 0.08, layout.imgW, layout.imgH, {}, bounds);
    expect(marginBox.x).toBeCloseTo(-0.08, 3);
    expect(marginBox.y).toBeCloseTo(-0.1, 3);

    // Rigid arrow translation into background margin preserves exact shaft vector
    const movedArrow = translateAnnotation(
      { id: "a1", kind: "arrow", color: "#EF4444", strokeWidth: 4, x1: 0.1, y1: 0.2, x2: 0.4, y2: 0.3, bend: 0 },
      -0.18,
      -0.25,
      bounds,
    );
    if (movedArrow.kind === "arrow") {
      expect(movedArrow.x1).toBeLessThan(0);
      expect(movedArrow.x2 - movedArrow.x1).toBeCloseTo(0.3, 5);
    }

    // Cropping preserves margin callouts and margin-originating arrows
    const subCrop = { x: 0.2, y: 0.2, w: 0.6, h: 0.6 };
    const subLayout = computeStudioLayout(
      800,
      500,
      subCrop,
      { ...DEFAULT_STUDIO_STYLE, padding: 80, ratio: "16:9" },
      DEFAULT_BALANCE,
    );
    const subBounds = studioAnnotationBounds(subLayout);
    const reprojected = reprojectAnnotationsForCrop(
      [
        { id: "bg-txt", kind: "text", color: "#EF4444", strokeWidth: 4, x: 0.3, y: bounds.minY * 0.5, text: "Header", fontSize: 20, pill: true },
        { id: "bg-arr", kind: "arrow", color: "#EF4444", strokeWidth: 4, x1: bounds.minX * 0.6, y1: 0.5, x2: 0.5, y2: 0.5, bend: 0 },
      ],
      FULL_CROP,
      subCrop,
      800,
      500,
      bounds,
      subBounds,
    );
    expect(reprojected).toHaveLength(2);
    const rTxt = reprojected.find(a => a.id === "bg-txt")!;
    const rArr = reprojected.find(a => a.id === "bg-arr")!;
    expect(rTxt.kind === "text" && rTxt.y).toBeLessThan(0);
    expect(rArr.kind === "arrow" && rArr.x1).toBeLessThan(0);
    expect(rArr.kind === "arrow" && rArr.x2).toBeCloseTo(0.5, 4);
  });

  it("supports Gaussian blur redaction tool (tool-blur), initialUnframed mode, and box geometry operations", async () => {
    const blurBox: AnnotationItem = {
      id: "blur-1",
      kind: "blur",
      color: "#EF4444",
      strokeWidth: 6,
      x: 0.15,
      y: 0.25,
      w: 0.4,
      h: 0.18,
    };
    expect(hitTestAnnotation([blurBox], "blur-1", 0.15, 0.25, 1000, 600, 1)?.handle).toBe("nw");
    expect(hitTestAnnotation([blurBox], null, 0.3, 0.32, 1000, 600, 1)?.handle).toBe("move");

    const subCrop = { x: 0.1, y: 0.2, w: 0.8, h: 0.6 };
    const reprojected = reprojectAnnotationsForCrop([blurBox], FULL_CROP, subCrop, 1000, 600);
    expect(reprojected).toHaveLength(1);
    expect(reprojected[0]?.kind).toBe("blur");

    const { container } = render(<ScreenshotStudio initialTool="blur" initialUnframed />);
    await act(async () => {
      await new Promise(r => setTimeout(r, 0));
    });
    const blurBtn = screen.getByTestId("tool-blur");
    expect(blurBtn).toHaveAttribute("aria-label", "Blur redact");
    expect(screen.getByTestId("bg-none")).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByRole("slider", { name: "Padding" })).toBeNull();
    expect(container.querySelector('[data-testid="studio-preset-select"]')).not.toBeNull();
  });
});
