-- Qatar Stars League (for Al Sadd etc.). Safe to re-run.
insert into leagues (name, slug, country, currency) values
  ('Qatar Stars League', 'qatar-stars-league', 'Qatar', 'QAR')
on conflict (slug) do nothing;
