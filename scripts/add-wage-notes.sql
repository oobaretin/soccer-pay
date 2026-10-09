-- Optional contract breakdown (image rights, bonuses, etc.). Safe to re-run.
alter table contracts add column if not exists wage_notes text;
