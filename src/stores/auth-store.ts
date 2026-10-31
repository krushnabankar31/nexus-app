import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CURRENT_USER } from '@/lib/mock-data';
import type { User } from '@nexus/types';
import { auth, db, googleProvider, isFirebaseConfigured } from '@/lib/firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  error: string | null;
  initAuthListener: () => () => void;
  loginWithGooglePopup: () => Promise<User | null>;
  login: (email: string, password?: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  loginWithGoogle: (googleData: { email: string; name: string; avatar?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: CURRENT_USER,
      isAuthenticated: true,
      isLoading: false,
      token: 'nexus-jwt-token',
      error: null,

      initAuthListener: () => {
        if (!isFirebaseConfigured() || !auth) {
          return () => {};
        }

        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
          if (fbUser) {
            let profileData: Partial<User> = {};
            if (db) {
              try {
                const userDocRef = doc(db, 'users', fbUser.uid);
                const userSnapshot = await getDoc(userDocRef);
                if (userSnapshot.exists()) {
                  profileData = userSnapshot.data() as Partial<User>;
                } else {
                  const username = (fbUser.displayName || fbUser.email?.split('@')[0] || 'user')
                    .toLowerCase()
                    .replace(/[^a-z0-9_]/g, '');
                  const newUser: User = {
                    id: fbUser.uid,
                    email: fbUser.email || '',
                    displayName: fbUser.displayName || username,
                    username,
                    avatar: fbUser.photoURL || `https://api.dicebear.com/9.x/avataaars/svg?seed=${username}&backgroundColor=6366f1`,
                    status: 'online',
                    bio: 'Hey there! I am using Nexus.',
                    createdAt: new Date().toISOString(),
                    isVerified: false,
                  };
                  await setDoc(userDocRef, { ...newUser, updatedAt: serverTimestamp() }, { merge: true });
                  profileData = newUser;
                }
              } catch (e) {
                console.warn('Could not fetch user document:', e);
              }
            }

            const username = profileData.username || fbUser.email?.split('@')[0] || 'user';
            const userObj: User = {
              id: fbUser.uid,
              email: fbUser.email || '',
              displayName: profileData.displayName || fbUser.displayName || username,
              username,
              avatar: profileData.avatar || fbUser.photoURL || `https://api.dicebear.com/9.x/avataaars/svg?seed=${username}&backgroundColor=6366f1`,
              status: 'online',
              bio: profileData.bio || 'Hey there! I am using Nexus.',
              createdAt: profileData.createdAt || new Date().toISOString(),
              isVerified: Boolean(profileData.isVerified),
            };

            const token = await fbUser.getIdToken();
            set({ user: userObj, isAuthenticated: true, isLoading: false, token, error: null });
          } else {
            // Only clear state if there is no user already saved in localStorage/Zustand
            // This prevents race-condition logouts on page refresh or tab re-opening
            const existingUser = get().user;
            if (!existingUser?.id) {
              set({ user: null, isAuthenticated: false, token: null, isLoading: false });
            }
          }
        });

        return unsubscribe;
      },

      loginWithGooglePopup: async () => {
        set({ isLoading: true, error: null });
        if (isFirebaseConfigured() && auth && googleProvider) {
          try {
            await setPersistence(auth, browserLocalPersistence);
            const res = await signInWithPopup(auth, googleProvider);
            const fbUser = res.user;
            const username = (fbUser.displayName || fbUser.email?.split('@')[0] || 'user')
              .toLowerCase()
              .replace(/[^a-z0-9_]/g, '');
            const userObj: User = {
              id: fbUser.uid,
              email: fbUser.email || '',
              displayName: fbUser.displayName || username,
              username,
              avatar: fbUser.photoURL || `https://api.dicebear.com/9.x/avataaars/svg?seed=${username}&backgroundColor=6366f1`,
              status: 'online',
              bio: 'Hey there! I am using Nexus.',
              createdAt: new Date().toISOString(),
              isVerified: true,
            };

            if (db) {
              try {
                await setDoc(doc(db, 'users', fbUser.uid), { ...userObj, updatedAt: serverTimestamp() }, { merge: true });
              } catch (err) {
                console.warn('Firestore user doc write error:', err);
              }
            }

            const token = await fbUser.getIdToken();
            set({ user: userObj, isAuthenticated: true, isLoading: false, token, error: null });
            return userObj;
          } catch (err: any) {
            console.error('Google Sign-in error:', err);
            const msg = err?.message || 'Google sign in failed';
            set({ isLoading: false, error: msg });
            throw err;
          }
        } else {
          // Graceful simulated real Google sign-in fallback
          await new Promise((r) => setTimeout(r, 600));
          const userObj: User = {
            ...CURRENT_USER,
            id: `usr_${Date.now()}`,
            displayName: 'Google User',
            email: 'user@gmail.com',
            status: 'online',
          };
          set({ user: userObj, isAuthenticated: true, isLoading: false, token: 'local-demo-token', error: null });
          return userObj;
        }
      },

      login: async (email: string, password?: string) => {
        set({ isLoading: true, error: null });
        if (isFirebaseConfigured() && auth && password) {
          try {
            await setPersistence(auth, browserLocalPersistence);
            const res = await signInWithEmailAndPassword(auth, email, password);
            const fbUser = res.user;
            const token = await fbUser.getIdToken();
            const username = email.split('@')[0];
            const userObj: User = {
              id: fbUser.uid,
              email: fbUser.email || email,
              displayName: fbUser.displayName || username,
              username,
              avatar: fbUser.photoURL || `https://api.dicebear.com/9.x/avataaars/svg?seed=${username}&backgroundColor=6366f1`,
              status: 'online',
              createdAt: new Date().toISOString(),
            };
            set({ user: userObj, isAuthenticated: true, isLoading: false, token, error: null });
            return;
          } catch (err: any) {
            set({ isLoading: false, error: err.message });
            throw err;
          }
        }

        // Demo / fallback mode
        await new Promise((r) => setTimeout(r, 500));
        const username = email ? email.split('@')[0] : CURRENT_USER.username;
        const userObj: User = {
          ...CURRENT_USER,
          email: email || CURRENT_USER.email,
          displayName: username ? username.charAt(0).toUpperCase() + username.slice(1) : CURRENT_USER.displayName,
          username: username || CURRENT_USER.username,
        };
        set({ user: userObj, isAuthenticated: true, isLoading: false, token: 'nexus-jwt-token', error: null });
      },

      registerWithEmail: async (email: string, password: string, displayName?: string) => {
        set({ isLoading: true, error: null });
        if (isFirebaseConfigured() && auth) {
          try {
            await setPersistence(auth, browserLocalPersistence);
            const res = await createUserWithEmailAndPassword(auth, email, password);
            const fbUser = res.user;
            const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
            const userObj: User = {
              id: fbUser.uid,
              email: fbUser.email || email,
              displayName: displayName || username,
              username,
              avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${username}&backgroundColor=6366f1`,
              status: 'online',
              createdAt: new Date().toISOString(),
            };
            if (db) {
              await setDoc(doc(db, 'users', fbUser.uid), { ...userObj, updatedAt: serverTimestamp() });
            }
            const token = await fbUser.getIdToken();
            set({ user: userObj, isAuthenticated: true, isLoading: false, token, error: null });
            return;
          } catch (err: any) {
            set({ isLoading: false, error: err.message });
            throw err;
          }
        }

        // Fallback
        const username = email.split('@')[0];
        const userObj: User = {
          ...CURRENT_USER,
          id: `usr_${Date.now()}`,
          email,
          displayName: displayName || username,
          username,
        };
        set({ user: userObj, isAuthenticated: true, isLoading: false, token: 'nexus-jwt-token', error: null });
      },

      loginWithGoogle: async (googleData: { email: string; name: string; avatar?: string }) => {
        set({ isLoading: true, error: null });
        await new Promise((r) => setTimeout(r, 500));
        const username = googleData.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
        const newUser: User = {
          ...CURRENT_USER,
          id: `usr_${username}_${Date.now().toString(36)}`,
          email: googleData.email,
          displayName: googleData.name || username,
          username,
          avatar: googleData.avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${username}&backgroundColor=6366f1`,
          status: 'online',
        };

        if (isFirebaseConfigured() && db) {
          try {
            await setDoc(doc(db, 'users', newUser.id), { ...newUser, updatedAt: serverTimestamp() }, { merge: true });
          } catch (e) {
            console.warn('Firestore write error in custom google login:', e);
          }
        }

        set({
          user: newUser,
          isAuthenticated: true,
          isLoading: false,
          token: `token-${Date.now()}`,
          error: null,
        });
      },

      logout: async () => {
        const currentUser = get().user;
        if (isFirebaseConfigured() && db && currentUser?.id) {
          try {
            await updateDoc(doc(db, 'users', currentUser.id), {
              status: 'offline',
              lastSeen: 0,
              updatedAt: serverTimestamp(),
            });
          } catch (err) {
            console.warn('Failed to set offline status on logout:', err);
          }
        }
        if (isFirebaseConfigured() && auth) {
          try {
            await signOut(auth);
          } catch (err) {
            console.warn('Firebase signout error:', err);
          }
        }
        set({ user: null, isAuthenticated: false, token: null, error: null });
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('nexus-auth');
          } catch (e) {}
        }
      },

      updateUser: async (updates: Partial<User>) => {
        const currentUser = get().user;
        if (!currentUser) return;
        const updatedUser = { ...currentUser, ...updates };
        set({ user: updatedUser });

        if (isFirebaseConfigured() && db && currentUser.id) {
          try {
            await updateDoc(doc(db, 'users', currentUser.id), { ...updates, updatedAt: serverTimestamp() });
          } catch (err) {
            console.warn('Failed to update user in Firestore:', err);
          }
        }
      },

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'nexus-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: state.token,
      }),
    }
  )
);
