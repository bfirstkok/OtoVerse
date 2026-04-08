import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getCountFromServer,
  getDoc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from "firebase/firestore";
import { firebaseDb, firebaseReady } from "./firebase";

const COLLECTION = "profiles";

export function profileDocRef(uid) {
  if (!firebaseDb) return null;
  return doc(firebaseDb, COLLECTION, uid);
}

function inferDefaultNickname({ email = "", displayName = "" } = {}) {
  const d = String(displayName || "").trim();
  if (d) return d.slice(0, 24);
  const e = String(email || "").trim();
  if (!e) return "";
  return e.split("@")[0].slice(0, 24);
}

export async function ensureProfile(uid, { email = "", displayName = "", photoURL, accountCreatedAt } = {}) {
  if (!firebaseReady || !firebaseDb) return;
  if (!uid) return;

  const safeAccountCreatedAt =
    accountCreatedAt instanceof Date && Number.isFinite(accountCreatedAt.getTime()) ? accountCreatedAt : null;

  const ref = profileDocRef(uid);
  if (!ref) return;

  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data = snap.data() || {};
    const updates = {
      email: email || "",
      displayName: displayName || "",
      lastLoginAt: serverTimestamp()
    };

    if (typeof photoURL === "string" && photoURL.trim()) updates.photoURL = photoURL.trim();

    // Backfill fields for older profiles.
    if (!data.createdAt) updates.createdAt = safeAccountCreatedAt || serverTimestamp();
    if (!data.nickname) {
      const nick = inferDefaultNickname({ email, displayName });
      if (nick) updates.nickname = nick;
    }
    if (!Array.isArray(data.following)) updates.following = [];

    await updateDoc(ref, updates).catch(() => {});
    return;
  }

  const nickname = inferDefaultNickname({ email, displayName });

  await setDoc(
    ref,
    {
      createdAt: safeAccountCreatedAt || serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      email: email || "",
      displayName: displayName || "",
      photoURL: typeof photoURL === "string" ? photoURL : "",
      nickname,
      playCount: 0,
      totalScore: 0,
      following: [],
      settings: {
        theme: "dark",
        defaultAnswerMode: "choice6",
        defaultQuestionCount: 5
      }
    },
    { merge: true }
  );
}

export async function updateProfileNickname(uid, nickname) {
  if (!firebaseReady || !firebaseDb) return;
  const ref = profileDocRef(uid);
  if (!ref) return;

  const next = String(nickname || "")
    .trim()
    .slice(0, 24);

  await updateDoc(ref, { nickname: next }).catch(async () => {
    await setDoc(ref, { nickname: next }, { merge: true }).catch(() => {});
  });
}

export async function followUser(uid, targetUid) {
  if (!firebaseReady || !firebaseDb) return { ok: false, error: "firebase_not_ready" };
  if (!uid || !targetUid || uid === targetUid) return { ok: false, error: "invalid_target" };
  const ref = profileDocRef(uid);
  if (!ref) return { ok: false, error: "no_ref" };

  try {
    await updateDoc(ref, { following: arrayUnion(targetUid) });
    return { ok: true };
  } catch (e) {
    try {
      await setDoc(ref, { following: arrayUnion(targetUid) }, { merge: true });
      return { ok: true };
    } catch (e2) {
      const msg = String(e2?.code || e?.code || e2?.message || e?.message || "firestore_write_failed");
      console.warn("followUser failed:", e2 || e);
      return { ok: false, error: msg };
    }
  }
}

export async function unfollowUser(uid, targetUid) {
  if (!firebaseReady || !firebaseDb) return { ok: false, error: "firebase_not_ready" };
  if (!uid || !targetUid || uid === targetUid) return { ok: false, error: "invalid_target" };
  const ref = profileDocRef(uid);
  if (!ref) return { ok: false, error: "no_ref" };

  try {
    await updateDoc(ref, { following: arrayRemove(targetUid) });
    return { ok: true };
  } catch (e) {
    const msg = String(e?.code || e?.message || "firestore_write_failed");
    console.warn("unfollowUser failed:", e);
    return { ok: false, error: msg };
  }
}

export async function getFollowersCount(targetUid) {
  if (!firebaseReady || !firebaseDb) return 0;
  if (!targetUid) return 0;
  const col = collection(firebaseDb, COLLECTION);
  const q = query(col, where("following", "array-contains", targetUid));
  const snap = await getCountFromServer(q);
  const count = snap?.data?.().count;
  return typeof count === "number" ? count : 0;
}

export async function updateProfilePhotoURL(uid, photoURL) {
  if (!firebaseReady || !firebaseDb) throw new Error("firebase_not_ready");
  const ref = profileDocRef(uid);
  if (!ref) throw new Error("no_ref");

  try {
    await updateDoc(ref, { photoURL: photoURL || "" });
    return { ok: true };
  } catch (e) {
    try {
      await setDoc(ref, { photoURL: photoURL || "" }, { merge: true });
      return { ok: true };
    } catch (e2) {
      const msg = String(e2?.code || e?.code || e2?.message || e?.message || "firestore_write_failed");
      console.warn("updateProfilePhotoURL failed:", e2 || e);
      throw new Error(msg);
    }
  }
}

