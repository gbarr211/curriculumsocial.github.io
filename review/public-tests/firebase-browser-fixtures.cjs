// Synthetic browser transport only. This fixture never contacts Firebase and
// does not simulate its permission rules; use the emulator for access tests.
const firebaseApp = 'export function initializeApp(config) { return { config }; }';
const firebaseFirestore = `
const read = () => JSON.parse(localStorage.getItem('cs-test-db') || '{}');
const snapshot = (id, data) => ({ id, exists: () => !!data, data: () => data ? {...data, updatedAt:{toJSON:()=>data.updatedAt}} : undefined });
export function getFirestore() { return {}; }
export function doc(db, collection, id) { return collection+'/'+id; }
export function collection(db, ...parts) { return parts.join('/'); }
export function collectionGroup(db,name) { return name; }
export function where(...args) { return args; }
export function orderBy(...args) { return args; }
export function startAfter(value) { return value; }
export function query(name) { return name; }
export function limit(value) { return value; }
export function serverTimestamp() { return Date.now(); }
export async function getDocFromServer(path) { return snapshot(path.split('/')[1], read()[path]); }
export async function getDocsFromServer(name) { return {docs:Object.entries(read()).filter(([key])=>key.startsWith(name+'/')).slice(0,50).map(([key,data])=>snapshot(key.split('/')[1],data))}; }
export async function runTransaction(db, action) {
  const records = read();
  await action({get:async path=>snapshot(path.split('/')[1],records[path]),set:(path,data)=>{records[path]=data;},delete:path=>{delete records[path];}});
  localStorage.setItem('cs-test-db',JSON.stringify(records));
}
`;
const firebaseSignedOutAuth = `
export function getAuth(){return {currentUser:null,authStateReady:async()=>{}};}
export class GoogleAuthProvider{setCustomParameters(){}}
export function onAuthStateChanged(auth,cb){queueMicrotask(()=>cb(null));return ()=>{};}
const unexpected=()=>{throw Error('Demo must not mutate authentication');};
export const signInWithPopup=unexpected,createUserWithEmailAndPassword=unexpected,signInWithEmailAndPassword=unexpected,signOut=unexpected,sendPasswordResetEmail=unexpected,deleteUser=unexpected;
`;
module.exports = {firebaseApp, firebaseFirestore, firebaseSignedOutAuth};
