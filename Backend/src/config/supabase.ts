import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

// Client public (RLS respectée) — utilisable pour lectures publiques.
export function getAnonClient(authToken?: string) {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    global: authToken ? { headers: { Authorization: `Bearer ${authToken}` } } : undefined,
  });
}

// Client serveur — SERVICE_ROLE, contourne RLS. JAMAIS exposé au frontend.
// Réservé à : signed URLs résultats, fan-out notifications, tâches admin.
export function getServiceClient() {
  if (!env.supabaseServiceRoleKey) throw new Error('SERVICE_ROLE_KEY manquante');
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey);
}
