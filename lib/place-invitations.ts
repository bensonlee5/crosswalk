/** Presentation only: every invitation is checked against the unchanged game rules. */
import { economyQuote,economyTimeLabel,monthlyBills } from './economy.ts';
import { actionPreview } from './game-view.ts';
import type { Activity,Game,Player } from './game.ts';
import { actions,activityForPlayer,availableActions,projectGoal,projectProgress,reason } from './game.ts';
import { monthlyPriceBreakdown } from './monthly-prices.ts';
import { regionalLifeProfile } from './regional-life.ts';
export const placeStories:Record<string,{promise:string;scene:string;motif:string;material:string;first:string[]}>= {
 'APARTMENTS':{promise:'A place to feel like yourself',scene:'A record turns beside the kitchen shelf; a monstera leans toward the window. Put the kettle on and settle into your own corner of town.',motif:'A note on the kitchen table',material:'linen',first:['home_reset','home_meal','home_host','move']},
 'WORK':{promise:'Make room for the life you want',scene:'A desk lamp clicks on beside the shift ledger. A swivel chair rolls back; there is work to do and a paycheck to bring home.',motif:'The shift book',material:'ledger',first:[]},
 'CAMPUS':{promise:'A little learning. A new direction.',scene:'Spiral notebooks and pencil-marked diagrams cover the classroom tables. The door is open; pull up a chair.',motif:'Notes from the classroom',material:'notebook',first:[]},
 'CAREER HUB':{promise:'Let your experience open a door',scene:'Interview times and local vacancies overlap on a cork noticeboard. Start a conversation or prepare for your next role.',motif:'Pinned to the careers board',material:'pinboard',first:['career_network']},
 'CORNER CAFÉ':{promise:'A familiar face. A fresh story.',scene:'Espresso cups clink against their saucers. There is a window seat for a quiet moment and a table for your people.',motif:'Today on the chalkboard',material:'chalk',first:['friends','cafe_break','cafe_openmic']},
 'COMMUNITY':{promise:'Find your place in the neighborhood',scene:'Someone unfolds a chair beside the pantry cartons. A handwritten rota leaves room for another name, if you have time to help.',motif:'The neighborhood noticeboard',material:'pinboard',first:['volunteer','community_setup','community_lead']},
 'THE PARK':{promise:'A little room to breathe',scene:'Leaves brush the back of an empty slatted bench. Take the long path around; the town can wait a little.',motif:'Beneath the trees',material:'leaf',first:['rest','park_read','park_picnic','park_run']},
 'LIBRARY':{promise:'Grow your world without spending a dollar',scene:'A returned paperback lies spine-up beside the reading lamp. Borrow a story, learn at your own pace, or meet the book club.',motif:'A bookmark for your afternoon',material:'book',first:['library_read','library_club']},
 'MARKET':{promise:'Good food and everyday possibilities',scene:'Carrots and onions fill the wooden crates; paper flour sacks stand behind the counter. Try a recipe or lend a stallholder a hand.',motif:'From the market stall',material:'gingham',first:['market_taste','market_cook']},
 'FITNESS':{promise:'Give yourself a little care',scene:'Rolled exercise mats lean beside the dumbbell rack. Stretch, recover, or share a little effort with a friend.',motif:'A moment on the studio mat',material:'linen',first:['gym_yoga','gym_sauna','gym_train']},
 'MAKERSPACE':{promise:'Turn practice into something of your own',scene:'Copper offcuts catch the light beside a bench vise and a file. There is room for a first repair or a well-earned commission.',motif:'A sketch pinned to the workbench',material:'blueprint',first:['creative_practice','maker_hobby','maker_repair']},
 'CINEMA':{promise:'Step into another story',scene:'The marquee glows; warm salted popcorn scents the foyer. A good film can make an ordinary afternoon feel different.',motif:'Now showing',material:'ticket',first:['cinema_matinee','cinema_club','cinema_friends']},
 'TRANSIT':{promise:'A change of scene starts here',scene:'A bicycle with a wire basket leans by the parcel desk. Take a new route, help the street crew, or turn a spare hour into a gig.',motif:'A route worth taking',material:'route',first:['transit_scenic','transit_cleanup']},
 'GARDEN':{promise:'Grow a little good together',scene:'A hand fork and a watering can rest beside the seed trays. Stay for a slow afternoon or help tend a garden for the block.',motif:'A hand-painted garden sign',material:'leaf',first:['garden_tend','garden_rest','garden_workshop','garden_project']},
 'ARCADE':{promise:'Make room for a little play',scene:'Pinball lamps flash beside a table set with cards and wooden counters. Pick an old favorite or find some new company.',motif:'One more good game',material:'ticket',first:['arcade_play','arcade_tabletop','arcade_host']}
};
const dollars=(n:number)=>'$'+n.toLocaleString('en-US');
export const placeStory=(place:string)=>placeStories[place]||placeStories.APARTMENTS;
/** Select a legal welcome without reordering the full activity catalogue. Explicit deep links stay selected. */
export function firstPlaceAction(p:Player,place:string,g:Game,requested?:string|null){
 const options=availableActions(p,place,g);
 if(requested&&options.some(a=>a.id===requested))return requested;
 const priorities=[...placeStory(place).first];
 if(p.energy<30)priorities.unshift(...options.filter(a=>(a.energy||0)>0).sort((a,b)=>b.energy!-a.energy!).map(a=>a.id));
 return priorities.find(id=>options.some(a=>a.id===id)&&!reason(p,id,g))||options.find(a=>!reason(p,a.id,g))?.id||priorities.find(id=>options.some(a=>a.id===id))||options[0]?.id||'';
}
export function choiceTerms(p:Player,a:Activity,g:Game){
 a=activityForPlayer(p,a,g);
 const v=actionPreview(p,a.id,g),incoming=v.cash+a.cost,quote=economyQuote(p,a,g);
 const cash=quote.paidHours?`${dollars(quote.gross)} gross · ${dollars(quote.takeHome)} take-home${a.cost?` · ${dollars(a.cost)} upfront · +${dollars(v.cash)} after costs`:''}`:a.cost?`${dollars(a.cost)} upfront${incoming>0?` · ${dollars(incoming)} received · +${dollars(v.cash)} net`:''}`:v.cash>0?`+${dollars(v.cash)} income`:'$0';
 const requirements=[a.needSkill?`${a.needSkill} skills`:'',a.needSocial?`${a.needSocial} connections`:'',a.needCraft?`${a.needCraft} craft`:'',v.requiredEnergy>0?`${v.requiredEnergy} energy`:''].filter(Boolean);
 const bill=monthlyBills(a.housing!==undefined?{...p,housing:a.housing}:p);
 const billText=`${dollars(bill.total)} monthly bills (${dollars(bill.rent)} rent + ${dollars(bill.food)} food + ${dollars(bill.essentials)} essentials), ${dollars(bill.total-monthlyBills(p).total)} more each month`;
 return {time:`${economyTimeLabel(p,a.time)}${quote.paidHours?` · ${quote.paidHours} paid hours`:''} · ${v.missingHours?`Needs ${v.missingHours} more priority block${v.missingHours===1?'':'s'}`:`${v.afterHours} left after`}`,cash,unitPrice:monthlyPriceBreakdown(p,a,g),requirements:[requirements.length?'Needs '+requirements.join(' · '):'',quote.reason].filter(Boolean).join(' · '),bills:a.housing!==undefined?billText:'',afterCash:dollars(v.afterCash)+' left after'};
}
export type PlaceInvitation={id:string;place:string;action:string;title:string;reason:string};
/** One real local activity, checked against the current venue and availability. */
export function regionalInvitation(p:Player,g:Game):PlaceInvitation|null{
 const profile=regionalLifeProfile(p,g);if(!profile)return null;
 for(const id of profile.activities){const a=actions.find(a=>a.id===id);if(a&&!reason(p,id,g)&&availableActions(p,a.place,g).some(x=>x.id===id)&&actionPreview(p,id,g).participation?.joy)return{id,place:a.place,action:id,title:profile.invitation,reason:profile.context};}
 return null;
}
