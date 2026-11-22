import { createFileRoute } from "@tanstack/react-router";
import {
  getSocialPageByPath,
  SocialPlatformRelatedNav,
  SocialPlatformStudioV2,
} from "@/components/v2/SocialRatioV2";
import { V2PageShell } from "@/components/v2/V2PageShell";

export const Route = createFileRoute("/v2/instagram-story-aspect-ratio")({
  head: () => ({
    meta: [
      { title: "Instagram Story Aspect Ratio (V2 Preview)" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: InstagramStoryV2Page,
});

function InstagramStoryV2Page() {
  const page = getSocialPageByPath("/instagram-story-aspect-ratio");
  return (
    <V2PageShell
      title={`${page.name} Aspect Ratio`}
      v1To="/instagram-story-aspect-ratio"
      hero={{
        title: (
          <>
            {page.name} <span className="text-primary">Aspect Ratio</span>
          </>
        ),
        description: page.answer,
      }}
    >
      <SocialPlatformStudioV2 path="/instagram-story-aspect-ratio" />
      <SocialPlatformRelatedNav currentPath="/instagram-story-aspect-ratio" />
    </V2PageShell>
  );
}
