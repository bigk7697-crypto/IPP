-- 021_avatar_owner_only.sql — un utilisateur ne peut écrire que SON avatar.
-- Convention du frontend : public-assets/avatars/<auth.uid()>.<ext>
-- (auth.uid() = hex + tirets : aucun joker LIKE possible dedans)
drop policy if exists pub_assets_avatar_insert on storage.objects;
create policy pub_assets_avatar_insert on storage.objects for insert
  with check (
    bucket_id = 'public-assets'
    and (storage.foldername(name))[1] = 'avatars'
    and name like 'avatars/' || auth.uid() || '.%'
    and auth.role() = 'authenticated'
  );

drop policy if exists pub_assets_avatar_update on storage.objects;
create policy pub_assets_avatar_update on storage.objects for update
  using (
    bucket_id = 'public-assets'
    and (storage.foldername(name))[1] = 'avatars'
    and name like 'avatars/' || auth.uid() || '.%'
    and auth.role() = 'authenticated'
  )
  with check (
    bucket_id = 'public-assets'
    and (storage.foldername(name))[1] = 'avatars'
    and name like 'avatars/' || auth.uid() || '.%'
  );

drop policy if exists pub_assets_avatar_delete on storage.objects;
create policy pub_assets_avatar_delete on storage.objects for delete
  using (
    bucket_id = 'public-assets'
    and (storage.foldername(name))[1] = 'avatars'
    and name like 'avatars/' || auth.uid() || '.%'
    and auth.role() = 'authenticated'
  );
