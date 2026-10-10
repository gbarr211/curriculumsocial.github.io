const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '../..');
const tick = () => new Promise(resolve => setImmediate(resolve));
const user = { uid: 'synthetic-owner', email: 'synthetic@example.invalid', displayName: 'Synthetic', emailVerified: false };
const deferred = () => { let resolve; const promise = new Promise(r => resolve = r); return { promise, resolve }; };

(async () => {
    const { bindAuthForms } = await import('data:text/javascript;base64,' + Buffer.from(fs.readFileSync(path.join(root,'js/auth-forms.js'),'utf8')).toString('base64'));
    function setup(page='signup', opts={}) {
        const dom = new JSDOM(fs.readFileSync(path.join(root,page+'.html'),'utf8'), {url:'https://example.invalid/'+page+'.html'});
        const w = dom.window, d = w.document, calls = {create:0, popup:0, login:0, save:[], update:0, navigate:[]};
        w.auth = {currentUser:opts.currentUser || null};
        w.googleProvider = {};
        w.firebaseAuth = {
            async createUserWithEmailAndPassword(){calls.create++; const u=opts.create ? await opts.create() : user; w.auth.currentUser=u; return {user:u};},
            async signInWithEmailAndPassword(){calls.login++; w.auth.currentUser=user; return {user};},
            async signInWithPopup(){calls.popup++; if(opts.popupError)throw opts.popupError; w.auth.currentUser=user; return {user};},
            async updateProfile(){calls.update++; if(opts.updateError)throw opts.updateError;}
        };
        w.curriculumSocial = {
            async getUserProfile(){return opts.get ? opts.get(w) : {success:false,code:'profile/not-found'};},
            async createUserProfile(uid,data){calls.save.push({uid,data}); return opts.save ? opts.save() : {success:true};}
        };
        bindAuthForms(w, url=>calls.navigate.push(url));
        d.getElementById('email').value=user.email;
        d.getElementById('password').value='synthetic-password';
        if(page==='signup'){d.getElementById('displayName').value='Synthetic';d.getElementById('role').value='parent';}
        const form=d.getElementById(page+'Form');
        return {dom,w,d,calls,submit(){form.dispatchEvent(new w.Event('submit',{cancelable:true}));},google(){d.getElementById(page==='signup'?'googleSignup':'googleLogin').click();},error(){return d.getElementById('errorMessage').textContent;}};
    }
    let passed=0;
    async function test(name, fn){await fn(); passed++; console.log('PASS '+name);}
    await test('signup waits for saved profile and guards concurrent/repeated submit',async()=>{
        const pending=deferred(), x=setup('signup',{save:()=>pending.promise});x.submit();x.submit();await tick();
        assert.equal(x.calls.create,1);assert.equal(x.calls.save.length,1);assert.equal(x.calls.navigate.length,0);assert(x.d.getElementById('signupBtn').disabled);
        pending.resolve({success:true});await tick();assert.deepEqual(x.calls.navigate,['dashboard.html']);assert.equal(x.d.getElementById('password').value,'');x.submit();assert.equal(x.calls.create,1);x.dom.window.close();
    });
    await test('failed profile save preserves values and retry reuses authenticated account',async()=>{
        let failed=true;const x=setup('signup',{save:async()=>failed?{success:false,code:'permission-denied'}:{success:true}});x.submit();await tick();
        assert.equal(x.calls.navigate.length,0);assert.match(x.error(),/profile could not/);assert.equal(x.d.getElementById('email').value,user.email);assert(!x.d.getElementById('signupBtn').disabled);
        failed=false;x.submit();await tick();assert.equal(x.calls.create,1);assert.equal(x.calls.save.length,2);assert.equal(x.calls.navigate.length,1);x.dom.window.close();
    });
    await test('denied Google profile read never overwrites a possibly existing profile',async()=>{
        const x=setup('signup',{get:async()=>({success:false,code:'permission-denied'})});x.google();await tick();assert.equal(x.calls.popup,1);assert.equal(x.calls.save.length,0);assert.equal(x.calls.navigate.length,0);assert.match(x.error(),/profile/);x.dom.window.close();
    });
    await test('existing profile is preserved without name or role changes',async()=>{
        const x=setup('signup',{get:async()=>({success:true,data:{role:'teacher'}})});x.google();await tick();assert.equal(x.calls.save.length,0);assert.equal(x.calls.update,0);assert.equal(x.calls.navigate.length,1);x.dom.window.close();
    });
    await test('reload recovery uses matching authenticated email without creating account',async()=>{
        const x=setup('signup',{currentUser:user});x.submit();await tick();assert.equal(x.calls.create,0);assert.equal(x.calls.save.length,1);x.dom.window.close();
    });
    await test('invalid role and blank display name rejected before authentication',async()=>{
        for(const [id,value]of [['role',''],['displayName','  ']]){const x=setup();x.d.getElementById(id).value=value;x.submit();await tick();assert.equal(x.calls.create,0);assert.equal(x.calls.save.length,0);x.dom.window.close();}
        const x=setup();x.d.getElementById('role').value='';x.google();await tick();assert.equal(x.calls.popup,0);x.dom.window.close();
    });
    await test('session changes prevent profile writes and navigation',async()=>{
        const x=setup('signup',{get:async w=>{w.auth.currentUser={uid:'unrelated'};return {success:false,code:'profile/not-found'};}});x.submit();await tick();assert.equal(x.calls.save.length,0);assert.equal(x.calls.navigate.length,0);assert.match(x.error(),/sign-in changed/);x.dom.window.close();
    });
    await test('Google cancellation is recoverable without leaking service error',async()=>{
        const x=setup('signup',{popupError:{code:'auth/popup-closed-by-user',message:'private payload'}});x.google();await tick();assert.match(x.error(),/cancelled/);assert(!x.error().includes('private payload'));assert(!x.d.getElementById('googleSignup').disabled);x.dom.window.close();
    });
    await test('login checks profile and offers incomplete setup recovery',async()=>{
        const x=setup('login');x.submit();await tick();assert.equal(x.calls.navigate.length,0);assert.match(x.error(),/incomplete/);assert.equal(x.calls.save.length,0);x.dom.window.close();
        const y=setup('login',{get:async()=>({success:true,data:{}})});y.google();await tick();assert.deepEqual(y.calls.navigate,['dashboard.html']);y.dom.window.close();
    });
    await test('missing service reports unavailable and preserves input',async()=>{
        const x=setup();delete x.w.firebaseAuth;x.submit();await tick();assert.match(x.error(),/unavailable/);assert.equal(x.calls.create,0);assert.equal(x.d.getElementById('email').value,user.email);x.dom.window.close();
    });
    await test('all source auth observers/signout use modular interface',async()=>{
        for(const name of fs.readdirSync(root).filter(n=>n.endsWith('.html'))){const s=fs.readFileSync(path.join(root,name),'utf8');assert(!/window\.auth\.(onAuthStateChanged|signOut)\(/.test(s),name);}
        for(const name of ['login','signup']){const s=fs.readFileSync(path.join(root,name+'.html'),'utf8');assert(s.includes('src="js/auth-entry.js"'));assert(s.includes('role="alert"'));}
        assert(fs.readFileSync(path.join(root,'js/firebase-config.js'),'utf8').includes("code: 'profile/not-found'"));
    });
    console.log(passed+' account scenario groups passed; no network or real accounts');
})().catch(error=>{console.error(error);process.exitCode=1;});
