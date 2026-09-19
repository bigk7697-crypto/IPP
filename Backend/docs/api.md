# API — Backend IPP Site Scolaire V1

> Base : `http://localhost:4000` — tous les préfixes `/api/*` définis dans `src/app.ts:40-60`.  
> Convention de réponse : succès `{ success:true, data }` (`src/utils/errors.ts:7-9`), erreur `{ success:false, error:{ code, message, details } }` (`src/utils/errors.ts:3-5`, `src/types/index.ts:4-15`, `src/middleware/errorHandler.ts:6-9`).  
> `404` générique : `{ success:false, error:{ code:'NOT_FOUND', message:'Ressource introuvable.' } }` (`src/app.ts:62-67`).

## Conventions transverses

### Authentification

- Header : `Authorization: Bearer <JWT Supabase>` — vérifié dans `src/middleware/auth.ts:16-57` via `anon.auth.getUser(token)` puis rôle lu depuis `profiles` (`src/middleware/auth.ts:39-50`).
- Sans header ou token invalide → `401 { code:'UNAUTHORIZED' }` (`src/middleware/auth.ts:20-23`, `31-35`).
- Admin : chaîne `auth` + `requireAdmin` (`src/middleware/requireAdmin.ts:3-11`) → `403 { code:'FORBIDDEN' }` si `role !== 'admin'` (`src/app.ts:53-60`).

### Pagination

Helper `src/utils/errors.ts:11-18` :

```ts
paginationParams(query) // page=max(1, Number(page)||1), limit=min(100,max(1,Number(limit)||20)), from=(page-1)*limit, to=...
paginationMeta(page,limit,total) // { page, limit, total, pages: ceil(total/limit) }
```

Réponse paginée : `{ success:true, data:[...], pagination:{ page, limit, total, pages } }`.

| Query | Type | Défaut | Contrainte | Notes |
|-------|------|--------|------------|-------|
| `page` | `number` | `1` | `>=1` | `src/validators/common.ts:3-7` |
| `limit` | `number` | `20` | `1..100` | clamp à 100 côté utils |
| `q` | `string` | `""` | `max 100` trim | `src/utils/search.ts:5-8`, `src/validators/common.ts:6` — échappement `%_\\` (`src/utils/search.ts:1-3`) |

### Recherche

`q` normalisé (`normalizeQuery`) + `escapeIlike` pour `ilike` PostgREST (`src/routes/news.ts:22-24`, `src/routes/events.ts:22-23`, `src/routes/documents.ts:28`, `src/routes/classes.ts:21-22`).

### Erreurs normalisées (`src/types/index.ts:5-14`)

| Code | Status | Déclencheur |
|------|--------|-------------|
| `BAD_REQUEST` | 400 | générique `fail()` |
| `UNAUTHORIZED` | 401 | auth manquante/invalide |
| `FORBIDDEN` | 403 | `requireAdmin` |
| `NOT_FOUND` | 404 | `.single()` vide, 404 app |
| `CONFLICT` | 409 | `23505` classe dupliquée, `23503` delete restrict (`src/routes/admin.classes.ts:42-47`, `87-92`) |
| `VALIDATION_ERROR` | 422 | Zod `safeParse` échec |
| `INTERNAL_ERROR` | 500 | upload Storage, `errorHandler` |

---

## 1. Routes publiques & utilisateur

### `GET /api/health`

- **Auth :** non
- **Source :** `src/routes/health.ts:4-6`, monté `src/app.ts:40`
- **Réponse success (200) :**
```json
{ "success": true, "data": { "status": "ok", "service": "site-scolaire-backend" } }
```
- **Curl :**
```bash
curl http://localhost:4000/api/health
```

### `GET /api/auth/me` — session + profil + rôle

