import * as T from 'three';
import {coldPaintWeather,snowPaintWeather,createRegionPaintMaterial,paintRegionGeometry,regionPaintId,regionPaintStyles,setRegionPaintQuality,type PaintRole} from './region-paint';
import {regionLayout,layoutRoute,type LayoutPoint} from './region-layouts';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {locations} from '@/lib/locations';
import type {Weather} from '@/lib/weather';
type Spot={place:string;name:string;district:string;center:T.Vector3;door:T.Vector3;group:T.Group;hinge:T.Group;prop:T.Group;hit:T.Mesh;phase:number};
import {regionDefinitions,type WorldVenueState} from '@/lib/world-life';

export type TownActor={id:string;name:string;spot:string};
export type RegionTownEvolution={revision?:number;visit?:number;venueStates?:Record<string,WorldVenueState>;placeNames?:Record<string,string>;actors?:TownActor[]};

/** Stable place IDs use regional coordinates and heights from one shared street graph. */
const outdoorPlaces=new Set(['THE PARK','GARDEN','TRANSIT']);
const noRaycast:T.Mesh['raycast']=()=>{};
/** Presentation-only character. Regional travel geometry lives in region-layouts; game rules stay in the engine. */
export const regionSettlements={
 alder:{kind:'urban-port',focus:'community and mutual aid'},
 saffron:{kind:'coastal-suburban',focus:'evening arts and social life'},
 glasssteppe:{kind:'urban-rail-city',focus:'study, practical research and making'},
 pelagia:{kind:'harbor-town-rural-hinterland',focus:'ecology, public engineering and local memory'},
 embermesa:{kind:'dispersed-rural',focus:'craft, outdoors and practical skills'},
} as const;


