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

type LeagueEmbed = {
  id: string;
  name: string;
  slug: string;
  country: string;
  currency: string;
};

type ClubEmbed = {
  id: string;
  name: string;
  slug: string;
  badge_url: string | null;
  league_id: string | null;
  leagues: LeagueEmbed | LeagueEmbed[] | null;
};

type PlayerWithClub = Player & {
  clubs: ClubEmbed | ClubEmbed[] | null;
};

function one<T>(raw: T | T[] | null): T | null {
  if (!raw) return null;
  return Array.isArray(raw) ? (raw[0] ?? null) : raw;
}

function normalizeClub(raw: PlayerWithClub["clubs"]): Club | null {
  const c = one(raw);
  if (!c) return null;
  const league = one(c.leagues);
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    badge_url: c.badge_url ?? null,
    league_id: c.league_id,
    league: league
      ? {
          id: league.id,
          name: league.name,
          slug: league.slug,
          country: league.country,
          currency: league.currency,
        }
      : null,
  };
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

  const withLeague =
    "id, name, slug, club_id, position, nationality, date_of_birth, photo_url, clubs ( id, name, slug, badge_url, league_id, leagues ( id, name, slug, country, currency ) )";
  const withoutLeague =
    "id, name, slug, club_id, position, nationality, date_of_birth, photo_url, clubs ( id, name, slug, badge_url )";

  let { data: players, error: playersError } = await supabase
    .from("players")
    .select(withLeague);

  if (playersError) {
    const retry = await supabase.from("players").select(withoutLeague);
    players = retry.data as typeof players;
    playersError = retry.error;
  }

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
    const club = normalizeClub(p.clubs);

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
