# Database — Backend IPP Site Scolaire V1

> Source exacte : `supabase/migrations/001_initial_schema.sql` → `007_search_indexes.sql`. 11 tables V1. Postgres Supabase. Jamais de modif Dashboard sans migration versionnée (`spec/02-database.md:22-24`).

## 1. Vue d'ensemble

11 tables (`001_initial_schema.sql:14-176`) :

| # | Table | PK | Rôle |
|---|---|---|---|
| 1 | `profiles` | `id uuid` (= `auth.users.id`) | Profil applicatif + rôle |
| 2 | `classes` | `id uuid` | Classes / niveaux |
| 3 | `news` | `id uuid` | Actualités |
| 4 | `events` | `id uuid` | Événements / calendrier |
| 5 | `documents` | `id uuid` | Documents (public/privé) |
| 6 | `results` | `id uuid` | Résultats (fichier en Storage privé) |
| 7 | `gallery_albums` | `id uuid` | Albums galerie |
| 8 | `gallery_images` | `id uuid` | Images d'album |
| 9 | `notifications` | `id uuid` | Notifications par user |
| 10 | `notification_preferences` | `id uuid` (unique `user_id`) | 6 flags opt-in |
| 11 | `school_settings` | `id int` (=1 singleton) | Paramètres école |

Helper global (`001:5-10`) :
```sql
create function set_updated_at() returns trigger … BEGIN new.updated_at = now(); RETURN new; END;
```

## 2. Schéma détaillé (colonnes / types / contraintes)

### 2.1 `profiles` — `001:14-25`
```sql
id uuid PK FK auth.users(id) ON DELETE CASCADE
first_name text NOT NULL
last_name  text NOT NULL
email      text UNIQUE NOT NULL
role       text NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin'))
created_at timestamptz NOT NULL DEFAULT now()
updated_at timestamptz NOT NULL DEFAULT now()
-- trigger: trg_profiles_updated BEFORE UPDATE → set_updated_at()
```
- `id` = `auth.users.id`, créé par trigger `handle_new_auth_user` (`004:5-27`).
- Seul 1 admin initial, créé manuellement (`README.md:28-32`).

### 2.2 `classes` — `001:28-37`
```sql
id uuid PK DEFAULT gen_random_uuid()
name text NOT NULL
level text NOT NULL
series text
academic_year text NOT NULL
is_active boolean NOT NULL DEFAULT true
created_at timestamptz NOT NULL DEFAULT now()
UNIQUE (name, academic_year)
-- pas de updated_at
```

### 2.3 `news` — `001:40-55`
```sql
id uuid PK DEFAULT gen_random_uuid()
title text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 200)
slug text UNIQUE NOT NULL
content text NOT NULL
image_path text                    -- → public-assets/news/<uuid>.* (utils/files.ts:52-54)
status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived'))
published_at timestamptz
created_at timestamptz NOT NULL DEFAULT now()
updated_at timestamptz NOT NULL DEFAULT now()
created_by uuid FK profiles(id) ON DELETE SET NULL
-- trigger trg_news_updated → set_updated_at()
-- index idx_news_status_pub ON news(status, published_at DESC)
```
Recherche : `idx_news_title_trgm`, `idx_news_content_trgm`, `idx_news_title_lower`, `idx_news_slug` (`007:7-10`).

### 2.4 `events` — `001:58-75`
```sql
id uuid PK DEFAULT gen_random_uuid()
title text NOT NULL
description text
image_path text
location text
start_at timestamptz NOT NULL
end_at timestamptz
status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived'))
created_at / updated_at timestamptz NOT NULL DEFAULT now()
created_by uuid FK profiles(id) ON DELETE SET NULL
CHECK (end_at IS NULL OR end_at >= start_at)
-- trigger trg_events_updated
-- index idx_events_status_start ON events(status, start_at)
```
Recherche : `idx_events_title_trgm`, `idx_events_desc_trgm` (`007:13-14`).

