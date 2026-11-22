import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control";
import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode, type SyntheticEvent } from "react";
import { ChevronDown, Instagram, Monitor, Moon, Music2, Sun, Youtube } from "lucide-react";
import type { SitePath } from "@/lib/site";

type ThemePref = "system" | "light" | "dark";
const THEME_STORAGE_KEY = "arc-theme";

function applyTheme(pref: ThemePref) {
  const dark =
    pref === "dark" ||
    (pref === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

function V2ThemeControl() {
  const [ready, setReady] = useState(false);
  const [pref, setPref] = useState<ThemePref>("system");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemePref | null;
      if (saved === "light" || saved === "dark") setPref(saved);
    } catch {
      // Ignore restricted storage environments.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    applyTheme(pref);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, pref);
    } catch {
      // Ignore restricted storage environments.
    }
    if (pref !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => applyTheme("system");
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [pref, ready]);

  return (
    <SegmentedControl
      aria-label="Color theme"
      value={pref}
      onValueChange={val => {
        if (val === "system" || val === "light" || val === "dark") setPref(val);
      }}
      className="v2-seg v2-seg--sm"
    >
      <SegmentedControlIndicator className="v2-seg-indicator" />
      <SegmentedControlItem value="system" className="v2-seg-item">
        <Monitor className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="sr-only sm:not-sr-only">System</span>
      </SegmentedControlItem>
      <SegmentedControlItem value="light" className="v2-seg-item">
        <Sun className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="sr-only sm:not-sr-only">Light</span>
      </SegmentedControlItem>
      <SegmentedControlItem value="dark" className="v2-seg-item">
        <Moon className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="sr-only sm:not-sr-only">Dark</span>
      </SegmentedControlItem>
    </SegmentedControl>
  );
}

export type V2RoutePath =
  | "/v2"
  | "/v2/image-aspect-ratio"
  | "/v2/make-image-square"
  | "/v2/change-image-aspect-ratio"
  | "/v2/screenshot-beautifier"
  | "/v2/calculator"
  | "/v2/16-9-aspect-ratio-calculator"
  | "/v2/video-aspect-ratio"
  | "/v2/ultrawide-aspect-ratio-calculator"
  | "/v2/social-media"
  | "/v2/instagram-reel-aspect-ratio"
  | "/v2/instagram-story-aspect-ratio"
  | "/v2/youtube-aspect-ratio"
  | "/v2/youtube-shorts-aspect-ratio"
  | "/v2/tiktok-aspect-ratio";

const V2_IMAGE_TOOLS = [
  { to: "/v2/image-aspect-ratio", label: "Image ratio" },
  { to: "/v2/make-image-square", label: "Make square" },
  { to: "/v2/change-image-aspect-ratio", label: "Change ratio" },
  { to: "/v2/screenshot-beautifier", label: "Screenshot Studio" },
] as const;

const V2_CALC_TOOLS = [
  { to: "/v2/calculator", label: "All ratios" },
  { to: "/v2/16-9-aspect-ratio-calculator", label: "16:9" },
] as const;

const V2_DIRECT_TOOLS = [
  { to: "/v2/video-aspect-ratio", label: "Video" },
  { to: "/v2/ultrawide-aspect-ratio-calculator", label: "Ultrawide" },
] as const;

const V2_SOCIAL_GROUPS = [
  {
    name: "Instagram",
    icon: Instagram,
    links: [
      { to: "/v2/instagram-reel-aspect-ratio", label: "Reels", ratio: "9:16" },
      { to: "/v2/instagram-story-aspect-ratio", label: "Stories", ratio: "9:16" },
    ],
  },
  {
    name: "YouTube",
    icon: Youtube,
    links: [
      { to: "/v2/youtube-aspect-ratio", label: "Video", ratio: "16:9" },
      { to: "/v2/youtube-shorts-aspect-ratio", label: "Shorts", ratio: "9:16" },
    ],
  },
  {
    name: "TikTok",
    icon: Music2,
    links: [{ to: "/v2/tiktok-aspect-ratio", label: "Video", ratio: "9:16" }],
  },
] as const;

const exact = { exact: true, includeSearch: false };

function V2DropdownNavigation() {
  const { pathname } = useLocation();
  const navRef = useRef<HTMLElement>(null);

  const normalizedPath = pathname === "/v2/" || pathname === "/v2" ? "/v2/image-aspect-ratio" : pathname;
  const imageActive = V2_IMAGE_TOOLS.some(t => t.to === normalizedPath);
  const calcActive = V2_CALC_TOOLS.some(t => t.to === normalizedPath);
  const socialActive =
    normalizedPath === "/v2/social-media" ||
    V2_SOCIAL_GROUPS.some(g => g.links.some(l => l.to === normalizedPath));

  const mobileLabel =
    V2_IMAGE_TOOLS.find(t => t.to === normalizedPath)?.label ??
    (normalizedPath === "/v2/calculator"
      ? "Calculator"
      : normalizedPath === "/v2/16-9-aspect-ratio-calculator"
        ? "16:9 Calculator"
        : V2_DIRECT_TOOLS.find(t => t.to === normalizedPath)?.label ??
          V2_SOCIAL_GROUPS.flatMap(g => g.links.map(l => ({ to: l.to, label: `${g.name} ${l.label}` }))).find(
            t => t.to === normalizedPath,
          )?.label ??
          (socialActive ? "Social Media" : "Tools"));

  const closeAll = (except?: HTMLDetailsElement) => {
    navRef.current?.querySelectorAll("details[open]").forEach(el => {
      if (el !== except) (el as HTMLDetailsElement).open = false;
    });
  };

  useEffect(() => {
    closeAll();
  }, [pathname]);

  useEffect(() => {
    const onOutside = (e: Event) => {
      if (e.target instanceof Node && !navRef.current?.contains(e.target)) closeAll();
    };
    document.addEventListener("pointerdown", onOutside);
    document.addEventListener("focusin", onOutside);
    return () => {
      document.removeEventListener("pointerdown", onOutside);
      document.removeEventListener("focusin", onOutside);
    };
  }, []);

  const onToggle = (e: SyntheticEvent<HTMLDetailsElement>) => {
    if (e.currentTarget.open) closeAll(e.currentTarget);
  };

  return (
    <nav
      ref={navRef}
      aria-label="V2 Tools"
      className="v2-nav"
      onKeyDown={e => {
        if (e.key !== "Escape") return;
        const opened = navRef.current?.querySelector<HTMLDetailsElement>("details[open]");
        if (!opened) return;
        e.preventDefault();
        closeAll();
        opened.querySelector("summary")?.focus();
      }}
    >
      <div className="v2-nav-desktop">
        <details className="v2-nav-disclosure" onToggle={onToggle}>
          <summary
            className="v2-nav-item"
            data-active={imageActive ? "" : undefined}
            data-testid="v2-dropdown-image"
          >
            <span>Image</span>
            <ChevronDown aria-hidden="true" />
          </summary>
          <div className="v2-nav-menu" aria-label="Image tools">
            {V2_IMAGE_TOOLS.map(item => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={exact}
                aria-current={normalizedPath === item.to ? "page" : undefined}
                onClick={() => closeAll()}
                className="v2-nav-link whitespace-nowrap"
              >
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </details>

        <details className="v2-nav-disclosure" onToggle={onToggle}>
          <summary
            className="v2-nav-item"
            data-active={calcActive ? "" : undefined}
            data-testid="v2-dropdown-calculator"
          >
            <span>Calculator</span>
            <ChevronDown aria-hidden="true" />
          </summary>
          <div className="v2-nav-menu" aria-label="Calculator tools">
            {V2_CALC_TOOLS.map(item => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={exact}
                aria-current={normalizedPath === item.to ? "page" : undefined}
                onClick={() => closeAll()}
                className="v2-nav-link whitespace-nowrap"
              >
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </details>

        <Link
          to="/v2/video-aspect-ratio"
          activeOptions={exact}
          data-active={normalizedPath === "/v2/video-aspect-ratio" ? "" : undefined}
          onClick={() => closeAll()}
          className="v2-nav-item"
          data-testid="v2-link-video"
        >
          Video
        </Link>

        <details className="v2-nav-disclosure v2-nav-disclosure--social" onToggle={onToggle}>
          <summary
            className="v2-nav-item"
            data-active={socialActive ? "" : undefined}
            data-testid="v2-dropdown-social"
          >
            <span>Social Media</span>
            <ChevronDown aria-hidden="true" />
          </summary>
          <div className="v2-nav-menu v2-nav-menu--social" aria-label="Social Media tools">
            <div className="grid gap-5 sm:grid-cols-3">
              {V2_SOCIAL_GROUPS.map(({ name, icon: Icon, links }) => (
                <section key={name} aria-label={name}>
                  <p className="mb-2 flex items-center gap-1.5 px-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    <Icon className="size-3.5 opacity-75" aria-hidden="true" />
                    <span>{name}</span>
                  </p>
                  <div className="grid gap-0.5">
                    {links.map(link => (
                      <Link
                        key={link.to}
                        to={link.to}
                        activeOptions={exact}
                        aria-current={normalizedPath === link.to ? "page" : undefined}
                        onClick={() => closeAll()}
                        className="v2-nav-link"
                      >
                        <span>{link.label}</span>
                        <span className="num text-[11px] opacity-60">{link.ratio}</span>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
            <div className="mt-3 border-t border-zinc-200 pt-2 dark:border-zinc-800">
              <Link
                to="/v2/social-media"
                activeOptions={exact}
                aria-current={normalizedPath === "/v2/social-media" ? "page" : undefined}
                onClick={() => closeAll()}
                className="v2-nav-link whitespace-nowrap"
              >
                <span>All platforms</span>
                <span aria-hidden="true" className="text-xs opacity-60">
                  →
                </span>
              </Link>
            </div>
          </div>
        </details>

        <Link
          to="/v2/ultrawide-aspect-ratio-calculator"
          activeOptions={exact}
          data-active={normalizedPath === "/v2/ultrawide-aspect-ratio-calculator" ? "" : undefined}
          onClick={() => closeAll()}
          className="v2-nav-item"
          data-testid="v2-link-ultrawide"
        >
          Ultrawide
        </Link>
      </div>

      <details className="v2-nav-mobile" onToggle={onToggle}>
        <summary className="v2-mobile-trigger" aria-label={`V2 Tools: ${mobileLabel}`}>
          <span className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Tool</span>
            <span>{mobileLabel}</span>
          </span>
          <ChevronDown aria-hidden="true" />
        </summary>
        <div className="v2-nav-menu v2-nav-menu--mobile" aria-label="All V2 tools">
          <p className="px-2.5 pt-1 pb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Image
          </p>
          {V2_IMAGE_TOOLS.map(item => (
            <Link
              key={item.to}
              to={item.to}
              aria-current={normalizedPath === item.to ? "page" : undefined}
              onClick={() => closeAll()}
              className="v2-nav-link whitespace-nowrap"
            >
              <span>{item.label}</span>
            </Link>
          ))}
          <p className="mt-2 px-2.5 pt-1 pb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Calculator & Video
          </p>
          {V2_CALC_TOOLS.map(item => (
            <Link
              key={item.to}
              to={item.to}
              aria-current={normalizedPath === item.to ? "page" : undefined}
              onClick={() => closeAll()}
              className="v2-nav-link whitespace-nowrap"
            >
              <span>{item.label}</span>
            </Link>
          ))}
          {V2_DIRECT_TOOLS.map(item => (
            <Link
              key={item.to}
              to={item.to}
              aria-current={normalizedPath === item.to ? "page" : undefined}
              onClick={() => closeAll()}
              className="v2-nav-link"
            >
              <span>{item.label}</span>
            </Link>
          ))}
          <p className="mt-2 px-2.5 pt-1 pb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Social Media
          </p>
          {V2_SOCIAL_GROUPS.flatMap(g =>
            g.links.map(l => (
              <Link
                key={l.to}
                to={l.to}
                aria-current={normalizedPath === l.to ? "page" : undefined}
                onClick={() => closeAll()}
                className="v2-nav-link"
              >
                <span>
                  {g.name} {l.label}
                </span>
                <span className="num text-[11px] opacity-60">{l.ratio}</span>
              </Link>
            )),
          )}
          <Link
            to="/v2/social-media"
            aria-current={normalizedPath === "/v2/social-media" ? "page" : undefined}
            onClick={() => closeAll()}
            className="v2-nav-link"
          >
            <span>All platforms</span>
          </Link>
        </div>
      </details>
    </nav>
  );
}

export function V2PageShell({
  title,
  v1To,
  hero,
  children,
}: {
  title: string;
  v1To: SitePath;
  hero?: { title: ReactNode; description: string };
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 pt-5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <Link
            to="/v2"
            aria-label="Image Aspect Ratio V2 home"
            className="flex items-center gap-2.5 font-display text-sm font-bold tracking-tight"
          >
            <img src="/brand-mark.svg" width="28" height="28" alt="" />
            <span>Image Aspect Ratio</span>
          </Link>
          {hero && (
            <span className="v2-badge" data-testid="v2-preview-badge">
              V2 Preview
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {hero && (
            <Link to={v1To} className="v2-compare-link" data-testid="v2-compare-v1">
              <span>Compare V1</span>
              <svg
                viewBox="0 0 14 14"
                aria-hidden="true"
                className="size-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4.2 9.8 9.8 4.2M5.2 4.2h4.6v4.6" />
              </svg>
            </Link>
          )}
          <V2ThemeControl />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <V2DropdownNavigation />

        {hero ? (
          <div className="mt-6">
            <h1 className="font-display text-[2.1rem] font-extrabold leading-[0.95] tracking-[-0.035em] sm:text-6xl">
              {hero.title}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
              {hero.description}
            </p>
          </div>
        ) : (
          <div className="v2-header-bar mt-5">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold tracking-[-0.02em] text-zinc-900 dark:text-zinc-100">
                {title}
              </h1>
              <span className="v2-badge" data-testid="v2-preview-badge">
                V2 Preview
              </span>
            </div>

            <Link to={v1To} className="v2-compare-link" data-testid="v2-compare-v1">
              <span>Compare V1</span>
              <svg
                viewBox="0 0 14 14"
                aria-hidden="true"
                className="size-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4.2 9.8 9.8 4.2M5.2 4.2h4.6v4.6" />
              </svg>
            </Link>
          </div>
        )}

        {children}
      </main>
    </div>
  );
}
