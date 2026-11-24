import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/site", () => ({
  site: {
    origin: "https://imageaspectratio.com",
    indexable: true,
    siteName: "Image Aspect Ratio",
  },
}));

import { AspectRatioCalculatorV2 } from "@/components/v2/AspectRatioCalculatorV2";
import { ANALYTICS_UI_VER, resetUmamiQueueForTest } from "@/lib/tool-analytics";
import { routeTree } from "@/routeTree.gen";

describe("P0 active tool telemetry and SSR mobile nav deduplication", () => {
  const originalLocation = window.location;
  const origClipboardDesc = Object.getOwnPropertyDescriptor(navigator, "clipboard");
  const origSecureDesc = Object.getOwnPropertyDescriptor(window, "isSecureContext");
  let umamiTrackMock: ReturnType<typeof vi.fn>;

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
    umamiTrackMock = vi.fn();
    setProductionLocation("https://imageaspectratio.com/calculator");
    (window as unknown as Record<string, unknown>)["umami"] = { track: umamiTrackMock };
    (window as unknown as Record<string, unknown>)["gtag"] = vi.fn();
  });

  afterEach(() => {
    resetUmamiQueueForTest();
    vi.useRealTimers();
    Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
    if (origClipboardDesc) {
      Object.defineProperty(navigator, "clipboard", origClipboardDesc);
    } else {
      delete (navigator as unknown as Record<string, unknown>)["clipboard"];
    }
    if (origSecureDesc) {
      Object.defineProperty(window, "isSecureContext", origSecureDesc);
    } else {
      delete (window as unknown as Record<string, unknown>)["isSecureContext"];
    }
    delete (window as unknown as Record<string, unknown>)["umami"];
    delete (window as unknown as Record<string, unknown>)["gtag"];
  });

  it("emits tool_first_interact, preset_select, tool_complete, and result_copy from AspectRatioCalculatorV2", async () => {
    vi.useFakeTimers();
    Object.defineProperty(window, "isSecureContext", { configurable: true, value: true });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });

    render(<AspectRatioCalculatorV2 variant="all" />);

    fireEvent.click(screen.getByTestId("v2-calc-preset-4:5"));

    expect(umamiTrackMock).toHaveBeenCalledWith("tool_first_interact", {
      tool: "calculator",
      calculation_mode: "solve",
      action_type: "preset",
      ui_ver: ANALYTICS_UI_VER,
    });
    expect(umamiTrackMock).toHaveBeenCalledWith("preset_select", {
      tool: "calculator",
      calculation_mode: "solve",
      preset: "4:5",
      ui_ver: ANALYTICS_UI_VER,
    });

    await act(async () => {
      vi.advanceTimersByTime(1100);
    });

    expect(umamiTrackMock).toHaveBeenCalledWith("tool_complete", {
      tool: "calculator",
      task_type: "calculation",
      calculation_mode: "solve",
      ui_ver: ANALYTICS_UI_VER,
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("v2-calc-copy"));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(umamiTrackMock).toHaveBeenCalledWith("result_copy", {
      tool: "calculator",
      task_type: "calculation",
      calculation_mode: "solve",
      ui_ver: ANALYTICS_UI_VER,
    });
  });

  it("keeps mobile nav links unmounted until toggled and tracks nav_tool_switch on click", async () => {
    const history = createMemoryHistory({ initialEntries: ["/calculator"] });
    const router = createRouter({
      routeTree,
      context: { queryClient: new QueryClient() },
      history,
    });
    await router.load();

    const { container } = render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(container.querySelectorAll(".v2-nav-desktop a").length).toBeGreaterThan(0);
    });
    expect(container.querySelector(".v2-nav-menu--mobile")).toBeNull();

    const mobileDetails = container.querySelector("details.v2-nav-mobile") as HTMLDetailsElement | null;
    expect(mobileDetails).not.toBeNull();

    await act(async () => {
      mobileDetails!.open = true;
      fireEvent(mobileDetails!, new Event("toggle"));
    });

    await waitFor(() => {
      expect(container.querySelector(".v2-nav-menu--mobile")).not.toBeNull();
    });

    const squareLink = container.querySelector(
      '.v2-nav-menu--mobile a[href="/make-image-square"]',
    ) as HTMLAnchorElement | null;
    expect(squareLink).not.toBeNull();

    await act(async () => {
      fireEvent.click(squareLink!);
    });

    expect(umamiTrackMock).toHaveBeenCalledWith("nav_tool_switch", {
      from_path: "/calculator",
      to_path: "/make-image-square",
      nav_surface: "mobile",
      ui_ver: ANALYTICS_UI_VER,
    });
  });
});
