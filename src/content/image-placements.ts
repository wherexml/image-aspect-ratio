// Sourced image-placement guidance shown on /social-media (TASK-29). Guidance only: no export or apply action.
// Recommendations, minimums and rounded labels stay separate; unknown values are null, never inferred.
// Visible strings are the reviewed copy in reports/2026-11-07/task29-development/copy-reviewed.md.

export const PLACEMENTS_CHECKED = "2026-11-07";

export type ImagePlacement = {
  id: "youtube-video-thumbnail" | "youtube-shorts-thumbnail" | "instagram-feed-photo" | "instagram-reel-cover";
  platform: "YouTube" | "Instagram";
  placement: string;
  mediaType: "image";
  /** Single recommended size, or null when the source gives a range. */
  recommended: { width: number; height: number } | null;
  /** Feed-style ranges: example width with its height range, plus the retained width range. */
  range: { width: number; heightMin: number; heightMax: number; retainedWidthMin: number; retainedWidthMax: number } | null;
  minimum: { width: number | null; height: number | null } | null;
  /** Exact reduced ratio when the dimensions define one; null for rounded-label ranges. */
  exactRatio: [number, number] | null;
  /** Ratio labels as published (rounded/approximate); never treated as exact. */
  publishedRatio: string | null;
  fileLimitsMB: { desktop: number | null; mobile: number | null } | null;
  dimensions: string;
  ratio: string;
  source: string;
  checkedAt: string;
};

const YOUTUBE = "https://support.google.com/youtube/answer/72431?hl=en";

export const IMAGE_PLACEMENTS: ImagePlacement[] = [
  {
    id: "youtube-video-thumbnail", platform: "YouTube", placement: "YouTube video thumbnail", mediaType: "image",
    recommended: { width: 3840, height: 2160 }, range: null, minimum: { width: 640, height: null },
    exactRatio: [16, 9], publishedRatio: "16:9", fileLimitsMB: { desktop: 50, mobile: 2 },
    dimensions: "3840 × 2160", ratio: "16:9", source: YOUTUBE, checkedAt: PLACEMENTS_CHECKED,
  },
  {
    id: "youtube-shorts-thumbnail", platform: "YouTube", placement: "YouTube Shorts thumbnail", mediaType: "image",
    recommended: { width: 2160, height: 3840 }, range: null, minimum: { width: null, height: 640 },
    // The cited source does not establish a mobile Shorts limit; keep it unknown.
    exactRatio: [9, 16], publishedRatio: "9:16", fileLimitsMB: { desktop: 50, mobile: null },
    dimensions: "2160 × 3840", ratio: "9:16", source: YOUTUBE, checkedAt: PLACEMENTS_CHECKED,
  },
  {
    id: "instagram-feed-photo", platform: "Instagram", placement: "Instagram feed photo", mediaType: "image",
    recommended: null, range: { width: 1080, heightMin: 566, heightMax: 1440, retainedWidthMin: 320, retainedWidthMax: 1080 },
    minimum: null,
    // 1.91:1 is a rounded label; 1080 × 566 is not exactly 1.91:1, so no exact ratio is stored.
    exactRatio: null, publishedRatio: "1.91:1 to 3:4", fileLimitsMB: null,
    dimensions: "1080 px wide; 566–1440 px high", ratio: "1.91:1 to 3:4",
    source: "https://help.instagram.com/1631821640426723", checkedAt: PLACEMENTS_CHECKED,
  },
  {
    id: "instagram-reel-cover", platform: "Instagram", placement: "Instagram Reel cover", mediaType: "image",
    recommended: { width: 420, height: 654 }, range: null, minimum: null,
    // 420:654 reduces to 70:109; Instagram's 1:1.55 is approximate.
    exactRatio: [70, 109], publishedRatio: "1:1.55", fileLimitsMB: null,
    dimensions: "420 × 654", ratio: "70:109",
    source: "https://help.instagram.com/1038071743007909", checkedAt: PLACEMENTS_CHECKED,
  },
];

/** Reviewed details prose grouped by source; each group cites exactly one source URL. */
export const PLACEMENT_DETAILS: { title: string; text: string; source: string }[] = [
  {
    title: "YouTube thumbnails",
    text: "The table lists recommendations, not minimums. Minimums are 640 px wide for video thumbnails and 640 px high for Shorts thumbnails. YouTube lists JPG and PNG. Desktop uploads allow up to 50 MB for video, Shorts, and podcast thumbnails. Mobile limits are 2 MB for video thumbnails and 10 MB for podcasts; this table does not establish a mobile Shorts limit. Custom Shorts thumbnails are described for verified accounts in desktop YouTube Studio.",
    source: YOUTUBE,
  },
  {
    title: "Instagram feed photos",
    text: "Instagram describes photos 320–1080 px wide with ratios from 1.91:1 to 3:4 (566–1440 px high at 1080 px wide). The table shows a range, not one required portrait size, and pixel rounding makes 1080 × 566 slightly off 1.91:1. Unsupported shapes are cropped, smaller images are enlarged, and larger images are reduced. Feed upload guidance does not define the profile-grid crop, ads, or API publishing requirements.",
    source: "https://help.instagram.com/1631821640426723",
  },
  {
    title: "Instagram Reel covers",
    text: "Instagram recommends 420 × 654 px and lists an approximate ratio of 1:1.55 (exact ratio 70:109). A cover image is separate from the Reel video canvas and its profile-grid presentation. The help page currently states that covers cannot be edited after upload, so check the current publishing interface before posting.",
    source: "https://help.instagram.com/1038071743007909",
  },
];
