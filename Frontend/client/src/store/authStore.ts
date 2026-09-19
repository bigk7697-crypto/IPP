import { create } from 'zustand';
import { UserProfile } from '../types';
import { authService } from '../services/auth.service';

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, role?: 'user' | 'admin') => Promise<void>;
  register: (data: { first_name: string; last_name: string; email: string }) => Promise<void>;
  logout: () => Promise<void>;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  login: async (email, role = 'user') => {
    const user = await authService.login(email, role);
    set({ user });
  },
  register: async (data) => {
    const user = await authService.register(data);
    set({ user });
  },
  logout: async () => {
    await authService.logout();
    set({ user: null });
  },
  initAuth: async () => {
    set({ isLoading: true });
    const user = await authService.getCurrentUser();
    set({ user, isLoading: false });
  }
}));
