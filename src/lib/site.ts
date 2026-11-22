export const SITE_PAGES = ["/", "/calculator", "/16-9-aspect-ratio-calculator", "/make-image-square", "/change-image-aspect-ratio", "/screenshot-beautifier", "/social-media", "/video-aspect-ratio", "/ultrawide-aspect-ratio-calculator", "/what-is-aspect-ratio", "/exact-fractions-vs-rounded-pixels", "/tiktok-aspect-ratio", "/youtube-aspect-ratio", "/instagram-reel-aspect-ratio", "/instagram-story-aspect-ratio", "/youtube-shorts-aspect-ratio", "/about", "/contact", "/privacy", "/terms"] as const;
export type SitePath = typeof SITE_PAGES[number];

/**
 * New canonical root paths ready to be merged into SITE_PAGES once V3 routes are
 * promoted from /v3/* to root. Kept separate from SITE_PAGES so sitemap.xml never
 * advertises unpromoted /v3/* preview URLs or 404 root paths.
 */
export const V3_NEW_CANONICAL_PAGES = [
  "/add-padding-to-image",
  "/fit-photo-to-instagram",
  "/round-corners-image",
  "/instagram-grid-splitter",
  "/safe-zone-checker",
  "/og-image-safe-zone",
  "/blur-screenshot",
  "/annotate-screenshot",
] as const;
export type V3NewCanonicalPath = typeof V3_NEW_CANONICAL_PAGES[number];
export type CanonicalPath = SitePath | V3NewCanonicalPath;

/** Canonical V3 preview paths for trailing-slash 308 normalization (excludes consolidated aliases). */
export const V3_PREVIEW_PAGES = [
  "/v3",
  "/v3/make-image-square",
  "/v3/change-image-aspect-ratio",
  "/v3/add-padding-to-image",
  "/v3/fit-photo-to-instagram",
  "/v3/round-corners-image",
  "/v3/instagram-grid-splitter",
  "/v3/safe-zone-checker",
  "/v3/og-image-safe-zone",
  "/v3/screenshot-beautifier",
  "/v3/blur-screenshot",
  "/v3/annotate-screenshot",
  "/v3/calculator",
  "/v3/video-aspect-ratio",
] as const;

/** Promotion map from /v3/* preview routes to their production canonical path. */
export const V3_PROMOTION_MAP: Record<string, CanonicalPath> = {
  "/v3": "/",
  "/v3/image-aspect-ratio": "/",
  "/v3/make-image-square": "/make-image-square",
  "/v3/change-image-aspect-ratio": "/change-image-aspect-ratio",
  "/v3/add-padding-to-image": "/add-padding-to-image",
  "/v3/fit-photo-to-instagram": "/fit-photo-to-instagram",
  "/v3/round-corners-image": "/round-corners-image",
  "/v3/instagram-grid-splitter": "/instagram-grid-splitter",
  "/v3/safe-zone-checker": "/safe-zone-checker",
  "/v3/og-image-safe-zone": "/og-image-safe-zone",
  "/v3/screenshot-beautifier": "/screenshot-beautifier",
  "/v3/blur-screenshot": "/blur-screenshot",
  "/v3/pixelate-image": "/blur-screenshot",
  "/v3/annotate-screenshot": "/annotate-screenshot",
  "/v3/calculator": "/calculator",
  "/v3/video-aspect-ratio": "/video-aspect-ratio",
};

export const SITE_LABELS: Record<SitePath, string> = {
  "/": "Image ratio",
  "/calculator": "Calculator",
  "/16-9-aspect-ratio-calculator": "16:9 calculator",
  "/make-image-square": "Make image square",
  "/change-image-aspect-ratio": "Change image aspect ratio",
  "/screenshot-beautifier": "Screenshot Beautifier",
  "/social-media": "Social Media",
  "/video-aspect-ratio": "Video ratio",
  "/ultrawide-aspect-ratio-calculator": "Ultrawide ratio",
  "/what-is-aspect-ratio": "Aspect ratio guide",
  "/exact-fractions-vs-rounded-pixels": "Exact fractions vs pixels",
  "/tiktok-aspect-ratio": "TikTok aspect ratio",
  "/youtube-aspect-ratio": "YouTube aspect ratio",
  "/instagram-reel-aspect-ratio": "Instagram Reel aspect ratio",
  "/instagram-story-aspect-ratio": "Instagram Story aspect ratio",
  "/youtube-shorts-aspect-ratio": "YouTube Shorts aspect ratio",
  "/about": "About",
  "/contact": "Contact",
  "/privacy": "Privacy",
  "/terms": "Terms",
};

export const V3_CANONICAL_LABELS: Record<V3NewCanonicalPath, string> = {
  "/add-padding-to-image": "Add padding & border",
  "/fit-photo-to-instagram": "Fit photo to Instagram",
  "/round-corners-image": "Round corners & circle",
  "/instagram-grid-splitter": "Instagram 3:4 grid splitter",
  "/safe-zone-checker": "Safe zone checker",
  "/og-image-safe-zone": "OG image safe zone tester",
  "/blur-screenshot": "Blur & pixelate screenshot",
  "/annotate-screenshot": "Annotate screenshot",
};

export const ALL_CANONICAL_LABELS: Record<CanonicalPath, string> = {
  ...SITE_LABELS,
  ...V3_CANONICAL_LABELS,
};

export type SiteConfig = { origin: string | null; indexable: boolean };

/** Public build-time values only. Never derive canonical URLs from request Host. */
export function parseSiteConfig(env: Record<string, string | undefined>): SiteConfig {
  const raw = env["VITE_SITE_URL"]?.trim() || "";
  const flag = env["VITE_SITE_INDEXABLE"]?.trim() || "false";
  if (flag !== "false" && flag !== "true") throw new Error("VITE_SITE_INDEXABLE must be true or false");
  let origin: string | null = null;
  if (raw) {
    const url = new URL(raw);
    if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash || url.pathname !== "/" || url.port || !url.hostname.includes(".") || /^(localhost|127\.|0\.|\[)/.test(url.hostname) || url.hostname.endsWith(".localhost")) {
      throw new Error("VITE_SITE_URL must be a public HTTPS origin without credentials, port, path, query or fragment");
    }
    origin = url.origin;
  }
  if (flag === "true" && !origin) throw new Error("An indexable site requires VITE_SITE_URL");
  return { origin, indexable: flag === "true" };
}

export const site = parseSiteConfig({
  VITE_SITE_URL: import.meta.env?.["VITE_SITE_URL"],
  VITE_SITE_INDEXABLE: import.meta.env?.["VITE_SITE_INDEXABLE"],
});
export const robotsDirective = (config: SiteConfig = site) => config.indexable ? "index, follow" : "noindex, nofollow";
export const canonicalUrl = (path: CanonicalPath, config: SiteConfig = site) => config.origin ? `${config.origin}${path}` : null;
const xmlEscape = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
export function sitemapXml(config: SiteConfig = site) {
  const urls = config.indexable && config.origin ? SITE_PAGES.map(path => `  <url><loc>${xmlEscape(canonicalUrl(path, config)!)}</loc></url>`).join("\n") : "";
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
export function robotsTxt(config: SiteConfig = site) {
  return `User-agent: *\nAllow: /\n${config.origin ? `\nSitemap: ${config.origin}/sitemap.xml\n` : ""}`;
}

export const isSocialDetail = (path: CanonicalPath) => ["/tiktok-aspect-ratio", "/youtube-aspect-ratio", "/instagram-reel-aspect-ratio", "/instagram-story-aspect-ratio", "/youtube-shorts-aspect-ratio"].includes(path);
