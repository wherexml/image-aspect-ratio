import type { QueryClient } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import { footerInfoLinks, footerSocialLinks, footerToolLinks } from "@/lib/internal-links";
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
    scripts: [
      { children: themeInitScript },
      ...(analyticsScript ? [{ children: analyticsScript }] : []),
      ...(geoAnalyticsScript ? [{ children: geoAnalyticsScript }] : []),
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico?v=white-20261027",
        sizes: "16x16 32x32 48x48 64x64 96x96 128x128 256x256",
      },
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
  return (
    <>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <footer className="site-footer mt-16 bg-muted text-sm text-muted-foreground">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6">
          <nav aria-labelledby="footer-tools" className="footer-group">
            <h2 id="footer-tools">Tools &amp; guides</h2>
            {footerToolLinks.map((link) => (
              <Link key={link.to} to={link.to}>
                {link.label}
              </Link>
            ))}
          </nav>
          <nav aria-labelledby="footer-social" className="footer-group">
            <h2 id="footer-social">Social platforms</h2>
            {footerSocialLinks.map((link) => (
              <Link key={link.to} to={link.to}>
                {link.label}
              </Link>
            ))}
          </nav>
          <nav aria-labelledby="footer-info" className="footer-group">
            <h2 id="footer-info">Information</h2>
            {footerInfoLinks.map((link) => (
              <Link key={link.to} to={link.to}>
                {link.label}
              </Link>
            ))}
            <a href={REPOSITORY_URL}>Source</a>
          </nav>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs sm:col-span-3">
            <span className="byline">
              Maintained by{" "}
              <a rel="author" href={MAINTAINER.url} className="hover:text-foreground">
                {MAINTAINER.name}
              </a>
            </span>
            <span>
              Updated <time dateTime={CONTENT_UPDATED}>{CONTENT_UPDATED}</time>
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
