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
import { firebaseDb, firebaseReady } from "./firebase";

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
  if (!firebaseReady) throw new Error("firebase_not_ready");
  if (!uid) throw new Error("missing_uid");
  if (!file) throw new Error("missing_file");

  if (signal && typeof signal === "object" && signal.aborted) throw new Error("upload_canceled");

  const isImage = String(file?.type || "").startsWith("image/");
  if (!isImage) throw new Error("not_image");

  const blobToDataUrl = async (blob) => {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("read_failed"));
      reader.onload = () => resolve(String(reader.result || ""));
      reader.readAsDataURL(blob);
    });
  };

  const fileToCompressedDataUrl = async ({ maxDim = 1280, maxBytes = 650_000 } = {}) => {
    let bitmap;
    try {
      bitmap = await createImageBitmap(file);
    } catch {
      const url = URL.createObjectURL(file);
      try {
        bitmap = await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error("decode_failed"));
          img.src = url;
        });
      } finally {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // ignore
        }
      }
    }

    const width = Number(bitmap?.width || 0);
    const height = Number(bitmap?.height || 0);
    if (!width || !height) throw new Error("decode_failed");

    let scale = 1;
    const maxSide = Math.max(width, height);
    if (maxSide > maxDim) scale = maxDim / maxSide;
    let dimW = Math.max(1, Math.round(width * scale));
    let dimH = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas_failed");

    let quality = 0.84;
    for (let attempt = 0; attempt < 10; attempt++) {
      if (signal && typeof signal === "object" && signal.aborted) throw new Error("upload_canceled");

      canvas.width = dimW;
      canvas.height = dimH;
      ctx.clearRect(0, 0, dimW, dimH);
      ctx.drawImage(bitmap, 0, 0, dimW, dimH);

      const blob = await new Promise((resolve) => {
        canvas.toBlob(
          (b) => resolve(b),
          "image/webp",
          quality
        );
      });

      if (blob && blob.size <= maxBytes) return await blobToDataUrl(blob);

      quality = Math.max(0.55, quality * 0.78);
      if (attempt >= 4) {
        dimW = Math.max(1, Math.round(dimW * 0.88));
        dimH = Math.max(1, Math.round(dimH * 0.88));
        quality = 0.82;
      }

      if (typeof onProgress === "function") {
        const pseudo = Math.max(0.05, Math.min(0.95, (attempt + 1) / 10));
        try {
          onProgress({ progress: pseudo, bytesTransferred: 0, totalBytes: 0, state: "running" });
        } catch {
          // ignore
        }
      }
    }

    throw new Error("image_too_large");
  };

  if (typeof onProgress === "function") {
    try {
      onProgress({ progress: 0.05, bytesTransferred: 0, totalBytes: 0, state: "running" });
    } catch {
      // ignore
    }
  }

  const dataUrl = await fileToCompressedDataUrl({ maxDim: 1280, maxBytes: 650_000 });

  if (typeof onProgress === "function") {
    try {
      onProgress({ progress: 1, bytesTransferred: 0, totalBytes: 0, state: "success" });
    } catch {
      // ignore
    }
  }

  return dataUrl;
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
