import {createAccountService} from '/js/public-account-service.js';
import {getAuth,sendEmailVerification} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import * as sdk from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import {createFamilyLinkStore} from './store.mjs';
export async function createFamilyService(){const account=createAccountService(),auth=getAuth(),db=sdk.getFirestore();await account.ready();const identity=()=>auth.currentUser;return {...account,...createFamilyLinkStore({sdk,db,actor:identity}),identity,verify:()=>sendEmailVerification(auth.currentUser),reload:async()=>{await auth.currentUser?.reload();await auth.currentUser?.getIdToken(true);}};}