- **Auth :** oui (`src/routes/auth.ts:9`, `src/middleware/auth.ts:16`)
- **Source :** `src/routes/auth.ts:9-32`
- **Détails :** lit `profiles` via `SERVICE_ROLE` (`src/routes/auth.ts:11-16`) puis `anon.auth.getUser(token)` pour `email_confirmed_at` (`src/routes/auth.ts:19-20`).
- **Réponse success (200) :**
```json
{ "success": true, "data": { "id":"uuid","first_name":"...","last_name":"...","email":"...","role":"user|admin","created_at":"...","email_verified":true } }
```
- **Erreurs :** `401 UNAUTHORIZED` si token absent/invalide.
- **Curl :**
```bash
curl -H "Authorization: Bearer $JWT" http://localhost:4000/api/auth/me
```

### `GET /api/news` — liste actualités publiées

- **Auth :** optionnelle (token transmis à `getAnonClient(token)` pour laisser RLS filtrer, mais query force `eq('status','published')` `src/routes/news.ts:19`)
- **Source :** `src/routes/news.ts:9-33`, monté `src/app.ts:44`
- **Query :** `page`, `limit`, `q` (cherche `title`/`content` `src/routes/news.ts:22-24`)
- **Select :** `id,title,slug,content,image_path,status,published_at,created_at`
- **Réponse :** `{ success:true, data:[], pagination:{page,limit,total,pages} }` (`src/routes/news.ts:29`)
- **Curl :**
```bash
curl "http://localhost:4000/api/news?page=1&limit=10&q=rentrée"
curl -H "Authorization: Bearer $JWT" "http://localhost:4000/api/news?q=école"
```

### `GET /api/news/:id`

- **Auth :** optionnelle
- **Source :** `src/routes/news.ts:36-57`
- **Réponse success :** `{ success:true, data:{ id,title,slug,content,image_path,status,published_at,created_at } }`
- **Erreurs :** `404 NOT_FOUND "Actualité introuvable."` (`src/routes/news.ts:47-50`)
- **Curl :**
```bash
curl http://localhost:4000/api/news/550e8400-e29b-41d4-a716-446655440000
```

### `GET /api/events`

- **Auth :** optionnelle
- **Source :** `src/routes/events.ts:9-31`, monté `src/app.ts:45`
- **Query :** `page, limit, q` (sur `title`/`description` `src/routes/events.ts:22-23`)
- **Select :** `id,title,description,image_path,location,start_at,end_at,status` tri `start_at ASC` (`src/routes/events.ts:18-19`)
- **Réponse paginée**
- **Curl :**
```bash
curl "http://localhost:4000/api/events?page=1&limit=20&q=culture"
```

### `GET /api/events/:id`

- **Source :** `src/routes/events.ts:34-52`
- **Erreurs :** `404 NOT_FOUND "Événement introuvable."` (`src/routes/events.ts:45`)
- **Curl :**
```bash
curl http://localhost:4000/api/events/550e8400-e29b-41d4-a716-446655440001
```

### `GET /api/classes`

- **Auth :** non (`getAnonClient()` sans token `src/routes/classes.ts:13`)
- **Source :** `src/routes/classes.ts:9-30`, monté `src/app.ts:47`
- **Filtre :** `eq('is_active', true)` (`src/routes/classes.ts:17`), tri `name`
- **Query :** `page, limit, q` (sur `name/level/series` `src/routes/classes.ts:21-22`)
- **Select :** `id,name,level,series,academic_year,is_active`
- **Curl :**
```bash
curl "http://localhost:4000/api/classes?q=Terminale&page=1&limit=20"
```

### `GET /api/classes/:id`

- **Source :** `src/routes/classes.ts:33-49`
- **Erreurs :** `404 NOT_FOUND "Classe introuvable."` (`src/routes/classes.ts:42`)
- **Curl :**
```bash
curl http://localhost:4000/api/classes/550e8400-e29b-41d4-a716-446655440002
```

### `GET /api/documents` — RLS public/privé selon token

