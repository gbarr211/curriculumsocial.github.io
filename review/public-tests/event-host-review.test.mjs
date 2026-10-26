import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import {changeRsvp} from '../event-pilot/model.mjs';
import {reviewCapacity} from '../event-pilot/host-review.mjs';

// Actual UI/model, controlled local reads. No Firebase transport or real records.
const uiUrl=new URL('../event-pilot/ui.mjs',import.meta.url);
let source=await readFile(uiUrl,'utf8');
source=source.replace(/from '(\.\/[^']+)'/g,(_,path)=>`from '${new URL(path,uiUrl).href}'`);
const icons=await readFile(new URL('../../js/community-icons.js',import.meta.url),'utf8');
source=source.replace("'/js/community-icons.js'",JSON.stringify('data:text/javascript;base64,'+Buffer.from(icons).toString('base64')));
const {bindEvents}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const settle=()=>new Promise(resolve=>setImmediate(resolve));

async function fixture(){
 const dom=new JSDOM(await readFile(new URL('../../events.html',import.meta.url),'utf8'),{url:'https://local.invalid/events.html'}),document=dom.window.document;
 const previous={document:globalThis.document,location:globalThis.location};globalThis.document=document;globalThis.location=dom.window.location;
 for(const dialog of document.querySelectorAll('dialog')){dialog.showModal=()=>dialog.open=true;dialog.close=()=>{dialog.open=false;dialog.dispatchEvent(new dom.window.Event('close'))};}
 let person={uid:'host',name:'Synthetic host',emailVerified:true},observe,watch,watchError,hold=null,requestHold=null,listOverride=null,fail=false,saveFail=false;
 let event={id:'Synthetic_review',hostId:'host',hostName:'Synthetic host',title:'Synthetic gathering',description:'Local fixture only.',kind:'social',area:'east',venueType:'outdoors',status:'open',startsAt:Date.now()+86400000,endsAt:Date.now()+90000000,capacity:6,approvedPeople:4,revision:1};
 let request={eventId:event.id,hostId:'host',requesterId:'guest',householdName:'Synthetic household',adults:2,children:1,status:'pending',revision:1};
 const copy=v=>structuredClone(v),calls=[];
 const service={identity:()=>person,observe(fn){observe=fn;fn(person);return()=>{}},browse:async()=>({items:[copy(event)],cursor:null}),hosting:async()=>({items:[copy(event)],cursor:null}),
  async get(){if(hold){const pending=hold;hold=null;await pending}if(fail){fail=false;throw Error('Synthetic read failed. Try again.')}return copy(event)},mine:async()=>null,
  async requests(){const result=copy(listOverride??{items:[request],cursor:null});if(requestHold){const pending=requestHold;requestHold=null;await pending}return result},location:async()=>({address:'SYNTHETIC private meeting point'}),watch(id,fn,onError){watch=fn;watchError=onError;return()=>watch=null},
  async rsvp(id,revision,command,data){calls.push({id,revision,command,data});if(saveFail){saveFail=false;throw Error('Synthetic save failed. Try again.')}const next=changeRsvp(person,event,id,request,revision,command,data,Date.now());event=next.event;request=next.rsvp;},dispose(){}};
 const stop=bindEvents(service),node=id=>document.getElementById(id);await settle();document.querySelector('.gathering-card button').click();await settle();document.querySelector('[data-review="approve"]').click();
 return {dom,node,calls,submit(){node('review-form').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}))},
  set(values,notify=true){Object.assign(event,values);if(notify)watch?.()},changeRequest(values){Object.assign(request,values)},notify(){watch?.()},list(result){listOverride=result;watch?.()},watchError(){watchError(Error('Synthetic listener failed.'))},
  delay(){let resolve;hold=new Promise(r=>resolve=r);return resolve},delayRequests(){let resolve;requestHold=new Promise(r=>resolve=r);return resolve},fail(){fail=true},saveFail(){saveFail=true},identity(a){person=a;observe(a)},
  close(){stop();dom.window.close();for(const [k,v] of Object.entries(previous)){if(v===undefined)delete globalThis[k];else globalThis[k]=v}}};
}

test('host sees insufficient places before approving, including keyboard submission',async()=>{
 const f=await fixture();try{
  assert.match(f.node('event-review').textContent,/3 guest places needed.*2 available/);
  assert.equal(f.node('review-save').disabled,true);f.submit();await settle();assert.equal(f.calls.length,0);
 }finally{f.close()}
});

