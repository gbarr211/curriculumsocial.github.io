export async function guardIntroductionRemoval({db,sdk,uid,currentUid},remove){
 if(currentUid()!==uid)throw Error('Your account changed.');
 const [sent,received,blocks]=await Promise.all([
  ...['senderId','recipientId'].map(field=>sdk.getDocsFromServer(sdk.query(sdk.collectionGroup(db,'introduction_threads'),sdk.where(field,'==',uid),sdk.orderBy('updatedAt','desc'),sdk.limit(1)))),
  sdk.getDocsFromServer(sdk.query(sdk.collection(db,'introduction_blocks',uid,'blocked'),sdk.limit(1)))
 ]);
 if(currentUid()!==uid)throw Error('Your account changed.');
 if(sent.docs.length||received.docs.length)throw Object.assign(Error('Delete your saved introductions before deleting your account.'),{code:'member/introductions-exist'});
 if(blocks.docs.length)throw Object.assign(Error('Clear your blocked-adult list before deleting your account.'),{code:'member/blocks-exist'});
 return remove();
}
