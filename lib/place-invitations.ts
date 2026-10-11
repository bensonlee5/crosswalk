/** Presentation only: every invitation is checked against the unchanged game rules. */
import {actions,availableActions,activityForPlayer,jobs,neighbors,reason,projectGoal,projectProgress} from './game.ts';
import type {Activity,Game,Player} from './game.ts';
import {actionPreview,weekPreview} from './game-view.ts';
import {monthlyPriceBreakdown} from './monthly-prices.ts';
import {regionalLifeProfile} from './regional-life.ts';
import {getWeather} from './weather.ts';
import {economyActivity,economyHourlyRate,economyQuote,economyTimeLabel,hasModernEconomy,monthlyBills} from './economy.ts';
export const placeStories:Record<string,{promise:string;scene:string;motif:string;material:string;first:string[]}>= {
 'APARTMENTS':{promise:'A place to feel like yourself',scene:'A record turns beside the kitchen shelf; a monstera leans toward the window. Put the kettle on and settle into your own corner of town.',motif:'A note on the kitchen table',material:'linen',first:['home_reset','home_meal','home_host','move']},
 'WORK':{promise:'Make room for the life you want',scene:'A desk lamp clicks on beside the shift ledger. A swivel chair rolls back; there is work to do and a paycheck to bring home.',motif:'The shift book',material:'ledger',first:['work','work_short','work_overtime','work_mentor']},
 'CAMPUS':{promise:'A little learning. A new direction.',scene:'Spiral notebooks and pencil-marked diagrams cover the classroom tables. The door is open; pull up a chair.',motif:'Notes from the classroom',material:'notebook',first:['study','campus_group','campus_bootcamp','campus_tutor']},
 'CAREER HUB':{promise:'Let your experience open a door',scene:'Interview times and local vacancies overlap on a cork noticeboard. Start a conversation or prepare for your next role.',motif:'Pinned to the careers board',material:'pinboard',first:['apply','career_network','career_portfolio','career_contract']},
 'CORNER CAFÉ':{promise:'A familiar face. A fresh story.',scene:'Espresso cups clink against their saucers. There is a window seat for a quiet moment and a table for your people.',motif:'Today on the chalkboard',material:'chalk',first:['friends','cafe_break','cafe_openmic','cafe_barista']},
 'COMMUNITY':{promise:'Find your place in the neighborhood',scene:'Someone unfolds a chair beside the pantry cartons. A handwritten rota leaves room for another name, if you have time to help.',motif:'The neighborhood noticeboard',material:'pinboard',first:['volunteer','community_setup','community_lead','community_skill']},
 'THE PARK':{promise:'A little room to breathe',scene:'Leaves brush the back of an empty slatted bench. Take the long path around; the town can wait a little.',motif:'Beneath the trees',material:'leaf',first:['rest','park_read','park_picnic','park_run']},
 'LIBRARY':{promise:'Grow your world without spending a dollar',scene:'A returned paperback lies spine-up beside the reading lamp. Borrow a story, learn at your own pace, or meet the book club.',motif:'A bookmark for your afternoon',material:'book',first:['library_learn','library_read','library_club','library_digitize']},
 'MARKET':{promise:'Good food and everyday possibilities',scene:'Carrots and onions fill the wooden crates; paper flour sacks stand behind the counter. Try a recipe or lend a stallholder a hand.',motif:'From the market stall',material:'gingham',first:['market_shift','market_taste','market_cook','market_resell']},
 'FITNESS':{promise:'Give yourself a little care',scene:'Rolled exercise mats lean beside the dumbbell rack. Stretch, recover, or share a little effort with a friend.',motif:'A moment on the studio mat',material:'linen',first:['gym_yoga','gym_sauna','gym_train','gym_desk']},
 'MAKERSPACE':{promise:'Turn practice into something of your own',scene:'Copper offcuts catch the light beside a bench vise and a file. There is room for a first repair or a well-earned commission.',motif:'A sketch pinned to the workbench',material:'blueprint',first:['creative_practice','maker_hobby','maker_repair','maker_intro','creative_commission','maker_commission']},
 'CINEMA':{promise:'Step into another story',scene:'The marquee glows; warm salted popcorn scents the foyer. A good film can make an ordinary afternoon feel different.',motif:'Now showing',material:'ticket',first:['cinema_matinee','cinema_club','cinema_friends','cinema_usher']},
 'TRANSIT':{promise:'A change of scene starts here',scene:'A bicycle with a wire basket leans by the parcel desk. Take a new route, help the street crew, or turn a spare hour into a gig.',motif:'A route worth taking',material:'route',first:['transit_courier','transit_scenic','transit_cleanup','transit_repair']},
 'GARDEN':{promise:'Grow a little good together',scene:'A hand fork and a watering can rest beside the seed trays. Stay for a slow afternoon or help tend a garden for the block.',motif:'A hand-painted garden sign',material:'leaf',first:['garden_tend','garden_rest','garden_harvest','garden_workshop','garden_project']},
 'ARCADE':{promise:'Make room for a little play',scene:'Pinball lamps flash beside a table set with cards and wooden counters. Pick an old favorite or find some new company.',motif:'One more good game',material:'ticket',first:['arcade_play','arcade_tabletop','arcade_host','arcade_shift']}
};
const dollars=(n:number)=>'$'+n.toLocaleString('en-US');
export const placeStory=(place:string)=>placeStories[place]||placeStories.APARTMENTS;
/** Select a legal welcome without reordering the full activity catalogue. Explicit deep links stay selected. */
export function firstPlaceAction(p:Player,place:string,g:Game,requested?:string|null){
 const options=availableActions(p,place,g);
 if(requested&&options.some(a=>a.id===requested))return requested;
 const priorities=[...placeStory(place).first];
 if(place==='MAKERSPACE'&&(p.craft||0)>=3)priorities.unshift('creative_commission');
 if(p.energy<30)priorities.unshift(...options.filter(a=>(a.energy||0)>0).sort((a,b)=>b.energy!-a.energy!).map(a=>a.id));
 if(p.cash<weekPreview(p).bills&&place==='WORK'&&p.hours===1)priorities.unshift('work_short');
 return priorities.find(id=>options.some(a=>a.id===id)&&!reason(p,id,g))||options.find(a=>!reason(p,a.id,g))?.id||priorities.find(id=>options.some(a=>a.id===id))||options[0]?.id||'';
}
export function choiceBenefit(p:Player,a:Activity,g:Game){
 a=economyActivity(p,activityForPlayer(p,a,g),g);
 const v=actionPreview(p,a.id,g);
 if(a.promote)return p.job<3?`${jobs[p.job+1].name} · ${dollars(economyHourlyRate(p,p.job+1))}/hour`:'Your career has reached the top role';
 if(a.housing!==undefined)return `A studio of your own · +6 happiness each ${hasModernEconomy(p)?'month':'week'}`;
 if(a.story)return 'Spend time with '+neighbors.find(n=>n.id===a.story)!.name;
 if(a.special==='project')return g.project?.completed?'The neighborhood garden is open':projectProgress(g)+1>=projectGoal(g)?'Your contribution can open the shared garden':'Help build a garden for the block';
 if(v.cash>0)return `${dollars(v.cash)} ${hasModernEconomy(p)&&economyQuote(p,a,g).paidHours?'take-home'+(a.cost?' after costs':''):a.cost?'net income':'income'}${a.workHours?' toward the life you want':''}`;
 if(v.craft>0)return `+${v.craft} craft · ${(p.craft||0)+v.craft<3?'build toward commissions':'grow your creative path'}`;
 if(v.skill>0)return `+${v.skill} career skill${v.skill>1?'s':''} · ${a.id==='library_learn'?'learn without a course fee':a.id==='study'?'less time than free library study':'open new possibilities'}`;
 if(v.energy>0)return `+${v.energy} energy${v.joy>0?` · +${v.joy} happiness`:''}`;
 if(v.social>0)return `+${v.social} connection${v.social>1?'s':''}${v.joy>0?` · +${v.joy} happiness`:''}`;
 return v.joy>0?`+${v.joy} happiness · a little time for yourself`:'A little time for yourself';
}
export function choiceTerms(p:Player,a:Activity,g:Game){
 a=economyActivity(p,activityForPlayer(p,a,g),g);
 const v=actionPreview(p,a.id,g),incoming=v.cash+a.cost,modern=hasModernEconomy(p),quote=economyQuote(p,a,g);
 const cash=modern&&quote.paidHours?`${dollars(quote.gross)} gross · ${dollars(quote.takeHome)} take-home${a.cost?` · ${dollars(a.cost)} upfront · +${dollars(v.cash)} after costs`:''}`:a.cost?`${dollars(a.cost)} upfront${incoming>0?` · ${dollars(incoming)} received · +${dollars(v.cash)} net`:''}`:v.cash>0?`+${dollars(v.cash)} income`:'$0';
 const requirements=[a.needSkill&&!(p.rulesVersion===2&&a.id==='career_contract')?`${a.needSkill} skills`:'',a.needSocial?`${a.needSocial} connections`:'',a.needCraft?`${a.needCraft} craft`:'',a.promote&&p.job<3?`${jobs[p.job+1].need} skills`:'',v.requiredEnergy>0?`${v.requiredEnergy} energy`:''].filter(Boolean);
 const currentBills=weekPreview(p).bills;
 const afterBills=a.housing!==undefined?weekPreview({...p,housing:a.housing}).bills:currentBills;
 const bill=monthlyBills(a.housing!==undefined?{...p,housing:a.housing}:p);
 const billText=modern?`${dollars(bill.total)} monthly bills (${dollars(bill.rent)} rent + ${dollars(bill.food)} food + ${dollars(bill.essentials)} essentials), ${dollars(bill.total-monthlyBills(p).total)} more each month`:`${dollars(afterBills)} weekly bills (${dollars(afterBills-85)} rent + $85 food), ${dollars(afterBills-currentBills)} more each week`;
 return {time:modern?`${economyTimeLabel(p,a.time)}${quote.paidHours?` · ${quote.paidHours} paid hours`:''} · ${v.missingHours?`Needs ${v.missingHours} more priority block${v.missingHours===1?'':'s'}`:`${v.afterHours} left after`}`:`${a.time} time · ${v.missingHours?`Needs ${v.missingHours} more time block${v.missingHours===1?'':'s'}`:`${v.afterHours} left after`}`,cash,unitPrice:monthlyPriceBreakdown(p,a,g),requirements:[requirements.length?'Needs '+requirements.join(' · '):'',modern?quote.reason:''].filter(Boolean).join(' · '),bills:a.housing!==undefined?billText:'',afterCash:dollars(v.afterCash)+' left after'};
}
export type PlaceInvitation={id:string;place:string;action:string;title:string;reason:string};
/** One real local activity, independent of legacy invitation surfaces hidden in story rooms. */
export function regionalInvitation(p:Player,g:Game):PlaceInvitation|null{
 const profile=regionalLifeProfile(p,g);if(!profile)return null;
 for(const id of profile.activities){const a=actions.find(a=>a.id===id);if(a&&!reason(p,id,g)&&availableActions(p,a.place,g).some(x=>x.id===id)&&actionPreview(p,id,g).participation?.joy)return{id,place:a.place,action:id,title:profile.invitation,reason:profile.context};}
 return null;
}
export function mapInvitations(p:Player,g:Game):PlaceInvitation[]{
 const out:PlaceInvitation[]=[];
 const add=(id:string,title:string,why:string)=>{const a=actions.find(a=>a.id===id);if(a&&!reason(p,id,g)&&availableActions(p,a.place,g).some(x=>x.id===id)&&!out.some(i=>i.place===a.place))out.push({id,place:a.place,action:id,title,reason:why});};
 if(p.energy<32)add('rest','A quiet walk could help','Free recovery under the trees');
 if(p.job<3&&p.skill>=jobs[p.job+1].need)add('apply',`You’re ready for ${jobs[p.job+1].name}`,`${dollars(economyHourlyRate(p,p.job+1))}/hour in your next role`);
 if(p.cash<weekPreview(p).bills)add(p.hours>=2?'work':'work_short','A little room for the bills',`${dollars(weekPreview(p).bills)} due at the end of your ${hasModernEconomy(p)?'month':'week'}`);
 if(p.rulesVersion===2&&g.project&&!g.project.completed&&projectProgress(g)+1>=projectGoal(g))add('garden_project','One more pair of hands','Your contribution can open the garden');
 if(p.rulesVersion===2&&(p.craft||0)===2)add('creative_practice','One more practice','Craft 3 opens creative commissions');
 const local=regionalInvitation(p,g);if(local)add(local.action,local.title,local.reason);
 const w=getWeather(g,p);
 const weatherId=w?.type==='sun'?'rest':w?.type==='rain'?'cafe_break':w?.type==='cold'||w?.type==='snow'?'library_read':null;
 if(weatherId){const v=actionPreview(p,weatherId,g);if(v.weather.joy>0||v.weather.energy>0)add(weatherId,w?.type==='sun'?'A good day for the slow route':w?.type==='rain'?'A good day for a window seat':'A book and a warm corner',v.weather.joy>0?`+${v.weather.joy} weather happiness included`:`+${v.weather.energy} winter recovery included`);}
 if(p.rulesVersion===2){const ordered=[...neighbors].sort((a,b)=>(p.stories?.[b.id]||0)-(p.stories?.[a.id]||0));for(const n of ordered){const stage=p.stories?.[n.id]||0;if(stage<3)add(`story_${n.id}_${stage+1}`,stage?`${n.name} has another chapter to share`:`Meet ${n.name}`,n.chapters[stage].title);}}
 for(const [id,title,why] of [['library_learn','Follow a new curiosity','Free learning, at your own pace'],['creative_practice','Make a small beginning','Build craft at the workbench'],['library_read','A little breathing room','A free book and a quiet seat'],['work_short',hasModernEconomy(p)?'A shorter commitment, a paycheck':'A spare hour, a paycheck',hasModernEconomy(p)?'40 paid hours across the month':'A shorter shift at your current wage'],['home_reset','Come home to yourself','A free reset in your own space']]){if(out.length>=3)break;add(id,title,why);}
 return out.slice(0,3);
}
export function neighborAtPlace(p:Player,place:string,g:Game){
 if(p.rulesVersion!==2||p.world&&p.world.region!=='alder')return null;
 const n=neighbors.find(n=>n.place===place);if(!n)return null;
 const stage=p.stories?.[n.id]||0;
 if(stage===3)return{neighbor:n,text:`${n.name} is a familiar face now. You share three chapters and a ${n.keepsake.toLowerCase()}.`,action:null};
 const id=`story_${n.id}_${stage+1}`,lock=reason(p,id,g);
 return{neighbor:n,text:p.storyWeeks?.[n.id]===g.round?`${n.name} has other plans just now.`:n.chapters[stage].title,action:lock?null:id};
}
export function afterChoiceInvitation(before:Player,p:Player,g:Game):PlaceInvitation|null{
 if(p.job<3&&before.skill<jobs[p.job+1].need&&p.skill>=jobs[p.job+1].need&&!reason(p,'apply',g))return{id:'apply',place:'CAREER HUB',action:'apply',title:'A new door at Next Step',reason:`You can now apply for ${jobs[p.job+1].name} at ${dollars(economyHourlyRate(p,p.job+1))}/hour`};
 if((before.craft||0)<3&&(p.craft||0)>=3&&!reason(p,'creative_commission',g))return{id:'creative_commission',place:'MAKERSPACE',action:'creative_commission',title:'Your first commission is within reach',reason:'Your craft is ready for paid creative work'};
 for(const n of neighbors)if(g.round<g.maxRounds&&(p.stories?.[n.id]||0)>(before.stories?.[n.id]||0)&&p.stories![n.id]<3)return{id:'story_'+n.id,place:n.place,action:'',title:`Time with ${n.name}`,reason:`You shared a good moment with ${n.name}.`};
 return null;
}
