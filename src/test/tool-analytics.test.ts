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
  resetUmamiQueueForTest,
  trackEngagementEvent,
  trackInteractionEvent,
  trackToolEvent,
  usePageEngagement,
  useToolTracking,
} from "@/lib/tool-analytics";
import { geoCollection } from "@/lib/geo-collection";

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

describe("P0 Umami readiness queue and geoCollection attribution", () => {
  const originalLocation = window.location;

  function setProductionLocation(url: string) {
    const parsed = new URL(url);
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        href: parsed.href,
        origin: parsed.origin,
        pathname: parsed.pathname,
        search: parsed.search,
        hostname: parsed.hostname,
      } as Location,
    });
  }

  beforeEach(() => {
    resetUmamiQueueForTest();
    setProductionLocation("https://imageaspectratio.com/calculator");
    delete (window as unknown as Record<string, unknown>)["umami"];
  });

  afterEach(() => {
    resetUmamiQueueForTest();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
    delete (window as unknown as Record<string, unknown>)["umami"];
    document.querySelectorAll("script[data-ratio-geo]").forEach(el => el.remove());
  });

  it("queues up to 20 events before window.umami loads and flushes FIFO on script load", () => {
    const script = document.createElement("script");
    script.setAttribute("data-ratio-geo", "true");
    document.head.appendChild(script);

    for (let i = 1; i <= 22; i += 1) {
      trackInteractionEvent("preset_select", { tool: "calculator", preset: `p${i}` });
    }

    const delayedTrackMock = vi.fn();
    (window as unknown as Record<string, unknown>)["umami"] = { track: delayedTrackMock };
    script.dispatchEvent(new Event("load"));

    expect(delayedTrackMock).toHaveBeenCalledTimes(20);
    expect(delayedTrackMock).toHaveBeenNthCalledWith(1, "preset_select", {
      tool: "calculator",
      preset: "p3",
      ui_ver: ANALYTICS_UI_VER,
    });
    expect(delayedTrackMock).toHaveBeenNthCalledWith(20, "preset_select", {
      tool: "calculator",
      preset: "p22",
      ui_ver: ANALYTICS_UI_VER,
    });
  });

  it("preserves allowlisted utm params on payload.url and strips referrer/disallowed queries in geoCollection", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const request = new Request("https://imageaspectratio.com/_geo/api/send", {
      method: "POST",
      headers: {
        Origin: "https://imageaspectratio.com",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "event",
        payload: {
          website: "0e360655-0b8c-4334-98dd-99634b96d0c0",
          hostname: "imageaspectratio.com",
          url: "https://imageaspectratio.com/calculator?utm_source=chatgpt.com&utm_medium=referral&utm_campaign=test_1&secret=dropme&utm_term=ignored",
          referrer: "https://chatgpt.com/c/123?token=secret",
          name: "tool_first_interact",
          data: { tool: "calculator", ui_ver: ANALYTICS_UI_VER },
        },
      }),
    });
    Object.assign(request, { cf: {} });

    const response = await geoCollection(request, { GEO_RELAY_KEY: "test-key" });
    expect(response?.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const forwarded = JSON.parse(String(init.body)) as {
      type: string;
      payload: { url: string; referrer: string; name?: string; data?: Record<string, unknown> };
    };
    expect(forwarded.payload.url).toBe(
      "/calculator?utm_source=chatgpt.com&utm_medium=referral&utm_campaign=test_1",
    );
    expect(forwarded.payload.referrer).toBe("https://chatgpt.com/c/123");
    expect(forwarded.payload.name).toBe("tool_first_interact");
  });

  it("drops utm attribution params containing disallowed characters", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const request = new Request("https://imageaspectratio.com/_geo/api/send", {
      method: "POST",
      headers: {
        Origin: "https://imageaspectratio.com",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "event",
        payload: {
          website: "0e360655-0b8c-4334-98dd-99634b96d0c0",
          hostname: "imageaspectratio.com",
          url: "https://imageaspectratio.com/calculator?utm_source=bad!val&utm_medium=organic",
          referrer: "",
        },
      }),
    });
    Object.assign(request, { cf: {} });

    const response = await geoCollection(request, { GEO_RELAY_KEY: "test-key" });
    expect(response?.status).toBe(200);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const forwarded = JSON.parse(String(init.body)) as { payload: { url: string } };
    expect(forwarded.payload.url).toBe("/calculator?utm_medium=organic");
  });
});
