# 01 — Architecture

## Cible (cf. cahier backend §2-3)
```
SUPABASE (Postgres + Auth + Storage + Realtime + Edge Functions)
  → source de vérité centrale
  → consommée par : Frontend public + Espace user + Admin frontend
```

## Choix recommandé : hybride
- **Supabase direct** pour lectures publiques (news/events published, gallery, documents public).
- **API Node.js + TypeScript** pour le sensible : `admin/*`, `results` (upload + URL signée), `notifications`, validation, fan-out.

## Interdits
- Pas de double DB Supabase + Firebase pour les mêmes données.
- Pas de `SUPABASE_SERVICE_ROLE_KEY` côté frontend.
- Pas de copie locale des données côté frontend.

## Structure cible `Backend/`
```
backend/
├── src/ (config, routes, controllers, services, middleware, validators, utils, types)
├── supabase/ (migrations/, functions/, seed/)
├── spec/ (ce dossier — contrats et décisions)
├── tests/
├── .env / .env.example
├── package.json
└── README.md
```

## À trancher
- [ ] Framework API : Express / Fastify / Nest ?
- [ ] Projet Supabase dev/prod créé ? Qui a les clés ?
- [ ] Frontend : React/Vite/Next ? (pour CORS + vars `VITE_*`)
