import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {currentGame} from './current-fixture.mjs';
import {move} from '../lib/game.ts';
import {initializeEnsemble,beginEnsembleMonth,afterEnsembleAction,getEnsembleView,resolveEnsembleChoice,ensembleMemberPlayers,ensembleMemberState,ensembleActionMetadata} from '../lib/ensemble-story.ts';
import {ensembleStories,ensembleById} from '../lib/ensemble-story-content.ts';
import {canonicalCharacterById} from '../lib/character-canon.ts';
import {economyPaidQuote,economyProfile} from '../lib/economy.ts';
import {familiarityView} from '../lib/action-familiarity.ts';

function room(names=['A']){const g=currentGame({names});initializeEnsemble(g);return g;}
function at(g,id,index=0){g.turn=index;const p=g.players[index],s=ensembleById[id];p.world.region=s.region;p.place=s.place;p.world.localeHistory[s.region].arrivals=Math.max(1,p.world.localeHistory[s.region].arrivals);afterEnsembleAction(g);if(!p.world.discoveredPlacesByRegion[s.region].includes(s.place))p.world.discoveredPlacesByRegion[s.region].push(s.place);return p;}
function open(g,id,beat=0){Object.assign(g.ensemble.threads[id],{status:'active',beat,readyMonth:g.round,dueMonth:g.round+1,openedMonth:g.round});}
function act(g,id,choice,kind='main',index=0){const p=at(g,id,index);move(g,['ensemble',id,kind,choice,g.ensemble.threads[id].beat].join(':'));return p.ensemble.receipts.at(-1);}
function view(g,id,index=0){return getEnsembleView(g,at(g,id,index),id).scenes.find(s=>s.id===id);}

