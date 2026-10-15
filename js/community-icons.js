// Curated first-party line art. Fixed paths only; never interpolate user SVG.
export const iconCatalog = [
  ['circle','Gathering','Community','community circle group gathering meet meetup together'],
  ['leaf','Leaf','Nature','leaf leaves nature garden gardening plant plants green forest botany'],
  ['waves','Waves','Nature','beach sea ocean water coastal shells shore swim swimming'],
  ['sun','Sun','Nature','sun outdoors outdoor morning summer sunshine explore explorer explorers'],
  ['mountain','Mountains','Nature','mountain hike hiking trail walk adventure camping'],
  ['flower','Flower','Nature','flower flowers bloom blossom garden spring'],
  ['music','Music','Creative','music musical rhythm song sing singing sound band jam instrument instruments'],
  ['palette','Art','Creative','art paint painting draw drawing creative color colour sketch'],
  ['book','Book','Creative','book books reading read story stories storytelling literature library'],
  ['pen','Writing','Creative','write writing journal poetry poem pen story drawing'],
  ['camera','Camera','Creative','camera photography photo film video movie'],
  ['scissors','Craft','Creative','craft crafts sewing fabric paper collage cut scissors'],
  ['blocks','Building','Discovery','build building bridge blocks making maker makers construction lego engineering'],
  ['flask','Science','Discovery','science experiment experiments chemistry lab test discovery'],
  ['compass','Compass','Discovery','explore exploring explorer discovery map navigation geography travel'],
  ['globe','Globe','Discovery','world globe language languages culture travel international english thai'],
  ['puzzle','Puzzle','Discovery','puzzle puzzles logic math maths mathematics problem solving games game'],
  ['telescope','Space','Discovery','space stars star astronomy planet planets moon telescope night'],
  ['people','People','Community','family families friends friendship community social together welcome people pod'],
  ['home','Home','Community','home house venue space room host shelter'],
  ['heart','Care','Community','care kindness wellbeing feeling feelings emotions help support'],
  ['sprout','Growing','Nature','grow growing growth seeds seed sustainability gardening planting'],
  ['utensils','Cooking','Everyday','cook cooking kitchen food bake baking bread meal recipe'],
  ['bike','Cycling','Everyday','bike bicycle cycling ride riding cycle wheels'],
  ['ball','Play','Everyday','sport sports play ball football soccer movement active exercise'],
  ['cup','Achievement','Community','achievement milestone goal celebrate celebration success trophy']
].map(([id,label,category,keywords])=>({id,label,category,keywords:keywords.split(' ')}));
const paths = {
 circle:'<circle cx="12" cy="12" r="8"/><path d="M8 12h8M12 8v8"/>',
 leaf:'<path d="M20 4C9 2 3 7 5 14c2 7 12 7 14-3l1-7ZM5 20 15 10"/>',
 waves:'<path d="M3 7c3-4 6 4 9 0s6 4 9 0M3 12c3-4 6 4 9 0s6 4 9 0M3 17c3-4 6 4 9 0s6 4 9 0"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
 mountain:'<path d="m2 20 7-15 6 15H2Zm11-5 3-7 6 12h-7M7 9l2 2 2-2"/>',
 flower:'<circle cx="12" cy="10" r="2"/><path d="M10 5c-1-5 6-5 4 0 5-2 7 4 2 5 5 3 1 8-3 4-2 5-7 2-5-2-5 0-5-6 0-6l2-1ZM12 16v6m0-2 5-3"/>',
 music:'<path d="M9 17V5l11-2v12M9 9l11-2"/><ellipse cx="6" cy="18" rx="3" ry="2"/><ellipse cx="17" cy="16" rx="3" ry="2"/>',
 palette:'<path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1-4 2 2 0 0 1 1-4h3c5 0 2-10-6-10Z"/><circle cx="7" cy="10" r=".6"/><circle cx="10" cy="6.5" r=".6"/><circle cx="15" cy="7" r=".6"/>',
 book:'<path d="M12 6C8 3 4 4 2 5v15c4-2 7-1 10 1 3-2 6-3 10-1V5c-2-1-6-2-10 1Zm0 0v15"/>',
 pen:'<path d="m4 16-1 5 5-1L21 7l-4-4L4 16Zm10-10 4 4M4 16l4 4"/>',
 camera:'<rect x="3" y="6" width="18" height="15" rx="3"/><path d="m8 6 1-3h6l1 3"/><circle cx="12" cy="13" r="4"/>',
 scissors:'<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="m8 8 12 12M8 16 20 4M12 12h.01"/>',
 blocks:'<path d="m12 3 8 4-8 4-8-4 8-4Zm-8 4v10l8 4 8-4V7M12 11v10"/>',
 flask:'<path d="M9 3h6M10 3v7L4 19a1 1 0 0 0 1 2h14a1 1 0 0 0 1-2l-6-9V3M7 15h10"/>',
 compass:'<circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5 5-3Z"/>',
 globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 6h14M5 18h14"/>',
 puzzle:'<path d="M3 3h6c-2 5 8 5 6 0h6v6c-5-2-5 8 0 6v6h-6c2-5-8-5-6 0H3v-6c5 2 5-8 0-6V3Z"/>',
 telescope:'<path d="m3 10 13-6 3 7-13 6-3-7ZM16 4l3-1 3 8-3 1M12 15v7m0-6-4 6m4-6 4 6"/>',
 people:'<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 5v2"/>',
 home:'<path d="m3 10 9-7 9 7M5 9v12h14V9M10 21v-7h4v7"/>',
 heart:'<path d="M20 5c-3-3-6-1-8 1-2-2-5-4-8-1-5 5 4 12 8 15 4-3 13-10 8-15Z"/>',
 sprout:'<path d="M12 22V12M12 15C5 15 3 11 3 6c7 0 9 3 9 9ZM12 11c0-6 3-9 9-9 0 6-3 9-9 9Z"/>',
 utensils:'<path d="M4 3v5c0 4 6 4 6 0V3M7 3v19M19 22V3c-4 1-5 5-5 10h5"/>',
 bike:'<circle cx="5" cy="17" r="4"/><circle cx="19" cy="17" r="4"/><path d="m5 17 5-9 5 9H5Zm9-13h3l2 13M8 5h4M10 8 9 5"/>',
 ball:'<circle cx="12" cy="12" r="9"/><path d="m12 7 5 4-2 6H9l-2-6 5-4Zm0 0V3M7 11l-4-1m6 7-2 3m8-3 2 3m0-9 4-1"/>',
 cup:'<path d="M7 3h10v6a5 5 0 0 1-10 0V3ZM7 5H3v3c0 3 2 4 5 4M17 5h4v3c0 3-2 4-5 4M12 14v6M8 21h8"/>'
};
export const validIcon = id => Object.hasOwn(paths,id) ? id : 'circle';
export function iconSvg(id){return `<svg class="cs-icon" data-icon="${validIcon(id)}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[validIcon(id)]}</svg>`;}
export function suggestIcons(title){
 const words=String(title).toLowerCase().normalize('NFKC').match(/[\p{L}\p{N}]+/gu)||[];
 const broad=new Set(['morning','together','group','club','circle','explore','explorer','explorers','discovery','community']);
 return iconCatalog.map((icon,index)=>({icon,index,score:words.reduce((n,w)=>n+(icon.keywords.includes(w)?(broad.has(w)?.25:(w===icon.id||w===icon.label.toLowerCase()?4:1)):0),0)})).sort((a,b)=>b.score-a.score||a.index-b.index).filter((v,i)=>v.score>0||i<6).slice(0,6).map(v=>v.icon);
}
export function iconPickerMarkup(){return `<div class="cs-icon-picker"><input type="hidden" name="icon" value="circle"><button type="button" class="cs-icon-trigger" aria-expanded="false" aria-controls="icon-popout" aria-label="Choose an icon: Gathering">${iconSvg('circle')}<span class="cs-icon-caption">Icon</span></button><div class="cs-icon-popout" id="icon-popout" role="region" aria-label="Choose an icon" hidden><div class="cs-picker-heading"><strong>Choose an icon</strong><button type="button" class="cs-picker-close" aria-label="Close icon picker">×</button></div><p class="cs-quiet">Suggested from your title</p><div class="cs-icon-grid cs-icon-suggestions" role="group" aria-label="Suggested icons"></div><label class="cs-icon-search-label">Find an icon<input type="search" class="cs-icon-search" placeholder="Try nature, music or making"></label><div class="cs-icon-library"></div><button type="button" class="cs-icon-auto">Use title suggestion</button><div class="cs-sr-only cs-icon-status" role="status"></div></div></div>`;}
export function bindIconPicker(form){
 const root=form.querySelector('.cs-icon-picker');if(!root)return;
 const title=form.querySelector('[name=name]'),input=root.querySelector('[name=icon]'),trigger=root.querySelector('.cs-icon-trigger'),panel=root.querySelector('.cs-icon-popout'),search=root.querySelector('.cs-icon-search');let manual=false;
 const option=icon=>`<button type="button" class="cs-icon-option" data-icon-choice="${icon.id}" aria-label="${icon.label}" title="${icon.label}" aria-pressed="${input.value===icon.id}">${iconSvg(icon.id)}<span>${icon.label}</span></button>`;
 function paint(){
  const suggestions=suggestIcons(title.value);if(!manual)input.value=suggestions[0].id;
  const selected=iconCatalog.find(i=>i.id===input.value);trigger.innerHTML=iconSvg(selected.id)+'<span class="cs-icon-caption">Icon</span>';trigger.setAttribute('aria-label','Choose an icon: '+selected.label);
  root.querySelector('.cs-icon-suggestions').innerHTML=suggestions.map(option).join('');
  const q=search.value.trim().toLowerCase(),matches=iconCatalog.filter(i=>(i.label+' '+i.category+' '+i.keywords.join(' ')).toLowerCase().includes(q));
  root.querySelector('.cs-icon-library').innerHTML=matches.length?[...new Set(matches.map(i=>i.category))].map(category=>`<section><h4>${category}</h4><div class="cs-icon-grid" role="group" aria-label="${category}">${matches.filter(i=>i.category===category).map(option).join('')}</div></section>`).join(''):'<p class="cs-quiet">No icons found. Try another word.</p>';
 }
 function close(restore=false){panel.hidden=true;trigger.setAttribute('aria-expanded','false');if(restore)trigger.focus();}
 trigger.addEventListener('click',()=>{const opening=panel.hidden;panel.hidden=!opening;trigger.setAttribute('aria-expanded',String(opening));if(opening){paint();panel.querySelector('.cs-icon-option')?.focus();}});
 root.addEventListener('click',e=>{const choice=e.target.closest('[data-icon-choice]');if(choice){input.value=validIcon(choice.dataset.iconChoice);manual=true;paint();close(true);}if(e.target.closest('.cs-picker-close'))close(true);if(e.target.closest('.cs-icon-auto')){manual=false;paint();close(true);}});
 form.addEventListener('click',e=>{if(!root.contains(e.target))close();});
 root.addEventListener('focusout',e=>{if(e.relatedTarget&&!root.contains(e.relatedTarget))close();});
 root.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){e.preventDefault();e.stopPropagation();close(true);}if(['ArrowRight','ArrowLeft','ArrowDown','ArrowUp','Home','End'].includes(e.key)&&e.target.matches('[data-icon-choice]')){e.preventDefault();const buttons=[...e.target.parentElement.querySelectorAll('button')],i=buttons.indexOf(e.target),step=e.key==='ArrowDown'?4:e.key==='ArrowUp'?-4:e.key==='ArrowLeft'?-1:1;buttons[e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+step+buttons.length)%buttons.length].focus();}});
 title.addEventListener('input',paint);search.addEventListener('input',paint);paint();
}
