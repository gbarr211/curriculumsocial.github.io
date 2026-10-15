import { bindAuthForms } from '../js/auth-forms.js';

// No Firebase imports, storage, email or network requests. All state is ephemeral.
const w = window;
const d = document;
const scenario = d.getElementById('previewScenario');
let profile = null;
let failedOnce = false;
const synthetic = {uid:'synthetic-adult',email:'synthetic@example.invalid',displayName:'Sample Adult',emailVerified:false};
w.auth = {currentUser:null};
w.googleProvider = {};
w.firebaseAuth = {
    async createUserWithEmailAndPassword(auth,email) { auth.currentUser = {...synthetic,email}; return {user:auth.currentUser}; },
    async signInWithEmailAndPassword(auth,email) { auth.currentUser = {...synthetic,email}; profile = {role:'parent'}; return {user:auth.currentUser}; },
    async signInWithPopup(auth) { auth.currentUser = {...synthetic}; if(d.getElementById('loginForm'))profile={role:'parent'}; return {user:auth.currentUser}; },
    async updateProfile(user,data) { Object.assign(user,data); },
    async signOut(auth) { auth.currentUser=null; }
};
w.curriculumSocial = {
    async getUserProfile() { if(scenario.value==='denied')return {success:false,code:'permission-denied'}; return profile ? {success:true,data:profile} : {success:false,code:'profile/not-found'}; },
    async createUserProfile(uid,data) {
        await new Promise(resolve=>setTimeout(resolve,350));
        if(scenario.value==='retry' && !failedOnce){failedOnce=true;return {success:false,code:'permission-denied'};}
        profile={...data};return {success:true};
    },
    async signOut() {w.auth.currentUser=null;return {success:true};}
};
d.getElementById('email').value=synthetic.email;
d.getElementById('password').value='sample-only-password';
if(d.getElementById('displayName'))d.getElementById('displayName').value=synthetic.displayName;
if(d.getElementById('role'))d.getElementById('role').value='parent';
bindAuthForms(w,()=>{
    d.getElementById('previewResult').textContent='Preview complete. The simulated account and profile are ready. No real account or database record was created.';
    d.getElementById('previewResult').hidden=false;
});
