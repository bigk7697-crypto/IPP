# Setup — Backend IPP Site Scolaire V1

> Stack : Node 20 + TypeScript + Express + Supabase (Postgres/Auth/Storage/Realtime). Source de vérité : `package.json`, `src/config/env.ts`, `Dockerfile`, `supabase/migrations/*.sql`, `spec/*.md`.

## 1. Prérequis

| Outil | Version | Vérif |
|---|---|---|
| Node.js | **20.x** (`Dockerfile:1` `FROM node:20-alpine`, `@types/node ^20.12.0` dans `package.json:31`) | `node -v` |
| npm | 10.x (lockfile v3) | `npm -v` |
| Supabase CLI | dernière stable | `supabase --version` — [install](https://supabase.com/docs/guides/local-development/cli/getting-started) |
| Projet Supabase | 1 projet dev (+ 1 prod séparé recommandé, `spec/11-deploiement.md:29`) | Dashboard https://supabase.com/dashboard |

Pas de framework supplémentaire. Pas de `SUPABASE_SERVICE_ROLE_KEY` côté frontend (`spec/01-architecture.md:16`).

## 2. Installation

```bash
cd C:\Users\bigk7\Desktop\Site\Backend   # ou clone Git
npm ci                                   # install stricte depuis package-lock.json — Dockerfile:4 fait pareil
```

Scripts disponibles (`package.json:7-14`) :

| Script | Commande | Effet |
|---|---|---|
| `dev` | `tsx watch src/index.ts` | reload à chaud |
| `build` | `tsc` (`tsconfig.json:6` outDir `dist`) | compile vers `dist/` |
| `start` | `node dist/index.js` | prod local |
| `typecheck` | `tsc --noEmit` | vérif types sans build |

## 3. Variables d'environnement

### 3.1 Fichier

```bash
cp .env.example .env   # .env est ignoré par .gitignore:3 — JAMAIS commité
```

`src/index.ts:1` charge `dotenv/config` avant `src/config/env.ts`.

### 3.2 Référence (` .env.example:1-11` / `src/config/env.ts:7-21`)

| Variable | Requis | Défaut (`env.ts`) | Usage |
|---|---|---|---|
| `SUPABASE_URL` | **oui** (`assertServerEnv:19` lève si absent) | `''` | URL projet, ex `https://knmxosdfxxzjagqyhkcc.supabase.co` (`.env:2`, `supabase/.temp/linked-project.json:1` ref `knmxosdfxxzjagqyhkcc`) |
| `SUPABASE_SERVICE_ROLE_KEY` | **oui** (`assertServerEnv:20`) | `''` | Clé secrète serveur — `getServiceClient()` (`src/config/supabase.ts:13`) contourne RLS pour signed URLs / fan-out. Jamais au frontend, jamais loggée (`src/middleware/errorHandler.ts:5` ne log que `err.message`) |
| `SUPABASE_ANON_KEY` | recommandé | `''` | Clé publique — `getAnonClient()` (`src/config/supabase.ts:5`) respecte RLS. Utilisée par `src/middleware/auth.ts:29` pour `auth.getUser(token)` |
| `PORT` | non | `4000` (`env.ts:8`) | Port Express (`src/index.ts:7` `app.listen(env.port)`, `Dockerfile:16` `EXPOSE 4000`) |
| `ALLOWED_ORIGINS` | non | `http://localhost:5173` (`env.ts:12`) | CSV parsée par `split(',')` + `trim` (`env.ts:12-15`), passée à `cors({origin: env.allowedOrigins, credentials:true})` (`src/app.ts:32-35`). Dev: `http://localhost:5173,http://localhost:3000` (`.env.example:11`). Prod: `https://www.ecole.com,https://admin.ecole.com` (`spec/11-deploiement.md:17`) |

> `ALLOWED_ORIGINS` vide ou mal formée → fallback `http://localhost:5173`. En prod, définir explicitement les deux domaines front (public + admin).

## 4. Base de données — projet Supabase + migrations 001→007

### 4.1 Créer / lier le projet

```bash
# 1. Créer le projet dans le Dashboard Supabase (nom ex: IPP)
# 2. Récupérer le project-ref (ex: knmxosdfxxzjagqyhkcc dans .env:2)
supabase link --project-ref knmxosdfxxzjagqyhkcc
# vérif: cat supabase/.temp/linked-project.json
```

### 4.2 Pousser les migrations (ordre impératif)

```bash
supabase db push
# équivalent SQL Editor : exécuter dans l'ordre supabase/migrations/*.sql
```

| # | Fichier | Contenu |
|---|---|---|
| 001 | `supabase/migrations/001_initial_schema.sql` | 11 tables (`profiles`, `classes`, `news`, `events`, `documents`, `results`, `gallery_albums`, `gallery_images`, `notifications`, `notification_preferences`, `school_settings` id=1) + trigger `set_updated_at` + index `status/published_at` |
| 002 | `supabase/migrations/002_rls_policies.sql` | `is_admin()`, `prevent_role_escalation()` (trigger anti auto-promotion), `ENABLE RLS` sur 10 tables, policies `news/events` published-only, `results` auth-only, `notifications` own-only, `documents` public/private |
| 003 | `supabase/migrations/003_storage.sql` | 3 buckets `public-assets` (public), `private-results` + `private-documents` (privés), policies Storage `public.is_admin()` / `auth.role()='authenticated'` |
| 004 | `supabase/migrations/004_notifications.sql` | `handle_new_auth_user()` (trigger `auth.users` → `profiles` + `notification_preferences`), `fanout_on_publish()` sur transition → `published` pour `news/events/results/documents` |
| 005 | `supabase/migrations/005_realtime.sql` | `publication supabase_realtime` sur `news`, `events`, `notifications` |
| 006 | `supabase/migrations/006_event_reminders.sql` | `send_event_reminders()` + `pg_cron` quotidien `0 7 * * *` (J-3 / Jour-J, anti-doublon `calendar` du jour) |
| 007 | `supabase/migrations/007_search_indexes.sql` | `pg_trgm` + GIN `gin_trgm_ops` sur `news/events/documents/classes` pour `?q` (`ilike`) |

Vérif : `supabase migration list` doit afficher 001–007 appliquées.

### 4.3 Seed (DEV uniquement)

```sql
-- Supabase SQL Editor — NE JAMAIS appliquer en prod (entête seed.sql:1)
-- supabase/seed/seed.sql insère 3 classes, 2 news published + 1 draft, 1 event published
```

Ou via CLI :
```bash
psql "$SUPABASE_DB_URL" -f supabase/seed/seed.sql
```

## 5. Création compte admin (manuel, pas d'API)

Pas de route d'inscription admin (`spec/04-auth-securite-rls.md:8`, `README.md:27-32`) :

1. Supabase Dashboard → **Authentication → Users → Create user** (email + password).
2. Vérifier que le trigger `handle_new_auth_user` (`004`) a créé `profiles` + `notification_preferences`.
3. SQL Editor :
   ```sql
   update public.profiles set role = 'admin' where email = 'admin@ecole.com';
   -- vérif
   select id, email, role from public.profiles where email='admin@ecole.com';
   ```
4. Se connecter via `POST /api/auth` → le middleware `src/middleware/auth.ts:39-50` lit `role` depuis `profiles` (source vérité DB, `spec/04:7`).

> Toute tentative `PATCH profiles` avec `role` différent est bloquée par `prevent_role_escalation` (`002:11-21`) si `is_admin()=false`.

## 6. Lancement

```bash
npm run dev          # http://localhost:4000/api/health → {"success":true,"data":{"status":"ok"}} (src/routes/health.ts:4)
# ou
npm run build && npm start   # tsc → dist/ puis node dist/index.js (Dockerfile:7 + 17)
```

Health check : `GET /api/health` (`src/app.ts:40`, `src/routes/health.ts:4`). 404 générique sur toute autre route (`src/app.ts:62-67`).

Docker local :
```bash
docker build -t site-backend .
docker run -p 4000:4000 --env-file .env site-backend
# Dockerfile:12 ENV NODE_ENV=production est déjà posé dans l'image finale
```

## 7. Tests

| Commande (`package.json:12-14`) | Cible | Prérequis |
|---|---|---|
| `npm test` | `tests/sanity.test.js` `utils.test.js` `validators.test.js` `search.test.js` `integration.test.js` — unitaires + validation Zod (`src/validators/*.ts`) + offline | aucun (Node natif `--test`) |
| `npm run test:live` | `tests/rls-live.test.js` — **tests RLS contre le vrai projet** (`HEADERS apikey + Authorization Bearer ANON_KEY:19`, `spec/08-tests.md`) | `.env` avec `SUPABASE_URL` + `SUPABASE_ANON_KEY` valides, seed appliqué |
| `npm run test:all` | tous les tests ci-dessus | idem `test:live` |

Détail `test:live` (`tests/rls-live.test.js:32-69`) :
- visiteur lit seulement `news.status='published'` (draft filtré par `002:52`),
- `GET /results` → `[]` (policy `002:83` auth-only),
- `GET /notifications` → `[]` (own-only `002:91`),
- `POST /news|events|results|classes` en ANON → `400/401/403/404` (RLS ou validation).

Recommandé avant push : `npm run typecheck && npm test`.
