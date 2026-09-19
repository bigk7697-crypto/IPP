# 05 — Storage

## Buckets
```
public-assets (news, gallery, documents publics)
private-results (résultats PDF/XLSX/XLS)
private-documents (documents confidentiels)
```

## Règles
- Résultats JAMAIS en public. Accès via backend → vérif permission → URL signée temporaire → viewer.
- Validation upload : MIME, extension, taille limite, renommage UUID :
  `results/2025-2026/terminale-d/uuid.pdf`
- Suppression DB + Storage atomique, pas de fichiers orphelins.
- Remplacement de fichier : supprimer l'ancien après succès du nouveau.