test('refreshing to an exact fit preserves the host note and saves the original revision',async()=>{
 const f=await fixture();try{
  f.node('host-message').value='Synthetic welcome';f.set({approvedPeople:3},false);f.node('review-refresh').click();await settle();
  assert.match(f.node('review-capacity').textContent,/3 guest places needed.*3 available/);assert.equal(f.node('host-message').value,'Synthetic welcome');assert.equal(f.node('review-save').disabled,false);
  f.submit();await settle();assert.equal(f.calls.length,1);assert.equal(f.calls[0].revision,1);assert.equal(f.calls[0].data.hostMessage,'Synthetic welcome');assert.equal(f.node('event-review').open,false);
 }finally{f.close()}
});

test('a live capacity change blocks approval while retaining the typed note',async()=>{
 const f=await fixture();try{
  f.set({approvedPeople:2});await settle();assert.equal(f.node('review-save').disabled,false);
  f.node('host-message').value='Keep this note';f.set({approvedPeople:5});await settle();f.submit();await settle();
  assert.equal(f.node('review-save').disabled,true);assert.match(f.node('review-capacity').textContent,/1 available/);assert.equal(f.node('host-message').value,'Keep this note');assert.equal(f.calls.length,0);
 }finally{f.close()}
});

test('pending and failed reads prevent stale approvals and expose a retry',async()=>{
 const f=await fixture();try{
  f.set({approvedPeople:2});await settle();const release=f.delay();f.notify();
  assert.equal(f.node('review-save').disabled,true);assert.equal(f.node('review-refresh').disabled,true);f.submit();assert.equal(f.calls.length,0);
  f.fail();release();await settle();assert.match(f.node('review-capacity').textContent,/could not be checked/);assert.equal(f.node('review-save').disabled,true);assert.equal(f.node('review-refresh').disabled,false);
  f.node('review-refresh').click();await settle();assert.equal(f.node('review-save').disabled,false);
 }finally{f.close()}
});

test('changed household requests require reopening instead of silently adopting a new revision',async()=>{
 const f=await fixture();try{
  f.set({approvedPeople:0});await settle();f.node('host-message').value='For the original household';f.changeRequest({revision:2,adults:1,children:0});f.notify();await settle();
  assert.match(f.node('review-capacity').textContent,/changed.*reopen/);assert.equal(f.node('review-save').disabled,true);f.submit();await settle();assert.equal(f.calls.length,0);assert.equal(f.node('host-message').value,'For the original household');
  f.node('event-review').close();f.dom.window.document.querySelector('[data-review="approve"]').click();assert.equal(f.node('review-save').disabled,false);assert.match(f.node('review-capacity').textContent,/1 guest place needed/);
 }finally{f.close()}
});

test('approval stays blocked until the host request list has also refreshed',async()=>{
 const f=await fixture();try{
  f.set({approvedPeople:0});await settle();const release=f.delayRequests();f.notify();await settle();
  assert.equal(f.node('review-save').disabled,true);assert.match(f.node('review-capacity').textContent,/Checking/);f.submit();assert.equal(f.calls.length,0);
  release();await settle();assert.equal(f.node('review-save').disabled,false);
 }finally{f.close()}
});

test('an older host-list response cannot replace newer household decisions',async()=>{
 const f=await fixture();try{
  f.set({approvedPeople:0});await settle();const release=f.delayRequests();f.notify();await settle();
  f.changeRequest({revision:2,adults:1,children:0});f.notify();await settle();release();await settle();
  f.node('event-review').close();f.dom.window.document.querySelector('[data-review="approve"]').click();assert.match(f.node('review-capacity').textContent,/1 guest place needed/);f.submit();await settle();assert.equal(f.calls[0].revision,2);
 }finally{f.close()}
});

test('missing requests block decisions only when the loaded host list is complete',async()=>{
 const f=await fixture();try{
  f.set({approvedPeople:0});await settle();f.list({items:[],cursor:'synthetic-next-page'});await settle();assert.equal(f.node('review-save').disabled,false);
  f.list({items:[],cursor:null});await settle();assert.equal(f.node('review-save').disabled,true);assert.match(f.node('review-capacity').textContent,/changed.*reopen/);f.submit();assert.equal(f.calls.length,0);
 }finally{f.close()}
});

test('a listener failure invalidates pending reads until an explicit refresh succeeds',async()=>{
 const f=await fixture();try{
  f.set({approvedPeople:0});await settle();const release=f.delay();f.notify();f.watchError();release();await settle();assert.equal(f.node('review-save').disabled,true);assert.match(f.node('review-capacity').textContent,/could not be checked/);
  f.node('review-refresh').click();await settle();assert.equal(f.node('review-save').disabled,false);
 }finally{f.close()}
});

