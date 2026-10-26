import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';

// Execute the existing UI with its real models in a local DOM. No browser,
// Firebase, network, accounts or production writes are used by this fixture.
const uiUrl=new URL('../event-pilot/ui.mjs',import.meta.url);
let source=await readFile(uiUrl,'utf8');
source=source.replace(/from '(\.\/[^']+)'/g,(_,path)=>`from '${new URL(path,uiUrl).href}'`);
const icons=await readFile(new URL('../../js/community-icons.js',import.meta.url),'utf8');
source=source.replace("'/js/community-icons.js'",JSON.stringify('data:text/javascript;base64,'+Buffer.from(icons).toString('base64')));
const {bindEvents}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const settle=()=>new Promise(resolve=>setImmediate(resolve));

async function fixture(){
 const html=await readFile(new URL('../../events.html',import.meta.url),'utf8');
 const dom=new JSDOM(html,{url:'https://local.invalid/events.html'}),document=dom.window.document;
 const previous={document:globalThis.document,location:globalThis.location};
 globalThis.document=document;globalThis.location=dom.window.location;
 for(const dialog of document.querySelectorAll('dialog')){
  dialog.showModal=()=>dialog.open=true;
  dialog.close=()=>{dialog.open=false;dialog.dispatchEvent(new dom.window.Event('close'))};
 }
 let person={uid:'guest',name:'Synthetic adult',emailVerified:true},observe,watch,release=null,reads=0;
 let event={id:'Synthetic_refresh',hostId:'host',hostName:'Synthetic host',title:'Synthetic gathering',description:'Local fixture only.',kind:'social',area:'east',venueType:'outdoors',status:'open',startsAt:Date.now()+86400000,endsAt:Date.now()+90000000,capacity:12,approvedPeople:0,revision:1};
 let request=null;
 const copy=value=>structuredClone(value),calls=[];
 const service={identity:()=>person,observe(fn){observe=fn;fn(person);return()=>{}},
  browse:async()=>({items:[copy(event)],cursor:null}),plans:async()=>({items:[],cursor:null}),hosting:async()=>({items:[],cursor:null}),
  async get(){reads++;if(release){const pending=release;release=null;await pending.promise}return copy(event)},mine:async()=>copy(request),
  watch(id,fn){watch=fn;return()=>watch=null},location:async()=>({address:'SYNTHETIC location'}),
  async rsvp(id,revision,command,data){calls.push({id,revision,command,data});if(revision!==(request?.revision??0))throw Error('Synthetic request changed. Refresh before retrying.');request={...data,eventId:id,requesterId:'guest',status:'pending',revision:revision+1};},dispose(){}};
 const stop=bindEvents(service),node=id=>document.getElementById(id);
 await settle();document.querySelector('.gathering-card button').click();await settle();
 assert.equal(node('rsvp-form').hidden,false);
 return {dom,node,calls,get reads(){return reads},input(id,value){const input=node(id);if(typeof value==='boolean')input.checked=value;else input.value=value;input.dispatchEvent(new dom.window.Event('input',{bubbles:true}))},
  delay(){let resolve;const promise=new Promise(r=>resolve=r);release={promise};return resolve},refresh(){node('detail-refresh').click()},notify(){watch?.()},
  capacity(n){event.capacity=n},cancel(){event.status='cancelled'},setRequest(r){request=r},identity(a){person=a;observe(a)},
  close(){stop();dom.window.close();for(const [key,value] of Object.entries(previous)){if(value===undefined)delete globalThis[key];else globalThis[key]=value}}};
}

test('manual refresh preserves an unsaved household and explicit caregiver confirmation',async()=>{
 const f=await fixture();try{
  f.input('rsvp-name','Synthetic household');f.input('rsvp-adults','2');f.input('rsvp-children','');f.input('rsvp-caregiver',true);
  f.refresh();await settle();
  assert.equal(f.node('rsvp-name').value,'Synthetic household');assert.equal(f.node('rsvp-adults').value,'2');assert.equal(f.node('rsvp-children').value,'');assert.equal(f.node('rsvp-caregiver').checked,true);assert.equal(f.calls.length,0);
 }finally{f.close()}
});

