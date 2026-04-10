const { onSchedule } = require("firebase-functions/v2/scheduler");
const { setGlobalOptions } = require("firebase-functions/v2");

const { initializeApp } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");

initializeApp();

setGlobalOptions({ region: "asia-southeast1" });

const db = getFirestore();

exports.cleanupEmptyRooms = onSchedule(
  {
    schedule: "every 5 minutes",
    timeZone: "Asia/Bangkok",
    retryCount: 0
  },
  async () => {
    const cutoff = Timestamp.fromMillis(Date.now() - 30 * 60 * 1000);

    // Find rooms with no activity for 30 minutes.
    // We then confirm the room is truly empty by checking its players subcollection.
    const snap = await db.collection("rooms").where("updatedAt", "<=", cutoff).limit(500).get();

    if (!snap.size) return;

    const victims = [];
    const docs = snap.docs;

    const checkChunkSize = 25;
    for (let i = 0; i < docs.length; i += checkChunkSize) {
      const chunk = docs.slice(i, i + checkChunkSize);
      const emptyRefs = await Promise.all(
        chunk.map(async (docSnap) => {
          const roomRef = docSnap.ref;
          const playersSnap = await roomRef.collection("players").limit(1).get();
          return playersSnap.size ? null : roomRef;
        })
      );
      for (const ref of emptyRefs) {
        if (ref) victims.push(ref);
      }
    }

    if (!victims.length) return;

    // Delete rooms recursively (players/messages subcollections included).
    // Run in small batches to avoid overloading.
    const chunkSize = 10;
    for (let i = 0; i < victims.length; i += chunkSize) {
      const chunk = victims.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map((ref) =>
          db.recursiveDelete(ref).catch((e) => {
            console.warn("recursiveDelete failed", ref.path, e);
          })
        )
      );
    }
  }
);
