import {bindMember} from './member-ui.js?intro-release=20261019&v=member-actions-1';
let timer;
try{
 const service=await Promise.race([import('./member-service.js?v=family-1').then(m=>m.createMemberService()),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('timeout')),15000);})]);
 await Promise.race([service.ready(),new Promise((_,reject)=>setTimeout(()=>reject(Error('timeout')),15000))]);
 bindMember(document,service);
}catch{document.getElementById('member-status').textContent='Your account could not load. Check your connection and reload this page.';document.getElementById('signed-out').hidden=false;}
finally{clearTimeout(timer);}
