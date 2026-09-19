# FRONTEND API INTEGRATION GUIDE
## Projet
IPP - Site Scolaire V1
Version API : 1.0.0 (API gelée)
Ce document fait foi pour l'intégration frontend.

---

# URL API

## Développement
```text
http://localhost:4000/api
```

## Production
```text
https://ipp-backend.onrender.com/api
```

---

# Authentification

IMPORTANT :
L'authentification est gérée par Supabase.
Le frontend ne doit pas appeler des routes backend pour :
* signup
* login
* logout
* reset password

Ces opérations doivent utiliser le SDK Supabase.

Exemple :
```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
)

await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      first_name,
      last_name
    }
  }
})

await supabase.auth.signInWithPassword({
  email,
  password
})

await supabase.auth.signOut()

await supabase.auth.resetPasswordForEmail(email)
```

---

# Récupération du JWT

```javascript
const {
  data: { session }
} = await supabase.auth.getSession()

const token = session?.access_token
```

Toutes les routes privées du backend nécessitent :
```http
Authorization: Bearer <SUPABASE_JWT>
```

---

# Vérification utilisateur connecté

GET
```text
/api/auth/me
```

Header :
```http
Authorization: Bearer <SUPABASE_JWT>
```

Réponse :
```json
{
  "success": true,
  "data": {
    "id": "...",
    "email": "...",
    "role": "user",
    "email_verified": true
  }
}
```

---

# Vérification administrateur

Après connexion :
```javascript
const me = await fetch('/api/auth/me')
```

Vérifier :
```json
{
  "role": "admin"
}
```

Si :
```json
{
  "role": "user"
}
```

rediriger vers l'espace utilisateur.

---

# Format standard des réponses

## Succès
```json
{
  "success": true,
  "data": {}
}
```

## Succès avec pagination
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

## Erreur
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Message d'erreur"
  }
}
```

---

# Actualités

## Liste
GET
```text
/api/news
```

Pagination :
```text
/api/news?page=1&limit=10
```

Recherche :
```text
/api/news?q=examen
```

---

# Événements

## Liste
GET
```text
/api/events
```

Pagination :
```text
/api/events?page=1&limit=10
```

Recherche :
```text
/api/events?q=rentree
```

---

## Détail événement
GET
```text
/api/events/:id
```

---

# Classes

## Liste
GET
```text
/api/classes
```

Pagination :
```text
/api/classes?page=1&limit=20
```

Recherche :
```text
/api/classes?q=terminale
```

---

## Détail classe
GET
```text
/api/classes/:id
```

---

# Galerie

## Liste des albums
GET
```text
/api/gallery
```

Alias supporté :
```text
/api/gallery/albums
```

Pagination :
```text
/api/gallery?page=1&limit=20
```

---

## Détail album
GET
```text
/api/gallery/:id
```

---

# Documents

GET
```text
/api/documents
```

Recherche :
```text
/api/documents?q=reglement
```

Pagination :
```text
/api/documents?page=1&limit=20
```

---

# Résultats scolaires

Connexion obligatoire.
GET
```text
/api/results/:classId
```

Header :
```http
Authorization: Bearer <SUPABASE_JWT>
```

Réponse :
```json
{
  "success": true,
  "data": {
    "downloadUrl": "...",
    "expiresIn": 3600
  }
}
```

IMPORTANT :
* ne jamais stocker downloadUrl ;
* ne jamais sauvegarder en base ;
* ouvrir immédiatement ;
* l'URL expire automatiquement.

---

# Notifications

Connexion obligatoire.

## Liste
GET
```text
/api/notifications
```

---

## Marquer comme lu
PATCH
```text
/api/notifications/:id/read
```

---

## Tout marquer comme lu
PATCH
```text
/api/notifications/read-all
```

---

# Profil

Connexion obligatoire.
GET
```text
/api/profile
```

PATCH
```text
/api/profile
```

---

# Préférences de notifications

Connexion obligatoire.
GET
```text
/api/notification-preferences
```

PATCH
```text
/api/notification-preferences
```

---

# Gestion des erreurs frontend

401
Utilisateur non connecté.

403
Accès refusé.

404
Ressource introuvable.

422
Erreur de validation.

500
Erreur serveur.

Toujours afficher error.message.

---

# Sécurité

Le frontend ne doit jamais :
* stocker la SERVICE_ROLE_KEY ;
* appeler Supabase directement pour les données métier ;
* contourner l'API backend ;
* persister les Signed URLs.

Le frontend utilise :
* Supabase Auth pour l'identité ;
* Backend API pour les données métier.

---

# API GELÉE

Version : 1.0.0
Aucun :
* renommage de champ ;
* renommage de route ;
* changement de format JSON ;
n'est autorisé sans nouvelle version de l'API.
