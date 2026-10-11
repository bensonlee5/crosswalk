import test from 'node:test';
import assert from 'node:assert/strict';
import {move} from '../lib/game.ts';
import {canonicalCharacterById} from '../lib/character-canon.ts';
const neighbors=['mina','eli','jo'].map(id=>canonicalCharacterById[id]);
import {regionDefinitions,visiblePlaces} from '../lib/world-life.ts';
import {castCharacters} from '../lib/cast-characters.ts';
import {characterCameos} from '../lib/character-cameos.ts';
import {currentCastCharacter} from '../lib/character-cast-canon.ts';
import {currentGame} from './current-fixture.mjs';
import {initializeCast,castPeople,resolveCastChoice,endCastMonth,castEnding} from '../lib/character-cast.ts';
import {runCastSimulation} from './cast-simulation.mjs';

const regions=Object.keys(regionDefinitions);
const priorIds=new Set([...neighbors.map(c=>c.id),'neri',...Object.values(regionDefinitions).flatMap(r=>r.residents.map(c=>c.id))]);
const person=(g,id,p=g.players[g.turn])=>castPeople(g,p).find(c=>c.id===id);
function fixture({seed=42,players=1}={}){const g=currentGame({names:Array.from({length:players},(_,i)=>`Cast ${i}`),seed});return g;}
function round(g,n){g.round=n;for(const p of g.players)p.hours=6;return g.players[g.turn];}
function choose(g,id,key,{engine=false}={}){
 const p=g.players[g.turn],view=person(g,id);assert.ok(view,`${id}: contact must remain reachable`);
 p.place=view.spot;const c=person(g,id).choices.find(c=>c.key===key);assert.ok(c,`${id}: missing ${key} in month ${g.round}`);assert.ok(c.available,c.reason);
 const before=structuredClone(p);if(engine)move(g,c.actionId);else resolveCastChoice(g,p,c.id);
 assert.equal(p.hours,before.hours-c.cost.time,`${id}/${key}: time preview`);
 assert.equal(p.cash,before.cash-c.cost.cash,`${id}/${key}: cash preview`);
 assert.equal(p.energy-before.energy,c.energy,`${id}/${key}: energy preview`);
 assert.equal(p.joy-before.joy,c.joy,`${id}/${key}: joy preview`);
 for(const field of ['economyWork','economyHabits','social','skill','craft','housing','legacy'])assert.deepEqual(p[field],before[field],`${id}/${key}: no hidden ${field} change`);
 return c;
}
function bond(phase='met',extras={}){return {phase,approach:'listen',lastWeek:1,conflict:false,repaired:false,memories:[{week:1,text:'An earlier conversation.'}],...extras};}
function meet(g,c){const p=g.players[g.turn];p.world.region=c.region;if(!person(g,c.id))g.cast.schedule[g.round].push({id:c.id,region:c.region,spot:'COMMUNITY',kind:'local'});return choose(g,c.id,'listen');}

test('eight authored newcomers join 18 retained identities for a 26-person world',()=>{
 assert.equal(priorIds.size,18);assert.equal(castCharacters.length,8);assert.equal(new Set([...priorIds,...castCharacters.map(c=>c.id)]).size,26);
 assert.equal(new Set(castCharacters.map(c=>c.id)).size,8);
 assert.equal(new Set(castCharacters.map(c=>c.name)).size,8);
 assert.equal(new Set([...neighbors.map(c=>c.name),'Neri',...Object.values(regionDefinitions).flatMap(r=>r.residents.map(c=>c.name)),...castCharacters.map(c=>c.name)]).size,26);
 assert.equal(castCharacters.filter(c=>!priorIds.has(c.id)).length,8);
 for(const c of castCharacters){
  assert.ok(regions.includes(c.region));assert.ok(c.places.length);
  for(const field of ['name','role','bio','goal','intro','listen','help','invitation','kept','remoteKept','renegotiated','missed','friction','boundary','repair','remoteRepair','disagreementRepair','support','remoteSupport','farewell','keepsake'])assert.ok(typeof c[field]==='string'&&c[field].trim().length>0,`${c.id}.${field}`);
  assert.ok(priorIds.has(c.tie.id)||castCharacters.some(other=>other.id===c.tie.id),`${c.id}: existing social tie`);assert.notEqual(c.tie.id,c.id);assert.ok(c.tie.context);
 }
 for(const field of ['goal','friction','kept','support','keepsake'])assert.equal(new Set(castCharacters.map(c=>c[field])).size,8,`Distinct ${field}`);
});


