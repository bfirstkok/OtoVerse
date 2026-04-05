import { initializeApp, getApps } from "firebase/app";
import { browserLocalPersistence, browserSessionPersistence, getAuth, setPersistence } from "firebase/auth";
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

// Ensure auth survives reloads. Some browsers/privacy settings can cause Auth to
// fall back to non-persistent storage unless persistence is explicitly set.
// Best-effort: prefer local; fallback to session.
export const firebaseAuthPersistenceReady = (() => {
  if (!firebaseAuth) return Promise.resolve(false);
  return setPersistence(firebaseAuth, browserLocalPersistence)
    .then(() => true)
    .catch(async (e) => {
      console.warn("Auth persistence(local) failed; falling back to session:", e);
      try {
        await setPersistence(firebaseAuth, browserSessionPersistence);
        return true;
      } catch (e2) {
        console.warn("Auth persistence(session) failed:", e2);
        return false;
      }
    });
})();
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
