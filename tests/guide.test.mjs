import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const page=readFileSync(resolve(root,'public/guide/index.html'),'utf8');
const css=readFileSync(resolve(root,'public/guide/guide.css'),'utf8');
const js=readFileSync(resolve(root,'public/guide/guide.js'),'utf8');
const ids=[...page.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
test('semantic document, viewport, title and readable progressive enhancement',()=>{
 assert.match(page,/<!doctype html>/i);assert.match(page,/<html lang="en">/);assert.match(page,/name="viewport"/);
 assert.equal((page.match(/<option\b/g)||[]).length,7);assert.equal((page.match(/<\/option>/g)||[]).length,7);assert.doesNotMatch(page,/<\/option\s/);
 assert.match(page,/<title>The Crosswalk Field Guide/);assert.match(page,/<main/);assert.match(page,/class="skip"/);
 assert.match(page,/id="cast-count" role="status" aria-live="polite"/);assert.equal(new Set(ids).size,ids.length);
 assert.match(css,/@media\(max-width:700px\)/);assert.match(css,/@media\(max-width:370px\)/);assert.match(css,/prefers-reduced-motion/);
 assert.match(css,/:focus-visible/);assert.doesNotMatch(css,/@import/);assert.equal((css.match(/{/g)||[]).length,(css.match(/}/g)||[]).length);
});
test('all chapter anchors resolve and only verified external destinations are used',()=>{
 for(const [,target] of page.matchAll(/href="#([^"]+)"/g))assert.ok(ids.includes(target),`Missing target ${target}`);
 const urls=[...page.matchAll(/href="(https:[^"]+)"/g)].map(m=>m[1]);
 assert.deepEqual([...new Set(urls)].sort(),['https://crosswalk-life-game.bensonlee5.chatgpt.site','https://github.com/bensonlee5/crosswalk#readme'].sort());
 assert.equal((page.match(/href="\.\.\/"/g)||[]).length,3);
});
test('68 unique spoiler-free profile cards map to canonical portrait files',()=>{
 const cards=[...page.matchAll(/<article class="person" id="person-([^"]+)" data-region="([^"]+)">([\s\S]*?)<\/article>/g)];
 assert.equal(cards.length,68);assert.equal(new Set(cards.map(x=>x[1])).size,68);
 for(const [,id,region,card]of cards){assert.match(card,new RegExp(`character-portraits/${id}\\.webp`));assert.match(card,/alt="[^"]+"/);assert.match(card,/loading="lazy"/);assert.match(card,/<h4>/);assert.ok(['alder','saffron','glasssteppe','pelagia','embermesa','traveler'].includes(region));}
 const profileCopy=cards.map(c=>c[3]).join(' ');
 assert.doesNotMatch(profileCopy,/keepsake|unlock|month [1-8]|deeper recollection|missed promise|chapter [1-8]/i);
 assert.doesNotMatch(page,/character-histories|cast-characters|lifeSeed|historyScene|shareOutcome/);
});
test('current economy and account limitations stay explicit',()=>{
 for(const value of ['$6,000','$1,250','$380','$220','$1,850','$3,072','200-hour','80%','$140','$144','$100','$260'])assert.ok(page.includes(value),value);
 assert.match(page,/Email accounts are currently unavailable/);assert.match(page,/same device, browser profile and site address/);
 assert.match(page,/not a recovery key/);assert.match(page,/do not automatically move to GitHub Pages/);
 assert.match(page,/earlier game formats are unsupported/);
 assert.match(page,/older records are not migrated or deleted/i);
 assert.match(page,/Start a new life/);
 assert.match(page,/Work &amp; learning/);
 assert.match(page,/Entry roles need no earlier job or contact/);
 assert.match(page,/One main contract can sit alongside separately chosen fixed commitments/);
 assert.match(page,/Free Library study and paid Campus courses/);
 assert.match(page,/then separately accept an offer before choosing paid work/);
 assert.doesNotMatch(page,/older saves retain their original|follows your room’s edition/);
});
test('search and place filter handle combined, empty and repeated changes',()=>{
 const people=[{dataset:{region:'alder'},textContent:'Mina Songwriter',hidden:false},{dataset:{region:'pelagia'},textContent:'Esme Archivist',hidden:false}];
 const listeners={};const search={value:'',addEventListener:(e,f)=>listeners.search=f};const region={value:'',addEventListener:(e,f)=>listeners.region=f};
 const count={textContent:''},empty={hidden:true};
 const document={documentElement:{classList:{add(){}}},querySelector:s=>({'#character-search':search,'#character-region':region,'#cast-count':count,'#no-results':empty}[s]),querySelectorAll:s=>s==='.person'?people:[]};
 vm.runInNewContext(js,{document});assert.equal(people.filter(p=>!p.hidden).length,2);
 search.value='  MINA ';listeners.search();assert.equal(people.filter(p=>!p.hidden).length,1);assert.equal(people[0].hidden,false);
 region.value='pelagia';listeners.region();assert.equal(empty.hidden,false);assert.match(count.textContent,/0 of 2/);
 search.value='';listeners.search();assert.equal(empty.hidden,true);assert.equal(people[1].hidden,false);
 region.value='';listeners.region();listeners.region();assert.equal(people.filter(p=>!p.hidden).length,2);
});
test('portrait failure leaves accessible profile copy and visible initial',()=>{
 let onError;const image={complete:true,naturalWidth:0,hidden:false,addEventListener:(e,f)=>{onError=f;}};
 const fields={'#character-search':{value:'',addEventListener(){}},'#character-region':{value:'',addEventListener(){}},'#cast-count':{},'#no-results':{}};
 const document={documentElement:{classList:{add(){}}},querySelector:s=>fields[s],querySelectorAll:s=>s==='.portrait img'?[image]:[]};
 vm.runInNewContext(js,{document});assert.equal(image.hidden,true);image.hidden=false;onError();assert.equal(image.hidden,true);
});
test('all local guide files exist; art can be required at final integration',()=>{
 for(const path of ['./guide.css','./guide.js'])assert.ok(existsSync(resolve(root,'public/guide',path)));
 const artRoot=process.env.GUIDE_ASSETS_ROOT;
 if(artRoot)for(const [,path] of page.matchAll(/(?:src|href)="(\.\.\/[^"#]+)"/g)){
  if(path==='../')continue;
  assert.ok(existsSync(resolve(artRoot,'guide',path.split('?')[0])),`Missing local asset: ${path}`);
 }
});
