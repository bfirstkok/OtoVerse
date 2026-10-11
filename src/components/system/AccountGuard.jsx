import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { addDoc, collection, doc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { firebaseAuth, firebaseDb } from '../../lib/firebase';
import { isSuspended } from '../../lib/moderation';
import PageLoader from './PageLoader';

export default function AccountGuard({children}) {
  const [state,setState] = useState({loading:!!firebaseAuth,control:null,error:false});
  const [now,setNow] = useState(Date.now());
  useEffect(()=>{
    if (!firebaseAuth || !firebaseDb) return;
    let unsubscribeControl = () => {}, generation = 0;
    const auth = onAuthStateChanged(firebaseAuth,user=>{
      unsubscribeControl(); const current = ++generation;
      if (!user) {setState({loading:false,control:null,error:false});return;}
      setState({loading:true,control:null,error:false}); let recorded = false;
      unsubscribeControl = onSnapshot(doc(firebaseDb,'account_controls',user.uid),snapshot=>{
        if(current !== generation) return;
        const control = snapshot.data() || null;
        setState({loading:false,control,error:false});
        if(!recorded && !isSuspended(control) && !snapshot.metadata.fromCache) {
          recorded = true;
          addDoc(collection(firebaseDb,'user_activity'),{uid:user.uid,action:'session_started',createdAt:serverTimestamp()}).catch(()=>{});
        }
      },()=>{if(current === generation)setState({loading:false,control:null,error:true});});
    });
    const timer = setInterval(()=>setNow(Date.now()),30000);
    return ()=>{generation++;auth();unsubscribeControl();clearInterval(timer);};
  },[]);
  if(state.loading)return <PageLoader label="กำลังตรวจสอบบัญชี…"/>;
  if(state.error)return <main className="min-h-screen grid place-items-center p-6 bg-slate-950 text-white"><div><h1>ตรวจสอบบัญชีไม่สำเร็จ</h1><button onClick={()=>window.location.reload()}>ลองอีกครั้ง</button><button onClick={()=>signOut(firebaseAuth)}>ออกจากระบบ</button></div></main>;
  if(isSuspended(state.control,now))return <main className="min-h-screen grid place-items-center p-6 bg-slate-950 text-slate-100"><section className="max-w-lg w-full rounded-3xl border border-rose-400/20 bg-slate-900 p-8"><p className="text-rose-300 mb-4">OTOVERSE · สถานะบัญชี</p><h1 className="text-2xl font-bold">บัญชีถูกระงับการใช้งาน</h1><p className="mt-4 whitespace-pre-wrap">{state.control.reason}</p><p className="text-sm text-slate-400 mt-4">{state.control.until ? `สิ้นสุด ${state.control.until.toDate().toLocaleString('th-TH')}` : 'จนกว่าผู้ดูแลระบบจะปลดระงับ'}</p><button className="mt-6 rounded-xl bg-slate-700 px-5 py-3" onClick={()=>signOut(firebaseAuth)}>ออกจากระบบ</button></section></main>;
  return children;
}