test('encounters are saved once, deterministic, diverse and recover from an absent month',()=>{
 const seen=new Set();
 for(let seed=0;seed<64;seed++){
  const g=fixture({seed}),twin=fixture({seed});twin.code='OTHER';
  assert.deepEqual(g.cast,twin.cast);seen.add(JSON.stringify(g.cast.schedule));
  for(let n=1;n<=8;n++)for(const region of regions){
   const appearances=g.cast.schedule[n].filter(a=>a.region===region);assert.ok(appearances.length>0,`${seed}/${n}/${region}: a reachable local`);
   assert.equal(new Set(appearances.map(a=>a.id)).size,appearances.length);
   for(const a of appearances){assert.ok([...castCharacters,...characterCameos].some(c=>c.id===a.id));assert.ok(['CORNER CAFÉ','COMMUNITY','THE PARK'].includes(a.spot));}
   for(const c of castCharacters.filter(c=>c.region===region))if(!appearances.some(a=>a.id===c.id)&&n<8)assert.ok(g.cast.schedule[n+1].some(a=>a.id===c.id&&a.region===region),`${c.id}: never disappears for two consecutive months`);
  }
  const saved=JSON.stringify(g.cast);g.lifeSeed=seed+999;initializeCast(g);assert.equal(JSON.stringify(g.cast),saved);
 }
 assert.ok(seen.size>60,'Different seeds produce genuinely different encounter calendars');
});

test('serialized clients do not need the hidden seed; every view is a pure persisted projection',()=>{
 const g=fixture(),p=g.players[0];meet(g,castCharacters[0]);
 const client=JSON.parse(JSON.stringify(g));delete client.lifeSeed;
 for(let n=1;n<=8;n++)for(const region of regions){
  g.round=client.round=n;p.world.region=client.players[0].world.region=region;
  for(const place of visiblePlaces(p,g)){
   p.place=client.players[0].place=place;const before=JSON.stringify(g),clientBefore=JSON.stringify(client);
   assert.deepEqual(castPeople(g,p),castPeople(client,client.players[0]));
   castPeople(g,p);castEnding(g,p);assert.equal(JSON.stringify(g),before);assert.equal(JSON.stringify(client),clientBefore);
  }
 }
});

test('all authored choice branches have exact clamped previews, no hidden economy effects and atomic refusals',()=>{
 const states=[undefined,bond(),bond('met',{promise:{due:5,status:'open'}}),bond('met',{promise:{due:4,status:'open'}}),bond('shared'),bond('tested'),bond('shared',{conflict:true}),bond('met',{promise:{due:3,status:'missed'},conflict:true}),bond('close')];
 const resources=[{cash:-500,hours:0,energy:0,joy:0},{cash:0,hours:1,energy:98,joy:99},{cash:6000,hours:6,energy:70,joy:40}];
 const keys=new Set();let previews=0;
 for(const c of castCharacters)for(const state of states)for(const values of resources){
  const g=fixture(),p=round(g,4);Object.assign(p,values);p.world.region=c.region;g.cast.schedule[4]=[{id:c.id,region:c.region,spot:'COMMUNITY',kind:'local'}];p.place='COMMUNITY';
  p.economyWork={round:4,paidHours:200};p.economyHabits={round:4,ids:['friends','cafe_break']};if(state)p.cast.bonds[c.id]=structuredClone(state);
  const before=JSON.stringify(g),view=person(g,c.id);assert.equal(JSON.stringify(g),before);
  for(const choice of view.choices){keys.add(choice.key);previews++;assert.equal(choice.cost.cash,0);assert.equal(choice.cost.energy,0);assert.ok(choice.previewText.some(t=>t.includes('$0')));
   const copy=structuredClone(g),q=copy.players[0],saved=JSON.stringify(copy),old=structuredClone(q);
   if(!choice.available){assert.throws(()=>resolveCastChoice(copy,q,choice.id));assert.equal(JSON.stringify(copy),saved);continue;}
   resolveCastChoice(copy,q,choice.id);assert.equal(q.hours,old.hours-choice.cost.time);assert.equal(q.cash-old.cash,0);assert.equal(q.energy-old.energy,choice.energy);assert.equal(q.joy-old.joy,choice.joy);
   for(const field of Object.keys(old).filter(k=>!['hours','energy','joy','cast'].includes(k)))assert.deepEqual(q[field],old[field],`${c.id}/${choice.key}: ${field} unchanged`);
   assert.equal(q.cast.receipts.length,old.cast.receipts.length+1);assert.equal(q.cast.bonds[c.id].lastWeek,4);assert.deepEqual(person(copy,c.id).choices,[],'One meaningful encounter per person per month');
   const done=JSON.stringify(copy);resolveCastChoice(copy,q,choice.id);assert.equal(JSON.stringify(copy),done,'Exact retries cannot grind resources or history');
  }
 }
 assert.deepEqual([...keys].sort(),['accept','help','honest','keep','listen','promise','quiet','release','renegotiate','repair','rush','share'].sort());assert.ok(previews>=384);
});

