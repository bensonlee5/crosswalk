import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {harness,room,S} from './support/isometric-harness.mjs';
import {regionDefinitions} from '../lib/world-life.ts';
const contract=JSON.parse(readFileSync(new URL('./fixtures/venue-names-v2.json',import.meta.url),'utf8'));
const numbers=text=>text.match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi).map(Number);
function labelBounds(h,label){
 const copy=label.querySelector('.iso-label-copy'),[gx,gy]=numbers(label.getAttribute('transform')),[dx,dy,scale]=numbers(copy.getAttribute('transform')),[x,y,zoom]=numbers(h.svg.children[1].getAttribute('transform'));
 const rect=copy.querySelector('rect'),point=S.worldToScreen({x:gx+dx,y:gy+dy},{x,y,scale:zoom});
 return {x:point.x,y:point.y,w:Number(rect.getAttribute('width'))*scale*zoom,h:Number(rect.getAttribute('height'))*scale*zoom};
}
for(const [width,height]of [[320,360],[390,470],[1000,620]])test(`${width}px: every proper local name and evolved name stays in its map label and retains the stable tap target`,()=>{
 let checked=0;
 for(const region of Object.keys(regionDefinitions)){
  const names={...regionDefinitions[region].placeNames},h=harness({reduced:true,width,height,placeName:place=>names[place]}),g=room(region);
  h.engine.sync(g.players,0,true,undefined,g);
  for(const venue of contract.venues.filter(v=>v.regionId===region))for(const name of [venue.name,...venue.evolvedNames]){
   names[venue.placeId]=name;g.players[0].place=venue.placeId;g.sharedWorld.regions[region].revision++;
   h.engine.sync(g.players,0,true,undefined,g);h.engine.focus();
   const label=h.parent.querySelectorAll('.iso-place-label').find(el=>el.dataset.place===venue.placeId),copy=label.querySelector('.iso-label-copy'),text=copy.querySelector('text'),rect=copy.querySelector('rect');
   assert.equal(copy.querySelector('title').textContent,name,'the full name remains available');
   assert.notEqual(copy.style.display,'none','selected venue stays visible');
   assert.ok(Number(rect.getAttribute('width'))<=205,'label width is capped');
   assert.ok(Number(text.getAttribute('textLength'))<=Number(rect.getAttribute('width'))-20,'text fits its visible box');
   assert.equal(text.getAttribute('lengthAdjust'),'spacingAndGlyphs');
   const b=labelBounds(h,label);
   assert.ok(b.x-b.w/2>=7.99&&b.x+b.w/2<=width-7.99,name+' fits horizontally');
   assert.ok(b.y-b.h/2>=7.99&&b.y+b.h/2<=height-7.99,name+' fits vertically');
   h.event('pointerdown',b.x,b.y);h.event('pointerup',b.x,b.y);assert.equal(h.picks.at(-1)?.[0],venue.placeId);
   names[venue.placeId]=venue.name;checked++;
  }
  h.dispose();
 }
 assert.equal(checked,92,'all 75 base and 17 evolved names exercised');
});

test('phone Places list can wrap proper names and the truncated HUD exposes the full title',()=>{
 const css=readFileSync(new URL('../app/globals.css',import.meta.url),'utf8'),screen=readFileSync(new URL('../app/game-screen.tsx',import.meta.url),'utf8');
 assert.match(css,/\.game-place-list span\{[^}]*min-width:0/);
 assert.match(css,/\.game-place-list strong\{[^}]*overflow-wrap:anywhere/);
 assert.match(css,/\.game-current-place span\{[^}]*text-overflow:ellipsis/);
 assert.ok(screen.replace(/\s+/g,'').includes('<spantitle={worldPlaceName(p,p.place,g)}>{worldPlaceName(p,p.place,g)}</span>'));
});
