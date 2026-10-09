import { WageStatusBadge } from "./WageStatusBadge";

export function TrustLegend() {
  return (
    <div className="max-w-2xl space-y-2 text-xs text-zinc-500 dark:text-zinc-400 sm:mx-auto sm:text-center">
      <p>
        Not official club disclosures. We label each figure by how it was sourced.
      </p>
      <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:justify-center">
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
    </div>
  );
}
