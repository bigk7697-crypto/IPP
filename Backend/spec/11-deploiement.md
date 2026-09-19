# 11 — Déploiement API (gratuit / V1)

Supabase héberge déjà : Postgres, Auth, Storage, Realtime, Edge Function, cron.
Reste à héberger l'API Node (`src/`) pour que le frontend ait une `API_URL` publique.

## Option recommandée : Render (free tier)

1. Pousser `Backend/` sur GitHub (sans `.env` !).
2. Render → New → Web Service → repo, Root Directory `Backend`.
   - Build : `npm ci && npm run build`
   - Start : `npm start`
3. Variables d'environnement (Render → Environment) :
   ```
   SUPABASE_URL=https://knmxosdfxxzjagqyhkcc.supabase.co
   SUPABASE_ANON_KEY=<anon>
   SUPABASE_SERVICE_ROLE_KEY=<service_role>
   ALLOWED_ORIGINS=https://www.ecole.com,https://admin.ecole.com
   PORT=4000
   ```
4. Vérifier `GET https://<service>.onrender.com/api/health` → `{status:ok}`.
5. Donner l'URL au frontend (`VITE_API_URL`) + ajouter le domaine front dans
   Supabase → Authentication → URL Configuration → Redirect URLs.

## Alternatives gratuites équivalentes
- Railway, Fly.io (`fly launch` avec le `Dockerfile` fourni), Koyeb.

## Après déploiement
- [ ] `ALLOWED_ORIGINS` = domaines réels (plus de localhost)
- [ ] Créer le projet Supabase **prod** séparé si le projet actuel reste le dev
- [ ] Rejouer `supabase link --project-ref <prod> && supabase db push`
- [ ] Re-tester `npm run test:live` contre la prod
