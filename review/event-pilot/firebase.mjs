import {createFirebaseService} from '../contributions/firebase.mjs';
import {getApp} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import * as sdk from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import {getAuth,onIdTokenChanged} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {createEventStore} from './store.mjs';
export async function createEventService(options={}){
 const session=await createFirebaseService(options),auth=getAuth(getApp());let person=null,version=0,knownUid=auth.currentUser?.uid??null;const watchers=new Set();
 async function refresh(){const turn=++version,user=auth.currentUser,uid=user?.uid??null;if(knownUid&&uid!==knownUid){person=null;watchers.forEach(fn=>fn(null));location.reload();return;}knownUid=uid;if(!user||user.isAnonymous){person=null;watchers.forEach(fn=>fn(null));return;}await user.getIdTokenResult();if(turn!==version||auth.currentUser!==user)return;const next={uid:user.uid,name:user.displayName??'',emailVerified:user.emailVerified,isAnonymous:false},changed=!person||person.uid!==next.uid||person.name!==next.name||person.emailVerified!==next.emailVerified;person=next;if(changed)watchers.forEach(fn=>fn(person));}
 const stop=onIdTokenChanged(auth,()=>{void refresh().catch(()=>{person=null;watchers.forEach(fn=>fn(null));});});await refresh();
 return {...createEventStore({db:sdk.getFirestore(getApp()),sdk,actor:()=>person}),identity:()=>person,observe(fn){watchers.add(fn);fn(person);return ()=>watchers.delete(fn);},verify:session.verify,async reloadIdentity(){await session.reloadIdentity();await refresh();},logout:session.logout,dispose(){version++;stop();session.dispose();watchers.clear();}};
}
