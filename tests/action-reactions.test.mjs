import test from 'node:test';
import assert from 'node:assert/strict';
import {actions} from '../lib/game.ts';
import {actionReaction,activityReactionLines} from '../lib/action-reactions.ts';
test('every ordinary non-person activity has a short specific response',()=>{
 for(const a of actions){if(a.story)continue;assert.ok(activityReactionLines[a.id],a.id);const line=actionReaction({actionId:a.id});assert.ok(line,a.id);assert.match(line,/^You /);assert.ok(line.length<180);assert.doesNotMatch(line,/\bcomplete\b|\bSuccess\b|\+\d|\d+ (energy|joy|skill|social)/i);}
});
test('persistent counts produce first, familiarity, routine and custom with no adjacent repeated response',()=>{
 for(const actionId of Object.keys(activityReactionLines)){
  let previous='';
  for(let count=1;count<=100;count++){const line=actionReaction({actionId,count});assert.notEqual(line,previous,actionId+':'+count);assert.equal(line,actionReaction(JSON.parse(JSON.stringify({actionId,count}))));assert.ok(line.length<240);previous=line;}
  assert.equal(actionReaction({actionId,count:1}),activityReactionLines[actionId][0]);
  assert.match(actionReaction({actionId,count:2}),/familiar|before/);
  assert.match(actionReaction({actionId,count:4}),/rhythm|every step/);
  assert.match(actionReaction({actionId,count:7}),/routine|sequence/);
 }
});
test('dialogue responses have priority and malformed count does not fabricate past familiarity',()=>{
 assert.equal(actionReaction({actionId:'cafe_break',actorId:'mina',count:20}),null);
 for(const actionId of ['story_mina_1','cast:mina:help','cameo:bea:play'])assert.equal(actionReaction({actionId,count:4}),null);
 for(const count of [undefined,NaN,Infinity,-Infinity,0,-10])assert.equal(actionReaction({actionId:'cafe_break',count}),actionReaction({actionId:'cafe_break',count:1}));
 const input={actionId:'cafe_break',count:5};const copy=structuredClone(input);actionReaction(input);assert.deepEqual(input,copy);
});
test('world action categories use grounded physical or decision responses',()=>{
 for(const kind of ['travel','relocate','explore','food','work','language','tradeoff'])assert.ok(actionReaction({actionId:'world:example',kind,count:2}));
 assert.equal(actionReaction({actionId:'unknown-unreviewed'}),null);
 assert.match(actionReaction({actionId:'cafe_break'}),/sip/);
 assert.match(actionReaction({actionId:'maker_hobby'}),/blue feather/);
});
