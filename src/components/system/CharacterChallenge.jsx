import React, {useEffect, useRef, useState} from 'react';
import {doc, onSnapshot} from 'firebase/firestore';
import {getFunctions, httpsCallable} from 'firebase/functions';
import {firebaseApp, firebaseDb, firebaseReady} from '@/lib/firebase';
import {applyAnswer, lookupCharacter, normalize, startGame} from '../../../functions/character-engine.mjs';
import './character-challenge.css';

export default function CharacterChallenge({user, onBack}) {
 const [game,setGame] = useState(null);
 const [roomId,setRoomId] = useState('');
 const [code,setCode] = useState('');
 const [names,setNames] = useState(['ผู้เล่น 1','ผู้เล่น 2']);
 const [answer,setAnswer] = useState('');
 const [busy,setBusy] = useState(false);
 const [error,setError] = useState('');
 const [now,setNow] = useState(Date.now());
 const [music,setMusic] = useState(true);
 const lock = useRef(false);
 const generation = useRef(0);
 const catalog = useRef(null);
 const active = useRef(true);
 useEffect(() => {active.current=true; return () => {active.current=false; generation.current++;};},[]);
 useEffect(() => {
  if (!roomId) return;
  setGame(null);
  const unsubscribe = onSnapshot(doc(firebaseDb,'characterRooms',roomId), snapshot => {
   setGame(snapshot.exists() ? snapshot.data() : null); setAnswer('');
  }, () => setError('เชื่อมต่อห้องไม่ได้ กรุณาออกแล้วลองใหม่'));
  return unsubscribe;
 },[roomId]);
 useEffect(() => {
  if (!game?.revealUntil) return;
  const tick = setInterval(() => setNow(Date.now()),200);
  return () => clearInterval(tick);
 },[game?.revealUntil]);
 const revealing = !!game?.reveal && now < game.revealUntil;
 const canAnswer = game?.status === 'playing' && !revealing && (!roomId || game.players[game.turn].id === user?.uid);
 async function call(action, extra={}) {
  return (await httpsCallable(getFunctions(firebaseApp,'asia-southeast1'),'characterChallenge')({action,roomId,nickname:user?.displayName || names[0],...extra})).data;
 }
 async function run(work) {
  if(lock.current) return;
  lock.current=true; setBusy(true); setError('');
  try {await work();} catch(e) {if(active.current) setError(e.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');}
  finally {lock.current=false; if(active.current) setBusy(false);}
 }
 async function submit(event) {
  event.preventDefault();
  if (!canAnswer || busy) return;
  const token = generation.current;
  await run(async () => {
   if(roomId) await call('answer',{answer,revision:game.revision});
   else {
    let character=null;
    if(normalize(answer).startsWith(game.letter.toLowerCase())) {
     if(!catalog.current) catalog.current=(await import('../../../functions/character-catalog.json')).default;
     character=await lookupCharacter(answer,catalog.current);
    }
    if(!active.current || token !== generation.current) return;
    setGame(applyAnswer(game,character)); setNow(Date.now()); setAnswer('');
   }
  });
 }
 function reset() {generation.current++; setRoomId(''); setGame(null); setAnswer(''); setError('');}
 return <section className="character-challenge" aria-label="ท้าชื่อตัวละคร">
  <button disabled={busy} onClick={() => run(async () => {if(roomId) await call('leave'); onBack();})}>← กลับหน้าหลัก</button>
  <h1>ตัวอักษรท้าชื่อตัวละคร</h1>
  <p>ผลัดกันพิมพ์ชื่อภาษาอังกฤษขึ้นต้นด้วยตัวอักษรที่สุ่ม • คนละ 2 หัวใจ • ห้ามใช้ตัวละครซ้ำ</p>
  <p>รับชื่อเต็มและชื่อเล่นที่มีในฐานข้อมูล ไม่สนตัวพิมพ์เล็กใหญ่ สุ่ม A–Z ใหม่ทุกตา ตอบผิดหรือยอมแพ้เสีย 1 หัวใจ</p>
  <label><input type="checkbox" checked={music} onChange={e=>setMusic(e.target.checked)}/> เปิดเพลงตอนเฉลย (เบราว์เซอร์อาจต้องให้กดเล่น)</label>
  {error && <p role="alert">{error}</p>}
  {!game && !roomId && <div className="character-setup">
   {names.map((name,i)=><label key={i}>ชื่อผู้เล่น {i+1}<input maxLength={24} value={name} onChange={e=>setNames(names.map((n,j)=>i===j?e.target.value:n))}/></label>)}
   <button disabled={busy} onClick={()=>{setNow(Date.now());setGame(startGame(names.map((name,i)=>({id:String(i),name:name.trim() || `ผู้เล่น ${i+1}`}))));}}>เล่นจอเดียวกัน</button>
   <hr/>
   <p>ออนไลน์ 2 คน: เข้าสู่ระบบ แล้วส่งรหัสห้องให้เพื่อน เมื่อเพื่อนเข้าห้องเกมจะเริ่มทันที</p>
   <button disabled={busy || !user || !firebaseReady} onClick={()=>run(async()=>{const r=await call('create'); if(active.current)setRoomId(r.roomId);})}>สร้างห้องออนไลน์</button>
   <label>รหัสห้อง<input value={code} maxLength={12} onChange={e=>setCode(e.target.value.toUpperCase().trim())}/></label>
   <button disabled={busy || !user || !firebaseReady || !/^[A-F0-9]{12}$/.test(code)} onClick={()=>run(async()=>{await call('join',{roomId:code});if(active.current)setRoomId(code);})}>เข้าร่วมห้อง</button>
   {!user && <p>เข้าสู่ระบบจากหน้าหลักเพื่อเล่นออนไลน์</p>}
  </div>}
  {roomId && <p>รหัสห้อง: <strong>{roomId}</strong></p>}
  {roomId && !game && <p role="status">กำลังเชื่อมต่อ…</p>}
  {game && <>
   <div className="character-players">{game.players.map((p,i)=><div key={p.id} className={game.turn===i?'current':''}><strong>{p.name}</strong><span aria-label={`${p.hearts} หัวใจ`}>{'♥'.repeat(p.hearts)}{'♡'.repeat(2-p.hearts)}</span></div>)}</div>
   {game.status==='lobby' && <p role="status">รอเพื่อนเข้าห้อง…</p>}
   {game.status==='closed' && <p role="status">ผู้เล่นออกจากห้องแล้ว</p>}
   {game.status==='finished' && <h2 role="status">🏆 {game.players.find(p=>p.hearts>0)?.name} ชนะ!</h2>}
   {game.status==='playing' && !revealing && <>
    <p>{roomId && !canAnswer ? 'รอคำตอบจาก ' : 'ตาของ '}{game.players[game.turn].name}</p>
    <div className="character-letter" aria-label={`ตัวอักษร ${game.letter}`}>{game.letter}</div>
    {game.lastCorrect===false && <p role="status">คำตอบก่อนหน้าไม่ถูกต้องหรือใช้ซ้ำ เสีย 1 หัวใจ</p>}
    <form onSubmit={submit}><label>ชื่อตัวละครภาษาอังกฤษ<input autoComplete="off" maxLength={100} value={answer} disabled={!canAnswer||busy} onChange={e=>setAnswer(e.target.value)}/></label><button disabled={!canAnswer||busy}>{busy?'กำลังตรวจคำตอบ…':answer.trim()?'ส่งคำตอบ':'ยอมแพ้ตานี้ (−1 ♥)'}</button></form>
   </>}
   {revealing && <div className="character-reveal" role="status">
    <h2>ถูกต้อง! {game.reveal.name}</h2>
    {game.reveal.image && <img src={game.reveal.image} alt={game.reveal.name} onError={e=>{e.currentTarget.style.display='none';}}/>}
    <p>{game.reveal.anime}</p><p>ตาถัดไปใน {Math.max(0,Math.ceil((game.revealUntil-now)/1000))} วินาที</p>
    {music && game.reveal.video && /^[\w-]{11}$/.test(game.reveal.video) && <iframe title="เพลงอนิเมะตอนเฉลย" src={`https://www.youtube.com/embed/${game.reveal.video}?autoplay=1&playsinline=1`} allow="autoplay; encrypted-media" allowFullScreen/>}
    {!game.reveal.video && <p>ยังไม่มีเพลงของเรื่องนี้ในคลัง</p>}
   </div>}
   <p>ใช้ไปแล้ว {game.used?.length || 0} ตัวละคร</p>
  </>}
  {(game || roomId) && <button disabled={busy} onClick={()=>run(async()=>{if(roomId) await call('leave');reset();})}>ออกจากเกม / เริ่มใหม่</button>}
 </section>;
}
