import Link from "next/link";
import { MobileNav } from "@/components/MobileNav";
import { SiteLogo } from "@/components/SiteLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { siteNavLinks } from "@/lib/site-nav";

export function SiteHeader() {
  return (
    <header className="relative border-b border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <SiteLogo variant="header" />
        <div className="flex items-center gap-1 sm:gap-2">
          <nav
            className="hidden flex-wrap gap-1 text-sm md:flex"
            aria-label="Primary"
          >
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
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
