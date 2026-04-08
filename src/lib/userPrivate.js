import { doc, getDoc, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { firebaseDb, firebaseReady } from "./firebase";

const COLLECTION = "user_private";

export function userPrivateDocRef(uid) {
  if (!firebaseDb) return null;
  const safeUid = String(uid || "").trim();
  if (!safeUid) return null;
  return doc(firebaseDb, COLLECTION, safeUid);
}

export async function ensureUserPrivate(uid) {
  if (!firebaseReady || !firebaseDb) return;
  const ref = userPrivateDocRef(uid);
  if (!ref) return;

  // Avoid an unconditional write when possible.
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) return;
  } catch {
    // If get fails (offline), still allow merge set.
  }

  await setDoc(
    ref,
    {
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    },
    { merge: true }
  ).catch(() => {});
}

export async function updateUserPrivate(uid, partial) {
  if (!firebaseReady || !firebaseDb) return { ok: false, error: "firebase_not_ready" };
  const ref = userPrivateDocRef(uid);
  if (!ref) return { ok: false, error: "no_ref" };

  const payload = {
    ...(partial && typeof partial === "object" ? partial : {}),
    updatedAt: serverTimestamp()
  };

  try {
    await updateDoc(ref, payload);
    return { ok: true };
  } catch (e) {
    try {
      await setDoc(ref, payload, { merge: true });
      return { ok: true };
    } catch (e2) {
      const msg = String(e2?.code || e?.code || e2?.message || e?.message || "firestore_write_failed");
      console.warn("updateUserPrivate failed:", e2 || e);
      return { ok: false, error: msg };
    }
  }
}

export function subscribeUserPrivate(uid, onChange, onError) {
  if (!firebaseReady || !firebaseDb) return () => {};
  const ref = userPrivateDocRef(uid);
  if (!ref) return () => {};

  return onSnapshot(
    ref,
    (snap) => {
      onChange(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    },
    (err) => {
      if (typeof onError === "function") onError(err);
    }
  );
}
