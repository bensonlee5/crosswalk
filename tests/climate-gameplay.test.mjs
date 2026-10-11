import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,memberView} from '../supabase/functions/crosswalk-game/game-service.ts';
import {campaignWeather,getWeather,weatherEffect,consumeWeather,climateTravelEffect,climateExposureRemaining} from '../lib/weather.ts';
import {actions,activityForPlayer,move,reason,opportunity} from '../lib/game.ts';
import {actionPreview} from '../lib/game-view.ts';
import {worldChoices,resolveWorldChoice,worldPlaceIds} from '../lib/world-life.ts';
import * as serverWeather from '../supabase/functions/_shared/engine/weather.ts';
import {move as serverMove} from '../supabase/functions/_shared/engine/game.ts';
import {worldChoices as serverWorldChoices,resolveWorldChoice as serverResolve} from '../supabase/functions/_shared/engine/world-life.ts';
const regions=['alder','saffron','glasssteppe','pelagia','embermesa'];
const owner='00000000-0000-4000-8000-000000000001';
function game(region='alder',round=1,code='CLIMAT'){
 const g=createGame({op:'create',mode:'hotseat',names:['One','Two'],ownerSession:owner,requestId:crypto.randomUUID()},code);g.round=round;
 for(const p of g.players){p.world.region=region;p.world.discoveredRegions=[...regions];p.cash=20000;p.energy=70;p.joy=40;p.hours=6;
 for(const r of regions)p.world.discoveredPlacesByRegion[r]=[...worldPlaceIds];}
 return g;
}
function rawView(g){const c=structuredClone(g);delete c.lifeSeed;delete c.lifeSchedule;return c;}

test('sanitized member snapshots and all multiplayer seats share the authoritative forecast',()=>{
 for(let count=1;count<=4;count++){
 const g=createGame({op:'create',mode:'hotseat',names:Array.from({length:count},(_,i)=>`Seat ${i}`),ownerSession:owner,requestId:crypto.randomUUID()},'SEAT42');
 g.players.forEach((p,i)=>{p.world.region=regions[i+1];});
 for(let turn=0;turn<count;turn++)for(let round=1;round<=8;round++){
 g.turn=turn;g.round=round;const client=memberView({state:g,code:g.code,version:1,updated_at:0},owner);
 assert.equal(client.lifeSeed,undefined);assert.equal(client.schemaVersion,1);assert.deepEqual(getWeather(client),getWeather(g));
 for(let seat=0;seat<count;seat++)assert.deepEqual(weatherEffect(client.players[seat],{id:'park_run',energy:-8},client),weatherEffect(g.players[seat],{id:'park_run',energy:-8},g));
 }
 }
});

test('all five climates remain geographic and seasonal across room codes and reloads',()=>{
 for(const code of ['CLIMAT','OTHER1','ROOM42','123456'])for(const region of regions){const g=game(region,1,code),before=JSON.stringify(g),f=campaignWeather(g);
 assert.equal(f.length,8);assert.deepEqual(f.map(w=>w.season),['spring','spring','summer','summer','autumn','autumn','winter','winter']);
 assert.deepEqual(f,campaignWeather(rawView(g)));assert.deepEqual(f,serverWeather.campaignWeather(g));assert.equal(JSON.stringify(g),before);
 assert.ok(f.every(w=>w.region===region&&w.climate&&w.temperature&&w.moisture&&w.exposure));
 if(region==='saffron'){assert.ok(f.slice(2,4).every(w=>w.moisture==='dry'));assert.ok(f.slice(6).every(w=>w.temperature==='mild'));assert.ok(f.slice(6).some(w=>w.moisture==='wet'));}
 if(region==='pelagia'){assert.ok(f.every(w=>['warm','hot'].includes(w.temperature)));assert.ok(f.slice(2,4).every(w=>w.exposure.travel===3));}
 if(region==='glasssteppe'){assert.ok(f.slice(6).every(w=>w.temperature==='cold'&&w.moisture==='dry'));assert.ok(f.slice(2,4).every(w=>w.temperature==='mild'));assert.ok(f.some(w=>w.type==='snow'));}
 if(region==='embermesa'){assert.ok(f.every(w=>w.moisture==='dry'));assert.ok(f.slice(2,4).every(w=>w.temperature==='hot'));assert.ok(f.some(w=>w.temperature==='cold'));}
 if(region==='alder'){assert.ok(f.some(w=>w.moisture==='wet'));assert.ok(f.slice(6).every(w=>w.temperature==='cool'));}
 }
});

test('every activity preview equals authoritative outcome and client/server costs in every region and season',()=>{
 let checked=0;
 for(const region of regions)for(let round=1;round<=8;round++)for(const id of ['rest','park_run','garden_tend','garden_workshop','cafe_break','library_read','home_reset','weekly_opportunity']){
 const g=game(region,round),p=g.players[0];p.place=actions.find(a=>a.id===id).place;
 if(reason(p,id,g))continue;
 const server=structuredClone(g),client=rawView(g),preview=actionPreview(p,id,g);assert.deepEqual(preview,actionPreview(client.players[0],id,client));
 const a=activityForPlayer(p,actions.find(a=>a.id===id),g);assert.deepEqual(preview.weather,serverWeather.weatherEffect(server.players[0],a,server,{joy: id==='weekly_opportunity'?opportunity(g).joy:a.joy||0,energy:a.energy||0}));
 const before=structuredClone(p);move(g,id);serverMove(server,id);
 for(const key of ['cash','energy','joy','hours'])assert.equal(p[key]-before[key],preview[key]+(p.actionIncidents?.receipts.at(-1)?.effects[key]??0),`${region}/${round}/${id}/${key}`);
 assert.deepEqual(p.weatherUsage,server.players[0].weatherUsage);assert.deepEqual(p,server.players[0]);checked++;
 }
 assert.ok(checked>250,`${checked} action outcomes`);
});

