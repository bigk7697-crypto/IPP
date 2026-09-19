# 08 — Tests

## Fonctionnels
- Auth : inscription, vérif email, login, logout, reset, session expirée.
- Publication : draft invisible, published visible, dépublié invisible.
- Results : upload, publish, accès user OK, visiteur refusé, remplacement, suppression.
- Notifs : création auto, non-lue → lue, read-all, préférences ON/OFF, bon `target`.

## Tests de sécu (doivent échouer proprement en 401/403)
- `user → route admin` refusé
- `userA → notifs userB` refusé
- `visiteur → result privé` refusé
- `user → modif role` refusé
- `user → fichier privé non autorisé` refusé

## Autres
- Storage : upload/accès/suppression/permissions.
- Realtime : nouvelle news/event/notif reçue sans reload.
