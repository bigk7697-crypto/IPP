# CAHIER DES CHARGES — PLATEFORME SITE SCOLAIRE V1

**Version :** 1.0
**Type :** Projet scolaire / professionnel à but pédagogique
**Périmètre :** Une seule école
**Durée cible :** 8 mois
**Budget :** 0 FCFA pour la V1
**Architecture :** Frontend public + Frontend utilisateur + Frontend administration + Backend centralisé
**Backend envisagé :** Supabase / PostgreSQL / Auth / Storage / RLS
**Objectif :** Concevoir une véritable plateforme numérique scolaire moderne, sécurisée et exploitable par une école réelle.

---

# 1. PRÉSENTATION DU PROJET

Le projet consiste à développer une plateforme numérique destinée à une école.

La plateforme aura deux grandes parties accessibles aux utilisateurs :

* un site public accessible sans compte ;
* un espace privé accessible après authentification.

L'administration de la plateforme sera totalement séparée du site public et disposera de son propre frontend d'administration.

L'objectif de la V1 n'est pas de créer une plateforme scolaire extrêmement complexe, mais de construire une application réelle avec une architecture sérieuse, une bonne sécurité et des fonctionnalités réellement utilisables par une école.

La V1 sera développée pour **une seule école**.

Il n'y aura donc pas de système multi-écoles dans cette version.

---

# 2. OBJECTIFS DU PROJET

## 2.1 Objectif principal

Créer une plateforme permettant à l'école de :

* présenter son établissement ;
* publier des actualités ;
* publier des événements ;
* présenter ses formations et filières ;
* publier des documents ;
* gérer une galerie photo ;
* publier les résultats scolaires ;
* permettre aux utilisateurs authentifiés de consulter les résultats ;
* informer automatiquement les utilisateurs lorsqu'une nouvelle information est disponible ;
* gérer certaines dates et rappels importants ;
* administrer tout le contenu depuis une interface séparée.

---

# 3. PRINCIPES FONDAMENTAUX

La plateforme doit respecter les principes suivants :

### Simplicité

L'utilisateur doit comprendre rapidement comment utiliser le site.

### Sécurité

Les informations privées, notamment les résultats scolaires, doivent être protégées.

### Automatisation

L'administrateur ne doit pas avoir à publier manuellement la même information à plusieurs endroits.

Exemple :

```text
ADMIN PUBLIE UNE ACTUALITÉ
        ↓
BACKEND
        ↓
ACTUALITÉ DISPONIBLE SUR LE SITE
        ↓
NOTIFICATION AUTOMATIQUE
```

### Évolutivité

La V1 doit être suffisamment propre pour permettre l'ajout de fonctionnalités en V2 sans devoir refaire toute l'application.

### Gratuité

La V1 doit fonctionner avec des services gratuits ou avec des solutions ne nécessitant pas de budget important.

---

# 4. ARCHITECTURE GÉNÉRALE

L'architecture sera composée de trois applications principales utilisant le même backend.

```text
                    BACKEND CENTRAL
                Supabase / PostgreSQL
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
    SITE PUBLIC      ESPACE USER     ADMIN APP
     FRONTEND          FRONTEND       FRONTEND
          │              │              │
          │              │              │
       visiteurs      utilisateurs     admin
```

## 4.1 Frontend public

Application destinée :

* aux visiteurs ;
* aux élèves ;
* aux parents ;
* aux enseignants ;
* aux personnes souhaitant découvrir l'école.

Elle contient les informations publiques.

## 4.2 Espace utilisateur

Partie privée du site accessible uniquement après authentification.

Elle permet notamment de consulter les résultats scolaires disponibles.

## 4.3 Frontend administration

Application complètement séparée du frontend public.

Elle sert uniquement à l'administration du site.

Le frontend public ne doit pas afficher :

* un bouton "Admin" ;
* un lien vers l'administration ;
* une page d'administration ;
* une mention permettant de découvrir facilement l'espace admin.

L'URL de l'administration peut être différente de celle du site public.

Exemple conceptuel :

```text
www.ecole.com
admin.ecole.com
```

ou :

```text
site-scolaire/
site-scolaire-admin/
```

La séparation d'URL n'est cependant pas considérée comme une mesure de sécurité.

La sécurité doit être assurée par l'authentification, l'autorisation côté backend et les politiques RLS.

---

# 5. UTILISATEURS ET RÔLES

