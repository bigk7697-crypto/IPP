import webpush from 'web-push';
import { env } from '../config/env.js';
import { getServiceClient } from '../config/supabase.js';

let configured = false;
function ensureConfigured() {
  if (configured) return true;
  const pub = process.env.VAPID_PUBLIC_KEY || env.vapidPublicKey;
  const priv = process.env.VAPID_PRIVATE_KEY || env.vapidPrivateKey;
  const subj = process.env.VAPID_SUBJECT || env.vapidSubject || 'mailto:admin@ipp.tg';
  if (!pub || !priv) {
    console.warn('[push] VAPID keys manquantes — push système désactivé');
    return false;
  }
  webpush.setVapidDetails(subj, pub, priv);
  configured = true;
  return true;
}

// Récupère les user_id opt-in pour une catégorie (même règle que fanout_on_publish :
// rôles user+admin + préférence activée, défaut true si pas de ligne).
export async function optedInUserIds(prefCol: string): Promise<string[]> {
  const svc = getServiceClient();
  const { data, error } = await svc.from('profiles').select('id').in('role', ['user', 'admin']);
  if (error || !data) return [];
  const ids = data.map((p: any) => p.id);
  if (!ids.length) return [];
  const { data: prefs } = await svc
    .from('notification_preferences')
    .select(`user_id, ${prefCol}`)
    .in('user_id', ids);
  const off = new Set(
    (prefs ?? []).filter((p: any) => p[prefCol] === false).map((p: any) => p.user_id)
  );
  return ids.filter((id) => !off.has(id));
}

// Envoie un push système aux opt-in, sans jamais bloquer la réponse HTTP.
export function pushOnPublish(
  prefCol: string,
  payload: { title: string; body: string; url?: string; tag?: string }
): void {
  optedInUserIds(prefCol)
    .then((ids) => sendPushToUsers(ids, payload))
    .catch((e) => console.warn('[push] fanout échoué:', e?.message ?? e));
}

export async function sendPushToUsers(
  userIds: string[],
  payload: { title: string; body: string; url?: string; tag?: string }
): Promise<void> {
  if (!userIds.length) return;
  if (!ensureConfigured()) return;
  const svc = getServiceClient();
  const { data: subs, error } = await svc
    .from('push_subscriptions')
    .select('endpoint,p256dh,auth')
    .in('user_id', userIds);
  if (error || !subs?.length) return;

  const body = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url || '/IPP/',
    tag: payload.tag || 'ipp',
    icon: '/IPP/favicon.svg',
    badge: '/IPP/favicon.svg',
    vibrate: [200, 100, 200],
  });

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } } as any, body);
      } catch (e: any) {
        // 410 Gone = abonnement expiré → on le supprime
        if (e?.statusCode === 410 || e?.statusCode === 404) {
          await svc.from('push_subscriptions').delete().eq('endpoint', s.endpoint);
        }
      }
    })
  );
}
