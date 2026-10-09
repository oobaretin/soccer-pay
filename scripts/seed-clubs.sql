-- All 20 Premier League clubs (2024–25). Safe to re-run.
-- Run after schema.sql, before scripts/seed.sql or CSV player import.

insert into clubs (id, name, slug) values
  ('a1111111-1111-1111-1111-111111111101', 'Arsenal', 'arsenal'),
  ('a1111111-1111-1111-1111-111111111102', 'Chelsea', 'chelsea'),
  ('a1111111-1111-1111-1111-111111111103', 'Liverpool', 'liverpool'),
  ('a1111111-1111-1111-1111-111111111104', 'Manchester City', 'manchester-city'),
  ('a1111111-1111-1111-1111-111111111105', 'Manchester United', 'manchester-united'),
  ('a1111111-1111-1111-1111-111111111106', 'Tottenham Hotspur', 'tottenham-hotspur'),
  ('a1111111-1111-1111-1111-111111111107', 'Newcastle United', 'newcastle-united'),
  ('a1111111-1111-1111-1111-111111111108', 'Aston Villa', 'aston-villa'),
  ('a1111111-1111-1111-1111-111111111109', 'Brighton & Hove Albion', 'brighton-and-hove-albion'),
  ('a1111111-1111-1111-1111-111111111110', 'West Ham United', 'west-ham-united'),
  ('a1111111-1111-1111-1111-111111111111', 'Crystal Palace', 'crystal-palace'),
  ('a1111111-1111-1111-1111-111111111112', 'Fulham', 'fulham'),
  ('a1111111-1111-1111-1111-111111111113', 'Brentford', 'brentford'),
  ('a1111111-1111-1111-1111-111111111114', 'Wolverhampton Wanderers', 'wolverhampton-wanderers'),
  ('a1111111-1111-1111-1111-111111111115', 'Everton', 'everton'),
  ('a1111111-1111-1111-1111-111111111116', 'Nottingham Forest', 'nottingham-forest'),
  ('a1111111-1111-1111-1111-111111111117', 'AFC Bournemouth', 'afc-bournemouth'),
  ('a1111111-1111-1111-1111-111111111118', 'Leicester City', 'leicester-city'),
  ('a1111111-1111-1111-1111-111111111119', 'Ipswich Town', 'ipswich-town'),
  ('a1111111-1111-1111-1111-111111111120', 'Southampton', 'southampton')
on conflict (slug) do update set name = excluded.name;
