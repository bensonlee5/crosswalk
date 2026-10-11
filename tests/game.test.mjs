import {CURRENT_GAME_SCHEMA} from '../lib/current-game.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import {currentGame} from './current-fixture.mjs';
import {actions,player,move,reason,activityForPlayer,projectGoal,projectProgress} from '../lib/game.ts';
import {actionPreview,weekPreview,snapshotIsCurrent} from '../lib/game-view.ts';
import {monthlyBills,initializeEconomyPlayer} from '../lib/economy.ts';
import {worldPlaceIds} from '../lib/world-life.ts';
import {isCurrentGameState} from '../lib/current-game.ts';

test('every fresh player and room have exactly one complete current ruleset',()=>{
 for(const names of [['A'],['A','B','C','D']]){const g=currentGame({names});assert.ok(isCurrentGameState(g));assert.equal(g.schemaVersion,CURRENT_GAME_SCHEMA);for(const p of g.players){assert.equal(p.cash,6000);assert.equal(p.job,undefined);assert.equal(p.stories,undefined);assert.deepEqual(Object.keys(p).filter(k=>k.endsWith('Version')),['schemaVersion']);assert.ok(p.career&&p.finance&&p.actionIncidents&&p.familiarity&&p.world&&p.cast&&p.motives);}assert.deepEqual(Object.keys(g).filter(k=>k.endsWith('Version')),['schemaVersion']);}
});
test('unsupported ordinary commands cannot invoke discarded jobs, promotions or chapter engines',()=>{
 const g=currentGame(),p=g.players[0];for(const id of ['work','work_short','apply','study','story_mina_1']){const before=structuredClone(g);assert.equal(reason(p,id,g),'Unknown action');assert.throws(()=>move(g,id),/Unknown/);assert.deepEqual(g,before);}assert.equal(actions.length,38);
});
test('current initialization does not reset a changed current player balance or work record',()=>{
 const p=player('A');p.cash=125;p.economyWork.paidHours=40;initializeEconomyPlayer(p,{round:1,status:'lobby'});assert.equal(p.cash,125);assert.equal(p.economyWork.paidHours,40);
});
test('local map travel costs nothing, including venues whose menus consist of named careers',()=>{
 const g=currentGame(),p=g.players[0];p.world.discoveredPlacesByRegion.alder=[...worldPlaceIds];for(const place of worldPlaceIds){const resources=[p.cash,p.hours,p.energy];move(g,'visit',place);assert.equal(p.place,place);assert.deepEqual([p.cash,p.hours,p.energy],resources);}
});
test('every current ordinary action uses its exact preview plus its separately recorded incident',()=>{
 for(const raw of actions){const g=currentGame(),p=g.players[0];p.world.discoveredPlacesByRegion.alder=[...worldPlaceIds];p.cash=100000;p.skill=6;p.social=24;p.craft=5;p.energy=50;p.joy=30;p.place=raw.place;const a=activityForPlayer(p,raw,g);if(reason(p,a.id,g))continue;const preview=actionPreview(p,a.id,g),before=structuredClone(p);move(g,a.id);const incident=p.actionIncidents.receipts.at(-1);for(const key of ['cash','joy','energy'])assert.equal(p[key]-before[key],preview[key]+(incident?.effects[key]??0),a.id+' '+key);assert.equal(p.hours-before.hours,preview.hours);}
});
test('shared garden contributions remain bounded, rewarding real contributors and lasting legacy',()=>{
 const g=currentGame({names:['A','B']}),[a,b]=g.players;for(const p of g.players){p.world.discoveredPlacesByRegion.alder.push('GARDEN');p.place='GARDEN';}assert.equal(projectGoal(g),4);for(let round=1;round<=2;round++){g.round=round;for(let turn=0;turn<2;turn++){g.turn=turn;const p=g.players[turn];p.hours=6;move(g,'garden_project');const after=structuredClone(g);assert.throws(()=>move(g,'garden_project'));assert.deepEqual(g,after);}}assert.equal(projectProgress(g),4);assert.ok(g.project.completed);for(const p of [a,b]){assert.equal(p.cash,6600);assert.equal(p.legacy,4);}
});
test('month settlement and turn rotation preserve current recovery rather than negative cash',()=>{
 const g=currentGame({names:['A','B']}),a=g.players[0];g.lifeSchedule=[];a.cash=25;const preview=weekPreview(a,g);assert.equal(preview.cash,0);move(g,'end');assert.equal(a.cash,0);assert.equal(a.finance.arrears,monthlyBills(a).total-25);assert.equal(g.turn,1);move(g,'end');assert.equal(g.round,2);assert.equal(g.turn,1);assert.equal(a.finance.settlements.length,1);
});
test('finished rooms reject more moves',()=>{
 const g=currentGame();g.lifeSchedule=[];for(let i=0;i<8;i++)move(g,'end');assert.equal(g.status,'finished');assert.equal(g.round,8);assert.throws(()=>move(g,'end'),/not running/);
});
test('snapshot versions retain current stale-response protection',()=>{
 assert.equal(snapshotIsCurrent({code:'ABCDEF',version:3},{code:'ABCDEF',version:2}),false);assert.equal(snapshotIsCurrent({code:'ABCDEF',version:3},{code:'ABCDEF',version:3}),true);assert.equal(snapshotIsCurrent({code:'ABCDEF',version:3},{code:'NEWNEW',version:0}),true);
});
