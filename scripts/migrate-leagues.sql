-- Multi-league support. Safe to re-run.

create table if not exists leagues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  country text not null,
  currency text not null default 'GBP'
);

alter table clubs add column if not exists league_id uuid references leagues(id);
alter table contracts add column if not exists currency text not null default 'GBP';

create index if not exists clubs_league_id_idx on clubs (league_id);

insert into leagues (name, slug, country, currency) values
  ('Premier League', 'premier-league', 'England', 'GBP'),
  ('La Liga', 'la-liga', 'Spain', 'EUR'),
  ('Serie A', 'serie-a', 'Italy', 'EUR'),
  ('Bundesliga', 'bundesliga', 'Germany', 'EUR'),
  ('Ligue 1', 'ligue-1', 'France', 'EUR'),
  ('Süper Lig', 'super-lig', 'Turkey', 'TRY'),
  ('Saudi Pro League', 'saudi-pro-league', 'Saudi Arabia', 'SAR'),
  ('MLS', 'mls', 'United States', 'USD'),
  ('Eredivisie', 'eredivisie', 'Netherlands', 'EUR')
on conflict (slug) do nothing;

update clubs
set league_id = (select id from leagues where slug = 'premier-league')
where league_id is null;

alter table leagues enable row level security;
drop policy if exists "Public read leagues" on leagues;
create policy "Public read leagues" on leagues for select to anon, authenticated using (true);
