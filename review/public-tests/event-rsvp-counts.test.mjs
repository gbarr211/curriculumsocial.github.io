import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {householdCounts,bindHouseholdCounts} from '../event-pilot/rsvp-counts.mjs';
import {changeRsvp} from '../event-pilot/model.mjs';

test('count feedback agrees with the existing request model across capacity and household boundaries',()=>{
 const now=100000,person={uid:'requester',emailVerified:true};
 for(const capacity of [1,2,6,11,12,13,60])for(let adults=0;adults<=7;adults++)for(let children=-1;children<=12;children++){
  const feedback=householdCounts(String(adults),String(children),capacity),event={hostId:'host',status:'open',startsAt:now+1000,endsAt:now+2000,revision:1,capacity,approvedPeople:0};
  let accepted=true;
  try{changeRsvp(person,event,'Synthetic_rsvp',null,0,'request',{adults,children,householdName:'Synthetic household',caregiverConfirmed:true},now,now)}catch{accepted=false}
  assert.equal(!feedback.adultError&&!feedback.childError,accepted,JSON.stringify({capacity,adults,children}));
 }
});
test('fractional and out-of-range counts identify the affected field',()=>{
 for(const adults of ['-1','0','1.5','7'])assert.match(householdCounts(adults,'0',12).adultError,/whole number from 1 to 6/);
 for(const children of ['-1','0.5','12'])assert.match(householdCounts('1',children,12).childError,/whole number from 0 to 11/);
});
test('blank fields retain native required validation and have no misleading numeric total',()=>{
 for(const [adults,children] of [['','0'],['1',''],['','']]){
  const state=householdCounts(adults,children,12);assert.equal(state.total,null);assert.equal(state.adultError,'');assert.equal(state.childError,'');
 }
});
test('household total is checked separately from each field and gathering capacity',()=>{
 assert.equal(householdCounts('6','6',12).total,12);
 assert.match(householdCounts('6','7',60).childError,/12 people/);
 assert.match(householdCounts('1','2',2).childError,/2 guest places in total/);
 assert.match(householdCounts('2','0',1).adultError,/1 guest place in total/);
});
test('requesting the full capacity remains valid without claiming a reservation',()=>{
 const state=householdCounts('1','1',2);assert.equal(state.total,2);assert.equal(state.adultError,'');assert.equal(state.childError,'');
 const now=100000,event={hostId:'host',status:'open',startsAt:now+1000,endsAt:now+2000,revision:1,capacity:2,approvedPeople:2};
 const result=changeRsvp({uid:'requester',emailVerified:true},event,'Synthetic_rsvp',null,0,'request',{adults:1,children:1,householdName:'Synthetic household',caregiverConfirmed:true},now,now);
 assert.equal(result.rsvp.status,'pending');assert.equal(result.event.approvedPeople,2);
});
function fixture(){
 const dom=new JSDOM('<form><input id="name" required><input id="adults" type="number" min="1" max="6" required><input id="children" type="number" min="0" max="11" required><span id="nameError"></span><span id="adultError"></span><span id="childError"></span><p id="total"></p></form>');
 const document=dom.window.document,nodes=Object.fromEntries(['name','adults','children','nameError','adultError','childError','total'].map(id=>[id,document.getElementById(id)]));
 let capacity=12;const binding=bindHouseholdCounts({...nodes,event:()=>({capacity})});
 nodes.name.value='Synthetic household';nodes.adults.value='1';nodes.children.value='0';binding.update();
 return {dom,nodes,binding,capacity(n){capacity=n},input(id,value,type='input'){nodes[id].value=value;nodes[id].dispatchEvent(new dom.window.Event(type,{bubbles:true}))}};
}
test('typing or changing counts clears stale errors and describes the current total',()=>{
 const f=fixture();try{
  f.input('adults','6');f.input('children','7');assert.equal(f.nodes.children.validity.customError,true);assert.equal(f.nodes.children.getAttribute('aria-invalid'),'true');assert.equal(f.nodes.childError.hidden,false);
  f.input('children','6','change');assert.equal(f.nodes.children.validity.valid,true);assert.equal(f.nodes.childError.hidden,true);assert.equal(f.nodes.children.getAttribute('aria-invalid'),null);assert.match(f.nodes.total.textContent,/12 people.*Host approval required/);
  f.input('adults','1');f.input('children','0');assert.match(f.nodes.total.textContent,/1 person in/);
 }finally{f.dom.window.close()}
});
test('detail refresh revalidates the current draft against the latest total capacity',()=>{
 const f=fixture();try{
  f.input('children','2');f.capacity(2);f.binding.update();assert.equal(f.nodes.children.validity.customError,true);assert.equal(f.nodes.children.value,'2');
  f.capacity(3);f.binding.update();assert.equal(f.nodes.children.validity.customError,false);assert.equal(f.nodes.children.value,'2');
 }finally{f.dom.window.close()}
});
test('whitespace name cannot reach submission and correction removes its custom error',()=>{
 const f=fixture();try{
  f.input('name','  ');assert.equal(f.nodes.name.validity.customError,true);assert.match(f.nodes.nameError.textContent,/first name or family nickname/);
  f.input('name','  Sample family  ');assert.equal(f.nodes.name.validity.valid,true);assert.equal(f.nodes.nameError.hidden,true);
 }finally{f.dom.window.close()}
});
test('identity or dialog reset removes count feedback and all custom validation',()=>{
 const f=fixture();try{
  f.input('name',' ');f.input('children','-1');f.binding.reset();
  for(const id of ['name','adults','children']){assert.equal(f.nodes[id].validity.customError,false);assert.equal(f.nodes[id].getAttribute('aria-invalid'),null)}
  for(const id of ['nameError','adultError','childError']){assert.equal(f.nodes[id].hidden,true);assert.equal(f.nodes[id].textContent,'')}
  assert.equal(f.nodes.total.textContent,'');
 }finally{f.dom.window.close()}
});
