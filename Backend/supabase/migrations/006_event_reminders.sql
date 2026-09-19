-- 006_event_reminders.sql — rappels J-3 / Jour-J, 100% SQL + pg_cron (aucun secret).
-- Compatible avec l'Edge Function event-reminders : mêmes titres, même garde anti-doublon
-- (une notif calendar pour le même événement déjà créée aujourd'hui → on saute).

create extension if not exists pg_cron;
create extension if not exists pg_net;

create or replace function public.send_event_reminders()
returns table (sent int)
language plpgsql security definer set search_path = public as $$
declare
  v_sent int := 0;
begin
  -- Pour chaque événement publié d'aujourd'hui ou dans 3 jours...
  with target_events as (
    select e.id, e.title,
           case
             when e.start_at::date = current_date then e.title || ' — ' || 'c''est aujourd''hui'
             else 'Rappel — ' || e.title || ' dans 3 jours'
           end as reminder_title
    from public.events e
    where e.status = 'published'
      and (e.start_at::date = current_date
           or e.start_at::date = current_date + 3)
  ),
  recipients as (
    -- Opt-in calendrier (défaut true si pas de ligne de préférences)
    select p.id
    from public.profiles p
    left join public.notification_preferences np on np.user_id = p.id
    where p.role = 'user'
      and coalesce(np.calendar_enabled, true) = true
  ),
  inserted as (
    insert into public.notifications (user_id, type, title, message, target_type, target_id)
    select r.id, 'calendar', t.reminder_title, t.title, 'event', t.id
    from target_events t
    cross join recipients r
    where not exists (
      select 1 from public.notifications n
      where n.user_id = r.id
        and n.type = 'calendar'
        and n.target_id = t.id
        and n.created_at::date = current_date
    )
    returning 1
  )
  select count(*) into v_sent from inserted;

  sent := v_sent;
  return next;
end $$;

-- Planification quotidienne 07:00 UTC (remplace si existe déjà)
select cron.unschedule('event-reminders-daily') where exists (
  select 1 from cron.job where jobname = 'event-reminders-daily'
);
select cron.schedule('event-reminders-daily', '0 7 * * *', $$select public.send_event_reminders()$$);
