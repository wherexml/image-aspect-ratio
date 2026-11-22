import { createFileRoute } from "@tanstack/react-router";
import {
  getSocialPageByPath,
  SocialPlatformRelatedNav,
  SocialPlatformStudioV2,
} from "@/components/v2/SocialRatioV2";
import { V2PageShell } from "@/components/v2/V2PageShell";

export const Route = createFileRoute("/v2/youtube-aspect-ratio")({
  head: () => ({
    meta: [
      { title: "YouTube Aspect Ratio (V2 Preview)" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: YoutubeV2Page,
});

function YoutubeV2Page() {
  const page = getSocialPageByPath("/youtube-aspect-ratio");
  return (
    <V2PageShell
      title={`${page.name} Aspect Ratio`}
      v1To="/youtube-aspect-ratio"
      hero={{
        title: (
          <>
            {page.name} <span className="text-primary">Aspect Ratio</span>
          </>
        ),
        description: page.answer,
      }}
    >
      <SocialPlatformStudioV2 path="/youtube-aspect-ratio" />
      <SocialPlatformRelatedNav currentPath="/youtube-aspect-ratio" />
    </V2PageShell>
  );
}
