/** Modern fictional-dollar economy, explicitly opt-in. No runtime imports.
 * A round is one month and its six blocks are competing priorities, not hours.
 * All quotes are pure. Only initializer and record* helpers mutate state.
 */
export const currentEconomyVersion = 1;
export const economyStartingCash = 6000;
export const economyPaidHoursLimit = 200;
export const economyTakeHomeRatio = 0.8;
export const economyAssumption = 'Take-home uses a simplified game assumption: 80% of gross pay. It is not a personal tax estimate.';
export const economyTimeExplanation = 'Eight months, six priority blocks each month. Blocks represent attention; paid work hours are shown separately. Each month settles one set of bills.';
export type EconomyVersionFields = {storyVersion?:number;economyVersion?:number};
export type EconomyWorkState = {round:number;paidHours:number};
export type EconomyHabitState = {round:number;ids:string[]};
export type EconomyPlayer = EconomyVersionFields & {
 cash:number;housing:number;job?:number;social?:number;craft?:number;
 economyWork?:EconomyWorkState;economyHabits?:EconomyHabitState;economyInitialized?:boolean;
 communityWork?:{round:number;count:number};
 world?:{region?:string;story?:{homeRegion?:string}};
};
export type EconomyGame = EconomyVersionFields & {round:number};
export type EconomyActivity = {id:string;cost:number;time:number;title?:string;desc?:string;earn?:number;workHours?:number;energy?:number};
export type EconomyRegion = 'alder'|'saffron'|'glasssteppe'|'pelagia'|'embermesa';
export type EconomyProfile = {region:EconomyRegion;rentShared:number;rentStudio:number;food:number;essentials:number;entryRate:number;travel:number};
export type EconomyBill = {rent:number;food:number;essentials:number;total:number;period:'month'|'week';homeRegion:EconomyRegion};
export type EconomyQuote = {gross:number;withholding:number;takeHome:number;cost:number;cash:number;paidHours:number;available:boolean;reason:string};
const profiles:Record<EconomyRegion,EconomyProfile> = {
 alder:{region:'alder',rentShared:1250,rentStudio:2450,food:380,essentials:220,entryRate:24,travel:180},
 saffron:{region:'saffron',rentShared:1150,rentStudio:2200,food:360,essentials:190,entryRate:23,travel:320},
 glasssteppe:{region:'glasssteppe',rentShared:1050,rentStudio:2000,food:380,essentials:240,entryRate:25,travel:540},
 pelagia:{region:'pelagia',rentShared:1550,rentStudio:2850,food:430,essentials:270,entryRate:27,travel:780},
 embermesa:{region:'embermesa',rentShared:950,rentStudio:1750,food:350,essentials:200,entryRate:22,travel:420},
};
const finite=(n:number|undefined)=>Number.isFinite(n)?n!:0;
const money=(n:number)=>Math.round(n);
export const formatEconomyMoney=(n:number)=>`$${Math.abs(money(n)).toLocaleString('en-US')}`;
export const hasModernEconomy=(value:EconomyVersionFields|undefined|null)=>value?.storyVersion===1&&value.economyVersion===currentEconomyVersion;
const regionId=(id:string|undefined):EconomyRegion=>id&&Object.prototype.hasOwnProperty.call(profiles,id)?id as EconomyRegion:'alder';
export const economyHomeRegion=(p:EconomyPlayer)=>regionId(p.world?.story?.homeRegion);
/** An explicit region is a quote; otherwise use the lease, never the visited map. */
export function economyProfile(p:EconomyPlayer,region?:string):EconomyProfile{return {...profiles[regionId(region??economyHomeRegion(p))]};}
export function monthlyBills(p:EconomyPlayer):EconomyBill {
 const homeRegion=economyHomeRegion(p);
 if(!hasModernEconomy(p)){const rent=p.housing?620:420;return{rent,food:85,essentials:0,total:rent+85,period:'week',homeRegion};}
 const profile=economyProfile(p);const rent=p.housing?profile.rentStudio:profile.rentShared;
 return{rent,food:profile.food,essentials:profile.essentials,total:rent+profile.food+profile.essentials,period:'month',homeRegion};
}
export const economyMonthLabel=(value:EconomyVersionFields&{round?:number},round=value.round??1)=>`${hasModernEconomy(value)?'Month':'Week'} ${round}`;
export const economyTimeLabel=(value:EconomyVersionFields,blocks:number)=>`${blocks} ${hasModernEconomy(value)?'priority':'time'} block${blocks===1?'':'s'}`;
export const economyAmount=(p:EconomyVersionFields,legacy:number,modern:number)=>hasModernEconomy(p)?modern:legacy;
/** Only call while creating/joining a NEW, explicitly opted-in lobby, never on load.
 * Existing initialized players, legacy rooms, and active games are never rebased.
 * Marker is separate so initialization is idempotent even after cash has changed.
 */
