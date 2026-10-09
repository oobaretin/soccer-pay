import { createSupabaseClient, getSupabaseConfigError } from "@/lib/supabase";
import { latestContract } from "@/lib/queries/latest-contract";
import type {
  Club,
  Contract,
  Player,
  PlayerListRow,
  SeasonStats,
} from "@/lib/types";

export const CURRENT_SEASON = "2024-25";

export type RosterResult =
  | { ok: true; rows: PlayerListRow[] }
  | { ok: false; error: string; rows: [] };

type PlayerWithClub = Player & {
  clubs: Pick<Club, "id" | "name" | "slug" | "badge_url"> | Pick<Club, "id" | "name" | "slug" | "badge_url">[] | null;
};

function normalizeClub(
  raw: PlayerWithClub["clubs"],
): Pick<Club, "id" | "name" | "slug" | "badge_url"> | null {
  if (!raw) return null;
  const c = Array.isArray(raw) ? raw[0] : raw;
  return c ?? null;
}

export async function loadRoster(): Promise<RosterResult> {
  const configError = getSupabaseConfigError();
  if (configError) {
    return { ok: false, error: configError, rows: [] };
  }

  const supabase = createSupabaseClient();
  if (!supabase) {
    return { ok: false, error: "Could not create Supabase client.", rows: [] };
  }

  const { data: players, error: playersError } = await supabase
    .from("players")
    .select(
      "id, name, slug, club_id, position, nationality, date_of_birth, photo_url, clubs ( id, name, slug, badge_url )",
    );

  if (playersError) {
    return { ok: false, error: playersError.message, rows: [] };
  }

  const { data: contracts, error: contractsError } = await supabase
    .from("contracts")
    .select("*");

  if (contractsError) {
    return { ok: false, error: contractsError.message, rows: [] };
  }

  const { data: stats, error: statsError } = await supabase
    .from("season_stats")
    .select("*")
    .eq("season", CURRENT_SEASON);

  if (statsError) {
    return { ok: false, error: statsError.message, rows: [] };
  }

  const contractsByPlayer = new Map<string, Contract[]>();
  for (const row of contracts ?? []) {
    const c = row as Contract;
    const list = contractsByPlayer.get(c.player_id) ?? [];
    list.push(c);
    contractsByPlayer.set(c.player_id, list);
  }

  const statsByPlayer = new Map(
    (stats ?? []).map((s) => [s.player_id as string, s as SeasonStats]),
  );

  const rows: PlayerListRow[] = (players as PlayerWithClub[]).map((p) => {
    const clubRaw = normalizeClub(p.clubs);
    const club: Club | null = clubRaw
      ? {
          id: clubRaw.id,
          name: clubRaw.name,
          slug: clubRaw.slug,
          badge_url: clubRaw.badge_url ?? null,
        }
      : null;

    const { clubs: _c, ...playerFields } = p;
    const player = playerFields as Player;
    const playerContracts = contractsByPlayer.get(player.id) ?? [];

    return {
      player,
      club,
      contract: latestContract(playerContracts),
      stats: statsByPlayer.get(player.id) ?? null,
    };
  });

  return { ok: true, rows };
}
