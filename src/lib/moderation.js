import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { firebaseAuth, firebaseDb } from './firebase';

export const reportStatuses = {pending:'รอตรวจ', investigating:'กำลังตรวจสอบ', resolved:'แก้ไขแล้ว', rejected:'ไม่รับรายการ'};
export const activityNames = {session_started:'เปิดใช้งานเว็บ', report_submitted:'ส่ง Report', song_suggested:'เสนอเพลง', suspend:'ระงับบัญชี', restore:'ปลดระงับบัญชี', review_report:'อัปเดต Report'};
export function isSuspended(control, now = Date.now()) {
  const until = control?.until?.toMillis?.() ?? (control?.until ? Date.parse(control.until) : null);
  return control?.status === 'suspended' && (until === null || until > now);
}
export async function setAccountStatus(uid, status, reason, until = null) {
  const actor = firebaseAuth?.currentUser;
  if (!actor || !uid || actor.uid === uid) throw new Error('ไม่สามารถระงับบัญชีตัวเองได้');
  reason = reason.trim();
  if (!reason || reason.length > 500) throw new Error('กรอกเหตุผล 1–500 ตัวอักษร');
  const audit = doc(collection(firebaseDb,'admin_audit'));
  const ref = doc(firebaseDb,'account_controls',uid);
  await runTransaction(firebaseDb, async transaction => {
    const [previous, role] = await Promise.all([transaction.get(ref), transaction.get(doc(firebaseDb,'admins',uid))]);
    if (role.data()?.role === 'admin') throw new Error('หน้านี้ไม่อนุญาตให้ระงับผู้ดูแลระบบ');
    const action = status === 'suspended' ? 'suspend' : 'restore';
    transaction.set(ref,{status,reason,until,updatedAt:serverTimestamp(),updatedBy:actor.uid,lastActionId:audit.id});
    transaction.set(audit,{action,targetUid:uid,actorUid:actor.uid,reason,until,previousStatus:previous.data()?.status || 'active',status,createdAt:serverTimestamp()});
  });
}
export async function reviewReport(id, status, note) {
  const actor = firebaseAuth?.currentUser;
  if (!actor || !reportStatuses[status]) throw new Error('สถานะไม่ถูกต้อง');
  const audit = doc(collection(firebaseDb,'admin_audit'));
  const ref = doc(firebaseDb,'reports',id);
  await runTransaction(firebaseDb, async transaction => {
    const report = await transaction.get(ref);
    if (!report.exists()) throw new Error('ไม่พบ Report นี้');
    const reason = String(note || '').trim().slice(0,1000);
    transaction.update(ref,{status,adminNote:reason,reviewedAt:serverTimestamp(),reviewedBy:actor.uid,lastActionId:audit.id});
    transaction.set(audit,{action:'review_report',reportId:id,targetUid:report.data().uid || '',actorUid:actor.uid,reason,status,createdAt:serverTimestamp()});
  });
}