export function initializeEconomyPlayer(p:EconomyPlayer,g?:EconomyGame&{status?:string}):void {
 if(p.economyInitialized||!hasModernEconomy(g??p)||(g?.status&&g.status!=='lobby'))return;
 p.storyVersion=1;p.economyVersion=currentEconomyVersion;p.cash=economyStartingCash;
 p.economyWork={round:g?.round??1,paidHours:0};p.economyHabits={round:g?.round??1,ids:[]};p.economyInitialized=true;
}
export function economyHourlyRate(p:EconomyPlayer,job=p.job??0):number {
 const index=Math.max(0,Math.min(3,Math.floor(finite(job))));
 if(!hasModernEconomy(p))return[20,29,43,58][index];
 // Your main role follows your home contract; visiting does not change its wage.
 return [24,34,48,66][index]+economyProfile(p).entryRate-24;
}
export const economyPaidHours=(p:EconomyPlayer,g:Pick<EconomyGame,'round'>)=>p.economyWork?.round===g.round?Math.max(0,finite(p.economyWork.paidHours)):0;
export function economyWorkReason(p:EconomyPlayer,g:Pick<EconomyGame,'round'>,hours:number):string {
 if(!hasModernEconomy(p)||hours<=0)return'';
 if(!Number.isFinite(hours))return'Invalid paid workload';
 const left=Math.max(0,economyPaidHoursLimit-economyPaidHours(p,g));
 return hours>left?`Only ${left} paid hours remain this month; this commitment needs ${hours}. Choose a shorter shift or make room for something else.`:'';
}
/** Call after successful availability checks and before any pay/state mutation. */
export function recordEconomyPaidHours(p:EconomyPlayer,g:Pick<EconomyGame,'round'>,hours:number):void {
 if(!hasModernEconomy(p)||hours<=0)return;
 const reason=economyWorkReason(p,g,hours);if(reason)throw Error(reason);
 p.economyWork={round:g.round,paidHours:economyPaidHours(p,g)+hours};
}
function paidQuote(p:EconomyPlayer,g:Pick<EconomyGame,'round'>,gross:number,paidHours:number,cost=0):EconomyQuote {
 gross=money(gross);cost=money(cost);const takeHome=money(gross*economyTakeHomeRatio),reason=economyWorkReason(p,g,paidHours);
 return{gross,withholding:gross-takeHome,takeHome,cost,cash:takeHome-cost,paidHours,available:!reason,reason};
}
export function economyRegionalWorkQuote(p:EconomyPlayer,g:Pick<EconomyGame,'round'>,options:{region:string;kind:'regular'|'short';residentBonus?:boolean}):EconomyQuote {
 const hours=options.kind==='regular'?160:40,profile=economyProfile(p,options.region);
 if(!hasModernEconomy(p)){const gross=options.kind==='short'?180:({alder:330,saffron:320,glasssteppe:360,pelagia:350,embermesa:310}[profile.region]+(options.residentBonus?60:0));return{gross,withholding:0,takeHome:gross,cost:0,cash:gross,paidHours:0,available:true,reason:''};}
 return paidQuote(p,g,hours*profile.entryRate+(options.kind==='regular'&&options.residentBonus?250:0),hours);
}
export const economyTravelCost=(p:EconomyPlayer,to:string,legacyCost:number)=>hasModernEconomy(p)?profiles[regionId(to)].travel:legacyCost;
export function economyRelocationCost(p:EconomyPlayer,to:string,legacyCost:number):number {
 if(!hasModernEconomy(p))return legacyCost;
 const from=economyProfile(p),dest=economyProfile(p,to),key=p.housing?'rentStudio':'rentShared';
 return 600+Math.max(0,dest[key]-from[key]);
}
export const economyStudioMoveCost=(p:EconomyPlayer)=>hasModernEconomy(p)?economyProfile(p).rentStudio+350:200;