### 2.5 `documents` — `001:78-93`
```sql
id uuid PK DEFAULT gen_random_uuid()
title text NOT NULL
description text
category text
file_path text NOT NULL             -- private-documents/<cat>/<uuid>.* ou public-assets/…
visibility text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','private'))
status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived'))
published_at timestamptz
created_at / updated_at timestamptz NOT NULL DEFAULT now()
created_by uuid FK profiles(id) ON DELETE SET NULL
-- trigger trg_documents_updated
```
Recherche : `idx_documents_title_trgm`, `idx_documents_desc_trgm` (`007:17-18`).

### 2.6 `results` — `001:96-111`
```sql
id uuid PK DEFAULT gen_random_uuid()
class_id uuid NOT NULL FK classes(id) ON DELETE RESTRICT
academic_year text NOT NULL
result_type text NOT NULL
file_path text NOT NULL              -- private-results/<year>/<classe>/<uuid>.pdf (utils/files.ts:43-45)
status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived'))
published_at timestamptz
created_at / updated_at timestamptz NOT NULL DEFAULT now()
created_by uuid FK profiles(id) ON DELETE SET NULL
-- trigger trg_results_updated
-- index idx_results_class ON results(class_id, status)
```
Fichier jamais en DB, seulement `file_path` (`spec/02-database.md:9`).

### 2.7 `gallery_albums` — `001:114-125`
```sql
id uuid PK DEFAULT gen_random_uuid()
title text NOT NULL
description text
cover_image_path text
created_at / updated_at timestamptz NOT NULL DEFAULT now()
created_by uuid FK profiles(id) ON DELETE SET NULL
-- trigger trg_albums_updated
```

### 2.8 `gallery_images` — `001:127-135`
```sql
id uuid PK DEFAULT gen_random_uuid()
album_id uuid NOT NULL FK gallery_albums(id) ON DELETE CASCADE
image_path text NOT NULL
caption text
sort_order int NOT NULL DEFAULT 0
created_at timestamptz NOT NULL DEFAULT now()
created_by uuid FK profiles(id) ON DELETE SET NULL
-- index idx_gallery_album ON gallery_images(album_id, sort_order)
```

### 2.9 `notifications` — `001:139-150`
```sql
id uuid PK DEFAULT gen_random_uuid()
user_id uuid NOT NULL FK profiles(id) ON DELETE CASCADE
type text NOT NULL CHECK (type IN ('news','event','result','document','calendar','system'))
title text NOT NULL
message text
target_type text                     -- 'news'|'event'|'result'|'document'|'event' (calendar)
target_id uuid                       -- FK logique vers l'entité (pas de contrainte FK)
is_read boolean NOT NULL DEFAULT false
created_at timestamptz NOT NULL DEFAULT now()
-- index idx_notifs_user ON notifications(user_id, is_read, created_at DESC)
```
`target_type/target_id` pour redirection front (`spec/06-notifications-realtime.md:16`).

### 2.10 `notification_preferences` — `001:152-162`
```sql
id uuid PK DEFAULT gen_random_uuid()
user_id uuid UNIQUE NOT NULL FK profiles(id) ON DELETE CASCADE
news_enabled boolean NOT NULL DEFAULT true
events_enabled boolean NOT NULL DEFAULT true
results_enabled boolean NOT NULL DEFAULT true
documents_enabled boolean NOT NULL DEFAULT true
calendar_enabled boolean NOT NULL DEFAULT true
system_enabled boolean NOT NULL DEFAULT true
updated_at timestamptz NOT NULL DEFAULT now()
```

### 2.11 `school_settings` — `001:165-177` (singleton `id=1`)
```sql
id int PK CHECK (id = 1)
school_name text NOT NULL DEFAULT 'Mon École'
school_description text
address text
phone text
email text
logo_path text
website text
social_links jsonb NOT NULL DEFAULT '{}'
updated_at timestamptz NOT NULL DEFAULT now()
-- seed: INSERT INTO school_settings(id) VALUES (1) ON CONFLICT DO NOTHING
```

## 3. RLS — résumé (`002_rls_policies.sql`)

