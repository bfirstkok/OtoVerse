import { firebaseAuth } from "./firebase";
export async function jikan(path, signal) {
  const user = firebaseAuth?.currentUser;
  if (!user) throw new Error('กรุณาเข้าสู่ระบบแอดมิน');
  const token = await user.getIdToken();
  const id = path.match(/^anime\/(\d+)$/)?.[1];
  const query = new URLSearchParams(path.split('?')[1] || '').get('q');
  const response = await fetch('https://otoverse-mascot-api.vercel.app/api/anime-metadata', { method:'POST', headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`}, body:JSON.stringify(id ? {malId:Number(id)} : {query}), signal });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'MyAnimeList ยังดึงข้อมูลไม่ได้ ลองใหม่อีกครั้ง');
  return result.data;
}
