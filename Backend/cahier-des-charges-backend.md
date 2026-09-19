# CAHIER DES CHARGES TECHNIQUE — BACKEND SITE SCOLAIRE V1

**Version :** 1.0
**Projet :** Site Scolaire
**Dossier concerné :** `/backend`
**Durée globale du projet :** 8 mois
**Budget V1 :** 0 FCFA
**Backend principal :** Supabase
**Base de données :** PostgreSQL
**Authentification :** Supabase Auth
**Stockage :** Supabase Storage
**Temps réel :** Supabase Realtime
**Fonctions serveur :** Supabase Edge Functions si nécessaire
**Frontend consommateur :** `/frontend`
**Frontend administration :** application séparée pouvant être ajoutée au projet

---

# 1. OBJECTIF DU BACKEND

Le backend est le cœur de la plateforme.

Il doit gérer :

* les utilisateurs ;
* l'authentification ;
* les profils ;
* les rôles ;
* les actualités ;
* les événements ;
* les classes ;
* les résultats scolaires ;
* les documents ;
* la galerie ;
* les notifications ;
* les préférences de notifications ;
* les paramètres de l'école ;
* les fichiers ;
* les permissions ;
* la sécurité ;
* la synchronisation avec les frontends.

Le backend doit être conçu comme une véritable application de production et non comme une simple simulation.

---

# 2. ARCHITECTURE GÉNÉRALE

Le projet contient actuellement :

```text
site-scolaire/
│
├── frontend/
│
├── backend/
│
└── cahier-des-charges.md
```

Le backend sera connecté au frontend.

Architecture cible :

```text
                         SUPABASE
                    BACKEND CENTRAL
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
      PostgreSQL       Auth          Storage
          │              │              │
          └──────────────┼──────────────┘
                         │
                    Realtime
                         │
                         ▼
                  LOGIQUE BACKEND
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
       FRONTEND PUBLIC         ADMIN FRONTEND
       + ESPACE USER
```

Le frontend ne doit pas posséder sa propre copie des données.

Les données officielles doivent venir du backend.

---

# 3. SUPABASE : SERVICE PRINCIPAL

Supabase sera le service central de la V1.

Il fournira :

```text
Supabase
│
├── PostgreSQL
│   └── Base de données
│
├── Auth
│   └── Comptes utilisateurs
│
├── Storage
│   └── Images / PDF / fichiers
│
├── Realtime
│   └── Synchronisation en temps réel
│
└── Edge Functions
    └── Logique serveur / tâches sensibles
```

---

# 4. FIREBASE

Firebase n'est pas obligatoire dans la V1.

Il ne faut pas utiliser simultanément :

```text
Supabase Database
+
Firebase Database
```

pour stocker les mêmes données.

Cela créerait une synchronisation inutilement complexe.

De même, il ne faut pas avoir :

```text
Supabase Auth
+
Firebase Auth
```

pour les mêmes utilisateurs.

### Décision V1

Le backend principal utilise :

```text
SUPABASE
```

Firebase pourra éventuellement être étudié en V2 si une fonctionnalité précise le justifie.

Exemple potentiel futur :

* notifications push mobiles ;
* Firebase Cloud Messaging ;
* application Android/iOS.

Mais cela n'est pas nécessaire pour commencer le backend V1.

---

# 5. CRÉATION DU PROJET SUPABASE

Créer un projet Supabase dédié au Site Scolaire.

Le projet doit contenir :

* une base PostgreSQL ;
* Auth activé ;
* Storage activé ;
* Realtime activé lorsque nécessaire ;
* Edge Functions uniquement pour les besoins nécessitant une exécution serveur.

Les identifiants du projet doivent être stockés dans les variables d'environnement.

---

# 6. VARIABLES D'ENVIRONNEMENT

Le backend doit utiliser des variables d'environnement.

Exemple :

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

La clé `SUPABASE_SERVICE_ROLE_KEY` est strictement secrète.

Elle ne doit :

* jamais être envoyée au frontend ;
* jamais être commitée sur Git ;
* jamais être placée dans un fichier public ;
* jamais être affichée dans les logs.

Le frontend utilise uniquement les informations qui peuvent être exposées publiquement selon l'architecture Supabase.

---

# 7. STRUCTURE DU DOSSIER BACKEND

Structure recommandée :

