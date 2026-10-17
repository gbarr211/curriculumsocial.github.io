// Signed-in visitors enter their real home unless they explicitly choose the demo.
import {createAccountService} from './public-account-service.js';
const demoPaths=new Set(['dashboard.html','matching.html','pods.html','activities.html','curriculum.html','apply.html','student.html']);
const explicit=new URLSearchParams(location.search).get('demo')==='1';
try{
 const service=createAccountService();
 service.observe(user=>{if(user&&!explicit)location.replace('/member.html');});
 if(explicit)document.addEventListener('click',event=>{const a=event.target.closest('a[href]');if(!a)return;const url=new URL(a.href,location.href);if(url.origin===location.origin&&demoPaths.has(url.pathname.split('/').pop())){url.searchParams.set('demo','1');a.href=url.href;}} ,true);
}catch{/* Public examples remain readable if sign-in is unavailable. */}
