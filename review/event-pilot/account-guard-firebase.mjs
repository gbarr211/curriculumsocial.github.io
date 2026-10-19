import {getAuth} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import * as sdk from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import {guardEventRemoval} from './account-guard.mjs';
export function guardAccountRemoval(user,remove){return guardEventRemoval({db:sdk.getFirestore(),sdk,uid:user.uid,currentUid:()=>getAuth().currentUser===user?user.uid:null},remove);}
