const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');
let scripts=0;
for(const file of ['dashboard.html','investor.html','lead_research.html','v_agreement.html']){
 const source=fs.readFileSync(root+'/'+file,'utf8');
 assert(!/__genspark_token|remove_badge\?token=|notice_dialog\.js/.test(source),file+' contains generator credentials/dependency');
 assert(!/[\p{Emoji_Presentation}\uFE0F]/u.test(source),file+' contains emoji');
 assert(source.includes('js/community-shell.js'),file+' lost common shell');
 for(const m of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)){
  if(/\bsrc=|\btype=["']module|application\//.test(m[1]))continue;
  new vm.Script(m[2],{filename:file});scripts++;
 }
}
console.log('PASS four sanitized legacy pages; '+scripts+' retained inline scripts parse; common shell and no-emoji checks passed');
