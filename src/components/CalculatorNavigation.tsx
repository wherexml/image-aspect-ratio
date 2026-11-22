import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useRef, type SyntheticEvent } from "react";
import { ChevronDown } from "lucide-react";
import { SocialPlatformLinks, SOCIAL_GROUPS } from "./SocialPlatformLinks";

const imageTools = [
  { to: "/", label: "Image ratio" },
  { to: "/make-image-square", label: "Make square" },
  { to: "/change-image-aspect-ratio", label: "Change ratio" },
  { to: "/screenshot-beautifier", label: "Screenshot Beautifier" },
] as const;

// Calculator section: the general calculator and its fixed-ratio 16:9 shortcut.
const calculatorTools = [
  { to: "/calculator", label: "All ratios" },
  { to: "/16-9-aspect-ratio-calculator", label: "16:9" },
] as const;
// Mobile trigger names for the calculator destinations.
const calculatorTitles: Record<string, string> = { "/calculator": "Calculator", "/16-9-aspect-ratio-calculator": "16:9 Calculator" };

const directTools = [
  { to: "/video-aspect-ratio", label: "Video" },
  { to: "/ultrawide-aspect-ratio-calculator", label: "Ultrawide" },
] as const;

const exact = { exact: true, includeSearch: false };

export function CalculatorNavigation() {
  const { pathname } = useLocation();
  const navigation = useRef<HTMLElement>(null);
  const imageActive = imageTools.some(tool => tool.to === pathname);
  const calculatorActive = calculatorTools.some(tool => tool.to === pathname);
  const socialActive = pathname === "/social-media" || SOCIAL_GROUPS.some(group => group.links.some(link => link.to === pathname));
  const socialTool = SOCIAL_GROUPS.flatMap(group => group.links.map(link => ({ to: link.to, label: `${group.name} ${link.label}` }))).find(tool => tool.to === pathname);
  const currentLabel = calculatorTitles[pathname] ?? [...imageTools, ...directTools].find(tool => tool.to === pathname)?.label ?? socialTool?.label ?? (socialActive ? "Social Media" : "Tools");
  const close = (except?: HTMLDetailsElement) => {
    navigation.current?.querySelectorAll("details[open]").forEach(menu => {
      if (menu !== except) (menu as HTMLDetailsElement).open = false;
    });
  };

  useEffect(() => { close(); }, [pathname]);
  useEffect(() => {
    const outside = (event: Event) => {
      if (event.target instanceof Node && !navigation.current?.contains(event.target)) close();
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("focusin", outside);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("focusin", outside);
    };
  }, []);

  const disclosure = {
    onToggle: (event: SyntheticEvent<HTMLDetailsElement>) => {
      if (event.currentTarget.open) close(event.currentTarget);
    },
  };
  const destination = ({ to, label }: typeof imageTools[number] | typeof calculatorTools[number] | typeof directTools[number], className = "tool-nav-link") =>
    <Link key={to} to={to} activeOptions={exact} onClick={() => close()} className={className}>{label}</Link>;

  return <nav ref={navigation} aria-label="Tools" className="tool-nav"
    onKeyDown={event => {
      if (event.key !== "Escape") return;
      const opened = navigation.current?.querySelector<HTMLDetailsElement>("details[open]");
      if (!opened) return;
      event.preventDefault();
      close();
      opened.querySelector("summary")?.focus();
    }}>
    <div className="tool-nav-desktop">
      <details className="tool-disclosure" {...disclosure}>
        <summary className="tool-nav-link" aria-current={imageActive ? "location" : undefined}>
          Image <ChevronDown aria-hidden="true" />
        </summary>
        <div className="tool-popover tool-image-menu" aria-label="Image tools">
          {imageTools.map(tool => destination(tool, "tool-menu-link"))}
        </div>
      </details>
      <details className="tool-disclosure tool-calculator" {...disclosure}>
        <summary className="tool-nav-link" aria-current={calculatorActive ? "location" : undefined}>
          Calculator <ChevronDown aria-hidden="true" />
        </summary>
        <div className="tool-popover tool-calculator-menu" aria-label="Calculator tools">
          {calculatorTools.map(tool => destination(tool, "tool-menu-link"))}
        </div>
      </details>
      {destination(directTools[0])}
      <details className="tool-disclosure tool-social" {...disclosure}>
        <summary className="tool-nav-link" aria-current={socialActive ? "location" : undefined}>
          Social Media <ChevronDown aria-hidden="true" />
        </summary>
        <div className="tool-popover tool-social-menu" aria-label="Social Media tools">
          <SocialPlatformLinks onNavigate={() => close()} />
          <div className="mt-4 border-t border-border pt-3">
            <Link to="/social-media" activeOptions={exact} className="tool-menu-link" onClick={() => close()}>All platforms</Link>
          </div>
        </div>
      </details>
      {destination(directTools[1])}
    </div>

    <details className="tool-nav-mobile" {...disclosure}>
      <summary className="tool-mobile-trigger" aria-label={`Tools: ${currentLabel}`}>
        {currentLabel}<ChevronDown aria-hidden="true" />
      </summary>
      <div className="tool-popover tool-mobile-menu" aria-label="All tools">
        <div className="tool-menu-group">
          <p className="tool-group-label">Image</p>
          {imageTools.map(tool => destination(tool, "tool-menu-link"))}
        </div>
        <div className="tool-menu-group">
          <p className="tool-group-label">Calculator</p>
          {calculatorTools.map(tool => destination(tool, "tool-menu-link"))}
        </div>
        <div className="tool-menu-group">
          {directTools.map(tool => destination(tool, "tool-menu-link"))}
        </div>
        <div className="tool-menu-group">
          <p className="tool-group-label">Social Media</p>
          {SOCIAL_GROUPS.flatMap(group => group.links.map(link => <Link key={link.to} to={link.to} activeOptions={exact}
            onClick={() => close()} className="tool-menu-link">{group.name} {link.label}</Link>))}
          <Link to="/social-media" activeOptions={exact} className="tool-menu-link" onClick={() => close()}>All platforms</Link>
        </div>
      </div>
    </details>
  </nav>;
}