export type EconomyHabit = {id:string;title:string;quantity:number;unitCost:number;groceryCredit:number;cost:number;desc:string};
const habitDefinitions:Record<string,Omit<EconomyHabit,'id'|'cost'>>={
 cafe_break:{title:'Make weekday coffee your quiet ritual',quantity:20,unitCost:7,groceryCredit:0,desc:'20 weekday coffees × $7 = $140 for this month. A familiar window seat and time to yourself. Drinks are extras above ordinary groceries. Choose once this month; it does not renew automatically.'},
 friends:{title:'Keep a twice-weekly café date with friends',quantity:8,unitCost:18,groceryCredit:0,desc:'8 café meetups × $18 = $144 for this month. Coffee, snacks and familiar faces twice a week; these are extras, not replacement meals. Choose once this month; it does not renew automatically.'},
 home_meal:{title:'Make good home cooking a monthly habit',quantity:20,unitCost:5,groceryCredit:0,desc:'20 dinners × $5 in better ingredients = $100 extra this month. Basic groceries are already in your monthly bills; this pays only for upgrades. Choose once this month; it does not renew automatically.'},
 market_taste:{title:'Make market lunches part of your month',quantity:20,unitCost:18,groceryCredit:100,desc:'20 weekday lunches × $18 = $360, less $100 of groceries those lunches replace: $260 extra this month. This is already the net addition to your normal food bill; no second grocery adjustment. Choose once this month; it does not renew automatically.'},
};
/** A monthly habit is an explicit current-month choice, never a subscription. */
export function economyHabit(p:EconomyVersionFields,a:string|Pick<EconomyActivity,'id'>):EconomyHabit|undefined {
 const id=typeof a==='string'?a:a.id,habit=habitDefinitions[id];
 if(!hasModernEconomy(p)||!habit)return undefined;
 return{id,...habit,cost:habit.quantity*habit.unitCost-habit.groceryCredit};
}
export function economyHabitReason(p:EconomyPlayer,a:string|Pick<EconomyActivity,'id'>,g?:Pick<EconomyGame,'round'>):string {
 const habit=economyHabit(p,a);if(!habit||!g)return'';
 return p.economyHabits?.round===g.round&&p.economyHabits.ids.includes(habit.id)?'This monthly habit is already chosen. Enjoy it through this month, or choose a different activity.':'';
}
/** Call only after other validation and before committing ordinary activity effects. */
export function recordEconomyHabit(p:EconomyPlayer,a:string|Pick<EconomyActivity,'id'>,g:Pick<EconomyGame,'round'>):void {
 const habit=economyHabit(p,a);if(!habit)return;
 const reason=economyHabitReason(p,a,g);if(reason)throw Error(reason);
 p.economyHabits={round:g.round,ids:[...(p.economyHabits?.round===g.round?p.economyHabits.ids:[]),habit.id]};
}