test('edits made during an automatic refresh survive its response and use latest capacity',async()=>{
 const f=await fixture();try{
  f.input('rsvp-name','Before read');const resolve=f.delay();f.notify();
  f.input('rsvp-name','Latest household');f.input('rsvp-adults','2');f.input('rsvp-children','2');f.input('rsvp-caregiver',true);f.capacity(3);
  resolve();await settle();
  assert.equal(f.node('rsvp-name').value,'Latest household');assert.equal(f.node('rsvp-adults').value,'2');assert.equal(f.node('rsvp-children').value,'2');assert.equal(f.node('rsvp-caregiver').checked,true);assert.match(f.node('rsvp-children-error').textContent,/3 guest places/);assert.equal(f.calls.length,0);
 }finally{f.close()}
});

test('first edit begun during an otherwise clean refresh is preserved',async()=>{
 const f=await fixture();try{
  const resolve=f.delay();f.notify();f.input('rsvp-name','New draft');f.input('rsvp-children','');resolve();await settle();
  assert.equal(f.node('rsvp-name').value,'New draft');assert.equal(f.node('rsvp-children').value,'');
 }finally{f.close()}
});

test('closing details discards a pending refresh and reopening uses saved values',async()=>{
 const f=await fixture();try{
  const resolve=f.delay();f.notify();f.input('rsvp-name','Discard me');f.node('event-detail').close();resolve();await settle();
  assert.equal(f.node('event-detail').open,false);assert.equal(f.node('rsvp-name').value,'');
  f.dom.window.document.querySelector('.gathering-card button').click();await settle();assert.equal(f.node('rsvp-name').value,'Synthetic adult');assert.equal(f.node('rsvp-caregiver').checked,false);
 }finally{f.close()}
});

test('sign-out during a refresh clears private fields without restoring the draft',async()=>{
 const f=await fixture();try{
  f.input('rsvp-name','Private draft');const resolve=f.delay();f.notify();f.identity(null);resolve();await settle();
  assert.equal(f.node('event-detail').open,false);assert.equal(f.node('rsvp-name').value,'');assert.equal(f.node('rsvp-caregiver').checked,false);assert.equal(f.calls.length,0);
 }finally{f.close()}
});

test('cancellation hides the request form even when a draft is dirty',async()=>{
 const f=await fixture();try{
  f.input('rsvp-name','Unsaved household');const resolve=f.delay();f.notify();f.cancel();resolve();await settle();
  assert.equal(f.node('rsvp-form').hidden,true);assert.match(f.node('detail-status').textContent,/cancelled/);assert.equal(f.node('detail-location').hidden,true);assert.equal(f.calls.length,0);
 }finally{f.close()}
});

test('successful submission resets consent and refreshes the saved request',async()=>{
 const f=await fixture();try{
  f.input('rsvp-name','Saved household');f.input('rsvp-adults','2');f.input('rsvp-children','1');f.input('rsvp-caregiver',true);
  f.node('rsvp-form').dispatchEvent(new f.dom.window.Event('submit',{bubbles:true,cancelable:true}));await settle();
  assert.equal(f.calls.length,1);assert.equal(f.node('rsvp-name').value,'Saved household');assert.equal(f.node('rsvp-adults').value,'2');assert.equal(f.node('rsvp-caregiver').checked,false);assert.match(f.node('detail-status').textContent,/Awaiting host approval/);
 }finally{f.close()}
});

test('preserving a dirty draft does not silently adopt a newer saved revision',async()=>{
 const f=await fixture();try{
  const request={eventId:'Synthetic_refresh',requesterId:'guest',householdName:'Saved household',adults:1,children:0,status:'pending',revision:1};
  f.setRequest(request);f.refresh();await settle();f.input('rsvp-name','Unsaved household');f.input('rsvp-caregiver',true);
  f.setRequest({...request,householdName:'Changed elsewhere',revision:2});f.notify();await settle();
  assert.match(f.node('detail-error').textContent,/close and reopen/);
  f.node('rsvp-form').dispatchEvent(new f.dom.window.Event('submit',{bubbles:true,cancelable:true}));await settle();
  assert.equal(f.calls.length,1);assert.equal(f.calls[0].revision,1);assert.match(f.node('detail-error').textContent,/request changed/);assert.equal(f.node('rsvp-name').value,'Unsaved household');assert.equal(f.node('rsvp-caregiver').checked,true);
 }finally{f.close()}
});

test('an older overlapping read cannot overwrite the latest rendered draft',async()=>{
 const f=await fixture();try{
  const resolve=f.delay();f.notify();f.input('rsvp-name','Latest edit');f.refresh();await settle();
  f.input('rsvp-children','');resolve();await settle();
  assert.equal(f.node('rsvp-name').value,'Latest edit');assert.equal(f.node('rsvp-children').value,'');assert.equal(f.calls.length,0);
 }finally{f.close()}
});
