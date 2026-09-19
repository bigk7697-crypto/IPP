# 09 — Roadmap / Phases

## Ordre (cf. cahier §82)
1. Init : projet, TS, Supabase, `.env`, `.env.example`
2. DB : 11 tables + migrations + seed
3. Auth : inscription/login/vérif/session/reset
4. Sécu : RLS, rôles, Storage privé, protection admin
5. Contenu : news/events/docs/gallery/classes
6. Résultats : upload privé + publication + consultation
7. Notifs : auto + lecture + préférences
8. Realtime
9. Rappels events
10. API / intégration front + admin
11. Tests
12. Déploiement

## Priorités absolues
`DB > Auth > RLS/Sécu > Storage > Results > API > Publication > Notifs > Realtime > Rappels`

## Validation V1 = cahier §84
Supabase OK, 11 tables, migrations, auth+profil+admin, RLS, Storage public/privé, CRUD contenus, results protégés, notifs auto+privées, préférences, realtime, front+admin connectés, aucun secret exposé, tests permissions verts.
