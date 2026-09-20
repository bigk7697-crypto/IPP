# Sécurité — Backend IPP Site Scolaire V1

> Principes : jamais de secret côté front, RLS côté DB (jamais côté UI), `SERVICE_ROLE` serveur uniquement. Sources : `src/app.ts:29-35`, `src/middleware/auth.ts:16-57`, `src/middleware/requireAdmin.ts:3-11`, `src/middleware/upload.ts:1-13`, `src/config/supabase.ts:1-16`, `src/validators/*.ts`, `src/utils/files.ts:1-61`, `supabase/migrations/002_rls_policies.sql:1-103`, `supabase/migrations/003_storage.sql:1-56`.

## 1. Authentification — Supabase Auth (JWT)

### 1.1 Flux

- Auth déléguée à `Supabase Auth (GoTrue)` — le backend **ne stocke jamais** de mot de passe (`profiles` ne contient que `id,email,role` `supabase/migrations/001_initial_schema.sql:14-22` ; `password` absent).
- Frontend signe via `supabase.auth.signUp/signIn` → reçoit `access_token` (JWT) + `refresh_token`.
- Chaque requête protégée envoie `Authorization: Bearer <JWT>` ; middleware `auth()` (`src/middleware/auth.ts:16`) :
  ```ts
  const anon = getAnonClient(token);          // src/middleware/auth.ts:29
  const { data, error } = await anon.auth.getUser(token); // vérif signature + expiry côté Supabase
  ```
  Si `error || !data.user` → `401 UNAUTHORIZED "Session invalide ou expirée."` (`src/middleware/auth.ts:31-35`). Le `token` brut est conservé `req.accessToken` (`src/middleware/auth.ts:27`) pour être réinjecté dans `getAnonClient(token)` côté lectures RLS (ex. `src/routes/news.ts:13-14`, `src/routes/documents.ts:16-17`, `src/routes/results.ts:9`).

### 1.2 Résolution du rôle (source de vérité DB)

- Après validation JWT, lecture `profiles` via `SERVICE_ROLE` (`src/middleware/auth.ts:39-44`) :
  ```ts
  svc.from('profiles').select('id, role').eq('id', data.user.id).single()
  req.user = { id, email, role: profile?.role ?? 'user' } // src/middleware/auth.ts:46-50
  ```
- Jamais de `role` lu depuis le JWT claim seul — anti-falsification front. Le frontend ne peut pas `role=admin` (`cahier-des-charges §16`).

### 1.3 `GET /api/auth/me`

- `src/routes/auth.ts:9-30` : re-lit `profiles` via `SERVICE_ROLE` + `anon.auth.getUser(token)` pour `email_verified = !!email_confirmed_at` (`src/routes/auth.ts:20-26`). Contrôle fin possible côté front.

### 1.4 Endpoints protégés

| Route | Middleware |
|-------|------------|
| `GET /api/auth/me` | `auth` (`src/routes/auth.ts:9`) |
| `GET /api/results/:classId` | `auth` (`src/routes/results.ts:9`) |
| `GET+PATCH /api/profile` | `auth` (`src/routes/profile.ts:7`) |
| `GET+PATCH /api/notification-preferences` | `auth` (`src/routes/preferences.ts:7`) |
| `GET /api/notifications` + `PATCH read-all/:id/read` | `auth` (`src/routes/notifications.ts:7`) |
| `GET /api/documents/:id` (privé) | check `token` (`src/routes/documents.ts:66-71`) |
| `ALL /api/admin/*` | `auth, requireAdmin` (`src/app.ts:54-60`) |

### 1.5 Règles mot de passe (Supabase Auth)

- Appliquées côté Supabase Dashboard → `Auth → Configuration` (GoTrue). V1 : minimum 6 caractères, complexité configurable ; backend n'intervient pas (pas de stockage local). L'inscription/connexion/récupération/changement sont opérés directement par `supabase.auth.*` côté SDK, jamais par une route `/api/auth` locale (seule `GET /me` existe `src/routes/auth.ts:9`).
- Recommandé en prod : `password min length 8`, `leaked password protection`, `double facteur` — à activer Dashboard.

### 1.6 JWT expiry / refresh rotation

