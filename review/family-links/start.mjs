import {bindInvitations} from './ui.mjs?v=invites-20261028';
let timer,expired=false;
try{const preview=document.body.dataset.invitations==='preview';const pending=preview?import('./preview.mjs').then(m=>m.createFamilyPreview()):import('./firebase.mjs').then(m=>m.createFamilyService());const service=await Promise.race([pending,new Promise((_,reject)=>{timer=setTimeout(()=>{expired=true;reject(Error('Your invitations could not load. Check your connection and reload this page.'));},15000)})]);if(!expired)bindInvitations(service);}
catch(e){document.getElementById('invitation-status').textContent=e.message;document.getElementById('invitation-retry').hidden=false;document.getElementById('invitation-retry').onclick=()=>location.reload();}finally{clearTimeout(timer);}
