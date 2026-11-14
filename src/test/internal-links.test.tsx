import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { cleanup, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it } from "vitest";

import guide from "@/content/aspect-ratio-guide.json";
import {
  fitFillGuideLink,
  footerInternalLinks,
  frameFollowUpLinks,
  guideCommonRatioLinks,
} from "@/lib/internal-links";
import { parseSiteConfig, SITE_PAGES, sitemapXml, type SitePath } from "@/lib/site";
import { routeTree } from "@/routeTree.gen";

const indexable = parseSiteConfig({
  VITE_SITE_URL: "https://imageaspectratio.com",
  VITE_SITE_INDEXABLE: "true",
});

function pathsIn(links: { to: SitePath }[]) {
  return links.map((link) => link.to);
}

afterEach(() => {
  cleanup();
});

async function renderPath(path: string) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
    context: { queryClient: new QueryClient() },
  });
  await router.load();
  const view = render(<RouterProvider router={router} />);
  return view.container;
}

function internalPaths(container: HTMLElement) {
  return [...container.querySelectorAll("a")]
    .map((anchor) => anchor.getAttribute("href") ?? "")
    .filter((href) => href.startsWith("/"))
    .map((href) => href.split(/[?#]/)[0] || "/");
}

describe("internal link catalog", () => {
  it("links every indexable page from the shared footer exactly once", () => {
    const paths = pathsIn(footerInternalLinks());
    expect(new Set(paths)).toEqual(new Set(SITE_PAGES));
    expect(paths).toHaveLength(SITE_PAGES.length);
  });

  it("points ratio follow-ups at existing pages and not at the page the reader is already on", () => {
    expect(pathsIn(frameFollowUpLinks("image"))).toEqual([
      "/youtube-aspect-ratio",
      "/social-media",
    ]);
    expect(pathsIn(frameFollowUpLinks("video"))).toEqual([
      "/youtube-aspect-ratio",
      "/social-media",
    ]);
    expect(pathsIn(frameFollowUpLinks("calculator"))).toEqual([
      "/youtube-aspect-ratio",
      "/social-media",
    ]);
    expect(pathsIn(guideCommonRatioLinks)).toEqual([
      "/youtube-aspect-ratio",
      "/social-media",
      "/ultrawide-aspect-ratio-calculator",
    ]);
    expect(fitFillGuideLink).toMatchObject({
      to: "/what-is-aspect-ratio",
      hash: "crop-fit-stretch",
    });
    expect(guide.sections.some((section) => section.id === fitFillGuideLink.hash)).toBe(true);
    for (const link of [
      ...frameFollowUpLinks("image"),
      ...guideCommonRatioLinks,
      fitFillGuideLink,
    ]) {
      expect(SITE_PAGES).toContain(link.to);
      expect(link.to).not.toBe("/make-image-square");
    }
  });

  it("keeps the indexable sitemap aligned with SITE_PAGES and omits routes this checkout does not serve", () => {
    const locs = [...sitemapXml(indexable).matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (match) => match[1],
    );
    expect(locs).toEqual(SITE_PAGES.map((path) => `https://imageaspectratio.com${path}`));
    expect(sitemapXml(indexable)).not.toContain("make-image-square");
    expect(sitemapXml(indexable)).not.toContain("/image-aspect-ratio");
  });

  it("lists the social hub and exact-fraction article in llms.txt and no unpublished route", () => {
    const text = readFileSync("public/llms.txt", "utf8");
    const paths = [...text.matchAll(/https:\/\/imageaspectratio\.com(\/[a-z0-9-]+)?/g)].map(
      (match) => match[1] ?? "/",
    );
    expect(paths).toContain("/social-media");
    expect(paths).toContain("/exact-fractions-vs-rounded-pixels");
    expect(text).not.toContain("make-image-square");
    for (const path of paths) expect(SITE_PAGES).toContain(path);
  });
});

describe("rendered contextual links", () => {
  it("reaches the calculator from About, which has no tool navigation", async () => {
    const container = await renderPath("/about");
    expect(screen.getByRole("link", { name: "Aspect ratio calculator" })).toHaveAttribute(
      "href",
      "/calculator",
    );
    expect(screen.getByRole("link", { name: "calculator" })).toHaveAttribute("href", "/calculator");
    expect(screen.getByRole("link", { name: "image tool" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "video tool" })).toHaveAttribute(
      "href",
      "/video-aspect-ratio",
    );
    expect(screen.getByRole("link", { name: "ultrawide tool" })).toHaveAttribute(
      "href",
      "/ultrawide-aspect-ratio-calculator",
    );
    expect(screen.getByRole("link", { name: "social media aspect ratios" })).toHaveAttribute(
      "href",
      "/social-media",
    );
    for (const path of internalPaths(container)) expect(SITE_PAGES).toContain(path);
  });

  it("connects the image frames, video frames and calculator chooser to the matching pages", async () => {
    const image = await renderPath("/");
    expect(screen.getByRole("link", { name: "Widescreen 16:9 on YouTube" })).toHaveAttribute(
      "href",
      "/youtube-aspect-ratio",
    );
    expect(screen.getByRole("link", { name: "Story 9:16 on social media" })).toHaveAttribute(
      "href",
      "/social-media",
    );
    expect(
      screen.queryByRole("link", { name: "YouTube 16:9 video sizes" }),
    ).not.toBeInTheDocument();
    for (const path of internalPaths(image)) expect(SITE_PAGES).toContain(path);

    cleanup();
    const video = await renderPath("/video-aspect-ratio");
    expect(screen.getByRole("link", { name: "16:9 YouTube video sizes" })).toHaveAttribute(
      "href",
      "/youtube-aspect-ratio",
    );
    expect(screen.getByRole("link", { name: "Vertical 9:16 social sizes" })).toHaveAttribute(
      "href",
      "/social-media",
    );
    for (const path of internalPaths(video)) expect(SITE_PAGES).toContain(path);

    cleanup();
    const calculator = await renderPath("/calculator");
    expect(screen.getByRole("link", { name: "YouTube 16:9 video sizes" })).toHaveAttribute(
      "href",
      "/youtube-aspect-ratio",
    );
    expect(
      screen.getByRole("link", { name: "9:16 sizes for Reels, Stories, Shorts and TikTok" }),
    ).toHaveAttribute("href", "/social-media");
    expect(
      screen.getByRole("link", { name: "Calculate actual monitor resolutions" }),
    ).toHaveAttribute("href", "/ultrawide-aspect-ratio-calculator");
    for (const path of internalPaths(calculator)) expect(SITE_PAGES).toContain(path);

    cleanup();
    const ultrawide = await renderPath("/ultrawide-aspect-ratio-calculator");
    expect(
      screen.queryByRole("link", { name: "YouTube 16:9 video sizes" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Widescreen 16:9 on YouTube" }),
    ).not.toBeInTheDocument();
    for (const path of internalPaths(ultrawide)) expect(SITE_PAGES).toContain(path);
  });

  it("links the guide, social hub and a social detail page onward without leaving the known routes", async () => {
    const guidePage = await renderPath("/what-is-aspect-ratio");
    expect(screen.getByRole("link", { name: /16:9 YouTube sizes/ })).toHaveAttribute(
      "href",
      "/youtube-aspect-ratio",
    );
    expect(screen.getByRole("link", { name: /9:16 social sizes/ })).toHaveAttribute(
      "href",
      "/social-media",
    );
    expect(screen.getByRole("link", { name: /Check an ultrawide ratio/ })).toHaveAttribute(
      "href",
      "/ultrawide-aspect-ratio-calculator",
    );
    for (const path of internalPaths(guidePage)) expect(SITE_PAGES).toContain(path);

    cleanup();
    const hub = await renderPath("/social-media");
    expect(screen.getByRole("link", { name: "image aspect ratio checker" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: "aspect ratio calculator" })).toHaveAttribute(
      "href",
      "/calculator",
    );
    for (const path of internalPaths(hub)) expect(SITE_PAGES).toContain(path);

    cleanup();
    const story = await renderPath("/instagram-story-aspect-ratio");
    expect(screen.getByRole("link", { name: "Fit, fill and stretch" })).toHaveAttribute(
      "href",
      "/what-is-aspect-ratio#crop-fit-stretch",
    );
    for (const path of internalPaths(story)) expect(SITE_PAGES).toContain(path);
  });
});
