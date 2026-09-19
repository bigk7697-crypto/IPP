import { getServiceClient } from '../config/supabase.js';
import { splitBucketPath } from '../utils/files.js';

export async function uploadBuffer(fullPath: string, buffer: Buffer, mime: string) {
  const { bucket, path } = splitBucketPath(fullPath);
  const svc = getServiceClient();
  const { error } = await svc.storage.from(bucket).upload(path, buffer, {
    contentType: mime,
    upsert: false,
  });
  if (error) throw error;
  return fullPath;
}

export async function removeFile(fullPath: string) {
  const { bucket, path } = splitBucketPath(fullPath);
  const svc = getServiceClient();
  await svc.storage.from(bucket).remove([path]);
}

export async function signedUrl(fullPath: string, expiresIn = 3600) {
  const { bucket, path } = splitBucketPath(fullPath);
  const svc = getServiceClient();
  const { data, error } = await svc.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}
