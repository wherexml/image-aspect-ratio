import { createFileRoute } from "@tanstack/react-router";
import { SocialRatioPage } from "@/components/SocialRatioPage";
import { SOCIAL_PAGES, SOCIAL_UPDATED } from "@/content/social-ratios";
import { previewSeoMeta, seoLinks, seoScripts } from "@/lib/seo";

const page = SOCIAL_PAGES.find((page) => page.path === "/youtube-aspect-ratio")!;

export const Route = createFileRoute("/youtube-aspect-ratio")({
  head: () => ({
    meta: previewSeoMeta(page.title, page.description, page.path),
    links: seoLinks(page.path),
    scripts: seoScripts(page.title, page.description, page.path, true, SOCIAL_UPDATED),
  }),
  component: () => <SocialRatioPage page={page} />,
});