test('20 stories resolve guide identities, places and props, with 3 anchors and 17 smaller arcs',()=>{
 const data=JSON.parse(readFileSync(new URL('../docs/manual/venues.json',import.meta.url)));
 const venues=data.venues??data;
 const items=JSON.parse(readFileSync(new URL('../docs/manual/items.json',import.meta.url))).items;
 assert.equal(ensembleStories.length,20);assert.equal(ensembleStories.filter(s=>s.beats.length===4).length,3);
 for(const s of ensembleStories){const v=venues.find(v=>v.id===s.venue);assert.ok(v,s.id);assert.equal(v.regionId,s.region);assert.equal(v.placeId,s.place);assert.ok(items.some(i=>i.id===s.object));assert.ok(s.cast.every(id=>canonicalCharacterById[id]));
  for(const b of s.beats)for(const c of b.choices){assert.ok(s.cast.includes(c.response.speakerId));assert.ok(c.response.speech.length>5);assert.ok(!/\(\$[1-4](?: wage)?\)/.test(c.label));assert.ok(!c.cost||c.cost>=6);if(c.paidHours)assert.ok(canonicalCharacterById[c.response.speakerId].age>=18);}
 }
 assert.equal(ensembleById.whaleskin.place,'TRANSIT');assert.equal(ensembleById.small_pause.object,'kestrel_breakfast_tea');assert.match(ensembleById.portrait.personal.outcome,/no portrait or appointment is promised/);
});
test('pure views cap local previews and start no setup behind an unvisited route',()=>{
 const g=room(['A','B','C','D']),before=JSON.stringify(g),v=getEnsembleView(g,g.players[0]);assert.ok(v.scenes.length<=3);assert.equal(JSON.stringify(g),before);
 const active=ensembleStories.filter(s=>g.ensemble.threads[s.id].status==='active');assert.equal(active.length,4);assert.deepEqual([...new Set(active.map(s=>s.region))],['alder']);assert.equal(g.ensemble.events.length,0);
});
test('Whaleskin prevention removes flood and heroic rescue without taking Tavi’s cover',()=>{
 const g=room();act(g,'whaleskin','inspect');assert.match(view(g,'whaleskin').heading,/working road/);assert.ok(!view(g,'whaleskin').choices.some(c=>c.actionId.includes(':accuse:')));
 act(g,'whaleskin','accurate');assert.ok(!view(g,'whaleskin').choices.some(c=>c.actionId.includes(':hero:')));act(g,'whaleskin','context');act(g,'whaleskin','separate');
 assert.equal(g.ensemble.threads.whaleskin.flags.blockedRunoff,false);assert.equal(g.ensemble.threads.whaleskin.flags.coverOwnedByTavi,true);
});
test('unprevented Whaleskin produces investigation, misleading crop and a causal evidence option',()=>{
 const g=room();act(g,'whaleskin','reuse');act(g,'whaleskin','accuse');assert.equal(g.ensemble.threads.whaleskin.flags.blockedRunoff,true);
 const x=g.ensemble.crossings.find(c=>c.ruleId==='queue_question');assert.ok(x);assert.deepEqual(x.originPlayers,[g.players[0].id]);act(g,'whaleskin','hero');assert.ok(g.ensemble.crossings.some(c=>c.ruleId==='hero_poster'));
});
test('Dalloway accurate credits change employment branch and preserve June’s bell and cooking',()=>{
 const g=room();act(g,'dalloway','correct');act(g,'dalloway','full');assert.ok(!view(g,'dalloway').choices.some(c=>c.actionId.includes(':split:')));
 for(const f of ['bellAtPass','juneOwnsBell','juneRemainsCook'])assert.equal(g.ensemble.threads.dalloway.flags[f],true);
});
test('Bracken early clarification removes the camera confrontation but protects Jonah’s occupancy',()=>{
 const g=room();act(g,'bracken','clarify');act(g,'bracken','rehearse');assert.ok(!view(g,'bracken').choices.some(c=>c.actionId.includes(':versions:')));
 for(const f of ['jonahPaidOccupancy','nellOwnsDrumAndDuvet','drumAtRehearsal','separateLodging'])assert.equal(g.ensemble.threads.bracken.flags[f],true);
});
test('separate payer refunds preserve a completed worker’s pay and withdraw unclaimed dependent work',()=>{
 const g=room(['Payer','Worker','Other']);act(g,'dalloway','book');open(g,'empty_counter');const worker=at(g,'empty_counter',1),cash=worker.cash;
 assert.ok(g.ensemble.crossings.find(c=>c.ruleId==='supper_jobs'));const work=act(g,'empty_counter','supper_jobs','response',1);assert.equal(work.paidHours,4);
 act(g,'dalloway','own_part','personal',2);open(g,'dalloway',3);const other=view(g,'dalloway',2).choices.filter(c=>c.actionId.includes(':refund:'));assert.equal(other.length,1);assert.match(other[0].title,/\$30/);
 const payer=at(g,'dalloway'),refund=view(g,'dalloway').choices.find(c=>c.actionId.includes(':refund:')),before=payer.cash;move(g,refund.actionId);assert.equal(payer.cash-before,120);assert.equal(worker.cash,cash+work.cash);
 assert.equal(g.ensemble.orders.find(o=>o.payerId===payer.id).absorbedWages,88);assert.equal(g.ensemble.orders.find(o=>o.payerId===g.players[2].id).status,'paid');assert.equal(g.ensemble.crossings.find(c=>c.ruleId==='supper_crate').withdrawn,true);assert.equal(g.ensemble.threads.dalloway.beat,3);
});
test('a private loaf never creates café stock; a separately paid batch does',()=>{
 const g=room();open(g,'late_loaf');act(g,'late_loaf','normal');act(g,'late_loaf','own_part','personal');assert.ok(!g.ensemble.events.some(e=>e.signals.includes('cafe_bread_order')));
 const h=room();open(h,'late_loaf');act(h,'late_loaf','reserve');assert.ok(h.ensemble.events.some(e=>e.signals.includes('cafe_bread_order')));
});
test('pay uses current regional rates, capped work hours and recovery deductions; rejection is atomic',()=>{
 const g=room();open(g,'extra_run',1);const p=at(g,'extra_run');p.finance.recovering=true;p.finance.arrears=1000;const choice=view(g,'extra_run').choices.find(c=>c.actionId.includes(':bounded:'));assert.match(choice.previewText.join(' '),/4 paid hours/);
 p.economyWork={round:1,paidHours:198};const before=JSON.stringify(g);assert.throws(()=>move(g,choice.actionId),/Only 2 paid hours/);assert.equal(JSON.stringify(g),before);
 p.economyWork.paidHours=190;const q=economyPaidQuote(p,g,4*economyProfile(p,'pelagia').entryRate,4),cash=p.cash,arrears=p.finance.arrears,r=act(g,'extra_run','bounded');assert.equal(p.cash-cash,q.cash);assert.equal(arrears-p.finance.arrears,q.repayment);assert.equal(r.cash,q.cash);assert.equal(p.economyWork.paidHours,194);assert.throws(()=>economyPaidQuote(p,g,NaN,4),/Invalid/);
});
test('wrong player, stale beat, insufficient cash and wrong town cannot mutate a story',()=>{
 const g=room(['A','B']);open(g,'extra_run');const p=at(g,'extra_run'),id='ensemble:extra_run:main:small:0',before=JSON.stringify(g);assert.throws(()=>resolveEnsembleChoice(g,g.players[1],id),/active player/);assert.equal(JSON.stringify(g),before);
 p.cash=0;const b=JSON.stringify(g);assert.throws(()=>move(g,id),/enough cash/);assert.equal(JSON.stringify(g),b);p.cash=500;move(g,id);const after=JSON.stringify(g);move(g,id);assert.equal(JSON.stringify(g),after);assert.throws(()=>move(g,'ensemble:extra_run:main:repeat:0'),/moment has passed/);assert.equal(JSON.stringify(g),after);
 p.world.region='alder';assert.throws(()=>move(g,'ensemble:extra_run:personal:own_part:1'),/Travel/);
});
test('confirmed person replies and familiarity happen once, never during previews or replay',()=>{
 const g=room(),p=at(g,'bracken'),id='ensemble:bracken:main:clarify:0';assert.equal(ensembleActionMetadata(g,p,id).actorId,'nell_harper');move(g,id);
 const r=p.ensemble.receipts.at(-1);assert.equal(r.response.speakerId,'nell_harper');assert.match(r.response.speech,/sleeping/);assert.equal(familiarityView(p,{actorId:'nell_harper'}).count,1);move(g,id);assert.equal(familiarityView(p,{actorId:'nell_harper'}).count,1);
});
test('NPC progress cannot invent a player’s wage, memory, presence or causal contribution',()=>{
 const g=room(['A','B']),before=g.players.map(p=>({cash:p.cash,hours:p.hours}));for(let m=2;m<=8;m++){g.round=m;beginEnsembleMonth(g);}
 assert.ok(g.ensemble.events.length>=10);assert.ok(g.ensemble.events.every(e=>ensembleById[e.storyId].region==='alder'));assert.equal(g.ensemble.threads.whaleskin.status,'queued');assert.ok(g.ensemble.events.every(e=>e.actor.kind==='npc'&&e.originPlayers.length===0));assert.ok(g.ensemble.events.every(e=>!/\b(?:you|your)\b/i.test(e.text)));assert.ok(g.players.every((p,i)=>!p.ensemble.receipts.length&&p.cash===before[i].cash&&p.hours===before[i].hours));
});
test('each of four players can make a separate purchase after the first shared choice',()=>{
 const g=room(['A','B','C','D']);act(g,'dalloway','correct');for(let i=0;i<4;i++){const p=at(g,'dalloway',i),cash=p.cash,c=view(g,'dalloway',i).choices.find(c=>c.actionId.includes(':personal:'));assert.ok(c.available);move(g,c.actionId);assert.equal(cash-p.cash,30);}
 assert.equal(g.ensemble.orders.length,4);assert.equal(new Set(g.ensemble.orders.map(o=>o.payerId)).size,4);
});
test('member projection hides private receipts and other payment amounts without altering saved state',()=>{
 const g=room(['A','B']);act(g,'dalloway','book');act(g,'dalloway','own_part','personal',1);const [a,b]=g.players,safe=ensembleMemberPlayers(g.players,[a.id]),pub=ensembleMemberState(g,[a.id]);assert.ok(safe[0].ensemble);assert.equal(safe[1].ensemble,undefined);assert.equal(pub.orders.find(o=>o.payerId===b.id).amount,0);assert.equal(g.ensemble.orders.find(o=>o.payerId===b.id).amount,30);assert.equal(getEnsembleView({...g,players:safe},safe[1]).scenes.length,0);
});
test('actual responses inherit source-player provenance; evidence is not an order or an observation',()=>{
 const g=room(['A','B']);act(g,'whaleskin','inspect');open(g,'extra_run');const p=at(g,'extra_run',1),c=view(g,'extra_run',1).choices.find(c=>c.actionId.includes(':safe_groceries:'));assert.ok(c);assert.equal(c.cause.actor,'A');const before=JSON.stringify(g);getEnsembleView(g,p);assert.equal(JSON.stringify(g),before);move(g,c.actionId);
 const e=g.ensemble.events.at(-1);assert.deepEqual(new Set(e.originPlayers),new Set(g.players.map(p=>p.id)));assert.equal(g.ensemble.orders.length,0);assert.ok(!e.signals.includes('grocery_order'));
});
test('arriving in another town reveals its actual live story destinations',()=>{
 const g=room();g.players[0].world.region='saffron';g.players[0].world.localeHistory.saffron.arrivals=1;afterEnsembleAction(g);assert.ok(g.players[0].world.discoveredPlacesByRegion.saffron.includes('CINEMA'));
});
test('all authored non-refund main alternatives execute through the current dispatcher',()=>{
 let count=0;for(const s of ensembleStories)for(let bi=0;bi<s.beats.length;bi++)for(const c of s.beats[bi].choices){if(c.id==='refund')continue;const g=room();open(g,s.id,bi);at(g,s.id).cash=10000;const r=act(g,s.id,c.id);assert.equal(r.response.speakerId,s.cast[0]);assert.equal(g.ensemble.threads[s.id].beat,bi+1);count++;}assert.equal(count,137);
});

