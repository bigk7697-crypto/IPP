# Production Checklist — Backend IPP Site Scolaire V1 (Render)

> Cible déploiement : Render Web Service (`spec/11-deploiement.md`) — alternatives : Railway / Fly.io (`Dockerfile` fourni) / Koyeb. Cette checklist croise l'état réel du code (`src/config/env.ts`, `src/app.ts`, `src/middleware/*.ts`, `Dockerfile`) et les exigences `spec/04-auth-securite-rls.md` + `spec/11-deploiement.md`.

## 1. Supabase — Auth & URLs

- [ ] **Auth → Password policy : `password_min_length = 8`**
  - Dashboard → Authentication → Configuration → Password. Le backend valide côté Zod mais la garde réelle est Supabase Auth. Tester inscription avec 7 caractères → doit échouer.
- [ ] **Auth → URL Configuration : `site_url` = domaine prod public**
  - Ex `https://www.ecole.com` (pas `localhost`). `spec/11:22` : ajouter le domaine front dans Supabase.
- [ ] **Auth → `additional_redirect_urls` = domaines prod**
  - Lister exactement `https://www.ecole.com/*` + `https://admin.ecole.com/*` (et éventuellement `https://<service>.onrender.com` si besoin debug). Sans cela, reset-password / magic-link échouent en prod.
- [ ] **Créer un projet Supabase prod séparé si le projet actuel (`knmxosdfxxzjagqyhkcc` — `.env:2`, `supabase/.temp/linked-project.json`) reste le dev**
  - `spec/11:29`. Rejouer `supabase link --project-ref <PROD_REF> && supabase db push` (migrations 001–007) puis `supabase db reset --linked` jamais en prod.

## 2. Variables d'environnement (Render → Environment)

Définir en **secrets chiffrés** Render, jamais en clair dans Git (`.gitignore:3` ignore `.env`, `.env.example` sans valeurs).

| Variable | Valeur prod | Source code |
|---|---|---|
| `SUPABASE_URL` | `https://<prod-ref>.supabase.co` | `src/config/env.ts:9` + `assertServerEnv:19` — throw si manquante |
| `SUPABASE_SERVICE_ROLE_KEY` | clé `service_role` prod | `src/config/env.ts:11` + `src/config/supabase.ts:13-14` — jamais exposée frontend, jamais loggée |
| `SUPABASE_ANON_KEY` | clé `anon` prod | `src/config/supabase.ts:5-8` `getAnonClient()` |
| `ALLOWED_ORIGINS` | `https://www.ecole.com,https://admin.ecole.com` (CSV stricte, sans espaces superflus) | `src/config/env.ts:12-15` `.split(',').map(trim).filter(Boolean)` → `src/app.ts:32-35` `cors({origin: env.allowedOrigins, credentials:true})`. **Ne plus laisser `localhost`** (`spec/11:28`) |
| `PORT` | `4000` (Render injecte `PORT` auto — `src/config/env.ts:8` fait `Number(process.env.PORT ?? 4000)`) | `src/index.ts:7` `app.listen(env.port)` + `Dockerfile:16` `EXPOSE 4000` |
| `NODE_ENV` | `production` | `Dockerfile:12` pose déjà `ENV NODE_ENV=production` dans l'image finale ; Render le surcharge si défini — vérifier `NODE_ENV=production` dans Render |

Vérif : `GET /api/health` doit répondre sans CORS error depuis les deux domaines. Tester `curl -H "Origin: https://evil.com" → pas de header `Access-Control-Allow-Origin`.

## 3. Sécurité applicative — état réel vs. à compléter

### 3.1 CORS (`src/app.ts:31-36`)
- [ ] **Fait** : `cors({origin: env.allowedOrigins, credentials:true})` — whitelist fermée, pas de `*`.
- [ ] **À faire en prod** : remplacer `ALLOWED_ORIGINS` localhost par domaines prod (cf §2). Redéployer après changement d'env (Render redémarre auto).

### 3.2 Helmet / HSTS (`src/app.ts:29`)
- [ ] **Fait (partiel)** : `app.use(helmet())` active ~15 headers dont `Strict-Transport-Security` (HSTS) par défaut de `helmet@7.1.0` (`package.json:21`). Derrière HTTPS Render, HSTS est effectif.
- [ ] **Recommandé** : expliciter la config pour audit :
  ```ts
  helmet({ hsts: { maxAge: 31536000, includeSubDomains: true, preload: true } })
  ```
  et vérifier `curl -I https://<service>.onrender.com/api/health | grep -i strict`.