```text
backend/
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── services/
│   ├── middleware/
│   ├── routes/
│   ├── validators/
│   ├── utils/
│   └── types/
│
├── supabase/
│   ├── migrations/
│   ├── functions/
│   └── seed/
│
├── tests/
│
├── .env
├── .env.example
├── package.json
├── README.md
└── backend.md
```

La structure exacte peut être adaptée à la technologie choisie.

---

# 8. TECHNOLOGIE BACKEND

Le backend peut utiliser :

* Node.js ;
* TypeScript ;
* framework API adapté ;
* Supabase ;
* PostgreSQL.

TypeScript est recommandé pour améliorer la sécurité du code et éviter certaines erreurs de typage.

Le backend doit être séparé de l'interface utilisateur.

---

# 9. BASE DE DONNÉES POSTGRESQL

La base principale doit être PostgreSQL via Supabase.

Tables V1 :

```text
profiles
news
events
classes
results
documents
gallery_albums
gallery_images
notifications
notification_preferences
school_settings
```

---

# 10. TABLE PROFILES

Cette table représente le profil applicatif de l'utilisateur.

Champs :

```text
id
first_name
last_name
email
role
created_at
updated_at
```

Le champ `id` doit correspondre à l'identifiant de l'utilisateur Supabase Auth.

Rôles V1 :

```text
user
admin
```

Il ne doit exister qu'un compte admin initialement.

---

# 11. SUPABASE AUTH

Supabase Auth gère :

* inscription ;
* connexion ;
* déconnexion ;
* sessions ;
* vérification email ;
* récupération de mot de passe ;
* changement de mot de passe ;
* tokens d'authentification.

Le backend ne doit pas créer son propre système de stockage de mots de passe.

Les mots de passe ne doivent jamais être enregistrés dans `profiles`.

---

# 12. INSCRIPTION

Lorsqu'un utilisateur s'inscrit :

```text
FRONTEND
   ↓
SUPABASE AUTH
   ↓
création du compte
   ↓
email de vérification
   ↓
création/complétion du profil
```

Le backend doit s'assurer qu'un profil correspondant peut être créé.

---

# 13. VÉRIFICATION EMAIL

L'email doit être vérifié avant d'autoriser certaines fonctionnalités sensibles.

Le backend doit pouvoir déterminer si l'utilisateur possède une session valide et si son compte respecte les conditions d'accès.

---

# 14. CONNEXION

Le frontend envoie les informations d'authentification au système prévu.

Après connexion :

```text
Supabase Auth
      ↓
Session
      ↓
Frontend
      ↓
Requêtes sécurisées
      ↓
Backend / Supabase
```

Le frontend doit utiliser la session pour accéder aux ressources nécessitant une authentification.

---

# 15. AUTORISATION

L'authentification répond à :

> Qui es-tu ?

L'autorisation répond à :

> Qu'as-tu le droit de faire ?

Le backend doit gérer les deux.

Exemple :

```text
Utilisateur connecté
        ≠
Administrateur
```

Un utilisateur connecté ne doit pas automatiquement avoir les permissions admin.

---

# 16. RÔLE ADMIN

Le rôle admin doit être enregistré côté backend/database.

Exemple :

```text
profiles.role = 'admin'
```

Le frontend ne doit jamais pouvoir simplement faire :

```text
role = admin
```

pour obtenir les permissions.

Les permissions doivent être vérifiées côté backend/database avec RLS.

---

# 17. CRÉATION DU COMPTE ADMIN

La V1 ne possède pas de page d'inscription admin.

Le premier compte admin doit être créé manuellement.

Exemple :

```text
Supabase Dashboard
        ↓
Authentication
        ↓
Users
        ↓
Create user
```

Puis le profil correspondant reçoit :

```text
role = admin
```

Cette opération est réservée au développeur.

---

# 18. ROW LEVEL SECURITY

RLS est une partie essentielle du backend.

Elle doit être activée sur les tables sensibles.

Objectif :

```text
FRONTEND
   ↓
requête
   ↓
SUPABASE
   ↓
RLS
   ↓
AUTORISÉ / REFUSÉ
```

La sécurité ne doit donc pas dépendre uniquement du frontend.

---

# 19. POLITIQUES RLS — PROFILES

Un utilisateur peut consulter/modifier uniquement les informations autorisées de son propre profil.

Un utilisateur ne doit pas pouvoir modifier :

```text
role
```

lui-même.

---

# 20. POLITIQUES RLS — NEWS

Les visiteurs peuvent lire les actualités publiées.

Les utilisateurs connectés peuvent également les lire.

