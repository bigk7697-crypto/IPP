# 🔴 RED TEAM — Rapport d'audit sécurité

**Cible :** `https://bigk7697-crypto.github.io/IPP`
**Espace admin :** `https://bigk7697-crypto.github.io/IPP/direction/` (⚠️ pas `/IPP/admin` → 404)
**API :** `https://ipp-2mdf.onrender.com/api`
**Supabase :** `https://knmxosdfxxzjagqyhkcc.supabase.co`
**Date :** 2026-09-20 — **Auditeur :** membre Red Team (test autorisé, grey-box : code source local + tests black-box live)
**Verdict global :** 🟡 **Moyen — admin non compromis sans identifiants, mais plusieurs expositions et mauvaises pratiques à corriger vite (dont 2 HIGH).**

---

## 1. Périmètre & méthode

| Axe | Testé | Comment |
|---|---|---|
| Accès espace admin sans identifiants | ✅ | Navigation directe `/dashboard`, `/news`, etc. + appels API sans token |
| Contournement auth / élévation `user → admin` | ✅ | Token faux, token user sur routes `/api/admin/*`, claim MFA forgé |
| API oubliées / exposées dans le frontend | ✅ | Grep `Frontend/client` + `Frontend/admin` + décompilation partielle des bundles JS déployés |
| Secrets / clés dans le repo et les bundles | ✅ | `git ls-files`, `.env*`, `deploy.yml`, `hex.txt`, JS prod |
| Injection (SQLi, XSS stocké, upload malveillant) | ✅ (passif, sans payload destructeur) | `page`/`q`/`category`, `Content-Type` MIME, lecture validateurs Zod |
| CORS / headers / rate-limit / Supabase direct | ✅ | `curl.exe` avec `Origin` forgée, REST Supabase avec `anon key`, headers Helmets |

Aucune attaque destructive, aucun brute-force de mot de passe, aucune donnée exfiltrée au-delà de lectures publiques.

---

## 2. Résultat principal : l'espace admin a-t-il été piraté ?

**NON — pas d'accès admin obtenu sans identifiants.** Mais l'admin est **trouvé en ~30 secondes** (security by obscurity inefficace) :

1. `/IPP/admin` → **404**. Le vrai portail est **`/IPP/direction/`** → 200 `IPP Admin` (cf. `App.tsx:16`, `deploy.yml:52-53`).
   N'importe qui lit le workflow GitHub public ou le bundle client pour le découvrir.
2. Page login pré-remplit **`admin@ipp.tg`** (`AdminLogin.tsx:15`) → donne la moitié des identifiants + permet l'énumération.
3. Accès direct à `/IPP/direction/dashboard` sans token → **redirigé vers `/login`** (`AdminLayout.tsx:67-69`) + vérification serveur `GET /api/auth/me` avec contrôle `role === 'admin'`. ✅ Bon réflexe (pas de garde 100 % client-side).
4. Attaques API rejetées proprement (preuves live) :
   - `GET /api/admin/news` sans token → `401 UNAUTHORIZED`
   - `GET /api/admin/news` avec `Bearer faketoken123` → `401 Session invalide`
   - `GET /api/auth/me` sans token → `401`
   - Donc : **auth JWT Supabase vérifiée côté serveur + `requireAdmin` + `requireMfa` (aal2) sur toutes les routes `/api/admin/*`.** ✅
5. MFA TOTP enforced serveur (`requireMfa.ts`) : décodage du claim `aal`/`amr` — un simple compte `user` volé **ne suffit pas**, il faut aussi passer le TOTP. ✅
6. Reste le maillon faible : **si le mot de passe admin fuit ou est deviné, le MFA est la seule barrière** (pas de allow-list IP, pas de verrouillage de compte — voir §4).

> Conclusion : la porte est verrouillée, mais l'adresse de la porte, le nom de l'utilisateur et le plan du bâtiment sont affichés en public.

---

## 3. 🚨 API oubliées / exposées dans le frontend (trouvaille majeure)

### 3.1 Le client PUBLIC contient des appels ADMIN (code mort dangereux)

Ces fonctions existent dans le bundle `https://bigk7697-crypto.github.io/IPP/assets/*.js` téléchargé par **chaque visiteur** :

