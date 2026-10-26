const {chromium}=require('playwright-core');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {firebaseApp,firebaseFirestore}=require('./firebase-browser-fixtures.cjs');
const root=path.resolve(__dirname,'../..');
// Routing regression only: synthetic sign-in and destination pages. No accounts,
// emails, database calls, or claims about real authentication are made here.
const auth=`let user=null;const observers=[];const auth={get currentUser(){return user},authStateReady:async()=>{}};
export function getAuth(){return auth}export class GoogleAuthProvider{setCustomParameters(){}}
export function onAuthStateChanged(a,cb){observers.push(cb);queueMicrotask(()=>cb(user));return()=>{}}
async function sign(){user={uid:'synthetic-adult',email:'adult@example.invalid'};observers.forEach(cb=>cb(user))}
export const signInWithEmailAndPassword=sign,createUserWithEmailAndPassword=sign,signInWithPopup=sign;
export async function updateProfile(){} export async function signOut(){} export async function sendPasswordResetEmail(){} export async function deleteUser(){}`;
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png'};
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+new URL(req.url,'http://local').pathname);if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end()}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res)});
let browser,passed=0;const errors=[],pass=name=>{passed++;console.log('PASS '+name)};
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium'});
 for(const [route,continuation,target] of [
  ['/login.html','continue=events&event=Gathering_123','/events.html?event=Gathering_123'],
  ['/signup.html','continue=events&event=Gathering_123','/events.html?event=Gathering_123'],
  ['/account/login.html','continue=events&event=Gathering_123','/events.html?event=Gathering_123'],
  ['/account/signup.html','continue=events&event=Gathering_123','/events.html?event=Gathering_123'],
  ['/login.html','continue=contributions','/contributions.html'],
  ['/signup.html','continue=introductions','/introductions.html']
 ]){
  const context=await browser.newContext({viewport:{width:390,height:844}});let blocked=true;
  await context.route('https://www.gstatic.com/**',r=>blocked?r.abort():r.fulfill({contentType:'text/javascript',body:r.request().url().includes('firebase-app.js')?firebaseApp:r.request().url().includes('firebase-firestore.js')?firebaseFirestore:auth}));
  await context.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin===base&&['/events.html','/contributions.html','/introductions.html','/member.html'].includes(u.pathname))return r.fulfill({contentType:'text/html',body:'<!doctype html><h1>Routing destination fixture</h1>'});return r.fallback()});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+route+'?'+continuation);await page.locator('#reload-account').waitFor({state:'visible'});
  assert.equal(await page.locator('#reload-account a').getAttribute('href'),route+'?'+continuation);
  assert.equal(await page.locator('#submit-account').isDisabled(),true);
  assert.match(await page.locator('#account-destination').innerText(),/After sign-in/);
  blocked=false;await page.locator('#reload-account a').click();await page.waitForFunction(()=>document.getElementById('account-controls')?.disabled===false);
  assert.equal(new URL(page.url()).search,'?'+continuation);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.locator('#email').fill('adult@example.invalid');await page.locator('#password').fill('synthetic-password');await page.locator('#consent').check();
  await page.locator('#submit-account').click();await page.waitForURL(base+target);
  pass('SDK failure → recovery → synthetic sign-in preserves '+route+' '+continuation);await context.close();
 }
 for(const query of ['continue=https%3A%2F%2Fevil.invalid&event=Gathering_123','continue=__proto__','continue=constructor','continue=events&event=..%2Fprivate&return=https%3A%2F%2Fevil.invalid']){
  const context=await browser.newContext();await context.route('https://www.gstatic.com/**',r=>r.abort());const page=await context.newPage();
  await page.goto(base+'/login.html?'+query);await page.locator('#reload-account').waitFor({state:'visible'});
  const href=await page.locator('#reload-account a').getAttribute('href');assert.equal(href,query.startsWith('continue=events')?'/login.html?continue=events':'/login.html');assert.ok(!href.includes('evil.invalid'));await context.close();
 }
 pass('unknown/prototype destinations, malformed event IDs and arbitrary return URLs are discarded');
 const context=await browser.newContext();await context.route('https://www.gstatic.com/**',r=>r.fulfill({contentType:'text/javascript',body:r.request().url().includes('firebase-app.js')?firebaseApp:r.request().url().includes('firebase-firestore.js')?firebaseFirestore:auth}));
 const page=await context.newPage();for(const width of [320,390,1280]){await page.setViewportSize({width,height:900});await page.goto(base+'/signup.html?continue=events&event=Gathering_123');await page.waitForFunction(()=>document.getElementById('account-controls')?.disabled===false);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.ok(await page.locator('#submit-account').evaluate(e=>e.getBoundingClientRect().height>=44));assert.equal(await page.locator('#account-destination').count(),1);if(process.env.CS_RETURN_SCREENSHOTS){fs.mkdirSync(process.env.CS_RETURN_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.CS_RETURN_SCREENSHOTS,'gathering-signup-'+width+'.png'),fullPage:true})}}
 await context.close();pass('gathering context stays readable at 320/390/1280px with usable submit targets');
 assert.deepEqual(errors,[]);console.log(passed+' account-return browser groups passed; mocked transport and destination fixtures only.');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close();await new Promise(r=>server.close(r))});
