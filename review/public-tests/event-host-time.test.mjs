import test from 'node:test';
import assert from 'node:assert/strict';
import {samuiInput,samuiMillis,hostTimeState} from '../event-pilot/host-time.mjs';
import {eventFields} from '../event-pilot/model.mjs';
const now=Date.parse('2026-10-24T03:00:20Z'),day=86400000;
test('Samui wall times cross UTC day/year boundaries without a device timezone',()=>{
 assert.equal(samuiInput(Date.parse('2026-12-31T18:30Z')),'2027-01-01T01:30');
 assert.equal(samuiMillis('2027-01-01T01:30'),Date.parse('2026-12-31T18:30Z'));
 assert.equal(samuiMillis('2028-02-29T10:00'),Date.parse('2028-02-29T03:00Z'));
});
test('invalid or ambiguous inputs cannot silently normalize to a different date',()=>{
 for(const value of ['', '2026-02-29T10:00','2026-04-31T10:00','2026-10-25T24:00','2026-10-25T10:00Z','2026-10-25','10/25/2026 10:00'])assert.ok(Number.isNaN(samuiMillis(value)),value);
 assert.equal(samuiInput(NaN),'');
});
test('picker bounds round safely to minutes and an end can cross midnight',()=>{
 const state=hostTimeState('2026-10-25T23:30','2026-10-26T00:30',now);
 assert.equal(state.startMin,'2026-10-24T10:01');
 assert.equal(state.startMax,samuiInput(now+366*day));
 assert.equal(state.endMin,'2026-10-25T23:31');
 assert.equal(state.endMax,'2026-10-26T23:30');
 assert.equal(state.endError,'');
});
test('an exact-minute current time still requires a later start',()=>{
 const exact=Date.parse('2026-10-24T03:00Z');
 assert.equal(hostTimeState('2026-10-24T10:00','',exact).startMin,'2026-10-24T10:01');
 assert.match(hostTimeState('2026-10-24T10:00','',exact).startError,/future/);
});
test('an empty form leaves required-field prompts to browser validation',()=>{
 const state=hostTimeState('','',now);assert.equal(state.startError,'');assert.equal(state.endError,'');assert.equal(state.endMin,'');assert.equal(state.endMax,'');
});
const fields={title:'Synthetic gathering',hostName:'Synthetic host',description:'Fictional test plan only',bring:'',area:'east',kind:'social',venueType:'outdoors',capacity:12,caregiverRequired:true,hostConfirmed:true};
for(const [name,start,end,valid] of [
 ['future start, one-hour end',now+day,now+day+3600000,true],
 ['start at current instant',now,now+3600000,false],
 ['past start',now-day,now-day+3600000,false],
 ['366-day start boundary',now+366*day,now+366*day+3600000,true],
 ['beyond start window',now+366*day+60000,now+366*day+3600000,false],
 ['end equals start',now+day,now+day,false],
 ['end before start',now+day,now+day-60000,false],
 ['24-hour duration boundary',now+day,now+2*day,true],
 ['beyond duration window',now+day,now+2*day+60000,false],
])test('date guidance agrees with existing publish model: '+name,()=>{
 // Form values have minute precision; compare the exact values it will send.
 const state=hostTimeState(samuiInput(start),samuiInput(end),now);
 const uiValid=!state.startError&&!state.endError;
 assert.equal(uiValid,valid);
 if(valid)assert.doesNotThrow(()=>eventFields({...fields,start:state.start,end:state.end},now));
 else assert.throws(()=>eventFields({...fields,start:state.start,end:state.end},now));
});
