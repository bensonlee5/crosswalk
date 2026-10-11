import test from 'node:test';
import assert from 'node:assert/strict';
import {currentGame} from './current-fixture.mjs';
import {CURRENT_GAME_PROTOCOL} from '../lib/current-game.ts';
import {initializeEnsemble,beginEnsembleMonth,getEnsembleView} from '../lib/ensemble-story.ts';
import {worldChoices,worldView,visiblePlaces} from '../lib/world-life.ts';
import {getStoryView} from '../lib/story-arcs.ts';
import {relationshipViews} from '../lib/life-events.ts';
import {getLifeProgress} from '../lib/life-progress.ts';
import {createHandler} from '../supabase/functions/crosswalk-game/handler.ts';
import {memberView} from '../supabase/functions/crosswalk-game/game-service.ts';

const actors=['00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000003'];
const origin='https://crosswalk.example';
// Boundary fixture supplies an already developed local life. All tested actions,
// travel, requests, replay and serialization below use the real current engine/service.
function setup(){
 const g=currentGame({names:['Viewer','Private actor'],seed:41});initializeEnsemble(g);
 for(let round=2;round<=5;round++){g.round=round;beginEnsembleMonth(g);}
 g.code='PRVATE';g.mode='online';g.host=actors[0];g.members={[actors[0]]:[g.players[0].id],[actors[1]]:[g.players[1].id]};g.turn=1;
 const p=g.players[1];p.place='COMMUNITY';p.world.discoveredRegions.push('saffron');p.world.discoveredPlacesByRegion.alder.push('TRANSIT');
 p.life.relationships.mina.history.push('PRIVATE_RELATIONSHIP_SENTINEL');p.story.flags.push('PRIVATE_STORY_SENTINEL');p.world.journal.push({week:5,region:'alder',title:'Private account',text:'PRIVATE_WORLD_SENTINEL'});p.aspiration='creative';p.aspirationWeek=4;
 let room={state:g,code:g.code,version:1,updated_at:1};const receipts=new Map();
 const store={
  async read(_actor,code){return code===room.code?structuredClone(room):null;},
  async history(actor){return room.state.members[actor]? [{code:room.code,mode:room.state.mode,status:room.state.status,round:room.state.round,maxRounds:room.state.maxRounds,version:room.version,updatedAt:room.updated_at,names:room.state.players.map(p=>p.name)}]:[];},
  async receipt(actor,id,hash){const old=receipts.get(actor+id);return old?old.hash===hash?{kind:'ok',room:structuredClone(old.room),replayed:true,appliedVersion:old.room.version}:{kind:'request_mismatch'}:{kind:'missing'};},
  async commit(command){if(command.expectedVersion!==room.version)return{kind:'stale'};room={code:room.code,state:structuredClone(command.state),version:room.version+1,updated_at:room.updated_at+1};receipts.set(command.actor+command.requestId,{hash:command.fingerprint,room:structuredClone(room)});return{kind:'ok',room:structuredClone(room)};},
 };
 const handler=()=>createHandler({store,allowedOrigins:[origin],authenticate:async token=>{const index=Number(token.split('.')[1]);return actors[index]?{id:actors[index],role:'authenticated',is_anonymous:true}:null;}});
 let handle=handler();
 return {get room(){return room;},reload(){room=JSON.parse(JSON.stringify(room));handle=handler();},async call(actor,{action,destination,body,query=''}={}){
  const payload=body??(action?{op:'move',action,...(destination?{destination}:{}),code:room.code,version:room.version,requestId:crypto.randomUUID(),ownerSession:actors[actor],protocolVersion:CURRENT_GAME_PROTOCOL}:undefined);
  const url=`${origin}/functions/v1/crosswalk-game?protocolVersion=${CURRENT_GAME_PROTOCOL}&${query||'code='+room.code}`;
  const response=await handle(new Request(url,{method:payload?'POST':'GET',headers:{Origin:origin,Authorization:`Bearer header.${actor}.signature`,...(payload?{'Content-Type':'application/json'}:{})},...(payload?{body:JSON.stringify(payload)}:{})}));const result=await response.json();assert.equal(response.status,200,JSON.stringify(result));return{result,body:payload};
 }};
}
function checkOtherView(view,rawId,outcome){
 const serialized=JSON.stringify(view);assert.ok(!serialized.includes(rawId));assert.ok(!serialized.includes(outcome));assert.ok(!serialized.includes('PRIVATE_'));
 const p=view.players.find(p=>p.name==='Private actor');if(!p.world)return;
 for(const key of ['ensemble','life','story','aspiration','aspirationWeek','economyWork','economyHabits','regionalLifeUsage','weatherUsage'])assert.equal(p[key],undefined,key);
 assert.equal(p.world.story,undefined);assert.deepEqual(p.world.actionCounts,{});assert.deepEqual(p.world.acceptedChoices,[]);assert.deepEqual(p.world.journal,[]);assert.deepEqual(p.world.localBonds,{});assert.deepEqual(p.world.localTalkWeeks,{});assert.equal(p.world.companionBond,0);
 for(const h of Object.values(p.world.localeHistory)){assert.equal(h.lastAction,undefined);assert.deepEqual(h.completedOpportunities,[]);for(const d of h.departures){assert.equal(d.lastAction,undefined);assert.deepEqual(d.bonds,{});}}
 assert.equal(worldView(p,view),null);assert.deepEqual(worldChoices(p,view),[]);assert.deepEqual(relationshipViews(p),[]);assert.equal(getStoryView(view,p).enabled,false);assert.equal(getLifeProgress(p,view).enabled,false);assert.ok(visiblePlaces(p,view).length>0);
}

