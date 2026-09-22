import { create } from 'zustand';
import { UserProfile } from '../types';
import { authService } from '../services/auth.service';

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { first_name: string; last_name: string; email: string; password: string }) => Promise<{ pendingEmailConfirmation: boolean }>;
  logout: () => Promise<void>;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  login: async (email, password) => {
    const user = await authService.login(email, password);
    set({ user });
  },
  register: async (data) => {
    const { user, pendingEmailConfirmation } = await authService.register(data);
    if (!pendingEmailConfirmation) set({ user });
    return { pendingEmailConfirmation };
  },
  logout: async () => {
    // D'abord l'état local (instantané, même hors-ligne), puis le réseau.
    // Évite les courses (401 → redirection intempestive) et les blocages.
    set({ user: null });
    try {
      localStorage.removeItem('school_user');
      localStorage.removeItem('school_token');
    } catch {
      // stockage indisponible : on continue
    }
    try {
      await authService.logout();
    } catch {
      // déjà déconnecté localement : rien à faire
    }
  },
  initAuth: async () => {
    set({ isLoading: true });
    const user = await authService.getCurrentUser();
    set({ user, isLoading: false });
  }
}));
