import test from 'node:test';
import assert from 'node:assert/strict';
import {currentGame} from './current-fixture.mjs';
import {worldChoices,worldView,resolveWorldChoice,visiblePlaces,beginWorldWeek,initializeWorldPlayer,initializeSharedWorld,worldPlaceIds,applySharedVenueChange} from '../lib/world-life.ts';

const choice=(g,key)=>{const c=worldChoices(g.players[0],g).find(c=>c.key===key);assert.ok(c,key);return c;};
const take=(g,key)=>{const c=choice(g,key);assert.equal(c.available,true,c.reason);return resolveWorldChoice(g,g.players[0],c.id);};
test('new shared worlds initialize every locale once without rebuilding saved history',()=>{
 const g=currentGame(),p=g.players[0];assert.equal(Object.keys(p.world.localeHistory).length,5);assert.equal(p.world.localeHistory.alder.arrivals,1);assert.equal(p.world.localeHistory.saffron.arrivals,0);
 const before=JSON.stringify(g);initializeWorldPlayer(p);initializeSharedWorld(g);worldView(p,g);worldChoices(p,g);assert.equal(JSON.stringify(g),before);
 assert.ok(!('venueDecisions' in p.world));assert.ok(!('closedPlacesByRegion' in p.world));
});
test('exploration uses current exact previews, rejects stale IDs and replays successful IDs without spending',()=>{
 const g=currentGame(),p=g.players[0],c=choice(g,'explore'),before=structuredClone(p);const receipt=take(g,'explore');assert.deepEqual(receipt.effects,c.preview);
 for(const k of ['cash','hours','energy','joy','social'])assert.equal(p[k]-before[k],c.preview[k]);for(const place of c.preview.revealPlaces)assert.ok(visiblePlaces(p,g).includes(place));
 const saved=JSON.stringify(g);assert.deepEqual(resolveWorldChoice(g,p,c.id),receipt);assert.equal(JSON.stringify(g),saved);assert.throws(()=>resolveWorldChoice(g,p,'1:999:999:explore'),/stale or unknown/);assert.equal(JSON.stringify(g),saved);
});
test('visits track departures and arrivals without manufacturing a regional development',()=>{
 const g=currentGame(),p=g.players[0];g.round=2;beginWorldWeek(g);p.hours=6;const shared=JSON.stringify(g.sharedWorld),home=p.world.story.homeRegion;
 take(g,'travel:saffron');assert.equal(p.world.region,'saffron');assert.equal(p.world.story.homeRegion,home);assert.equal(p.world.localeHistory.alder.departures.length,1);assert.equal(p.world.localeHistory.saffron.arrivals,1);
 take(g,'travel:alder');assert.equal(p.world.localeHistory.alder.arrivals,2);assert.match(worldView(p,g).returnNarrative,/only been away briefly/);assert.equal(JSON.stringify(g.sharedWorld),shared);
});
test('regional development follows time even without travel and survives serialization',()=>{
 const g=currentGame(),p=g.players[0];g.round=7;beginWorldWeek(g);assert.equal(worldView(p,g).localChanges.length,3);const saved=JSON.stringify(g);beginWorldWeek(g);assert.equal(JSON.stringify(g),saved);const copy=JSON.parse(saved);assert.deepEqual(worldView(copy.players[0],copy),worldView(p,g));
});
test('shared closures affect every player and keep essentials safe',()=>{
 const g=currentGame({names:['A','B']});for(const p of g.players){p.world.discoveredPlacesByRegion.alder=[...worldPlaceIds];p.place='CINEMA';}
 const close={id:'cinema-safety',region:'alder',place:'CINEMA',status:'closed',description:'Repairs are needed.',reason:'Closed for safe repairs.',source:'story'};
 applySharedVenueChange(g,close);for(const p of g.players){assert.equal(p.place,'APARTMENTS');assert.ok(!visiblePlaces(p,g).includes('CINEMA'));assert.ok(visiblePlaces(p,g).includes('WORK'));}
 const saved=JSON.stringify(g);assert.equal(applySharedVenueChange(g,close),false);assert.throws(()=>applySharedVenueChange(g,{...close,id:'unsafe',place:'WORK'}),/must remain/);assert.equal(JSON.stringify(g),saved);
});
test('unknown or unaffordable world choices are atomic and no generic paid shift is offered',()=>{
 const g=currentGame(),p=g.players[0];p.cash=0;p.hours=0;const c=choice(g,'food'),saved=JSON.stringify(g);assert.equal(c.available,false);assert.throws(()=>resolveWorldChoice(g,p,c.id));assert.equal(JSON.stringify(g),saved);assert.ok(!worldChoices(p,g).some(c=>['regional_work','region_shift','release_cinema','keep_cinema'].includes(c.key)));
});
