import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {currentGame} from '../tests/current-fixture.mjs';
import {move} from '../lib/game.ts';
import {careerChoices} from '../lib/careers.ts';
import {worldChoices,regionDefinitions} from '../lib/world-life.ts';
import {initializeEnsemble,getEnsembleView} from '../lib/ensemble-story.ts';
import {ensembleStories,ensembleById} from '../lib/ensemble-story-content.ts';

// No state editing after construction: every journey, paid hour, bill and scene
// below uses the ordinary production dispatcher. These are independent lives,
// not a claim that one person can see all twenty stories in eight months.
export function proveNaturalRoute(storyId,{arrivalMonth,choices,sourceChoice,aftermath=false}={}) {
 const story=ensembleById[storyId],g=currentGame({seed:312}),p=g.players[0],trace=[];
 initializeEnsemble(g);
 const act=(id,destination)=>{
  const before={month:g.round,cash:p.cash,blocks:p.hours,energy:p.energy,region:p.world.region};
  move(g,id,destination);
  trace.push({id,destination,...before,cashChange:p.cash-before.cash,blocksUsed:before.blocks-p.hours,energyChange:p.energy-before.energy,toRegion:p.world.region});
 };
 const career=(verb,predicate=()=>true)=>{
  let c=careerChoices(g,p).find(c=>c.verb===verb&&predicate(c));assert.ok(c,`Missing ${verb}`);
  if(p.place!==c.place)act('visit',c.place);
  c=careerChoices(g,p).find(q=>q.verb===verb&&predicate(q));assert.ok(c.available,`${c.title}: ${c.reason}`);act(c.id);
 };
 const due=arrivalMonth??regionDefinitions[story.region].unlockWeek;
 if(due>1){
  career('apply',c=>c.target==='t.technical.assistant');career('accept');
  while(g.round<due){
   career('work',c=>c.target.endsWith('.regular'));
   if(p.hours>0&&p.energy<70){act('visit','THE PARK');act('rest');}
   act('end');
  }
 }
 assert.ok(g.round<=g.maxRounds);
 if(story.region!=='alder'){
  assert.equal(g.ensemble.threads[storyId].status,'queued','An unvisited setup progressed offscreen');
  act('visit','TRANSIT');const trip=worldChoices(p,g).find(c=>c.key===`travel:${story.region}`);
  assert.ok(trip?.available,`${story.region}: ${trip?.reason}`);act('world:'+trip.id);
 }
 assert.equal(g.ensemble.threads[storyId].beat,0,'Ordinary arrival lost the opening');
 const arrival={month:g.round,cash:p.cash,blocks:p.hours,energy:p.energy};
 if(sourceChoice){const source=ensembleById[sourceChoice.storyId];act('visit',source.place);act(`ensemble:${source.id}:main:${sourceChoice.choice}:${g.ensemble.threads[source.id].beat}`);}
 act('visit',story.place);
 for(let beat=0;beat<story.beats.length;beat++){
  const v=getEnsembleView(g,p,storyId).scenes.find(s=>s.id===storyId);
  const options=v.choices.filter(c=>c.actionId.includes(':main:'));
  const pick=choices?.[beat];const c=pick?options.find(c=>c.actionId.includes(`:${pick}:`)):options.find(c=>c.available);
  assert.ok(c?.available,`${storyId}/${beat}: ${c?.reason??'missing choice'}`);act(c.actionId);
 }
 assert.equal(g.ensemble.threads[storyId].status,'settled');
 assert.ok(p.hours>=0&&p.cash>=0&&p.energy>=0);assert.equal(p.finance.arrears,0);
 if(aftermath){if(!getEnsembleView(g,p,storyId).scenes.find(s=>s.id===storyId).choices.some(c=>c.actionId.includes(':aftermath:')&&c.available)&&g.round<g.maxRounds)act('end');const follow=getEnsembleView(g,p,storyId).scenes.find(s=>s.id===storyId).choices.find(c=>c.actionId.includes(':aftermath:')&&c.available&&c.cost.time>0);assert.ok(follow,'No substantive current aftermath');act(follow.actionId);}
 const ending={aftermath:p.ensemble.receipts.filter(r=>r.storyId===storyId&&r.actionId.includes(':aftermath:')).length,month:g.round,cash:p.cash,blocks:p.hours,energy:p.energy,flags:g.ensemble.threads[storyId].flags};
 // Settle the actual household bill as well: the route is not financed by
 // silently skipping the current month's obligations.
 act('end');assert.equal(p.finance.arrears,0);
 return {storyId,arrival,ending,afterBillCash:p.cash,trace};
}
export function proveAllNaturalRoutes(){
 const anchors={whaleskin:['inspect','accurate','context','separate'],dalloway:['correct','full','handover','smaller'],bracken:['clarify','rehearse','plain','respect']};
 return ensembleStories.map(s=>proveNaturalRoute(s.id,{choices:anchors[s.id]}));
}
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify({scope:'Twenty independent new lives at normal unlock months, no state edits, ordinary employment/travel/bills. Solo finite scene completion; not all stories in one life.',results:proveAllNaturalRoutes()},null,2));
