import type { QueryClient } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useLocation,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import { CONTENT_UPDATED, MAINTAINER, REPOSITORY_URL } from "@/lib/seo";

import { analyticsScript, geoAnalyticsScript } from "../lib/analytics";

import "../styles.css";
import { themeInitScript } from "../components/ThemeControl";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient?: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
    ],
    scripts: [{ children: themeInitScript }, ...(analyticsScript ? [{ children: analyticsScript }] : []), ...(geoAnalyticsScript ? [{ children: geoAnalyticsScript }] : [])],
    links: [
      { rel: "icon", href: "/favicon.ico?v=white-20261027", sizes: "16x16 32x32 48x48 64x64 96x96 128x128 256x256" },
      { rel: "icon", href: "/favicon-96.png", type: "image/png", sizes: "96x96" },
      { rel: "icon", href: "/favicon-192.png", type: "image/png", sizes: "192x192" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
      { rel: "icon", href: "/favicon.svg?v=white-20261027", type: "image/svg+xml", sizes: "any" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { pathname } = useLocation();
  const isV3 = pathname === "/v3" || pathname.startsWith("/v3/");

  return (
    <>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <footer className="site-footer mt-16 bg-muted text-sm text-muted-foreground">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6">
          {isV3 ? (
            <>
              <nav aria-labelledby="footer-tools" className="footer-group">
                <p id="footer-tools" className="site-footer-heading">Image &amp; screenshot tools</p>
                <Link to="/v3">Image Aspect Ratio Calculator</Link>
                <Link to="/v3/make-image-square">Make image square</Link>
                <Link to="/v3/change-image-aspect-ratio">Change image aspect ratio</Link>
                <Link to="/v3/add-padding-to-image">Add padding &amp; white border</Link>
                <Link to="/v3/round-corners-image">Round corners &amp; circle crop</Link>
                <Link to="/v3/screenshot-beautifier">Screenshot Beautifier</Link>
                <Link to="/v3/annotate-screenshot">Annotate screenshot</Link>
                <Link to="/v3/blur-screenshot">Blur &amp; pixelate screenshot</Link>
                <Link to="/v3/calculator">Aspect ratio calculator</Link>
                <Link to="/v3/video-aspect-ratio">Video aspect ratio simulator</Link>
              </nav>
              <nav aria-labelledby="footer-social" className="footer-group">
                <p id="footer-social" className="site-footer-heading">Social &amp; safe zones</p>
                <Link to="/v3/safe-zone-checker">TikTok, Reels &amp; Shorts safe zone</Link>
                <Link to="/v3/instagram-grid-splitter">Instagram 3:4 grid &amp; carousel splitter</Link>
                <Link to="/v3/fit-photo-to-instagram">Fit photo to Instagram (no crop)</Link>
                <Link to="/v3/og-image-safe-zone">OG image 1200×630 safe zone tester</Link>
                <Link to="/social-media">All social media sizes</Link>
                <Link to="/tiktok-aspect-ratio">TikTok aspect ratio</Link>
                <Link to="/instagram-reel-aspect-ratio">Instagram Reel aspect ratio</Link>
                <Link to="/youtube-shorts-aspect-ratio">YouTube Shorts aspect ratio</Link>
                <Link to="/youtube-aspect-ratio">YouTube aspect ratio</Link>
              </nav>
              <nav aria-labelledby="footer-info" className="footer-group">
                <p id="footer-info" className="site-footer-heading">Guides &amp; information</p>
                <Link to="/what-is-aspect-ratio">What is aspect ratio?</Link>
                <Link to="/exact-fractions-vs-rounded-pixels">Exact fractions vs rounded pixels</Link>
                <Link to="/16-9-aspect-ratio-calculator">16:9 aspect ratio calculator</Link>
                <Link to="/ultrawide-aspect-ratio-calculator">Ultrawide 21:9 / 43:18 calculator</Link>
                <Link to="/about">About</Link>
                <Link to="/contact">Contact</Link>
                <Link to="/privacy">Privacy</Link>
                <Link to="/terms">Terms</Link>
                <a href={REPOSITORY_URL}>Source</a>
              </nav>
            </>
          ) : (
            <>
              <nav aria-labelledby="footer-tools" className="footer-group">
                <p id="footer-tools" className="site-footer-heading">Tools &amp; guides</p>
                <Link to="/">Image Aspect Ratio</Link>
                <Link to="/calculator">Aspect ratio calculator</Link>
                <Link to="/make-image-square">Make image square</Link>
                <Link to="/change-image-aspect-ratio">Change image aspect ratio</Link>
                <Link to="/screenshot-beautifier">Screenshot Beautifier</Link>
                <Link to="/16-9-aspect-ratio-calculator">16:9 aspect ratio calculator</Link>
                <Link to="/video-aspect-ratio">Video ratio calculator</Link>
                <Link to="/ultrawide-aspect-ratio-calculator">Ultrawide calculator</Link>
                <Link to="/what-is-aspect-ratio">What is aspect ratio?</Link>
                <Link to="/exact-fractions-vs-rounded-pixels">Exact fractions vs rounded pixels</Link>
              </nav>
              <nav aria-labelledby="footer-social" className="footer-group">
                <p id="footer-social" className="site-footer-heading">Social platforms</p>
                <Link to="/social-media">All social media sizes</Link>
                <Link to="/tiktok-aspect-ratio">TikTok aspect ratio</Link>
                <Link to="/youtube-aspect-ratio">YouTube aspect ratio</Link>
                <Link to="/youtube-shorts-aspect-ratio">YouTube Shorts aspect ratio</Link>
                <Link to="/instagram-reel-aspect-ratio">Instagram Reel aspect ratio</Link>
                <Link to="/instagram-story-aspect-ratio">Instagram Story aspect ratio</Link>
              </nav>
              <nav aria-labelledby="footer-info" className="footer-group">
                <p id="footer-info" className="site-footer-heading">Information</p>
                <Link to="/about">About</Link>
                <Link to="/contact">Contact</Link>
                <Link to="/privacy">Privacy</Link>
                <Link to="/terms">Terms</Link>
                <a href={REPOSITORY_URL}>Source</a>
              </nav>
            </>
          )}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs sm:col-span-3">
            <span className="byline">Maintained by <a rel="author" href={MAINTAINER.url} className="hover:text-foreground">{MAINTAINER.name}</a></span>
            <span>Updated <time dateTime={CONTENT_UPDATED}>{CONTENT_UPDATED}</time></span>
          </div>
        </div>
      </footer>
    </>
  );
}
