import Link from "next/link";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/brand";

const links = [
  { href: "/", label: "Players" },
  { href: "/expiring", label: "Expiring" },
  { href: "/clubs", label: "Clubs" },
  { href: "/compare", label: "Compare" },
  {
    href: "/articles/highest-paid-premier-league-players",
    label: "Articles",
  },
];

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 bg-zinc-950 text-zinc-100 dark:border-zinc-800">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex flex-col gap-0.5">
          <span className="text-lg font-semibold tracking-tight">
            {SITE_NAME}
          </span>
          <span className="max-w-[14rem] text-xs leading-snug text-zinc-400 sm:max-w-none">
            {SITE_TAGLINE}
          </span>
        </Link>
        <nav className="flex flex-wrap gap-1 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="min-h-11 rounded-md px-3 py-2 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
