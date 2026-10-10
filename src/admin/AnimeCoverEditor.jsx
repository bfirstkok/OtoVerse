import React, {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {prepareProfileImage} from '@/lib/avatars';
import {getYouTubeThumbUrl} from '@/lib/media';
export default function AnimeCoverEditor({item, count, saving, onSave, onCancel}) {
 const [imageUrl,setImageUrl]=useState(item.imageUrl || '');
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const select=async file=>{if(!file)return;setBusy(true);setError('');try{setImageUrl(await prepareProfileImage('admin-cover',file,'cover'));}catch{setError('กรุณาใช้ภาพ JPG, PNG, WebP, GIF หรือ AVIF ไม่เกิน 8 MB');}finally{setBusy(false);}};
 return <form className="space-y-5" onSubmit={e=>{e.preventDefault();onSave({imageUrl});}}><div><h2 className="text-xl font-bold text-white">{item.animeTitle || item.title}</h2><p className="mt-2 text-sm text-slate-400">ปกใหม่นี้จะใช้กับเพลงทั้ง {count} รายการของเรื่องนี้</p></div>{(imageUrl || getYouTubeThumbUrl(item.youtubeVideoId)) ? <img src={imageUrl || getYouTubeThumbUrl(item.youtubeVideoId)} alt="ตัวอย่างปกเรื่อง" className="aspect-video w-full max-w-lg rounded-2xl object-cover bg-slate-900"/> : <div className="rounded-xl bg-slate-900 p-10 text-slate-400">เรื่องนี้ยังไม่มีวิดีโอสำหรับใช้เป็นภาพปก</div>}<label className="block text-sm text-slate-200">เลือกรูปจากเครื่อง<input className="mt-2 block w-full rounded-xl border border-slate-700 p-3" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" disabled={saving || busy} onChange={e=>{select(e.target.files?.[0]);e.target.value='';}}/></label><label className="block text-sm text-slate-200">หรือวาง URL รูปภาพ<Input className="mt-2" value={imageUrl.startsWith('data:')?'':imageUrl} placeholder={imageUrl.startsWith('data:')?'ใช้ภาพที่เลือกจากเครื่องอยู่':'https://…'} disabled={saving || busy} onChange={e=>setImageUrl(e.target.value)}/></label><Button variant="outline" disabled={saving || busy} onClick={()=>setImageUrl('')}>ใช้ภาพจาก YouTube แทน</Button>{busy && <p role="status">กำลังเตรียมภาพ…</p>}{error && <p role="alert" className="text-rose-300">{error}</p>}<div className="flex gap-3 justify-end"><Button variant="outline" onClick={onCancel} disabled={saving || busy}>ยกเลิก</Button><Button type="submit" disabled={saving || busy}>{saving?'กำลังบันทึก…':'บันทึกปกเรื่อง'}</Button></div></form>;
}
