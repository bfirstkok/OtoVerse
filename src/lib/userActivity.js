import {addDoc,collection,serverTimestamp} from 'firebase/firestore';
import {firebaseAuth,firebaseDb} from './firebase';
export function logUserActivity(action) {
  const uid=firebaseAuth?.currentUser?.uid;
  if(!uid||!firebaseDb)return;
  // Best effort telemetry, never block the user's successful action.
  addDoc(collection(firebaseDb,'user_activity'),{uid,action,createdAt:serverTimestamp()}).catch(()=>{});
}
