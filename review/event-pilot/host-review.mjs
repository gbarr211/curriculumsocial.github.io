import {millis} from './model.mjs';

// Feedback from the loaded listing only. The existing transaction still checks
// current capacity, requester revision, host permission and gathering status.
export function reviewCapacity(event,request,now=Date.now()){
 if(!event||event.status!=='open')return {canApprove:false,summary:'This gathering is closed. No approval can be saved.'};
 if(!Number.isFinite(millis(event.startsAt)))return {canApprove:false,summary:'Refresh this gathering to check its time and places.'};
 if(millis(event.startsAt)<=now)return {canApprove:false,summary:'This gathering has started. New approvals are closed.'};
 const {capacity,approvedPeople}=event,adults=request?.adults,children=request?.children;
 if(!Number.isInteger(capacity)||capacity<1||capacity>60||!Number.isInteger(approvedPeople)||approvedPeople<0||approvedPeople>capacity||!Number.isInteger(adults)||adults<1||adults>6||!Number.isInteger(children)||children<0||adults+children>12)
  return {canApprove:false,summary:'Refresh this gathering to check the household and available places.'};
 const needed=adults+children,available=capacity-approvedPeople;
 if(request.status!=='pending')return {canApprove:false,summary:'This request changed. Go back and reopen it before deciding.'};
 const summary=`${needed} guest place${needed===1?'':'s'} needed · ${available} available.`;
 return {canApprove:needed<=available,summary:summary+(needed>available?' Not enough places for this household.':'')};
}
