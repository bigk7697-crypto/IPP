import { UserProfile } from '../types';
import { supabase } from './supabaseClient';
import { apiFetch } from './apiClient';

export const authService = {
  async login(email: string, password: string):Promise<UserProfile> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    if (data.session) {
      localStorage.setItem('school_token', data.session.access_token);
    }
    const me = await apiFetch<UserProfile>('/auth/me');
    if (!me) throw new Error('Impossible de récupérer le profil utilisateur');
    localStorage.setItem('school_user', JSON.stringify(me));
    return me;
  },

  async register(data: { first_name: string; last_name: string; email: string; password: string }): Promise<UserProfile> {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.first_name,
          last_name: data.last_name
        }
      }
    });
    if (error) throw new Error(error.message);
    if (authData.session) {
      localStorage.setItem('school_token', authData.session.access_token);
    }
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
    return userProfile;
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
