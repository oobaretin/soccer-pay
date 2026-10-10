"use client";

import { useRouter } from "next/navigation";

export function CompareSwapButton({
  slugA,
  slugB,
}: {
  slugA?: string;
  slugB?: string;
}) {
  const router = useRouter();
  if (!slugA || !slugB || slugA === slugB) return null;

  return (
    <button
      type="button"
      onClick={() => {
        const params = new URLSearchParams();
        params.set("a", slugB);
        params.set("b", slugA);
        router.push(`/compare?${params.toString()}`);
      }}
      className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-emerald-600/40 hover:text-emerald-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:text-emerald-300"
    >
      Swap A ↔ B
    </button>
  );
}
