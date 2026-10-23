import {bindEvents} from './ui.mjs?v=event-tools-20261023';
let expired=false,timer;
try{
 const preview=document.body.dataset.events==='preview',emulator=['localhost','127.0.0.1'].includes(location.hostname)&&new URLSearchParams(location.search).get('emulator')==='1';
 const load=async()=>{if(preview){const {createEventPreview}=await import('./preview.mjs');return createEventPreview();}const {liveEnabled}=await import('./config.mjs');if(!liveEnabled&&!emulator)throw Error('Events is ready for private review. Live publishing has not been activated yet.');const {createEventService}=await import('./firebase.mjs');return createEventService({emulator});};
 const service=await Promise.race([load().then(s=>{if(expired){s.dispose?.();throw Error('Loading timed out.');}return s;}),new Promise((_,reject)=>{timer=setTimeout(()=>{expired=true;reject(Error('Events could not load. Check your connection and try again.'));},15000);})]);clearTimeout(timer);bindEvents(service,{preview});
}catch(e){clearTimeout(timer);document.getElementById('events-status').textContent=e.message;document.getElementById('events-status').classList.add('error');document.getElementById('events-retry').hidden=false;document.getElementById('events-retry').addEventListener('click',()=>location.reload(),{once:true});}
