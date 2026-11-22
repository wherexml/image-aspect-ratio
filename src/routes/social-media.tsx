import { createFileRoute } from "@tanstack/react-router";
import { SocialMediaHubV2 } from "@/components/v2/SocialRatioV2";
import { V3PageShell } from "@/components/v3/V3PageShell";
import { PLACEMENTS_CHECKED } from "@/content/image-placements";
import { previewSeoMeta, seoLinks, seoScripts } from "@/lib/seo";

const TITLE = "Social Media Aspect Ratios — Instagram, YouTube & TikTok";
const DESCRIPTION =
  "Find aspect ratios, safe zones, and pixel dimensions for Instagram Reels, Stories, 3:4 grids, YouTube videos & Shorts, TikTok, and 1200×630 OG cards.";

export const Route = createFileRoute("/social-media")({
  head: () => ({
    meta: previewSeoMeta(TITLE, DESCRIPTION, "/social-media"),
    links: seoLinks("/social-media"),
    scripts: seoScripts(TITLE, DESCRIPTION, "/social-media", false, PLACEMENTS_CHECKED),
  }),
  component: SocialMediaPage,
});

function SocialMediaPage() {
  return (
    <V3PageShell
      title="Social Media Aspect Ratios"
      hero={{
        title: (
          <>
            Social Media <span className="text-primary">Aspect Ratios</span>
          </>
        ),
        description:
          "Find aspect ratios, check UI safe zones, and calculate pixel dimensions for Instagram, YouTube, TikTok, and Open Graph link cards.",
      }}
    >
      <SocialMediaHubV2 rootLinks />
    </V3PageShell>
  );
}
