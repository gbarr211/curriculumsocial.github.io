(() => {
 'use strict';
 const windows=[...document.querySelectorAll('.photo-window')];
 if(!windows.length)return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 let frame=0;
 function paint(){
  frame=0;
  const height=innerHeight,mobile=innerWidth<=700,travel=mobile?16:32;
  for(const window of windows){
   const hero=window.classList.contains('hero-photo-window');
   if(reduce.matches){
    window.style.removeProperty('--photo-offset');
    if(hero)window.style.removeProperty('--hero-photo-scale');
    continue;
   }
   const box=window.getBoundingClientRect();
   if(box.bottom<0||box.top>height)continue;
   const progress=Math.max(-1,Math.min(1,(height/2-box.top-box.height/2)/((height+box.height)/2)));
   const offset=progress*(hero&&mobile?12:travel);
   window.style.setProperty('--photo-offset',offset.toFixed(2)+'px');
   // The narrow hero has no spare vertical crop. Add only enough overscan to fill the edges.
   if(hero)window.style.setProperty('--hero-photo-scale',mobile&&offset
    ? (1+2*(Math.abs(offset)+0.75)/Math.max(1,box.height)).toFixed(5)
    : '1');
  }
 }
 function schedule(){if(!frame&&!document.hidden)frame=requestAnimationFrame(paint);}
 addEventListener('scroll',schedule,{passive:true});
 addEventListener('resize',schedule,{passive:true});
 reduce.addEventListener('change',schedule);
 document.addEventListener('visibilitychange',schedule);
 schedule();
})();
