import {
  addDoc,
  where,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { firebaseDb, firebaseReady } from "./firebase";

const CHATS_COLLECTION = "chats";

function chatDocRef(chatId) {
  if (!firebaseDb) return null;
  if (!chatId) return null;
  return doc(firebaseDb, CHATS_COLLECTION, chatId);
}

function messagesCollectionRef(chatId) {
  const ref = chatDocRef(chatId);
  if (!ref) return null;
  return collection(ref, "messages");
}

export function getDirectChatId(uidA, uidB) {
  const a = String(uidA || "").trim();
  const b = String(uidB || "").trim();
  if (!a || !b) return "";
  if (a === b) return "";
  return [a, b].sort().join("__");
}

export async function ensureDirectChat(uidA, uidB) {
  if (!firebaseReady || !firebaseDb) return { ok: false, error: "firebase_not_ready" };
  const chatId = getDirectChatId(uidA, uidB);
  if (!chatId) return { ok: false, error: "invalid_chat" };

  const ref = chatDocRef(chatId);
  if (!ref) return { ok: false, error: "no_ref" };

  const participants = [String(uidA).trim(), String(uidB).trim()].sort();

  try {
    await setDoc(
      ref,
      {
        participants,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessageAt: null,
        lastMessageText: "",
        lastMessageFromUid: "",
        meta: {}
      },
      { merge: true }
    );
    return { ok: true, id: chatId };
  } catch (e) {
    const msg = String(e?.code || e?.message || "ensure_chat_failed");
    console.warn("ensureDirectChat failed:", e);
    return { ok: false, error: msg };
  }
}

export async function upsertChatMeta(chatId, uid, { nickname = "", photoURL = "" } = {}) {
  if (!firebaseReady || !firebaseDb) return;
  if (!chatId || !uid) return;
  const ref = chatDocRef(chatId);
  if (!ref) return;

  const nick = String(nickname || "").trim().slice(0, 24);
  const photo = String(photoURL || "").trim();

  await setDoc(
    ref,
    {
      meta: {
        [uid]: {
          nickname: nick,
          photoURL: photo
        }
      },
      updatedAt: serverTimestamp()
    },
    { merge: true }
  ).catch(() => {});
}

export function subscribeUserChats(uid, { max = 50 } = {}, onChange, onError) {
  if (!firebaseReady || !firebaseDb) return () => {};
  const u = String(uid || "").trim();
  if (!u) return () => {};

  const capped = Math.max(1, Math.min(50, Number(max) || 50));
  const col = collection(firebaseDb, CHATS_COLLECTION);

  // Avoid requiring composite indexes by not ordering in the query; sort client-side.
  const q = query(col, where("participants", "array-contains", u), limit(capped));
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (typeof onChange === "function") onChange(rows);
    },
    (err) => {
      if (typeof onChange === "function") onChange([]);
      if (typeof onError === "function") onError(err);
    }
  );
}

export function subscribeDirectMessages(chatId, { max = 50 } = {}, onChange, onError) {
  if (!firebaseReady || !firebaseDb) return () => {};
  if (!chatId) return () => {};

  const col = messagesCollectionRef(chatId);
  if (!col) return () => {};

  const capped = Math.max(1, Math.min(100, Number(max) || 50));
  const q = query(col, orderBy("createdAt", "asc"), limit(capped));

  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (typeof onChange === "function") onChange(rows);
    },
    (err) => {
      if (typeof onChange === "function") onChange([]);
      if (typeof onError === "function") onError(err);
    }
  );
}

export async function sendDirectMessage(chatId, fromUid, { body = "", fromNickname = "", fromPhotoURL = "" } = {}) {
  if (!firebaseReady || !firebaseDb) return { ok: false, error: "firebase_not_ready" };
  if (!chatId || !fromUid) return { ok: false, error: "invalid" };

  const b = String(body || "").trim().slice(0, 1000);
  if (!b) return { ok: false, error: "missing_body" };

  const col = messagesCollectionRef(chatId);
  if (!col) return { ok: false, error: "no_collection" };

  // Best-effort: create/merge the parent chat doc first.
  // This avoids rules that require checking parent `participants`.
  try {
    const parts = String(chatId).split("__").map((x) => String(x || "").trim());
    if (parts.length === 2 && parts[0] && parts[1]) {
      const ensure = await ensureDirectChat(parts[0], parts[1]);
      if (ensure && ensure.ok === false) return { ok: false, error: ensure.error || "ensure_chat_failed" };
    }
  } catch {
    // ignore
  }

  try {
    await addDoc(col, {
      fromUid: String(fromUid).trim(),
      fromNickname: String(fromNickname || "").trim().slice(0, 24),
      fromPhotoURL: String(fromPhotoURL || "").trim(),
      body: b,
      createdAt: serverTimestamp()
    });

    const chatRef = chatDocRef(chatId);
    if (chatRef) {
      await updateDoc(chatRef, {
        updatedAt: serverTimestamp(),
        lastMessageAt: serverTimestamp(),
        lastMessageText: b.slice(0, 120),
        lastMessageFromUid: String(fromUid).trim()
      }).catch(() => {});
    }

    // Keep sender meta fresh in chat doc.
    await upsertChatMeta(chatId, String(fromUid).trim(), {
      nickname: fromNickname,
      photoURL: fromPhotoURL
    });

    return { ok: true };
  } catch (e) {
    const msg = String(e?.code || e?.message || "send_failed");
    console.warn("sendDirectMessage failed:", e);
    return { ok: false, error: msg };
  }
}
