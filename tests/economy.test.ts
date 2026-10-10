import test from 'node:test';
import assert from 'node:assert/strict';
import {hasModernEconomy,initializeEconomyPlayer,economyProfile,monthlyBills,economyHourlyRate,economyActivity,economyQuote,economyWorkReason,recordEconomyPaidHours,recordEconomyWork,economyPaidHours,economyRegionalWorkQuote,economyTravelCost,economyRelocationCost,economyStudioMoveCost,economyThresholds,economyAutomaticLoss,economyLifeCash,economyCashText,economyMonthLabel,economyTimeLabel,economyGardenReward,economyAssumption,economyTimeExplanation,economySources,economyHabit,economyHabitReason,recordEconomyHabit,economyDisabled} from '../lib/economy.ts';
import type {EconomyPlayer,EconomyActivity} from '../lib/economy.ts';
const fresh=(extra:Partial<EconomyPlayer>={}):EconomyPlayer=>({storyVersion:1,economyVersion:1,cash:6000,housing:0,job:0,social:0,craft:0,...extra});
const work:EconomyActivity={id:'work',time:2,cost:0,workHours:16,energy:-12,desc:'16 paid hours'};
const short:EconomyActivity={id:'work_short',time:1,cost:0,workHours:7};
const overtime:EconomyActivity={id:'work_overtime',time:3,cost:0,workHours:25};
const g={round:1};

