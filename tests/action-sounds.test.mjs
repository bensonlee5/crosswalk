import test from 'node:test';
import assert from 'node:assert/strict';
import {actions,move} from '../lib/game.ts';
import {beginLifeWeek,lifeChoices} from '../lib/life-events.ts';
import {arriveStoryWeek,getStoryView} from '../lib/story-arcs.ts';
import {worldChoices} from '../lib/world-life.ts';
import {careerChoices} from '../lib/careers.ts';
import {actionSound,activitySounds,clockSound} from '../lib/action-sounds.ts';
import {FOLEY_FILES} from '../lib/foley.ts';
import {currentGame} from './current-fixture.mjs';

const fixture=()=>{const g=currentGame({names:['Listener']});return {g,p:g.players[0]};};
function commit(g,p,action){
 const before=structuredClone(p);
 move(g,action);
 return {before,after:structuredClone(p)};
}
function storyChoice(g,p,key){
 const scene=getStoryView(g,p).scenes[0];assert.ok(scene);
 p.place=scene.spot;
 const choice=getStoryView(g,p).scenes[0].choices.find(c=>c.id.startsWith(key+'~'));
 assert.ok(choice,key);assert.equal(choice.available,true,choice.reason);
 return `story:${scene.id}:${choice.id}`;
}

test('every current ordinary activity has an explicitly reviewed cue or intentional silence',()=>{
 assert.equal(actions.length,38);
 assert.deepEqual(Object.keys(activitySounds).sort(),actions.map(a=>a.id).sort());
 for(const cue of Object.values(activitySounds))assert.ok(cue===null||FOLEY_FILES[cue]);
});

test('physical actions use faithful recordings regardless of benefit category',()=>{
 const {p}=fixture(),spent={...structuredClone(p),hours:p.hours-1};
 const cases={cafe_break:'sip',friends:'sip',home_meal:'cook',market_cook:'cook',park_read:'pageTurn',library_read:'pageTurn',library_club:'pageTurn',maker_repair:'repair',rest:'footsteps'};
 for(const [id,cue]of Object.entries(cases)){
  assert.ok(actions.some(a=>a.id===id),id+' is a current activity');
  assert.equal(actionSound('move',id,p,spent),cue,id);
  assert.equal(actionSound('move',id,p,{...spent,legacy:3,cash:p.cash+650}),cue,'reward does not replace '+id);
  assert.equal(actionSound('move',id,p,p),null,'unchanged '+id+' remains quiet');
 }
 assert.equal(actionSound('move','visit',p,{...p,place:'THE PARK'}),'footsteps');
 assert.equal(actionSound('move','visit',p,p),null);
});

test('unknown and ambiguous activities are quiet, never inferred from stats or names',()=>{
 const {p}=fixture(),spent={...structuredClone(p),hours:p.hours-1};
 for(const id of ['maker_hobby','garden_project','move','park_run','transit_scenic','market_taste','new_action','repair:jo','cast:2:jo:repair','motive:2:jo:tag:repair','aspire:creative','world:2:1:4:food','world:2:1:4:travel:saffron']){
  assert.equal(actionSound('move',id,p,{...spent,skill:3,legacy:9,energy:80,social:4}),null,id);
 }
 assert.equal(actionSound('poll','cafe_break',p,spent),null);
 assert.equal(actionSound('move','cafe_break',p,{...spent,id:'other'}),null);
});

test('a current repair event requires an exact new receipt and actual hands-on work',()=>{
 const {g,p}=fixture();g.round=4;g.lifeSchedule=[{week:4,eventId:'repair_bill'}];p.craft=2;beginLifeWeek(g);
 const choice=lifeChoices(p,g).find(c=>c.id.endsWith(':fix_together'));assert.ok(choice);assert.equal(choice.available,true,choice.reason);
 const action='event:'+choice.id,{before,after}=commit(g,p,action);
 assert.equal(actionSound('move',action,before,after),'repair');
 assert.equal(actionSound('move',action,{...after,hours:before.hours},after),null,'replayed receipt is quiet even if another action consumed time');
 assert.equal(actionSound('move',action,before,{...after,life:{...after.life,receipts:[]}}),null);
 const deferred=structuredClone(after);deferred.life.receipts.find(r=>r.resolved?.choiceId===choice.id).resolved.deferred=true;
 assert.equal(actionSound('move',action,before,deferred),null);
 const paid=fixture();paid.g.round=4;paid.g.lifeSchedule=[{week:4,eventId:'repair_bill'}];beginLifeWeek(paid.g);
 const paidChoice=lifeChoices(paid.p,paid.g).find(c=>c.id.endsWith(':fund_repairs'));assert.ok(paidChoice);
 const payment=commit(paid.g,paid.p,'event:'+paidChoice.id);
 assert.equal(actionSound('move','event:'+paidChoice.id,payment.before,payment.after),null,'paying without doing a repair stays quiet');
});