export async function updateProfilePublicFavorites(uid, favoriteIds) {
  if (!firebaseReady || !firebaseDb) return { ok: false, error: "firebase_not_ready" };
  const ref = profileDocRef(uid);
  if (!ref) return { ok: false, error: "no_ref" };

  const list = Array.isArray(favoriteIds) ? favoriteIds : [];
  const normalized = [];
  const seen = new Set();
  for (const x of list) {
    const n = Number(x);
    if (!Number.isFinite(n)) continue;
    if (seen.has(n)) continue;
    seen.add(n);
    normalized.push(n);
    if (normalized.length >= 500) break;
  }

  const updates = {
    publicFavorites: normalized,
    publicFavoritesUpdatedAt: serverTimestamp()
  };

  try {
    await updateDoc(ref, updates);
    return { ok: true };
  } catch (e) {
    try {
      await setDoc(ref, updates, { merge: true });
      return { ok: true };
    } catch (e2) {
      const msg = String(e2?.code || e?.code || e2?.message || e?.message || "firestore_write_failed");
      console.warn("updateProfilePublicFavorites failed:", e2 || e);
      return { ok: false, error: msg };
    }
  }
}

export function subscribeProfile(uid, onChange, onError) {
  if (!firebaseReady || !firebaseDb) return () => {};
  const ref = profileDocRef(uid);
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

export async function bumpPlayCount(uid) {
  if (!firebaseReady || !firebaseDb) return;
  const ref = profileDocRef(uid);
  if (!ref) return;

  try {
    await updateDoc(ref, {
      playCount: increment(1)
    });
    return { ok: true };
  } catch (e) {
    // If doc doesn't exist yet, fall back to merge setDoc.
    try {
      await setDoc(
        ref,
        {
          playCount: increment(1)
        },
        { merge: true }
      );
      return { ok: true };
    } catch (e2) {
      const msg = String(e2?.code || e?.code || e2?.message || e?.message || "firestore_write_failed");
      // Keep console signal for debugging; callers can show UI notice.
      console.warn("bumpPlayCount failed:", e2 || e);
      return { ok: false, error: msg };
    }
  }
}

export async function bumpTotalScore(uid, delta) {
  if (!firebaseReady || !firebaseDb) return;
  const ref = profileDocRef(uid);
  if (!ref) return;
  const amount = Number(delta) || 0;
  if (!amount) return;

  try {
    await updateDoc(ref, {
      totalScore: increment(amount)
    });
    return { ok: true };
  } catch (e) {
    try {
      await setDoc(
        ref,
        {
          totalScore: increment(amount)
        },
        { merge: true }
      );
      return { ok: true };
    } catch (e2) {
      const msg = String(e2?.code || e?.code || e2?.message || e?.message || "firestore_write_failed");
      console.warn("bumpTotalScore failed:", e2 || e);
      return { ok: false, error: msg };
    }
  }
}

export function subscribeLeaderboard({ max = 10 } = {}, onChange, onError) {
  if (!firebaseReady || !firebaseDb) return () => {};
  const col = collection(firebaseDb, COLLECTION);
  const q = query(col, orderBy("totalScore", "desc"), limit(Math.max(1, Math.min(50, Number(max) || 10))));

  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      onChange(rows);
    },
    (err) => {
      onChange([]);
      if (typeof onError === "function") onError(err);
    }
  );
}

export function subscribeCommunityProfiles({ max = 200 } = {}, onChange, onError) {
  if (!firebaseReady || !firebaseDb) return () => {};
  const col = collection(firebaseDb, COLLECTION);
  const capped = Math.max(1, Math.min(200, Number(max) || 200));
  const q = query(col, orderBy("totalScore", "desc"), limit(capped));

  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      onChange(rows);
    },
    (err) => {
      onChange([]);
      if (typeof onError === "function") onError(err);
    }
  );
}

export async function updateProfileSettings(uid, partialSettings) {
  if (!firebaseReady || !firebaseDb) return;
  const ref = profileDocRef(uid);
  if (!ref) return;

  const updates = {};
  for (const [key, value] of Object.entries(partialSettings || {})) {
    updates[`settings.${key}`] = value;
  }

  if (!Object.keys(updates).length) return;

  await updateDoc(ref, updates).catch(async () => {
    await setDoc(ref, { settings: partialSettings }, { merge: true }).catch(() => {});
  });
}

export async function setUserPresence(uid, { online } = {}) {
  if (!firebaseReady || !firebaseDb) return;
  if (!uid) return;
  const ref = profileDocRef(uid);
  if (!ref) return;

  const isOnline = Boolean(online);
  const updates = {
    online: isOnline,
    lastActiveAt: serverTimestamp()
  };
  if (!isOnline) updates.lastSeenAt = serverTimestamp();

  await updateDoc(ref, updates).catch(async () => {
    await setDoc(ref, updates, { merge: true }).catch(() => {});
  });
}

export async function touchUserPresence(uid) {
  if (!firebaseReady || !firebaseDb) return;
  if (!uid) return;
  const ref = profileDocRef(uid);
  if (!ref) return;

  await updateDoc(ref, { lastActiveAt: serverTimestamp(), online: true }).catch(async () => {
    await setDoc(ref, { lastActiveAt: serverTimestamp(), online: true }, { merge: true }).catch(() => {});
  });
}
