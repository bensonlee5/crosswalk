import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,memberView} from '../supabase/functions/crosswalk-game/game-service.ts';
import {move} from '../lib/game.ts';
import {beginLifeWeek} from '../lib/life-events.ts';
import {worldChoices} from '../lib/world-life.ts';
import {sharedChoices} from '../lib/shared-opportunities.ts';
import {actionFamiliarityKey,familiarityView,recordActionFamiliarity} from '../lib/action-familiarity.ts';
import {castPeople} from '../lib/character-cast.ts';
const owner='00000000-0000-4000-8000-000000000001';
const room=(n=1)=>createGame({ownerSession:owner,mode:'hotseat',names:Array.from({length:n},(_,i)=>'Person '+i),requestId:'new'},'FAMILI');
const json=JSON.stringify;

test('successful repetition evolves first/familiar/routine/custom across turns and JSON reloads',()=>{
 let g=room();const expected=['first','familiar','familiar','routine','routine','routine','custom','custom'];
 for(let i=0;i<8;i++){const p=g.players[0];p.hours=6;move(g,'home_reset');const f=familiarityView(p,{actionKey:'home_reset'});assert.equal(f.count,i+1);assert.equal(f.stage,expected[i]);assert.equal(f.lastVariant,i%12);if(i===3){move(g,'end');g=JSON.parse(json(g));}}
 assert.equal(g.players[0].familiarity.startedRound,1);
});

test('opening/reading/cancelling a preview, same-place visit and failed actions never create history',()=>{
 const g=room(),p=g.players[0],before=json(g);worldChoices(p,g);sharedChoices(g,p);familiarityView(p,{actorId:'alder_tess'});assert.equal(json(g),before);assert.deepEqual(p.familiarity.actions,{});move(g,'visit','APARTMENTS');assert.deepEqual(p.familiarity.actions,{});assert.throws(()=>move(g,'does-not-exist'));assert.deepEqual(p.familiarity.actions,{});p.hours=0;assert.throws(()=>move(g,'home_reset'));assert.deepEqual(p.familiarity.actions,{});move(g,'visit','CORNER CAFÉ');assert.equal(familiarityView(p,{actionKey:'visit:alder:CORNER CAFÉ'}).count,1);
});

test('new world and shared receipts count an NPC only after an actual response, never again on replay',()=>{
 const g=room(),p=g.players[0];move(g,'visit','CORNER CAFÉ');let c=worldChoices(p,g).find(c=>c.key==='talk:alder_tess');assert.ok(c.available);const key=actionFamiliarityKey('world:'+c.id,p,g);move(g,'world:'+c.id);assert.equal(familiarityView(p,{actionKey:key}).count,1);assert.equal(familiarityView(p,{actorId:'alder_tess'}).count,1);const old=json(p.familiarity);move(g,'world:'+c.id);assert.equal(json(p.familiarity),old);
 c=sharedChoices(g,p).find(c=>c.key==='order');move(g,c.actionId);assert.equal(familiarityView(p,{actorId:'alder_tess'}).count,2);const count=json(p.familiarity);move(g,c.actionId);assert.equal(json(p.familiarity),count);
});

test('cast, motives, story and event IDs normalize away month/revision without leaking private context',()=>{
 const g=room(),p=g.players[0];assert.equal(actionFamiliarityKey('cast:1:oren:help',p,g),actionFamiliarityKey('cast:8:oren:help',p,g));assert.equal(actionFamiliarityKey('motive:1:oren:11:ask',p,g),'motive:oren:ask');assert.equal(actionFamiliarityKey('motive:8:oren:22:ask',p,g),'motive:oren:ask');assert.equal(actionFamiliarityKey('story:quay-friction:protect_set~9',p,g),'story:quay-friction:protect_set');assert.equal(actionFamiliarityKey('event:7:repair_bill:take_stock',p,g),'event:repair_bill:take_stock');
 for(const key of ['food','learn','explore']){const id='world:1:2:3:'+key,alder=actionFamiliarityKey(id,p,g);p.world.region='pelagia';assert.notEqual(actionFamiliarityKey(id,p,g),alder);p.world.region='alder';}
 const npc=castPeople(g,p)[0];move(g,'visit',npc.spot);const c=castPeople(g,p).find(n=>n.id===npc.id).choices.find(c=>c.available);move(g,c.actionId);assert.equal(familiarityView(p,{actorId:npc.id}).count,1);const before=json(p.familiarity);move(g,c.actionId);assert.equal(json(p.familiarity),before);
});

test('shared semantic keys group different owned IDs while preserving purpose and region',()=>{
 const g=room(),p=g.players[0];assert.equal(actionFamiliarityKey('world:shared:2:3:alder:prepare:order:2:x',p,g),'shared:alder:prepare');assert.equal(actionFamiliarityKey('world:shared:5:12:alder:prepare:standing:5:alder',p,g),'shared:alder:prepare');assert.equal(actionFamiliarityKey('world:shared:2:3:alder:reserve:supper',p,g),'shared:alder:reserve:supper');assert.equal(actionFamiliarityKey('world:shared:2:3:pelagia:reserve:supper',p,g),'shared:pelagia:reserve:supper');
});

test('history is seat-private in every current room',()=>{
 const g=room(2);const a=g.players[0],b=g.players[1],other='00000000-0000-4000-8000-000000000002';move(g,'home_reset');g.members={[owner]:[a.id],[other]:[b.id]};const v=memberView({code:g.code,state:g,version:2,updated_at:0},other);assert.equal(v.players[0].familiarity,undefined);assert.equal(familiarityView(v.players[0],{actionKey:'home_reset'}).count,0);assert.equal(a.familiarity.actions.home_reset.count,1);
});

test('bounded counters and variants remain finite; different action families do not manufacture affection',()=>{
 const g=room(),p=g.players[0],old=json({cast:p.cast,motives:p.motives,life:p.life});const context={actionKey:'rest',actorIds:['alder_tess'],round:1,replay:false};recordActionFamiliarity(p,context);p.familiarity.actions.rest.count=Number.MAX_SAFE_INTEGER;recordActionFamiliarity(p,context);assert.equal(p.familiarity.actions.rest.count,Number.MAX_SAFE_INTEGER);assert.equal(p.familiarity.actions.rest.lastVariant,1);assert.equal(json({cast:p.cast,motives:p.motives,life:p.life}),old);const before=json(p.familiarity);recordActionFamiliarity(p,{...context,replay:true});assert.equal(json(p.familiarity),before);
});

test('chosen person-facing life events count the authored speaker; automatic deferrals do not',()=>{
 const g=room(),p=g.players[0];g.lifeSchedule=[{week:1,eventId:'unexpected_patron'}];beginLifeWeek(g);const receipt=p.life.receipts.find(r=>r.week===1);assert.ok(receipt);receipt.eventId='unexpected_patron';receipt.pending=true;delete receipt.resolved;move(g,'event:1:unexpected_patron:back_calling');assert.equal(familiarityView(p,{actorId:'jo'}).count,1);const before=json(p.familiarity);move(g,'event:1:unexpected_patron:back_calling');assert.equal(json(p.familiarity),before);
 const deferred=room(),q=deferred.players[0];move(deferred,'end');assert.equal(Object.keys(q.familiarity.people).length,0);
});
