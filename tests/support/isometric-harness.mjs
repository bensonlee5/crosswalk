/* eslint-disable @typescript-eslint/no-this-alias -- Expose the DOM observer double for disposal assertions. */
import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';import ts from 'typescript';
const modules=new Map();export async function pureModule(file){file=path.resolve(file);if(modules.has(file))return modules.get(file);let source=fs.readFileSync(file,'utf8');for(const match of [...source.matchAll(/from '([^']+)'/g)]){if(!match[1].startsWith('.'))throw Error('Unexpected import '+match[1]);const result=await pureModule(path.resolve(path.dirname(file),match[1]+'.ts'));source=source.replaceAll(`'${match[1]}'`,`'${result}'`);}const url='data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source,{compilerOptions:{target:99,module:99}}).outputText).toString('base64');modules.set(file,url);return url;}
export const S=await import(await pureModule('app/isometric-scene.ts'));
export const L=await import(await pureModule('app/region-layouts.ts'));
export const A=await import(await pureModule('app/isometric-authored.ts'));
class Element{
 constructor(tag){this.tagName=tag;this.attributes={};this.children=[];this.dataset={};this.style={};this.listeners={};this.className='';this.textContent='';this.clientWidth=1000;this.clientHeight=620;this.parentNode=null;this.markup='';this.classList={add:(...ns)=>{for(const n of ns)this.toggleClass(n,true);},remove:(...ns)=>{for(const n of ns)this.toggleClass(n,false);},toggle:(n,on)=>this.toggleClass(n,on),contains:n=>this.classes().includes(n)};}
 classes(){return(this.attributes.class||this.className||'').split(' ').filter(Boolean);}
 toggleClass(n,on){const c=new Set(this.classes());if(on===undefined)on=!c.has(n);if(on)c.add(n);else c.delete(n);this.attributes.class=[...c].join(' ');return on;}
 setAttribute(k,v){this.attributes[k]=String(v);if(k.startsWith('data-'))this.dataset[k.slice(5)]=String(v);}
 getAttribute(k){return this.attributes[k]??null;}
 append(...nodes){for(const n of nodes){n.remove();this.children.push(n);n.parentNode=this;}}
 prepend(...nodes){for(const n of nodes.reverse()){n.remove();this.children.unshift(n);n.parentNode=this;}}
 replaceChildren(...nodes){this.children.forEach(n=>n.parentNode=null);this.children=[];this.append(...nodes);}
 remove(){if(this.parentNode){const at=this.parentNode.children.indexOf(this);if(at>=0)this.parentNode.children.splice(at,1);this.parentNode=null;}}
 querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
 querySelectorAll(selector){const match=n=>selector[0]==='.'?n.classes().includes(selector.slice(1)):selector[0]==='['?Object.entries(n.attributes).some(([k,v])=>selector==='['+k+']'||selector===`[${k}="${v}"]`):n.tagName===selector;return this.children.flatMap(n=>[...(match(n)?[n]:[]),...n.querySelectorAll(selector)]);}
 addEventListener(k,f){this.listeners[k]=f;}removeEventListener(k){delete this.listeners[k];}
 getBoundingClientRect(){return{left:0,top:0,width:this.clientWidth,height:this.clientHeight};}
 setPointerCapture(){}releasePointerCapture(){}animate(){return{cancel(){}};}
 set innerHTML(v){this.markup=v;}get innerHTML(){return this.markup;}
 get outerHTML(){const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;');return`<${this.tagName} style="${Object.entries(this.style).map(([k,v])=>k.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())+':'+v).join(';')}" ${Object.entries(this.attributes).map(([k,v])=>`${k}="${escape(v)}"`).join(' ')}>${this.textContent||''}${this.markup}${this.children.map(n=>n.outerHTML).join('')}</${this.tagName}>`;}
}
export const places=Object.keys(L.regionLayout('alder').venues);
export function room(region='alder'){return{code:'TEST',round:1,players:[{id:'A',name:'Alex',place:'APARTMENTS',housing:0,world:{region,shown:[...places],closedPlacesByRegion:{}}}],turn:0};}
export function harness({reduced=false,width=1000,height=620,failImage=false,deferImages=false,placeName=place=>place}={}){
 let now=1000,frameId=0;const frames=new Map(),events=[],picks=[],doc={hidden:false,listeners:{},createElementNS:(_,tag)=>new Element(tag),createElement:tag=>new Element(tag),addEventListener(k,f){this.listeners[k]=f;},removeEventListener(k){delete this.listeners[k];}},media={matches:reduced,addEventListener(k,f){this[k]=f;},removeEventListener(k){delete this[k];}};const parent=new Element('div');parent.clientWidth=width;parent.clientHeight=height;let ready=0,failures=0,observer;const images=[];
 const sandbox={console,Map,Set,Math,Number,Object,Array,String,document:doc,window:{matchMedia:()=>media},performance:{now:()=>now},Image:class{set src(v){this._src=v;images.push(this);if(!deferImages){if(failImage)this.onerror?.();else this.onload?.();}}},ResizeObserver:class{constructor(f){this.f=f;observer=this;}observe(){}disconnect(){this.disconnected=true;}},requestAnimationFrame:f=>{const id=++frameId;frames.set(id,f);return id;},cancelAnimationFrame:id=>frames.delete(id),exports:{},...S,regionLayout:L.regionLayout,assetUrl:s=>s,locations:places.map((place,i)=>({place,name:place,district:i<7?'main':'west'})),marbleColors:['#e26d38','#3d92d9','#9567d0','#dba51d'],characterVisualIdentity:id=>({ageStage:id==='bea'?'toddler':'adult',role:'Local'}),visiblePlaces:p=>p.world?.shown||places,worldPlaceName:(p,place)=>placeName(place),worldView:p=>({closedPlaces:p.world?.closedPlacesByRegion?.[p.world.region]||[],localeRevision:p.world?.revision||0})};
 let source=fs.readFileSync('app/game-engine.ts','utf8').replace(/^import .*;\n/gm,'').replace('export function createTown','function createTown');source+='\nexports.createTown=createTown;';const code=ts.transpileModule(source,{compilerOptions:{target:99,module:0}}).outputText;vm.runInNewContext(code,sandbox);const engine=sandbox.exports.createTown(parent,(...p)=>picks.push(p),()=>ready++,v=>events.push(v),()=>failures++);
 const tick=(ms=16)=>{now+=ms;const pending=[...frames.values()];frames.clear();pending.forEach(f=>f(now));};
 return{engine,parent,events,picks,doc,media,tick,images,get ready(){return ready;},get failures(){return failures;},get observer(){return observer;},get svg(){return parent.querySelector('svg');},get players(){return parent.querySelectorAll('.iso-player');},get figures(){return parent.querySelectorAll('.iso-person');},dispose:()=>engine.destroy(),event:(name,x,y,id=1)=>parent.querySelector('svg').listeners[name]?.({clientX:x,clientY:y,pointerId:id,button:0})};
}
