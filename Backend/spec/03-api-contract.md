# 03 — API Contract (à geler avec l'équipe frontend)

## Public / User (implémenté Phase 3-4)
```
GET /api/health
GET /api/auth/me                        (auth → profil + role + email_verified)
GET /api/profile                        (auth)
PATCH /api/profile                      (first_name, last_name uniquement)
GET /api/news?q&page&limit
GET /api/news/:id
GET /api/events
GET /api/classes
GET /api/documents?q&category           (RLS: public + privés si auth)
GET /api/documents/:id                  (→ downloadUrl signée 1h si privé)
GET /api/gallery/albums
GET /api/gallery/albums/:id             (album + images)
GET /api/settings                       (infos école)
GET /api/results/:classId               (auth → métadonnées + downloadUrl 1h)
GET /api/notifications?page&limit       (auth, siennes)
PATCH /api/notifications/read-all       (auth — avant /:id/read)
PATCH /api/notifications/:id/read       (auth)
GET /api/notification-preferences       (auth)
PATCH /api/notification-preferences     (auth)
```

## Admin (auth + role=admin, implémenté Phase 3-4)
```
GET/POST /api/admin/news  PUT/DELETE /api/admin/news/:id
GET/POST /api/admin/events  PUT/DELETE /api/admin/events/:id
GET/POST /api/admin/classes PUT/DELETE /api/admin/classes/:id
GET /api/admin/results
POST /api/admin/results        (multipart file + class_id + academic_year + result_type + status)
PUT/DELETE /api/admin/results/:id
POST /api/admin/documents      (multipart file + title + visibility + status...)
PUT/DELETE /api/admin/documents/:id
POST /api/admin/gallery/albums  PUT/DELETE /api/admin/gallery/albums/:id
POST /api/admin/gallery/albums/:id/images  (multipart image + caption)
DELETE /api/admin/gallery/images/:imageId
PATCH /api/admin/settings
```

## Formats
- JSON prévisible, dates ISO8601 UTC.
- Pagination : `?page&limit`, recherche `?q=` sur news/events/documents.
- Voir `07-erreurs-validation.md` pour format d'erreur et statuts.

⚠️ Ce fichier fait foi. Tout changement = versionner + prévenir frontend.
