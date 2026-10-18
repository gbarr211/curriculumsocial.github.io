import {createFirebaseService} from '../contributions/firebase.mjs';
import {getApp} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import * as sdk from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import {createIntroductionStore} from './store.mjs';
export async function createIntroductionService(options){const session=await createFirebaseService(options);const store=createIntroductionStore({db:sdk.getFirestore(getApp()),sdk,actor:()=>session.identity()});return {...session,...store};}
