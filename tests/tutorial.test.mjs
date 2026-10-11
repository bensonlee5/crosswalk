import assert from 'node:assert/strict';
import {startTutorial, restoreTutorial, advanceTutorial, tutorialSteps, TUTORIAL_STORAGE_KEY} from '../lib/tutorial.ts';
import {move} from '../lib/game.ts';
import {careerChoices} from '../lib/careers.ts';
import {currentGame} from './current-fixture.mjs';
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
s=advanceTutorial(s,'forecast-read'); assert.equal(s.step,'month');
s=advanceTutorial(s,'bills-reviewed'); assert.equal(s.step,'finish');
s=next(s); assert.equal(s.status,'completed');
assert.equal(advanceTutorial(s,'next'),s); assert.equal(restoreTutorial(JSON.stringify(s),'ANOTHER').status,'completed');
let replay = advanceTutorial(s,'replay'); assert.equal(replay.step,'resources'); assert.equal(replay.status,'active');
assert.equal(advanceTutorial(replay,'skip').status,'skipped');
assert.equal(restoreTutorial(JSON.stringify(advanceTutorial(replay,'skip')),'ANOTHER').status,'skipped');
assert.equal(restoreTutorial(JSON.stringify(replay),'OLD',false).status,'skipped');
assert.equal(restoreTutorial(JSON.stringify(replay),'FRESH',true).step,'welcome');
for(const step of tutorialSteps){const state={...startTutorial('A'),step};assert.equal(advanceTutorial(state,'skip').status,'skipped');assert.equal(state.status,'active','transitions are immutable');}
// Guidance alone never acts; the first job requires a separate application, acceptance and shift.
const g=currentGame({names:['Learner']}),p=g.players[0],original=structuredClone(g);
let guide=startTutorial(g.code);for(let i=0;i<10;i++)guide=next(guide);
assert.deepEqual(g,original,'finishing guidance alone leaves the game untouched');
move(g,'visit','WORK');assert.equal(p.hours,6);assert.equal(p.cash,6000);assert.equal(p.housing,0);
const apply=careerChoices(g,p).find(c=>c.verb==='apply'&&c.target==='t.technical.assistant');assert.equal(apply.available,true);move(g,apply.id);assert.equal(p.hours,5);
const accept=careerChoices(g,p).find(c=>c.verb==='accept');move(g,accept.id);assert.equal(p.hours,5);
const work=careerChoices(g,p).find(c=>c.verb==='work'&&c.paidHours===160),cash=p.cash;move(g,work.id);assert.equal(p.hours,3);assert.equal(p.cash,cash+work.cash);assert.equal(p.housing,0);
console.log('PASS: tutorial storage, skip/replay, interruptions, duplicate events, non-mutating guidance and separate current application/acceptance/shift');
