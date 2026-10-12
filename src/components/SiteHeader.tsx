import Link from "next/link";
import { SiteLogo } from "@/components/SiteLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { siteNavLinks } from "@/lib/site-nav";

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <SiteLogo variant="header" />
        <div className="flex flex-wrap items-center gap-2">
          <nav className="flex flex-wrap gap-1 text-sm">
            {siteNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="min-h-11 rounded-md px-3 py-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