- **Auth :** optionnelle — anonyme voit `public+published`, authentifié voit `+private+published` (`src/routes/documents.ts:9-10`, RLS `supabase/migrations/002_rls_policies.sql:72-79`)
- **Source :** `src/routes/documents.ts:11-43`, monté `src/app.ts:48`
- **Query :** `page, limit, q` (sur `title/description`), `category` (`src/routes/documents.ts:14`, `25`)
- **Comportement fichier :** `file_path` masqué si `visibility==='private'` → `undefined` + `has_file:true` (`src/routes/documents.ts:34-38`) — le front doit appeler `/:id`.
- **Réponse paginée**
- **Curl :**
```bash
curl "http://localhost:4000/api/documents?category=administratif&q=règlement"
curl -H "Authorization: Bearer $JWT" "http://localhost:4000/api/documents"
```

### `GET /api/documents/:id` — métadonnées + URL signée

- **Source :** `src/routes/documents.ts:46-78`
- **Auth :** si `visibility==='private'` sans token → `401 UNAUTHORIZED "Connectez-vous pour ce document."` (`src/routes/documents.ts:66-71`)
- **Réponse success (200) :**
```json
{ "success": true, "data": { "id":"...","title":"...","description":"...","category":"...","file_path":"private-documents/...","visibility":"private","published_at":"...","downloadUrl":"https://...signed...","expiresIn":3600 } }
```
URL générée via `signedUrl(file_path,3600)` (`src/routes/documents.ts:73`, `src/services/storage.ts:21-27` avec `SERVICE_ROLE` `createSignedUrl` 1h).
- **Erreurs :** `404 NOT_FOUND "Document introuvable."` (`src/routes/documents.ts:60-63`)
- **Curl :**
```bash
curl -H "Authorization: Bearer $JWT" http://localhost:4000/api/documents/550e8400-e29b-41d4-a716-446655440003
```

### `GET /api/gallery` — alias albums (compat spec)

- **Auth :** non
- **Source :** `src/routes/gallery.ts:8-22`, monté `src/app.ts:49`
- **Query :** `page, limit`
- **Select :** `gallery_albums: id,title,description,cover_image_path,created_at` tri `created_at DESC` (`src/routes/gallery.ts:14-15`)
- **Curl :**
```bash
curl "http://localhost:4000/api/gallery?page=1&limit=12"
```

### `GET /api/gallery/:id` — album + images triées (fallback)

- **Source :** `src/routes/gallery.ts:25-48` — garde `if (req.params.id==='albums') return next()` pour laisser `/albums` (`src/routes/gallery.ts:27`)
- **Réponse :** `{ success:true, data:{ ...album, images:[{id,image_path,caption,sort_order}] } }` (`src/routes/gallery.ts:44`)
- **Erreurs :** `404 NOT_FOUND "Album introuvable."` (`src/routes/gallery.ts:35`)

### `GET /api/gallery/albums`

- **Source :** `src/routes/gallery.ts:51-65`
- **Paginé** identique à `GET /api/gallery`
- **Curl :**
```bash
curl http://localhost:4000/api/gallery/albums?page=1&limit=20
```

### `GET /api/gallery/albums/:id`

- **Source :** `src/routes/gallery.ts:68-93`
- **Réponse :** album + images triées par `sort_order` (`src/routes/gallery.ts:86-87`)

### `GET /api/settings`

- **Auth :** non
- **Source :** `src/routes/settings.ts:7-16`, monté `src/app.ts:50`
- **DB :** `school_settings` singleton `id=1` (`src/routes/settings.ts:10`, `supabase/migrations/001_initial_schema.sql:164-177`)
- **Réponse :** `{ success:true, data:{ id:1, school_name, school_description, address, phone, email, logo_path, website, social_links, updated_at } }`
- **Curl :**
```bash
curl http://localhost:4000/api/settings
```

### `GET /api/results/:classId` — privé, URL signée 1h

