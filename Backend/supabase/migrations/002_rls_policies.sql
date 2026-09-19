-- 002_rls_policies.sql — RLS + garde-fous rôle admin
-- La sécurité est côté DB, jamais côté frontend.

-- Fonction helper : l'utilisateur courant est-il admin ?
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Empêche un non-admin de s'auto-promouvoir via profiles.
create or replace function public.prevent_role_escalation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role <> old.role and not public.is_admin() then
    raise exception 'Modification du role interdite.';
  end if;
  return new;
end $$;
drop trigger if exists trg_no_role_escalation on public.profiles;
create trigger trg_no_role_escalation before update of role on public.profiles
  for each row execute function public.prevent_role_escalation();

-- Active RLS partout
alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.news enable row level security;
alter table public.events enable row level security;
alter table public.documents enable row level security;
alter table public.results enable row level security;
alter table public.gallery_albums enable row level security;
alter table public.gallery_images enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.school_settings enable row level security;

-- ---------- PROFILES ----------
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select using (auth.uid() = id or public.is_admin());
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles for insert with check (auth.uid() = id);
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- ---------- CLASSES : lecture publique, écriture admin ----------
drop policy if exists classes_read on public.classes;
create policy classes_read on public.classes for select using (true);
drop policy if exists classes_admin on public.classes;
create policy classes_admin on public.classes for all using (public.is_admin()) with check (public.is_admin());

-- ---------- NEWS / EVENTS : published lisible par tous, CRUD admin ----------
drop policy if exists news_read_pub on public.news;
create policy news_read_pub on public.news for select using (status = 'published' or public.is_admin());
drop policy if exists news_admin on public.news;
create policy news_admin on public.news for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists events_read_pub on public.events;
create policy events_read_pub on public.events for select using (status = 'published' or public.is_admin());
drop policy if exists events_admin on public.events;
create policy events_admin on public.events for all using (public.is_admin()) with check (public.is_admin());

-- ---------- GALLERY : lecture publique, écriture admin ----------
drop policy if exists albums_read on public.gallery_albums;
create policy albums_read on public.gallery_albums for select using (true);
drop policy if exists albums_admin on public.gallery_albums;
create policy albums_admin on public.gallery_albums for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists images_read on public.gallery_images;
create policy images_read on public.gallery_images for select using (true);
drop policy if exists images_admin on public.gallery_images;
create policy images_admin on public.gallery_images for all using (public.is_admin()) with check (public.is_admin());

-- ---------- DOCUMENTS ----------
drop policy if exists documents_read on public.documents;
create policy documents_read on public.documents for select using (
  (status = 'published' and visibility = 'public')
  or (status = 'published' and visibility = 'private' and auth.role() = 'authenticated')
  or public.is_admin()
);
drop policy if exists documents_admin on public.documents;
create policy documents_admin on public.documents for all using (public.is_admin()) with check (public.is_admin());

-- ---------- RESULTS : JAMAIS public. Authentifié = published, admin = tout ----------
drop policy if exists results_user_read on public.results;
create policy results_user_read on public.results for select using (
  (status = 'published' and auth.role() = 'authenticated') or public.is_admin()
);
drop policy if exists results_admin on public.results;
create policy results_admin on public.results for all using (public.is_admin()) with check (public.is_admin());

-- ---------- NOTIFICATIONS : chacun ses propres notifs ----------
drop policy if exists notifs_own on public.notifications;
create policy notifs_own on public.notifications for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists notifs_own_update on public.notifications;
create policy notifs_own_update on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- PREFS : chacun les siennes ----------
drop policy if exists prefs_own on public.notification_preferences;
create policy prefs_own on public.notification_preferences for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- SCHOOL_SETTINGS : lecture publique, écriture admin ----------
drop policy if exists settings_read on public.school_settings;
create policy settings_read on public.school_settings for select using (true);
drop policy if exists settings_admin on public.school_settings;
create policy settings_admin on public.school_settings for all using (public.is_admin()) with check (public.is_admin());
