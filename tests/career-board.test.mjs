import test from 'node:test';
import assert from 'node:assert/strict';
import {actions,player,move,reason} from '../lib/game.ts';
import {initializeLifePlayer} from '../lib/life-events.ts';
import {initializeEconomyPlayer,economyPaidHours} from '../lib/economy.ts';
import {initializeWorldPlayer,initializeSharedWorld,worldPlaceIds,regionDefinitions,applySharedVenueChange} from '../lib/world-life.ts';
import {careerBoardView} from '../lib/career-board.ts';
export function setup({modern=true,world=true,allPlaces=true}={}){
 const p=player('Worker',1),g={code:'JOBS',host:'owner',members:{owner:[p.id]},mode:'hotseat',status:'lobby',round:1,turn:0,maxRounds:8,players:[p],log:[],seen:[],event:0,rulesVersion:2,balanceVersion:1,...(modern?{storyVersion:1,economyVersion:1}:{}),...(world?{lifeVersion:1,worldVersion:1}:{})};
 if(modern)initializeEconomyPlayer(p,g);
 if(world){initializeLifePlayer(p);initializeWorldPlayer(p);if(modern)initializeSharedWorld(g);if(allPlaces)for(const r of Object.keys(regionDefinitions))p.world.discoveredPlacesByRegion[r]=[...worldPlaceIds];}
 g.status='playing';return{p,g};
}
const card=(p,g,id)=>careerBoardView(p,g).cards.find(c=>c.id===id);
function freeze(v){if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;}
test('read-only board has a real current job, named venues and a retraining route; no migration on read',()=>{
 const{p,g}=setup(),snapshot=structuredClone(g);freeze(g);const a=careerBoardView(p,g),b=careerBoardView(p,g);
 assert.deepEqual(a,b);assert.deepEqual(g,snapshot);assert.equal(a.role,'Café crew');assert.equal(a.workplace,'Clockhouse Workrooms');assert.equal(a.applicationVenue,'The Next Landing');
 assert.deepEqual(a.steps.map(s=>s.title),['Café crew','IT support','UX specialist','Project lead']);assert.equal(a.steps[1].stage,'Retraining');assert.equal(a.steps[1].requirement,'Learning: Finding your footing');assert.equal(a.next.actionId,'library_learn');assert.equal(a.next.cost,0);
});
test('new player can actually start work through the listed venue; displayed pay and hours settle exactly',()=>{
 const{p,g}=setup(),work=card(p,g,'work');assert.equal(work.ready,true);assert.equal(work.cash,3072);assert.equal(work.gross,3840);assert.equal(work.paidHours,160);assert.equal(work.time,2);assert.equal(work.destination.place,'WORK');
 assert.throws(()=>move(g,'work'),/Visit/);const before=structuredClone(p);move(g,'visit',work.destination.place);assert.equal(p.hours,before.hours);move(g,work.destination.actionId);assert.equal(p.cash-before.cash,work.cash);assert.equal(before.hours-p.hours,work.time);assert.equal(economyPaidHours(p,g),work.paidHours);assert.equal(p.skill,before.skill,'work does not invent learning');
 const again=card(p,g,'work');assert.equal(again.ready,false);assert.match(again.reason,/Only 40 paid hours/);assert.equal(card(p,g,'work_short').ready,true);
 move(g,'work_short');assert.equal(economyPaidHours(p,g),200);const snapshot=structuredClone(g);assert.throws(()=>move(g,'work_short'),/Only 0/);assert.deepEqual(g,snapshot);
});
test('every paid ordinary card matches the actual command quote and stable place ID',()=>{
 for(const id of careerBoardView(...(()=>{const{p,g}=setup();return[p,g];})()).cards.filter(c=>c.destination.kind==='activity').map(c=>c.id)){
  const{p,g}=setup();Object.assign(p,{cash:20000,energy:100,hours:6,skill:6,social:12,craft:5});const c=card(p,g,id),a=actions.find(a=>a.id===id);assert.equal(c.place,a.place);assert.equal(c.ready,true,id+': '+c.reason);const cash=p.cash,hours=p.hours;move(g,'visit',c.place);move(g,id);assert.equal(p.cash-cash,c.cash,id+' cash');assert.equal(hours-p.hours,c.time,id+' time');assert.equal(economyPaidHours(p,g),c.paidHours,id+' paid hours');
 }
});
test('requirements distinguish qualification, cash, time, rest, and undiscovered workplaces',()=>{
 const{p,g}=setup();assert.match(card(p,g,'creative_commission').reason,/Finding your style/);assert.match(card(p,g,'community_organize').reason,/A growing circle/);assert.match(card(p,g,'library_digitize').reason,/Learning the basics/);
 p.craft=3;p.cash=0;assert.equal(card(p,g,'creative_commission').ready,false);assert.match(card(p,g,'creative_commission').reason,/\$220 upfront; you have \$0/);
 p.hours=0;assert.match(card(p,g,'work').reason,/Needs 2 priority blocks; you have 0/);p.hours=6;p.energy=0;assert.match(card(p,g,'work').reason,/Rest/);
 const hidden=setup({allPlaces:false});assert.equal(card(hidden.p,hidden.g,'library_digitize').onMap,false);assert.match(card(hidden.p,hidden.g,'library_digitize').reason,/Find Brickhouse Library/);assert.equal(careerBoardView(hidden.p,hidden.g).next.actionId,'community_skill');
});
test('learning leads to real applications one role at a time, and raises the real work rate',()=>{
 const{p,g}=setup();p.cash=20000;p.energy=100;const before=structuredClone(g);assert.throws(()=>{p.place='CAREER HUB';move(g,'apply');},/Needs 2 skills/);p.place=before.players[0].place;
 for(let target=1;target<=3;target++){
  p.hours=6;p.energy=100;move(g,'visit','CAMPUS');move(g,'campus_bootcamp');assert.equal(p.skill,target*2);const view=careerBoardView(p,g);assert.equal(view.next.actionId,'apply');assert.equal(view.next.place,'CAREER HUB');assert.equal(view.next.cost,0);const cash=p.cash,hours=p.hours;move(g,'visit','CAREER HUB');move(g,'apply');assert.equal(p.job,target);assert.equal(p.cash,cash);assert.equal(p.hours,hours-1);assert.equal(careerBoardView(p,g).rate,[24,34,48,66][target]);
 }
 assert.equal(careerBoardView(p,g).next.actionId,'campus_tutor');assert.match(reason(p,'apply',g),/top role/);
});
test('regional local work names a real host, navigates correctly and uses the same cap; replay is idempotent',()=>{
 const{p,g}=setup();const c=card(p,g,'regional_work');assert.equal(c.ready,true,'walking is the only unmet requirement');assert.equal(c.host,'Tess');assert.equal(c.place,'WORK');assert.equal(c.cash,3272);assert.equal(c.paidHours,160);assert.match(c.repeat,/\$200 resident-rota bonus/);
 move(g,'visit',c.place);const refreshed=card(p,g,'regional_work'),cash=p.cash,hours=p.hours;move(g,'world:'+refreshed.destination.choiceId);assert.equal(p.cash-cash,c.cash);assert.equal(hours-p.hours,2);assert.equal(economyPaidHours(p,g),160);const snapshot=structuredClone(g);move(g,'world:'+refreshed.destination.choiceId);assert.deepEqual(g,snapshot);
 assert.equal(card(p,g,'regional_work').ready,false);assert.equal(card(p,g,'work_short').ready,true);
});
test('five towns preserve canonical workplaces, real quotes, known routes and home-wage semantics',()=>{
 const{p,g}=setup();const initial=careerBoardView(p,g);assert.equal(initial.towns.length,5);assert.equal(new Set(initial.towns.map(t=>t.workplace)).size,5);assert.equal(initial.towns.find(t=>t.id==='pelagia').known,false);
 g.round=6;p.world.region='pelagia';p.place='APARTMENTS';const view=careerBoardView(p,g);assert.equal(view.workplace,'Tide Ledger Workrooms');assert.equal(view.rate,24);assert.equal(view.homeRegionName,'Alder Quay');assert.equal(card(p,g,'regional_work').host,'Mara');assert.equal(card(p,g,'regional_work').cash,3456);
 p.world.story.homeRegion='pelagia';assert.equal(careerBoardView(p,g).rate,27);assert.equal(card(p,g,'regional_work').cash,3656);
});
test('shared paid preparation uses the public choice and exact current eligibility without inventing a career',()=>{
 const{p,g}=setup();const choice={id:'prep-1',actionId:'world:shared:1:0:alder:prepare:o1',key:'prepare:o1',kind:'prepare',title:'Prepare the ordered supper',body:'Tess funds this preparation for the confirmed supper order.',place:'CORNER CAFÉ',actorId:'alder_tess',time:1,cost:0,earn:77,paidHours:4,available:false,reason:'Another player already completed this order.'};
 const snapshot=structuredClone(g),v=careerBoardView(p,g,{choices:[choice]}),c=v.cards.find(c=>c.id==='prep-1');assert.equal(c.category,'shared');assert.equal(c.cash,77);assert.equal(c.paidHours,4);assert.equal(c.ready,false);assert.equal(c.reason,choice.reason);assert.equal(c.destination.actionId,choice.actionId);assert.equal(c.venue,'Ferry Corner Café');assert.equal(c.host,'Tess');assert.deepEqual(g,snapshot);
});
test('old saves retain weekly work, original pay and unchanged serialized state',()=>{
 const{p,g}=setup({modern:false,world:false}),snapshot=structuredClone(g),view=careerBoardView(p,g);assert.equal(view.rate,20);assert.equal(view.workplace,'The Shift');assert.equal(view.paidHoursLeft,null);assert.equal(card(p,g,'work').cash,320);assert.equal(card(p,g,'work').paidHours,16);assert.equal(card(p,g,'work').timeLabel,'2 time blocks');assert.deepEqual(g,snapshot);
});
test('closed or repurposed venues follow canonical state and observers get no private work plans',()=>{
 const{p,g}=setup();applySharedVenueChange(g,{id:'closed-cinema',region:'alder',place:'CINEMA',status:'closed',description:'Repairs underway.',reason:'Closed for repairs.',source:'story'});assert.equal(card(p,g,'cinema_usher').onMap,false);assert.equal(card(p,g,'cinema_usher').ready,false);
 applySharedVenueChange(g,{id:'renamed-cafe',region:'alder',place:'CORNER CAFÉ',status:'repurposed',name:'Ferry Day Café',description:'Daytime service.',reason:'New hours.',source:'story'});assert.equal(card(p,g,'cafe_barista').venue,'Ferry Day Café');p.castRedacted=true;assert.equal(careerBoardView(p,g),null);
});
