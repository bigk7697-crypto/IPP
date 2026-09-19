# SPEC BACKEND — Index

Dossier de référence pour ne pas se perdre. Travail **backend uniquement**, frontend fait par une autre équipe.

## Fichiers
- `01-architecture.md` — choix archi, stack, structure dossiers
- `02-database.md` — les 11 tables, champs, statuts
- `03-api-contract.md` — contrat officiel frontend ↔ backend (à geler en premier)
- `04-auth-securite-rls.md` — auth, rôles, RLS, règles par table
- `05-storage.md` — buckets public/privé, nommage, signed URLs
- `06-notifications-realtime.md` — notifs auto, préférences, realtime, rappels
- `07-erreurs-validation.md` — format d'erreur, validation, pagination, CORS
- `08-tests.md` — checklist tests + tests de sécu
- `09-roadmap-phases.md` — phases 1-12, priorités, critères de validation

## Règle
1. On ne code rien sans mettre à jour le spec correspondant.
2. Le frontend ne consomme que ce qui est dans `03-api-contract.md`.
3. Aucun secret (`SERVICE_ROLE_KEY`) dans ce dossier ni dans Git.
