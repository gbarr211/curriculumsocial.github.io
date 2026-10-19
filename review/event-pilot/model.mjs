export const consentVersion='events-caregiver-2026-10-19';
export const areas={north:'North Samui',east:'East Samui',south:'South Samui',west:'West Samui',central:'Central Samui'};
export const kinds={social:'Social gathering',learning:'Learning together'};
export const venues={outdoors:'Outdoors',home:'A host’s home',venue:'A community venue'};
export const fail=(code,message)=>Object.assign(Error(message),{code:'events/'+code});
export function adult(a,verified=false){if(!a?.uid||a.isAnonymous)throw fail('signin','Sign in with an adult account.');if(verified&&!a.emailVerified)throw fail('verify','Confirm your email before taking this step.');return a;}
function text(v,label,min,max){if(typeof v!=='string'||v.trim().length<min||v.trim().length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(v))throw fail('validation',`Check ${label}.`);return v.trim();}
export const millis=v=>typeof v==='number'?v:v?.toMillis?.()??(v?.seconds?Math.round(v.seconds*1000):NaN);
export function eventFields(data,now=Date.now()){
 const start=Number(data.start),end=Number(data.end),capacity=Number(data.capacity);
 if(!Object.hasOwn(areas,data.area)||!Object.hasOwn(kinds,data.kind)||!Object.hasOwn(venues,data.venueType))throw fail('validation','Choose an area, gathering type and setting.');
 if(!Number.isFinite(start)||start<=now||start>now+366*86400000||!Number.isFinite(end)||end<=start||end>start+86400000)throw fail('validation','Choose a future start and an end within 24 hours.');
 if(!Number.isInteger(capacity)||capacity<1||capacity>60)throw fail('validation','Choose 1–60 guest places. Count every visiting adult and child.');
 if(data.caregiverRequired!==true||data.hostConfirmed!==true)throw fail('consent','Confirm that you are an adult host and this is a free, caregiver-attended gathering.');
 return {title:text(data.title,'the gathering title',3,100),hostName:text(data.hostName,'your host display name',1,80),description:text(data.description,'the description',10,1000),bring:text(data.bring??'','what to bring',0,400),area:data.area,kind:data.kind,venueType:data.venueType,start,end,capacity};
}
export function locationFields(data){return {address:text(data.address,'the exact meeting location',5,700),directions:text(data.directions??'','the directions',0,700)};}
export function createEvent(a,id,data,{time,fromMillis},now=Date.now()){
 adult(a,true);const d=eventFields(data,now),location=locationFields(data);
 return {event:{hostId:a.uid,hostName:d.hostName,title:d.title,description:d.description,bring:d.bring,area:d.area,kind:d.kind,venueType:d.venueType,startsAt:fromMillis(d.start),endsAt:fromMillis(d.end),timeZone:'Asia/Bangkok',capacity:d.capacity,approvedPeople:0,status:'open',caregiverRequired:true,paymentMode:'free',hostConfirmed:true,consentVersion,revision:1,createdAt:time,updatedAt:time},location:{eventId:id,hostId:a.uid,...location,createdAt:time,updatedAt:time}};
}
export function partyFields(data){const adults=Number(data.adults),children=Number(data.children);if(!Number.isInteger(adults)||adults<1||adults>6||!Number.isInteger(children)||children<0||adults+children>12)throw fail('validation','Include at least one caregiver. A household request can include up to 12 people.');if(data.caregiverConfirmed!==true)throw fail('consent','Confirm a caregiver will stay and supervise your household.');return {householdName:text(data.householdName,'your household display name',1,80),adults,children,caregiverConfirmed:true};}
export const places=r=>r?.status==='approved'?r.adults+r.children:0;
export function changeRsvp(a,event,id,before,expected,command,data,time,now=Date.now()){
 adult(a);if(!event)throw fail('missing','This gathering has been removed.');if(event.status!=='open'||(['request','approve'].includes(command)&&millis(event.startsAt)<=now))throw fail('closed','This gathering is no longer taking requests.');
 if((before?.revision??0)!==expected)throw fail('conflict','This request changed. Refresh before trying again.');
 const isHost=a.uid===event.hostId,isRequester=!isHost&&(!before||before.requesterId===a.uid);let next;
 if(command==='request'){
  adult(a,true);if(!isRequester)throw fail('permission','The host cannot request guest places at their own gathering.');const party=partyFields(data);if(party.adults+party.children>event.capacity)throw fail('capacity','This household is larger than the gathering’s guest capacity.');
  next={eventId:id,hostId:event.hostId,requesterId:a.uid,eventTitle:event.title,eventStartsAt:event.startsAt,eventArea:event.area,...party,status:'pending',hostMessage:'',consentVersion,createdAt:before?.createdAt??time,updatedAt:time,revision:expected+1};
 }else if(command==='withdraw'){
  if(!isRequester||!before||!['pending','approved'].includes(before.status))throw fail('permission','Only the requesting adult can leave this gathering.');next={...before,status:'withdrawn',updatedAt:time,revision:expected+1};
 }else if(['approve','decline'].includes(command)){
  adult(a,true);if(!isHost||!before||!(command==='approve'?before.status==='pending':['pending','approved'].includes(before.status)))throw fail('permission','Only the host can review this request.');next={...before,status:command==='approve'?'approved':'declined',hostMessage:text(data.hostMessage??'','your message',0,300),updatedAt:time,revision:expected+1};
 }else throw fail('action','Choose a request action.');
 const approvedPeople=event.approvedPeople-places(before)+places(next);if(approvedPeople<0||approvedPeople>event.capacity)throw fail('capacity','There aren’t enough places left for this household. Refresh the guest list.');
 return {rsvp:next,event:{...event,approvedPeople,revision:event.revision+1,updatedAt:time},mutation:{eventId:id,hostId:event.hostId,requesterId:next.requesterId,rsvpRevision:next.revision,eventRevision:event.revision+1,updatedAt:time}};
}
export function editEvent(a,before,expected,data,time){adult(a,true);if(!before||a.uid!==before.hostId)throw fail('permission','Only the host can edit this gathering.');if(before.revision!==expected)throw fail('conflict','This gathering changed. Refresh before editing.');if(before.status!=='open')throw fail('closed','This gathering has been cancelled.');const capacity=Number(data.capacity);if(!Number.isInteger(capacity)||capacity<Math.max(1,before.approvedPeople)||capacity>60)throw fail('capacity','Keep capacity at or above the approved guest count, up to 60.');return {...before,description:text(data.description,'the description',10,1000),bring:text(data.bring??'','what to bring',0,400),capacity,revision:before.revision+1,updatedAt:time};}
export function cancelEvent(a,before,expected,time){adult(a);if(!before||a.uid!==before.hostId)throw fail('permission','Only the host can cancel this gathering.');if(before.revision!==expected)throw fail('conflict','This gathering changed. Refresh before cancelling.');if(before.status!=='open')throw fail('closed','This gathering is already cancelled.');return {...before,status:'cancelled',approvedPeople:0,revision:before.revision+1,updatedAt:time};}
export function maySeeLocation(a,e,r,now=Date.now()){return !!a&&!!e&&(a.uid===e.hostId||(e.status==='open'&&millis(e.endsAt)>now&&r?.requesterId===a.uid&&r.status==='approved'));}
export function mayEraseRsvp(a,e,r){return !!a&&r?.requesterId===a.uid&&(!e||e.status==='cancelled'||['declined','withdrawn'].includes(r.status)||millis(e.endsAt)<=Date.now());}
export function friendly(e){if(e?.code==='permission-denied'||e?.code==='firestore/permission-denied')return 'Your access changed, or this step is not available to your account. Refresh to check your status.';if(e?.code==='unavailable'||e?.code==='firestore/unavailable')return 'The connection was interrupted. Your changes have not been confirmed. Refresh before trying again.';return e?.message||'This step could not be completed. Please try again.';}
