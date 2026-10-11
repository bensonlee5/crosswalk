import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,memberView,parseMutation} from '../supabase/functions/crosswalk-game/game-service.ts';
import {actions,activityForPlayer,move} from '../lib/game.ts';
import {worldChoices,worldPlaceIds,regionDefinitions} from '../lib/world-life.ts';
import {familiarityView} from '../lib/action-familiarity.ts';

import {actionIncidentContext,commitActionIncident,initializeActionIncidents,acceptedActionIncident,actionIncidentPreview,actionIncidentRules} from '../lib/action-incidents.ts';
import {incidentDrafts,ordinaryIncidentFamilies} from '../lib/action-incident-content.ts';
import {canonicalCharacterById} from '../lib/character-canon.ts';
const owner='00000000-0000-4000-8000-000000000001',other='00000000-0000-4000-8000-000000000002';
const json=JSON.stringify;
function words(seed){let n=seed>>>0;return Array.from({length:4},()=>{n=(n+0x9e3779b9)>>>0;let t=n;t=Math.imul(t^(t>>>16),0x21f0aaad);t=Math.imul(t^(t>>>15),0x735a2d97);return(t^(t>>>15))>>>0;});}
function room(n=1,seed=19){const g=createGame({ownerSession:owner,mode:'hotseat',names:Array.from({length:n},(_,i)=>`Player ${i}`),requestId:'incidents'},'CHANCE');for(const [i,p]of g.players.entries()){g.actionIncidentRng[p.id]={words:words(seed+i)};p.cash=20000;p.joy=50;p.energy=70;for(const r of Object.keys(regionDefinitions))p.world.discoveredPlacesByRegion[r]=[...worldPlaceIds];}return g;}
const at=(g,id)=>{const p=g.players[g.turn],a=activityForPlayer(p,actions.find(a=>a.id===id),g);p.place=a.place;return actionIncidentContext(g,p,a);};
function select(g,id,incidentId,{cash}={}){const base=structuredClone(g);for(let seed=1;seed<4000;seed++){const candidate=structuredClone(base),p=candidate.players[candidate.turn];candidate.actionIncidentRng[p.id]={words:words(seed)};const context=at(candidate,id);if(cash!==undefined)p.cash=cash;const r=commitActionIncident(candidate,p,context,1);if(r.incidentId===incidentId)return{g:candidate,p,r,context,seed};}throw Error('No fixture for '+incidentId);}

test('new rooms initialize incidents once, independent seeds stay hidden from every member snapshot',()=>{
 const g=room(4);assert.equal(g.schemaVersion,1);const before=json(g);initializeActionIncidents(g,()=>{throw Error('must not reseed');});assert.equal(json(g),before);
 g.members={[owner]:[g.players[0].id,g.players[1].id],[other]:[g.players[2].id]};
 for(const actor of [owner,other]){const v=memberView({state:g,code:g.code,version:1,updated_at:0},actor);assert.equal(v.actionIncidentRng,undefined);assert.equal(json(v).includes('"words"'),false);for(const p of v.players)assert.equal(!!p.actionIncidents,g.members[actor].includes(p.id));}
 assert.equal(new Set(Object.values(g.actionIncidentRng).map(json)).size,4);
});

test('no-event successes persist distinct ordinals; reads, failed actions and navigation draw nothing',()=>{
 const g=room(),p=g.players[0];g.actionIncidentRng[p.id]={words:[0x80000000,0,0,0]};const before=structuredClone(p),rng=json(g.actionIncidentRng);actionIncidentPreview(g,p,'home_reset');worldChoices(p,g);assert.equal(json(g.actionIncidentRng),rng);
 move(g,'home_reset');assert.equal(p.actionIncidents.ordinal,1);assert.equal(p.actionIncidents.receipts[0].incidentId,null);assert.equal(acceptedActionIncident(before,p,'home_reset'),null);assert.notEqual(json(g.actionIncidentRng),rng);
 const snapshot=json(p.actionIncidents),draws=json(g.actionIncidentRng);assert.throws(()=>move(g,'unknown'));p.hours=0;assert.throws(()=>move(g,'home_reset'));move(g,'visit','APARTMENTS');move(g,'visit','CORNER CAFÉ');assert.equal(json(p.actionIncidents),snapshot);assert.equal(json(g.actionIncidentRng),draws);
});

