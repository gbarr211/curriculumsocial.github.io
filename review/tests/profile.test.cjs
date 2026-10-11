const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const tick=()=>new Promise(r=>setImmediate(r));
const source=fs.readFileSync(path.resolve(__dirname,'../../profile.html'),'utf8');
const person={uid:'synthetic-owner',email:'synthetic@example.invalid'};
const data={displayName:'Synthetic Adult',email:person.email,role:'teacher',bio:'',location:'Test area',matchingRadius:25,philosophies:[]};
async function setup(opts={}) {
 let observer;const alerts=[],saves=[],errors=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(source.replace(/<script\b[^>]*src=[^>]*>[\s\S]*?<\/script>/gi,''),{runScripts:'dangerously',virtualConsole:vc,url:'https://example.invalid/profile.html',beforeParse(w){
  w.curriculumSocialDemo={demoProfile:{...data,role:'parent'},demoStudents:opts.students || [{id:'sample-child',name:'Sample Child',age:6,grade:'Sample grade',interests:['nature']}],activate(){w.isDemoMode=true;return {uid:'demo'};}};
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

 for (const photoURL of ['https://example.invalid/x" onerror="window.injected=true', 'javascript:alert(1)', 'data:image/svg+xml,<svg/>', '//example.invalid/a.png', 'http://example.invalid/a.png']) {
  x=await setup({get:async()=>({success:true,data:{...data,photoURL}})});
  const avatar=x.d.getElementById('profileAvatar');
  assert.equal(avatar.querySelector('[onerror]'),null,'avatar must not parse attributes from stored URL');
  const img=avatar.querySelector('img');if(img)assert.equal(new URL(img.src).protocol,'https:');
  assert.equal(x.w.injected,undefined);assert.equal(x.errors.length,0);x.dom.window.close();
 }
 console.log('PASS untrusted avatar URLs cannot inject HTML or non-HTTPS sources');
 x=await setup({get:async()=>({success:true,data:{...data,photoURL:'https://example.invalid/avatar.png'}})});
 let img=x.d.querySelector('#profileAvatar img');assert(img);assert.equal(img.src,'https://example.invalid/avatar.png');assert.equal(img.referrerPolicy,'no-referrer');
 img.dispatchEvent(new x.w.Event('error'));assert.equal(x.d.getElementById('profileAvatar').textContent,'S');x.dom.window.close();
 console.log('PASS HTTPS avatar renders and failed image falls back to initial');
 let record={...data,philosophies:['montessori']};x=await setup({get:async()=>({success:true,data:record})});assert(x.d.getElementById('montessori').checked);
 record={...data,philosophies:[]};await x.observer(person);assert(!x.d.getElementById('montessori').checked);x.dom.window.close();
 console.log('PASS profile reload clears stale philosophy choices');
 x=await setup({get:async()=>({success:true,data:{...data,displayName:'<img src=x onerror=alert(1)>',bio:'<script>bad</script>',philosophies:'bad historical field',role:{}}})});
 assert.equal(x.d.getElementById('profileName').textContent,'<img src=x onerror=alert(1)>');assert.equal(x.d.querySelector('#profileName img'),null);assert.equal(x.d.getElementById('profileContent').style.display,'block');assert.equal(x.errors.length,0);x.dom.window.close();
 console.log('PASS malformed historical fields and markup names render safely');

 x=await setup({get:async()=>({success:true,data:{...data,role:'parent'}})});
 assert.equal(x.d.querySelectorAll('#studentsList .student-card').length,0,'real parent must not inherit sample children');
 assert.match(x.d.getElementById('studentsList').textContent,/not enabled/i);
 assert(x.d.getElementById('addStudentBtn').disabled);
 x.d.getElementById('studentForm').dispatchEvent(new x.w.Event('submit',{cancelable:true}));await tick();assert(!x.alerts.some(a=>/saved successfully/i.test(a)));assert.equal(x.saves.length,0);x.dom.window.close();
 console.log('PASS future real-parent path has no sample children or false save confirmation');
 x=await setup();await x.observer(null);assert.equal(x.d.querySelectorAll('#studentsList .student-card').length,1);assert.match(x.d.getElementById('studentsList').textContent,/Sample Child/);assert(!x.d.getElementById('addStudentBtn').disabled);
 await x.observer(person);assert.equal(x.d.querySelectorAll('#studentsList .student-card').length,0);await x.observer(null);assert.equal(x.d.querySelectorAll('#studentsList .student-card').length,1);x.dom.window.close();
 console.log('PASS demo children preserved through demo/account/demo switching');
 x=await setup({students:[{id:"');window.injected=true;//",name:'<img src=x onerror=alert(1)>',age:6,grade:'<svg onload=alert(1)>',interests:['<b>nature</b>']}]});await x.observer(null);
 assert.equal(x.d.querySelector('#studentsList img, #studentsList svg, #studentsList [onclick]'),null);
 assert.match(x.d.getElementById('studentsList').textContent,/<img src=x/);let chosen;x.w.editStudent=id=>chosen=id;x.d.querySelector('#studentsList button').click();assert.equal(chosen,"');window.injected=true;//");assert.equal(x.w.injected,undefined);assert.equal(x.errors.length,0);x.dom.window.close();
 console.log('PASS child labels and IDs remain data, including event handlers');
})().catch(e=>{console.error(e);process.exitCode=1;});
