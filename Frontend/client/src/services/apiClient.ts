const API_BASE = import.meta.env.VITE_API_URL || 'https://ipp-2mdf.onrender.com/api';

// Un JWT Supabase est strictement ASCII (base64url). Un token corrompu
// (caractère non-latin1) fait échouer fetch() avec :
// "String contains non ISO-8859-1 code point". On le purge et on
// continue sans Authorization : le backend répondra 401 + purge auto.
const JWT_RE = /^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/;

function readToken(): string | null {
  const token = localStorage.getItem('school_token');
  if (!token) return null;
  if (!JWT_RE.test(token)) {
    localStorage.removeItem('school_token');
    localStorage.removeItem('school_user');
    return null;
  }
  return token;
}

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = readToken();
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };
  // Ne pas forcer Content-Type si FormData (le navigateur gère le boundary).
  if (!(options?.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (e: any) {
    // Erreur réseau / construction Request (headers invalides, etc.)
    throw new Error(e?.message || 'Erreur réseau. Vérifiez votre connexion.');
  }

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    // Session expirée/révoquée : purger et forcer une reconnexion propre
    // au lieu de laisser un token mort en localStorage.
    if (response.status === 401 && token) {
      localStorage.removeItem('school_token');
      localStorage.removeItem('school_user');
      if (!window.location.pathname.includes('/connexion')) {
        window.location.assign('/connexion');
      }
    }
    throw new Error(json.error?.message || `Erreur API (${response.status})`);
  }

  return json.data !== undefined ? json.data : json;
}
