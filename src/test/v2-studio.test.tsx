import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createAgent } from "@ui-sdk/react/agent";
import { describe, expect, it, vi } from "vitest";
import { ScreenshotStudio } from "@/components/ScreenshotStudio";
import { AspectRatioCalculatorV2 } from "@/components/v2/AspectRatioCalculatorV2";
import { ImageInspectorV2 } from "@/components/v2/ImageInspectorV2";
import { SocialMediaHubV2, SocialPlatformStudioV2 } from "@/components/v2/SocialRatioV2";
import { StudioFrameEditorV2 } from "@/components/v2/StudioFrameEditorV2";
import { VideoAspectRatioV2 } from "@/components/v2/VideoAspectRatioV2";
import {
  DEFAULT_BALANCE,
  DEFAULT_STUDIO_STYLE,
  FULL_CROP,
  computeStudioLayout,
} from "@/lib/screenshot-studio";
import { SITE_PAGES, sitemapXml } from "@/lib/site";
import { copyPngBlobSafe, copyTextSafe } from "@/lib/v2-clipboard";
import { routeTree } from "@/routeTree.gen";

const ALL_V2_ROUTES = [
  ["/v2", "/v2/"],
  ["/v2/image-aspect-ratio", "/v2/image-aspect-ratio"],
  ["/v2/change-image-aspect-ratio", "/v2/change-image-aspect-ratio"],
  ["/v2/make-image-square", "/v2/make-image-square"],
  ["/v2/screenshot-beautifier", "/v2/screenshot-beautifier"],
  ["/v2/calculator", "/v2/calculator"],
  ["/v2/16-9-aspect-ratio-calculator", "/v2/16-9-aspect-ratio-calculator"],
  ["/v2/video-aspect-ratio", "/v2/video-aspect-ratio"],
  ["/v2/ultrawide-aspect-ratio-calculator", "/v2/ultrawide-aspect-ratio-calculator"],
  ["/v2/social-media", "/v2/social-media"],
  ["/v2/instagram-reel-aspect-ratio", "/v2/instagram-reel-aspect-ratio"],
  ["/v2/instagram-story-aspect-ratio", "/v2/instagram-story-aspect-ratio"],
  ["/v2/youtube-aspect-ratio", "/v2/youtube-aspect-ratio"],
  ["/v2/youtube-shorts-aspect-ratio", "/v2/youtube-shorts-aspect-ratio"],
  ["/v2/tiktok-aspect-ratio", "/v2/tiktok-aspect-ratio"],
] as const;

const agent = createAgent();

function assertAllSnapshotControlsNamed() {
  const entries = agent
    .snapshot()
    .filter(entry => !entry.offPage && entry.component !== "more");
  expect(entries.length).toBeGreaterThan(0);
  for (const entry of entries) {
    expect(entry.label, `${entry.component} ${entry.ref} has no name`).toBeTruthy();
  }
  return entries;
}

