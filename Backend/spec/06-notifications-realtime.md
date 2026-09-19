# 06 — Notifications + Realtime + Rappels

## Principe
Admin publie → trigger/logique serveur → notif auto. Jamais de création manuelle.
Notif seulement si `status` passe réellement à `published`. Si échec DB/Storage → pas de notif.

## Contenu
- News : `Nouvelle actualité [Titre] → Lire`
- Event : `Nouvel événement [Titre + date] → Voir`
- Result : `Nouveau résultat [Classe + année] → Voir (privé, espace user uniquement)`

## Ciblage
V1 : broadcast à tous les users authentifiés (en respectant `notification_preferences`).
V2 : ciblage par classe/niveau/élève.

## Centre de notifs
`🔔 N` non lues, liste, marquer 1 / tout comme lu, `target_type/target_id` pour redirection.

## Realtime
Sur news/events/notifications. Toujours prévoir fallback fetch classique si Realtime down.

## Rappels events
Ex : J-3 + Jour-J, délais configurables, via Edge Function / cron / tâche serveur.