// Long commitments are re-authored; habits aggregate real-priced purchases explicitly.
// One-off tickets, celebrations, travel tastings and free options keep their own scale.
const activityPatches:Record<string,Partial<EconomyActivity>>={
 work:{title:'Work your regular month',workHours:160,desc:'160 paid hours spread across this month; 2 priority blocks. Take-home is 80% of gross under the game assumption.'},
 work_short:{title:'Pick up a week of short shifts',workHours:40,desc:'40 paid hours across the month; 1 priority block. Can fit beside one regular 160-hour commitment.'},
 work_overtime:{title:'Take a demanding work month',workHours:200,desc:'200 paid hours across the month; 3 priority blocks. Uses the full monthly paid-work limit.'},
 study:{cost:600,desc:'A practical evening course over the month: $600 and 2 priority blocks.'},
 campus_bootcamp:{cost:1400,desc:'A focused training program over the month: $1,400 and 3 priority blocks for two skills.'},
 campus_group:{cost:120,desc:'A month of peer study: $120 in shared materials, 3 priority blocks and a new connection.'},
 work_mentor:{cost:180,desc:'Four guided sessions with a senior colleague: $180 across the month.'},
 career_portfolio:{cost:250,desc:'Complete a portfolio project over the month: $250 for materials and tools.'},
 community_skill:{cost:75,desc:'A subsidized workshop series: $75 and a longer commitment of 3 priority blocks.'},
 maker_intro:{cost:240,desc:'A hands-on repair course: $240 for tools, materials and bench access.'},
 creative_practice:{cost:90,desc:'A month of regular practice: $90 in materials and 2 priority blocks. One craft level.'},
 maker_commission:{cost:180},creative_commission:{cost:220},
 home_host:{cost:65,desc:'Host a potluck: $65 for your share of the food and a welcoming table.'},
 market_resell:{cost:120},
 garden_project:{desc:'One contribution each month. When the shared garden opens, every contributor receives $600 and 4 legacy points.'},
 weekly_opportunity:{title:'Take the monthly project opening',desc:'An 80-paid-hour community contract. One opening for the whole table; check its exact take-home pay.'},
};
const paidActivities:Record<string,{hours:number;gross:number}>={
 cafe_barista:{hours:40,gross:960},campus_tutor:{hours:80,gross:2400},
 library_digitize:{hours:80,gross:2000},market_shift:{hours:80,gross:1920},
 market_resell:{hours:80,gross:2400},gym_desk:{hours:80,gross:1920},
 maker_commission:{hours:120,gross:4200},cinema_usher:{hours:80,gross:1840},
 transit_courier:{hours:40,gross:1000},transit_repair:{hours:80,gross:2640},
 arcade_shift:{hours:80,gross:1920},
};
function activityPay(p:EconomyPlayer,a:EconomyActivity,g?:Pick<EconomyGame,'round'>):{gross:number;paidHours:number}|null {
 if(a.workHours)return{gross:economyHourlyRate(p)*a.workHours,paidHours:a.workHours};
 const social=Math.max(0,Math.min(20,p.social??0)),craft=Math.max(0,Math.min(8,p.craft??0));
 if(a.id==='creative_commission')return{gross:2600+craft*200,paidHours:120};
 if(a.id==='community_organize'){const repeated=g&&p.communityWork?.round===g.round&&p.communityWork.count>0;return{gross:repeated?1900:2600+social*50,paidHours:120};}
 if(a.id==='career_contract')return{gross:2800+social*70,paidHours:120};
 if(a.id==='garden_harvest')return{gross:1840+social*30,paidHours:80};
 if(a.id==='weekly_opportunity'){const n=Math.max(0,Math.min(7,(g?.round??1)-1));return{gross:[2300,2400,2500,2600,2700,2800,2900,3100][n],paidHours:80};}
 const fixed=paidActivities[a.id];return fixed?{gross:fixed.gross,paidHours:fixed.hours}:null;
}
/** Use this effective activity for both menu and resolver. Calling twice is safe. */
export function economyActivity<T extends EconomyActivity>(p:EconomyPlayer,a:T,g?:Pick<EconomyGame,'round'>):T & EconomyActivity {
 if(!hasModernEconomy(p))return a;
 const adjusted={...a,...activityPatches[a.id]} as T;
 const habit=economyHabit(p,a);if(habit){adjusted.title=habit.title;adjusted.cost=habit.cost;adjusted.desc=habit.desc;}
 if(a.id==='move'){adjusted.cost=economyStudioMoveCost(p);adjusted.desc=`${formatEconomyMoney(economyProfile(p).rentStudio)} monthly rent, plus food and essentials. ${formatEconomyMoney(adjusted.cost)} upfront: one studio deposit and $350 moving costs. Rent is charged at month-end.`;}
 const pay=activityPay(p,adjusted,g);
 if(pay&&!adjusted.workHours){adjusted.earn=money(pay.gross*economyTakeHomeRatio);adjusted.desc=`A ${pay.paidHours}-paid-hour commitment across this month. ${formatEconomyMoney(pay.gross)} gross; ${formatEconomyMoney(adjusted.earn)} take-home${adjusted.cost?`; ${formatEconomyMoney(adjusted.cost)} upfront costs`:''}. Uses the shared 200-hour monthly work limit.`;}
 return adjusted;
}
/** LegacyEarn lets callers retain all authored legacy dynamic/seasonal rewards. */
export function economyQuote(p:EconomyPlayer,a:EconomyActivity,g?:Pick<EconomyGame,'round'>,legacyEarn?:number):EconomyQuote {
 if(!hasModernEconomy(p)){const gross=legacyEarn??(a.workHours?economyHourlyRate(p)*a.workHours:(a.earn??0));return{gross,withholding:0,takeHome:gross,cost:a.cost,cash:gross-a.cost,paidHours:0,available:true,reason:''};}
 const adjusted=economyActivity(p,a,g),pay=activityPay(p,adjusted,g);
 if(pay)return paidQuote(p,g??{round:1},pay.gross,pay.paidHours,adjusted.cost);
 const earn=adjusted.earn??0,reason=economyHabitReason(p,a,g);return{gross:earn,withholding:0,takeHome:earn,cost:adjusted.cost,cash:earn-adjusted.cost,paidHours:0,available:!reason,reason};
}
export const economyDisabled=(p:EconomyPlayer,a:EconomyActivity,g?:Pick<EconomyGame,'round'>)=>economyQuote(p,a,g).reason;
export function recordEconomyWork(p:EconomyPlayer,a:EconomyActivity,g:Pick<EconomyGame,'round'>):void {recordEconomyPaidHours(p,g,economyQuote(p,a,g).paidHours);}
export const economyGardenReward=(p:EconomyPlayer)=>economyAmount(p,180,600);
// Aliases for existing UI/domain vocabulary.
export const hourlyRate=economyHourlyRate;
export const projectCompletionReward=economyGardenReward;
export function economyThresholds(p:EconomyPlayer){const bill=monthlyBills(p).total;return hasModernEconomy(p)?{hardship:money(bill*.5),modest:money(bill*1.5),comfortable:bill*3,reserve:bill*2,automaticLossCap:Math.min(900,money(bill*.5))}:{hardship:300,modest:900,comfortable:1500,reserve:bill*2,automaticLossCap:350};}
export function economyAutomaticLoss(p:EconomyPlayer,negative:number):number {return -Math.min(Math.max(0,-negative),economyThresholds(p).automaticLossCap,Math.max(0,p.cash));}

