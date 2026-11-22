import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Check } from "lucide-react";
import type { ReactNode } from "react";
import { CONTENT_UPDATED, MAINTAINER, REPOSITORY_URL, SITE_NAME, seoLinks, seoMeta } from "@/lib/seo";
import {
  ALL_CANONICAL_LABELS,
  canonicalUrl,
  isSocialDetail,
  site,
  type CanonicalPath,
  type SiteConfig,
} from "@/lib/site";

export type V3StepItem = {
  title: string;
  description: string;
};

export type V3FeatureItem = {
  title: string;
  description: string;
};

export type V3FaqItem = {
  question: string;
  answer: string;
  richAnswer?: ReactNode;
};

export type V3RelatedToolItem = {
  to: CanonicalPath;
  title: string;
  description: string;
  badge?: string;
  icon: ReactNode;
};

export type V3VisualGuide = {
  eyebrow?: string;
  heading: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
};

export type V3ShortcutItem = {
  keys: readonly string[];
  action: string;
};

/**
 * Generates unified WebSite + WebApplication + WebPage + BreadcrumbList + HowTo + FAQPage
 * JSON-LD structured data matching the visible V3 editorial blocks 1:1.
 * Identity URLs and BreadcrumbList items are emitted only when an explicit site origin is configured.
 */
export function buildV3StructuredData({
  appName,
  pageTitle,
  description,
  howToTitle,
  steps,
  faqs,
  canonicalPath,
  breadcrumbName,
  siteConfig = site,
}: {
  appName: string;
  pageTitle: string;
  description: string;
  howToTitle: string;
  steps: readonly V3StepItem[];
  faqs: readonly V3FaqItem[];
  canonicalPath?: CanonicalPath;
  breadcrumbName?: string;
  siteConfig?: SiteConfig;
}) {
  const url = canonicalPath ? canonicalUrl(canonicalPath, siteConfig) : null;
  const home = canonicalUrl("/", siteConfig);
  const breadcrumb =
    url && canonicalPath && canonicalPath !== "/"
      ? {
          "@type": "BreadcrumbList",
          "@id": `${url}#breadcrumb`,
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: ALL_CANONICAL_LABELS["/"],
              item: home,
            },
            ...(isSocialDetail(canonicalPath)
              ? [
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "Social Media",
                    item: canonicalUrl("/social-media", siteConfig),
                  },
                ]
              : []),
            {
              "@type": "ListItem",
              position: isSocialDetail(canonicalPath) ? 3 : 2,
              name: breadcrumbName ?? ALL_CANONICAL_LABELS[canonicalPath] ?? appName,
              item: url,
            },
          ],
        }
      : null;

  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebSite",
      name: SITE_NAME,
      alternateName: "Image Aspect Ratio",
      inLanguage: "en",
      sameAs: [REPOSITORY_URL],
      author: MAINTAINER,
      ...(home ? { "@id": `${home}#website`, url: home } : {}),
    },
    {
      "@type": "WebApplication",
      name: appName,
      description,
      inLanguage: "en",
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Any (browser-based)",
      browserRequirements: "Requires JavaScript and HTML5 Canvas in a modern browser",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      author: MAINTAINER,
      dateModified: CONTENT_UPDATED,
      ...(url ? { "@id": `${url}#app`, url, mainEntityOfPage: { "@id": `${url}#page` } } : {}),
    },
    {
      "@type": "WebPage",
      name: pageTitle,
      description,
      inLanguage: "en",
      dateModified: CONTENT_UPDATED,
      ...(url ? { "@id": `${url}#page`, url, mainEntity: { "@id": `${url}#app` } } : {}),
      ...(home ? { isPartOf: { "@id": `${home}#website` } } : {}),
      ...(breadcrumb ? { breadcrumb: { "@id": breadcrumb["@id"] } } : {}),
    },
    ...(breadcrumb ? [breadcrumb] : []),
    {
      "@type": "HowTo",
      name: howToTitle,
      step: steps.map((s, idx) => ({
        "@type": "HowToStep",
        position: idx + 1,
        name: s.title,
        text: s.description,
      })),
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map(f => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.answer,
        },
      })),
    },
  ];

  return [
    {
      type: "application/ld+json",
      children: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(
        /</g,
        "\\u003c",
      ),
    },
  ];
}

