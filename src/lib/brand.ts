export const SITE_NAME = "FB Salaries";
export const SITE_TAGLINE =
  "Football player salaries, contracts and net worth.";
/** Target custom domain — set `NEXT_PUBLIC_SITE_URL` to this (or your Vercel URL) in production. */
export const PREFERRED_SITE_DOMAIN = "https://fbsalaries.com";
export const DEFAULT_TITLE = "Football Player Salaries 2026 | FB Salaries";
export const TITLE_TEMPLATE = "%s | FB Salaries";

/** Full title for Open Graph / Twitter (layout `title` already adds the suffix). */
export function pageTitleFull(segment: string): string {
  return `${segment} | FB Salaries`;
}
