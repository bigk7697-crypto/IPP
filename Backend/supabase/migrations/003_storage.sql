-- 003_storage.sql — buckets public / privé + policies
-- À exécuter après 001-002. Les résultats restent en PRIVÉ + signed URL backend.

-- Buckets
insert into storage.buckets (id, name, public)
values ('public-assets', 'public-assets', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('private-results', 'private-results', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('private-documents', 'private-documents', false)
on conflict (id) do nothing;

-- ---------- PUBLIC-ASSETS : lecture publique, écriture admin ----------
drop policy if exists pub_assets_read on storage.objects;
create policy pub_assets_read on storage.objects for select
  using (bucket_id = 'public-assets');

drop policy if exists pub_assets_admin_write on storage.objects;
create policy pub_assets_admin_write on storage.objects for insert
  with check (bucket_id = 'public-assets' and public.is_admin());

drop policy if exists pub_assets_admin_update on storage.objects;
create policy pub_assets_admin_update on storage.objects for update
  using (bucket_id = 'public-assets' and public.is_admin());

drop policy if exists pub_assets_admin_delete on storage.objects;
create policy pub_assets_admin_delete on storage.objects for delete
  using (bucket_id = 'public-assets' and public.is_admin());

-- ---------- PRIVATE-RESULTS : lecture authentifiée (le backend génère des signed URLs), écriture admin ----------
drop policy if exists priv_results_read on storage.objects;
create policy priv_results_read on storage.objects for select
  using (bucket_id = 'private-results' and auth.role() = 'authenticated');

drop policy if exists priv_results_admin on storage.objects;
create policy priv_results_admin on storage.objects for all
  using (bucket_id = 'private-results' and public.is_admin())
  with check (bucket_id = 'private-results' and public.is_admin());

-- ---------- PRIVATE-DOCUMENTS : idem ----------
drop policy if exists priv_docs_read on storage.objects;
create policy priv_docs_read on storage.objects for select
  using (bucket_id = 'private-documents' and auth.role() = 'authenticated');

drop policy if exists priv_docs_admin on storage.objects;
create policy priv_docs_admin on storage.objects for all
  using (bucket_id = 'private-documents' and public.is_admin())
  with check (bucket_id = 'private-documents' and public.is_admin());

-- NOTE SÉCU : en prod, l'accès résultats doit passer par GET /api/results/:classId
-- qui vérifie l'auth puis génère createSignedUrl() via SERVICE_ROLE (voir src/routes/results.ts).
-- Ne jamais exposer d'URL publique permanente vers private-results.