- **Auth :** oui (`src/routes/results.ts:9`, `src/middleware/auth.ts:16`)
- **Source :** `src/routes/results.ts:9-39`, monté `src/app.ts:51`
- **Param :** `classId` UUID (`src/validators/common.ts:10`)
- **Comportement :** `SERVICE_ROLE` sélectionne `results` `eq(class_id, :classId) eq(status,'published')` (`src/routes/results.ts:12-17`), prend `latest = results[0]`, split `file_path` bucket/path (`src/routes/results.ts:28-29`), `createSignedUrl(path,3600)` (`src/routes/results.ts:31-32`)
- **Réponse success :**
```json
{ "success": true, "data": { "id":"...","class_id":"...","academic_year":"2025-2026","result_type":"...","file_path":"private-results/...","status":"published","published_at":"...","downloadUrl":"https://...signed...","expiresIn":3600 } }
```
- **Erreurs :** `404 NOT_FOUND "Aucun résultat disponible pour cette classe."` (`src/routes/results.ts:20-23`), `401` si non connecté
- **Curl :**
```bash
curl -H "Authorization: Bearer $JWT" http://localhost:4000/api/results/550e8400-e29b-41d4-a716-446655440002
```

### `GET /api/notifications` — ses propres notifications

- **Auth :** oui (router.use `auth` `src/routes/notifications.ts:7`)
- **Source :** `src/routes/notifications.ts:10-25`, monté `src/app.ts:52`
- **Query :** `page, limit`
- **DB :** `getServiceClient()` + `eq('user_id', req.user.id)` (`src/routes/notifications.ts:17`), tri `created_at DESC`
- **Réponse paginée**
- **Curl :**
```bash
curl -H "Authorization: Bearer $JWT" "http://localhost:4000/api/notifications?page=1&limit=20"
```

### `PATCH /api/notifications/read-all` — marquer tout lu

- **⚠️ Ordre Express :** défini AVANT `/:id/read` (`src/routes/notifications.ts:27`)
- **Auth :** oui
- **Source :** `src/routes/notifications.ts:28-41`
- **DB :** `update({is_read:true}) eq(user_id, req.user.id) eq(is_read,false)` (`src/routes/notifications.ts:32-35`)
- **Réponse :** `{ success:true, data:{ ok:true } }`
- **Curl :**
```bash
curl -X PATCH -H "Authorization: Bearer $JWT" http://localhost:4000/api/notifications/read-all
```

### `PATCH /api/notifications/:id/read`

- **Source :** `src/routes/notifications.ts:44-57`
- **DB :** `eq(id, :id) eq(user_id, req.user.id)` (`src/routes/notifications.ts:50-51`)
- **Réponse :** `{ success:true, data:{ id:":id", is_read:true } }`

### `GET /api/profile`

- **Auth :** oui (`src/routes/profile.ts:7`)
- **Source :** `src/routes/profile.ts:12-25`
- **Select :** `id,first_name,last_name,email,role,created_at,updated_at` via `SERVICE_ROLE` (`src/routes/profile.ts:16-18`)
- **Curl :**
```bash
curl -H "Authorization: Bearer $JWT" http://localhost:4000/api/profile
```

### `PATCH /api/profile`

- **Auth :** oui
- **Source :** `src/routes/profile.ts:28-50`
- **Validation :** `profilePatchSchema` (`src/validators/profile.ts:3-6`) — `first_name`/`last_name` `trim min2 max80` optionnels, mais body vide ou parse échec → `422 VALIDATION_ERROR "first_name ou last_name requis."` (`src/routes/profile.ts:31-35`)
- **Body :**
```json
{ "first_name": "Moussa", "last_name": "Diallo" }
```
- **Réponse :** profil mis à jour
- **Curl :**
```bash
curl -X PATCH -H "Authorization: Bearer $JWT" -H "Content-Type: application/json" -d '{"first_name":"Moussa"}' http://localhost:4000/api/profile
```