/** Category-specific legacy-event adaptation. Apply once to a fresh proposal,
 * before affordability/preview; never apply to stored receipts or actual deltas.
 * New story arcs should author modern values with economyAmount, not use this map.
 */
const lifeChoiceAmounts:Record<string,number>={
 back_calling:-450,repay_eli:-120,seed_evening:-350,honest_debut:-35,
 first_workshop:700,shared_evening:-65,one_day_studio:-350,shared_room:-180,
 independent_service:880,jo_referral:650,community_pivot:400,home_show:-100,
 find_audience:-80,record_demo:-75,repair_pump:-180,organize_groceries:-90,
 eli_coop:360,fix_together:-100,jo_toolkit:350,fund_repairs:-650,
 choose_mina:-30,choose_eli:240,share_stage:-150,solo_sale:950,mina_benefit:500,
 independent_start:-300,accept_support:600,home_repair_paid:-480,
};
/** Optional legacy life-event paid work must consume the same monthly cap.
 * Grant money, repair credits, reimbursements and donations are not paid hours.
 */
export function economyLifePaidHours(p:EconomyPlayer,key:string):number {
 if(!hasModernEconomy(p))return 0;
 return ({first_workshop:40,independent_service:40,jo_referral:32,community_pivot:20,eli_coop:16,choose_eli:12,solo_sale:40,accept_support:32} as Record<string,number>)[key]??0;
}
export function economyLifeCash(p:EconomyPlayer,key:string,legacyCash:number):number {
 if(!hasModernEconomy(p)||!legacyCash)return legacyCash;
 if(key==='unexpected_patron'){const t=economyThresholds(p);return p.cash<t.hardship?1200:p.cash<t.modest?750:350;}
 if(key==='recover_role')return legacyCash===-40?-160:-400;
 if(Object.prototype.hasOwnProperty.call(lifeChoiceAmounts,key))return lifeChoiceAmounts[key];
 const eventScale:Record<string,number>={work_reset:4,venue_lost:2,garden_setback:1.5,repair_bill:3,commission_dispute:3,crossroads:3};
 return eventScale[key]?money(legacyCash*eventScale[key]):legacyCash;
}
/** Replace only a known dollar literal in newly built prose; preserves legacy text. */
export function economyCashText(p:EconomyPlayer,text:string,legacyAmount:number,modernAmount:number):string {
 if(!hasModernEconomy(p)||legacyAmount===modernAmount)return text;
 const old=Math.abs(legacyAmount),replacement=formatEconomyMoney(modernAmount);
 return text.replace(/\$([\d,]+)(?![\d.])/g,(match,n)=>Number(n.replaceAll(',',''))===old?replacement:match);
}

export const economySources = [
 {title:'BLS May 2025 San Francisco occupational wages (released July 2026)',url:'https://www.bls.gov/regions/west/news-release/occupationalemploymentandwages_sanfrancisco.htm',note:'Food-service group mean $22.91/hour; all occupations $48.19/hour. Broad anchors, not exact claims about fictional roles.'},
 {title:'HUD FY2026 Fair Market Rent schedule',url:'https://www.huduser.gov/portal/datasets/fmr/fmr2026/FY2026_FMR_Schedule.pdf',note:'San Francisco studio $2,485; Oakland-Fremont studio $2,142. FMRs are program benchmarks, not current asking-rent listings.'},
 {title:'USDA July 2026 food-at-home report',url:'https://fns-prod.azureedge.us/sites/default/files/resource-files/cnpp-costfood-3levels-july2026.pdf',note:'Adult low-cost food at home $276.10–317.40/month before household-size adjustments; USDA suggests +20% for a single person. Fictional groceries $350–430 are game anchors, not a personal nutrition budget.'},
] as const;
