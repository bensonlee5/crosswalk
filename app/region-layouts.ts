/** Authored presentation coordinates. Place IDs, discovery and saves stay in the game engine. */
export type LayoutPoint=[number,number,number];
export type LayoutRegion='alder'|'saffron'|'glasssteppe'|'pelagia'|'embermesa';
export type LayoutEdge={from:string;to:string;surface:'street'|'bridge'|'boardwalk'|'ramp'|'trail';width:number};
export type LayoutVenue={position:LayoutPoint;rotation:number;road:string;footprint:[number,number]};
export type RegionLayout={region:LayoutRegion;name:string;scale:number;nodes:Record<string,LayoutPoint>;edges:LayoutEdge[];venues:Record<string,LayoutVenue>;hubs:Record<string,LayoutPoint>;bounds:{minX:number;maxX:number;minZ:number;maxZ:number};camera:{offset:LayoutPoint;maxDistance:number}};
const places=['APARTMENTS','WORK','CAMPUS','CAREER HUB','CORNER CAFÉ','COMMUNITY','THE PARK','LIBRARY','MARKET','FITNESS','MAKERSPACE','CINEMA','TRANSIT','GARDEN','ARCADE'];
const definitions:Record<LayoutRegion,{name:string;scale:number;rows:[number,number,number];heights:[number,number,number];side:number;places:[number,number][];footprint:[number,number];surface:LayoutEdge['surface']}>={
 alder:{name:'Compact quay grid',scale:.82,rows:[-10,3,11],heights:[0,0,0],side:16,footprint:[1.05,1],surface:'street',places:[[-12,-17],[0,-18],[12,-17],[21,0],[12,19],[-4,19],[-22,0],[-12,-18],[0,-18],[12,-17],[22,0],[12,19],[0,21],[-12,19],[-21,0]]},
 saffron:{name:'Canal promenades and open courts',scale:1.08,rows:[-12,3,12],heights:[0,0,0],side:12,footprint:[1,1.05],surface:'street',places:[[-15,-20],[0,-21],[15,-20],[22,2],[14,21],[-4,21],[-23,1],[-15,-21],[0,-20],[15,-20],[23,1],[15,21],[0,23],[-14,21],[-22,1]]},
 glasssteppe:{name:'Stepped rail terraces',scale:.94,rows:[-12,2,12],heights:[2.4,1.2,0],side:16,footprint:[1,1],surface:'street',places:[[-14,-20],[0,-20],[14,-20],[22,3],[13,20],[-3,20],[-23,3],[-14,-20],[0,-20],[14,-20],[22,3],[13,20],[0,22],[-13,20],[-22,3]]},
 pelagia:{name:'Branching raised harbor walks',scale:.96,rows:[-11,5,13],heights:[.6,.6,.6],side:15,footprint:[.9,.9],surface:'boardwalk',places:[[-18,-17],[-2,-22],[15,-18],[21,5],[14,22],[-7,22],[-25,5],[-18,-18],[-2,-22],[15,-19],[24,5],[15,22],[0,24],[-14,22],[-21,5]]},
 embermesa:{name:'Wide rural dirt-track loop',scale:1.32,rows:[-11,5,13],heights:[0,0,0],side:17,footprint:[.82,.78],surface:'trail',places:[[-18,-19],[0,-22],[18,-18],[21,4],[15,23],[-6,23],[-25,3],[-18,-20],[0,-22],[18,-19],[25,4],[17,23],[0,25],[-16,23],[-21,3]]},
};
const layouts=new Map<LayoutRegion,RegionLayout>();
export function regionLayout(region:LayoutRegion):RegionLayout{
 const previous=layouts.get(region);if(previous)return previous;
 const d=definitions[region],nodes:Record<string,LayoutPoint>={},edges:LayoutEdge[]=[],venues:Record<string,LayoutVenue>={},hubs:Record<string,LayoutPoint>={};
 const indexForMain=[0,1,2,5,8,7,3],indexForWest=[0,1,2,5,8,7,6,3];
 const addEdge=(from:string,to:string,force?:LayoutEdge['surface'])=>{const a=nodes[from],b=nodes[to];const surface=force??(a[1]!==b[1]?'ramp':d.surface);edges.push({from,to,surface,width:surface==='trail'?1.55:surface==='boardwalk'?2.15:2.4});};
 for(const [district,cx] of [['main',0],['west',52]] as const){
  for(let row=0;row<3;row++)for(let column=0;column<3;column++){
   const z=d.rows[row]+(region==='embermesa'&&column===1?(row===0?-2:row===2?2:1):0);
   nodes[`${district}:${row*3+column}`]=[(cx+(column-1)*d.side)*d.scale,d.heights[row]+.96,z*d.scale];
  }
  // No central north/south shortcut: the public route goes around the civic landmark.
  const links=region==='pelagia'?[[0,1],[1,2],[0,3],[2,5],[3,4],[4,5],[4,6],[4,7],[4,8]]:[[0,1],[1,2],[0,3],[3,6],[2,5],[5,8],[3,4],[4,5],[6,7],[7,8]];
  for(const [a,b] of links){let surface:LayoutEdge['surface']|undefined;if(region==='saffron'&&Math.floor(a/3)!==Math.floor(b/3))surface='bridge';addEdge(`${district}:${a}`,`${district}:${b}`,surface);}
  hubs[district]=[cx*d.scale,d.heights[1],d.rows[1]*d.scale];
 }
 // The crossing bypasses side-facing service buildings. It never cuts through their shells.
 const crossingZ=region==='embermesa'?16:region==='pelagia'?16:region==='alder'?11:12;
 nodes.crossing=[26*d.scale,(region==='saffron'?1:region==='pelagia'?.6:0)+.96,crossingZ*d.scale];
 const crossingSurface=region==='alder'?'street':region==='embermesa'?'trail':region==='pelagia'?'boardwalk':'bridge';
 addEdge('main:8','crossing',crossingSurface);addEdge('crossing','west:6',crossingSurface);
 for(const [i,place] of places.entries()){
  const west=i>=7,cx=west?52:0,local=i-(west?7:0),[x,z]=d.places[i],index=(west?indexForWest:indexForMain)[local],road=`${west?'west':'main'}:${index}`,elevation=nodes[road][1]-.96;
  const rotation=Math.atan2(-x,d.rows[1]-z);
  const variedWidth=(place==='WORK'||place==='CAMPUS'?1.08:place==='CORNER CAFÉ'?.9:1)*d.footprint[0];
  venues[place]={position:[(cx+x)*d.scale,elevation,z*d.scale],rotation,road,footprint:[variedWidth,d.footprint[1]]};
 }
 const result={region,name:d.name,scale:d.scale,nodes,edges,venues,hubs,bounds:{minX:-31*d.scale,maxX:84*d.scale,minZ:-38*d.scale,maxZ:32*d.scale},camera:{offset:[21*d.scale,29,33*d.scale] as LayoutPoint,maxDistance:Math.max(66,76*d.scale)}};
 layouts.set(region,result);return result;
}
export function venueDoor(layout:RegionLayout,place:string):LayoutPoint{
 const v=layout.venues[place];return[v.position[0]+Math.sin(v.rotation)*4.65,v.position[1]+.96,v.position[2]+Math.cos(v.rotation)*4.65];
}
export function layoutRoute(layout:RegionLayout,from:string,to:string,start=venueDoor(layout,from),end=venueDoor(layout,to)):LayoutPoint[]{
 if(from===to)return[start,end];
 const a=layout.venues[from].road,b=layout.venues[to].road,dist=new Map<string,number>([[a,0]]),previous=new Map<string,string>(),pending=new Set(Object.keys(layout.nodes));
 while(pending.size){let current:string|undefined;for(const id of pending)if(current===undefined||(dist.get(id)??Infinity)<(dist.get(current)??Infinity))current=id;
  if(!current||!Number.isFinite(dist.get(current)))break;pending.delete(current);if(current===b)break;
  for(const edge of layout.edges){const next=edge.from===current?edge.to:edge.to===current?edge.from:null;if(!next||!pending.has(next))continue;const p=layout.nodes[current],q=layout.nodes[next],n=dist.get(current)!+Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2]);if(n<(dist.get(next)??Infinity)){dist.set(next,n);previous.set(next,current);}}
 }
 if(!dist.has(b))throw new Error(`Unreachable regional venue: ${to}`);
 const ids=[b];while(ids[0]!==a){const prior=previous.get(ids[0]);if(!prior)throw new Error('Broken regional street graph');ids.unshift(prior);}
 // Shared marbles first use the broad arrival pad, then the center of the narrow public path.
 const entry=venueDoor(layout,from),exit=venueDoor(layout,to),different=(a:LayoutPoint,b:LayoutPoint)=>a.some((v,i)=>Math.abs(v-b[i])>1e-8);
 return[start,...(different(start,entry)?[entry]:[]),...ids.map(id=>[...layout.nodes[id]] as LayoutPoint),...(different(end,exit)?[exit]:[]),end];
}
export function routeLength(points:LayoutPoint[]){return points.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p[0]-points[i][0],p[1]-points[i][1],p[2]-points[i][2]),0);}