Seul l'admin peut :

* créer ;
* modifier ;
* supprimer ;
* publier ;
* dépublier.

---

# 21. POLITIQUES RLS — EVENTS

Les événements publiés sont publics.

L'admin peut :

* créer ;
* modifier ;
* supprimer ;
* publier ;
* dépublier.

---

# 22. POLITIQUES RLS — RESULTS

Les résultats sont privés.

Règle :

```text
Visiteur
   ↓
REFUSÉ

Utilisateur authentifié
   ↓
ACCÈS SELON LES PERMISSIONS

Admin
   ↓
GESTION COMPLÈTE
```

Les fichiers de résultats doivent également être protégés au niveau Storage.

---

# 23. POLITIQUES RLS — NOTIFICATIONS

Un utilisateur doit uniquement pouvoir consulter ses propres notifications.

Exemple :

```text
user_id = utilisateur_connecté
```

Un utilisateur ne doit jamais pouvoir récupérer les notifications d'un autre utilisateur.

---

# 24. STOCKAGE SUPABASE STORAGE

Créer des buckets adaptés.

Exemple :

```text
public-assets
private-results
private-documents
```

Ou une organisation équivalente.

---

# 25. BUCKET PUBLIC

Le bucket public peut contenir :

* images d'actualités ;
* images de galerie ;
* ressources réellement publiques.

Aucune information sensible ne doit être placée dans ce bucket.

---

# 26. BUCKET PRIVÉ

Le bucket privé doit contenir :

* résultats scolaires ;
* documents confidentiels ;
* autres fichiers privés.

L'accès doit être contrôlé.

---

# 27. ACCÈS AUX FICHIERS PRIVÉS

Le frontend ne doit pas recevoir un lien public permanent vers un résultat.

Le backend peut générer un accès temporaire après vérification des permissions.

Architecture :

```text
Utilisateur
    ↓
Demande fichier
    ↓
Backend / RLS
    ↓
Vérification
    ↓
Autorisé
    ↓
URL temporaire
    ↓
Viewer
```

---

# 28. TABLE NEWS

Structure :

```text
news
├── id
├── title
├── slug
├── content
├── image_path
├── status
├── published_at
├── created_at
├── updated_at
└── created_by
```

Statuts :

```text
draft
published
archived
```

---

# 29. TABLE EVENTS

Structure :

```text
events
├── id
├── title
├── description
├── image_path
├── location
├── start_at
├── end_at
├── status
├── created_at
├── updated_at
└── created_by
```

---

# 30. TABLE CLASSES

Structure :

```text
classes
├── id
├── name
├── level
├── series
├── academic_year
├── is_active
└── created_at
```

Exemples :

```text
Seconde A
Première D
Terminale D
Terminale C
```

---

# 31. TABLE RESULTS

Structure :

```text
results
├── id
├── class_id
├── academic_year
├── result_type
├── file_path
├── status
├── published_at
├── created_at
├── updated_at
└── created_by
```

Le fichier lui-même n'est pas stocké dans PostgreSQL.

La base stocke son chemin/référence.

Le fichier est stocké dans Storage.

---

# 32. TABLE DOCUMENTS

Structure :

```text
documents
├── id
├── title
├── description
├── category
├── file_path
├── visibility
├── status
├── published_at
├── created_at
├── updated_at
└── created_by
```

`visibility` peut être :

```text
public
private
```

---

# 33. TABLE GALLERY_ALBUMS

Structure :

```text
gallery_albums
├── id
├── title
├── description
├── cover_image_path
├── created_at
├── updated_at
└── created_by
```

---

# 34. TABLE GALLERY_IMAGES

Structure :

```text
gallery_images
├── id
├── album_id
├── image_path
├── caption
├── sort_order
├── created_at
└── created_by
```

---

# 35. TABLE NOTIFICATIONS

Structure :

```text
notifications
├── id
├── user_id
├── type
├── title
├── message
├── target_type
├── target_id
├── is_read
└── created_at
```

Types :

```text
news
event
result
document
calendar
system
```

---

# 36. TABLE NOTIFICATION_PREFERENCES

Structure :

```text
notification_preferences
├── id
├── user_id
├── news_enabled
├── events_enabled
├── results_enabled
├── documents_enabled
├── calendar_enabled
├── system_enabled
└── updated_at
```

---

# 37. TABLE SCHOOL_SETTINGS

Cette table contient les informations générales configurables de l'école.

Exemples :

