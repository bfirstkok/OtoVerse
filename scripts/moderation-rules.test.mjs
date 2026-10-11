import {after,before,beforeEach,test} from 'node:test';
import {readFile} from 'node:fs/promises';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {collection,doc,getDoc,getDocs,setDoc,updateDoc,deleteDoc,writeBatch,serverTimestamp,Timestamp} from 'firebase/firestore';
let environment;
const database=uid=>environment.authenticatedContext(uid).firestore();
before(async()=>{environment=await initializeTestEnvironment({projectId:'demo-otoverse-moderation',firestore:{host:'127.0.0.1',port:8089,rules:await readFile('firestore.rules','utf8')}});});
after(async()=>{await environment?.cleanup();});
beforeEach(async()=>{
 await environment.clearFirestore();
 await environment.withSecurityRulesDisabled(async context=>{
  const db=context.firestore();
  for(const uid of ['admin','other-admin'])await setDoc(doc(db,'admins',uid),{role:'admin'});
  await setDoc(doc(db,'profiles','user'),{nickname:'Player'});
  await setDoc(doc(db,'reports','report'),{uid:'user',text:'Video broken',createdAt:Timestamp.now()});
 });
});
function accountBatch(uid,status='suspended',actor='admin',auditId='event',until=null){
 const db=database(actor),batch=writeBatch(db),reason='Test moderation';
 batch.set(doc(db,'account_controls',uid),{status,reason,until,updatedAt:serverTimestamp(),updatedBy:actor,lastActionId:auditId});
 batch.set(doc(db,'admin_audit',auditId),{action:status==='suspended'?'suspend':'restore',targetUid:uid,actorUid:actor,reason,until,status,previousStatus:status==='suspended'?'active':'suspended',createdAt:serverTimestamp()});
 return batch.commit();
}
test('ordinary users cannot suspend accounts, enumerate statuses, or read admin logs',async()=>{
 const db=database('user');
 await assertFails(accountBatch('someone','suspended','user'));
 await assertFails(getDocs(collection(db,'account_controls')));
 await assertFails(getDocs(collection(db,'admin_audit')));
 await assertFails(getDocs(collection(db,'reports')));
 await assertSucceeds(getDoc(doc(db,'account_controls','user')));
});
test('admin suspension requires an atomic audit event',async()=>{
 await assertSucceeds(accountBatch('user'));
 await assertFails(setDoc(doc(database('admin'),'account_controls','another'),{status:'suspended',reason:'test',until:null,updatedAt:serverTimestamp(),updatedBy:'admin',lastActionId:'missing'}));
});
test('admin cannot suspend self or another administrator',async()=>{
 await assertFails(accountBatch('admin'));
 await assertFails(accountBatch('other-admin'));
});
test('suspended session retains ability to read status but cannot access private features or submit data',async()=>{
 await assertSucceeds(accountBatch('user'));
 const db=database('user');
 await assertSucceeds(getDoc(doc(db,'account_controls','user')));
 await assertFails(getDoc(doc(db,'profiles','user')));
 await assertFails(setDoc(doc(db,'profiles','user'),{nickname:'bypass'}));
 await assertFails(setDoc(doc(db,'reports','new'),{uid:'user',createdAt:serverTimestamp()}));
 await assertFails(setDoc(doc(db,'user_activity','new'),{uid:'user',action:'session_started',createdAt:serverTimestamp()}));
 await assertFails(setDoc(doc(db,'ai_chat_usage','user'),{count:1,windowStart:serverTimestamp(),updatedAt:serverTimestamp()}));
});
test('restoring account works with the same existing session',async()=>{
 await accountBatch('user');await assertSucceeds(accountBatch('user','active','admin','restore-event'));
 await assertSucceeds(updateDoc(doc(database('user'),'profiles','user'),{nickname:'Back'}));
});
test('expired suspensions stop blocking without requiring an admin write',async()=>{
 await environment.withSecurityRulesDisabled(context=>setDoc(doc(context.firestore(),'account_controls','user'),{status:'suspended',until:Timestamp.fromMillis(Date.now()-60000)}));
 await assertSucceeds(updateDoc(doc(database('user'),'profiles','user'),{nickname:'Expired'}));
});
test('audit events cannot be modified, deleted, or forged without the actual change',async()=>{
 await accountBatch('user');const db=database('admin');
 await assertFails(updateDoc(doc(db,'admin_audit','event'),{reason:'rewritten'}));
 await assertFails(deleteDoc(doc(db,'admin_audit','event')));
 await assertFails(setDoc(doc(db,'admin_audit','forged'),{action:'suspend',targetUid:'user',actorUid:'admin',reason:'forged',until:null,status:'suspended',previousStatus:'active',createdAt:serverTimestamp()}));
});
test('report review is audited and original content cannot be changed',async()=>{
 const db=database('admin'),batch=writeBatch(db);
 batch.update(doc(db,'reports','report'),{status:'resolved',adminNote:'Fixed',reviewedBy:'admin',reviewedAt:serverTimestamp(),lastActionId:'review'});
 batch.set(doc(db,'admin_audit','review'),{action:'review_report',reportId:'report',targetUid:'user',actorUid:'admin',reason:'Fixed',status:'resolved',createdAt:serverTimestamp()});
 await assertSucceeds(batch.commit());
 await assertFails(updateDoc(doc(db,'reports','report'),{text:'altered original'}));
 await assertFails(updateDoc(doc(db,'reports','report'),{status:'pending'}));
});
test('users can log only allowed actions for their own account',async()=>{
 const db=database('user');
 await assertSucceeds(setDoc(doc(db,'user_activity','activity'),{uid:'user',action:'session_started',createdAt:serverTimestamp()}));
 await assertFails(setDoc(doc(db,'user_activity','impersonation'),{uid:'someone',action:'session_started',createdAt:serverTimestamp()}));
 await assertFails(setDoc(doc(db,'user_activity','private-data'),{uid:'user',action:'session_started',createdAt:serverTimestamp(),password:'secret'}));
});
