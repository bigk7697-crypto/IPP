-- 012_push_subscriptions.sql — Web Push VAPID (option C)
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  unique (user_id, endpoint)
);
create index if not exists idx_push_user on public.push_subscriptions(user_id);

alter table public.push_subscriptions enable row level security;

drop policy if exists push_own on public.push_subscriptions;
create policy push_own on public.push_subscriptions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Optionnel : permettre au backend (service_role) de lire pour l'envoi push
-- service_role bypass RLS, pas de policy supplémentaire nécessaire
