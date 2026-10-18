import {bindContributions} from './ui.mjs';
const status=document.getElementById('status');let timeout,expired=false;
try{
 const preview=document.body.dataset.contributions==='preview';
 const emulator=['127.0.0.1','localhost'].includes(location.hostname)&&new URLSearchParams(location.search).get('emulator')==='1';
 const load=async()=>{if(preview){const {createPreviewService}=await import('./preview.mjs');return createPreviewService();}const {liveEnabled}=await import('./config.mjs');if(!liveEnabled&&!emulator)throw Error('Contributions are being prepared. Explore the private preview for now.');const {createFirebaseService}=await import('./firebase.mjs');return createFirebaseService({emulator});};
 const deadline=new Promise((_,reject)=>{timeout=setTimeout(()=>{expired=true;reject(Error('Contributions could not load. Check your connection, then try again.'));},15000);});
 const service=await Promise.race([load().then(service=>{if(expired){service.dispose?.();throw Error('Loading timed out.');}return service;}),deadline]);clearTimeout(timeout);bindContributions(service,{preview});
}catch(error){clearTimeout(timeout);status.textContent=error.message||'Contributions could not load. Please try again.';status.classList.add('error');document.getElementById('retry').hidden=false;document.getElementById('retry').addEventListener('click',()=>location.reload(),{once:true});}
