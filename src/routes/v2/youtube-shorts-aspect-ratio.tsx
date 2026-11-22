import { createFileRoute } from "@tanstack/react-router";
import {
  getSocialPageByPath,
  SocialPlatformRelatedNav,
  SocialPlatformStudioV2,
} from "@/components/v2/SocialRatioV2";
import { V2PageShell } from "@/components/v2/V2PageShell";

export const Route = createFileRoute("/v2/youtube-shorts-aspect-ratio")({
  head: () => ({
    meta: [
      { title: "YouTube Shorts Aspect Ratio (V2 Preview)" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: YoutubeShortsV2Page,
});

function YoutubeShortsV2Page() {
  const page = getSocialPageByPath("/youtube-shorts-aspect-ratio");
  return (
    <V2PageShell
      title={`${page.name} Aspect Ratio`}
      v1To="/youtube-shorts-aspect-ratio"
      hero={{
        title: (
          <>
            {page.name} <span className="text-primary">Aspect Ratio</span>
          </>
        ),
        description: page.answer,
      }}
    >
      <SocialPlatformStudioV2 path="/youtube-shorts-aspect-ratio" />
      <SocialPlatformRelatedNav currentPath="/youtube-shorts-aspect-ratio" />
    </V2PageShell>
  );
}
