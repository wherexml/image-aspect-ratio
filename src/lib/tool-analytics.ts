import { useCallback, useEffect, useRef, useState } from "react";
import { site } from "./site";

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
type Details = { tool: Tool; task_type: TaskType; calculation_mode: Mode };
type AnalyticsWindow = Window & { gtag?: (...args: unknown[]) => void };

/** Explicit QA events have separate names and never count as production key events. */
export function trackToolEvent(name: "tool_complete" | "result_copy", details: Details) {
  if (typeof window === "undefined") return;
  try {
    const flag = new URLSearchParams(location.search).get("analytics_test");
    let test = flag === "1";
    try {
      if (flag === "1" || flag === "0") sessionStorage.setItem("arc-analytics-test", flag);
      test = sessionStorage.getItem("arc-analytics-test") === "1";
    } catch {
      /* The explicit query flag still works when storage is blocked. */
    }
    const event = test ? `qa_${name}` : name;
    const params = { ...details, ...(test ? { debug_mode: true, test_traffic: "internal" } : {}) };
    if (test) {
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
    const isV2Preview = location.pathname === "/v2" || location.pathname.startsWith("/v2/");
    if (site.indexable && site.origin === location.origin && !isV2Preview) {
      (window as AnalyticsWindow).gtag?.("event", event, params);
    }
  } catch {
    // Measurement must never interrupt a user's task.
  }
}

/** Signatures stay in memory: no dimensions, ratios or filenames leave this hook. */
export function useToolTracking(tool: Tool, mode: Mode, signature: string | null) {
  const [revision, setRevision] = useState(0);
  const pending = useRef(false);
  const beforeEdit = useRef(signature);
  const completed = useRef(new Set<string>());
  const copied = useRef(new Set<string>());
  const record = (set: Set<string>, key: string) => {
    if (set.has(key)) return false;
    if (set.size >= 100) set.delete(set.values().next().value!);
    set.add(key);
    return true;
  };
  const changed = useCallback(() => {
    if (!pending.current) beforeEdit.current = signature;
    pending.current = true;
    setRevision((v) => v + 1);
  }, [signature]);
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
    cancel,
    imageRead: (localIdentity: string) => {
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