describe("V2 Suite (V1 workflow preserved, controls on right, @ui-sdk/react UI)", () => {
  it("registers all 15 /v2/* routes while keeping SITE_PAGES and sitemapXml untouched", () => {
    const r = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    for (const [path, expectedId] of ALL_V2_ROUTES) {
      expect(r.matchRoutes(path).at(-1)?.routeId).toBe(expectedId);
    }

    expect(r.matchRoutes("/").at(-1)?.routeId).toBe("/");
    expect(r.matchRoutes("/change-image-aspect-ratio").at(-1)?.routeId).toBe("/change-image-aspect-ratio");
    expect(r.matchRoutes("/make-image-square").at(-1)?.routeId).toBe("/make-image-square");
    expect(r.matchRoutes("/video-aspect-ratio").at(-1)?.routeId).toBe("/video-aspect-ratio");
    expect(r.matchRoutes("/calculator").at(-1)?.routeId).toBe("/calculator");

    expect(SITE_PAGES.some(p => p.startsWith("/v2"))).toBe(false);
    expect(sitemapXml({ origin: "https://example.com", indexable: true })).not.toContain("/v2");
  });

  it("renders StudioFrameEditorV2 with stage on left, controls on right, flat SegmentedControl switches, and ColorPicker popover", async () => {
    const errorSpy = vi.spyOn(console, "error");
    const warnSpy = vi.spyOn(console, "warn");

    const { container, unmount } = render(<StudioFrameEditorV2 mode="ratio" />);
    expect(container.querySelector(".ss-shell")).toBeNull();
    expect(container.querySelector('input[type="color"]')).toBeNull();
    expect(container.querySelector('input[type="range"]:not([data-slot="slider-thumb-input"])')).toBeNull();
    expect(container.querySelector('[data-slot="slider"]')).toBeTruthy();

    const gridChildren = Array.from(container.querySelector(".grid")?.children ?? []);
    expect(gridChildren[0]?.classList.contains("v2-stage-card")).toBe(true);
    expect(gridChildren[1]?.classList.contains("v2-panel")).toBe(true);

    expect(screen.getByTestId("v2-empty-open")).toBeTruthy();
    expect(screen.getByTestId("v2-framing-control")).toBeTruthy();
    expect(screen.getByTestId("v2-format-control")).toBeTruthy();
    expect(screen.getByTestId("v2-size-summary").textContent).toContain("1920 × 1080 px");

    fireEvent.click(screen.getByTestId("v2-ratio-4:5"));
    expect(screen.getByTestId("v2-size-summary").textContent).toContain("1080 × 1350 px");

    fireEvent.click(screen.getByTestId("v2-ratio-custom"));
    fireEvent.input(screen.getByTestId("v2-custom-ratio-w"), { target: { value: "1.91" } });
    fireEvent.input(screen.getByTestId("v2-custom-ratio-h"), { target: { value: "1" } });
    fireEvent.input(screen.getByTestId("v2-width-input"), { target: { value: "1080" } });
    expect(screen.getByTestId("v2-size-summary").textContent).toContain("1080 × 565 px");

    fireEvent.click(screen.getByTestId("v2-bg-transparent"));
    fireEvent.click(screen.getByTestId("v2-format-jpeg"));
    expect(screen.getByTestId("v2-jpg-alpha-note").textContent).toContain("white");

    fireEvent.click(screen.getByTestId("v2-backdrop-spectrum"));
    expect(screen.getByTestId("v2-backdrop-hex")).toBeTruthy();

    await act(async () => {
      await new Promise(r => setTimeout(r, 0));
    });
    assertAllSnapshotControlsNamed();

    unmount();

    render(<StudioFrameEditorV2 mode="square" />);
    expect(screen.getByTestId("v2-size-summary").textContent).toContain("1080 × 1080 px");
    fireEvent.click(screen.getByTestId("v2-sq-preset-2048"));
    expect(screen.getByTestId("v2-size-summary").textContent).toContain("2048 × 2048 px");

    const strictMessages = [...errorSpy.mock.calls, ...warnSpy.mock.calls]
      .flat()
      .map(String)
      .filter(msg => msg.includes("UI-SDK") || msg.includes("accessible"));
    expect(strictMessages).toEqual([]);

    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it("renders VideoAspectRatioV2 with realistic monitor/phone stage on left and controls on right", async () => {
    const { container } = render(<VideoAspectRatioV2 />);
    expect(container.querySelector(".ss-shell")).toBeNull();
    expect(container.querySelector(".mp-diag")).toBeNull();
    expect(container.querySelector(".v2-panel")).toBeTruthy();

    expect(screen.getByTestId("v2-video-ratio-badge").textContent).toBe("16:9");
    expect(screen.getByTestId("v2-video-solved-summary").textContent).toContain("1,920 × 1,080 px");

    fireEvent.click(screen.getByTestId("v2-video-opt-9:16"));
    expect(screen.getByTestId("v2-video-ratio-badge").textContent).toBe("9:16");

    fireEvent.click(screen.getByTestId("v2-video-res-4k"));
    expect(screen.getByTestId("v2-video-solved-summary").textContent).toContain("2,160 × 3,840 px");

    fireEvent.click(screen.getByTestId("v2-video-mode-fill"));
    expect(screen.getByTestId("v2-sim-display").textContent).toContain("cropped");

    await act(async () => {
      await new Promise(r => setTimeout(r, 0));
    });
    assertAllSnapshotControlsNamed();
  });

  it("renders AspectRatioCalculatorV2 with canvas on left and flat SegmentedControl modes on right", async () => {
    const { container, unmount } = render(<AspectRatioCalculatorV2 />);
    expect(container.querySelector(".ss-shell")).toBeNull();
    expect(screen.getByTestId("v2-calc-result-summary").textContent).toContain("1,920 × 1,080 px");

    fireEvent.click(screen.getByTestId("v2-calc-preset-4:5"));
    expect(screen.getByTestId("v2-calc-result-summary").textContent).toContain("1,920 × 2,400 px");

    fireEvent.click(screen.getByTestId("v2-calc-mode-identify"));
    expect(screen.getByTestId("v2-calc-result-summary").textContent).toContain("16:9");

    fireEvent.click(screen.getByTestId("v2-calc-mode-scale"));
    expect(screen.getByTestId("v2-calc-result-summary").textContent).toContain("3,840 × 4,800 px");

    await act(async () => {
      await new Promise(r => setTimeout(r, 0));
    });
    assertAllSnapshotControlsNamed();

    unmount();

    render(<AspectRatioCalculatorV2 variant="ultrawide" />);
    expect(screen.getByTestId("v2-calc-result-summary").textContent).toContain("3,440 × 1,440 px");
  });

  it("renders SocialPlatformStudioV2, SocialMediaHubV2, ScreenshotStudio right rail + Window bar + Glass bezel, and ImageInspectorV2 cleanly", async () => {
    const { container, unmount } = render(<SocialPlatformStudioV2 path="/tiktok-aspect-ratio" />);
    expect(container.querySelector(".ss-shell")).toBeNull();
    expect(screen.getByTestId("v2-social-result").textContent).toContain("1,080 × 1,920 px");

    fireEvent.click(screen.getByTestId("v2-social-known-height"));
    fireEvent.input(screen.getByTestId("v2-social-px-input"), { target: { value: "1280" } });
    expect(screen.getByTestId("v2-social-result").textContent).toContain("720 × 1,280 px");
    assertAllSnapshotControlsNamed();
    unmount();

    const withBarLayout = computeStudioLayout(
      960,
      580,
      FULL_CROP,
      { ...DEFAULT_STUDIO_STYLE, windowBar: "dark", glassBezel: true },
      DEFAULT_BALANCE,
    );
    expect(withBarLayout.cardH).toBe(612);
    expect(withBarLayout.outH).toBe(708);

    const { container: studioContainer, unmount: unmountStudio } = render(<ScreenshotStudio />);
    expect(studioContainer.querySelector(".ss-body--right-rail")).toBeTruthy();
    const bodyKids = Array.from(studioContainer.querySelector(".ss-body")?.children ?? []);
    expect(bodyKids[0]?.classList.contains("ss-workspace")).toBe(true);
    expect(bodyKids[1]?.classList.contains("ss-sidebar--right")).toBe(true);

    fireEvent.click(screen.getByTestId("studio-windowbar-dark"));
    expect(screen.getByTestId("studio-windowbar-dark").getAttribute("aria-checked")).toBe("true");
    expect(studioContainer.querySelector(".ss-empty-windowbar--dark")).toBeTruthy();

    fireEvent.click(screen.getByTestId("studio-glass-bezel"));
    expect(screen.getByTestId("studio-glass-bezel").getAttribute("aria-checked")).toBe("true");
    expect(studioContainer.querySelector(".ss-empty-glass")).toBeTruthy();

    await act(async () => {
      await new Promise(r => setTimeout(r, 0));
    });
    assertAllSnapshotControlsNamed();
    unmountStudio();

    const r = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    expect(r).toBeTruthy();

    const { container: inspectorContainer } = render(<ImageInspectorV2 />);
    expect(inspectorContainer.querySelector(".ss-shell")).toBeNull();
    for (const id of ["1:1", "4:5", "9:16"]) {
      expect(screen.getByTestId(`v2-inspector-card-${id}`)).toBeTruthy();
    }
    expect(screen.queryByTestId("v2-inspector-card-16:9")).toBeNull();

    const components = assertAllSnapshotControlsNamed();
    const fitEntry = components.find(entry => entry.label === "Frame fitting");
    const fillChoice = fitEntry?.items?.find(item => item.label.includes("Fill"))?.value ?? "cover";
    await act(async () => {
      const actRes = await agent.act({
        steps: [{ ref: "Frame fitting", action: "setValue", args: [fillChoice] }],
      });
      expect(actRes.ok, actRes.error?.message).toBe(true);
    });
    expect(screen.getByTestId("v2-inspector-fit-cover").getAttribute("aria-checked")).toBe("true");

    const origCreateObjectURL = URL.createObjectURL;
    const origRevokeObjectURL = URL.revokeObjectURL;
    const origDecode = HTMLImageElement.prototype.decode;
    URL.createObjectURL = vi.fn(() => "blob:v2-sample-960x600");
    URL.revokeObjectURL = vi.fn();
    HTMLImageElement.prototype.decode = vi.fn(function (this: HTMLImageElement) {
      Object.defineProperty(this, "naturalWidth", { value: 960, configurable: true });
      Object.defineProperty(this, "naturalHeight", { value: 600, configurable: true });
      return Promise.resolve();
    });

    try {
      const nativeFileInput = inspectorContainer.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      const sampleFile = new File([new Uint8Array([137, 80, 78, 71])], "dashboard.png", {
        type: "image/png",
      });
      fireEvent.change(nativeFileInput, { target: { files: [sampleFile] } });

      await waitFor(() => {
        expect((screen.getByLabelText("Width (px)") as HTMLInputElement).value).toBe("960");
        expect((screen.getByLabelText("Height (px)") as HTMLInputElement).value).toBe("600");
        expect((screen.getByLabelText("Exact ratio") as HTMLInputElement).value).toBe("8:5");
      });

      expect(screen.getByTestId("v2-inspector-card-1:1").textContent).toContain("62.5%");
      expect(screen.getByTestId("v2-inspector-card-4:5").textContent).toContain("50.0%");

      fireEvent.click(screen.getByTestId("v2-inspector-clear"));
      expect((screen.getByLabelText("Width (px)") as HTMLInputElement).value).toBe("");
      expect((screen.getByLabelText("Exact ratio") as HTMLInputElement).value).toBe("");
    } finally {
      URL.createObjectURL = origCreateObjectURL;
      URL.revokeObjectURL = origRevokeObjectURL;
      HTMLImageElement.prototype.decode = origDecode;
    }

    expect(SocialMediaHubV2).toBeTypeOf("function");
  });

  it("explains HTTPS requirement clearly when copying PNG over HTTP LAN and falls back for text copy", async () => {
    const origSecure = Object.getOwnPropertyDescriptor(window, "isSecureContext");
    Object.defineProperty(window, "isSecureContext", { value: false, configurable: true });
    const origExecCommand = document.execCommand;
    document.execCommand = vi.fn(() => true);

    try {
      const pngRes = await copyPngBlobSafe(async () => new Blob(["png"], { type: "image/png" }));
      expect(pngRes.ok).toBe(false);
      if (!pngRes.ok) {
        expect(pngRes.message).toContain("HTTPS or localhost");
        expect(pngRes.message).toContain("Download");
      }

      const txtRes = await copyTextSafe("1920 × 1080");
      expect(txtRes).toBe(true);
      expect(document.execCommand).toHaveBeenCalledWith("copy");
    } finally {
      if (origSecure) {
        Object.defineProperty(window, "isSecureContext", origSecure);
      }
      document.execCommand = origExecCommand;
    }
  });
});