/** All renderables/resources belong to group; rebuilding or disposing cannot leave ghost towns. */
export function buildRegionTown(scene:T.Scene,requestedRegion:string,visiblePlaces:string[],closedPlaces:string[],compatibility=false,evolution:RegionTownEvolution={}){
 const region=regionPaintId(requestedRegion),layout=regionLayout(region);
 const p=regionPaintStyles[region].palette,visible=new Set(visiblePlaces),closed=new Set(closedPlaces);
 const group=new T.Group();group.scale.set(layout.scale,1,layout.scale);group.name=`region:${region}`;group.userData.region=region;group.userData.localeRevision=evolution.revision??0;group.userData.visitCount=evolution.visit??1;group.userData.paintStyle=regionPaintStyles[region].name;group.userData.settlement=regionSettlements[region].kind;group.userData.socialFocus=regionSettlements[region].focus;scene.add(group);
 const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>(),textures=new Set<T.Texture>();
 const paint=new Map<string,T.MeshStandardMaterial>(),staticByOwner=new Map<T.Group,T.Mesh[]>(),dynamic:T.Object3D[]=[];
 const residents:{group:T.Group;base:T.Vector3;phase:number;legs:T.Object3D[];arms:T.Object3D[];walking:boolean}[]=[];
 let disposed=false;
 const geometry=<G extends T.BufferGeometry>(g:G)=>{geometries.add(g);return g;};
 const boxGeometry=geometry(new T.BoxGeometry(1,1,1)),cylinderGeometry=geometry(new T.CylinderGeometry(1,1,1,compatibility?6:region==='pelagia'?8:10));
 const coneGeometry=geometry(new T.ConeGeometry(1,1,compatibility?5:8)),rockGeometry=geometry(new T.IcosahedronGeometry(1,0));
 const domeGeometry=geometry(new T.SphereGeometry(1,compatibility?8:region==='pelagia'?10:12,compatibility?4:region==='pelagia'?5:6,0,Math.PI*2,0,Math.PI/2));
 const archGeometry=geometry(new T.TorusGeometry(1,.11,4,compatibility?8:region==='pelagia'?10:12,Math.PI));
 const ringGeometry=geometry(new T.TorusGeometry(1,.095,4,compatibility?10:region==='pelagia'?12:16));
 const gableGeometry=geometry(new T.BufferGeometry());
 // A solid triangular prism with a vertical front/rear and a pitched ridge.
 const roofVertices=[-1,0,-1,1,0,-1,0,1,-1,-1,0,1,0,1,1,1,0,1, -1,0,-1,-1,0,1,1,0,1,-1,0,-1,1,0,1,1,0,-1, -1,0,-1,0,1,-1,0,1,1,-1,0,-1,0,1,1,-1,0,1, 1,0,-1,1,0,1,0,1,1,1,0,-1,0,1,1,0,1,-1];
 // Reverse the authored faces to keep outward normals (especially both visible roof slopes).
 for(let i=0;i<roofVertices.length;i+=9)for(let k=0;k<3;k++){const v=roofVertices[i+3+k];roofVertices[i+3+k]=roofVertices[i+6+k];roofVertices[i+6+k]=v;}
 gableGeometry.setAttribute('position',new T.Float32BufferAttribute(roofVertices,3));gableGeometry.computeVertexNormals();gableGeometry.setAttribute('uv',new T.Float32BufferAttribute(Array(roofVertices.length/3*2).fill(0),2));
 const material=(color:number,role:PaintRole='solid')=>{const key=`${color}:${role}`;let m=paint.get(key);if(!m){m=createRegionPaintMaterial(region,color,role,compatibility);paint.set(key,m);materials.add(m);}return m;};
 const mesh=(owner:T.Group,g:T.BufferGeometry,color:number,x:number,y:number,z:number,sx:number,sy:number,sz:number,role:PaintRole='solid',live=false)=>{
  const m=new T.Mesh(g,material(color,role));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=role!=='water';m.receiveShadow=true;owner.add(m);
  if(!live){if(!staticByOwner.has(owner))staticByOwner.set(owner,[]);staticByOwner.get(owner)!.push(m);}return m;
 };
 const box=(o:T.Group,c:number,x:number,y:number,z:number,w:number,h:number,d:number,role:PaintRole='solid',live=false)=>{
  const big=Math.max(w,d)>8,shape=big?geometry(new T.BoxGeometry(w,h,d,Math.ceil(w/4),1,Math.ceil(d/4))):boxGeometry;
  const m=mesh(o,shape,c,x,y,z,big?1:w,big?1:h,big?1:d,role,live);
  if(o===group&&((h<1.5&&big)||(y<0&&big)))m.renderOrder=-1500+Math.round((y+h/2)*100);return m;
 };
 const cyl=(o:T.Group,c:number,x:number,y:number,z:number,r:number,h:number,role:PaintRole='solid',live=false)=>mesh(o,cylinderGeometry,c,x,y,z,r,h,r,role,live);
 const rock=(o:T.Group,c:number,x:number,y:number,z:number,sx:number,sy=sx,sz=sx,role:PaintRole='solid',live=false)=>mesh(o,rockGeometry,c,x,y,z,sx,sy,sz,role,live);
 const cone=(o:T.Group,c:number,x:number,y:number,z:number,r:number,h:number)=>mesh(o,coneGeometry,c,x,y,z,r,h,r);
 const dome=(o:T.Group,c:number,x:number,y:number,z:number,r:number,h=r)=>mesh(o,domeGeometry,c,x,y,z,r,h,r);
 const gable=(o:T.Group,x:number,y:number,z:number,w:number,d:number,rise:number,c=p.roof)=>{const m=mesh(o,gableGeometry,c,x,y,z,w/2,rise,d/2);box(o,0xe5e9e3,x,y+.045,z,w,.09,d,'snow');return m;};
 function arch(o:T.Group,x:number,y:number,z:number,r:number,c=p.trim){mesh(o,archGeometry,c,x,y,z,r,r,.9);for(const s of [-1,1])cyl(o,c,x+s*r,y/2,z,.13,y);}
 function window(o:T.Group,x:number,y:number,z:number,w=1,h=1.2){box(o,p.trim,x,y,z,w+.18,h+.18,.13);box(o,region==='pelagia'?0x477f84:0x45626b,x,y,z+.08,w,h,.055,'window');box(o,p.trim,x,y,z+.12,.07,h,.06);}
 function bench(o:T.Group,x:number,z:number){box(o,p.wood,x,.77,z,1.9,.16,.55);box(o,p.wood,x,1.08,z-.23,1.9,.5,.12);for(const d of [-.7,.7])box(o,p.trim,x+d,.47,z,.12,.5,.44);}
 function tree(o:T.Group,x:number,z:number,size=1){
  if(region==='saffron'){
   const trunk=cyl(o,p.wood,x,1.75*size,z,.16*size,3.5*size);trunk.rotation.z=.06;
   for(let k=0;k<4;k++){const angle=k*Math.PI/2,leaf=rock(o,p.leaf,x+Math.cos(angle)*.68*size,3.55*size,z+Math.sin(angle)*.68*size,1.14*size,.15*size,.34*size,'leaf');leaf.rotation.y=-angle;leaf.rotation.z=.18;}
  }else if(region==='glasssteppe'){
   cyl(o,p.wood,x,.85*size,z,.16*size,1.7*size);for(let k=0;k<3;k++)mesh(o,coneGeometry,p.leaf,x,(1.5+k*.68)*size,z,(1.03-k*.2)*size,1.85*size,(1.03-k*.2)*size,'leaf');
  }else if(region==='pelagia'){
   for(let k=0;k<3;k++){const stem=cyl(o,k%2?p.accent:p.leaf,x+(k-1)*.35*size,(.7+k*.12)*size,z,.11*size,(1.4+k*.24)*size);stem.rotation.z=(k-1)*.4;rock(o,k%2?p.accent:p.leaf,x+(k-1)*.6*size,(1.4+k*.24)*size,z,.5*size,.62*size,.42*size);}
  }else{
   cyl(o,p.wood,x,1.2*size,z,.16*size,2.4*size);rock(o,p.leaf,x,2.8*size,z,1.12*size,1.32*size,1.05*size,'leaf');rock(o,0x8eaa6e,x+.62*size,2.25*size,z,.72*size,.9*size,.8*size,'leaf');
  }
 }
 function water(x:number,z:number,w:number,d:number,y=-.25){const m=box(group,p.water,x,y,z,w,.12,d,'water');m.name='regional-water';return m;}
 function ripple(x:number,z:number,r:number){const m=mesh(group,ringGeometry,region==='pelagia'?0x9cd5ca:0xa3ccc2,x,-.17,z,r,r*.56,r,'solid',true);m.rotation.x=-Math.PI/2;m.userData.ripple=true;m.userData.baseScale=m.scale.clone();dynamic.push(m);}
 function plaza(cx:number){
  const paved=region==='pelagia'?7.3:region==='embermesa'?6.6:8.5;cyl(group,p.path,cx,.16,0,paved,.35);cyl(group,region==='pelagia'?0x77b6ac:region==='saffron'?0xa6b191:p.ground,cx,.37,0,paved-1.25,.14);
  for(const x of [-5.2,5.2]){bench(group,cx+x,-.1);tree(group,cx+x,-3,.75);}
  for(const z of [-5.4,5.4])for(const x of [-5.4,5.4]){cyl(group,p.wood,cx+x,1.56,z,.07,2.6);rock(group,0xf4d997,cx+x,2.92,z,.2,.3,.2,'window');}
 }
 // The regional landscape changes its topology: quay, canals, cliff terraces, or tidal platforms.
 if(region==='alder'){
  box(group,0x658369,26,-.85,0,111,1.3,58);box(group,p.ground,26,-.12,2.8,109,.25,51.4);
  water(26,-26.8,111,7.2);box(group,0x969986,26,.12,-23.1,111,.7,1.2);
  for(let x=-23;x<80;x+=7){box(group,p.wood,x,.22,-25.4,3.2,.23,4.2);for(const dz of [-23.8,-27])cyl(group,p.wood,x-1.3,-.06,dz,.13,1.3);}
   for(let x=-25;x<80;x+=6.5)tree(group,x,25,1+(x%3)*.025);
 }else if(region==='saffron'){
  box(group,0xaa825d,26,-1.4,0,111,2.1,58);for(const [left,right] of [[-28.5,22.9],[29.1,80.5]])for(const [near,far] of [[-28.5,-9.8],[-6.2,6.2],[9.8,28.5]])box(group,p.ground,(left+right)/2,-.22,(near+far)/2,right-left,.22,far-near);
  for(const z of [-8,8]){water(26,z,110,3.3);for(const side of [-1,1])box(group,p.trim,26,.13,z+side*1.8,110,.7,.35);}
  water(26,0,5.4,58);for(const x of [22.9,29.1])box(group,p.trim,x,.1,0,.38,.65,58);
  for(let x=-24;x<81;x+=14){tree(group,x,25,.9);const dune=rock(group,0xc39a69,x,-.4,-28,5.3,2.1,2.4);dune.rotation.y=.25;}
  // Moored narrow canal boats sit below the sandstone parapets.
  for(const x of [-10,9,42,61]){box(group,p.wood,x,.02,8,2.8,.28,1);box(group,p.accent,x,.28,8,1.3,.3,.8);cyl(group,p.trim,x,.9,8,.04,1.5);}
 }else if(region==='glasssteppe'){
  water(26,0,113,61,-4.6);
  for(const cx of [0,52]){box(group,0x647775,cx,-2.5,0,49,4.4,54);box(group,0x8c9892,cx,-1.05,0,46,2,51);box(group,p.ground,cx,-.18,0,43,.35,48);
   // Actual height tiers beneath the upper streets, joined by the authored ramps.
   box(group,p.wall,cx,1.15,-18,43,2.3,12);box(group,p.path,cx,2.36,-18,43,.12,12);box(group,p.wall,cx,.55,5.5,43,1.1,5);box(group,p.path,cx,1.16,5.5,43,.12,5);
   for(const z of [-26,26])for(let i=0;i<8;i++){const x=cx-22+i*6.3;rock(group,i%2?0x738786:0x97a4a0,x,-1,z,4,2.8,2.1);}
   for(const side of [-1,1])for(let k=0;k<4;k++)box(group,p.trim,cx+side*(20+k*.6),-.04-k*.25,8,1.6,.28,8);
   for(let i=0;i<5;i++){const x=cx-20+i*9;rock(group,i%2?0x879798:0xa6b1aa,x,1.5,-30,6,5+i%3*1.5,4);cone(group,0xe4e8e2,x,6.4+i%3*1.4,-30,2.7,1.6);tree(group,x,25,.95);}
  }
  // Copper rail viaduct and exposed supports span the actual gap between the plateaux.
  box(group,p.trim,26,.13,0,16,.5,5);for(const z of [-2.5,2.5]){box(group,p.accent,26,1,z,16,.15,.14,'copper');for(let x=19;x<=33;x+=2){box(group,p.accent,x,.64,z,.1,.9,.1,'copper');const brace=box(group,p.accent,x,.64,z,2.4,.1,.1,'copper');brace.rotation.z=.35;}}
  for(const x of [22,30])box(group,0x647775,x,-2,0,1.4,4.2,3.4);
  for(const z of [-1.05,1.05])box(group,0x687375,26,.43,z,17,.1,.12);for(let x=18;x<35;x+=.85)box(group,p.wood,x,.36,0,.2,.12,2.65);
 }else if(region==='embermesa'){
  box(group,0xae7c55,26,-1.25,0,112,2,59);box(group,p.ground,26,-.19,0,110,.22,57);
  // Working railway at the town edge, safe pedestrian platforms and long red mesas.
  for(const z of [-25,-23.7])box(group,0x6c7570,26,.05,z,110,.13,.1);
  for(let x=-28;x<82;x+=1.1)box(group,p.wood,x,-.02,-24.35,.23,.1,2.1);
  for(let i=0;i<9;i++){const x=-26+i*13;box(group,i%2?0xb27450:0xc4875d,x,.8,-29.5,10,2.2,5);box(group,0xca9868,x,2.1,-29.5,8.4,.42,4.8);rock(group,0xab7954,x,2.25,-29.5,4.3,1.1,2.1);}
  for(let x=-23;x<83;x+=9){tree(group,x,25,.82);rock(group,p.accent,x+2,.13,24,.5,.25,.5);}
  for(const cx of [0,52]){box(group,p.trim,cx-10,.45,-5,3,.7,1.4);box(group,p.water,cx-10,.84,-5,2.65,.09,1.1,'water');}
 }else{
  water(26,0,116,67,-.4);box(group,0x287a87,26,-2.3,0,116,3.6,67);
  for(const cx of [0,52]){cyl(group,p.trim,cx,-.05,0,8.9,.8);cyl(group,p.path,cx,.23,0,8.35,.3);
   for(let i=0;i<10;i++){const a=i*Math.PI*2/10,x=cx+Math.cos(a)*11,z=Math.sin(a)*9.5;rock(group,i%2?p.accent:0x77bbaa,x,-.35,z,.65,.85,.6);}
  }
  // Seaward floodgates, tidal wheels and broken coral arcs define a drowned city skyline.
  for(const x of [-25,26,78]){for(const dx of [-2.5,2.5]){cyl(group,p.trim,x+dx,1.3,-25,.8,4);dome(group,p.roof,x+dx,3.3,-25,1.15,.95);}box(group,p.trim,x,3.7,-25,6.6,.55,1.2);box(group,p.accent,x,.7,-25,3.8,2.9,.23);for(let i=0;i<6;i++)box(group,p.roof,x-1.5+i*.6,.7,-24.82,.12,2.8,.12);}
  for(const x of [-17,19,43,70]){const wheel=mesh(group,ringGeometry,p.accent,x,.7,26,1.6,1.6,1.6,'copper',true);for(let i=0;i<6;i++){const spoke=box(new T.Group(),p.accent,0,0,0,.12,3,.1);staticByOwner.delete(spoke.parent as T.Group);spoke.rotation.z=i*Math.PI/3;wheel.add(spoke);}dynamic.push(wheel);}
  for(let i=0;i<12;i++)ripple(-22+i*9,18+(i%3)*4,1.5+i%2);
 }

 // Background homes have no venue names, inhabitants, hit areas or hidden-place information.
 // Urban massing is kept behind the playable lots; the authored street graph stays unobstructed.
 const settlement=new T.Group();settlement.name='settlement-backdrop';settlement.userData={decorative:true,kind:regionSettlements[region].kind,homes:0};group.add(settlement);
 function backgroundHome(x:number,z:number,w:number,d:number,h:number,roofRise:number){
  const home=new T.Group();home.position.set(x,0,z);home.name='background-home';home.userData.decorative=true;settlement.add(home);
  box(home,p.wall,0,h/2+.3,0,w,h,d);box(home,p.trim,0,.23,0,w+.25,.3,d+.2);
  if(roofRise)mesh(home,gableGeometry,p.roof,0,h+.3,0,(w+.3)/2,roofRise,(d+.3)/2);else box(home,p.roof,0,h+.4,0,w+.3,.2,d+.3);
  for(const y of h>5?[1.6,3.8,5.8]:[1.55])for(const x of [-w*.24,w*.24])box(home,0x526e75,x,Math.min(y,h-.3),d/2+.025,.52,.7,.06,'window');
  // Batch the entire backdrop by material instead of adding a draw call per house.
  const forms=staticByOwner.get(home);if(forms){if(!staticByOwner.has(settlement))staticByOwner.set(settlement,[]);staticByOwner.get(settlement)!.push(...forms);staticByOwner.delete(home);}
  settlement.userData.homes++;
 }
 if(region==='alder'){
  // A dense working waterfront across the quay, with a continuous masonry street edge.
  box(settlement,0x7e8d75,26,-.2,-35,113,.8,8.8);box(settlement,p.path,26,.3,-31.5,113,.18,1.45);
  for(let i=0;i<20;i++)backgroundHome(-27+i*5.55,-35,5.15,4.1,5.5+(i%3)*1.35,.9);
  for(const x of [-23,7,37,67]){box(settlement,p.wood,x,.65,-32.6,1.2,.8,1.2);box(settlement,p.trim,x,.98,-32.6,1.25,.08,1.25);}
 }else if(region==='glasssteppe'){
  // Compact apartment/laboratory blocks share the existing cliff terrace, below the mountains.
  for(const cx of [0,52])for(let i=0;i<6;i++)backgroundHome(cx-19+i*7.6,-25,6.8,2.4,5.4+(i%3)*1.25,1.3);
  for(const cx of [0,52]){box(settlement,p.path,cx,.35,-22.8,44,.15,1.35);for(const x of [-14,14]){box(settlement,p.trim,cx+x,.8,-22.7,1.1,.9,.45);box(settlement,p.roof,cx+x,1.42,-22.7,1.2,.45,.5);}}
 }else if(region==='saffron'){
  // Low-rise homes are separated by real garden courts, with no extra shopfront clutter.
  for(const cx of [0,52])for(const x of [-19,0,19]){
   box(settlement,0xa7b494,cx+x,.02,25.5,9,.16,5.6);backgroundHome(cx+x,26,4.4,2.8,2.45,0);
   for(const side of [-1,1]){box(settlement,p.trim,cx+x+side*3.5,.3,25.5,.3,.6,4.8);rock(settlement,p.leaf,cx+x+side*3.5,.72,24.6,.85,.45,.7,'leaf');}
  }
 }else if(region==='embermesa'){
  // Sparse plots and field edges leave exposed land between the modest rural service buildings.
  for(const cx of [0,52]){box(settlement,0x8c705c,cx+15,.035,26,13,.12,3.8);for(let i=0;i<5;i++)box(settlement,p.ground,cx+10+i*2.4,.12,26,.8,.1,3.3);
   for(let i=0;i<6;i++)box(settlement,p.wood,cx+8.5+i*2.6,.64,28,.11,1.3,.11);box(settlement,p.wood,cx+15,.97,28,13,.11,.1);
   rock(settlement,p.wall,cx-22,.25,22,1.1,.5,.7);rock(settlement,p.roof,cx-20,.18,23,.6,.32,.5);
  }
 }else{
  // Low coastal cottages and mangrove islets establish a small harbor with a rural hinterland.
  for(const cx of [0,52]){rock(settlement,p.trim,cx,-.25,-32,22,1.5,5);rock(settlement,0x83aa91,cx,.12,-32.5,20,1.4,4.5);
   for(const x of [-11,10])backgroundHome(cx+x,-31,3.5,2.6,2.2,.6);
   for(const x of [-18,-4,4,18]){cyl(settlement,p.wood,cx+x,1.1,-32,.13,2.1);rock(settlement,p.leaf,cx+x,2.2,-32,1.5,1.1,1.1,'leaf');}
  }
 }

 for(const cx of [0,52])plaza(cx);
 // Landmarks are architectural objects, not recolored versions of one fountain.
 if(region==='alder'){
  cyl(group,p.trim,0,.65,-2,2.1,.6);cyl(group,p.water,0,.98,-2,1.78,.08,'water');cyl(group,p.trim,0,1.55,-2,.3,1.2);cyl(group,p.trim,0,2.07,-2,1,.16);
  box(group,p.wall,52,2.2,-2,1.8,4,1.8);gable(group,52,4.3,-2,2.4,2.4,1.3);window(group,52,3.3,-1.04,.8,.8);
 }else if(region==='saffron'){
  cyl(group,p.accent,0,.62,-2.2,2.3,.34);cyl(group,p.water,0,.83,-2.2,1.92,.07,'water');for(const dx of [-1.9,1.9])for(const dz of [-1.9,1.9])cyl(group,p.trim,dx,2,-2.2+dz,.14,3.1);dome(group,p.roof,0,3.55,-2.2,2.65,1.1);
  box(group,p.wall,52,2.3,-2.2,1.9,4.2,1.9);for(let k=0;k<3;k++)box(group,p.trim,52,3.7+k*.5,-2.2,2.8-k*.55,.32,2.8-k*.55);cyl(group,p.accent,52,5.1,-2.2,.07,.6);
 }else if(region==='glasssteppe'){
  for(const cx of [0,52]){box(group,p.wall,cx,2.3,-2.5,1.6,4.2,1.6);box(group,p.trim,cx,4.25,-2.5,2.3,.3,2.3);cone(group,p.accent,cx,5.65,-2.5,1.85,2.6);const dial=cyl(group,p.trim,cx,3.55,-1.62,.58,.09);dial.rotation.x=Math.PI/2;box(group,p.roof,cx,3.66,-1.55,.06,.35,.04);}
 }else if(region==='embermesa'){
  box(group,p.wood,0,2.4,-2.5,1.8,4.3,1.8);box(group,p.trim,0,4.6,-2.5,2.4,.3,2.3);gable(group,0,4.78,-2.5,2.65,2.6,1.1);
  const dial=cyl(group,p.trim,0,3.7,-1.54,.58,.09);dial.rotation.x=Math.PI/2;box(group,p.roof,.1,3.77,-1.48,.3,.07,.04);
  for(const x of [-1.3,1.3])for(const z of [-3.8,-1.2])box(group,p.wood,52+x,2.1,z,.2,3.7,.2);
  for(const z of [-3.8,-1.2]){const a=box(group,p.trim,52,2,z,3.9,.14,.14);a.rotation.z=.8;const b=box(group,p.trim,52,2,z,3.9,.14,.14);b.rotation.z=-.8;}
  cyl(group,p.wood,52,4.85,-2.5,1.9,2.25);for(const y of [3.9,4.8,5.7])cyl(group,p.roof,52,y,-2.5,1.94,.11);cone(group,p.roof,52,6.35,-2.5,2.2,.8);
 }else{
  for(const cx of [0,52]){cyl(group,p.trim,cx,.7,-2.4,2.6,.6);for(let i=0;i<6;i++){const a=i*Math.PI/3;cyl(group,p.trim,cx+Math.cos(a)*1.75,2.7,-2.4+Math.sin(a)*1.75,.17,3.5);}dome(group,p.roof,cx,4.45,-2.4,2.25,1.6);cyl(group,p.accent,cx,6.3,-2.4,.11,1.1);rock(group,0xc9f1df,cx,6.85,-2.4,.32,.52,.32,'window');}
 }

 function alderBuilding(o:T.Group,index:number,place:string){
  const h=place==='APARTMENTS'?5.5:place==='CAMPUS'?4.4:3.45;
  box(o,index%3===0?0xd39a75:p.wall,0,h/2+.35,-.5,6.5,h,4.8);gable(o,0,h+.36,-.5,7,5.15,place==='CAMPUS'?1.9:1.35);
  for(const y of h>5?[1.7,4.1]:[1.8])for(const x of [-2.1,2.1])window(o,x,y,1.94,1.18,1.35);
  for(const x of [-2.15,2.15]){box(o,p.trim,x,2.6,2.1,1.4,.16,.55);box(o,p.leaf,x,2.81,2.12,1.16,.3,.4,'leaf');}
  box(o,p.wall,2.1,h+1,-1.7,.6,2,.6);box(o,p.trim,2.1,h+2,-1.7,.82,.2,.82);
  if(place==='CAMPUS'||place==='LIBRARY'){box(o,p.trim,0,h+.8,-.5,1.6,2.3,1.5);cone(o,p.roof,0,h+2.65,-.5,1.35,1.65);}
  if(place==='WORK'||place==='MAKERSPACE'){for(const x of [-2.3,2.3])box(o,p.wood,x,1,2.8,1.1,1.2,.9);}
  if(place==='CINEMA'){box(o,p.accent,0,3.2,2.65,6.9,.6,1.5);for(let x=-3;x<=3;x+=.6)rock(o,0xffdc91,x,2.92,3.35,.07,.07,.07,'window');}
  // Cargo hoist and recessed loading shutter distinguish this working port's workshops.
  if(place==='WORK'||place==='MAKERSPACE'){box(o,p.trim,-3.32,2.15,-.6,.12,2.5,1.65);for(let k=0;k<5;k++)box(o,p.wood,-3.4,1.2+k*.4,-.6,.12,.09,1.5);box(o,p.roof,-2.8,h+.2,-1.9,1.2,.15,.17);cyl(o,p.trim,-3.3,h-.35,-1.9,.055,1.1);}
  return h+2.5;
 }
 function saffronBuilding(o:T.Group,index:number,place:string){
  const h=place==='APARTMENTS'?5.25:3.4;
  // Minimalist gouache: quiet courtyard volumes, one entry arch, and unbroken matte roofs.
  box(o,p.wall,0,h/2+.35,-1.65,6.7,h,2.4);
  for(const side of [-1,1])box(o,p.wall,side*2.8,1.85,.25,1,3,3.2);
  box(o,p.trim,0,h+.46,-1.65,7,.2,2.7);
  for(const side of [-1,1])box(o,p.trim,side*2.8,3.43,.25,1.25,.18,3.55);
  arch(o,0,2.17,2.07,1.03);box(o,p.trim,0,3.28,2.07,2.55,.18,.4);
  for(const x of [-2,2])window(o,x,1.85,-.4,.85,1.15);
  if(h>5)for(const x of [-1.7,1.7])window(o,x,4.2,-.4,.85,1.15);
  if(place==='COMMUNITY'||place==='LIBRARY')dome(o,p.roof,0,h+.55,-1.4,1.45,.75);
  // One restrained shade plane identifies a working waterfront venue without extra clutter.
  if(['CORNER CAFÉ','MARKET','WORK','MAKERSPACE'].includes(place)){
   box(o,p.accent,0,2.85,2.95,4.5,.1,1.8);
   for(const x of [-2.15,2.15])cyl(o,p.wood,x,1.48,3.6,.07,2.7);
  }
  // A single recessed courtyard water basin adds structure without surface ornament.
  if(place==='APARTMENTS'||place==='COMMUNITY'){box(o,p.trim,0,.5,-.7,1.8,.25,1.2);box(o,p.water,0,.65,-.7,1.5,.04,.9,'water');}
  return h+2.6;
 }
 function glassBuilding(o:T.Group,index:number,place:string){
  const h=place==='APARTMENTS'?5:3.45;
  box(o,index%2?p.wall:0xa2aaa5,0,h/2+.4,-.5,6.5,h,4.8);for(const y of [.65,1.7,2.85])box(o,p.trim,0,y,1.96,6.62,.12,.15);
  gable(o,0,h+.42,-.5,7.15,5.15,2.8);box(o,p.accent,0,h+3.22,-.5,.15,.17,5.4,'copper');
  for(const x of [-2.12,2.12]){window(o,x,1.9,2,1.03,1.5);box(o,p.trim,x,h+1.05,1.45,1.25,1.1,1.15);gable(o,x,h+1.6,1.45,1.5,1.3,.8,p.accent);window(o,x,h+1.04,2.06,.67,.75);}
  for(const side of [-1,1]){const buttress=box(o,p.wall,side*3.38,1.5,.9,.55,2.8,.75);buttress.rotation.z=-side*.1;}
  if(['CAMPUS','LIBRARY','CINEMA'].includes(place)){cyl(o,p.wall,-2.45,h+.05,-1.6,.86,3.4);cone(o,p.accent,-2.45,h+2.55,-1.6,1.2,1.9);}
  if(place==='WORK'||place==='MAKERSPACE'){box(o,p.accent,0,2.9,2.7,4.5,.18,1.5,'copper');for(const x of [-1.95,1.95])box(o,p.trim,x,1.65,3.2,.16,2.5,.16);box(o,p.wall,2.2,h+1.55,-1.7,.6,2.8,.6);}
  // Glazed upper study bay on the academic buildings, kept inside the existing footprint.
  if(place==='CAMPUS'||place==='LIBRARY'){box(o,p.trim,2.9,h-.15,-.9,.45,1.8,2.2);for(const z of [-1.55,-.9,-.25])box(o,0x78999c,3.15,h-.15,z,.06,1.45,.5,'window');}
  return h+3.7;
 }
 function pelagiaBuilding(o:T.Group,index:number,place:string){
  const h=place==='APARTMENTS'?5.1:3.4;
  cyl(o,index%2?p.wall:0xa4d0c5,0,h/2+.55,-.45,2.85,h);dome(o,p.roof,0,h+.55,-.45,3.13,1.85);
  cyl(o,p.trim,0,h+.53,-.45,3.24,.24);cyl(o,p.accent,0,h+2.7,-.45,.075,.75);
  for(const x of [-2.1,2.1]){cyl(o,p.trim,x,1.35,1.72,.16,2.35);arch(o,x,2.35,1.9,.65,p.accent);window(o,x,1.6,2.02,.75,1.05);}
  for(const x of [-2.7,2.7]){cyl(o,p.trim,x,1.3,-1.8,.54,2);dome(o,p.accent,x,2.32,-1.8,.74,.6);}
  for(const side of [-1,1]){const fin=box(o,p.trim,side*2.8,2,-.5,.22,3.5,1.05);fin.rotation.z=-side*.2;}
  if(place==='CAMPUS'||place==='LIBRARY'){cyl(o,p.wall,-2.8,3.2,-1.4,.55,5.4);dome(o,p.accent,-2.8,5.94,-1.4,.8,.9);cyl(o,p.trim,-2.8,7,-1.4,.055,.7);}
  if(place==='CORNER CAFÉ'||place==='MARKET'){for(const x of [-1.8,1.8]){dome(o,p.accent,x,2.35,3,.9,.4);cyl(o,p.trim,x,1.55,3,.05,1.6);}}
  // Raised rainwater tank and drain on the public engineering and community buildings.
  if(place==='WORK'||place==='COMMUNITY'){cyl(o,p.trim,2.45,1.55,-1.8,.53,2.4);dome(o,p.accent,2.45,2.78,-1.8,.6,.25);box(o,p.trim,2.85,.5,-1.8,.13,.14,1.6);}
  return Math.max(h+3.5,place==='CAMPUS'||place==='LIBRARY'?7.8:0);
 }
 function mesaBuilding(o:T.Group,index:number,place:string){
  const h=place==='APARTMENTS'?5.25:3.5;
  box(o,index%3===0?0xc69d73:p.wall,0,h/2+.35,-.6,6.6,h,4.7);gable(o,0,h+.35,-.6,6.9,4.9,.7);
  // Tall timber false fronts, broad covered porches and stepped cornices.
  box(o,p.wall,0,h+.5,1.88,6.8,1.25,.38);box(o,p.trim,0,h+1.17,1.88,7.1,.18,.56);box(o,p.wall,0,h+1.23,1.88,3.4,.7,.38);box(o,p.trim,0,h+1.64,1.88,3.8,.16,.56);
  for(let y=.65;y<h+.9;y+=.39)box(o,p.wood,0,y,2.1,6.55,.04,.055);
  box(o,p.wood,0,.4,2.85,7.45,.2,2);box(o,p.roof,0,2.88,2.85,7.55,.18,2.1);for(const x of [-3.25,-1.35,1.35,3.25])box(o,p.trim,x,1.65,3.65,.14,2.35,.14);
  for(const x of [-2.15,2.15])window(o,x,1.8,2.16,1.28,1.55);if(h>5)for(const x of [-2.2,0,2.2])window(o,x,4.1,2.15,1.1,1.5);
  for(const x of [-2.4,2.4]){box(o,p.trim,x,.63,3.05,.65,.5,.65);rock(o,p.leaf,x,1.07,3.05,.42,.5,.42,'leaf');}
  if(place==='MAKERSPACE'||place==='WORK'){for(const x of [-1.5,1.5]){const panel=box(o,0x405b69,x,h+.99,-.65,2.5,.1,2.4);panel.rotation.x=.12;for(const z of [-1.4,-.65,.1])box(o,p.trim,x,h+1.06,z,2.4,.025,.035);}}
  if(place==='CORNER CAFÉ'){box(o,0x5f9293,0,3.16,2.55,6.75,.45,.5);box(o,0xf4c995,0,3.16,2.84,6.45,.07,.04,'window');for(const x of [-2.2,2.2]){cyl(o,p.accent,x,.8,3.25,.3,.15);cyl(o,p.trim,x,.58,3.25,.05,.4);}}
  if(place==='CINEMA'){box(o,p.accent,0,3.2,2.85,5.6,.5,1.6);for(let x=-2.5;x<=2.5;x+=.5)rock(o,0xf4d997,x,2.99,3.68,.06,.06,.06,'window');}
  // Compact rain storage and a sheltered tool rack support the rural workshop silhouette.
  if(place==='WORK'||place==='MAKERSPACE'){cyl(o,p.wood,2.55,1,-1.85,.58,1.45);for(const y of [.48,1.5])cyl(o,p.trim,2.55,y,-1.85,.61,.08);box(o,p.trim,-2.9,1.55,-2.15,.16,2.2,.18);box(o,p.wood,-2.25,2.4,-2.15,1.45,.13,.35);}
  return h+2.05;
 }
 function resident(o:T.Group,place:string,seed:number,walking:boolean,actor?:TownActor,slot=0){
  const human=new T.Group();human.name='neighbor';human.userData={place,ambientPerson:true};human.position.set(seed%2?-2.05:1.35,.34,4.05);o.add(human);
  if(actor){human.name='actor:'+actor.id;human.userData.actorId=actor.id;human.userData.displayName=actor.name;human.position.x=-1.9+(slot%3)*1.5;human.position.z=4.15+Math.floor(slot/3)*.75;}
  const clothes=[p.accent,0x638f9e,0xd3ad5e,0x78947c,0xa66e68],skin=[0xe3b690,0xb47e59,0x80563f,0xd1a079],shirt=clothes[seed%clothes.length];
  const body=box(human,shirt,0,.75,0,.35,.5,.25,'figure',true);body.userData.place=place;
  rock(human,skin[seed%skin.length],0,1.17,0,.19,.23,.18,'figure',true);rock(human,seed%3?0x594b3d:0x9a7350,0,1.34,-.025,.195,.105,.185,'figure',true);
  const legs:T.Object3D[]=[],arms:T.Object3D[]=[];
  for(const side of [-1,1]){const leg=box(human,0x586569,side*.11,.31,0,.13,.48,.15,'figure',true);legs.push(leg);box(human,0x65584b,side*.11,.07,.06,.17,.11,.27,'figure',true);const arm=box(human,shirt,side*.255,.74,0,.12,.43,.13,'figure',true);arm.rotation.z=side*.16;arms.push(arm);}
  if(region==='embermesa'||seed%4===0){cyl(human,region==='embermesa'?p.trim:p.roof,0,1.39,0,.25,.07,'figure',true);cyl(human,region==='embermesa'?p.trim:p.roof,0,1.48,0,.15,.14,'figure',true);}
  if(!walking){box(human,p.trim,.28,.71,.17,.29,.28,.1,'figure',true);arms[1].rotation.x=-.55;}
  const proxy=new T.Mesh(boxGeometry,material(shirt));proxy.position.copy(human.position).sub(o.children.find(c=>c instanceof T.Group&&c.position.x===2.7)?.position??new T.Vector3(2.7,.4,3.5));proxy.position.y+=.72;proxy.scale.set(.9,1.6,.7);proxy.visible=false;proxy.userData={place,prop:true,ambientPerson:true};const prop=o.children.find(c=>c instanceof T.Group&&c.position.x===2.7);if(prop)prop.add(proxy);
  if(actor){proxy.userData.actorId=actor.id;const canvas=document.createElement('canvas');canvas.width=256;canvas.height=64;const ink=canvas.getContext('2d')!;ink.fillStyle='#fff5df';ink.fillRect(0,0,256,64);ink.fillStyle='#365346';ink.font='bold 30px Georgia';ink.textAlign='center';ink.textBaseline='middle';ink.fillText(actor.name,128,33,240);const texture=new T.CanvasTexture(canvas);textures.add(texture);const labelMaterial=new T.SpriteMaterial({map:texture,depthTest:false});materials.add(labelMaterial);const label=new T.Sprite(labelMaterial);label.name='actor-name';label.scale.set(2.35,.59,1);label.position.set(0,2.02,0);label.renderOrder=8;human.add(label);}
  residents.push({group:human,base:human.position.clone(),phase:seed*.87,legs,arms,walking});dynamic.push(human);
 }
 function outdoor(o:T.Group,place:string){
  if(place==='TRANSIT'){
   for(const x of [-2.7,2.7])cyl(o,p.trim,x,1.8,-.4,.12,3);
   if(region==='pelagia')dome(o,p.roof,0,3.35,-.6,3.25,1.25);else if(region==='saffron')box(o,p.roof,0,3.4,-.4,6.4,.2,3.4);else gable(o,0,3.3,-.5,6.5,3.5,region==='glasssteppe'?1.8:1);
   bench(o,-.6,-1);box(o,p.accent,2.1,1.2,.25,.7,1.8,.5);box(o,p.trim,2.1,1.55,.52,.5,.55,.05);
   if(region==='glasssteppe'){for(const x of [-1.3,1.3])box(o,0x596969,x,.38,-.8,.11,.12,4.4);for(let z=-2.5;z<1.5;z+=.55)box(o,p.wood,0,.34,z,3.2,.1,.16);}
   if(region==='pelagia'){box(o,p.wood,0,.37,2.5,5.5,.2,2.3);for(const x of [-2.5,2.5])cyl(o,p.trim,x,.75,3.4,.12,1.3);}
  }else if(place==='GARDEN'){
   for(const x of [-2,0,2]){box(o,region==='pelagia'?p.trim:p.wood,x,.5,-.7,1.55,.5,4);box(o,region==='pelagia'?p.water:0x736650,x,.77,-.7,1.33,.06,3.75,region==='pelagia'?'water':'solid');for(let k=0;k<4;k++)rock(o,k%2?p.leaf:p.accent,x,1.02,-2+k*.87,.38,.48,.38,'leaf');}
   for(const x of [-3.3,3.3])cyl(o,p.trim,x,1.75,-2.4,.1,2.8);
   if(region==='pelagia')arch(o,0,2.4,-2.4,3.3,p.accent);else{box(o,p.wood,0,3.15,-2.4,7,.14,.3);for(let x=-3;x<=3;x+=.6)box(o,p.wood,x,3.15,-2,.1,.13,2);}
  }else{
   tree(o,-2,-.7,.9);tree(o,2,-1.5,.8);bench(o,0,1.6);cyl(o,p.trim,.2,.48,-.7,1.15,.2);cyl(o,p.water,.2,.63,-.7,.95,.07,'water');
   if(region==='pelagia'){arch(o,0,2.7,-2.9,2.65,p.accent);rock(o,p.accent,-2,1.4,1,.36,1.3,.36);}
   if(region==='glasssteppe'){for(const x of [-3.3,3.3])box(o,p.trim,x,.63,0,.4,.75,6);}
  }
  return region==='glasssteppe'?5.7:4.7;
 }
 function plaything(o:T.Group,place:string){
  if(place==='CORNER CAFÉ'){cyl(o,p.trim,0,.5,0,.35,.65,'solid',true);cyl(o,0x6e4937,0,.84,0,.28,.04,'solid',true);mesh(o,ringGeometry,p.trim,.36,.51,0,.22,.22,.22,'solid',true);}
  else if(place==='CAMPUS'||place==='LIBRARY'){for(let k=0;k<4;k++)box(o,k%2?p.accent:p.roof,0,.22+k*.17,0,.8,.14,.55,'solid',true);}
  else if(place==='MARKET'||place==='GARDEN'||place==='COMMUNITY'){box(o,p.wood,0,.28,0,1,.45,.7,'solid',true);for(let k=0;k<3;k++)rock(o,k%2?p.accent:p.leaf,(k-1)*.27,.65,0,.2,.22,.2,'solid',true);}
  else if(place==='FITNESS'){box(o,p.roof,0,.5,0,1.3,.1,.1,'solid',true);for(const x of [-.5,.5]){const w=cyl(o,p.accent,x,.5,0,.27,.19,'solid',true);w.rotation.z=Math.PI/2;}}
  else if(place==='TRANSIT'){for(const x of [-.45,.45])mesh(o,ringGeometry,p.roof,x,.4,0,.35,.35,.35,'solid',true);const m=box(o,p.accent,0,.67,0,.9,.09,.09,'solid',true);m.rotation.z=.23;}
  else if(place==='ARCADE'){box(o,p.roof,0,.6,0,.8,1.2,.65,'solid',true);box(o,0xb3e8d6,0,.76,.34,.58,.48,.04,'window',true);}
  else if(place==='THE PARK'){cyl(o,p.trim,0,.25,0,.55,.13,'solid',true);rock(o,p.water,0,.61,0,.28,.3,.28,'water',true);}
  else{box(o,p.wood,0,.28,0,1,.23,.65,'solid',true);mesh(o,ringGeometry,p.accent,0,.79,0,.36,.36,.36,'copper',true);}
 }
 function evolveVenue(o:T.Group,state:WorldVenueState,top:number){
  // A change of use has its own public-facing furniture and annex, retained across visits.
  // Keep x=0 and the z=4.65 arrival anchor clear in every conversion.
  const annex=-4.15,variation=Math.max(0,state.changedOnReturn-1)%3;
  o.userData.venueUse=state.use;o.userData.venueState=state.state;o.userData.changedOnReturn=state.changedOnReturn;
  box(o,p.path,annex,.27,-.35,2.6,.25,3.8);
  if(region==='pelagia')for(const z of [-1.8,1.2])cyl(o,p.trim,annex,-.6,z,.15,1.5);
  const canopy=(color:number,height=2.85)=>{box(o,color,annex,height,-.35,2.8,.16,3.9);for(const x of [annex-1.15,annex+1.15])for(const z of [-2,1.3])cyl(o,p.trim,x,height/2+.15,z,.075,height-.25);};
  const shelf=(x:number,z:number)=>{box(o,p.wood,x,1.27,z,1.78,1.75,.4);for(const y of [.8,1.35,1.9]){box(o,p.trim,x,y,z+.23,1.86,.1,.5);for(let k=0;k<6;k++)box(o,k%2?p.accent:p.roof,x-.64+k*.25,y+.22,z+.22,.16,.35+(k%3)*.045,.21);}};
  if(state.use==='food'){
   canopy(region==='embermesa'?0x609393:p.accent);box(o,p.trim,annex,.86,-.25,1.85,.95,2.55);box(o,p.wood,annex,1.39,-.25,2,.13,2.7);
   for(const z of [-.9,.2]){cyl(o,0x697f7a,annex,1.57,z,.31,.3);cyl(o,p.trim,annex,1.74,z,.34,.05);}
   box(o,p.wood,annex,.66,1.5,1.85,.6,.75);for(let k=0;k<5;k++)rock(o,k%2?p.accent:p.leaf,annex-.64+k*.3,1.08,1.5,.17,.19,.17);
  }else if(state.use==='repair'){
   canopy(p.trim,3.08);const solar=box(o,0x3c6377,annex,3.25,-.35,2.45,.09,3.35);solar.rotation.x=.08;
   for(const z of [-1.45,-.5,.45])box(o,p.trim,annex,3.29,z,2.3,.02,.045);
   box(o,p.wood,annex,1.02,-.4,1.95,.2,2.55);for(const x of [annex-.74,annex+.74])box(o,p.roof,x,.66,-.4,.13,.68,2.1);
   mesh(o,ringGeometry,p.accent,annex,1.52,.45,.4,.4,.4,'copper');box(o,p.trim,annex,1.42,-1.5,1.8,.8,.15);for(let k=0;k<5;k++)box(o,p.roof,annex-.66+k*.33,1.43,-1.38,.06,.48,.05);
  }else if(state.use==='reading'){
   canopy(p.roof);shelf(annex,-1.8);bench(o,annex,.65);box(o,p.trim,annex,1.15,.3,.8,.13,.55);box(o,p.accent,annex,1.28,.3,.54,.1,.38);
  }else if(state.use==='learning'){
   canopy(p.accent,3);shelf(annex,-1.8);box(o,p.roof,annex,1.86,.91,1.68,.98,.1);box(o,p.trim,annex,1.86,1,1.43,.75,.025);
   for(let k=0;k<3;k++)box(o,p.accent,annex,2.1-k*.22,1.03,1.06-k*.12,.025,.018);
   for(const z of [-.7,.15]){box(o,p.wood,annex,.83,z,1.7,.12,.6);for(const x of [annex-.58,annex+.58])box(o,p.trim,x,.51,z,.075,.62,.45);}
  }else if(state.use==='garden'){
   // A faceted, open-sided greenhouse makes new food-growing space visible from above.
   for(const x of [annex-1.05,annex+1.05])for(const z of [-1.8,1.1])box(o,p.trim,x,1.44,z,.09,2.3,.09);
   gable(o,annex,2.6,-.35,2.45,3.3,1.05,region==='pelagia'?0x86c7bd:0x91b6a6);
   for(const x of [annex-.56,annex+.56]){box(o,p.wood,x,.62,-.35,.85,.48,2.9);for(let k=0;k<4;k++)rock(o,k%2?p.leaf:p.accent,x,1.07,-1.4+k*.7,.25,.35,.25,'leaf');}
   top=Math.max(top,4.25);
  }else if(state.use==='market'){
   canopy(p.accent);for(let k=0;k<4;k++)box(o,p.trim,annex-.98+k*.65,2.95,-.35,.24,.06,3.75);
   for(const z of [-1.45,.15]){box(o,p.wood,annex,.76,z,1.85,.78,1.1);box(o,p.trim,annex,1.19,z,2,.1,1.2);for(let k=0;k<5;k++)rock(o,k%2?p.leaf:p.accent,annex-.72+k*.36,1.38,z,.17,.22,.19);}
   box(o,p.roof,annex,1.4,1.65,.75,1.5,.12);box(o,p.trim,annex,1.51,1.73,.58,.92,.03);
  }else{
   canopy(p.accent);bench(o,annex,-1.4);bench(o,annex,.85);cyl(o,p.trim,annex,1.06,-.3,.68,.15);cyl(o,p.roof,annex,.68,-.3,.08,.7);
   for(let k=0;k<5;k++)rock(o,k%2?p.accent:p.trim,annex-1+k*.5,2.53,-.3,.12,.17,.1,'window');
  }
  // Later conversions carry a different arrangement of planters and wayfinding posts.
  for(let k=0;k<=variation;k++){const z=-1.55+k*1.2;box(o,p.trim,annex-1.32,.57,z,.44,.55,.5);rock(o,p.leaf,annex-1.32,1,z,.29,.38,.29,'leaf');}
  return top;
 }
 function localFocus(o:T.Group,place:string){
  const show=region==='alder'&&place==='COMMUNITY'||region==='saffron'&&place==='CINEMA'||region==='glasssteppe'&&place==='CAMPUS'||region==='pelagia'&&place==='COMMUNITY'||region==='embermesa'&&place==='MAKERSPACE';
  if(!show)return;
  const cue=new T.Group();cue.name='local-focus-detail';cue.userData.decorative=true;cue.position.set(-3.3,.3,2.2);o.add(cue);
  if(region==='alder'){
   // A shared pantry shelf and sorting crates beside the community hall.
   box(cue,p.wood,0,.9,0,1.5,1.7,.6);for(const y of [.25,.85,1.4]){box(cue,p.trim,0,y,.38,1.55,.1,.9);for(const x of [-.45,.1,.55])box(cue,p.accent,x,y+.18,.1,.25,.25,.35);}
  }else if(region==='saffron'){
   // A small evening cinema terrace, deliberately restrained within the minimalist scene.
   bench(cue,0,0);for(const x of [-.75,.75]){cyl(cue,p.wood,x,1.2,-.45,.045,2.4);rock(cue,p.trim,x,2.45,-.45,.13,.18,.13,'window');}
  }else if(region==='glasssteppe'){
   // Outdoor campus demonstration/work surface, with books and a simple measurement frame.
   box(cue,p.wood,0,.85,0,1.7,.16,.85);for(const x of [-.65,.65])box(cue,p.trim,x,.42,0,.12,.8,.65);
   for(let i=0;i<3;i++)box(cue,i%2?p.accent:p.roof,-.4,1+i*.11,0,.6,.1,.4);mesh(cue,ringGeometry,p.accent,.5,1.35,0,.3,.3,.3,'copper');
  }else if(region==='pelagia'){
   // Public tide-gauge hardware: a civic engineering cue, with no new control or promised data.
   cyl(cue,p.trim,0,1.25,0,.075,2.5);box(cue,p.roof,0,1.65,.1,.44,1.3,.08);for(let i=0;i<5;i++)box(cue,p.trim,0,1.15+i*.23,.15,.33,.04,.035);box(cue,p.accent,.38,.45,0,.55,.6,.55);
  }else{
   // A practical shared workbench extends the existing makerspace porch.
   box(cue,p.wood,0,.8,0,1.8,.18,.9);for(const x of [-.7,.7])box(cue,p.trim,x,.4,0,.15,.8,.72);
   box(cue,p.roof,-.35,1.02,0,.55,.2,.4);box(cue,p.trim,.5,.98,0,.09,.08,.65);
  }
 }
 function sign(o:T.Group,name:string,top:number,isClosed:boolean){
  if(typeof document==='undefined')return;
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=96;const ctx=canvas.getContext('2d');if(!ctx)return;
  ctx.fillStyle=region==='saffron'?'#66523e':region==='glasssteppe'?'#364851':region==='pelagia'?'#28595d':'#304d43';ctx.fillRect(6,6,500,84);ctx.strokeStyle=isClosed?'#a79681':region==='pelagia'?'#dcac8c':'#ccb781';ctx.lineWidth=3;ctx.strokeRect(9,9,494,78);
  ctx.fillStyle=isClosed?'#d7cbbb':'#fff0d1';ctx.font='bold 31px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(isClosed?`${name} · CLOSED`:name,256,49,476);
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;textures.add(texture);const m=new T.SpriteMaterial({map:texture,depthTest:true});materials.add(m);const sprite=new T.Sprite(m);sprite.name='venue-sign';sprite.position.set(0,top+.7,0);sprite.scale.set(8.3,1.55,1);o.add(sprite);
 }
 const streets=new T.Group();streets.name='regional-street-graph';streets.scale.set(1/layout.scale,1,1/layout.scale);streets.userData.layout=layout.name;streets.userData.segments=[];group.add(streets);
 function streetSegment(from:LayoutPoint,to:LayoutPoint,surface:string,width:number){
  streets.userData.segments.push({from:[...from],to:[...to],surface,width});
  const a=new T.Vector3(...from).add(new T.Vector3(0,-.72,0)),b=new T.Vector3(...to).add(new T.Vector3(0,-.72,0)),delta=b.clone().sub(a),length=delta.length();if(length<.001)return;
  const center=a.clone().add(b).multiplyScalar(.5),raised=surface==='bridge'||surface==='boardwalk'||surface==='ramp',deck=box(streets,surface==='trail'?p.path:region==='embermesa'?p.wood:p.path,center.x,center.y,center.z,width,.16,length);
  deck.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),delta.clone().normalize());deck.userData.routeSurface=surface;
  if(raised){const sideways=new T.Vector3(delta.z,0,-delta.x).normalize().multiplyScalar(width/2);
   for(const side of [-1,1]){const rail=box(streets,p.trim,center.x+sideways.x*side,center.y+.7,center.z+sideways.z*side,.07,.09,Math.max(.1,length-3.8));rail.quaternion.copy(deck.quaternion);}
   for(const t of [.25,.75]){const at=a.clone().lerp(b,t),bottom=region==='glasssteppe'?-4.5:region==='pelagia'?-.7:-.3,height=at.y-bottom;for(const side of [-1,1])box(streets,p.trim,at.x+sideways.x*side,bottom+height/2,at.z+sideways.z*side,.11,height+1.35,.11);}
  }
 }
 for(const edge of layout.edges)streetSegment(layout.nodes[edge.from],layout.nodes[edge.to],edge.surface,edge.width);
 if(region==='saffron'){
  // Three masonry arches identify the main canal crossing beneath its gently crowned deck.
  for(const side of [-1,1])for(const x of [24.3,26,27.7]){const archway=mesh(streets,archGeometry,p.trim,x*layout.scale,.49,12*layout.scale+side*1.12,.83,.68,1.2);archway.name='canal-bridge-arch';for(const end of [-1,1])box(streets,p.trim,x*layout.scale+end*.83,.1,12*layout.scale+side*1.12,.15,.78,.25);}
 }
 const spots:Spot[]=[];
 for(let i=0;i<locations.length;i++){
  const location=locations[i],site=layout.venues[location.place];
  const known=visible.has(location.place)||closed.has(location.place),isClosed=closed.has(location.place),open=known&&!isClosed;
  const evolutionState=evolution.venueStates?.[location.place],displayName=evolution.placeNames?.[location.place]||evolutionState?.name||regionDefinitions[region].placeNames[location.place]||location.name;
  const o=new T.Group();o.position.set(site.position[0]/layout.scale,.25+site.position[1],site.position[2]/layout.scale);o.scale.set(1/layout.scale,1,1/layout.scale);o.rotation.y=site.rotation;o.name=`venue:${location.place}`;o.visible=known;o.userData={place:location.place,hidden:!known,closed:isClosed,interactive:open,status:!known?'undiscovered':isClosed?'closed':'open'};group.add(o);
  const hinge=new T.Group(),prop=new T.Group();hinge.position.set(-.6,.3,1.98);prop.position.set(2.7,.4,3.5);o.add(hinge,prop);
  let top=5.5;
  if(known){
   if(region==='pelagia'){
    cyl(o,p.trim,0,-.12,0,4.4,.38);for(const x of [-2.7,2.7])for(const z of [-2.4,2.4])cyl(o,p.trim,x,-.83,z,.2,1.55);
   }else{box(o,p.path,0,.08,0,8,.18,7);box(o,p.trim,0,.26,-.45,6.9,.2,5.2);}
   box(o,p.path,0,.28,2.95,1.7,.11,1.3);
   // Level arrival pad safely accommodates four marbles beside one another.
   box(o,p.path,0,0,4.65,5.75,.16,2.25);if(region==='pelagia')for(const x of [-2.5,2.5])cyl(o,p.trim,x,-.6,4.65,.14,1.5);
   let shell=o;
   if(!outdoorPlaces.has(location.place)){shell=new T.Group();shell.name='settlement-shell';shell.scale.set(site.footprint[0],region==='embermesa'?.92:region==='pelagia'?.84:1,site.footprint[1]);shell.position.z=(1-site.footprint[1])*2.1;o.add(shell);}
   if(site.position[1]>0&&region==='glasssteppe'){box(o,p.wall,0,-site.position[1]/2,-.45,7.2,site.position[1],5.7);for(const side of [-1,1])box(o,p.trim,side*3.6,-site.position[1]/2,1.9,.35,site.position[1]+.25,.4);}
   top=outdoorPlaces.has(location.place)?outdoor(o,location.place):region==='alder'?alderBuilding(shell,i,location.place):region==='saffron'?saffronBuilding(shell,i,location.place):region==='glasssteppe'?glassBuilding(shell,i,location.place):region==='embermesa'?mesaBuilding(shell,i,location.place):pelagiaBuilding(shell,i,location.place);
   if(!outdoorPlaces.has(location.place)){box(o,p.trim,0,1.51,2.06,1.6,2.65,.15);box(hinge,p.roof,.6,1.15,.18,1.2,2.3,.18,'solid',true);box(hinge,0x6a9699,.6,1.55,.3,.86,.85,.04,'window',true);rock(hinge,p.accent,1.04,1.02,.32,.06,.06,.06,'solid',true);}
   if(isClosed){
    // A closure is still a physical place: weathered boards, a chained approach and debris.
    for(const angle of [-.48,.48]){const plank=box(o,0x87735c,0,1.45,2.43,2.1,.3,.13);plank.rotation.z=angle;}
    for(const x of [-2.1,2.1])for(const y of [1.3,1.9])box(o,0x9b8970,x,y,2.35,1.45,.28,.14);
    for(const x of [-1.35,1.35])cyl(o,0x7c8177,x,.91,3.75,.09,1.25);box(o,0x8c9186,0,1.22,3.75,2.8,.1,.1);
    for(let k=0;k<4;k++)rock(o,p.wall,-2.5+k*.7,.41,3.15,.25,.13,.2);
    hinge.visible=false;prop.visible=false;
   }else{plaything(prop,location.place);localFocus(o,location.place);if(evolutionState)top=evolveVenue(o,evolutionState,top);}
   sign(o,displayName,top,isClosed);
  }else{
   // Never build an undiscovered venue, not even behind a transparent facade.
   const empty=new T.Group();empty.position.copy(o.position);empty.rotation.copy(o.rotation);empty.scale.copy(o.scale);empty.name='unmapped-lot';empty.userData.hiddenLot=true;group.add(empty);
   if(region==='pelagia'){for(const x of [-2.4,2.4])cyl(empty,p.trim,x,-.25,0,.17,1.5);}
   else{box(empty,region==='saffron'?0xd9bd94:region==='glasssteppe'?0x9faeaa:0xa5b38d,0,-.06,0,7,.12,5.6);for(const x of [-3,3])rock(empty,p.ground,x,.22,-1,.55,.2,.45);}
   // Low, anonymous banks of mist mark unexplored land without exposing names or roofs.
   if(!compatibility){const fogMaterial=new T.MeshBasicMaterial({color:region==='pelagia'?0xc5e3dc:0xd5ddcd,transparent:true,opacity:.33,depthWrite:false});materials.add(fogMaterial);for(let k=0;k<3;k++){const fog=new T.Mesh(rockGeometry,fogMaterial);fog.position.set((k-1)*1.7,.62+(k%2)*.16,-.4);fog.scale.set(2.5,.65,2.1);fog.raycast=noRaycast;empty.add(fog);}}
  }
  group.updateMatrixWorld(true);
  const door=o.localToWorld(new T.Vector3(0,.65,4.65)),center=o.localToWorld(new T.Vector3(0,top/2,0));
  const hitMaterial=new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false});materials.add(hitMaterial);
  const hit=new T.Mesh(geometry(new T.BoxGeometry(7.5,top,7.6)),hitMaterial);hit.position.set(0,top/2+.15,0);hit.name='venue-hit';hit.userData={place:location.place,hidden:!known,closed:isClosed,interactive:open};hit.visible=open;if(!open)hit.raycast=noRaycast;o.add(hit);
  prop.traverse(obj=>{obj.userData={place:location.place,prop:true,hidden:!known,closed:isClosed,interactive:open};if(!open&&obj instanceof T.Mesh)obj.raycast=noRaycast;});
  const name=known?displayName:'';
  spots.push({place:location.place,name,district:location.district,center,door,group:o,hinge,prop,hit,phase:-100});
  // The same authored connector serves movement and its visible walkable deck.
  if(known)streetSegment([door.x,door.y+.06,door.z],layout.nodes[site.road],region==='pelagia'?'boardwalk':region==='saffron'?'bridge':region==='embermesa'?'trail':site.position[1]!==layout.nodes[site.road][1]-.96?'ramp':'street',region==='embermesa'?1.4:1.85);
 }
 const welcomingSpots=spots.filter(s=>!s.group.userData.hidden&&!s.group.userData.closed);
 const actors=(evolution.actors||[]).filter(actor=>welcomingSpots.some(spot=>spot.place===actor.spot));
 const quietSpots=welcomingSpots.filter(spot=>!actors.some(actor=>actor.spot===spot.place));
 const ambientSpots=quietSpots.length?quietSpots:welcomingSpots;
 const peopleCount=region==='alder'||region==='embermesa'?8:14;
 for(let i=0;i<peopleCount&&ambientSpots.length;i++){const at=ambientSpots[i%ambientSpots.length];resident(at.group,at.place,i,i%3!==0);}
 for(const actor of actors){const at=welcomingSpots.find(spot=>spot.place===actor.spot)!;const seed=[...actor.id].reduce((sum,char)=>sum+char.charCodeAt(0),0);resident(at.group,at.place,seed,false,actor,actors.filter(other=>other.spot===actor.spot).findIndex(other=>other.id===actor.id));}
 group.userData.population=(welcomingSpots.length?peopleCount:0)+actors.length;group.userData.castActors=actors.map(actor=>actor.id);
 // Batch inside each owning group. Venue visibility still governs all of its static geometry.
 group.updateMatrixWorld(true);
 for(const [owner,meshes] of staticByOwner){
  const inverse=owner.matrixWorld.clone().invert(),buckets=new Map<string,{material:T.Material;order:number;geometries:T.BufferGeometry[]}>();
  for(const m of meshes){const matrix=inverse.clone().multiply(m.matrixWorld),transformed=m.geometry.clone().applyMatrix4(matrix),g=transformed.index?transformed.toNonIndexed():transformed;if(g!==transformed)transformed.dispose();const material=m.material as T.Material,key=material.uuid+':'+m.renderOrder;if(!buckets.has(key))buckets.set(key,{material,order:m.renderOrder,geometries:[]});buckets.get(key)!.geometries.push(g);m.removeFromParent();}
  for(const {material:m,order,geometries:gs} of buckets.values()){const merged=mergeGeometries(gs);gs.forEach(g=>g.dispose());if(merged){geometry(merged);if(m instanceof T.MeshStandardMaterial&&m.userData.role!=='window'&&m.userData.role!=='snow'){paintRegionGeometry(merged,region,owner.matrixWorld);m.vertexColors=true;}const batch=new T.Mesh(merged,m);batch.castShadow=true;batch.receiveShadow=true;batch.renderOrder=order;batch.name='regional-architecture';batch.raycast=noRaycast;owner.add(batch);}}
 }
 function setWeather(value:Weather|null){
  const season=value?.season||'spring',wet=value?.type==='rain',cold=coldPaintWeather(value),snowCover=snowPaintWeather(value);
  for(const m of paint.values()){const original=m.userData.originalColor as number,role=m.userData.role as PaintRole;m.color.setHex(original);m.visible=role!=='snow'||snowCover;m.emissive.setHex(0);m.emissiveIntensity=0;m.roughness=m.userData.baseRoughness;
   if(role==='leaf'&&region==='alder'){if(season==='autumn')m.color.setHex(original===p.leaf?0xb9824e:0xd0a861);if(cold)m.color.setHex(0x909d89);}
   if(role==='water'){m.color.lerp(new T.Color(cold?0xb1c8ca:wet?0x6c9da4:original),cold?.5:wet?.35:0);m.roughness=Math.max(.5,m.userData.baseRoughness-(wet?.08:0));}
   if(role==='window'){m.emissive.setHex(0xe7b676);m.emissiveIntensity=region==='embermesa'?.68:season==='winter'||wet?.42:.08;}
   if(role==='solid')m.roughness=Math.max(.7,m.userData.baseRoughness-(wet?.08:0));
  }
  group.userData.season=season;group.userData.weather=value?.type||'none';
 }
 setWeather(null);
 group.updateMatrixWorld(true);
 let triangleCount=0,meshCount=0,paintVertexBytes=0;const countedPigment=new Set<T.BufferGeometry>();group.traverse(o=>{if(o instanceof T.Mesh){meshCount++;triangleCount+=(o.geometry.index?.count??o.geometry.getAttribute('position')?.count??0)/3;if(!countedPigment.has(o.geometry)){countedPigment.add(o.geometry);paintVertexBytes+=o.geometry.getAttribute('color')?.array.byteLength||0;}}});
 group.userData.stats={triangles:triangleCount,meshes:meshCount,paintVertexBytes,paintTextureBytes:0,visiblePlaces:spots.filter(s=>!s.group.userData.hidden&&!s.group.userData.closed).length,evolvedVenues:spots.filter(s=>!!s.group.userData.venueUse).length};
 return{group,spots,dynamic,setWeather,layout,route:(from:string,to:string,start:T.Vector3,end:T.Vector3)=>layoutRoute(layout,from,to,start.toArray() as LayoutPoint,end.toArray() as LayoutPoint).map(point=>new T.Vector3(...point)),setPaintQuality:(low:boolean)=>setRegionPaintQuality(materials,low),
  animate:(time:number,reduced:boolean)=>{if(disposed)return;for(const object of dynamic){if(object.userData.ambientPerson)continue;if(object.userData.ripple){const base=object.userData.baseScale as T.Vector3;object.scale.copy(base).multiplyScalar(reduced?1:1+Math.sin(time*.65+object.position.x)*.045);}else object.rotation.z=reduced?0:time*.14;}
   for(const person of residents){const t=time*.85+person.phase;person.group.position.copy(person.base);if(!reduced&&person.walking){person.group.position.x+=Math.sin(t)*.65;person.group.rotation.y=Math.cos(t)>=0?Math.PI/2:-Math.PI/2;person.legs.forEach((leg,i)=>leg.rotation.x=Math.sin(time*3.4+person.phase+i*Math.PI)*.27);person.arms.forEach((arm,i)=>arm.rotation.x=Math.sin(time*3.4+person.phase+i*Math.PI)*-.2);}else{person.group.rotation.y=.4;person.legs.forEach(leg=>leg.rotation.x=0);if(!reduced)person.arms[0].rotation.z=-.25+Math.sin(time*.9+person.phase)*.14;}}
   for(const s of spots){if(s.group.userData.hidden||s.group.userData.closed)continue;const t=time-s.phase,wave=t>=0&&t<2&&!reduced?Math.sin(t*Math.PI*3)*(1-t/2):0;s.prop.rotation.y=wave*.7;s.prop.position.y=.4+Math.abs(wave)*.7;s.hinge.rotation.y=t>=0&&t<2?-Math.sin(Math.min(1,t)*Math.PI/2)*1.1:0;}},
  dispose:()=>{if(disposed)return;disposed=true;group.removeFromParent();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());group.clear();},
 };
}
