import { createSupabaseClient, getSupabaseConfigError } from "@/lib/supabase";
import {
  latestContract,
  sortContractsNewestFirst,
} from "@/lib/queries/latest-contract";
import { CURRENT_SEASON, loadRoster } from "@/lib/queries/load-roster";
import type { Club, Contract, Player, PlayerDetail, SeasonStats } from "@/lib/types";

export async function getPlayerSlugs(): Promise<string[]> {
  const configError = getSupabaseConfigError();
  if (configError) return [];

  const supabase = createSupabaseClient();
  if (!supabase) return [];

  const { data } = await supabase.from("players").select("slug");
  return (data ?? []).map((r) => r.slug as string);
}

export async function getPlayerBySlug(
  slug: string,
): Promise<PlayerDetail | null> {
  const configError = getSupabaseConfigError();
  if (configError) return null;

  const supabase = createSupabaseClient();
  if (!supabase) return null;

  const { data: player, error } = await supabase
    .from("players")
    .select(
      "id, name, slug, club_id, position, nationality, date_of_birth, photo_url, clubs ( id, name, slug, badge_url )",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error || !player) return null;

  type Row = Player & {
    clubs: Club | Club[] | null;
  };
  const row = player as Row;
  const clubRaw = row.clubs;
  const club = Array.isArray(clubRaw) ? clubRaw[0] : clubRaw;

  const { data: contracts } = await supabase
    .from("contracts")
    .select("*")
    .eq("player_id", row.id);

  const { data: stats } = await supabase
    .from("season_stats")
    .select("*")
    .eq("player_id", row.id)
    .eq("season", CURRENT_SEASON)
    .maybeSingle();

  const contractList = sortContractsNewestFirst((contracts ?? []) as Contract[]);
  const { clubs: _c, ...playerFields } = row;

  return {
    player: playerFields as Player,
    club: club ?? null,
    contract: latestContract(contractList),
    stats: (stats as SeasonStats) ?? null,
    contracts: contractList,
  };
}

/** Lightweight list for compare picker (uses shared roster fetch). */
export async function getPlayerOptions() {
  const roster = await loadRoster();
  if (!roster.ok) return [];
  return roster.rows.map((r) => ({
    slug: r.player.slug,
    name: r.player.name,
    club: r.club?.name ?? "",
  }));
}
