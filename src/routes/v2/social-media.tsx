import { createFileRoute } from "@tanstack/react-router";
import { SocialMediaHubV2 } from "@/components/v2/SocialRatioV2";
import { V2PageShell } from "@/components/v2/V2PageShell";

export const Route = createFileRoute("/v2/social-media")({
  head: () => ({
    meta: [
      { title: "Social Media Aspect Ratios (V2 Preview)" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SocialMediaV2Page,
});

function SocialMediaV2Page() {
  return (
    <V2PageShell
      title="Social Media Aspect Ratios"
      v1To="/social-media"
      hero={{
        title: (
          <>
            Social Media <span className="text-primary">Aspect Ratios</span>
          </>
        ),
        description:
          "Find aspect ratios and calculate pixel dimensions for Instagram Reels and Stories, YouTube videos and Shorts, and TikTok.",
      }}
    >
      <SocialMediaHubV2 />
    </V2PageShell>
  );
}
