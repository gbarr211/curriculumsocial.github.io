(() => {
 'use strict';
 // Restore the Shared Circle light palette regardless of old/device preferences.
 document.documentElement.dataset.theme='light';
 document.documentElement.style.colorScheme='only light';
 try{localStorage.removeItem('cs-theme');}catch{}
 function enhance(){
 document.querySelectorAll('.community-menu:not([data-ready])').forEach(b=>{b.dataset.ready='true';const nav=document.getElementById(b.getAttribute('aria-controls'));if(!nav)return;
   const close=()=>{b.setAttribute('aria-expanded','false');nav.classList.remove('is-open');};
   b.addEventListener('click',()=>{const open=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);});
   nav.addEventListener('click',e=>{if(e.target.closest('a'))close();});nav.addEventListener('keydown',e=>{if(e.key==='Escape'){close();b.focus();}});
  });
 }
 const start=()=>{enhance();let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;enhance();});}).observe(document.body,{childList:true,subtree:true});
  if('IntersectionObserver'in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('scene-arrived');io.unobserve(e.target);}}),{threshold:.12});document.querySelectorAll('.scene').forEach(n=>io.observe(n));}
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
