const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'../..');
const originalPages=fs.readdirSync(root).filter(n=>n.endsWith('.html')&&!['apply.html','curriculum.html'].includes(n));
for(const name of originalPages){const s=fs.readFileSync(root+'/'+name,'utf8');assert.equal((s.match(/href="css\/community.css"/g)||[]).length,1,name);assert(s.includes('src="js/community-shell.js"'),name);}
const shell=fs.readFileSync(root+'/js/community-shell.js','utf8').replace('export function','function');
for(const page of ['signup','profile','student','matching']){
 const dom=new JSDOM(fs.readFileSync(root+'/'+page+'.html','utf8'),{runScripts:'outside-only',url:'https://example.invalid/'+page+'.html'});dom.window.eval(shell);dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
 assert.equal(dom.window.document.querySelectorAll('.cs-header').length,1,page);const skip=dom.window.document.querySelector('.cs-skip');assert(skip.hidden||dom.window.document.querySelector(skip.getAttribute('href')),page);assert(dom.window.document.body.classList.contains('cs-legacy'));dom.window.close();
}
function luminance(hex){const rgb=hex.match(/\w\w/g).map(c=>parseInt(c,16)/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;}
function contrast(a,b){const [high,low]=[luminance(a),luminance(b)].sort((a,b)=>b-a);return(high+.05)/(low+.05);}
for(const [fg,bg]of [['193c32','f5f2e9'],['59695f','f5f2e9'],['fffdf7','193c32'],['193c32','d8ed89'],['193c32','f6d889']])assert(contrast(fg,bg)>=4.5,fg+' on '+bg);
const css=fs.readFileSync(root+'/css/community.css','utf8');assert(css.includes('>header:not(.cs-header)'));assert(css.includes('prefers-reduced-motion'));assert(css.includes(':focus-visible'));
if(process.env.COMMUNITY_DIST){
 const dist=process.env.COMMUNITY_DIST;
 for(const name of ['index.html','dashboard.html','matching.html','activities.html','pods.html','curriculum.html','apply.html','student.html','account/signup.html','account/login.html','account/profile.html']){
  const d=new JSDOM(fs.readFileSync(dist+'/'+name,'utf8')).window.document;
  for(const el of d.querySelectorAll('[src],[href]')){
   const ref=el.getAttribute('src')||el.getAttribute('href');if(!ref||ref.startsWith('#')||/^(https?:|mailto:|data:)/.test(ref))continue;
   const target=path.resolve(path.dirname(dist+'/'+name),ref.split('#')[0]);assert(fs.existsSync(target),name+' -> '+ref);
  }
  const ids=[...d.querySelectorAll('[id]')].map(el=>el.id);assert.equal(ids.length,new Set(ids).size,name);
 }
}
console.log(originalPages.length+' source pages share the design entry points; navigation, palette contrast and packaged assets checked.');
