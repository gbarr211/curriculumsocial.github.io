(() => {
 'use strict';
 const key='cs-theme';let preference='system';
 try{const saved=localStorage.getItem(key);if(['light','dark','system'].includes(saved))preference=saved;}catch{}
 const media=matchMedia('(prefers-color-scheme: dark)');
 function apply(){const theme=preference==='system'?(media.matches?'dark':'light'):preference;document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme==='light'?'only light':'dark';document.querySelectorAll('[data-theme-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.themeChoice===preference)));document.querySelectorAll('.appearance-toggle').forEach(b=>b.setAttribute('aria-label','Appearance: '+preference+'. Choose light, dark or device theme.'));}
 apply();media.addEventListener('change',apply);addEventListener('storage',e=>{if(e.key===key){preference=['light','dark','system'].includes(e.newValue)?e.newValue:'system';apply();}});
 let uid=0;
 function enhance(){
  const host=document.querySelector('.cs-header-row .cs-toplinks')||document.querySelector('.nav')||document.querySelector('.account-header')||document.querySelector('.site-header nav')||document.querySelector('.site-header');
  if(host&&!host.querySelector('.appearance')){
   const box=document.createElement('div');box.className='appearance';const id='appearance-options-'+(++uid);
   box.innerHTML='<button class="appearance-toggle" type="button" aria-expanded="false" aria-controls="'+id+'"><span aria-hidden="true">◐</span><span class="appearance-label">Theme</span></button><div class="appearance-options" id="'+id+'" hidden><strong>Appearance</strong><button type="button" data-theme-choice="light" aria-pressed="false">Light</button><button type="button" data-theme-choice="dark" aria-pressed="false">Dark</button><button type="button" data-theme-choice="system" aria-pressed="false">Use device setting</button></div>';
   host.append(box);const toggle=box.querySelector('button'),options=box.lastElementChild;
   const close=()=>{options.hidden=true;toggle.setAttribute('aria-expanded','false');};
   toggle.addEventListener('click',()=>{options.hidden=!options.hidden;toggle.setAttribute('aria-expanded',String(!options.hidden));});
   box.addEventListener('click',e=>{const b=e.target.closest('[data-theme-choice]');if(!b)return;preference=b.dataset.themeChoice;try{localStorage.setItem(key,preference);}catch{}apply();close();toggle.focus();});
   box.addEventListener('keydown',e=>{if(e.key==='Escape'){close();toggle.focus();}});
   document.addEventListener('click',e=>{if(box.isConnected&&!box.contains(e.target))close();});apply();
  }
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
