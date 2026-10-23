import test from 'node:test';
import assert from 'node:assert/strict';
import {calendarFile,canAddToCalendar} from '../event-pilot/calendar.mjs';

const now=Date.parse('2030-01-01T00:00:00Z');
const person={uid:'guest',emailVerified:true};
const event={id:'Gathering_123',hostId:'host',title:'A morning together',area:'east',status:'open',startsAt:Date.parse('2030-01-02T10:00:00+07:00'),endsAt:Date.parse('2030-01-02T11:30:00+07:00')};
const request={eventId:event.id,requesterId:person.uid,status:'approved'};
const make=(a=person,e=event,r=request)=>calendarFile(a,e,r,now);
const unfold=value=>value.replace(/\r\n /g,'');

test('calendar has a stable event UID, UTC times and standard download type',()=>{
 const file=make();assert.equal(file.filename,'curriculumsocial-Gathering_123.ics');assert.equal(file.contentType,'text/calendar;charset=utf-8');
 const value=unfold(file.content);assert.ok(value.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n'));assert.ok(value.endsWith('END:VEVENT\r\nEND:VCALENDAR\r\n'));
 for(const field of ['UID:Gathering_123@curriculumsocial.com','DTSTAMP:20300101T000000Z','DTSTART:20300102T030000Z','DTEND:20300102T043000Z','LOCATION:East Samui','CLASS:PRIVATE'])assert.ok(value.includes(field+'\r\n'),field);
 assert.equal(make({...person,uid:'host'},event,null).content,file.content);
});
test('metadata allowlist excludes location, contacts, roster and RSVP details',()=>{
 const secret='DO-NOT-EXPORT-THIS';const content=unfold(make(person,{...event,address:secret,directions:secret,description:secret,hostName:secret,hostEmail:secret,location:{address:secret},members:[secret]},{...request,householdName:secret,hostMessage:secret,children:11,adults:4}).content);
 assert.ok(!content.includes(secret));assert.ok(!content.includes('ATTENDEE:'));assert.ok(!content.includes('ORGANIZER:'));assert.ok(!content.includes('VALARM'));assert.match(content,/does not update automatically/);
});
for(const state of ['pending','declined','withdrawn'])test(state+' requester has no calendar download',()=>{assert.equal(canAddToCalendar(person,event,{...request,status:state},now),false);assert.throws(()=>make(person,event,{...request,status:state}));});
test('a different requester, event or anonymous/unverified account cannot export',()=>{
 for(const [actor,rsvp] of [[{...person,uid:'other'},request],[person,{...request,eventId:'OtherEvent_123'}],[{...person,emailVerified:false},request],[{...person,isAnonymous:true},request],[null,request]])assert.throws(()=>make(actor,event,rsvp));
});
test('cancelled, removed, ended and invalid time ranges are rejected',()=>{
 for(const e of [null,{...event,status:'cancelled'},{...event,endsAt:now},{...event,endsAt:event.startsAt},{...event,startsAt:NaN},{...event,endsAt:Infinity},{...event,area:'unknown'}])assert.throws(()=>make(person,e));
});
test('file and URL identifiers cannot inject paths or calendar properties',()=>{
 for(const id of ['../secret','https://evil.invalid','ok\r\nBEGIN:VEVENT','x'.repeat(65),'short'])assert.throws(()=>make(person,{...event,id},{...request,eventId:id}));
});
test('CRLF, commas, semicolons and backslashes in titles remain text',()=>{
 const title='Play, learn; together\\again\r\nATTENDEE:mailto:fake@example.invalid';const value=unfold(make(person,{...event,title}).content);
 assert.ok(value.includes('SUMMARY:Play\\, learn\\; together\\\\again\\nATTENDEE:mailto:fake@example.invalid\r\n'));
 assert.equal(value.split('\r\n').filter(line=>line.startsWith('ATTENDEE:')).length,0);assert.equal(value.split('\r\n').filter(line=>line==='BEGIN:VEVENT').length,1);
});
test('Unicode lines fold at75 UTF-8 octets and unfold without corrupting text',()=>{
 const title='เรียนรู้🌴'.repeat(10);const file=make(person,{...event,title});
 for(const line of file.content.split('\r\n'))assert.ok(Buffer.byteLength(line,'utf8')<=75,line);
 assert.ok(unfold(file.content).includes('SUMMARY:'+title+'\r\n'));assert.ok(!file.content.replaceAll('\r\n','').includes('\n'));
});
test('Firestore timestamp representations preserve the same instant',()=>{
 const object={...event,startsAt:{toMillis:()=>event.startsAt},endsAt:{seconds:event.endsAt/1000}};assert.equal(make(person,object).content,make().content);
});
