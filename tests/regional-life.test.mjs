import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,memberView} from '../supabase/functions/crosswalk-game/game-service.ts';
import {regionalLifeProfiles,regionalParticipation} from '../lib/regional-life.ts';
import {getWeather} from '../lib/weather.ts';
import {actions,move,reason} from '../lib/game.ts';
import {actionPreview} from '../lib/game-view.ts';
import {worldChoices,resolveWorldChoice,worldPlaceIds,visiblePlaces,applySharedVenueChange} from '../lib/world-life.ts';
import {monthlyBills} from '../lib/economy.ts';
import {move as serverMove} from '../supabase/functions/_shared/engine/game.ts';
import {worldChoices as serverChoices,resolveWorldChoice as serverResolve} from '../supabase/functions/_shared/engine/world-life.ts';
const regions=Object.keys(regionalLifeProfiles),owner='00000000-0000-4000-8000-000000000001';
const essentials=['APARTMENTS','WORK','THE PARK','CORNER CAFÉ','COMMUNITY'];
function game(region='alder',round=1){const g=createGame({op:'create',mode:'hotseat',names:['One','Two'],ownerSession:owner,requestId:crypto.randomUUID()},'REGION');g.round=round;for(const p of g.players){p.world.region=region;p.world.discoveredRegions=[...regions];p.world.discoveredPlacesByRegion[region]=[...essentials];p.cash=20000;p.energy=60;p.joy=30;}return g;}
const explore=(g)=>worldChoices(g.players[g.turn],g).find(c=>c.key==='explore');
function reveal(g){for(const p of g.players)for(const r of regions)p.world.discoveredPlacesByRegion[r]=[...worldPlaceIds];}

test('urban exploration is sheltered and efficient; open suburban, harbor and rural routes restore energy',()=>{
 for(const region of regions)for(const round of [1,3,7])for(const energy of [0,1,50,99,100]){
 const g=game(region,round),p=g.players[0],profile=regionalLifeProfiles[region];p.energy=energy;
 const before=JSON.stringify(g),v=explore(g);assert.equal(JSON.stringify(g),before);assert.equal(v.available,true);assert.equal(v.time,1);assert.equal(v.cost,0);assert.equal(v.preview.revealPlaces.length,profile.discoveries);
 const weather=getWeather(g,p),exposure=profile.sheltered?0:weather.exposure.outdoor;
 assert.equal(v.preview.energy,Math.min(100,energy+profile.recovery-exposure)-energy);
 assert.equal(v.preview.cash,0);assert.doesNotMatch(v.body+' '+v.outcome,/of [48]|monthly (?:weather|exposure)|[+]\d|affinity|meter/i);
 const server=structuredClone(g);assert.deepEqual(worldChoices(p,g),serverChoices(server.players[0],server));
 const old=structuredClone(p);resolveWorldChoice(g,p,v.id);serverResolve(server,server.players[0],v.id);
 for(const key of ['energy','joy','cash','hours'])assert.equal(p[key]-old[key],v.preview[key]);assert.deepEqual(p,server.players[0]);
 assert.equal(p.weatherUsage?.exposure||0,exposure);assert.equal(p.world.discoveredPlacesByRegion[region].length,essentials.length+profile.discoveries);
 const after=JSON.stringify(g);resolveWorldChoice(g,p,v.id);assert.equal(JSON.stringify(g),after);
 }
});

test('two-stop routes do not reveal closed/unknown services, handle a single remaining place and then stop',()=>{
 for(const region of ['alder','glasssteppe']){
 const g=game(region),p=g.players[0];p.world.discoveredPlacesByRegion[region]=worldPlaceIds.filter(x=>!['MARKET','LIBRARY'].includes(x));
 applySharedVenueChange(g,{id:'fixture-close',region,place:'MARKET',status:'closed',name:'Closed market',description:'A closed optional fixture',reason:'Fixture',source:'regional'});
 const v=explore(g);assert.deepEqual(v.preview.revealPlaces,['LIBRARY']);assert.doesNotMatch(v.body,/Closed market|Ferry Market|Station Market/);resolveWorldChoice(g,p,v.id);assert.equal(explore(g).available,false);assert.equal(explore(g).preview.revealPlaces.length,0);
 assert.throws(()=>resolveWorldChoice(g,p,explore(g).id),/Every open venue/);
 }
});

test('local map navigation, essential recovery, existing bills and wages remain unchanged',()=>{
 for(const region of regions){const g=game(region,3),p=g.players[0];p.energy=0;p.cash=0;
 const bills=monthlyBills(p),before={cash:p.cash,energy:p.energy,hours:p.hours};
 for(const place of essentials){move(g,'visit',place);assert.deepEqual({cash:p.cash,energy:p.energy,hours:p.hours},before);}
 move(g,'visit','APARTMENTS');assert.equal(reason(p,'home_reset',g),'');assert.ok(actionPreview(p,'home_reset',g).energy>0);
 assert.deepEqual(monthlyBills(p),bills);assert.ok(essentials.every(x=>visiblePlaces(p,g).includes(x)));
 }
});

test('five local activity groups have real preview/server outcomes without changing money or NPC personality',()=>{
 for(const region of regions)for(const id of regionalLifeProfiles[region].activities){
 const g=game(region,3);reveal(g);const p=g.players[0];const action=actions.find(a=>a.id===id);if(!action)continue;p.place=action.place;if(reason(p,id,g))continue;
 const v=actionPreview(p,id,g);assert.equal(v.participation.joy,2);
 const server=structuredClone(g),before=structuredClone(p);move(g,id);serverMove(server,id);assert.equal(p.joy-before.joy,v.joy+(p.actionIncidents?.receipts.at(-1)?.effects.joy??0));assert.deepEqual(p,server.players[0]);assert.deepEqual(p.regionalLifeUsage,{round:3,participated:true});
 assert.equal(g.players[1].regionalLifeUsage,undefined);
 }
});

test('participation is once per player/month across travel and reload; preview-only and capped rewards do not spend it',()=>{
 const g=game('alder',3);reveal(g);const p=g.players[0];p.place='COMMUNITY';const before=JSON.stringify(g);actionPreview(p,'volunteer',g);assert.equal(JSON.stringify(g),before);
 move(g,'volunteer');assert.equal(actionPreview(p,'community_setup',g).participation.joy,0);
 const travel=worldChoices(p,g).find(c=>c.key==='travel:saffron');resolveWorldChoice(g,p,travel.id);assert.equal(actionPreview(p,'friends',g).participation.joy,0);
 const restored=JSON.parse(JSON.stringify(g));assert.equal(actionPreview(restored.players[0],'friends',restored).participation.joy,0);
 const client=memberView({state:g,code:g.code,version:2,updated_at:0},owner);assert.deepEqual(client.players[0].regionalLifeUsage,p.regionalLifeUsage);assert.deepEqual(actionPreview(client.players[0],'friends',client),actionPreview(p,'friends',g));
 g.round++;assert.equal(actionPreview(p,'friends',g).participation.joy,2);assert.equal(g.players[1].regionalLifeUsage,undefined);
 const full=game();reveal(full);full.players[0].joy=100;full.players[0].place='COMMUNITY';move(full,'volunteer');assert.equal(full.players[0].regionalLifeUsage,undefined);
 assert.equal(regionalParticipation({...p,joy:98,regionalLifeUsage:undefined},'friends',g,1).joy,1);
 const hidden=game('glasssteppe');assert.equal(actionPreview(hidden.players[0],'maker_repair',hidden).participation.applies,false);
});
