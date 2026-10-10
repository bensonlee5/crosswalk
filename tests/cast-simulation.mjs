/** Seeded engine-driven life runs. No browser, network, database or production state. */
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {player,move,reason} from '../lib/game.ts';
import {initializeEconomyPlayer,economyPaidHours} from '../lib/economy.ts';
import {initializeLife} from '../lib/life-events.ts';
import {initializeWorldPlayer,initializeSharedWorld,worldChoices,regionDefinitions} from '../lib/world-life.ts';
import {initializeStory} from '../lib/story-arcs.ts';
import {castCharacters} from '../lib/cast-characters.ts';
import {initializeCast,castPeople,castEnding} from '../lib/character-cast.ts';

const strategyNames=['purposeful','nomad','unlucky','shallow','exhausted'];
const route=['alder','alder','saffron','embermesa','glasssteppe','pelagia','saffron','alder'];
const targets=castCharacters.filter(c=>c.region==='alder'&&['bram','oren'].includes(c.id)).map(c=>c.id);
function fresh(seed){
 const p={...player('Simulated life',1),id:'sim-player'};
 const g={code:'SIMCAST',mode:'hotseat',host:'simulation',members:{simulation:[p.id]},players:[p],status:'lobby',round:1,turn:0,maxRounds:8,log:[],seen:[],event:0,rulesVersion:2,lifeVersion:1,worldVersion:1,storyVersion:1,economyVersion:1,balanceVersion:1,castVersion:1,turnsTaken:0};
 initializeEconomyPlayer(p,g);g.status='playing';initializeLife(g,seed);initializeWorldPlayer(p);initializeSharedWorld(g);initializeStory(g);initializeCast(g);return g;
}
function serializeAndCheck(g){
 const before=JSON.stringify(g),client=JSON.parse(before);delete client.lifeSeed;
 assert.deepEqual(castPeople(g,g.players[0]),castPeople(client,client.players[0]),'The client view uses saved encounters without a secret seed');
 castEnding(g,g.players[0]);assert.equal(JSON.stringify(g),before,'Reading cast views must not change state');return JSON.parse(before);
}
function ordinary(g,id,place){const p=g.players[0];if(reason(p,id,g))return false;move(g,'visit',place);move(g,id);return true;}
function desired(g,id,strategy,index){
 const p=g.players[0],b=p.cast.bonds[id];
 if(!b)return 'listen';
 if(strategy==='shallow'||strategy==='exhausted')return null;
 if(b.conflict)return strategy==='unlucky'&&index===1?'release':'repair';
 if(b.phase==='close')return null;
 if(b.promise?.status==='open')return strategy==='unlucky'?null:'keep';
 if(b.phase==='met')return 'promise';
 if(b.phase==='shared')return 'honest';
 if(b.phase==='tested')return 'accept';
 return null;
}
function act(g,id,key,report,used){
 const p=g.players[0],view=castPeople(g,p).find(c=>c.id===id);if(!view||!key)return false;
 move(g,'visit',view.spot);const c=castPeople(g,p).find(c=>c.id===id).choices.find(c=>c.key===key);if(!c||!c.available)return false;
 const before=structuredClone(p),monthId=`${g.round}:${id}`;assert.ok(!used.has(monthId),'No second interaction with the same person in one month');used.add(monthId);
 move(g,c.actionId);assert.equal(p.cash,before.cash,'Friendship is not a cash faucet');assert.deepEqual(p.economyWork,before.economyWork);assert.deepEqual(p.economyHabits,before.economyHabits);
 assert.equal(p.hours,before.hours-c.cost.time);assert.equal(p.energy,before.energy+c.energy);assert.equal(p.joy,before.joy+c.joy);assert.ok(p.cast.bonds[id].memories.length<=8);
 const once=JSON.stringify(g);move(g,c.actionId);assert.equal(JSON.stringify(g),once,'Repeated requests are idempotent');
 assert.deepEqual(castPeople(g,p).find(c=>c.id===id).choices,[]);
 report.actions++;if(view.remote)report.remoteActions++;return true;
}
function life(seed,strategy){
 let g=fresh(seed);const report={seed,strategy,actions:0,remoteActions:0,close:0,unresolved:0,missed:0,kept:0,memories:0,regions:[],months:[],ending:[],castSchedule:JSON.stringify(g.cast.schedule)};
 const visited=new Set(['alder']),used=new Set();
 for(let month=1;month<=8;month++){
  assert.equal(g.status,'playing');assert.equal(g.round,month);g=serializeAndCheck(g);const p=g.players[0];
  if(strategy==='exhausted'){
   // Adversarial resource state, deliberately re-applied each month. This is
   // an availability stress fixture, not a claim about a sustainable budget.
   p.cash=0;p.hours=0;p.energy=0;
   for(const v of castPeople(g,p))for(const c of v.choices)assert.equal(c.available,false,'No-time player cannot acquire a free introduction');
  }else{
   assert.ok(ordinary(g,'work','WORK'),`${strategy}/${seed}/${month}: normal work remains affordable`);
   if(strategy==='nomad'&&p.world.region!==route[month-1]){
    const travel=worldChoices(p,g).find(c=>c.key===`travel:${route[month-1]}`);assert.ok(travel?.available,travel?.reason??'Travel choice is missing');
    move(g,`world:${travel.id}`);visited.add(p.world.region);
   }
   targets.forEach((id,index)=>act(g,id,desired(g,id,strategy,index),report,used));
   ordinary(g,'rest','THE PARK');
  }
  assert.ok(economyPaidHours(p,g)<=200);assert.ok(p.hours>=0);assert.ok(p.energy>=0&&p.energy<=100);assert.ok(p.joy>=0&&p.joy<=100);assert.ok(p.cast.receipts.length<=64);
  report.months.push({month,region:p.world.region,cash:p.cash,hours:p.hours,energy:p.energy,bonds:Object.fromEntries(Object.entries(p.cast.bonds).map(([id,b])=>[id,{phase:b.phase,promise:b.promise?.status??null,conflict:b.conflict}]))});
  move(g,'end');
 }
 assert.equal(g.status,'finished');assert.equal(g.round,8);g=serializeAndCheck(g);const p=g.players[0];
 report.regions=[...visited];report.ending=castEnding(g,p);report.finalCash=p.cash;
 for(const b of Object.values(p.cast.bonds)){if(b.phase==='close')report.close++;if(b.conflict)report.unresolved++;if(b.promise?.status==='missed')report.missed++;if(b.promise?.status==='kept')report.kept++;report.memories+=b.memories.length;assert.notEqual(b.promise?.status,'open','There must be no orphaned commitment after the last month');}
 if(strategy==='purposeful'||strategy==='nomad'){
  assert.equal(report.close,2,`${strategy}/${seed}: two earned friendships`);assert.equal(report.kept,2);assert.equal(report.unresolved,0);assert.equal(report.missed,0);
  for(const line of report.ending){assert.match(line,/friendship with room for two lives/);assert.match(line,/You kept the promise/);}
 }
 if(strategy==='nomad')assert.equal(visited.size,Object.keys(regionDefinitions).length,'A nomad keeps contact through every region');
 if(strategy==='unlucky'){
  assert.equal(report.close,1);assert.equal(report.unresolved,1);assert.equal(report.missed,2);assert.equal(report.kept,0);
  assert.match(report.ending.join(' '),/repair what went wrong/);assert.match(report.ending.join(' '),/unfinished conversation/);assert.doesNotMatch(report.ending.join(' '),/You kept the promise/);
 }
 if(strategy==='shallow'){
  assert.equal(report.close,0);assert.equal(Object.keys(p.cast.bonds).length,2);assert.equal(report.actions,2);
  for(const line of report.ending)assert.match(line,/A beginning, not yet a deep friendship/);
  assert.doesNotMatch(report.ending.join(' '),/You kept the promise|friendship with room for two lives/);
 }
 if(strategy==='exhausted'){assert.equal(report.actions,0);assert.equal(Object.keys(p.cast.bonds).length,0);assert.deepEqual(report.ending,[]);}
 assert.ok(castPeople(g,p).every(v=>v.choices.every(c=>!c.available)),'A finished life cannot offer an actionable cast choice');
 return report;
}
export function runCastSimulation({seeds=64,includeExamples=false}={}){
 assert.equal(targets.length,2,'The simulation follows Bram and Oren, two authored Alder contacts');
 const summary={seeds,lives:0,months:0,failures:0,actions:0,remoteActions:0,distinctCalendars:0,distinctEndings:0,strategies:Object.fromEntries(strategyNames.map(n=>[n,{lives:0,actions:0,close:0,unresolved:0,missed:0,kept:0,memories:0,distinctEndings:0,distinctTimelines:0,minFinalCash:Infinity,maxFinalCash:-Infinity}]))};
 const calendars=new Set(),endings=new Set(),examples=[],strategyEndings=Object.fromEntries(strategyNames.map(n=>[n,new Set()])),strategyTimelines=Object.fromEntries(strategyNames.map(n=>[n,new Set()]));
 for(let seed=0;seed<seeds;seed++)for(const strategy of strategyNames){
 const report=life(seed,strategy),totals=summary.strategies[strategy];summary.lives++;summary.months+=8;summary.actions+=report.actions;summary.remoteActions+=report.remoteActions;calendars.add(report.castSchedule);totals.lives++;
  for(const key of ['actions','close','unresolved','missed','kept','memories'])totals[key]+=report[key];
  endings.add(JSON.stringify(report.ending));strategyEndings[strategy].add(JSON.stringify(report.ending));strategyTimelines[strategy].add(JSON.stringify(report.months.map(m=>m.bonds)));
  totals.minFinalCash=Math.min(totals.minFinalCash,report.finalCash);totals.maxFinalCash=Math.max(totals.maxFinalCash,report.finalCash);
  if(includeExamples&&seed===0){delete report.castSchedule;examples.push(report);}
 }
 summary.distinctCalendars=calendars.size;summary.distinctEndings=endings.size;
 for(const strategy of strategyNames){summary.strategies[strategy].distinctEndings=strategyEndings[strategy].size;summary.strategies[strategy].distinctTimelines=strategyTimelines[strategy].size;}
 if(includeExamples)summary.examples=examples;return summary;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const requested=Number(process.argv.find(a=>a.startsWith('--seeds='))?.split('=')[1]??64);assert.ok(Number.isInteger(requested)&&requested>0);
 console.log(JSON.stringify(runCastSimulation({seeds:requested,includeExamples:process.argv.includes('--examples')}),null,2));
}