La V1 possède trois types d'accès.

## 5.1 Visiteur

Un visiteur n'est pas connecté.

Il peut consulter :

* accueil ;
* présentation de l'école ;
* formations ;
* filières ;
* actualités ;
* événements ;
* calendrier public ;
* galerie ;
* documents publics ;
* contact ;
* informations générales.

Il ne peut pas :

* consulter les résultats privés ;
* accéder à l'espace utilisateur ;
* accéder à l'administration.

---

## 5.2 Utilisateur authentifié

L'utilisateur possède un compte.

Il peut :

* consulter son profil ;
* modifier certaines informations de son profil ;
* consulter les résultats disponibles ;
* recevoir des notifications ;
* consulter les événements ;
* consulter les actualités ;
* consulter les documents auxquels il a accès ;
* gérer ses préférences de notifications ;
* se déconnecter.

---

## 5.3 Administrateur

La V1 possède initialement **un seul compte administrateur**.

Le compte admin est créé manuellement par le développeur.

Il n'existe donc pas de page :

```text
Créer un compte administrateur
```

L'administration permet de :

* gérer les actualités ;
* gérer les événements ;
* gérer la galerie ;
* gérer les documents ;
* gérer les résultats ;
* gérer les classes ;
* gérer certaines informations de l'école ;
* gérer les publications ;
* gérer les dates et événements ;
* consulter certaines informations système.

La V1 ne nécessite pas encore plusieurs rôles administrateurs.

Cette possibilité pourra être ajoutée en V2.

---

# 6. SITE PUBLIC

Le site public doit être moderne, professionnel, responsive et adapté aux smartphones.

Il ne doit pas avoir une apparence excessivement "AI-generated".

Le design doit être :

* institutionnel ;
* moderne ;
* propre ;
* lisible ;
* rapide ;
* mobile-first ;
* facilement modifiable.

---

# 7. PAGE D'ACCUEIL

La page d'accueil doit présenter rapidement l'école.

Elle peut contenir :

* logo ;
* nom de l'école ;
* slogan ;
* présentation courte ;
* formations ;
* dernières actualités ;
* prochains événements ;
* galerie ;
* informations importantes ;
* coordonnées ;
* liens vers les réseaux sociaux si nécessaire.

Les contenus dynamiques doivent provenir du backend.

Exemple :

```text
ADMIN AJOUTE UNE ACTUALITÉ
        ↓
BACKEND
        ↓
DERNIÈRES ACTUALITÉS
        ↓
PAGE D'ACCUEIL
```

L'admin ne doit pas modifier manuellement la page d'accueil pour chaque nouvelle actualité.

---

# 8. ACTUALITÉS

L'école doit pouvoir publier des actualités.

Une actualité peut contenir :

* titre ;
* image ;
* contenu ;
* auteur ;
* date ;
* statut ;
* date de publication.

Statuts possibles :

```text
DRAFT
PUBLISHED
ARCHIVED
```

Une actualité en `DRAFT` n'est pas visible publiquement.

Une actualité en `PUBLISHED` devient automatiquement disponible sur le frontend public.

---

# 9. ÉVÉNEMENTS

L'administration doit pouvoir créer des événements.

Un événement contient notamment :

* titre ;
* description ;
* image facultative ;
* date ;
* heure ;
* lieu ;
* date de fin facultative ;
* statut.

Lorsqu'un événement est publié :

```text
ADMIN
 ↓
BACKEND
 ↓
ÉVÉNEMENT PUBLIC
 ↓
CALENDRIER
 ↓
NOTIFICATION
```

L'événement doit automatiquement apparaître dans les endroits appropriés du frontend.

---

# 10. CALENDRIER

Le site doit posséder un calendrier permettant d'afficher les événements et dates importantes.

Exemples :

* rentrée scolaire ;
* examens ;
* réunions ;
* journées culturelles ;
* cérémonies ;
* vacances ;
* inscriptions ;
* autres événements scolaires.

Les événements doivent être récupérés automatiquement depuis le backend.

Il ne doit pas être nécessaire de saisir deux fois un même événement.

---

# 11. GALERIE PHOTO

L'administration peut créer des albums.

Exemple :

```text
Galerie
 ├── Rentrée scolaire
 ├── Journée culturelle
 ├── Activités sportives
 └── Cérémonies
```

Chaque album peut contenir plusieurs images.

L'administrateur peut :

