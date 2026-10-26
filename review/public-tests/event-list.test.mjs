import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';

// Real UI, synthetic delayed reads only. No Firebase or production records.
const uiUrl=new URL('../event-pilot/ui.mjs',import.meta.url);
let source=await readFile(uiUrl,'utf8');
source=source.replace(/from '(\.\/[^']+)'/g,(_,path)=>`from '${new URL(path,uiUrl).href}'`);
const icons=await readFile(new URL('../../js/community-icons.js',import.meta.url),'utf8');
source=source.replace("'/js/community-icons.js'",JSON.stringify('data:text/javascript;base64,'+Buffer.from(icons).toString('base64')));
const {bindEvents}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const settle=()=>new Promise(resolve=>setImmediate(resolve));
const gathering=(id,title=id)=>({id,hostId:'host',hostName:'Synthetic host',title,description:'Local synthetic gathering.',kind:'social',area:'east',venueType:'outdoors',status:'open',startsAt:Date.now()+86400000,endsAt:Date.now()+90000000,capacity:12,approvedPeople:0});
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no});return {promise,resolve,reject}};
async function fixture({initialHold=false}={}){
 const dom=new JSDOM(await readFile(new URL('../../events.html',import.meta.url),'utf8'),{url:'https://local.invalid/events.html'}),document=dom.window.document;
 const previous={document:globalThis.document,location:globalThis.location};globalThis.document=document;globalThis.location=dom.window.location;
 for(const dialog of document.querySelectorAll('dialog')){dialog.showModal=()=>dialog.open=true;dialog.close=()=>{dialog.open=false;dialog.dispatchEvent(new dom.window.Event('close'))}};
 let person={uid:'guest',name:'Synthetic adult',emailVerified:true},observe;const calls=[],holds=new Map(),results={browse:{items:[gathering('Synthetic_first')],cursor:'page2'},plans:{items:[],cursor:null},hosting:{items:[gathering('Synthetic_hosted')],cursor:null}},gets=[];
 const hold=method=>{const value=deferred();holds.set(method,value);return value};
 const initial=initialHold?hold('browse'):null;
 const read=async(method,cursor)=>{calls.push({method,cursor});const pending=holds.get(method);holds.delete(method);return pending?pending.promise:structuredClone(results[method])};
 const service={identity:()=>person,observe(fn){observe=fn;fn(person);return()=>{}},browse:c=>read('browse',c),plans:c=>read('plans',c),hosting:c=>read('hosting',c),get:async id=>{gets.push(id);return read('get',id)},dispose(){}};
 const stop=bindEvents(service),node=id=>document.getElementById(id);await settle();
 return {dom,document,node,calls,gets,initial,hold,results,view(name){document.querySelector(`[data-view="${name}"]`).click()},identity(value){person=value;observe(value)},close(){stop();dom.window.close();Object.assign(globalThis,previous)}};
}

