import {recordMotiveEvidence,resolveMotiveChoice,type MotivePlayerState} from './character-motives.ts';
import {resolveCastChoice,endCastMonth} from './character-cast.ts';
import type {CastState,CastPlayerState} from './character-cast.ts';
import {storyActionReason,storyAfterAction,resolveStoryChoice,arriveStoryWeek} from './story-arcs.ts';
import type {StoryState,StoryPlayerState} from './story-arcs.ts';
import {economyActivity,economyQuote,economyDisabled,recordEconomyWork,recordEconomyHabit,monthlyBills,economyGardenReward,economyHourlyRate,hasModernEconomy} from './economy.ts';
import type {EconomyWorkState,EconomyHabitState} from './economy.ts';
import {visiblePlaces,resolveWorldChoice,beginWorldWeek,afterWorldAction} from './world-life.ts';
import type {WorldState,SharedWorldState} from './world-life.ts';
import {beginLifeWeek,deferLifeChoice,resolveLifeChoice,repairRelationship,repairHome,recordLifeStory} from './life-events.ts';
import type {LifePlayerState,LifeScheduleEntry,LifeNpc} from './life-events.ts';
import {selectAspiration,recordLifeProgress} from './life-progress.ts';
import {regionalParticipation,consumeRegionalParticipation} from './regional-life.ts';
import type {RegionalLifeUsage} from './regional-life.ts';
import {weatherEffect,consumeWeather,consumeClimateEffect,getWeather,seasonalOpportunity} from './weather.ts';
import type {WeatherId,WeatherUsage} from './weather.ts';
export {createEnvironment} from './weather.ts';
export type Player={regionalLifeUsage?:RegionalLifeUsage;motives?:MotivePlayerState;castRedacted?:boolean;cast?:CastPlayerState;storyVersion?:number;economyVersion?:number;economyInitialized?:boolean;economyWork?:EconomyWorkState;economyHabits?:EconomyHabitState;story?:StoryPlayerState;id:string;name:string;cash:number;skill:number;job:number;joy:number;energy:number;hours:number;social:number;housing:number;place:string;rulesVersion?:number;life?:LifePlayerState;world?:WorldState;aspiration?:string;aspirationWeek?:number;milestones?:string[];balanceVersion?:number;communityWork?:{round:number;count:number};craft?:number;legacy?:number;stories?:Record<string,number>;storyWeeks?:Record<string,number>;weatherUsage?:WeatherUsage};
export type Game={characterCanonVersion?:number;regionalLifeVersion?:number;climateVersion?:number;motivesVersion?:number;historyVersion?:number;castVersion?:number;cast?:CastState;storyVersion?:number;economyVersion?:number;story?:StoryState;sharedWorld?:SharedWorldState;code:string;mode:'hotseat'|'online';host:string;members:Record<string,string[]>;players:Player[];status:'lobby'|'playing'|'finished';round:number;turn:number;maxRounds:number;log:string[];seen:string[];event:number;rulesVersion?:number;lifeVersion?:number;worldVersion?:number;lifeSeed?:number;lifeSchedule?:LifeScheduleEntry[];balanceVersion?:number;environmentVersion?:number;weatherSchedule?:WeatherId[];turnsTaken?:number;opportunityClaim?:{round:number;playerId:string;name:string};project?:{contributions:Record<string,number>;lastWeek:Record<string,number>;completed:boolean}};
export const jobs=[{name:'Café crew',rate:20,need:0},{name:'IT support',rate:29,need:2},{name:'UX specialist',rate:43,need:4},{name:'Project lead',rate:58,need:6}];
export const events=[{title:'The little wins',text:'Someone remembered your coffee order. Everyone gets +4 happiness.',cash:0,joy:4},{title:'Transit fare week',text:'A city pass costs everyone $30 this week.',cash:-30,joy:0},{title:'Neighborhood night',text:'The block throws a free movie night. Everyone gets +6 happiness.',cash:0,joy:6},{title:'Energy bill bump',text:'Heating, cooling, and an extra $45 for everyone.',cash:-45,joy:0},{title:'Found money',text:'An old deposit is returned. Everyone gets $90.',cash:90,joy:0},{title:'Group chat gold',text:'The memes are exceptionally good. Everyone gets +3 happiness.',cash:0,joy:3},{title:'Groceries on sale',text:'Seasonal produce saves everyone $35.',cash:35,joy:0},{title:'A sunny finish',text:'A beautiful final week. Everyone gets +5 happiness.',cash:0,joy:5}];
export type Activity={id:string;title:string;place:string;icon:string;time:number;cost:number;desc:string;color:string;energy?:number;joy?:number;skill?:number;social?:number;earn?:number;workHours?:number;needSkill?:number;needSocial?:number;housing?:number;promote?:boolean;craft?:number;needCraft?:number;modernOnly?:boolean;story?:string;stage?:number;special?:'opportunity'|'project'};
const activity=(place:string,color:string,rows:Omit<Activity,'place'|'color'|'icon'>[]):Activity[]=>rows.map(a=>({...a,place,color,icon:'spark'}));
export const actions:Activity[]=[
...activity('APARTMENTS','mint',[
{id:'move',title:'Get your own place',time:1,cost:200,housing:1,desc:'$620 rent · +6 happiness each week'},
{id:'home_reset',title:'Reset your space',time:1,cost:0,energy:12,joy:7,desc:'Fold the knitted throw, dust the monstera leaves and put on a record'},
{id:'home_meal',title:'Cook a proper meal',time:1,cost:25,energy:24,joy:4,desc:'Roast carrots, simmer lentils and save a bowl for tomorrow'},
{id:'home_host',title:'Host a potluck',time:2,cost:45,joy:20,social:2,desc:'Set out bread, a bowl of lentils and space for everyone’s dish'}]),
...activity('WORK','blue',[
{id:'work',title:'Work a shift',time:2,cost:0,workHours:16,energy:-12,desc:'16 paid hours at your current wage'},
{id:'work_short',title:'Pick up a short shift',time:1,cost:0,workHours:7,energy:-8,desc:'A smaller paycheck that fits your week'},
{id:'work_overtime',title:'Take the overtime block',time:3,cost:0,workHours:25,energy:-26,joy:-4,desc:'A bigger paycheck, a more draining week'},
{id:'work_mentor',title:'Shadow a senior colleague',time:2,cost:60,skill:1,energy:-10,needSkill:2,desc:'Hands-on learning once you know the basics'}]),
...activity('CAMPUS','purple',[
{id:'study',title:'Take a short course',time:2,cost:180,skill:1,energy:-8,desc:'Build one practical career skill'},
{id:'campus_bootcamp',title:'Join an intensive bootcamp',time:3,cost:420,skill:2,energy:-22,desc:'Two skills in one focused stretch'},
{id:'campus_group',title:'Study with a small group',time:3,cost:70,skill:1,social:1,energy:-6,desc:'Learn for less and make a connection'},
{id:'campus_tutor',title:'Tutor another learner',time:2,cost:0,earn:170,joy:5,energy:-8,needSkill:3,desc:'Put three earned skills to useful work'}]),
...activity('CAREER HUB','orange',[
{id:'apply',title:'Make a career move',time:1,cost:0,promote:true,desc:'Next role needs 2 / 4 / 6 skills'},
{id:'career_network',title:'Go to a networking meetup',time:1,cost:25,social:2,joy:4,energy:-4,desc:'Meet people who open up new opportunities'},
{id:'career_portfolio',title:'Build a portfolio project',time:2,cost:100,skill:1,energy:-12,needSkill:1,desc:'Turn a first skill into tangible experience'},
{id:'career_contract',title:'Take a referral contract',time:2,cost:0,earn:300,energy:-16,needSkill:2,needSocial:4,desc:'Skilled work unlocked by four connections'}]),
...activity('CORNER CAFÉ','pink',[
{id:'friends',title:'Meet your people',time:1,cost:35,joy:12,social:1,desc:'Coffee, lemon biscuits and a conversation that can wander'},
{id:'cafe_break',title:'Take a quiet coffee break',time:1,cost:10,energy:14,joy:8,desc:'An espresso at the window, with a moment to yourself'},
{id:'cafe_openmic',title:'Try the open mic',time:2,cost:15,joy:18,social:2,energy:-6,desc:'Trade a few nerves for a good story'},
{id:'cafe_barista',title:'Cover the espresso bar',time:1,cost:0,earn:125,energy:-9,desc:'A quick casual shift, whatever your career'}]),
...activity('COMMUNITY','yellow',[
{id:'volunteer',title:'Lend a hand',time:2,cost:0,joy:15,social:2,desc:'Sort tins of beans and bags of rice with the pantry crew'},
{id:'community_setup',title:'Set up the food pantry',time:1,cost:0,joy:7,social:1,energy:-5,desc:'Stack the rice sacks and check the dates on the bean tins'},
{id:'community_lead',title:'Lead a neighborhood event',time:2,cost:30,joy:22,social:3,energy:-10,needSocial:3,desc:'Bring three connections into something bigger'},
{id:'community_skill',title:'Join a community workshop',time:3,cost:30,skill:1,energy:-9,desc:'Affordable learning with a longer time commitment'}]),
...activity('THE PARK','green',[
{id:'rest',title:'Take the slow route',time:1,cost:0,energy:22,joy:5,desc:'A restorative walk under the trees'},
{id:'park_picnic',title:'Pack a picnic with friends',time:2,cost:30,energy:10,joy:20,social:1,desc:'Unwrap cheese sandwiches and pass the apple slices'},
{id:'park_run',title:'Go for a morning run',time:1,cost:0,energy:-8,joy:12,desc:'Trade physical effort for a clearer head'},
{id:'park_read',title:'Read under a tree',time:2,cost:0,energy:28,joy:10,desc:'An unhurried reset, without spending cash'}]),
...activity('LIBRARY','purple',[
{id:'library_learn',title:'Learn from free resources',time:3,cost:0,skill:1,energy:-12,desc:'Self-directed study trades time for savings'},
{id:'library_read',title:'Get lost in a good book',time:1,cost:0,energy:10,joy:9,desc:'A dog-eared paperback and a seat beneath the reading lamp'},
{id:'library_club',title:'Join the book club',time:2,cost:0,joy:14,social:2,desc:'Turn a shared story into new connections'},
{id:'library_digitize',title:'Help digitize the archive',time:2,cost:0,earn:150,energy:-8,needSkill:1,desc:'A paid project for someone with a first skill'}]),
...activity('MARKET','orange',[
{id:'market_shift',title:'Cover a market stall',time:2,cost:0,earn:270,energy:-14,social:1,desc:'Casual work with plenty of conversation'},
{id:'market_cook',title:'Take a cooking class',time:2,cost:55,energy:16,joy:16,desc:'Chop peppers and parsley for a shared supper'},
{id:'market_taste',title:'Explore the tasting stalls',time:1,cost:25,energy:9,joy:12,desc:'Taste a spoonful of relish and a wedge of warm flatbread'},
{id:'market_resell',title:'Run a secondhand pop-up',time:2,cost:30,earn:250,energy:-10,needSocial:2,desc:'A $30 stall fee, $250 sales, two connections required'}]),
...activity('FITNESS','green',[
{id:'gym_yoga',title:'Join a gentle yoga class',time:1,cost:20,energy:28,joy:6,desc:'A paid reset with a little extra recovery'},
{id:'gym_train',title:'Train with a friend',time:1,cost:15,energy:-10,joy:15,social:1,desc:'An energizing social habit, with physical effort'},
{id:'gym_sauna',title:'Take a recovery session',time:2,cost:45,energy:48,joy:10,desc:'Deep recovery when the week has worn you down'},
{id:'gym_desk',title:'Cover the front desk',time:2,cost:0,earn:260,energy:-10,desc:'A steady casual shift with a lighter physical load'}]),
...activity('MAKERSPACE','blue',[
{id:'maker_intro',title:'Learn to repair',time:2,cost:90,skill:1,energy:-10,needSkill:2,desc:'Build on two skills at the workbench'},
{id:'maker_commission',title:'Finish a custom commission',time:2,cost:40,earn:370,energy:-18,needSkill:3,needSocial:2,desc:'$40 materials, $370 payout; skill and contacts matter'},
{id:'maker_hobby',title:'Make something just for fun',time:1,cost:30,joy:16,energy:-5,desc:'Paint a ceramic bird, one blue feather at a time'},
{id:'maker_repair',title:'Help at the repair café',time:2,cost:0,joy:13,social:2,energy:-7,needSkill:1,desc:'Tighten a loose hinge and help a neighbor keep their cupboard'}]),
...activity('CINEMA','pink',[
{id:'cinema_matinee',title:'Catch a matinee',time:1,cost:18,joy:15,energy:5,desc:'A little escape for the price of a ticket'},
{id:'cinema_friends',title:'Make it a movie night',time:2,cost:50,joy:26,social:1,energy:4,desc:'A bigger night out with your people'},
{id:'cinema_usher',title:'Work an usher shift',time:2,cost:0,earn:250,joy:4,energy:-12,desc:'Earn a little and catch the atmosphere'},
{id:'cinema_club',title:'Stay for the film discussion',time:2,cost:12,joy:16,social:2,desc:'Meet other people who love a good story'}]),
...activity('TRANSIT','blue',[
{id:'transit_courier',title:'Take a bicycle courier route',time:1,cost:0,earn:150,energy:-14,desc:'Quick cash, a demanding ride'},
{id:'transit_repair',title:'Repair bikes at the hub',time:2,cost:0,earn:290,energy:-12,needSkill:2,desc:'Adjust bicycle brakes and replace worn cables; two skills required'},
{id:'transit_scenic',title:'Ride somewhere new',time:1,cost:12,joy:13,energy:6,desc:'A small change of scenery'},
{id:'transit_cleanup',title:'Join the car-free street crew',time:2,cost:0,joy:14,social:3,energy:-12,desc:'Help make the neighborhood easier to explore'}]),
...activity('GARDEN','mint',[
{id:'garden_tend',title:'Tend a shared plot',time:1,cost:0,joy:10,energy:-4,social:1,desc:'Loosen the soil with a hand fork and label the seed trays'},
{id:'garden_harvest',title:'Help with the harvest',time:2,cost:0,earn:230,joy:8,energy:-16,desc:'Paid seasonal work with a satisfying finish'},
{id:'garden_workshop',title:'Learn urban growing',time:3,cost:50,skill:1,joy:5,energy:-10,desc:'Practice seed spacing and learn when the soil needs water'},
{id:'garden_rest',title:'Spend a slow afternoon here',time:2,cost:0,energy:34,joy:7,desc:'Sit by the greenhouse and let the week settle'}]),
...activity('ARCADE','yellow',[
{id:'arcade_play',title:'Play a few favorites',time:1,cost:20,joy:17,energy:-3,desc:'Chase the silver ball around a pinball table'},
{id:'arcade_tabletop',title:'Join a tabletop night',time:2,cost:15,joy:20,social:2,energy:-5,desc:'Pass the cards and wooden counters around one table'},
{id:'arcade_host',title:'Host a game meetup',time:2,cost:25,joy:24,social:3,energy:-8,needSocial:4,desc:'Four connections help fill the seats'},
{id:'arcade_shift',title:'Cover the evening desk',time:2,cost:0,earn:250,social:1,energy:-14,desc:'Keep the games running and meet the regulars'}])
];
/** Balance 1 is opt-in at room creation; unmarked saves keep the authored original values. */
export const currentBalanceVersion=1;
export const hasCurrentBalance=(p:Player)=>p.rulesVersion===2&&p.balanceVersion===currentBalanceVersion;
const balancedActivities:Record<string,Partial<Activity>>={
 home_meal:{energy:34,desc:'More recovery than yoga, with a little less happiness and a $25 grocery bill.'},
 cafe_barista:{joy:5,desc:'A small paycheck and +5 happiness from the regulars; career shifts pay more.'},
 park_read:{joy:20,desc:'A deeper happiness boost than two walks, with less energy recovery.'},
 market_cook:{energy:20,joy:24,desc:'Chop peppers and parsley for a shared supper: +24 happiness and +20 energy for $55.'},
 market_resell:{earn:350,desc:'A $30 stall fee, $350 sales, two connections required. $320 net income.'},
 gym_sauna:{energy:64,desc:'More recovery than two yoga classes: +64 energy, +10 happiness for $45.'},
 garden_rest:{energy:54,desc:'A long, free rest: more energy than two walks, a little less happiness.'},
 arcade_shift:{energy:-10,desc:'A lighter shift than the market: $250 and a connection for 10 energy.'},
 community_organize:{desc:'One funded day per week: $420 + $15 per connection (up to 20). Further days are lighter setup work: $280, 8 energy, no extra happiness or connections.'}
};
export function activityForPlayer(p:Player,a:Activity,g?:Pick<Game,'round'>):Activity{
 if(!hasCurrentBalance(p))return economyActivity(p,a,g);
 const adjusted=balancedActivities[a.id]?{...a,...balancedActivities[a.id]}:a;
 return economyActivity(p,a.id==='community_organize'&&communityDaysThisWeek(p,g)>0?{...adjusted,energy:-8,joy:0,social:0}:adjusted,g);
}
export function communityDaysThisWeek(p:Player,g?:Pick<Game,'round'>){return g&&p.communityWork?.round===g.round?Math.max(0,p.communityWork.count):0;}
export const neighbors=[
 {id:'mina',name:'Mina',place:'CORNER CAFÉ',keepsake:'Sunrise pin',chapters:[
  {title:'Meet Mina over closing-time coffee',text:'Mina has a folder full of songs but has never played one outside her kitchen. Sit down and hear the first verse.',joy:8,social:1,cost:10},
  {title:'Rehearse with Mina',text:'She kept your table free. Help her try the chorus again before the café opens.',joy:10,social:2,cost:0},
  {title:'Be there for Mina’s first set',text:'Mina spots you in the front row. After the applause, she gives you the little sunrise pin from her guitar case.',joy:15,social:2,cost:15}]},
 {id:'eli',name:'Eli',place:'GARDEN',keepsake:'Leaf charm',chapters:[
  {title:'Meet Eli by the empty beds',text:'Eli wants tomatoes for the pantry, but the first seedlings failed. Help work out what the soil needs.',joy:8,social:1,cost:0},
  {title:'Help Eli save the seedlings',text:'The new shoots are up. Eli needs a second pair of hands to protect them before the cold night.',joy:10,social:2,cost:15},
  {title:'Share Eli’s first harvest',text:'A whole crate of tomatoes goes to the pantry. Eli presses a carved leaf charm into your hand: a reminder that you helped this grow.',joy:15,social:2,cost:0}]},
 {id:'jo',name:'Jo',place:'MAKERSPACE',keepsake:'Copper halo',chapters:[
  {title:'Meet Jo at the repair bench',text:'Jo inherited a broken neighborhood sign. Find the missing pieces together over a bench covered in copper scraps.',joy:8,social:1,cost:0},
  {title:'Help Jo rebuild the sign',text:'The pieces fit. Spend an evening smoothing the edges while Jo tells you who used to live on the block.',joy:10,social:2,cost:20},
  {title:'Light Jo’s restored sign',text:'The sign glows again. Jo makes you a copper halo from the offcuts, and insists you take the first photo.',joy:15,social:2,cost:0}]}
];
const newActions:Activity[]=[
 {id:'creative_practice',title:'Practice your craft',place:'MAKERSPACE',icon:'spark',color:'blue',time:2,cost:30,energy:-7,craft:1,joy:4,modernOnly:true,desc:'One craft level. Reach 3 to take commissions; 8 completes the creative path.'},
 {id:'creative_commission',title:'Deliver a creative commission',place:'MAKERSPACE',icon:'spark',color:'blue',time:2,cost:40,energy:-16,needCraft:3,modernOnly:true,desc:'Payout grows with craft: $380 + $65 per level, less $40 materials.'},
 {id:'community_organize',title:'Coordinate a paid community day',place:'COMMUNITY',icon:'spark',color:'yellow',time:2,cost:0,energy:-14,joy:5,social:1,needSocial:6,modernOnly:true,desc:'Earn $420 + $15 per connection (up to 20). Community work can support your life.'},
 {id:'weekly_opportunity',title:'Claim this week’s opportunity',place:'COMMUNITY',icon:'spark',color:'yellow',time:2,cost:0,energy:-12,modernOnly:true,special:'opportunity',desc:'One opening for the whole table. Check the neighborhood board for this week’s exact reward.'},
 {id:'garden_project',title:'Build the neighborhood garden',place:'GARDEN',icon:'spark',color:'mint',time:1,cost:0,energy:-6,joy:5,modernOnly:true,special:'project',desc:'One contribution per player per week. Finish together: every contributor earns $180 and 4 legacy points.'},
 ...neighbors.flatMap(n=>n.chapters.map((c,i)=>({id:`story_${n.id}_${i+1}`,title:c.title,place:n.place,icon:'spark',color:'mint',time:1,cost:c.cost,joy:c.joy,social:c.social,modernOnly:true,story:n.id,stage:i+1,desc:c.text})))
];
actions.push(...newActions);
export const opportunities=[
 {title:'Pop-up welcome market',text:'A bread-and-preserves stall needs a friendly host.',earn:520,joy:8,social:2,craft:0},
 {title:'Design the festival poster',text:'Letter the supper time and paint a border for the festival poster.',earn:560,joy:6,social:0,craft:1},
 {title:'Neighborhood research day',text:'Listen to what your neighbors want next.',earn:540,joy:8,social:2,craft:0},
 {title:'Weekend craft showcase',text:'Take the last table at the makers’ fair.',earn:620,joy:8,social:0,craft:1},
 {title:'Local business launch',text:'Help a new shop welcome the street.',earn:680,joy:6,social:2,craft:0},
 {title:'Community mural day',text:'Fill the chalked mural outlines with ochre and blue.',earn:640,joy:10,social:0,craft:1},
 {title:'Harvest supper host',text:'Bring the whole block to the table.',earn:700,joy:10,social:2,craft:0},
 {title:'The neighborhood finale',text:'Make the last week a good memory.',earn:760,joy:12,social:1,craft:1}
];
export const opportunity=(g:Pick<Game,'round'|'rulesVersion'|'environmentVersion'|'weatherSchedule'>)=>seasonalOpportunity(g,opportunities[[1,0,3,2,4,5,6,7][(g.round-1)%opportunities.length]]);
export const projectGoal=(g:Pick<Game,'players'>)=>g.players.length*2;
export const projectProgress=(g:Pick<Game,'project'>)=>Object.values(g.project?.contributions||{}).reduce((a,b)=>a+b,0);
export function pathPoints(p:Player){return[{name:'Career',points:p.job/3*20+Math.min(6,p.skill)/6*20},{name:'Community',points:Math.min(24,p.social)/24*40},{name:'Creative',points:Math.min(8,p.craft||0)/8*40}];}
export function effects(p:Player,a:Activity,g?:Game){
 a=activityForPlayer(p,a,g);
 let earn=a.workHours?jobs[p.job].rate*a.workHours:(a.earn||0),craft=a.craft||0,social=a.social||0,joy=a.joy||0;
 if(p.rulesVersion===2){
  if(a.id==='career_contract')earn=360+Math.min(20,p.social)*20;
  if(a.id==='garden_harvest')earn=230+Math.min(20,p.social)*12;
  if(a.id==='community_organize')earn=hasCurrentBalance(p)&&communityDaysThisWeek(p,g)>0?280:420+Math.min(20,p.social)*15;
  if(a.id==='creative_commission')earn=380+Math.min(8,p.craft||0)*65;
  if(a.special==='opportunity'&&g){const o=opportunity(g);earn=o.earn;craft=o.craft;social=o.social;joy=o.joy;}
 }
 const weather=weatherEffect(p,a,g,{joy,energy:a.energy||0});
 const participation=regionalParticipation(p,a.id,g,joy+weather.joy,visiblePlaces(p,g).includes(a.place));
 return{cash:economyQuote(p,a,g,earn).cash,energy:Math.max(-p.energy,Math.min(a.energy||0,100-p.energy))+weather.energy,joy:Math.max(-p.joy,Math.min(joy,100-p.joy))+weather.joy+participation.joy,...(g?.regionalLifeVersion===1?{participation}:{}),skill:Math.min(a.skill||0,6-p.skill),social,craft:Math.min(craft,8-(p.craft||0)),weather,requiredEnergy:weather.requiredEnergy};
}
export function player(name:string,balanceVersion?:number):Player{return{id:crypto.randomUUID(),name,cash:1100,skill:0,job:0,joy:40,energy:70,hours:6,social:0,housing:0,place:'APARTMENTS',rulesVersion:2,...(balanceVersion===currentBalanceVersion?{balanceVersion}:{}),craft:0,legacy:0,stories:{},storyWeeks:{}};}
export function score(p:Player){if(p.rulesVersion!==2)return Math.round(Math.min(30,Math.max(0,p.cash)/200)+p.job/3*20+Math.min(6,p.skill)/6*20+p.joy/100*30);return Math.round(Math.min(25,Math.max(0,p.cash)/200)+Math.max(...pathPoints(p).map(v=>v.points))+p.joy/100*25+Math.min(10,p.legacy||0));}
export function reason(p:Player,id:string,g?:Game){
 const original=actions.find(x=>x.id===id);if(!original)return'Unknown action';const a=activityForPlayer(p,original,g);
 const narrativeBlock=storyActionReason(g,p,id)||economyDisabled(p,a,g);if(narrativeBlock)return narrativeBlock;
 if(p.world&&!visiblePlaces(p,g).includes(a.place))return'This place is not on your current map';
 if(p.world&&p.world.region!=='alder'&&a.story)return'This friend is back in Alder Quay. Return there for this chapter.';
 if(a.modernOnly&&p.rulesVersion!==2)return'Available in new neighborhood games';
 if(a.story){const stage=p.stories?.[a.story]||0;if(stage>=(a.stage||0))return'Chapter complete';if(stage!==(a.stage||1)-1)return'You are still getting to know this neighbor';if(g&&p.storyWeeks?.[a.story]===g.round)return 'This neighbor has other plans just now';}
 if(a.special&& !g)return'Open the neighborhood board';
 if(a.special==='opportunity'&&g&&g.opportunityClaim&&g.opportunityClaim.round===g.round)return`Claimed by ${g.opportunityClaim.name}`;
 if(a.special==='project'&&g){if(g.project?.completed)return'The garden is complete';if(g.project?.lastWeek[p.id]===g.round)return hasModernEconomy(p)?'You already helped this month':'You already helped this week';}
 if(p.hours<a.time)return hasModernEconomy(p)?'Not enough priority blocks this month':'Not enough time this week';if(a.cost>0&&p.cash<a.cost)return'Not enough cash for the upfront cost';if(a.housing===p.housing)return'You already have a studio';if(p.energy<effects(p,a,g).requiredEnergy){const e=effects(p,a,g);if('exposureUsed' in e.weather)return e.weather.exposureUsed>0?`Needs ${e.requiredEnergy} energy including weather; rest at home first`:'Rest before this activity';return getWeather(g,p)?.type==='heat'&&e.weather.applies?`Needs ${e.requiredEnergy} energy including the heat adjustment; rest first`:'Rest before this activity';}if(a.skill&&p.skill>=6)return'All six skills earned';if(a.craft&&(p.craft||0)>=8)return'All eight craft levels earned';
 if(a.needSkill&&p.skill<a.needSkill&&!(p.rulesVersion===2&&a.id==='career_contract'))return`Needs ${a.needSkill} skills (you have ${p.skill})`;if(a.needSocial&&p.social<a.needSocial)return`Needs ${a.needSocial} connections (you have ${p.social})`;if(a.needCraft&&(p.craft||0)<a.needCraft)return`Needs ${a.needCraft} craft levels`;
 if(a.promote&&(p.job===3||p.skill<jobs[p.job+1].need))return p.job===3?'You already have the top role':`Needs ${jobs[p.job+1].need} skills`;return'';
}
export function availableActions(p:Player,place:string,g?:Game){return actions.map(a=>activityForPlayer(p,a,g)).filter(a=>a.place===place&&visiblePlaces(p,g).includes(place)&&(!p.world||p.world.region==='alder'||!a.story)&&(!a.modernOnly||p.rulesVersion===2)&&(!a.story||(p.stories?.[a.story]||0)===(a.stage||1)-1));}
export function move(g:Game,id:string,destination?:string){
 const p=g.players[g.turn];moveCore(g,id,destination);if(p)recordMotiveEvidence(g,p,id);
}
function moveCore(g:Game,id:string,destination?:string){
 if(g.status!=='playing')throw Error('The game is not running');const p=g.players[g.turn];if(p.place==='HOME')p.place='APARTMENTS';
 if(g.motivesVersion===1&&id.startsWith('motive:')){resolveMotiveChoice(g,p,id);recordLifeProgress(g,p);return;}
 if(g.castVersion===1&&id.startsWith('cast:')){resolveCastChoice(g,p,id);recordLifeProgress(g,p);return;}
 if(id==='visit'){if(!visiblePlaces(p,g).includes(destination||''))throw Error('That place is undiscovered or closed here');if(!actions.some(a=>a.place===destination))throw Error('Choose a place on the map');p.place=destination!;g.log.unshift(`${p.name} arrived at ${destination}`);g.log=g.log.slice(0,32);return;}
 if(g.storyVersion===1&&id.startsWith('story:')){const parts=id.split(':');if(parts.length!==3)throw Error('Unknown story response');if(p.story?.receipts.some(r=>r.sceneId===parts[1]&&r.choiceId===parts[2]))return;resolveStoryChoice(g,p,parts[1],parts[2]);afterWorldAction(g,p,id);recordLifeProgress(g,p);return;}
 if(g.lifeVersion===1&&id.startsWith('world:')){if(p.world?.acceptedChoices.includes(id.slice(6)))return;resolveWorldChoice(g,p,id.slice(6));recordLifeProgress(g,p);return;}
 if(g.lifeVersion===1&&id.startsWith('event:')){if(p.life?.receipts.some(r=>r.resolved?.choiceId===id.slice(6)))return;resolveLifeChoice(g,p,id.slice(6));afterWorldAction(g,p,id);recordLifeProgress(g,p);return;}
 if(g.lifeVersion===1&&id.startsWith('repair:')){const npc=id.slice(7);if(!['mina','eli','jo'].includes(npc))throw Error('Unknown neighbor');repairRelationship(g,p,npc as LifeNpc);afterWorldAction(g,p,id);recordLifeProgress(g,p);return;}
 if(g.lifeVersion===1&&id.startsWith('home_repair:')){const method=id.slice(12);if(method!=='paid'&&method!=='diy')throw Error('Unknown repair method');repairHome(g,p,method);recordLifeProgress(g,p);return;}
 if(g.lifeVersion===1&&id.startsWith('aspire:')){selectAspiration(g,p,id.slice(7));return;}
 if(id==='end'){
  endCastMonth(g,p);
  if(g.lifeVersion===1){deferLifeChoice(g,p);recordLifeProgress(g,p);}
  const bill=monthlyBills(p);p.cash-=bill.total;p.joy=Math.min(100,p.joy+(p.housing?6:0));p.energy=Math.min(100,p.energy+16);p.joy=Math.max(0,p.joy-4);if(p.cash<0)p.joy=Math.max(0,p.joy-8);
  g.log.unshift(`${p.name} paid $${bill.rent} rent + $${bill.food} food${bill.essentials?` + $${bill.essentials} essentials`:""}${hasModernEconomy(p)?" for the month":""}. ${p.cash<0?'Overdraft: −8 happiness.':''}`);
  let nextWeek=false;
  if(g.rulesVersion===2){g.turnsTaken=(g.turnsTaken||0)+1;nextWeek=g.turnsTaken>=g.players.length;g.turn=(g.turn+1)%g.players.length;}else{g.turn++;nextWeek=g.turn>=g.players.length;}
  if(nextWeek){g.turn=0;g.round++;if(g.round>g.maxRounds){g.status='finished';g.round=g.maxRounds;for(const q of g.players)recordLifeProgress(g,q);g.log.unshift(g.lifeVersion===1?`Eight ${hasModernEconomy(g)?'months':'weeks'}, a thousand little choices. There is more life ahead.`:'Eight weeks, a thousand little choices. Time to compare lives!');return;}
   if(g.rulesVersion===2){g.turnsTaken=0;g.turn=(g.round-1)%g.players.length;g.log.unshift(`${g.players[g.turn].name} has first choice this ${hasModernEconomy(g)?'month':'week'}.`);}
   const weather=getWeather(g);if(weather){for(const q of g.players)q.weatherUsage={round:g.round,joy:0,heat:0,recovery:0};g.log.unshift(`${weather.timeSkip?weather.timeSkip+' ':''}${weather.label}. A representative ${hasModernEconomy(g)?'month':'week'}; no bills for the time skip.`);}
   if(g.lifeVersion===1){beginLifeWeek(g);beginWorldWeek(g);arriveStoryWeek(g);for(const q of g.players)recordLifeProgress(g,q);}else{g.event=(g.round-1)%events.length;const e=events[g.event];for(const q of g.players){q.cash+=e.cash;q.joy=Math.min(100,Math.max(0,q.joy+e.joy));}g.log.unshift(e.title+': '+e.text);}
  }
  g.players[g.turn].hours=6;g.log=g.log.slice(0,32);return;
 }
 const error=reason(p,id,g);if(error)throw Error(error);const a=activityForPlayer(p,actions.find(x=>x.id===id)!,g);if(p.place!==a.place)throw Error('Visit this place on the map first');const e=effects(p,a,g);recordEconomyWork(p,a,g);recordEconomyHabit(p,a,g);if('exposureUsed' in e.weather)consumeClimateEffect(p,g,e.weather);else consumeWeather(p,a,g);consumeRegionalParticipation(p,g,e.participation?.joy||0);p.hours-=a.time;p.cash+=e.cash;p.energy+=e.energy;p.joy+=e.joy;p.skill+=e.skill;p.social+=e.social;if(p.rulesVersion===2)p.craft=(p.craft||0)+e.craft;if(a.housing!==undefined)p.housing=a.housing;if(a.promote)p.job++;
 if(hasCurrentBalance(p)&&a.id==='community_organize')p.communityWork={round:g.round,count:communityDaysThisWeek(p,g)+1};
 if(g.lifeVersion===1&&p.life){p.life.activityCounts??={};p.life.activityCounts[a.id]=(p.life.activityCounts[a.id]||0)+1;}
 if(a.story){if(g.lifeVersion===1)recordLifeStory(g,p,a.story as LifeNpc,a.stage!);p.stories={...p.stories,[a.story]:a.stage!};p.storyWeeks={...p.storyWeeks,[a.story]:g.round};if(a.stage===3){p.legacy=Math.min(10,(p.legacy||0)+2);g.log.unshift(`${p.name} completed ${neighbors.find(n=>n.id===a.story)!.name}’s story: +2 legacy and a keepsake.`);}}
 if(a.special==='opportunity')g.opportunityClaim={round:g.round,playerId:p.id,name:p.name};
 if(a.special==='project'){
  g.project??={contributions:{},lastWeek:{},completed:false};g.project.contributions[p.id]=(g.project.contributions[p.id]||0)+1;g.project.lastWeek[p.id]=g.round;
  if(projectProgress(g)>=projectGoal(g)){g.project.completed=true;for(const q of g.players)if(g.project.contributions[q.id]){q.cash+=economyGardenReward(q);q.legacy=Math.min(10,(q.legacy||0)+4);}g.log.unshift(`The shared garden is open! Every contributor earned $${economyGardenReward(p)} and +4 legacy.`);}
 }
 if(g.lifeVersion===1){storyAfterAction(g,p,id);afterWorldAction(g,p,id);for(const q of g.players)recordLifeProgress(g,q);}
 g.log.unshift(`${p.name}: ${a.title}${e.cash>0?` (+$${e.cash})`:''}${a.promote?` — ${jobs[p.job].name}, $${economyHourlyRate(p)}/hour`:''}`);g.log=g.log.slice(0,32);
}
