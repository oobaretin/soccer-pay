"use client";

import { useRouter } from "next/navigation";

type PlayerOption = { slug: string; name: string; club: string };

export function ComparePicker({
  players,
  slugA,
  slugB,
}: {
  players: PlayerOption[];
  slugA?: string;
  slugB?: string;
}) {
  const router = useRouter();

  function onChange(which: "a" | "b", slug: string) {
    const params = new URLSearchParams();
    params.set("a", which === "a" ? slug : (slugA ?? players[0]?.slug ?? ""));
    params.set("b", which === "b" ? slug : (slugB ?? players[1]?.slug ?? ""));
    router.push(`/compare?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <label className="flex flex-1 flex-col gap-1 text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          Player A
        </span>
        <select
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          value={slugA ?? ""}
          onChange={(e) => onChange("a", e.target.value)}
        >
          {players.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name} ({p.club})
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-1 flex-col gap-1 text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          Player B
        </span>
        <select
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          value={slugB ?? ""}
          onChange={(e) => onChange("b", e.target.value)}
        >
          {players.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name} ({p.club})
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