test('every ordinary bounded family is explicit; direct people/shared/life/story actions consume no draw',()=>{
 assert.equal(Object.keys(ordinaryIncidentFamilies).length,35);for(const a of actions){if(!a.story&&!a.special&&!a.promote&&a.housing===undefined)assert.ok(ordinaryIncidentFamilies[a.id],a.id);}
 const g=room(),p=g.players[0];p.place='CORNER CAFÉ';const before=json(g.actionIncidentRng),state=json(p.actionIncidents);const c=worldChoices(p,g).find(c=>c.key==='talk:alder_tess');move(g,'world:'+c.id);move(g,'world:'+c.id);assert.equal(json(g.actionIncidentRng),before);assert.equal(json(p.actionIncidents),state);assert.equal(actionIncidentPreview(g,p,'world:'+c.id),null);
});

test('each authored incident can settle with exact bounded deltas and confirmed receipt context',()=>{
 const examples={coffee_spill:'cafe_break',price_corrected:'cafe_break',loose_change:'cafe_break',meal_surprise:'home_meal',lost_thread:'library_read',small_discovery:'library_read',quiet_delight:'home_reset',little_irritation:'home_reset',passing_exchange:'cafe_break'};
 for(const d of incidentDrafts){const {p,r,context}=select(room(),examples[d.id],d.id);assert.equal(r.source,'ordinary-action');assert.equal(r.place,context.place);assert.equal(r.weather,context.weather);assert.equal(r.region,'alder');assert.ok(Math.abs(r.effects.cash)<=25);assert.ok(Math.abs(r.effects.joy)<=4);assert.ok(Math.abs(r.effects.energy)<=2);assert.equal(p.actionIncidents.ordinal,1);assert.equal(p.actionIncidents.receipts.length,1);}
});

test('small cash losses cannot create debt; refunds never exceed actual action cost',()=>{
 let f=select(room(),'cafe_break','loose_change',{cash:2});assert.equal(f.r.effects.cash,-2);assert.equal(f.p.cash,0);
 f=select(room(),'cafe_break','loose_change',{cash:0});assert.equal(f.r.effects.cash,0);assert.match(f.r.body,/before anything valuable is lost/);
 const g=room(),p=g.players[0],ctx=at(g,'cafe_break');ctx.cost=2;for(let seed=1;seed<100;seed++){const copy=structuredClone(g);copy.actionIncidentRng[p.id]={words:words(seed)};const r=commitActionIncident(copy,copy.players[0],ctx,1);if(r.incidentId==='price_corrected'){assert.equal(r.effects.cash,2);return;}}assert.fail('refund fixture');
});

test('monthly incident/cash ceilings and rare cooldown survive reloads and repeated actions',()=>{
 const f=select(room(),'cafe_break','price_corrected');let g=f.g,p=g.players[0];for(let i=0;i<12;i++)commitActionIncident(g,p,at(g,'cafe_break'),1);assert.equal(p.actionIncidents.month.incidents,2);assert.equal(p.actionIncidents.month.cashIncidents,1);assert.equal(p.actionIncidents.month.cashGained,5);
 g=JSON.parse(json(g));p=g.players[0];g.round=2;for(let i=0;i<5;i++)assert.notEqual(commitActionIncident(g,p,at(g,'cafe_break'),1).incidentId,'price_corrected');assert.ok(p.actionIncidents.month.incidents<=2);
 g.round=3;const eligible=select(g,'cafe_break','price_corrected');assert.equal(eligible.r.effects.cash,5);
});