test('initial read announces loading without claiming there are no gatherings',async()=>{
 const f=await fixture({initialHold:true});try{
  assert.match(f.node('events-status').textContent,/Loading gatherings/);assert.equal(f.node('events-empty').hidden,true);assert.equal(f.node('events-list').getAttribute('aria-busy'),'true');assert.equal(f.node('events-refresh').disabled,true);
  f.initial.resolve({items:[],cursor:null});await settle();assert.equal(f.node('events-list').getAttribute('aria-busy'),'false');assert.equal(f.node('events-empty').hidden,false);assert.match(f.node('events-empty').textContent,/no upcoming/);
 }finally{f.close()}
});
test('switching views immediately changes selection and clears the previous list',async()=>{
 const f=await fixture();try{
  const held=f.hold('plans');f.view('plans');assert.equal(f.node('events-list').children.length,0);assert.equal(f.document.querySelector('[aria-current="page"][data-view]').dataset.view,'plans');assert.equal(f.node('events-list-title').textContent,'Your household plans');assert.match(f.node('events-status').textContent,/Loading your plans/);assert.equal(f.node('events-empty').hidden,true);
  held.reject(Error('Synthetic offline'));await settle();assert.equal(f.node('events-empty').hidden,true);assert.match(f.node('events-status').textContent,/could not be loaded.*Synthetic offline/i);assert.equal(f.node('events-refresh').textContent,'Try again');
  f.node('events-refresh').click();await settle();assert.equal(f.node('events-empty').hidden,false);assert.match(f.node('events-empty').textContent,/household requests/);
 }finally{f.close()}
});
test('double pagination starts one read and overlapping pages replace duplicate cards',async()=>{
 const f=await fixture();try{
  const held=f.hold('browse');f.node('events-more').click();f.node('events-more').click();assert.equal(f.calls.filter(c=>c.method==='browse').length,2);assert.equal(f.node('events-more').disabled,true);assert.match(f.node('events-status').textContent,/Loading more/);
  held.resolve({items:[gathering('Synthetic_first','Updated first'),gathering('Synthetic_second')],cursor:null});await settle();assert.equal(f.node('events-list').children.length,2);assert.match(f.node('events-list').textContent,/Updated first/);assert.equal(f.node('events-count').textContent,'2 shown · 2 loaded');assert.equal(f.node('events-more').hidden,true);
 }finally{f.close()}
});
test('failed pagination retains loaded cards and retries the same cursor',async()=>{
 const f=await fixture();try{
  const held=f.hold('browse');f.node('events-more').click();held.reject(Error('Synthetic page failure'));await settle();assert.equal(f.node('events-list').children.length,1);assert.equal(f.node('events-more').disabled,false);assert.equal(f.node('events-more').hidden,false);assert.match(f.node('events-status').textContent,/Loaded gatherings are still shown/);
  f.results.browse={items:[gathering('Synthetic_second')],cursor:null};f.node('events-more').click();await settle();assert.deepEqual(f.calls.filter(c=>c.method==='browse').map(c=>c.cursor),[null,'page2','page2']);assert.equal(f.node('events-list').children.length,2);
 }finally{f.close()}
});
test('late plans response is discarded before hydrating records for an old view',async()=>{
 const f=await fixture();try{
  const held=f.hold('plans');f.view('plans');f.view('hosting');await settle();held.resolve({items:[{eventId:'Synthetic_old',requesterId:'guest',status:'pending'}],cursor:null});await settle();assert.deepEqual(f.gets,[]);assert.match(f.node('events-list').textContent,/Synthetic_hosted/);assert.equal(f.node('events-list-title').textContent,'Your gatherings');
 }finally{f.close()}
});
test('late pagination success cannot append cards into another view',async()=>{
 const f=await fixture();try{
  const held=f.hold('browse');f.node('events-more').click();f.view('hosting');await settle();held.resolve({items:[gathering('Synthetic_old')],cursor:'oldCursor'});await settle();assert.equal(f.node('events-list').children.length,1);assert.ok(!f.node('events-list').textContent.includes('Synthetic_old'));assert.equal(f.node('events-more').hidden,true);
 }finally{f.close()}
});
test('old rejection cannot replace the current view status or release its pending state',async()=>{
 const f=await fixture();try{
  const old=f.hold('plans');f.view('plans');const current=f.hold('hosting');f.view('hosting');old.reject(Error('Old failure'));await settle();assert.match(f.node('events-status').textContent,/Loading your gatherings/);assert.equal(f.node('events-refresh').disabled,true);current.resolve({items:[],cursor:null});await settle();assert.equal(f.node('events-refresh').disabled,false);assert.ok(!f.node('events-status').textContent.includes('Old failure'));
 }finally{f.close()}
});
test('failed refresh preserves same-view rows with an explicit stale-results notice',async()=>{
 const f=await fixture();try{
  const held=f.hold('browse');f.node('events-refresh').click();assert.equal(f.node('events-list').children.length,1);held.reject(Error('Synthetic refresh failure'));await settle();assert.equal(f.node('events-list').children.length,1);assert.match(f.node('events-status').textContent,/Loaded gatherings are still shown/);assert.equal(f.node('events-empty').hidden,true);
 }finally{f.close()}
});
test('sign-out discards a pending page and clears the list loading state',async()=>{
 const f=await fixture();try{
  const held=f.hold('browse');f.node('events-more').click();f.identity(null);held.resolve({items:[gathering('Synthetic_private')],cursor:null});await settle();assert.equal(f.node('events-list').children.length,0);assert.equal(f.node('events-status').textContent,'');assert.equal(f.node('events-list').getAttribute('aria-busy'),'false');assert.equal(f.node('events-signed-in').hidden,true);
 }finally{f.close()}
});
test('plan hydration supports removed gatherings and ignores late detail reads',async()=>{
 const f=await fixture();try{
  f.results.plans={items:[{eventId:'Synthetic_removed',eventTitle:'Removed plan',eventArea:'east',eventStartsAt:Date.now()+86400000,requesterId:'guest',status:'withdrawn'}],cursor:null};f.results.get=null;f.view('plans');await settle();assert.match(f.node('events-list').textContent,/Removed plan.*Listing removed/s);
  const held=f.hold('get');f.node('events-refresh').click();await settle();f.view('hosting');await settle();held.resolve(gathering('Synthetic_late'));await settle();assert.match(f.node('events-list').textContent,/Synthetic_hosted/);assert.ok(!f.node('events-list').textContent.includes('Synthetic_late'));
 }finally{f.close()}
});

test('reselecting a pending tab does not issue duplicate first-page reads',async()=>{
 const f=await fixture();try{
  const held=f.hold('plans');f.view('plans');f.view('plans');f.view('plans');assert.equal(f.calls.filter(c=>c.method==='plans').length,1);held.resolve({items:[],cursor:null});await settle();assert.equal(f.node('events-list-title').textContent,'Your household plans');
 }finally{f.close()}
});
test('filtering during a read preserves loading and applies to the returned page',async()=>{
 const f=await fixture();try{
  const held=f.hold('browse');f.node('events-more').click();f.node('filter-kind').value='learning';f.node('events-filters').dispatchEvent(new f.dom.window.Event('submit',{bubbles:true,cancelable:true}));assert.equal(f.node('events-empty').hidden,true);assert.equal(f.node('events-list').getAttribute('aria-busy'),'true');
  held.resolve({items:[{...gathering('Synthetic_learning'),kind:'learning'}],cursor:null});await settle();assert.equal(f.node('events-list').children.length,1);assert.match(f.node('events-list').textContent,/Synthetic_learning/);assert.equal(f.node('events-count').textContent,'1 shown · 2 loaded');
  f.node('clear-event-filters').click();assert.equal(f.node('events-list').children.length,2);
 }finally{f.close()}
});
test('a second identity discards earlier reads even when both sessions use the same UID',async()=>{
 const f=await fixture();try{
  const held=f.hold('plans');f.view('plans');f.identity(null);f.identity({uid:'guest',name:'Returning adult',emailVerified:true});await settle();held.resolve({items:[{eventId:'Synthetic_old_identity',requesterId:'guest',status:'pending'}],cursor:null});await settle();assert.deepEqual(f.gets,[]);assert.match(f.node('events-list').textContent,/Synthetic_first/);assert.equal(f.document.querySelector('[aria-current="page"][data-view]').dataset.view,'explore');
 }finally{f.close()}
});
