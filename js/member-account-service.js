import {createMemberService} from './member-service.js?v=family-1';
import {getAuth,updateProfile} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {getFirestore,doc,getDocFromServer} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
export function createAccountService(){
 const service=createMemberService();
 return {...service,
 async setName(name){const auth=getAuth(),user=auth.currentUser;if(!user||user.isAnonymous)throw Error('Sign in first');if(typeof name!=='string'||name.length>80||/[\u0000-\u001f\u007f]/.test(name))throw Error('Check your name');await updateProfile(user,{displayName:name.trim()||null});if(auth.currentUser!==user)throw Error('Session changed');},
 async remove(){const auth=getAuth(),user=auth.currentUser;if(!user)throw Error('Sign in first');const result=await service.load(user.uid);if(result.data)throw Object.assign(Error('Delete your profile first.'),{code:'member/profile-exists'});
 const {liveEnabled}=await import('/review/contributions/config.mjs');
 if(liveEnabled){const {guardContributionRemoval}=await import('/review/contributions/account-guard.mjs');return guardContributionRemoval(async()=>({async mine(){const db=getFirestore();const rows=await Promise.all(['teaching','hosting','helping'].map(kind=>getDocFromServer(doc(db,'contributions',user.uid+'__'+kind))));if(auth.currentUser!==user)throw Error('Session changed');return rows.filter(row=>row.exists());}}),()=>{if(auth.currentUser!==user)throw Error('Session changed');return service.remove();});}
 return service.remove();}
 };
}
