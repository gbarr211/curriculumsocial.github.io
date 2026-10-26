const minute=60000,hour=60*minute,day=24*hour,samuiOffset=7*hour;

// datetime-local has no timezone. Interpret its wall time explicitly as Samui,
// including when an adult's device is elsewhere. No device-local Date getters.
export function samuiInput(time){
 return Number.isFinite(time)?new Date(time+samuiOffset).toISOString().slice(0,16):'';
}
export function samuiMillis(value){
 if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value))return NaN;
 const time=Date.parse(value+':00+07:00');
 return samuiInput(time)===value?time:NaN;
}
export function hostTimeState(startValue,endValue,now=Date.now()){
 const start=samuiMillis(startValue),end=samuiMillis(endValue);
 let startError='',endError='';
 if(startValue){
  if(!Number.isFinite(start))startError='Choose a valid start date and time.';
  else if(start<=now)startError='Choose a future start in Samui time.';
  else if(start>now+366*day)startError='Choose a start within the next 366 days.';
 }
 if(endValue){
  if(!Number.isFinite(end))endError='Choose a valid end date and time.';
  else if(Number.isFinite(start)&&end<=start)endError='Choose an end after the start.';
  else if(Number.isFinite(start)&&end>start+day)endError='Keep the gathering within 24 hours of its start.';
 }
 return {start,end,startError,endError,
  startMin:samuiInput((Math.floor(now/minute)+1)*minute),
  startMax:samuiInput(Math.floor((now+366*day)/minute)*minute),
  endMin:Number.isFinite(start)?samuiInput(start+minute):'',
  endMax:Number.isFinite(start)?samuiInput(start+day):''};
}

export function bindHostTimes(start,end,startError,endError){
 let suggestedEnd=null;
 const show=(input,node,message)=>{
  input.setCustomValidity(message);node.textContent=message;node.hidden=!message;
  if(message)input.setAttribute('aria-invalid','true');else input.removeAttribute('aria-invalid');
 };
 function update(suggest=false){
  let state=hostTimeState(start.value,end.value);
  if(suggest&&!state.startError&&Number.isFinite(state.start)&&(!end.value||end.value===suggestedEnd)){
   suggestedEnd=samuiInput(state.start+hour);end.value=suggestedEnd;
   state=hostTimeState(start.value,end.value);
  }
  start.min=state.startMin;start.max=state.startMax;end.min=state.endMin;end.max=state.endMax;
  show(start,startError,state.startError);show(end,endError,state.endError);
  return state;
 }
 start.addEventListener('input',()=>update(true));
 end.addEventListener('input',()=>{suggestedEnd=null;update();});
 return {update,reset(){suggestedEnd=null;update();}};
}
