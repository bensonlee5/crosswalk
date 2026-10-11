import test from 'node:test';
import assert from 'node:assert/strict';
import {castPeople,resolveCastChoice} from '../lib/character-cast.ts';
import {castCharacters} from '../lib/cast-characters.ts';
import {currentCastCharacter} from '../lib/character-cast-canon.ts';
import {currentGame} from './current-fixture.mjs';
import {getLifeProgress,recordLifeProgress} from '../lib/life-progress.ts';
test('complete cast friendships support actual belonging; an introduction or unrepaired conflict does not',()=>{
 const g=currentGame({names:['Friend'],seed:15}),p=g.players[0];g.round=5;
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
  const g=currentGame({names:['Returning friend'],seed:0}),p=g.players[0];
  p.world.region=c.region;p.place='COMMUNITY';g.cast.schedule[1]=[{id:c.id,region:c.region,spot:'COMMUNITY',kind:'local'}];
  resolveCastChoice(g,p,`cast:1:${c.id}:${approach}`);g.round=2;p.hours=6;const before=JSON.stringify(g);
  const view=castPeople(g,p).find(v=>v.id===c.id);assert.ok(view.body.includes(approach==='help'?currentCastCharacter(g,c).helpCallback:currentCastCharacter(g,c).listenCallback));assert.ok(!view.body.includes(approach==='help'?currentCastCharacter(g,c).listenCallback:currentCastCharacter(g,c).helpCallback));assert.equal(JSON.stringify(g),before);
 }
});
