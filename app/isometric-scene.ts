/** Pure, fixed-projection 2D scene math. No graphics API or gameplay state lives here. */
import {regionLayout,type LayoutPoint,type LayoutRegion} from './region-layouts';
import {paintedScenes} from './isometric-authored';
export type ScreenPoint={x:number;y:number};
export type SceneView={x:number;y:number;scale:number};
export const SCENE_WIDTH=1800,SCENE_HEIGHT=1200;
export const illustratedRegions:LayoutRegion[]=['alder','saffron','glasssteppe','pelagia','embermesa'];
export const regionArt:Record<LayoutRegion,{name:string;medium:string;ground:string;ink:string;path:string}>={
 alder:{name:'Alder Quay',medium:'Impressionist oil',ground:'#879992',ink:'#183f48',path:'#e4d0a2'},
 saffron:{name:'Saffron Reach',medium:'Matte gouache',ground:'#e3d1a5',ink:'#725740',path:'#f4dfb4'},
 glasssteppe:{name:'Glasssteppe',medium:'Geometric modernist oil',ground:'#9caeae',ink:'#293c59',path:'#cbd4d2'},
 pelagia:{name:'Pelagia',medium:'Ink & watercolor',ground:'#76b5bf',ink:'#245865',path:'#e5dab9'},
 embermesa:{name:'Ember Mesa',medium:'Twilight impasto',ground:'#4b4252',ink:'#e5b26b',path:'#c98e5d'},
};
export function sceneRegion(value?:string):LayoutRegion{return illustratedRegions.includes(value as LayoutRegion)?value as LayoutRegion:'alder';}
const projections=new Map<LayoutRegion,{scale:number;ox:number;oy:number}>();
function projection(region:LayoutRegion){
 let p=projections.get(region);if(p)return p;
 const points=Object.values(regionLayout(region).venues).map(v=>rawProject(v.position));
 const minX=Math.min(...points.map(p=>p.x))-110,maxX=Math.max(...points.map(p=>p.x))+110,minY=Math.min(...points.map(p=>p.y))-160,maxY=Math.max(...points.map(p=>p.y))+110;
 const scale=Math.min(1540/(maxX-minX),850/(maxY-minY));p={scale,ox:900-(minX+maxX)*scale/2,oy:640-(minY+maxY)*scale/2};projections.set(region,p);return p;
}
function rawProject(p:LayoutPoint):ScreenPoint{return{x:(p[0]-p[2])*10,y:(p[0]+p[2])*5-p[1]*11};}
export function projectPoint(region:LayoutRegion,p:LayoutPoint):ScreenPoint{const q=rawProject(p),v=projection(region);return{x:q.x*v.scale+v.ox,y:q.y*v.scale+v.oy};}
const artScale=SCENE_WIDTH/1536;
const artPoint=(p:[number,number]):ScreenPoint=>({x:p[0]*artScale,y:p[1]*artScale});
export function sceneDoor(region:LayoutRegion,place:string,slot=0):ScreenPoint{const v=paintedScenes[region].venues[place]||paintedScenes[region].venues.APARTMENTS,p=artPoint(v.door);return{x:p.x+slot*16,y:p.y+Math.abs(slot)*2};}
export function sceneNodes(region:LayoutRegion){return Object.fromEntries(Object.entries(paintedScenes[region].nodes).map(([id,p])=>[id,artPoint(p)]));}
export function sceneRoute(region:LayoutRegion,from:string,to:string,start?:ScreenPoint,end?:ScreenPoint):ScreenPoint[]{
 const l=regionLayout(region),nodes=sceneNodes(region),a=paintedScenes[region].venues[from]?.road||l.venues[from]?.road||'main:0',b=paintedScenes[region].venues[to]?.road||l.venues[to]?.road||'main:0';if(from===to)return[start||sceneDoor(region,from),end||sceneDoor(region,to)];
 const distances=new Map<string,number>([[a,0]]),previous=new Map<string,string>(),pending=new Set(Object.keys(nodes));
 while(pending.size){let current:string|undefined;for(const id of pending)if(current===undefined||(distances.get(id)??Infinity)<(distances.get(current)??Infinity))current=id;if(!current||!Number.isFinite(distances.get(current)))break;pending.delete(current);if(current===b)break;for(const edge of l.edges){const next=edge.from===current?edge.to:edge.to===current?edge.from:null;if(!next||!pending.has(next))continue;const n=distances.get(current)!+Math.hypot(nodes[current].x-nodes[next].x,nodes[current].y-nodes[next].y);if(n<(distances.get(next)??Infinity)){distances.set(next,n);previous.set(next,current);}}}
 const route=[b];while(route[0]!==a){const prior=previous.get(route[0]);if(!prior)throw Error('Unreachable illustrated venue');route.unshift(prior);}
 const fromVia=(paintedScenes[region].venues[from]?.via||[]).map(artPoint),toVia=(paintedScenes[region].venues[to]?.via||[]).map(artPoint).reverse();
 return[start||sceneDoor(region,from),...fromVia,...route.map(id=>nodes[id]),...toVia,end||sceneDoor(region,to)];
}
export function pathLength(path:ScreenPoint[]){return path.slice(1).reduce((n,p,i)=>n+Math.hypot(p.x-path[i].x,p.y-path[i].y),0);}
export function pointAlong(path:ScreenPoint[],progress:number):ScreenPoint{if(!path.length)return{x:0,y:0};let distance=pathLength(path)*Math.max(0,Math.min(1,progress));for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],len=Math.hypot(b.x-a.x,b.y-a.y);if(distance<=len&&len>0){const t=distance/len;return{x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};}distance-=len;}return{...path.at(-1)!};}
export function pathData(path:ScreenPoint[]){return path.map((p,i)=>(i?'L':'M')+p.x.toFixed(2)+','+p.y.toFixed(2)).join(' ');}
export function worldToScreen(p:ScreenPoint,view:SceneView):ScreenPoint{return{x:p.x*view.scale+view.x,y:p.y*view.scale+view.y};}
export function screenToWorld(p:ScreenPoint,view:SceneView):ScreenPoint{return{x:(p.x-view.x)/view.scale,y:(p.y-view.y)/view.scale};}
export function zoomAt(view:SceneView,factor:number,anchor:ScreenPoint,min=.15,max=2):SceneView{const p=screenToWorld(anchor,view),scale=Math.max(min,Math.min(max,view.scale*factor));return{scale,x:anchor.x-p.x*scale,y:anchor.y-p.y*scale};}
export function clampView(view:SceneView,width:number,height:number):SceneView{const w=SCENE_WIDTH*view.scale,h=SCENE_HEIGHT*view.scale;return{...view,x:w>=width?Math.max(width-w,Math.min(0,view.x)):(width-w)/2,y:h>=height?Math.max(height-h,Math.min(0,view.y)):(height-h)/2};}
export function inPolygon(p:ScreenPoint,polygon:ScreenPoint[]){let inside=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const a=polygon[i],b=polygon[j];if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)inside=!inside;}return inside;}
export function venueShape(region:LayoutRegion,place:string){const [x,y,w,h]=paintedScenes[region].venues[place].box;return [[x,y+h*.35],[x+w*.54,y],[x+w,y+h*.25],[x+w,y+h*.86],[x+w*.57,y+h],[x,y+h*.8]].map(p=>artPoint(p as [number,number]));}
export function venueDepth(region:LayoutRegion,place:string){const v=paintedScenes[region].venues[place];return (v.door[1]-1)*artScale;}
export function personMarkup({color='#b45d44',scale=1,active=false,number='',skin='#b58160',hair='#443a33'}:{color?:string;scale?:number;active?:boolean;number?:string;skin?:string;hair?:string}){
 // Small painted full-body figures with a grounded contact shadow, never portrait pins.
 return `<g transform="scale(${scale})"><ellipse cy="1" rx="12" ry="4" fill="#142934" opacity=".24"/>${active?'<ellipse cy="1" rx="16" ry="7" fill="none" stroke="#fff7d1" stroke-width="2.5"/>':''}<g class="iso-person-body"><path class="iso-leg iso-leg-left" d="M-3 -15 L-4 -2" stroke="#364653" stroke-width="5" stroke-linecap="round"/><path class="iso-leg iso-leg-right" d="M4 -15 L5 -2" stroke="#273e4b" stroke-width="5" stroke-linecap="round"/><path d="M-6 -33 Q0 -36 7 -32 L9 -14 Q0 -11 -9 -14 Z" fill="${color}" stroke="#273f4838" stroke-width="1"/><path class="iso-arm" d="M-7 -29 L-11 -18 M8 -29 L12 -20" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round"/><path d="M-10 -18 L-10 -15 M12 -20 L12 -17" stroke="${skin}" stroke-width="3" stroke-linecap="round"/><ellipse cx="0" cy="-41" rx="6.7" ry="8" fill="${skin}"/><path d="M-7 -41 Q-9 -53 2 -51 Q9 -51 7 -40 L4 -45 Q-1 -43 -7 -41" fill="${hair}"/><path d="M-4 -3 L-8 -1 M4 -3 L9 -1" stroke="#273334" stroke-width="4" stroke-linecap="round"/></g>${number?`<g transform="translate(0 -65)"><circle r="10" fill="${color}" stroke="#fff1c8" stroke-width="2"/><text text-anchor="middle" y="4" font-family="sans-serif" font-size="11" font-weight="700" fill="white">${number}</text></g>`:''}</g>`;
}
