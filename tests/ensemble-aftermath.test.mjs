import test from 'node:test';
import assert from 'node:assert/strict';
import {currentGame} from './current-fixture.mjs';
import {move} from '../lib/game.ts';
import {initializeEnsemble,getEnsembleView,ensembleMemberPlayers,ensembleMemberState,beginEnsembleMonth} from '../lib/ensemble-story.ts';
import {ensembleAftermath} from '../lib/ensemble-aftermath-content.ts';
import {ensembleById} from '../lib/ensemble-story-content.ts';
import {canonicalCharacterById} from '../lib/character-canon.ts';
import {proveNaturalRoute} from '../scripts/prove-ensemble-routes.mjs';

function room(names=['A']){const g=currentGame({names});initializeEnsemble(g);return g;}
function scene(g,id,index=g.turn){g.turn=index;const p=g.players[index],s=ensembleById[id];assert.equal(p.world.region,s.region);move(g,'visit',s.place);return getEnsembleView(g,p,id,s.place).scenes.find(s=>s.id===id);}
function main(g,id,option){scene(g,id);move(g,`ensemble:${id}:main:${option}:${g.ensemble.threads[id].beat}`);}
function pick(g,id,option){const c=scene(g,id).choices.find(c=>c.actionId.includes(`:aftermath:${option}:`));assert.ok(c?.available,c?.reason??option);move(g,c.actionId);return c;}

test('twenty distinct local follow-through definitions have finite stages and real branch conditions',()=>{
 assert.equal(ensembleAftermath.length,20);
 for(const a of ensembleAftermath){const s=ensembleById[a.storyId],source=ensembleById[a.sourceStoryId];assert.ok(s&&source);assert.notEqual(s.id,source.id);assert.equal(s.region,source.region);assert.equal(a.stages.length,3);assert.ok(a.sourceSignals.length);
  const before=[];let conditional=0;
  for(const stage of a.stages){assert.ok(stage.prompt.length>40);assert.ok(stage.choices.length>=2);for(const c of stage.choices){assert.ok(!before.includes(c.id),`${s.id}: duplicate ${c.id}`);assert.ok(c.afterChoices?.every(id=>before.includes(id))??true,`${s.id}: unknown earlier choice`);assert.ok(c.signals.every(signal=>signal.startsWith(`public_${s.id}_`)));assert.ok(c.time===0||c.time===1);assert.ok(Number.isFinite(c.cost??0)&&(c.cost??0)>=0);assert.ok(!c.paidHours,'No duplicate job claims');assert.equal(c.response.speakerId,s.cast[0]);assert.ok(canonicalCharacterById[c.response.speakerId].age>=18);if(c.sourceSignalsAny||c.sourceSignalsNone)conditional++;}before.push(...stage.choices.map(c=>c.id));}
  assert.ok(conditional>=2,`${s.id} has no opposing source-dependent options`);
 }
});

test('quiet-room versus comedy source changes the actual bakery alternatives',()=>{
 function alternative(last){const g=room();main(g,'late_loaf','normal');main(g,'late_loaf','name');main(g,'bracken','clarify');main(g,'bracken','rehearse');main(g,'bracken','plain');main(g,'bracken',last);move(g,'end');return scene(g,'late_loaf').choices.filter(c=>c.actionId.includes(':aftermath:'));}
 const quiet=alternative('respect'),comedy=alternative('ask');assert.ok(quiet.some(c=>c.actionId.includes(':quiet_collection:')));assert.ok(!quiet.some(c=>c.actionId.includes(':counter_collection:')));assert.ok(comedy.some(c=>c.actionId.includes(':counter_collection:')));assert.ok(!comedy.some(c=>c.actionId.includes(':quiet_collection:')));assert.ok(quiet.every(c=>c.cause.crossingId));
});

