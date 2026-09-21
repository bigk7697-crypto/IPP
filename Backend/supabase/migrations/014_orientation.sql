-- 014_orientation.sql — Assistant orientation + quiz (base de connaissances pilotée par l'admin)
create table if not exists public.orientation_topics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category text not null default 'infos' check (category in ('filieres', 'infos')),
  title text not null,
  content text not null,
  keywords text not null default '',
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_orientation_cat on public.orientation_topics(category);
create index if not exists idx_orientation_published on public.orientation_topics(is_published);

alter table public.orientation_topics enable row level security;

drop policy if exists orientation_public_read on public.orientation_topics;
create policy orientation_public_read on public.orientation_topics
  for select using (is_published = true);

-- service_role bypass RLS, pas de policy supplémentaire nécessaire (routes admin via service client)

create table if not exists public.orientation_unanswered (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  source text not null default 'assistant' check (source in ('assistant', 'quiz')),
  handled boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_unanswered_handled on public.orientation_unanswered(handled, created_at desc);

alter table public.orientation_unanswered enable row level security;
-- Aucune policy publique : lecture/écriture via service_role uniquement
-- (POST public passe par le backend qui valide via zod + rate-limit)
