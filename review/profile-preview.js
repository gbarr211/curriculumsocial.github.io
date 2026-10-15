// Synthetic adult only. No Firebase imports or persistent storage.
const person = {uid:'synthetic-adult',email:'synthetic@example.invalid',displayName:'Sample Adult'};
let profile = {email:person.email,displayName:person.displayName,role:'teacher',bio:'Exploring hands-on community learning.',location:'Sample area',matchingRadius:25,philosophies:[]};
let failedOnce = false;
window.auth = {currentUser:person};
window.isDemoMode = false;
window.requireRealAccount = () => true;
window.firebaseAuth = {onAuthStateChanged(auth,callback){queueMicrotask(()=>callback(person));}};
window.curriculumSocial = {
    async getUserProfile(){return document.getElementById('previewScenario').value==='denied' ? {success:false,code:'permission-denied'} : {success:true,data:{...profile}};},
    async updateUserProfile(uid,data){
        await new Promise(resolve=>setTimeout(resolve,350));
        if(document.getElementById('previewScenario').value==='retry' && !failedOnce){failedOnce=true;return {success:false,code:'permission-denied'};}
        if(document.getElementById('previewScenario').value==='denied')return {success:false,code:'permission-denied'};
        profile={...profile,...data};return {success:true};
    },
    async uploadFile(){return {success:false,error:'Photo uploads are not enabled in this preview.'};},
    async signOut(){return {success:false};}
};