Activée sur les 11 tables (`002:24-34`). Helpers :
- `is_admin() RETURNS boolean SECURITY DEFINER` : `EXISTS (SELECT 1 FROM profiles WHERE id=auth.uid() AND role='admin')` (`002:5-8`).
- `prevent_role_escalation()` + trigger `trg_no_role_escalation BEFORE UPDATE OF role ON profiles` : `RAISE EXCEPTION` si `new.role<>old.role AND NOT is_admin()` (`002:11-21`).

| Table | Policy | Condition |
|---|---|---|
| `profiles` | `profiles_select_own` (SELECT) | `auth.uid()=id OR is_admin()` (`002:38`) |
| | `profiles_insert_own` (INSERT) | `auth.uid()=id` (`002:40`) |
| | `profiles_update_own` (UPDATE) | `auth.uid()=id` (using + with check) (`002:42`) |
| `classes` | `classes_read` (SELECT) | `true` — lecture publique (`002:46`) |
| | `classes_admin` (ALL) | `is_admin()` (`002:48`) |
| `news` | `news_read_pub` (SELECT) | `status='published' OR is_admin()` (`002:52`) |
| | `news_admin` (ALL) | `is_admin()` (`002:54`) |
| `events` | `events_read_pub` | idem news (`002:57`) |
| | `events_admin` | `is_admin()` (`002:59`) |
| `gallery_albums` | `albums_read` | `true` (`002:63`) |
| | `albums_admin` | `is_admin()` (`002:65`) |
| `gallery_images` | `images_read` | `true` (`002:67`) |
| | `images_admin` | `is_admin()` (`002:69`) |
| `documents` | `documents_read` (SELECT) | `(published AND public) OR (published AND private AND authenticated) OR is_admin()` (`002:73-77`) |
| | `documents_admin` (ALL) | `is_admin()` (`002:79`) |
| `results` | `results_user_read` (SELECT) | `(published AND authenticated) OR is_admin()` — **jamais public** (`002:83-85`) |
| | `results_admin` (ALL) | `is_admin()` (`002:87`) |
| `notifications` | `notifs_own` (SELECT) | `user_id=auth.uid() OR is_admin()` (`002:91`) |
| | `notifs_own_update` (UPDATE) | `user_id=auth.uid()` (`002:93`) |
| `notification_preferences` | `prefs_own` (ALL) | `user_id=auth.uid()` (`002:97`) |
| `school_settings` | `settings_read` (SELECT) | `true` (`002:101`) |
| | `settings_admin` (ALL) | `is_admin()` (`002:103`) |

## 4. Triggers

### 4.1 `handle_new_auth_user` — `004_notifications.sql:5-27`
- **Quand** : `AFTER INSERT ON auth.users` → trigger `on_auth_user_created`.
- **Fait** : `INSERT INTO profiles(id, first_name, last_name, email, role='user')` depuis `new.raw_user_meta_data` (fallback `'Utilisateur'`/`''`) + `INSERT INTO notification_preferences(user_id)` — `ON CONFLICT DO NOTHING`.
- **Sécurité** : `SECURITY DEFINER`, `search_path=public`.

### 4.2 `fanout_on_publish` — `004:30-86`
- **Quand** : `AFTER INSERT OR UPDATE OF status ON news/events/results/documents` → triggers `trg_news_notify` / `trg_events_notify` / `trg_results_notify` / `trg_documents_notify`.
- **Garde** : `IF new.status<>'published' RETURN; IF TG_OP='UPDATE' AND old.status='published' RETURN;` — notif **uniquement** sur transition vers `published` (`004:40-41`).
- **Mapping** (`004:43-56`) :
  - `news` → `type='news', title='Nouvelle actualité', message=new.title, target='news', pref='news_enabled'`
  - `events` → `type='event', title='Nouvel événement', pref='events_enabled'`
  - `results` → `type='result', title='Nouveau résultat disponible', message=academic_year||' — '||result_type, pref='results_enabled'`
  - `documents` → `type='document', title='Nouveau document', pref='documents_enabled'`