test('requires both explicit version markers, including future-version refusal',()=>{
 for(const p of [{},{storyVersion:1},{economyVersion:1},{storyVersion:1,economyVersion:2},{storyVersion:2,economyVersion:1}])assert.equal(hasModernEconomy(p),false);
 assert.equal(hasModernEconomy(fresh()),true);
});
test('only explicit new lobbies initialize; repeated initializer does not replenish money',()=>{
 const old=fresh({storyVersion:undefined,economyVersion:undefined,cash:1100});
 const before=structuredClone(old);initializeEconomyPlayer(old,{round:1,status:'lobby'});assert.deepEqual(old,before);
 initializeEconomyPlayer(old,{storyVersion:1,economyVersion:1,round:1,status:'lobby'});assert.equal(old.cash,6000);assert.equal(old.economyInitialized,true);
 old.cash=4420;recordEconomyPaidHours(old,g,40);initializeEconomyPlayer(old,{storyVersion:1,economyVersion:1,round:1,status:'lobby'});assert.equal(old.cash,4420);assert.equal(old.economyWork?.paidHours,40);
 const active=fresh({cash:510});initializeEconomyPlayer(active,{storyVersion:1,economyVersion:1,round:3,status:'playing'});assert.equal(active.cash,510);assert.equal(active.economyInitialized,undefined);
});
test('legacy activities, quotes, bills, texts, rewards and counters remain exact',()=>{
 const p=fresh({storyVersion:undefined,economyVersion:undefined,cash:1100});const before=structuredClone(p);
 assert.equal(economyActivity(p,work,g),work);assert.equal(economyQuote(p,work,g).cash,320);assert.equal(economyQuote(p,{id:'career_contract',time:2,cost:0},g,680).cash,680);
 assert.deepEqual(monthlyBills(p),{rent:420,food:85,essentials:0,total:505,period:'week',homeRegion:'alder'});
 assert.equal(monthlyBills({...p,housing:1}).total,705);assert.equal(economyHourlyRate({...p,job:3}),58);
 assert.equal(economyTravelCost(p,'pelagia',150),150);assert.equal(economyRelocationCost(p,'pelagia',210),210);assert.equal(economyStudioMoveCost(p),200);
 assert.equal(economyLifeCash(p,'repair_bill',-280),-280);assert.equal(economyCashText(p,'Pay $80',80,350),'Pay $80');assert.equal(economyGardenReward(p),180);
 assert.equal(economyMonthLabel(p,2),'Week 2');assert.equal(economyTimeLabel(p,1),'1 time block');recordEconomyWork(p,work,g);assert.deepEqual(p,before);
});
test('monthly bills follow the home lease, not a temporary destination',()=>{
 const p=fresh({world:{region:'pelagia',story:{homeRegion:'alder'}}});
 assert.deepEqual(monthlyBills(p),{rent:1250,food:380,essentials:220,total:1850,period:'month',homeRegion:'alder'});
 assert.equal(economyHourlyRate(p),24);p.world!.story!.homeRegion='pelagia';assert.equal(monthlyBills(p).total,2250);assert.equal(economyHourlyRate(p),27);
 p.housing=1;assert.equal(monthlyBills(p).total,3550);assert.equal(economyProfile(p,'alder').rentShared,1250);
});
test('canonical main work quotes show 160 hours, gross, withholding and cash',()=>{
 const p=fresh();assert.deepEqual(economyQuote(p,work,g),{gross:3840,withholding:768,takeHome:3072,cost:0,cash:3072,paidHours:160,available:true,reason:''});
 assert.equal(economyQuote(p,short,g).cash,768);assert.equal(economyQuote(p,overtime,g).cash,3840);
 assert.equal(economyQuote({...p,job:1},work,g).cash,4352);assert.equal(economyQuote({...p,job:3},work,g).cash,8448);
});
test('main work plus one short shift fits; repeated salary is unavailable without clipping',()=>{
 const p=fresh();recordEconomyWork(p,work,g);assert.equal(economyPaidHours(p,g),160);assert.match(economyQuote(p,work,g).reason,/Only 40 paid hours/);assert.equal(economyQuote(p,work,g).cash,3072);
 assert.equal(economyQuote(p,short,g).available,true);recordEconomyWork(p,short,g);assert.equal(economyPaidHours(p,g),200);assert.equal(economyQuote(p,short,g).available,false);
 const before=structuredClone(p);assert.throws(()=>recordEconomyWork(p,short,g),/Only 0/);assert.deepEqual(p,before);
 assert.equal(economyPaidHours(p,{round:2}),0);recordEconomyWork(p,work,{round:2});assert.deepEqual(p.economyWork,{round:2,paidHours:160});
});
test('all paid channels share one cap; regional short work can fit beside main job',()=>{
 const p=fresh();recordEconomyWork(p,work,g);
 const regular=economyRegionalWorkQuote(p,g,{region:'pelagia',kind:'regular',residentBonus:true});assert.equal(regular.available,false);assert.equal(regular.takeHome,3656);
 const local=economyRegionalWorkQuote(p,g,{region:'alder',kind:'short'});assert.equal(local.takeHome,768);assert.equal(local.paidHours,40);assert.equal(local.available,true);
 recordEconomyPaidHours(p,g,local.paidHours);assert.equal(economyWorkReason(p,g,20).length>0,true);
});
test('monthly region livelihoods differ but every regular local job covers shared bills',()=>{
 const totals:number[]=[];
 for(const region of ['alder','saffron','glasssteppe','pelagia','embermesa']){
  const p=fresh({world:{region,story:{homeRegion:region}}}),bill=monthlyBills(p),quote=economyRegionalWorkQuote(p,g,{region,kind:'regular'});
  assert.ok(quote.takeHome-bill.total>=900,region);totals.push(bill.total);
 }
 assert.equal(new Set(totals).size,5);
});
test('upfront commitments and monthly habits preserve normal unit prices',()=>{
 const p=fresh();assert.equal(economyActivity(p,{id:'study',time:2,cost:180}).cost,600);assert.equal(economyActivity(p,{id:'campus_bootcamp',time:3,cost:420}).cost,1400);
 assert.equal(economyActivity(p,{id:'cafe_break',time:1,cost:10}).cost,140);assert.equal(economyActivity(p,{id:'home_meal',time:1,cost:25}).cost,100);
 const move=economyActivity(p,{id:'move',time:1,cost:200});assert.equal(move.cost,2800);assert.match(move.desc!,/\$2,450 monthly rent/);
 assert.equal(economyTravelCost(p,'pelagia',150),780);assert.equal(economyRelocationCost(p,'pelagia',210),900);assert.equal(economyRelocationCost(p,'alder',210),600);
});
test('pure effective activity and quote are idempotent and do not mutate frozen inputs',()=>{
 const p=Object.freeze(fresh({craft:3})),a=Object.freeze({id:'creative_commission',time:2,cost:40,desc:'$380 + $65 per craft'});
 const effective=economyActivity(p,a,g),again=economyActivity(p,effective,g);
 assert.deepEqual(again,effective);assert.deepEqual(economyQuote(p,effective,g),economyQuote(p,a,g));assert.equal(effective.cost,220);assert.equal(economyQuote(p,a,g).cash,2340);
 assert.equal(a.cost,40);const profile=economyProfile(p);profile.rentShared=0;assert.equal(monthlyBills(p).rent,1250);
});
test('community and creative livelihoods can cover rent without a career promotion',()=>{
 const community=economyQuote(fresh({social:6}),{id:'community_organize',time:2,cost:0},g);
 const creative=economyQuote(fresh({craft:3}),{id:'creative_commission',time:2,cost:40},g);
 assert.equal(community.cash,2320);assert.equal(creative.cash,2340);assert.ok(community.cash>1850);assert.ok(creative.cash>1850);
});
test('reserve and hardship are monthly bill-relative; automatic losses cannot deepen debt',()=>{
 assert.deepEqual(economyThresholds(fresh()),{hardship:925,modest:2775,comfortable:5550,reserve:3700,automaticLossCap:900});
 assert.equal(economyAutomaticLoss(fresh({cash:500}),-1500),-500);assert.equal(economyAutomaticLoss(fresh({cash:6000}),-1500),-900);assert.equal(economyAutomaticLoss(fresh({cash:-400}),-840),-0);
 assert.equal(economyLifeCash(fresh({cash:300}),'unexpected_patron',260),1200);assert.equal(economyLifeCash(fresh({cash:2000}),'unexpected_patron',100),750);
 assert.equal(economyLifeCash(fresh(),'repair_bill',-280),-840);assert.equal(economyLifeCash(fresh(),'honest_debut',-20),-35);
 assert.equal(economyCashText(fresh(),'Spend $80 and 2 blocks; keep $800 in reserve.',80,350),'Spend $350 and 2 blocks; keep $800 in reserve.');
});
test('48-block traveller budget includes a monthly café habit without salary grind',()=>{
 const p=fresh();let blocks=0;const checkpoint:number[]=[];
 // Eight months: regular job2, one story/social block, rest1, 2 exploration blocks.
 // Travel costs replace an exploration block; no stat or cash boosts are injected.
 const travel=[0,320,0,540,0,780,420,180];
 for(let round=1;round<=8;round++){
  const now={round};const quote=economyQuote(p,work,now);assert.equal(quote.available,true);recordEconomyWork(p,work,now);p.cash+=quote.cash;blocks+=2;
  p.cash-=travel[round-1]+65+22+economyHabit(p,'cafe_break')!.cost;recordEconomyHabit(p,'cafe_break',now);blocks+=4;p.cash-=monthlyBills(p).total;checkpoint.push(p.cash);assert.ok(p.cash>=0);
 }
 assert.equal(blocks,48);assert.equal(p.cash,11720);assert.ok(p.cash>economyThresholds(p).reserve);assert.equal(checkpoint.length,8);
});
test('a more social six-work-month campaign still has room for four scene costs and travel',()=>{
 const p=fresh();let paidBlocks=0;
 for(let round=1;round<=8;round++){
  if(![3,6].includes(round)){const quote=economyQuote(p,work,{round});recordEconomyWork(p,work,{round});p.cash+=quote.cash;paidBlocks+=2;}
  p.cash-=monthlyBills(p).total+100;
 }
 p.cash-=320+540+780+420+600+480;
 assert.equal(paidBlocks,12);assert.equal(p.cash,5692);assert.ok(p.cash>=economyThresholds(p).reserve);
});
test('time and source disclosures explain the model without claiming personal accuracy',()=>{
 assert.equal(economyMonthLabel(fresh(),8),'Month 8');assert.equal(economyTimeLabel(fresh(),2),'2 priority blocks');assert.match(economyAssumption,/simplified game assumption/);assert.match(economyTimeExplanation,/Eight months/);
 assert.equal(economySources.length,3);assert.ok(economySources.every(s=>s.url.startsWith('https://')));
});


