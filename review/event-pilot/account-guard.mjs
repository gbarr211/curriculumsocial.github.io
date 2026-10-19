export async function guardEventRemoval({db,sdk,uid,currentUid},remove){
 if(currentUid()!==uid)throw Error('Your account changed.');
 const [hosted,requests]=await Promise.all([sdk.getDocsFromServer(sdk.query(sdk.collection(db,'events'),sdk.where('hostId','==',uid),sdk.orderBy('updatedAt','desc'),sdk.limit(1))),sdk.getDocsFromServer(sdk.query(sdk.collectionGroup(db,'event_rsvps'),sdk.where('requesterId','==',uid),sdk.orderBy('updatedAt','desc'),sdk.limit(1)))]);
 if(currentUid()!==uid)throw Error('Your account changed.');
 if(hosted.docs.length)throw Object.assign(Error('Cancel and delete your hosted gatherings in Events before deleting your account.'),{code:'member/events-hosted'});
 if(requests.docs.length)throw Object.assign(Error('Leave and delete your household RSVPs in Events before deleting your account.'),{code:'member/event-rsvps'});
 return remove();
}