/**
 * Shared head() builder for /v3/* preview routes.
 * Emits full Open Graph, Twitter Card, canonical link (when VITE_SITE_URL is configured),
 * and structured data while enforcing noindex, nofollow on /v3/* preview paths.
 * When promoting a route from /v3/* to root, omit forceNoindex so VITE_SITE_INDEXABLE governs indexing.
 */
export function buildV3RouteHead({
  title,
  description,
  canonicalPath,
  appName,
  howToTitle,
  steps,
  faqs,
  breadcrumbName,
  forceNoindex = true,
  siteConfig = site,
}: {
  title: string;
  description: string;
  canonicalPath: CanonicalPath;
  appName: string;
  howToTitle: string;
  steps: readonly V3StepItem[];
  faqs: readonly V3FaqItem[];
  breadcrumbName?: string;
  forceNoindex?: boolean;
  siteConfig?: SiteConfig;
}) {
  return {
    meta: seoMeta(title, description, canonicalPath, { forceNoindex, config: siteConfig }),
    links: seoLinks(canonicalPath, siteConfig),
    scripts: buildV3StructuredData({
      appName,
      pageTitle: title,
      description,
      howToTitle,
      steps,
      faqs,
      canonicalPath,
      ...(breadcrumbName !== undefined ? { breadcrumbName } : {}),
      siteConfig,
    }),
  };
}

