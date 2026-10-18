import {initializeApp,getApps,getApp} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import * as authSdk from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import * as sdk from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import {createContributionStore} from './store.mjs';
const production={apiKey:'AIzaSyCGpQyfbQnPt9RFo0x1CQuVgU7QIL9Mkhk',authDomain:'cirriculum-social.firebaseapp.com',projectId:'cirriculum-social',appId:'1:406562436702:web:a62d8b724d4e9367e526cf'};
export async function createFirebaseService({emulator=false}={}){
 if(emulator&&!['127.0.0.1','localhost'].includes(location.hostname))throw Error('Emulators are local only.');
 const config=emulator?{apiKey:'demo-key',projectId:'demo-cs-contributions',authDomain:'localhost'}:production;
 const app=getApps().length?getApp():initializeApp(config);if(app.options.projectId!==config.projectId)throw Error('Unexpected Firebase project.');const auth=authSdk.getAuth(app),db=sdk.getFirestore(app);
 if(emulator){authSdk.connectAuthEmulator(auth,'http://127.0.0.1:9294',{disableWarnings:true});sdk.connectFirestoreEmulator(db,'127.0.0.1',8194);}
 await auth.authStateReady();let identity=null,version=0;const watchers=new Set();
 const refresh=async user=>{const v=++version;identity=null;watchers.forEach(fn=>fn(null));if(!user||user.isAnonymous)return;const token=await user.getIdTokenResult();if(v!==version)return;identity={uid:user.uid,email:user.email??'',name:user.displayName??'',emailVerified:user.emailVerified,isAnonymous:user.isAnonymous,reviewer:token.claims.contributionsReviewer===true};watchers.forEach(fn=>fn(identity));};
 const stop=authSdk.onIdTokenChanged(auth,user=>{void refresh(user).catch(()=>watchers.forEach(fn=>fn(null)));});
 await refresh(auth.currentUser);
 const store=createContributionStore({db,sdk,actor:()=>identity});
 return {...store,identity:()=>identity,observe(fn){watchers.add(fn);fn(identity);return()=>watchers.delete(fn);},dispose(){stop();watchers.clear();},async verify(){if(!auth.currentUser)throw Error('Sign in first.');await authSdk.sendEmailVerification(auth.currentUser);},async reloadIdentity(){if(auth.currentUser){await authSdk.reload(auth.currentUser);await auth.currentUser.getIdToken(true);await refresh(auth.currentUser);}return identity;},logout:()=>authSdk.signOut(auth)};
}
