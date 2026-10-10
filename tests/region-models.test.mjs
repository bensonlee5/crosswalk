import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import ts from 'typescript';
import * as T from 'three';
import {SVGRenderer} from 'three/addons/renderers/SVGRenderer.js';
const here=fileURLToPath(new URL('.',import.meta.url));
const inCheckout=fs.existsSync(resolve(here,'../app/region-models.ts'));
const root=(inCheckout?resolve(here,'..'):process.env.CROSSWALK_ROOT||resolve(here,'../crosswalk'))+'/';
const sourceFile=inCheckout?root+'app/region-models.ts':here+'region-models.ts';
const worldFile=inCheckout?root+'lib/world-life.ts':here+'world-life.ts';
const output=inCheckout?fs.mkdtempSync(join(tmpdir(),'crosswalk-regional-scenes-'))+'/':here+'previews/';fs.mkdirSync(output,{recursive:true});
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;');
class Element {constructor(tag){this.tag=tag;this.attributes={};this.childNodes=[];this.style={};}setAttribute(k,v){this.attributes[k]=v;}appendChild(node){this.childNodes.push(node);node.parentNode=this;}removeChild(node){this.childNodes.splice(this.childNodes.indexOf(node),1);}get outerHTML(){return`<${this.tag} ${Object.entries(this.attributes).map(([k,v])=>`${k}="${esc(v)}"`).join(' ')}>${this.childNodes.map(n=>n.outerHTML).join('')}</${this.tag}>`;}}
let drawnText=[];const noop=()=>{};const context=new Proxy({fillText:text=>drawnText.push(text)},{get:(o,k)=>o[k]??noop,set:()=>true});
globalThis.document={createElementNS:(_,tag)=>new Element(tag),createElement:()=>({width:0,height:0,getContext:()=>context})};
const asModule=src=>'data:text/javascript;base64,'+Buffer.from(ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ESNext}}).outputText).toString('base64');
const worldURL=asModule(fs.readFileSync(worldFile,'utf8').replaceAll(/'\.\/([^']+\.ts)'/g,(_,name)=>JSON.stringify('file://'+root+'lib/'+name)));
let src=fs.readFileSync(sourceFile,'utf8').replace("'./region-layouts'",JSON.stringify('file://'+root+'app/region-layouts.ts')).replace("'./region-paint'",JSON.stringify('file://'+root+'app/region-paint.ts')).replace("'three'",JSON.stringify('file://'+root+'node_modules/three/build/three.module.js')).replace("'three/addons/utils/BufferGeometryUtils.js'",JSON.stringify('file://'+root+'node_modules/three/examples/jsm/utils/BufferGeometryUtils.js')).replace("'@/lib/locations'",JSON.stringify('file://'+root+'lib/locations.ts')).replace("'@/lib/world-life'",JSON.stringify(worldURL));
const {buildRegionTown}=await import(asModule(src));
const {locations}=await import('file://'+root+'lib/locations.ts');
const {regionDefinitions}=await import(worldURL);
const ids=locations.map(l=>l.place),stats=[];const snapshots=[];
for(const region of Object.keys(regionDefinitions)){
 const scene=new T.Scene();scene.background=new T.Color(regionDefinitions[region].palette.sky);const existing=new T.Group();scene.add(existing);
 scene.add(new T.AmbientLight(0xfff2dd,.5));scene.add(new T.HemisphereLight(0xfff3d9,0x657469,.8));const sun=new T.DirectionalLight(0xffe2b8,.85);sun.position.set(-12,34,17);scene.add(sun);
 const baseline=scene.children.length;drawnText=[];const town=buildRegionTown(scene,region,ids,[],true);
 assert.equal(town.spots.length,15);assert.deepEqual(town.spots.map(s=>s.place),ids);assert.equal(scene.children.length,baseline+1);assert.ok(town.group.userData.stats.triangles<50000);assert.equal(drawnText.length,15);assert.equal(town.group.userData.population,region==='alder'||region==='embermesa'?8:14);
 for(const s of town.spots){assert.ok(s.hit.visible);assert.equal(s.name,regionDefinitions[region].placeNames[s.place]);assert.ok(Number.isFinite(s.door.x));assert.ok(s.group.visible);}
 // All visible venue hit areas are actually raycastable, including after the world matrix update.
 scene.updateMatrixWorld(true);for(const s of town.spots){const origin=s.hit.getWorldPosition(new T.Vector3()).add(new T.Vector3(0,100,0)),ray=new T.Raycaster(origin,new T.Vector3(0,-1,0));assert.ok(ray.intersectObject(s.hit,false).length>0,s.place+' should be selectable');}
 // Weather changes do not accidentally restore missing venues or move the ground anchors.
 const doors=town.spots.map(s=>s.door.toArray());town.setWeather({season:'winter',type:'snow'});town.setWeather({season:'summer',type:'rain'});town.setWeather(null);assert.deepEqual(town.spots.map(s=>s.door.toArray()),doors);
 const person=town.dynamic.find(x=>x.userData.ambientPerson);const before=person.position.clone();town.animate(2,false);town.animate(3,true);const reduced=person.position.clone();town.animate(5,true);assert.deepEqual(person.position.toArray(),reduced.toArray());assert.ok(before.distanceTo(reduced)<.01);
 scene.traverse(o=>{if(o instanceof T.Sprite)o.visible=false;});
 const camera=new T.PerspectiveCamera(42,1200/850,.1,240);const viewTarget=new T.Vector3(...town.layout.hubs.main);camera.position.copy(viewTarget).add(new T.Vector3(...town.layout.camera.offset));camera.lookAt(viewTarget);camera.updateMatrixWorld();
 const renderer=new SVGRenderer();renderer.setSize(1200,850);renderer.setPrecision(2);const start=performance.now();renderer.render(scene,camera);renderer.domElement.setAttribute('xmlns','http://www.w3.org/2000/svg');
 const raw=renderer.domElement.outerHTML;fs.writeFileSync(output+region+'.svg',raw);snapshots.push({region,raw});stats.push({region,...town.group.userData.stats,population:town.group.userData.population,svgRenderMs:Math.round(performance.now()-start)});
 // Track every resource reachable from the scene; each owned resource must be disposed once.
 const gs=new Set(),ms=new Set(),tsc=new Set();town.group.traverse(o=>{if(o instanceof T.Mesh)gs.add(o.geometry);if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material]){ms.add(m);if(m.map)tsc.add(m.map);}}});let gd=0,md=0,td=0;gs.forEach(g=>g.addEventListener('dispose',()=>gd++));ms.forEach(m=>m.addEventListener('dispose',()=>md++));tsc.forEach(t=>t.addEventListener('dispose',()=>td++));town.dispose();town.dispose();assert.equal(scene.children.length,baseline);assert.ok(scene.children.includes(existing));assert.equal(gd,gs.size,'geometry disposal '+region);assert.equal(md,ms.size,'material disposal '+region);assert.equal(td,tsc.size,'texture disposal '+region);
 // Undiscovered places are empty and anonymous; closed places retain their physical shell only.
 drawnText=[];const partial=buildRegionTown(scene,region,['APARTMENTS','WORK'],['CINEMA'],false);scene.updateMatrixWorld(true);assert.equal(drawnText.length,3);
 for(const s of partial.spots){const known=['APARTMENTS','WORK','CINEMA'].includes(s.place);if(!known){assert.equal(s.name,'');assert.equal(s.group.visible,false);assert.equal(s.prop.children.length,0);assert.equal(s.group.children.filter(o=>o.name==='regional-architecture').length,0);}if(!known||s.place==='CINEMA'){assert.equal(s.hit.visible,false);const ray=new T.Raycaster(s.hit.getWorldPosition(new T.Vector3()).add(new T.Vector3(0,100,0)),new T.Vector3(0,-1,0));assert.equal(ray.intersectObject(s.hit,false).length,0);assert.equal(s.prop.children.length,0);}}
 assert.ok(partial.group.userData.stats.triangles<50000);const shut=partial.spots.find(s=>s.place==='CINEMA');assert.equal(shut.group.visible,true);assert.ok(shut.group.getObjectByName('regional-architecture'));assert.equal(shut.group.userData.closed,true);partial.dispose();assert.equal(scene.children.length,baseline);
 const full=buildRegionTown(scene,region,ids,[],false);assert.ok(full.group.userData.stats.triangles<50000);let paintBytes=0;const pigmentGeometries=new Set();full.group.traverse(o=>{if(o.isMesh&&!pigmentGeometries.has(o.geometry)){pigmentGeometries.add(o.geometry);paintBytes+=o.geometry.attributes.color?.array.byteLength||0;}});assert.ok(paintBytes<2*1024*1024,'Pigment stays under 2 MiB per loaded region');stats.at(-1).paintVertexBytes=paintBytes;stats.at(-1).fullQualityTriangles=full.group.userData.stats.triangles;full.dispose();
 // The optional sixth argument turns retained return-history into actual construction.
 const uses=['food','repair','reading','garden','market','learning','social'],conversionCounts=[];
 for(const [index,use] of uses.entries()){
  const changedName=`Return ${index+1} ${use} co-op`,venue={place:'WORK',name:changedName,description:'A community-led new use',state:'repurposed',use,changedOnReturn:index+1};
  const evolution=Object.freeze({revision:index+1,visit:index+2,placeNames:Object.freeze({WORK:changedName}),venueStates:Object.freeze({WORK:Object.freeze(venue)})});
  drawnText=[];const evolved=buildRegionTown(scene,region,ids,[],true,evolution),work=evolved.spots.find(s=>s.place==='WORK');
  assert.equal(work.name,changedName);assert.ok(drawnText.includes(changedName));assert.equal(work.group.userData.venueUse,use);assert.equal(evolved.group.userData.localeRevision,index+1);assert.equal(evolved.group.userData.visitCount,index+2);assert.equal(evolved.group.userData.stats.evolvedVenues,1);
  assert.deepEqual(evolved.spots.map(s=>s.door.toArray()),doors);assert.ok(evolved.group.userData.stats.triangles>stats.at(-1).triangles);conversionCounts.push(evolved.group.userData.stats.triangles);evolved.dispose();
 }
 assert.ok(new Set(conversionCounts).size>=6,'Distinct conversion uses have distinct structural geometry');
 const allStates=Object.fromEntries(ids.map((place,index)=>[place,{place,name:`Evolved ${place}`,description:'Retained new use',state:'repurposed',use:uses[index%uses.length],changedOnReturn:index+1}]));
 const localCast=Array.from({length:7},(_,i)=>({id:'budget-'+i,name:'Local resident '+i,spot:ids[i]}));const fullyEvolved=buildRegionTown(scene,region,ids,[],false,{revision:15,venueStates:allStates,actors:localCast});assert.equal(fullyEvolved.group.userData.stats.evolvedVenues,15);assert.ok(fullyEvolved.group.userData.stats.triangles<50000,region+' evolved + seven actors: '+fullyEvolved.group.userData.stats.triangles);assert.ok(fullyEvolved.group.userData.stats.paintVertexBytes<2*1024*1024);assert.equal(fullyEvolved.group.userData.stats.paintTextureBytes,0);stats.at(-1).fullyEvolvedTriangles=fullyEvolved.group.userData.stats.triangles;fullyEvolved.dispose();
 drawnText=[];const privateEvolution=buildRegionTown(scene,region,['APARTMENTS'],['CINEMA'],false,{revision:2,venueStates:allStates,placeNames:Object.fromEntries(ids.map(place=>[place,'Secret '+place]))});
 assert.equal(privateEvolution.spots.find(s=>s.place==='WORK').name,'');assert.ok(!drawnText.includes('Secret WORK'));assert.equal(privateEvolution.spots.find(s=>s.place==='CINEMA').group.userData.venueUse,undefined);assert.equal(privateEvolution.group.userData.stats.evolvedVenues,1);privateEvolution.dispose();
 if(region==='embermesa'){
  const changedStates=Object.fromEntries([['WORK','repair'],['CORNER CAFÉ','food'],['COMMUNITY','social']].map(([place,use],index)=>[place,{place,name:`New ${use} co-op`,description:'A retained return change',state:'repurposed',use,changedOnReturn:index+1}]));
  const returned=buildRegionTown(scene,region,ids,[],true,{revision:3,visit:4,venueStates:changedStates});scene.traverse(o=>{if(o instanceof T.Sprite)o.visible=false;});renderer.render(scene,camera);renderer.domElement.setAttribute('xmlns','http://www.w3.org/2000/svg');fs.writeFileSync(output+'embermesa-return.svg',renderer.domElement.outerHTML);returned.dispose();
 }
 // Empty discovery state never exposes venue text or accidentally adds residents.
 drawnText=[];const empty=buildRegionTown(scene,region,[],[],true);assert.equal(drawnText.length,0);assert.equal(empty.group.userData.population,0);empty.dispose();
}
assert.equal(new Set(stats.map(s=>s.triangles)).size,5,'Every region has different real geometry');
const panelW=1200,panelH=920;const composite=`<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="2760" viewBox="0 0 2400 2760"><rect width="2400" height="2760" fill="#e9e4d6"/>${snapshots.map(({region,raw},i)=>{const x=i%2*panelW,y=Math.floor(i/2)*panelH,body=raw.replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'');return`<defs><clipPath id="panel${i}"><rect x="${x}" y="${y}" width="1200" height="850"/></clipPath></defs><g clip-path="url(#panel${i})"><g transform="translate(${x+600} ${y+455})"><rect x="-600" y="-425" width="1200" height="850" fill="${regionDefinitions[region].palette.sky}"/>${body}</g></g><text x="${x+35}" y="${y+905}" font-size="32" font-family="sans-serif" fill="#29473e">${regionDefinitions[region].name}</text>`;}).join('')}</svg>`;
fs.writeFileSync(output+'regions-composite.svg',composite);fs.writeFileSync(output+'stats.json',JSON.stringify(stats,null,2));
console.log(JSON.stringify(stats,null,2));console.log('PASS: all 5 regions; stable 15 place IDs with regional anchors; 8/14 residents; no hidden or closed raycasts; no hidden names or buildings; seasonal updates; reduced motion; seven physical conversions; evolved labels; no evolution leaks; <50k triangles including 15 conversions; idempotent complete disposal; SVG previews.');

console.log('Previews: '+output);
