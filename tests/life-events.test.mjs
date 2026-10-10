import assert from 'node:assert/strict';
import {initializeLife,initializeLifePlayer,beginLifeWeek,getLifeEvent,lifeChoices,resolveLifeChoice,deferLifeChoice,repairChoice,repairRelationship,relationshipViews,recordLifeStory,lifeEventIds,lifeOpportunityIds,lifeNpcs,repairHomeChoice,repairHome,afterLifeAction} from '../lib/life-events.ts';
const player=(i=0)=>({id:`p${i}`,name:`Player ${i}`,cash:1100,skill:0,job:0,joy:40,energy:70,hours:6,social:0,housing:0,place:'APARTMENTS',rulesVersion:2,craft:0,legacy:0,stories:{},storyWeeks:{}});
const game=(n=2,version=1)=>({code:'LIFE01',mode:'hotseat',host:'host',members:{host:['p0']},players:Array.from({length:n},(_,i)=>player(i)),status:'playing',round:1,turn:0,maxRounds:8,log:[],seen:[],event:0,rulesVersion:2,...(version===undefined?{}:{lifeVersion:version})});
const prepared=(event,patch={},relationPatch={})=>{const g=game(1);initializeLife(g,42);Object.assign(g.players[0],patch);for(const npc of lifeNpcs)Object.assign(g.players[0].life.relationships[npc],relationPatch);g.round=2;g.lifeSchedule=[{week:2,eventId:event}];beginLifeWeek(g);return g;};
const resources=['cash','hours','energy','joy','skill','social','craft','job','housing','legacy'];
const assertDelta=(p,before,preview,where)=>{
 for(const key of resources)assert.equal(p[key]??0,(before[key]??0)+preview[key],`${where}: ${key}`);
 for(const npc of lifeNpcs)assert.equal(p.life.relationships[npc].trust,before.life.relationships[npc].trust+preview.trust[npc],`${where}: ${npc} trust`);
 for(const d of preview.relationshipChanges)for(const k of ['support','rivalry','reciprocity'])if(d[k]!==undefined)assert.equal(p.life.relationships[d.npc][k],d[k],`${where}: ${d.npc}/${k}`);
 for(const flag of preview.flagsAdded)assert.ok(p.life.flags.includes(flag));for(const flag of preview.flagsRemoved)assert.ok(!p.life.flags.includes(flag));
 for(const [key,max]of Object.entries({hours:6,energy:100,joy:100,skill:6,craft:8,job:3,housing:1,legacy:10}))assert.ok(p[key]>=0&&p[key]<=max,`${where}: ${key} bounds`);
 for(const npc of lifeNpcs)assert.ok(p.life.relationships[npc].trust>=-3&&p.life.relationships[npc].trust<=3);
};
// Existing saves do not grow any fields, roll schedules, mutate resources, or expose event UI.
for(const v of [0,2,undefined]){
 const g=game(1,v);if(v===undefined)delete g.lifeVersion;const before=JSON.stringify(g);initializeLife(g,1);beginLifeWeek(g);deferLifeChoice(g,g.players[0]);recordLifeStory(g,g.players[0],'mina',1);assert.deepEqual(lifeChoices(g.players[0],g),[]);assert.deepEqual(relationshipViews(g.players[0]),[]);assert.equal(getLifeEvent(g.players[0],g),null);assert.equal(repairChoice(g.players[0],g,'mina').available,false);assert.throws(()=>repairRelationship(g,g.players[0],'mina'));assert.equal(JSON.stringify(g),before);
}
// Seed is server input; seven unique events are fixed for weeks 2–8 and serialize intact.
const orders=new Set();for(let seed=0;seed<40;seed++){
 const a=game(),b=game();initializeLife(a,seed);initializeLife(b,seed);assert.deepEqual(a.lifeSchedule,b.lifeSchedule);assert.deepEqual(a.lifeSchedule.map(e=>e.week),[2,3,4,5,6,7,8]);assert.equal(new Set(a.lifeSchedule.map(e=>e.eventId)).size,7);orders.add(a.lifeSchedule.map(e=>e.eventId).join(','));const positive=a.lifeSchedule.filter(e=>lifeOpportunityIds.includes(e.eventId)).length;assert.ok(positive>=2&&positive<=3);assert.ok(!a.lifeSchedule.map(e=>lifeOpportunityIds.includes(e.eventId)?'1':'0').join('').includes('000'));const before=JSON.stringify(a);initializeLife(a,999);assert.equal(JSON.stringify(a),before);assert.deepEqual(JSON.parse(JSON.stringify(a)),a);
}assert.ok(orders.size>25);
// Every auto impact, valid response and clamp matches the exact displayed resource/trust preview.
let routes=0,blocked=0,previews=0;const covered=new Set();
const profiles=[{}, {cash:0,energy:0,hours:0,joy:0}, {cash:-80,energy:0,hours:0,joy:0}, {cash:40,energy:4,hours:1}, {cash:5000,skill:6,job:3,craft:8,social:15,housing:1,joy:100,energy:100,legacy:10}, {cash:5000,skill:4,job:2,craft:5,social:8,housing:0}, {cash:5000,skill:2,job:1,craft:2,social:4,housing:1}];
const relationships=[{}, {trust:3,support:true,reciprocity:true}, {trust:-3,rivalry:true}, {trust:2,support:true,rivalry:true}];
for(const event of lifeEventIds)for(const profile of profiles)for(const rel of relationships){
 const g=prepared(event,profile,rel),p=g.players[0],r=getLifeEvent(p,g);assert.equal(r.eventId,event);assert.ok(r.effects.cash>=-350);assert.ok(r.effects.cash>=-Math.max(0,profile.cash??1100));assert.equal(r.effects.hours,0,'Automatic events never spend this week’s time');
 const unchanged=JSON.stringify(g);const options=lifeChoices(p,g);relationshipViews(p);repairChoice(p,g,'mina');assert.equal(JSON.stringify(g),unchanged,'All render helpers are pure');previews+=options.length;
 const fallback=options.find(c=>c.safe);assert.ok(fallback.available,'Every event always has a safe zero-resource fallback');assert.ok(fallback.preview.hours===0&&fallback.preview.cash>=0&&fallback.preview.energy>=0);
 for(const c of options){
  const copy=structuredClone(g),q=copy.players[0],before=structuredClone(q),snapshot=JSON.stringify(copy);
  if(!c.available){assert.throws(()=>resolveLifeChoice(copy,q,c.id));assert.equal(JSON.stringify(copy),snapshot,'Denied action is atomic');blocked++;continue;}
  resolveLifeChoice(copy,q,c.id);assertDelta(q,before,c.preview,`${event}/${c.id}`);assert.equal(getLifeEvent(q,copy).pending,false);assert.equal(getLifeEvent(q,copy).resolved.outcome,c.outcome);const done=JSON.stringify(copy);resolveLifeChoice(copy,q,c.id);assert.equal(JSON.stringify(copy),done,'Same choice retry is idempotent');const other=options.find(o=>o.id!==c.id);assert.throws(()=>resolveLifeChoice(copy,q,other.id));assert.equal(JSON.stringify(copy),done,'A different second choice cannot spend anything');routes++;covered.add(`${event}/${c.id.split(':').at(-1)}`);
 }
 const copy=structuredClone(g),q=copy.players[0],before=structuredClone(q);deferLifeChoice(copy,q);assertDelta(q,before,fallback.preview,`${event}/end-week`);assert.equal(getLifeEvent(q,copy).resolved.deferred,true);const deferred=JSON.stringify(copy);deferLifeChoice(copy,q);assert.equal(JSON.stringify(copy),deferred);
}
assert.equal(covered.size,40,'All authored choice branches are reachable in legal state');
// beginLifeWeek applies to the whole table once, and reload cannot re-trigger an impact.
for(const count of [1,2,3,4]){
 const g=game(count);initializeLife(g,66);beginLifeWeek(g);assert.ok(g.players.every(p=>p.life.receipts.length===0));
 for(let week=2;week<=8;week++){g.round=week;beginLifeWeek(g);const saved=JSON.stringify(g);beginLifeWeek(g);assert.equal(JSON.stringify(g),saved);const reload=JSON.parse(saved);beginLifeWeek(reload);assert.equal(JSON.stringify(reload),saved);for(const p of g.players)assert.equal(p.life.receipts.length,week-1);}
}
// Shared events vary materially by career, social, craft, housing and cash, without deleting earned skills.
{
 const g=game(4);initializeLife(g,1);Object.assign(g.players[0],{job:3,skill:6});Object.assign(g.players[1],{craft:5});Object.assign(g.players[2],{social:10});Object.assign(g.players[3],{housing:1});g.round=2;g.lifeSchedule=[{week:2,eventId:'work_reset'}];beginLifeWeek(g);assert.equal(g.players[0].job,2);assert.equal(g.players[0].skill,6);assert.equal(g.players[1].job,0);assert.notEqual(g.players[0].life.receipts[0].effects.cash,g.players[1].life.receipts[0].effects.cash);
 for(const event of ['venue_lost','repair_bill','garden_setback','commission_dispute'])assert.notDeepEqual(getLifeEvent(prepared(event,{craft:5,cash:5000}).players[0],{...g,round:2}).effects,getLifeEvent(prepared(event,{housing:1,social:10,cash:5000}).players[0],{...g,round:2}).effects);
 assert.notEqual(prepared('crossroads',{cash:200}).players[0].life.receipts[0].effects.cash,prepared('crossroads',{cash:2000}).players[0].life.receipts[0].effects.cash);
}
// A spent week or cash shortage never auto-selects an expensive route. Forged/stale IDs are rejected.
{
 const g=prepared('repair_bill',{cash:0,hours:0,energy:0});const p=g.players[0],before=JSON.stringify(g);assert.throws(()=>resolveLifeChoice(g,p,'fund_repairs'));assert.equal(JSON.stringify(g),before);assert.throws(()=>resolveLifeChoice(g,{...p},lifeChoices(p,g)[0].id));assert.equal(JSON.stringify(g),before);
 const selected=lifeChoices(p,g).find(c=>c.safe);resolveLifeChoice(g,p,selected.id);g.round=3;g.lifeSchedule.push({week:3,eventId:'venue_lost'});beginLifeWeek(g);const next=JSON.stringify(g);resolveLifeChoice(g,p,selected.id);assert.equal(JSON.stringify(g),next);assert.ok(getLifeEvent(p,g).pending,'Retry never resolves the next week');
}
// Trust, support, rivalry and reciprocity materially change later routes and survive save/reload.
{
 const g=prepared('commission_dispute',{craft:5,cash:5000},{trust:2,support:true}),p=g.players[0];resolveLifeChoice(g,p,lifeChoices(p,g).find(c=>c.id.endsWith(':solo_sale')).id);assert.equal(p.life.relationships.jo.rivalry,true);
 g.round=3;p.hours=6;p.energy=100;g.lifeSchedule.push({week:3,eventId:'work_reset'});beginLifeWeek(g);assert.equal(lifeChoices(p,g).find(c=>c.id.endsWith(':jo_referral')).available,false);const repair=repairChoice(p,g,'jo'),before=structuredClone(p);repairRelationship(g,p,'jo');assertDelta(p,before,repair.preview,'repair');assert.equal(p.life.relationships.jo.rivalry,false);assert.ok(lifeChoices(p,g).find(c=>c.id.endsWith(':jo_referral')).available);const once=JSON.stringify(g);assert.throws(()=>repairRelationship(g,p,'jo'));assert.equal(JSON.stringify(g),once);
 resolveLifeChoice(g,p,lifeChoices(p,g).find(c=>c.id.endsWith(':jo_referral')).id);assert.equal(p.life.relationships.jo.reciprocity,true);assert.deepEqual(relationshipViews(JSON.parse(JSON.stringify(p))),relationshipViews(p));
 g.round=4;p.hours=6;p.energy=100;g.lifeSchedule.push({week:4,eventId:'crossroads'});beginLifeWeek(g);assert.ok(lifeChoices(p,g).find(c=>c.id.endsWith(':return_favor')).available);resolveLifeChoice(g,p,lifeChoices(p,g).find(c=>c.id.endsWith(':return_favor')).id);assert.equal(p.life.relationships.jo.reciprocity,false);
}
// Repair remains possible at very low trust; optional story progression is idempotent and clamped.
{
 const g=prepared('venue_lost',{}, {trust:-3,rivalry:true}),p=g.players[0];for(let week=2;week<=5;week++){g.round=week;p.hours=6;const c=repairChoice(p,g,'mina'),before=structuredClone(p);assert.ok(c.available);repairRelationship(g,p,'mina');assertDelta(p,before,c.preview,`repair/${week}`);}assert.equal(p.life.relationships.mina.trust,1);assert.ok(p.life.relationships.mina.support);for(let stage=1;stage<=3;stage++){recordLifeStory(g,p,'eli',stage);const before=JSON.stringify(g);recordLifeStory(g,p,'eli',stage);assert.equal(JSON.stringify(g),before);}assert.ok(p.life.relationships.eli.support);assert.equal(p.life.relationships.eli.rivalry,false);
}
// No gameplay resolution or read may reroll randomness after the seeded schedule is created.
{
 const g=prepared('venue_lost');const original=Math.random;Math.random=()=>{throw Error('Unexpected gameplay randomness');};try{lifeChoices(g.players[0],g);relationshipViews(g.players[0]);beginLifeWeek(g);deferLifeChoice(g,g.players[0]);}finally{Math.random=original;}
}
console.log(`PASS: ${previews} pure previews, ${routes} legal choice outcomes, ${blocked} atomic denied routes, all 40 branches, 40 seeded schedules, 1–4 player idempotent lifecycle, bounded losses, repair and persistent relationship callbacks, legacy untouched.`);

