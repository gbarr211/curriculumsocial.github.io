export const areas = {'samui-undecided':'Koh Samui · flexible','samui-north':'Koh Samui · north','samui-east':'Koh Samui · east','samui-south':'Koh Samui · south','samui-west':'Koh Samui · west',elsewhere:'Elsewhere','prefer-not-to-say':'Area not shared'};
export const philosophies = {montessori:'Montessori',waldorf:'Waldorf / Steiner',reggio:'Reggio Emilia',charlotte_mason:'Charlotte Mason',classical:'Classical',unschooling:'Unschooling','nature-based':'Nature-based','project-based':'Project-based',eclectic:'Eclectic',exploring:'Still exploring'};
export const interests = {nature:'Nature',art:'Art',music:'Music',science:'Science',books:'Books',languages:'Languages',movement:'Movement',practical:'Practical skills',community:'Community',travel:'Travel'};
export const familyConsent = 'shared-family-2026-10-18';
export class IdentityError extends Error {constructor(code, message) {super(message); this.code = code;}}
export const fail = (code, message) => {throw new IdentityError(code, message);};
export function exact(data, allowed, required = allowed) {
  if (!data || typeof data !== 'object' || Array.isArray(data) || !Object.keys(data).every(key => allowed.includes(key)) || !required.every(key => Object.hasOwn(data, key))) fail('invalid-argument', 'The submitted fields are not valid.');
}
const text = (value, max, min = 0) => typeof value === 'string' && value.trim().length >= min && value.length <= max;
const selection = (value, choices, min = 0) => Array.isArray(value) && value.length >= min && value.length <= choices.length && new Set(value).size === value.length && value.every(x => choices.includes(x));
export function validatePerson(p) {
  exact(p, ['displayName','languages','about','offerings','educator']);
  exact(p.educator, ['subjects','experience','area','basis','visible']);
  if (!text(p.displayName,80,1) || !text(p.languages,120) || !text(p.about,600) || !selection(p.offerings,['teach','host','organise']) || !text(p.educator.subjects,180) || !text(p.educator.experience,500) || !Object.hasOwn(areas,p.educator.area) || !['community','paid','either'].includes(p.educator.basis) || typeof p.educator.visible !== 'boolean' || (p.educator.visible && (!p.offerings.includes('teach') || !p.educator.subjects.trim()))) fail('invalid-argument','Check your name and teaching information.');
  return structuredClone(p);
}
export function validateFamily(p) {
  exact(p,['displayName','area','languages','philosophies','interests','about','photo','contribution','availability','discoverable','consentVersion']);
  if (!text(p.displayName,80,1) || !Object.hasOwn(areas,p.area) || !text(p.languages,120) || !text(p.about,600) || !selection(p.philosophies,Object.keys(philosophies),1) || !selection(p.interests,Object.keys(interests)) || !text(p.photo,180000) || (p.photo !== '' && !/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(p.photo)) || !['exploring','share-teaching','host','specialist','organise'].includes(p.contribution) || !['exploring','weekdays','weekends','flexible'].includes(p.availability) || typeof p.discoverable !== 'boolean' || p.consentVersion !== familyConsent) fail('invalid-argument','Check the family profile and sharing choice.');
  return structuredClone(p);
}
export const cardFields = ['displayName','area','languages','philosophies','interests','about','photo'];
export const familyCard = p => Object.fromEntries(cardFields.map(key => [key,p[key]]));
export const roleFor = (family, uid) => family?.state === 'active' ? family.members.find(member => member.uid === uid)?.role : undefined;
export function requireMember(family, uid, manager = false) {
  const role = roleFor(family,uid);
  if (!role || (manager && role !== 'manager')) fail('permission-denied',manager ? 'A family manager needs to confirm this change.' : 'This family is not available to this account.');
  return role;
}
export function requireVersion(family, version) {if (!Number.isSafeInteger(version) || family.version !== version) fail('aborted','This family changed. Refresh before trying again.');}
export function changedMembers(family, actor, target, role) {
  requireMember(family,actor,actor !== target || role !== null);
  if (!family.members.some(m => m.uid === target)) fail('not-found','This adult is no longer in the family.');
  const members = role === null ? family.members.filter(m => m.uid !== target) : family.members.map(m => m.uid === target ? {...m,role} : m);
  if (!members.some(m => m.role === 'manager')) fail('failed-precondition','Choose another family manager before leaving or changing this role.');
  return members;
}
