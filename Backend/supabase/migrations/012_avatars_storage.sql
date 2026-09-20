-- 012_avatars_storage.sql — allow authenticated users to manage their avatars in public-assets/avatars/
-- The avatars are stored as public-assets/avatars/{user.id}.{ext}

-- Authenticated users can upload avatars
drop policy if exists pub_assets_avatar_insert on storage.objects;
create policy pub_assets_avatar_insert on storage.objects for insert
  with check (
    bucket_id = 'public-assets'
    and (storage.foldername(name))[1] = 'avatars'
    and auth.role() = 'authenticated'
  );

drop policy if exists pub_assets_avatar_update on storage.objects;
create policy pub_assets_avatar_update on storage.objects for update
  using (
    bucket_id = 'public-assets'
    and (storage.foldername(name))[1] = 'avatars'
    and auth.role() = 'authenticated'
  )
  with check (
    bucket_id = 'public-assets'
    and (storage.foldername(name))[1] = 'avatars'
  );

drop policy if exists pub_assets_avatar_delete on storage.objects;
create policy pub_assets_avatar_delete on storage.objects for delete
  using (
    bucket_id = 'public-assets'
    and (storage.foldername(name))[1] = 'avatars'
    and auth.role() = 'authenticated'
  );
