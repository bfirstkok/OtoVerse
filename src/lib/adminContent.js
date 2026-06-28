import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  writeBatch,
  updateDoc,
  where
} from "firebase/firestore";
import { firebaseDb } from "@/lib/firebase";
import { getEffectiveAnimeGenre } from "@/lib/animeGenre";

const COLLECTION_NAME = "animeSongs";

function requireDb() {
  if (!firebaseDb) {
    throw new Error("Firebase ยังไม่ได้ตั้งค่า กรุณาตรวจสอบค่า VITE_FIREBASE_*");
  }
  return firebaseDb;
}

export function normalizeAltTitles(value) {
  const values = Array.isArray(value)
    ? value
    : String(value || "").split(/[\n,]+/);

  return [...new Set(values.map((item) => String(item || "").trim()).filter(Boolean))];
}

function normalizeCharacters(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((character, index) => ({
      id: character?.id ?? index + 1,
      name: String(character?.name || "").trim(),
      role: String(character?.role || "").trim(),
      image: String(character?.image || "").trim(),
      bio: String(character?.bio || "").trim()
    }))
    .filter((character) => character.name || character.bio || character.image);
}

function parseAnimeSongTitle(value) {
  const title = String(value || "").trim();
  const match = title.match(/^(.*?)\s*\((OP|ED)\s*(\d*)\)\s*$/i);
  return {
    animeTitle: String(match?.[1] || title).trim(),
    songType: String(match?.[2] || "OP").toUpperCase(),
    songNumber: Math.max(1, Number(match?.[3]) || 1)
  };
}

function cleanAnimeSong(data) {
  const parsedYear = Number(data?.year);
  const parsedTitle = parseAnimeSongTitle(data?.title);
  const animeTitle = String(data?.animeTitle || parsedTitle.animeTitle).trim();
  const songType = ["OP", "ED"].includes(String(data?.songType || "").toUpperCase())
    ? String(data.songType).toUpperCase()
    : parsedTitle.songType;
  const songNumber = Math.max(1, Number(data?.songNumber) || parsedTitle.songNumber);
  const payload = {
    title: animeTitle ? `${animeTitle} (${songType}${songNumber})` : "",
    animeTitle,
    songType,
    songNumber,
    altTitles: normalizeAltTitles(data?.altTitles),
    acceptedAnswers: normalizeAltTitles(data?.acceptedAnswers),
    songTitle: String(data?.songTitle || "").trim(),
    artist: String(data?.artist || "").trim(),
    youtubeVideoId: String(data?.youtubeVideoId || "").trim(),
    imageUrl: String(data?.imageUrl || "").trim(),
    genre: String(data?.genre || "").trim() || "other",
    difficulty: String(data?.difficulty || "").trim() || "medium",
    year: Number.isFinite(parsedYear) && parsedYear > 0 ? Math.trunc(parsedYear) : null,
    note: String(data?.note || "").trim(),
    synopsis: String(data?.synopsis || "").trim(),
    characters: normalizeCharacters(data?.characters),
    isActive: data?.isActive !== false
  };
  payload.genre = getEffectiveAnimeGenre(payload);
  return payload;
}

function withId(snapshot) {
  const item = { id: snapshot.id, ...snapshot.data() };
  const parsedTitle = parseAnimeSongTitle(item.title);
  return {
    ...item,
    animeTitle: String(item.animeTitle || parsedTitle.animeTitle),
    songType: String(item.songType || parsedTitle.songType),
    songNumber: Number(item.songNumber || parsedTitle.songNumber),
    genre: getEffectiveAnimeGenre(item)
  };
}

export function subscribeAnimeSongs(callback) {
  const db = requireDb();
  return onSnapshot(
    collection(db, COLLECTION_NAME),
    (snapshot) => {
      const items = snapshot.docs
        .map(withId)
        .sort((a, b) => String(a.title || "").localeCompare(String(b.title || ""), "th"));
      callback(items, null);
    },
    (error) => callback([], error)
  );
}

export async function loadActiveAnimeSongs() {
  const db = requireDb();
  const snapshot = await getDocs(
    query(collection(db, COLLECTION_NAME), where("isActive", "==", true))
  );
  return snapshot.docs.map(withId);
}

export function subscribeActiveAnimeSongs(callback) {
  const db = requireDb();
  return onSnapshot(
    query(collection(db, COLLECTION_NAME), where("isActive", "==", true)),
    (snapshot) => callback(snapshot.docs.map(withId), null),
    (error) => callback([], error)
  );
}

export async function createAnimeSong(data) {
  const payload = cleanAnimeSong(data);
  if (!payload.title) throw new Error("กรุณากรอกชื่ออนิเมะ");

  const result = await addDoc(collection(requireDb(), COLLECTION_NAME), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return result.id;
}

export async function updateAnimeSong(id, data) {
  if (!id) throw new Error("ไม่พบรหัสรายการ");
  const payload = cleanAnimeSong(data);
  if (!payload.title) throw new Error("กรุณากรอกชื่ออนิเมะ");

  await updateDoc(doc(requireDb(), COLLECTION_NAME, id), {
    ...payload,
    updatedAt: serverTimestamp()
  });
}

export async function deleteAnimeSong(id) {
  if (!id) throw new Error("ไม่พบรหัสรายการ");
  await deleteDoc(doc(requireDb(), COLLECTION_NAME, id));
}

export async function importAnimeSongs(items) {
  const source = Array.isArray(items) ? items : [];
  if (!source.length) return 0;

  const db = requireDb();
  const batchSize = 100;
  let imported = 0;

  for (let offset = 0; offset < source.length; offset += batchSize) {
    const batch = writeBatch(db);
    const chunk = source.slice(offset, offset + batchSize);

    chunk.forEach((item, index) => {
      const legacyId = String(item?.legacyId ?? item?.id ?? offset + index + 1);
      const documentId = String(item?.documentId || `legacy-${legacyId}`)
        .replace(/[^a-zA-Z0-9_-]/g, "-");
      const payload = cleanAnimeSong(item);
      if (!payload.title) return;

      batch.set(doc(db, COLLECTION_NAME, documentId), {
        ...payload,
        legacyId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      imported += 1;
    });

    await batch.commit();
  }

  return imported;
}

export async function getAdminRole(uid) {
  if (!uid) return null;
  const snapshot = await getDoc(doc(requireDb(), "admins", uid));
  if (!snapshot.exists()) return null;
  return snapshot.data()?.role || null;
}
