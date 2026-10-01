import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {locations} from '@/lib/locations';
export type Spot={place:string;name:string;district:string;center:T.Vector3;door:T.Vector3;group:T.Group;hinge:T.Group;prop:T.Group;hit:T.Mesh;phase:number;};
const palette=[0xc58758,0xe5c589,0xe6d8b5,0x64948e,0xc9816a,0xd7b45d,0x71956b,0xc8a36f,0xd89563,0x87aaa4,0x9c9279,0x7376a3,0x80a6a7,0x85a46a,0xa07091];
export function buildTown(scene:T.Scene){
 const materials=new Map<string,T.MeshStandardMaterial>(),geometries:T.BufferGeometry[]=[],statics:T.Mesh[]=[];const dynamic:T.Object3D[]=[];
 const mat=(color:number,roughness=.8,metalness=0)=>{const key=[color,roughness,metalness].join();if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({color,roughness,metalness}));return materials.get(key)!;};
 const geo=(g:T.BufferGeometry)=>{geometries.push(g);return g;};const boxG=geo(new T.BoxGeometry(1,1,1)),cylG=geo(new T.CylinderGeometry(1,1,1,10)),coneG=geo(new T.ConeGeometry(1,1,6)),ballG=geo(new T.IcosahedronGeometry(1,1));
 function mesh(parent:T.Object3D,g:T.BufferGeometry,color:number,pos:number[],scale:number[],live=false){const m=new T.Mesh(g,mat(color));m.position.set(...pos as [number,number,number]);m.scale.set(...scale as [number,number,number]);m.castShadow=true;m.receiveShadow=true;parent.add(m);if(!live)statics.push(m);return m;}
 const box=(p:T.Object3D,c:number,x:number,y:number,z:number,w:number,h:number,d:number,live=false)=>{const m=Math.max(w,d)>8?mesh(p,geo(new T.BoxGeometry(w,h,d,Math.ceil(w/4),1,Math.ceil(d/4))),c,[x,y,z],[1,1,1],live):mesh(p,boxG,c,[x,y,z],[w,h,d],live);if(p===world&&h<1.5)m.renderOrder=-1000+Math.round(y*100);return m;};
 const cyl=(p:T.Object3D,c:number,x:number,y:number,z:number,r:number,h:number,live=false)=>mesh(p,cylG,c,[x,y,z],[r,h,r],live);
 const ball=(p:T.Object3D,c:number,x:number,y:number,z:number,r:number,live=false)=>mesh(p,ballG,c,[x,y,z],[r,r,r],live);
 const world=new T.Group();scene.add(world);box(world,0x588c73,26,-.7,0,110,1.2,58);box(world,0x91b480,26,-.08,0,106,.12,54);
 // Real geometry streets, pavements, crossings and connecting avenue.
 box(world,0x858a7b,26,.015,0,110,.12,5);for(const cx of [0,52]){box(world,0xd6c6a1,cx,.1,0,39,.22,33);box(world,0x798276,cx,.23,0,35,.14,29);box(world,0xd8c8a6,cx,.32,0,27,.22,21);box(world,0x9cb782,cx,.44,0,22,.12,16);for(const x of [-16,16])for(let z=-11;z<=11;z+=4)box(world,0xe9dfbf,cx+x,.32,z,.12,.03,1.8);for(const z of [-13,13])for(let x=-12;x<=12;x+=4)box(world,0xe9dfbf,cx+x,.32,z,1.8,.03,.12);for(let j=-2;j<=2;j++){box(world,0xeee5c9,cx+j*.8,.34,13,.5,.035,3);box(world,0xeee5c9,cx+j*.8,.34,-13,.5,.035,3);}}
 for(let x=21;x<32;x+=3)box(world,0xe7dec2,x,.1,0,1.6,.03,.14);
 function tree(x:number,z:number,size=1){cyl(world,0x795743,x,1*size,z,.19*size,2*size);ball(world,0x527d51,x,2.3*size,z,1.15*size);ball(world,0x719c5f,x-.5*size,2.7*size,z,.8*size);ball(world,0x8cab67,x+.6*size,2.35*size,z+.2,.75*size);}
 for(const cx of [0,52])for(let i=0;i<14;i++){const a=i*Math.PI*2/14;tree(cx+Math.cos(a)*22.5,Math.sin(a)*19.8,.8+(i%3)*.15);}
 function bench(p:T.Object3D,x:number,z:number){box(p,0x997153,x,.83,z,2.1,.18,.62);box(p,0xb4875e,x,1.23,z-.3,2.1,.64,.15);for(const dx of [-.75,.75])box(p,0x364c49,x+dx,.55,z,.12,.6,.5);}
 for(const cx of [0,52]){for(const x of [-7,7]){bench(world,cx+x,6);bench(world,cx+x,-6);}for(const x of [-10,10])for(const z of [-7,7]){cyl(world,0x354e49,cx+x,1.75,z,.07,2.8);ball(world,0xf7dda1,cx+x,3.2,z,.26);}}
 // Each district has a living plaza: sculpted fountain and rotating public art.
 const fountain=new T.Group();fountain.position.set(0,.5,0);world.add(fountain);cyl(fountain,0xa49d88,0,.15,0,3,.3);cyl(fountain,0x63acb5,0,.34,0,2.65,.07);cyl(fountain,0xbec1a6,0,1,0,.55,1.6);cyl(fountain,0xc6c8ad,0,1.8,0,1.35,.2);const water=new T.Group();fountain.add(water);for(let i=0;i<9;i++){const a=i*Math.PI*2/9;ball(water,0xb9e2e0,Math.cos(a)*1.7,.9,Math.sin(a)*1.7,.12,true);}dynamic.push(water);
 const sculpture=new T.Group();sculpture.position.set(52,1.8,0);world.add(sculpture);cyl(world,0xc8b99a,52,.7,0,2.3,.6);const torusG=geo(new T.TorusGeometry(1.45,.18,8,24));const art=mesh(sculpture,torusG,0xe8a253,[0,.4,0],[1,1,1],true);art.rotation.x=.5;dynamic.push(sculpture);
 const slots=[[-12,-19],[0,-19],[12,-19],[22,0],[12,19],[0,19],[-12,19],[-22,0]];
 const spots:Spot[]=[];const signTextures:T.Texture[]=[];
 for(let i=0;i<locations.length;i++){
  const l=locations[i],idx=l.district==='main'?i:i-7;const coords=slots[l.district==='main'&&idx===6?7:idx];const cx=l.district==='west'?52:0;const [sx,sz]=coords;const g=new T.Group();g.position.set(cx+sx,.25,sz);g.rotation.y=Math.atan2(-sx,-sz);world.add(g);const color=palette[i],outdoor=['THE PARK','GARDEN','TRANSIT'].includes(l.place);const tall=l.place==='APARTMENTS'?5.5:l.place==='CAMPUS'?4.1:3.35;
  box(g,0xe7d6b4,0,.08,0,8,.18,7);box(g,0xc1b398,0,.18,3.5,7.2,.2,1.6);
  if(!outdoor){box(g,color,0,tall/2+.2,-.5,6.6,tall,4.7);box(g,0xf0ddbd,0,.45,-.5,6.9,.4,4.9);box(g,0xefe0bd,0,tall+.15,-.5,7,.2,5.1);
   if(['APARTMENTS','CAMPUS','LIBRARY','COMMUNITY'].includes(l.place)){const roof=mesh(g,geo(new T.CylinderGeometry(0,5,1.6,4)),0x566b65,[0,tall+1,-.5],[1,.8,.8]);roof.rotation.y=Math.PI/4;}else{box(g,0x536d65,0,tall+.45,-.5,7.15,.55,5.3);box(g,0xadc2a5,1,tall+.86,-.4,1.3,.3,1.5);}
   for(const x of [-2.15,2.15]){box(g,0xeee0b8,x,1.95,1.91,1.6,1.65,.13);box(g,0x416d74,x,1.95,2,1.34,1.38,.09);box(g,0xd9caaa,x,1.95,2.08,.06,1.4,.04);box(g,0xd9caaa,x,1.95,2.08,1.4,.06,.04);box(g,0xc59363,x,1.08,2.12,1.65,.18,.4);for(const dx of [-.45,0,.45])ball(g,0x6a964f,x+dx,1.3,2.2,.2);}
   if(tall>4)for(const x of [-2,0,2]){box(g,0xf1dec1,x,4.25,1.91,1.3,1.25,.1);box(g,0x527b80,x,4.25,2,1.05,1.02,.1);}
   const awning=box(g,['CORNER CAFÉ','MARKET','ARCADE'].includes(l.place)?0xe6b56a:0x7f9f83,0,3.08,2.7,5.8,.15,1.5);awning.rotation.x=.13;for(const x of [-2.7,2.7])cyl(g,0xddd2ae,x,1.65,3.15,.06,2.8);
  }else{box(g,0x89a66a,0,.22,-.5,6.8,.15,5.5);if(l.place==='THE PARK'){for(const x of [-2,2])for(const z of [-1.5,1.5])cyl(g,0xe3d1ac,x,1.7,z,.1,3);mesh(g,coneG,0x638677,[0,3.4,0],[3.5,1.4,3.5]);bench(g,0,.5);}if(l.place==='GARDEN'){for(const x of [-2,0,2]){box(g,0x9a7050,x,.5,-.8,1.4,.45,3.3);box(g,0x665b3f,x,.75,-.8,1.2,.06,3.1);for(let z=-1.8;z<=.5;z+=.7)ball(g,0x678e49,x,.95,z,.32);}box(g,0xd1c79b,-2.4,1,2,1,.8,.6);}if(l.place==='TRANSIT'){for(const x of [-2.3,2.3])cyl(g,0x4a696b,x,1.6,0,.1,3);box(g,0x7bafa3,0,3.1,0,5.4,.25,3);box(g,0x80a4a5,0,1.7,-1.2,5,.1,2);bench(g,0,-.7);}}
  const hinge=new T.Group();hinge.position.set(-.6,.3,1.98);g.add(hinge);if(!outdoor){box(hinge,0x3d605e,.6,1.14,0,1.2,2.28,.18,true);box(hinge,0x8ab1ab,.6,1.48,.11,.85,1.1,.03,true);ball(hinge,0xe9c882,1.04,1,.16,.08,true);}
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
  const door=g.localToWorld(new T.Vector3(0,.65,4.65));const center=g.localToWorld(new T.Vector3(0,tall/2,0));const hit=new T.Mesh(new T.BoxGeometry(7.5,tall+1,7.6),new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));hit.position.set(0,tall/2+.4,0);g.add(hit);hit.userData.place=l.place;geometries.push(hit.geometry);
  prop.traverse(o=>{o.userData.place=l.place;o.userData.prop=true;});
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=100;const ctx=canvas.getContext('2d')!;ctx.fillStyle='#183e37';ctx.beginPath();ctx.roundRect(3,3,506,94,18);ctx.fill();ctx.strokeStyle='#d5bd80';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#fff0cb';ctx.font='bold 35px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(l.name,256,50,470);const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;signTextures.push(texture);const sign=new T.Sprite(new T.SpriteMaterial({map:texture,depthTest:true}));sign.position.set(0,outdoor?4.2:tall+2.1,0);sign.scale.set(8.5,1.66,1);g.add(sign);
  spots.push({place:l.place,name:l.name,district:l.district,center,door,group:g,hinge,prop,hit,phase:-100});
 }
 // Bake stationary assets by shared material: detailed world, only a few dozen draw calls.
 world.updateMatrixWorld(true);const buckets=new Map<string,{material:T.Material;order:number;gs:T.BufferGeometry[]}>();for(const m of statics){const clone=m.geometry.clone().applyMatrix4(m.matrixWorld);const material=m.material as T.Material,key=material.uuid+':'+m.renderOrder;if(!buckets.has(key))buckets.set(key,{material,order:m.renderOrder,gs:[]});buckets.get(key)!.gs.push(clone);m.removeFromParent();}for(const {material,order,gs} of buckets.values()){const merged=mergeGeometries(gs);gs.forEach(g=>g.dispose());if(merged){geometries.push(merged);const m=new T.Mesh(merged,material);m.renderOrder=order;m.castShadow=true;m.receiveShadow=true;scene.add(m);}}
 return{spots,dynamic,animate:(time:number,reduced:boolean)=>{water.rotation.y=reduced?0:time*.28;sculpture.rotation.y=reduced?.3:time*.2;for(const s of spots){const t=time-s.phase;const wave=t>=0&&t<2&&!reduced?Math.sin(t*Math.PI*3)*(1-t/2):0;s.prop.rotation.y=wave*.7;s.prop.position.y=.4+Math.abs(wave)*.7;s.hinge.rotation.y=t>=0&&t<2?-Math.sin(Math.min(1,t)*Math.PI/2)*1.1:0;}},dispose:()=>{new Set(geometries).forEach(g=>g.dispose());materials.forEach(m=>m.dispose());signTextures.forEach(t=>t.dispose());spots.forEach(s=>(s.hit.material as T.Material).dispose());}};
}
