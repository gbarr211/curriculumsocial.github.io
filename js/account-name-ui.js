// Optional adult display name. This does not rename/publish a family profile.
export function bindAccountName(d,service){
 const form=d.getElementById('adult-name-form');if(!form)return;
 const field=d.getElementById('adult-name'),status=d.getElementById('adult-name-status'),save=d.getElementById('save-adult-name');let user=null,epoch=0,ready=false,busy=false;
 const controls=()=>{field.disabled=save.disabled=!ready||!user||busy;};
 service.observe(next=>{epoch++;user=next;field.value=next?.displayName||'';status.textContent='';busy=false;controls();},()=>{user=null;epoch++;controls();});
 Promise.resolve().then(()=>service.ready()).then(()=>{ready=true;controls();},()=>{status.textContent='Your account could not load. Reload to try again.';});
 form.addEventListener('submit',async e=>{e.preventDefault();if(!ready||!user||busy||!form.reportValidity())return;const name=field.value.trim(),session=epoch;if(name.length>80||/[\u0000-\u001f\u007f]/.test(name)){status.textContent='Use a name of up to 80 characters.';return;}
  busy=true;controls();status.textContent='Saving your name…';try{await service.setName(name);if(session!==epoch)return;field.value=name;status.textContent='Your name is saved. Your family matching profile has not changed.';}catch{if(session===epoch)status.textContent='Your name could not be confirmed. Check your connection and try again.';}finally{if(session===epoch){busy=false;controls();}}
 });controls();
}
