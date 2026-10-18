// Review-only state machine. No network, credentials, browser storage or real accounts.
export const sampleFamilies = [
  {id:'rivera',name:'Rivera Family',area:'North Samui',languages:'English · Spanish',approaches:['Montessori','Nature-based'],interests:['Nature','Music'],about:'Slow mornings outdoors, practical projects and making music together.',initials:'RF',tone:'lime'},
  {id:'chen',name:'Chen Family',area:'East Samui',languages:'English · Mandarin',approaches:['Project-based','Eclectic'],interests:['Science','Art'],about:'Curious builders looking for hands-on projects and shared discoveries.',initials:'CF',tone:'sand'},
  {id:'taylor',name:'Taylor Family',area:'West Samui',languages:'English · Thai',approaches:['Waldorf','Charlotte Mason'],interests:['Books','Nature'],about:'Stories, nature journals and creative afternoons are our favourite ways to learn.',initials:'TF',tone:'peach'}
];
export const reportReasons = {unwanted:'Unwanted contact',spam:'Spam or misleading profile',safety:'Safety concern',other:'Something else'};
export const pairKey = (a,b) => JSON.stringify([a,b].sort());
export const createState = () => ({families:structuredClone(sampleFamilies),links:[],blocks:[],reports:[],nextId:1});
const fail = message => {throw new Error(message);};
const family = (state,id) => state.families.find(p=>p.id===id);
const blockExists = (state,a,b) => state.blocks.some(x=>(x.owner===a&&x.peer===b)||(x.owner===b&&x.peer===a));
const latestLink = (state,a,b) => state.links.find(x=>x.key===pairKey(a,b));
function members(state,actor,peer){
  if(!family(state,actor))fail('Choose an available sample family first.');
  if(actor===peer)fail('A family cannot connect with itself.');
  if(!family(state,peer))fail('This family is no longer available.');
}
export function applyAction(previous,actor,action){
  if(!family(previous,actor))fail('Choose an available sample family first.');
  if(!action||typeof action!=='object')fail('Choose an action.');
  const state=structuredClone(previous),peer=action.peer;
  if(action.type==='delete-profile'){
    state.families=state.families.filter(x=>x.id!==actor);
    state.links=state.links.filter(x=>x.from!==actor&&x.to!==actor);
    state.blocks=state.blocks.filter(x=>x.owner!==actor&&x.peer!==actor);
    state.reports=state.reports.filter(x=>x.owner!==actor&&x.peer!==actor);
    return state;
  }
  members(state,actor,peer);
  let link=latestLink(state,actor,peer);
  switch(action.type){
    case 'request':
      if(blockExists(state,actor,peer))fail('A request cannot be made to this family.');
      if(link&&['pending','accepted'].includes(link.status))fail('A request or connection already exists. Check your connections.');
      if(link?.status==='declined'&&link.to!==actor)fail('This request was declined. Wait for that family to initiate a new connection.');
      if(link?.status==='removed'&&link.closedBy!==actor)fail('This connection was ended. Wait for that family to initiate a new connection.');
      state.links=state.links.filter(x=>x.key!==pairKey(actor,peer));
      state.links.push({id:state.nextId++,key:pairKey(actor,peer),from:actor,to:peer,status:'pending'});
      break;
    case 'accept':
    case 'decline':
      if(!link||link.status!=='pending'||link.to!==actor)fail('Only the recipient can respond to a pending request.');
      if(blockExists(state,actor,peer))fail('This request is no longer available.');
      link.status=action.type==='accept'?'accepted':'declined';
      break;
    case 'cancel':
      if(!link||link.status!=='pending'||link.from!==actor)fail('Only the sender can cancel a pending request.');
      link.status='cancelled';
      break;
    case 'remove':
      if(!link||link.status!=='accepted')fail('This connection is no longer active.');
      link.status='removed';link.closedBy=actor;
      break;
    case 'block':
      if(!state.blocks.some(x=>x.owner===actor&&x.peer===peer))state.blocks.push({owner:actor,peer});
      state.links=state.links.filter(x=>x.key!==pairKey(actor,peer));
      break;
    case 'unblock':
      state.blocks=state.blocks.filter(x=>!(x.owner===actor&&x.peer===peer));
      break;
    case 'report':
      if(!Object.hasOwn(reportReasons,action.reason))fail('Choose a reason for the sample report.');
      if(state.reports.some(x=>x.owner===actor&&x.peer===peer))fail('You have already recorded a sample report about this family.');
      state.reports.push({id:state.nextId++,owner:actor,peer,reason:action.reason});
      if(action.block===true){
        if(!state.blocks.some(x=>x.owner===actor&&x.peer===peer))state.blocks.push({owner:actor,peer});
        state.links=state.links.filter(x=>x.key!==pairKey(actor,peer));
      }
      break;
    default: fail('This action is not available.');
  }
  return state;
}
export function viewFor(state,actor){
  if(!family(state,actor))return {family:null,discover:[],incoming:[],outgoing:[],connected:[],blocked:[],reports:[]};
  const ownLinks=state.links.filter(x=>x.from===actor||x.to===actor);
  const withPeer=x=>({...x,peer:structuredClone(family(state,x.from===actor?x.to:x.from))});
  return {
    family:structuredClone(family(state,actor)),
    discover:state.families.filter(p=>p.id!==actor&&!blockExists(state,actor,p.id)).map(p=>{
      const link=latestLink(state,actor,p.id);
      return {...structuredClone(p),relationship:link?.status||'none',direction:link?.from===actor?'outgoing':'incoming',canRequest:!link||link.status==='cancelled'||(link.status==='declined'&&link.to===actor)||(link.status==='removed'&&link.closedBy===actor)};
    }),
    incoming:ownLinks.filter(x=>x.status==='pending'&&x.to===actor).map(withPeer),
    outgoing:ownLinks.filter(x=>x.status==='pending'&&x.from===actor).map(withPeer),
    connected:ownLinks.filter(x=>x.status==='accepted').map(withPeer),
    blocked:state.blocks.filter(x=>x.owner===actor).map(x=>structuredClone(family(state,x.peer))),
    reports:state.reports.filter(x=>x.owner===actor).map(x=>({peer:structuredClone(family(state,x.peer)),reason:x.reason}))
  };
}
export function exampleState(){return applyAction(createState(),'taylor',{type:'request',peer:'rivera'});}
