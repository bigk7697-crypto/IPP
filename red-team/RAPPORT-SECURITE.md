# 🔴 RED TEAM — Rapport d'audit sécurité (Round 2 — 2026-09-22)

**Cibles :** `https://bigk7697-crypto.github.io/IPP` · admin `…/IPP/direction/` · API `https://ipp-2mdf.onrender.com/api`
**Méthode :** grey-box (code local + tests live non-destructeurs). **Verdict : admin NON compromis.** 🟡 Risque résiduel **moyen**, en baisse depuis le round 1 — plusieurs failles déjà corrigées (voir §1).

---

## 1. ✅ Corrigé depuis le round 1 (vérifié ce jour)

| # | Failles round 1 | Preuve de correction |
|---|---|---|
| 1 | Code mort `/admin/*` dans le client public (`document/classes/result.service`) | `Frontend/client/src/services/*.ts` : plus aucun appel `/admin` — services 100 % publics ✅ |
| 2 | Email admin pré-rempli `admin@ipp.tg` | `AdminLogin.tsx:11` : `useState('')` ✅ |
| 3 | MIME contrôlé sur le seul header + pas de magic-bytes | `utils/files.ts:75` `assertFileSignature()` (%PDF / PK) + appliqué sur `inscriptions.ts:53` ✅ |
| 4 | `apiFetch` sans purge 401 | `apiClient.ts` : regex JWT + purge token + redirect `/connexion` sur 401 ✅ |
| 5 | Rate-limit douteux | **Prouvé live** : `429 + Retry-After: 732` après ~60 req/15 min sur `/api/auth/me` ✅ |

---

## 2. Attaques retestées ce jour (toutes échouées = bon signe)

| Attaque | Résultat live |
|---|---|
| Direct `/IPP/direction/dashboard` sans token | Redirect `/login` |
| `GET/DELETE /api/admin/news`, `/api/admin/settings`, `/api/admin/inscriptions`, `/api/admin/orientation/topics` sans token | `401 UNAUTHORIZED` partout |
| `GET /api/inscriptions/mine`, `/track/IPP-…`, `POST /push/subscribe` sans token | `401` partout |
| CORS `Origin: https://evil.com` | **Pas** de header `Access-Control-Allow-Origin` → bloqué ✅ |
| `TRACE /api/health` | `405` ✅ |
| SQLi `page=1' OR '1'='1` | Sans effet (validation pagination) ✅ |
| XSS réfléchi `q=<script>alert(1)</script>` | `[]`, pas de réflexion ✅ |
| Faux `Bearer faketoken` | `401 Session invalide` ✅ |
| REST Supabase anon `profiles` | `[]` (RLS) ✅ |
| Headers API | `helmet` : CSP, HSTS, `nosniff`, `SAMEORIGIN` ✅ |
| `POST /orientation/unanswered` (public, anti-spam) | Protégé par `authLimiter` (mon IP elle-même rate-limitée pendant le test = preuve que ça marche) + zod `max 500` ✅ |

---

## 3. 🔴 Reste à corriger (par priorité — avec correctifs)

### P0-1 — Tokens JWT en `localStorage` (vol via XSS) — HIGH
- **Fichiers :** `Frontend/client/src/services/apiClient.ts` (`school_token`), `Frontend/admin/src/services/admin.service.ts` + `AdminLogin.tsx:35` (`admin_token`), `auth.service.ts` (sessions).
- **Risque :** tout XSS (même via extension navigateur) = vol de session admin. Aucun `dangerouslySetInnerHTML` trouvé ✅, mais le risque demeure (supply-chain npm, SW).
- **Correctif :** passer aux **cookies `httpOnly; Secure; SameSite=Lax`** posés par le backend (`POST /api/auth/session`), frontend en `credentials: 'include'`. À défaut : access-token ≤15 min + refresh-token rotatif.

### P0-2 — Hygiène secrets : `SERVICE_ROLE` en clair sur le poste — HIGH
- **Fichiers :** `.env.import`, `Backend/.env`, `hex.txt` (contient URL + `ANON_KEY` en hexdump). Non commités ✅ (`git ls-files` : seuls les `.env.example` sont trackés) — mais un `git add -f`, un zip, un partage d'écran = compromission totale (bypass RLS).
- **Correctifs :** (a) supprimer `hex.txt` ; (b) `VITE_*` de `.github/workflows/deploy.yml:37,47` → **GitHub Secrets** ; (c) si ces clés ont circulé hors poste → **rotation** (Supabase Dashboard → nouvelles clés + Render env + rebuild Pages).

