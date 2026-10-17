import {createMemberService} from './member-service.js?v=family-1';
import {getAuth} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
export function createAccountService(){
 const service=createMemberService();
 return {...service,async remove(){const user=getAuth().currentUser;if(!user)throw Error('Sign in first');const result=await service.load(user.uid);if(result.data)throw Object.assign(Error('Delete your profile first.'),{code:'member/profile-exists'});return service.remove();}};
}
