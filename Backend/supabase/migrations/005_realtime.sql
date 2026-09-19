-- 005_realtime.sql — active Realtime sur news/events/notifications
-- Le frontend doit toujours prévoir un fallback fetch si Realtime est down.

do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

alter publication supabase_realtime add table public.news;
alter publication supabase_realtime add table public.events;
alter publication supabase_realtime add table public.notifications;
