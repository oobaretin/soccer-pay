import Link from "next/link";
import { TrustLegend } from "@/components/TrustLegend";
import { SITE_NAME } from "@/lib/brand";

const links = [
  { href: "/", label: "Players" },
  { href: "/expiring", label: "Expiring" },
  { href: "/clubs", label: "Clubs" },
  { href: "/compare", label: "Compare" },
  { href: "/articles", label: "Articles" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 px-4 py-8 dark:border-zinc-800">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="text-sm font-semibold text-zinc-800 dark:text-zinc-200"
          >
            {SITE_NAME}
          </Link>
          <nav
            className="flex flex-wrap gap-1 text-sm"
            aria-label="Footer navigation"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="min-h-11 rounded-md px-3 py-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <TrustLegend />
          <Link
            href="/feed.xml"
            className="shrink-0 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            RSS
          </Link>
        </div>
      </div>
    </footer>
  );
}
