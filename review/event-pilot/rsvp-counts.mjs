// Presentation checks for the existing household limits. The RSVP transaction
// remains authoritative for identity, capacity, consent and reservation changes.
export function householdCounts(adultValue,childValue,capacity){
 const adults=adultValue===''?NaN:Number(adultValue),children=childValue===''?NaN:Number(childValue);
 let adultError='',childError='';
 if(adultValue!==''&&(!Number.isInteger(adults)||adults<1||adults>6))adultError='Enter a whole number from 1 to 6 adults.';
 if(childValue!==''&&(!Number.isInteger(children)||children<0||children>11))childError='Enter a whole number from 0 to 11 children.';
 const complete=Number.isInteger(adults)&&adults>=1&&adults<=6&&Number.isInteger(children)&&children>=0&&children<=11;
 const total=complete?adults+children:null;
 if(complete){
  // Use the gathering's total capacity, not its unreserved places. Requests do
  // not reserve places; a host may review them as other households change plans.
  if(Number.isInteger(capacity)&&capacity>0&&capacity<12&&total>capacity){
   const message=`This gathering has ${capacity} guest place${capacity===1?'':'s'} in total. Reduce your household count.`;
   if(adults>capacity)adultError=message;else childError=message;
  }else if(total>12)childError='A household request can include up to 12 people.';
 }
 return {adultError,childError,total};
}

export function bindHouseholdCounts({name,adults,children,nameError,adultError,childError,total,event}){
 const show=(input,node,message)=>{
  input.setCustomValidity(message);node.textContent=message;node.hidden=!message;
  if(message)input.setAttribute('aria-invalid','true');else input.removeAttribute('aria-invalid');
 };
 function update(){
  const state=householdCounts(adults.value,children.value,event()?.capacity);
  show(name,nameError,name.value&&!name.value.trim()?'Enter your first name or family nickname.':'');
  show(adults,adultError,state.adultError);show(children,childError,state.childError);
  total.textContent=state.total===null?'Enter the adults and children attending.':`${state.total} ${state.total===1?'person':'people'} in your household · Host approval required.`;
  return state;
 }
 for(const input of [name,adults,children]){
  input.addEventListener('input',update);input.addEventListener('change',update);
 }
 return {update,reset(){for(const [input,node] of [[name,nameError],[adults,adultError],[children,childError]])show(input,node,'');total.textContent='';}};
}
