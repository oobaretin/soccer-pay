-- Mirrors schema.sql + scripts/seed.sql for `supabase db push`

create table if not exists clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  badge_url text
);

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  club_id uuid references clubs(id),
  position text,
  nationality text,
  date_of_birth date,
  photo_url text
);

create table if not exists contracts (
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

create table if not exists season_stats (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id),
  season text,
  appearances int,
  goals int,
  assists int,
  minutes int
);

create index if not exists players_club_id_idx on players (club_id);
create index if not exists contracts_player_id_idx on contracts (player_id);
create index if not exists season_stats_player_season_idx on season_stats (player_id, season);
create unique index if not exists season_stats_player_season_unique on season_stats (player_id, season);

alter table clubs enable row level security;
alter table players enable row level security;
alter table contracts enable row level security;
alter table season_stats enable row level security;

drop policy if exists "Public read clubs" on clubs;
drop policy if exists "Public read players" on players;
drop policy if exists "Public read contracts" on contracts;
drop policy if exists "Public read season_stats" on season_stats;

create policy "Public read clubs" on clubs for select to anon, authenticated using (true);
create policy "Public read players" on players for select to anon, authenticated using (true);
create policy "Public read contracts" on contracts for select to anon, authenticated using (true);
create policy "Public read season_stats" on season_stats for select to anon, authenticated using (true);

insert into clubs (id, name, slug) values
  ('a1111111-1111-1111-1111-111111111101', 'Arsenal', 'arsenal'),
  ('a1111111-1111-1111-1111-111111111102', 'Chelsea', 'chelsea')
on conflict (slug) do nothing;

insert into players (id, name, slug, club_id, position, nationality) values
  ('b1111111-1111-1111-1111-111111111101', 'Bukayo Saka', 'bukayo-saka', 'a1111111-1111-1111-1111-111111111101', 'Winger', 'England'),
  ('b1111111-1111-1111-1111-111111111102', 'Martin Ødegaard', 'martin-odegaard', 'a1111111-1111-1111-1111-111111111101', 'Midfielder', 'Norway'),
  ('b1111111-1111-1111-1111-111111111103', 'Declan Rice', 'declan-rice', 'a1111111-1111-1111-1111-111111111101', 'Midfielder', 'England'),
  ('b1111111-1111-1111-1111-111111111104', 'William Saliba', 'william-saliba', 'a1111111-1111-1111-1111-111111111101', 'Defender', 'France'),
  ('b1111111-1111-1111-1111-111111111105', 'David Raya', 'david-raya', 'a1111111-1111-1111-1111-111111111101', 'Goalkeeper', 'Spain'),
  ('b1111111-1111-1111-1111-111111111201', 'Cole Palmer', 'cole-palmer', 'a1111111-1111-1111-1111-111111111102', 'Midfielder', 'England'),
  ('b1111111-1111-1111-1111-111111111202', 'Reece James', 'reece-james', 'a1111111-1111-1111-1111-111111111102', 'Defender', 'England'),
  ('b1111111-1111-1111-1111-111111111203', 'Enzo Fernández', 'enzo-fernandez', 'a1111111-1111-1111-1111-111111111102', 'Midfielder', 'Argentina'),
  ('b1111111-1111-1111-1111-111111111204', 'Nicolas Jackson', 'nicolas-jackson', 'a1111111-1111-1111-1111-111111111102', 'Forward', 'Senegal'),
  ('b1111111-1111-1111-1111-111111111205', 'Moisés Caicedo', 'moises-caicedo', 'a1111111-1111-1111-1111-111111111102', 'Midfielder', 'Ecuador')
on conflict (slug) do nothing;

insert into contracts (
  player_id, weekly_wage_gbp, annual_wage_gbp, contract_start, contract_end,
  status, source_name, source_url, reviewed_at
)
select v.player_id, v.weekly_wage_gbp, v.annual_wage_gbp, v.contract_start, v.contract_end,
       v.status, v.source_name, v.source_url, v.reviewed_at
from (values
  ('b1111111-1111-1111-1111-111111111101'::uuid, 300000, 15600000, '2023-04-01'::date, '2027-06-30'::date, 'estimated', 'Placeholder source', 'https://example.com/sources/arsenal-saka', '2025-10-01'::date),
  ('b1111111-1111-1111-1111-111111111102'::uuid, 240000, 12480000, '2021-08-01'::date, '2027-06-30'::date, 'estimated', 'Placeholder source', 'https://example.com/sources/arsenal-odegaard', '2025-10-01'::date),
  ('b1111111-1111-1111-1111-111111111103'::uuid, 220000, 11440000, '2023-07-01'::date, '2028-06-30'::date, 'estimated', 'Placeholder source', 'https://example.com/sources/arsenal-rice', '2025-10-01'::date),
  ('b1111111-1111-1111-1111-111111111104'::uuid, 190000, 9880000, '2022-07-01'::date, '2027-06-30'::date, 'estimated', 'Placeholder source', 'https://example.com/sources/arsenal-saliba', '2025-10-01'::date),
  ('b1111111-1111-1111-1111-111111111105'::uuid, 120000, 6240000, '2024-07-01'::date, '2028-06-30'::date, 'estimated', 'Placeholder source', 'https://example.com/sources/arsenal-raya', '2025-10-01'::date),
  ('b1111111-1111-1111-1111-111111111201'::uuid, 180000, 9360000, '2024-07-01'::date, '2033-06-30'::date, 'estimated', 'Placeholder source', 'https://example.com/sources/chelsea-palmer', '2025-10-01'::date),
  ('b1111111-1111-1111-1111-111111111202'::uuid, 175000, 9100000, '2019-07-01'::date, '2027-06-30'::date, 'estimated', 'Placeholder source', 'https://example.com/sources/chelsea-james', '2025-10-01'::date),
  ('b1111111-1111-1111-1111-111111111203'::uuid, 200000, 10400000, '2023-01-01'::date, '2032-06-30'::date, 'estimated', 'Placeholder source', 'https://example.com/sources/chelsea-enzo', '2025-10-01'::date),
  ('b1111111-1111-1111-1111-111111111204'::uuid, 130000, 6760000, '2023-07-01'::date, '2029-06-30'::date, 'estimated', 'Placeholder source', 'https://example.com/sources/chelsea-jackson', '2025-10-01'::date),
  ('b1111111-1111-1111-1111-111111111205'::uuid, 160000, 8320000, '2023-08-01'::date, '2031-06-30'::date, 'estimated', 'Placeholder source', 'https://example.com/sources/chelsea-caicedo', '2025-10-01'::date)
) as v(player_id, weekly_wage_gbp, annual_wage_gbp, contract_start, contract_end, status, source_name, source_url, reviewed_at)
where not exists (
  select 1 from contracts c where c.player_id = v.player_id
);
