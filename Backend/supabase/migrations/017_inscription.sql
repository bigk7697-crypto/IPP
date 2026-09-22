-- 017_inscription.sql — Pré-inscriptions en ligne (dossiers PDF + convocation)
-- Bucket privé : lecture uniquement via signed URLs générées par le backend.
insert into storage.buckets (id, name, public)
values ('inscription-dossiers', 'inscription-dossiers', false)
on conflict (id) do nothing;

create table if not exists public.inscription_applications (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  first_name text not null,
  last_name text not null,
  birth_date date null,
  email text not null,
  phone text not null,
  parent_name text not null,
  niveau text not null,
  filiere_slug text null,
  message text not null default '',
  status text not null default 'soumis'
    check (status in ('soumis', 'verifie', 'convoque', 'refuse', 'admis')),
  rendez_vous_at timestamptz null,
  rendez_vous_message text not null default '',
  motif_refus text not null default '',
  user_id uuid null references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_inscr_status on public.inscription_applications(status, created_at desc);
create index if not exists idx_inscr_ref on public.inscription_applications(reference);

create table if not exists public.inscription_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.inscription_applications(id) on delete cascade,
  type_piece text not null,
  file_name text not null,
  file_path text not null,
  mime text not null,
  size_bytes int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_inscr_docs_app on public.inscription_documents(application_id);

alter table public.inscription_applications enable row level security;
alter table public.inscription_documents enable row level security;
-- Aucune policy publique : tout passe par le backend (service_role).
-- Les pièces restent privées : seul le backend génère des signed URLs (1 h).