test('all eight new friendships can earn a kept promise, disagreement and reciprocal support without cash',()=>{
 for(const c of castCharacters){
  const g=fixture(),p=g.players[0];p.cash=0;meet(g,c);
  round(g,2);const promise=choose(g,c.id,'promise');assert.equal(promise.cost.time,0);assert.equal(p.cast.bonds[c.id].promise.due,3);
  round(g,3);choose(g,c.id,'keep');assert.equal(p.cast.bonds[c.id].promise.status,'kept');assert.equal(p.cast.bonds[c.id].keepsake,c.keepsake);
  round(g,4);choose(g,c.id,'honest');round(g,5);choose(g,c.id,'accept');
  assert.equal(p.cast.bonds[c.id].phase,'close');assert.equal(p.cash,0);assert.equal(p.cast.bonds[c.id].memories.length,5);
  const ending=castEnding(g,p).join(' ');assert.match(ending,/friendship with room for two lives/);assert.match(ending,/kept the promise/);assert.ok(ending.includes(c.keepsake));assert.doesNotMatch(ending,/\.\s+remains from that day/);
  for(let n=6;n<=8;n++){round(g,n);assert.deepEqual(person(g,c.id).choices,[],'Finished friendships are not a monthly stat farm');}
 }
});

test('missed promises remain truthful and repair is reachable at COMMUNITY from every region',()=>{
 for(const destination of regions){
  const g=fixture(),p=g.players[0],c=castCharacters.find(c=>c.region!==destination);meet(g,c);round(g,2);choose(g,c.id,'promise');round(g,3);
  endCastMonth(g,p);assert.equal(p.cast.bonds[c.id].promise.status,'missed');assert.equal(p.cast.bonds[c.id].conflict,true);
  const expired=JSON.stringify(g);endCastMonth(g,p);assert.equal(JSON.stringify(g),expired,'Promise expires once');
  round(g,4);p.world.region=destination;g.cast.schedule[4]=[];p.cash=-800;p.hours=1;
  const view=person(g,c.id);assert.equal(view.remote,true);assert.equal(view.spot,'COMMUNITY');assert.ok(visiblePlaces(p,g).includes('COMMUNITY'));
  choose(g,c.id,'repair');assert.equal(p.cast.bonds[c.id].repaired,true);assert.equal(p.cast.bonds[c.id].conflict,false);assert.equal(p.cast.bonds[c.id].keepsake,undefined);
  round(g,5);choose(g,c.id,'accept');const ending=castEnding(g,p).join(' ');assert.match(ending,/missed promise remains/);assert.match(ending,/repair what went wrong/);assert.doesNotMatch(ending,/You kept the promise/);
 }
});

test('notice and honest limits are zero-time options; they never invent completed work or repaired conflict',()=>{
 const g=fixture(),p=g.players[0],c=castCharacters[0];meet(g,c);round(g,2);p.hours=0;p.cash=-500;choose(g,c.id,'promise');
 round(g,3);p.hours=0;const view=person(g,c.id);p.place=view.spot;assert.equal(person(g,c.id).choices.find(c=>c.key==='keep').available,false);const notice=choose(g,c.id,'renegotiate');assert.ok(!notice.outcome.includes(c.missed),'Timely notice cannot narrate a no-show that did not happen');assert.ok(notice.outcome.startsWith(currentCastCharacter(g,c).renegotiated));
 assert.equal(p.cast.bonds[c.id].promise.status,'released');assert.equal(p.cast.bonds[c.id].keepsake,undefined);endCastMonth(g,p);assert.equal(p.cast.bonds[c.id].conflict,false);
 assert.doesNotMatch(castEnding(g,p).join(' '),/You kept the promise|missed promise remains/);
 round(g,4);choose(g,c.id,'rush');assert.equal(p.cast.bonds[c.id].conflict,true);round(g,5);p.hours=0;choose(g,c.id,'release');
 assert.equal(p.cast.bonds[c.id].conflict,true);assert.equal(p.cast.bonds[c.id].repaired,false);assert.match(castEnding(g,p).join(' '),/unfinished conversation/);
 round(g,6);choose(g,c.id,'repair');round(g,7);choose(g,c.id,'quiet');assert.equal(p.cast.bonds[c.id].phase,'close');assert.equal(p.cast.bonds[c.id].repaired,true);
});

