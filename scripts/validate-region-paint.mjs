// Offline evidence generator. No browser, server, network, or game-state mutations.
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import ts from 'typescript';
import * as T from 'three';
import {regionPaintStyles} from '../app/region-paint.ts';
import {getDFGLUT} from '../node_modules/three/src/renderers/shaders/DFGLUTData.js';
import {locations} from '../lib/locations.ts';
const root=fileURLToPath(new URL('..',import.meta.url));
const out=resolve(process.argv[2]||root+'outputs/region-paint');fs.mkdirSync(out,{recursive:true});
const context=new Proxy({},{get:()=>()=>{},set:()=>true});
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>context})};
let source=fs.readFileSync(root+'app/region-models.ts','utf8');
for(const [name,path] of Object.entries({'three':'node_modules/three/build/three.module.js','three/addons/utils/BufferGeometryUtils.js':'node_modules/three/examples/jsm/utils/BufferGeometryUtils.js','./region-paint':'app/region-paint.ts','./region-layouts':'app/region-layouts.ts','@/lib/locations':'lib/locations.ts','@/lib/world-life':'lib/world-life.ts'}))source=source.replace("'"+name+"'",JSON.stringify('file://'+root+path));
const {buildRegionTown}=await import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ESNext}}).outputText).toString('base64'));
const programs={};
fs.writeFileSync(out+'/dfg-lut.bin',Buffer.from(getDFGLUT().image.data.buffer));
const expand=source=>source.replace(/#include <(\w+)>/g,(_,name)=>expand(T.ShaderChunk[name]));
function prepare(source,shadow=false){source=expand(source).replace(/NUM_[A-Z_]+|UNION_CLIPPING_PLANES/g,k=>({NUM_DIR_LIGHTS:'1',NUM_HEMI_LIGHTS:'1',NUM_DIR_LIGHT_SHADOWS:shadow?'1':'0'})[k]||'0');return source.replace(/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g,(_,a,b,body)=>Array.from({length:Number(b)-Number(a)},(_,n)=>body.replace(/\[\s*i\s*\]/g,'[ '+(n+Number(a))+' ]').replace(/UNROLLED_LOOP_INDEX/g,n+Number(a))).join('\n'));}
function program(material,shadow=false){
 const shader={vertexShader:T.ShaderLib.standard.vertexShader,fragmentShader:T.ShaderLib.standard.fragmentShader,uniforms:{},defines:{}};material.onBeforeCompile(shader,null);
 const key=[shader.defines.CROSSWALK_PAINT_STYLE??'plain',material.vertexColors?'color':'plain',shadow?'shadow-fog':'unshadowed'].join('-');
 if(!programs[key]){
  const shared='#version 300 es\nprecision highp float;\nprecision highp int;\nprecision highp sampler2D;\nprecision highp sampler2DShadow;\n#define HIGH_PRECISION\n#define FLAT_SHADED\n#define HAS_NORMAL\n#define OPAQUE\n'+(shadow?'#define USE_SHADOWMAP\n#define SHADOWMAP_TYPE_BASIC\n#define USE_FOG\n':'')+(material.vertexColors?'#define USE_COLOR\n':'')+Object.entries(shader.defines).map(([k,v])=>`#define ${k} ${v}\n`).join('');
  const vertex=shared+'#define attribute in\n#define varying out\nuniform mat4 modelMatrix;\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat4 viewMatrix;\nuniform mat3 normalMatrix;\nuniform vec3 cameraPosition;\nuniform bool isOrthographic;\nin vec3 position;\nin vec3 normal;\nin vec2 uv;\n'+(material.vertexColors?'in vec3 color;\n':'')+prepare(shader.vertexShader,shadow);
  const fragment=shared+'#define varying in\nlayout(location=0) out highp vec4 pc_fragColor;\n#define gl_FragColor pc_fragColor\n#define texture2D texture\n#define textureCube texture\nuniform mat4 viewMatrix;\nuniform vec3 cameraPosition;\nuniform bool isOrthographic;\n#define TONE_MAPPING\n'+T.ShaderChunk.tonemapping_pars_fragment+'\nvec3 toneMapping(vec3 color){return ACESFilmicToneMapping(color);}\n'+T.ShaderChunk.colorspace_pars_fragment+'\nvec4 linearToOutputTexel(vec4 value){return sRGBTransferOETF(value);}\nfloat luminance(vec3 rgb){return dot(rgb,vec3(0.2126,0.7152,0.0722));}\n'+prepare(shader.fragmentShader,shadow);
  fs.writeFileSync(out+'/'+key+'.vert',vertex);fs.writeFileSync(out+'/'+key+'.frag',fragment);programs[key]={vertex:key+'.vert',fragment:key+'.frag'};
 }
 return {key,strength:shader.uniforms.crosswalkPaintStrength?.value??0};
}
const reports=[];
for(const [region,style] of Object.entries(regionPaintStyles)){
 const scene=new T.Scene(),town=buildRegionTown(scene,region,locations.map(x=>x.place),[],false);scene.updateMatrixWorld(true);
 const camera=new T.PerspectiveCamera(42,1280/850,.1,240);const viewTarget=new T.Vector3(...town.layout.hubs.main);camera.position.copy(viewTarget).add(new T.Vector3(...town.layout.camera.offset));camera.lookAt(viewTarget);camera.updateMatrixWorld();
 const direction=new T.Vector3(style.light.sunSide,style.light.sunHeight,style.light.sunRear).normalize().transformDirection(camera.matrixWorldInverse);
 const hemi=new T.Vector3(0,1,0).transformDirection(camera.matrixWorldInverse);
 const meshes=[];scene.traverseVisible(o=>{if(!o.isMesh||!o.material.isMeshStandardMaterial||!o.material.visible||o.material.opacity===0)return;const m=o.material,g=o.geometry.index?o.geometry.toNonIndexed():o.geometry;
  const matrix=new T.Matrix4().multiplyMatrices(camera.matrixWorldInverse,o.matrixWorld),normal=new T.Matrix3().getNormalMatrix(matrix);
  program(m,true);meshes.push({program:program(m),position:Array.from(g.attributes.position.array),normal:Array.from(g.attributes.normal.array),vertexColor:g.attributes.color?Array.from(g.attributes.color.array):null,matrix:o.matrixWorld.toArray(),modelView:matrix.toArray(),normalMatrix:normal.toArray(),color:m.color.toArray(),emissive:m.emissive.clone().multiplyScalar(m.emissiveIntensity).toArray(),roughness:m.roughness,metalness:m.metalness});if(g!==o.geometry)g.dispose();
 });
 const color=(c,m=1)=>new T.Color(c).multiplyScalar(m).toArray();
 const data={region,name:style.name,settlement:town.group.userData.settlement,stats:town.group.userData.stats,width:1280,height:850,sky:new T.Color(style.light.sky).getHex(),camera:camera.position.toArray(),view:camera.matrixWorldInverse.toArray(),projection:camera.projectionMatrix.toArray(),light:{direction:direction.toArray(),color:color(style.light.sun,style.light.sunIntensity),hemi:hemi.toArray(),sky:color(style.light.fill,style.light.fillIntensity),ground:color(style.light.ground,style.light.fillIntensity)},meshes};
 fs.writeFileSync(out+'/'+region+'.json',JSON.stringify(data));reports.push({region,style:style.name,settlement:town.group.userData.settlement,paintVertexBytes:town.group.userData.stats.paintVertexBytes,meshes:meshes.length,triangles:town.group.userData.stats.triangles});town.dispose();
}
fs.writeFileSync(out+'/programs.json',JSON.stringify(programs,null,2));fs.writeFileSync(out+'/scene-stats.json',JSON.stringify(reports,null,2));console.log(JSON.stringify({out,programs:Object.keys(programs),scenes:reports},null,2));
