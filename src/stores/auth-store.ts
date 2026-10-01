import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CURRENT_USER } from '@/lib/mock-data';
import type { User } from '@nexus/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: CURRENT_USER,
      isAuthenticated: true,
      isLoading: false,
      token: 'mock-jwt-token',

      login: async (_email: string, _password: string) => {
        set({ isLoading: true });
        await new Promise((r) => setTimeout(r, 1000));
        set({ user: CURRENT_USER, isAuthenticated: true, isLoading: false, token: 'mock-jwt-token' });
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, token: null });
      },

      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    { name: 'nexus-auth' }
  )
);