* créer un album ;
* modifier un album ;
* supprimer un album ;
* ajouter des photos ;
* supprimer des photos ;
* modifier l'ordre si nécessaire.

Les images sont stockées dans le système de stockage prévu par le backend.

---

# 12. DOCUMENTS

L'école peut publier différents documents.

Exemples :

* règlement intérieur ;
* calendrier scolaire ;
* communiqués ;
* informations administratives ;
* formulaires ;
* documents pédagogiques.

Chaque document doit posséder au minimum :

* titre ;
* description facultative ;
* fichier ;
* catégorie ;
* date ;
* statut de visibilité.

Les documents publics sont accessibles aux visiteurs.

Les documents privés nécessitent une authentification.

---

# 13. SYSTÈME DE RÉSULTATS — V1

La V1 doit volontairement rester simple.

L'école ne saisit pas manuellement toutes les notes dans la plateforme.

Elle peut utiliser les fichiers qu'elle possède déjà.

Formats envisagés :

```text
PDF
XLSX
XLS
```

L'administrateur peut :

1. sélectionner l'année scolaire ;
2. sélectionner le niveau ;
3. sélectionner la classe ;
4. sélectionner le type de résultat ;
5. sélectionner le fichier ;
6. publier le résultat.

Exemple :

```text
Année : 2025-2026
Niveau : Terminale
Classe : Terminale D
Type : Résultats annuels
Fichier : resultats-terminale-d.xlsx
Statut : Publié
```

---

# 14. CONSULTATION DES RÉSULTATS

Un visiteur non connecté ne doit pas pouvoir consulter les résultats privés.

Un utilisateur connecté peut accéder à :

```text
Espace utilisateur
       ↓
Résultats
       ↓
Sélection de la classe
       ↓
Résultat disponible
       ↓
Viewer PDF/Excel
```

Dans la V1, l'utilisateur consulte le fichier de résultats de la classe.

Il peut utiliser la fonction de recherche du viewer pour rechercher le nom de l'élève.

La V1 ne doit pas encore :

* calculer les moyennes ;
* calculer automatiquement les rangs ;
* interpréter les notes ;
* générer des bulletins individuels ;
* afficher automatiquement uniquement les résultats d'un élève.

Ces fonctionnalités pourront être étudiées pour la V2.

---

# 15. SÉCURITÉ DES RÉSULTATS

Les fichiers de résultats doivent être stockés dans un espace privé.

Ils ne doivent pas être hébergés dans un stockage public accessible à n'importe qui connaissant l'URL.

Le backend doit vérifier l'autorisation avant de donner accès au fichier.

Architecture :

```text
Utilisateur
    ↓
Authentification
    ↓
Backend
    ↓
Vérification permission
    ↓
Résultat autorisé
    ↓
Accès temporaire / sécurisé au fichier
```

---

# 16. AUTHENTIFICATION UTILISATEUR

L'inscription utilisateur doit demander :

* prénom ;
* nom ;
* adresse e-mail ;
* mot de passe ;
* confirmation du mot de passe ;
* protection anti-bot/CAPTCHA si nécessaire.

Le mot de passe ne doit jamais être stocké directement dans la base de données de l'application.

L'authentification doit être confiée au système d'authentification prévu par Supabase ou une solution équivalente.

---

# 17. VÉRIFICATION DE L'EMAIL

Après inscription, l'utilisateur doit recevoir un email de vérification.

Tant que l'adresse n'est pas vérifiée, certaines fonctionnalités peuvent rester bloquées selon les règles choisies.

---

# 18. CONNEXION

L'utilisateur peut se connecter avec :

* email ;
* mot de passe.

Fonctionnalités supplémentaires :

* mot de passe oublié ;
* réinitialisation du mot de passe ;
* déconnexion ;
* gestion de session ;
* expiration/renouvellement de session selon le système d'authentification.

---

# 19. AUTHENTIFICATION ADMIN

L'administration possède sa propre interface.

Connexion :

```text
Identifiant / Email
Mot de passe
Protection anti-bot
Connexion
```

Aucune inscription admin publique.

Le backend doit vérifier que le compte possède réellement le rôle :

```text
admin
```

Un utilisateur normal ne doit jamais pouvoir obtenir les permissions administrateur simplement en modifiant le frontend.

---

# 20. PROFIL UTILISATEUR

L'utilisateur doit pouvoir consulter son profil.