test('shared acquaintances unlock a specific introduction only after a real connection',()=>{
 for(const source of ['local','main']){
  const g=fixture(),p=g.players[0],c=castCharacters.find(c=>source==='main'?['mina','eli','jo'].includes(c.tie.id):true);
  p.world.region=c.region;g.cast.schedule[1]=[{id:c.id,region:c.region,spot:'COMMUNITY',kind:'local'}];p.place='COMMUNITY';
  assert.ok(!person(g,c.id).choices.some(v=>v.key==='introduction'));
  const unearned=JSON.stringify(g);assert.throws(()=>resolveCastChoice(g,p,`cast:1:${c.id}:introduction`));assert.equal(JSON.stringify(g),unearned);
  if(source==='local')p.world.localBonds[c.tie.id]=1;
  if(source==='main')p.life.relationships[c.tie.id].support=true;
  const view=person(g,c.id);assert.match(view.tie,/shared connection makes introductions easier/);
  const choice=choose(g,c.id,'introduction');assert.ok(choice.outcome.includes(c.tie.name));assert.ok(p.cast.bonds[c.id].memories[0].text.includes(c.tie.name));
  assert.equal(p.cast.bonds[c.id].phase,'met','A shared acquaintance does not manufacture deep friendship');
 }
});

test('repairing disagreement does not invent a missed invitation or claim unperformed work',()=>{
 const g=fixture(),p=g.players[0],c=castCharacters.find(c=>c.id==='bram');meet(g,c);round(g,2);choose(g,c.id,'share');round(g,3);choose(g,c.id,'rush');round(g,4);
 const repaired=choose(g,c.id,'repair');assert.equal(p.cast.bonds[c.id].promise,undefined);assert.notEqual(repaired.outcome,c.repair,'Missed-promise repair prose cannot stand in for a disagreement');
 assert.doesNotMatch(repaired.outcome,/missed walk|empty chair|missed promise/);assert.match(castEnding(g,p).join(' '),/repair what went wrong/);assert.doesNotMatch(castEnding(g,p).join(' '),/You kept the promise|missed promise remains/);
});

test('every remote kept promise, repair and offer of support uses distance-aware authored prose',()=>{
 for(const c of castCharacters){
  const g=fixture(),p=round(g,4);p.world.region=regions.find(r=>r!==c.region);g.cast.schedule[4]=[];p.cast.bonds[c.id]=bond('met',{promise:{due:4,status:'open'}});
  assert.equal(person(g,c.id).remote,true);assert.equal(person(g,c.id).spot,'COMMUNITY');assert.ok(choose(g,c.id,'keep').outcome.startsWith(currentCastCharacter(g,c).remoteKept));
  round(g,5);g.cast.schedule[5]=[];p.cast.bonds[c.id].phase='tested';const support=choose(g,c.id,'accept');assert.ok(support.outcome.startsWith(currentCastCharacter(g,c).remoteSupport));assert.ok(!support.outcome.startsWith(currentCastCharacter(g,c).support));
  const h=fixture(),q=round(h,4);q.world.region=regions.find(r=>r!==c.region);h.cast.schedule[4]=[];q.cast.bonds[c.id]=bond('met',{promise:{due:3,status:'missed'},conflict:true});
  assert.ok(choose(h,c.id,'repair').outcome.startsWith(currentCastCharacter(h,c).remoteRepair));
 }
});

