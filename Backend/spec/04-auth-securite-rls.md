# 04 — Auth, Sécurité, RLS

## Auth = Supabase Auth uniquement
Inscription (prénom, nom, email, password) → email vérification → profil auto.
Connexion email+password, reset password, session, déconnexion. Jamais de password en clair en DB.

## Rôles
`profiles.role` côté DB uniquement. Frontend ne décide jamais. Admin créé via Dashboard Auth → `role='admin'` manuel.

## RLS par table
- `NEWS/EVENTS` : visiteur+user = lecture `published` seuls. Admin = CRUD.
- `RESULTS` : visiteur = rien. User auth = lecture autorisée. Admin = CRUD.
- `NOTIFICATIONS` : user ne voit que `user_id = auth.uid()`.
- `PROFILES` : user ne modifie que son profil, jamais `role`.
- `DOCUMENTS` : public lisible par tous, private = auth requise.

## Autres
- CORS : `localhost` en dev, domaines officiels en prod (public + admin séparés).
- Rate-limit + validation sur routes sensibles et uploads.
- Logs sans secrets/tokens/passwords.