- **Fan-out** (`004:60-67`) :
  ```sql
  INSERT INTO notifications (user_id,type,title,message,target_type,target_id)
  SELECT p.id, … FROM profiles p
  LEFT JOIN notification_preferences np ON np.user_id=p.id
  WHERE p.role='user' AND coalesce((to_jsonb(np)->>pref)::boolean,true)=true;
  ```
  Défaut `true` si pas de ligne prefs.

### 4.3 `send_event_reminders` — `006_event_reminders.sql:8-52`
- **Signature** : `RETURNS TABLE(sent int) SECURITY DEFINER`.
- **Cible** : `events` où `status='published'` et `start_at::date IN (current_date, current_date+3)` (`006:22-24`), titre `'<title> — c'est aujourd'hui'` ou `'Rappel — <title> dans 3 jours'` (`006:18-20`).
- **Destinataires** : `profiles` où `role='user' AND coalesce(calendar_enabled,true)=true` (`006:32`).
- **Anti-doublon** : `NOT EXISTS (notifications WHERE user_id AND type='calendar' AND target_id AND created_at::date=today)` (`006:39-44`).
- **Cron** : `pg_cron` `0 7 * * *` job `event-reminders-daily` → `SELECT send_event_reminders()` (`006:55-58`), `pg_cron` + `pg_net` extensions (`006:5-6`).

### 4.4 `set_updated_at` — `001:5-10` + `prevent_role_escalation` — `002:11-21`
Voir §2 et §3.

## 5. Index — recherche & perf

### 5.1 Fonctionnels (`001`)
- `idx_news_status_pub (status, published_at DESC)` (`001:55`)
- `idx_events_status_start (status, start_at)` (`001:75`)
- `idx_results_class (class_id, status)` (`001:111`)
- `idx_gallery_album (album_id, sort_order)` (`001:136`)
- `idx_notifs_user (user_id, is_read, created_at DESC)` (`001:150`)

### 5.2 Recherche `?q` (`007_search_indexes.sql:4-22`)
Extension `pg_trgm` (`007:4`). Index GIN trigram + `lower()` :

| Table | Index | Colonne |
|---|---|---|
| `news` | `idx_news_title_trgm` | `title gin_trgm_ops` (`007:7`) |
| | `idx_news_content_trgm` | `content gin_trgm_ops` (`007:8`) |
| | `idx_news_title_lower` | `lower(title)` (`007:9`) |
| | `idx_news_slug` | `slug` (`007:10`) |
| `events` | `idx_events_title_trgm` | `title` (`007:13`) |
| | `idx_events_desc_trgm` | `description` (`007:14`) |
| `documents` | `idx_documents_title_trgm` | `title` (`007:17`) |
| | `idx_documents_desc_trgm` | `description` (`007:18`) |
| `classes` | `idx_classes_name_trgm` | `name` (`007:21`) |
| | `idx_classes_level_trgm` | `level` (`007:22`) |

Usage backend : `escapeIlike` + `or(title.ilike.%q%,content.ilike.%q%)` (`src/utils/search.ts:1-8`, `src/routes/news.ts:22-24`, `src/routes/documents.ts:26-28`).

## 6. Storage — buckets (`003_storage.sql`)

| Bucket | `public` | Usage fichier | Policies |
|---|---|---|---|
| `public-assets` | `true` | `news/*`, `gallery/*`, `events/*` → `public-assets/<folder>/<uuid>.*` (`src/utils/files.ts:52-54`) | `SELECT WHERE bucket='public-assets'` (public), `INSERT/UPDATE/DELETE WHERE bucket='public-assets' AND is_admin()` (`003:19-32`) |
| `private-results` | `false` | `results/*` → `private-results/<year>/<classe>/<uuid>.pdf` (`files.ts:43-45`) | `SELECT WHERE bucket='private-results' AND authenticated`, `ALL WHERE … AND is_admin()` (`003:36-42`) |
| `private-documents` | `false` | `documents/*` → `private-documents/<cat>/<uuid>.*` (`files.ts:47-50`) | idem private-results (`003:46-52`) |

Accès privé : toujours via `src/services/storage.ts:21-26` `createSignedUrl(path,3600)` avec `SERVICE_ROLE` (`src/routes/results.ts:30-33`, `src/routes/documents.ts:73`), jamais d'URL publique permanente (note `003:54-56`).

