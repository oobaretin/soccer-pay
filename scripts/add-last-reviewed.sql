-- Optional alias for review date (contracts.reviewed_at already exists and is used in the app).
alter table contracts add column if not exists last_reviewed date;

update contracts
set last_reviewed = reviewed_at
where last_reviewed is null and reviewed_at is not null;
