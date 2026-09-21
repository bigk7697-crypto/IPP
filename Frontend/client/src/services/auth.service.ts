import { UserProfile } from '../types';
import { supabase, repairSupabaseStorage } from './supabaseClient';
import { apiFetch } from './apiClient';

const captchaToken = () => (window as any).__hcaptchaToken as string | undefined;

/** Traduit les erreurs techniques auth en français + répare le stockage local. */
function toFriendlyAuthError(err: unknown): Error {
  const msg = err instanceof Error ? err.message : String(err ?? '');
  if (/ISO-8859-1|AuthRetryableFetchError|Failed to execute 'fetch'/i.test(msg)) {
    repairSupabaseStorage();
    return new Error('Session locale corrompue détectée et nettoyée. Rechargez la page puis reconnectez-vous.');
  }
  if (/user already registered/i.test(msg)) {
    return new Error('Un compte existe déjà avec cet email. Connectez-vous ou réinitialisez votre mot de passe.');
  }
  if (/email not confirmed/i.test(msg)) {
    return new Error('Email non confirmé. Consultez votre boîte mail puis réessayez.');
  }
  if (/invalid login credentials/i.test(msg)) {
    return new Error('Email ou mot de passe incorrect.');
  }
  return err instanceof Error ? err : new Error(msg || 'Erreur d’authentification.');
}

export const authService = {
  async login(email: string, password: string):Promise<UserProfile> {
    let data;
    try {
      const res = await supabase.auth.signInWithPassword({
        email,
        password,
        options: captchaToken() ? { captchaToken: captchaToken() } : undefined,
      });
      if (res.error) throw new Error(res.error.message);
      data = res.data;
    } catch (e) {
      throw toFriendlyAuthError(e);
    }
    if (data.session) {
      localStorage.setItem('school_token', data.session.access_token);
    }
    const me = await apiFetch<UserProfile>('/auth/me');
    if (!me) throw new Error('Impossible de récupérer le profil utilisateur');
    localStorage.setItem('school_user', JSON.stringify(me));
    return me;
  },

  async register(data: { first_name: string; last_name: string; email: string; password: string }): Promise<{ user: UserProfile; pendingEmailConfirmation: boolean }> {
    let authData;
    try {
      const res = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.first_name,
            last_name: data.last_name
          },
          ...(captchaToken() ? { captchaToken: captchaToken() } : {}),
        }
      });
      if (res.error) throw new Error(res.error.message);
      authData = res.data;
    } catch (e) {
      throw toFriendlyAuthError(e);
    }
    // Confirmation email requise (réglage Supabase par défaut) : pas de session
    // → inutile d'appeler /auth/me (401 garanti). On guide vers la boîte mail.
    if (!authData.session) {
      const pending: UserProfile = {
        id: authData.user?.id || `usr-${Date.now()}`,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        role: 'user',
        created_at: new Date().toISOString(),
      };
      return { user: pending, pendingEmailConfirmation: true };
    }
    localStorage.setItem('school_token', authData.session.access_token);
    const me = await apiFetch<UserProfile>('/auth/me');
    const userProfile = me || {
      id: authData.user?.id || `usr-${Date.now()}`,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      role: 'user',
      created_at: new Date().toISOString()
    };
    localStorage.setItem('school_user', JSON.stringify(userProfile));
    return { user: userProfile, pendingEmailConfirmation: false };
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
    localStorage.removeItem('school_user');
    localStorage.removeItem('school_token');
  },

  async getCurrentUser(): Promise<UserProfile | null> {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) return null;

    if (sessionData.session.access_token) {
      localStorage.setItem('school_token', sessionData.session.access_token);
    }

    const me = await apiFetch<UserProfile>('/auth/me');
    if (me) {
      localStorage.setItem('school_user', JSON.stringify(me));
      return me;
    }

    const stored = localStorage.getItem('school_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  }
};
