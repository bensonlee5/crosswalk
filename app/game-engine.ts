import {visiblePlaces,worldView,worldPlaceName} from '@/lib/world-life';
import {locations,marbleColors} from '@/lib/locations';
import {assetUrl} from '@/lib/asset-url';
import {characterVisualIdentity} from '@/lib/character-visuals';
import type {Player,GameView as Game} from '@/lib/game';
import type {Weather} from '@/lib/weather';
import {regionLayout,type LayoutRegion} from './region-layouts';
import {SCENE_WIDTH,SCENE_HEIGHT,sceneRegion,regionArt,sceneDoor,sceneRoute,venueShape,venueDepth,pointAlong,pathLength,pathData,screenToWorld,worldToScreen,zoomAt,clampView,inPolygon,personMarkup,type ScreenPoint,type SceneView} from './isometric-scene';
export type TownActor={id:string;name:string;spot:string;companionId?:string};
export type TownControl={weather:(weather:Weather|null)=>void;sync:(players:Player[],turn:number,active:boolean,project?:Game['project'],game?:Game,actors?:TownActor[])=>void;district:(name:string)=>void;zoom:(factor:number)=>void;pan:(dx:number,dy:number)=>void;overview:()=>void;quality:(low:boolean)=>void;celebrate:()=>void;focus:()=>void;destroy:()=>void};
const NS='http://www.w3.org/2000/svg';
const svgNode=<K extends keyof SVGElementTagNameMap>(tag:K,attrs:Record<string,string|number>={})=>{const el=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,String(v)));return el;};
type Figure={scale:number;el:SVGGElement;position:ScreenPoint;target:ScreenPoint;place:string;route:ScreenPoint[];start:number;duration:number;player:boolean;id:string;name:string;spot:string};
/** Illustrated SVG artwork, screen-space camera and authored paths. No WebGL or 3D scene. */
export function createTown(parent:HTMLElement,onPick:(place:string,actorId?:string)=>void,onReady:(software?:boolean)=>void,onTravel:(moving:boolean)=>void,onFailure?:()=>void):TownControl{
 const reducedQuery=window.matchMedia('(prefers-reduced-motion: reduce)');
 let reduced=reducedQuery.matches,disposed=false,active=false,moving=false,low=false,players:Player[]=[],turn=0,region:LayoutRegion='alder',context='',key='',game:Game|undefined;
 let shown:string[]=locations.map(l=>l.place),closed:string[]=[],currentWeather:Weather|null=null,width=1,height=1,frame=0,now=performance.now()/1000,dirty=true,framed=false;
 let view:SceneView={x:0,y:0,scale:1},camera:{from:SceneView;to:SceneView;start:number;duration:number}|null=null;
 const root=svgNode('svg',{'aria-hidden':'true',class:'illustrated-town',width:'100%',height:'100%'}),viewport=svgNode('g'),defs=svgNode('defs'),backdrop=svgNode('image',{width:SCENE_WIDTH,height:SCENE_HEIGHT,preserveAspectRatio:'none'}),depthLayer=svgNode('g'),routeLayer=svgNode('g',{'pointer-events':'none'}),labelLayer=svgNode('g'),weatherLayer=svgNode('g',{'pointer-events':'none',class:'iso-weather'});
 const routeLine=svgNode('path',{class:'iso-walking-route',fill:'none','stroke-linecap':'round','stroke-linejoin':'round'});routeLayer.append(routeLine);
 viewport.append(backdrop,routeLayer,depthLayer,labelLayer);root.append(defs,viewport,weatherLayer);parent.append(root);
 const attribution=document.createElement('div');attribution.className='iso-art-caption';parent.append(attribution);
 const figures=new Map<string,Figure>(),occluders:{el:SVGGElement;depth:number}[]=[],labels=new Map<string,SVGGElement>(),labelHits=new Map<string,{x:number;y:number;w:number;h:number}>();
 let artRequest=0;const imageCache=new Set<string>();
 parent.dataset.renderer='illustrated-isometric';parent.dataset.cameraTravel='idle';parent.dataset.travel='idle';
 function finishTravel(){if(moving){moving=false;parent.dataset.travel='idle';onTravel(false);}routeLine.setAttribute('d','');}
 function applyView(){view=clampView(view,width,height);viewport.setAttribute('transform',`translate(${view.x} ${view.y}) scale(${view.scale})`);parent.dataset.zoom=view.scale.toFixed(3);layoutLabels();dirty=false;}
 function moveView(to:SceneView,duration=.3){to=clampView(to,width,height);if(reduced||document.hidden||!framed){view=to;camera=null;parent.dataset.cameraTravel='idle';applyView();return;}camera={from:{...view},to,start:now,duration};parent.dataset.cameraTravel='moving';}
 function framePoint(p:ScreenPoint,scale=view.scale){moveView({scale,x:width/2-p.x*scale,y:height*.55-p.y*scale});framed=true;}
 function overview(){const scale=Math.max(.15,Math.min(width/SCENE_WIDTH,height/SCENE_HEIGHT)*1.05);moveView({scale,x:(width-SCENE_WIDTH*scale)/2,y:(height-SCENE_HEIGHT*scale)/2});framed=true;}
 function focus(){const p=players[turn];if(p){const center=sceneDoor(region,p.place);framePoint({...center,y:center.y-75},Math.max(Math.min(width/750,height/490),Math.min(view.scale,1.45)));}}
 function district(name:string){const points=locations.filter(l=>l.district===name).map(l=>sceneDoor(region,l.place));if(!points.length)return;const minX=Math.min(...points.map(p=>p.x))-90,maxX=Math.max(...points.map(p=>p.x))+90,minY=Math.min(...points.map(p=>p.y))-170,maxY=Math.max(...points.map(p=>p.y))+80;const scale=Math.min(width/(maxX-minX),height/(maxY-minY))*.95;framePoint({x:(minX+maxX)/2,y:(minY+maxY)/2},scale);}
 function settleMotion(){if(camera){view={...camera.to};camera=null;applyView();}parent.dataset.cameraTravel='idle';for(const f of figures.values()){f.position={...f.target};f.route=[];f.el.classList.remove('is-walking');positionFigure(f);}finishTravel();depthSort();}
 function positionFigure(f:Figure){f.el.setAttribute('transform',`translate(${f.position.x.toFixed(2)} ${f.position.y.toFixed(2)})`);f.el.dataset.x=f.position.x.toFixed(2);f.el.dataset.y=f.position.y.toFixed(2);}
 function depthSort(){[...occluders.map(o=>({el:o.el,depth:o.depth})),...Array.from(figures.values()).filter(f=>f.el.style.display!=='none').map(f=>({el:f.el,depth:f.position.y}))].sort((a,b)=>a.depth-b.depth).forEach(({el})=>depthLayer.append(el));}
 function loadArt(){const request=++artRequest,url=assetUrl(`/paintings/isometric/${region}.webp`);backdrop.setAttribute('href',url);if(imageCache.has(url)){parent.dataset.art='ready';onReady(false);return;}parent.dataset.art='loading';const image=new Image();image.onload=()=>{imageCache.add(url);if(!disposed&&request===artRequest){parent.dataset.art='ready';onReady(false);}};image.onerror=()=>{if(!disposed&&request===artRequest){parent.dataset.art='failed';onFailure?.();}};image.src=url;}
 function rebuild(actors:TownActor[],project?:Game['project']){
  depthLayer.replaceChildren();labelLayer.replaceChildren();defs.replaceChildren();figures.clear();occluders.length=0;labels.clear();loadArt();
  const art=regionArt[region];parent.style.background=art.ground;parent.dataset.region=region;parent.dataset.layout=regionLayout(region).name;parent.dataset.paintStyle=art.medium;parent.dataset.locations=String(shown.length);attribution.textContent=art.name+' · '+art.medium;
  for(const [i,loc] of locations.entries()){
   const polygon=venueShape(region,loc.place),points=polygon.map(p=>`${p.x},${p.y}`).join(' '),clip=svgNode('clipPath',{id:`paint-occlusion-${i}`});clip.append(svgNode('polygon',{points}));defs.append(clip);
   const building=svgNode('g',{'data-occluder':loc.place,'pointer-events':'none'});building.append(svgNode('image',{href:assetUrl(`/paintings/isometric/${region}.webp`),width:SCENE_WIDTH,height:SCENE_HEIGHT,preserveAspectRatio:'none','clip-path':`url(#paint-occlusion-${i})`}));
   if(closed.includes(loc.place))building.append(svgNode('polygon',{points,fill:'#303c46',opacity:'.45'}));
   occluders.push({el:building,depth:venueDepth(region,loc.place)});
   if(!shown.includes(loc.place))continue;
   const g=svgNode('g',{class:'iso-place-label','data-place':loc.place}),dot=svgNode('circle',{r:4,fill:art.path,stroke:art.ink,'stroke-width':1.5}),label=svgNode('g',{class:'iso-label-copy'}),name=game&&players[turn]?worldPlaceName(players[turn],loc.place,game):loc.name;
   const text=svgNode('text',{'text-anchor':'middle',y:5}),title=svgNode('title');text.textContent=name;title.textContent=name;label.append(text,title);g.append(dot,label);labelLayer.append(g);
   const measure=()=>{const measured=text.getComputedTextLength?.();return measured&&Number.isFinite(measured)?measured:[...(text.textContent||'')].reduce((n,c)=>n+(/[MW@]/.test(c)?11:/[Iijl.,’' ]/.test(c)?4:/[A-Z]/.test(c)?8:6.5),0);};
   const w=Math.max(68,Math.min(205,measure()+20)),letters=[...name];let count=letters.length;
   while(measure()>w-20&&count>1){count--;text.textContent=letters.slice(0,count).join('').trimEnd()+'…';}
   text.setAttribute('textLength',String(Math.min(measure(),w-20)));text.setAttribute('lengthAdjust','spacingAndGlyphs');label.prepend(svgNode('rect',{x:-w/2,y:-16,width:w,height:32,rx:5}));labels.set(loc.place,g);
  }
  for(const actor of [...actors].sort((a,b)=>Number(!!a.companionId)-Number(!!b.companionId))){
   if(!shown.includes(actor.spot)||closed.includes(actor.spot))continue;
   const identity=characterVisualIdentity(actor.id),age=identity?.ageStage;const paletteIndex=[...actor.id].reduce((n,c)=>n+c.charCodeAt(0),0)%5;const scale=age==='toddler'?.42:age==='child'?.67:age==='teen'?.86:age==='elder'?.93:1;
   const siblings=actors.filter(a=>a.spot===actor.spot),slot=siblings.findIndex(a=>a.id===actor.id);const p=sceneDoor(region,actor.spot),guardian=actor.companionId?figures.get('npc:'+actor.companionId):undefined,position=guardian?{x:guardian.position.x+16,y:guardian.position.y+6}:{x:p.x+26+(slot%3)*23,y:p.y+4+Math.floor(slot/3)*14};
   const el=svgNode('g',{class:'iso-person iso-resident','data-actor':actor.id,'data-age':age||'adult'}),title=svgNode('title');title.textContent=`${actor.name}${identity?' · '+identity.role:''}`;
   el.innerHTML=personMarkup({color:['#4c7372','#a86241','#737f52','#876875','#a68655'][paletteIndex],scale});el.prepend(title);const f:Figure={scale,el,position,target:{...position},place:actor.spot,route:[],start:0,duration:0,player:false,id:actor.id,name:actor.name,spot:actor.spot};figures.set('npc:'+actor.id,f);positionFigure(f);
  }
  parent.dataset.garden=project?.completed?'blooming':Object.values(project?.contributions||{}).some(n=>n>0)?'growing':'empty';
  if(project?.completed&&shown.includes('GARDEN')){const p=sceneDoor(region,'GARDEN'),g=svgNode('g',{'pointer-events':'none','data-garden':'blooming',transform:`translate(${p.x} ${p.y})`});g.innerHTML='<path d="M-20 0L-19 -20 M-10 0L-8 -15 M0 0L2 -24" stroke="#658755" stroke-width="3"/><circle cx="-19" cy="-20" r="5" fill="#e5b568"/><circle cx="-8" cy="-15" r="5" fill="#c56c65"/><circle cx="2" cy="-24" r="5" fill="#edc693"/>';occluders.push({el:g,depth:p.y});}
 }
 function targetFor(p:Player){const neighbors=players.filter(q=>q.place===p.place&&sceneRegion(q.world?.region)===sceneRegion(p.world?.region)),slot=neighbors.findIndex(q=>q.id===p.id)-(neighbors.length-1)/2;return sceneDoor(region,p.place,slot);}
 function sync(next:Player[],nextTurn:number,enabled:boolean,project?:Game['project'],nextGame?:Game,actors:TownActor[]=[]){
  if(disposed||!next[nextTurn])return;const current=next[nextTurn],nextRegion=sceneRegion(current.world?.region),nextContext=[nextGame?.code,current.id,nextGame?.round,nextRegion].join('|'),changedContext=!!context&&context!==nextContext,regionChanged=nextRegion!==region;
  if(changedContext||(!enabled&&active))cancelGestures();if(changedContext)settleMotion();context=nextContext;players=next;turn=nextTurn;active=enabled;game=nextGame;region=nextRegion;
  const evolution=nextGame?worldView(current,nextGame):null;shown=visiblePlaces(current,nextGame);closed=evolution?.closedPlaces||[];
  const nextKey=[region,shown.join(','),closed.join(','),evolution?.localeRevision,actors.map(a=>a.id+'@'+a.spot).join('|'),!!project?.completed].join(':');
  const rebuilt=nextKey!==key,oldFigures=new Map(figures);if(rebuilt){key=nextKey;rebuild(actors,project);}
  for(const [i,p]of players.entries()){
   let f=figures.get('player:'+p.id);const old=oldFigures.get('player:'+p.id),target=targetFor(p);
   if(!f){const el=svgNode('g',{class:'iso-person iso-player','data-player':p.id});el.innerHTML=personMarkup({color:marbleColors[i%marbleColors.length],active:i===turn,number:String(i+1)});const pos=old&&!regionChanged&&!changedContext?old.position:target;f={scale:1,el,position:{...pos},target,place:old?.place||p.place,route:old&&!regionChanged&&!changedContext?old.route:[],start:old?.start??now,duration:old?.duration??0,player:true,id:p.id,name:p.name,spot:p.place};figures.set('player:'+p.id,f);f.el.classList.toggle('is-walking',f.route.length>0);}
   if(changedContext){f.position={...target};f.place=p.place;f.route=[];}
   if(f.place!==p.place){f.route=sceneRoute(region,f.place,p.place,f.position,target);f.start=now;f.duration=reduced||document.hidden?0:Math.max(.65,Math.min(1.2,pathLength(f.route)/700));f.place=p.place;f.spot=p.place;f.target=target;f.el.classList.toggle('is-walking',f.duration>0);if(i===turn){moving=f.duration>0;parent.dataset.travel=moving?'walking':'idle';if(moving){routeLine.setAttribute('d',pathData(f.route));onTravel(true);}if(moving)cancelCamera();else framePoint({...target,y:target.y-65});}if(!f.duration){f.position={...target};f.route=[];if(i===turn){onTravel(false);finishTravel();}}}
   else if(!f.route.length){f.target=target;f.position={...target};}
   if(f.el.dataset.active!==String(i===turn)){f.el.innerHTML=personMarkup({color:marbleColors[i%marbleColors.length],active:i===turn,number:String(i+1)});f.el.dataset.active=String(i===turn);}
   f.el.style.display=sceneRegion(p.world?.region)===region?'':'none';positionFigure(f);
  }
  for(const [id,f]of figures)if(f.player&&!players.some(p=>p.id===f.id)){f.el.remove();figures.delete(id);}
  parent.dataset.studios=String(players.filter(p=>p.housing>0).length);root.classList.toggle('iso-disabled',!active||moving);depthSort();layoutLabels();if(!framed||regionChanged||changedContext){district(locations.find(l=>l.place===current.place)?.district||'main');}dirty=true;
 }
 function layoutLabels(){
  const selected=players[turn]?.place;const occupied:{x:number;y:number;w:number;h:number}[]=[];labelHits.clear();
  for(const [place,g]of [...labels].sort(([a],[b])=>Number(b===selected)-Number(a===selected))){
   const door=sceneDoor(region,place),base=worldToScreen({x:door.x,y:door.y+20},view),copy=g.querySelector<SVGGElement>('.iso-label-copy')!,w=Number(copy.querySelector('rect')?.getAttribute('width'))||140,h=32;
   let x=base.x,y=base.y+16;const isSelected=place===selected;
   if(isSelected){x=Math.max(w/2+8,Math.min(width-w/2-8,x));y=Math.max(h/2+8,Math.min(height-h/2-8,y));}
   const bounds={x,y,w,h},off=x-w/2<8||x+w/2>width-8||y-h/2<8||y+h/2>height-8,crowded=occupied.some(o=>Math.abs(o.x-x)<(o.w+w)/2+8&&Math.abs(o.y-y)<(o.h+h)/2+9),visible=!off&&(isSelected||!crowded);
   g.setAttribute('transform',`translate(${door.x} ${door.y+20})`);copy.setAttribute('transform',`translate(${(x-base.x)/view.scale} ${(y-base.y)/view.scale}) scale(${1/view.scale})`);g.classList.toggle('is-here',isSelected);copy.style.display=visible?'':'none';
   if(visible){occupied.push(bounds);labelHits.set(place,bounds);}
  }
 }
 function weather(value:Weather|null){currentWeather=value;parent.dataset.season=value?.season||'';parent.dataset.weather=value?.type||'none';parent.dataset.atmosphere=value?.atmosphere||'clear';renderWeather();}
 function renderWeather(){weatherLayer.replaceChildren();const type=currentWeather?.type,atmosphere=currentWeather?.atmosphere;const tint=atmosphere==='fog'?'#dce4df':atmosphere==='dust'?'#c79768':type==='rain'?'#4d7184':type==='snow'?'#d6e7ed':type==='heat'?'#e6b772':null;if(tint)weatherLayer.append(svgNode('rect',{width:'100%',height:'100%',fill:tint,opacity:atmosphere==='fog'?'.16':'.08'}));const enabled=!reduced&&!low&&(type==='rain'||type==='snow');parent.dataset.weatherParticles=enabled?'32':'0';if(enabled)for(let i=0;i<32;i++){const x=((i*137.3)%Math.max(width,1)),y=((i*91.7)%Math.max(height,1));const el=type==='rain'?svgNode('path',{d:`M${x} ${y}l-4 16`,stroke:'#dce9e9','stroke-width':1.2,opacity:'.4',class:'iso-rain'}):svgNode('circle',{cx:x,cy:y,r:2,fill:'#f7fcff',opacity:'.7',class:'iso-snow'});el.style.animationDelay=(-i*.31)+'s';weatherLayer.append(el);}}
 function resize(){const oldWidth=width,oldHeight=height;width=parent.clientWidth||1;height=parent.clientHeight||1;root.setAttribute('viewBox',`0 0 ${width} ${height}`);if(framed){view.x+=(width-oldWidth)/2;view.y+=(height-oldHeight)/2;applyView();}renderWeather();dirty=true;}
 const observer=new ResizeObserver(resize);observer.observe(parent);resize();
 const pointers=new Map<number,ScreenPoint>();let down:ScreenPoint={x:0,y:0},last:ScreenPoint={x:0,y:0},gesture=false,pinchDistance=0;
 const local=(e:PointerEvent):ScreenPoint=>{const r=root.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};};
 function cancelCamera(){camera=null;parent.dataset.cameraTravel='idle';}
 function cancelGestures(){for(const id of pointers.keys())root.releasePointerCapture?.(id);pointers.clear();gesture=true;pinchDistance=0;root.classList.remove('is-grabbing');}
 function pointerDown(e:PointerEvent){if(!active||moving||e.button>0)return;cancelCamera();const p=local(e);pointers.set(e.pointerId,p);root.setPointerCapture?.(e.pointerId);if(pointers.size===1){down=last=p;gesture=false;}else{gesture=true;const ps=[...pointers.values()];pinchDistance=Math.hypot(ps[0].x-ps[1].x,ps[0].y-ps[1].y);}root.classList.add('is-grabbing');}
 function pointerMove(e:PointerEvent){if(!pointers.has(e.pointerId)||!active||moving)return;const p=local(e);pointers.set(e.pointerId,p);if(pointers.size>1){const ps=[...pointers.values()],distance=Math.hypot(ps[0].x-ps[1].x,ps[0].y-ps[1].y),anchor={x:(ps[0].x+ps[1].x)/2,y:(ps[0].y+ps[1].y)/2};if(pinchDistance)view=zoomAt(view,distance/pinchDistance,anchor);pinchDistance=distance;gesture=true;}else{if(Math.hypot(p.x-down.x,p.y-down.y)>6)gesture=true;if(gesture){view.x+=p.x-last.x;view.y+=p.y-last.y;}last=p;}applyView();}
 function pickAt(p:ScreenPoint){
  if(!active||moving||disposed||document.hidden)return;
  // Labels paint above people and buildings, so their exact visible rectangles win.
  const labelHit=[...labelHits].find(([,b])=>Math.abs(p.x-b.x)<=b.w/2&&Math.abs(p.y-b.y)<=b.h/2);if(labelHit){if(!closed.includes(labelHit[0]))onPick(labelHit[0]);return;}
  const q=screenToWorld(p,view),residents=[...figures.values()].filter(f=>!f.player&&f.el.style.display!=='none').map(f=>{
   const dx=Math.max(Math.abs(q.x-f.position.x)-13*f.scale,0),dy=Math.max(f.position.y-51*f.scale-q.y,q.y-f.position.y-2*f.scale,0);
   return{f,distance:Math.hypot(dx,dy)*view.scale,center:Math.hypot(q.x-f.position.x,q.y-(f.position.y-25*f.scale))*view.scale};
  });
  const precise=residents.filter(r=>r.distance===0).sort((a,b)=>b.f.position.y-a.f.position.y)[0],expanded=residents.filter(r=>r.distance<=18).sort((a,b)=>a.distance-b.distance||a.center-b.center)[0],resident=precise||expanded;
  if(resident){onPick(resident.f.spot,resident.f.id);return;}
  const hit=locations.filter(l=>shown.includes(l.place)&&!closed.includes(l.place)&&inPolygon(q,venueShape(region,l.place))).sort((a,b)=>venueDepth(region,b.place)-venueDepth(region,a.place))[0];if(hit)onPick(hit.place);
 }
 function pointerUp(e:PointerEvent){const had=pointers.has(e.pointerId),p=local(e),single=pointers.size===1,tap=had&&single&&!gesture;pointers.delete(e.pointerId);root.releasePointerCapture?.(e.pointerId);if(!pointers.size)root.classList.remove('is-grabbing');if(tap)pickAt(p);if(pointers.size===1){last=[...pointers.values()][0];gesture=true;}}
 function cancelPointer(e:PointerEvent){pointers.delete(e.pointerId);gesture=true;if(!pointers.size)root.classList.remove('is-grabbing');}
 root.addEventListener('pointerdown',pointerDown);root.addEventListener('pointermove',pointerMove);root.addEventListener('pointerup',pointerUp);root.addEventListener('pointercancel',cancelPointer);root.addEventListener('lostpointercapture',cancelPointer);
 function visibility(){if(document.hidden){cancelGestures();settleMotion();}}
 function preference(){reduced=reducedQuery.matches;root.classList.toggle('iso-reduced-motion',reduced);if(reduced)settleMotion();renderWeather();}
 document.addEventListener('visibilitychange',visibility);reducedQuery.addEventListener('change',preference);root.classList.toggle('iso-reduced-motion',reduced);
 function animate(ms:number){if(disposed)return;frame=requestAnimationFrame(animate);now=ms/1000;if(document.hidden)return;if(camera){const t=Math.min(1,(now-camera.start)/camera.duration),ease=t*t*(3-2*t);view={x:camera.from.x+(camera.to.x-camera.from.x)*ease,y:camera.from.y+(camera.to.y-camera.from.y)*ease,scale:camera.from.scale+(camera.to.scale-camera.from.scale)*ease};dirty=true;if(t===1){camera=null;parent.dataset.cameraTravel='idle';}}
  let moved=false;for(const f of figures.values())if(f.route.length){const t=f.duration?Math.min(1,(now-f.start)/f.duration):1;f.position=pointAlong(f.route,t);positionFigure(f);moved=true;if(f.id===players[turn]?.id){camera=null;parent.dataset.cameraTravel='idle';view={...view,x:width*.5-f.position.x*view.scale,y:height*.6-f.position.y*view.scale};dirty=true;}if(t===1){f.route=[];f.el.classList.remove('is-walking');if(f.id===players[turn]?.id)finishTravel();}}
  if(moved)depthSort();if(dirty)applyView();
 }
 frame=requestAnimationFrame(animate);
 return{sync,weather,district,focus,overview,zoom:factor=>{cancelCamera();view=zoomAt(view,factor,{x:width/2,y:height/2});applyView();},pan:(dx,dy)=>{cancelCamera();view.x-=dx;view.y-=dy;applyView();},quality:value=>{low=value;parent.dataset.quality=low?'quiet':'animated';renderWeather();},celebrate:()=>{const f=figures.get('player:'+players[turn]?.id);if(f&&!reduced)f.el.animate?.([{opacity:.4},{opacity:1}],{duration:500});},destroy:()=>{if(disposed)return;cancelGestures();settleMotion();disposed=true;++artRequest;cancelAnimationFrame(frame);observer.disconnect();document.removeEventListener('visibilitychange',visibility);reducedQuery.removeEventListener('change',preference);root.removeEventListener('pointerdown',pointerDown);root.removeEventListener('pointermove',pointerMove);root.removeEventListener('pointerup',pointerUp);root.removeEventListener('pointercancel',cancelPointer);root.removeEventListener('lostpointercapture',cancelPointer);root.remove();attribution.remove();figures.clear();labels.clear();labelHits.clear();}};
}
