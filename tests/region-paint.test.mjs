import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import * as T from 'three';
import {coldPaintWeather,snowPaintWeather,createRegionPaintMaterial,paintRegionGeometry,regionPaintId,regionPaintStyles,setRegionPaintQuality} from '../app/region-paint.ts';

const regions=Object.keys(regionPaintStyles);
test('five authored material styles use unique shader programs and no new textures',()=>{
 const keys=[];
 for(const region of regions){
  const style=regionPaintStyles[region],m=createRegionPaintMaterial(region,style.palette.wall,'solid',false);
  assert.equal(m.userData.paintStyle,style.name);assert.equal(m.map,null);assert.equal(m.bumpMap,null);assert.equal(m.normalMap,null);assert.ok(m.roughness>=.85);assert.equal(m.metalness,0);
  const shader={vertexShader:T.ShaderLib.standard.vertexShader,fragmentShader:T.ShaderLib.standard.fragmentShader,defines:{},uniforms:{}};
  m.onBeforeCompile(shader,null);assert.equal(shader.defines.CROSSWALK_PAINT_STYLE,style.index);assert.match(shader.vertexShader,/vCrosswalkPaintPosition = \(modelMatrix/);assert.match(shader.fragmentShader,/fwidth\(paintQ/);assert.doesNotMatch(shader.fragmentShader,/uniform float time/);assert.equal(shader.uniforms.crosswalkPaintDetail.value,1);
  const version=m.version;setRegionPaintQuality([m],true);assert.equal(shader.uniforms.crosswalkPaintDetail.value,0);assert.equal(m.version,version,'low quality is a uniform update, not a shader/resource rebuild');setRegionPaintQuality([m],false);assert.equal(shader.uniforms.crosswalkPaintDetail.value,1);keys.push(m.customProgramCacheKey());m.dispose();
 }
 assert.equal(new Set(keys).size,5);
 assert.equal(regionPaintId('glass'),'glasssteppe');assert.equal(regionPaintId('unknown'),'alder');
});
test('software fallback and protected people, labels, windows and snow skip procedural pigment',()=>{
 for(const region of regions)for(const role of ['solid','figure','window','snow'])for(const compatibility of [false,true]){
  const m=createRegionPaintMaterial(region,0x987653,role,compatibility),shader={vertexShader:'original vertex',fragmentShader:'original fragment',defines:{},uniforms:{}};
  if(compatibility||role!=='solid'){m.onBeforeCompile(shader,null);assert.equal(shader.fragmentShader,'original fragment');assert.equal(m.color.getHex(),0x987653);assert.equal(m.userData.paintDetail,undefined);}m.dispose();
 }
});
test('fallback face pigment keeps every vertex, normal and pick silhouette unchanged',()=>{
 for(const region of regions){
  const geometry=new T.BoxGeometry(6,4,5).toNonIndexed(),before=geometry.attributes.position.array.slice(),normals=geometry.attributes.normal.array.slice();
  paintRegionGeometry(geometry,region,new T.Matrix4().makeTranslation(12,1,-19));
  assert.deepEqual(geometry.attributes.position.array,before);assert.deepEqual(geometry.attributes.normal.array,normals);assert.equal(geometry.attributes.color.count,geometry.attributes.position.count);assert.ok(geometry.attributes.color.array.every(x=>Number.isFinite(x)&&x>=.7&&x<=1.25));
  const colors=geometry.attributes.color.array.slice();paintRegionGeometry(geometry,region,new T.Matrix4().makeTranslation(12,1,-19));assert.deepEqual(geometry.attributes.color.array,colors,'no random shimmer after rebuild');geometry.dispose();
 }
});
test('minimalist Saffron and dusk Ember remain distinct from preserved geometric Glasssteppe',()=>{
 assert.equal(regionPaintStyles.saffron.name,'Minimalist gouache');assert.ok(regionPaintStyles.saffron.faceVariation<.03);assert.equal(regionPaintStyles.glasssteppe.name,'Geometric modernist oil');assert.ok(regionPaintStyles.glasssteppe.faceVariation>.1);
 const dusk=regionPaintStyles.embermesa.light;assert.ok(dusk.sunIntensity<regionPaintStyles.alder.light.sunIntensity);assert.ok(dusk.fillIntensity>=1.8,'dusk retains readable fill light');
 const path=new T.Color(regionPaintStyles.embermesa.palette.path),ground=new T.Color(regionPaintStyles.embermesa.palette.ground);assert.ok(path.r>ground.r&&path.g>ground.g&&path.b>ground.b);
 const engine=fs.readFileSync(new URL('../app/game-engine.ts',import.meta.url),'utf8');assert.match(engine,/parent.dataset.paintStyle=art.medium/);assert.match(engine,/illustrated-isometric/);assert.doesNotMatch(engine,/WebGLRenderer|OrbitControls/);
 const town=fs.readFileSync(new URL('../app/region-models.ts',import.meta.url),'utf8');assert.match(town,/region==='embermesa'\?\.68/);assert.match(town,/m.roughness=m.userData.baseRoughness/);
});

test('climate-aware paint keeps warm winters snow-free and legacy winter behavior unchanged',()=>{
 for(const temperature of ['warm','hot','mild']){assert.equal(snowPaintWeather({season:'winter',type:'rain',temperature}),false);assert.equal(coldPaintWeather({season:'winter',temperature}),false);}
 assert.equal(coldPaintWeather({season:'spring',temperature:'cool'}),true);assert.equal(snowPaintWeather({season:'spring',temperature:'cool'}),false);
 assert.equal(snowPaintWeather({season:'winter',type:'clear',temperature:'cold',moisture:'dry',region:'embermesa'}),false,'cold arid desert night stays snow-free');assert.equal(snowPaintWeather({season:'winter',type:'rain',temperature:'warm',region:'pelagia'}),false);assert.equal(snowPaintWeather({season:'winter',type:'snow',temperature:'cold',region:'glasssteppe'}),true);assert.equal(snowPaintWeather({season:'spring',type:'snow',temperature:'cool'}),true);
 assert.equal(snowPaintWeather({season:'winter',type:'rain'}),true);assert.equal(coldPaintWeather({season:'winter'}),true);assert.equal(snowPaintWeather(null),false);
});
