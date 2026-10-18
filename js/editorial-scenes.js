(() => {
 'use strict';
 const windows=[...document.querySelectorAll('.photo-window')];
 if(!windows.length)return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 let frame=0;
 function paint(){
  frame=0;
  const height=innerHeight,travel=innerWidth<=700?16:32;
  for(const window of windows){
   if(reduce.matches){window.style.removeProperty('--photo-offset');continue;}
   const box=window.getBoundingClientRect();
   if(box.bottom<0||box.top>height)continue;
   const progress=Math.max(-1,Math.min(1,(height/2-box.top-box.height/2)/((height+box.height)/2)));
   window.style.setProperty('--photo-offset',(progress*travel).toFixed(2)+'px');
  }
 }
 function schedule(){if(!frame&&!document.hidden)frame=requestAnimationFrame(paint);}
 addEventListener('scroll',schedule,{passive:true});
 addEventListener('resize',schedule,{passive:true});
 reduce.addEventListener('change',schedule);
 document.addEventListener('visibilitychange',schedule);
 schedule();
})();