### `GET /api/notification-preferences`

- **Auth :** oui
- **Source :** `src/routes/preferences.ts:12-35`, monté `src/app.ts:43` (`/api/notification-preferences`)
- **Comportement :** si aucune ligne → fallback defaults `news/events/results/documents/calendar/system = true` (`src/routes/preferences.ts:22-30`)
- **Curl :**
```bash
curl -H "Authorization: Bearer $JWT" http://localhost:4000/api/notification-preferences
```

### `PATCH /api/notification-preferences`

- **Source :** `src/routes/preferences.ts:38-59`
- **Validation :** `preferencesPatchSchema` (`src/validators/preferences.ts:3-10`) — 6 booléens optionnels, au moins un requis sinon `422 "Au moins une préférence requise."` (`src/routes/preferences.ts:41-45`)
- **DB :** `upsert({user_id, ...parsedData}, {onConflict:'user_id'})` (`src/routes/preferences.ts:50-51`)
- **Body exemple :**
```json
{ "news_enabled": false, "results_enabled": true }
```
- **Curl :**
```bash
curl -X PATCH -H "Authorization: Bearer $JWT" -H "Content-Type: application/json" -d '{"news_enabled":false}' http://localhost:4000/api/notification-preferences
```

---

## 2. Routes admin — `auth` + `requireAdmin` (`src/app.ts:54-60`)

Toutes sous `/api/admin/*`. Sans JWT → `401`, avec JWT mais `role !== 'admin'` → `403` (`src/middleware/requireAdmin.ts:4-9`).

### `GET /api/admin/news`

- **Source :** `src/routes/admin.news.ts:41-55`
- **Query :** `page, limit`
- **Select :** `id,title,slug,status,published_at,created_at,updated_at` tri `created_at DESC` (`src/routes/admin.news.ts:46-48`) — inclut `draft` (contrairement au public)
- **Réponse paginée**

### `POST /api/admin/news`

- **Source :** `src/routes/admin.news.ts:12-38`
- **Validation :** `newsSchema` (`src/validators/news.ts:3-9`) : `title min3 max200`, `slug regex ^[a-z0-9]+(?:-[a-z0-9]+)*$`, `content min10 max20000`, `image_path max500 opt`, `status enum draft|published|archived default draft` — échec → `422 VALIDATION_ERROR` avec `details: parsed.error.flatten()` (`src/routes/admin.news.ts:15-22`)
- **Payload DB :** `...parsed.data, published_at = status==='published'?now():null, created_by=req.user.id` (`src/routes/admin.news.ts:27-31`)
- **Réponse :** `201 { success:true, data }`
- **Body :**
```json
{ "title":"Rentrée 2026","slug":"rentree-2026","content":"Contenu ...","status":"published" }
```
- **Curl :**
```bash
curl -X POST -H "Authorization: Bearer $ADMIN_JWT" -H "Content-Type: application/json" -d '{"title":"Rentrée 2026","slug":"rentree-2026","content":"Contenu détaillé ...","status":"published"}' http://localhost:4000/api/admin/news
```

### `PUT /api/admin/news/:id`

- **Source :** `src/routes/admin.news.ts:60-89`
- **Validation :** `newsPatchSchema` (partial) (`src/validators/news.ts:10`)
- **published_at :** positionné au premier passage `draft→published`, nul si repassé `draft` (`src/routes/admin.news.ts:73-77`)

### `DELETE /api/admin/news/:id`

- **Source :** `src/routes/admin.news.ts:92-101` — `delete().eq(id)` → `{ success:true, data:{id} }`

### `GET /api/admin/events`

- **Source :** `src/routes/admin.events.ts:13-27`
- **Select :** `*` tri `start_at DESC`, paginé

### `POST /api/admin/events`

