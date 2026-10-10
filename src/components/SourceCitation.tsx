import type { Contract } from "@/lib/types";
import { WageStatusBadge } from "./WageStatusBadge";

export function SourceCitation({ contract }: { contract: Contract }) {
  return (
    <div className="rounded-lg border border-emerald-900/10 bg-white/60 p-4 text-sm dark:bg-white/5">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <WageStatusBadge status={contract.status} />
      </div>
      {contract.source_name ? (
        <p className="text-zinc-700 dark:text-zinc-300">
          Source:{" "}
          {contract.source_url ? (
            <a
              href={contract.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-400"
            >
              {contract.source_name}
            </a>
          ) : (
            contract.source_name
          )}
        </p>
      ) : (
        <p className="text-zinc-500">No source on file.</p>
      )}
    </div>
  );
}