export function V3Editorial({
  overview,
  visualGuide,
  shortcuts,
  howTo,
  features,
  referenceSection,
  faq,
  relatedTools,
}: {
  overview: {
    eyebrow?: string;
    heading: string;
    lead: string;
  };
  visualGuide?: V3VisualGuide;
  shortcuts?: {
    eyebrow?: string;
    heading?: string;
    items: readonly V3ShortcutItem[];
  };
  howTo: {
    heading: string;
    steps: readonly V3StepItem[];
  };
  features: {
    heading: string;
    items: readonly V3FeatureItem[];
  };
  referenceSection?: ReactNode;
  faq: {
    heading?: string;
    items: readonly V3FaqItem[];
  };
  relatedTools: {
    heading?: string;
    items: readonly V3RelatedToolItem[];
  };
}) {
  return (
    <div className="v3-editorial" data-testid="v3-editorial">
      {/* 1. Overview Intro */}
      <section aria-labelledby="v3-overview-heading" className="space-y-3">
        <p className="v3-eyebrow">{overview.eyebrow ?? "Overview"}</p>
        <h2
          id="v3-overview-heading"
          className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
        >
          {overview.heading}
        </h2>
        <p className="max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
          {overview.lead}
        </p>
      </section>

      {/* 1b. Optional Real Visual Comparison / Annotated Workflow Card */}
      {visualGuide && (
        <section aria-labelledby="v3-visual-guide-heading" className="space-y-4">
          <div className="space-y-1">
            <p className="v3-eyebrow">{visualGuide.eyebrow ?? "Visual Comparison"}</p>
            <h2
              id="v3-visual-guide-heading"
              className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl"
            >
              {visualGuide.heading}
            </h2>
          </div>
          <figure className="v3-card overflow-hidden p-3 sm:p-4">
            <img
              src={visualGuide.src}
              width={visualGuide.width}
              height={visualGuide.height}
              alt={visualGuide.alt}
              loading="lazy"
              decoding="async"
              className="h-auto w-full rounded-lg border border-border/60"
            />
            {visualGuide.caption && (
              <figcaption className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
                {visualGuide.caption}
              </figcaption>
            )}
          </figure>
        </section>
      )}

      {/* 2. How to Use (3-Column Horizontal Step Cards) */}
      <section aria-labelledby="v3-howto-heading" className="space-y-5">
        <div className="space-y-1">
          <p className="v3-eyebrow">Workflow</p>
          <h2
            id="v3-howto-heading"
            className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl"
          >
            {howTo.heading}
          </h2>
        </div>

        <ol className="grid gap-4 md:grid-cols-3">
          {howTo.steps.map((step, idx) => (
            <li key={step.title} className="v3-card flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="v3-step-badge" aria-hidden="true">
                  {idx + 1}
                </span>
                <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
                  {step.title}
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </li>
          ))}
        </ol>

        {shortcuts && shortcuts.items.length > 0 && (
          <div
            className="v3-card flex flex-wrap items-center gap-x-5 gap-y-2.5 py-3.5"
            aria-label={shortcuts.heading ?? "Keyboard shortcuts"}
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {shortcuts.heading ?? "Keyboard Shortcuts"}
            </span>
            {shortcuts.items.map(item => (
              <span key={item.action} className="inline-flex items-center gap-1.5 text-xs">
                <span className="inline-flex items-center gap-1">
                  {item.keys.map(k => (
                    <kbd
                      key={k}
                      className="num rounded border border-border bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-foreground shadow-2xs"
                    >
                      {k}
                    </kbd>
                  ))}
                </span>
                <span className="text-muted-foreground">{item.action}</span>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* 3. Features Grid (2x3 Checkmark Cards) */}
      <section aria-labelledby="v3-features-heading" className="space-y-5">
        <div className="space-y-1">
          <p className="v3-eyebrow">Capabilities</p>
          <h2
            id="v3-features-heading"
            className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl"
          >
            {features.heading}
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {features.items.map(feat => (
            <div key={feat.title} className="v3-card flex items-start gap-3.5">
              <span className="v3-check-badge mt-0.5" aria-hidden="true">
                <Check className="h-3.5 w-3.5 stroke-[2.4]" />
              </span>
              <div className="min-w-0 space-y-1">
                <h3 className="text-[15px] font-semibold text-foreground">{feat.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feat.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Optional Domain Reference Table / Interactive Presets */}
      {referenceSection}

      {/* 5. Always-Expanded Static FAQ Cards (Zero Hidden Accordions) */}
      <section aria-labelledby="v3-faq-heading" className="space-y-5" data-testid="v3-faq-section">
        <div className="space-y-1">
          <p className="v3-eyebrow">FAQ</p>
          <h2
            id="v3-faq-heading"
            className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl"
          >
            {faq.heading ?? "Frequently Asked Questions"}
          </h2>
        </div>

        <div className="space-y-3.5">
          {faq.items.map(item => (
            <article key={item.question} className="v3-card space-y-2">
              <h3 className="text-[15px] font-semibold text-foreground">{item.question}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.richAnswer ?? item.answer}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* 6. Related Sibling Tools Grid */}
      <section
        aria-labelledby="v3-related-heading"
        className="space-y-5"
        data-testid="v3-related-tools"
      >
        <div className="space-y-1">
          <p className="v3-eyebrow">Explore Suite</p>
          <h2
            id="v3-related-heading"
            className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl"
          >
            {relatedTools.heading ?? "Related Tools"}
          </h2>
        </div>

        <nav aria-label="Related V3 tools" className="grid gap-4 sm:grid-cols-3">
          {relatedTools.items.map(tool => (
            <Link
              key={tool.to}
              to={tool.to}
              className="v3-card v3-card--interactive group flex flex-col justify-between gap-3"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="v3-tool-icon" aria-hidden="true">
                    {tool.icon}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    {tool.badge && <span className="v3-nav-tag">{tool.badge}</span>}
                    <ArrowUpRight
                      aria-hidden="true"
                      className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
                    />
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-[15px] font-semibold text-foreground">{tool.title}</h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {tool.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </nav>
      </section>
    </div>
  );
}