- **Source :** `src/routes/admin.events.ts:29-56`
- **Validation :** `eventSchema` (`src/validators/events.ts:3-11`) : `title min3 max200`, `description max5000 opt`, `image_path max500`, `location max200`, `start_at datetime offset required`, `end_at datetime offset opt`, `status enum` — plus check métier `end_at >= start_at` sinon `422 "end_at doit être après start_at."` (`src/routes/admin.events.ts:39-45`)
- **Body :**
```json
{ "title":"Journée culturelle","start_at":"2026-10-15T09:00:00Z","end_at":"2026-10-15T17:00:00Z","location":"Cour principale","status":"published" }
```

### `PUT /api/admin/events/:id`

- **Source :** `src/routes/admin.events.ts:59-81` — `eventPatchSchema` partial

### `DELETE /api/admin/events/:id`

- **Source :** `src/routes/admin.events.ts:83-92`

### `GET /api/admin/classes`

- **Source :** `src/routes/admin.classes.ts:13-27` — `select *` tri `name`, paginé

### `POST /api/admin/classes`

- **Source :** `src/routes/admin.classes.ts:29-55`
- **Validation :** `classSchema` (`src/validators/classes.ts:3-9`) : `name min2 max100`, `level min2 max100`, `series max10 opt`, `academic_year regex ^\d{4}-\d{4}$` (`"2025-2026"`), `is_active boolean default true`
- **Conflit :** `23505 unique(name,academic_year)` → `409 CONFLICT "Cette classe existe déjà pour cette année."` (`src/routes/admin.classes.ts:42-46`, contrainte `supabase/migrations/001_initial_schema.sql:36`)

### `PUT /api/admin/classes/:id`

- **Source :** `src/routes/admin.classes.ts:57-78` — `classPatchSchema` partial

### `DELETE /api/admin/classes/:id`

- **Source :** `src/routes/admin.classes.ts:81-100` — `23503 FK restrict` si résultats liés → `409 "Classe utilisée par des résultats, désactivez-la plutôt."` (`src/routes/admin.classes.ts:87-92`, FK `supabase/migrations/001_initial_schema.sql:98`)

### `GET /api/admin/documents`

- **Source :** `src/routes/admin.documents.ts:15-29` — liste admin tous statuts/visibilités, paginé

### `POST /api/admin/documents` — `multipart/form-data`

- **Source :** `src/routes/admin.documents.ts:34-94`, `src/middleware/upload.ts:12`, `src/utils/files.ts:5-22`
- **Middleware :** `uploadDocument.single('file')` (`src/middleware/upload.ts:12`) — `memoryStorage`, `fileSize 15 Mo` (`LIMITS.documentMaxBytes` `src/utils/files.ts:5`), `files:1`
- **Champs méta :** `documentMetaSchema` (`src/validators/documents.ts:3-9`) : `title min3 max200`, `description max1000`, `category max100`, `visibility public|private default public`, `status enum`
- **MIME autorisés :** `MIME.document` (`src/utils/files.ts:15-22`) = `pdf, msword, docx, xlsx, xls, text/plain` — sinon `422 "Type de fichier non autorisé."` (`src/routes/admin.documents.ts:52-57`)
- **Fichier requis** sinon `422 "Fichier requis (champ \"file\")."` (`src/routes/admin.documents.ts:45-49`)
- **Bucket :** si `public` → `public-assets/documents/<ts>-<sanitized>` ; si `private` → `buildDocumentPath(category, orig)` = `private-documents/<slug(cat)>/<uuid>.<ext>` (`src/routes/admin.documents.ts:59-62`, `src/utils/files.ts:47-50`)
- **Upload :** `uploadBuffer(fullPath, buffer, mime)` (`src/services/storage.ts:4-13`) via `SERVICE_ROLE` ; échec → `500 "Échec upload Storage."` (`src/routes/admin.documents.ts:67-72`)
- **DB :** `file_path=fullPath, published_at, created_by` (`src/routes/admin.documents.ts:78-82`) ; si erreur DB → `removeFile(fullPath)` rollback (`src/routes/admin.documents.ts:87`)
- **Curl :**
```bash
curl -X POST -H "Authorization: Bearer $ADMIN_JWT" -F "file=@bulletin.pdf;type=application/pdf" -F "title=Règlement intérieur" -F "category=administratif" -F "visibility=private" -F "status=published" http://localhost:4000/api/admin/documents
```