Informations possibles :

* prénom ;
* nom ;
* email ;
* date de création du compte ;
* préférences de notifications.

Certaines informations sensibles ne doivent pas être modifiables directement sans vérification supplémentaire.

---

# 21. SYSTÈME DE NOTIFICATIONS

La V1 doit intégrer un véritable système de notifications.

L'objectif est d'informer automatiquement les utilisateurs lorsqu'une nouvelle information importante est disponible.

Les notifications peuvent concerner :

* actualités ;
* événements ;
* résultats ;
* documents ;
* dates importantes ;
* rappels ;
* informations générales du système.

---

# 22. NOTIFICATIONS AUTOMATIQUES

L'administrateur ne doit pas créer manuellement une notification après chaque publication.

Exemple :

```text
ADMIN
 ↓
Publie une actualité
 ↓
BACKEND
 ↓
Enregistre l'actualité
 ↓
Crée automatiquement la notification
 ↓
Utilisateur
 ↓
🔔 Nouvelle actualité
```

Même principe pour :

```text
Actualité
Événement
Résultat
Document
Date importante
```

---

# 23. NOTIFICATIONS PUBLIC / PRIVÉ

Le système doit respecter la confidentialité.

## Actualité publique

Une actualité publique peut générer une notification pour les utilisateurs concernés.

## Événement public

Un événement public peut générer une notification.

## Résultat privé

Un résultat doit générer une notification uniquement dans l'espace utilisateur.

Il ne doit pas être exposé dans les notifications publiques.

Exemple :

```text
Notification :

Nouveau résultat disponible

Terminale D — Année 2025-2026

[Voir les résultats]
```

Le bouton redirige vers l'espace privé.

---

# 24. CENTRE DE NOTIFICATIONS

L'espace utilisateur doit comporter une icône de notification.

Exemple :

```text
🔔 3
```

Le nombre représente les notifications non lues.

En cliquant dessus :

```text
NOTIFICATIONS

● Nouveau résultat
  Terminale D — 2025-2026
  Il y a 10 minutes

● Nouvelle actualité
  Informations concernant la rentrée
  Il y a 2 heures

○ Nouvel événement
  Journée culturelle
  Hier
```

Fonctionnalités :

* afficher les notifications ;
* ouvrir une notification ;
* marquer une notification comme lue ;
* marquer toutes les notifications comme lues ;
* afficher le nombre de notifications non lues.

---

# 25. TEMPS RÉEL

Lorsque cela est techniquement possible, les notifications et les nouveaux contenus doivent pouvoir être synchronisés en temps réel.

L'objectif est d'éviter que l'utilisateur soit obligé de recharger manuellement toute la page.

Architecture :

```text
ADMIN
 ↓
DATABASE
 ↓
REALTIME
 ├── FRONTEND PUBLIC
 └── ESPACE UTILISATEUR
```

Le système doit rester fonctionnel même si le temps réel est momentanément indisponible.

Le frontend doit pouvoir actualiser les données normalement.

---

# 26. RAPPELS DE DATES

Le système doit pouvoir gérer des rappels pour les événements importants.

Exemple :

```text
Événement :
Journée culturelle
15 octobre 2026
```

Le système peut générer :

```text
Publication :
Nouvel événement disponible

Quelques jours avant :
Rappel — Journée culturelle dans 3 jours

Le jour même :
Journée culturelle aujourd'hui
```

Les délais exacts de rappel doivent être configurables.

---

# 27. PRÉFÉRENCES DE NOTIFICATIONS

Dans les paramètres utilisateur :

```text
Notifications

Actualités              [ON/OFF]
Événements              [ON/OFF]
Résultats               [ON/OFF]
Documents               [ON/OFF]
Rappels calendrier      [ON/OFF]
Notifications système   [ON/OFF]
```

Le backend doit respecter ces préférences.

---

# 28. ADMINISTRATION — DASHBOARD

Le frontend admin possède un tableau de bord.

Il peut afficher :

* nombre d'actualités ;
* nombre d'événements ;
* nombre de documents ;
* nombre de résultats ;
* nombre d'utilisateurs ;
* dernières publications ;
* activités récentes.

Le dashboard doit rester simple et utile.

---

# 29. ADMIN — GESTION DES ACTUALITÉS

L'admin peut :

* créer ;
* modifier ;
* supprimer ;
* enregistrer comme brouillon ;
* publier ;
* dépublier ;
* archiver.