test('regional travel quotes use both endpoints, explicit affected player, and authoritative energy gates',()=>{
 for(const origin of regions)for(const destination of regions.filter(r=>r!==origin))for(let round=1;round<=8;round++){
 const g=game(origin,round),p=g.players[0],q=g.players[1];q.world.region='pelagia';
 const before=JSON.stringify(g),choice=worldChoices(p,g).find(c=>c.key===`travel:${destination}`),expected=climateTravelEffect(p,g,destination);
 assert.equal(JSON.stringify(g),before,'preview does not mutate');assert.equal(choice.preview.energy,expected.energy);assert.match(choice.body,/Departure:.*Arrival:/);assert.doesNotMatch(choice.body+' '+choice.outcome,/(?:of [48]|monthly (?:exposure|weather)|limit reached|[+]\d)/);
 const dest=getWeather(g,{world:{version:1,region:destination}});assert.equal(Math.abs(choice.preview.energy),Math.max(getWeather(g,p).exposure.travel,dest.exposure.travel));
 const server=structuredClone(g);assert.deepEqual(worldChoices(p,g),serverWorldChoices(server.players[0],server));
 const energy=p.energy,cash=p.cash,hours=p.hours;resolveWorldChoice(g,p,choice.id);serverResolve(server,server.players[0],choice.id);
 assert.equal(p.energy-energy,choice.preview.energy);assert.equal(p.cash-cash,choice.preview.cash);assert.equal(p.hours-hours,choice.preview.hours);assert.equal(p.world.region,destination);assert.equal(q.weatherUsage,undefined);
 assert.deepEqual(p,server.players[0]);const after=JSON.stringify(g);resolveWorldChoice(g,p,choice.id);assert.equal(JSON.stringify(g),after,'duplicate receipt cannot charge again');
 }
 const g=game('alder',3),p=g.players[0];p.energy=0;const choice=worldChoices(p,g).find(c=>c.key==='travel:pelagia');assert.equal(choice.available,false);assert.match(choice.reason,/3 energy/);assert.throws(()=>resolveWorldChoice(g,p,choice.id),/rest at home/);
 p.place='APARTMENTS';assert.equal(reason(p,'home_reset',g),'');const preview=actionPreview(p,'home_reset',g);assert.ok(preview.energy>0);assert.equal(preview.weather.energy,0);move(g,'home_reset');assert.equal(worldChoices(p,g).find(c=>c.key==='travel:pelagia').available,true);
});

test('shared exposure and benefit caps survive travel, reload, high resources and monthly reset',()=>{
 const g=game('embermesa',3),p=g.players[0],run={id:'park_run',energy:-8,joy:12};
 assert.equal(weatherEffect(p,run,g).exposureUsed,4);consumeWeather(p,run,g);assert.equal(climateExposureRemaining(p,g),4);
 const to=worldChoices(p,g).find(c=>c.key==='travel:pelagia');resolveWorldChoice(g,p,to.id);assert.equal(climateExposureRemaining(p,g),1);
 const back=worldChoices(p,g).find(c=>c.key==='travel:embermesa');assert.equal(back.preview.energy,-1);resolveWorldChoice(g,p,back.id);assert.equal(climateExposureRemaining(p,g),0);assert.equal(weatherEffect(p,run,g).exposureUsed,0);
 assert.deepEqual(getWeather(g,p),getWeather(rawView(g),rawView(g).players[0]));g.round++;assert.equal(climateExposureRemaining(p,g),8);
 const rainy=game('pelagia',3),r=rainy.players[0];r.joy=99;r.place='COMMUNITY';const v=actionPreview(r,'weekly_opportunity',rainy);assert.equal(v.weather.joy,0);move(rainy,'weekly_opportunity');assert.equal(r.weatherUsage.joy,0,'unreceived opportunity bonus is not consumed');
 const cold=game('glasssteppe',7),c=cold.players[0];c.energy=99;assert.equal(weatherEffect(c,{id:'home_reset',energy:0},cold).recoveryUsed,1);
});

test('current outdoor world choices match their exact previews',()=>{
 for(const region of regions)for(const round of [3,7]){
 const g=game(region,round),p=g.players[0];p.world.discoveredPlacesByRegion[region]=['APARTMENTS','WORK','THE PARK','CORNER CAFÉ','COMMUNITY'];
 for(const key of ['explore','region_rest']){const v=worldChoices(p,g).find(c=>c.key===key);const before=structuredClone(p);resolveWorldChoice(g,p,v.id);for(const resource of ['energy','joy','cash','hours'])assert.equal(p[resource]-before[resource],v.preview[resource]);}
 assert.ok(!worldChoices(p,g).some(c=>['regional_work','region_shift'].includes(c.key)));
 }
});
