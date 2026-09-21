import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Erreur critique : VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont obligatoires en production.');
}

// Même protection que le client : une session corrompue en stockage
// (token non-ASCII) fait échouer le refresh auto avec
// "String contains non ISO-8859-1 code point". Les vrais tokens sont ASCII.
const SAFE_TOKEN_RE = /^[A-Za-z0-9\-_.]+$/;

function isSessionKey(key: string): boolean {
  return key === 'supabase.auth.token' || (key.startsWith('sb-') && key.includes('auth-token'));
}

function isCorruptSession(raw: string | null): boolean {
  if (!raw) return false;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return false;
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return false;
  const sess = (parsed as any).access_token
    ? parsed
    : ((parsed as any).currentSession ?? (parsed as any).session ?? null);
  if (!sess || typeof sess.access_token !== 'string') return false;
  if (!SAFE_TOKEN_RE.test(sess.access_token)) return true;
  const rt = sess.refresh_token;
  if (rt !== undefined && (typeof rt !== 'string' || !SAFE_TOKEN_RE.test(rt))) return true;
  return false;
}

export function repairSupabaseStorage(): void {
  for (const store of [localStorage, sessionStorage]) {
    let keys: string[] = [];
    try {
      for (let i = 0; i < store.length; i++) {
        try {
          const k = store.key(i);
          if (k) keys.push(k);
        } catch {
          // clé illisible : on continue
        }
      }
    } catch {
      continue;
    }
    for (const key of keys) {
      try {
        if (isSessionKey(key) && isCorruptSession(store.getItem(key))) {
          store.removeItem(key);
        }
      } catch {
        // une clé récalcitrante ne bloque jamais les autres
      }
    }
  }
  try {
    const t = localStorage.getItem('admin_token');
    if (t && !SAFE_TOKEN_RE.test(t)) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      localStorage.removeItem('admin_logged');
    }
  } catch {
    // ignore
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
