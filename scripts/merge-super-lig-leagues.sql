-- Merge duplicate Turkish leagues: Trendyol 1. Lig → Süper Lig (super-lig).
-- Run in Supabase SQL Editor after reviewing duplicate checks below.

-- Duplicate league names (should return no rows after merge)
select name, count(*) as n
from leagues
group by name
having count(*) > 1;

-- Duplicate league slugs (should return no rows)
select slug, count(*) as n
from leagues
group by slug
having count(*) > 1;

-- Reassign clubs from turkish-1-lig to super-lig
update clubs
set league_id = (select id from leagues where slug = 'super-lig')
where league_id = (select id from leagues where slug = 'turkish-1-lig');

delete from leagues
where slug = 'turkish-1-lig';

-- Verify: only one Turkish top-flight row remains
select id, name, slug from leagues where country = 'Turkey' order by name;
