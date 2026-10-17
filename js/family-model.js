export const philosophies = {montessori:'Montessori',waldorf:'Waldorf / Steiner',reggio:'Reggio Emilia',charlotte_mason:'Charlotte Mason',classical:'Classical',unschooling:'Unschooling','nature-based':'Nature-based','project-based':'Project-based',eclectic:'Eclectic / mixed approaches',exploring:'Still exploring'};
export const interests = {nature:'Nature & outdoors',art:'Art & making',music:'Music',science:'Science',books:'Books & stories',languages:'Languages',movement:'Movement & sport',practical:'Practical life skills',community:'Community projects',travel:'Travel & cultures'};
export const areas = {'samui-undecided':'Koh Samui · flexible','samui-north':'Koh Samui · north','samui-east':'Koh Samui · east','samui-south':'Koh Samui · south','samui-west':'Koh Samui · west',elsewhere:'Elsewhere','prefer-not-to-say':'Area not shared'};
export function sharedFields(p){return Object.fromEntries(['displayName','area','languages','philosophies','interests','about','photo','updatedAt'].map(k=>[k,p[k]]));}
export function matchFamilies(records, own, filters={}){
 const preferred=new Set(own?.philosophies||[]),hobbies=new Set(own?.interests||[]),query=(filters.query||'').trim().toLowerCase();
 return records.filter(p=>(!filters.area||p.area===filters.area)&&(!filters.philosophy||p.philosophies.includes(filters.philosophy))&&(!filters.language||p.languages.toLowerCase().includes(filters.language.toLowerCase()))&&(!query||[p.displayName,p.about,p.languages,...p.philosophies.map(k=>philosophies[k]||k),...p.interests.map(k=>interests[k]||k)].join(' ').toLowerCase().includes(query)))
 .map(p=>({...p,sharedPhilosophies:p.philosophies.filter(x=>preferred.has(x)),sharedInterests:p.interests.filter(x=>hobbies.has(x))}))
 .sort((a,b)=>(b.sharedPhilosophies.length-a.sharedPhilosophies.length)||(b.sharedInterests.length-a.sharedInterests.length)||a.displayName.localeCompare(b.displayName));
}
