-- 018_inscription_seen.sql — badge admin "non vus" (style WhatsApp)
alter table public.inscription_applications
  add column if not exists admin_seen boolean not null default false;

create index if not exists idx_inscr_unseen
  on public.inscription_applications(status, admin_seen);
