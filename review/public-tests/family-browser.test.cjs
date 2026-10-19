const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {firebaseApp,firebaseFirestore}=require('./firebase-browser-fixtures.cjs');
const root=path.resolve(__dirname,'../..');
const auth=`
let user=JSON.parse(sessionStorage.getItem('cs-test-user')||'null');
const observers=[];
const auth={get currentUser(){return user;},authStateReady:async()=>{}};
const emit=u=>{user=u;sessionStorage.setItem('cs-test-user',JSON.stringify(u));observers.forEach(cb=>cb(u));};
export function getAuth(){return auth;}
export class GoogleAuthProvider{setCustomParameters(){}}
export function onAuthStateChanged(a,cb){observers.push(cb);queueMicrotask(()=>cb(user));return ()=>{};}
export async function createUserWithEmailAndPassword(a,email){emit({uid:'synthetic-a',email});}
export async function signInWithEmailAndPassword(a,email){emit({uid:'synthetic-a',email});}
export async function signInWithPopup(){emit({uid:'synthetic-a',email:'synthetic@example.invalid'});}
export async function signOut(){emit(null);}
export async function sendPasswordResetEmail(){}
export async function deleteUser(){emit(null);}
export async function updateProfile(target,profile){Object.assign(target,profile);sessionStorage.setItem('cs-test-user',JSON.stringify(target));}
`;
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost'),file=path.resolve(root,'.'+(url.pathname==='/'?'/index.html':url.pathname));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);
});
let browser,passed=0;
const pass=name=>{console.log('PASS '+name);passed++;};
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true});
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:900}}),errors=[],unexpected=[];
  await context.route('**/*',route=>{
   const url=route.request().url();
   const body=url.endsWith('/firebase-app.js')?firebaseApp:url.endsWith('/firebase-auth.js')?auth:url.endsWith('/firebase-firestore.js')?firebaseFirestore:null;
   if(body)return route.fulfill({contentType:'text/javascript',body});
   if(url.startsWith(base+'/'))return route.continue();
   unexpected.push(url);return route.abort();
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/signup.html');await page.locator('#account-controls:not([disabled])').waitFor();
  await page.locator('#email').fill('synthetic@example.invalid');await page.locator('#password').fill('synthetic-password');await page.locator('#consent').check();await page.locator('#submit-account').click();
  await page.waitForURL('**/member.html');await page.locator('#profile-fields:not([disabled])').waitFor();
  assert.equal(await page.locator('#discoverable').isChecked(),false);
  await page.locator('#displayName').fill('Smith Family');await page.locator('[name=philosophies][value=montessori]').check();await page.locator('[name=interests][value=practical]').check();await page.locator('#profile-consent').check();
  // Generate only a synthetic colour tile; exercise the real browser image pipeline.
  const png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=640;c.height=480;c.getContext('2d').fillRect(0,0,640,480);return c.toDataURL('image/png').split(',')[1];});
  await page.locator('#profile-photo').setInputFiles({name:'synthetic.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});
  await page.locator('#profile-fields:not([disabled])').waitFor();
  await page.locator('#member-form button[type=submit]').click();await page.locator('#family-discovery').waitFor({state:'visible'});
  await page.reload();await page.locator('#family-discovery').waitFor({state:'visible'});
  await page.locator('#show-profile').click();assert.equal(await page.locator('#displayName').inputValue(),'Smith Family');assert.equal(await page.locator('[name=philosophies][value=montessori]').isChecked(),true);
  assert.equal(await page.locator('#profile-avatar img').evaluate(img=>img.naturalWidth),320);
  assert.match(await page.locator('#profile-avatar img').getAttribute('src'),/^data:image\/jpeg;base64,/);
  pass('signup redirects to setup; profile and compressed picture reload at '+width+'px (mock storage)');
  await page.locator('#displayName').fill('Smith Family Updated');await page.locator('#discoverable').check();await page.locator('#member-form button[type=submit]').click();await page.locator('#family-discovery').waitFor({state:'visible'});
  const card=await page.evaluate(()=>JSON.parse(localStorage.getItem('cs-test-db'))['family_directory/synthetic-a']);assert.equal(card.displayName,'Smith Family Updated');assert.equal('contribution' in card,false);assert.equal('availability' in card,false);assert.equal('email' in card,false);
  await page.evaluate(()=>{const data=JSON.parse(localStorage.getItem('cs-test-db'));data['family_directory/synthetic-b']={displayName:'Quiet Family',area:'samui-north',languages:'Thai',philosophies:['charlotte_mason'],interests:['practical'],about:'Hello',photo:'',updatedAt:1};localStorage.setItem('cs-test-db',JSON.stringify(data));});
  await page.locator('#show-families').click();await page.locator('.family-card').waitFor();
  await page.locator('#family-search').fill('Practical life skills');await page.locator('#family-filters button[type=submit]').click();assert.equal(await page.locator('.family-card').count(),1);
  await page.locator('#family-search').fill('CHARLOTTE MASON');await page.locator('#family-filters button[type=submit]').click();assert.equal(await page.locator('.family-card').count(),1);
  await page.locator('#family-search').focus();await page.keyboard.press('Tab');assert.equal(await page.locator('#family-philosophy').evaluate(el=>el===document.activeElement),true);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  if(process.env.CS_SCREENSHOT_DIR){fs.mkdirSync(process.env.CS_SCREENSHOT_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.CS_SCREENSHOT_DIR,'family-discovery-'+width+'.png'),fullPage:true});}
  pass('editing, exact card projection, label search and keyboard discovery at '+width+'px');
  await page.goto(base+'/account/profile.html');await page.locator('#signed-in').waitFor({state:'visible'});await page.locator('#delete-account').click();await page.locator('#confirm-delete').click();await page.locator('#account-status').filter({hasText:'Delete your saved profile'}).waitFor();
  pass('account deletion is guarded while a family profile exists at '+width+'px');
  await page.goto(base+'/profile.html');await page.waitForURL('**/member.html?view=profile');await page.locator('#profile-fields:not([disabled])').waitFor();await page.locator('#family-setup').waitFor({state:'visible'});await page.locator('#discoverable').uncheck();await page.locator('#member-form button[type=submit]').click();await page.locator('#family-discovery').waitFor({state:'visible'});
  assert.equal(await page.evaluate(()=>!!JSON.parse(localStorage.getItem('cs-test-db'))['family_directory/synthetic-a']),false);
  await page.locator('#show-profile').click();await page.locator('#member-delete').click();await page.locator('#profile-delete-yes').click();await page.locator('#member-status').filter({hasText:'were deleted'}).waitFor();
  assert.equal(await page.evaluate(()=>!!JSON.parse(localStorage.getItem('cs-test-db'))['adult_profiles/synthetic-a']),false);
  await page.locator('#member-logout').click();await page.locator('#signed-out').waitFor({state:'visible'});assert.equal(await page.locator('.family-card').count(),0);assert.equal(await page.locator('#displayName').inputValue(),'');
  assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[]);pass('profile alias, opt-out, deletion and session clearing at '+width+'px');
  await context.close();
 }
 console.log(passed+' family browser scenario groups passed; all Firebase traffic mocked, no production writes.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();server.close();});
