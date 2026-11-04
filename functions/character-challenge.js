const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { getFirestore } = require('firebase-admin/firestore');
const { randomBytes } = require('node:crypto');
const catalog = require('./character-catalog.json');
exports.characterChallenge = onCall({region:'asia-southeast1', timeoutSeconds:60}, async request => {
 if (!request.auth) throw new HttpsError('unauthenticated','กรุณาเข้าสู่ระบบ');
 const engine = await import('./character-engine.mjs');
 const uid = request.auth.uid;
 const {action, roomId, answer, revision} = request.data || {};
 const db = getFirestore();
 const nickname = String(request.data?.nickname || 'Player').trim().slice(0,24) || 'Player';
 if (action === 'create') {
  const ref = db.collection('characterRooms').doc(randomBytes(6).toString('hex').toUpperCase());
  await ref.create({status:'lobby', players:[{id:uid,name:nickname,hearts:2}], memberIds:[uid], createdAt:Date.now()});
  return {roomId:ref.id};
 }
 if (!/^[A-F0-9]{12}$/.test(String(roomId))) throw new HttpsError('invalid-argument','รหัสห้องไม่ถูกต้อง');
 const ref = db.collection('characterRooms').doc(roomId);
 // Check membership and turn before making any external request.
 const initial = (await ref.get()).data();
 if (!initial) throw new HttpsError('not-found','ไม่พบห้อง');
 if (action !== 'join' && !initial.memberIds.includes(uid)) throw new HttpsError('permission-denied','ไม่ได้อยู่ในห้องนี้');
 let character = null;
 if (action === 'answer') {
  if (initial.status !== 'playing' || initial.players[initial.turn].id !== uid || initial.revision !== revision || Date.now() < initial.revealUntil) throw new HttpsError('failed-precondition','ยังไม่ถึงตาของคุณ');
  if (typeof answer !== 'string' || answer.length > 100) throw new HttpsError('invalid-argument','คำตอบยาวเกินไป');
  if (engine.normalize(answer).startsWith(initial.letter.toLowerCase())) {
   try { character = await engine.lookupCharacter(answer,catalog); }
   catch { throw new HttpsError('unavailable','ค้นหาขัดข้อง กรุณาลองใหม่ ไม่เสียหัวใจ'); }
  }
 }
 await db.runTransaction(async tx => {
  const s = (await tx.get(ref)).data();
  if (action === 'join') {
   if (s.memberIds.includes(uid)) return;
   if (s.status !== 'lobby' || s.players.length !== 1) throw new HttpsError('failed-precondition','ห้องเต็มหรือเริ่มแล้ว');
   const players = [...s.players,{id:uid,name:nickname}];
   tx.update(ref,{...engine.startGame(players), memberIds:players.map(p=>p.id)});
  } else if (action === 'answer') {
   if (s.status !== 'playing' || s.players[s.turn].id !== uid || s.revision !== revision || Date.now() < s.revealUntil) throw new HttpsError('failed-precondition','ตานี้จบแล้ว');
   tx.update(ref,engine.applyAnswer(s,character));
  } else if (action === 'leave') {
   tx.update(ref,{status:'closed'});
  } else throw new HttpsError('invalid-argument','คำสั่งไม่ถูกต้อง');
 });
 return {roomId};
});