test('changed source rejects an old aftermath confirmation atomically',()=>{
 const g=room();main(g,'late_loaf','normal');main(g,'late_loaf','name');main(g,'bracken','clarify');move(g,'end');const old=scene(g,'late_loaf').choices.find(c=>c.actionId.includes(':aftermath:'));assert.ok(old);
 main(g,'bracken','plain');scene(g,'late_loaf');const before=JSON.stringify(g);assert.throws(()=>move(g,old.actionId),/no longer available/);assert.equal(JSON.stringify(g),before);
});

test('private aftermath paths remain independent, bounded and absent from another member’s projection',()=>{
 const g=room(['A','B']);for(let month=2;month<=5;month++){g.round=month;beginEnsembleMonth(g);}
 pick(g,'late_loaf','quiet_collection');scene(g,'late_loaf',1);pick(g,'late_loaf','no_instruction');
 assert.equal(g.players[0].ensemble.receipts.filter(r=>r.actionId.includes(':aftermath:')).length,1);assert.equal(g.players[1].ensemble.receipts.filter(r=>r.actionId.includes(':aftermath:')).length,1);
 g.round=6;beginEnsembleMonth(g);scene(g,'late_loaf',0);assert.ok(scene(g,'late_loaf').choices.some(c=>c.actionId.includes(':correct_review:')));assert.ok(!scene(g,'late_loaf').choices.some(c=>c.actionId.includes(':plain_review:')));pick(g,'late_loaf','correct_review');
 scene(g,'late_loaf',1);assert.ok(scene(g,'late_loaf').choices.some(c=>c.actionId.includes(':plain_review:')));pick(g,'late_loaf','no_review');
 g.round=8;beginEnsembleMonth(g);scene(g,'late_loaf',0);const cash=g.players[0].cash;const selected=pick(g,'late_loaf','fresh_plate');assert.equal(cash-g.players[0].cash,24);assert.ok(!scene(g,'late_loaf').choices.some(c=>c.actionId.includes(':aftermath:')));
 const after=JSON.stringify(g);move(g,selected.actionId);assert.equal(JSON.stringify(g),after);
 const publicState=ensembleMemberState(g,[g.players[1].id]),players=ensembleMemberPlayers(g.players,[g.players[1].id]);assert.equal(players[0].ensemble,undefined);assert.ok(publicState.events.filter(e=>e.actionId.includes(':aftermath:')).every(e=>e.actionId.includes(':public:')&&e.signals.every(signal=>signal.startsWith('public_')&&!signal.startsWith('after_'))));assert.ok(!g.log.some(line=>line.includes(selected.title)));
 assert.equal(g.ensemble.threads.bracken.flags.jonahPaidOccupancy,true);assert.equal(g.ensemble.orders.length,0,'A tasting plate is not a supper claim');
});

test('final-month arrival leaves a real affordable source-linked aftermath without restarting prevention',()=>{
 for(const month of [7,8]){const r=proveNaturalRoute('whaleskin',{arrivalMonth:month,choices:['inspect','accurate','context','separate'],sourceChoice:{storyId:'missing_shot',choice:'privacy'},aftermath:true});assert.equal(r.ending.flags.prevented,true);assert.equal(r.ending.flags.blockedRunoff,false);assert.equal(r.ending.aftermath,1);assert.ok(r.ending.blocks>=0);}
});

test('every late-unlocking regional thread has substantive follow-through after real month-seven/eight arrival',()=>{
 let cases=0;
 for(const a of ensembleAftermath.filter(a=>ensembleById[a.storyId].region!=='alder'))for(const month of [7,8]){
  const source=ensembleById[a.sourceStoryId],option=source.beats[0].choices.find(c=>c.time===0)??source.beats[0].choices[0];
  const r=proveNaturalRoute(a.storyId,{arrivalMonth:month,sourceChoice:{storyId:source.id,choice:option.id},aftermath:true});assert.equal(r.ending.aftermath,1,a.storyId);assert.ok(r.ending.month<=8);assert.ok(r.ending.blocks>=0);cases++;
 }
 assert.equal(cases,32);
});
