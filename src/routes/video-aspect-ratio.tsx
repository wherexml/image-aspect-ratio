import { createFileRoute } from "@tanstack/react-router";
import { Calculator, Crop, ShieldCheck } from "lucide-react";
import { VideoAspectRatioV2 } from "@/components/v2/VideoAspectRatioV2";
import {
  buildV3RouteHead,
  V3Editorial,
  type V3FaqItem,
  type V3FeatureItem,
  type V3StepItem,
} from "@/components/v3/V3Editorial";
import { V3PageShell } from "@/components/v3/V3PageShell";

const PAGE_TITLE = "Video Aspect Ratio Simulator — 16:9, 9:16 & 4K Crop Guide";
const DESCRIPTION =
  "Simulate 16:9 widescreen, 9:16 vertical, and 2.39:1 cinema video framing with exact Fit/Fill crop loss math and DCI vs UHD 4K pixel dimensions.";

const STEPS: readonly V3StepItem[] = [
  {
    title: "Enter timeline width & height",
    description:
      "Type any video frame size (such as 1920 × 1080, 1080 × 1920, 3840 × 2160, or 4096 × 2160) to read its exact square-pixel aspect ratio.",
  },
  {
    title: "Compare Widescreen vs. Vertical Fit/Fill",
    description:
      "Preview how your clip sits inside both a 16:9 monitor and a 9:16 mobile screen — toggling Fit (letterbox/pillarbox) vs. Fill (center crop).",
  },
  {
    title: "Check crop retention & safe zones",
    description:
      "Verify exact visible frame percentage before reframing in Premiere, DaVinci Resolve, or CapCut, then test 9:16 UI overlays in Safe Zone Checker.",
  },
];

const FEATURES: readonly V3FeatureItem[] = [
  {
    title: "Dual 16:9 & 9:16 Screen Simulator",
    description:
      "See widescreen TV/YouTube playback and vertical Reels/TikTok/Shorts framing side-by-side from a single pixel input.",
  },
  {
    title: "Exact Crop-Retention Math (31.64%)",
    description:
      "Shows why center-cropping a 16:9 horizontal clip to fill a 9:16 vertical screen discards 68.36% of the frame (retaining 607.5 × 1080 px).",
  },
  {
    title: "UHD 4K (16:9) vs. DCI 4K (256:135)",
    description:
      "Distinguishes broadcast 3840 × 2160 (exact 16:9) from cinema DCI 4096 × 2160 (256:135 ≈ 1.90:1) so timelines never get unexpected 2 px bars.",
  },
  {
    title: "Even-Pixel Codec Guidance",
    description:
      "Highlights resolutions divisible by 2, 8, or 16 for clean H.264, HEVC, ProRes, and AV1 macroblock encoding without chroma subsampling glitches.",
  },
  {
    title: "Square-Pixel Clarity (PAR 1.0)",
    description:
      "All calculations explicitly assume modern 1:1 square pixels rather than legacy DV/anamorphic non-square pixel aspect ratios.",
  },
  {
    title: "Instant Browser Calculation",
    description:
      "Plan sequence settings and reframing crops in milliseconds with zero video uploads or transcoding wait times.",
  },
];

const VIDEO_STANDARDS_TABLE = [
  {
    standard: "1080p Full HD / 4K UHD",
    pixels: "1920 × 1080 / 3840 × 2160",
    ratio: "16:9 (1.78:1)",
    notes: "Standard YouTube, broadcast TV, and streaming widescreen (PAR 1.0)",
  },
  {
    standard: "Vertical Social HD / 4K",
    pixels: "1080 × 1920 / 2160 × 3840",
    ratio: "9:16 (0.5625:1)",
    notes: "TikTok, Instagram Reels, YouTube Shorts (34% covered by app UI chrome)",
  },
  {
    standard: "DCI 4K Cinema Native",
    pixels: "4096 × 2160",
    ratio: "256:135 (≈1.90:1)",
    notes: "Digital cinema container; slightly wider than 16:9 consumer UHD",
  },
  {
    standard: "CinemaScope / Anamorphic Web",
    pixels: "3840 × 1608 (or 1920 × 804)",
    ratio: "2.39:1 (160:67)",
    notes: "Widescreen theatrical delivery without baked-in 16:9 black letterbox bars",
  },
  {
    standard: "Open Gate 3:2 / 4:3 Sensor",
    pixels: "6000 × 4000 / 5120 × 3840",
    ratio: "3:2 · 4:3",
    notes: "Best camera capture mode when delivering both 16:9 YouTube and 9:16 Reels",
  },
] as const;