- **Access token :** JWT court (défaut Supabase 3600 s). Vérifié à chaque `auth()` via `getUser(token)` (`src/middleware/auth.ts:30`) — expiré → `401`.
- **Refresh token :** longue durée, rotation automatique côté GoTrue (`detectSessionInUrl`, `autoRefreshToken`). Le backend Express est **stateless** : il ne gère ni cookie ni session, ne stocke aucun refresh. Le front rafraîchit via `supabase.auth.refreshSession()` / `onAuthStateChange`.
- Aucune logique refresh côté `src/` — le backend ne fait que valider l'access token courant.

## 2. Autorisation — RLS (Row Level Security)

Fichiers : `supabase/migrations/002_rls_policies.sql:1-103` + `001_initial_schema.sql:14-37`. RLS activée sur 11 tables (`supabase/migrations/002_rls_policies.sql:24-34`) :

```sql
alter table public.profiles enable row level security; -- idem classes, news, events, documents, results, gallery_albums, gallery_images, notifications, notification_preferences, school_settings
```

### 2.1 Helper `is_admin()`

```sql
create function public.is_admin() returns boolean ... select exists (select 1 from profiles where id=auth.uid() and role='admin'); -- 002_rls_policies.sql:5-8
```
`security definer`, `search_path=public` — utilisée dans toutes les policies admin.

### 2.2 Matrice par table

| Table | Lecture | Écriture | Fichier / ligne |
|-------|---------|----------|-----------------|
| `profiles` | `auth.uid()=id OR is_admin()` `profiles_select_own` `002:38` | `insert check auth.uid()=id` `002:40` ; `update using+check auth.uid()=id` `002:42` | `002:37-42` |
| `classes` | `true` (publique) `classes_read` `002:46` | `for all using is_admin()` `002:48` | `002:45-48` |
| `news` | `status='published' OR is_admin()` `002:52` | `for all using is_admin()` `002:54` | `002:51-54` + route filtre `eq('status','published')` `src/routes/news.ts:19` |
| `events` | idem `002:56-57` | idem `002:59` | `002:56-59` |
| `gallery_albums` | `true` `002:63` | `is_admin()` `002:65` | `002:62-65` |
| `gallery_images` | `true` `002:67` | `is_admin()` `002:69` | `002:66-69` |
| `documents` | `(published∧public) ∨ (published∧private∧authenticated) ∨ is_admin()` `002:73-77` | `is_admin()` `002:79` | `002:72-79` + masquage `file_path` `src/routes/documents.ts:34-38` |
| `results` | `(published∧authenticated) ∨ is_admin()` `results_user_read` `002:83-84` — **jamais public** | `is_admin()` `002:87` | `002:82-87` + signed URL backend `src/routes/results.ts:30-32` |
| `notifications` | `user_id=auth.uid() OR is_admin()` `002:91` | `update using user_id=auth.uid()` `002:93` | `002:90-93` + `SERVICE_ROLE eq(user_id, req.user.id)` `src/routes/notifications.ts:17` |
| `notification_preferences` | `for all using user_id=auth.uid()` `002:97` | idem | `002:96-97` + `upsert onConflict user_id` `src/routes/preferences.ts:51` |
| `school_settings` | `true` `002:101` | `is_admin()` `002:103` | `002:100-103` |

> Le backend double les garde-fous : routes publiques filtrent `status='published'` même si RLS le fait (`src/routes/news.ts:19,44`, `src/routes/events.ts:18,41`, `src/routes/documents.ts:22`).

### 2.3 Anti-escalade `role`

- Trigger `prevent_role_escalation()` (`002:11-18`) :
  ```sql
  if new.role <> old.role and not is_admin() then raise exception 'Modification du role interdite.';
  ```
  Déclenché `before update of role on profiles` (`002:20-21`).
- Conséquence : même si RLS `profiles_update_own using auth.uid()=id` permet l'UPDATE, le trigger bloque `role` pour non-admin. Le `PATCH /api/profile` n'accepte d'ailleurs que `first_name/last_name` (`src/validators/profile.ts:3-6`, `src/routes/profile.ts:41`).
- Tests requis : `user → role=admin` doit échouer (cf `cahier-des-charges §67`).

## 3. Storage — Buckets & policies

### 3.1 Buckets (`003_storage.sql:5-15`)

