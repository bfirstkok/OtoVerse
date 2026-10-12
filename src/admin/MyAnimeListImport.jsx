import { jikan } from "@/lib/myAnimeListApi";
import React, { useEffect, useRef, useState } from 'react';
import { firebaseAuth } from '@/lib/firebase';
import { malDraft, parseMalId } from '@/lib/myAnimeList';
export default function MyAnimeListImport({ onImport, saving }) {
  const [query,setQuery] = useState(''), [results,setResults] = useState([]), [selected,setSelected] = useState(null), [busy,setBusy] = useState(false), [error,setError] = useState(''), [notice,setNotice] = useState('');
  const controller = useRef(null);
  useEffect(() => () => controller.current?.abort(), []);
  async function run(task) {
    controller.current?.abort(); const current = new AbortController(); controller.current = current;
    setBusy(true);setError('');setNotice('');
    const timer=setTimeout(()=>current.abort(),60000);
    try { await task(current.signal); } catch(e) { if(controller.current === current) setError(e.name === 'AbortError' ? 'ใช้เวลานานเกินไป ลองใหม่อีกครั้ง' : e.message === 'Failed to fetch' ? 'ยังเชื่อมต่อ MyAnimeList ไม่ได้ ลองใหม่อีกครั้ง' : e.message); }
    finally {clearTimeout(timer);if(controller.current === current)setBusy(false);}
  }
  const select = id => run(async signal => { const data=await jikan(`anime/${id}`,signal);setSelected(data);onImport(malDraft(data));setNotice('เติมข้อมูลร่างแล้ว ตรวจเรื่องและภาคก่อนบันทึก · เรื่องย่อเดิมเป็นภาษาต้นฉบับ'); });
  const search = () => { const id=parseMalId(query); if(id)return select(id); if(query.trim().length<2){setError('พิมพ์ชื่ออย่างน้อย 2 ตัวอักษร หรือวางลิงก์ MAL');return;} setSelected(null);run(async signal=>{const data=await jikan(`anime?q=${encodeURIComponent(query.trim())}&limit=8&sfw=true`,signal);setResults(data);if(!data.length)setNotice('ไม่พบเรื่องนี้ ลองชื่ออังกฤษ/ญี่ปุ่น หรือวางลิงก์ MyAnimeList โดยตรง');}); };
  const summarize = () => run(async signal => {
    const user=firebaseAuth?.currentUser;if(!user)throw new Error('กรุณาเข้าสู่ระบบแอดมิน');
    const token=await user.getIdToken();
    const response=await fetch('https://otoverse-mascot-api.vercel.app/api/anime-summary',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({malId:selected.mal_id}),signal});
    const result=await response.json();if(!response.ok)throw new Error(result.error || 'สรุปไม่สำเร็จ');
    onImport({synopsis:result.synopsis,synopsisSource:'MyAnimeList · AI สรุปภาษาไทย'});setNotice('สรุปภาษาไทยแล้ว ตรวจแก้ได้ก่อนบันทึก');
  });
  return <section className="space-y-3 rounded-2xl border border-violet-500/30 bg-violet-500/5 p-4"><h3 className="font-bold text-slate-100">ดึงข้อมูลจาก MyAnimeList</h3><p className="text-xs text-slate-400">ข้อมูลจาก MyAnimeList · เลือกเรื่องและภาคให้ตรง · เติมเฉพาะร่าง ยังไม่บันทึกลงเว็บ</p><div className="flex flex-wrap gap-2"><input aria-label="ค้นหา MyAnimeList" className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100" value={query} disabled={busy || saving} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();search();}}} placeholder="ชื่ออังกฤษ/ญี่ปุ่น หรือ https://myanimelist.net/anime/…"/><button type="button" disabled={busy || saving} onClick={search} className="rounded-xl bg-violet-600 px-4 py-2 text-white">{busy?'กำลังดึงข้อมูล…':'ค้นหา / ดึงข้อมูล'}</button></div><div className="grid gap-2 sm:grid-cols-2">{results.map(data=><button type="button" key={data.mal_id} disabled={busy || saving} onClick={()=>select(data.mal_id)} className="flex items-center gap-3 rounded-xl border border-slate-700 p-3 text-left text-slate-100"><img src={data.images?.jpg?.image_url} alt="" className="h-16 w-12 rounded object-cover"/><span><strong>{data.title}</strong><small className="block text-slate-400">{data.type} · {data.year || data.aired?.prop?.from?.year || 'ไม่ระบุปี'} · {data.episodes || '?'} ตอน</small></span></button>)}</div>{selected && <div className="flex flex-wrap items-center gap-3"><a href={`https://myanimelist.net/anime/${selected.mal_id}`} target="_blank" rel="noreferrer" className="text-sm text-violet-300 underline">ต้นทาง: {selected.title} ↗</a><button type="button" disabled={busy || saving || !selected.synopsis} onClick={summarize} className="rounded-xl border border-violet-400 px-3 py-2 text-sm text-violet-200">สรุปภาษาไทยด้วย AI</button>{!selected.trailer?.youtube_id && <small className="text-slate-400">เรื่องนี้ยังไม่มีตัวอย่าง YouTube ในข้อมูล</small>}</div>}{notice && <p role="status" className="text-sm text-emerald-300">{notice}</p>}{error && <p role="alert" className="text-sm text-rose-300">{error}</p>}</section>;
}