```text
school_name
school_description
address
phone
email
logo_path
website
social_links
updated_at
```

Les informations peuvent être modifiées par l'admin.

---

# 38. PUBLICATION AUTOMATIQUE

C'est une fonctionnalité essentielle.

Lorsqu'un administrateur publie une actualité :

```text
ADMIN
 ↓
BACKEND
 ↓
DATABASE
 ↓
status = published
 ↓
FRONTEND
```

Le frontend récupère automatiquement la nouvelle donnée.

Il ne faut jamais modifier manuellement le code frontend pour afficher une nouvelle actualité.

---

# 39. SYNCHRONISATION AVEC LE FRONTEND

Le frontend et le backend doivent fonctionner avec une source de vérité unique.

```text
                SUPABASE
             SOURCE DE VÉRITÉ
                    │
        ┌───────────┴───────────┐
        │                       │
    FRONTEND                 ADMIN
        │                       │
   lecture données         modification
        │                       │
        └───────────┬───────────┘
                    ↓
                 DATABASE
```

Si l'admin modifie une donnée, le frontend doit récupérer la nouvelle version.

---

# 40. SUPABASE REALTIME

Realtime peut être utilisé pour les données nécessitant une mise à jour immédiate.

Exemples :

* nouvelles actualités ;
* nouveaux événements ;
* nouvelles notifications ;
* changements importants.

Exemple :

```text
ADMIN
 ↓
Publie actualité
 ↓
PostgreSQL
 ↓
Realtime
 ↓
Frontend
 ↓
Actualité disponible
```

Le système doit également prévoir une récupération classique des données afin de fonctionner si Realtime est momentanément indisponible.

---

# 41. SYSTÈME DE NOTIFICATIONS AUTOMATIQUES

Le backend doit créer automatiquement les notifications.

Exemple :

```text
ADMIN PUBLIE
ACTUALITÉ
      ↓
DATABASE
      ↓
TRIGGER / LOGIQUE SERVEUR
      ↓
NOTIFICATION
      ↓
UTILISATEURS
```

L'administrateur ne doit pas créer manuellement une notification séparée.

---

# 42. NOTIFICATION D'UNE ACTUALITÉ

Lorsqu'une actualité devient `published` :

```text
Nouvelle actualité

[Titre]

[Message]

→ Lire l'actualité
```

La notification doit contenir une référence vers l'actualité.

---

# 43. NOTIFICATION D'UN ÉVÉNEMENT

Lorsqu'un événement est publié :

```text
Nouvel événement

[Journée culturelle]

15 octobre 2026

→ Voir l'événement
```

---

# 44. NOTIFICATION D'UN RÉSULTAT

Lorsqu'un résultat est publié :

```text
Nouveau résultat disponible

Terminale D
2025-2026

→ Voir les résultats
```

La notification doit rester privée.

Elle ne doit pas devenir une information publique.

---

# 45. NOTIFICATIONS CIBLÉES

La V1 peut commencer avec des notifications destinées à tous les utilisateurs authentifiés.

Cependant, l'architecture doit permettre plus tard de cibler :

```text
tous les utilisateurs
une classe
un niveau
une série
un étudiant
un parent
```

Cette fonctionnalité avancée sera étudiée en V2.

---

# 46. RAPPELS AUTOMATIQUES

Les événements peuvent générer des rappels.

Exemple :

```text
Événement
15 octobre
      ↓
Rappel configurable
      ↓
Notification
```

La logique de rappel peut être implémentée avec :

* Edge Functions ;
* tâches programmées ;
* cron ;
* ou un mécanisme serveur équivalent.

---

# 47. API BACKEND

Si une API personnalisée est utilisée, elle doit être organisée clairement.

Exemple :

```text
/api/news
/api/events
/api/gallery
/api/documents
/api/classes
/api/results
/api/notifications
/api/profile
```

Administration :

```text
/api/admin/news
/api/admin/events
/api/admin/results
/api/admin/documents
/api/admin/gallery
/api/admin/classes
```

---

# 48. CONTRAT AVEC LE FRONTEND

Avant l'intégration, définir précisément :

* endpoints ;
* méthodes HTTP ;
* paramètres ;
* format JSON ;
* réponses ;
* erreurs ;
* authentification ;
* permissions.

Exemple :

```json
{
  "id": "uuid",
  "title": "Nouvelle actualité",
  "content": "...",
  "published_at": "2026-09-18T20:00:00Z"
}
```

