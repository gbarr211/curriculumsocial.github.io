const {JSDOM,VirtualConsole}=require('jsdom');
const fs=require('node:fs'); const assert=require('node:assert/strict');
const source=fs.readFileSync(process.env.CAPTURE_HTML||__dirname+'/../../interest.html','utf8');
const tick=()=>new Promise(r=>setImmediate(r));
async function setup({save=async()=>({id:'synthetic'}),email='ok',db=true}={}) {
 const logs=[],writes=[],mails=[],errors=[]; const vc=new VirtualConsole();
 for(const t of ['log','warn','error'])vc.on(t,(...a)=>logs.push(a));vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(source.replace(/<script\b[^>]*src=[^>]*>[\s\S]*?<\/script>/gi,''),{runScripts:'dangerously',virtualConsole:vc,beforeParse(w){
  if(db){w.db={}; w.firebaseFirestore={collection:()=>({}),addDoc:async(c,d)=>{writes.push(d);return save();}};}
  if(email!=='missing')w.emailjs={init(){},sendForm(...a){mails.push(a);if(email==='throw')throw Error('synthetic');if(email==='reject')return Promise.reject(Error('synthetic'));if(email==='hang')return new Promise(()=>{});return Promise.resolve({});}};
 }}); await tick(); const w=dom.window,d=w.document,f=d.querySelector('form');
 Object.entries({name:'CS-SYNTHETIC',email:'synthetic@example.invalid',location:'Test area',interest:'Synthetic only'}).forEach(([k,v])=>d.getElementById(k).value=v);
 d.querySelector('[data-value="parent"]').click(); d.getElementById('privacy-consent').checked=true;
 return {dom,w,d,f,logs,writes,mails,errors,submit(){f.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));},visible(id){return !d.getElementById(id).classList.contains('hidden');}};
}
(async()=>{let passed=0;async function test(name,fn){await fn();console.log('PASS '+name);passed++;}
 await test('success depends on completed save; rapid repeat writes once',async()=>{let done;const x=await setup({save:()=>new Promise(r=>done=r)});x.submit();x.submit();assert.equal(x.writes.length,1);assert(!x.visible('form-success'));assert(x.f.querySelector('button').disabled);done({id:'synthetic'});await tick();assert(x.visible('form-success'));x.submit();assert.equal(x.writes.length,1);assert.equal(x.logs.length,0);assert.equal(x.errors.length,0);x.dom.window.close();});
 for(const mode of ['missing','throw','reject','hang'])await test('optional email '+mode+' cannot block save',async()=>{const x=await setup({email:mode});x.submit();await tick();assert(x.visible('form-success'));assert(!x.visible('form-error'));assert.equal(x.writes.length,1);assert.equal(x.logs.length,0);x.dom.window.close();});
 await test('failed storage preserves values; retry clears stale error',async()=>{let fail=true;const x=await setup({save:async()=>{if(fail)throw Error('private payload');return {id:'synthetic'};}});x.submit();await tick();assert(x.visible('form-error'));assert(!x.visible('form-success'));assert.equal(x.d.getElementById('email').value,'synthetic@example.invalid');assert(!x.f.querySelector('button').disabled);assert.equal(x.mails.length,0);fail=false;x.submit();await tick();assert(x.visible('form-success'));assert(!x.visible('form-error'));assert.equal(x.logs.length,0);x.dom.window.close();});
 await test('missing Firebase offers recoverable error',async()=>{const x=await setup({db:false});x.submit();await tick();assert(x.visible('form-error'));assert(!x.visible('form-success'));assert.equal(x.mails.length,0);x.dom.window.close();});
 await test('unchecked consent, missing role, whitespace and invalid email rejected',async()=>{for(const [k,v]of [['privacy-consent',false],['stakeholder-type',''],['interest','   '],['email','invalid']]){const x=await setup();const el=x.d.getElementById(k);if(k==='privacy-consent')el.checked=v;else el.value=v;x.submit();await tick();assert.equal(x.writes.length,0,k);assert(x.visible('form-error'),k);x.dom.window.close();}});
 await test('unchecked preferences stay false and notification uses initial snapshot',async()=>{let done;const x=await setup({save:()=>new Promise(r=>done=r)});x.submit();x.d.getElementById('email').value='changed@example.invalid';done({id:'synthetic'});await tick();assert.equal(x.writes[0].emailUpdates,false);assert.equal(x.writes[0].newsletter,false);assert.equal(x.writes[0].eventInvites,false);assert.equal(x.mails[0][2].querySelector('#email').value,'synthetic@example.invalid');assert.equal(x.logs.length,0);x.dom.window.close();});
 console.log(passed+' scenario groups passed; no external resources loaded');
})().catch(e=>{console.error(e);process.exitCode=1;});
