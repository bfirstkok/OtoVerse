import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";
import { getDownloadURL, ref as storageRef, uploadBytesResumable } from "firebase/storage";
import { firebaseDb, firebaseReady, firebaseStorage } from "./firebase";

const POSTS_COLLECTION = "posts";

function postsCollectionRef() {
  if (!firebaseDb) return null;
  return collection(firebaseDb, POSTS_COLLECTION);
}

function postDocRef(postId) {
  if (!firebaseDb) return null;
  if (!postId) return null;
  return doc(firebaseDb, POSTS_COLLECTION, postId);
}

function commentsCollectionRef(postId) {
  const postRef = postDocRef(postId);
  if (!postRef) return null;
  return collection(postRef, "comments");
}

export function subscribePosts({ max = 50 } = {}, onChange, onError) {
  if (!firebaseReady || !firebaseDb) return () => {};
  const col = postsCollectionRef();
  if (!col) return () => {};

  const capped = Math.max(1, Math.min(50, Number(max) || 50));
  const q = query(col, orderBy("createdAt", "desc"), limit(capped));

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

export async function uploadPostImage(uid, file, { onProgress, signal } = {}) {
  if (!firebaseReady || !firebaseStorage) throw new Error("firebase_not_ready");
  if (!uid) throw new Error("missing_uid");
  if (!file) throw new Error("missing_file");

  const isImage = String(file?.type || "").startsWith("image/");
  if (!isImage) throw new Error("not_image");

  const ext = String(file?.name || "")
    .split(".")
    .pop();
  const safeExt = ext ? ext.replace(/[^a-z0-9]/gi, "").slice(0, 8).toLowerCase() : "img";

  const path = `community_posts/${uid}/${Date.now()}-${Math.random().toString(16).slice(2)}.${safeExt}`;
  const r = storageRef(firebaseStorage, path);

  const task = uploadBytesResumable(r, file);

  const uploadPromise = new Promise((resolve, reject) => {
    task.on(
      "state_changed",
      (snap) => {
        if (typeof onProgress === "function") {
          const totalBytes = Number(snap?.totalBytes || 0);
          const bytesTransferred = Number(snap?.bytesTransferred || 0);
          const progress = totalBytes > 0 ? bytesTransferred / totalBytes : 0;
          try {
            onProgress({ progress, bytesTransferred, totalBytes, state: snap?.state || "running" });
          } catch {
            // ignore progress handler errors
          }
        }
      },
      (err) => reject(err),
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve(url);
        } catch (e) {
          reject(e);
        }
      }
    );
  });

  if (signal && typeof signal === "object") {
    if (signal.aborted) {
      try {
        task.cancel();
      } catch {
        // ignore
      }
    } else {
      signal.addEventListener(
        "abort",
        () => {
          try {
            task.cancel();
          } catch {
            // ignore
          }
        },
        { once: true }
      );
    }
  }

  try {
    return await uploadPromise;
  } catch (e) {
    const code = String(e?.code || e?.message || "upload_failed");
    if (code.includes("storage/canceled")) throw new Error("upload_canceled");
    throw e;
  }
}

export async function createPost(uid, { title = "", body = "", imageUrl = "", authorNickname = "", authorPhotoURL = "" } = {}) {
  if (!firebaseReady || !firebaseDb) throw new Error("firebase_not_ready");
  if (!uid) throw new Error("missing_uid");

  const t = String(title || "").trim().slice(0, 120);
  const b = String(body || "").trim().slice(0, 2000);
  const img = String(imageUrl || "").trim();

  if (!t) throw new Error("missing_title");
  if (!b && !img) throw new Error("missing_body");

  const col = postsCollectionRef();
  if (!col) throw new Error("no_collection");

  const docRef = await addDoc(col, {
    authorUid: uid,
    authorNickname: String(authorNickname || "").trim().slice(0, 24),
    authorPhotoURL: String(authorPhotoURL || "").trim(),
    title: t,
    body: b,
    imageUrl: img,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    likedBy: []
  });

  return { ok: true, id: docRef.id };
}