Le frontend peut alors développer son interface indépendamment du backend.

---

# 49. EXEMPLE DE FLUX FRONTEND → BACKEND

Pour récupérer les actualités :

```text
Frontend
   ↓
GET /api/news
   ↓
Backend
   ↓
PostgreSQL
   ↓
Résultats
   ↓
JSON
   ↓
Frontend
   ↓
Affichage
```

---

# 50. EXEMPLE DE FLUX ADMIN → BACKEND

Pour publier une actualité :

```text
Admin Frontend
      ↓
POST /api/admin/news
      ↓
Authentification
      ↓
Vérification role=admin
      ↓
Validation
      ↓
PostgreSQL
      ↓
Publication
      ↓
Notification
      ↓
Realtime
      ↓
Frontend utilisateur
```

---

# 51. VALIDATION DES DONNÉES

Toutes les données reçues du frontend doivent être validées.

Exemples :

* titre obligatoire ;
* contenu obligatoire ;
* date valide ;
* fichier valide ;
* classe existante ;
* type de résultat valide ;
* utilisateur authentifié ;
* permission suffisante.

Ne jamais faire confiance aux données provenant directement du frontend.

---

# 52. UPLOAD DES FICHIERS

Lors d'un upload :

```text
Frontend
 ↓
Backend / Storage
 ↓
Validation
 ↓
Type MIME
 ↓
Extension
 ↓
Taille
 ↓
Nom sécurisé
 ↓
Storage
 ↓
Référence enregistrée dans PostgreSQL
```

Les fichiers doivent avoir des limites de taille adaptées.

---

# 53. NOMMAGE DES FICHIERS

Éviter de conserver aveuglément le nom fourni par l'utilisateur.

Utiliser des identifiants uniques.

Exemple :

```text
results/
2025-2026/
terminale-d/
uuid-resultat.pdf
```

Cela évite notamment les collisions de fichiers.

---

# 54. SUPPRESSION DES FICHIERS

Lorsqu'un résultat est supprimé :

```text
DATABASE
 +
STORAGE
```

doivent rester cohérents.

Le système doit éviter de laisser des fichiers orphelins dans Storage.

---

# 55. PAGINATION

Les listes pouvant devenir importantes doivent utiliser la pagination.

Exemples :

* actualités ;
* événements ;
* notifications ;
* documents ;
* utilisateurs.

Ne pas récupérer inutilement plusieurs milliers de lignes.

---

# 56. RECHERCHE

La V1 peut proposer une recherche simple sur :

* actualités ;
* événements ;
* documents.

La recherche avancée pourra être ajoutée plus tard.

---

# 57. LOGS

Le backend doit produire des logs utiles pour le développement et le dépannage.

Les logs ne doivent jamais contenir :

* mots de passe ;
* clés API ;
* service role key ;
* tokens ;
* données personnelles inutiles.

---

# 58. GESTION DES ERREURS

Les erreurs doivent être normalisées.

Exemple :

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Vous devez être connecté."
  }
}
```

Codes possibles :

```text
400 BAD_REQUEST
401 UNAUTHORIZED
403 FORBIDDEN
404 NOT_FOUND
409 CONFLICT
422 VALIDATION_ERROR
500 INTERNAL_ERROR
```

---

# 59. PROTECTION CONTRE LES ABUS

Prévoir :

* validation des entrées ;
* limitation des requêtes sensibles ;
* protection contre les uploads abusifs ;
* protection des routes admin ;
* vérification des sessions ;
* règles RLS ;
* limitation des opérations coûteuses.

---

# 60. CORS

Le backend doit autoriser uniquement les origines nécessaires.

En développement :

```text
localhost
```

En production :

```text
domaine officiel du frontend
```

Le domaine de l'administration peut être configuré séparément.

---

# 61. FRONTEND ET BACKEND : SYNCHRONISATION

Le frontend doit rester indépendant du stockage interne.

Il ne doit pas faire confiance à une structure interne non documentée.

Le contrat est :

```text
FRONTEND
    ↕
API / SUPABASE
    ↕
DATABASE
```

Si la structure interne change, le contrat frontend doit être maintenu ou versionné.

---

# 62. ADMIN FRONTEND ET BACKEND

L'application admin utilise exactement le même backend central.

```text
PUBLIC FRONTEND ───────┐
                       │
USER FRONTEND ─────────┼──► SUPABASE
                       │
