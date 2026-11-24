import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control";
import { Link, useLocation } from "@tanstack/react-router";
import { ChevronDown, Instagram, Monitor, Moon, Music2, Sun, Youtube } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode, type SyntheticEvent } from "react";
import type { V2RoutePath } from "@/components/v2/V2PageShell";
import { trackInteractionEvent } from "@/lib/tool-analytics";
import "./v3.css";

type ThemePref = "system" | "light" | "dark";
const THEME_STORAGE_KEY = "arc-theme";

function applyTheme(pref: ThemePref) {
  const dark =
    pref === "dark" ||
    (pref === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

function V3ThemeControl() {
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

const V3_IMAGE_TOOLS = [
  { to: "/", label: "Image ratio" },
  { to: "/make-image-square", label: "Make square" },
  { to: "/change-image-aspect-ratio", label: "Change ratio" },
  { to: "/add-padding-to-image", label: "Add padding & border" },
  { to: "/round-corners-image", label: "Round corners & circle" },
  { to: "/screenshot-beautifier", label: "Screenshot Beautifier" },
  { to: "/annotate-screenshot", label: "Annotate screenshot" },
  { to: "/blur-screenshot", label: "Blur screenshot" },
] as const;

const V3_CALC_TOOLS = [
  { to: "/calculator", label: "All ratios" },
  { to: "/16-9-aspect-ratio-calculator", label: "16:9" },
] as const;

const V3_DIRECT_TOOLS = [
  { to: "/video-aspect-ratio", label: "Video" },
  { to: "/ultrawide-aspect-ratio-calculator", label: "Ultrawide" },
] as const;

const V3_SOCIAL_GROUPS = [
  {
    name: "Instagram",
    icon: Instagram,
    links: [
      {
        to: "/instagram-grid-splitter",
        label: "Grid & Carousel",
        mobileLabel: "Instagram Grid & Carousel",
        ratio: "3:4",
      },
      {
        to: "/fit-photo-to-instagram",
        label: "Fit Photo",
        mobileLabel: "Instagram Fit Photo",
        ratio: "4:5",
      },
      {
        to: "/instagram-reel-aspect-ratio",
        label: "Reels",
        mobileLabel: "Instagram Reels",
        ratio: "9:16",
      },
      {
        to: "/instagram-story-aspect-ratio",
        label: "Stories",
        mobileLabel: "Instagram Stories",
        ratio: "9:16",
      },
    ],
  },
  {
    name: "YouTube",
    icon: Youtube,
    links: [
      {
        to: "/youtube-aspect-ratio",
        label: "Video",
        mobileLabel: "YouTube Video",
        ratio: "16:9",
      },
      {
        to: "/youtube-shorts-aspect-ratio",
        label: "Shorts",
        mobileLabel: "YouTube Shorts",
        ratio: "9:16",
      },
    ],
  },
  {
    name: "TikTok & Cards",
    icon: Music2,
    links: [
      {
        to: "/tiktok-aspect-ratio",
        label: "TikTok Video",
        mobileLabel: "TikTok Video",
        ratio: "9:16",
      },
      {
        to: "/safe-zone-checker",
        label: "Safe Zones",
        mobileLabel: "Safe Zones",
        ratio: "9:16",
      },
      {
        to: "/og-image-safe-zone",
        label: "OG Safe Zone",
        mobileLabel: "OG Safe Zone",
        ratio: "1.91:1",
      },
    ],
  },
] as const;

const exact = { exact: true, includeSearch: false };

function V3DropdownNavigation() {
  const { pathname } = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const mobileDetailsRef = useRef<HTMLDetailsElement>(null);
  const prevPathnameRef = useRef(pathname);
  const [mobileOpen, setMobileOpen] = useState(false);

  const normalizedPath =
    pathname === "" || pathname === "/" || pathname === "/image-aspect-ratio"
      ? "/"
      : pathname.replace(/\/+$/, "");
  const imageActive =
    V3_IMAGE_TOOLS.some(t => t.to === normalizedPath) ||
    normalizedPath === "/pixelate-image";
  const calcActive = V3_CALC_TOOLS.some(t => t.to === normalizedPath);
  const socialActive =
    normalizedPath === "/social-media" ||
    V3_SOCIAL_GROUPS.some(g => g.links.some(l => l.to === normalizedPath));

  const socialLinks: { label: string; to: string }[] = V3_SOCIAL_GROUPS.flatMap(g =>
    g.links.map(l => ({ label: l.mobileLabel, to: l.to })),
  );
  const socialMatch = socialLinks.find(l => l.to === normalizedPath);
  const mobileLabel =
    V3_IMAGE_TOOLS.find(t => t.to === normalizedPath)?.label ??
    socialMatch?.label ??
    (normalizedPath === "/video-aspect-ratio"
      ? "Video"
      : normalizedPath === "/ultrawide-aspect-ratio-calculator"
        ? "Ultrawide"
        : normalizedPath === "/16-9-aspect-ratio-calculator"
          ? "16:9 Calculator"
          : normalizedPath === "/calculator"
            ? "Calculator"
            : normalizedPath === "/social-media"
              ? "Social Media"
              : "Tools");

  const closeAll = (except?: HTMLDetailsElement) => {
    navRef.current?.querySelectorAll("details[open]").forEach(el => {
      if (el !== except) (el as HTMLDetailsElement).open = false;
    });
    if (!except || !except.classList.contains("v2-nav-mobile")) {
      setMobileOpen(false);
    }
  };

  const handleNavClick = (to: string, navSurface: "desktop" | "mobile") => {
    if (to !== normalizedPath) {
      trackInteractionEvent("nav_tool_switch", {
        from_path: normalizedPath,
        to_path: to,
        nav_surface: navSurface,
      });
    }
    closeAll();
  };

  useEffect(() => {
    if (mobileDetailsRef.current?.open) {
      setMobileOpen(true);
    }
  }, []);

  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      closeAll();
    }
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
      aria-label="Tools"
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
            data-testid="v3-dropdown-image"
          >
            <span>Image</span>
            <ChevronDown aria-hidden="true" />
          </summary>
          <div className="v2-nav-menu" aria-label="Image tools">
            {V3_IMAGE_TOOLS.map(item => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={exact}
                aria-current={normalizedPath === item.to ? "page" : undefined}
                onClick={() => handleNavClick(item.to, "desktop")}
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
            data-testid="v3-dropdown-calculator"
          >
            <span>Calculator</span>
            <ChevronDown aria-hidden="true" />
          </summary>
          <div className="v2-nav-menu" aria-label="Calculator tools">
            {V3_CALC_TOOLS.map(item => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={exact}
                aria-current={normalizedPath === item.to ? "page" : undefined}
                onClick={() => handleNavClick(item.to, "desktop")}
                className="v2-nav-link whitespace-nowrap"
              >
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </details>

        <Link
          to="/video-aspect-ratio"
          activeOptions={exact}
          aria-current={normalizedPath === "/video-aspect-ratio" ? "page" : undefined}
          data-active={normalizedPath === "/video-aspect-ratio" ? "" : undefined}
          onClick={() => handleNavClick("/video-aspect-ratio", "desktop")}
          className="v2-nav-item"
        >
          Video
        </Link>

        <details className="v2-nav-disclosure v2-nav-disclosure--social" onToggle={onToggle}>
          <summary
            className="v2-nav-item"
            data-active={socialActive ? "" : undefined}
            data-testid="v3-dropdown-social"
          >
            <span>Social Media</span>
            <ChevronDown aria-hidden="true" />
          </summary>
          <div className="v2-nav-menu v2-nav-menu--social" aria-label="Social Media tools">
            <div className="grid gap-6 sm:grid-cols-3">
              {V3_SOCIAL_GROUPS.map(({ name, icon: Icon, links }) => (
                <section key={name} aria-label={name}>
                  <p className="mb-2 flex items-center gap-1.5 px-2 text-xs font-semibold whitespace-nowrap text-zinc-900 dark:text-zinc-100">
                    <Icon className="size-3.5 shrink-0 opacity-75" aria-hidden="true" />
                    <span>{name}</span>
                  </p>
                  <div className="grid gap-0.5">
                    {links.map(link => (
                      <Link
                        key={link.to}
                        to={link.to}
                        activeOptions={exact}
                        aria-current={normalizedPath === link.to ? "page" : undefined}
                        onClick={() => handleNavClick(link.to, "desktop")}
                        className="v2-nav-link whitespace-nowrap"
                      >
                        <span>{link.label}</span>
                        <span className="num shrink-0 text-[11px] opacity-60">{link.ratio}</span>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
            <div className="mt-3 border-t border-zinc-200 pt-2 dark:border-zinc-800">
              <Link
                to="/social-media"
                activeOptions={exact}
                aria-current={normalizedPath === "/social-media" ? "page" : undefined}
                onClick={() => handleNavClick("/social-media", "desktop")}
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
          to="/ultrawide-aspect-ratio-calculator"
          activeOptions={exact}
          aria-current={normalizedPath === "/ultrawide-aspect-ratio-calculator" ? "page" : undefined}
          data-active={normalizedPath === "/ultrawide-aspect-ratio-calculator" ? "" : undefined}
          onClick={() => handleNavClick("/ultrawide-aspect-ratio-calculator", "desktop")}
          className="v2-nav-item"
        >
          Ultrawide
        </Link>
      </div>

      <details
        ref={mobileDetailsRef}
        className="v2-nav-mobile"
        onToggle={e => {
          const open = e.currentTarget.open;
          setMobileOpen(open);
          if (open) closeAll(e.currentTarget);
        }}
      >
        <summary className="v2-mobile-trigger" aria-label={`Tools: ${mobileLabel}`}>
          <span className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Tool</span>
            <span>{mobileLabel}</span>
          </span>
          <ChevronDown aria-hidden="true" />
        </summary>
        {mobileOpen && (
          <div className="v2-nav-menu v2-nav-menu--mobile" aria-label="All tools">
            <p className="px-2.5 pt-1 pb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Image
            </p>
            {V3_IMAGE_TOOLS.map(item => (
              <Link
                key={item.to}
                to={item.to}
                aria-current={normalizedPath === item.to ? "page" : undefined}
                onClick={() => handleNavClick(item.to, "mobile")}
                className="v2-nav-link whitespace-nowrap"
              >
                <span>{item.label}</span>
              </Link>
            ))}
            <p className="mt-2 px-2.5 pt-1 pb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Calculator &amp; Video
            </p>
            {V3_CALC_TOOLS.map(item => (
              <Link
                key={item.to}
                to={item.to}
                aria-current={normalizedPath === item.to ? "page" : undefined}
                onClick={() => handleNavClick(item.to, "mobile")}
                className="v2-nav-link whitespace-nowrap"
              >
                <span>{item.label}</span>
              </Link>
            ))}
            {V3_DIRECT_TOOLS.map(item => (
              <Link
                key={item.to}
                to={item.to}
                aria-current={normalizedPath === item.to ? "page" : undefined}
                onClick={() => handleNavClick(item.to, "mobile")}
                className="v2-nav-link whitespace-nowrap"
              >
                <span>{item.label}</span>
              </Link>
            ))}
            <p className="mt-2 px-2.5 pt-1 pb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Social Media
            </p>
            {V3_SOCIAL_GROUPS.flatMap(g =>
              g.links.map(l => (
                <Link
                  key={l.to}
                  to={l.to}
                  aria-current={normalizedPath === l.to ? "page" : undefined}
                  onClick={() => handleNavClick(l.to, "mobile")}
                  className="v2-nav-link whitespace-nowrap"
                >
                  <span>{l.mobileLabel}</span>
                  <span className="num shrink-0 text-[11px] opacity-60">{l.ratio}</span>
                </Link>
              )),
            )}
            <Link
              to="/social-media"
              aria-current={normalizedPath === "/social-media" ? "page" : undefined}
              onClick={() => handleNavClick("/social-media", "mobile")}
              className="v2-nav-link whitespace-nowrap"
            >
              <span>All platforms</span>
              <span aria-hidden="true" className="text-xs opacity-60">
                →
              </span>
            </Link>
          </div>
        )}
      </details>
    </nav>
  );
}

export function V3PageShell({
  title,
  compareV2To,
  hero,
  children,
}: {
  title: string;
  compareV2To?: V2RoutePath;
  hero?: { title: ReactNode; description: string };
  children: ReactNode;
}) {
  return (
    <div className="v3-root min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 pt-5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <Link
            to="/"
            aria-label="Image Aspect Ratio home"
            className="flex items-center gap-2.5 font-display text-sm font-bold tracking-tight"
          >
            <img src="/brand-mark.svg" width="28" height="28" alt="" />
            <span>Image Aspect Ratio</span>
          </Link>
          {hero && compareV2To && (
            <span className="v2-badge" data-testid="v3-preview-badge">
              V3 Preview
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {hero && compareV2To && (
            <Link to={compareV2To} className="v2-compare-link" data-testid="v3-compare-v2">
              <span>Compare V2</span>
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
          <V3ThemeControl />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <V3DropdownNavigation />

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
              {compareV2To && (
                <span className="v2-badge" data-testid="v3-preview-badge">
                  V3 Preview
                </span>
              )}
            </div>

            {compareV2To && (
              <Link to={compareV2To} className="v2-compare-link" data-testid="v3-compare-v2">
                <span>Compare V2</span>
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
          </div>
        )}

        {children}
      </main>
    </div>
  );
}
