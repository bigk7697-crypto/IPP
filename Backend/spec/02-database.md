# 02 — Database (11 tables V1)

## Tables
`profiles, news, events, classes, results, documents, gallery_albums, gallery_images, notifications, notification_preferences, school_settings`

## Points clés
- `profiles.id` = `auth.users.id`, `role = user|admin`, 1 seul admin créé manuellement.
- Statuts contenus : `draft / published / archived`. Seul `published` visible publiquement.
- `results` : DB stocke `file_path` uniquement, fichier en Storage privé.
- `documents.visibility` : `public|private`.
- `notifications` : `user_id, type(news|event|result|document|calendar|system), title, message, target_type, target_id, is_read`.
- `notification_preferences` : 1 ligne par user, 6 flags `*_enabled`.
- Audit minimal : `created_by, created_at, updated_at` partout où pertinent.

## Migrations (à créer en Phase 2)
```
supabase/migrations/
├── 001_initial_schema.sql
├── 002_rls_policies.sql
├── 003_storage.sql
├── 004_notifications.sql
└── 005_realtime.sql
```
Jamais de modif manuelle Dashboard sans migration versionnée.

## Seed dev uniquement
Classes (Seconde A, Première D, Terminale D...), 2 news test.