Une actualité publiée devient automatiquement disponible sur le frontend public.

---

# 30. ADMIN — GESTION DES ÉVÉNEMENTS

L'admin peut :

* créer ;
* modifier ;
* supprimer ;
* publier ;
* dépublier ;
* définir une date ;
* définir une heure ;
* définir un lieu ;
* créer des rappels.

Une fois publié, l'événement apparaît automatiquement dans les endroits appropriés.

---

# 31. ADMIN — GESTION DES RÉSULTATS

L'admin peut :

* créer un résultat ;
* sélectionner une classe ;
* sélectionner une année ;
* sélectionner un niveau ;
* sélectionner un type de résultat ;
* importer un fichier ;
* remplacer un fichier ;
* publier ;
* dépublier ;
* supprimer.

Lorsqu'un résultat est publié :

```text
DATABASE
 ↓
RESULTAT DISPONIBLE
 ↓
ESPACE UTILISATEUR
 ↓
NOTIFICATION
```

---

# 32. ADMIN — GESTION DES DOCUMENTS

L'admin peut :

* ajouter ;
* modifier ;
* supprimer ;
* publier ;
* dépublier ;
* définir le niveau de visibilité ;
* remplacer le fichier.

---

# 33. ADMIN — GESTION DE LA GALERIE

L'admin peut :

* créer un album ;
* modifier un album ;
* supprimer un album ;
* ajouter des photos ;
* supprimer des photos ;
* gérer les informations des albums.

---

# 34. ADMIN — GESTION DES CLASSES

Le système doit permettre à l'administration de définir les classes disponibles.

Exemples :

```text
Seconde A
Seconde C
Première D
Terminale D
Terminale C
```

Une classe peut être associée à :

* un niveau ;
* une série ;
* une année scolaire ;
* un statut actif/inactif.

---

# 35. BASE DE DONNÉES

La structure V1 peut contenir les tables principales suivantes :

```text
profiles
news
events
gallery_albums
gallery_images
documents
classes
results
notifications
notification_preferences
school_settings
```

---

# 36. TABLE PROFILES

Champs principaux :

```text
id
first_name
last_name
email
role
created_at
updated_at
```

Valeurs possibles pour `role` :

```text
user
admin
```

Le rôle ne doit jamais être déterminé uniquement par le frontend.

---

# 37. TABLE NEWS

Exemple :

```text
id
title
slug
content
image_url / image_path
status
published_at
created_at
updated_at
created_by
```

---

# 38. TABLE EVENTS

Exemple :

```text
id
title
description
image_path
location
start_at
end_at
status
created_at
updated_at
created_by
```

---

# 39. TABLE CLASSES

Exemple :

```text
id
name
level
series
academic_year
is_active
created_at
```

---

# 40. TABLE RESULTS

Exemple :

```text
id
class_id
academic_year
result_type
file_path
status
published_at
created_at
updated_at
created_by
```

---

# 41. TABLE NOTIFICATIONS

Exemple :

```text
id
user_id
type
title
message
target_type
target_id
is_read
created_at
```

`target_type` permet de savoir vers quelle ressource la notification doit rediriger.

Exemple :

```text
news
event
result
document
calendar
```

---

# 42. TABLE NOTIFICATION_PREFERENCES

Exemple :

```text
id
user_id
news_enabled
events_enabled
results_enabled
documents_enabled
calendar_enabled
system_enabled
updated_at
```

---

# 43. STOCKAGE DES FICHIERS

Le système de stockage doit séparer les fichiers publics et privés.

Exemple :

```text
PUBLIC
├── news
├── gallery
└── public-documents

PRIVATE
└── results
```

Les résultats scolaires doivent rester dans un espace privé.

---

# 44. RÈGLES DE SÉCURITÉ

La sécurité doit être appliquée côté backend/database.

Le frontend ne doit jamais être considéré comme une frontière de sécurité.

Les règles principales :

### Public

Peut lire uniquement les données publiques.

### Utilisateur connecté

Peut accéder aux données publiques et aux ressources privées autorisées.

### Administrateur

Peut gérer les ressources administratives.

---

# 45. ROW LEVEL SECURITY

Les tables sensibles doivent utiliser des politiques RLS.

Exemple conceptuel :

