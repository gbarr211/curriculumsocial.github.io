import {areas,millis,fail} from './model.mjs';

export function canAddToCalendar(actor,event,request,now=Date.now()) {
 return !!actor?.uid && actor.emailVerified===true && !actor.isAnonymous &&
  !!event && typeof event.id==='string' && /^[A-Za-z0-9_-]{8,64}$/.test(event.id) && event.status==='open' &&
  Object.hasOwn(areas,event.area) && Number.isFinite(millis(event.startsAt)) &&
  millis(event.endsAt)>Math.max(now,millis(event.startsAt)) &&
  (event.hostId===actor.uid || (request?.requesterId===actor.uid && request.eventId===event.id && request.status==='approved'));
}

const stamp=ms=>{
 const date=new Date(ms);
 if(!Number.isFinite(ms)||!Number.isFinite(date.getTime())||date.getUTCFullYear()<1970||date.getUTCFullYear()>9999)throw fail('calendar','This gathering has an invalid calendar time.');
 return date.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
};
const text=value=>{
 if(typeof value!=='string'||/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value))throw fail('calendar','This gathering cannot be added to your calendar.');
 return value.replace(/\\/g,'\\\\').replace(/\r\n|\r|\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
};
// RFC5545: CRLF lines, at most75 UTF-8 octets, never split a code point.
function fold(line){let output='',bytes=0;const encoder=new TextEncoder();for(const character of line){const size=encoder.encode(character).length;if(bytes+size>75){output+='\r\n ';bytes=1;}output+=character;bytes+=size;}return output;}

export function calendarFile(actor,event,request,now=Date.now()) {
 if(!canAddToCalendar(actor,event,request,now))throw fail('calendar','Refresh this gathering. Only its host and approved attendees can add an upcoming gathering to a calendar.');
 if(typeof event.title!=='string'||event.title.trim().length<3||event.title.length>100)throw fail('calendar','This gathering needs a valid title.');
 const link='https://curriculumsocial.com/events.html?event='+encodeURIComponent(event.id);
 // Explicit allowlist: no description, address, directions, host contact, roster,
 // household counts or attendee identity is copied to the external calendar.
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//CurriculumSocial//Gatherings//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT',
  'UID:'+event.id+'@curriculumsocial.com','DTSTAMP:'+stamp(now),'DTSTART:'+stamp(millis(event.startsAt)),'DTEND:'+stamp(millis(event.endsAt)),
  'SUMMARY:'+text(event.title),'LOCATION:'+text(areas[event.area]),'URL:'+link,'CLASS:PRIVATE',
  'DESCRIPTION:'+text('Free, caregiver-attended gathering.\nCheck your saved plan for approval, changes and meeting details before travelling.\nThis calendar copy does not update automatically.\n'+link),
  'END:VEVENT','END:VCALENDAR'];
 return {filename:'curriculumsocial-'+event.id+'.ics',contentType:'text/calendar;charset=utf-8',content:lines.map(fold).join('\r\n')+'\r\n'};
}
