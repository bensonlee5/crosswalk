import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {actions,activityForPlayer} from '../lib/game.ts';
import {placeStories} from '../lib/place-invitations.ts';
import {regionDefinitions,worldPlaceIds,worldChoices,resolveWorldChoice,worldView} from '../lib/world-life.ts';
import {economyHabit} from '../lib/economy.ts';
import {beginLifeWeek,lifeChoices,resolveLifeChoice} from '../lib/life-events.ts';
import {castCharacters} from '../lib/cast-characters.ts';
import {currentCastCharacter} from '../lib/character-cast-canon.ts';
import {qualitativeText} from '../lib/point-presentation.ts';
import {currentGame} from './current-fixture.mjs';
const catalog=JSON.parse(readFileSync(new URL('../docs/manual/items.json',import.meta.url),'utf8'));
function room(region='alder'){
 const g=currentGame({names:['Reader'],seed:15}),p=g.players[0];
 p.world.region=region;p.world.discoveredPlacesByRegion[region]=[...worldPlaceIds];p.world.discoveredRegions=Object.keys(regionDefinitions);return{p,g};
}

test('current actions have unique stable IDs and concrete authored descriptions',()=>{
 assert.equal(actions.length,38);assert.equal(new Set(actions.map(a=>a.id)).size,actions.length);
 for(const a of actions){assert.ok(a.title&&a.desc);assert.ok(a.cost>=0);assert.ok(a.time>=1&&a.time<=6);}
 assert.ok(actions.every(a=>!a.id.startsWith('story_')));
});
test('welcome and activity prose names pictured objects without changing practical labels',()=>{
 assert.match(placeStories.APARTMENTS.scene,/record.*monstera/);
 assert.match(placeStories.MAKERSPACE.scene,/bench vise.*file/);
 assert.match(placeStories.ARCADE.scene,/Pinball.*wooden counters/);
 assert.match(actions.find(a=>a.id==='home_reset').desc,/knitted throw.*monstera.*record/);
 assert.match(actions.find(a=>a.id==='maker_hobby').desc,/ceramic bird.*blue feather/);
 assert.match(actions.find(a=>a.id==='arcade_play').desc,/silver ball.*pinball/);
 assert.equal(actions.find(a=>a.id==='home_reset').title,'Reset your space');
 for(const s of Object.values(placeStories)){assert.ok(s.scene.length<210);assert.doesNotMatch(s.scene,/\$|\+\d|houseplant/);}
});
test('monthly food copy stays concrete while preserving exact charges, groceries and opt-in limits',()=>{
 const{p,g}=room();
 for(const[id,quantity,cost]of [['cafe_break',20,140],['friends',8,144],['home_meal',20,100],['market_taste',20,260]]){
  const h=economyHabit(p,id);assert.equal(h.quantity,quantity);assert.equal(h.cost,cost);assert.match(h.desc,/Choose once this month; it does not renew automatically/);
 }
 assert.match(economyHabit(p,'friends').desc,/lemon biscuits/);
 assert.match(economyHabit(p,'home_meal').desc,/lentils.*Basic groceries/);
 assert.match(activityForPlayer(p,actions.find(a=>a.id==='home_host'),g).desc,/\$65.*lentils/);
});
test('recurring names come from the unchanged 30-object, seven-brand canon and retain ownership',()=>{
 assert.equal(catalog.items.length,30);assert.equal(catalog.brands.length,7);
 const item=id=>catalog.items.find(i=>i.id===id);
 assert.equal(item('kestrel_breakfast_tea').name,'Kestrel No. 2 Breakfast Tea');
 assert.match(regionDefinitions.saffron.residents.find(c=>c.id==='saffron_ada').conversations[0],/Kestrel No\. 2 tea/);
 assert.match(regionDefinitions.saffron.residents.find(c=>c.id==='saffron_tomas').conversations[0],/his blue Gullwing lunch tin/);
 assert.match(castCharacters.find(c=>c.id==='hugo').intro,new RegExp(item('tide_mill_bridge_flour').name));
 assert.match(castCharacters.find(c=>c.id==='sami').intro,new RegExp(item('nine_locks').name));
 assert.match(castCharacters.find(c=>c.id==='priya').intro,/her Rainline No\. 3 notebook/);
 const oren=castCharacters.find(c=>c.id==='oren');assert.match(currentCastCharacter({round:2},oren).intro,/his blue Kestrel tea tin/);
 // Proposed objects remain guide proposals, never acquired runtime inventory or accomplished plot.
 const runtime=['world-life.ts','cast-characters.ts','story-arcs.ts','game.ts'].map(f=>readFileSync(new URL('../lib/'+f,import.meta.url),'utf8')).join('\n');
 assert.doesNotMatch(runtime,/Whaleskin|Dalloway|Bracken Redbank/);
});
test('five local meals remain specific in previews and receipts, pure on read and exact on commit',()=>{
 for(const region of Object.keys(regionDefinitions)){
  const{p,g}=room(region);p.place='CORNER CAFÉ';
  const original='An old receipt still says “an ordinary local meal.”';p.world.journal.push({week:0,region,title:'Earlier visit',text:original});
  const before=JSON.stringify(g),choice=worldChoices(p,g).find(c=>c.key==='food');
  assert.ok(choice.body.includes(regionDefinitions[region].food));assert.ok(choice.outcome.includes(regionDefinitions[region].food));
  worldView(p,g);assert.equal(JSON.stringify(g),before);
  assert.doesNotMatch(qualitativeText(choice.body),/\+\d+ (?:energy|happiness)/);
  const cash=p.cash,hours=p.hours,receipt=resolveWorldChoice(g,p,choice.id);
  assert.equal(p.cash-cash,choice.preview.cash);assert.equal(p.hours-hours,choice.preview.hours);assert.equal(receipt.text,choice.outcome);
  assert.equal(p.world.journal.find(entry=>entry.title==='Earlier visit').text,original,'stored earlier prose is never rewritten');
  const saved=JSON.stringify(g);resolveWorldChoice(g,p,choice.id);assert.equal(JSON.stringify(g),saved);
 }
});
test('authored plants suit their scenes, and repair receipts preserve the advertised consequences',()=>{
 assert.match(regionDefinitions.alder.residents.find(c=>c.id==='alder_rowan').conversations[2],/pothos cutting.*jam jar/);
 assert.match(regionDefinitions.glasssteppe.residents.find(c=>c.id==='glass_pavel').conversations[2],/crocus bulbs/);
 assert.match(regionDefinitions.embermesa.residents.find(c=>c.id==='mesa_june').conversations[2],/jade plant/);
 for(const[region,key,detail]of [['alder','talk:alder_rowan',/pothos cutting.*jam jar/],['alder','talk:alder_tess',/charcoal apron/],['saffron','talk:saffron_tomas',/Gullwing lunch tin/],['saffron','talk:saffron_ada',/Kestrel No\. 2 tea/]]){const{p,g}=room(region);assert.match(worldChoices(p,g).find(c=>c.key===key).outcome,detail,'current monthly dialogue keeps the detail');}
 const{p,g}=room();g.round=2;g.lifeSchedule=[{week:2,eventId:'repair_bill'}];p.craft=3;p.cash=3000;beginLifeWeek(g);
 const choice=lifeChoices(p,g).find(c=>c.id.endsWith('fix_together'));
 assert.match(choice.outcome,/shelf boards.*rust.*hand tools/);
 const cash=p.cash,hours=p.hours,receipt=resolveLifeChoice(g,p,choice.id);
 assert.equal(p.cash-cash,choice.preview.cash);assert.equal(p.hours-hours,choice.preview.hours);assert.equal(receipt.resolved.outcome,choice.outcome);
});