### 3.3 Rate limiting — MANQUE ACTUELLEMENT
- [ ] **État réel** : aucun `express-rate-limit` dans `src/app.ts` ni `package.json`. `spec/04:19` exige rate-limit sur routes sensibles.
- [ ] **À ajouter avant prod** (bloquant) :
  ```ts
  import rateLimit from 'express-rate-limit';
  app.use('/api/auth', rateLimit({ windowMs: 15*60*1000, max: 20 }));
  app.use('/api/admin', rateLimit({ windowMs: 60*1000, max: 60 }));
  ```
  + limite upload (`src/middleware/upload.ts` + `src/utils/files.ts`).

### 3.4 Validation & erreurs (`src/validators/*.ts`, `src/middleware/errorHandler.ts`)
- [ ] **Fait** : validation Zod systématique (`spec/07:9`), erreurs format unique `{success:false, error:{code,message}}` (`src/app.ts:62-67`, `errorHandler.ts:6-8`). `errorHandler` masque le détail (`'Erreur serveur. Réessayez plus tard.'`) et ne log que `err.message`.

### 3.5 Logs sécurisés (`spec/04:20`)
- [ ] **Fait** : `src/middleware/errorHandler.ts:5` `console.error('[backend:error]', err.message)` — pas de dump token/secret. `src/middleware/auth.ts` ne log jamais `Authorization` header.
- [ ] **À faire** : en prod, remplacer `morgan('dev')` (`src/app.ts:37`) par `morgan('combined')` (ou condition `process.env.NODE_ENV === 'production' ? 'combined' : 'dev'`) pour logs structurés sans données sensibles. Ne jamais logger `SUPABASE_SERVICE_ROLE_KEY` (`src/config/supabase.ts:14` garde-fou `throw`).

## 4. Build & Runtime (Render)

- [ ] **Root Directory** : `Backend` (si monorepo)
- [ ] **Build Command** : `npm ci && npm run build` (`spec/11:10`, `Dockerfile:4-7`)
- [ ] **Start Command** : `npm start` (`spec/11:11`, `Dockerfile:17` `node dist/index.js`, `package.json:10`)
- [ ] **Node version** : 20 (`Dockerfile:1` `node:20-alpine`, `package.json:31` `@types/node ^20.12.0`). Forcer `NODE_VERSION=20` dans Render si besoin.
- [ ] **Health Check Path** : `/api/health` (Render → Health Check). Handler `src/routes/health.ts:4` retourne `{success:true, data:{status:'ok', service:'site-scolaire-backend'}}`.
- [ ] **Vérif post-deploy** : `curl https://<service>.onrender.com/api/health` → `200` + `status:ok` (`spec/11:20`).

## 5. Secrets & Git

- [ ] `.env` jamais commité (`.gitignore:3`). Vérifier `git ls-files | grep .env` → vide.
- [ ] `.env.example` sans valeurs réelles (état actuel OK : `SUPABASE_URL=` vide).
- [ ] Rotation `SERVICE_ROLE_KEY` si déjà leakée dans logs/Git — régénérer dans Supabase Dashboard → Project API.
- [ ] Frontend (`VITE_*`) ne reçoit que `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` + `VITE_API_URL=https://<service>.onrender.com` (`spec/07:21`).

## 6. Base de données prod

- [ ] Rejouer `supabase link --project-ref <prod> && supabase db push` (001–007) — ne pas copier le seed prod (`supabase/seed/seed.sql:1` interdit en prod).
- [ ] Vérifier RLS active sur 10 tables (`002:24-34`) + Storage buckets (`003`).
- [ ] Tester `npm run test:live` contre la prod (après `ALLOWED_ORIGINS` prod) — `spec/11:31`. Attendu : visiteur voit 0 résultats, 0 notifs, seulement published.

## 7. Sauvegarde & supervision

- [ ] **Backups** : activer PITR / daily backups Supabase (Dashboard → Database → Backups). Avant chaque `db push` prod : `pg_dump` ou snapshot.
- [ ] **Monitoring** : Render Metrics (CPU/RAM), Render Logs, Supabase Dashboard → Reports. Alerte sur `GET /api/health` via UptimeRobot / BetterStack.
- [ ] **Cron** : vérifier `006` job `event-reminders-daily 0 7 * * *` actif (`select * from cron.job where jobname='event-reminders-daily'`).
- [ ] **Realtime fallback** : le front doit refetch si Realtime down (`005` note `005_realtime.sql:2`).

## 8. Checklist finale avant ouverture

```
[ ] npm run typecheck && npm test && npm run test:live (prod) verts
[ ] ALLOWED_ORIGINS = prod (pas localhost)
[ ] site_url + redirect_urls = prod
[ ] password_min_length = 8
[ ] helmet HSTS vérifié (curl -I)
[ ] rate limiting ajouté et testé (429 sur bruteforce /api/auth)
[ ] morgan = combined en prod, pas de secrets dans logs
[ ] SERVICE_ROLE_KEY uniquement en secret Render
[ ] /api/health répond en 200 via HTTPS
[ ] backup PITR actif
```