| Fichier source | Fonction | Endpoint appelé avec `school_token` (non-admin) |
|---|---|---|
| `Frontend/client/src/services/document.service.ts:11,20` | `createDocument`, `deleteDocument` | `POST /admin/documents`, `DELETE /admin/documents/:id` |
| `Frontend/client/src/services/classes.service.ts:11,20,29` | `createClass`, `updateClass`, `deleteClass` | `POST/PUT/DELETE /admin/classes…` |
| `Frontend/client/src/services/result.service.ts:22,27,35` | `getAllResultsAdmin`, `uploadResult`, `deleteResult` | `GET/POST/DELETE /admin/results…` |

Le serveur les **rejette aujourd'hui (403)**, mais :
- ça **documente toute la surface d'attaque admin** à l'attaquant (méthodes, IDs, formats) ;
- si une régression `requireAdmin` survient un jour, le client devient une arme pré-montée ;
- risque de confusion/abus : un dev peut brancher ces fonctions à un bouton public par erreur.
- **Action : supprimer ce code mort du client** (le client ne doit connaître que `/documents`, `/classes`, `/results/:classId` publics).

### 3.2 L'admin uploade DIRECTEMENT vers Supabase en contournant le backend

`Frontend/admin` (vérifié dans le bundle live `index-B4IkDSkL.js`) :
- `AdminNews` / galerie : `supabase.storage.from("public-assets").upload(...)` côté navigateur, puis `POST /admin/news` avec le simple `image_path`.
- Donc la validation **MIME/taille du backend (`utils/files.ts`, `admin.results.ts:55`) est contournable** pour les images : seul le bucket policy Supabase protège. À auditer impérativement (policies `storage.objects` du bucket `public-assets`).
- Les clés `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` et l'URL `VITE_API_URL` sont **en clair dans les deux bundles JS** (normal pour une clé `anon`, mais ça rend l'endpoint Supabase directement attaquable).

### 3.3 Cartographie des endpoints (extraite du code + bundles)

```
Public (sans MFA) :  /api/health  /api/auth/me  /api/news  /api/events
  /api/classes  /api/documents  /api/documents/:id  /api/gallery/...
  /api/settings  /api/results/:classId (auth requise)  /api/notifications
  /api/profile  /api/notification-preferences
Admin (auth + role=admin + MFA aal2) :  /api/admin/news  /api/admin/events
  /api/admin/classes  /api/admin/documents  /api/admin/gallery/albums...
  /api/admin/results  /api/admin/settings (PATCH)
```

---

## 4. Failles & faiblesses (par sévérité)

### 🔴 HIGH-1 — Sessions stockées en `localStorage` (vol via XSS)
- `admin_token`, `admin_user`, `school_token` en `localStorage` (`admin.service.ts:4`, `AdminLogin.tsx:35`, `apiClient.ts:4`).
- **Tout XSS (y compris stocké via contenu news/commentaire) = vol de session admin.** `httpOnly; Secure; SameSite` cookies côté backend = correctif recommandé.
- Aggravant : `admin.service.ts:18` fait `response.json().catch(()=>({}))` puis `json.error.message` — surface d'erreur à surveiller, et `apiFetch` client ne gère pas le 401 (pas de logout forcé).

### 🔴 HIGH-2 — Hygiène des secrets fragile (incident en attente)
- ✅ Points positifs vérifiés : `git ls-files` ne track **aucun** `.env` (seuls les `.env.example` le sont), `.gitignore` couvre `.env`, `.env.production`, `.env.import`. `Backend/.env` et `.env.import` ne sont PAS commités.
- ⚠️ Mais : `SUPABASE_SERVICE_ROLE_KEY` dort **en clair** dans `C:\...\Site\.env.import`, `Backend\.env`, `hex.txt` (hexdump local). Un mauvais `git add -f`, un zip partagé, un screenshot = **compromission totale** (bypass RLS).
- ⚠️ `VITE_SUPABASE_ANON_KEY` **en dur dans `.github/workflows/deploy.yml:37,47` (repo public)** + fallback URL en dur dans `AdminLayout.tsx:6`, `AdminLogin.tsx:6`. Clé anon = publique par design, mais elle devrait passer par **GitHub Secrets**, sinon rotation impossible sans réécrire l'historique.
- **Vérifié : aucune `service_role` dans les bundles JS** (recherche `service_role` dans les 2 bundles → 0 hit). ✅ Ne jamais y mettre.

