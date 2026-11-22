import { createFileRoute } from "@tanstack/react-router";
import {
  getSocialPageByPath,
  SocialPlatformRelatedNav,
  SocialPlatformStudioV2,
} from "@/components/v2/SocialRatioV2";
import { V2PageShell } from "@/components/v2/V2PageShell";

export const Route = createFileRoute("/v2/tiktok-aspect-ratio")({
  head: () => ({
    meta: [
      { title: "TikTok Aspect Ratio (V2 Preview)" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: TiktokV2Page,
});

function TiktokV2Page() {
  const page = getSocialPageByPath("/tiktok-aspect-ratio");
  return (
    <V2PageShell
      title={`${page.name} Aspect Ratio`}
      v1To="/tiktok-aspect-ratio"
      hero={{
        title: (
          <>
            {page.name} <span className="text-primary">Aspect Ratio</span>
          </>
        ),
        description: page.answer,
      }}
    >
      <SocialPlatformStudioV2 path="/tiktok-aspect-ratio" />
      <SocialPlatformRelatedNav currentPath="/tiktok-aspect-ratio" />
    </V2PageShell>
  );
}
