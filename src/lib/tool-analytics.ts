import { useCallback, useEffect, useRef, useState } from "react";
import { site } from "./site";

/** Short release tag attached to GEOInflow custom events for 4-hour iteration comparisons. */
export const ANALYTICS_UI_VER = "20261123a";

export type Tool =
  | "calculator"
  | "image"
  | "video"
  | "ultrawide"
  | "16_9"
  | "make_square"
  | "change_ratio"
  | "screenshot_studio";

export type Mode = "solve" | "ratio" | "resize" | "frame" | "annotate";
export type TaskType = "calculation" | "image_read" | "image_export";
export type PageType = "home" | "tool" | "social" | "guide" | "info";
export type FirstInteractAction = "input" | "preset" | "image";
export type ScrollDepth = 50 | 90;

type Details = { tool: Tool; task_type: TaskType; calculation_mode: Mode };
type UmamiPayload = Record<string, string | number | boolean>;
type AnalyticsWindow = Window & {
  gtag?: (...args: unknown[]) => void;
  umami?: { track?: (eventName: string, data?: UmamiPayload) => void };
};

const ENGAGED_DWELL_MS = 15_000;

function isPreviewPathname(pathname: string): boolean {
  return (
    pathname === "/v2" ||
    pathname.startsWith("/v2/") ||
    pathname === "/v3" ||
    pathname.startsWith("/v3/")
  );
}

function resolveAnalyticsTestMode(): boolean {
  const flag = new URLSearchParams(location.search).get("analytics_test");
  let test = flag === "1";
  try {
    if (flag === "1" || flag === "0") sessionStorage.setItem("arc-analytics-test", flag);
    test = sessionStorage.getItem("arc-analytics-test") === "1";
  } catch {
    /* The explicit query flag still works when storage is blocked. */
  }
  return test;
}

function recordQaEvent(event: string, params: Record<string, unknown>) {
  let log = document.querySelector<HTMLOutputElement>("#analytics-test-events");
  if (!log) {
    log = document.createElement("output");
    log.id = "analytics-test-events";
    log.hidden = true;
    document.body.appendChild(log);
  }
  const entries = JSON.parse(log.textContent || "[]") as unknown[];
  log.textContent = JSON.stringify([...entries.slice(-99), { event, ...params }]);
}

function emitEvent(name: string, details: UmamiPayload) {
  if (typeof window === "undefined") return;
  try {
    const test = resolveAnalyticsTestMode();
    const gaEvent = test ? `qa_${name}` : name;
    const gaParams = { ...details, ...(test ? { debug_mode: true, test_traffic: "internal" } : {}) };
    if (test) {
      recordQaEvent(gaEvent, gaParams);
    }
    if (site.indexable && site.origin === location.origin && !isPreviewPathname(location.pathname)) {
      const win = window as AnalyticsWindow;
      win.gtag?.("event", gaEvent, gaParams);
      // Forward non-QA production events to first-party GEOInflow (Umami) for real-time 4-hour iteration checks.
      if (!test && navigator.doNotTrack !== "1") {
        win.umami?.track?.(name, { ...details, ui_ver: ANALYTICS_UI_VER });
      }
    }
  } catch {
    // Measurement must never interrupt a user's task.
  }
}

/** Classifies a public pathname into a bounded page type for engagement funnels. */
export function classifyPageType(pathname: string): PageType {
  if (pathname === "/" || pathname === "") return "home";
  if (
    pathname === "/social-media" ||
    pathname.startsWith("/instagram-") ||
    pathname.startsWith("/youtube-") ||
    pathname.startsWith("/tiktok-") ||
    pathname === "/safe-zone-checker" ||
    pathname === "/fit-photo-to-instagram" ||
    pathname === "/og-image-safe-zone"
  ) {
    return "social";
  }
  if (
    pathname === "/what-is-aspect-ratio" ||
    pathname === "/exact-fractions-vs-rounded-pixels"
  ) {
    return "guide";
  }
  if (
    pathname === "/about" ||
    pathname === "/contact" ||
    pathname === "/privacy" ||
    pathname === "/terms"
  ) {
    return "info";
  }
  return "tool";
}

/** Explicit QA events have separate names and never count as production key events. */
export function trackToolEvent(name: "tool_complete" | "result_copy", details: Details) {
  emitEvent(name, details);
}

/** Tracks bounded L2 engagement signals (15s active foreground dwell and 50%/90% scroll depth). */
export function trackEngagementEvent(
  name: "page_engaged_15s" | "scroll_depth",
  details: { page_type: PageType; depth?: ScrollDepth },
) {
  const payload: UmamiPayload =
    details.depth !== undefined
      ? { page_type: details.page_type, depth: details.depth }
      : { page_type: details.page_type };
  emitEvent(name, payload);
}

/** Tracks bounded L2/L3 tool interaction signals without sending arbitrary user input. */
export function trackInteractionEvent(
  name: "tool_first_interact" | "preset_select" | "nav_tool_switch",
  details: Record<string, string>,
) {
  emitEvent(name, details);
}

/**
 * Tracks real human foreground engagement (15s active visible dwell after first input/scroll)
 * and 50%/90% scroll milestones once per pathname.
 */