test('a silent server race still uses the existing transaction capacity check',async()=>{
 const f=await fixture();try{
  f.set({approvedPeople:2});await settle();f.node('host-message').value='Retry note';f.set({approvedPeople:5},false);f.submit();await settle();
  assert.equal(f.calls.length,1);assert.match(f.node('review-error').textContent,/enough places/);assert.equal(f.node('host-message').value,'Retry note');assert.equal(f.node('event-review').open,true);
  f.node('review-refresh').click();await settle();assert.equal(f.node('review-save').disabled,true);f.submit();await settle();assert.equal(f.calls.length,1);
 }finally{f.close()}
});

test('save failure leaves a valid decision and note available for an explicit retry',async()=>{
 const f=await fixture();try{
  f.set({approvedPeople:2});await settle();f.node('host-message').value='Retry note';f.saveFail();f.submit();await settle();
  assert.match(f.node('review-error').textContent,/Synthetic save failed/);assert.equal(f.node('review-save').disabled,false);assert.equal(f.node('host-message').value,'Retry note');f.submit();await settle();assert.equal(f.calls.length,2);assert.equal(f.node('event-review').open,false);
 }finally{f.close()}
});

test('insufficient capacity does not prevent declining a pending request',async()=>{
 const f=await fixture();try{
  f.node('event-review').close();f.dom.window.document.querySelector('[data-review="decline"]').click();assert.equal(f.node('review-save').disabled,false);f.submit();await settle();assert.equal(f.calls.length,1);assert.equal(f.calls[0].command,'decline');
 }finally{f.close()}
});

test('start time is rechecked on submit and cancellation closes approval',async()=>{
 const f=await fixture(),realNow=Date.now;try{
  const now=realNow();f.set({approvedPeople:2,startsAt:now+1000});await settle();Date.now=()=>now+2000;
  f.submit();await settle();assert.match(f.node('review-capacity').textContent,/started/);assert.equal(f.calls.length,0);
  f.set({status:'cancelled'});await settle();assert.match(f.node('review-capacity').textContent,/closed/);assert.equal(f.node('review-save').disabled,true);
 }finally{Date.now=realNow;f.close()}
});

test('sign-out during a read closes review and clears the private host note',async()=>{
 const f=await fixture();try{
  f.node('host-message').value='Private note';const release=f.delay();f.notify();f.identity(null);release();await settle();
  assert.equal(f.node('event-review').open,false);assert.equal(f.node('host-message').value,'');assert.equal(f.node('requests-list').textContent,'');assert.equal(f.node('review-capacity').textContent,'');assert.equal(f.calls.length,0);
 }finally{f.close()}
});

test('loaded capacity feedback agrees with the existing transaction over boundary combinations',()=>{
 const now=Date.now(),person={uid:'host',emailVerified:true};let comparisons=0;
 for(const capacity of [1,2,6,12,60])for(let approvedPeople=0;approvedPeople<=capacity;approvedPeople++)for(let adults=1;adults<=6;adults++)for(let children=0;children<=12-adults;children++){
  const event={hostId:'host',status:'open',startsAt:now+86400000,capacity,approvedPeople,revision:1};
  const request={requesterId:'guest',householdName:'Synthetic',status:'pending',revision:1,adults,children};
  const feedback=reviewCapacity(event,request,now);let accepted=true;
  try{changeRsvp(person,event,'Synthetic_review',request,1,'approve',{},now,now)}catch{accepted=false}
  assert.equal(feedback.canApprove,accepted,JSON.stringify({capacity,approvedPeople,adults,children}));comparisons++;
 }
 assert.equal(comparisons,4902);
});

test('missing, closed, malformed, expired and already reviewed data never enables approval',()=>{
 const now=Date.now(),event={status:'open',startsAt:now+86400000,capacity:6,approvedPeople:0},request={status:'pending',adults:1,children:0};
 for(const e of [null,{...event,status:'cancelled'},{...event,startsAt:now},{...event,startsAt:NaN},{...event,approvedPeople:7},{...event,capacity:0},{...event,capacity:61},{...event,approvedPeople:'0'}])assert.equal(reviewCapacity(e,request,now).canApprove,false);
 for(const r of [null,{...request,adults:0},{...request,adults:7},{...request,children:-1},{...request,adults:6,children:7},{...request,children:'0'},...['approved','declined','withdrawn'].map(status=>({...request,status}))])assert.equal(reviewCapacity(event,r,now).canApprove,false);
});
