# Architecture — Backend IPP Site Scolaire V1

> Stack réelle : **Node 20 + TypeScript 5.4 + Express 4.19 + Supabase (Postgres + Auth + Storage + Realtime)** — cf. `package.json:16-25`, `Dockerfile:1`, `tsconfig.json:3-4`.

## 1. Principes

- **Supabase = source de vérité centrale** : Postgres, Auth, Storage, Realtime, Edge Functions/cron (`spec/01-architecture.md:5-6`, `cahier-des-charges-backend.md:65-85`).
- **Hybride** :
  - Lecture publique directe via SDK (RLS) pour `news/events/gallery` publiés.
  - API Node pour le sensible : `admin/*`, `results` (signed URL), `notifications`, validation, fan-out (`spec/01-architecture.md:10-12`, `src/app.ts:54-60`).
- Interdits : pas de double DB Supabase+Firebase, pas de `SERVICE_ROLE_KEY` côté frontend, pas de copie locale (`spec/01-architecture.md:15-17`).

## 2. Stack détaillée

| Couche | Tech / Version | Fichier source |
|---|---|---|
| Runtime | Node 20 Alpine | `Dockerfile:1,10` |
| Langage | TypeScript 5.4, `ES2022`, `NodeNext` | `tsconfig.json:3-5`, `package.json:33` |
| HTTP | Express 4.19 + `helmet`, `cors`, `morgan`, `express.json({limit:'1mb'})` | `src/app.ts:1-4,29-37`, `package.json:18-21` |
| Validation | `zod 3.23` | `package.json:24`, `src/validators/*.ts` |
| Upload | `multer 2.4` (memoryStorage) | `package.json:21`, `src/middleware/upload.ts:5-8` |
| Supabase | `@supabase/supabase-js 2.45` | `package.json:17`, `src/config/supabase.ts:1` |
| Env | `dotenv 16.4`, `PORT`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ALLOWED_ORIGINS` | `src/config/env.ts:7-16`, `.env.example:1-11` |
| Build | `tsc` → `dist/`, `tsx watch` en dev | `package.json:8-10`, `tsconfig.json:6-7` |
| Déploiement | Multi-stage Docker (build → prune → run `node dist/index.js`) | `Dockerfile:1-17` |

Scripts (`package.json:7-14`) : `dev` (tsx watch), `build` (tsc), `start`, `typecheck`, `test` (node --test).

## 3. Structure dossiers

```
Backend/
├── src/
│   ├── app.ts                 # createApp() : middlewares + montage routes
│   ├── index.ts               # dotenv + listen(env.port)
│   ├── config/
│   │   ├── env.ts             # env.port, supabaseUrl/Anon/ServiceRole, allowedOrigins, assertServerEnv()
│   │   └── supabase.ts        # getAnonClient(token?) / getServiceClient() (SERVICE_ROLE)
│   ├── middleware/
│   │   ├── auth.ts            # JWT Supabase → req.user + req.accessToken
│   │   ├── requireAdmin.ts    # 403 si role !== admin
│   │   ├── upload.ts          # multer memoryStorage (LIMITS.*)
│   │   └── errorHandler.ts    # 500 normalisé
│   ├── routes/
│   │   ├── health.ts, news.ts, events.ts, documents.ts, gallery.ts, classes.ts
│   │   ├── results.ts         # GET /:classId → signedUrl 1h
│   │   ├── notifications.ts   # GET /, PATCH /read-all, PATCH /:id/read
│   │   ├── auth.ts            # GET /me (profil + email_verified)
│   │   ├── profile.ts, preferences.ts, settings.ts
│   │   └── admin.*.ts         # 7 routeurs : news, events, classes, documents, gallery, results, settings
│   ├── validators/            # zod : news, events, classes, documents, gallery, results, profile, preferences, settings, common
│   ├── services/storage.ts    # uploadBuffer, removeFile, signedUrl (SERVICE_ROLE)
│   ├── utils/
│   │   ├── files.ts           # LIMITS, MIME, build*Path, splitBucketPath
│   │   ├── search.ts          # escapeIlike, normalizeQuery (?q ≤100)
│   │   └── errors.ts          # fail(), ok(), paginationParams/Meta
│   └── types/index.ts         # Role, Status, ApiError, AuthUser
├── supabase/
│   ├── migrations/            # 001 → 007 (voir docs/database.md)
│   ├── functions/             # Edge Functions (event-reminders compatible 006)
│   └── seed/                  # seed.sql DEV uniquement
├── spec/                      # 01-archi → 11-deploiement (contrats gelés)
├── tests/                     # sanity, utils, validators, search, integration, rls-live
├── docs/                      # architecture.md (ce fichier), database.md
├── .env / .env.example
├── Dockerfile, package.json, tsconfig.json
└── README.md
```
Réf. attendue : `spec/01-architecture.md:19-29` + arborescence réelle `src/**`.

## 4. Flux Auth — Supabase Auth + JWT + `middleware/auth.ts`

```
Frontend                    Supabase Auth              API Node (Express)               Postgres (profiles)
  │  signUp/signInWithPassword │                           │                              │
  ├───────────────────────────►│ anon key                  │                              │
  │◄─── access_token (JWT) ────┤                           │                              │
  │  Authorization: Bearer JWT │                           │                              │
  ├────────────────────────────┼──────────────────────────►│ auth.ts:16-58                │
  │                            │     getAnonClient(token)  │  anon.auth.getUser(token)    │
  │                            │◄──────────────────────────┤  src/middleware/auth.ts:29-30│
  │                            │─── user (id,email) ─────►│                              │
  │                            │                           │ getServiceClient()           │
  │                            │                           ├─────────────────────────────►│ SELECT id,role FROM profiles
  │                            │                           │  WHERE id = auth.uid()       │  auth.ts:40-44
  │                            │                           │◄── profile.role ─────────────┤
  │                            │                           │ req.user={id,email,role}     │  auth.ts:46-50
  │                            │                           │ next() ou 401                │
  │                            │                           │ requireAdmin → 403 si ≠admin  │  requireAdmin.ts:4-11
```

Détails code :
- Extraction `Authorization: Bearer <token>` → 401 `UNAUTHORIZED` si absent (`src/middleware/auth.ts:18-27`).
- Vérif JWT via `anon.auth.getUser(token)` (`auth.ts:30-31`). Échec → 401 `Session invalide`.
- Résolution rôle **côté DB uniquement** : `SELECT id,role FROM profiles WHERE id = auth.uid()` via `SERVICE_ROLE` (`auth.ts:40-44`). Défaut `user` si profil manquant (`auth.ts:49`).
- `req.user` et `req.accessToken` typés via augmentation `Express.Request` (`auth.ts:5-12`, `types/index.ts:17-21`).
- Route `GET /api/auth/me` (`src/routes/auth.ts:9-32`) : re-lit `profiles` + `anon.auth.getUser` pour `email_verified = !!email_confirmed_at`.
- RBAC : `src/app.ts:53-60` monte `/api/admin/*` derrière `auth` + `requireAdmin`. Un `user` → 403 `FORBIDDEN`. Prévention escalation : trigger `prevent_role_escalation` en DB (voir database.md).
- CORS : `src/app.ts:31-36` → `origin: env.allowedOrigins` (`src/config/env.ts:12-15`), `credentials:true`. Config via `ALLOWED_ORIGINS` (`.env.example:10-11`).
- Clés : `getAnonClient` respecte RLS (`src/config/supabase.ts:5-9`), `getServiceClient` contourne RLS — jamais exposé au front (`supabase.ts:11-16`, `spec/04-auth-securite-rls.md:7-8`).

## 5. Flux Storage — buckets public / privé

```
Admin (multipart)           API Node                              Supabase Storage
  │ POST /api/admin/results  │                                     │
  │ file+meta (zod)          │  uploadResult.single('file')        │
  ├─────────────────────────►│  src/middleware/upload.ts:11        │ ① Valide MIME
  │                          │  MIME.result / LIMITS.resultMaxBytes│    result: pdf/xlsx 15 Mo
  │                          │  src/utils/files.ts:9,15             │    image: jpg/png/webp 5 Mo
  │                          │  buildResultPath()                  │    files.ts:3-23
  │                          │  private-results/2025-2026/terminale-d/<uuid>.pdf  files.ts:43-45
  │                          │  uploadBuffer(fullPath,buffer,mime)─┼─────────────────────────►│ storage.from(bucket).upload()
  │                          │  src/services/storage.ts:4-13       │    services/storage.ts:7
  │                          │  INSERT results(file_path,…)        │◄── succès / échec ───────┤
  │                          │  échec DB → removeFile(fullPath)    │     cohérence DB+Storage │  admin.results.ts:93
  │◄── 201 {data} ────────────┤  admin.results.ts:84-96            │
  │                          │                                     │
User (lecture)               │                                     │
  │ GET /api/results/:classId│  auth requis (auth.ts)              │
  ├─────────────────────────►│  SELECT … WHERE status='published'  │
  │                          │  svc.storage.from(bucket)           │
  │                          │    .createSignedUrl(path,3600)     ─┼─────────────────────────►│ URL signée TTL 1h
  │◄── {…,downloadUrl,expiresIn:3600} ─────────────────────────────┤  src/routes/results.ts:30-35
  │                          │  Jamais d'URL publique permanente   │    services/storage.ts:21-26

Documents : GET /api/documents/:id → `signedUrl(file_path,3600)` si `visibility='private'` et token requis (`src/routes/documents.ts:46-78`).
Liste GET /api/documents : masque `file_path` des privés (`documents.ts:34-38`), RLS filtre déjà.
```

Buckets (`supabase/migrations/003_storage.sql:5-15`) :
- `public-assets` (public=true) : `news/`, `gallery/`, `events/` → `buildPublicImagePath()` (`utils/files.ts:52-54`), lecture `SELECT` publique, écriture admin seul (`003_storage.sql:18-32`).
- `private-results` (public=false) + `private-documents` (public=false) : lecture `authenticated` seul, écriture admin (`003_storage.sql:34-52`). Accès prod toujours via `createSignedUrl` backend (note `003_storage.sql:54-56`).

Nommage : `randomUUID()` + `extOf()` + `slug()` (`utils/files.ts:26-40`) → `private-results/<year>/<classe>/<uuid>.pdf`, `private-documents/<cat>/<uuid>.*`, `public-assets/<folder>/<uuid>.jpg`. Pas de nom d'origine conservé.

Suppression atomique : `DELETE /api/admin/results/:id` → `SELECT file_path` puis `DELETE` DB puis `removeFile()` (`admin.results.ts:134-144`).

## 6. Flux Notifications / Realtime

```
Admin publie                Postgres (trigger)                    API / Frontend
  │ PUT /api/admin/news/:id  │                                    │
  │ status=draft→published   │  fanout_on_publish()               │ Realtime (supabase_realtime)
  ├─────────────────────────►│  supabase/migrations/004_notifications.sql:30-86
  │                          │  IF new.status='published' AND old.status≠'published'
  │                          │  THEN INSERT INTO notifications    │
  │                          │   SELECT p.id, type, title,…       │
  │                          │   FROM profiles p                  │
  │                          │   LEFT JOIN notification_preferences np
  │                          │   WHERE p.role='user'              │
  │                          │     AND coalesce(np.<pref>::bool,true)=true
  │                          │  pref: news_enabled/events_enabled/results_enabled/documents_enabled
  │                          │  Une ligne par user opt-in         │
  │                          │                                    │  supabase.channel('my-notifs')
  │                          │  publication supabase_realtime     │   .on('postgres_changes', table:'notifications')
  │                          │  005_realtime.sql:11-13            │  spec/06-notifications-realtime.md:19-20
  │                          │  news, events, notifications       ├──────────────────────────────►│ toast / refetch
  │                          │                                    │  Fallback: fetch polling si Realtime down
  │                          │                                    │  005_realtime.sql:2

Centre de notifs (API Node) :
  GET  /api/notifications?page&limit  (auth, WHERE user_id=auth.uid())  src/routes/notifications.ts:10-25
  PATCH /api/notifications/read-all   (avant /:id/read)                notifications.ts:28-41
  PATCH /api/notifications/:id/read   (WHERE id AND user_id)           notifications.ts:44-57
  GET/PATCH /api/notification-preferences (6 flags)                     spec/03-api-contract.md:22-23
```

Rappels événementiels (`supabase/migrations/006_event_reminders.sql`) :
- Fonction `send_event_reminders() RETURNS TABLE(sent int)` : cible `events` où `status='published'` et `start_at::date IN (today, today+3)`, cross-join `profiles` où `calendar_enabled=true`, anti-doublon `NOT EXISTS (notifications type='calendar' AND target_id AND created_at::date=today)` (`006_event_reminders.sql:8-52`).
- Cron `pg_cron` quotidien `0 7 * * *` (`006_event_reminders.sql:55-58`) → `SELECT send_event_reminders()`. Extensions `pg_cron`, `pg_net` (`006:5-6`).

Création profil auto : trigger `handle_new_auth_user()` sur `auth.users` INSERT → `INSERT profiles(... first_name/last_name/email ...)` + `INSERT notification_preferences(user_id)` (`004_notifications.sql:5-27`).

## 7. Schéma global

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        SUPABASE (source de vérité)                      │
│  ┌──────────┐  ┌──────┐  ┌─────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Postgres │  │ Auth │  │ Storage │  │ Realtime │  │ pg_cron/pg_net│  │
│  │ 11 tables│  │ JWT  │  │ 3 buckets│  │publication│  │  reminders   │  │
│  │ RLS+trig │◄─┤      │◄─┤         │◄─┤ news/ev/ │◄─┤  07:00 UTC    │  │
│  └────┬─────┘  └──────┘  └────┬────┘  └────┬─────┘  └───────────────┘  │
│       │                     │            │                              │
└───────┼─────────────────────┼────────────┼──────────────────────────────┘
        │                     │            │
        │  SERVICE_ROLE       │ signedUrl  │  ANON (RLS)
        │  (bypass RLS)       │ 1h         │  (filtré)
        ▼                     ▼            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    API Node — Express (src/app.ts:27-71)                │
│  helmet + cors(ALLOWED_ORIGINS) + json(1mb) + morgan                    │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Public : /api/health, /news, /events, /classes, /documents,    │  │
│  │           /gallery, /settings  (getAnonClient, RLS published)   │  │
│  │  Auth   : /api/auth/me, /profile, /results/:classId,            │  │
│  │           /notifications, /notification-preferences (auth.ts)   │  │
│  │  Admin  : /api/admin/*  (auth + requireAdmin) 7 routeurs        │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  validators/zod → services/storage → utils/files+search+errors         │
└──────────────┬──────────────────────────────┬───────────────────────────┘
               │ Bearer JWT                   │ Realtime channel
               ▼                              ▼
        ┌─────────────┐               ┌──────────────┐
        │ Frontend    │               │ Admin Front  │
        │ public+user │               │  (même API)  │
        └─────────────┘               └──────────────┘
```

Points d'attention :
- `SERVICE_ROLE_KEY` uniquement dans `src/config/supabase.ts:13-15` + `src/services/storage.ts` + routes admin — jamais loggée (`src/middleware/errorHandler.ts:5`), jamais commitée (`.gitignore`).
- Validation systématique Zod avant DB/Storage (`admin.results.ts:37-43`, `validators/*.ts`).
- Cohérence DB+Storage : upload d'abord, insert ensuite, rollback Storage si insert échoue, et inversement (`admin.results.ts:72-95`).
- Pagination : `paginationParams` (`utils/errors.ts:11-14`) → `page/limit/from/to` (limit max 100, défaut 20), `count:exact`, `range(from,to)` dans toutes les listes.
- Recherche `?q` : `normalizeQuery` (trim ≤100) + `escapeIlike` (`utils/search.ts:1-8`) → `or(title.ilike.%…%,content.ilike.%…%)` sur news/events/documents (`routes/news.ts:22-24`, `routes/documents.ts:26-28`), indexes `gin_trgm` (`007_search_indexes.sql`).
- Erreurs normalisées : `{success:false, error:{code,message,details}}` (`types/index.ts:4-15`, `spec/07-erreurs-validation.md:3-7`), `errorHandler` → 500 `INTERNAL_ERROR`.

## 8. Variables & déploiement

- `.env.example:1-11` : `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (secret), `PORT=4000`, `ALLOWED_ORIGINS` (CSV).
- `src/config/env.ts:18-21` `assertServerEnv()` exige `SUPABASE_URL` + `SERVICE_ROLE_KEY` au boot (optionnel selon `src/index.ts:7`).
- `Dockerfile:1-17` : build `npm ci` + `tsc` + `prune`, run `node dist/index.js`, `EXPOSE 4000`, `NODE_ENV=production`.
- Déploiement : Render/Railway/Fly.io (`spec/11-deploiement.md:6-25`), env `ALLOWED_ORIGINS` = domaines prod, healthcheck `GET /api/health` (`src/routes/health.ts`).

## 9. Références

- Contrats gelés : `spec/03-api-contract.md` (routes), `spec/04-auth-securite-rls.md` (RLS), `spec/05-storage.md` (buckets), `spec/06-notifications-realtime.md` (fan-out), `spec/07-erreurs-validation.md` (codes).
- Cahier : `cahier-des-charges-backend.md:41-85` (objectif/archi), `§47-50` (API/flux).
