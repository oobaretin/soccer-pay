-- Premier League wage tracker (Soccer Pay)
-- Reference this file in Cursor prompts for schema consistency.

create table clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  badge_url text
);

create table players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  club_id uuid references clubs(id),
  position text,
  nationality text,
  date_of_birth date,
  photo_url text
);

create table contracts (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id),
  weekly_wage_gbp int,
  annual_wage_gbp int,
  contract_start date,
  contract_end date,
  status text check (status in ('verified','reported','estimated')),
  source_name text,
  source_url text,
  reviewed_at date
);

create table season_stats (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id),
  season text,
  appearances int,
  goals int,
  assists int,
  minutes int
);

create index players_club_id_idx on players (club_id);
create index contracts_player_id_idx on contracts (player_id);
create index season_stats_player_season_idx on season_stats (player_id, season);
create unique index season_stats_player_season_unique on season_stats (player_id, season);

-- Latest contract per player (for list/detail queries)
create or replace view player_wages as
select distinct on (c.player_id)
  c.player_id,
  c.weekly_wage_gbp,
  c.annual_wage_gbp,
  c.contract_start,
  c.contract_end,
  c.status,
  c.source_name,
  c.source_url,
  c.reviewed_at
from contracts c
order by c.player_id, c.reviewed_at desc nulls last, c.contract_end desc;

-- Allow read-only access for the public site (anon key)
alter table clubs enable row level security;
alter table players enable row level security;
alter table contracts enable row level security;
alter table season_stats enable row level security;

create policy "Public read clubs" on clubs for select to anon, authenticated using (true);
create policy "Public read players" on players for select to anon, authenticated using (true);
create policy "Public read contracts" on contracts for select to anon, authenticated using (true);
create policy "Public read season_stats" on season_stats for select to anon, authenticated using (true);