test('current shared story receipts distinguish physical work from backing an agreed plan',()=>{
 const g=currentGame({names:['Maker','Supporter']}),p=g.players[0];g.round=4;arriveStoryWeek(g);
 const action=storyChoice(g,p,'repair_first'),{before,after}=commit(g,p,action);
 assert.equal(actionSound('move',action,before,after),'repair');
 assert.equal(actionSound('move',action,{...after,hours:before.hours},after),null);
 const missing=structuredClone(after);missing.story.receipts=missing.story.receipts.filter(r=>r.sceneId!=='quay-friction');
 assert.equal(actionSound('move',action,before,missing),null);
 g.turn=1;const supporter=g.players[1],backing=storyChoice(g,supporter,'repair_first'),supported=commit(g,supporter,backing);
 assert.equal(supported.after.hours,supported.before.hours);
 assert.equal(actionSound('move',backing,supported.before,supported.after),null,'backing an existing shared decision does not repair it again');
 const poster=fixture();poster.g.round=2;arriveStoryWeek(poster.g);
 const credit=storyChoice(poster.g,poster.p,'shared_credit'),written=commit(poster.g,poster.p,credit);
 assert.equal(actionSound('move',credit,written.before,written.after),'write');
});

test('current household repair actions keep their explicit repair cue',()=>{
 for(const method of ['paid','diy']){
  const {g,p}=fixture();p.life.flags.push('repairs_unfinished');p.craft=2;
  const action='home_repair:'+method,{before,after}=commit(g,p,action);
  assert.equal(actionSound('move',action,before,after),'repair');
  assert.equal(actionSound('move',action,after,after),null);
 }
});

test('world exploration uses its current receipt token, while transit travel stays quiet',()=>{
 const {g,p}=fixture(),choice=worldChoices(p,g).find(c=>c.key==='explore');assert.ok(choice);assert.equal(choice.available,true,choice.reason);
 assert.match(choice.id,/^\d+:\d+:\d+:explore$/);
 const action='world:'+choice.id,{before,after}=commit(g,p,action);
 assert.equal(actionSound('move',action,before,after),'footsteps');
 assert.equal(actionSound('move',action,{...after,hours:before.hours},after),null);
 assert.equal(actionSound('move',action,before,{...after,world:{...after.world,acceptedChoices:[]}}),null);
 p.world.discoveredRegions.push('saffron');
 const travel=worldChoices(p,g).find(c=>c.key==='travel:saffron');assert.ok(travel);assert.equal(travel.available,true,travel.reason);
 const trip=commit(g,p,'world:'+travel.id);
 assert.equal(actionSound('move','world:'+travel.id,trip.before,trip.after),null);
});

test('career paperwork and free library preparation require exact confirmed current receipts',()=>{
 for(const [verb,target,place,cue]of [['apply','t.technical.assistant','WORK','write'],['train','technical-foundation-study','LIBRARY','pageTurn']]){
  const {g,p}=fixture();p.world.discoveredPlacesByRegion.alder.push(place);p.place=place;
  const choice=careerChoices(g,p).find(c=>c.verb===verb&&c.target===target);assert.ok(choice);assert.equal(choice.available,true,choice.reason);
  const {before,after}=commit(g,p,choice.id);
  assert.equal(actionSound('move',choice.id,before,after),cue);
  assert.equal(actionSound('move',choice.id,{...after,hours:before.hours},after),null);
  assert.equal(actionSound('move',choice.id,before,{...after,career:{...after.career,receipts:[]}}),null);
 }
});

test('chapter boundaries and clock alerts remain separate from semantic foley',()=>{
 const {p}=fixture();
 assert.equal(actionSound('create',undefined),'start');
 assert.equal(actionSound('move','end',p,p),'endWeek');
 assert.equal(actionSound('move','end',p,p,true),'finish');
 assert.equal(clockSound(p,{...p,hours:1}),'tick');
 assert.equal(clockSound(p,{...p,hours:0}),'timeUp');
 assert.equal(clockSound(p,p),null);
 assert.equal(clockSound(p,{...p,id:'other',hours:0}),null);
});

 test('ensemble audio requires a fresh exact personal physical-action receipt',()=>{
 const {p}=fixture(),action='ensemble:bracken:personal:tea:2';
 const receipt={id:'confirmed-tea',actionId:action,soundCue:'sip'};
 const before={...p,ensemble:{version:1,receipts:[]}};
 const after={...before,hours:before.hours-1,ensemble:{version:1,receipts:[receipt]}};
 assert.equal(actionSound('move',action,before,after),'sip');
 assert.equal(actionSound('move',action,after,after),null);
 assert.equal(actionSound('move',action,{...after,hours:before.hours},after),null);
 assert.equal(actionSound('move',action,before,{...after,ensemble:{version:1,receipts:[]}}),null);
 assert.equal(actionSound('move',action,before,{...after,hours:before.hours}),null);
 assert.equal(actionSound('move',action,before,{...after,ensemble:{version:1,receipts:[{...receipt,soundCue:undefined}]}}),null);
 assert.equal(actionSound('move','ensemble:bracken:personal:pay:2',before,after),null);
 });
