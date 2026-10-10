import test from 'node:test';
import assert from 'node:assert/strict';
import {player} from '../lib/game.ts';
import {initializeEconomyPlayer} from '../lib/economy.ts';
import {initializeLife} from '../lib/life-events.ts';
import {initializeWorldPlayer} from '../lib/world-life.ts';
import {initializeCast,castPeople,resolveCastChoice} from '../lib/character-cast.ts';
import {castCharacters} from '../lib/cast-characters.ts';
import {getLifeProgress,recordLifeProgress} from '../lib/life-progress.ts';
test('complete cast friendships support actual belonging; an introduction or unrepaired conflict does not',()=>{
 const p=player('Friend'),g={code:'BONDS1',players:[p],mode:'hotseat',host:'x',members:{},status:'playing',round:5,turn:0,maxRounds:8,log:[],seen:[],event:0,rulesVersion:2,lifeVersion:1,worldVersion:1,economyVersion:1,castVersion:1};
 initializeEconomyPlayer(p,{...g,status:'lobby'});initializeLife(g,15);initializeWorldPlayer(p);initializeCast(g);
 p.cash=10000;p.energy=70;p.joy=70;p.social=6;p.life.activityCounts={home_reset:2,home_host:1};
 const c=castCharacters[0];p.cast.bonds[c.id]={phase:'met',approach:'listen',lastWeek:4,conflict:false,repaired:false,memories:[]};
 recordLifeProgress(g,p);assert.ok(!p.milestones.includes('home_rooted'));
 p.cast.bonds[c.id].phase='close';p.cast.bonds[c.id].conflict=true;recordLifeProgress(g,p);assert.ok(!p.milestones.includes('home_rooted'));
 p.cast.bonds[c.id].conflict=false;recordLifeProgress(g,p);assert.ok(p.milestones.includes('home_rooted'));
 assert.ok(getLifeProgress(p,g).foundations.some(f=>f.secure&&f.detail.includes(c.name)));
 assert.ok(!p.milestones.includes('creative_collaborator'),'friendship does not invent a creative collaboration');
});

test('each first approach receives its own authored callback on the next meeting',()=>{
 for(const c of castCharacters)for(const approach of ['listen','help']){
  const p=player('Returning friend'),g={code:'MEMORY',players:[p],mode:'hotseat',host:'x',members:{},status:'playing',round:1,turn:0,maxRounds:8,log:[],seen:[],event:0,rulesVersion:2,lifeVersion:1,worldVersion:1,castVersion:1};
  initializeLife(g,0);initializeWorldPlayer(p);initializeCast(g);p.world.region=c.region;p.place='COMMUNITY';g.cast.schedule[1]=[{id:c.id,region:c.region,spot:'COMMUNITY',kind:'local'}];
  resolveCastChoice(g,p,`cast:1:${c.id}:${approach}`);g.round=2;p.hours=6;const before=JSON.stringify(g);
  const view=castPeople(g,p).find(v=>v.id===c.id);assert.ok(view.body.includes(approach==='help'?c.helpCallback:c.listenCallback));assert.ok(!view.body.includes(approach==='help'?c.listenCallback:c.helpCallback));assert.equal(JSON.stringify(g),before);
 }
});
