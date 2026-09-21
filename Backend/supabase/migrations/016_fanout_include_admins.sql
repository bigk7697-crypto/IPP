-- 016_fanout_include_admins.sql — les admins reçoivent aussi les notifications
-- (ils publient et doivent pouvoir vérifier ce que voient les utilisateurs).
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

  -- Insère 1 notif par utilisateur ayant opt-in (défaut true si pas de prefs),
  -- utilisateurs ET admins (les triggers existants sont conservés).
  execute format(
    'insert into public.notifications (user_id, type, title, message, target_type, target_id)
     select p.id, %L, %L, %L, %L, %L
     from public.profiles p
     left join public.notification_preferences np on np.user_id = p.id
     where p.role in (''user'', ''admin'') and coalesce((to_jsonb(np) ->> %L)::boolean, true) = true',
    v_type, v_title, v_message, v_target, new.id::text, v_pref_col
  );

  return new;
end $$;