### `PUT /api/admin/documents/:id` — méta uniquement

- **Source :** `src/routes/admin.documents.ts:97-125` — `documentPatchSchema` partial ; remplacement fichier = `DELETE + POST` (commentaire `src/routes/admin.documents.ts:96`)

### `DELETE /api/admin/documents/:id`

- **Source :** `src/routes/admin.documents.ts:128-139` — lit `file_path` puis `delete` puis `removeFile` cohérence DB+Storage (`src/services/storage.ts:15-19`)

### `POST /api/admin/gallery/albums`

- **Source :** `src/routes/admin.gallery.ts:14-35`
- **Validation :** `albumSchema` (`src/validators/gallery.ts:3-7`) : `title min2 max150`, `description max1000 opt`, `cover_image_path max500 opt`
- **Curl :**
```bash
curl -X POST -H "Authorization: Bearer $ADMIN_JWT" -H "Content-Type: application/json" -d '{"title":"Fête du drapeau 2026"}' http://localhost:4000/api/admin/gallery/albums
```

### `PUT /api/admin/gallery/albums/:id`

- **Source :** `src/routes/admin.gallery.ts:37-59` — `albumPatchSchema` partial

### `DELETE /api/admin/gallery/albums/:id`

- **Source :** `src/routes/admin.gallery.ts:61-82` — supprime d'abord tous les `image_path` Storage (`removeFile` boucle `src/routes/admin.gallery.ts:65-74`) avant `delete` album (cascade `gallery_images.album_id` `supabase/migrations/001_initial_schema.sql:129`)

### `POST /api/admin/gallery/albums/:id/images` — multipart image

- **Source :** `src/routes/admin.gallery.ts:85-133`
- **Middleware :** `uploadImage.single('image')` (`src/middleware/upload.ts:13`) — `5 Mo` (`LIMITS.imageMaxBytes` `src/utils/files.ts:6`)
- **MIME :** `MIME.image` = `jpeg/png/webp` (`src/utils/files.ts:23`) sinon `422 "Image JPEG/PNG/WebP uniquement."` (`src/routes/admin.gallery.ts:95-99`)
- **Méta :** `imageMetaSchema` (`src/validators/gallery.ts:9-12`) : `caption max300`, `sort_order int 0..10000 default 0` (coerce number)
- **Path :** `buildPublicImagePath('gallery', orig)` = `public-assets/gallery/<uuid>.<ext>` (`src/routes/admin.gallery.ts:110`, `src/utils/files.ts:52-54`)
- **DB :** `gallery_images { album_id, image_path=fullPath, caption, sort_order, created_by }` (`src/routes/admin.gallery.ts:114-122`) ; rollback `removeFile` si erreur (`src/routes/admin.gallery.ts:126`)
- **Curl :**
```bash
curl -X POST -H "Authorization: Bearer $ADMIN_JWT" -F "image=@photo.jpg;type=image/jpeg" -F "caption=Remise des prix" -F "sort_order=1" http://localhost:4000/api/admin/gallery/albums/550e8400-e29b-41d4-a716-446655440004/images
```

### `DELETE /api/admin/gallery/images/:imageId`

- **Source :** `src/routes/admin.gallery.ts:136-151` — `removeFile` + `delete`

### `GET /api/admin/results`

- **Source :** `src/routes/admin.results.ts:17-31` — `select id,class_id,academic_year,result_type,file_path,status,published_at,created_at,classes(name)` paginé tri `created_at DESC`

### `POST /api/admin/results` — multipart

