import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence, type Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore, type Firestore } from 'firebase/firestore';

export interface FirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

const DEFAULT_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: 'AIzaSyBNEs2RjR4TlYQewz2PCBdoy-KGWWF6zoU',
  authDomain: 'nexus-app-6193e.firebaseapp.com',
  projectId: 'nexus-app-6193e',
  storageBucket: 'nexus-app-6193e.firebasestorage.app',
  messagingSenderId: '520495081841',
  appId: '1:520495081841:web:1a032dfa55dfb8993deed0',
};

export const getFirebaseConfig = (): FirebaseConfig => {
  const envConfig: FirebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId,
  };

  if (envConfig.apiKey && envConfig.apiKey !== 'your-api-key' && envConfig.projectId) {
    return envConfig;
  }

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('nexus_firebase_config');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.apiKey && parsed?.projectId) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
  }

  return DEFAULT_FIREBASE_CONFIG;
};

export const isFirebaseConfigured = (): boolean => {
  const config = getFirebaseConfig();
  return Boolean(config.apiKey && config.apiKey !== 'your-api-key' && config.projectId);
};

export const saveClientFirebaseConfig = (config: FirebaseConfig) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('nexus_firebase_config', JSON.stringify(config));
    window.location.reload();
  }
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (typeof window !== 'undefined') {
  const config = getFirebaseConfig();
  if (config.apiKey && config.projectId) {
    try {
      app = getApps().length === 0 ? initializeApp(config as Record<string, string>) : getApp();
      auth = getAuth(app);
      setPersistence(auth, browserLocalPersistence).catch(() => {});
      try {
        db = initializeFirestore(app, { ignoreUndefinedProperties: true });
      } catch {
        db = getFirestore(app);
      }
      googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({ prompt: 'select_account' });
    } catch (err) {
      console.warn('Firebase initialization notice:', err);
    }
  }
}

export { app, auth, db, googleProvider };
