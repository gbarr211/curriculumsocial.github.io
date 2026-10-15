const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const tick=()=>new Promise(r=>setTimeout(r,400));
(async()=>{
 const root=path.resolve(__dirname,'../..');
 const site=process.env.ACCOUNT_PREVIEW_DIST;
 if(!site)throw Error('Set ACCOUNT_PREVIEW_DIST to packaged preview dist');
 const {bindAuthForms}=await import('data:text/javascript;base64,'+Buffer.from(fs.readFileSync(root+'/js/auth-forms.js')).toString('base64'));
 for(const mode of ['success','retry','denied']){
  const dom=new JSDOM(fs.readFileSync(site+'/account/signup.html','utf8'),{runScripts:'outside-only',url:'https://example.invalid/account/signup.html'});
  const w=dom.window,d=w.document;w.bindAuthForms=bindAuthForms;
  w.eval(fs.readFileSync(root+'/review/account-preview.js','utf8').replace(/^import .*;\n/m,''));
  d.getElementById('previewScenario').value=mode;
  const submit=()=>d.getElementById('signupForm').dispatchEvent(new w.Event('submit',{cancelable:true}));
  submit();await tick();
  if(mode==='success')assert(!d.getElementById('previewResult').hidden);
  else {assert(d.getElementById('previewResult').hidden);assert(!d.getElementById('errorMessage').classList.contains('hidden'));}
  if(mode==='retry'){submit();await tick();assert(!d.getElementById('previewResult').hidden);}
  assert(!fs.readFileSync(site+'/account/signup.html','utf8').includes('js/auth-entry.js'));
  dom.window.close();console.log('PASS packaged account preview '+mode);
 }
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const profile=new JSDOM(fs.readFileSync(site+'/account/profile.html','utf8').replace(/<script\b[^>]*src=[^>]*>[\s\S]*?<\/script>/gi,''),{runScripts:'dangerously',virtualConsole:vc,url:'https://example.invalid/account/profile.html',beforeParse(w){w.eval(fs.readFileSync(root+'/review/profile-preview.js','utf8'));w.alert=()=>{};}});
 await tick();assert.equal(profile.window.document.getElementById('profileName').textContent,'Sample Adult');assert.equal(profile.window.document.getElementById('studentsSection').style.display,'none');assert.deepEqual(errors,[]);
 profile.window.close();console.log('PASS packaged adult profile preview loads without child data or runtime errors');
})().catch(e=>{console.error(e);process.exitCode=1;});
