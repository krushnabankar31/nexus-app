import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CURRENT_USER } from '@/lib/mock-data';
import type { User } from '@nexus/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (email: string, password?: string) => Promise<void>;
  loginWithGoogle: (googleData: { email: string; name: string; avatar?: string }) => Promise<void>;
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
      token: 'nexus-jwt-token',

      login: async (email: string, _password?: string) => {
        set({ isLoading: true });
        await new Promise((r) => setTimeout(r, 600));
        const username = email ? email.split('@')[0] : CURRENT_USER.username;
        const userObj: User = {
          ...CURRENT_USER,
          email: email || CURRENT_USER.email,
          displayName: username ? username.charAt(0).toUpperCase() + username.slice(1) : CURRENT_USER.displayName,
          username: username || CURRENT_USER.username,
        };
        set({ user: userObj, isAuthenticated: true, isLoading: false, token: 'nexus-jwt-token' });
      },

      loginWithGoogle: async (googleData: { email: string; name: string; avatar?: string }) => {
        set({ isLoading: true });
        await new Promise((r) => setTimeout(r, 600));
        const username = googleData.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
        const newUser: User = {
          ...CURRENT_USER,
          id: `usr_google_${Date.now()}`,
          email: googleData.email,
          displayName: googleData.name || username,
          username: username,
          avatar: googleData.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${username}&backgroundColor=6366f1`,
        };
        set({
          user: newUser,
          isAuthenticated: true,
          isLoading: false,
          token: `google-token-${Date.now()}`,
        });
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
