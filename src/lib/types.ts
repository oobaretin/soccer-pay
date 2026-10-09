export type WageStatus = "verified" | "reported" | "estimated";

export type Club = {
  id: string;
  name: string;
  slug: string;
  badge_url: string | null;
};

export type Player = {
  id: string;
  name: string;
  slug: string;
  club_id: string | null;
  position: string | null;
  nationality: string | null;
  date_of_birth: string | null;
  photo_url: string | null;
};

export type Contract = {
  id: string;
  player_id: string;
  weekly_wage_gbp: number | null;
  annual_wage_gbp: number | null;
  contract_start: string | null;
  contract_end: string | null;
  status: WageStatus;
  source_name: string | null;
  source_url: string | null;
  reviewed_at: string | null;
};

export type SeasonStats = {
  id: string;
  player_id: string;
  season: string;
  appearances: number | null;
  goals: number | null;
  assists: number | null;
  minutes: number | null;
};

export type PlayerListRow = {
  player: Player;
  club: Club | null;
  contract: Contract | null;
  stats: SeasonStats | null;
};

export type PlayerDetail = PlayerListRow & {
  contracts: Contract[];
};

export type ClubDetail = {
  club: Club;
  squad: PlayerListRow[];
  weeklyWageBill: number;
  annualWageBill: number;
};

export type SalaryTableRow = {
  playerId: string;
  name: string;
  slug: string;
  position: string | null;
  clubName: string | null;
  clubSlug: string | null;
  weeklyWageGbp: number | null;
  annualWageGbp: number | null;
  contractEnd: string | null;
  status: WageStatus | null;
  sourceName: string | null;
  sourceUrl: string | null;
  contractExpiringSoon?: boolean;
};

export type TableSortKey =
  | "name"
  | "club"
  | "position"
  | "weekly"
  | "annual"
  | "contract_end"
  | "status";

export type SortKey =
  | "name"
  | "club"
  | "weekly"
  | "annual"
  | "contract_end";

export type SortDir = "asc" | "desc";
