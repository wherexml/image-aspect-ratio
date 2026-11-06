import { canonicalUrl, robotsDirective, isSocialDetail, SITE_LABELS, type SitePath } from "./site";

export const REPOSITORY_URL = "https://github.com/wherexml/image-aspect-ratio";
export const MAINTAINER = { "@type": "Person", name: "wherexml", url: "https://github.com/wherexml" };
// Actual content review date; never derive this from build time.
export const CONTENT_UPDATED = "2026-10-24";

export const SITE_NAME = "Image Aspect Ratio Calculator";

// Shared social preview image in public/ (1733×908 PNG).
const OG_IMAGE = { path: "/og-image.png", width: "1733", height: "908", type: "image/png" };
// Absolute with a configured origin, as Open Graph expects; root-relative otherwise.
const ogImageUrl = () => { const home = canonicalUrl("/"); return home ? new URL(OG_IMAGE.path, home).href : OG_IMAGE.path; };

/** Shared SSR/client metadata from explicitly configured public site settings. */
export function previewSeoMeta(title: string, description: string, path: SitePath) {
  return [
    { title },
    { name: "description", content: description },
    { name: "author", content: MAINTAINER.name },
    { name: "robots", content: robotsDirective() },
    ...(canonicalUrl(path) ? [{ property: "og:url", content: canonicalUrl(path)! }] : []),
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: ogImageUrl() },
    { property: "og:image:type", content: OG_IMAGE.type },
    { property: "og:image:width", content: OG_IMAGE.width },
    { property: "og:image:height", content: OG_IMAGE.height },
    { property: "og:image:alt", content: SITE_NAME },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImageUrl() },
    { name: "twitter:image:alt", content: SITE_NAME },
  ];
}

export function seoLinks(path: SitePath) {
  const url = canonicalUrl(path);
  return url ? [{ rel: "canonical", href: url }] : [];
}

/** Only facts shown on the page; omit identity URLs until an origin is configured. */
export function seoScripts(title: string, description: string, path: SitePath, tool = true, updated = CONTENT_UPDATED) {
  const url = canonicalUrl(path);
  const home = canonicalUrl("/");
  const breadcrumb = url && path !== "/" ? {
    "@type": "BreadcrumbList", "@id": `${url}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: SITE_LABELS["/"], item: home },
      ...(isSocialDetail(path) ? [{ "@type": "ListItem", position: 2, name: "Social Media", item: canonicalUrl("/social-media") }] : []),
      { "@type": "ListItem", position: isSocialDetail(path) ? 3 : 2, name: SITE_LABELS[path], item: url },
    ],
  } : null;
  const graph: Record<string, unknown>[] = [
    { "@type": "WebSite", name: SITE_NAME, alternateName: "Image Aspect Ratio", inLanguage: "en", sameAs: [REPOSITORY_URL], author: MAINTAINER, ...(home ? { "@id": `${home}#website`, url: home } : {}) },
    { "@type": tool ? "WebApplication" : "WebPage", name: title, description, inLanguage: "en", author: MAINTAINER, dateModified: updated,
      ...(url ? { "@id": `${url}#${tool ? "app" : "page"}`, url } : {}),
      ...(!tool && home ? { isPartOf: { "@id": `${home}#website` } } : {}),
      ...(!tool && breadcrumb ? { breadcrumb: { "@id": breadcrumb["@id"] } } : {}),
      ...(tool ? {
        applicationCategory: "UtilitiesApplication", operatingSystem: "Any",
        browserRequirements: "Requires JavaScript and a modern web browser",
        isAccessibleForFree: true, offers: { "@type": "Offer", price: 0 },
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
