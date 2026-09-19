# Backend — Site Scolaire V1

Backend central : **Node.js + TypeScript (Express) + Supabase (Postgres/Auth/Storage/Realtime)**.
Frontend fait par une autre équipe — ce backend expose le contrat défini dans `spec/03-api-contract.md`.

## 1. Prérequis
- Node 20+, npm
- Projet Supabase (dev + prod séparés si possible)

## 2. Installation
```bash
cd Backend
npm install
cp .env.example .env   # puis remplir SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY
```

## 3. Base de données — appliquer dans l'ordre (Supabase SQL Editor)
```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_rls_policies.sql
supabase/migrations/003_storage.sql
supabase/migrations/004_notifications.sql
supabase/migrations/005_realtime.sql
supabase/seed/seed.sql   # DEV uniquement
```

## 4. Compte admin (manuel, pas de page d'inscription)
1. Supabase Dashboard → Authentication → Users → Create user
2. SQL :
```sql
update profiles set role='admin' where email='admin@ecole.com';
```

## 5. Lancement
```bash
npm run dev    # http://localhost:4000/api/health
npm run build && npm start
```

## 6. Endpoints (extrait — voir spec/03)
```
GET  /api/health
GET  /api/news /api/news/:id
GET  /api/events
GET  /api/results/:classId        (auth → signed URL 1h)
GET  /api/notifications           (auth, siennes uniquement)
PATCH /api/notifications/read-all (auth — avant /:id/read)
PATCH /api/notifications/:id/read (auth)
POST /api/admin/news              (auth + admin)
```

## 7. Sécu
- `SERVICE_ROLE_KEY` : serveur uniquement, jamais commitée, jamais loggée.
- RLS sur tout le sensible, `role` non modifiable par le user (trigger).
- Résultats en bucket privé + URL signée, jamais d'URL publique.

## 8. Déploiement Render
Voir `docs/setup.md` et `docs/production-checklist.md`.
```bash
# Render : Build = npm ci && npm run build ; Start = npm start
# Vars : SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, ALLOWED_ORIGINS, PORT, NODE_ENV=production
docker build -t ipp-backend . && docker run -p 4000:4000 --env-file .env ipp-backend
docker-compose up --build
```

## 9. Docs
Voir `docs/` : architecture, database, api, security, setup, production-checklist.
Voir `spec/` : contrats V1. Cahiers d'origine : `../Cahier_De_Charge.md`, `cahier-des-charges-backend.md`.
