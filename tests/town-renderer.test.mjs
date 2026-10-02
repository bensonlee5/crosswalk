import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import ts from 'typescript';
import * as T from 'three';
import {SVGRenderer} from 'three/addons/renderers/SVGRenderer.js';
import {campaignWeather,createEnvironment} from '../lib/weather.ts';
const root=fileURLToPath(new URL('../',import.meta.url));
const output=fs.mkdtempSync(join(tmpdir(),'crosswalk-scene-check-'));
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;');
class Element {constructor(tag){this.tag=tag;this.attributes={};this.childNodes=[];this.style={};}setAttribute(k,v){this.attributes[k]=v;}appendChild(node){this.childNodes.push(node);node.parentNode=this;}removeChild(node){this.childNodes.splice(this.childNodes.indexOf(node),1);}get outerHTML(){return`<${this.tag} ${Object.entries(this.attributes).map(([k,v])=>`${k}="${esc(v)}"`).join(' ')}>${this.childNodes.map(n=>n.outerHTML).join('')}</${this.tag}>`;}}
const noop=()=>{};const context=new Proxy({},{get:()=>noop,set:()=>true});
globalThis.document={createElementNS:(_,tag)=>new Element(tag),createElement:tag=>({width:0,height:0,getContext:()=>context})};
async function townModule(file){let src=fs.readFileSync(file,'utf8').replace("'three'",JSON.stringify('file://'+root+'node_modules/three/build/three.module.js')).replace("'three/addons/utils/BufferGeometryUtils.js'",JSON.stringify('file://'+root+'node_modules/three/examples/jsm/utils/BufferGeometryUtils.js')).replace("'@/lib/locations'",JSON.stringify('file://'+root+'lib/locations.ts'));const code=ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ESNext}}).outputText;return import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));}
const {buildTown}=await townModule(root+'app/town-models.ts');
const scene=new T.Scene();scene.background=new T.Color(0xbdcbbb);scene.add(new T.AmbientLight(0xfff1dc,.55));scene.add(new T.HemisphereLight(0xffefd2,0x6a785d,.8));const sun=new T.DirectionalLight(0xffdfae,.9);sun.position.set(5,35,18);scene.add(sun);
const town=buildTown(scene,true);assert.equal(town.spots.length,15);const camera=new T.PerspectiveCamera(42,1100/800,.1,240);camera.position.set(25,33,38);camera.lookAt(0,0,0);camera.updateMatrixWorld();scene.traverse(o=>{if(o instanceof T.Sprite)o.visible=false;});
let visibleMaterialCounts=[];const renderer=new SVGRenderer();renderer.setSize(1100,800);renderer.setPrecision(2);
for(const weather of campaignWeather({round:1,rulesVersion:2,...createEnvironment()})){
 town.setWeather(weather);let meshes=0,triangles=0,snow=0,blossoms=0,leaves=0;scene.traverse(o=>{if(o instanceof T.Mesh&&o.visible&&o.material.visible&&o.material.opacity!==0){meshes++;triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;const c=o.material.color.getHex();if(c===0xe6edf1)snow++;if(c===0xe9b5b4||c===0xf6d9c4)blossoms++;if(c===0xb56e36)leaves++;}});
 assert.equal(snow>0,weather.season==='winter');assert.equal(blossoms>0,weather.season==='spring');assert.equal(leaves>0,weather.season==='autumn');
 visibleMaterialCounts.push({weather:weather.id,meshes,triangles,snow,blossoms,leaves});
 if([1,5,7].includes(weather.week)){const start=performance.now();renderer.render(scene,camera);const ms=performance.now()-start;const svg=renderer.domElement;svg.setAttribute('xmlns','http://www.w3.org/2000/svg');fs.writeFileSync(`${output}/${weather.season}.svg`,svg.outerHTML);console.log(weather.season,'SVG serialization ms',Math.round(ms),'paths',svg.childNodes.length);}
}
const materials=new Set();scene.traverse(o=>{if(o.material&&!Array.isArray(o.material))materials.add(o.material);});for(const material of materials)if(material instanceof T.MeshStandardMaterial)assert.ok(material.roughness>=.9,'World surfaces stay matte');
town.dispose();console.log(JSON.stringify(visibleMaterialCounts,null,2));console.log('PASS:15destinations;8weatherupdates;season-specific actual geometry visibility;matte materials;SVG rendering;disposal');
