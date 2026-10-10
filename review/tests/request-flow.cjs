const fs = require('node:fs');
const assert = require('node:assert/strict');
const { JSDOM, VirtualConsole } = require('jsdom');
const html = fs.readFileSync(process.argv[2] || require('node:path').join(__dirname, '../movement.html'), 'utf8');
const errors = [];
const console = new VirtualConsole();
console.on('jsdomError', e => errors.push(e.message));
const dom = new JSDOM(html, {runScripts:'dangerously', url:'https://example.invalid/review/movement.html', virtualConsole:console, beforeParse(w){
  // jsdom does not implement native dialog behavior; these adapters only allow
  // exercising the application's listeners, not testing focus trapping or layout.
  w.HTMLDialogElement.prototype.showModal = function(){this.open=true;};
  w.HTMLDialogElement.prototype.close = function(){this.open=false; this.dispatchEvent(new w.Event('close'));};
}});
const d = dom.window.document;
const get = id => d.getElementById(id);
const click = s => d.querySelector(s).click();
const submit = () => get('request-form').dispatchEvent(new dom.window.Event('submit', {bubbles:true,cancelable:true}));
const results=[];
function check(name, fn){try{fn(); results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',reason:e.message});}}
const close=()=>click('.close');
check('initial workspace button shows a label and an actual SVG, not SVG source',()=>{
  assert.equal(get('workspace-action').textContent.trim(),'Explore joining a group');
  assert.equal(get('workspace-action').querySelectorAll('svg').length,1);
});
check('all workspace tabs retain clean labels and exactly one decorative icon',()=>{
  for(const key of ['community','learning','continuity','contribution','community']){
    click(`[data-workspace="${key}"]`);
    assert.equal(get('workspace-action').querySelectorAll('svg[aria-hidden="true"]').length,1,key);
    for(const button of d.querySelectorAll('button'))assert(!/<svg|<path|viewBox=/.test(button.textContent),key+' contains literal SVG');
  }
});
check('workspace requests preserve the selected topic',()=>{
  const topics={community:'Community plans',learning:'Learning approach',continuity:'Learning continuity',contribution:'Contribution access'};
  for(const [key,topic] of Object.entries(topics)){
    click(`[data-workspace="${key}"]`); click('#workspace-action');
    assert.equal(get('topic').value,topic,key);
    assert.equal(get('commitment-fields').hidden,key!=='contribution'); close();
  }
});
check('role requests use relevant defaults and retain the adult path',()=>{
  for(const [role,topic] of Object.entries({family:'Community plans',educator:'Educator involvement',supporter:'Venue partnerships'})){
    click(`[data-role="${role}"]`); click('[data-request="interest"]');
    assert.equal(get('topic').value,topic); get('email').value='sample@example.com'; submit();
    assert.match(get('result-text').textContent,new RegExp('Path: '+role)); close();
  }
});
check('incomplete and whitespace-only contributions do not produce a draft',()=>{
  click('[data-request="contribute"]'); get('email').value='sample@example.com'; submit();
  assert.equal(get('result').hidden,true);
  get('note').value='   '; get('availability').value='   '; get('rules').checked=true; submit();
  assert.equal(get('result').hidden,true); close();
});
check('valid contribution retains edited topic and separates optional updates',()=>{
  click('[data-request="contribute"]'); get('email').value='sample@example.com';
  get('note').value='Review one guide'; get('availability').value='One hour'; get('rules').checked=true;
  get('topic').value='Learning approach'; submit();
  assert.equal(get('result').hidden,false); assert.match(get('result-text').textContent,/Topic: Learning approach/);
  assert.match(get('result-text').textContent,/Separate update preference: not requested/);
  click('#edit-request'); assert.equal(get('note').value,'Review one guide'); get('updates').checked=true; submit();
  assert.match(get('result-text').textContent,/Separate update preference: requested/); close();
});
check('closing restores trigger focus and clears the next request',()=>{
  click('[data-request="read"]'); assert.equal(get('email').value,'');
  assert.equal(get('updates').checked,false); assert.equal(get('note').required,false);
  get('email').value='sample@example.com'; close();
  assert.equal(d.activeElement,d.querySelector('[data-request="read"]'));
  click('[data-request="read"]'); assert.equal(get('email').value,''); close();
});
check('untrusted draft text renders as text, never markup',()=>{
  click('[data-request="read"]'); get('email').value='sample@example.com';
  get('note').value='<img src=x onerror="alert(1)">'; submit();
  assert.equal(get('result-text').querySelector('img'),null);
  assert.match(get('result-text').textContent,/<img/); close();
});
check('menu, learning ideas and workspace pressed states still update',()=>{
  click('.menu-toggle'); assert.equal(d.querySelector('.menu-toggle').getAttribute('aria-expanded'),'true');
  click('#navigation a'); assert.equal(d.querySelector('.menu-toggle').getAttribute('aria-expanded'),'false');
  click('[data-activity="music"]'); assert.match(get('activity-title').textContent,/Find a rhythm/);
  assert.equal(d.querySelectorAll('[data-activity][aria-pressed="true"]').length,1);
  assert.equal(d.querySelectorAll('[data-workspace][aria-pressed="true"]').length,1);
});
check('no application runtime errors or external scripts',()=>{
  assert.deepEqual(errors,[]); assert.equal(d.querySelectorAll('script[src]').length,0);
  assert.equal(dom.window.localStorage.length,0); assert.equal(dom.window.sessionStorage.length,0);
});
process.stdout.write(JSON.stringify({environment:'jsdom; native dialog adapted; no browser rendering',results},null,2)+'\n');
dom.window.close();
process.exitCode=results.some(x=>x.status==='FAIL')?1:0;
