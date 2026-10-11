import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,memberView,mutate} from '../supabase/functions/crosswalk-game/game-service.ts';
import {move} from '../lib/game.ts';
import {sharedChoices,sharedOpportunityView,beginSharedOpportunityRound,resolveSharedChoice} from '../lib/shared-opportunities.ts';
import {worldChoices,worldView} from '../lib/world-life.ts';
const owner='00000000-0000-4000-8000-000000000001';
const room=(n=2)=>createGame({ownerSession:owner,mode:'hotseat',names:Array.from({length:n},(_,i)=>`Player ${i+1}`),requestId:'create'},'SHARED');
const p=g=>g.players[g.turn],bytes=x=>JSON.stringify(x),visit=(g,place)=>move(g,'visit',place);
function choose(g,key){const c=sharedChoices(g,p(g)).find(c=>c.key===key);assert.ok(c,`missing ${key}`);assert.ok(c.available,`${key}: ${c.reason}`);move(g,c.actionId);return c;}
const orderOf=(g,a)=>g.sharedOpportunities.orders.find(o=>o.owner.id===a.id&&o.round===g.round);

test('2–4 actual players: order creates another person’s paid option; preparation opens owner pickup and scarce stock',()=>{
 for(const count of [2,3,4]){const g=room(count),a=p(g);visit(g,'CORNER CAFÉ');const before=sharedChoices(g,g.players[1]).map(c=>c.key),cash=a.cash;choose(g,'order');const id=orderOf(g,a).id;assert.equal(a.cash,cash-45);assert.ok(!before.includes('prepare:'+id));move(g,'end');const b=p(g);visit(g,'CORNER CAFÉ');const money=b.cash,energy=b.energy,hours=b.hours;choose(g,'prepare:'+id);assert.equal(orderOf(g,a).status,'ready');assert.equal(b.cash,money+154);assert.equal(b.energy,energy-6);assert.equal(b.hours,hours-1);assert.equal(b.economyWork.paidHours,8);assert.ok(sharedChoices(g,a).find(c=>c.key==='collect:'+id).available);assert.equal(sharedChoices(g,a).find(c=>c.key==='collect:'+id).time,1);const spare=sharedChoices(g,b).find(c=>c.kind==='portion');choose(g,spare.key);assert.equal(g.sharedOpportunities.months['1:alder'].sparePortions[0].buyerId,b.id);assert.match(sharedChoices(g,b).find(c=>c.kind==='portion').reason,/already/);assert.ok(sharedOpportunityView(g,b).facts.some(f=>f.body.includes(a.name)&&f.body.includes('prepaid')));}
});

test('four players: reservations contend, preparation adds capacity, others retain a costed independent route',()=>{
 const g=room(4);visit(g,'COMMUNITY');choose(g,'reserve:rehearsal');assert.equal(g.sharedOpportunities.months['1:alder'].npcPlan,'courtyard');move(g,'end');visit(g,'COMMUNITY');assert.match(sharedChoices(g,p(g)).find(c=>c.key==='reserve:supper').reason,/committed/);choose(g,'annex');assert.equal(g.sharedOpportunities.months['1:alder'].npcPlan,'annex');choose(g,'reserve:supper');assert.equal(g.sharedOpportunities.bookings[1].slot,'annex');assert.equal(g.sharedOpportunities.months['1:alder'].npcPlan,'courtyard');move(g,'end');visit(g,'COMMUNITY');assert.match(sharedChoices(g,p(g)).find(c=>c.key==='reserve:rehearsal').reason,/committed/);const money=p(g).cash,time=p(g).hours;choose(g,'outdoor');assert.equal(p(g).cash,money-10);assert.equal(p(g).hours,time-2);assert.equal(p(g).craft,1);assert.equal(g.sharedOpportunities.bookings.length,2);move(g,'end');visit(g,'COMMUNITY');assert.ok(sharedChoices(g,p(g)).find(c=>c.key==='outdoor').available);
});

