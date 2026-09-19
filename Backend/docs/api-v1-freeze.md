# API V1 — GELÉE (2026-09-19)

> **Version : 1.0.0 — Verrouillée pour intégration frontend.**
> Aucun changement breaking ne sera fait sans version majeure.

## Règle d'or
- Pas de renommage de champ
- Pas de déplacement de route
- Pas de changement de format `{success,data,pagination}` / `{success:false,error:{code,message}}`
- Ajouts seulement via query optionnels ou nouvelles routes `/v2` futures

## Base URL
- Dev : `http://localhost:4000`
- Prod (Render) : `https://ipp-backend.onrender.com` (cf. `render.yaml`)
- Header auth : `Authorization: Bearer <supabase_jwt>`

## Endpoints gelés (39)

### Public
```
GET  /api/health
GET  /api/news?page&limit&q
GET  /api/news/:id
GET  /api/events?page&limit&q
GET  /api/events/:id
GET  /api/classes?page&limit&q
GET  /api/classes/:id
GET  /api/documents?page&limit&q&category
GET  /api/documents/:id
GET  /api/gallery?page&limit
GET  /api/gallery/:id
GET  /api/gallery/albums?page&limit
GET  /api/gallery/albums/:id
GET  /api/settings
GET  /api/auth/me
GET  /api/profile
PATCH /api/profile
GET  /api/notification-preferences
PATCH /api/notification-preferences
GET  /api/results/:classId
GET  /api/notifications?page&limit
PATCH /api/notifications/read-all
PATCH /api/notifications/:id/read
```

### Admin (auth + role=admin)
```
GET  /api/admin/news?page&limit
POST /api/admin/news
PUT  /api/admin/news/:id
DELETE /api/admin/news/:id
GET  /api/admin/events?page&limit
POST /api/admin/events
PUT  /api/admin/events/:id
DELETE /api/admin/events/:id
GET  /api/admin/classes?page&limit
POST /api/admin/classes
PUT  /api/admin/classes/:id
DELETE /api/admin/classes/:id
GET  /api/admin/results?page&limit
POST /api/admin/results (multipart)
PUT  /api/admin/results/:id
DELETE /api/admin/results/:id
GET  /api/admin/documents?page&limit
POST /api/admin/documents (multipart)
PUT  /api/admin/documents/:id
DELETE /api/admin/documents/:id
POST /api/admin/gallery/albums
PUT  /api/admin/gallery/albums/:id
DELETE /api/admin/gallery/albums/:id
POST /api/admin/gallery/albums/:id/images (multipart)
DELETE /api/admin/gallery/images/:imageId
PATCH /api/admin/settings
```

## Schémas
Définis dans `src/validators/*.ts` — gelés. Exemple `news` : `{title,slug,content,image_path,status}`.

## Compatibilité
Tout changement futur = nouvelle route ou champ optionnel, jamais suppression.
