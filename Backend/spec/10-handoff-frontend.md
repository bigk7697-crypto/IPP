# HANDOFF FRONTEND — comment consommer le backend

Destinataires : équipe frontend (site public + espace user) et équipe admin.
Contrat détaillé des routes : `spec/03-api-contract.md`.

## 1. Variables d'environnement

```env
# Frontend public + user
VITE_SUPABASE_URL=https://knmxosdfxxzjagqyhkcc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtubXhvc2RmeHh6amFncXloa2NjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3NjIzODIsImV4cCI6MjEwNTMzODM4Mn0.ntWtzeHibJRUpqWZIWREz6yk555xKrGPH28fu3acIKg
VITE_API_URL=http://localhost:4000   # URL de l'API Node (dev)

# ⚠️ Ne JAMAIS utiliser la SERVICE_ROLE_KEY côté frontend.
```

## 2. Auth (Supabase Auth direct, pas via l'API)

```ts
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

// Inscription (déclenche email de vérification + création profil + prefs)
await supabase.auth.signUp({
  email, password,
  options: { data: { first_name, last_name } },
});
// Connexion / déconnexion / reset
await supabase.auth.signInWithPassword({ email, password });
await supabase.auth.signOut();
await supabase.auth.resetPasswordForEmail(email);
```

## 3. Appels API : toujours le token en Bearer

```ts
const { data: { session } } = await supabase.auth.getSession();
const headers = { Authorization: `Bearer ${session?.access_token}` };

// Public (token optionnel) :
fetch(`${API}/api/news?page=1&limit=10`);
fetch(`${API}/api/events`);
fetch(`${API}/api/classes`);
fetch(`${API}/api/gallery/albums`);

// Auth requis : profil, résultats (→ downloadUrl signée 1h), notifs
fetch(`${API}/api/auth/me`, { headers });           // profil + role + email_verified
fetch(`${API}/api/results/${classId}`, { headers }); // { ..., downloadUrl }
fetch(`${API}/api/notifications`, { headers });
fetch(`${API}/api/notifications/read-all`, { method: 'PATCH', headers });
```

Rôle admin : lire `GET /api/auth/me` → `data.role`. Si `admin`, afficher l'app admin
(qui tape les mêmes routes sous `/api/admin/*` avec le même Bearer).

## 4. Realtime (optionnel, avec fallback fetch)

```ts
// Nouvelles actualités sans reload :
supabase.channel('news')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'news' }, () => refetchNews())
  .subscribe();
// Notifs de l'utilisateur connecté (RLS = uniquement les siennes) :
supabase.channel('my-notifs')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (p) => toast(p.new))
  .subscribe();
// Si le channel ne se connecte pas → refetch classique toutes les X secondes.
```

## 5. Erreurs — format unique

```json
{ "success": false, "error": { "code": "UNAUTHORIZED", "message": "Vous devez être connecté." } }
```
Codes : `BAD_REQUEST 400, UNAUTHORIZED 401, FORBIDDEN 403, NOT_FOUND 404, CONFLICT 409, VALIDATION_ERROR 422, INTERNAL_ERROR 500`.
Listes paginées : `{ success, data, pagination: { page, limit, total } }`.

## 6. Uploads (admin uniquement, via l'API en multipart)

```
POST /api/admin/results   champs : file(PDF/XLSX) + class_id + academic_year(2025-2026) + result_type + status
POST /api/admin/documents champs : file + title + visibility(public|private) + status
POST /api/admin/gallery/albums/:id/images  champ : image(JPG/PNG/WebP) + caption?
```
Jamais d'upload direct vers Storage depuis le frontend (les buckets privés l'interdisent).
