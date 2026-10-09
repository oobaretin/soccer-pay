import Link from "next/link";
import { SiteLogo } from "@/components/SiteLogo";

const links = [
  { href: "/", label: "Players" },
  { href: "/expiring", label: "Expiring" },
  { href: "/clubs", label: "Clubs" },
  { href: "/compare", label: "Compare" },
  { href: "/articles", label: "Articles" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 bg-zinc-950 text-zinc-100 dark:border-zinc-800">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <SiteLogo variant="header" />
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
