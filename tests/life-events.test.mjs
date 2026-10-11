import test from 'node:test';
import assert from 'node:assert/strict';
import {currentGame} from './current-fixture.mjs';
import {initializeLife,beginLifeWeek,getLifeEvent,lifeChoices,resolveLifeChoice,deferLifeChoice,repairChoice,repairRelationship,relationshipViews,lifeEventIds,lifeNpcs,repairHomeChoice,repairHome,afterLifeAction} from '../lib/life-events.ts';
import {storyAfterAction} from '../lib/story-arcs.ts';
const resources=['cash','hours','energy','joy','skill','social','craft','housing','legacy'];
function prepared(event,patch={},relationPatch={}){const g=currentGame(),p=g.players[0];Object.assign(p,patch);for(const npc of lifeNpcs)Object.assign(p.life.relationships[npc],relationPatch);g.round=2;g.lifeSchedule=[{week:2,eventId:event}];beginLifeWeek(g);return g;}
function exact(p,before,e){for(const k of resources)assert.equal(p[k]??0,(before[k]??0)+e[k],k);for(const n of lifeNpcs)assert.equal(p.life.relationships[n].trust,before.life.relationships[n].trust+e.trust[n]);for(const d of e.relationshipChanges)for(const k of ['support','rivalry','reciprocity'])if(d[k]!==undefined)assert.equal(p.life.relationships[d.npc][k],d[k]);}
test('seeded private events use only current authored surprises and retain their exact schedule',()=>{
 const orders=new Set();assert.deepEqual([...lifeEventIds].sort(),['repair_bill','unexpected_patron','vacancy','work_reset']);
 for(let seed=0;seed<60;seed++){const a=currentGame({seed}),b=currentGame({seed});assert.deepEqual(a.lifeSchedule,b.lifeSchedule);assert.ok(a.lifeSchedule.length>=2&&a.lifeSchedule.length<=4);assert.ok(a.lifeSchedule.every(e=>[2,4,6,8].includes(e.week)&&lifeEventIds.includes(e.eventId)));assert.equal(new Set(a.lifeSchedule.map(e=>e.eventId)).size,a.lifeSchedule.length);orders.add(JSON.stringify(a.lifeSchedule));const before=JSON.stringify(a);initializeLife(a,seed+100);assert.equal(JSON.stringify(a),before);}
 assert.ok(orders.size>25);
});
test('all current event choices have exact previews, atomic denials, safe deferral and idempotent receipts',()=>{
 const profiles=[{}, {cash:0,energy:0,hours:0,joy:0},{cash:-80,energy:0,hours:0},{cash:40,energy:4,hours:1},{cash:10000,skill:6,craft:8,social:15,housing:1,joy:100,energy:100,legacy:10}];
 let resolved=0;const covered=new Set();
 for(const event of lifeEventIds)for(const profile of profiles)for(const rel of [{},{trust:3,support:true,reciprocity:true},{trust:-3,rivalry:true}]){
  const g=prepared(event,profile,rel),p=g.players[0];p.career.training['technical:foundation']={round:1,courseId:'technical-foundation-study'};p.career.experience.technical={paidHours:160,commitments:1,months:[1]};
  const receipt=getLifeEvent(p,g);assert.equal(receipt.effects.hours,0);const beforeRead=JSON.stringify(g),options=lifeChoices(p,g);relationshipViews(p);repairChoice(p,g,'mina');assert.equal(JSON.stringify(g),beforeRead);
  const safe=options.find(c=>c.safe);assert.ok(safe.available);assert.equal(safe.preview.hours,0);assert.ok(safe.preview.cash>=0&&safe.preview.energy>=0);
  for(const c of options){const copy=structuredClone(g),q=copy.players[0],before=structuredClone(q),saved=JSON.stringify(copy);if(!c.available){assert.throws(()=>resolveLifeChoice(copy,q,c.id));assert.equal(JSON.stringify(copy),saved);continue;}resolveLifeChoice(copy,q,c.id);exact(q,before,c.preview);const done=JSON.stringify(copy);resolveLifeChoice(copy,q,c.id);assert.equal(JSON.stringify(copy),done);assert.throws(()=>resolveLifeChoice(copy,q,options.find(o=>o.id!==c.id).id));assert.equal(JSON.stringify(copy),done);covered.add(c.id.split(':').at(-1));resolved++;}
  const copy=structuredClone(g),q=copy.players[0],before=structuredClone(q);deferLifeChoice(copy,q);exact(q,before,safe.preview);assert.equal(getLifeEvent(q,copy).resolved.deferred,true);const done=JSON.stringify(copy);deferLifeChoice(copy,q);assert.equal(JSON.stringify(copy),done);
 }
 assert.ok(resolved>100);assert.equal(covered.size,13);
});
test('month arrival applies to every player exactly once through repeated calls and reload',()=>{
 const g=currentGame({names:['A','B','C']});for(let round=2;round<=8;round++){g.round=round;beginLifeWeek(g);const saved=JSON.stringify(g);beginLifeWeek(g);assert.equal(JSON.stringify(g),saved);const copy=JSON.parse(saved);beginLifeWeek(copy);assert.equal(JSON.stringify(copy),saved);for(const p of g.players)assert.equal(p.life.receipts.length,g.lifeSchedule.filter(e=>e.week<=round).length);}
});
test('outside booking loss never rewrites contracts or creates numeric career recovery',()=>{
 const g=prepared('work_reset'),p=g.players[0],career=structuredClone(p.career),cs=lifeChoices(p,g);assert.ok(p.life.flags.includes('shift_lost'));assert.ok(!cs.some(c=>c.id.endsWith('recover_role')));assert.ok(cs.some(c=>c.id.endsWith('work_plan')));resolveLifeChoice(g,p,cs.find(c=>c.safe).id);assert.deepEqual(p.career,career);assert.ok(!('job' in p));
});
test('relationship conversations preserve concrete favors and need in-person follow-through',()=>{
 const g=currentGame(),p=g.players[0];Object.assign(p.life.relationships.jo,{trust:-1,rivalry:true,reciprocity:true});p.world.region='saffron';const remote=repairChoice(p,g,'jo');assert.match(remote.title,/Call/);repairRelationship(g,p,'jo');assert.equal(p.life.relationships.jo.rivalry,true);assert.equal(p.life.relationships.jo.reciprocity,true);assert.throws(()=>repairRelationship(g,p,'jo'),/already checked/);
 g.round=2;p.hours=6;p.world.region='alder';p.place='MAKERSPACE';repairRelationship(g,p,'jo');assert.equal(p.life.relationships.jo.rivalry,false);assert.equal(p.life.relationships.jo.reciprocity,true);storyAfterAction(g,p,'maker_repair');assert.equal(p.life.relationships.jo.reciprocity,false);
});
test('postponed repairs remain actionable with exact paid or DIY consequences',()=>{
 for(const method of ['paid','diy']){const g=prepared('repair_bill',{cash:5000,craft:4}),p=g.players[0];deferLifeChoice(g,p);const c=repairHomeChoice(p,g,method),before=structuredClone(p);assert.ok(c.available,c.reason);repairHome(g,p,method);exact(p,before,c.preview);assert.ok(!p.life.flags.includes('repairs_unfinished'));assert.equal(repairHomeChoice(p,g,method).available,false);}
});
test('forged actor or stale event IDs cannot spend and normal action counts are current-only',()=>{
 const g=prepared('repair_bill'),p=g.players[0],c=lifeChoices(p,g).find(c=>c.safe),saved=JSON.stringify(g);assert.throws(()=>resolveLifeChoice(g,{...p},c.id));assert.throws(()=>resolveLifeChoice(g,p,'3:repair_bill:fund_repairs'));assert.equal(JSON.stringify(g),saved);afterLifeAction(g,p,'home_reset');assert.equal(p.life.activityCounts.home_reset,1);assert.ok(!('storyChapters' in p.life));
});
test('current authored cash amounts are explicit and paid help remains $480',()=>{
 const expected={unexpected_patron:{back_calling:-450,repay_eli:-120,seed_evening:-350},vacancy:{one_day_studio:-350,shared_room:-180,independent_service:880},work_reset:{work_plan:0,jo_referral:650,community_pivot:400},repair_bill:{fix_together:-100,jo_toolkit:350,fund_repairs:-650}};
 for(const [event,amounts] of Object.entries(expected)){const g=prepared(event,{cash:10000,craft:8,skill:6,social:15,housing:1},{trust:3,support:true}),p=g.players[0];for(const [id,cash] of Object.entries(amounts))assert.equal(lifeChoices(p,g).find(c=>c.id.endsWith(':'+id)).preview.cash,cash,`${event}/${id}`);if(event==='repair_bill')assert.equal(repairHomeChoice(p,g,'paid').preview.cash,-480);}
 for(const [cash,grant] of [[0,1200],[2000,750],[10000,350]]){const g=prepared('unexpected_patron',{cash});assert.equal(g.players[0].life.receipts[0].effects.cash,grant);}
});
