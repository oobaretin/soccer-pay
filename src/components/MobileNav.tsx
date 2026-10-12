"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { siteNavLinks } from "@/lib/site-nav";

export function MobileNav() {
  const pathname = usePathname();
  return <MobileNavMenu key={pathname} />;
}

function MobileNavMenu() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        {open ? (
          <svg
            aria-hidden
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            aria-hidden
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>
      {open ? (
        <nav
          id={panelId}
          aria-label="Primary"
          className="absolute inset-x-0 top-full z-50 border-b border-zinc-200 bg-white px-4 py-3 shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
        >
          <ul className="flex flex-col gap-1">
            {siteNavLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
