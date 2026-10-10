import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {locations} from '@/lib/locations';
import type {Weather,Season} from '@/lib/weather';
export type Spot={place:string;name:string;district:string;center:T.Vector3;door:T.Vector3;group:T.Group;hinge:T.Group;prop:T.Group;hit:T.Mesh;phase:number;};
const palette=[0xc58758,0xe5c589,0xe6d8b5,0x64948e,0xc9816a,0xd7b45d,0x71956b,0xc8a36f,0xd89563,0x87aaa4,0x9c9279,0x7376a3,0x80a6a7,0x85a46a,0xa07091];
export function buildTown(scene:T.Scene,compatibility=false){
 const materials=new Map<string,T.MeshStandardMaterial>(),geometries:T.BufferGeometry[]=[],statics:T.Mesh[]=[];const dynamic:T.Object3D[]=[];
 // A small deterministic brush map adds material variation without loading an image atlas.
 const brushCanvas=document.createElement('canvas');brushCanvas.width=brushCanvas.height=256;const brush=brushCanvas.getContext('2d')!;brush.fillStyle='#d9d8cb';brush.fillRect(0,0,256,256);let paintSeed=419;const random=()=>{paintSeed=(Math.imul(paintSeed,1664525)+1013904223)>>>0;return paintSeed/4294967296;};
 for(let i=0;i<1200;i++){const light=174+Math.floor(random()*70);brush.fillStyle=`rgba(${light},${light},${Math.max(0,light-6)},${.08+random()*.16})`;brush.save();brush.translate(random()*256,random()*256);brush.rotate((random()-.5)*.65);brush.fillRect(0,0,5+random()*23,1+random()*4);brush.restore();}
 const brushTexture=new T.CanvasTexture(brushCanvas);brushTexture.wrapS=brushTexture.wrapT=T.RepeatWrapping;brushTexture.repeat.set(2,2);brushTexture.colorSpace=T.SRGBColorSpace;brushTexture.anisotropy=2;
 const stoneCanvas=document.createElement('canvas');stoneCanvas.width=stoneCanvas.height=256;const stone=stoneCanvas.getContext('2d')!;stone.fillStyle='#97978e';stone.fillRect(0,0,256,256);
 for(let row=0;row<16;row++)for(let col=-1;col<9;col++){const x=col*32+(row%2)*16,y=row*16,v=175+Math.floor(random()*44);stone.fillStyle=`rgb(${v},${v},${v-7})`;stone.beginPath();stone.moveTo(x+3,y+2);stone.lineTo(x+29,y+1);stone.lineTo(x+31,y+12);stone.lineTo(x+26,y+15);stone.lineTo(x+2,y+14);stone.closePath();stone.fill();stone.fillStyle='rgba(255,250,226,.18)';stone.fillRect(x+4,y+3,23,2);}
 const stoneTexture=new T.CanvasTexture(stoneCanvas);stoneTexture.wrapS=stoneTexture.wrapT=T.RepeatWrapping;stoneTexture.repeat.set(8,8);stoneTexture.colorSpace=T.SRGBColorSpace;stoneTexture.anisotropy=2;
 const mat=(color:number,roughness=.94,metalness=0)=>{const key=[color,roughness,metalness].join();if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({color,roughness,metalness,map:[0x858a7b,0x798276,0xd6c6a1,0xd8c8a6].includes(color)?stoneTexture:brushTexture,bumpMap:[0x858a7b,0x798276,0xd6c6a1,0xd8c8a6].includes(color)?stoneTexture:brushTexture,bumpScale:.035}));return materials.get(key)!;};
 const seasonal={snow:0xe6edf1,blossom:0xe9b5b4,blossomLight:0xf6d9c4,leafLitter:0xb56e36,puddle:0x789598,lamplight:0xf7dda1};

 const geo=(g:T.BufferGeometry)=>{geometries.push(g);return g;};const boxG=geo(new T.BoxGeometry(1,1,1)),cylG=geo(new T.CylinderGeometry(1,1,1,compatibility?6:10)),coneG=geo(new T.ConeGeometry(1,1,6)),ballG=geo(new T.IcosahedronGeometry(1,compatibility?0:1)),budG=geo(new T.IcosahedronGeometry(1,0));
 function mesh(parent:T.Object3D,g:T.BufferGeometry,color:number,pos:number[],scale:number[],live=false){const m=new T.Mesh(g,mat(color));m.position.set(...pos as [number,number,number]);m.scale.set(...scale as [number,number,number]);m.castShadow=true;m.receiveShadow=true;parent.add(m);if(!live)statics.push(m);return m;}
 const box=(p:T.Object3D,c:number,x:number,y:number,z:number,w:number,h:number,d:number,live=false)=>{const m=Math.max(w,d)>8?mesh(p,geo(new T.BoxGeometry(w,h,d,Math.ceil(w/4),1,Math.ceil(d/4))),c,[x,y,z],[1,1,1],live):mesh(p,boxG,c,[x,y,z],[w,h,d],live);if(p===world&&h<1.5)m.renderOrder=-1000+Math.round(y*100);return m;};
 const cyl=(p:T.Object3D,c:number,x:number,y:number,z:number,r:number,h:number,live=false)=>mesh(p,cylG,c,[x,y,z],[r,h,r],live);
 const ball=(p:T.Object3D,c:number,x:number,y:number,z:number,r:number,live=false)=>mesh(p,[seasonal.snow,seasonal.blossom,seasonal.blossomLight,seasonal.leafLitter].includes(c)?budG:ballG,c,[x,y,z],[r,r,r],live);
 const world=new T.Group();scene.add(world);box(world,0x588c73,26,-.7,0,110,1.2,58);box(world,0x91b480,26,-.08,0,106,.12,54);
 // Real geometry streets, pavements, crossings and connecting avenue.
 box(world,0x858a7b,26,.015,0,110,.12,5);for(const cx of [0,52]){box(world,0xd6c6a1,cx,.1,0,39,.22,33);box(world,0x798276,cx,.23,0,35,.14,29);box(world,0xd8c8a6,cx,.32,0,27,.22,21);box(world,0x9cb782,cx,.44,0,22,.12,16);for(const x of [-16,16])for(let z=-11;z<=11;z+=4)box(world,0xe9dfbf,cx+x,.32,z,.12,.03,1.8);for(const z of [-13,13])for(let x=-12;x<=12;x+=4)box(world,0xe9dfbf,cx+x,.32,z,1.8,.03,.12);for(let j=-2;j<=2;j++){box(world,0xeee5c9,cx+j*.8,.34,13,.5,.035,3);box(world,0xeee5c9,cx+j*.8,.34,-13,.5,.035,3);}}
 for(let x=21;x<32;x+=3)box(world,0xe7dec2,x,.1,0,1.6,.03,.14);
 function tree(x:number,z:number,size=1){
  cyl(world,0x795743,x,1.25*size,z,.17*size,2.5*size);
  for(let k=0;k<3;k++){const a=k*2.2+.5,branch=cyl(world,0x795743,x+Math.cos(a)*.32*size,2.05*size,z+Math.sin(a)*.32*size,.075*size,1.45*size);branch.rotation.z=Math.cos(a)*.6;branch.rotation.x=Math.sin(a)*.6;ball(world,seasonal.snow,x+Math.cos(a)*.56*size,2.65*size,z+Math.sin(a)*.56*size,.2*size);}
  ball(world,0x527d51,x,2.5*size,z,1.05*size);ball(world,0x719c5f,x-.55*size,2.95*size,z,.8*size);ball(world,0x8cab67,x+.64*size,2.57*size,z+.24,.73*size);
  for(let k=0;k<5;k++){const a=k*1.9;ball(world,k%2?seasonal.blossom:seasonal.blossomLight,x+Math.cos(a)*.92*size,(2.6+k%2*.42)*size,z+Math.sin(a)*.72*size,.27*size);}
  for(let k=0;k<4;k++){const a=k*1.57+.4;const leaf=ball(world,seasonal.leafLitter,x+Math.cos(a)*1.3*size,.12,z+Math.sin(a)*1.1*size,.4*size);leaf.scale.y=.08;}
 }

 for(const cx of [0,52])for(let i=0;i<14;i++){const a=i*Math.PI*2/14;tree(cx+Math.cos(a)*22.5,Math.sin(a)*19.8,.8+(i%3)*.15);}
 function bench(p:T.Object3D,x:number,z:number){box(p,0x997153,x,.83,z,2.1,.18,.62);box(p,0xb4875e,x,1.23,z-.3,2.1,.64,.15);for(const dx of [-.75,.75])box(p,0x364c49,x+dx,.55,z,.12,.6,.5);}
 for(const cx of [0,52]){for(const x of [-7,7]){bench(world,cx+x,6);bench(world,cx+x,-6);}for(const x of [-10,10])for(const z of [-7,7]){cyl(world,0x354e49,cx+x,1.75,z,.07,2.8);ball(world,0xf7dda1,cx+x,3.2,z,.22);cyl(world,0x3d4c47,cx+x,3.48,z,.31,.12);cyl(world,0x3d4c47,cx+x,2.94,z,.26,.1);for(const dx of [-.19,.19])box(world,0x3d4c47,cx+x+dx,3.2,z,.035,.45,.035);}}
 // Low garden walls, planted borders and irregular stone courses anchor the little streets.
 for(const cx of [0,52]){
  for(const side of [-1,1])for(let i=0;i<5;i++){const x=cx+side*(3.5+i*1.3);box(world,0xb5a17f,x,.64,side*4.6,1.14,.32,.48);box(world,0xcdbb97,x,.85,side*4.6,1.24,.12,.56);ball(world,0x6a964f,x,1.05,side*4.45,.38);ball(world,i%2?seasonal.blossom:0xe3bd62,x+.13,1.3,side*4.4,.14);box(world,seasonal.snow,x,.96,side*4.6,1.15,.12,.45);}
  for(const dx of [-6,6])for(const dz of [-3,3]){box(world,0x9f8861,cx+dx,.62,dz,3.2,.24,1.75);box(world,0x615d42,cx+dx,.77,dz,2.95,.09,1.5);for(let k=0;k<6;k++){const x=cx+dx+(k%3-1)*.88,z=dz+(Math.floor(k/3)-.5)*.68;ball(world,0x719c5f,x,1.12,z,.43);mesh(world,budG,k%3?0xe3bd62:seasonal.blossom,[x+.08,1.45,z],[.13,.17,.13]);}box(world,seasonal.snow,cx+dx,.88,dz,3.2,.15,1.75);}
  for(let i=0;i<18;i++){const a=i*Math.PI*2/18,x=cx+Math.cos(a)*10,z=Math.sin(a)*7;const stone=box(world,0xc3b28e,x,.52,z,.7,.06,.42);stone.rotation.y=a;}
  for(const x of [-11,11])for(const z of [-9,9]){const puddle=mesh(world,geo(new T.CircleGeometry(1,12)),seasonal.puddle,[cx+x,.49,z],[1.4,.65,1]);puddle.rotation.x=-Math.PI/2;puddle.renderOrder=-940;const drift=ball(world,seasonal.snow,cx+x,.52,z,1.5);drift.scale.set(1.3,.1,.72);}
 }
 // Each district has a living plaza: sculpted fountain and rotating public art.
 const fountain=new T.Group();fountain.position.set(0,.5,0);world.add(fountain);cyl(fountain,0xa49d88,0,.15,0,3,.3);cyl(fountain,0x63acb5,0,.34,0,2.65,.07);cyl(fountain,0xbec1a6,0,1,0,.55,1.6);cyl(fountain,0xc6c8ad,0,1.8,0,1.35,.2);const water=new T.Group();fountain.add(water);for(let i=0;i<9;i++){const a=i*Math.PI*2/9;ball(water,0xb9e2e0,Math.cos(a)*1.7,.9,Math.sin(a)*1.7,.12,true);}dynamic.push(water);
 const sculpture=new T.Group();sculpture.position.set(52,1.8,0);world.add(sculpture);cyl(world,0xc8b99a,52,.7,0,2.3,.6);const torusG=geo(new T.TorusGeometry(1.45,.18,8,24));const art=mesh(sculpture,torusG,0xe8a253,[0,.4,0],[1,1,1],true);art.rotation.x=.5;dynamic.push(sculpture);
 // A small vocabulary of shared primitives gives each address its own architecture.
 // Every fixed detail goes through mesh() so it is baked into the material batches below.
 const cream=0xefe0bd,stoneTrim=0xd6c5a2,dark=0x3d4c47,glass=0x416d74,glassLight=0x80a4a5,wood=0x997153,roofGreen=0x536d65;
 const triG=geo(new T.CylinderGeometry(1,1,1,3,1)),wheelG=geo(new T.TorusGeometry(.36,.055,5,compatibility?10:16));
 const railG=geo(new T.TorusGeometry(.35,.055,5,compatibility?8:12,Math.PI));
 function prism(p:T.Object3D,c:number,x:number,y:number,z:number,w:number,h:number,d:number){const m=mesh(p,triG,c,[x,y+h/3,z],[w/Math.sqrt(3),d,h/1.5]);m.rotation.x=-Math.PI/2;return m;}
 function flatRoof(p:T.Object3D,x:number,y:number,z:number,w:number,d:number,c=roofGreen){box(p,c,x,y,z,w,.22,d);box(p,seasonal.snow,x,y+.14,z,w*.97,.09,d*.97);}
 function gable(p:T.Object3D,x:number,y:number,z:number,w:number,d:number,rise:number,c=roofGreen){
  prism(p,c,x,y,z,w,rise,d);const angle=Math.atan2(rise,w/2),length=Math.hypot(w/2,rise);
  for(const side of [-1,1]){const panel=box(p,c,x+side*w/4,y+rise/2+.04,z,length,.13,d+.15);panel.rotation.z=-side*angle;const cap=box(p,seasonal.snow,x+side*w/4,y+rise/2+.13,z,length,.065,d+.09);cap.rotation.z=-side*angle;}
  box(p,cream,x,y+.02,z+d/2+.06,w+.12,.13,.14);
 }
 function window(p:T.Object3D,x:number,y:number,z:number,w:number,h:number,frame=cream,c=glass){
  box(p,frame,x,y,z,w+.18,h+.18,.12);box(p,c,x,y,z+.075,w,h,.08);
  box(p,frame,x,y,z+.13,.065,h,.045);if(!compatibility&&h>1)box(p,frame,x,y+.05,z+.13,w,.055,.045);
  box(p,stoneTrim,x,y-h/2-.1,z+.12,w+.3,.11,.24);
 }
 function sideWindows(p:T.Object3D,side:number,ys:number[],zs:number[],width=1.05){
  for(const y of ys)for(const z of zs){box(p,stoneTrim,side*3.31,y,z,.12,1.25,width+.2);box(p,glass,side*3.39,y,z,.06,1.02,width);if(!compatibility)box(p,cream,side*3.44,y,z,.035,1.04,.05);}
 }
 function planter(p:T.Object3D,x:number,z:number,w=1.2,c=0x9a7050,y=.36){
  box(p,c,x,y+.2,z,w,.4,.58);box(p,0x615d42,x,y+.41,z,w-.12,.04,.45);
  for(let n=0;n<(compatibility?2:3);n++){const dx=(n-(compatibility?.5:1))*w/(compatibility?2.6:3.2);ball(p,0x719c5f,x+dx,y+.57,z,.26);if(!compatibility)ball(p,seasonal.blossomLight,x+dx,y+.77,z+.02,.11);}
  box(p,seasonal.snow,x,y+.47,z,w,.07,.55);
 }
 function post(p:T.Object3D,x:number,z:number,top:number,c=cream,r=.075){cyl(p,c,x,top/2+.18,z,r,top);}
 function rail(p:T.Object3D,x:number,y:number,z:number,w:number,c=dark){
  box(p,c,x,y,z,w,.08,.07);box(p,c,x,y-.5,z,w,.055,.07);
  for(let k=0;k<(compatibility?3:6);k++)box(p,c,x-w/2+k*w/(compatibility?2:5),y-.25,z,.055,.6,.055);
 }
 function awning(p:T.Object3D,x:number,y:number,z:number,w:number,d:number,c:number,striped=true){
  const cloth=box(p,c,x,y,z,w,.14,d);cloth.rotation.x=.11;
  box(p,c,x,y-.13,z+d/2,w,.3,.1);
  if(striped&&!compatibility)for(let n=0;n<Math.floor(w/.65);n++){const xx=x-w/2+.25+n*.65,s=box(p,cream,xx,y+.08,z,.25,.03,d);s.rotation.x=.11;box(p,cream,xx,y-.13,z+d/2+.06,.25,.3,.025);}
 }
 function stair(p:T.Object3D,x:number,z:number,w:number){box(p,stoneTrim,x,.27,z,w,.12,.65);box(p,cream,x,.36,z-.18,w-.16,.12,.4);}
 function crate(p:T.Object3D,x:number,y:number,z:number,w=1,c=wood){
  box(p,c,x,y,z,w,.44,.7);box(p,0x615d42,x,y+.23,z,w-.1,.035,.6);
  if(!compatibility){for(const yy of [y-.12,y+.06])box(p,0xc59363,x,yy,z+.36,w,.075,.035);for(const dx of [-1,1])box(p,0xc59363,x+dx*(w/2-.06),y,z+.38,.065,.4,.04);}
 }
 function chair(p:T.Object3D,x:number,z:number,c=wood,turn=0){const a=new T.Group();a.position.set(x,0,z);a.rotation.y=turn;p.add(a);box(a,c,0,.73,0,.64,.12,.64);box(a,c,0,1.06,-.26,.65,.6,.12);for(const dx of [-.23,.23])for(const dz of [-.23,.23])box(a,dark,dx,.47,dz,.055,.48,.055);}
 function cafeTable(p:T.Object3D,x:number,z:number){cyl(p,cream,x,1.05,z,.59,.12);cyl(p,dark,x,.69,z,.065,.72);cyl(p,dark,x,.35,z,.31,.08);if(!compatibility){cyl(p,cream,x+.15,1.17,z,.09,.13);cyl(p,0x6b4532,x+.15,1.245,z,.074,.018);}}
 function bicycle(p:T.Object3D,x:number,z:number,c=0xd39c5c){
  for(const dx of [-.54,.54])mesh(p,wheelG,dark,[x+dx,.66,z],[1,1,1]);
  for(const [dx,dy,a,len] of [[-.26,.76,.65,.7],[.2,.8,-.55,.77],[0,.94,0,.65]]){const bar=box(p,c,x+dx,dy,z,len,.055,.055);bar.rotation.z=a;}
  box(p,dark,x-.15,1.1,z,.33,.08,.14);box(p,dark,x+.48,1.16,z,.05,.4,.055);box(p,dark,x+.5,1.35,z,.35,.055,.055);
 }
 function chimney(p:T.Object3D,x:number,y:number,z:number,h=1.2,c=0x976650){box(p,c,x,y+h/2,z,.58,h,.62);box(p,stoneTrim,x,y+h,z,.8,.15,.83);box(p,dark,x,y+h+.09,z,.45,.04,.49);box(p,seasonal.snow,x,y+h+.13,z,.78,.08,.8);}
 function vent(p:T.Object3D,x:number,y:number,z:number,w=1){box(p,0xadc2a5,x,y+.25,z,w,.5,.8);box(p,dark,x,y+.52,z,w+.1,.07,.88);if(!compatibility)for(let k=0;k<4;k++)box(p,dark,x-w*.3+k*w*.2,y+.25,z+.41,.045,.3,.025);}
 function books(p:T.Object3D,x:number,y:number,z:number,count=5){const colors=[0x9f6656,0xe2b863,0x749b91,0xf0d6a1,0xa07091];for(let k=0;k<count;k++){const h=.37+(k%3)*.09;box(p,colors[k%colors.length],x+(k-(count-1)/2)*.16,y+h/2,z,.13,h,.22);if(!compatibility)box(p,cream,x+(k-(count-1)/2)*.16,y+h*.3,z+.116,.08,.024,.012);}}
 const slots=[[-12,-19],[0,-19],[12,-19],[22,0],[12,19],[0,19],[-12,19],[-22,0]];
 const heights:Record<string,number>={'APARTMENTS':8.2,'WORK':5.15,'CAMPUS':8.15,'CAREER HUB':5.4,'CORNER CAFÉ':4.15,'COMMUNITY':5.9,'THE PARK':4.8,'LIBRARY':5.85,'MARKET':4.15,'FITNESS':4.75,'MAKERSPACE':5.9,'CINEMA':6.65,'TRANSIT':4.2,'GARDEN':4.2,'ARCADE':5.2};
 const spots:Spot[]=[];const signTextures:T.Texture[]=[],signMaterials:T.SpriteMaterial[]=[];
 for(let i=0;i<locations.length;i++){
  const l=locations[i],idx=l.district==='main'?i:i-7;const coords=slots[l.district==='main'&&idx===6?7:idx];const cx=l.district==='west'?52:0;const [sx,sz]=coords;const g=new T.Group();g.position.set(cx+sx,.25,sz);g.rotation.y=Math.atan2(-sx,-sz);world.add(g);
  const color=palette[i],outdoor=['THE PARK','GARDEN','TRANSIT'].includes(l.place),tall=heights[l.place]||4.5;
  box(g,0xe7d6b4,0,.08,0,8,.18,7);box(g,0xc1b398,0,.18,3.5,7.2,.2,1.6);
  // Keep a clear approach along x=0 to the engine's unchanged arrival point at z=4.65.
  box(g,0xd8c8a6,0,.295,3.45,1.65,.03,2.25);
  if(!outdoor){box(g,stoneTrim,0,.4,-.5,6.9,.32,4.9);stair(g,0,2.65,1.8);}
  switch(l.place){
   case 'APARTMENTS': {
    // Three stepped volumes, recessed balconies and a roof terrace form a residential silhouette.
    box(g,color,0,1.83,-.5,6.6,3.05,4.7);box(g,0xc9816a,.4,4.08,-.68,5.8,1.5,4.34);box(g,0xe5c589,.8,5.7,-1,4.8,1.7,3.7);
    flatRoof(g,0,3.39,-.5,6.95,5.05);flatRoof(g,.4,4.92,-.68,6.05,4.62);flatRoof(g,.8,6.65,-1,5.1,4.02);
    for(const y of [1.88,4.1])for(const x of [-2.05,2.05])window(g,x,y,y>3?1.52:1.88,1.13,1.32,cream);
    for(const x of [-.65,1.4])window(g,x,5.71,.89,1.16,1.3,cream);
    for(const y of [3.25,4.78]){const front=y>4?1.66:2;for(const x of [-1.93,1.94]){box(g,cream,x,y,front+.4,1.55,.15,.9);rail(g,x,y+.64,front+.84,1.56);box(g,dark,x-.74,y+.35,front+.43,.055,.6,.8);box(g,dark,x+.74,y+.35,front+.43,.055,.6,.8);if(!compatibility)planter(g,x+.3,front+.55,.61,0xc59363,y+.08);}}
    for(const side of [-1,1])sideWindows(g,side,[1.9],[-1.5,.4]);
    rail(g,.8,7.23,1.04,4.94);rail(g,.8,7.23,-3.05,4.94);chimney(g,2.4,6.7,-1.7,.9);planter(g,-.2,-1.15,1.2,0xc59363,6.78);
    box(g,cream,-2.56,5.58,-.7,1.3,2.28,4.34);window(g,-2.56,5.79,1.52,.7,.88);flatRoof(g,-2.56,6.79,-.7,1.47,4.55);
    box(g,0x7f9f83,0,2.99,2.28,1.95,.2,.8);for(const x of [-.87,.87])post(g,x,2.61,2.85,cream,.065);
    if(!compatibility){for(let k=0;k<4;k++)box(g,dark,-1.58+k*.2,1.34,1.94,.14,.14,.07);box(g,stoneTrim,-1.29,1.54,1.95,.8,.08,.1);}
    planter(g,-2.57,3.12,1.15);break;
   }
   case 'WORK': {
    // A practical brick works: serrated roofline, loading bay, ductwork and punch-clock canopy.
    box(g,color,0,1.84,-.5,6.6,3.05,4.7);box(g,0x9c9279,0,3.18,1.86,6.7,.24,.19);
    for(let k=0;k<3;k++){const z=-2+k*1.52;const roof=box(g,roofGreen,0,3.68,z,6.94,.15,1.69);roof.rotation.x=.32;box(g,glassLight,0,3.71,z-.8,6.7,.67,.08);box(g,cream,0,4.04,z-.83,6.92,.1,.12);const cap=box(g,seasonal.snow,0,3.77,z,6.88,.065,1.63);cap.rotation.x=.32;}
    window(g,-2.15,1.95,1.88,1.35,1.3,stoneTrim);box(g,dark,2.07,1.62,1.9,1.72,2.32,.12);box(g,0x9c9279,2.07,1.64,1.98,1.48,2.13,.08);
    for(let k=0;k<(compatibility?3:8);k++)box(g,stoneTrim,2.07,.79+k*(compatibility?.65:.24),2.04,1.45,.045,.03);
    for(const side of [-1,1])sideWindows(g,side,[2.22],[-1.6,.25],1.18);
    flatRoof(g,0,2.88,2.36,1.85,1.2,dark);for(const x of [-.82,.82])post(g,x,2.85,2.75,dark,.065);
    chimney(g,-2.55,3.62,-2.04,1.13,0x9c9279);vent(g,2.15,3.79,-1.15,1.08);if(!compatibility){box(g,0xadc2a5,2.85,4,-1.25,.3,.27,2.2);crate(g,-2.64,.61,3.05,.9);crate(g,-2.73,1.04,3.02,.7);box(g,0xd7b45d,1.04,.3,2.75,.16,.03,.9);}
    break;
   }
   case 'CAMPUS': {
    // Symmetric academic wings frame an unmistakable clock tower and colonnaded portico.
    box(g,color,0,2,-.55,6.6,3.4,4.6);gable(g,0,3.72,-.55,7,4.95,1.2);
    for(const x of [-2.25,2.25]){window(g,x,1.55,1.79,1.15,1.48);window(g,x,3.02,1.79,1.18,.58);}
    box(g,cream,0,4.93,-1.23,1.86,3.13,1.72);box(g,stoneTrim,0,5.7,-1.23,2.03,.17,1.89);box(g,roofGreen,0,6.55,-1.23,2.17,.24,2.03);
    const towerRoof=mesh(g,coneG,roofGreen,[0,7.03,-1.23],[1.48,1.02,1.48]);towerRoof.rotation.y=Math.PI/6;const cap=mesh(g,coneG,seasonal.snow,[0,7.12,-1.23],[1.49,.97,1.49]);cap.rotation.copy(towerRoof.rotation);cyl(g,0xb39a5c,0,7.8,-1.23,.05,.65);
    const clockFace=cyl(g,cream,0,5.75,-.34,.51,.08);clockFace.rotation.x=Math.PI/2;box(g,dark,0,5.88,-.28,.055,.31,.04);const hand=box(g,dark,.11,5.74,-.275,.3,.045,.04);hand.rotation.z=-.28;
    for(const x of [-1.36,1.36]){cyl(g,stoneTrim,x,.47,2.56,.24,.2);cyl(g,cream,x,1.78,2.56,.16,2.5);cyl(g,stoneTrim,x,3.05,2.56,.25,.17);}
    box(g,cream,0,3.22,2.4,3.4,.28,1.23);prism(g,stoneTrim,0,3.36,2.4,3.58,.83,1.31);prism(g,roofGreen,0,3.49,3.08,2.6,.47,.035);
    for(const side of [-1,1])sideWindows(g,side,[1.87],[-1.55,.25]);if(!compatibility){box(g,0x64948e,-2.75,3.48,2.03,.55,1.36,.1);box(g,0xd7b45d,2.75,3.48,2.03,.55,1.36,.1);books(g,-2.25,.88,3.04,5);box(g,wood,-2.25,.65,3.04,1.18,.35,.7);}
    break;
   }
   case 'CAREER HUB': {
    // An offset office tower, brise-soleil and cantilevered entrance signal a modern workplace.
    box(g,0xe6d8b5,0,1.83,-.5,6.6,3.05,4.7);box(g,0x64948e,1.14,3.95,-.78,4.05,1.75,4.12);flatRoof(g,1.14,4.92,-.78,4.35,4.4,dark);flatRoof(g,-2.33,3.42,-.5,2,4.99);
    box(g,glass,-1.82,1.78,1.87,2.67,2.49,.14);box(g,glass,1.86,1.78,1.87,2.73,2.49,.14);box(g,glassLight,1.14,3.98,1.32,3.67,1.45,.1);
    for(const x of [-3.09,-1.83,-.61,.68,1.9,3.17])box(g,cream,x,1.81,1.98,.075,2.72,.08);for(const y of [.52,2.04,3.16])box(g,cream,0,y,1.98,6.47,.08,.08);
    for(let n=0;n<(compatibility?3:6);n++)box(g,dark,-.49+n*(compatibility?1.56:.63),3.99,1.45,.07,1.65,.21);
    flatRoof(g,.1,2.94,2.69,3.34,1.66,0x80a6a7);post(g,-1.38,3.19,2.79,dark,.055);post(g,1.57,3.19,2.79,dark,.055);
    box(g,0xe6d8b5,-3.16,2.18,1.89,.28,3.45,.24);planter(g,-2.63,3.12,1.35,cream);vent(g,2.3,5.03,-1.8,.8);
    if(!compatibility){for(const side of [-1,1])sideWindows(g,side,[1.93],[-1.55,.25],1.2);box(g,wood,-1.86,.91,1.94,1.1,.12,.1);box(g,seasonal.lamplight,-1.83,2.61,2.04,1.72,.06,.035);}
    break;
   }
   case 'CORNER CAFÉ': {
    // A low tiled cottage with a chimney, striped awning, espresso window and tiny terrace.
    box(g,color,0,1.48,-.5,6.6,2.34,4.7);gable(g,0,2.73,-.5,7.1,5.15,1.05,0x976650);chimney(g,-2.05,3.22,-1.71,.84);
    for(const x of [-2.03,2.03])window(g,x,1.53,1.89,1.6,1.3,cream,0x8ab1ab);
    awning(g,0,2.57,2.43,6.65,1.36,0xd7b45d);for(const x of [-3.16,3.16])post(g,x,3.03,2.47,cream,.055);
    cafeTable(g,-2.08,3.37);chair(g,-2.93,3.44,0xc9816a,-Math.PI/2);if(!compatibility)chair(g,-2.05,2.5,0xc9816a);
    box(g,dark,1.64,.87,3.29,.52,1.04,.12);box(g,cream,1.64,.89,3.37,.39,.8,.025);if(!compatibility){for(let n=0;n<4;n++)box(g,0x997153,1.64,1.13-n*.14,3.39,.26,.028,.012);box(g,0x6b4532,-1.94,1.43,2.03,.66,.2,.13);cyl(g,cream,-1.66,1.59,2.05,.14,.14);}
    planter(g,3.18,-2.18,.87);for(const side of [-1,1])sideWindows(g,side,[1.59],[-1.1],1.15);break;
   }
   case 'COMMUNITY': {
    // A broad civic hall with a lantern cupola, welcoming porch and noticeboards.
    box(g,color,0,1.85,-.5,6.6,3.08,4.7);gable(g,0,3.43,-.5,7.1,5.16,1.2,0x737d69);
    for(const x of [-2.26,2.26])window(g,x,1.92,1.88,1.22,1.7);
    box(g,cream,0,4.89,-.65,1.17,.96,1.15);for(const x of [-.31,.31])box(g,glass,x,4.95,-.055,.28,.5,.04);flatRoof(g,0,5.39,-.65,1.5,1.46);mesh(g,coneG,roofGreen,[0,5.7,-.65],[1,.62,1]);
    flatRoof(g,0,3.24,2.67,4.22,1.89,cream);for(const x of [-1.86,1.86]){box(g,stoneTrim,x,.59,3.15,.4,.4,.4);post(g,x,3.15,2.95,cream,.11);}
    if(!compatibility){for(const side of [-1,1]){box(g,wood,side*2.5,1.7,2.04,.9,1.03,.12);for(let k=0;k<3;k++)box(g,[0xf0d6a1,0x749b91,0xe2b863][k],side*2.5+(k%2-.5)*.3,1.89-Math.floor(k/2)*.39,2.12,.25,.3,.025);}for(let k=0;k<7;k++){const flag=mesh(g,coneG,[0xc9816a,0xe2b863,0x749b91][k%3],[-1.55+k*.52,2.93,3.31],[.13,.31,.07]);flag.rotation.z=Math.PI;}}
    bench(g,-2.29,3.15);for(const side of [-1,1])sideWindows(g,side,[1.98],[-1.48,.3]);break;
   }
   case 'THE PARK': {
    // Open hexagonal pavilion, climbing arch, slide and sandbox keep this legibly a park.
    box(g,0x89a66a,0,.22,-.5,6.8,.15,5.5);cyl(g,stoneTrim,-.55,.4,-.25,2.32,.22);
    for(let k=0;k<6;k++){const a=k*Math.PI/3;post(g,-.55+Math.cos(a)*1.92,-.25+Math.sin(a)*1.92,2.92,cream,.095);if(k!==1&&k!==2){const beam=box(g,cream,-.55+Math.cos(a+Math.PI/6)*1.65,1.19,-.25+Math.sin(a+Math.PI/6)*1.65,1.82,.09,.075);beam.rotation.y=-(a+Math.PI/6)+Math.PI/2;}}
    mesh(g,coneG,roofGreen,[-.55,3.64,-.25],[2.64,1.35,2.64]);mesh(g,coneG,seasonal.snow,[-.55,3.75,-.25],[2.64,1.3,2.64]);cyl(g,cream,-.55,4.48,-.25,.075,.4);bench(g,-.65,-.73);
    box(g,wood,2.52,.46,-1.41,1.51,.32,2.03);box(g,0xe5c589,2.52,.65,-1.41,1.31,.05,1.83);
    if(!compatibility){const slide=box(g,0x80a6a7,2.48,1.03,-1.4,.75,.08,1.54);slide.rotation.x=.52;for(const x of [2.1,2.82])post(g,x,-2.05,1.25,0xc59363,.055);for(let n=0;n<3;n++)box(g,cream,2.47,.73+n*.24,-2.08,.75,.055,.055);}
    box(g,0x997153,-2.77,.75,2.58,1.01,.15,.51);post(g,-2.77,2.58,.66,wood,.11);planter(g,-2.85,-2.53,1.2);break;
   }
   case 'LIBRARY': {
    // Classical pediment and columned entry, book display windows, reading annex and roof lantern.
    box(g,color,0,2.02,-.5,6.6,3.45,4.7);flatRoof(g,0,3.87,-.5,7.05,5.1,0x9c9279);
    box(g,cream,0,3.59,1.91,6.82,.36,.23);prism(g,cream,0,3.87,.27,7.15,1.48,3.2);prism(g,roofGreen,0,4.04,1.9,5.75,.98,.065);
    const medallion=cyl(g,stoneTrim,0,4.59,1.99,.28,.055);medallion.rotation.x=Math.PI/2;box(g,cream,-.12,4.59,2.04,.18,.24,.04);box(g,cream,.12,4.59,2.04,.18,.24,.04);
    for(const x of [-1.05,1.05]){cyl(g,stoneTrim,x,.56,2.67,.29,.22);cyl(g,cream,x,1.9,2.67,.18,2.5);cyl(g,stoneTrim,x,3.19,2.67,.3,.17);}box(g,cream,0,3.4,2.56,3.13,.3,1.15);
    for(const x of [-2.4,2.4]){window(g,x,1.93,1.9,1.3,1.8);box(g,wood,x,1.33,2.05,1.16,.075,.3);box(g,wood,x,2.08,2.05,1.16,.075,.3);books(g,x,1.38,2.05,compatibility?4:6);if(!compatibility)books(g,x,2.13,2.05,6);}
    box(g,glassLight,0,4.33,-1.99,2.95,.64,1.24);gable(g,0,4.65,-1.99,3.16,1.47,.52,0x737d69);
    for(const side of [-1,1])sideWindows(g,side,[2.13],[-1.48,.25]);if(!compatibility){box(g,wood,-2.8,1.13,3.15,.78,1.4,.42);books(g,-2.8,.64,3.38,4);gable(g,-2.8,1.83,3.15,.99,.66,.27);}
    break;
   }
   case 'MARKET': {
    // Wide produce hall with twin colorful vendor stalls and a roof monitor.
    box(g,color,0,1.52,-.62,6.6,2.44,4.46);flatRoof(g,0,2.88,-.62,7.17,4.96,0x6e7762);box(g,glassLight,0,3.22,-.75,4.2,.55,1.16);flatRoof(g,0,3.58,-.75,4.53,1.45);
    for(const x of [-2.09,2.09])window(g,x,1.71,1.65,1.63,1.6,cream,0x527b80);
    for(const side of [-1,1]){const x=side*2.24;awning(g,x,2.69,2.65,2.65,1.75,side<0?0xc9816a:0x71956b);for(const dx of [-1.19,1.19])post(g,x+dx,3.39,2.49,cream,.055);crate(g,x,.87,2.85,2.22);
     for(let n=0;n<(compatibility?4:9);n++){const xx=x+(n%(compatibility?2:3)- (compatibility?.5:1))*.57,zz=2.6+Math.floor(n/(compatibility?2:3))*.25;ball(g,[0xb66655,0xe9a04b,0x82a44c][Math.floor(n/3)%3],xx,1.22,zz,.19);}
    }
    if(!compatibility){crate(g,-2.75,.61,-2.18,.8);crate(g,-2.72,1.06,-2.18,.77);box(g,cream,1.98,1.78,3.18,.64,.35,.04);for(const x of [-3,3])box(g,wood,x,2.09,1.79,.2,1.9,.13);}
    break;
   }
   case 'FITNESS': {
    // A broad bright studio with a raised clerestory, long glazing and visible equipment.
    box(g,color,0,1.7,-.5,6.6,2.8,4.7);box(g,glassLight,0,3.26,-1.06,5.86,.62,3.22);flatRoof(g,0,3.66,-1.06,6.15,3.48,cream);flatRoof(g,0,3.1,1.11,7.13,1.76,dark);
    for(const x of [-2.14,2.14]){box(g,glass,x,1.68,1.88,2.53,2.34,.13);box(g,cream,x,2.91,2.01,2.6,.12,.11);box(g,cream,x,.5,2.01,2.6,.12,.11);box(g,cream,x,1.7,2.01,.065,2.39,.05);}
    for(const x of [-3.27,-.86,.86,3.27])box(g,cream,x,1.77,2.02,.12,2.74,.13);
    for(let k=0;k<3;k++){box(g,[0x749b91,0xa07091,0xe2b863][k],-2.55+k*.47,.69,2.07,.34,.09,.53);}
    if(!compatibility){for(const x of [1.56,2.52]){box(g,dark,x,.76,2.04,.69,.16,.36);const upright=box(g,dark,x,1.22,2.04,.07,.99,.07);upright.rotation.z=-.15;box(g,glassLight,x+.05,1.72,2.09,.37,.25,.055);}for(const side of [-1,1])sideWindows(g,side,[1.94],[-1.55,.32],1.3);}
    box(g,cream,0,3.03,2.5,1.86,.19,1.11);planter(g,-2.88,3.22,.77,cream);vent(g,2.12,3.85,-1.8,.88);break;
   }
   case 'MAKERSPACE': {
    // Asymmetric workshop sheds, tall flue, broad garage and a covered outdoor workbench.
    box(g,color,0,1.64,-.5,6.6,2.69,4.7);for(let k=0;k<2;k++){const x=-1.67+k*3.34;gable(g,x,3.04,-.5,3.57,5.04,.97,0x6e7762);box(g,glassLight,x,3.33,2.04,2.02,.41,.065);}
    box(g,0x976650,-2.53,3.21,-1.88,.85,4.07,.87);box(g,stoneTrim,-2.53,5.29,-1.88,1.08,.18,1.07);box(g,dark,-2.53,5.4,-1.88,.58,.055,.58);box(g,seasonal.snow,-2.53,5.44,-1.88,1.04,.065,1.02);
    box(g,dark,-1.99,1.62,1.9,1.88,2.16,.13);box(g,wood,-1.99,1.61,1.99,1.66,1.95,.08);for(let k=0;k<(compatibility?3:6);k++)box(g,0xc59363,-2.73+k*(compatibility?.73:.3),1.62,2.05,.045,1.91,.035);
    window(g,2.16,1.77,1.89,1.44,1.52,cream);awning(g,-2.11,2.77,2.8,2.65,1.54,0x64948e,false);for(const x of [-3.31,-.92])post(g,x,3.46,2.64,dark,.055);
    box(g,wood,-2.07,1.03,3.08,2.08,.17,.79);for(const x of [-2.9,-1.24])box(g,dark,x,.66,3.08,.1,.66,.58);box(g,0x5c858a,-2.75,1.23,3.08,.32,.26,.33);
    if(!compatibility){box(g,dark,-1.67,1.18,3.13,.51,.07,.09);box(g,wood,-1.37,1.21,3.13,.15,.23,.18);crate(g,2.71,.63,-2.17,.82);for(const side of [-1,1])sideWindows(g,side,[1.84],[-1.4,.4]);}
    break;
   }
   case 'CINEMA': {
    // Stepped art-deco tower, vertical blade and luminous marquee, with twin movie posters.
    box(g,0x9c9279,0,1.87,-.5,6.6,3.14,4.7);box(g,color,0,3.44,1.43,6.68,2.22,.88);box(g,0xa07091,0,4.6,1.47,4.23,1.7,.8);box(g,color,0,5.65,1.5,2.13,1.1,.72);
    for(const [w,y] of [[6.9,4.61],[4.45,5.51],[2.35,6.27]]){box(g,cream,0,y,1.51,w,.16,1.03);box(g,seasonal.snow,0,y+.12,1.51,w,.065,1.01);}
    flatRoof(g,0,3.55,-.79,6.98,4.23);box(g,cream,0,2.86,2.71,6.86,.52,1.94);box(g,0xb39a5c,0,2.51,3.56,6.97,.14,.24);box(g,dark,0,2.98,3.7,6.51,.26,.035);
    for(let n=0;n<(compatibility?7:15);n++)ball(g,seasonal.lamplight,-3.02+n*6.04/(compatibility?6:14),2.69,3.73,.065);
    for(const x of [-2.33,2.33]){box(g,cream,x,1.55,1.95,1.3,1.83,.13);box(g,x<0?0x64948e:0xc9816a,x,1.55,2.03,1.1,1.61,.04);const art=ball(g,0xe5c589,x,1.76,2.06,.35);art.scale.z=.07;box(g,cream,x,1.02,2.07,.8,.08,.03);}
    for(const x of [-.61,0,.61])box(g,0xd7b45d,x,5.05,1.96,.13,1.84,.09);
    if(!compatibility){box(g,0x7376a3,3.04,4.91,2.05,.64,2.33,.33);for(let k=0;k<4;k++)box(g,seasonal.lamplight,3.04,5.66-k*.5,2.23,.29,.19,.03);for(const x of [-1.24,1.24]){cyl(g,0xb39a5c,x,.87,3.37,.055,1.05);ball(g,0xb39a5c,x,1.41,3.37,.1);}}
    break;
   }
   case 'TRANSIT': {
    // Open bus shelter, timetable totem, ticket machine and a proper bicycle rack.
    box(g,0xd6c6a1,0,.26,-.5,6.8,.14,5.5);for(const x of [-2.69,2.69])post(g,x,-.15,3.12,dark,.085);
    const canopy=box(g,0x80a6a7,0,3.43,-.15,6.25,.21,3.53);canopy.rotation.x=-.08;const snow=box(g,seasonal.snow,0,3.59,-.15,6.19,.07,3.47);snow.rotation.x=-.08;
    box(g,glassLight,0,1.82,-1.56,5.66,2.64,.12);for(const x of [-2.72,0,2.72])box(g,dark,x,1.82,-1.47,.075,2.89,.075);box(g,dark,0,1.58,-1.45,5.49,.06,.06);bench(g,-.83,-.74);
    box(g,dark,2.1,1.01,-.5,.79,1.5,.56);box(g,glassLight,2.1,1.26,-.2,.53,.57,.03);box(g,cream,2.1,.79,-.2,.41,.09,.03);
    post(g,-3.13,2.7,3.43,dark,.07);box(g,cream,-3.13,3.43,2.7,.85,.63,.12);box(g,0x80a6a7,-3.13,3.47,2.78,.56,.3,.035);box(g,cream,-3.13,2.35,2.7,.69,1.14,.11);
    if(!compatibility)for(let k=0;k<5;k++)box(g,0x64948e,-3.13,2.7-k*.15,2.77,.49,.04,.02);
    for(const x of [-2.15,-1.25]){mesh(g,railG,dark,[x,.83,2.34],[1,1,1]);for(const dx of [-.35,.35])box(g,dark,x+dx,.56,2.34,.055,.55,.055);}
    if(!compatibility)bicycle(g,-1.77,2.58,0x749b91);box(g,0xe5c589,0,.335,2.1,5.3,.022,.16);break;
   }
   case 'GARDEN': {
    // A faceted greenhouse, raised beds, bean trellis and potting bench form a working garden.
    box(g,0x89a66a,0,.22,-.5,6.8,.15,5.5);box(g,stoneTrim,1.64,.49,-.9,2.71,.34,3.38);box(g,glassLight,1.64,1.67,-.9,2.57,2.02,3.18);prism(g,glassLight,1.64,2.7,-.9,2.69,.94,3.31);
    for(const x of [.3,1.64,2.98]){box(g,cream,x,1.7,.75,.065,2.18,.065);box(g,cream,x,1.7,-2.55,.065,2.18,.065);}for(const z of [-2.55,-.92,.75]){box(g,cream,.3,1.72,z,.065,2.18,.065);box(g,cream,2.98,1.72,z,.065,2.18,.065);for(const side of [-1,1]){const beam=box(g,cream,1.64+side*.67,3.19,z,1.65,.075,.075);beam.rotation.z=-side*.611;}}
    box(g,cream,1.64,3.68,-.9,.075,.075,3.44);for(const y of [.69,1.81,2.73]){box(g,cream,1.64,y,.79,2.75,.065,.065);box(g,cream,.27,y,-.9,.065,.065,3.43);box(g,cream,3.01,y,-.9,.065,.065,3.43);}
    for(const side of [-1,1]){const snow=box(g,seasonal.snow,1.64+side*.67,3.23,-.9,1.65,.065,3.34);snow.rotation.z=-side*.611;}
    for(const x of [-2.5,-.95]){box(g,wood,x,.5,-1.05,1.17,.4,3.18);box(g,0x615d42,x,.72,-1.05,1.01,.045,3);for(let k=0;k<(compatibility?3:5);k++){const z=-2.25+k*(compatibility?1.1:.56);ball(g,0x719c5f,x,.92,z,.3);if(!compatibility)ball(g,k%2?0xe9a04b:0xb66655,x+.1,1.07,z,.12);}box(g,seasonal.snow,x,.78,-1.05,1.13,.07,3.1);}
    for(const x of [-3.17,-1.88])post(g,x,-2.54,2.66,wood,.055);for(const y of [1.22,1.87,2.5])box(g,wood,-2.52,y,-2.54,1.5,.065,.065);
    if(!compatibility){for(let n=0;n<5;n++)ball(g,0x719c5f,-3.03+n*.24,1.42+n*.19,-2.55,.22);box(g,wood,-2.61,1.05,2.16,1.53,.14,.66);for(const x of [-3.17,-2.06])box(g,wood,x,.71,2.16,.08,.59,.51);for(const x of [-2.98,-2.42])cyl(g,0xc59363,x,1.27,2.17,.16,.26);}
    break;
   }
   case 'ARCADE': {
    // A rounded neon-like fascia, stepped game lounge roof and cabinet-lined windows.
    box(g,color,0,1.83,-.5,6.6,3.06,4.7);flatRoof(g,0,3.51,-.5,7.02,5.1,dark);box(g,0x573e70,0,3.82,.92,5.42,.78,1.82);flatRoof(g,0,4.29,.92,5.7,2.03,0x7376a3);
    box(g,0x573e70,0,3.1,2.11,6.73,.94,.41);box(g,0x81d6c2,0,3.6,2.37,6.81,.09,.12);box(g,0xe5c589,0,2.61,2.37,6.81,.07,.12);for(const x of [-3.33,3.33])box(g,0x81d6c2,x,3.1,2.37,.075,.99,.12);
    for(const x of [-2.1,2.1]){box(g,dark,x,1.57,1.9,1.82,1.98,.14);for(const dx of [-.39,.39]){box(g,0x573e70,x+dx,1.37,2.03,.62,1.4,.18);box(g,0x81d6c2,x+dx,1.61,2.14,.45,.47,.035);box(g,0x7376a3,x+dx,1.16,2.19,.59,.13,.26);if(!compatibility)ball(g,0xe5c589,x+dx+.16,1.28,2.22,.055);}}
    for(const x of [-1.77,0,1.77]){const diamond=box(g,x===0?0xe5c589:0x81d6c2,x,3.12,2.36,.39,.39,.06);diamond.rotation.z=Math.PI/4;}
    if(!compatibility){for(const side of [-1,1])sideWindows(g,side,[1.87],[-1.45,.35],1.2);for(let k=0;k<3;k++)box(g,0xe5c589,-.34+k*.34,4.02,1.89,.19,.19,.035);}
    box(g,0x7376a3,0,2.55,2.79,1.83,.12,1.14);planter(g,-2.93,3.25,.81,0x7376a3);break;
   }
  }
  if(!outdoor){
   // All enclosed locations retain the same hinged, reachable entrance used by the game engine.
   box(g,dark,0,1.5,1.99,1.43,2.5,.16);box(g,cream,-.74,1.52,2.04,.12,2.58,.21);box(g,cream,.74,1.52,2.04,.12,2.58,.21);box(g,cream,0,2.83,2.04,1.6,.13,.21);
   if(!compatibility){for(const x of [-.98,.98]){box(g,dark,x,2.06,2.1,.16,.37,.21);box(g,seasonal.lamplight,x,2.08,2.23,.12,.23,.045);}}
  }
  const hinge=new T.Group();hinge.position.set(-.6,.3,1.98);g.add(hinge);if(!outdoor){box(hinge,0x3d605e,.6,1.14,.15,1.2,2.28,.18,true);box(hinge,0x8ab1ab,.6,1.48,.26,.85,1.1,.03,true);ball(hinge,0xe9c882,1.04,1,.31,.08,true);}
  const prop=new T.Group();prop.position.set(2.7,.4,3.5);g.add(prop);
  // Location-specific playthings, all modeled in 3D and raycastable.
  if(l.place==='CORNER CAFÉ'){cyl(prop,0xf7e6c6,0,.55,0,.42,.7,true);cyl(prop,0x6b4532,0,.92,0,.35,.04,true);const handle=mesh(prop,geo(new T.TorusGeometry(.25,.07,6,12)),0xf7e6c6,[.43,.62,0],[1,1,1],true);handle.rotation.y=Math.PI/2;}
  else if(l.place==='ARCADE'){box(prop,0x573e70,0,.8,0,.9,1.6,.8,true);box(prop,0x81d6c2,0,1.1,.43,.66,.6,.04,true);ball(prop,0xf1b84d,.16,.65,.5,.1,true);}
  else if(l.place==='FITNESS'){box(prop,0x3e5961,0,.6,0,1.5,.12,.12,true);for(const x of [-.55,.55]){const w=cyl(prop,0x526b6e,x,.6,0,.35,.18,true);w.rotation.z=Math.PI/2;}}
  else if(l.place==='LIBRARY'||l.place==='CAMPUS'){for(let j=0;j<4;j++)box(prop,[0x9f6656,0xe2b863,0x749b91,0xf0d6a1][j],0,.25+j*.2,0,.9,.16,.6,true);}
  else if(l.place==='MARKET'||l.place==='GARDEN'||l.place==='COMMUNITY'){box(prop,0xa87e4f,0,.3,0,1.2,.5,.8,true);for(let j=0;j<5;j++)ball(prop,j%2?0xe9a04b:0x82a44c,(j%3-.8)*.3,.66,Math.floor(j/3)*.3-.1,.19,true);}
  else if(l.place==='TRANSIT'){for(const x of [-.55,.55]){const w=mesh(prop,geo(new T.TorusGeometry(.38,.06,6,16)),0x3b5558,[x,.45,0],[1,1,1],true);w.rotation.y=0;}const frame=box(prop,0xd39c5c,0,.7,0,1,.09,.09,true);frame.rotation.z=.25;box(prop,0x3d5551,.45,1,0,.08,.6,.08,true);}
  else if(l.place==='CINEMA'){cyl(prop,0xb66655,0,.6,0,.38,.9,true);for(let j=0;j<7;j++)ball(prop,0xf3dc99,(j%3-1)*.18,1.05+Math.floor(j/3)*.07,Math.floor(j/3)*.14-.1,.14,true);}
  else if(l.place==='MAKERSPACE'){box(prop,0xb28358,0,.7,0,1.2,.2,.8,true);const gear=mesh(prop,geo(new T.TorusGeometry(.33,.1,5,8)),0x5c858a,[0,1.1,0],[1,1,1],true);gear.rotation.y=.4;}
  else if(l.place==='THE PARK'){cyl(prop,0xa4bda2,0,.3,0,.6,.15,true);ball(prop,0x6cbbc4,0,.65,0,.33,true);}
  else{box(prop,0x557d7b,0,.55,0,1,.9,.65,true);box(prop,0xd2e0ba,0,.6,.34,.75,.6,.04,true);box(prop,0xb79765,0,.13,0,1.25,.15,.85,true);}
  const door=g.localToWorld(new T.Vector3(0,.65,4.65));const center=g.localToWorld(new T.Vector3(0,tall/2,0));
  const hit=new T.Mesh(new T.BoxGeometry(7.5,tall+.7,7.6),new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));hit.position.set(0,tall/2+.25,0);g.add(hit);hit.userData.place=l.place;geometries.push(hit.geometry);
  prop.traverse(o=>{o.userData.place=l.place;o.userData.prop=true;});
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=100;const ctx=canvas.getContext('2d')!;ctx.fillStyle='#243f3d';ctx.beginPath();ctx.moveTo(18,5);ctx.lineTo(494,5);ctx.lineTo(507,20);ctx.lineTo(507,80);ctx.lineTo(494,95);ctx.lineTo(18,95);ctx.lineTo(5,80);ctx.lineTo(5,20);ctx.closePath();ctx.fill();ctx.strokeStyle='#b39a5c';ctx.lineWidth=4;ctx.stroke();ctx.strokeStyle='#718075';ctx.lineWidth=1;ctx.strokeRect(23,15,466,70);ctx.fillStyle='#c5ad6d';for(const x of [15,497]){ctx.beginPath();ctx.arc(x,50,3,0,Math.PI*2);ctx.fill();}ctx.fillStyle='#fff0cb';ctx.font='bold 34px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(l.name,256,50,470);const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;signTextures.push(texture);const signMaterial=new T.SpriteMaterial({map:texture,depthTest:true});signMaterials.push(signMaterial);const sign=new T.Sprite(signMaterial);sign.position.set(0,tall+1.15,0);sign.scale.set(8.5,1.66,1);g.add(sign);
  spots.push({place:l.place,name:l.name,district:l.district,center,door,group:g,hinge,prop,hit,phase:-100});
 }
 // Bake stationary assets by shared material: detailed world, only a few dozen draw calls.
 world.updateMatrixWorld(true);const buckets=new Map<string,{material:T.Material;order:number;gs:T.BufferGeometry[]}>();for(const m of statics){const transformed=m.geometry.clone().applyMatrix4(m.matrixWorld);const clone=transformed.index?transformed.toNonIndexed():transformed;if(clone!==transformed)transformed.dispose();const material=m.material as T.Material,key=material.uuid+':'+m.renderOrder;if(!buckets.has(key))buckets.set(key,{material,order:m.renderOrder,gs:[]});buckets.get(key)!.gs.push(clone);m.removeFromParent();}for(const {material,order,gs} of buckets.values()){const merged=mergeGeometries(gs);gs.forEach(g=>g.dispose());if(merged){geometries.push(merged);const m=new T.Mesh(merged,material);m.renderOrder=order;m.castShadow=true;m.receiveShadow=true;scene.add(m);}}
 const seasonalColors:Record<Season,Record<number,number>>={
  spring:{[0x91b480]:0x9daa77,[0x9cb782]:0xaab884,[0x527d51]:0x52704d,[0x719c5f]:0x7c965b,[0x8cab67]:0xa4ab64,[0x416d74]:0x4c6968},
  summer:{[0x91b480]:0x859262,[0x9cb782]:0x96a16b,[0x527d51]:0x405d41,[0x719c5f]:0x617b48,[0x8cab67]:0x869554,[0x416d74]:0x496a67},
  autumn:{[0x91b480]:0x998866,[0x9cb782]:0xab9671,[0x527d51]:0x8f5639,[0x719c5f]:0xba7b3f,[0x8cab67]:0xd0a45e,[0x416d74]:0x746d5b},
  winter:{[0x91b480]:0xc4caca,[0x9cb782]:0xd5d8d2,[0x527d51]:0x6d7771,[0x719c5f]:0x91978a,[0x8cab67]:0xadb5a3,[0x416d74]:0xe4ad65}
 };
 function setWeather(weather:Weather|null){const season=weather?.season||'spring',wet=weather?.type==='rain';
  for(const [key,m] of materials){const original=Number(key.split(',')[0]);m.color.setHex(seasonalColors[season][original]??original);m.visible=true;m.emissive.setHex(0);m.emissiveIntensity=0;
   if([0x527d51,0x719c5f,0x8cab67].includes(original))m.visible=season!=='winter';
   if(original===seasonal.snow)m.visible=season==='winter';
   if(original===seasonal.blossom||original===seasonal.blossomLight)m.visible=season==='spring';
   if(original===seasonal.leafLitter)m.visible=season==='autumn';
   if(original===seasonal.puddle)m.visible=wet;
   if(original===0x81d6c2){m.emissive.setHex(0x4bada1);m.emissiveIntensity=.24;}
   if(original===seasonal.lamplight||original===0x416d74||original===0x527b80){const lit=season==='winter'||wet;m.emissive.setHex(lit?0xd69b4e:0x48381c);m.emissiveIntensity=lit?.45:.07;}
  }
 }
 setWeather(null);
 return{spots,dynamic,setWeather,animate:(time:number,reduced:boolean)=>{water.rotation.y=reduced?0:time*.28;sculpture.rotation.y=reduced?.3:time*.2;for(const s of spots){const t=time-s.phase;const wave=t>=0&&t<2&&!reduced?Math.sin(t*Math.PI*3)*(1-t/2):0;s.prop.rotation.y=wave*.7;s.prop.position.y=.4+Math.abs(wave)*.7;s.hinge.rotation.y=t>=0&&t<2?-Math.sin(Math.min(1,t)*Math.PI/2)*1.1:0;}},dispose:()=>{new Set(geometries).forEach(g=>g.dispose());materials.forEach(m=>m.dispose());brushTexture.dispose();stoneTexture.dispose();signTextures.forEach(t=>t.dispose());signMaterials.forEach(m=>m.dispose());spots.forEach(s=>(s.hit.material as T.Material).dispose());}};
}
