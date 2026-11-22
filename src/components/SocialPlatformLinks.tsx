import { Link } from "@tanstack/react-router";
import { Instagram, Youtube, Music2 } from "lucide-react";

export const SOCIAL_GROUPS = [
  { name: "Instagram", icon: Instagram, links: [
    { to: "/instagram-reel-aspect-ratio", label: "Reels", ratio: "9:16" },
    { to: "/instagram-story-aspect-ratio", label: "Stories", ratio: "9:16" },
  ] },
  { name: "YouTube", icon: Youtube, links: [
    { to: "/youtube-aspect-ratio", label: "Video", ratio: "16:9" },
    { to: "/youtube-shorts-aspect-ratio", label: "Shorts", ratio: "9:16" },
  ] },
  { name: "TikTok", icon: Music2, links: [
    { to: "/tiktok-aspect-ratio", label: "Video", ratio: "9:16" },
  ] },
] as const;

export function SocialPlatformLinks({ onNavigate, hub = false }: { onNavigate?: () => void; hub?: boolean }) {
  // Only the hub page owns headings; inside the navigation menu these labels would precede the page's h1.
  const GroupName = hub ? "h2" : "p";
  return <div className={`grid gap-6 sm:grid-cols-3 ${hub ? "sm:gap-8" : ""}`}>
    {SOCIAL_GROUPS.map(({ name, icon: Icon, links }) => <section key={name} aria-label={name}>
      <GroupName className={`mb-3 flex items-center gap-2 font-display font-bold ${hub ? "text-2xl" : "text-base"}`}>
        <Icon className="h-5 w-5 text-primary" aria-hidden="true" />{name}
      </GroupName>
      <div className="grid gap-1">
        {links.map(({ to, label, ratio }) => <Link key={to} to={to} onClick={onNavigate}
          aria-label={`${name} ${label} aspect ratio`}
          activeProps={{ "aria-current": "page", className: "bg-accent text-accent-foreground" }}
          className={`group flex min-h-11 items-center justify-between gap-4 rounded-lg px-3 py-3 text-sm hover:bg-secondary focus-visible:outline-2 focus-visible:outline-primary ${hub ? "border-b rounded-none" : ""}`}>
          <span className="font-medium">{label}</span>
          <span className="num text-xs text-muted-foreground">{ratio}</span>
        </Link>)}
      </div>
    </section>)}
  </div>;
}
