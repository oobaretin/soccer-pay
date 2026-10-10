alter table season_stats
  add column if not exists source_name text,
  add column if not exists source_url text,
  add column if not exists scope text;