test('seeded committed actions replay exactly after JSON reload; no receipt replays on poll',()=>{
 let a=room(),b=JSON.parse(json(a));for(let i=0;i<8;i++){for(const g of [a,b]){g.round=i+1;const p=g.players[0];p.hours=6;p.energy=50;p.joy=40;move(g,'home_reset');}assert.deepEqual(a,b);b=JSON.parse(json(b));}
 const p=a.players[0];assert.equal(acceptedActionIncident(p,p,'home_reset'),null);assert.equal(p.actionIncidents.ordinal,8);assert.equal(new Set(p.actionIncidents.receipts.map(r=>r.id)).size,8);
});

test('chance speech requires an available local adult in that exact venue and respects strained boundaries',()=>{
 const g=room(),p=g.players[0];let context=at(g,'cafe_break');assert.ok(context.speakers.some(s=>s.actorId==='alder_tess'));for(const s of context.speakers){assert.equal(s.spot,p.place);assert.ok(canonicalCharacterById[s.actorId].age>=18);assert.equal(canonicalCharacterById[s.actorId].region,p.world.region);}
 p.motives.bonds.alder_tess={trust:0,earnedWeeks:[],contributions:0,strained:true};assert.equal(at(g,'cafe_break').speakers.some(s=>s.actorId==='alder_tess'),false);delete p.motives.bonds.alder_tess;p.world.localTalkWeeks={alder_tess:g.round};assert.equal(at(g,'cafe_break').speakers.some(s=>s.actorId==='alder_tess'),false);
 p.world.region='pelagia';context=at(g,'cafe_break');assert.equal(context.speakers.some(s=>s.actorId==='alder_tess'),false);assert.ok(context.speakers.every(s=>canonicalCharacterById[s.actorId].region==='pelagia'));
});

test('a real ordinary action can trigger a person once without affection, plot or commitment',()=>{
 const base=room(),p=base.players[0];at(base,'cafe_break');const f=select(base,'cafe_break','passing_exchange');base.actionIncidentRng[p.id]={words:words(f.seed)};
 // Find an actual <20% trigger rather than force the engine probability.
 let candidate;for(let seed=1;seed<1000;seed++){const g=structuredClone(base),q=g.players[0];g.actionIncidentRng[q.id]={words:words(seed)};move(g,'cafe_break');if(q.actionIncidents.receipts.at(-1).person){candidate={g,q};break;}}
 assert.ok(candidate);const {g,q}=candidate,r=q.actionIncidents.receipts.at(-1);assert.equal(familiarityView(q,{actionKey:'cafe_break'}).count,1);assert.equal(familiarityView(q,{actorId:r.person.actorId}).count,1);assert.deepEqual(q.world.localBonds,p.world.localBonds);assert.deepEqual(q.story,p.story);assert.deepEqual(g.sharedOpportunities,base.sharedOpportunities);
 const view=acceptedActionIncident(p,q,'cafe_break');assert.equal(view.id,r.id);assert.equal(acceptedActionIncident(p,q,'home_reset'),null);assert.equal(acceptedActionIncident(q,q,'cafe_break'),null);
});

test('private receipt helpers preserve original context and reject another seat or stale acknowledgments',()=>{
 const before=room(2),f=select(before,'cafe_break','coffee_spill'),old=before.players[0],after=f.p;const r=acceptedActionIncident(old,after,'cafe_break');assert.ok(r);after.place='THE PARK';after.world.region='pelagia';assert.equal(r.place,'CORNER CAFÉ');assert.equal(r.region,'alder');assert.equal(r.weather,f.context.weather);assert.equal(acceptedActionIncident(before.players[1],after,'cafe_break'),null);after.actionIncidents.ordinal++;assert.equal(acceptedActionIncident(old,after,'cafe_break'),null);
});

