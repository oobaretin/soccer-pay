-- Run after players exist (safe to re-run). Enables wage/goal on player & compare pages.

insert into season_stats (player_id, season, appearances, goals, assists, minutes)
select v.player_id, v.season, v.appearances, v.goals, v.assists, v.minutes
from (values
  ('b1111111-1111-1111-1111-111111111101'::uuid, '2024-25', 38, 9, 11, 3180),
  ('b1111111-1111-1111-1111-111111111102'::uuid, '2024-25', 35, 3, 9, 2890),
  ('b1111111-1111-1111-1111-111111111103'::uuid, '2024-25', 36, 4, 2, 3100),
  ('b1111111-1111-1111-1111-111111111104'::uuid, '2024-25', 37, 2, 0, 3330),
  ('b1111111-1111-1111-1111-111111111105'::uuid, '2024-25', 38, 0, 0, 3420),
  ('b1111111-1111-1111-1111-111111111201'::uuid, '2024-25', 37, 15, 8, 2950),
  ('b1111111-1111-1111-1111-111111111202'::uuid, '2024-25', 12, 0, 2, 980),
  ('b1111111-1111-1111-1111-111111111203'::uuid, '2024-25', 34, 6, 7, 2780),
  ('b1111111-1111-1111-1111-111111111204'::uuid, '2024-25', 33, 10, 3, 2400),
  ('b1111111-1111-1111-1111-111111111205'::uuid, '2024-25', 32, 1, 4, 2650)
) as v(player_id, season, appearances, goals, assists, minutes)
on conflict (player_id, season) do update set
  appearances = excluded.appearances,
  goals = excluded.goals,
  assists = excluded.assists,
  minutes = excluded.minutes;