- **Source :** `src/routes/admin.results.ts:35-100`, `src/middleware/upload.ts:11`
- **Limite :** `15 Mo` (`LIMITS.resultMaxBytes` `src/utils/files.ts:4`), MIME `MIME.result` = `pdf, xlsx, xls` (`src/utils/files.ts:10-14`) sinon `422 "Fichier PDF ou Excel uniquement."` (`src/routes/admin.results.ts:53-57`)
- **Méta :** `resultMetaSchema` (`src/validators/results.ts:3-8`) : `class_id uuid`, `academic_year regex ^\d{4}-\d{4}$`, `result_type min2 max100`, `status enum`
- **Vérif classe :** `select classes(name) eq id` sinon `422 "Classe inexistante."` (`src/routes/admin.results.ts:61-69`)
- **Path :** `buildResultPath(academic_year, className, orig)` = `private-results/<slug année>/<slug classe>/<uuid>.<ext>` (`src/routes/admin.results.ts:71`, `src/utils/files.ts:43-45`)
- **Cohérence :** commentaire `src/routes/admin.results.ts:34` — si upload échoue → pas de ligne DB → pas de notif
- **Curl :**
```bash
curl -X POST -H "Authorization: Bearer $ADMIN_JWT" -F "file=@resultats.pdf;type=application/pdf" -F "class_id=550e8400-e29b-41d4-a716-446655440002" -F "academic_year=2025-2026" -F "result_type=Trimestre 1" -F "status=published" http://localhost:4000/api/admin/results
```

### `PUT /api/admin/results/:id`

- **Source :** `src/routes/admin.results.ts:103-131` — `resultPatchSchema` partial, `published_at` géré comme pour news/documents

### `DELETE /api/admin/results/:id`

- **Source :** `src/routes/admin.results.ts:134-145` — DB + Storage

### `PATCH /api/admin/settings` — singleton `id=1`

- **Source :** `src/routes/admin.settings.ts:13-35`
- **Validation :** `settingsSchema` (`src/validators/settings.ts:3-12`) : tous optionnels `school_name min2 max150`, `school_description max2000`, `address max300`, `phone max50`, `email email()`, `logo_path max500`, `website url()`, `social_links record<max300>` — body vide → `422 "Au moins un champ requis."` (`src/routes/admin.settings.ts:15-19`)
- **DB :** `update(parsedData) eq id 1` (`src/routes/admin.settings.ts:25-27`)
- **Curl :**
```bash
curl -X PATCH -H "Authorization: Bearer $ADMIN_JWT" -H "Content-Type: application/json" -d '{"school_name":"IPP","phone":"+225 ..."}' http://localhost:4000/api/admin/settings
```

---

## Annexes

### Format succès / erreur

- Succès : `ok()` → `{ success:true, data }` (`src/utils/errors.ts:7-9`) ; paginé ajoute `pagination`.
- Erreur : `fail()` → `{ success:false, error:{ code, message, details } }` (`src/utils/errors.ts:3-5`).

### Mapping status HTTP

`200` read / update, `201` create, `401`/`403` auth, `404` not found, `409` conflict, `422` validation, `500` internal.

### Notes d'implémentation

- Public `news/events` forcent `status='published'` côté route (`src/routes/news.ts:19`, `44`, `src/routes/events.ts:18`, `41`) + RLS `news_read_pub`/`events_read_pub` (`supabase/migrations/002_rls_policies.sql:51-59`).
- `documents` liste masque `file_path` privé (`src/routes/documents.ts:34-38`).
- `results` privé : jamais d'URL publique permanente (`src/routes/results.ts:8`, `supabase/migrations/003_storage.sql:54-55`).
- `gallery` : deux alias `/` et `/albums` maintenus pour compat spec (`src/routes/gallery.ts:7`, `51`).
- Logs : `morgan('dev')` (`src/app.ts:37`), erreurs loggées sans secrets (`src/middleware/errorHandler.ts:5-6`).
