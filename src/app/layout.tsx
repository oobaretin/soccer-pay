import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { TrustLegend } from "@/components/TrustLegend";
import {
  DEFAULT_TITLE,
  SITE_DOMAIN,
  SITE_NAME,
  SITE_TAGLINE,
  TITLE_TEMPLATE,
} from "@/lib/brand";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_DOMAIN),
  title: {
    default: DEFAULT_TITLE,
    template: TITLE_TEMPLATE,
  },
  description: SITE_TAGLINE,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: SITE_TAGLINE,
    url: SITE_DOMAIN,
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: SITE_TAGLINE,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden bg-[#f4f7f5] text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-zinc-200 px-4 py-8 dark:border-zinc-800">
          <p className="mx-auto mb-4 max-w-2xl text-center text-xs text-zinc-500">
            {SITE_NAME} — {SITE_TAGLINE}
          </p>
          <TrustLegend />
        </footer>
      </body>
    </html>
  );
}
