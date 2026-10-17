const fs=require('node:fs'),assert=require('node:assert/strict'),{JSDOM}=require('../public-tests/node_modules/jsdom');
const tick=()=>new Promise(r=>setTimeout(r,0));
(async()=>{
const model=fs.readFileSync('js/family-model.js','utf8').replaceAll('export ','');
const ui=fs.readFileSync('js/member-ui.js','utf8').replace(/^import.*\n/,'').replace('export function','function');
const profile={displayName:'Smith Family',area:'samui-north',languages:'English',philosophies:['montessori'],interests:['nature'],about:'Synthetic test',photo:'',contribution:'exploring',availability:'weekends',discoverable:false,consentVersion:'family-profile-2026-10-17'};
let count=0;
async function setup(load=async()=>({data:null,version:null})){const dom=new JSDOM(fs.readFileSync('member.html','utf8'),{url:'https://example.invalid/member.html',runScripts:'outside-only'});let observer;const service={observe:fn=>observer=fn,load,save:async(uid,data)=>({data:{...data,consentVersion:profile.consentVersion},version:'v1'}),families:async()=>[],erase:async()=>{},logout:async()=>observer(null)};dom.window.eval(model+'\n'+ui+'\nwindow.bindMember=bindMember;window.matchFamilies=matchFamilies;');dom.window.bindMember(dom.window.document,service);const get=id=>dom.window.document.getElementById(id);return {dom,service,get,sign:async u=>{observer(u);await tick();},submit:()=>get('member-form').dispatchEvent(new dom.window.Event('submit',{cancelable:true}))};}
const user={uid:'synthetic-a',email:'test@example.invalid'};
const x=await setup();await x.sign(null);assert.equal(x.get('member-content').hidden,true);count++;
await x.sign(user);assert.equal(x.get('family-setup').hidden,false);assert.equal(x.get('discoverable').checked,false);assert.equal(x.get('profile-fields').disabled,false);count++;
x.get('displayName').value=' Smith Family ';x.get('profile-consent').checked=true;x.submit();await tick();assert.match(x.get('profile-error').textContent,/at least one/);count++;
x.dom.window.document.querySelector('[name=philosophies][value=montessori]').checked=true;x.submit();await tick();assert.match(x.get('member-status').textContent,/Saved/);assert.equal(x.get('displayName').value,'Smith Family');assert.equal(x.get('family-discovery').hidden,false);assert.match(x.get('families-status').textContent,/first families/);count++;
x.get('show-profile').click();x.service.save=async()=>{throw {code:'permission-denied'}};x.get('displayName').value='Unsaved Family';x.submit();await tick();assert.equal(x.get('displayName').value,'Unsaved Family');assert.match(x.get('profile-error').textContent,/Nothing has been saved/);count++;
x.service.families=async()=>[{...profile,displayName:'<img src=x onerror=alert(1)>',id:'b',discoverable:undefined}];x.get('show-families').click();await tick();assert.equal(x.get('family-results').querySelectorAll('img').length,0);assert.match(x.get('family-results').textContent,/In common/);count++;
x.get('family-philosophy').value='waldorf';x.get('family-filters').dispatchEvent(new x.dom.window.Event('submit',{cancelable:true}));assert.equal(x.get('family-results').children.length,0);x.get('clear-family-filters').click();assert.equal(x.get('family-results').children.length,1);count++;
x.get('member-delete').click();x.get('profile-delete-no').click();assert.equal(x.get('profile-delete-confirm').hidden,true);count++;
x.get('member-delete').click();x.get('profile-delete-yes').click();await tick();assert.equal(x.get('member-export').disabled,true);assert.equal(x.get('family-results').children.length,0);count++;
let release;const y=await setup(()=>new Promise(r=>release=r));await y.sign(user);await y.sign(null);release({data:profile,version:'1'});await tick();assert.equal(y.get('member-content').hidden,true);assert.equal(y.get('displayName').value,'');count++;
const z=await setup(async()=>({data:profile,version:'v1'}));let discover;z.service.families=()=>new Promise(r=>discover=r);await z.sign(user);await z.sign(null);discover([{...profile,id:'b'}]);await tick();assert.equal(z.get('family-results').children.length,0);count++;
const m=x.dom.window.matchFamilies([{...profile,displayName:'Nature Family',philosophies:['nature-based']},{...profile,displayName:'Shared Family'}],profile);assert.equal(m[0].displayName,'Shared Family');count++;
for(const t of [x,y,z])t.dom.window.close();console.log(count+' family UI scenarios passed; mocked accounts only.');
})().catch(e=>{console.error(e);process.exit(1)});