```text
NEWS
Visiteur       → lecture des contenus publiés
Utilisateur   → lecture des contenus publiés
Admin         → CRUD

RESULTS
Visiteur       → aucun accès
Utilisateur   → lecture autorisée
Admin         → CRUD

NOTIFICATIONS
Utilisateur   → uniquement ses notifications
Admin         → selon les besoins système
```

---

# 46. API / CONTRAT FRONTEND-BACKEND

Le frontend et le backend doivent définir leurs contrats avant l'intégration.

Exemples :

```text
GET    /news
GET    /events
GET    /gallery
GET    /documents
GET    /classes
GET    /results/:classId

GET    /notifications
PATCH  /notifications/:id/read
PATCH  /notifications/read-all
GET    /notification-preferences
PATCH  /notification-preferences
```

Administration :

```text
POST    /admin/news
PUT     /admin/news/:id
DELETE  /admin/news/:id

POST    /admin/events
PUT     /admin/events/:id
DELETE  /admin/events/:id

POST    /admin/results
PUT     /admin/results/:id
DELETE  /admin/results/:id

POST    /admin/documents
PUT     /admin/documents/:id
DELETE  /admin/documents/:id
```

Les noms exacts des routes peuvent être adaptés à l'architecture finale.

---

# 47. RÉACTIVITÉ DES DONNÉES

Lorsqu'un administrateur modifie une donnée :

```text
ADMIN
 ↓
BACKEND
 ↓
DATABASE
 ↓
FRONTEND
```

Le frontend doit récupérer la nouvelle version des données.

Il ne doit pas contenir de données codées en dur pour les contenus administrables.

---

# 48. GESTION DES ERREURS

Le système doit gérer proprement :

* absence de connexion ;
* erreur serveur ;
* fichier inexistant ;
* fichier supprimé ;
* utilisateur non autorisé ;
* session expirée ;
* erreur d'upload ;
* erreur de publication ;
* erreur de notification ;
* problème de connexion temps réel.

L'utilisateur doit recevoir un message compréhensible.

---

# 49. RESPONSIVE DESIGN

Le site doit fonctionner correctement sur :

* ordinateur ;
* tablette ;
* smartphone.

Une attention particulière doit être accordée aux smartphones Android d'entrée et de milieu de gamme.

L'interface doit rester légère.

---

# 50. PERFORMANCE

Objectifs :

* chargement rapide ;
* images optimisées ;
* pagination lorsque nécessaire ;
* lazy loading des images ;
* requêtes backend limitées ;
* cache lorsque pertinent ;
* éviter de charger toutes les données inutilement.

Le site doit rester utilisable avec une connexion Internet relativement lente.

---

# 51. INTERFACE PUBLIQUE

Navigation envisagée :

```text
Accueil
L'école
Formations
Actualités
Événements
Galerie
Documents
Calendrier
Contact
Connexion
```

L'accès aux résultats se fait après connexion.

---

# 52. ESPACE UTILISATEUR

Navigation envisagée :

```text
Tableau de bord
Résultats
Notifications
Calendrier
Profil
Paramètres
Déconnexion
```

Le tableau de bord doit afficher les informations pertinentes pour l'utilisateur.

---

# 53. APPLICATION ADMIN

Navigation envisagée :

```text
Dashboard
Actualités
Événements
Résultats
Documents
Galerie
Classes
Paramètres
Déconnexion
```

L'administration doit rester séparée du site public.

---

# 54. AUTOMATISATION DE PUBLICATION

Chaque contenu doit avoir un cycle de publication.

Exemple :

```text
BROUILLON
   ↓
ADMIN PUBLIE
   ↓
BACKEND
   ↓
DATABASE
   ↓
CONTENU PUBLIC/PRIVÉ
   ↓
NOTIFICATION SI NÉCESSAIRE
```

Le contenu doit apparaître automatiquement dans toutes les interfaces concernées.

---

# 55. EXEMPLE COMPLET — ACTUALITÉ

L'admin crée :

```text
Titre :
Réunion des parents

Date :
20 octobre 2026

Contenu :
...
```

Puis clique sur :

```text
PUBLIER
```

Résultat :

```text
DATABASE
   ↓
ACTUALITÉ PUBLISHED
   ↓
SITE PUBLIC
   ↓
ACCUEIL
   ↓
PAGE ACTUALITÉS
   ↓
NOTIFICATION UTILISATEURS
```

L'admin n'a rien d'autre à faire.

---

# 56. EXEMPLE COMPLET — RÉSULTAT

