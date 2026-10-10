import type { ReactNode } from "react";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/Breadcrumbs";

type Props = {
  title: string;
  subtitle?: string;
  hint?: string;
  breadcrumbs?: BreadcrumbItem[];
  meta?: ReactNode;
};

export function PageHeader({
  title,
  subtitle,
  hint,
  breadcrumbs,
  meta,
}: Props) {
  return (
    <header className="max-w-2xl space-y-2">
      {breadcrumbs?.length ? <Breadcrumbs items={breadcrumbs} /> : null}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-lg text-zinc-600 dark:text-zinc-400">{subtitle}</p>
        ) : null}
        {hint ? <p className="text-sm text-zinc-500">{hint}</p> : null}
        {meta ? <div className="text-sm text-zinc-500">{meta}</div> : null}
      </div>
    </header>
  );
}
