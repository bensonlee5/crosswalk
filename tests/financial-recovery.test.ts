import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame} from '../supabase/functions/crosswalk-game/game-service.ts';
import {move,reason,type Game,type Player,actions,effects} from '../lib/game.ts';
import {careerChoices,resolveCareerChoice} from '../lib/careers.ts';
import {financialPayQuote,recordFinancialPay,financialSettlementQuote,settleFinancialMonth,reserveRecoveryAdministration,financialRecoveryView,financeMemberPlayers} from '../lib/financial-recovery.ts';
import {economyQuote,economyPaidHours,monthlyBills} from '../lib/economy.ts';
import {worldPlaceIds,regionDefinitions,worldChoices} from '../lib/world-life.ts';
import {weekPreview} from '../lib/game-view.ts';
import {getStoryView,resolveStoryChoice} from '../lib/story-arcs.ts';
import {initializeSharedOpportunities,sharedOpportunityView,resolveSharedChoice} from '../lib/shared-opportunities.ts';
import {getWeather} from '../lib/weather.ts';
const actor='00000000-0000-4000-8000-000000000001';
function setup(){const g=createGame({op:'create',mode:'hotseat',names:['Worker'],requestId:crypto.randomUUID(),ownerSession:actor,careerMode:'venue',supportedRules:['venue-careers-v1']},'RECOVR');const p=g.players[0];for(const r of Object.keys(regionDefinitions))p.world!.discoveredPlacesByRegion[r as keyof typeof regionDefinitions]=[...worldPlaceIds];return{g,p};}
function entry(g:Game,p:Player){p.place='WORK';const a=careerChoices(g,p).find(c=>c.target==='t.technical.assistant')!;resolveCareerChoice(g,p,a.id);const offer=careerChoices(g,p).find(c=>c.verb==='accept')!;resolveCareerChoice(g,p,offer.id);return careerChoices(g,p).find(c=>c.verb==='work'&&c.target.endsWith('.regular'))!;}
function recovering(p:Player){Object.assign(p.finance!,{arrears:5000,recovering:true,ceiling:5000,missedSettlements:2});}
test('second missed settlement previews housing, time and tuition consequences, and applies once',()=>{
 const{g,p}=setup();p.cash=0;p.housing=1;const first=settleFinancialMonth(g,p);assert.equal(first.triggered,false);assert.equal(p.cash,0);assert.equal(p.finance!.arrears,3050);g.round=2;p.hours=6;
 const warning=financialRecoveryView(g,p)!.warning;assert.match(warning,/second unpaid|starts financial recovery/);assert.match(warning,/shared housing/);assert.match(warning,/1 priority block/);assert.match(warning,/tuition/);const quote=financialSettlementQuote(g,p)!;assert.equal(quote.restructured,2400);assert.equal(quote.arrears,3700);assert.equal(quote.housingChanged,true);assert.match(quote.summary,/explicitly restructured/);
 const settlement=settleFinancialMonth(g,p);assert.deepEqual(settlement,quote);assert.equal(p.housing,0);assert.equal(p.cash,0,'surrender never refunds upgrade cash');assert.equal(p.finance!.restructuredTotal,2400);const snapshot=structuredClone(g);settleFinancialMonth(g,p);assert.deepEqual(g,snapshot);assert.equal(reserveRecoveryAdministration(g,p),1);assert.equal(p.hours,5);assert.equal(reserveRecoveryAdministration(g,p),0);assert.equal(p.hours,5);assert.match(reason(p,'move',g),/Studio upgrades pause/);
});
test('same-room month end uses the visible settlement and never creates spendable negative cash',()=>{
 const{g,p}=setup();p.cash=20;p.life!.receipts=[];g.lifeSchedule=[];const preview=weekPreview(p,g);assert.equal(preview.cash,0);const due=monthlyBills(p).total;move(g,'end');assert.equal(p.finance!.settlements[0].paid,20);assert.equal(p.finance!.settlements[0].unpaid,due-20);assert.equal(p.finance!.settlements[0].cash,0);assert.equal(p.cash>=0,true);assert.doesNotMatch(g.log.join(' '),/arrears|restructured/,'private recovery facts stay out of public log');
});
test('actual entry wages after repayment cover every home bill across all regional seasons',()=>{
 for(const home of Object.keys(regionDefinitions))for(const employer of Object.keys(regionDefinitions))for(let round=1;round<=8;round++){
  const{g,p}=setup();g.round=round;p.world!.region=employer as keyof typeof regionDefinitions;p.world!.story!.homeRegion=home as keyof typeof regionDefinitions;p.cash=0;p.energy=70;p.hours=6;recovering(p);reserveRecoveryAdministration(g,p);const weather=getWeather(g,p);assert.ok(weather?.season);const c=entry(g,p),before=p.cash,arrears=p.finance!.arrears;assert.equal(c.available,true,c.reason);assert.equal(c.time,2);assert.equal(c.paidHours,160);assert.equal(p.hours,4,'one admin and one application leave four');move(g,c.id);assert.equal(p.cash-before,c.cash);assert.equal(arrears-p.finance!.arrears,c.repayment);assert.ok(p.cash>=monthlyBills(p).total,`${employer} wage ${p.cash}, ${home} bill ${monthlyBills(p).total}, month ${round}`);assert.equal(p.hours,2,'regular work still leaves two blocks for life');assert.equal(p.energy,58);assert.equal(economyPaidHours(p,g),160);
 }
});
test('recovery ceiling stays fixed after relocation, no repeated cap reset or administration charge',()=>{
 const{g,p}=setup();p.cash=0;settleFinancialMonth(g,p);g.round++;settleFinancialMonth(g,p);const ceiling=p.finance!.ceiling;assert.equal(ceiling,3700);p.world!.story!.homeRegion='embermesa';g.round++;p.cash=0;settleFinancialMonth(g,p);assert.equal(p.finance!.ceiling,ceiling);assert.equal(p.finance!.arrears,ceiling);p.hours=6;reserveRecoveryAdministration(g,p);const before=structuredClone(p);reserveRecoveryAdministration(g,p);assert.deepEqual(p,before);
});
test('paid recovery ends only with cleared arrears and two actual on-time bills',()=>{
 const{g,p}=setup();recovering(p);p.finance!.arrears=200;p.cash=5000;recordFinancialPay(g,p,'paid-example',1000);assert.equal(p.finance!.arrears,0);assert.equal(p.finance!.recovering,true);settleFinancialMonth(g,p);assert.equal(p.finance!.recovering,true);g.round++;p.cash=5000;const q=settleFinancialMonth(g,p);assert.equal(q.recovered,true);assert.equal(p.finance!.recovering,false);assert.equal(reason(p,'move',g),'');
});
test('one missed bill can be explicitly repaid from surplus while protecting the current bill',()=>{
 const{g,p}=setup();p.cash=1000;settleFinancialMonth(g,p);assert.equal(p.finance!.arrears,850);g.round++;p.cash=4000;p.place='APARTMENTS';const c=careerChoices(g,p).find(c=>c.verb==='repay')!;assert.equal(c.cash,-850);const before=structuredClone(g);resolveCareerChoice(g,p,c.id);assert.equal(p.cash,3150);assert.equal(p.finance!.arrears,0);assert.equal(p.hours,before.players[0].hours);const done=structuredClone(g);resolveCareerChoice(g,p,c.id);assert.deepEqual(g,done);assert.equal(careerChoices(g,p).some(c=>c.verb==='repay'),false);
});
test('ordinary public gig quote, effect and deduction agree; failed capacity changes nothing',()=>{
 const{g,p}=setup();recovering(p);p.place='COMMUNITY';const a=actions.find(a=>a.id==='weekly_opportunity')!,q=economyQuote(p,a,g),e=effects(p,a,g);assert.equal(q.cash,q.takeHome-q.repayment!);assert.equal(e.cash,q.cash);const cash=p.cash,debt=p.finance!.arrears;move(g,a.id);assert.equal(p.cash-cash,q.cash);assert.equal(debt-p.finance!.arrears,q.repayment);assert.equal(p.career!.experience.civic!.paidHours,q.paidHours);const after=structuredClone(g);assert.throws(()=>move(g,a.id),/Claimed/);assert.deepEqual(g,after);
});
test('shared preparation repays once; non-wage refunds remain whole and do not pay debt',()=>{
 const{g,p}=setup();recovering(p);initializeSharedOpportunities(g);p.place='CORNER CAFÉ';const c=sharedOpportunityView(g,p)!.choices.find(c=>c.kind==='prepare')!,cash=p.cash,debt=p.finance!.arrears;assert.equal(c.earn,c.paidTakeHome!-c.repayment!);assert.match(c.body,/repays arrears/);move(g,c.actionId);const updated=g.players[0];assert.equal(updated.cash-cash,c.earn);assert.equal(debt-updated.finance!.arrears,c.repayment);assert.equal(updated.career!.experience.service!.paidHours,c.paidHours);assert.ok(updated.milestones?.includes('career_apprentice'));const done=structuredClone(g);resolveSharedChoice(g,updated,c.id);assert.deepEqual(g,done);
 const order=sharedOpportunityView(g,updated)!.choices.find(c=>c.kind==='reserve')!;updated.place='COMMUNITY';resolveSharedChoice(g,updated,order.id);const current=g.players[0],release=sharedOpportunityView(g,current)!.choices.find(c=>c.kind==='release-room')!,before=current.finance!.arrears,balance=current.cash;resolveSharedChoice(g,current,release.id);assert.equal(g.players[0].cash-balance,30);assert.equal(g.players[0].finance!.arrears,before);
});
test('story paid work is quoted net of repayment while preserving the scene’s exact receipt',()=>{
 const{g,p}=setup();g.round=5;p.hours=6;p.place='COMMUNITY';recovering(p);const scene=getStoryView(g,p).scenes[0];assert.ok(scene);p.place=scene.spot;const choice=getStoryView(g,p).scenes[0].choices.find(c=>c.id.startsWith('setup~'));assert.ok(choice);assert.match(choice.body,/repays arrears/);const cash=p.cash,debt=p.finance!.arrears;resolveStoryChoice(g,p,scene.id,choice.id);assert.equal(p.cash-cash,choice.preview.cash);assert.equal(debt-p.finance!.arrears,p.finance!.payReceipts.at(-1)!.repayment);const done=structuredClone(g);resolveStoryChoice(g,p,scene.id,choice.id);assert.deepEqual(g,done);
});
test('old direct paid-role paths are disabled; visitor actions and read-only private finance remain safe',()=>{
 const{g,p}=setup();assert.match(reason(p,'work',g),/work desk/);assert.match(reason(p,'study',g),/Learning/);p.place='CORNER CAFÉ';assert.equal(reason(p,'friends',g),'');for(const c of worldChoices(p,g).filter(c=>['regional_work','region_shift'].includes(c.key))){assert.equal(c.available,false);assert.match(c.reason,/listed workplace/);}
 const snapshot=structuredClone(g);financialRecoveryView(g,p);financialPayQuote(g,p,2000);assert.deepEqual(g,snapshot);assert.equal(financeMemberPlayers([p],[])[0].finance,undefined);assert.equal(financeMemberPlayers([p],[p.id])[0].finance,p.finance);
});
test('free entry applications remain available after a shock temporarily pushes cash below zero',()=>{
 const{g,p}=setup();p.cash=-100;const c=entry(g,p);assert.equal(c.available,true,c.reason);resolveCareerChoice(g,p,c.id);assert.equal(p.cash,-100+c.cash);
});
test('every authored paid life choice uses one quoted payroll deduction; unpaid choices do not',async()=>{
 const{beginLifeWeek,lifeChoices,resolveLifeChoice,lifeEventIds}=await import('../lib/life-events.ts');const paidKeys=['first_workshop','independent_service','jo_referral','community_pivot','eli_coop','choose_eli','solo_sale','mina_benefit','accept_support'];const seen=new Set<string>();
 for(const eventId of lifeEventIds){const{g,p}=setup();p.life!.receipts=[];g.lifeSchedule=[{week:1,eventId}];p.cash=20000;p.energy=100;p.hours=6;p.skill=6;p.social=15;p.craft=8;p.career!.training['technical:foundation']={round:1,courseId:'technical-foundation-class'};p.career!.experience.technical={paidHours:160,commitments:1,months:[1]};for(const n of ['mina','eli','jo'] as const){p.life!.relationships[n].trust=2;p.life!.relationships[n].support=true;}recovering(p);beginLifeWeek(g);
  for(const choice of lifeChoices(p,g).filter(c=>c.available&&paidKeys.includes(c.id.split(':').at(-1)!))){const clone=structuredClone(g),q=clone.players[0],offer=lifeChoices(q,clone).find(c=>c.id===choice.id)!;assert.match(offer.body,/repays arrears/);const cash=q.cash,debt=q.finance!.arrears;resolveLifeChoice(clone,q,offer.id);assert.equal(q.cash-cash,offer.preview.cash);assert.equal(debt-q.finance!.arrears,q.finance!.payReceipts.at(-1)!.repayment);assert.ok(economyPaidHours(q,clone)>0);seen.add(offer.id.split(':').at(-1)!);const done=structuredClone(clone);resolveLifeChoice(clone,q,offer.id);assert.deepEqual(clone,done);}
 }
 assert.equal(seen.size,9,`covered ${[...seen]}`);
});
test('regional career contract and legacy regional payroll both use their real quote exactly once',async()=>{
 const{g,p}=setup();p.place='TRANSIT';recovering(p);const a=careerChoices(g,p).find(c=>c.target==='r.local')!;resolveCareerChoice(g,p,a.id);resolveCareerChoice(g,p,careerChoices(g,p).find(c=>c.verb==='accept')!.id);const shift=careerChoices(g,p).find(c=>c.verb==='work')!,cash=p.cash,debt=p.finance!.arrears;resolveCareerChoice(g,p,shift.id);assert.equal(p.cash-cash,shift.cash);assert.equal(debt-p.finance!.arrears,shift.repayment);
 const other=setup();delete other.g.careerVersion;other.p.place='WORK';recovering(other.p);const c=worldChoices(other.p,other.g).find(c=>c.key==='region_shift')!;assert.equal(c.available,true,c.reason);assert.match(c.body,/repays arrears/);const oldCash=other.p.cash,oldDebt=other.p.finance!.arrears;move(other.g,'world:'+c.id);assert.equal(other.p.cash-oldCash,c.preview.cash);assert.equal(oldDebt-other.p.finance!.arrears,other.p.finance!.payReceipts.at(-1)!.repayment);
});
test('full recurring home/work/home/rest/bill cycle uses actual fares, blocks and climate, and warns before a remote offer',async()=>{
 const{careerCommuteQuote}=await import('../lib/careers.ts');let worst={margin:Infinity,home:'',employer:'',fares:0};const local:Record<string,number>={};
 for(const home of Object.keys(regionDefinitions))for(const employer of Object.keys(regionDefinitions))for(let round=1;round<=8;round++){
  const{g,p}=setup();g.round=round;g.lifeSchedule=[];p.life!.receipts=[];p.world!.discoveredRegions=Object.keys(regionDefinitions) as (keyof typeof regionDefinitions)[];p.world!.story!.homeRegion=home as keyof typeof regionDefinitions;p.world!.region=employer as keyof typeof regionDefinitions;recovering(p);entry(g,p);const contract=p.career!.contracts[0];p.world!.region=home as keyof typeof regionDefinitions;p.place='TRANSIT';p.hours=6;p.energy=70;p.cash=20000;reserveRecoveryAdministration(g,p);const start=p.cash;let fares=0;
  function travel(to:string){p.place='TRANSIT';const c=worldChoices(p,g).find(c=>c.key==='travel:'+to)!;assert.equal(c.available,true,c.reason);fares+=c.cost;move(g,'world:'+c.id);}
  if(home!==employer)travel(employer);move(g,'visit','WORK');const shift=careerChoices(g,p).find(c=>c.target===contract.id+'.regular')!;const budget=careerCommuteQuote(g,p,employer as keyof typeof regionDefinitions,shift.cash);move(g,shift.id);if(home!==employer)travel(home);move(g,'visit','APARTMENTS');move(g,'home_reset');const energy=p.energy;move(g,'end');const margin=p.cash-start;assert.ok(p.hours>=0);assert.ok(p.energy>=70,`rest cycle loses energy ${home}/${employer}/${round}, before settlement ${energy}`);assert.equal(margin,shift.cash-fares-monthlyBills(p).total);if(home===employer){assert.ok(margin>0);local[home]=margin;}else{assert.equal(budget!.fares,fares);assert.equal(budget!.remainingAfterBills,margin);assert.match(budget!.warning,/Home-town entry roles/);if(margin<0)assert.match(budget!.warning,/falls short/);}
  if(margin<worst.margin)worst={margin,home,employer,fares};
 }
 assert.deepEqual(worst,{margin:-1197,home:'pelagia',employer:'embermesa',fares:1200});assert.deepEqual(local,{alder:608,saffron:655,glasssteppe:890,pelagia:515,embermesa:753});
});
test('a local zero-cash household can recover after two missed bills without buying housing or schooling',()=>{
 for(const region of Object.keys(regionDefinitions)){
 const{g,p}=setup();g.lifeSchedule=[];p.life!.receipts=[];p.world!.region=region as keyof typeof regionDefinitions;p.world!.story!.homeRegion=region as keyof typeof regionDefinitions;p.cash=0;move(g,'end');move(g,'end');assert.equal(p.finance!.recovering,true);assert.equal(p.hours,5);assert.equal(g.round,3);
 let recoveredAt=0;while(g.status==='playing'&&g.round<=8){const month=g.round;move(g,'visit','WORK');if(!p.career!.contracts.some(c=>c.active&&c.kind==='main')){const a=careerChoices(g,p).find(c=>c.target==='t.technical.assistant')!;move(g,a.id);move(g,careerChoices(g,p).find(c=>c.verb==='accept')!.id);}
  const shift=careerChoices(g,p).find(c=>c.verb==='work'&&c.target.endsWith('.regular'))!;assert.equal(shift.available,true,shift.reason);move(g,shift.id);const extra=careerChoices(g,p).find(c=>c.verb==='repay'&&c.available);if(extra)move(g,extra.id);move(g,'visit','APARTMENTS');if(p.hours>0)move(g,'home_reset');move(g,'end');assert.ok(p.cash>=0);if(!p.finance!.recovering){recoveredAt=month;break;}
 }
 assert.ok(recoveredAt>=3&&recoveredAt<=6,`${region} recovered at ${recoveredAt}`);assert.equal(p.finance!.arrears,0);assert.equal(p.housing,0);assert.equal(Object.keys(p.career!.training).length,0);
 }
});
