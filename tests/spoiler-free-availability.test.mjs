import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {characterHistories} from '../lib/character-histories.ts';
import {initializeWorldPlayer,initializeSharedWorld,worldChoices,resolveWorldChoice,beginWorldWeek} from '../lib/world-life.ts';

function fixture(){
 const p={id:'p',name:'Player',cash:6000,skill:0,job:0,joy:40,energy:70,hours:6,social:0,housing:0,place:'CORNER CAFÉ',rulesVersion:2,storyVersion:1,economyVersion:1,life:{version:1,flags:[],relationships:{eli:{trust:0,support:false,rivalry:false}}}};
 initializeWorldPlayer(p);
 const g={players:[p],turn:0,round:1,maxRounds:8,lifeVersion:1,storyVersion:1,economyVersion:1,status:'playing',log:[]};
 initializeSharedWorld(g);return {g,p};
}
function choose(g,p,key){let choice=worldChoices(p,g).find(c=>c.key===key);assert.ok(choice,key);p.place=choice.spot;choice=worldChoices(p,g).find(c=>c.key===key);assert.equal(choice.available,true,choice.reason);resolveWorldChoice(g,p,choice.id);}
const hiddenSchedule=/next conversation is in (?:week|month)|live the plan first|come back next|catch up next|opens.*(?:chapter|month|week) \d|next chapter-month/i;

test('Neri availability stays restrained while every original month gate remains enforced',()=>{
 const {g,p}=fixture();
 const first=worldChoices(p,g).find(c=>c.key==='neri_accept');
 assert.equal(first.available,false);assert.equal(first.reason,'Neri is busy with their own plans just now.');
 for(const [month,key,next] of [[2,'neri_accept','neri_plan_home'],[3,'neri_plan_home','neri_distance'],[4,'neri_distance','neri_partner'],[5,'neri_partner','neri_payoff']]){
  g.round=month;p.hours=6;p.energy=85;beginWorldWeek(g);choose(g,p,key);
  const locked=worldChoices(p,g).find(c=>c.key===next);assert.ok(locked);p.place=locked.spot;
  const blocked=worldChoices(p,g).find(c=>c.key===next);
  assert.equal(blocked.available,false);assert.doesNotMatch(blocked.reason,hiddenSchedule);assert.equal(blocked.reason,'Neri is busy with their own plans just now.');
  const before=JSON.stringify(g);assert.throws(()=>resolveWorldChoice(g,p,blocked.id),/Neri is busy/);assert.equal(JSON.stringify(g),before);
 }
 g.round=6;p.hours=6;beginWorldWeek(g);choose(g,p,'neri_payoff');assert.equal(p.world.story.neri.stage,'fulfilled');
});

test('resident repeat lock and unknown routes reveal no hidden calendar',()=>{
 const {g,p}=fixture();choose(g,p,'local_help:alder_tess');
 const repeat=worldChoices(p,g).find(c=>c.key==='talk:alder_tess');p.place=repeat.spot;
 const blocked=worldChoices(p,g).find(c=>c.key==='talk:alder_tess');assert.equal(blocked.available,false);assert.match(blocked.reason,/plans of their own just now/);assert.doesNotMatch(blocked.reason,hiddenSchedule);
 p.place='TRANSIT';const travel=worldChoices(p,g).find(c=>c.key==='travel:pelagia');assert.equal(travel.available,false);assert.equal(travel.reason,'You do not know this route yet.');
});

test('visible copy cannot restore leaked unlock dates or hidden narrative rewards',()=>{
 for(const file of ['lib/world-life.ts','lib/game.ts','lib/place-invitations.ts','lib/story-arcs.ts','lib/life-progress.ts','app/game-screen.tsx','app/story-choices.tsx','app/game-tutorial.tsx','app/page.tsx']){
  const source=readFileSync(new URL('../'+file,import.meta.url),'utf8');
  assert.doesNotMatch(source,/Neri’s next conversation is in (?:week|month)|Both of you need time to live the plan first|Next chapter opens next week|Come back next .*for the next chapter|will have another chapter for you next|The next chapter-month|funded coordinator role in month 5|replacement venue in month 7|(?:worth|for) 2 legacy each|Finish a shared story and earn a keepsake/,file);
 }
 const profiles=readFileSync(new URL('../public/guide/index.html',import.meta.url),'utf8').match(/<article class="person"[\s\S]*?<\/article>/g).join(' ');
 // Public marriages and a taste for radio romance are biography facts, not future route outcomes.
 const readable=profiles.replaceAll('&#39;',"'").replaceAll('&amp;','&').replaceAll('&quot;','"');
 for(const person of characterHistories)assert.ok(!readable.includes(person.closer),person.id+' private recollection stays gated');
 assert.doesNotMatch(profiles,/unlock|month [1-8]|will (ask|give|choose)|keepsake|chapter [1-8]/i);
});

test('explicit promises, event dates and actionable costs stay visible',()=>{
 const cast=readFileSync(new URL('../lib/character-cast.ts',import.meta.url),'utf8');
 assert.ok(cast.includes('is expecting you in month ${b.promise.due}'));
 assert.ok(cast.includes('A promise for month ${g.round+1}; one block then.'));
 const story=readFileSync(new URL('../lib/story-arcs.ts',import.meta.url),'utf8');
 assert.ok(story.includes('Offer one paid preparation block in month 5'));
 assert.ok(story.includes('The first set is planned for month 6'));
 const world=readFileSync(new URL('../lib/world-life.ts',import.meta.url),'utf8');
 assert.ok(world.includes('Neri has accepted work in Pelagia starting next week'));
 assert.ok(world.includes('1 time, $${cost}'));
});