test('habit arithmetic is explicit and meals count only incremental food spending',()=>{
 const p=fresh();
 for(const [id,quantity,unitCost,credit,cost] of [['cafe_break',20,7,0,140],['friends',8,18,0,144],['home_meal',20,5,0,100],['market_taste',20,18,100,260]] as const){
  const habit=economyHabit(p,id)!;assert.equal(habit.quantity,quantity);assert.equal(habit.unitCost,unitCost);assert.equal(habit.groceryCredit,credit);assert.equal(habit.cost,cost);assert.equal(quantity*unitCost-credit,cost);
  assert.match(habit.desc,/this month/);assert.match(habit.desc,/does not renew automatically/);
 }
 const lunch=economyHabit(p,'market_taste')!,food=monthlyBills(p).food;
 assert.equal(food+lunch.cost,(food-lunch.groceryCredit)+lunch.quantity*lunch.unitCost);
 assert.equal(monthlyBills(p).food,380,'meal credit is not deducted twice');
});
test('each habit is once per month; reselecting or changing map cannot create extra weekdays',()=>{
 const p=fresh();const a={id:'cafe_break',time:1,cost:10};assert.equal(economyQuote(p,a,g).available,true);
 recordEconomyHabit(p,a,g);assert.deepEqual(p.economyHabits,{round:1,ids:['cafe_break']});assert.match(economyHabitReason(p,a,g),/already chosen/);assert.match(economyDisabled(p,a,g),/already chosen/);assert.equal(economyQuote(p,a,g).available,false);
 const before=structuredClone(p);assert.throws(()=>recordEconomyHabit(p,a,g),/already chosen/);assert.deepEqual(p,before);
 const restored=JSON.parse(JSON.stringify(p));restored.world={region:'pelagia',story:{homeRegion:'alder'}};assert.match(economyHabitReason(restored,a,g),/already chosen/);
 assert.equal(economyHabitReason(p,'friends',g),'');recordEconomyHabit(p,'friends',g);assert.deepEqual(p.economyHabits?.ids,['cafe_break','friends']);
 assert.equal(economyHabitReason(p,a,{round:2}),'');const cash=p.cash;recordEconomyHabit(p,a,{round:2});assert.equal(p.cash,cash,'recording a selected habit does not apply a charge');assert.deepEqual(p.economyHabits,{round:2,ids:['cafe_break']});
});
test('habit adapters do not renew, add relationship rewards or alter free and one-off options',()=>{
 const p=fresh(),before=structuredClone(p),a={id:'friends',time:1,cost:35,social:1,joy:12};
 for(let round=1;round<=8;round++){economyActivity(p,a,{round});economyQuote(p,a,{round});monthlyBills(p);}
 assert.deepEqual(p,before,'reading later months never selects or charges a habit');
 const adjusted=economyActivity(p,a,g);assert.equal(adjusted.social,1);assert.equal(adjusted.joy,12);assert.equal(adjusted.time,1);
 for(const id of ['rest','library_read','library_club','community_setup','cinema_matinee','cafe_openmic','home_host','market_cook','park_picnic']){
  assert.equal(economyHabit(p,id),undefined);recordEconomyHabit(p,id,g);assert.equal(economyHabitReason(p,id,g),'');
 }
 assert.deepEqual(p,before);assert.equal(economyActivity(p,{id:'cinema_matinee',time:1,cost:18}).cost,18);assert.equal(economyActivity(p,{id:'market_cook',time:2,cost:55}).cost,55);
});
test('legacy games never select habits even when stale habit metadata exists',()=>{
 const p=fresh({storyVersion:undefined,economyVersion:undefined,economyHabits:{round:1,ids:['cafe_break']}}),a={id:'cafe_break',time:1,cost:10},before=structuredClone(p);
 assert.equal(economyHabit(p,a),undefined);assert.equal(economyHabitReason(p,a,g),'');assert.equal(economyQuote(p,a,g).cash,-10);recordEconomyHabit(p,a,g);assert.deepEqual(p,before);
});
