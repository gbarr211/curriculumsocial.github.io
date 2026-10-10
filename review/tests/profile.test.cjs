const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const tick=()=>new Promise(r=>setImmediate(r));
const source=fs.readFileSync(path.resolve(__dirname,'../../profile.html'),'utf8');
const person={uid:'synthetic-owner',email:'synthetic@example.invalid'};
const data={displayName:'Synthetic Adult',email:person.email,role:'teacher',bio:'',location:'Test area',matchingRadius:25,philosophies:[]};
async function setup(opts={}) {
 let observer;const alerts=[],saves=[],errors=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(source.replace(/<script\b[^>]*src=[^>]*>[\s\S]*?<\/script>/gi,''),{runScripts:'dangerously',virtualConsole:vc,url:'https://example.invalid/profile.html',beforeParse(w){
  w.auth={currentUser:person};w.alert=x=>alerts.push(x);w.requireRealAccount=()=>true;
  w.firebaseAuth={onAuthStateChanged(auth,cb){observer=cb;}};
  w.curriculumSocial={getUserProfile:async()=>opts.get?opts.get():{success:true,data},updateUserProfile:async(uid,record)=>{saves.push(record);return opts.save?opts.save():{success:true};}};
 }});
 await tick();await observer(person);return {dom,w:dom.window,d:dom.window.document,alerts,saves,errors,observer};
}
(async()=>{
 let x=await setup({get:async()=>({success:false,code:'permission-denied'})});assert(!x.d.getElementById('profileError').hidden);assert.equal(x.d.getElementById('loadingState').style.display,'none');assert.equal(x.d.getElementById('profileContent').style.display,'none');assert.equal(x.errors.length,0);x.dom.window.close();console.log('PASS denied profile load ends spinner with retry');
 let failed=true;x=await setup({save:async()=>failed?{success:false}:{success:true}});x.d.getElementById('editModeBtn').click();x.d.getElementById('bio').value='Edited synthetic bio';
 const submit=()=>x.d.getElementById('profileUpdateForm').dispatchEvent(new x.w.Event('submit',{cancelable:true}));
 submit();await tick();assert.equal(x.alerts.length,0);assert(!x.d.getElementById('profileError').hidden);assert.equal(x.d.getElementById('bio').value,'Edited synthetic bio');assert.equal(x.d.getElementById('profileForm').style.display,'block');failed=false;submit();await tick();assert.equal(x.alerts.length,1);assert.equal(x.saves.length,2);assert.equal(x.errors.length,0);x.dom.window.close();console.log('PASS denied profile save retains edits and retry confirms save');
 let done;x=await setup({save:()=>new Promise(r=>done=r)});x.d.getElementById('profileUpdateForm').dispatchEvent(new x.w.Event('submit',{cancelable:true}));x.d.getElementById('profileUpdateForm').dispatchEvent(new x.w.Event('submit',{cancelable:true}));assert.equal(x.saves.length,1);done({success:true});await tick();x.dom.window.close();console.log('PASS concurrent profile saves write once');
 x=await setup();x.w.isDemoMode=true;x.d.getElementById('studentsSection').style.display='block';x.d.getElementById('studentsList').textContent='Sample child placeholder';await x.observer(person);assert.equal(x.w.isDemoMode,false);assert.equal(x.d.getElementById('studentsSection').style.display,'none');assert.equal(x.d.getElementById('studentsList').textContent,'');x.dom.window.close();console.log('PASS real session clears previous demo child placeholders');
})().catch(e=>{console.error(e);process.exitCode=1;});