export async function togglePostLike(postId, uid, shouldLike) {
  if (!firebaseReady || !firebaseDb) return { ok: false, error: "firebase_not_ready" };
  if (!postId || !uid) return { ok: false, error: "invalid" };

  const ref = postDocRef(postId);
  if (!ref) return { ok: false, error: "no_ref" };

  try {
    await updateDoc(ref, {
      likedBy: shouldLike ? arrayUnion(uid) : arrayRemove(uid)
    });
    return { ok: true };
  } catch (e) {
    const msg = String(e?.code || e?.message || "like_failed");
    console.warn("togglePostLike failed:", e);
    return { ok: false, error: msg };
  }
}

export async function updatePost(
  postId,
  uid,
  { title = "", body = "", imageUrl = "", authorNickname = "", authorPhotoURL = "" } = {}
) {
  if (!firebaseReady || !firebaseDb) return { ok: false, error: "firebase_not_ready" };
  if (!postId || !uid) return { ok: false, error: "invalid" };

  const t = String(title || "").trim().slice(0, 120);
  const b = String(body || "").trim().slice(0, 2000);
  const img = String(imageUrl || "").trim();
  if (!t) return { ok: false, error: "missing_title" };
  if (!b && !img) return { ok: false, error: "missing_body" };

  const ref = postDocRef(postId);
  if (!ref) return { ok: false, error: "no_ref" };

  try {
    await updateDoc(ref, {
      title: t,
      body: b,
      imageUrl: img,
      authorNickname: String(authorNickname || "").trim().slice(0, 24),
      authorPhotoURL: String(authorPhotoURL || "").trim(),
      updatedAt: serverTimestamp()
    });
    return { ok: true };
  } catch (e) {
    const msg = String(e?.code || e?.message || "update_failed");
    console.warn("updatePost failed:", e);
    return { ok: false, error: msg };
  }
}

export async function deletePost(postId, uid) {
  if (!firebaseReady || !firebaseDb) return { ok: false, error: "firebase_not_ready" };
  if (!postId || !uid) return { ok: false, error: "invalid" };

  const ref = postDocRef(postId);
  if (!ref) return { ok: false, error: "no_ref" };

  try {
    await deleteDoc(ref);
    return { ok: true };
  } catch (e) {
    const msg = String(e?.code || e?.message || "delete_failed");
    console.warn("deletePost failed:", e);
    return { ok: false, error: msg };
  }
}

export function subscribeComments(postId, { max = 50 } = {}, onChange, onError) {
  if (!firebaseReady || !firebaseDb) return () => {};
  if (!postId) return () => {};

  const col = commentsCollectionRef(postId);
  if (!col) return () => {};

  const capped = Math.max(1, Math.min(50, Number(max) || 50));
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

export async function addComment(postId, uid, { body = "", authorNickname = "", authorPhotoURL = "" } = {}) {
  if (!firebaseReady || !firebaseDb) return { ok: false, error: "firebase_not_ready" };
  if (!postId || !uid) return { ok: false, error: "invalid" };

  const b = String(body || "").trim().slice(0, 1000);
  if (!b) return { ok: false, error: "missing_body" };

  const col = commentsCollectionRef(postId);
  if (!col) return { ok: false, error: "no_collection" };

  try {
    await addDoc(col, {
      authorUid: uid,
      authorNickname: String(authorNickname || "").trim().slice(0, 24),
      authorPhotoURL: String(authorPhotoURL || "").trim(),
      body: b,
      createdAt: serverTimestamp()
    });
    return { ok: true };
  } catch (e) {
    const msg = String(e?.code || e?.message || "comment_failed");
    console.warn("addComment failed:", e);
    return { ok: false, error: msg };
  }
}
