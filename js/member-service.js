import {createAccountService} from './public-account-service.js';
import {getAuth} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {getFirestore,doc,collection,query,where,limit,getDocsFromServer,getDocFromServer,runTransaction,serverTimestamp} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import {sharedFields} from './family-model.js?v=family-1';
export function createMemberService(){
 const account=createAccountService(),auth=getAuth(),db=getFirestore();
 const ref=uid=>doc(db,'adult_profiles',uid),card=uid=>doc(db,'family_directory',uid);
 const owner=uid=>{if(auth.currentUser?.uid!==uid)throw Error('Session changed. Please sign in again.');};
 const version=s=>s.exists()?JSON.stringify(s.data().updatedAt.toJSON()):null;
 return {...account,
 async load(uid){owner(uid);const s=await getDocFromServer(ref(uid));owner(uid);return {data:s.exists()?s.data():null,version:version(s)};},
 async save(uid,data,expected){owner(uid);await runTransaction(db,async tx=>{owner(uid);const s=await tx.get(ref(uid));if(version(s)!==expected)throw Object.assign(Error('Your profile changed in another tab. Reload it before saving.'),{code:'member/conflict'});const record={...data,consentVersion:'family-profile-2026-10-17',createdAt:s.exists()?s.data().createdAt:serverTimestamp(),updatedAt:serverTimestamp()};tx.set(ref(uid),record);if(data.discoverable)tx.set(card(uid),sharedFields(record));else tx.delete(card(uid));});return this.load(uid);},
 async memberships(uid){owner(uid);const s=await getDocsFromServer(query(collection(db,'family_links'),where('members','array-contains',uid),limit(20)));owner(uid);return s.docs.map(d=>({id:d.id,...d.data()}));},
 async familyProfile(uid,id){owner(uid);const s=await getDocFromServer(ref(id));owner(uid);return s.exists()?s.data():null;},
 async families(uid){owner(uid);const s=await getDocsFromServer(query(collection(db,'family_directory'),limit(50)));owner(uid);return s.docs.filter(d=>d.id!==uid).map(d=>({id:d.id,...d.data()}));},
 async erase(uid,expected){owner(uid);await runTransaction(db,async tx=>{owner(uid);const [s,f]=await Promise.all([tx.get(ref(uid)),tx.get(doc(db,'family_links',uid))]);if(f.exists())throw Object.assign(Error('Close the family access you manage in Invitations before deleting this profile.'),{code:'member/family-sharing-active'});if(version(s)!==expected)throw Object.assign(Error('Your profile changed in another tab. Reload it before deleting.'),{code:'member/conflict'});tx.delete(card(uid));tx.delete(ref(uid));});}
 };
}
