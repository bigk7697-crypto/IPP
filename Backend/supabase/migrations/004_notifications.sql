-- 004_notifications.sql — auto-profil + notifs auto à la publication
-- Règle : notif SEULEMENT quand status passe réellement à 'published'.

-- 1) À chaque nouvel utilisateur Auth → crée profiles + notification_preferences
create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, first_name, last_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', 'Utilisateur'),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    new.email,
    'user'
  )
  on conflict (id) do nothing;

  insert into public.notification_preferences (user_id)
  values (new.id)
  on conflict do nothing;

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- 2) Fan-out notifications au passage à published
create or replace function public.fanout_on_publish()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_type text;
  v_title text;
  v_message text;
  v_target text;
  v_pref_col text;
begin
  -- Seulement sur transition vers published
  if new.status <> 'published' then return new; end if;
  if tg_op = 'UPDATE' and old.status = 'published' then return new; end if;

  if tg_table_name = 'news' then
    v_type := 'news'; v_title := 'Nouvelle actualité'; v_message := new.title;
    v_target := 'news'; v_pref_col := 'news_enabled';
  elsif tg_table_name = 'events' then
    v_type := 'event'; v_title := 'Nouvel événement'; v_message := new.title;
    v_target := 'event'; v_pref_col := 'events_enabled';
  elsif tg_table_name = 'results' then
    v_type := 'result'; v_title := 'Nouveau résultat disponible'; v_message := new.academic_year || ' — ' || new.result_type;
    v_target := 'result'; v_pref_col := 'results_enabled';
  elsif tg_table_name = 'documents' then
    v_type := 'document'; v_title := 'Nouveau document'; v_message := new.title;
    v_target := 'document'; v_pref_col := 'documents_enabled';
  else
    return new;
  end if;

  -- Insère 1 notif par utilisateur ayant opt-in (défaut true si pas de prefs)
  execute format(
    'insert into public.notifications (user_id, type, title, message, target_type, target_id)
     select p.id, %L, %L, %L, %L, %L
     from public.profiles p
     left join public.notification_preferences np on np.user_id = p.id
     where p.role = ''user'' and coalesce((to_jsonb(np) ->> %L)::boolean, true) = true',
    v_type, v_title, v_message, v_target, new.id::text, v_pref_col
  );

  return new;
end $$;

drop trigger if exists trg_news_notify on public.news;
create trigger trg_news_notify after insert or update of status on public.news
  for each row execute function public.fanout_on_publish();

drop trigger if exists trg_events_notify on public.events;
create trigger trg_events_notify after insert or update of status on public.events
  for each row execute function public.fanout_on_publish();

drop trigger if exists trg_results_notify on public.results;
create trigger trg_results_notify after insert or update of status on public.results
  for each row execute function public.fanout_on_publish();

drop trigger if exists trg_documents_notify on public.documents;
create trigger trg_documents_notify after insert or update of status on public.documents
  for each row execute function public.fanout_on_publish();
