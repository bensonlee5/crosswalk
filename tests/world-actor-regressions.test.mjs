import assert from 'node:assert/strict';
import {worldChoices,worldView,resolveWorldChoice,beginWorldWeek,regionDefinitions,worldPlaceIds} from '../lib/world-life.ts';
import {currentGame} from './current-fixture.mjs';
const make=()=>{const g=currentGame({names:['Pat']});g.players[0].energy=85;return g;};
const pick=(g,key)=>worldChoices(g.players[0],g).find(c=>c.key===key);
const choose=(g,key)=>{const p=g.players[0];let c=pick(g,key);assert.ok(c,key);if(c.actorId)p.place=c.spot;c=pick(g,key);assert.ok(c.available,`${key}: ${c.reason}`);return resolveWorldChoice(g,p,c.id);};
const next=(g,m)=>{g.round=m;g.players[0].hours=6;beginWorldWeek(g);};
let checked=0;
for(const region of Object.keys(regionDefinitions)){
 const g=make(),p=g.players[0];p.world.region=region;p.world.discoveredPlacesByRegion[region]=['APARTMENTS','WORK','THE PARK','CORNER CAFÉ','COMMUNITY'];
 for(const resident of worldView(p,g).residents){
  p.place='APARTMENTS';const view=worldView(p,g),r=view.residents.find(r=>r.id===resident.id),c=pick(g,`talk:${r.id}`),buttonTarget=r.places.find(spot=>view.visiblePlaces.includes(spot));assert.ok(buttonTarget);assert.equal(c.spot,buttonTarget,`Meet ${r.name} target matches current choice`);
  p.place=buttonTarget;assert.equal(pick(g,`talk:${r.id}`).spot,buttonTarget);assert.equal(pick(g,`talk:${r.id}`).available,true);checked++;
 }
 p.world.discoveredPlacesByRegion[region]=[...worldPlaceIds];
 for(const resident of worldView(p,g).residents)for(const spot of resident.places){p.place=spot;assert.equal(pick(g,`talk:${resident.id}`).spot,spot,`${resident.name} at ${spot}`);assert.equal(pick(g,`talk:${resident.id}`).available,true);checked++;}
}
{
 const g=make(),p=g.players[0];p.world.region='saffron';p.world.discoveredPlacesByRegion.saffron=['APARTMENTS','WORK','THE PARK','CORNER CAFÉ','COMMUNITY'];const first=pick(g,'talk:saffron_tomas');assert.equal(first.spot,'WORK');assert.ok(first.preview.revealPlaces.includes('MAKERSPACE'));choose(g,'talk:saffron_tomas');assert.equal(p.place,'WORK');assert.equal(pick(g,'talk:saffron_tomas').spot,'WORK');assert.ok(worldView(p,g).residents.find(r=>r.id==='saffron_tomas').places.includes('WORK'));
}
{
 const g=make(),p=g.players[0];next(g,2);choose(g,'neri_accept');next(g,3);choose(g,'neri_plan_coast');next(g,4);choose(g,'neri_visit');choose(g,'travel:pelagia');next(g,5);const promise=choose(g,'neri_partner');assert.match(promise.text,/made the visit to Pelagia/);assert.doesNotMatch(promise.text,/first visit is still/);choose(g,'travel:alder');next(g,6);const payoff=choose(g,'neri_payoff');assert.match(payoff.text,/returning from Pelagia/);assert.doesNotMatch(payoff.text,/visit has to wait|not made the visit/);
}
{
 const g=make(),p=g.players[0];next(g,2);choose(g,'neri_accept');next(g,3);choose(g,'neri_plan_coast');next(g,4);p.world.discoveredRegions.push('pelagia');choose(g,'travel:pelagia');const agreed=choose(g,'neri_visit');assert.match(agreed.text,/visit you have actually made/);
}
{
 const g=make(),p=g.players[0];next(g,2);choose(g,'neri_accept');next(g,3);choose(g,'neri_plan_home');next(g,4);choose(g,'neri_visit');next(g,5);p.world.discoveredPlacesByRegion.alder=p.world.discoveredPlacesByRegion.alder.filter(x=>x!=='TRANSIT');p.place='APARTMENTS';const c=pick(g,'neri_partner');assert.equal(c.available,false);assert.match(c.reason,/not on your map yet/);const snapshot=JSON.stringify(g);assert.throws(()=>resolveWorldChoice(g,p,c.id),/not on your map yet/);assert.equal(JSON.stringify(g),snapshot);
}
console.log(`PASS: ${checked} cross-region actor/venue cases, Tomas public introduction and specialist reveal, truthful undiscovered-venue blockers, Neri remembers actual visits before partnership and after returning.`);
