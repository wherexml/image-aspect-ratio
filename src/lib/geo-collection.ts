// Private bindings exist only in the deployed Worker, never in browser assets.
type GeoEnv = { GEO_RELAY_KEY?: string; GEO_SOURCE_TOKEN?: string };
type GeoContext = { waitUntil?: (promise: Promise<unknown>) => void };
const origin = "https://imageaspectratio.com";
const relay = "https://llm.tothemars.top/_geoinflow";
const website = "0e360655-0b8c-4334-98dd-99634b96d0c0";
const source = "669a374d-1513-450f-b104-1e95b96745cc";
const ALLOWED_EVENTS = new Set([
  "tool_complete",
  "result_copy",
  "page_engaged_15s",
  "scroll_depth",
  "tool_first_interact",
  "preset_select",
  "nav_tool_switch",
]);
const ALLOWED_EVENT_FIELDS = [
  "tool",
  "task_type",
  "calculation_mode",
  "page_type",
  "depth",
  "action_type",
  "preset",
  "from_path",
  "to_path",
  "nav_surface",
  "ui_ver",
] as const;
let lastHeartbeat = 0;

function configured(request: Request, env: GeoEnv) {
  return new URL(request.url).origin === origin && "cf" in request && !!env.GEO_RELAY_KEY;
}

function headers(request: Request, env: GeoEnv) {
  return new Headers({
    "X-Geo-Relay": env.GEO_RELAY_KEY!,
    "X-Geo-Client-IP": request.headers.get("CF-Connecting-IP") || "",
    "User-Agent": request.headers.get("User-Agent") || "",
    "Origin": origin,
  });
}

const ALLOWED_ATTRIBUTION_QUERY = ["utm_source", "utm_medium", "utm_campaign"] as const;
const ATTRIBUTION_VALUE_RE = /^[a-zA-Z0-9._-]{1,64}$/;

function cleanUrl(value: unknown) {
  if (typeof value !== "string" || value === "") return value;
  try {
    const u = new URL(value, origin);
    return u.origin === origin ? u.pathname : u.origin + u.pathname;
  } catch { return ""; }
}

function cleanPageUrl(value: unknown) {
  if (typeof value !== "string" || value === "") return value;
  try {
    const u = new URL(value, origin);
    if (u.origin !== origin) return u.origin + u.pathname;
    const kept = new URLSearchParams();
    for (const key of ALLOWED_ATTRIBUTION_QUERY) {
      const val = u.searchParams.get(key);
      if (val && ATTRIBUTION_VALUE_RE.test(val)) {
        kept.set(key, val);
      }
    }
    const qs = kept.toString();
    return qs ? `${u.pathname}?${qs}` : u.pathname;
  } catch { return ""; }
}