ADMIN FRONTEND ────────┘
```

Cependant, les permissions sont différentes.

---

# 63. EXEMPLE DE SYNCHRONISATION COMPLÈTE

## Cas : nouvelle actualité

```text
1. Admin ouvre Admin Frontend

2. Admin crée l'actualité

3. Admin clique sur "Publier"

4. Backend vérifie :
   - session
   - rôle admin
   - données

5. PostgreSQL enregistre l'actualité

6. Backend crée les notifications nécessaires

7. Realtime informe les clients connectés

8. Frontend récupère la nouvelle actualité

9. L'actualité apparaît sur le site

10. L'utilisateur reçoit sa notification
```

Aucune deuxième saisie n'est nécessaire.

---

# 64. EXEMPLE DE SYNCHRONISATION — RÉSULTAT

```text
Admin
 ↓
Upload fichier
 ↓
Storage privé
 ↓
Création résultat PostgreSQL
 ↓
Publication
 ↓
Notification privée
 ↓
Utilisateur connecté
 ↓
Résultats
 ↓
Sélection classe
 ↓
Accès sécurisé au fichier
```

---

# 65. EXEMPLE DE SYNCHRONISATION — ÉVÉNEMENT

```text
Admin
 ↓
Création événement
 ↓
Publication
 ↓
PostgreSQL
 ↓
Frontend public
 ↓
Calendrier
 ↓
Notification
 ↓
Rappel futur
```

---

# 66. TESTS BACKEND

Créer des tests pour :

## Auth

* inscription ;
* connexion ;
* session ;
* déconnexion ;
* récupération mot de passe.

## Permissions

* visiteur ;
* utilisateur ;
* admin.

## News

* création ;
* modification ;
* publication ;
* suppression.

## Results

* upload ;
* publication ;
* accès privé ;
* refus visiteur.

## Notifications

* génération ;
* lecture ;
* non-lue ;
* préférences.

## Storage

* upload ;
* accès ;
* suppression ;
* permissions.

---

# 67. TESTS DE SÉCURITÉ

Tester explicitement :

```text
Utilisateur → route admin
```

doit être refusé.

Tester :

```text
Utilisateur A → notification utilisateur B
```

doit être refusé.

Tester :

```text
Visiteur → résultat privé
```

doit être refusé.

Tester :

```text
Utilisateur → modification de role
```

doit être refusé.

Tester :

```text
Utilisateur → fichier privé non autorisé
```

doit être refusé.

---

# 68. MIGRATIONS SUPABASE

Toutes les modifications importantes de la base doivent être versionnées.

Exemple :

```text
supabase/migrations/
├── 001_initial_schema.sql
├── 002_rls_policies.sql
├── 003_storage.sql
├── 004_notifications.sql
└── 005_realtime.sql
```

Le schéma ne doit pas dépendre uniquement de modifications manuelles effectuées dans le Dashboard Supabase.

---

# 69. SEED / DONNÉES DE TEST

Prévoir des données de développement.

Exemple :

```text
classes :
- Seconde A
- Première D
- Terminale D
```

Exemple :

```text
news :
- Bienvenue sur le site
- Rentrée scolaire
```

Ces données sont uniquement destinées au développement/test.

---

# 70. ENVIRONNEMENTS

Prévoir au minimum :

```text
development
production
```

Si les moyens le permettent :

```text
development
staging
production
```

Les clés et variables doivent être différentes selon l'environnement.

---

# 71. DÉPLOIEMENT

Le backend doit pouvoir être déployé sur une infrastructure gratuite ou peu coûteuse.

Supabase héberge la partie principale :

```text
PostgreSQL
Auth
Storage
Realtime
```

Les éventuelles fonctions serveur doivent être déployées via l'infrastructure adaptée.

---

# 72. FIREBASE EN V2

Firebase peut être ajouté plus tard si l'application mobile nécessite notamment :

```text
Firebase Cloud Messaging
        ↓
Push notifications
        ↓
