import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { TrustLegend } from "@/components/TrustLegend";
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
  title: {
    default: "Soccer Pay — football salaries",
    template: "%s · Soccer Pay",
  },
  description:
    "Football wages across Europe, Turkey, and Saudi Arabia, with cited sources and contract expiry tracking.",
  openGraph: {
    type: "website",
    siteName: "Soccer Pay",
    title: "Soccer Pay — football salaries",
    description:
      "Football wages across Europe, Turkey, and Saudi Arabia, with cited sources and contract expiry tracking.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Soccer Pay — football salaries",
    description:
      "Football wages with cited sources and contract expiry tracking.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[#f4f7f5] text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-zinc-200 px-4 py-8 dark:border-zinc-800">
          <TrustLegend />
        </footer>
      </body>
    </html>
  );
}
