import fs from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
import ts from 'typescript';
import * as T from 'three';
import {locations} from '../lib/locations.ts';
const root=new URL('..',import.meta.url).pathname;
const context=new Proxy({},{get:()=>()=>{},set:()=>true});
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>context})};
let source=fs.readFileSync(root+'app/region-models.ts','utf8');
for(const [name,path] of Object.entries({'three':'node_modules/three/build/three.module.js','three/addons/utils/BufferGeometryUtils.js':'node_modules/three/examples/jsm/utils/BufferGeometryUtils.js','./region-paint':'app/region-paint.ts','./region-layouts':'app/region-layouts.ts','@/lib/locations':'lib/locations.ts','@/lib/world-life':'lib/world-life.ts'}))source=source.replace("'"+name+"'",JSON.stringify('file://'+root+path));
const {buildRegionTown,regionSettlements}=await import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ESNext}}).outputText).toString('base64'));
const kinds={alder:'urban-port',saffron:'coastal-suburban',glasssteppe:'urban-rail-city',pelagia:'harbor-town-rural-hinterland',embermesa:'dispersed-rural'};
const homes={alder:20,saffron:6,glasssteppe:12,pelagia:4,embermesa:0};
const focusPlaces={alder:'COMMUNITY',saffron:'CINEMA',glasssteppe:'CAMPUS',pelagia:'COMMUNITY',embermesa:'MAKERSPACE'};

test('five settlements have genuinely different scenery density with no extra interactive destinations',()=>{
 for(const region of Object.keys(kinds)){
  const scene=new T.Scene(),town=buildRegionTown(scene,region,locations.map(x=>x.place),[],false);
  assert.equal(town.group.userData.settlement,kinds[region]);assert.equal(town.group.userData.socialFocus,regionSettlements[region].focus);
  const backdrop=town.group.getObjectByName('settlement-backdrop');assert.equal(backdrop.userData.homes,homes[region]);assert.equal(backdrop.userData.decorative,true);
  let backdropMeshes=0;backdrop.traverse(o=>{if(o.isMesh){backdropMeshes++;assert.equal(o.material.map,null);assert.equal(o.userData.place,undefined);}});assert.ok(backdropMeshes<14,'Backdrop stays batched by material');
  assert.equal(town.spots.length,15);let hitTargets=0;town.group.traverse(o=>{if(o.name==='venue-hit')hitTargets++;});assert.equal(hitTargets,15);
  for(const spot of town.spots){
   const site=town.layout.venues[spot.place],expected=new T.Vector3(site.position[0]+Math.sin(site.rotation)*4.65,site.position[1]+.9,site.position[2]+Math.cos(site.rotation)*4.65);
   assert.ok(spot.door.distanceTo(expected)<1e-10,region+' '+spot.place+' authored arrival anchor');
   const shell=spot.group.getObjectByName('settlement-shell');if(!['THE PARK','GARDEN','TRANSIT'].includes(spot.place)){assert.equal(shell.scale.x,site.footprint[0]);assert.equal(shell.scale.z,site.footprint[1]);}
  }
  assert.ok(town.group.userData.stats.triangles<50000);assert.ok(town.group.userData.stats.paintVertexBytes<2*1024*1024);town.dispose();assert.equal(scene.children.length,0);
 }
});
test('local-interest scenery only appears at a matching discovered open civic venue',()=>{
 for(const [region,place] of Object.entries(focusPlaces))for(const state of ['hidden','closed','open']){
  const town=buildRegionTown(new T.Scene(),region,state==='hidden'?[]:[place],state==='closed'?[place]:[],true);
  const cues=[];town.group.traverse(o=>{if(o.name==='local-focus-detail')cues.push(o);});assert.equal(cues.length,state==='open'?1:0,region+' '+state);
  if(cues.length){assert.equal(cues[0].parent.userData.place,place);assert.equal(cues[0].userData.decorative,true);assert.equal(cues[0].parent.name,'venue:'+place);}
  town.dispose();
 }
});