export function usePageEngagement(pathname: string) {
  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    if (isPreviewPathname(pathname)) return;

    const pageType = classifyPageType(pathname);
    let engagedSent = false;
    let interacted = false;
    let elapsedMs = 0;
    let visibleSince: number | null = document.visibilityState === "visible" ? Date.now() : null;
    let timerId: number | null = null;
    const sentDepths = new Set<ScrollDepth>();

    const clearTimer = () => {
      if (timerId !== null) {
        window.clearTimeout(timerId);
        timerId = null;
      }
    };

    const getElapsed = () =>
      elapsedMs + (visibleSince !== null ? Math.max(0, Date.now() - visibleSince) : 0);

    const trySendEngaged = () => {
      if (engagedSent || !interacted) return;
      const total = getElapsed();
      if (total >= ENGAGED_DWELL_MS) {
        engagedSent = true;
        clearTimer();
        trackEngagementEvent("page_engaged_15s", { page_type: pageType });
        return;
      }
      if (visibleSince !== null && timerId === null) {
        timerId = window.setTimeout(() => {
          timerId = null;
          trySendEngaged();
        }, ENGAGED_DWELL_MS - total);
      }
    };

    const onInteract = () => {
      if (!interacted) {
        interacted = true;
        trySendEngaged();
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        if (visibleSince === null) visibleSince = Date.now();
        trySendEngaged();
      } else {
        if (visibleSince !== null) {
          elapsedMs += Math.max(0, Date.now() - visibleSince);
          visibleSince = null;
        }
        clearTimer();
      }
    };

    const onScroll = () => {
      onInteract();
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const pct = ((window.scrollY + window.innerHeight) / doc.scrollHeight) * 100;
      for (const depth of [50, 90] as const) {
        if (pct >= depth && !sentDepths.has(depth)) {
          sentDepths.add(depth);
          trackEngagementEvent("scroll_depth", { page_type: pageType, depth });
        }
      }
    };

    window.addEventListener("pointerdown", onInteract, { passive: true });
    window.addEventListener("keydown", onInteract, { passive: true });
    window.addEventListener("touchstart", onInteract, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearTimer();
      window.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("keydown", onInteract);
      window.removeEventListener("touchstart", onInteract);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [pathname]);
}

/** Signatures stay in memory: no dimensions, ratios or filenames leave this hook. */
export function useToolTracking(tool: Tool, mode: Mode, signature: string | null) {
  const [revision, setRevision] = useState(0);
  const pending = useRef(false);
  const beforeEdit = useRef(signature);
  const firstInteracted = useRef(false);
  const completed = useRef(new Set<string>());
  const copied = useRef(new Set<string>());
  const record = (set: Set<string>, key: string) => {
    if (set.has(key)) return false;
    if (set.size >= 100) set.delete(set.values().next().value!);
    set.add(key);
    return true;
  };
  const markFirstInteract = useCallback(
    (actionType: FirstInteractAction) => {
      if (firstInteracted.current) return;
      firstInteracted.current = true;
      trackInteractionEvent("tool_first_interact", {
        tool,
        calculation_mode: mode,
        action_type: actionType,
      });
    },
    [tool, mode],
  );
  const changed = useCallback(() => {
    markFirstInteract("input");
    if (!pending.current) beforeEdit.current = signature;
    pending.current = true;
    setRevision((v) => v + 1);
  }, [signature, markFirstInteract]);
  const preset = useCallback(
    (presetKey: string) => {
      markFirstInteract("preset");
      trackInteractionEvent("preset_select", {
        tool,
        calculation_mode: mode,
        preset: presetKey,
      });
    },
    [tool, mode, markFirstInteract],
  );
  const cancel = useCallback(() => {
    pending.current = false;
    setRevision((v) => v + 1);
  }, []);
  useEffect(() => {
    if (!pending.current || !signature || signature === beforeEdit.current) return;
    const timer = window.setTimeout(() => {
      if (!pending.current) return;
      pending.current = false;
      if (record(completed.current, `calculation:${mode}:${signature}`)) {
        trackToolEvent("tool_complete", { tool, task_type: "calculation", calculation_mode: mode });
      }
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [signature, tool, mode, revision]);
  return {
    changed,
    preset,
    cancel,
    imageRead: (localIdentity: string) => {
      markFirstInteract("image");
      cancel();
      if (record(completed.current, `image:${localIdentity}`)) {
        trackToolEvent("tool_complete", {
          tool,
          task_type: "image_read",
          calculation_mode: mode === "frame" || mode === "annotate" ? mode : "ratio",
        });
      }
    },
    imageExport: (localIdentity: string) => {
      if (record(completed.current, `export:${mode}:${localIdentity}`)) {
        trackToolEvent("tool_complete", {
          tool,
          task_type: "image_export",
          calculation_mode: mode,
        });
      }
    },
    copy: (localIdentity: string) => {
      if (record(copied.current, `${mode}:${localIdentity}`)) {
        trackToolEvent("result_copy", {
          tool,
          task_type: mode === "frame" || mode === "annotate" ? "image_export" : "calculation",
          calculation_mode: mode,
        });
      }
    },
  };
}