const FAQS: readonly V3FaqItem[] = [
  {
    question: "How much of a 16:9 video is lost when cropped to 9:16 vertical?",
    answer:
      "When you scale a 1920 × 1080 (16:9) clip to fill a 9:16 frame at full 1080 px height, only the center 607.5 × 1080 px (rounded to 608 × 1080 px) remains visible — preserving 31.64% of the horizontal width and trimming 68.36%. Shooting Open Gate (4:3 or 3:2) retains significantly more vertical headroom.",
  },
  {
    question: "What is the difference between 3840 × 2160 (UHD) and 4096 × 2160 (DCI 4K)?",
    answer:
      "3840 × 2160 is Ultra HD (exact 16:9, quadruple 1920 × 1080) used by YouTube, TVs, and monitors. 4096 × 2160 is the Digital Cinema Initiatives (DCI) 4K projection standard with an exact ratio of 256:135 (≈1.896:1). Placing DCI 4K inside a 16:9 sequence adds thin top/bottom letterbox bars unless scaled to fill.",
  },
  {
    question: "Why should video export dimensions use even numbers?",
    answer:
      "Most delivery codecs (H.264, H.265/HEVC, VP9, AV1) use 4:2:0 chroma subsampling, which groups color information in 2 × 2 pixel blocks. Odd widths or heights (like 1080 × 607) can cause encoder errors or 1-pixel green/black edge artifacts; always round to even integers such as 1080 × 608.",
  },
  {
    question: "Does this tool transcode video files or check TikTok/Reels button overlap?",
    answer:
      "This page simulates frame geometry and exact square-pixel math without uploading video files. Once you export a 1080 × 1920 (9:16) frame or thumbnail, open our Safe Zone Checker to verify captions and app buttons don’t cover your subtitles.",
  },
];

export const Route = createFileRoute("/video-aspect-ratio")({
  head: () =>
    buildV3RouteHead({
    forceNoindex: false,
      title: PAGE_TITLE,
      description: DESCRIPTION,
      canonicalPath: "/video-aspect-ratio",
      appName: "Video Aspect Ratio Simulator",
      howToTitle: "How to Simulate Widescreen and Vertical Video Aspect Ratios",
      steps: STEPS,
      faqs: FAQS,
    }),
  component: VideoAspectRatioV3Page,
});

function VideoAspectRatioV3Page() {
  return (
    <V3PageShell
      title="Video Aspect Ratio"
      hero={{
        title: (
          <>
            Video Aspect Ratio <span className="text-primary">Simulator</span>
          </>
        ),
        description:
          "Enter timeline dimensions to compare Fit letterbox vs. Fill crop across 16:9 widescreen and 9:16 vertical screens using exact square-pixel math.",
      }}
    >
      <VideoAspectRatioV2 />

      <V3Editorial
        overview={{
          eyebrow: "Timeline & Reframing Geometry",
          heading: "Plan 16:9, 9:16 & Cinema Crops Before You Render",
          lead: "Modern video delivery rarely targets a single screen: one shoot often feeds a 16:9 YouTube master, a 9:16 Reels/TikTok vertical cut, and a 4:5 feed teaser. Compare exact frame retention, letterbox bars, and DCI vs. UHD 4K containers in one view.",
        }}
        howTo={{
          heading: "How to Check Video Aspect Ratio & Reframing Loss",
          steps: STEPS,
        }}
        features={{
          heading: "Built for Editors in Premiere, DaVinci Resolve, Final Cut & CapCut",
          items: FEATURES,
        }}
        referenceSection={
          <section aria-labelledby="v3-video-standards" className="space-y-4">
            <div className="space-y-1">
              <p className="v3-eyebrow">Sequence Reference</p>
              <h2
                id="v3-video-standards"
                className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl"
              >
                Broadcast, Vertical Social &amp; Cinema Video Standards
              </h2>
            </div>

            <div className="v3-table-wrap">
              <table className="v3-table">
                <thead>
                  <tr>
                    <th scope="col">Format</th>
                    <th scope="col">Pixel Resolution</th>
                    <th scope="col">Exact Ratio</th>
                    <th scope="col">Editing Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {VIDEO_STANDARDS_TABLE.map(row => (
                    <tr key={row.standard}>
                      <td className="font-semibold text-foreground">{row.standard}</td>
                      <td className="num font-medium text-foreground">{row.pixels}</td>
                      <td className="num font-semibold text-primary">{row.ratio}</td>
                      <td className="text-muted-foreground">{row.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Note: Geometry assumes square pixels (1.0 PAR). YouTube Help currently recommends
              16:9 (up to 3840 × 2160) for standard video thumbnails and 9:16 (up to 2160 × 3840)
              for Shorts thumbnails (verified 2026-11).
            </p>
          </section>
        }
        faq={{ items: FAQS }}
        relatedTools={{
          items: [
            {
              to: "/safe-zone-checker",
              title: "TikTok, Reels & Shorts Safe Zone Checker",
              description:
                "Test 1080×1920 vertical frames against real app button & caption danger zones and export a CapCut PNG overlay.",
              badge: "Creator Tool",
              icon: <ShieldCheck className="h-4 w-4" />,
            },
            {
              to: "/calculator",
              title: "Aspect Ratio Calculator",
              description:
                "Solve missing even-pixel widths or heights for custom 2.39:1, 1.85:1, or 43:18 sequences.",
              icon: <Calculator className="h-4 w-4" />,
            },
            {
              to: "/change-image-aspect-ratio",
              title: "Change Image Aspect Ratio",
              description:
                "Crop or pad video thumbnails to exact 16:9 (1920×1080) or 9:16 (1080×1920) PNG/JPG files.",
              icon: <Crop className="h-4 w-4" />,
            },
          ],
        }}
      />
    </V3PageShell>
  );
}