test('early preparation prevents the NPC displacement without forcing replacement conflict',()=>{const g=room();visit(g,'COMMUNITY');choose(g,'annex');choose(g,'reserve:rehearsal');assert.equal(g.sharedOpportunities.months['1:alder'].npcPlan,'annex');assert.equal(g.sharedOpportunities.events.filter(e=>e.effect.includes('will use the courtyard')).length,0);});

test('cancellation refunds once, closes only its job and cannot farm order or room allowances',()=>{
 const g=room(),a=p(g);visit(g,'CORNER CAFÉ');const initial=a.cash;choose(g,'order');const id=orderOf(g,a).id;choose(g,'cancel:'+id);assert.equal(a.cash,initial);assert.match(sharedChoices(g,a).find(c=>c.key==='order').reason,/already/);assert.ok(!sharedChoices(g,a).some(c=>c.key==='cancel:'+id));visit(g,'COMMUNITY');choose(g,'reserve:supper');const booking=g.sharedOpportunities.bookings[0],release=choose(g,'release:'+booking.id);assert.equal(a.cash,initial);const saved=bytes(g);move(g,release.actionId);assert.equal(bytes(g),saved);assert.match(sharedChoices(g,a).find(c=>c.key==='reserve:supper').reason,/already/);move(g,'end');visit(g,'COMMUNITY');assert.ok(!sharedChoices(g,p(g)).some(c=>c.key==='release:'+booking.id));const unchanged=bytes(g);assert.throws(()=>move(g,release.actionId),/changed/);assert.equal(bytes(g),unchanged);choose(g,'reserve:rehearsal');assert.equal(g.sharedOpportunities.bookings.filter(b=>b.status==='reserved').length,1);
});

test('used bookings give their owner chosen benefit and cannot be refunded or overwritten',()=>{const g=room();visit(g,'COMMUNITY');const a=p(g);choose(g,'reserve:rehearsal');const b=g.sharedOpportunities.bookings[0],money=a.cash;choose(g,'use:'+b.id);assert.equal(a.craft,1);assert.equal(a.cash,money);assert.ok(!sharedChoices(g,a).some(c=>c.key==='release:'+b.id));move(g,'end');visit(g,'COMMUNITY');assert.match(sharedChoices(g,p(g)).find(c=>c.key==='reserve:supper').reason,/committed/);});

test('ignored work settles honestly by NPC; unused rooms refund and paid pickup persists after month change',()=>{
 const g=room(),a=p(g);visit(g,'CORNER CAFÉ');choose(g,'order');const id=orderOf(g,a).id;visit(g,'COMMUNITY');choose(g,'reserve:supper');move(g,'end');move(g,'end');assert.equal(g.round,2);const o=g.sharedOpportunities.orders.find(o=>o.id===id);assert.equal(o.status,'ready');assert.equal(o.preparedBy.kind,'npc');assert.equal(sharedChoices(g,a).find(c=>c.key==='collect:'+id).time,2);assert.ok(sharedChoices(g,a).find(c=>c.key==='cancel:'+id));assert.equal(g.sharedOpportunities.bookings[0].status,'expired');assert.ok(g.sharedOpportunities.events.some(e=>e.actionId.startsWith('npc:refund:')));const saved=bytes(g);beginSharedOpportunityRound(g);assert.equal(bytes(g),saved);while(p(g).id!==a.id)move(g,'end');visit(g,'CORNER CAFÉ');choose(g,'collect:'+id);assert.equal(g.sharedOpportunities.orders.find(o=>o.id===id).status,'collected');
});

test('solo: immediate NPC fulfillment changes stock and pickup without fake human or forced wait',()=>{const g=room(1);visit(g,'CORNER CAFÉ');const a=p(g);choose(g,'order');const o=orderOf(g,a);assert.equal(o.status,'ready');assert.equal(o.preparedBy.kind,'npc');assert.ok(sharedChoices(g,a).find(c=>c.key==='collect:'+o.id).available);assert.ok(sharedChoices(g,a).some(c=>c.kind==='prepare'&&c.available));assert.match(sharedOpportunityView(g,a).facts[0].body,/^1 spare/);assert.equal(a.sharedPersonal.receipts.at(-1).response.speakerId,'alder_tess');assert.match(a.sharedPersonal.receipts.at(-1).response.speech,/ready/);assert.equal(g.players.length,1);});