test('stale, future, malformed, misplaced and same-month alternate choices fail without mutations',()=>{
 const g=fixture(),p=g.players[0],c=castCharacters.find(c=>person(g,c.id)),view=person(g,c.id),listen=view.choices.find(v=>v.key==='listen');
 for(const id of ['', 'cast', 'cast:1:no_such_person:listen',`cast:2:${c.id}:listen`,`cast:1:${c.id}:accept`,`cast:1:${c.id}:listen:extra`,`cast:NaN:${c.id}:listen`]){
  const before=JSON.stringify(g);assert.throws(()=>resolveCastChoice(g,p,id));assert.equal(JSON.stringify(g),before);
 }
 p.place='WORK';const wrongPlace=JSON.stringify(g);assert.throws(()=>resolveCastChoice(g,p,listen.id),/Visit/);assert.equal(JSON.stringify(g),wrongPlace);
 const unspent=structuredClone(g);round(unspent,2);unspent.players[0].place=view.spot;const stale=JSON.stringify(unspent);assert.throws(()=>resolveCastChoice(unspent,unspent.players[0],listen.id));assert.equal(JSON.stringify(unspent),stale);
 choose(g,c.id,'listen');const done=JSON.stringify(g);assert.throws(()=>resolveCastChoice(g,p,`cast:1:${c.id}:help`));assert.equal(JSON.stringify(g),done);
 round(g,2);const later=JSON.stringify(g);resolveCastChoice(g,p,listen.id);assert.equal(JSON.stringify(g),later,'An accepted retry in a later month stays a no-op');
});

test('relationships are per-player and cannot resolve for an inactive player or stopped life',()=>{
 const g=fixture({players:2}),p=g.players[0],q=g.players[1],c=castCharacters.find(c=>person(g,c.id));meet(g,c);assert.equal(q.cast.bonds[c.id],undefined);assert.equal(q.cast.receipts.length,0);
 q.place=person(g,c.id,q).spot;const inactive=person(g,c.id,q).choices.find(v=>v.key==='listen');const before=JSON.stringify(g);assert.throws(()=>resolveCastChoice(g,q,inactive.id));assert.equal(JSON.stringify(g),before);
 g.turn=1;choose(g,c.id,'help');assert.equal(q.cast.bonds[c.id].approach,'help');assert.equal(p.cast.bonds[c.id].approach,'listen');
 for(const status of ['lobby','finished']){const h=fixture(),z=h.players[0],view=person(h,c.id);z.place=view.spot;const id=view.choices[0].id;h.status=status;const saved=JSON.stringify(h);assert.throws(()=>resolveCastChoice(h,z,id));assert.equal(JSON.stringify(h),saved);}
});

test('the final month cannot create impossible invitations and expires real commitments before the ending',()=>{
 const g=fixture(),c=castCharacters.find(c=>person(g,c.id));meet(g,c);round(g,8);assert.ok(!person(g,c.id).choices.some(v=>v.key==='promise'));
 const h=fixture(),q=h.players[0];meet(h,c);round(h,7);choose(h,c.id,'promise',{engine:true});assert.equal(q.cast.bonds[c.id].promise.due,8);round(h,8);move(h,'end');
 assert.equal(h.status,'finished');assert.equal(q.cast.bonds[c.id].promise.status,'missed');assert.equal(q.cast.bonds[c.id].conflict,true);assert.match(castEnding(h,q).join(' '),/missed promise remains/);assert.doesNotMatch(castEnding(h,q).join(' '),/You kept the promise/);
});

test('current eight-month timelines bound memories and preserve unresolved conflict',()=>{
 const g=fixture(),p=g.players[0];for(const c of castCharacters)p.cast.bonds[c.id]=bond('shared',{lastWeek:0,conflict:true});
 for(let n=1;n<=8;n++){round(g,n);p.cash=-1;p.hours=0;for(const c of castCharacters)choose(g,c.id,'release');assert.ok(p.cast.receipts.length<=64);assert.ok(g.log.length<=32);}
 assert.equal(p.cast.receipts.length,64);for(const c of castCharacters){assert.equal(p.cast.bonds[c.id].memories.length,8);assert.equal(p.cast.bonds[c.id].conflict,true);}assert.match(castEnding(g,p).join(' '),/unfinished conversation/);
});

test('320 complete eight-month lives distinguish earned depth, travel, repaired regret and shallow contacts',()=>{
 const summary=runCastSimulation({seeds:64});assert.equal(summary.lives,320);assert.equal(summary.months,2560);assert.equal(summary.failures,0);
 assert.equal(summary.strategies.purposeful.close,128);assert.equal(summary.strategies.nomad.close,128);assert.equal(summary.strategies.unlucky.close,64);assert.equal(summary.strategies.unlucky.unresolved,64);
 assert.equal(summary.strategies.shallow.close,0);assert.equal(summary.strategies.exhausted.close,0);assert.ok(summary.remoteActions>0);assert.ok(summary.distinctCalendars>60);
});
