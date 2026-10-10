import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono, Sora } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SITE_NAME, SITE_TAGLINE, pageTitleFull } from "@/lib/brand";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["800"],
});

const siteBase = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteBase),
  title: {
    default: "Football Player Salaries 2026 | FB Salaries",
    template: "%s | FB Salaries",
  },
  description: SITE_TAGLINE,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: pageTitleFull("Football Player Salaries 2026"),
    description: SITE_TAGLINE,
    url: siteBase,
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitleFull("Football Player Salaries 2026"),
    description: SITE_TAGLINE,
  },
  icons: {
    icon: "/logo/fb-salaries-icon.svg",
    shortcut: "/logo/fb-salaries-icon.svg",
    apple: "/logo/fb-salaries-icon.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${sora.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden bg-[#f4f7f5] text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          {children}
        </main>
        <Suspense
          fallback={
            <footer
              className="mt-auto border-t border-zinc-800 bg-zinc-950 px-4 py-10"
              aria-hidden
            >
              <div className="mx-auto h-40 max-w-6xl animate-pulse rounded-lg bg-zinc-900/60" />
            </footer>
          }
        >
          <SiteFooter />
        </Suspense>
      </body>
    </html>
  );
}
