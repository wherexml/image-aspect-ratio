export const SOCIAL_UPDATED = "2026-11-04";

export type SocialRatioPage = {
  path:
    | "/tiktok-aspect-ratio"
    | "/youtube-aspect-ratio"
    | "/instagram-reel-aspect-ratio"
    | "/instagram-story-aspect-ratio"
    | "/youtube-shorts-aspect-ratio";
  name: string;
  title: string;
  description: string;
  answer: string;
  sizes: { label: string; width: string; height: string }[];
  sections: { title: string; text: string; source?: number }[];
  questions: { question: string; answer: string }[];
  sources: { title: string; url: string }[];
};

const verticalSizes = [
  { label: "Vertical HD", width: "1080", height: "1920" },
  { label: "Smaller vertical", width: "720", height: "1280" },
  { label: "Larger vertical", width: "1440", height: "2560" },
];

export const SOCIAL_PAGES: SocialRatioPage[] = [
  {
    path: "/tiktok-aspect-ratio",
    name: "TikTok",
    title: "TikTok Aspect Ratio — 9:16 Sizes & Calculator",
    description:
      "Plan a 9:16 TikTok frame, calculate matching pixel dimensions, and understand cropping, padding and ad specifications before editing your video.",
    answer:
      "Use a 9:16 canvas for a full-height vertical TikTok edit. For example, 1080 × 1920 and 720 × 1280 have the same shape. Calculate a matching width or height below.",
    sizes: verticalSizes,
    sections: [
      {
        title: "Plan a vertical TikTok edit",
        text: "Start with a portrait canvas and position the subject for that frame before adding text. A 1080 × 1920 canvas is a working example here, rather than a claim that every TikTok placement requires those pixels.",
      },
      {
        title: "Organic videos and ad specifications",
        text: "TikTok's Non-Spark in-feed ad guide recommends 9:16 at a minimum of 540 × 960 pixels. It also lists square and horizontal options. These are placement-specific ad rules, not a universal rule for every organic upload.",
        source: 0,
      },
      {
        title: "Reframe a landscape clip",
        text: "A centered 9:16 crop from 1920 × 1080 keeps 607.5 × 1080 source pixels in ideal geometry, about 31.6% of the original area. An editor must round or resample the crop. Review each shot so a person near the edge is not lost.",
      },
      {
        title: "Keep captions away from interface controls",
        text: "Place essential text away from the edges and inspect the actual upload preview. For ads, use the safe-zone template for the selected placement; TikTok notes that caption length and additional formats affect it.",
        source: 0,
      },
    ],
    questions: [
      {
        question: "Is TikTok 9:16 or 16:9?",
        answer:
          "9:16 is portrait; 16:9 is landscape. Use 9:16 when preparing a vertical composition. The Non-Spark ad specifications also list 16:9 and 1:1, so do not treat the vertical recommendation as the only supported ad shape.",
      },
      {
        question: "Does changing 1920 × 1080 to 1080 × 1920 preserve the whole video?",
        answer:
          "No. Those shapes differ. Crop to fill the portrait frame or fit the complete landscape clip with space above and below. Stretching it distorts people and objects.",
      },
      {
        question: "Can this tool export a TikTok video?",
        answer:
          "It calculates dimensions only. Apply the result in your video editor; no video is uploaded, cropped or transcoded here.",
      },
    ],
    sources: [
      {
        title: "TikTok: Auction In-Feed Ads specifications and safe zones",
        url: "https://ads.tiktok.com/resources/help/article/tiktok-auction-in-feed-ads?lang=en",
      },
    ],
  },
  {
    path: "/youtube-aspect-ratio",
    name: "YouTube",
    title: "YouTube Aspect Ratio — 16:9 Sizes & Calculator",
    description:
      "Calculate 16:9 YouTube video dimensions for 1080p, 720p or 4K. Learn how the player handles other shapes and when to use a vertical Shorts canvas.",
    answer:
      "YouTube's standard player shape on a computer is 16:9. A 1920 × 1080 video matches it exactly. Other proportions are supported and the player adapts to the video and device.",
    sizes: [
      { label: "1080p", width: "1920", height: "1080" },
      { label: "720p", width: "1280", height: "720" },
      { label: "4K", width: "3840", height: "2160" },
    ],
    sections: [
      {
        title: "Choose dimensions for a landscape video",
        text: "For a 16:9 export, YouTube lists 1280 × 720, 1920 × 1080 and 3840 × 2160 among its resolutions. Resolution changes the pixel count; the proportions remain the same.",
        source: 0,
      },
      {
        title: "Let the player handle the frame",
        text: "YouTube adjusts its player to other shapes, including vertical video. Its guidance advises against baking padding or black bars into the file, because that limits how the player adapts.",
        source: 0,
      },
      {
        title: "Calculate a custom width precisely",
        text: "At 16:9, a width of 1001 pixels gives an exact height of 563.0625 pixels. A whole-pixel export rounds to 563 and changes the ratio slightly. The calculator labels rounding and keeps the exact fraction available.",
      },
      {
        title: "Separate landscape videos from Shorts",
        text: "A landscape edit and a vertical Short need different compositions. When repurposing a 16:9 shot for a 9:16 frame, check the crop shot by shot. Use the dedicated Shorts guide for vertical and square formats.",
      },
    ],
    questions: [
      {
        question: "Does every YouTube video have to be 16:9?",
        answer:
          "No. The standard desktop player is 16:9, but YouTube adapts to other video shapes. Choose the frame for your composition rather than stretching a different shape to fit.",
      },
      {
        question: "Are 1920 × 1080 and 3840 × 2160 the same ratio?",
        answer:
          "Yes. Both reduce to 16:9. The 4K example doubles both dimensions and contains four times as many pixels; enlarging a low-resolution source does not create new detail.",
      },
      {
        question: "Is this a YouTube thumbnail calculator?",
        answer:
          "This page plans video-frame dimensions. A thumbnail is a separate image asset; inspect its framing independently in your publishing workflow.",
      },
    ],
    sources: [
      {
        title: "YouTube Help: Video resolution & aspect ratios",
        url: "https://support.google.com/youtube/answer/6375112?hl=en",
      },
    ],
  },
  {
    path: "/instagram-reel-aspect-ratio",
    name: "Instagram Reel",
    title: "Instagram Reel Aspect Ratio — 9:16 Size Calculator",
    description:
      "Plan a 9:16 Instagram Reel at 1080 × 1920 or a matching size. Calculate dimensions and understand accepted shapes, cover framing and cropping.",
    answer:
      "For a full-height Instagram Reel composition, start with 9:16, such as 1080 × 1920. Instagram accepts a wider range of Reel shapes; a full-height edit is a composition choice within that range.",
    sizes: verticalSizes,
    sections: [
      {
        title: "Full-height framing and accepted shapes",
        text: "Instagram's Help Center lists Reel aspect ratios from 1.91:1 to 9:16, with at least 30 frames per second and a minimum resolution of 720 pixels. That accepted range is broader than the 9:16 canvas used here.",
        source: 0,
      },
      {
        title: "Size the video and cover separately",
        text: "Use the calculator for the video canvas. Review the cover and any profile or feed preview separately in Instagram: a good full-height composition can still need a different cover crop. Keep the face or product near the central area.",
      },
      {
        title: "Turn a wide shot into a Reel",
        text: "Fitting a 1920 × 1080 clip inside a 1080 × 1920 canvas produces a 1080 × 607.5 image in ideal geometry, leaving space above and below. Filling the canvas instead crops the sides. Choose the framing in an editor rather than stretching the clip.",
      },
      {
        title: "Check the sequence before publishing",
        text: "Keep subtitles, the subject and any closing message visible across every shot. Inspect the Reel inside Instagram before publishing; this mathematical frame diagram does not simulate interface overlays or the cover preview.",
      },
    ],
    questions: [
      {
        question: "Must an Instagram Reel be exactly 1080 × 1920?",
        answer:
          "No. That is a 9:16 planning example. Instagram's documented accepted aspect-ratio range is wider; confirm your export against its current upload requirements.",
      },
      {
        question: "Can I reuse a Story as a Reel?",
        answer:
          "A 9:16 asset keeps the same geometry, but review its cover, text placement and editing. Story stickers or controls are not part of the underlying video canvas.",
      },
      {
        question: "Does a 9:16 frame prevent all cropping?",
        answer:
          "No. Preview surfaces and cover crops can differ. Inspect the actual places where your Reel will appear, even if the exported video is exactly 9:16.",
      },
    ],
    sources: [
      {
        title: "Instagram Help Center: Reel size & aspect ratios",
        url: "https://www.facebook.com/help/instagram/1038071743007909",
      },
    ],
  },
  {
    path: "/instagram-story-aspect-ratio",
    name: "Instagram Story",
    title: "Instagram Story Aspect Ratio — 9:16 Size Calculator",
    description:
      "Calculate a 9:16 Instagram Story canvas for photos or video. Compare 1080 × 1920 and 1440 × 2560, plan framing, and distinguish ad specifications.",
    answer:
      "Plan an Instagram Story on a 9:16 portrait canvas. Examples include 1080 × 1920 and 1440 × 2560. Leave room for text and stickers when composing a photo or video.",
    sizes: verticalSizes,
    sections: [
      {
        title: "Build a Story canvas for photos or video",
        text: "A 9:16 shape is taller than it is wide. At 1080 pixels wide, the matching height is 1920. If you are arranging a photo, choose whether it should fill that canvas or sit within it with a background.",
      },
      {
        title: "Distinguish Story ads from organic Stories",
        text: "Meta's Instagram Stories image-ad guide recommends 9:16 at 1440 × 2560 pixels. This is an ad-placement recommendation. The 1080 × 1920 example here demonstrates the same geometry; it is not presented as that guide's recommended resolution.",
        source: 0,
      },
      {
        title: "Keep a complete photo or crop to fill",
        text: "A 1200 × 800 photo fits inside a 1080 × 1920 Story as 1080 × 720, leaving 600 pixels above and below when centered. Filling the canvas keeps a centered 450 × 800 crop of the source, retaining 37.5% of its area.",
      },
      {
        title: "Make space for Story interactions",
        text: "Keep key text away from the canvas edges and check the actual Story preview after adding stickers or links. Ad interfaces have their own overlays; use the placement's current safe-zone guidance when preparing a paid creative.",
        source: 0,
      },
    ],
    questions: [
      {
        question: "What is the difference between Story ratio and Story size?",
        answer:
          "9:16 describes the shape. 1080 × 1920 describes the pixel dimensions. A 1440 × 2560 canvas is larger but has exactly the same ratio.",
      },
      {
        question: "Can a landscape photo fit in a Story without losing its edges?",
        answer:
          "Yes, if you fit the whole photo within the portrait canvas and keep the remaining space. Filling the complete canvas with a landscape photo requires a crop.",
      },
      {
        question: "Can this calculator create a Story image?",
        answer:
          "It returns dimensions, not an image file. Use the image ratio tool to inspect a local photo and preview framing, then make the final canvas in an editor.",
      },
    ],
    sources: [
      {
        title: "Meta Ads Guide: Instagram Stories image specifications",
        url: "https://www.facebook.com/business/ads-guide/update/image/instagram-story",
      },
    ],
  },
  {
    path: "/youtube-shorts-aspect-ratio",
    name: "YouTube Shorts",
    title: "YouTube Shorts Aspect Ratio — Vertical & Square Sizes",
    description:
      "Calculate a 9:16 YouTube Shorts canvas or compare a square format. See matching dimensions, landscape crop tradeoffs, and current Shorts classification guidance.",
    answer:
      "Use 9:16 for a tall YouTube Short, for example 1080 × 1920. Square videos can also qualify as Shorts: 9:16 is not the only eligible shape.",
    sizes: [
      verticalSizes[0]!,
      verticalSizes[1]!,
      { label: "Square comparison", width: "1080", height: "1080" },
    ],
    sections: [
      {
        title: "Vertical framing and Shorts eligibility",
        text: "For standard channels, YouTube categorizes square or vertical videos uploaded on or after October 15, 2024 as Shorts when they are up to three minutes long. Official Artist Channels have a separate cutoff date of December 8, 2025.",
        source: 0,
      },
      {
        title: "Compare a square and a tall canvas",
        text: "A 1080 × 1080 square is 1:1, while 1080 × 1920 is 9:16. Use the size buttons to compare the geometry. The portrait version has more room above and below a centered subject; the square version may need a different composition.",
      },
      {
        title: "Reframe a landscape video for a Short",
        text: "To fill a 9:16 frame from 1920 × 1080 footage, a centered crop retains about 31.6% of the source area. Track the subject through the shot and reposition the crop if needed. Fitting the full landscape frame instead leaves empty space above and below.",
      },
      {
        title: "Use the appropriate guide for the upload",
        text: "Check YouTube's current Shorts rules for your channel and upload date. Dimensions alone do not determine every publishing condition. For a landscape video, use the separate YouTube aspect-ratio page.",
        source: 0,
      },
    ],
    questions: [
      {
        question: "Do YouTube Shorts have to be 9:16?",
        answer:
          "No. Square videos can also be categorized as Shorts under YouTube's documented conditions. A 9:16 canvas is useful when composing for a tall frame.",
      },
      {
        question: "Is 1920 × 1080 vertical?",
        answer:
          "No. It is 16:9 landscape. Swapping the dimensions to 1080 × 1920 gives a 9:16 portrait frame, which requires reframing rather than simply relabeling the original file.",
      },
      {
        question: "Can the calculator confirm that my upload will become a Short?",
        answer:
          "No. It calculates frame dimensions. Check duration, upload date and your channel's applicable rules directly with YouTube.",
      },
    ],
    sources: [
      {
        title: "YouTube Help: Understand three-minute YouTube Shorts",
        url: "https://support.google.com/youtube/answer/15424877?hl=en",
      },
    ],
  },
];
