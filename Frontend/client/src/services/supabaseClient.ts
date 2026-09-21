import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Erreur critique : VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont obligatoires en production.');
}

// Une session Supabase corrompue en localStorage (access_token non-ASCII)
// fait échouer le refresh auto au démarrage : supabase envoie
// `Authorization: Bearer <token>` → fetch() lève
// "String contains non ISO-8859-1 code point" (AuthRetryableFetchError).
// Les vrais tokens (JWT access + refresh base64url) sont strictement ASCII :
// tout le reste est purgé sans risque au démarrage.
const ASCII_TOKEN_RE = /^[A-Za-z0-9\-_.]+$/;

function purgeCorruptSupabaseSessions() {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('sb-') || !key.endsWith('-auth-token')) continue;
      let ok = false;
      try {
        const sess = JSON.parse(localStorage.getItem(key) || '');
        const at = sess?.access_token ?? sess?.currentSession?.access_token;
        const rt = sess?.refresh_token ?? sess?.currentSession?.refresh_token;
        ok =
          typeof at === 'string' && ASCII_TOKEN_RE.test(at) &&
          typeof rt === 'string' && ASCII_TOKEN_RE.test(rt);
      } catch {
        ok = false;
      }
      if (!ok) localStorage.removeItem(key);
    }
  } catch {
    // Stockage indisponible : supabase fonctionnera sans persistance.
  }
}

purgeCorruptSupabaseSessions();

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
