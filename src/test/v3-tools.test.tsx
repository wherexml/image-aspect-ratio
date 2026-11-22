// @vitest-environment jsdom
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import "@testing-library/jest-dom/vitest";
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StudioFrameEditorV2 } from "@/components/v2/StudioFrameEditorV2";
import { V3Editorial, buildV3RouteHead } from "@/components/v3/V3Editorial";
import { ImagePaddingEditorV3 } from "@/components/v3/tools/ImagePaddingEditorV3";
import { InstagramGridSplitterV3 } from "@/components/v3/tools/InstagramGridSplitterV3";
import { OgSafeZonePreviewerV3 } from "@/components/v3/tools/OgSafeZonePreviewerV3";
import { RoundCornersEditorV3 } from "@/components/v3/tools/RoundCornersEditorV3";
import { SafeZoneCheckerV3 } from "@/components/v3/tools/SafeZoneCheckerV3";
import { SITE_LABELS, SITE_PAGES, V3_NEW_CANONICAL_PAGES, V3_PREVIEW_PAGES, sitemapXml } from "@/lib/site";
import { buildStoreZip, buildStoreZipBytes } from "@/lib/zip-store";
import server from "@/server";

describe("V3 Page-1 Image & Creator Tool Suite", () => {
  it("builds valid PKZIP store archives with local, central, and EOCD signatures", () => {
    const encoder = new TextEncoder();
    const entries = [
      { name: "slide-01.txt", bytes: encoder.encode("Slide 1 payload") },
      { name: "slide-02.txt", bytes: encoder.encode("Slide 2 payload") },
    ];
    const buf = buildStoreZipBytes(entries);
    const zipBlob = buildStoreZip(entries);
    expect(zipBlob.type).toBe("application/zip");
    expect(zipBlob.size).toBe(buf.byteLength);
    const view = new DataView(buf.buffer);
    // Local file header PK\x03\x04
    expect(view.getUint32(0, true)).toBe(0x04034b50);
    // End of central directory PK\x05\x06 at last 22 bytes
    expect(view.getUint32(buf.length - 22, true)).toBe(0x06054b50);
    expect(view.getUint16(buf.length - 12, true)).toBe(2);
  });

  it("renders SafeZoneCheckerV3, InstagramGridSplitterV3, ImagePaddingEditorV3, RoundCornersEditorV3, OgSafeZonePreviewerV3, and Instagram Fit mode cleanly", async () => {
    const { unmount: u1, container: c1 } = render(<SafeZoneCheckerV3 />);
    expect(screen.getByTestId("safe-zone-checker")).toBeInTheDocument();
    expect(screen.getByTestId("safe-platform-reels")).toHaveAttribute("aria-pressed", "true");
    expect(
      c1.querySelector(".v2-stage-card")!.compareDocumentPosition(c1.querySelector(".v2-panel")!) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    u1();

    const { unmount: u2, container: c2 } = render(<InstagramGridSplitterV3 />);
    expect(screen.getByTestId("ig-grid-splitter")).toBeInTheDocument();
    expect(screen.getByText("3240 × 1350 px")).toBeInTheDocument();
    expect(
      c2.querySelector(".v2-stage-card")!.compareDocumentPosition(c2.querySelector(".v2-panel")!) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    u2();

    const { unmount: u3, container: c3 } = render(<ImagePaddingEditorV3 />);
    expect(screen.getByTestId("padding-editor")).toBeInTheDocument();
    expect(screen.getByTestId("pad-fill-white")).toHaveAttribute("aria-pressed", "true");
    expect(
      c3.querySelector(".v2-stage-card")!.compareDocumentPosition(c3.querySelector(".v2-panel")!) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    u3();

    const { unmount: u4, container: c4 } = render(<RoundCornersEditorV3 />);
    expect(screen.getByTestId("round-corners-editor")).toBeInTheDocument();
    expect(
      c4.querySelector(".v2-stage-card")!.compareDocumentPosition(c4.querySelector(".v2-panel")!) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    u4();

    // Verify source does not apply Tailwind border-radius utility classes to the round-corners or padding preview canvases
    const roundSrc = readFileSync(
      resolve(process.cwd(), "src/components/v3/tools/RoundCornersEditorV3.tsx"),
      "utf8",
    );
    const padSrc = readFileSync(
      resolve(process.cwd(), "src/components/v3/tools/ImagePaddingEditorV3.tsx"),
      "utf8",
    );
    expect(roundSrc).not.toMatch(/data-testid="round-corners-canvas"[^>]*rounded-|className="[^"]*rounded-[^"]*"[^>]*data-testid="round-corners-canvas"/);
    expect(padSrc).not.toMatch(/data-testid="padding-canvas"[^>]*rounded-|className="[^"]*rounded-[^"]*"[^>]*data-testid="padding-canvas"/);

    const { unmount: u5, container: c5 } = render(<OgSafeZonePreviewerV3 />);
    expect(screen.getByTestId("og-safe-zone-previewer")).toBeInTheDocument();
    expect(
      c5.querySelector(".v2-stage-card")!.compareDocumentPosition(c5.querySelector(".v2-panel")!) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    u5();

    const { container: c6, unmount: u6 } = render(
      <StudioFrameEditorV2 mode="ratio" initialRatioId="4:5" initialWidth={1080} initialBackdropMode="blur" />,
    );
    await act(async () => {
      await new Promise(r => setTimeout(r, 0));
    });
    expect(c6.textContent).toContain("4:5");
    expect(c6.textContent).toContain("1350");
    u6();
  });

  it("keeps sitemap.xml free of /v3 preview URLs, uses Screenshot Beautifier label, and emits canonical + OG + BreadcrumbList JSON-LD", () => {
    expect(SITE_LABELS["/screenshot-beautifier"]).toBe("Screenshot Beautifier");
    expect(SITE_PAGES.length).toBe(28);
    expect(SITE_PAGES.some(p => p.startsWith("/v3") || p.startsWith("/v2"))).toBe(false);
    expect(V3_NEW_CANONICAL_PAGES.every(p => SITE_PAGES.includes(p))).toBe(true);
    const xml = sitemapXml({ origin: "https://imageaspectratio.com", indexable: true });
    expect(xml).not.toContain("/v3");
    expect(xml).not.toContain("/v2");
    for (const p of V3_NEW_CANONICAL_PAGES) {
      expect(xml).toContain(`https://imageaspectratio.com${p}`);
    }

    const previewHead = buildV3RouteHead({
      title: "TikTok, Reels & Shorts Safe Zone Checker Online (1080×1920)",
      description:
        "Preview 1080×1920 vertical covers against TikTok, Instagram Reels, and YouTube Shorts UI overlays. Download a free transparent PNG safe-zone guide.",
      canonicalPath: "/safe-zone-checker",
      appName: "TikTok, Reels & Shorts Safe Zone Checker",
      howToTitle: "How to Check TikTok, Reels & Shorts Safe Zones Online",
      steps: [{ title: "Select platform", description: "Choose TikTok, Reels, or Shorts." }],
      faqs: [{ question: "Is it free?", answer: "Yes." }],
      siteConfig: { origin: "https://imageaspectratio.com", indexable: true },
    });

    expect(previewHead.links).toEqual([
      { rel: "canonical", href: "https://imageaspectratio.com/safe-zone-checker" },
    ]);
    expect(previewHead.meta.find(m => "name" in m && m.name === "robots")).toEqual({
      name: "robots",
      content: "noindex, nofollow",
    });
    expect(previewHead.meta.find(m => "property" in m && m.property === "og:image:width")).toEqual({
      property: "og:image:width",
      content: "1200",
    });
    expect(previewHead.meta.find(m => "property" in m && m.property === "og:image:height")).toEqual(
      {
        property: "og:image:height",
        content: "630",
      },
    );
    expect(previewHead.meta.find(m => "name" in m && m.name === "twitter:card")).toEqual({
      name: "twitter:card",
      content: "summary_large_image",
    });

    const jsonLd = JSON.parse(previewHead.scripts[0]!.children) as {
      "@graph": Array<Record<string, unknown>>;
    };
    const types = jsonLd["@graph"].map(node => node["@type"]);
    expect(types).toEqual(["WebSite", "WebApplication", "WebPage", "BreadcrumbList", "HowTo", "FAQPage"]);
    const webApp = jsonLd["@graph"].find(node => node["@type"] === "WebApplication")!;
    expect(webApp["@id"]).toBe("https://imageaspectratio.com/safe-zone-checker#app");
    expect(webApp["url"]).toBe("https://imageaspectratio.com/safe-zone-checker");
    const breadcrumb = jsonLd["@graph"].find(node => node["@type"] === "BreadcrumbList")!;
    expect(breadcrumb["@id"]).toBe("https://imageaspectratio.com/safe-zone-checker#breadcrumb");

    const promotedHead = buildV3RouteHead({
      title: "TikTok, Reels & Shorts Safe Zone Checker Online (1080×1920)",
      description:
        "Preview 1080×1920 vertical covers against TikTok, Instagram Reels, and YouTube Shorts UI overlays. Download a free transparent PNG safe-zone guide.",
      canonicalPath: "/safe-zone-checker",
      appName: "TikTok, Reels & Shorts Safe Zone Checker",
      howToTitle: "How to Check TikTok, Reels & Shorts Safe Zones Online",
      steps: [{ title: "Select platform", description: "Choose TikTok, Reels, or Shorts." }],
      faqs: [{ question: "Is it free?", answer: "Yes." }],
      forceNoindex: false,
      siteConfig: { origin: "https://imageaspectratio.com", indexable: true },
    });
    expect(promotedHead.meta.find(m => "name" in m && m.name === "robots")).toEqual({
      name: "robots",
      content: "index, follow",
    });
  });

  it("enforces Ahrefs golden-zone title (48-60c) & description (135-160c), zero legacy alias links, and descriptive visualGuide alt text", () => {
    expect(V3_PREVIEW_PAGES).toContain("/v3/video-aspect-ratio");
    expect(V3_PREVIEW_PAGES).not.toContain("/v3/pixelate-image");
    expect(V3_PREVIEW_PAGES).not.toContain("/v3/image-aspect-ratio");

    const v3ShellSrc = readFileSync(
      resolve(process.cwd(), "src/components/v3/V3PageShell.tsx"),
      "utf8",
    );
    expect(v3ShellSrc).not.toContain("hint:");
    const ratioMatches = [...v3ShellSrc.matchAll(/ratio:\s*"([^"]+)"/g)].map(m => m[1]);
    expect(ratioMatches.length).toBeGreaterThanOrEqual(9);
    for (const r of ratioMatches) {
      expect(r, `Social Media menu ratio "${r}" must be pure X:Y`).toMatch(/^\d+(?:\.\d+)?:\d+$/);
    }

    const promotedV3Files = [
      "index.tsx",
      "make-image-square.tsx",
      "change-image-aspect-ratio.tsx",
      "add-padding-to-image.tsx",
      "fit-photo-to-instagram.tsx",
      "round-corners-image.tsx",
      "instagram-grid-splitter.tsx",
      "safe-zone-checker.tsx",
      "og-image-safe-zone.tsx",
      "screenshot-beautifier.tsx",
      "blur-screenshot.tsx",
      "annotate-screenshot.tsx",
      "calculator.tsx",
      "video-aspect-ratio.tsx",
    ];
    const routesDir = resolve(process.cwd(), "src/routes");
    for (const file of promotedV3Files) {
      const src = readFileSync(resolve(routesDir, file), "utf8");
      const titleMatch = src.match(/const PAGE_TITLE\s*=\s*"([^"]+)"/);
      const descMatch = src.match(/const DESCRIPTION\s*=\s*\n?\s*"([^"]+)"/);
      expect(titleMatch, `${file} PAGE_TITLE`).not.toBeNull();
      expect(descMatch, `${file} DESCRIPTION`).not.toBeNull();
      const titleLen = titleMatch![1]!.length;
      const descLen = descMatch![1]!.length;
      expect(titleLen, `${file} title length (${titleLen})`).toBeGreaterThanOrEqual(48);
      expect(titleLen, `${file} title length (${titleLen})`).toBeLessThanOrEqual(60);
      expect(descLen, `${file} desc length (${descLen})`).toBeGreaterThanOrEqual(135);
      expect(descLen, `${file} desc length (${descLen})`).toBeLessThanOrEqual(160);
      expect(src).toContain("forceNoindex: false");
      expect(src).not.toContain("compareV2To=");
      expect(src).not.toContain('to: "/v3');
      expect(src).not.toContain('to="/v3');
    }

    const v3Dir = resolve(process.cwd(), "src/routes/v3");
    for (const file of readdirSync(v3Dir).filter(f => f.endsWith(".tsx"))) {
      const src = readFileSync(resolve(v3Dir, file), "utf8");
      expect(src, `/v3/${file} should be a 308 redirect stub`).toContain("statusCode: 308");
    }

    const { unmount } = render(
      <V3Editorial
        overview={{ heading: "Overview H2", lead: "Lead copy" }}
        visualGuide={{
          heading: "Before vs After",
          src: "/previews/screenshot-beautifier-workflow.webp",
          width: 1120,
          height: 500,
          alt: "Detailed before and after screenshot framing comparison",
          caption: "Caption note",
        }}
        shortcuts={{
          heading: "Studio Shortcuts",
          items: [
            { keys: ["B"], action: "Gaussian blur" },
            { keys: ["M"], action: "Mosaic" },
          ],
        }}
        howTo={{
          heading: "How to Use",
          steps: [{ title: "Step 1", description: "Paste image" }],
        }}
        features={{
          heading: "Features",
          items: [{ title: "Fast", description: "Client-side" }],
        }}
        faq={{ items: [{ question: "Q?", answer: "A." }] }}
        relatedTools={{ items: [] }}
      />,
    );
    const guideImg = screen.getByAltText("Detailed before and after screenshot framing comparison");
    expect(guideImg).toHaveAttribute("src", "/previews/screenshot-beautifier-workflow.webp");
    expect(screen.getByText("Gaussian blur")).toBeInTheDocument();
    unmount();
  });

  it("answers 308 permanent redirects with Location preservation on promoted /v3/*, consolidated, and trailing-slash URLs", async () => {
    const r1 = await server.fetch(
      new Request("https://imageaspectratio.com/v3/pixelate-image?utm_source=qa"),
      {},
      {},
    );
    expect(r1.status).toBe(308);
    expect(r1.headers.get("Location")).toBe("/blur-screenshot?utm_source=qa");

    const r2 = await server.fetch(
      new Request("https://imageaspectratio.com/v3/image-aspect-ratio?ref=nav"),
      {},
      {},
    );
    expect(r2.status).toBe(308);
    expect(r2.headers.get("Location")).toBe("/?ref=nav");

    const r3 = await server.fetch(
      new Request("https://imageaspectratio.com/v3/safe-zone-checker/?a=1"),
      {},
      {},
    );
    expect(r3.status).toBe(308);
    expect(r3.headers.get("Location")).toBe("/safe-zone-checker?a=1");

    const r4 = await server.fetch(
      new Request("https://imageaspectratio.com/pixelate-image"),
      {},
      {},
    );
    expect(r4.status).toBe(308);
    expect(r4.headers.get("Location")).toBe("/blur-screenshot");

    const r5 = await server.fetch(
      new Request("https://imageaspectratio.com/safe-zone-checker/?x=2"),
      {},
      {},
    );
    expect(r5.status).toBe(308);
    expect(r5.headers.get("Location")).toBe("/safe-zone-checker?x=2");
  });
});
