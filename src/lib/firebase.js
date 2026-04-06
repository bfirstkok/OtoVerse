import { initializeApp, getApps } from "firebase/app";
import {
  browserPopupRedirectResolver,
  browserLocalPersistence,
  browserSessionPersistence,
  getAuth,
  initializeAuth,
  setPersistence
} from "firebase/auth";
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

const authInit = (() => {
  if (!firebaseApp) return { auth: null, persistenceReady: Promise.resolve(false) };

  // Prefer initializing Auth with persistence upfront. This improves reliability
  // across reloads (e.g. after a Hosting deploy) in some browsers/privacy modes.
  try {
    const auth = initializeAuth(firebaseApp, {
      persistence: [browserLocalPersistence, browserSessionPersistence],
      popupRedirectResolver: browserPopupRedirectResolver
    });
    return { auth, persistenceReady: Promise.resolve(true) };
  } catch (e) {
    const auth = getAuth(firebaseApp);
    const persistenceReady = setPersistence(auth, browserLocalPersistence)
      .then(() => true)
      .catch(async (e2) => {
        console.warn("Auth persistence(local) failed; falling back to session:", e2);
        try {
          await setPersistence(auth, browserSessionPersistence);
          return true;
        } catch (e3) {
          console.warn("Auth persistence(session) failed:", e3);
          return false;
        }
      });

    return { auth, persistenceReady };
  }
})();

export const firebaseAuth = authInit.auth;
export const firebaseAuthPersistenceReady = authInit.persistenceReady;

export const firebaseProjectId = firebaseConfig.projectId || "";
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
