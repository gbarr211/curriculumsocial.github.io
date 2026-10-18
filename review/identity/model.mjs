import {validatePerson,validateFamily,familyConsent,requireMember,requireVersion,changedMembers,roleFor,fail,areas,philosophies,interests} from './domain.mjs';
import {applyAction as connect,viewFor as connectionView} from '../connections/model.mjs';
export function blankPerson(name) {return {displayName:name,languages:'English',about:'',offerings:[],educator:{subjects:'',experience:'',area:'samui-undecided',basis:'community',visible:false}};}
export function blankFamily(name) {return {displayName:name,area:'samui-north',languages:'English',philosophies:['exploring'],interests:['nature'],about:'',photo:'',contribution:'exploring',availability:'flexible',discoverable:false,consentVersion:familyConsent};}
export function exampleIdentity() {
  const people=['avery','jordan','mei','sam','pat','new-parent','lee'].map((id,i)=>({id,email:id+'@example.invalid',profile:blankPerson(['Avery Rivera','Jordan Rivera','Mei Chen','Sam · independent educator','Pat Rivera','Alex · new parent','Lee · community friend'][i]),version:1}));
  Object.assign(people[3].profile,{about:'Practical science and making things together.',offerings:['teach'],educator:{subjects:'Science and practical projects',experience:'Illustrative experience only; not a verified qualification.',area:'samui-east',basis:'either',visible:true}});
  return {people,families:[{id:'family-rivera',profile:{...blankFamily('Rivera Family'),about:'Slow mornings outdoors and making things together.',philosophies:['montessori','nature-based'],discoverable:true},members:[{uid:'avery',role:'manager'},{uid:'pat',role:'member'}],state:'active',version:1},{id:'family-chen',profile:{...blankFamily('Chen Family'),area:'samui-east',about:'Music, practical projects and finding a local circle.',philosophies:['project-based','nature-based'],interests:['music','nature'],discoverable:true},members:[{uid:'mei',role:'manager'}],state:'active',version:1}],invites:[],joinRequests:[],communityInvites:[],links:[],blocks:[],nextId:1,learners:[{id:'fictional-learner',name:'Sample learner',icon:'neutral',familyId:'family-rivera',guardianUids:['avery']}]};
}
export function graph(state) {return {families:state.families.filter(f=>f.state==='active').map(f=>({id:f.id,name:f.profile.displayName,area:areas[f.profile.area],languages:f.profile.languages,approaches:f.profile.philosophies.map(k=>philosophies[k]),interests:f.profile.interests.map(k=>interests[k]),about:f.profile.about,initials:f.profile.displayName.split(' ').map(s=>s[0]).join('').slice(0,2),tone:'lime'})),links:state.links,blocks:state.blocks,reports:[],nextId:state.nextId};}
export function identityView(state,actor,selected) {
  const person=state.people.find(p=>p.id===actor); if(!person) fail('unauthenticated','Choose a sample adult.');
  const families=state.families.filter(f=>roleFor(f,actor)), current=families.find(f=>f.id===selected)||families[0]||null;
  const family=current?structuredClone(current):null;
  if(family) family.members=family.members.map(m=>({...m,name:state.people.find(p=>p.id===m.uid)?.profile.displayName || 'Adult member'}));
  const role=family?roleFor(family,actor):null;
  const invitations=role==='manager'?state.invites.filter(i=>i.familyId===family.id&&i.status==='open').map(i=>({id:i.id,status:i.status,role:i.role,claimantName:state.people.find(p=>p.id===i.claimant)?.profile.displayName || null,expiresAt:i.expiresAt})):[];
  const requests=state.joinRequests.filter(i=>i.actor===actor&&i.status==='pending').map(i=>({id:i.id,familyName:state.families.find(f=>f.id===i.familyId)?.profile.displayName,role:'member',expired:i.expiresAt<=Date.now()}));
  const incomingRequests=role==='manager'?state.joinRequests.filter(i=>i.familyId===family.id&&i.status==='pending').map(i=>({id:i.id,name:state.people.find(p=>p.id===i.actor)?.profile.displayName,expired:i.expiresAt<=Date.now()})):[];
  const inbox=state.invites.filter(i=>i.recipient===actor&&i.status==='open').map(i=>({id:i.id,code:i.code,familyName:state.families.find(f=>f.id===i.familyId)?.profile.displayName,role:i.role,expiresAt:i.expiresAt}));
  const communityInbox=state.communityInvites.filter(i=>i.recipient===actor&&i.status==='open').map(i=>({id:i.id,from:state.people.find(p=>p.id===i.creator)?.profile.displayName}));
  const educators=state.people.filter(p=>p.profile.offerings.includes('teach')&&p.profile.educator.visible).map(p=>({id:p.id,name:p.profile.displayName,languages:p.profile.languages,about:p.profile.about,...p.profile.educator}));
  const links=family?connectionView(graph(state),family.id):null;
  if(links) links.discover=links.discover.filter(p=>state.families.find(f=>f.id===p.id).profile.discoverable);
  return {person:structuredClone(person),families:families.map(f=>({id:f.id,name:f.profile.displayName})),family,role,invitations,requests,incomingRequests,inbox,communityInbox,educators,links,learners:state.learners.filter(l=>l.guardianUids.includes(actor)).map(l=>({id:l.id,name:l.name,icon:l.icon||'neutral'}))};
}
export function applyIdentity(original,actor,action,now=Date.now()) {
  const state=structuredClone(original), person=state.people.find(p=>p.id===actor); if(!person) fail('unauthenticated','Choose a sample adult.');
  let result={};
  const selected=()=>{const f=state.families.find(f=>f.id===action.familyId);requireMember(f,actor,true);requireVersion(f,action.version);return f;};
  switch(action.type) {
    case 'save-person':
      if(action.version!==person.version) fail('aborted','This adult profile changed.'); person.profile=validatePerson(action.profile);person.version++;break;
    case 'create-family': {
      if(state.families.filter(f=>roleFor(f,actor)).length>=5) fail('resource-exhausted','This account has reached the family limit.');
      const id='sample-family-'+state.nextId++;state.families.push({id,profile:validateFamily(action.profile),members:[{uid:actor,role:'manager'}],state:'active',version:1});result={familyId:id};break;
    }
    case 'save-family': {const f=selected(); f.profile=validateFamily(action.profile);f.version++;break;}
    case 'invite': {
      const f=selected();if(!['member','manager'].includes(action.role))fail('invalid-argument','Choose a valid role.');
      if(f.members.length>=6||state.invites.filter(i=>i.familyId===f.id&&i.status==='open').length>=5)fail('resource-exhausted','Review current members and invitations first.');
      if(!state.people.some(p=>p.id===action.recipient)||f.members.some(m=>m.uid===action.recipient))fail('invalid-argument','Choose an adult outside this family.');
      const id='invite-'+state.nextId++,code='sample-'+id;state.invites.push({id,code,familyId:f.id,creator:actor,recipient:action.recipient,role:action.role,status:'open',claimant:null,expiresAt:now+48*60*60*1000});f.version++;result={code};break;
    }
    case 'claim': {
      const i=state.invites.find(i=>i.code===action.code),f=state.families.find(f=>f.id===i?.familyId);
      if(!i)fail('not-found','This sample invitation is missing. Open your sample inbox or ask for a new invitation.');
      if(i.recipient!==actor)fail('permission-denied','This invitation belongs to a different email account. Use the invited adult’s account.');
      if(i.status==='accepted'&&roleFor(f,actor)){result={familyId:f.id,alreadyJoined:true};break;}
      if(i.status!=='open')fail('failed-precondition','This invitation was used or revoked. Ask a family manager for a new invitation.');
      if(i.expiresAt<=now)fail('failed-precondition','This invitation expired after 48 hours. Ask for a new invitation.');
      if(f?.state!=='active'||!f.members.some(m=>m.uid===i.creator&&m.role==='manager')||f.members.length>=6)fail('failed-precondition','This family cannot accept another adult right now. Contact the family.');
      if(roleFor(f,actor)){i.status='accepted';result={familyId:f.id,alreadyJoined:true};break;}
      if(state.families.filter(f=>roleFor(f,actor)).length>=5)fail('resource-exhausted','This account has reached the family limit.');
      f.members.push({uid:actor,role:i.role});f.version++;i.claimant=actor;i.status='accepted';for(const r of state.joinRequests)if(r.actor===actor&&r.familyId===f.id&&r.status==='pending')r.status='accepted-via-invitation';result={familyId:f.id};break;
    }
    case 'revoke': {
      const f=selected(),i=state.invites.find(i=>i.id===action.inviteId&&i.familyId===f.id&&i.status==='open');
      if(!i)fail('failed-precondition','This invitation is no longer waiting.');i.status='revoked';f.version++;break;
    }
    case 'request-join': {
      const f=state.families.find(f=>f.id===action.familyId);
      if(!f||f.state!=='active'||!f.profile.discoverable||roleFor(f,actor))fail('failed-precondition','Choose an available family introduction.');
      if(state.joinRequests.some(r=>r.actor===actor&&r.familyId===f.id&&r.status==='pending'))fail('already-exists','Your request is already waiting for this family.');
      if(state.joinRequests.filter(r=>r.actor===actor&&r.status==='pending').length>=5||state.joinRequests.filter(r=>r.familyId===f.id&&r.status==='pending').length>=10)fail('resource-exhausted','Review pending requests before sending another.');
      state.joinRequests.push({id:'join-'+state.nextId++,actor,familyId:f.id,status:'pending',expiresAt:now+7*86400000});break;
    }
    case 'decide-join': {
      const f=selected(),r=state.joinRequests.find(r=>r.id===action.requestId&&r.familyId===f.id&&r.status==='pending');
      if(!r||!['approve','decline'].includes(action.decision))fail('failed-precondition','This request is no longer waiting.');
      if(action.decision==='approve'){
        if(r.expiresAt<=now||f.members.length>=6||roleFor(f,r.actor)||state.families.filter(f=>roleFor(f,r.actor)).length>=5)fail('failed-precondition','This adult cannot join right now.');
        f.members.push({uid:r.actor,role:'member'});
      }r.status=action.decision==='approve'?'accepted':'declined';f.version++;break;
    }
    case 'withdraw-join': {
      const r=state.joinRequests.find(r=>r.id===action.requestId&&r.actor===actor&&r.status==='pending');if(!r)fail('permission-denied','This request is no longer waiting.');r.status='withdrawn';break;
    }
    case 'invite-community': {
      if(!state.people.some(p=>p.id===action.recipient)||action.recipient===actor)fail('invalid-argument','Choose a different sample adult.');
      if(state.communityInvites.filter(i=>i.creator===actor&&i.status==='open').length>=5)fail('resource-exhausted','Review existing invitations first.');
      if(state.communityInvites.some(i=>i.creator===actor&&i.recipient===action.recipient&&i.status==='open'))fail('already-exists','This community invitation is already waiting.');
      state.communityInvites.push({id:'community-'+state.nextId++,creator:actor,recipient:action.recipient,status:'open'});break;
    }
    case 'accept-community': {
      const i=state.communityInvites.find(i=>i.id===action.inviteId&&i.recipient===actor&&i.status==='open');if(!i)fail('permission-denied','This community invitation is no longer waiting.');i.status='accepted';break;
    }
    case 'add-learner': {
      const f=state.families.find(f=>f.id===action.familyId);requireMember(f,actor);
      if(!['neutral','boy','girl'].includes(action.icon))fail('invalid-argument','Choose a sample icon.');
      if(state.learners.filter(l=>l.guardianUids.includes(actor)).length>=5)fail('resource-exhausted','This example has reached its learner limit.');
      state.learners.push({id:'learner-'+state.nextId++,name:'Sample learner '+state.nextId,icon:action.icon,familyId:f.id,guardianUids:[actor]});break;
    }
    case 'member-role': {
      const f=state.families.find(f=>f.id===action.familyId);if(!['manager','member',null].includes(action.role))fail('invalid-argument','Choose a valid role.');requireVersion(f||{},action.version);f.members=changedMembers(f,actor,action.memberUid,action.role);f.version++;break;
    }
    case 'connect': {
      const f=state.families.find(f=>f.id===action.familyId);requireMember(f,actor,true);const peer=state.families.find(f=>f.id===action.peer);
      if(!peer||peer.members.some(m=>m.uid===actor)||(action.action==='request'&&(!f.profile.discoverable||!peer.profile.discoverable)))fail('failed-precondition','This family connection is unavailable.');
      const updated=connect(graph(state),f.id,{type:action.action,peer:action.peer});state.links=updated.links;state.blocks=updated.blocks;state.nextId=updated.nextId;break;
    }
    default: fail('invalid-argument','Choose a valid action.');
  }
  for(const key of ['invites','joinRequests','communityInvites'])state[key]=state[key].filter(i=>['open','pending'].includes(i.status)).concat(state[key].filter(i=>!['open','pending'].includes(i.status)).slice(-100));
  return {state,result};
}