### 🟠 MEDIUM-1 — Upload : contrôle MIME uniquement sur `mimetype` attaquant
- `admin.results.ts:55` : `MIME.result.includes(file.mimetype)` — le `mimetype` vient de l'en-tête multipart, **falsifiable**. Pas de vérification magic-bytes, pas de scan antivirus, pas de re-encodage image.
- `extOf()` dans `files.ts:26` assainit l'extension (ok), nom d'origine jamais réutilisé (ok, UUID), mais **double-extension type `note.pdf.html` → ext `pdfhtml`?** En fait `parts.pop()` prend après le dernier `.`, ok. Reste le **polyglotte PDF/JS** et les **XLSX avec macros / DDE** servis ensuite aux élèves.
- Correctif : vérifier signature fichier (ex. `%PDF`, ZIP `PK` pour xlsx), limiter à `pdf + xlsx` stricts, servir avec `Content-Disposition: attachment` + `X-Content-Type-Options: nosniff` (déjà présent côté API).

### 🟠 MEDIUM-2 — Rate-limit en mémoire = contournable en prod
- `rateLimit.ts:49-50` : 100 req/15 min admin, 60 req/15 min auth, **Map en mémoire + IP via `x-forwarded-for` (spoofable)**.
- Sur Render (multi-instance / restart free) les compteurs ne sont pas partagés → **brute-force distribué possible** sur `/login` (Supabase) et `/api/auth/me` (énumération).
- Pas de verrouillage de compte, captcha hCaptcha **optionnel** (`AdminLogin.tsx:71` : `captcha ? ... : undefined`).
- Correctif : Redis/Upstash rate-limit + captcha obligatoire + alerte après N échecs.

### 🟠 MEDIUM-3 — Fuite d'infos & énumération
- Email admin pré-rempli + messages d'erreur distincts (`Identifiants invalides` vs `Accès refusé : pas admin` dans `finishLogin`) → oracle d'énumération.
- 404 SPA (`404.html`) avec `?p=` + `history.replaceState(decodeURIComponent(...))` : **sink XSS potentiel** si un lien `https://.../IPP/?p=javascript:...` est suivi (à tester activement ; le `replaceState` seul ne l'exécute pas, mais tout code lisant `location` ensuite doit être audité).
- Données de test en prod via API publique : `GET /api/news` retourne `godson est BG`, `mort d'un eleve` + `image_path` internes. Pas une faille, mais **pollution + image interne exposée**.
- `GET /api/results/:classId` : **tout utilisateur authentifié** peut récupérer les résultats de **n'importe quelle classe** (pas d'ACL par classe/élève). Si c'est voulu (résultats par classe), le documenter ; sinon ajouter un contrôle d'appartenance.

### 🟡 LOW — Headers & durcissement frontend statique
- Backend ✅ exemplaire : `helmet`, `CORS` strict (test live : `Origin: https://evil.com` → **pas** de `Access-Control-Allow-Origin`, `https://bigk7697-crypto.github.io` → autorisé), `CSP`, `HSTS`, `nosniff`, `SAMEORIGIN`, erreurs génériques (`errorHandler.ts` ne fuit pas la stack). SQLi testée (`page=1' OR '1'='1`) → **sans effet** (validation `paginationParams` + Zod).
- Frontend GitHub Pages ⚠️ : pas de `Content-Security-Policy`/`HSTS` propres sur le statique, `sw.js` (`/IPP/direction/sw.js`) enregistré globalement (risque de cache poisoning si compromission du JS), pas de `integrity` (SRI) sur les assets.
- `AdminLayout` utilise `API_BASE` par défaut `https://ipp-backend.onrender.com/api` (ancien domaine) si `VITE_API_URL` absent — incohérence à nettoyer (le `.env.production` pointe lui sur `ipp-2mdf`).

---

## 5. Ce qui est BIEN (à garder)

