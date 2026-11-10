import type { ReactNode } from "react";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/Breadcrumbs";

type Props = {
  title: ReactNode;
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
        <h1 className="display">{title}</h1>
        {subtitle ? <p className="lede">{subtitle}</p> : null}
        {hint ? <p className="copy-small">{hint}</p> : null}
        {meta ? <div className="copy-small">{meta}</div> : null}
      </div>
    </header>
  );
}
