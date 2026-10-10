/** DOM-fixture execution of the exact shipped search script; no browser or server. */
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const content=JSON.parse(readFileSync(resolve(root,'docs/guide-content.json'),'utf8'));
const rosterCount=content.characters.length;
assert.equal(rosterCount,JSON.parse(readFileSync(resolve(root,'docs/guide-approved-roster.json'),'utf8')).length);
const decode=s=>s.replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
const shipped=readFileSync(resolve(root,'public/manual/characters/index.html'),'utf8');
const source=readFileSync(resolve(root,'public/manual/assets/site.js'),'utf8');
const listeners=new Map();
function element(extra={}){return{hidden:false,value:'',disabled:false,textContent:'',handlers:{},addEventListener(type,handler){this.handlers[type]=handler},focus(){this.focused=true},...extra};}
const cards=[...shipped.matchAll(/<article class="person-card" id="person-([^"]+)" data-person-card data-region="([^"]+)" data-search="([^"]+)"/g)].map(m=>element({id:m[1],dataset:{region:m[2],search:decode(m[3])}}));
assert.equal(cards.length,rosterCount);
const regions=[...new Set(cards.map(c=>c.dataset.region))];
const groups=regions.map(r=>element({querySelectorAll(){return cards.filter(c=>c.dataset.region===r)}}));
const jumps=regions.map(r=>element({dataset:{jumpRegion:r}}));
const form=element(),search=element(),reset=element(),status=element(),empty=element();
const select=element({options:[{value:'',text:'Every region'},...regions.map(r=>({value:r,text:r}))]});
Object.defineProperty(select,'selectedIndex',{get(){return this.options.findIndex(o=>o.value===this.value)}});
const document={querySelector(s){assert.equal(s,'[data-character-search]');return form},getElementById(id){return{'character-search':search,'character-region':select,'reset-search':reset,'search-status':status,'no-results':empty}[id]},querySelectorAll(s){return{'[data-person-card]':cards,'[data-cast-region]':groups,'[data-jump-region]':jumps}[s]}};
let url=new URL('https://bensonlee5.github.io/crosswalk/manual/characters/');
const window={get location(){return{href:url.href,search:url.search}},history:{replaceState(a,b,path){url=new URL(path,url)}},addEventListener(type,handler){listeners.set(type,handler)}};
vm.runInNewContext(source,{document,window,URL,URLSearchParams,console});
const visible=()=>cards.filter(c=>!c.hidden).map(c=>c.id);
const folded=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’‘]/g,"'");
let cases=0;
function check(query,region=''){
 search.value=query;select.value=region;search.handlers.input();
 const tokens=folded(query.trim()).split(/\s+/).filter(Boolean);
 const expected=cards.filter(c=>(!region||c.dataset.region===region)&&tokens.every(t=>folded(c.dataset.search).includes(t))).map(c=>c.id);
 assert.deepEqual(visible(),expected,`${query} / ${region}`);
 assert.equal(empty.hidden,expected.length!==0);
 assert.equal(status.textContent.startsWith(`${expected.length} of ${rosterCount} characters`),true);
 groups.forEach((g,i)=>assert.equal(g.hidden,!cards.some(c=>c.dataset.region===regions[i]&&!c.hidden)));
 assert.equal(url.searchParams.get('q'),query.trim()||null);assert.equal(url.searchParams.get('region'),region||null);
 cases++;
}
assert.equal(visible().length,rosterCount);
for(let repeat=0;repeat<3;repeat++){
 for(const region of ['',...regions])for(const query of ['','Asha','Eli','family','garden','café','cafe','Age 999','Bea Kit','railway','Neri','Chinese','Japanese','Korean','Mei Chen','Jian Wu','Hana Mori','Yuna Park','migration','not-a-real-name'])check(query,region);
 for(const p of content.characters)check(p.name,p.region);
 reset.handlers.click();assert.equal(visible().length,rosterCount);assert.equal(reset.disabled,true);assert.equal(search.focused,true);
 check('nobody','alder');jumps[2].handlers.click();assert.equal(visible().length,rosterCount);assert.equal(url.search,'');
 // Simulate restored URLs on a bfcache pageshow and on a normal popstate.
 url=new URL('https://bensonlee5.github.io/crosswalk/manual/characters/?q=garden&region=alder#people-alder');listeners.get('pageshow')();
 const saved=visible();assert(saved.length>0&&saved.length<rosterCount);assert.equal(search.value,'garden');assert.equal(select.value,'alder');
 check('Neri','traveler');url=new URL('https://bensonlee5.github.io/crosswalk/manual/characters/?q=garden&region=alder#people-alder');listeners.get('popstate')();assert.deepEqual(visible(),saved);
}
url=new URL('https://bensonlee5.github.io/crosswalk/manual/characters/?region=bogus');listeners.get('pageshow')();assert.equal(select.value,'');assert.equal(visible().length,rosterCount);
let prevented=false;form.handlers.submit({preventDefault(){prevented=true}});assert(prevented);
assert(!/(fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|supabase|eval\s*\(|innerHTML\s*=)/i.test(source));
vm.runInNewContext(source,{document:{querySelector(){return null}}});
console.log(`PASS: ${cases} repeated search/region cases; reset and region jumps; page-show/back URL restoration; unknown-region fallback; non-directory pages; no network or persistent storage.`);
