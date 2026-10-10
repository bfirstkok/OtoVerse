import React,{useState} from 'react';
import {doc,runTransaction} from 'firebase/firestore';
import {firebaseDb} from '@/lib/firebase';
import {animeSeriesKey,WATCH_LABELS} from '@/lib/watchlist';
export default function WatchStatusSelector({uid,anime,watchlist={}}){
 const [busy,setBusy]=useState(false),[error,setError]=useState(''); const key=animeSeriesKey(anime);
 const change=async value=>{if(!uid||!key)return;setBusy(true);setError('');try{await runTransaction(firebaseDb,async tx=>{const ref=doc(firebaseDb,'profiles',uid);const snap=await tx.get(ref);const next={...(snap.data()?.watchlist||{})};if(value)next[key]=value;else delete next[key];if(Object.keys(next).length>500)throw new Error('limit');if(snap.exists())tx.update(ref,{watchlist:next});else tx.set(ref,{watchlist:next});});}catch{setError('บันทึกสถานะไม่สำเร็จ');}finally{setBusy(false);}};
 return <div><select aria-label={`สถานะการดู ${anime?.title || ''}`} className="ov-watch-select" value={watchlist[key]||''} disabled={busy||!uid} onChange={e=>change(e.target.value)}><option value="">เพิ่มในรายการดู…</option>{Object.entries(WATCH_LABELS).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select>{error&&<small role="alert">{error}</small>}</div>;
}
