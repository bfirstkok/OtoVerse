const { getAuth } = require('firebase-admin/auth');
require('./chat');
const ORIGINS = new Set(['https://otoverse.games','https://otoverse.web.app']);
module.exports=async(req,res)=>{
 const origin=req.headers.origin;if(origin&&!ORIGINS.has(origin))return res.status(403).json({error:'ไม่อนุญาตต้นทางนี้'});
 if(origin)res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');res.setHeader('Cache-Control','no-store');res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization');res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');
 if(req.method==='OPTIONS')return res.status(204).end();if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 try{
  const token=String(req.headers.authorization||'').replace(/^Bearer /,'');let identity;try{identity=await getAuth().verifyIdToken(token);}catch{return res.status(401).json({error:'กรุณาเข้าสู่ระบบแอดมิน'});}
  const root='https://firestore.googleapis.com/v1/projects/animequiz-8a93b/databases/(default)/documents';const headers={Authorization:`Bearer ${token}`};
  const role=await fetch(`${root}/admins/${identity.uid}`,{headers,signal:AbortSignal.timeout(8000)});if(!role.ok||(await role.json()).fields?.role?.stringValue!=='admin')return res.status(403).json({error:'เฉพาะแอดมินเท่านั้น'});
  const control=await fetch(`${root}/account_controls/${identity.uid}`,{headers,signal:AbortSignal.timeout(8000)});if(!control.ok&&control.status!==404)throw new Error('control unavailable');
  if(control.ok){const f=(await control.json()).fields;if(f.status?.stringValue==='suspended'&&(!f.until?.timestampValue||Date.parse(f.until.timestampValue)>Date.now()))return res.status(403).json({error:'บัญชีถูกระงับ'});}
  const body=typeof req.body==='string'?JSON.parse(req.body):req.body;const id=Number(body?.malId);const q=String(body?.query||'').trim();
  const path=Number.isInteger(id)&&id>0&&id<99999999?`anime/${id}`:q.length>=2&&q.length<=150?`anime?q=${encodeURIComponent(q)}&limit=8&sfw=true`:null;
  if(!path)return res.status(400).json({error:'พิมพ์ชื่อ 2-150 ตัวอักษร หรือรหัส MAL ที่ถูกต้อง'});
  const source=await fetch(`https://api.jikan.moe/v4/${path}`,{signal:AbortSignal.timeout(20000)});if(!source.ok)return res.status(source.status===429?429:503).json({error:source.status===429?'ค้นถี่ไปนิด รอสักครู่แล้วลองใหม่':'MyAnimeList ยังดึงข้อมูลไม่ได้ ลองใหม่อีกครั้ง'});
  return res.status(200).json({data:(await source.json()).data});
 }catch{return res.status(503).json({error:'ยังเชื่อมต่อข้อมูล MyAnimeList ไม่ได้ ลองใหม่อีกครั้ง ข้อมูลเดิมไม่หาย'});}
};
