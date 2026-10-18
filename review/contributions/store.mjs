import {change,actorReady,recordId,problem,directoryCard} from './model.mjs';
// SDK injection lets the real Firestore adapter run against the local emulator.
export function createContributionStore({db,sdk,actor}){
 const ref=id=>sdk.doc(db,'contributions',id);
 const listing=id=>sdk.doc(db,'contribution_directory',id);
 const current=()=>{const a=actor();actorReady(a);return a;};
 const same=a=>{if(current().uid!==a.uid)throw problem('contributions/session','Your account changed. Sign in again before continuing.');};
 const item=s=>s.exists()?{id:s.id,...s.data()}:null;
 return {
 async directory(cursor=null){const a=current();const clauses=[sdk.orderBy('updatedAt','desc'),sdk.limit(24)];if(cursor)clauses.push(sdk.startAfter(cursor));const snap=await sdk.getDocsFromServer(sdk.query(sdk.collection(db,'contribution_directory'),...clauses));same(a);return {items:snap.docs.map(item),cursor:snap.docs.length===24?snap.docs.at(-1):null};},
 async mine(){const a=current();const snap=await sdk.getDocsFromServer(sdk.query(sdk.collection(db,'contributions'),sdk.where('ownerId','==',a.uid),sdk.limit(3)));same(a);return snap.docs.map(item).sort((x,y)=>(y.updatedAt?.toMillis?.()??0)-(x.updatedAt?.toMillis?.()??0));},
 async inbox(cursor=null){const a=current();if(!a.reviewer)throw problem('permission-denied','Reviewer access is required.');const clauses=[sdk.orderBy('updatedAt','desc'),sdk.limit(25)];if(cursor)clauses.push(sdk.startAfter(cursor));const snap=await sdk.getDocsFromServer(sdk.query(sdk.collection(db,'contributions'),...clauses));same(a);return {items:snap.docs.map(item),cursor:snap.docs.length===25?snap.docs.at(-1):null};},
 async mutate(id,expected,command,data){const a=current();await sdk.runTransaction(db,async tx=>{same(a);const s=await tx.get(ref(id));const old=s.exists()?s.data():null;const next=change(a,old,expected,command,data,sdk.serverTimestamp());if(id!==recordId(next.ownerId,next.kind))throw problem('contributions/invalid','Choose a valid contribution.');tx.set(ref(id),next);if(next.status==='accepted'&&next.shareWithMembers)tx.set(listing(id),directoryCard(next));else tx.delete(listing(id));});same(a);const saved=await sdk.getDocFromServer(ref(id));same(a);return item(saved);},
 async erase(id,expected){const a=current();await sdk.runTransaction(db,async tx=>{same(a);const s=await tx.get(ref(id));if(!s.exists())return;const old=s.data();if(old.ownerId!==a.uid)throw problem('permission-denied','Only the contributor can delete this contribution.');if(old.revision!==expected)throw problem('contributions/conflict','This contribution changed. Refresh before deleting.');tx.delete(ref(id));tx.delete(listing(id));});same(a);},
 async eraseAll(){const a=current();const list=await this.mine();await sdk.runTransaction(db,async tx=>{same(a);const snapshots=await Promise.all(list.map(x=>tx.get(ref(x.id))));for(const s of snapshots){if(s.exists()&&s.data().ownerId!==a.uid)throw problem('permission-denied','Account changed.');}for(const s of snapshots)if(s.exists()){tx.delete(s.ref);tx.delete(listing(s.id));}});same(a);}
 };
}
