-- 008_fix_private_storage.sql — sécurise buckets privés (CRITIQUE)
-- private-results et private-documents ne doivent JAMAIS être lisibles via Storage API direct
-- Seul le backend (SERVICE_ROLE) génère des signed URLs (src/routes/results.ts:30, documents.ts:69)

-- Supprime les policies permissives qui autorisaient tout `authenticated` à lire
drop policy if exists "priv_results_read" on storage.objects;
drop policy if exists "priv_docs_read" on storage.objects;

-- Recrée : lecture directe interdite pour les anonymes/authentifiés
-- Seul is_admin() peut lire directement (debug), les users passent par /api/results/:classId → signedUrl
create policy "priv_results_read" on storage.objects for select
  using (bucket_id = 'private-results' and public.is_admin());

create policy "priv_docs_read" on storage.objects for select
  using (bucket_id = 'private-documents' and public.is_admin());

-- Les policies d'écriture admin restent (priv_results_admin, priv_docs_admin déjà en place depuis 003)
-- Aucune autre lecture n'est autorisée → un `authenticated` qui tente `storage.from('private-results').download()` reçoit 403