- `auth → requireAdmin → requireMfa` sur **toutes** les routes admin ; vérification JWT via `anon.auth.getUser(token)` + rôle relu en DB (`auth.ts:40-44`), pas de trust du claim client.
- Trigger anti-escalade de rôle `009_fix_role_escalation_service_role.sql` (avec exception `service_role` légitime).
- RLS Supabase : `REST /profiles` en anon → `[]` (test live ✅).
- Résultats/documents privés en **buckets privés + signed URL 1h**, jamais d'URL permanente ; `documents.ts:34-38` masque `file_path` des privés.
- Validation Zod systématique + `422` propres, `helmet`, CORS allow-list, pas de stacktrace en prod.

---

## 6. Plan de remédiation priorisé

| Prio | Action | Effort |
|---|---|---|
| P0 | Supprimer les fonctions `/admin/*` du **client public** (`document/classes/result.service`) + rebuild | 1 h |
| P0 | Passer `deploy.yml` aux **GitHub Secrets**, retirer la clé anon en dur ; enlever l'email pré-rempli `admin@ipp.tg` | 1 h |
| P0 | Migrer tokens vers **cookies httpOnly** (ou à défaut : rotation courte + `logout` sur 401 + CSP stricte anti-XSS) | 1–2 j |
| P1 | Durcir uploads : magic-bytes + `attachment` + AV/scan + auditer policies bucket `public-assets` (stopper l'upload direct ou le verrouiller RLS) | 1 j |
| P1 | Rate-limit distribué (Redis) + captcha obligatoire + alerting brute-force + uniformiser messages d'erreur login | 1 j |
| P2 | ACL résultats par classe, nettoyer données test prod, ajouter CSP/HSTS sur Pages (`_headers` via Cloudflare ou meta), SRI, nettoyer `API_BASE` legacy | 0.5–1 j |
| P2 | Rotation des clés si `.env.import`/`hex.txt` ont déjà circulé (Supabase Dashboard → new anon/service keys + Render env) + supprimer `hex.txt` du poste | 1 h |

---

## 7. Annexe — preuves reproductibles

```powershell
# Espace admin réel (200) vs leurre (404)
curl.exe -s -o NUL -w "%{http_code} %{url_effective}`n" "https://bigk7697-crypto.github.io/IPP/direction/"
curl.exe -s -o NUL -w "%{http_code} %{url_effective}`n" "https://bigk7697-crypto.github.io/IPP/admin"

# API : refus sans token / faux token
curl.exe -s "https://ipp-2mdf.onrender.com/api/admin/news?page=1&limit=5"
curl.exe -s -H "Authorization: Bearer faketoken123" "https://ipp-2mdf.onrender.com/api/admin/news?page=1&limit=1"

# CORS : evil bloqué, site autorisé
curl.exe -s -D - -o NUL -H "Origin: https://evil.com" "https://ipp-2mdf.onrender.com/api/news?page=1&limit=1"
curl.exe -s -D - -o NUL -H "Origin: https://bigk7697-crypto.github.io" "https://ipp-2mdf.onrender.com/api/news?page=1&limit=1"

# Supabase direct anon : RLS bloque profiles
curl.exe -s "https://knmxosdfxxzjagqyhkcc.supabase.co/rest/v1/profiles?select=id,role&limit=2" -H "apikey: <ANON_KEY>"
# -> []

# SQLi : sans effet
curl.exe -s "https://ipp-2mdf.onrender.com/api/news?page=1'%20OR%20'1'='1&limit=2"
```

Fichiers sources cités : `Frontend/admin/src/pages/AdminLogin.tsx`, `Frontend/admin/src/layouts/AdminLayout.tsx`, `Frontend/admin/src/services/admin.service.ts`, `Frontend/client/src/services/{document,classes,result}.service.ts`, `Backend/src/middleware/{auth,requireAdmin,requireMfa,rateLimit}.ts`, `Backend/src/routes/admin.*.ts`, `Backend/src/utils/files.ts`, `Backend/supabase/migrations/009_*`, `.github/workflows/deploy.yml`, `Frontend/admin/src/App.tsx`.

*Rapport à usage défensif uniquement — ne pas exploiter au-delà des tests autorisés, corriger puis re-tester.*
