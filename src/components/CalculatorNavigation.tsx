import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { Calculator as CalculatorIcon, ChevronDown, Clapperboard, ImageIcon, Monitor, Share2 } from "lucide-react";
import { SocialPlatformLinks, SOCIAL_GROUPS } from "./SocialPlatformLinks";

const tools = [
  { to: "/", label: "Image", icon: ImageIcon },
  { to: "/calculator", label: "Calculator", icon: CalculatorIcon },
  { to: "/video-aspect-ratio", label: "Video", icon: Clapperboard },
] as const;

export function CalculatorNavigation() {
  const { pathname } = useLocation();
  const menu = useRef<HTMLDetailsElement>(null);
  const trigger = useRef<HTMLElement>(null);
  const active = pathname === "/social-media" || SOCIAL_GROUPS.some(group => group.links.some(link => link.to === pathname));
  const close = () => { if (menu.current) menu.current.open = false; };
  useEffect(() => { close(); }, [pathname]);
  useEffect(() => {
    const outside = (event: PointerEvent) => { if (event.target instanceof Node && !menu.current?.contains(event.target)) close(); };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  return <nav aria-label="Calculators" className="relative mt-5 grid grid-cols-3 gap-2 border-b pb-4 text-xs sm:flex sm:items-center sm:text-sm">
    {tools.map(({ to, label, icon: Icon }) => <Link key={to} to={to} activeOptions={{ exact: true }}
      activeProps={{ className: "bg-accent text-accent-foreground", "aria-current": "page" }}
      className={`flex min-h-11 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 font-medium hover:bg-secondary focus-visible:outline-2 focus-visible:outline-primary sm:flex-row sm:gap-2 sm:px-4`}>
      <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" /><span>{label}</span>
    </Link>)}
    <details ref={menu} className="social-menu group col-span-3 min-w-0 sm:ml-2"
      onKeyDown={event => { if (event.key === "Escape") { close(); trigger.current?.focus(); } }}>
      <summary ref={trigger} className={`flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-semibold hover:bg-secondary focus-visible:outline-2 focus-visible:outline-primary sm:justify-start sm:px-4 [&::-webkit-details-marker]:hidden ${active ? "bg-accent text-accent-foreground" : ""}`}>
        <span className="flex items-center gap-2"><Share2 aria-hidden="true" className="h-4 w-4 text-primary" />Social Media</span>
        <ChevronDown aria-hidden="true" className="h-4 w-4 transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-2 rounded-2xl border bg-card p-5 sm:absolute sm:left-0 sm:top-full sm:w-[36rem] sm:max-w-full sm:z-30 sm:mt-1 sm:p-6 sm:shadow-xl">
        <SocialPlatformLinks onNavigate={close} />
      </div>
    </details>
    <Link to="/ultrawide-aspect-ratio-calculator" activeOptions={{ exact: true }} activeProps={{ className: "bg-accent text-accent-foreground", "aria-current": "page" }} className="col-span-3 flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 py-2 font-medium hover:bg-secondary focus-visible:outline-2 focus-visible:outline-primary sm:px-4">
      <Monitor aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" />Ultrawide
    </Link>
  </nav>;
}
