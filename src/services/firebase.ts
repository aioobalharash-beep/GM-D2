import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getAuth, sendPasswordResetEmail as firebaseSendReset } from 'firebase/auth';

// When deploying purely to preview the theme (e.g. a Vercel preview without
// Firebase env vars set), substitute syntactically-valid placeholders so the
// Firebase SDK doesn't throw at module-load time. Network calls will still
// fail, but the React tree will mount and components fall back to defaults.
const HAS_FIREBASE_ENV = Boolean(import.meta.env.VITE_FIREBASE_API_KEY);

const firebaseConfig = HAS_FIREBASE_ENV
  ? {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    }
  : {
      apiKey: 'preview-no-firebase',
      authDomain: 'preview.firebaseapp.com',
      projectId: 'preview-only',
      storageBucket: 'preview.appspot.com',
      messagingSenderId: '0',
      appId: '0:0:web:0',
    };

if (!HAS_FIREBASE_ENV && typeof window !== 'undefined') {
  console.warn(
    '[firebase] No VITE_FIREBASE_* env vars detected — running in preview mode. ' +
      'Backend calls will fail; UI will use local fallbacks.',
  );
}

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});
export const auth = getAuth(app);

export async function sendPasswordResetEmail(email: string) {
  await firebaseSendReset(auth, email);
}

export default app;
