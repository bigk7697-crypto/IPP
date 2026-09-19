-- 001_initial_schema.sql — 11 tables V1 Site Scolaire
-- Appliquer dans Supabase SQL Editor dans l'ordre 001 → 005.

-- ============ HELPERS ============
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ============ PROFILES ============
-- id = auth.users.id (créé via trigger handle_new_auth_user en 004)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text unique not null,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============ CLASSES ============
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  level text not null,
  series text,
  academic_year text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (name, academic_year)
);

-- ============ NEWS ============
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 200),
  slug text unique not null,
  content text not null,
  image_path text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null
);
drop trigger if exists trg_news_updated on public.news;
create trigger trg_news_updated before update on public.news
  for each row execute function public.set_updated_at();
create index if not exists idx_news_status_pub on public.news(status, published_at desc);

-- ============ EVENTS ============
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_path text,
  location text,
  start_at timestamptz not null,
  end_at timestamptz,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  check (end_at is null or end_at >= start_at)
);
drop trigger if exists trg_events_updated on public.events;
create trigger trg_events_updated before update on public.events
  for each row execute function public.set_updated_at();
create index if not exists idx_events_status_start on public.events(status, start_at);

-- ============ DOCUMENTS ============
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,
  file_path text not null,
  visibility text not null default 'public' check (visibility in ('public','private')),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null
);
drop trigger if exists trg_documents_updated on public.documents;
create trigger trg_documents_updated before update on public.documents
  for each row execute function public.set_updated_at();

-- ============ RESULTS (fichier en Storage privé, DB = file_path) ============
create table if not exists public.results (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete restrict,
  academic_year text not null,
  result_type text not null,
  file_path text not null,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null
);
drop trigger if exists trg_results_updated on public.results;
create trigger trg_results_updated before update on public.results
  for each row execute function public.set_updated_at();
create index if not exists idx_results_class on public.results(class_id, status);

-- ============ GALLERY ============
create table if not exists public.gallery_albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  cover_image_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null
);
drop trigger if exists trg_albums_updated on public.gallery_albums;
create trigger trg_albums_updated before update on public.gallery_albums
  for each row execute function public.set_updated_at();

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.gallery_albums(id) on delete cascade,
  image_path text not null,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null
);
create index if not exists idx_gallery_album on public.gallery_images(album_id, sort_order);

-- ============ NOTIFICATIONS ============
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('news','event','result','document','calendar','system')),
  title text not null,
  message text,
  target_type text,
  target_id uuid,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_notifs_user on public.notifications(user_id, is_read, created_at desc);

create table if not exists public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references public.profiles(id) on delete cascade,
  news_enabled boolean not null default true,
  events_enabled boolean not null default true,
  results_enabled boolean not null default true,
  documents_enabled boolean not null default true,
  calendar_enabled boolean not null default true,
  system_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

-- ============ SCHOOL_SETTINGS (singleton id=1) ============
create table if not exists public.school_settings (
  id int primary key check (id = 1),
  school_name text not null default 'Mon École',
  school_description text,
  address text,
  phone text,
  email text,
  logo_path text,
  website text,
  social_links jsonb not null default '{}',
  updated_at timestamptz not null default now()
);
insert into public.school_settings (id) values (1) on conflict (id) do nothing;
