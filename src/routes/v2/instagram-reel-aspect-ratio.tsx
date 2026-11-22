import { createFileRoute } from "@tanstack/react-router";
import {
  getSocialPageByPath,
  SocialPlatformRelatedNav,
  SocialPlatformStudioV2,
} from "@/components/v2/SocialRatioV2";
import { V2PageShell } from "@/components/v2/V2PageShell";

export const Route = createFileRoute("/v2/instagram-reel-aspect-ratio")({
  head: () => ({
    meta: [
      { title: "Instagram Reel Aspect Ratio (V2 Preview)" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: InstagramReelV2Page,
});

function InstagramReelV2Page() {
  const page = getSocialPageByPath("/instagram-reel-aspect-ratio");
  return (
    <V2PageShell
      title={`${page.name} Aspect Ratio`}
      v1To="/instagram-reel-aspect-ratio"
      hero={{
        title: (
          <>
            {page.name} <span className="text-primary">Aspect Ratio</span>
          </>
        ),
        description: page.answer,
      }}
    >
      <SocialPlatformStudioV2 path="/instagram-reel-aspect-ratio" />
      <SocialPlatformRelatedNav currentPath="/instagram-reel-aspect-ratio" />
    </V2PageShell>
  );
}