test('another player cannot collect, cancel or spend an owner’s commitment',()=>{const g=room();visit(g,'CORNER CAFÉ');choose(g,'order');const a=p(g),id=orderOf(g,a).id,cancel=sharedChoices(g,a).find(c=>c.key==='cancel:'+id);move(g,'end');visit(g,'CORNER CAFÉ');assert.ok(!sharedChoices(g,p(g)).some(c=>c.key==='collect:'+id||c.key==='cancel:'+id));const saved=bytes(g);assert.throws(()=>move(g,cancel.actionId),/changed/);assert.equal(bytes(g),saved);});

test('stale IDs, insufficient resources and wrong venue fail atomically',()=>{
 for(const issue of ['cash','hours','energy','venue','stale']){const g=room();visit(g,'COMMUNITY');const a=p(g);let c=sharedChoices(g,a).find(c=>c.key==='annex');if(issue==='cash'){a.cash=0;c=sharedChoices(g,a).find(c=>c.key==='reserve:supper');}if(issue==='hours')a.hours=0;if(issue==='energy')a.energy=0;if(issue==='venue')a.place='APARTMENTS';if(issue==='stale')choose(g,'reserve:supper');const old=bytes(g);assert.throws(()=>move(g,c.actionId));assert.equal(bytes(g),old);}
});

test('all regional hosts expose changes and stable receipts; views and reconnects are pure',()=>{
 for(const region of ['alder','saffron','glasssteppe','pelagia','embermesa']){const g=room(1),a=p(g);a.world.region=region;visit(g,'CORNER CAFÉ');const old=bytes(g),view=worldView(a,g);assert.ok(view.choices.some(c=>c.key==='shared:order'));assert.deepEqual(worldChoices(a,g).filter(c=>c.id.startsWith('shared')),view.choices.filter(c=>c.id.startsWith('shared')));assert.equal(bytes(g),old);const c=choose(g,'order'),saved=JSON.parse(bytes(g)),again=saved.players[0];assert.equal(again.sharedPersonal.receipts.at(-1).actionId,c.actionId);assert.deepEqual(sharedOpportunityView(saved,again),sharedOpportunityView(g,a));const oldSave=bytes(saved);resolveSharedChoice(saved,again,c.id);assert.equal(bytes(saved),oldSave);}
});

test('private responses are masked for other seats, but public causal facts remain visible',()=>{
 const g=room();visit(g,'CORNER CAFÉ');choose(g,'order');const a=p(g),b=g.players[1],other='00000000-0000-4000-8000-000000000002';g.mode='online';g.members={[owner]:[a.id],[other]:[b.id]};const view=memberView({code:g.code,state:g,version:3,updated_at:0},other);assert.equal(view.players[0].sharedPersonal,undefined);assert.ok(!bytes(view).includes(a.sharedPersonal.receipts[0].response.speech));assert.ok(view.sharedOpportunities.events.some(e=>e.actor.id===a.id));assert.deepEqual(sharedOpportunityView(view,view.players[0]).receipts,[]);
});

class MemoryStore{
 constructor(){this.rows=new Map();this.receipts=new Map();}
 async read(actor,code){const r=this.rows.get(code);return r?.state.members[actor]?structuredClone(r):null;}
 async history(){return[];}
 async receipt(actor,id,fingerprint){const r=this.receipts.get(actor+':'+id);if(!r)return{kind:'missing'};return r.fingerprint!==fingerprint?{kind:'request_mismatch'}:{kind:'ok',room:structuredClone(this.rows.get(r.code)),replayed:true};}
 async commit(c){const key=c.actor+':'+c.requestId;if(this.receipts.has(key))return this.receipt(c.actor,c.requestId,c.fingerprint);const r=this.rows.get(c.code);if(r&&r.version!==c.expectedVersion)return{kind:'stale'};if(!r&&c.expectedVersion!==null)return{kind:'missing'};const room={code:c.code,state:structuredClone(c.state),version:(r?.version??-1)+1,updated_at:Date.now()};this.rows.set(c.code,room);this.receipts.set(key,{code:c.code,fingerprint:c.fingerprint});return{kind:'ok',room:structuredClone(room)};}
}