L'admin sélectionne :

```text
Année : 2025-2026
Niveau : Terminale
Classe : Terminale D
Type : Résultats annuels
Fichier : terminale-d.xlsx
```

Puis :

```text
PUBLIER
```

Résultat :

```text
STORAGE PRIVÉ
       ↓
DATABASE
       ↓
RESULTAT PUBLISHED
       ↓
ESPACE UTILISATEUR
       ↓
NOTIFICATION
```

Le résultat n'apparaît jamais dans le contenu public.

---

# 57. EXEMPLE COMPLET — ÉVÉNEMENT

Admin :

```text
Titre :
Journée culturelle

Date :
15 octobre 2026

Lieu :
Établissement

Heure :
09:00
```

Après publication :

```text
Événement
   ↓
Page événements
   ↓
Calendrier
   ↓
Accueil / prochains événements
   ↓
Notification
   ↓
Rappel automatique
```

---

# 58. V1 — CE QUI EST VOLONTAIREMENT EXCLU

Pour garder le projet réalisable, les fonctionnalités suivantes ne sont pas prioritaires en V1 :

* multi-écoles ;
* paiement des frais scolaires ;
* Flooz ;
* TMoney ;
* gestion complète des notes individuelles ;
* bulletins automatiques ;
* calcul automatique des moyennes ;
* classement automatique ;
* identifiant étudiant avancé ;
* liaison parent/enfant ;
* messagerie interne complexe ;
* application mobile native ;
* abonnement ;
* marketplace ;
* système financier scolaire complet.

---

# 59. V2 POSSIBLE

Si l'école accepte la V1 et souhaite continuer le projet, une V2 pourra ajouter :

### Résultats individuels

L'utilisateur renseigne :

```text
Nom complet
Classe
Niveau / série
Année scolaire
Identifiant étudiant
```

Le système affiche uniquement ses résultats.

### Paiements

Possibilité d'étudier :

```text
Frais scolaires
Flooz
TMoney
Paiement en ligne
Historique des paiements
Reçus
```

### Identité scolaire

Possibilité d'ajouter :

* ID étudiant ;
* carte scolaire numérique ;
* QR code ;
* profil étudiant.

### Parents

Possibilité de créer :

```text
Parent
 ↓
Enfant(s)
 ↓
Résultats
 ↓
Informations scolaires
```

---

# 60. V3 POSSIBLE

Une évolution future pourrait transformer le projet en plateforme plus complète :

* application mobile ;
* notifications push ;
* messagerie ;
* devoirs ;
* emploi du temps ;
* absences ;
* notes individuelles ;
* bulletins numériques ;
* paiement intégré ;
* espace enseignants ;
* espace parents ;
* statistiques ;
* plusieurs établissements.

Le système multi-écoles n'est volontairement pas prévu dans la V1.

---

# 61. ORGANISATION DE L'ÉQUIPE

Le projet est réalisé en équipe.

## Responsable backend

Responsabilités :

* architecture backend ;
* base de données ;
* Supabase ;
* authentification ;
* RLS ;
* Storage ;
* API ;
* notifications ;
* logique métier ;
* sécurité ;
* intégration frontend/backend ;
* tests backend.

## Équipe frontend/design

Responsabilités :

* UI/UX ;
* design ;
* responsive ;
* composants ;
* pages publiques ;
* espace utilisateur ;
* intégration avec les API ;
* affichage des données ;
* gestion des états frontend.

## Règle importante

Le frontend ne doit pas contenir de logique secrète.

Aucune clé secrète backend ne doit être intégrée au frontend.

---

# 62. ORGANISATION DU CODE

Structure possible :

```text
site-scolaire/
│
├── frontend/
│   └── site public + espace utilisateur
│
├── admin-frontend/
│   └── interface administration
│
├── backend/
│   ├── API
│   ├── services
│   ├── auth
│   ├── notifications
│   └── logique métier
│
├── supabase/
│   ├── migrations
│   ├── policies
│   └── functions
│
├── docs/
│   ├── cahier-des-charges.md
│   ├── api-contract.md
│   └── database.md
│
└── README.md
```

Cette structure peut être adaptée selon les technologies retenues.

---

# 63. ENVIRONNEMENT DE DÉVELOPPEMENT

La V1 doit pouvoir être développée avec des outils gratuits.

Le projet doit éviter les dépendances payantes obligatoires.