Limites (`src/utils/files.ts:3-7`) : `result/document 15 Mo`, `image 5 Mo` — `src/middleware/upload.ts:11-13` `multer.memoryStorage`.

## 7. Realtime (`005_realtime.sql`)

```sql
-- publication supabase_realtime (créée si absente)
ALTER PUBLICATION supabase_realtime ADD TABLE public.news;         -- 005:11
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;       -- 005:12
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;-- 005:13
```
Frontend doit prévoir fallback `fetch` si Realtime down (`005:2`, `spec/06:20`).

## 8. Appliquer les migrations

### 8.1 Ordre strict (README.md:17-25, spec/02:17-24)

```
001_initial_schema.sql      # 11 tables + set_updated_at + indexes fonctionnels
002_rls_policies.sql        # is_admin, prevent_role_escalation, RLS + policies
003_storage.sql             # 3 buckets + policies storage.objects
004_notifications.sql       # handle_new_auth_user + fanout_on_publish
005_realtime.sql            # publication supabase_realtime
006_event_reminders.sql     # pg_cron + send_event_reminders() + schedule 07:00 UTC
007_search_indexes.sql      # pg_trgm + GIN trigram (optionnel mais recommandé en prod)
```

### 8.2 Méthodes

**Supabase SQL Editor (recommandé V1)** :
1. Dashboard → SQL Editor → New query.
2. Coller **intégralement** `001` → Run, puis `002` → Run, … → `007` → Run.
3. Vérifier : `SELECT * FROM pg_tables WHERE schemaname='public';` (11 tables), `SELECT * FROM storage.buckets;` (3 buckets), `SELECT * FROM cron.job;` (job `event-reminders-daily`).

**Supabase CLI** :
```bash
supabase link --project-ref <PROJECT_REF>   # spec/11-deploiement.md:30
supabase db push                             # pousse supabase/migrations/*
# ou replay manuel : psql $DATABASE_URL -f supabase/migrations/001_initial_schema.sql
```

### 8.3 Seed DEV (optionnel)

`supabase/seed/seed.sql` — DEV uniquement (`README.md:25`, `spec/02:27`). Exemple classes `Seconde A, Première D, Terminale D` + 2 news test.

### 8.4 Compte admin

```sql
-- 1. Dashboard → Authentication → Users → Create user (email/password)
-- 2. Puis :
UPDATE public.profiles SET role='admin' WHERE email='admin@ecole.com';
-- Vérif :
SELECT id,email,role FROM public.profiles WHERE role='admin';
```
Source : `README.md:27-32`, `cahier-des-charges-backend.md:83`. Pas de page d'inscription admin.

### 8.5 Vérifications post-migration

```sql
-- RLS active ?
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public';
-- Policies
SELECT policyname, tablename FROM pg_policies WHERE schemaname='public';
-- Buckets
SELECT id, name, public FROM storage.buckets;
-- Triggers
SELECT trigger_name, event_object_table FROM information_schema.triggers WHERE trigger_schema='public';
-- Cron
SELECT jobname, schedule FROM cron.job;
-- Extensions
SELECT extname FROM pg_extension WHERE extname IN ('pg_cron','pg_net','pg_trgm');
```

## 9. Références

- Schéma : `supabase/migrations/001_initial_schema.sql:1-177`
- RLS : `supabase/migrations/002_rls_policies.sql:1-103`
- Storage : `supabase/migrations/003_storage.sql:1-56` + `src/utils/files.ts:1-61` + `src/services/storage.ts:1-27`
- Notifs : `supabase/migrations/004_notifications.sql:1-86` + `006_event_reminders.sql:1-58`
- Realtime : `supabase/migrations/005_realtime.sql:1-13`
- Search : `supabase/migrations/007_search_indexes.sql:1-22` + `src/utils/search.ts:1-9`
- Contrats : `spec/02-database.md`, `spec/04-auth-securite-rls.md`, `spec/05-storage.md`, `spec/06-notifications-realtime.md`
