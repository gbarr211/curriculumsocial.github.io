import {readFileSync} from 'node:fs';
import {initializeTestEnvironment, assertFails, assertSucceeds} from '@firebase/rules-unit-testing';
import {doc, collection, getDoc, getDocs, setDoc, updateDoc, deleteDoc, Timestamp, deleteField, setLogLevel} from 'firebase/firestore';

// Explicit local demo context: never import the application Firebase configuration.
if (process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8188') throw new Error('Requires local emulator at 127.0.0.1:8188');
setLogLevel('silent');
const env = await initializeTestEnvironment({projectId:'demo-curriculumsocial-rules',firestore:{host:'127.0.0.1',port:8188,rules:readFileSync(new URL('../firestore-profiles.candidate.rules',import.meta.url),'utf8')}});
const alice=env.authenticatedContext('adult-a',{email:'adult-a@example.invalid',email_verified:false}).firestore();
const bob=env.authenticatedContext('adult-b',{email:'adult-b@example.invalid',email_verified:true}).firestore();
const anon=env.unauthenticatedContext().firestore();
const base=()=>({email:'adult-a@example.invalid',displayName:'Synthetic Adult',role:'parent',emailVerified:false,createdAt:Timestamp.fromMillis(1791676800000),updatedAt:Timestamp.fromMillis(1791676800000)});
const target=db=>doc(db,'users','adult-a');
let passed=0;
async function check(name,fn){await env.clearFirestore();await fn();passed++;console.log('PASS '+name);}
async function seed(extra={}){await env.withSecurityRulesDisabled(c=>setDoc(target(c.firestore()),{...base(),...extra}));}
try {
  await check('owner valid create and read',async()=>{await assertSucceeds(setDoc(target(alice),base()));await assertSucceeds(getDoc(target(alice)));});
  for(const role of ['teacher','venue']) await check('descriptive '+role+' role create',()=>assertSucceeds(setDoc(target(alice),{...base(),role})));
  await check('verified adult create',()=>assertSucceeds(setDoc(doc(bob,'users','adult-b'),{...base(),email:'adult-b@example.invalid',emailVerified:true})));
  await check('optional HTTPS photo',()=>assertSucceeds(setDoc(target(alice),{...base(),photoURL:'https://example.invalid/avatar.png'})));
  for(const [label,db] of [['anonymous',anon],['other owner',bob]]) {
    await check(label+' create denied',()=>assertFails(setDoc(target(db),base())));
    await check(label+' read denied',async()=>{await seed();await assertFails(getDoc(target(db)));});
    await check(label+' update denied',async()=>{await seed();await assertFails(updateDoc(target(db),{displayName:'Changed'}));});
  }
  for(const [label,db] of [['owner',alice],['anonymous',anon],['other owner',bob]]) {
    await check(label+' list denied',async()=>{await seed();await assertFails(getDocs(collection(db,'users')));});
    await check(label+' delete denied',async()=>{await seed();await assertFails(deleteDoc(target(db)));});
  }
  const badCreates=[['wrong email',{email:'other@example.invalid'}],['wrong verification',{emailVerified:true}],['privilege injection',{admin:true}],['invalid role',{role:'admin'}],['non-string name',{displayName:42}],['empty name',{displayName:''}],['oversized name',{displayName:'x'.repeat(101)}],['invalid createdAt',{createdAt:'yesterday'}],['invalid updatedAt',{updatedAt:42}],['unsafe photo',{photoURL:'javascript:alert(1)'}],['oversized photo',{photoURL:'https://'+ 'x'.repeat(2048)}]];
  for(const [label,extra] of badCreates) await check(label+' create denied',()=>assertFails(setDoc(target(alice),{...base(),...extra})));
  for(const key of Object.keys(base())) await check('missing '+key+' denied',()=>{const data=base();delete data[key];return assertFails(setDoc(target(alice),data));});
  await check('allowed profile update',async()=>{await seed();await assertSucceeds(updateDoc(target(alice),{displayName:'Updated Adult',bio:'Synthetic bio',location:'Synthetic location',matchingRadius:25,philosophies:['montessori','eclectic'],updatedAt:Timestamp.now()}));});
  const badUpdates=[['email',{email:'changed@example.invalid'}],['role',{role:'teacher'}],['verification',{emailVerified:true}],['createdAt',{createdAt:Timestamp.now()}],['privilege',{admin:true}],['oversized bio',{bio:'x'.repeat(2001)}],['location type',{location:{city:'x'}}],['radius',{matchingRadius:999}],['unknown philosophy',{philosophies:['unknown']}],['philosophy type',{philosophies:'montessori'}],['too many philosophies',{philosophies:Array(7).fill('montessori')}],['missing name',{displayName:deleteField()}],['updatedAt type',{updatedAt:'today'}]];
  for(const [label,extra] of badUpdates) await check(label+' update denied',async()=>{await seed();await assertFails(updateDoc(target(alice),{updatedAt:Timestamp.now(),...extra}));});
  for(const path of ['students/synthetic','interest_submissions/synthetic','activities/synthetic','users/adult-a/children/synthetic']) {
    await check(path+' create denied',()=>assertFails(setDoc(doc(alice,path),{synthetic:true})));
    await check(path+' read denied',()=>assertFails(getDoc(doc(alice,path))));
  }
  await env.clearFirestore();
  console.log(`RESULT: ${passed} emulator assertions passed; synthetic records cleared.`);
} finally { await env.cleanup(); }