test('previews give practical cash bounds without rolling; caller cannot supply seed or odds in commands',()=>{
 const g=room(),p=g.players[0],before=json(g);assert.equal(actionIncidentPreview(g,p,'cafe_break').cashLossMax,6);assert.equal(actionIncidentPreview(g,p,'cafe_break').cashGainMax,5);assert.equal(actionIncidentPreview(g,p,'home_reset').cashLossMax,0);assert.equal(json(g),before);
 const command=parseMutation({protocolVersion:1,op:'move',ownerSession:owner,code:'CHANCE',version:1,action:'cafe_break',requestId:'spoof',actionIncidentRng:{words:[0,0,0,0]},probability:1,actionIncidentsVersion:999},owner);assert.equal(command.actionIncidentRng,undefined);assert.equal(command.probability,undefined);
 assert.equal(actionIncidentRules.maxPerMonth,2);
});

test('twelve real solo-to-four-player campaigns retain private independent state across saves and end turns',()=>{
 for(const seed of [71,193,811])for(let count=1;count<=4;count++){
  let g=room(count,seed);g.lifeSchedule=[];
  while(g.status==='playing'){
   const p=g.players[g.turn];for(const id of ['home_reset','cafe_break','library_read']){
    const otherStates=g.players.filter(q=>q.id!==p.id).map(q=>({id:q.id,incidents:structuredClone(q.actionIncidents),rng:structuredClone(g.actionIncidentRng[q.id])}));
    move(g,'visit',actions.find(a=>a.id===id).place);move(g,id);
    for(const previous of otherStates){assert.deepEqual(g.players.find(q=>q.id===previous.id).actionIncidents,previous.incidents);assert.deepEqual(g.actionIncidentRng[previous.id],previous.rng);}
    assert.ok(p.actionIncidents.month.incidents<=2);assert.ok(p.actionIncidents.month.cashIncidents<=1);assert.ok(p.actionIncidents.month.cashGained<=25&&p.actionIncidents.month.cashLost<=25);
   }
   const rng=json(g.actionIncidentRng);move(g,'end');assert.equal(json(g.actionIncidentRng),rng);g=JSON.parse(json(g));
  }
  for(const p of g.players){assert.equal(p.actionIncidents.ordinal,24);assert.equal(p.actionIncidents.receipts.length,24);assert.ok(p.actionIncidents.receipts.filter(r=>r.incidentId).length<=16);}
 }
});

test('history and resource extremes remain bounded without reused receipt IDs or implied extra time',()=>{
 const g=room(),p=g.players[0];p.actionIncidents.ordinal=Number.MAX_SAFE_INTEGER;const rng=json(g.actionIncidentRng);move(g,'home_reset');assert.equal(p.actionIncidents.ordinal,Number.MAX_SAFE_INTEGER);assert.equal(json(g.actionIncidentRng),rng);
 const f=select(room(),'home_reset','quiet_delight');for(let round=2;round<=35;round++){f.g.round=round;for(let i=0;i<3;i++)commitActionIncident(f.g,f.p,at(f.g,'home_reset'),1);}assert.equal(f.p.actionIncidents.receipts.length,64);assert.equal(new Set(f.p.actionIncidents.receipts.map(r=>r.id)).size,64);assert.equal(f.p.hours,6);assert.ok(f.p.joy>=0&&f.p.joy<=100);
});

test('all current room modes initialize incidents without a feature option',()=>{for(const mode of ['online','hotseat']){const command=parseMutation({protocolVersion:1,op:'create',ownerSession:owner,requestId:'current',mode,...(mode==='online'?{name:'One'}:{names:['One']})},owner),g=createGame(command,'ALWAYS');assert.ok(g.players[0].actionIncidents);assert.ok(g.actionIncidentRng[g.players[0].id]);assert.ok(g.players[0].career);assert.ok(g.players[0].finance);}});