| Bucket | `public` | Usage |
|--------|----------|-------|
| `public-assets` | `true` | `news/gallery/events` images, logos — `buildPublicImagePath` `src/utils/files.ts:52-54` |
| `private-results` | `false` | PDF/XLSX résultats — `buildResultPath` `src/utils/files.ts:43-45` |
| `private-documents` | `false` | documents `private` — `buildDocumentPath` `src/utils/files.ts:47-49` |

### 3.2 Policies (`003_storage.sql:18-52`)

- `public-assets` : `select using bucket_id='public-assets'` (`003:20`), `insert/update/delete with check/using is_admin()` (`003:23-32`) — upload admin seulement.
- `private-results` : `select using bucket_id='private-results' and auth.role()='authenticated'` (`003:36-37`), `for all using is_admin()` (`003:41-42`).
- `private-documents` : idem (`003:45-52`).
- Note sécurité `003:54-55` : accès résultats doit passer par `GET /api/results/:classId` qui génère `createSignedUrl()` via `SERVICE_ROLE` (`src/routes/results.ts:30-32`, `src/services/storage.ts:21-27`) — jamais d'URL permanente (`src/routes/documents.ts:73`, `src/services/storage.ts:21` avec `expiresIn 3600`).

### 3.3 Signed URL

- Implémentation `src/services/storage.ts:21-27` : `svc.storage.from(bucket).createSignedUrl(path, 3600)` via `SERVICE_ROLE` (`src/config/supabase.ts:13-15`). Appelé pour `results` (`src/routes/results.ts:31`) et `documents` (`src/routes/documents.ts:73`). DB ne stocke que `file_path = "<bucket>/<path>"` (`src/utils/files.ts:57-61` split).

## 4. Validation — Zod (fail-fast côté API)

Toutes les entrées passent `safeParse` → `422 VALIDATION_ERROR` avec `details: error.flatten()` si `published` sinon générique (`src/routes/admin.news.ts:15-22`, etc.). Schémas :

| Schéma | Règles | Fichier |
|--------|--------|---------|
| `paginationSchema` | `page>=1`, `limit 1..100`, `q max100` | `src/validators/common.ts:3-7` |
| `newsSchema` | `title 3..200`, `slug regex ^[a-z0-9]+(?:-[a-z0-9]+)*$`, `content 10..20000`, `image_path max500`, `status enum` | `src/validators/news.ts:3-9` |
| `eventSchema` | `title 3..200`, `description max5000`, `location max200`, `start_at datetime offset`, `end_at datetime offset`, `status enum` + check `end_at>=start_at` route | `src/validators/events.ts:3-11`, `src/routes/admin.events.ts:39-45` |
| `classSchema` | `name/level 2..100`, `series max10`, `academic_year regex ^\d{4}-\d{4}$`, `is_active boolean` | `src/validators/classes.ts:3-9` |
| `documentMetaSchema` | `title 3..200`, `description max1000`, `category max100`, `visibility public\|private`, `status enum` | `src/validators/documents.ts:3-9` |
| `albumSchema` | `title 2..150`, `description max1000`, `cover_image_path max500` | `src/validators/gallery.ts:3-7` |
| `imageMetaSchema` | `caption max300`, `sort_order int 0..10000 coerce` | `src/validators/gallery.ts:9-12` |
| `resultMetaSchema` | `class_id uuid`, `academic_year regex`, `result_type 2..100`, `status enum` | `src/validators/results.ts:3-8` |
| `settingsSchema` | tous optionnels `school_name 2..150`, `school_description max2000`, `address max300`, `phone max50`, `email email()`, `logo_path max500`, `website url()`, `social_links record<max300>` | `src/validators/settings.ts:3-12` |
| `profilePatchSchema` | `first_name/last_name 2..80` optionnels | `src/validators/profile.ts:3-6` |
| `preferencesPatchSchema` | 6 booleans optionnels | `src/validators/preferences.ts:3-10` |

> `profile`/`preferences`/`settings` PATCH rejettent body vide (`Object.keys(parsed.data).length===0` → `422`) (`src/routes/profile.ts:31`, `src/routes/preferences.ts:41`, `src/routes/admin.settings.ts:15`).

Search : `normalizeQuery` trim ≤100 (`src/utils/search.ts:5-7`) + `escapeIlike` (`src/utils/search.ts:1-3`) contre injection `ilike`.

## 5. Headers & middleware réseau

### 5.1 Helmet — `src/app.ts:29`

```ts
app.use(helmet());
```