Android / iOS
```

Mais Firebase ne doit pas devenir une deuxième source de vérité pour les données V1.

---

# 73. DOCUMENTATION BACKEND

Le dossier `/backend` doit contenir une documentation minimale :

```text
backend/
├── README.md
├── architecture.md
├── database.md
├── api.md
├── security.md
└── setup.md
```

Ces documents doivent expliquer comment :

* installer le backend ;
* configurer Supabase ;
* configurer les variables ;
* lancer le développement ;
* appliquer les migrations ;
* tester ;
* déployer.

---

# 74. README BACKEND

Le README doit expliquer :

```text
1. Prérequis
2. Installation
3. Variables d'environnement
4. Configuration Supabase
5. Base de données
6. Authentification
7. Lancement local
8. Tests
9. Déploiement
10. Connexion au frontend
```

---

# 75. CONNEXION AU FRONTEND

Le frontend doit connaître uniquement les informations nécessaires pour communiquer avec le backend.

Exemple conceptuel :

```env
VITE_API_URL=
```

ou, si le frontend utilise directement le SDK Supabase :

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Les secrets serveur ne doivent jamais être envoyés au frontend.

---

# 76. CONTRAT DE DONNÉES

Le backend doit fournir des données prévisibles.

Exemple :

```json
{
  "id": "uuid",
  "title": "Journée culturelle",
  "description": "Description...",
  "start_at": "2026-10-15T09:00:00Z",
  "location": "Établissement",
  "status": "published"
}
```

Le frontend peut alors afficher les données sans connaître la logique interne du backend.

---

# 77. ÉTAT DE PUBLICATION

Les contenus administrables doivent avoir un statut.

Exemple :

```text
draft
published
archived
```

Règle :

```text
draft
 ↓
pas visible publiquement

published
 ↓
visible

archived
 ↓
plus affiché comme contenu actif
```

---

# 78. NOTIFICATION ET PUBLICATION

La notification doit être déclenchée uniquement lorsque l'action correspondante est réellement validée.

Exemple :

```text
Admin sauvegarde brouillon
        ↓
Aucune notification

Admin publie
        ↓
Notification
```

Il faut éviter d'envoyer une notification lorsqu'une opération échoue.

---

# 79. TRANSACTION ET COHÉRENCE

Pour les opérations importantes, le backend doit maintenir la cohérence entre :

* base de données ;
* stockage ;
* publication ;
* notification.

Exemple :

Si l'upload du résultat échoue :

```text
résultat = pas publié
notification = pas envoyée
```

Il ne faut pas annoncer aux utilisateurs qu'un résultat existe alors que le fichier n'a pas été correctement enregistré.

---

# 80. AUDIT MINIMAL

Pour les actions administratives importantes, conserver si possible :

```text
created_by
updated_by
created_at
updated_at
```

Cela permettra de savoir quel compte admin a effectué une opération.

Même si la V1 ne possède qu'un seul administrateur, cette structure facilitera la V2.

---

# 81. PRINCIPES DE DÉVELOPPEMENT

Le backend doit respecter :

* code propre ;
* séparation des responsabilités ;
* validation ;
* typage ;
* sécurité ;
* documentation ;
* migrations versionnées ;
* tests ;
* variables d'environnement ;
* absence de secrets dans Git ;
* gestion propre des erreurs ;
* aucune donnée fictive dans les fonctionnalités finales.

---

# 82. ORDRE DE DÉVELOPPEMENT

Le backend doit être développé progressivement.

## PHASE 1 — Initialisation

* créer projet backend ;
* choisir stack ;
* initialiser TypeScript ;
* configurer Supabase ;
* configurer `.env` ;
* créer `.env.example`.

## PHASE 2 — Base de données

Créer :

```text
profiles
classes
news
events
documents
results
gallery_albums
gallery_images
notifications
notification_preferences
school_settings
```

## PHASE 3 — Auth

Implémenter :

* inscription ;
* connexion ;
* vérification email ;
* session ;
* déconnexion ;
* récupération mot de passe.

## PHASE 4 — Sécurité

Implémenter :

* rôles ;
* RLS ;
* permissions ;
* Storage privé ;
* protection admin.

## PHASE 5 — Contenu

Implémenter :

* actualités ;
* événements ;
* documents ;
* galerie ;
* classes.

## PHASE 6 — Résultats

Implémenter :

* upload ;
* stockage privé ;
* publication ;
* consultation ;
* contrôle d'accès.

## PHASE 7 — Notifications

Implémenter :

* création automatique ;
* lecture ;
* non-lue ;
* préférences ;
* liens vers les ressources.

## PHASE 8 — Temps réel

Implémenter :

* Realtime ;
* synchronisation frontend ;
* notifications en temps réel.

## PHASE 9 — Rappels

Implémenter :

* rappels d'événements ;
* tâches programmées ;
* notifications automatiques.

## PHASE 10 — API / INTÉGRATION

Connecter :

```text
Backend
   ↕
Frontend
```

Puis :

```text
Backend
   ↕
