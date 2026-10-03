import assert from 'node:assert/strict';
import {startTutorial, restoreTutorial, advanceTutorial, tutorialSteps, TUTORIAL_STORAGE_KEY} from '../lib/tutorial.ts';
import {player, move, createEnvironment} from '../lib/game.ts';
const next = s => advanceTutorial(s, 'next');
let s = startTutorial('NEW');
assert.equal(TUTORIAL_STORAGE_KEY, 'cw_tutorial_v1');
assert.equal(s.step, 'welcome');
assert.equal(restoreTutorial(null, 'OLD', false).status, 'skipped', 'existing saves never auto-start');
for (const raw of [null, '{', 'null', '{}', '{"version":99}', '{"version":1,"status":"active","step":"bogus"}']) {
 assert.equal(restoreTutorial(raw, 'NEW').step, 'welcome');
 assert.equal(restoreTutorial(raw, 'OLD', false).status, 'skipped');
}
for (const event of ['acted', 'arrived', 'forecast-read', 'bills-reviewed']) assert.equal(advanceTutorial(s,event),s);
s = next(s); assert.equal(s.step,'resources'); s=next(s); assert.equal(s.step,'travel');
s=advanceTutorial(s,'arrived'); assert.equal(s.step,'activity');
assert.equal(advanceTutorial(s,'arrived'),s, 'duplicate arrival does not advance');
assert.equal(restoreTutorial(JSON.stringify(s),'NEW',false).step,'travel','reload can reopen dismissed activity dialog');
s=advanceTutorial(s,'acted'); assert.equal(s.step,'paths');
assert.equal(advanceTutorial(s,'acted'),s,'duplicate success does not skip a lesson');
s=next(s); assert.equal(s.step,'neighbors'); s=next(s); assert.equal(s.step,'weather');
s=advanceTutorial(s,'forecast-read'); assert.equal(s.step,'week');
s=advanceTutorial(s,'bills-reviewed'); assert.equal(s.step,'finish');
s=next(s); assert.equal(s.status,'completed');
assert.equal(advanceTutorial(s,'next'),s); assert.equal(restoreTutorial(JSON.stringify(s),'ANOTHER').status,'completed');
let replay = advanceTutorial(s,'replay'); assert.equal(replay.step,'resources'); assert.equal(replay.status,'active');
assert.equal(advanceTutorial(replay,'skip').status,'skipped');
assert.equal(restoreTutorial(JSON.stringify(advanceTutorial(replay,'skip')),'ANOTHER').status,'skipped');
assert.equal(restoreTutorial(JSON.stringify(replay),'OLD',false).status,'skipped');
assert.equal(restoreTutorial(JSON.stringify(replay),'FRESH',true).step,'welcome');
for(const step of tutorialSteps){const state={...startTutorial('A'),step};assert.equal(advanceTutorial(state,'skip').status,'skipped');assert.equal(state.status,'active','transitions are immutable');}
// Suggested first activity is affordable, repeatable and never spends on housing or a shared opportunity.
const p=player('Learner');const g={code:'A',mode:'hotseat',host:'host',members:{host:[p.id]},players:[p],status:'playing',round:1,turn:0,maxRounds:8,log:[],seen:[],event:0,rulesVersion:2,...createEnvironment()};
const original=structuredClone(g);let guide=startTutorial(g.code);for(let i=0;i<10;i++)guide=next(guide);
assert.deepEqual(g,original,'finishing guidance alone leaves the game untouched');
move(g,'visit','WORK'); assert.equal(p.hours,6);assert.equal(p.cash,1100);assert.equal(p.housing,0);
move(g,'work');assert.equal(p.hours,4);assert.equal(p.cash,1420);assert.equal(p.energy,58);assert.equal(p.housing,0);
console.log('PASS: tutorial versioning, malformed/blocked storage input, existing-save opt-in, every skip point, replay, interruption recovery, event guards, duplicate confirmations and non-mutating walkthrough; safe first shift');
