export const SITE_PAGES = ["/", "/calculator", "/social-media", "/video-aspect-ratio", "/ultrawide-aspect-ratio-calculator", "/what-is-aspect-ratio", "/exact-fractions-vs-rounded-pixels", "/tiktok-aspect-ratio", "/youtube-aspect-ratio", "/instagram-reel-aspect-ratio", "/instagram-story-aspect-ratio", "/youtube-shorts-aspect-ratio", "/about", "/contact", "/privacy", "/terms"] as const;
export type SitePath = typeof SITE_PAGES[number];
export const SITE_LABELS: Record<SitePath, string> = {
  "/": "Image ratio",
  "/calculator": "Calculator",
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
export const canonicalUrl = (path: SitePath, config: SiteConfig = site) => config.origin ? `${config.origin}${path}` : null;
const xmlEscape = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
export function sitemapXml(config: SiteConfig = site) {
  const urls = config.indexable && config.origin ? SITE_PAGES.map(path => `  <url><loc>${xmlEscape(canonicalUrl(path, config)!)}</loc></url>`).join("\n") : "";
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
export function robotsTxt(config: SiteConfig = site) {
  return `User-agent: *\nAllow: /\n${config.origin ? `\nSitemap: ${config.origin}/sitemap.xml\n` : ""}`;
}

export const isSocialDetail = (path: SitePath) => ["/tiktok-aspect-ratio", "/youtube-aspect-ratio", "/instagram-reel-aspect-ratio", "/instagram-story-aspect-ratio", "/youtube-shorts-aspect-ratio"].includes(path);
