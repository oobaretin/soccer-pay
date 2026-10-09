"use client";

import { useRouter } from "next/navigation";
import { PlayerCombobox, type PlayerOption } from "./PlayerCombobox";

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

  function navigate(a: string, b: string) {
    const params = new URLSearchParams();
    params.set("a", a);
    params.set("b", b);
    router.push(`/compare?${params.toString()}`);
  }

  function onChangeA(slug: string) {
    navigate(slug, slugB ?? players[1]?.slug ?? slug);
  }

  function onChangeB(slug: string) {
    navigate(slugA ?? players[0]?.slug ?? slug, slug);
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <PlayerCombobox
        label="Player A"
        value={slugA ?? players[0]?.slug ?? ""}
        options={players}
        onChange={onChangeA}
      />
      <PlayerCombobox
        label="Player B"
        value={slugB ?? players[1]?.slug ?? ""}
        options={players}
        onChange={onChangeB}
      />
    </div>
  );
}