Admin Frontend
```

## PHASE 11 — TESTS

Tester toutes les fonctionnalités.

## PHASE 12 — DÉPLOIEMENT

Préparer la version utilisable par l'école.

---

# 83. PRIORITÉS

Priorité absolue :

```text
1. Base de données
2. Authentification
3. RLS / sécurité
4. Storage
5. Résultats
6. API
7. Publication
8. Notifications
9. Realtime
10. Rappels
```

Ne pas commencer par les fonctionnalités avancées.

---

# 84. CRITÈRES DE VALIDATION DU BACKEND

Le backend V1 sera considéré comme fonctionnel lorsque :

* Supabase est correctement configuré ;
* PostgreSQL contient les tables nécessaires ;
* les migrations sont versionnées ;
* l'authentification fonctionne ;
* le profil utilisateur fonctionne ;
* le rôle admin fonctionne ;
* RLS protège les données ;
* Storage public/privé fonctionne ;
* les actualités peuvent être publiées ;
* les événements peuvent être publiés ;
* les résultats peuvent être importés ;
* les résultats privés sont protégés ;
* les documents fonctionnent ;
* la galerie fonctionne ;
* les notifications sont générées automatiquement ;
* les notifications sont privées lorsque nécessaire ;
* les préférences fonctionnent ;
* Realtime fonctionne lorsque nécessaire ;
* les rappels peuvent être programmés ;
* le frontend peut récupérer les données ;
* l'admin frontend peut modifier les données ;
* aucune clé secrète n'est exposée ;
* les tests de permissions passent.

---

# 85. RÈGLE D'OR DU BACKEND

Le frontend ne doit jamais être considéré comme fiable.

```text
FRONTEND
   ↓
DEMANDE
   ↓
BACKEND / SUPABASE
   ↓
AUTHENTIFICATION
   ↓
AUTORISATION
   ↓
VALIDATION
   ↓
DATABASE / STORAGE
   ↓
RÉPONSE
```

Chaque opération sensible doit être vérifiée côté serveur/base de données.

---

# 86. OBJECTIF FINAL

Le backend doit devenir une plateforme centrale capable de connecter :

```text
             ┌──────────────────────┐
             │       SUPABASE       │
             │                      │
             │ PostgreSQL            │
             │ Auth                  │
             │ Storage               │
             │ Realtime              │
             │ Edge Functions        │
             └──────────┬───────────┘
                        │
          ┌─────────────┼─────────────┐
          │             │             │
          ▼             ▼             ▼
      FRONTEND      ESPACE USER    ADMIN
       PUBLIC                       FRONTEND
          │             │             │
          └─────────────┼─────────────┘
                        │
                   DONNÉES SYNCHRONISÉES
```

Une action effectuée dans l'administration doit automatiquement produire les effets nécessaires dans les autres parties du système.

Exemple :

```text
ADMIN PUBLIE UNE ACTUALITÉ
          ↓
DATABASE
          ↓
REALTIME
          ↓
FRONTEND PUBLIC
          ↓
NOTIFICATION
          ↓
UTILISATEUR
```

Exemple :

```text
ADMIN PUBLIE UN RÉSULTAT
          ↓
STORAGE PRIVÉ
          ↓
DATABASE
          ↓
ESPACE RÉSULTATS
          ↓
NOTIFICATION PRIVÉE
          ↓
UTILISATEUR AUTORISÉ
```

Le backend constitue donc la **source de vérité centrale** du projet.

Le frontend affiche et utilise les données.

L'admin modifie les données.

Supabase assure la persistance, l'authentification, le stockage et le temps réel.

La sécurité est appliquée côté backend/database et non uniquement dans l'interface.

---

# 87. RÉSULTAT ATTENDU

À la fin de cette V1, le développeur backend doit être capable de lancer le système et d'obtenir :

```text
SUPABASE
    │
    ├── Auth fonctionnel
    ├── PostgreSQL fonctionnel
    ├── RLS fonctionnel
    ├── Storage fonctionnel
    ├── Realtime fonctionnel
    └── Notifications fonctionnelles
              │
              ▼
        BACKEND / API
              │
       ┌──────┴──────┐
       ▼             ▼
   FRONTEND       ADMIN
       │             │
       └──────┬──────┘
              ▼
       SITE SCOLAIRE
```

Le système doit être suffisamment propre pour pouvoir être utilisé comme base de développement d'une future V2 sans devoir reconstruire complètement le backend.
