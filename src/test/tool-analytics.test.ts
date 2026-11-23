import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/site", () => ({
  site: {
    origin: "https://imageaspectratio.com",
    indexable: true,
    siteName: "Image Aspect Ratio",
  },
}));

import {
  ANALYTICS_UI_VER,
  classifyPageType,
  trackEngagementEvent,
  trackInteractionEvent,
  trackToolEvent,
  usePageEngagement,
  useToolTracking,
} from "@/lib/tool-analytics";

describe("tool-analytics real-time GEOInflow bridge and engagement signals", () => {
  const originalLocation = window.location;
  let gtagMock: ReturnType<typeof vi.fn>;
  let umamiTrackMock: ReturnType<typeof vi.fn>;

  function setLocation(url: string) {
    const parsed = new URL(url);
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        ...originalLocation,
        href: parsed.href,
        origin: parsed.origin,
        pathname: parsed.pathname,
        search: parsed.search,
        hash: parsed.hash,
      },
    });
  }

  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
    document.querySelector("#analytics-test-events")?.remove();
    gtagMock = vi.fn();
    umamiTrackMock = vi.fn();
    (window as unknown as Record<string, unknown>)["gtag"] = gtagMock;
    (window as unknown as Record<string, unknown>)["umami"] = { track: umamiTrackMock };
    Object.defineProperty(navigator, "doNotTrack", { configurable: true, value: "0" });
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
    setLocation("https://imageaspectratio.com/calculator");
  });

  afterEach(() => {
    vi.useRealTimers();
    Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
    delete (window as unknown as Record<string, unknown>)["gtag"];
    delete (window as unknown as Record<string, unknown>)["umami"];
  });

  it("classifies public routes into bounded page types", () => {
    expect(classifyPageType("/")).toBe("home");
    expect(classifyPageType("/make-image-square")).toBe("tool");
    expect(classifyPageType("/tiktok-aspect-ratio")).toBe("social");
    expect(classifyPageType("/what-is-aspect-ratio")).toBe("guide");
    expect(classifyPageType("/privacy")).toBe("info");
  });

  it("forwards tool_complete and result_copy to both GA4 and GEOInflow with ui_ver", () => {
    trackToolEvent("tool_complete", {
      tool: "calculator",
      task_type: "calculation",
      calculation_mode: "solve",
    });
    trackToolEvent("result_copy", {
      tool: "calculator",
      task_type: "calculation",
      calculation_mode: "solve",
    });

    expect(gtagMock).toHaveBeenNthCalledWith(1, "event", "tool_complete", {
      tool: "calculator",
      task_type: "calculation",
      calculation_mode: "solve",
    });
    expect(umamiTrackMock).toHaveBeenNthCalledWith(1, "tool_complete", {
      tool: "calculator",
      task_type: "calculation",
      calculation_mode: "solve",
      ui_ver: ANALYTICS_UI_VER,
    });
    expect(umamiTrackMock).toHaveBeenNthCalledWith(2, "result_copy", {
      tool: "calculator",
      task_type: "calculation",
      calculation_mode: "solve",
      ui_ver: ANALYTICS_UI_VER,
    });
  });

  it("suppresses GEOInflow events in QA mode and on /v2 or /v3 preview routes", () => {
    setLocation("https://imageaspectratio.com/calculator?analytics_test=1");
    trackToolEvent("tool_complete", {
      tool: "calculator",
      task_type: "calculation",
      calculation_mode: "solve",
    });
    expect(gtagMock).toHaveBeenCalledWith(
      "event",
      "qa_tool_complete",
      expect.objectContaining({ debug_mode: true, test_traffic: "internal" }),
    );
    expect(umamiTrackMock).not.toHaveBeenCalled();

    sessionStorage.clear();
    gtagMock.mockClear();
    setLocation("https://imageaspectratio.com/v3/screenshot-studio");
    trackInteractionEvent("nav_tool_switch", {
      from_path: "/v3/screenshot-studio",
      to_path: "/",
      nav_surface: "desktop",
    });
    expect(gtagMock).not.toHaveBeenCalled();
    expect(umamiTrackMock).not.toHaveBeenCalled();
  });

  it("emits tool_first_interact once and preset_select on bounded preset clicks", () => {
    const { result } = renderHook(() => useToolTracking("calculator", "solve", "16:9:1920"));

    act(() => {
      result.current.preset("9:16");
      result.current.changed();
      result.current.preset("1:1");
    });

    const firstInteractCalls = umamiTrackMock.mock.calls.filter(
      ([name]) => name === "tool_first_interact",
    );
    const presetCalls = umamiTrackMock.mock.calls.filter(([name]) => name === "preset_select");

    expect(firstInteractCalls).toHaveLength(1);
    expect(firstInteractCalls[0]?.[1]).toEqual({
      tool: "calculator",
      calculation_mode: "solve",
      action_type: "preset",
      ui_ver: ANALYTICS_UI_VER,
    });
    expect(presetCalls).toHaveLength(2);
    expect(presetCalls[0]?.[1]).toEqual({
      tool: "calculator",
      calculation_mode: "solve",
      preset: "9:16",
      ui_ver: ANALYTICS_UI_VER,
    });
    expect(presetCalls[1]?.[1]).toEqual({
      tool: "calculator",
      calculation_mode: "solve",
      preset: "1:1",
      ui_ver: ANALYTICS_UI_VER,
    });
  });

  it("emits page_engaged_15s only after real interaction + 15s visible dwell and emits scroll_depth milestones", () => {
    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      value: 2000,
    });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });

    renderHook(({ path }) => usePageEngagement(path), {
      initialProps: { path: "/make-image-square" },
    });

    // Without real interaction, 20s passing should NOT emit page_engaged_15s.
    act(() => {
      vi.advanceTimersByTime(20_000);
    });
    expect(umamiTrackMock).not.toHaveBeenCalled();

    // First interaction after 20s visible dwell immediately qualifies as engaged.
    act(() => {
      window.dispatchEvent(new Event("pointerdown"));
    });
    expect(umamiTrackMock).toHaveBeenCalledWith("page_engaged_15s", {
      page_type: "tool",
      ui_ver: ANALYTICS_UI_VER,
    });

    // Scroll to 55% -> emits 50 milestone once.
    Object.defineProperty(window, "scrollY", { configurable: true, value: 300 });
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(umamiTrackMock).toHaveBeenCalledWith("scroll_depth", {
      page_type: "tool",
      depth: 50,
      ui_ver: ANALYTICS_UI_VER,
    });

    // Scroll to 95% -> emits 90 milestone once.
    Object.defineProperty(window, "scrollY", { configurable: true, value: 1150 });
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(umamiTrackMock).toHaveBeenCalledWith("scroll_depth", {
      page_type: "tool",
      depth: 90,
      ui_ver: ANALYTICS_UI_VER,
    });
  });

  it("supports direct engagement helper calls with bounded fields", () => {
    trackEngagementEvent("scroll_depth", { page_type: "home", depth: 50 });
    expect(umamiTrackMock).toHaveBeenCalledWith("scroll_depth", {
      page_type: "home",
      depth: 50,
      ui_ver: ANALYTICS_UI_VER,
    });
  });
});