### P1-1 — Upload direct Supabase depuis l'admin contourne le backend — MEDIUM
- **Fichiers :** `AdminNews` / galerie : `storage.from("public-assets").upload()` côté navigateur puis simple `image_path` au backend. Seul un admin authentifié peut le faire (policy `003_storage.sql:24` exige `is_admin`) → pas d'exploitation anonyme, mais **pas de contrôle magic-bytes/taille côté serveur** sur ces images (publiques ensuite).
- **Correctif :** faire transiter les images par le backend (multer + `assertFileSignature` + `MIME.image`), ou ajouter une Edge Function de validation.

### P1-2 — Avatars : tout user authentifié peut écraser l'avatar d'un autre — MEDIUM/LOW
- **Fichier :** `Backend/supabase/migrations/012_avatars_storage.sql:6-31` — policies limitées à `foldername = 'avatars'` **sans contrainte `auth.uid()` dans le nom de fichier**. User A peut écrire `avatars/<id-user-B>.png`.
- **Correctif :** ajouter `AND name = 'avatars/' || auth.uid() || '.png'` (ou préfixe `auth.uid()`) dans les 3 policies + valider l'extension.

### P1-3 — Rate-limit en mémoire = non partagé entre instances — MEDIUM
- **Fichier :** `Backend/src/middleware/rateLimit.ts` (Map locale, IP via `x-forwarded-for` spoofable). Fonctionnel sur 1 instance (prouvé), mais Render free peut redémarrer/scaler → compteurs perdus.
- **Correctif :** rate-limit distribué (Redis/Upstash) + captcha **obligatoire** côté admin (actuellement optionnel, `AdminLogin.tsx:71`) + messages d'erreur login uniformes (ne pas distinguer « identifiants invalides » vs « pas admin »).

### P2 — Durcissement divers — LOW
- `GET /api/results/:classId` : **tout compte authentifié** lit les résultats de **n'importe quelle classe** (pas d'ACL par classe). Si voulu, le documenter ; sinon filtrer par rattachement élève.
- Frontend Pages : pas de CSP propre (que HSTS). Ajouter `Content-Security-Policy` + `X-Content-Type-Options` (fichier `_headers` ou via Cloudflare) ; envisager SRI sur les bundles.
- `AdminLayout.tsx:9` : fallback `API_BASE = https://ipp-backend.onrender.com/api` (ancien domaine) si `VITE_API_URL` absent → nettoyer vers `ipp-2mdf`.
- Données de test en prod (`actialiter de teste`, anciens `godson est BG`) retournées par l'API publique → purger.
- `orientation/unanswered` public (voulu, silencieux côté front) : surveiller le volume (spam DB) — envisager honeypot/captcha invisible si abus.
- `009_…_service_role.sql` : exception `service_role` légitime mais à garder sous revue (tout backend compromis = promo admin possible).

---

## 4. 🟢 Points forts confirmés (ne pas régresser)

`auth → requireAdmin → requireMfa(aal2)` sur **toutes** les routes admin (y compris les nouvelles `admin.inscriptions`, `admin.orientation`, `admin.maintenance`) · rôle relu en DB, jamais trusté du JWT · RLS `profiles` + buckets privés (`008`) · buckets privés servis en **signed URL 1 h** · `file_path` privés masqués · validation Zod + `422` · `errorHandler` sans fuite de stack (400 propre sur JSON malformé) · CORS allow-list · `inscriptions/track` scopé `user_id` (pas d'IDOR) · références `IPP-AAAA-XXXXXX` non énumérables + 404 uniforme.

---

## 5. Reproduction (extraits)

```powershell
curl.exe -s "https://ipp-2mdf.onrender.com/api/admin/news?page=1&limit=1"
# -> {"success":false,"error":{"code":"UNAUTHORIZED",...}}
curl.exe -s -D - -o NUL -H "Origin: https://evil.com" "https://ipp-2mdf.onrender.com/api/news?page=1&limit=1"
# -> pas de access-control-allow-origin (bloqué)
curl.exe -s "https://knmxosdfxxzjagqyhkcc.supabase.co/rest/v1/profiles?select=id,role&limit=2" -H "apikey: <ANON>"
# -> []
# rate-limit : 70 req rapides sur /api/auth/me -> 429 + retry-after: 732
```

*Usage défensif uniquement — corriger P0 puis re-tester (round 3 conseillé après migration cookies).*
