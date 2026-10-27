import {adult,name,email,consentVersion,invitationFragment,canAccept,problem} from './model.mjs';
export function createFamilyLinkStore({sdk,db,actor,crypto=globalThis.crypto,now=()=>Date.now()}){
 const root=id=>sdk.doc(db,'family_links',id),inv=(owner,id)=>sdk.doc(db,'family_links',owner,'invites',id),profile=id=>sdk.doc(db,'adult_profiles',id);
 const who=(verified=false)=>adult(actor(),verified),same=a=>{if(actor()!==a)throw problem('family/session','Your account changed. Sign in again.');};
 const item=s=>s.exists()?{id:s.id,...s.data()}:null;
 const hash=async token=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token)))].map(b=>b.toString(16).padStart(2,'0')).join('');
 async function get(owner){const a=who(),s=await sdk.getDocFromServer(root(owner));same(a);return item(s);}
 return {
 async mine(cursor=null){const a=who(),clauses=[sdk.where('members','array-contains',a.uid),sdk.orderBy(sdk.documentId()),sdk.limit(20)];if(cursor)clauses.push(sdk.startAfter(cursor));const s=await sdk.getDocsFromServer(sdk.query(sdk.collection(db,'family_links'),...clauses));same(a);return {items:s.docs.map(item),cursor:s.docs.length===20?s.docs.at(-1):null};},
 get,
 async profile(owner){const a=who(),s=await sdk.getDocFromServer(profile(owner));same(a);return item(s);},
 async invites(){const a=who(),s=await sdk.getDocsFromServer(sdk.query(sdk.collection(db,'family_links',a.uid,'invites'),sdk.limit(5)));same(a);return s.docs.map(item);},
 async create(data){
  const a=who(true),recipient=email(data.email),display=name(data.name);if(recipient===email(a.email))throw problem('family/self','Invite another adult using their own sign-in email.');if(data.consent!==true)throw problem('family/consent','Confirm family profile sharing before creating an invitation.');
  const bytes=crypto.getRandomValues(new Uint8Array(24)),token=btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');const id=await hash(token);same(a);
  await sdk.runTransaction(db,async tx=>{
   same(a);const [f,p]=await Promise.all([tx.get(root(a.uid)),tx.get(profile(a.uid))]);if(!p.exists())throw problem('family/profile','Save your family profile before inviting a member.');const before=f.data();if((before?.inviteIds.length??0)>=5)throw problem('family/limit','Remove an old invitation record before creating another.');if((before?.members.length??1)>=6)throw problem('family/full','This family has reached its six-adult limit.');
   const stamp=sdk.serverTimestamp(),next=before?{...before,inviteIds:[...before.inviteIds,id],lastInviteId:id,revision:before.revision+1,updatedAt:stamp}:{ownerId:a.uid,members:[a.uid],names:{[a.uid]:display},consents:{[a.uid]:consentVersion},inviteIds:[id],lastInviteId:id,lastMemberId:'',revision:1,consentVersion,createdAt:stamp,updatedAt:stamp};
   tx.set(root(a.uid),next);tx.set(inv(a.uid,id),{ownerId:a.uid,recipientEmail:recipient,familyName:p.data().displayName,inviterName:display,status:'pending',createdAt:stamp,updatedAt:stamp,expiresAt:sdk.Timestamp.fromMillis(now()+47*3600000+55*60000),consentVersion});
  });same(a);return {id,url:'https://curriculumsocial.com/invitations.html#'+invitationFragment(a.uid,token)};
 },
 async inspect(owner,token){const a=who(),id=await hash(token);same(a);try{const s=await sdk.getDocFromServer(inv(owner,id));same(a);if(!s.exists())throw problem('family/unavailable','This invitation is unavailable. Ask the family for a new link.');return {id,...s.data()};}catch(e){same(a);try{const f=await get(owner);if(f?.members.includes(a.uid))return {id,ownerId:owner,status:'joined',familyName:(await this.profile(owner))?.displayName??'Your family'};}catch{}throw e;}},
 async accept(owner,token,data){const a=who(true),display=name(data.name);if(data.consent!==true)throw problem('family/consent','Confirm that you want to join this family.');const invitation=await this.inspect(owner,token);same(a);if(invitation.status==='joined')return {alreadyJoined:true};canAccept(a,invitation,now());
  // Atomic transforms avoid exposing the private roster before acceptance.
  const batch=sdk.writeBatch(db);batch.update(root(owner),{members:sdk.arrayUnion(a.uid),['names.'+a.uid]:display,['consents.'+a.uid]:consentVersion,inviteIds:sdk.arrayRemove(invitation.id),lastInviteId:invitation.id,revision:sdk.increment(1),updatedAt:sdk.serverTimestamp()});batch.delete(inv(owner,invitation.id));await batch.commit();same(a);return {alreadyJoined:false};
 },
 async revoke(id){const a=who();await sdk.runTransaction(db,async tx=>{same(a);const s=await tx.get(inv(a.uid,id));if(s.data()?.status!=='pending')throw problem('family/changed','This invitation changed. Refresh before trying again.');tx.update(s.ref,{status:'revoked',updatedAt:sdk.serverTimestamp()});});same(a);},
 async eraseInvite(id){const a=who();await sdk.runTransaction(db,async tx=>{same(a);const [f,i]=await Promise.all([tx.get(root(a.uid)),tx.get(inv(a.uid,id))]);if(!f.exists()||!i.exists())throw problem('family/changed','Refresh your invitation list.');tx.update(f.ref,{inviteIds:f.data().inviteIds.filter(x=>x!==id),lastInviteId:id,revision:f.data().revision+1,updatedAt:sdk.serverTimestamp()});tx.delete(i.ref);});same(a);},
 async remove(owner,target){const a=who();await sdk.runTransaction(db,async tx=>{same(a);const s=await tx.get(root(owner)),f=s.data();if(!f||target===owner||!f.members.includes(target)||(a.uid!==owner&&a.uid!==target))throw problem('family/changed','Refresh this family before changing membership.');const names={...f.names},consents={...f.consents};delete names[target];delete consents[target];tx.update(s.ref,{members:f.members.filter(uid=>uid!==target),names,consents,lastMemberId:target,revision:f.revision+1,updatedAt:sdk.serverTimestamp()});});same(a);},
 async close(){const a=who();await sdk.runTransaction(db,async tx=>{same(a);const s=await tx.get(root(a.uid));if(!s.exists())return;const f=s.data();if(f.members.length!==1)throw problem('family/members','Remove other adult members before closing family access.');for(const id of f.inviteIds)tx.delete(inv(a.uid,id));tx.delete(s.ref);});same(a);}
 };
}
