-- 011_add_avatar_to_profiles.sql
alter table public.profiles add column if not exists avatar_url text;
create index if not exists idx_profiles_avatar on public.profiles (avatar_url) where avatar_url is not null;
