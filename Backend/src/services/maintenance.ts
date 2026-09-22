import { getAnonClient, getServiceClient } from '../config/supabase.js';
import { removeFile } from './storage.js';

// Inactivité : 60 jours sans connexion => suppression automatique.
// Les admins ne sont JAMAIS supprimés automatiquement.
export const INACTIVE_DAYS = 60;
const MAX_PAGES = 10;
const PER_PAGE = 50;
const MAX_DELETIONS = 100;

export function isInactive(
  lastSignInAt: string | null | undefined,
  createdAt: string,
  nowMs: number = Date.now()
): boolean {
  const cutoff = nowMs - INACTIVE_DAYS * 24 * 3600 * 1000;
  if (lastSignInAt) return new Date(lastSignInAt).getTime() < cutoff;
  // Jamais connecté : on compte depuis la création.
  return new Date(createdAt).getTime() < cutoff;
}

export interface PurgeResult {
  checked: number;
  deleted: number;
  skippedAdmins: number;
  errors: string[];
}

/** Supprime les comptes inactifs depuis 60+ jours (hors admins). */
export async function purgeInactiveUsers(): Promise<PurgeResult> {
  const svc = getServiceClient();
  const result: PurgeResult = { checked: 0, deleted: 0, skippedAdmins: 0, errors: [] };

  const { data: adminProfiles } = await svc.from('profiles').select('id').eq('role', 'admin');
  const adminIds = new Set((adminProfiles || []).map((p: any) => p.id));

  let page = 1;
  for (;;) {
    if (page > MAX_PAGES || result.deleted >= MAX_DELETIONS) break;
    const { data, error } = await svc.auth.admin.listUsers({ page, perPage: PER_PAGE });
    if (error) {
      result.errors.push(`listUsers p${page}: ${error.message}`.slice(0, 200));
      break;
    }
    const users = data?.users || [];
    if (users.length === 0) break;
    for (const u of users) {
      if (result.deleted >= MAX_DELETIONS) break;
      result.checked += 1;
      if (adminIds.has(u.id)) {
        result.skippedAdmins += 1;
        continue;
      }
      if (!isInactive(u.last_sign_in_at ?? null, u.created_at)) continue;
      const { error: delErr } = await svc.auth.admin.deleteUser(u.id);
      if (delErr) {
        if (result.errors.length < 5) result.errors.push(`${u.id.slice(0, 8)}: ${delErr.message}`.slice(0, 200));
      } else {
        result.deleted += 1;
      }
    }
    if (users.length < PER_PAGE) break;
    page += 1;
  }
  return result;
}

/** Suppression définitive du PROPRE compte (droit à l'oubli). */
export async function deleteOwnAccount(userId: string, password: string): Promise<void> {
  if (!password) {
    const e: any = new Error('Mot de passe incorrect.');
    e.status = 403;
    throw e;
  }
  const svc = getServiceClient();

  // 1) Vérifie le mot de passe (l'utilisateur prouve que c'est bien lui).
  const { data: target, error: getErr } = await svc.auth.admin.getUserById(userId);
  if (getErr || !target?.user?.email) throw new Error('Compte introuvable.');
  const anon = getAnonClient();
  const { error: signErr } = await anon.auth.signInWithPassword({
    email: target.user.email,
    password,
  });
  if (signErr) {
    const e: any = new Error('Mot de passe incorrect.');
    e.status = 403;
    throw e;
  }

  // 2) Fichiers des dossiers de pré-inscription + lignes (droit à l'oubli total).
  const { data: apps } = await svc.from('inscription_applications').select('id').eq('user_id', userId);
  for (const app of apps || []) {
    const { data: docs } = await svc.from('inscription_documents').select('file_path').eq('application_id', app.id);
    for (const d of docs || []) {
      await removeFile(d.file_path).catch(() => {});
    }
    await svc.from('inscription_applications').delete().eq('id', app.id);
  }

  // 3) Données liées (défensif : certaines cascades DB existent déjà).
  await svc.from('push_subscriptions').delete().eq('user_id', userId);
  await svc.from('notifications').delete().eq('user_id', userId);
  await svc.from('notification_preferences').delete().eq('user_id', userId);

  // 4) Avatar éventuel (public-assets/avatars/<id>.*).
  try {
    const { data: files } = await svc.storage.from('public-assets').list('avatars', { limit: 100 });
    const mine = (files || []).filter((f: any) => f.name.startsWith(`${userId}.`)).map((f: any) => `avatars/${f.name}`);
    if (mine.length > 0) await svc.storage.from('public-assets').remove(mine);
  } catch {
    // non bloquant
  }

  // 5) Compte Auth (+ profil en cascade).
  const { error: delErr } = await svc.auth.admin.deleteUser(userId);
  if (delErr) throw delErr;
}