test('actual member GET/POST/stored replay/reload and travel history never expose another actor’s private choices',async()=>{
 const env=setup(),p=env.room.state.players[1];
 const c=getEnsembleView(env.room.state,p,'pantry_song','COMMUNITY').scenes.find(s=>s.id==='pantry_song').choices.find(c=>c.actionId.includes(':aftermath:')&&c.available);assert.ok(c);
 await env.call(1,{action:c.actionId});const actor=env.room.state.players[1],receipt=actor.ensemble.receipts.at(-1);assert.equal(actor.world.actionCounts[c.actionId],1);assert.equal(actor.world.localeHistory.alder.lastAction,c.actionId);
 const rawAfterChoice=JSON.stringify(env.room.state);checkOtherView((await env.call(0)).result,c.actionId,receipt.outcome);assert.equal(JSON.stringify(env.room.state),rawAfterChoice);
 const trip=worldChoices(actor,env.room.state).find(c=>c.key==='travel:saffron'&&c.available);assert.ok(trip);await env.call(1,{action:'world:'+trip.id});assert.equal(env.room.state.players[1].world.localeHistory.alder.departures.at(-1).lastAction,c.actionId);
 env.reload();checkOtherView((await env.call(0)).result,c.actionId,receipt.outcome);
 const own=(await env.call(1)).result;assert.ok(JSON.stringify(own.players[1]).includes(c.actionId));assert.ok(JSON.stringify(own.players[1]).includes('PRIVATE_RELATIONSHIP_SENTINEL'));assert.equal(own.players[1].aspiration,'creative');assert.equal(own.players[1].world.region,'saffron');
 await env.call(1,{action:'end'});const command=await env.call(0,{action:'visit',destination:'THE PARK'});checkOtherView(command.result,c.actionId,receipt.outcome);
 await env.call(0,{action:'rest'});env.reload();const replay=await env.call(0,{body:command.body});assert.deepEqual(replay.result,command.result);checkOtherView(replay.result,c.actionId,receipt.outcome);
 const outsider=(await env.call(2)).result;checkOtherView(outsider,c.actionId,receipt.outcome);assert.ok(outsider.players.every(p=>Object.keys(p).length===1));
 const saved=(await env.call(0,{query:'history=1'})).result;assert.equal(saved.rooms.length,1);assert.ok(!JSON.stringify(saved).includes(c.actionId));assert.ok(!JSON.stringify(saved).includes('PRIVATE_'));
 const before=JSON.stringify(env.room.state);checkOtherView(memberView(env.room,actors[0]),c.actionId,receipt.outcome);assert.equal(JSON.stringify(env.room.state),before);
});
