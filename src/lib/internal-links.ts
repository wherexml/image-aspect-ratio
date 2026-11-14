import type { SitePath } from "./site";

/** Crawlable in-app link. Hash is a same-page anchor, without a leading #. */
export type InternalLink = { to: SitePath; hash?: string; label: string };

/**
 * Shared footer groups. Together they name every indexable route.
 * Info pages have no calculator navigation, so the calculator must be here.
 */
export const footerToolLinks: InternalLink[] = [
  { to: "/", label: "Image Aspect Ratio" },
  { to: "/calculator", label: "Aspect ratio calculator" },
  { to: "/video-aspect-ratio", label: "Video ratio calculator" },
  { to: "/ultrawide-aspect-ratio-calculator", label: "Ultrawide calculator" },
  { to: "/what-is-aspect-ratio", label: "What is aspect ratio?" },
  { to: "/exact-fractions-vs-rounded-pixels", label: "Exact fractions vs rounded pixels" },
];

export const footerSocialLinks: InternalLink[] = [
  { to: "/social-media", label: "All social media sizes" },
  { to: "/tiktok-aspect-ratio", label: "TikTok aspect ratio" },
  { to: "/youtube-aspect-ratio", label: "YouTube aspect ratio" },
  { to: "/youtube-shorts-aspect-ratio", label: "YouTube Shorts aspect ratio" },
  { to: "/instagram-reel-aspect-ratio", label: "Instagram Reel aspect ratio" },
  { to: "/instagram-story-aspect-ratio", label: "Instagram Story aspect ratio" },
];

export const footerInfoLinks: InternalLink[] = [
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/privacy", label: "Privacy" },
  { to: "/terms", label: "Terms" },
];

export function footerInternalLinks(): InternalLink[] {
  return [...footerToolLinks, ...footerSocialLinks, ...footerInfoLinks];
}

/**
 * Next step after a page that already shows 16:9 and 9:16.
 * Image frames are Widescreen and Story; video frames are a widescreen display and a vertical phone;
 * the calculator chooser lists both ratios as tasks.
 */
export function frameFollowUpLinks(surface: "image" | "video" | "calculator"): InternalLink[] {
  if (surface === "image") {
    return [
      { to: "/youtube-aspect-ratio", label: "Widescreen 16:9 on YouTube" },
      { to: "/social-media", label: "Story 9:16 on social media" },
    ];
  }
  if (surface === "video") {
    return [
      { to: "/youtube-aspect-ratio", label: "16:9 YouTube video sizes" },
      { to: "/social-media", label: "Vertical 9:16 social sizes" },
    ];
  }
  return [
    { to: "/youtube-aspect-ratio", label: "YouTube 16:9 video sizes" },
    { to: "/social-media", label: "9:16 sizes for Reels, Stories, Shorts and TikTok" },
  ];
}

/** Placed after the guide's common-ratio section. The section text itself stays unchanged. */
export const guideCommonRatioLinks: InternalLink[] = [
  { to: "/youtube-aspect-ratio", label: "16:9 YouTube sizes" },
  { to: "/social-media", label: "9:16 social sizes" },
  { to: "/ultrawide-aspect-ratio-calculator", label: "Check an ultrawide ratio" },
];

/** Social pages discuss keeping a photo or cropping to fill; the guide explains those choices. */
export const fitFillGuideLink: InternalLink & { hash: string } = {
  to: "/what-is-aspect-ratio",
  hash: "crop-fit-stretch",
  label: "Fit, fill and stretch",
};
