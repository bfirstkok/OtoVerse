import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const hasRequiredConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId);

export const firebaseReady = hasRequiredConfig;

export const firebaseApp = (() => {
  if (!hasRequiredConfig) return null;
  if (getApps().length) return getApps()[0];
  return initializeApp(firebaseConfig);
})();

export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;
export const firebaseDb = (() => {
  if (!firebaseApp) return null;

  // Some networks/extensions block Firestore's streaming transport and surface as `unavailable`.
  // Auto-detect long-polling is a safe mitigation; fall back to default instance if already initialized.
  try {
    return initializeFirestore(firebaseApp, {
      experimentalAutoDetectLongPolling: true,
      useFetchStreams: false
    });
  } catch {
    return getFirestore(firebaseApp);
  }
})();
export const firebaseStorage = firebaseApp ? getStorage(firebaseApp) : null;
