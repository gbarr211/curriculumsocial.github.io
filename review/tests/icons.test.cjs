const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');
const {JSDOM}=require('jsdom');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.name.startsWith('.')||e.name==='node_modules'?[]:e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
(async()=>{
 const source=fs.readFileSync(root+'/js/community-icons.js','utf8');
 const {iconCatalog,iconSvg,suggestIcons}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
 assert.equal(iconCatalog.length,26);assert.equal(new Set(iconCatalog.map(i=>i.id)).size,26);
 for(const i of iconCatalog){const d=new JSDOM(iconSvg(i.id)).window.document;assert.equal(d.querySelector('svg').dataset.icon,i.id);assert.equal(d.querySelector('svg').getAttribute('aria-hidden'),'true');assert.equal(d.querySelectorAll('script,[onload],[onclick],image').length,0);assert(d.querySelector('path,circle,ellipse,rect'));}
 for(const [title,id]of [['Beach explorers','waves'],['Music morning','music'],['Garden club','leaf'],['Science lab','flask'],['Reading stories','book'],['Cycling friends','bike'],['Cooking together','utensils'],['','circle']])assert.equal(suggestIcons(title)[0].id,id,title);
 assert.equal(new JSDOM(iconSvg('__proto__')).window.document.querySelector('svg').dataset.icon,'circle');
 const files=['js/community-icons.js','js/community-shell.js','review/community-app.js','review/community-app.html','review/movement.html','css/community.css'].map(f=>root+'/'+f);
 if(process.env.COMMUNITY_DIST)files.push(...walk(process.env.COMMUNITY_DIST).filter(f=>/\.(html|js|css)$/.test(f)));
 // Plain legal copyright/registered marks are text, not decorative emoji.
 for(const file of files){const raw=fs.readFileSync(file,'utf8').replace(/[\u00A9\u00AE]/g,'');assert(!/[\p{Extended_Pictographic}\p{Emoji_Presentation}\uFE0F\u20E3]/u.test(raw),'Emoji or pictographic glyph remains: '+file);}
 if(process.env.COMMUNITY_DIST){for(const file of ['js/community-icons.js','js/community-shell.js','review/community-app.js','css/community.css'])assert.equal(fs.readFileSync(root+'/'+file,'utf8'),fs.readFileSync(process.env.COMMUNITY_DIST+'/'+file,'utf8'),file+' source/package parity');}
 console.log('PASS 26 vector icons, title ranking, safe fallback, '+files.length+' emoji-free source/package files and packaged module parity');
})();
