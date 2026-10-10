import test from 'node:test';
import assert from 'node:assert/strict';
import {regionLayout,venueDoor,layoutRoute,routeLength} from '../app/region-layouts.ts';
const regions=['alder','saffron','glasssteppe','pelagia','embermesa'];
const outdoors=['THE PARK','GARDEN','TRANSIT'];
const near=(a,b)=>a.every((v,i)=>Math.abs(v-b[i])<1e-8);
function insideShell(p,v,clearance=.65){const dx=p[0]-v.position[0],dz=p[2]-v.position[2],c=Math.cos(v.rotation),s=Math.sin(v.rotation),x=c*dx-s*dz,z=s*dx+c*dz;const shell=Math.abs(x)<3.7*v.footprint[0]+clearance&&z> -3*v.footprint[1]+(1-v.footprint[1])*2.1-clearance&&z<2.25+clearance;const futureAnnex=x> -5.7-clearance&&x< -2.65+clearance&&z> -2.35-clearance&&z<1.85+clearance;return shell||futureAnnex;}
function samples(a,b){const n=Math.max(1,Math.ceil(Math.hypot(a[0]-b[0],a[2]-b[2])*4));return Array.from({length:n+1},(_,i)=>a.map((v,j)=>v+(b[j]-v)*i/n));}
test('each of the 225 venue pairs uses reachable authored roads with its correct elevated endpoints',()=>{
 for(const region of regions){const l=regionLayout(region),places=Object.keys(l.venues);assert.equal(places.length,15);for(const from of places)for(const to of places){const r=layoutRoute(l,from,to);assert.ok(near(r[0],venueDoor(l,from)));assert.ok(near(r.at(-1),venueDoor(l,to)));assert.ok(Number.isFinite(routeLength(r)));for(let i=1;i<r.length-2;i++)assert.ok(l.edges.some(e=>near(l.nodes[e.from],r[i])&&near(l.nodes[e.to],r[i+1])||near(l.nodes[e.to],r[i])&&near(l.nodes[e.from],r[i+1])),region+' authored segment');}}
});
test('walkable graph and all entry connectors keep marble clearance from physical building shells',()=>{
 for(const region of regions){const l=regionLayout(region),segments=l.edges.map(e=>[l.nodes[e.from],l.nodes[e.to],e.from+' → '+e.to]);for(const [id,v] of Object.entries(l.venues))for(const offset of [-2.025,-.675,.675,2.025,0]){const door=venueDoor(l,id);door[0]+=Math.cos(v.rotation)*offset;door[2]-=Math.sin(v.rotation)*offset;segments.push([door,venueDoor(l,id),id+' arrival slot '+offset]);if(offset===0)segments.push([door,l.nodes[v.road],id+' entry']);}
  for(const [a,b,name] of segments)for(const [id,v] of Object.entries(l.venues)){if(outdoors.includes(id))continue;for(const p of samples(a,b))assert.equal(insideShell(p,v),false,`${region}: ${name} clips ${id} at ${p}`);}
 }
});
test('water crossings have bridge/boardwalk decks and height transitions are gentle ramps',()=>{
 for(const region of regions){const l=regionLayout(region);for(const e of l.edges){const a=l.nodes[e.from],b=l.nodes[e.to],rise=Math.abs(a[1]-b[1]),run=Math.hypot(a[0]-b[0],a[2]-b[2]);if(rise){assert.ok(['ramp','bridge'].includes(e.surface));assert.ok(rise/run<.13,'gentle supported ramp');}
  if(region==='pelagia')assert.equal(e.surface,'boardwalk');
  if(region==='saffron')for(const p of samples(a,b)){const x=p[0]/l.scale,z=p[2]/l.scale;if(Math.abs(x-26)<2.7||Math.abs(z-8)<1.65||Math.abs(z+8)<1.65)assert.equal(e.surface,'bridge');}
  if(region==='glasssteppe'&&(e.from==='crossing'||e.to==='crossing'))assert.equal(e.surface,'bridge');
 }}
});
test('regions demonstrate different coordinates, footprints, elevations, route lengths and camera extents',()=>{
 const metrics=regions.map(region=>{const l=regionLayout(region),points=Object.values(l.venues).map(v=>v.position);for(const p of points){assert.ok(p[0]>l.bounds.minX&&p[0]<l.bounds.maxX);assert.ok(p[2]>l.bounds.minZ&&p[2]<l.bounds.maxZ);}return{region,length:routeLength(layoutRoute(l,'APARTMENTS','CINEMA')),width:Math.max(...points.map(p=>p[0]))-Math.min(...points.map(p=>p[0])),height:Math.max(...points.map(p=>p[1])),footprint:l.venues.APARTMENTS.footprint.join('x'),camera:l.camera.maxDistance};});
 assert.equal(new Set(metrics.map(m=>m.length.toFixed(2))).size,5);assert.equal(new Set(metrics.map(m=>m.width.toFixed(2))).size,5);assert.ok(new Set(metrics.map(m=>m.footprint)).size>=4);assert.equal(metrics.find(m=>m.region==='glasssteppe').height,2.4);assert.ok(Math.abs(metrics.find(m=>m.region==='pelagia').height-.6)<1e-10);assert.ok(metrics[4].length>metrics[0].length*1.5);console.log('Spatial metrics',JSON.stringify(metrics));
});
test('rotated venue shells reserve separate ground footprints, including opposing district edges',()=>{
 const polygon=v=>{const back=-3*v.footprint[1]+(1-v.footprint[1])*2.1,w=3.7*v.footprint[0]+.15,c=Math.cos(v.rotation),s=Math.sin(v.rotation);return[[-w,back-.15],[w,back-.15],[w,2.4],[-w,2.4]].map(([x,z])=>[v.position[0]+c*x+s*z,v.position[2]-s*x+c*z]);};
 const overlap=(a,b)=>[...a,...b].every((point,i)=>{const shape=i<4?a:b,j=i%4,next=shape[(j+1)%4],axis=[next[1]-point[1],point[0]-next[0]],project=p=>p.map(v=>v[0]*axis[0]+v[1]*axis[1]),pa=project(a),pb=project(b);return Math.max(...pa)>Math.min(...pb)&&Math.max(...pb)>Math.min(...pa);});
 for(const region of regions){const buildings=Object.entries(regionLayout(region).venues).filter(([id])=>!outdoors.includes(id));for(let i=0;i<buildings.length;i++)for(let j=i+1;j<buildings.length;j++)assert.equal(overlap(polygon(buildings[i][1]),polygon(buildings[j][1])),false,region+' overlapping '+buildings[i][0]+' / '+buildings[j][0]);}
});