// Home repair is never permanently locked by taking the free event fallback.
for(const method of ['paid','diy']){
 const g=prepared('repair_bill',{cash:5000,craft:5}),p=g.players[0];deferLifeChoice(g,p);g.round=3;p.hours=6;
 if(method==='diy')p.cash=-50;
 const before=structuredClone(p),snapshot=JSON.stringify(g),c=repairHomeChoice(p,g,method);assert.equal(JSON.stringify(g),snapshot);assert.ok(c.available);repairHome(g,p,method);assertDelta(p,before,c.preview,`home repair/${method}`);assert.ok(!p.life.flags.includes('repairs_unfinished'));assert.equal(p.craft,5);assert.ok(!repairHomeChoice(p,g,method).available);const after=JSON.stringify(g);assert.throws(()=>repairHome(g,p,method));assert.equal(JSON.stringify(g),after);
}
{
 const g=prepared('repair_bill',{cash:0,hours:0}),p=g.players[0],before=JSON.stringify(g);assert.equal(repairHomeChoice(p,g,'paid').available,false);assert.equal(repairHomeChoice(p,g,'diy').available,false);assert.throws(()=>repairHome(g,p,'diy'));assert.equal(JSON.stringify(g),before);
}
{
 const g=game(1);initializeLife(g,1);const p=g.players[0];afterLifeAction(g,p,'campus_tutor');afterLifeAction(g,p,'campus_tutor');assert.equal(p.life.activityCounts.campus_tutor,2);afterLifeAction(g,p,'story_mina_1');assert.equal(p.life.relationships.mina.trust,1);
}
console.log('PASS: 2–3 surprise opportunities per campaign, no 3 setbacks in a row, persistent paid/free repair recovery, and optional successful-action counter hook.');
