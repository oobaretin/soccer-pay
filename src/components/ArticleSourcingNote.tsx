import { WageStatusBadge } from "@/components/WageStatusBadge";

export function ArticleSourcingNote() {
  return (
    <section className="rounded-lg border border-zinc-200 bg-zinc-50/80 p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300">
      <h2 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-100">
        How we source wages
      </h2>
      <p className="mb-3 leading-relaxed">
        Figures are not official club disclosures. Each row is labeled by how it
        was sourced:
      </p>
      <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-4">
        <li className="inline-flex items-center gap-1.5">
          <WageStatusBadge status="verified" />
          <span>Confirmed by club or filing</span>
        </li>
        <li className="inline-flex items-center gap-1.5">
          <WageStatusBadge status="reported" />
          <span>Named media report</span>
        </li>
        <li className="inline-flex items-center gap-1.5">
          <WageStatusBadge status="estimated" />
          <span>Modelled or unconfirmed</span>
        </li>
      </ul>
    </section>
  );
}
