import { createFileRoute } from "@tanstack/react-router";
import {
  getSocialPageByPath,
  SocialPlatformRelatedNav,
  SocialPlatformStudioV2,
} from "@/components/v2/SocialRatioV2";
import { V3PageShell } from "@/components/v3/V3PageShell";
import { SOCIAL_UPDATED } from "@/content/social-ratios";
import { previewSeoMeta, seoLinks, seoScripts } from "@/lib/seo";

const page = getSocialPageByPath("/youtube-aspect-ratio");

export const Route = createFileRoute("/youtube-aspect-ratio")({
  head: () => ({
    meta: previewSeoMeta(page.title, page.description, page.path),
    links: seoLinks(page.path),
    scripts: seoScripts(page.title, page.description, page.path, true, SOCIAL_UPDATED),
  }),
  component: YouTubePage,
});

function YouTubePage() {
  return (
    <V3PageShell
      title={`${page.name} Aspect Ratio`}
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
      <SocialPlatformRelatedNav currentPath="/youtube-aspect-ratio" rootLinks />
    </V3PageShell>
  );
}