test('production mutation service: concurrent booking/end, durable retry, mismatched request and out-of-order commands commit once',async()=>{
 const store=new MemoryStore();let n=0;const cmd=data=>({protocolVersion:1,ownerSession:owner,requestId:'request-'+(++n),...data});let view=await mutate(store,owner,cmd({op:'create',mode:'hotseat',names:['A','B'],sharedOpportunitiesVersion:999}));assert.equal(view.schemaVersion,1);view=await mutate(store,owner,cmd({op:'move',code:view.code,version:view.version,action:'visit',destination:'COMMUNITY'}));const c=sharedChoices(view,view.players[view.turn]).find(c=>c.key==='reserve:supper'),request=cmd({op:'move',code:view.code,version:view.version,action:c.actionId}),contender=cmd({op:'move',code:view.code,version:view.version,action:c.actionId});const results=await Promise.allSettled([mutate(store,owner,request),mutate(store,owner,contender)]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(results.find(r=>r.status==='rejected').reason.status,409);const committed=store.rows.get(view.code),cash=committed.state.players[0].cash;assert.equal(committed.state.sharedOpportunities.bookings.length,1);const winner=results[0].status==='fulfilled'?request:contender;const replay=await mutate(store,owner,winner);assert.equal(replay.players[0].cash,cash);assert.equal(replay.sharedOpportunities.bookings.length,1);assert.equal(replay.players[0].sharedPersonal.receipts.length,1);await assert.rejects(()=>mutate(store,owner,{...winner,action:'end'}),e=>e.status===409);await assert.rejects(()=>mutate(store,owner,cmd({op:'move',code:view.code,version:view.version,action:'end'})),e=>e.status===409);assert.equal(store.rows.get(view.code).state.players[0].cash,cash);
});

test('actual last-month end settles pending multiplayer orders and unused rooms once',()=>{
 const g=room(2);g.round=8;g.sharedOpportunities.lastRound=7;beginSharedOpportunityRound(g);const a=p(g);visit(g,'CORNER CAFÉ');choose(g,'order');const id=orderOf(g,a).id;visit(g,'COMMUNITY');choose(g,'reserve:rehearsal');move(g,'end');assert.equal(g.sharedOpportunities.orders.find(o=>o.id===id).status,'pending');const cash=a.cash;move(g,'end');assert.equal(g.status,'finished');assert.equal(g.sharedOpportunities.orders.find(o=>o.id===id).status,'cancelled');assert.equal(g.sharedOpportunities.bookings[0].status,'expired');assert.equal(a.cash,cash+75);const old=bytes(g);assert.throws(()=>move(g,'end'),/not running/);assert.equal(bytes(g),old);
});

test('sixteen solo-to-four-player eight-month variant campaigns keep finite, owned and recoverable commitments',()=>{
 for(const count of [1,2,3,4])for(const seed of [1,7,19,43]){
  const g=room(count);let random=seed,turnActions=0,last='';const pick=n=>{random=(Math.imul(random,1664525)+1013904223)>>>0;return random%n;};
  while(g.status==='playing'){
   const turn=`${g.round}:${g.turn}`;if(turn!==last){turnActions=0;last=turn;}const a=p(g);
   if(a.hours<=0||turnActions++>=8){move(g,'end');continue;}
   visit(g,pick(2)?'COMMUNITY':'CORNER CAFÉ');const choices=sharedChoices(g,a).filter(c=>c.available);if(choices.length){const c=choices[pick(choices.length)],before=a.cash;move(g,c.actionId);assert.equal(a.cash,before+(c.earn??0)-c.cost);const settled=bytes(g);move(g,c.actionId);assert.equal(bytes(g),settled);}else{visit(g,'APARTMENTS');move(g,'home_reset');}
   for(const b of g.sharedOpportunities.bookings.filter(b=>b.status==='reserved'||b.status==='used'))assert.equal(g.sharedOpportunities.bookings.filter(q=>(q.status==='reserved'||q.status==='used')&&q.round===b.round&&q.region===b.region&&q.slot===b.slot).length,1);
   for(const a of g.players){assert.ok([a.cash,a.hours,a.energy,a.joy].every(Number.isFinite));assert.ok(a.hours>=0&&a.energy>=0&&a.energy<=100);assert.equal(new Set(a.sharedPersonal.orderRounds).size,a.sharedPersonal.orderRounds.length);assert.equal(new Set(a.sharedPersonal.bookingRounds).size,a.sharedPersonal.bookingRounds.length);assert.equal(new Set(a.sharedPersonal.receipts.map(r=>r.id)).size,a.sharedPersonal.receipts.length);}
  }
  assert.ok(g.sharedOpportunities.finalized);assert.equal(g.sharedOpportunities.orders.filter(o=>o.status==='pending'||o.owner.kind==='player'&&o.status==='ready').length,0);assert.equal(g.sharedOpportunities.bookings.filter(b=>b.status==='reserved').length,0);
 }
});

test('ordering after the helper’s turn preserves their next turn to respond, with meaningful better-paid work',()=>{
 const g=room();move(g,'end');const a=p(g);visit(g,'CORNER CAFÉ');choose(g,'order');const id=orderOf(g,a).id;move(g,'end');assert.equal(g.round,2);assert.equal(g.sharedOpportunities.orders.find(o=>o.id===id).status,'pending');assert.equal(p(g).id,a.id);move(g,'end');visit(g,'CORNER CAFÉ');const customer=sharedChoices(g,p(g)).find(c=>c.key==='prepare:'+id),standing=sharedChoices(g,p(g)).find(c=>c.key==='prepare:standing:2:alder');assert.ok(customer.available);assert.equal(customer.paidHours,8);assert.equal(standing.paidHours,4);assert.ok(customer.earn>standing.earn);choose(g,customer.key);assert.equal(g.sharedOpportunities.orders.find(o=>o.id===id).delayed,false);assert.equal(sharedChoices(g,a).find(c=>c.key==='collect:'+id).time,1);
});

test('passing the response window produces a concrete longer collection or full refund without profit',()=>{
 const g=room();move(g,'end');const a=p(g);visit(g,'CORNER CAFÉ');choose(g,'order');const id=orderOf(g,a).id;move(g,'end');move(g,'end');move(g,'end');const o=g.sharedOpportunities.orders.find(o=>o.id===id);assert.equal(o.status,'ready');assert.equal(o.delayed,true);while(p(g).id!==a.id)move(g,'end');visit(g,'CORNER CAFÉ');const pickup=sharedChoices(g,a).find(c=>c.key==='collect:'+id);assert.equal(pickup.time,2);assert.match(pickup.body,/busy service/);const cash=a.cash;const refund=choose(g,'cancel:'+id);assert.equal(a.cash,cash+45);const saved=bytes(g);move(g,refund.actionId);assert.equal(bytes(g),saved);assert.equal(g.sharedOpportunities.orders.find(o=>o.id===id).status,'cancelled');
});

test('booking copy does not imply an unprepared annex already exists',()=>{
 const g=room(2);visit(g,'COMMUNITY');choose(g,'reserve:rehearsal');move(g,'end');visit(g,'COMMUNITY');
 const choice=sharedChoices(g,p(g)).find(c=>c.key==='reserve:supper');
 assert.match(choice.body,/The available room space is committed/);assert.doesNotMatch(choice.body,/Both available rooms/);
 assert.match(choice.reason,/Prepare the annex/);
});
