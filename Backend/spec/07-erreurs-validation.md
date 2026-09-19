# 07 — Erreurs, Validation, Divers

## Format d'erreur unique
```json
{ "success": false, "error": { "code": "UNAUTHORIZED", "message": "Vous devez être connecté." } }
```
Codes : `400 BAD_REQUEST, 401 UNAUTHORIZED, 403 FORBIDDEN, 404 NOT_FOUND, 409 CONFLICT, 422 VALIDATION_ERROR, 500 INTERNAL_ERROR`.

## Validation systématique
Titre/contenu obligatoires, date valide, classe existante, type résultat valide, fichier valide, session + permission. Ne jamais faire confiance au frontend.

## Pagination / recherche
Paginer news/events/notifs/documents/users. Recherche simple `?q=` V1 sur news/events/documents. Lazy-load images côté front (à leur préciser).

## Env
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=  # secret, jamais commit, jamais front
```
Frontend : `VITE_API_URL=` et/ou `VITE_SUPABASE_URL=` + `VITE_SUPABASE_ANON_KEY=` uniquement.
