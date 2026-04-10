import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch
} from "firebase/firestore";
import { firebaseDb, firebaseReady } from "./firebase";

const ROOMS = "rooms";

export function roomDocRef(roomId) {
  if (!firebaseDb) return null;
  const safe = String(roomId || "").trim();
  if (!safe) return null;
  return doc(firebaseDb, ROOMS, safe);
}

export function roomPlayersColRef(roomId) {
  const ref = roomDocRef(roomId);
  if (!ref) return null;
  return collection(ref, "players");
}

export function subscribeOnlineRooms({ max = 25 } = {}, onChange, onError) {
  if (!firebaseReady || !firebaseDb) return () => {};
  const col = collection(firebaseDb, ROOMS);
  const q = query(
    col,
    where("status", "==", "lobby"),
    where("isListed", "==", true),
    limit(Math.max(1, Math.min(50, Number(max) || 25)))
  );

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

export function subscribeRoom(roomId, onChange, onError) {
  if (!firebaseReady || !firebaseDb) return () => {};
  const ref = roomDocRef(roomId);
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

export function subscribeRoomPlayers(roomId, onChange, onError) {
  if (!firebaseReady || !firebaseDb) return () => {};
  const col = roomPlayersColRef(roomId);
  if (!col) return () => {};
  const q = query(col, orderBy("joinedAt", "asc"), limit(50));

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

export async function createOnlineRoom({
  hostUid,
  hostNickname,
  name,
  roomCode,
  gameMode,
  answerMode,
  questionCount,
  perQuestionMs
} = {}) {
  if (!firebaseReady || !firebaseDb) return { ok: false, error: "firebase_not_ready" };
  const uid = String(hostUid || "").trim();
  if (!uid) return { ok: false, error: "missing_uid" };

  const roomName = String(name || "").trim().slice(0, 40);
  const code = String(roomCode || "").trim().slice(0, 20);

  const isPrivate = Boolean(code);
  const col = collection(firebaseDb, ROOMS);

  let docRef;
  if (isPrivate) {
    // When a room code is provided, we use it as the document id.
    // This enables joining by code via a direct get (no query required).
    const normalized = code;
    if (!/^[A-Za-z0-9_-]{4,20}$/.test(normalized)) {
      return { ok: false, error: "invalid_room_code" };
    }

    docRef = doc(firebaseDb, ROOMS, normalized);
    const existsSnap = await getDoc(docRef);
    if (existsSnap.exists()) return { ok: false, error: "room_code_taken" };
  } else {
    docRef = doc(col);
  }

  const payload = {
    status: "lobby", // lobby | playing | finished | closed
    isListed: !isPrivate,
    roomName: roomName || "ห้องออนไลน์",
    roomCode: code || "",
    gameMode: String(gameMode || "standard"), // standard | battle_royale
    hostUid: uid,
    hostNickname: String(hostNickname || "").trim().slice(0, 14),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    playerCount: 0,
    lastEmptyAt: null,
    lastNonEmptyAt: null,
    answerMode: String(answerMode || "choice6"),
    questionCount: Math.max(1, Math.min(20, Number(questionCount) || 5)),
    perQuestionMs: Math.max(5_000, Math.min(60_000, Number(perQuestionMs) || 15_000)),
    questionIndex: 0,
    questions: [],
    questionStartedAt: null
  };

  await setDoc(docRef, payload, { merge: true });

  // Host joins immediately as a player.
  await joinOnlineRoom({ roomId: docRef.id, uid, nickname: payload.hostNickname || "Host" });

  return { ok: true, roomId: docRef.id };
}

export async function joinOnlineRoom({ roomId, uid, nickname } = {}) {
  if (!firebaseReady || !firebaseDb) return { ok: false, error: "firebase_not_ready" };
  const safeRoomId = String(roomId || "").trim();
  const safeUid = String(uid || "").trim();
  if (!safeRoomId) return { ok: false, error: "missing_room_id" };
  if (!safeUid) return { ok: false, error: "missing_uid" };

  const roomRef = roomDocRef(safeRoomId);
  if (!roomRef) return { ok: false, error: "bad_room_ref" };

  const roomSnap = await getDoc(roomRef);
  if (!roomSnap.exists()) return { ok: false, error: "room_not_found" };
  const roomData = roomSnap.data() || {};

  const playerRef = doc(roomRef, "players", safeUid);
  const nick = String(nickname || "").trim().slice(0, 14);

  const existing = await getDoc(playerRef).catch(() => null);
  const isNew = !existing || !existing.exists();
  const existingData = !isNew && existing ? existing.data() : null;
  const prevNick = String(existingData?.nickname || "").trim().slice(0, 14);

  // Prevent new players from joining mid-game (existing players can re-open without losing state).
  if (isNew && String(roomData.status || "") !== "lobby") {
    return { ok: false, error: "not_lobby" };
  }

  if (isNew) {
    const playersCol = roomPlayersColRef(safeRoomId);
    if (playersCol) {
      const snap = await getDocs(query(playersCol, limit(6))).catch(() => null);
      if (snap && typeof snap.size === "number" && snap.size >= 6) {
        return { ok: false, error: "room_full" };
      }
    }
  }

  await setDoc(
    playerRef,
    {
      uid: safeUid,
      nickname: nick || prevNick || "ผู้เล่น",
      ...(isNew
        ? {
            ready: false,
            score: 0,
            hp: 15,
            wrongStreak: 0,
            eliminated: false,
            eliminatedAt: null,
            answeredAtIndex: -1,
            lastPickId: null,
            lastCorrect: null,
            joinedAt: serverTimestamp()
          }
        : {}),
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );

  await updateDoc(roomRef, { updatedAt: serverTimestamp() }).catch(async () => {
    await setDoc(roomRef, { updatedAt: serverTimestamp() }, { merge: true }).catch(() => {});
  });

  return { ok: true };
}

export async function leaveOnlineRoom({ roomId, uid } = {}) {
  if (!firebaseReady || !firebaseDb) return { ok: false, error: "firebase_not_ready" };
  const safeRoomId = String(roomId || "").trim();
  const safeUid = String(uid || "").trim();
  if (!safeRoomId || !safeUid) return { ok: false, error: "missing_params" };

  const roomRef = roomDocRef(safeRoomId);
  if (!roomRef) return { ok: false, error: "bad_room_ref" };

  const playerRef = doc(roomRef, "players", safeUid);
  await deleteDoc(playerRef).catch(() => {});

  await updateDoc(roomRef, { updatedAt: serverTimestamp() }).catch(() => {});
  return { ok: true };
}

export async function setOnlineReady({ roomId, uid, ready } = {}) {
  if (!firebaseReady || !firebaseDb) return { ok: false, error: "firebase_not_ready" };
  const roomRef = roomDocRef(roomId);
  if (!roomRef) return { ok: false, error: "bad_room_ref" };
  const safeUid = String(uid || "").trim();
  if (!safeUid) return { ok: false, error: "missing_uid" };

  const playerRef = doc(roomRef, "players", safeUid);
  await updateDoc(playerRef, { ready: Boolean(ready), updatedAt: serverTimestamp() }).catch(async () => {
    await setDoc(playerRef, { ready: Boolean(ready), updatedAt: serverTimestamp() }, { merge: true }).catch(() => {});
  });
  return { ok: true };
}

export async function startOnlineRoomGame({ roomId, hostUid, questions, answerMode, questionCount, perQuestionMs } = {}) {
  if (!firebaseReady || !firebaseDb) return { ok: false, error: "firebase_not_ready" };
  const roomRef = roomDocRef(roomId);
  if (!roomRef) return { ok: false, error: "bad_room_ref" };
  const uid = String(hostUid || "").trim();
  if (!uid) return { ok: false, error: "missing_uid" };

  const ids = Array.isArray(questions) ? questions.map((x) => Number(x)).filter((n) => Number.isFinite(n)) : [];
  if (!ids.length) return { ok: false, error: "no_questions" };

  const playersCol = roomPlayersColRef(roomId);
  const playersSnap = playersCol ? await getDocs(playersCol) : null;
  const batch = writeBatch(firebaseDb);

  if (playersSnap) {
    for (const d of playersSnap.docs) {
      batch.set(
        d.ref,
        {
          ready: false,
          score: 0,
          hp: 15,
          wrongStreak: 0,
          eliminated: false,
          eliminatedAt: null,
          answeredAtIndex: -1,
          lastPickId: null,
          lastCorrect: null,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
    }
  }

  batch.set(
    roomRef,
    {
      status: "playing",
      updatedAt: serverTimestamp(),
      startedAt: serverTimestamp(),
      endedAt: null,
      countdownEndsAtMs: null,
      answerMode: String(answerMode || "choice6"),
      questionCount: Math.max(1, Math.min(20, Number(questionCount) || ids.length)),
      perQuestionMs: Math.max(5_000, Math.min(60_000, Number(perQuestionMs) || 15_000)),
      questions: ids,
      questionIndex: 0,
      questionStartedAt: serverTimestamp()
    },
    { merge: true }
  );

  await batch.commit();
  return { ok: true };
}

export async function beginOnlineRoomCountdown({ roomId, hostUid, seconds = 5 } = {}) {
  if (!firebaseReady || !firebaseDb) return { ok: false, error: "firebase_not_ready" };
  const roomRef = roomDocRef(roomId);
  if (!roomRef) return { ok: false, error: "bad_room_ref" };
  const uid = String(hostUid || "").trim();
  if (!uid) return { ok: false, error: "missing_uid" };

  const s = Math.max(1, Math.min(10, Math.floor(Number(seconds) || 5)));
  const endsAtMs = Date.now() + s * 1000;

  try {
    await runTransaction(firebaseDb, async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists()) throw new Error("room_not_found");
      const room = snap.data() || {};
      if (String(room.hostUid || "") !== uid) throw new Error("not_host");
      if (String(room.status || "") !== "lobby") throw new Error("not_lobby");

      tx.set(
        roomRef,
        {
          countdownEndsAtMs: endsAtMs,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
    });
    return { ok: true, endsAtMs };
  } catch (e) {
    const msg = String(e?.message || e?.code || "countdown_failed");
    return { ok: false, error: msg };
  }
}

export async function submitOnlineAnswer({ roomId, uid, questionIndex, pickId, correctId, points = 1 } = {}) {
  if (!firebaseReady || !firebaseDb) return { ok: false, error: "firebase_not_ready" };
  const roomRef = roomDocRef(roomId);
  if (!roomRef) return { ok: false, error: "bad_room_ref" };
  const safeUid = String(uid || "").trim();
  if (!safeUid) return { ok: false, error: "missing_uid" };

  const playerRef = doc(roomRef, "players", safeUid);
  const qIdx = Math.max(0, Math.floor(Number(questionIndex) || 0));
  const picked = pickId == null ? null : Number(pickId);
  const correct = correctId == null ? null : Number(correctId);
  const isCorrect = Number.isFinite(picked) && Number.isFinite(correct) && picked === correct;
  const amount = Math.max(0, Math.floor(Number(points) || 1));

  try {
    await runTransaction(firebaseDb, async (tx) => {
      const roomSnap = await tx.get(roomRef);
      const room = roomSnap.exists() ? roomSnap.data() || {} : {};
      if (String(room.status || "") !== "playing") return;

      const snap = await tx.get(playerRef);
      const data = snap.exists() ? snap.data() : {};
      const answeredAtIndex = Math.floor(Number(data?.answeredAtIndex) || -1);
      if (answeredAtIndex === qIdx) return;

      if (data?.eliminated === true) return;

      const gameMode = String(room.gameMode || "standard");
      if (gameMode === "battle_royale") {
        const prevScore = Math.max(0, Math.floor(Number(data?.score) || 0));
        const prevHp = Math.max(0, Math.floor(Number(data?.hp) || 15));
        const prevStreak = Math.max(0, Math.floor(Number(data?.wrongStreak) || 0));

        if (isCorrect) {
          tx.set(
            playerRef,
            {
              uid: safeUid,
              answeredAtIndex: qIdx,
              lastPickId: Number.isFinite(picked) ? picked : null,
              lastCorrect: true,
              score: prevScore + 1,
              wrongStreak: 0,
              updatedAt: serverTimestamp()
            },
            { merge: true }
          );
          return;
        }

        const nextStreak = prevStreak + 1;
        const penalty = Math.min(1_000_000, Math.pow(2, Math.max(0, nextStreak - 1)));
        const nextScore = Math.max(0, prevScore - penalty);
        const nextHp = Math.max(0, prevHp - 1);
        const eliminated = nextHp <= 0;

        tx.set(
          playerRef,
          {
            uid: safeUid,
            answeredAtIndex: qIdx,
            lastPickId: Number.isFinite(picked) ? picked : null,
            lastCorrect: false,
            score: nextScore,
            hp: nextHp,
            wrongStreak: nextStreak,
            eliminated,
            ...(eliminated ? { eliminatedAt: serverTimestamp() } : {}),
            updatedAt: serverTimestamp()
          },
          { merge: true }
        );
        return;
      }

      tx.set(
        playerRef,
        {
          uid: safeUid,
          answeredAtIndex: qIdx,
          lastPickId: Number.isFinite(picked) ? picked : null,
          lastCorrect: isCorrect,
          updatedAt: serverTimestamp(),
          ...(isCorrect ? { score: increment(amount) } : {})
        },
        { merge: true }
      );
    });
    return { ok: true, correct: isCorrect };
  } catch (e) {
    const msg = String(e?.code || e?.message || "firestore_write_failed");
    return { ok: false, error: msg };
  }
}

export async function advanceOnlineRoomQuestion({ roomId, hostUid } = {}) {
  if (!firebaseReady || !firebaseDb) return { ok: false, error: "firebase_not_ready" };
  const roomRef = roomDocRef(roomId);
  if (!roomRef) return { ok: false, error: "bad_room_ref" };
  const uid = String(hostUid || "").trim();
  if (!uid) return { ok: false, error: "missing_uid" };

  try {
    await runTransaction(firebaseDb, async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists()) return;
      const room = snap.data() || {};
      if (String(room.hostUid || "") !== uid) return;
      if (String(room.status || "") !== "playing") return;

      const questions = Array.isArray(room.questions) ? room.questions : [];
      const idx = Math.max(0, Math.floor(Number(room.questionIndex) || 0));
      const gameMode = String(room.gameMode || "standard");
      const next = idx + 1;

      if (gameMode === "battle_royale") {
        // Unlimited rounds: keep cycling through the prepared question list.
        if (!questions.length) {
          tx.set(
            roomRef,
            {
              status: "finished",
              endedAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            },
            { merge: true }
          );
          return;
        }

        tx.set(
          roomRef,
          {
            questionIndex: next % questions.length,
            questionStartedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          },
          { merge: true }
        );
        return;
      }

      if (next >= questions.length) {
        tx.set(
          roomRef,
          {
            status: "finished",
            endedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          },
          { merge: true }
        );
        return;
      }

      tx.set(
        roomRef,
        {
          questionIndex: next,
          questionStartedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
    });
    return { ok: true };
  } catch (e) {
    const msg = String(e?.code || e?.message || "firestore_write_failed");
    return { ok: false, error: msg };
  }
}

export async function finishOnlineRoomGame({ roomId, hostUid } = {}) {
  if (!firebaseReady || !firebaseDb) return { ok: false, error: "firebase_not_ready" };
  const roomRef = roomDocRef(roomId);
  if (!roomRef) return { ok: false, error: "bad_room_ref" };
  const uid = String(hostUid || "").trim();
  if (!uid) return { ok: false, error: "missing_uid" };

  try {
    await runTransaction(firebaseDb, async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists()) return;
      const room = snap.data() || {};
      if (String(room.hostUid || "") !== uid) return;
      if (String(room.status || "") !== "playing") return;

      tx.set(
        roomRef,
        {
          status: "finished",
          endedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
    });
    return { ok: true };
  } catch (e) {
    const msg = String(e?.code || e?.message || "firestore_write_failed");
    return { ok: false, error: msg };
  }
}

export async function resetOnlineRoomToLobby({ roomId, hostUid } = {}) {
  if (!firebaseReady || !firebaseDb) return { ok: false, error: "firebase_not_ready" };
  const roomRef = roomDocRef(roomId);
  if (!roomRef) return { ok: false, error: "bad_room_ref" };
  const uid = String(hostUid || "").trim();
  if (!uid) return { ok: false, error: "missing_uid" };

  try {
    const snap = await getDoc(roomRef);
    if (!snap.exists()) return { ok: false, error: "room_not_found" };
    const room = snap.data() || {};
    if (String(room.hostUid || "") !== uid) return { ok: false, error: "not_host" };

    const playersCol = roomPlayersColRef(roomId);
    const playersSnap = playersCol ? await getDocs(playersCol) : null;
    const batch = writeBatch(firebaseDb);

    if (playersSnap) {
      for (const d of playersSnap.docs) {
        batch.set(
          d.ref,
          {
            ready: false,
            score: 0,
            hp: 15,
            wrongStreak: 0,
            eliminated: false,
            eliminatedAt: null,
            answeredAtIndex: -1,
            lastPickId: null,
            lastCorrect: null,
            updatedAt: serverTimestamp()
          },
          { merge: true }
        );
      }
    }

    batch.set(
      roomRef,
      {
        status: "lobby",
        questions: [],
        questionIndex: 0,
        questionStartedAt: null,
        startedAt: null,
        endedAt: null,
        countdownEndsAtMs: null,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    await batch.commit();
    return { ok: true };
  } catch (e) {
    const msg = String(e?.code || e?.message || "firestore_write_failed");
    return { ok: false, error: msg };
  }
}

export async function closeOnlineRoom({ roomId, hostUid } = {}) {
  if (!firebaseReady || !firebaseDb) return { ok: false, error: "firebase_not_ready" };
  const roomRef = roomDocRef(roomId);
  if (!roomRef) return { ok: false, error: "bad_room_ref" };
  const uid = String(hostUid || "").trim();
  if (!uid) return { ok: false, error: "missing_uid" };

  try {
    await runTransaction(firebaseDb, async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists()) return;
      const room = snap.data() || {};
      if (String(room.hostUid || "") !== uid) return;
      tx.set(
        roomRef,
        {
          status: "closed",
          updatedAt: serverTimestamp(),
          endedAt: serverTimestamp()
        },
        { merge: true }
      );
    });
    return { ok: true };
  } catch (e) {
    const msg = String(e?.code || e?.message || "firestore_write_failed");
    return { ok: false, error: msg };
  }
}

export async function findRoomByCode({ roomCode } = {}) {
  if (!firebaseReady || !firebaseDb) return { ok: false, error: "firebase_not_ready" };
  const code = String(roomCode || "").trim();
  if (!code) return { ok: false, error: "missing_code" };

  // Room code is the document id.
  const ref = roomDocRef(code);
  if (!ref) return { ok: false, error: "not_found" };
  const snap = await getDoc(ref);
  if (!snap.exists()) return { ok: false, error: "not_found" };
  const data = snap.data() || {};
  if (String(data.status || "") !== "lobby") return { ok: false, error: "not_found" };
  return { ok: true, room: { id: snap.id, ...data } };
}

export function roomMessagesColRef(roomId) {
  const ref = roomDocRef(roomId);
  if (!ref) return null;
  return collection(ref, "messages");
}

export function subscribeRoomMessages({ roomId, max = 50 } = {}, onChange, onError) {
  if (!firebaseReady || !firebaseDb) return () => {};
  const col = roomMessagesColRef(roomId);
  if (!col) return () => {};

  const q = query(col, orderBy("createdAt", "asc"), limit(Math.max(1, Math.min(100, Number(max) || 50))));

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

export async function sendRoomMessage({ roomId, uid, nickname, text } = {}) {
  if (!firebaseReady || !firebaseDb) return { ok: false, error: "firebase_not_ready" };
  const safeRoomId = String(roomId || "").trim();
  const safeUid = String(uid || "").trim();
  if (!safeRoomId) return { ok: false, error: "missing_room_id" };
  if (!safeUid) return { ok: false, error: "missing_uid" };

  const msg = String(text || "").trim();
  if (!msg) return { ok: false, error: "empty_message" };

  const roomRef = roomDocRef(safeRoomId);
  if (!roomRef) return { ok: false, error: "bad_room_ref" };

  const col = collection(roomRef, "messages");
  const ref = doc(col);

  const nick = String(nickname || "").trim().slice(0, 14) || "ผู้เล่น";
  const clipped = msg.slice(0, 300);

  await setDoc(
    ref,
    {
      uid: safeUid,
      nickname: nick,
      text: clipped,
      createdAt: serverTimestamp()
    },
    { merge: true }
  );

  return { ok: true };
}

export async function updateOnlineRoomSettings({ roomId, hostUid, roomName, gameMode, answerMode, questionCount, perQuestionMs } = {}) {
  if (!firebaseReady || !firebaseDb) return { ok: false, error: "firebase_not_ready" };
  const safeRoomId = String(roomId || "").trim();
  const uid = String(hostUid || "").trim();
  if (!safeRoomId) return { ok: false, error: "missing_room_id" };
  if (!uid) return { ok: false, error: "missing_uid" };

  const roomRef = roomDocRef(safeRoomId);
  if (!roomRef) return { ok: false, error: "bad_room_ref" };

  const cleanName = String(roomName || "").trim().slice(0, 40) || "ห้องออนไลน์";
  const cleanGameMode = String(gameMode || "standard");
  const cleanAnswerMode = String(answerMode || "choice6");
  const cleanCount = Math.max(1, Math.min(20, Math.floor(Number(questionCount) || 5)));
  const cleanPer = Math.max(5_000, Math.min(60_000, Math.floor(Number(perQuestionMs) || 15_000)));

  try {
    await runTransaction(firebaseDb, async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists()) throw new Error("room_not_found");
      const room = snap.data() || {};
      if (String(room.hostUid || "") !== uid) throw new Error("not_host");
      if (String(room.status || "") !== "lobby") throw new Error("not_lobby");

      tx.set(
        roomRef,
        {
          roomName: cleanName,
          gameMode: cleanGameMode,
          answerMode: cleanAnswerMode,
          questionCount: cleanCount,
          perQuestionMs: cleanPer,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
    });

    return { ok: true };
  } catch (e) {
    const msg = String(e?.message || e?.code || "update_failed");
    return { ok: false, error: msg };
  }
}

export async function kickOnlineRoomPlayer({ roomId, hostUid, targetUid } = {}) {
  if (!firebaseReady || !firebaseDb) return { ok: false, error: "firebase_not_ready" };
  const safeRoomId = String(roomId || "").trim();
  const uid = String(hostUid || "").trim();
  const target = String(targetUid || "").trim();
  if (!safeRoomId) return { ok: false, error: "missing_room_id" };
  if (!uid) return { ok: false, error: "missing_uid" };
  if (!target) return { ok: false, error: "missing_target" };
  if (target === uid) return { ok: false, error: "cannot_kick_self" };

  const roomRef = roomDocRef(safeRoomId);
  if (!roomRef) return { ok: false, error: "bad_room_ref" };
  const playerRef = doc(roomRef, "players", target);

  try {
    await runTransaction(firebaseDb, async (tx) => {
      const snap = await tx.get(roomRef);
      if (!snap.exists()) throw new Error("room_not_found");
      const room = snap.data() || {};
      if (String(room.hostUid || "") !== uid) throw new Error("not_host");
      if (String(room.status || "") !== "lobby") throw new Error("not_lobby");

      tx.delete(playerRef);
      tx.set(roomRef, { updatedAt: serverTimestamp() }, { merge: true });
    });
    return { ok: true };
  } catch (e) {
    const msg = String(e?.message || e?.code || "kick_failed");
    return { ok: false, error: msg };
  }
}