export async function geoCollection(request: Request, rawEnv: unknown): Promise<Response | null> {
  const path = new URL(request.url).pathname;
  if (!path.startsWith("/_geo/")) return null;
  const env = rawEnv as GeoEnv;
  if (!configured(request, env)) return new Response(null, { status: 404 });
  const script = path === "/_geo/script.js" && request.method === "GET";
  const send = path === "/_geo/api/send" && request.method === "POST";
  if (!script && !send) return new Response(null, { status: 404 });
  const h = headers(request, env);
  let body: string | undefined;
  if (send) {
    if (request.headers.get("origin") !== origin) return new Response(null, { status: 403 });
    if (!request.headers.get("content-type")?.startsWith("application/json")) return new Response(null, { status: 415 });
    // Bound streamed bodies too; Content-Length is not trusted.
    const reader = request.body?.getReader();
    if (!reader) return new Response(null, { status: 400 });
    const chunks: Uint8Array[] = []; let size = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 16384) { await reader.cancel(); return new Response(null, { status: 413 }); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    try {
      const input = JSON.parse(new TextDecoder().decode(bytes));
      const p = input.payload;
      if (input.type !== "event" || p?.website !== website || p.hostname !== "imageaspectratio.com" || p.link || p.pixel)
        return new Response(null, { status: 400 });
      const evName = p.name === undefined || p.name === "" ? null : p.name;
      if (evName !== null && (typeof evName !== "string" || !ALLOWED_EVENTS.has(evName))) {
        return new Response(null, { status: 400 });
      }
      const payload: Record<string, unknown> = {};
      for (const key of ["website", "eventId", "webdriver", "hostname", "language", "screen", "title", "url", "referrer"])
        if (p[key] !== undefined) payload[key] = p[key];
      payload['url'] = cleanPageUrl(payload['url']);
      payload['referrer'] = cleanUrl(payload['referrer']);
      if (evName) {
        payload['name'] = evName;
        const eventData: Record<string, string | number> = {};
        const rawData = p.data && typeof p.data === "object" && !Array.isArray(p.data)
          ? (p.data as Record<string, unknown>)
          : null;
        if (rawData) {
          for (const field of ALLOWED_EVENT_FIELDS) {
            const val = rawData[field];
            if (typeof val === "string" && val.length > 0 && val.length <= 80) {
              eventData[field] = val;
            } else if (typeof val === "number" && Number.isFinite(val)) {
              eventData[field] = val;
            }
          }
        }
        payload['data'] = eventData;
      }
      body = JSON.stringify({ type: "event", payload });
    } catch { return new Response(null, { status: 400 }); }
    h.set("Content-Type", "application/json");
    const cache = request.headers.get("x-umami-cache");
    if (cache && cache.length < 4096) h.set("x-umami-cache", cache);
  }
  try {
    const response = await fetch(relay + (script ? "/script.js" : "/api/send"), {
      method: request.method, headers: h, body: body ?? null, redirect: "manual", signal: AbortSignal.timeout(10000),
    });
    return new Response(response.body, { status: response.status, headers: {
      "Content-Type": response.headers.get("content-type") || "application/octet-stream",
      "Cache-Control": script && response.ok ? "public, max-age=300" : "no-store",
      "X-Content-Type-Options": "nosniff",
    } });
  } catch { return new Response(null, { status: 503, headers: { "Cache-Control": "no-store" } }); }
}

export function recordGeoRequest(request: Request, response: Response, rawEnv: unknown, rawContext: unknown) {
  const env = rawEnv as GeoEnv;
  const ctx = rawContext as GeoContext;
  const url = new URL(request.url);
  if (!configured(request, env) || !env.GEO_SOURCE_TOKEN || !ctx?.waitUntil ||
      !["GET", "HEAD"].includes(request.method) || url.pathname.startsWith("/_geo/") ||
      url.searchParams.get("analytics_test") === "1" ||
      (!response.headers.get("content-type")?.includes("text/html") && !["/sitemap.xml", "/robots.txt"].includes(url.pathname))) return;
  const ip = request.headers.get("CF-Connecting-IP");
  if (!ip || !/^[0-9a-fA-F:.]+$/.test(ip)) return;
  const safe = (value: string) => value.replace(/["\\\x00-\x1f\x7f]/g, "_").slice(0, 1000);
  const now = new Date();
  const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][now.getUTCMonth()];
  const stamp = `${String(now.getUTCDate()).padStart(2, "0")}/${month}/${now.getUTCFullYear()}:${now.toISOString().slice(11, 19)} +0000`;
  const line = `${ip} - - [${stamp}] "${request.method} ${safe(url.pathname)} HTTP/1.1" ${response.status} - "-" "${safe(request.headers.get("User-Agent") || "")}"`;
  const h = headers(request, env);
  h.set("Authorization", "Bearer " + env.GEO_SOURCE_TOKEN);
  h.set("Content-Type", "application/json");
  const send = async (suffix: string, value: unknown) => {
    const r = await fetch(`${relay}/api/liekan/log-sources/${source}/${suffix}`, {
      method: "POST", headers: h, body: JSON.stringify(value), redirect: "manual", signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) { await r.body?.cancel(); throw new Error(`GEO ${suffix}: HTTP ${r.status}`); }
    await r.body?.cancel();
  };
  ctx.waitUntil((async () => {
    if (Date.now() - lastHeartbeat > 60000) {
      await send("heartbeat", { version: "aspect-ratio-worker/1", pending: 0, bytes: 0, gap: true, errorCode: "none" });
      lastHeartbeat = Date.now();
    }
    await send("batches", { version: 1, batchId: crypto.randomUUID(), epoch: 1,
      events: [{ generation: crypto.randomUUID(), offset: 0, line }] });
  })().catch(error => console.warn(error instanceof Error ? error.message : "GEO delivery failed")));
}