test('multiplayer two-main-beat cap leaves current consequential choices for another seat',()=>{
 const g=room(['A','B','Quiet','Later']);act(g,'whaleskin','inspect');act(g,'whaleskin','accurate');
 const capped=view(g,'whaleskin');assert.match(capped.next,/two main parts/);const blocked=capped.choices.find(c=>c.actionId.includes(':main:context:'));assert.equal(blocked.available,false);assert.match(blocked.reason,/next month/);
 const before=JSON.stringify(g);assert.throws(()=>move(g,blocked.actionId),/two main parts/);assert.equal(JSON.stringify(g),before);
 const b=view(g,'whaleskin',1);assert.ok(b.choices.find(c=>c.actionId.includes(':main:context:')).available);assert.ok(!b.choices.some(c=>c.actionId.includes(':hero:')));
 act(g,'whaleskin','context','main',1);act(g,'whaleskin','separate','main',1);assert.equal(g.ensemble.threads.whaleskin.status,'settled');assert.equal(g.ensemble.threads.whaleskin.flags.prevented,true);
 assert.deepEqual(g.ensemble.events.filter(e=>e.actionId.includes(':main:')).map(e=>e.actor.id),[g.players[0].id,g.players[0].id,g.players[1].id,g.players[1].id]);assert.equal(g.players[2].ensemble.receipts.length,0);
});
test('arrival and reentry never rewind a setup; unanswered opened scenes move on monthly',()=>{
 const g=room();act(g,'whaleskin','inspect');const t=g.ensemble.threads.whaleskin,opened=t.openedMonth,due=t.dueMonth;
 at(g,'bracken');at(g,'whaleskin');assert.equal(t.beat,1);assert.equal(t.openedMonth,opened);assert.equal(t.dueMonth,due);
 move(g,'end');assert.equal(t.beat,2);assert.equal(t.flags.prevented,true);assert.equal(t.flags.blockedRunoff,false);const npc=g.ensemble.events.filter(e=>e.storyId==='whaleskin'&&e.actor.kind==='npc');assert.equal(npc.length,1);
 beginEnsembleMonth(g);assert.equal(t.beat,2);assert.equal(g.ensemble.events.filter(e=>e.storyId==='whaleskin'&&e.actor.kind==='npc').length,1);
});
test('rapid main progression preserves separate unserved tickets and refund rights',()=>{
 const g=room(['A','B']);act(g,'dalloway','book');act(g,'dalloway','june');act(g,'dalloway','split','main',1);
 const payer=view(g,'dalloway',0),refund=payer.choices.find(c=>c.actionId.includes(':refund:'));assert.ok(refund.available);const before=g.players[0].cash;move(g,refund.actionId);assert.equal(g.players[0].cash-before,120);assert.equal(g.ensemble.threads.dalloway.beat,3);assert.equal(g.ensemble.orders[0].status,'refunded');
});
test('opening a scene does not pretend an option has already been previewed',()=>{
 const component=readFileSync(new URL('../app/ensemble-story.tsx',import.meta.url),'utf8');assert.ok(component.includes('preview={previewChoice ?? null}'));
});

test('paid ensemble gigs credit only the explicit field once, including after reload',()=>{
 const g=room();open(g,'extra_run',1);const p=at(g,'extra_run');const c=view(g,'extra_run').choices.find(c=>c.actionId.includes(':bounded:'));
 assert.equal(ensembleActionMetadata(g,p,c.actionId).workField,'practical');move(g,c.actionId);assert.equal(p.career.experience.practical.paidHours,4);assert.ok(p.career.milestones.includes('practical:first-work'));assert.deepEqual(p.career.leads,{});
 const saved=structuredClone(g),before=JSON.stringify(saved);move(saved,c.actionId);assert.equal(JSON.stringify(saved),before);assert.equal(saved.players[0].career.experience.practical.paidHours,4);
 const h=room(),q=at(h,'bracken');act(h,'bracken','boundary');assert.deepEqual(q.career.experience,{});assert.deepEqual(q.career.leads,{});
 const invalid=room();open(invalid,'extra_run',1);const worker=at(invalid,'extra_run');worker.hours=0;assert.throws(()=>act(invalid,'extra_run','bounded'),/enough time/);assert.deepEqual(worker.career.experience,{});
});