- Active par défaut : `Content-Security-Policy`, `Strict-Transport-Security` (`max-age 15552000`), `X-DNS-Prefetch-Control`, `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Cross-Origin-*`, etc.

### 5.2 CORS — `src/app.ts:31-36`

```ts
app.use(cors({ origin: env.allowedOrigins, credentials: true }));
```

- `env.allowedOrigins` parsé depuis `ALLOWED_ORIGINS` (`src/config/env.ts:12-15`) :
  ```
  ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000  # .env.example:11
  # prod : https://www.ecole.com,https://admin.ecole.com
  ```
- Seules origines listées acceptées ; `credentials:true` pour `Authorization` header. Non listé → bloqué par navigateur.

### 5.3 Body limit — `src/app.ts:30`

```ts
app.use(express.json({ limit: '1mb' }));
```

- Contre payload JSON volumineux / DoS.

### 5.4 Logging sans secrets — `src/app.ts:37` + `src/middleware/errorHandler.ts:5`

- `morgan('dev')` ; `errorHandler` log `err.message` sans `token`/`SERVICE_ROLE` (`src/middleware/errorHandler.ts:5-6`).

### 5.5 Variables d'environnement

- `SUPABASE_SERVICE_ROLE_KEY` **secrète** serveur uniquement, jamais au front (`src/config/supabase.ts:11-15`, `src/config/env.ts:11`, `.env.example:4-5`). `getServiceClient()` lève si manquante (`src/config/supabase.ts:14`). Vérif au boot `assertServerEnv()` (`src/config/env.ts:18-21`).

## 6. Upload — limites, MIME, nommage, cohérence

### 6.1 Limites (`src/utils/files.ts:3-7`, `src/middleware/upload.ts:4-13`)

| Type | Limit | Middleware |
|------|-------|------------|
| `result` (PDF/XLSX) | `15 Mo` `LIMITS.resultMaxBytes` | `uploadResult` `src/middleware/upload.ts:11` |
| `document` (PDF/docx/xls/txt) | `15 Mo` `DOCUMENT` | `uploadDocument` `src/middleware/upload.ts:12` |
| `image` (jpeg/png/webp) | `5 Mo` `imageMaxBytes` | `uploadImage` `src/middleware/upload.ts:13` |

- `multer.memoryStorage()` (`src/middleware/upload.ts:6`), `limits: { fileSize: maxBytes, files:1 }` (`src/middleware/upload.ts:7`) → `413` automatique si dépassement + `422` métier (`src/routes/admin.documents.ts:52`, `src/routes/admin.results.ts:53`).

### 6.2 MIME strict (`src/utils/files.ts:9-24`)

```ts
MIME.result   = ['application/pdf','application/vnd.openxmlformats...sheet','application/vnd.ms-excel'] // 3 types
MIME.document = ['application/pdf','application/msword','application/vnd...word...','application/vnd...sheet','application/vnd.ms-excel','text/plain'] // 6 types
MIME.image    = ['image/jpeg','image/png','image/webp']
```

- Vérif après `multer` : `if (!MIME.*.includes(file.mimetype)) → 422` (`src/routes/admin.documents.ts:52-57`, `src/routes/admin.results.ts:53-57`, `src/routes/admin.gallery.ts:95-99`). Ne jamais faire confiance à l'extension client.

### 6.3 Nommage sécurisé (`src/utils/files.ts:26-54`)

- `extOf()` extrait extension safe regex `[^a-z0-9]` (`src/utils/files.ts:27-29`).
- `slug()` NFD → `a-z0-9-` (`src/utils/files.ts:32-40`).
- Chemins :
  ```ts
  buildResultPath(year, className, orig) // private-results/<slug year>/<slug classe>/<uuid>.<ext>  src/utils/files.ts:43
  buildDocumentPath(cat, orig)           // private-documents/<slug cat>/<uuid>.<ext>               src/utils/files.ts:47
  buildPublicImagePath(folder, orig)     // public-assets/<folder>/<uuid>.<ext>                       src/utils/files.ts:52
  ```
  Jamais le nom d'origine (`Date.now()-sanitized` fallback `src/routes/admin.documents.ts:61` pour public). Prévention collisions / path traversal.

### 6.4 Cohérence DB ↔ Storage

