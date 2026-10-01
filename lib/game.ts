export type Player={id:string;name:string;cash:number;skill:number;job:number;joy:number;energy:number;hours:number;social:number;housing:number;place:string};
export type Game={code:string;mode:'hotseat'|'online';host:string;members:Record<string,string[]>;players:Player[];status:'lobby'|'playing'|'finished';round:number;turn:number;maxRounds:number;log:string[];seen:string[];event:number};
export const jobs=[{name:'Café crew',rate:20,need:0},{name:'IT support',rate:29,need:2},{name:'UX specialist',rate:43,need:4},{name:'Project lead',rate:58,need:6}];
export const events=[{title:'The little wins',text:'Someone remembered your coffee order. Everyone gets +4 happiness.',cash:0,joy:4},{title:'Transit fare week',text:'A city pass costs everyone $30 this week.',cash:-30,joy:0},{title:'Neighborhood night',text:'The block throws a free movie night. Everyone gets +6 happiness.',cash:0,joy:6},{title:'Energy bill bump',text:'Heating, cooling, and an extra $45 for everyone.',cash:-45,joy:0},{title:'Found money',text:'An old deposit is returned. Everyone gets $90.',cash:90,joy:0},{title:'Group chat gold',text:'The memes are exceptionally good. Everyone gets +3 happiness.',cash:0,joy:3},{title:'Groceries on sale',text:'Seasonal produce saves everyone $35.',cash:35,joy:0},{title:'A sunny finish',text:'A beautiful final week. Everyone gets +5 happiness.',cash:0,joy:5}];
export type Activity={id:string;title:string;place:string;icon:string;time:number;cost:number;desc:string;color:string;energy?:number;joy?:number;skill?:number;social?:number;earn?:number;workHours?:number;needSkill?:number;needSocial?:number;housing?:number;promote?:boolean};
const activity=(place:string,color:string,rows:Omit<Activity,'place'|'color'|'icon'>[]):Activity[]=>rows.map(a=>({...a,place,color,icon:'spark'}));
export const actions:Activity[]=[
...activity('APARTMENTS','mint',[
{id:'move',title:'Get your own place',time:1,cost:200,housing:1,desc:'$620 rent · +6 happiness each week'},
{id:'home_reset',title:'Reset your space',time:1,cost:0,energy:12,joy:7,desc:'Tidy up, put on music and recharge'},
{id:'home_meal',title:'Cook a proper meal',time:1,cost:25,energy:24,joy:4,desc:'A quiet evening and a full fridge'},
{id:'home_host',title:'Host a potluck',time:2,cost:45,joy:20,social:2,desc:'Bring people together around your table'}]),
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
{id:'friends',title:'Meet your people',time:1,cost:35,joy:12,social:1,desc:'Coffee, conversation and a little connection'},
{id:'cafe_break',title:'Take a quiet coffee break',time:1,cost:10,energy:14,joy:8,desc:'A window seat and a moment to yourself'},
{id:'cafe_openmic',title:'Try the open mic',time:2,cost:15,joy:18,social:2,energy:-6,desc:'Trade a few nerves for a good story'},
{id:'cafe_barista',title:'Cover the espresso bar',time:1,cost:0,earn:125,energy:-9,desc:'A quick casual shift, whatever your career'}]),
...activity('COMMUNITY','yellow',[
{id:'volunteer',title:'Lend a hand',time:2,cost:0,joy:15,social:2,desc:'Sort donations with the neighborhood crew'},
{id:'community_setup',title:'Set up the food pantry',time:1,cost:0,joy:7,social:1,energy:-5,desc:'A short, useful contribution'},
{id:'community_lead',title:'Lead a neighborhood event',time:2,cost:30,joy:22,social:3,energy:-10,needSocial:3,desc:'Bring three connections into something bigger'},
{id:'community_skill',title:'Join a community workshop',time:3,cost:30,skill:1,energy:-9,desc:'Affordable learning with a longer time commitment'}]),
...activity('THE PARK','green',[
{id:'rest',title:'Take the slow route',time:1,cost:0,energy:22,joy:5,desc:'A restorative walk under the trees'},
{id:'park_picnic',title:'Pack a picnic with friends',time:2,cost:30,energy:10,joy:20,social:1,desc:'Give your afternoon to good company'},
{id:'park_run',title:'Go for a morning run',time:1,cost:0,energy:-8,joy:12,desc:'Trade physical effort for a clearer head'},
{id:'park_read',title:'Read under a tree',time:2,cost:0,energy:28,joy:10,desc:'An unhurried reset, without spending cash'}]),
...activity('LIBRARY','purple',[
{id:'library_learn',title:'Learn from free resources',time:3,cost:0,skill:1,energy:-12,desc:'Self-directed study trades time for savings'},
{id:'library_read',title:'Get lost in a good book',time:1,cost:0,energy:10,joy:9,desc:'A quiet pocket of happiness'},
{id:'library_club',title:'Join the book club',time:2,cost:0,joy:14,social:2,desc:'Turn a shared story into new connections'},
{id:'library_digitize',title:'Help digitize the archive',time:2,cost:0,earn:150,energy:-8,needSkill:1,desc:'A paid project for someone with a first skill'}]),
...activity('MARKET','orange',[
{id:'market_shift',title:'Cover a market stall',time:2,cost:0,earn:270,energy:-14,social:1,desc:'Casual work with plenty of conversation'},
{id:'market_cook',title:'Take a cooking class',time:2,cost:55,energy:16,joy:16,desc:'A useful evening and something good to eat'},
{id:'market_taste',title:'Explore the tasting stalls',time:1,cost:25,energy:9,joy:12,desc:'Try something delicious and unfamiliar'},
{id:'market_resell',title:'Run a secondhand pop-up',time:2,cost:30,earn:250,energy:-10,needSocial:2,desc:'A $30 stall fee, $250 sales, two connections required'}]),
...activity('FITNESS','green',[
{id:'gym_yoga',title:'Join a gentle yoga class',time:1,cost:20,energy:28,joy:6,desc:'A paid reset with a little extra recovery'},
{id:'gym_train',title:'Train with a friend',time:1,cost:15,energy:-10,joy:15,social:1,desc:'An energizing social habit, with physical effort'},
{id:'gym_sauna',title:'Take a recovery session',time:2,cost:45,energy:48,joy:10,desc:'Deep recovery when the week has worn you down'},
{id:'gym_desk',title:'Cover the front desk',time:2,cost:0,earn:260,energy:-10,desc:'A steady casual shift with a lighter physical load'}]),
...activity('MAKERSPACE','blue',[
{id:'maker_intro',title:'Learn to repair',time:2,cost:90,skill:1,energy:-10,needSkill:2,desc:'Build on two skills at the workbench'},
{id:'maker_commission',title:'Finish a custom commission',time:2,cost:40,earn:370,energy:-18,needSkill:3,needSocial:2,desc:'$40 materials, $370 payout; skill and contacts matter'},
{id:'maker_hobby',title:'Make something just for fun',time:1,cost:30,joy:16,energy:-5,desc:'A small project with no deadline'},
{id:'maker_repair',title:'Help at the repair café',time:2,cost:0,joy:13,social:2,energy:-7,needSkill:1,desc:'Use what you know to help your neighbors'}]),
...activity('CINEMA','pink',[
{id:'cinema_matinee',title:'Catch a matinee',time:1,cost:18,joy:15,energy:5,desc:'A little escape for the price of a ticket'},
{id:'cinema_friends',title:'Make it a movie night',time:2,cost:50,joy:26,social:1,energy:4,desc:'A bigger night out with your people'},
{id:'cinema_usher',title:'Work an usher shift',time:2,cost:0,earn:250,joy:4,energy:-12,desc:'Earn a little and catch the atmosphere'},
{id:'cinema_club',title:'Stay for the film discussion',time:2,cost:12,joy:16,social:2,desc:'Meet other people who love a good story'}]),
...activity('TRANSIT','blue',[
{id:'transit_courier',title:'Take a bicycle courier route',time:1,cost:0,earn:150,energy:-14,desc:'Quick cash, a demanding ride'},
{id:'transit_repair',title:'Repair bikes at the hub',time:2,cost:0,earn:290,energy:-12,needSkill:2,desc:'Turn two practical skills into useful work'},
{id:'transit_scenic',title:'Ride somewhere new',time:1,cost:12,joy:13,energy:6,desc:'A small change of scenery'},
{id:'transit_cleanup',title:'Join the car-free street crew',time:2,cost:0,joy:14,social:3,energy:-12,desc:'Help make the neighborhood easier to explore'}]),
...activity('GARDEN','mint',[
{id:'garden_tend',title:'Tend a shared plot',time:1,cost:0,joy:10,energy:-4,social:1,desc:'Good soil, fresh air and a familiar face'},
{id:'garden_harvest',title:'Help with the harvest',time:2,cost:0,earn:230,joy:8,energy:-16,desc:'Paid seasonal work with a satisfying finish'},
{id:'garden_workshop',title:'Learn urban growing',time:3,cost:50,skill:1,joy:5,energy:-10,desc:'Patient hands-on learning'},
{id:'garden_rest',title:'Spend a slow afternoon here',time:2,cost:0,energy:34,joy:7,desc:'Sit by the greenhouse and let the week settle'}]),
...activity('ARCADE','yellow',[
{id:'arcade_play',title:'Play a few favorites',time:1,cost:20,joy:17,energy:-3,desc:'A small pocket of pure fun'},
{id:'arcade_tabletop',title:'Join a tabletop night',time:2,cost:15,joy:20,social:2,energy:-5,desc:'A shared adventure around one table'},
{id:'arcade_host',title:'Host a game meetup',time:2,cost:25,joy:24,social:3,energy:-8,needSocial:4,desc:'Four connections help fill the seats'},
{id:'arcade_shift',title:'Cover the evening desk',time:2,cost:0,earn:250,social:1,energy:-14,desc:'Keep the games running and meet the regulars'}])
];
export function effects(p:Player,a:Activity){return{cash:(a.workHours?jobs[p.job].rate*a.workHours:(a.earn||0))-a.cost,energy:Math.max(-p.energy,Math.min(a.energy||0,100-p.energy)),joy:Math.max(-p.joy,Math.min(a.joy||0,100-p.joy)),skill:Math.min(a.skill||0,6-p.skill),social:a.social||0};}
export function player(name:string):Player{return{id:crypto.randomUUID(),name,cash:1100,skill:0,job:0,joy:40,energy:70,hours:6,social:0,housing:0,place:'APARTMENTS'};}
export function score(p:Player){return Math.round(Math.min(30,Math.max(0,p.cash)/200)+p.job/3*20+Math.min(6,p.skill)/6*20+p.joy/100*30);}
export function reason(p:Player,id:string){const a=actions.find(x=>x.id===id);if(!a)return'Unknown action';if(p.hours<a.time)return'Not enough time this week';if(a.cost>0&&p.cash<a.cost)return'Not enough cash for the upfront cost';if(a.housing===p.housing)return'You already have a studio';if((a.energy||0)<0&&p.energy<-(a.energy||0))return'Rest before this activity';if(a.skill&&p.skill>=6)return'All six skills earned';if(a.needSkill&&p.skill<a.needSkill)return`Needs ${a.needSkill} skills (you have ${p.skill})`;if(a.needSocial&&p.social<a.needSocial)return`Needs ${a.needSocial} connections (you have ${p.social})`;if(a.promote&&(p.job===3||p.skill<jobs[p.job+1].need))return p.job===3?'You already have the top role':`Needs ${jobs[p.job+1].need} skills`;return'';}
export function move(g:Game,id:string,destination?:string){if(g.status!=='playing')throw Error('The game is not running');const p=g.players[g.turn];if(p.place==='HOME')p.place='APARTMENTS';if(id==='visit'){if(!actions.some(a=>a.place===destination))throw Error('Choose a place on the map');p.place=destination!;g.log.unshift(`${p.name} arrived at ${destination}`);g.log=g.log.slice(0,32);return;}if(id==='end'){p.cash-=p.housing?705:505;p.joy=Math.min(100,p.joy+(p.housing?6:0));p.energy=Math.min(100,p.energy+16);p.joy=Math.max(0,p.joy-4);if(p.cash<0)p.joy=Math.max(0,p.joy-8);g.log.unshift(`${p.name} paid $${p.housing?620:420} rent + $85 food. ${p.cash<0?'Overdraft: −8 happiness.':''}`);g.turn++;if(g.turn>=g.players.length){g.turn=0;g.round++;if(g.round>g.maxRounds){g.status='finished';g.round=g.maxRounds;g.log.unshift('Eight weeks, a thousand little choices. Time to compare lives!');return;}g.event=(g.round-1)%events.length;const e=events[g.event];for(const q of g.players){q.cash+=e.cash;q.joy=Math.min(100,Math.max(0,q.joy+e.joy));}g.log.unshift(e.title+': '+e.text);}g.players[g.turn].hours=6;return;}
const error=reason(p,id);if(error)throw Error(error);const a=actions.find(x=>x.id===id)!;if(p.place!==a.place)throw Error('Visit this place on the map first');const e=effects(p,a);p.hours-=a.time;p.cash+=e.cash;p.energy+=e.energy;p.joy+=e.joy;p.skill+=e.skill;p.social+=e.social;if(a.housing!==undefined)p.housing=a.housing;if(a.promote)p.job++;
g.log.unshift(`${p.name}: ${a.title}${e.cash>0?` (+$${e.cash})`:''}`);g.log=g.log.slice(0,32);}
