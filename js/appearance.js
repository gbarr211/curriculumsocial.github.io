(() => {
 'use strict';
 // Restore the Shared Circle light palette regardless of old/device preferences.
 document.documentElement.dataset.theme='light';
 document.documentElement.style.colorScheme='only light';
 try{localStorage.removeItem('cs-theme');}catch{}

  // Observe the real adult session only; fictional demo actors never set this.
  let sessionUser = null, sessionStarted = false;
  function paintSession() {
    document.querySelectorAll('.cs-account-actions [data-session]').forEach(a => {
      const visible = a.dataset.session === (sessionUser ? 'signed-in' : 'signed-out');
      if (!visible && a.contains(document.activeElement)) {
        const target = a.parentElement.querySelector(`[data-session="${sessionUser ? 'signed-in' : 'signed-out'}"]`);
        if (target) { target.hidden = false; target.focus({preventScroll:true}); }
      }
      a.hidden = !visible;
    });
  }
  function accountNavigation() {
    if (!document.querySelector('.cs-account-actions')) return;
    paintSession();
    if (sessionStarted) return;
    sessionStarted = true;
    import('/js/public-account-service.js').then(({createAccountService}) => {
      createAccountService().observe(user => { sessionUser = user; paintSession(); }, () => {});
    }).catch(() => { /* Navigation remains usable when sign-in cannot load. */ });
  }
  function landingNavigation() {
    const button = document.querySelector('.public-home .menu-toggle');
    if (!button || button.dataset.ready) return;
    button.dataset.ready = 'true';
    const nav = document.getElementById(button.getAttribute('aria-controls'));
    if (!nav) return;
    const phone = matchMedia('(max-width:1240px)'), reduced = matchMedia('(prefers-reduced-motion:reduce)');
    let open = false, animation, openedY = 0;
    function close(animate = false, restore = false) {
      if (!open) return;
      open = false;
      button.setAttribute('aria-expanded','false');
      if (restore || nav.contains(document.activeElement)) button.focus({preventScroll:true});
      nav.inert = phone.matches;
      if (animate && !reduced.matches && phone.matches && nav.animate) {
        nav.dataset.closing = 'true';
        const current = nav.animate([{height:nav.offsetHeight+'px',opacity:1},{height:'0px',paddingBlock:'0px',opacity:0}],{duration:400,easing:'ease-in-out'});
        animation = current;
        current.finished.then(() => {
          if (animation !== current) return;
          nav.classList.remove('open');delete nav.dataset.closing;animation = null;
        }).catch(() => {});
      } else { nav.classList.remove('open');delete nav.dataset.closing; }
    }
    button.addEventListener('click',() => {
      if (open) { close(); return; }
      animation?.cancel();animation = null;delete nav.dataset.closing;
      open = true;openedY = scrollY;nav.inert = false;
      button.setAttribute('aria-expanded','true');nav.classList.add('open');
    });
    nav.addEventListener('click',e => { if(e.target.closest('a'))close(); });
    document.addEventListener('keydown',e => { if (e.key === 'Escape' && open) { e.preventDefault();close(false,true); } });
    // Listen to page scroll only. A scrollable menu must remain usable on short screens.
    window.addEventListener('scroll',() => { if(open && phone.matches && Math.abs(scrollY-openedY)>8)close(true); },{passive:true});
    phone.addEventListener('change',() => { animation?.cancel();animation = null;close();nav.classList.remove('open');delete nav.dataset.closing;nav.inert = phone.matches; });
    nav.inert = phone.matches;
  }

 function enhance(){
    landingNavigation();accountNavigation();
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
