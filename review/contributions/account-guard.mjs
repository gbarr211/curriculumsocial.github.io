export async function guardContributionRemoval(load,remove){
 const service=await load();try{const list=await service.mine();if(list.length)throw Object.assign(Error('Delete your contributions before deleting your account.'),{code:'member/contributions-exist'});}finally{service.dispose?.();}
 return remove();
}