Les secrets doivent être placés dans des variables d'environnement.

Exemple :

```text
.env
.env.local
```

Les fichiers contenant des secrets ne doivent jamais être envoyés dans Git.

---

# 64. GESTION DES SECRETS

Ne jamais mettre dans le frontend :

```text
SUPABASE_SERVICE_ROLE_KEY
```

ou toute autre clé secrète.

Le frontend ne doit utiliser que les clés destinées à être exposées publiquement selon l'architecture choisie.

Les opérations sensibles doivent être effectuées côté backend.

---

# 65. TESTS

Le projet doit être testé progressivement.

Tests minimum :

### Authentification

* inscription ;
* vérification email ;
* connexion ;
* déconnexion ;
* mot de passe oublié ;
* session expirée.

### Autorisation

* visiteur → résultats refusés ;
* utilisateur → accès autorisé ;
* utilisateur → impossible d'accéder à l'administration ;
* admin → accès admin ;
* utilisateur → impossible de modifier les données admin.

### Publication

* brouillon non visible ;
* publication visible ;
* dépublication invisible.

### Résultats

* upload ;
* publication ;
* accès utilisateur ;
* refus visiteur ;
* suppression ;
* remplacement de fichier.

### Notifications

* création automatique ;
* notification non lue ;
* lecture ;
* marquer tout comme lu ;
* préférences ;
* notification liée à la bonne ressource.

### Temps réel

* nouvelle actualité ;
* nouvel événement ;
* nouvelle notification.

---

# 66. CRITÈRES D'ACCEPTATION V1

La V1 sera considérée comme fonctionnelle lorsque :

* le site public fonctionne ;
* l'espace utilisateur fonctionne ;
* l'administration fonctionne séparément ;
* l'inscription fonctionne ;
* la connexion fonctionne ;
* la vérification email fonctionne ;
* l'administrateur peut publier une actualité ;
* l'actualité apparaît automatiquement sur le site ;
* l'administrateur peut publier un événement ;
* l'événement apparaît automatiquement dans le calendrier ;
* l'administrateur peut publier un résultat ;
* le résultat apparaît dans l'espace utilisateur ;
* le résultat reste inaccessible aux visiteurs ;
* les fichiers privés sont protégés ;
* les notifications sont générées automatiquement ;
* les utilisateurs peuvent lire leurs notifications ;
* les utilisateurs peuvent gérer leurs préférences ;
* les rappels peuvent être générés pour les événements ;
* les RLS sont configurées ;
* les clés secrètes ne sont pas exposées ;
* l'application fonctionne sur smartphone et ordinateur.

---

# 67. OBJECTIF FINAL

Le but de cette V1 n'est pas seulement de créer une maquette.

Le projet doit être une **véritable plateforme fonctionnelle**, suffisamment propre pour être présentée à une école réelle.

Le projet doit démontrer les compétences de l'équipe dans :

* développement frontend ;
* développement backend ;
* bases de données ;
* authentification ;
* sécurité ;
* stockage de fichiers ;
* API ;
* temps réel ;
* notifications ;
* gestion de contenu ;
* responsive design ;
* travail en équipe ;
* architecture logicielle ;
* déploiement.

La plateforme doit être conçue comme un véritable projet professionnel, tout en conservant une portée réaliste pour une première version développée sans budget.

---

# 68. RÈGLE D'OR DU PROJET

Chaque fonctionnalité doit suivre autant que possible cette logique :

```text
ADMIN EFFECTUE UNE ACTION
          ↓
BACKEND TRAITE L'ACTION
          ↓
DATABASE / STORAGE
          ↓
LES BONNES INTERFACES SONT MISES À JOUR
          ↓
NOTIFICATION SI NÉCESSAIRE
          ↓
L'UTILISATEUR EST INFORMÉ
```

L'objectif est d'éviter les doubles saisies et les opérations manuelles inutiles.

Exemple final :

```text
ADMIN PUBLIE UN RÉSULTAT
        │
        ▼
STORAGE PRIVÉ
        │
        ▼
DATABASE
        │
        ├──────────────► ESPACE RÉSULTATS
        │
        └──────────────► NOTIFICATION
                              │
                              ▼
                         UTILISATEUR
```

Cette architecture constitue la base de la **V1 du Site Scolaire** et doit permettre une évolution progressive vers une plateforme scolaire plus complète en V2 et V3.
