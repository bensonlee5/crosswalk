import assert from 'node:assert/strict';
import {initializeSharedWorld,worldChoices,resolveWorldChoice,worldView,beginWorldWeek,afterWorldAction,applySharedVenueChange,getSharedVenueState,sharedVenueReason,visiblePlaces,worldPlaceName,worldPlaceIds,regionDefinitions} from '../lib/world-life.ts';
import {monthlyBills} from '../lib/economy.ts';
import {currentGame} from './current-fixture.mjs';
const game=(count=1)=>currentGame({names:Array.from({length:count},(_,i)=>`P${i}`)});
const pick=(g,key,p=g.players[g.turn])=>{const c=worldChoices(p,g).find(c=>c.key===key);assert.ok(c,`missing ${key}`);return c;};
const choose=(g,key,p=g.players[g.turn])=>{let c=pick(g,key,p);if(c.spot&&c.actorId){assert.ok(visiblePlaces(p,g).includes(c.spot),`unavailable spot ${c.spot} for ${key}`);p.place=c.spot;c=pick(g,key,p);}assert.equal(c.available,true,`${key}: ${c.reason}`);return resolveWorldChoice(g,p,c.id);};
const advance=(g,round)=>{g.round=round;for(const p of g.players){p.hours=6;p.energy=85;}beginWorldWeek(g);};
// Current initialization and all reads preserve existing state.
{
 const h=game(),snapshot=JSON.stringify(h);initializeSharedWorld(h);worldView(h.players[0],h);worldChoices(h.players[0],h);assert.equal(JSON.stringify(h),snapshot);
}
// Shared geography is canonical, personal knowledge and relationships stay private.
{
 const g=game(2),[a,b]=g.players;a.world.discoveredPlacesByRegion.alder=[...worldPlaceIds];b.world.discoveredPlacesByRegion.alder=[...worldPlaceIds];a.place='CINEMA';b.place='CINEMA';
 const change={id:'cinema-close',region:'alder',place:'CINEMA',status:'closed',description:'Fire inspection requires repairs; other gathering rooms remain.',reason:'The cinema is being made safe.',source:'story'};
 assert.equal(applySharedVenueChange(g,change),true);assert.equal(applySharedVenueChange(g,change),false);for(const p of [a,b]){assert.ok(!visiblePlaces(p,g).includes('CINEMA'));assert.equal(p.place,'APARTMENTS');assert.equal(sharedVenueReason(g,'alder','CINEMA'),change.reason);}
 assert.throws(()=>applySharedVenueChange(g,{...change,id:'bad',place:'WORK'}),/must remain/);
 applySharedVenueChange(g,{id:'cafe-change',region:'alder',place:'CORNER CAFÉ',status:'repurposed',name:'Ferry Day Café',description:'Daytime stays; no evening stage.',reason:'The late permit ended.',source:'story'});
 assert.equal(worldPlaceName(a,'CORNER CAFÉ',g),worldPlaceName(b,'CORNER CAFÉ',g));assert.equal(worldPlaceName(a,'CORNER CAFÉ',g),'Ferry Day Café');
 assert.equal(applySharedVenueChange(g,{id:'cannot-overwrite',region:'alder',place:'CORNER CAFÉ',status:'open',name:'Wrong',description:'Wrong',reason:'Wrong',source:'regional'}),false);
 choose(g,'local_help:alder_tess');assert.equal(a.world.story.localChoices.alder_tess,'help');assert.equal(b.world.localBonds.alder_tess,undefined);assert.equal(b.world.story.localChoices.alder_tess,undefined);
}
// Staying witnesses physical growth; commuting never manufactures it. Every return is acknowledged.
{
 const g=game(),p=g.players[0];advance(g,2);const before=JSON.stringify(g.sharedWorld);choose(g,'travel:saffron');choose(g,'travel:alder');assert.equal(JSON.stringify(g.sharedWorld),before);assert.match(worldView(p,g).returnNarrative,/only been away briefly/);assert.equal(worldView(p,g).localChanges.length,0);
 advance(g,3);assert.ok(worldView(p,g).localChanges.length>=1);assert.match(worldView(p,g).localChanges[0].narrative,/advance|ferry|lunch/i);assert.ok(p.world.journal.some(j=>j.title.includes('advance-order')));
 const stay=game();advance(stay,3);assert.equal(getSharedVenueState(stay,'alder','MARKET').name,getSharedVenueState(g,'alder','MARKET').name);
 const away=game(),q=away.players[0];advance(away,2);choose(away,'travel:saffron');for(let month=3;month<=7;month++)advance(away,month);choose(away,'travel:alder');assert.match(worldView(q,away).returnNarrative,/5 chapters/);assert.equal(worldView(q,away).localChanges.length,3);
 const serial=JSON.stringify(away);assert.equal(JSON.stringify(JSON.parse(serial)),serial);
}
// Contribution can bring a scheduled chapter forward; there is no instantaneous growth trigger.
{
 const g=game(),p=g.players[0];for(const key of ['first','second','third']){afterWorldAction(g,p,`garden_${key}`);}assert.equal(g.sharedWorld.regions.alder.development,0); // ordinary care deliberately contributes at most once per month
 choose(g,'local_help:alder_tess');p.world.discoveredPlacesByRegion.alder.push('LIBRARY');choose(g,'local_help:alder_rowan');assert.equal(g.sharedWorld.regions.alder.contribution,3);advance(g,2);assert.equal(g.sharedWorld.regions.alder.development,1);assert.equal(g.sharedWorld.regions.saffron.development,0);
}
// Neri-specific scenes require five distinct months, never generic resident farming.
{
 const g=game(),p=g.players[0];advance(g,2);choose(g,'neri_accept');assert.equal(p.world.companionBond,1);choose(g,'talk:alder_tess');p.world.discoveredPlacesByRegion.alder.push('LIBRARY');choose(g,'talk:alder_rowan');assert.equal(p.world.companionBond,1);assert.ok(!worldChoices(p,g).some(c=>c.key==='neri_partner'));assert.equal(pick(g,'neri_plan_home').available,false);
 advance(g,3);choose(g,'neri_plan_home');advance(g,4);choose(g,'neri_distance');assert.equal(p.world.story.neri.posting,'accepted');assert.equal(p.world.region,'alder');assert.equal(pick(g,'neri_partner').available,false);
 advance(g,5);choose(g,'neri_partner');assert.equal(p.world.companionStatus,'partner');assert.equal(p.world.story.neri.scenes.length,4);assert.equal(pick(g,'neri_payoff').available,false);
 advance(g,6);choose(g,'neri_payoff');assert.equal(p.world.story.neri.stage,'fulfilled');assert.equal(p.world.story.neri.scenes.length,5);assert.match(p.world.story.neri.scenes.at(-1).text,/ordinary promise holds/);assert.equal(p.world.story.homeRegion,'alder');
}
{
 const g=game(),p=g.players[0];advance(g,2);choose(g,'neri_decline');const bond=p.world.companionBond;advance(g,6);assert.equal(p.world.companionBond,bond);assert.equal(p.world.story.neri.posting,'accepted');assert.ok(p.world.discoveredRegions.includes('pelagia'));assert.ok(!worldChoices(p,g).some(c=>c.key==='neri_partner'));
}
// Venue enforcement, respectful local branches, independent goals, resident rewards and move tradeoff.
{
 const g=game(),p=g.players[0],blocked=pick(g,'talk:alder_tess'),before=JSON.stringify(g);assert.equal(blocked.available,false);assert.throws(()=>resolveWorldChoice(g,p,blocked.id),/Visit/);assert.equal(JSON.stringify(g),before);
 const other=structuredClone(g);choose(g,'local_help:alder_tess');choose(other,'talk:alder_tess');advance(g,2);advance(other,2);assert.notEqual(choose(g,'talk:alder_tess').text,choose(other,'talk:alder_tess').text);
 const bills=monthlyBills(p).total;choose(g,'travel:saffron');assert.equal(monthlyBills(p).total,bills);assert.equal(p.world.story.homeRegion,'alder');assert.equal(pick(g,'relocate:saffron').cost,600);choose(g,'relocate:saffron');assert.equal(p.world.story.homeRegion,'saffron');assert.equal(monthlyBills(p).total,1700);
}
// Paid regional shifts are exclusively accepted career contracts.
{
 const g=game(),p=g.players[0];assert.ok(!worldChoices(p,g).some(c=>['regional_work','region_shift'].includes(c.key)));const before=JSON.stringify(g);assert.throws(()=>resolveWorldChoice(g,p,'1:0:0:regional_work'),/stale or unknown/);assert.equal(JSON.stringify(g),before);
}
// All five regions retain safe essentials, distinct paid work, complete actor locations and pure views.
let previews=0;
for(const region of Object.keys(regionDefinitions))for(const energy of [0,70])for(const money of [0,6000]){
 const g=game(),p=g.players[0];advance(g,6);p.world.region=region;p.world.discoveredRegions=Object.keys(regionDefinitions);p.world.discoveredPlacesByRegion[region]=[...worldPlaceIds];p.energy=energy;p.cash=money;
 const snapshot=JSON.stringify(g);const view=worldView(p,g),choices=worldChoices(p,g);assert.equal(JSON.stringify(g),snapshot);assert.ok(view.regionalOpportunity.workTitle.length>5);for(const spot of ['WORK','APARTMENTS','THE PARK'])assert.ok(visiblePlaces(p,g).includes(spot));
 for(const c of choices.filter(c=>!c.key.startsWith('shared:'))){const h=structuredClone(g),q=h.players[0];if(c.actorId&&c.spot)q.place=c.spot;const current=pick(h,c.key,q),before=structuredClone(q),saved=JSON.stringify(h);if(!current.available){assert.throws(()=>resolveWorldChoice(h,q,current.id));assert.equal(JSON.stringify(h),saved);continue;}const entry=resolveWorldChoice(h,q,current.id);assert.deepEqual(entry.effects,current.preview);for(const key of ['cash','hours','energy','joy','social'])assert.equal(q[key]-before[key],current.preview[key],`${region}/${c.key}/${key}`);const done=JSON.stringify(h);resolveWorldChoice(h,q,current.id);assert.equal(JSON.stringify(h),done);previews++;}
}
console.log(`PASS: canonical shared geography, immediate/long returns, staying growth, contribution schedule, five-month Neri story, respectful decline, local choice causality, relocation bills, career-only shifts, ${previews} exact legal preview/idempotency checks.`);
