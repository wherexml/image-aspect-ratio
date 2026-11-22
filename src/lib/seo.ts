import { canonicalUrl, robotsDirective, isSocialDetail, ALL_CANONICAL_LABELS, type CanonicalPath, type SiteConfig, site } from "./site";

export const REPOSITORY_URL = "https://github.com/wherexml/image-aspect-ratio";
export const MAINTAINER = { "@type": "Person", name: "wherexml", url: "https://github.com/wherexml" };
// Actual content review date; never derive this from build time.
export const CONTENT_UPDATED = "2026-11-22";

export const SITE_NAME = "Image Aspect Ratio Calculator";

// Shared social preview image in public/ (1200×630 optimized PNG, <180 KB for WhatsApp parity).
const OG_IMAGE = { path: "/og-image.png", width: "1200", height: "630", type: "image/png" };
// Absolute with a configured origin, as Open Graph expects; root-relative otherwise.
const ogImageUrl = (config: SiteConfig = site) => {
  const home = canonicalUrl("/", config);
  return home ? new URL(OG_IMAGE.path, home).href : OG_IMAGE.path;
};

export type SeoMetaOptions = {
  /** Force noindex, nofollow on preview routes (/v3/*) even when VITE_SITE_INDEXABLE=true. */
  forceNoindex?: boolean;
  config?: SiteConfig;
};

/** Shared SSR/client metadata from explicitly configured public site settings. */
export function seoMeta(
  title: string,
  description: string,
  path: CanonicalPath,
  options?: SeoMetaOptions,
) {
  const config = options?.config ?? site;
  const canonical = canonicalUrl(path, config);
  const image = ogImageUrl(config);
  const robots = options?.forceNoindex ? "noindex, nofollow" : robotsDirective(config);
  return [
    { title },
    { name: "description", content: description },
    { name: "author", content: MAINTAINER.name },
    { name: "robots", content: robots },
    ...(canonical ? [{ property: "og:url", content: canonical }] : []),
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: image },
    { property: "og:image:type", content: OG_IMAGE.type },
    { property: "og:image:width", content: OG_IMAGE.width },
    { property: "og:image:height", content: OG_IMAGE.height },
    { property: "og:image:alt", content: SITE_NAME },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
    { name: "twitter:image:alt", content: SITE_NAME },
  ];
}

/** Backwards-compatible alias used across existing V1 routes. */
export const previewSeoMeta = seoMeta;

export function seoLinks(path: CanonicalPath, config: SiteConfig = site) {
  const url = canonicalUrl(path, config);
  return url ? [{ rel: "canonical", href: url }] : [];
}

/** Only facts shown on the page; omit identity URLs until an origin is configured. */
export function seoScripts(title: string, description: string, path: CanonicalPath, tool = true, updated = CONTENT_UPDATED) {
  const url = canonicalUrl(path);
  const home = canonicalUrl("/");
  const breadcrumb = url && path !== "/" ? {
    "@type": "BreadcrumbList", "@id": `${url}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: ALL_CANONICAL_LABELS["/"], item: home },
      ...(isSocialDetail(path) ? [{ "@type": "ListItem", position: 2, name: "Social Media", item: canonicalUrl("/social-media") }] : []),
      { "@type": "ListItem", position: isSocialDetail(path) ? 3 : 2, name: ALL_CANONICAL_LABELS[path], item: url },
    ],
  } : null;
  // The application is named by the tool part of the title ("Tool — benefit"); the WebPage keeps the full title.
  const appName = title.split(" — ")[0]!;
  const graph: Record<string, unknown>[] = [
    { "@type": "WebSite", name: SITE_NAME, alternateName: "Image Aspect Ratio", inLanguage: "en", sameAs: [REPOSITORY_URL], author: MAINTAINER, ...(home ? { "@id": `${home}#website`, url: home } : {}) },
    { "@type": tool ? "WebApplication" : "WebPage", name: tool ? appName : title, description, inLanguage: "en", author: MAINTAINER, dateModified: updated,
      ...(url ? { "@id": `${url}#${tool ? "app" : "page"}`, url } : {}),
      ...(!tool && home ? { isPartOf: { "@id": `${home}#website` } } : {}),
      ...(!tool && breadcrumb ? { breadcrumb: { "@id": breadcrumb["@id"] } } : {}),
      ...(tool ? {
        applicationCategory: "UtilitiesApplication", operatingSystem: "Any",
        browserRequirements: "Requires JavaScript and a modern web browser",
        isAccessibleForFree: true, offers: { "@type": "Offer", price: 0, priceCurrency: "USD" },
        ...(url ? { mainEntityOfPage: { "@id": `${url}#page` } } : {}),
      } : {}),
    },
  ];
  if (tool) graph.push({
    "@type": "WebPage", name: title, description, inLanguage: "en", dateModified: updated,
    ...(url ? { "@id": `${url}#page`, url, mainEntity: { "@id": `${url}#app` } } : {}),
    ...(home ? { isPartOf: { "@id": `${home}#website` } } : {}),
    ...(breadcrumb ? { breadcrumb: { "@id": breadcrumb["@id"] } } : {}),
  });
  if (breadcrumb) graph.push(breadcrumb);
  return [{ type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c") }];
}
