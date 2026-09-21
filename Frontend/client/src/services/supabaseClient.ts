import { createClient } from '@supabase/supabase-js';
import { installNetworkSpy } from '../utils/netSpy';

// Espion diagnostic TEMPORAIRE : loggue la valeur exacte de tout header
// non-latin1 + l'écrivain d'une session corrompue (voir console [IPP-DIAG]).
installNetworkSpy();

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Erreur critique : VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont obligatoires en production.');
}

// ---------------------------------------------------------------------------
// Bug "String contains non ISO-8859-1 code point" (connexion/inscription) :
// supabase injecte le access_token stocké dans `Authorization: Bearer ...`
// à chaque appel (dont le refresh auto au démarrage). Si la session en
// localStorage est corrompue (token non-ASCII), fetch() lève une TypeError
// enveloppée en AuthRetryableFetchError. Les vrais tokens Supabase
// (JWT access + refresh base64url) sont strictement ASCII : tout le reste
// est une donnée corrompue à purger. Défense en 2 couches :
//  1. purge au démarrage (photo des clés d'abord, jamais d'abandon global) ;
//  2. adaptateur de stockage qui refuse les sessions corrompues à la lecture
//     (incontournable : TOUTES les lectures supabase passent par lui).
// ---------------------------------------------------------------------------
const SAFE_TOKEN_RE = /^[A-Za-z0-9\-_.]+$/;

function isSessionKey(key: string): boolean {
  return key === 'supabase.auth.token' || (key.startsWith('sb-') && key.includes('auth-token'));
}

/** true si la valeur est une session dont un token n'est pas ASCII pur. */
function isCorruptSession(raw: string | null): boolean {
  if (!raw) return false;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return false; // non-JSON : supabase l'ignore aussi, on ne touche à rien
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return false;
  const sess = (parsed as any).access_token
    ? parsed
    : ((parsed as any).currentSession ?? (parsed as any).session ?? null);
  if (!sess || typeof sess.access_token !== 'string') return false; // pas une session
  if (!SAFE_TOKEN_RE.test(sess.access_token)) return true;
  const rt = sess.refresh_token;
  if (rt !== undefined && (typeof rt !== 'string' || !SAFE_TOKEN_RE.test(rt))) return true;
  return false;
}

function snapshotKeys(store: Storage): string[] {
  try {
    const keys: string[] = [];
    for (let i = 0; i < store.length; i++) {
      try {
        const k = store.key(i);
        if (k) keys.push(k);
      } catch {
        // clé illisible : on continue avec les suivantes
      }
    }
    return keys;
  } catch {
    return [];
  }
}

/** Purge les sessions corrompues (localStorage + sessionStorage). Ne lève jamais. */
export function repairSupabaseStorage(): void {
  for (const store of [localStorage, sessionStorage]) {
    for (const key of snapshotKeys(store)) {
      try {
        if (isSessionKey(key) && isCorruptSession(store.getItem(key))) {
          store.removeItem(key);
        }
      } catch {
        // une clé récalcitrante ne doit jamais bloquer les autres
      }
    }
  }
  // Filet large : un school_token non-JWT casserait aussi les headers API.
  try {
    const t = localStorage.getItem('school_token');
    if (t && !SAFE_TOKEN_RE.test(t)) {
      localStorage.removeItem('school_token');
      localStorage.removeItem('school_user');
    }
  } catch {
    // stockage indisponible : on ignore
  }
}

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    key: (i: number) => [...map.keys()][i] ?? null,
    getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
    removeItem: (k: string) => {
      map.delete(k);
    },
    clear: () => {
      map.clear();
    },
  };
}

/** Adaptateur qui refuse les sessions corrompues à la lecture (réparé + null). */
function hardenedStorage(base: Storage): Storage {
  return {
    get length() {
      return base.length;
    },
    key: (i: number) => {
      try {
        return base.key(i);
      } catch {
        return null;
      }
    },
    getItem: (k: string) => {
      let v: string | null;
      try {
        v = base.getItem(k);
      } catch {
        return null;
      }
      if (v && isSessionKey(k) && isCorruptSession(v)) {
        try {
          base.removeItem(k);
        } catch {
          // ignore
        }
        return null;
      }
      return v;
    },
    setItem: (k: string, v: string) => {
      base.setItem(k, v);
    },
    removeItem: (k: string) => {
      base.removeItem(k);
    },
    clear: () => {
      base.clear();
    },
  };
}

function pickBaseStorage(): Storage {
  try {
    void localStorage.length;
    return localStorage;
  } catch {
    return memoryStorage();
  }
}

repairSupabaseStorage();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { storage: hardenedStorage(pickBaseStorage()) },
});