- `uploadBuffer()` via `SERVICE_ROLE` `upsert:false` (`src/services/storage.ts:7-9`). Si upload échoue → `500` sans ligne DB (`src/routes/admin.documents.ts:67-72`, `src/routes/admin.results.ts:74-79`). Si `insert` DB échoue après upload → `removeFile(fullPath)` rollback (`src/routes/admin.documents.ts:87`, `src/routes/admin.results.ts:93`, `src/routes/admin.gallery.ts:126`).
- `DELETE` supprime Storage après DB (`src/routes/admin.documents.ts:131-134`, `src/routes/admin.results.ts:137-140`, `src/routes/admin.gallery.ts:65-76`) avec `catch(()=>{})` pour orphelins.

## 7. Anti-escalade & durcissement admin

- `requireAdmin` (`src/middleware/requireAdmin.ts:3-11`) + `is_admin()` RLS déjà vu. Toute route `src/routes/admin.*.ts:9` fait `router.use(auth, requireAdmin)` — ordre `auth` d'abord pour peupler `req.user`.
- Trigger anti-`role` (`supabase/migrations/002_rls_policies.sql:11-21`) bloque escalade même si RLS `UPDATE` autorisait.
- Contraintes FK : `classes ← results on delete restrict` (`supabase/migrations/001_initial_schema.sql:98`) → `DELETE /api/admin/classes/:id` renvoie `409` si résultats liés (`src/routes/admin.classes.ts:87-92`). `gallery_images album_id on delete cascade` (`001:129`) — delete album supprime images + Storage boucle (`src/routes/admin.gallery.ts:65-68`).
- Publication cohérente : `published_at` set au premier passage `published`, null si retour `draft` (`src/routes/admin.news.ts:73-77`, `src/routes/admin.documents.ts:109-113`, `src/routes/admin.results.ts:115-119`). Notif automatique via trigger DB (`supabase/migrations/004_notifications.sql` — hors scope, mais `admin.*` commente `publish → trigger DB crée les notifs auto` `src/routes/admin.news.ts:11`).

## 8. Recommandations opérationnelles

| Sujet | Valeur actuelle / action |
|-------|--------------------------|
| `helmet` | activé `src/app.ts:29` — ne pas désactiver `hsts`/`frameguard` |
| `CORS` | restreindre `ALLOWED_ORIGINS` prod aux deux domaines exacts (`.env.example:9-11`) |
| `SERVICE_ROLE` | jamais loggé, jamais commité (`.gitignore`), injecté env seulement |
| JWT expiry | garder 3600 s ; refresh via Supabase SDK, pas via backend Express |
| Password rules | Dashboard Auth → `Minimum password length 8`, `Leaked protection ON` |
| Storage public | n'héberger que `public-assets` ; vérifier `private-*` jamais `public` |
| Tests sécu | couvrir `user → /api/admin/* =403`, `user A → notif B =0`, `visiteur → results =401`, `user → PATCH role = trigger error` (cf `cahier-des-charges §67`) |


## 9. Durcissement espace admin (2026-09-20)

- MFA TOTP obligatoire sur /api/admin/* : src/middleware/requireMfa.ts v�rifie le claim JWT al === 'aal2' (token d�j� valid� par uth). Sans MFA -> 403 {code:'MFA_REQUIRED'}. Enr�lement via AdminLogin (QR + code).
- Throttle : src/middleware/rateLimit.ts � dminLimiter 100 req/15min/IP sur /api/admin/*, uthLimiter 60 req/15min/IP sur /api/auth/me. R�ponse 429 {code:'RATE_LIMITED'} + header Retry-After.
- URL admin non list�e : pas de lien public vers /IPP/direction/, Frontend/client/public/robots.txt en Disallow. Le repo �tant public, l'obscurit� ne remplace ni mot de passe fort ni MFA.
- Captcha hCaptcha (� activer quand cl�s cr��es sur https://dashboard.hcaptcha.com) : frontend envoie options.captchaToken via window.__hcaptchaToken (d�j� c�bl� uth.service.ts, AdminLogin.tsx), puis activer c�t� Supabase :
  `PATCH /v1/projects/knmxosdfxxzjagqyhkcc/config/auth {"security_captcha_enabled":true,"security_captcha_provider":"hcaptcha","security_captcha_secret":"0x..."}` + `VITE_HCAPTCHA_SITEKEY` + widget react-hcaptcha.
