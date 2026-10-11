import type {Game,Player} from './game.ts';
import {economyLifeCash,economyCashText,economyThresholds,economyAutomaticLoss,hasModernEconomy,economyWorkReason,recordEconomyPaidHours} from './economy.ts';

/** Opt-in, serializable life events. No runtime imports: game.ts may import this module.
 * Only initializeLife uses randomness, with a server-supplied integer seed. Reads are pure.
 * The existing API remains responsible for authenticated turn ownership and atomic saves.
 */
export type LifeNpc='mina'|'eli'|'jo';
export type LifeEventId='work_reset'|'venue_lost'|'garden_setback'|'repair_bill'|'festival_split'|'commission_dispute'|'crossroads'|'unexpected_patron'|'invitation'|'vacancy';
export type LifeScheduleEntry={week:number;eventId:LifeEventId};
export type LifeRelationship={trust:number;support:boolean;rivalry:boolean;reciprocity:boolean;lastRepairWeek?:number;history:string[]};
export type LifeResources={cash:number;hours:number;energy:number;joy:number;skill:number;social:number;craft:number;job:number;housing:number;legacy:number};
export type LifeRelationshipChange={npc:LifeNpc;support?:boolean;rivalry?:boolean;reciprocity?:boolean};
export type LifeEffects=LifeResources & {trust:Record<LifeNpc,number>;relationshipChanges:LifeRelationshipChange[];flagsAdded:string[];flagsRemoved:string[]};
export type LifeResolution={choiceId:string;title:string;outcome:string;effects:LifeEffects;deferred:boolean};
export type LifeReceipt={week:number;eventId:LifeEventId;kind:'opportunity'|'setback';title:string;body:string;impact:string;effects:LifeEffects;choices:string[];pending:boolean;resolved?:LifeResolution;journal:string[];context:Record<string,number|string|boolean>};
export type LifePlayerState={version:1;relationships:Record<LifeNpc,LifeRelationship>;receipts:LifeReceipt[];flags:string[];storyChapters:Record<string,number>;activityCounts?:Record<string,number>};
export type LifeChoiceView={id:string;title:string;body:string;available:boolean;reason:string;preview:LifeEffects;previewText:string[];outcome:string;safe:boolean};
export type LifeRelationshipView={id:LifeNpc;name:string;role:string;trust:number;support:boolean;rivalry:boolean;reciprocity:boolean;status:string;history:string[];lastRepairWeek?:number};
type LifeGame=Game & {lifeVersion?:number;lifeSeed?:number;lifeSchedule?:LifeScheduleEntry[];storyVersion?:number;economyVersion?:number};
type LifePlayer=Player & {life?:LifePlayerState};
type Proposal=Partial<LifeResources> & {trust?:Partial<Record<LifeNpc,number>>;relationshipChanges?:LifeRelationshipChange[];flagsAdded?:string[];flagsRemoved?:string[]};
type Choice={paidHours?:number;id:string;title:string;body:string;outcome:string;change:Proposal;safe?:boolean;requirement?:string};
type EventStart={title:string;body:string;impact:string;change:Proposal;context?:Record<string,number|string|boolean>};
export const lifeEventIds:LifeEventId[]=['work_reset','venue_lost','garden_setback','repair_bill','festival_split','commission_dispute','crossroads','unexpected_patron','invitation','vacancy'];
export const lifeOpportunityIds:LifeEventId[]=['unexpected_patron','invitation','vacancy'];
export const lifeNpcs:LifeNpc[]=['mina','eli','jo'];
const names:Record<LifeNpc,string>={mina:'Mina',eli:'Eli',jo:'Jo'};
const roles:Record<LifeNpc,string>={mina:'Songwriter and café friend',eli:'Neighborhood grower',jo:'Maker and repair mentor'};
const resourceKeys:(keyof LifeResources)[]=['cash','hours','energy','joy','skill','social','craft','job','housing','legacy'];
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
const emptyRelationship=():LifeRelationship=>({trust:0,support:false,rivalry:false,reciprocity:false,history:[]});
const relation=(p:Player,npc:LifeNpc):LifeRelationship=>(p as LifePlayer).life?.relationships[npc]??emptyRelationship();
const life=(p:Player)=>(p as LifePlayer).life;
const enabled=(g:Game)=>(g as LifeGame).lifeVersion===1;
const storyMode=(g:Game)=>(g as LifeGame).storyVersion===1;
/** Existing saves retain weekly prose; modern rooms expose chapter-months and priority blocks. */
export function lifePeriodText(text:string,g:Game){return (g as LifeGame).economyVersion===1?text.replace(/weeks/g,'months').replace(/Weeks/g,'Months').replace(/week/g,'month').replace(/Week/g,'Month').replace(/(\d+) time\b/g,(_m,n)=>`${n} priority block${n==='1'?'':'s'}`).replace(/(one|two) (focused )?hours?/gi,(_m,n)=>`${n.toLowerCase()==='two'?'two priority blocks':'one priority block'}`):text;}

const hasFlag=(p:Player,flag:string)=>life(p)?.flags.includes(flag)??false;
const currentReceipt=(p:Player,g:Game)=>life(p)?.receipts.find(r=>r.week===g.round);
const good=(p:Player,npc:LifeNpc)=>!relation(p,npc).rivalry&&(relation(p,npc).trust>=1||relation(p,npc).support);
const debt=(p:Player,npc:LifeNpc)=>relation(p,npc).reciprocity;
const finite=(n:number|undefined)=>Number.isFinite(n)?n!:0;

/** Call only for players joining an opted-in room. No existing relationship state is reset. */
export function initializeLifePlayer(p:Player){
 const q=p as LifePlayer;if(q.life)return;
 q.life={version:1,relationships:{mina:emptyRelationship(),eli:emptyRelationship(),jo:emptyRelationship()},receipts:[],flags:[],storyChapters:{}};
}
/** Caller must opt the newly created room in with lifeVersion:1. Unmarked saves are untouched. */
export function initializeLife(g:Game,seed:number){
 const q=g as LifeGame;if(!enabled(g))return;
 if(!q.lifeSchedule){
  let state=finite(seed)>>>0;q.lifeSeed=state;
  const random=()=>{state=(state+0x6D2B79F5)>>>0;let t=state;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};
  const shuffle=(ids:LifeEventId[])=>{for(let i=ids.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]];}return ids;};
  if(storyMode(g)){
   // Public arcs have fixed anchors; private surprises retain a seeded, hidden varied cadence.
   // Avoid duplicate show cancellations, imaginary applications and competing public festivals.
   const opportunities=shuffle(['unexpected_patron','vacancy']).slice(0,random()<.5?1:2);
   const setbacks=shuffle(['work_reset','repair_bill']).slice(0,random()<.5?1:2);
   const chosen=shuffle([...opportunities,...setbacks]);
   const weeks=[2,4,6,8];for(let i=weeks.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[weeks[i],weeks[j]]=[weeks[j],weeks[i]];}
   q.lifeSchedule=chosen.map((eventId,i)=>({week:weeks[i],eventId})).sort((a,b)=>a.week-b.week);
  }else{
  const opportunityCount=random()<.5?2:3;
  const opportunities=shuffle([...lifeOpportunityIds]).slice(0,opportunityCount);
  const setbacks=shuffle(lifeEventIds.filter(id=>!lifeOpportunityIds.includes(id))).slice(0,7-opportunityCount);
  // Sample a valid arrival pattern: 2–3 opportunities and never 3 setbacks consecutively.
  const patterns:number[][]=[];
  for(let mask=0;mask<128;mask++){const pattern=Array.from({length:7},(_,i)=>(mask>>>i)&1);if(pattern.reduce((a,b)=>a+b,0)===opportunityCount&&!pattern.join('').includes('000'))patterns.push(pattern);}
  const pattern=patterns[Math.floor(random()*patterns.length)];
  q.lifeSchedule=pattern.map((isOpportunity,i)=>({week:i+2,eventId:(isOpportunity?opportunities.shift():setbacks.shift())!}));
  }
 }
 for(const p of g.players)initializeLifePlayer(p);
}

/** Exact effective deltas after clamps; safe initial cash losses cannot deepen an overdraft. */
function preview(p:Player,change:Proposal,automatic=false):LifeEffects{
 const result={cash:0,hours:0,energy:0,joy:0,skill:0,social:0,craft:0,job:0,housing:0,legacy:0,trust:{mina:0,eli:0,jo:0},relationshipChanges:[],flagsAdded:[],flagsRemoved:[]} as LifeEffects;
 for(const key of resourceKeys){
  const before=finite(p[key as keyof Player] as number|undefined);let delta=finite(change[key]);
  if(key==='cash'){if(automatic&&delta<0)delta=economyAutomaticLoss(p,delta);result.cash=delta;continue;}
  const max=key==='hours'?6:key==='energy'||key==='joy'?100:key==='skill'?6:key==='craft'?8:key==='job'?3:key==='housing'?1:key==='legacy'?10:Infinity;
  result[key]=clamp(before+delta,0,max)-before;
 }
 for(const npc of lifeNpcs)result.trust[npc]=clamp(relation(p,npc).trust+(change.trust?.[npc]??0),-3,3)-relation(p,npc).trust;
 for(const delta of change.relationshipChanges??[]){
  const next:LifeRelationshipChange={npc:delta.npc};let changed=false;
  for(const key of ['support','rivalry','reciprocity'] as const)if(delta[key]!==undefined&&delta[key]!==relation(p,delta.npc)[key]){next[key]=delta[key];changed=true;}
  if(changed)result.relationshipChanges.push(next);
 }
 result.flagsAdded=(change.flagsAdded??[]).filter(flag=>!hasFlag(p,flag));
 result.flagsRemoved=(change.flagsRemoved??[]).filter(flag=>hasFlag(p,flag));
 return result;
}
/** Apply exactly the already-previewed deltas. Never call while rendering. */
function apply(p:Player,e:LifeEffects,note:string){
 const state=life(p);if(!state)throw Error('Life events are not initialized');
 for(const key of resourceKeys){if(e[key]!==0)(p as unknown as Record<string,number>)[key]=finite(p[key as keyof Player] as number|undefined)+e[key];}
 for(const npc of lifeNpcs){const r=state.relationships[npc];r.trust+=e.trust[npc];if(e.trust[npc]!==0)r.history.push(note);}
 for(const delta of e.relationshipChanges){const r=state.relationships[delta.npc];for(const key of ['support','rivalry','reciprocity'] as const)if(delta[key]!==undefined)r[key]=delta[key]!;if(r.history.at(-1)!==note)r.history.push(note);}
 state.flags=state.flags.filter(flag=>!e.flagsRemoved.includes(flag));for(const flag of e.flagsAdded)if(!state.flags.includes(flag))state.flags.push(flag);
 for(const npc of lifeNpcs)state.relationships[npc].history=state.relationships[npc].history.slice(-12);
}
export function lifeEffectText(e:LifeEffects):string[]{
 const labels:Record<keyof LifeResources,string>={cash:'cash',hours:'time',energy:'energy',joy:'happiness',skill:'skill',social:'connections',craft:'craft',job:'career level',housing:'housing level',legacy:'legacy'};
 const lines:string[]=[];
 for(const key of resourceKeys)if(e[key])lines.push(`${e[key]>0?'+':'−'}${key==='cash'?'$':''}${Math.abs(e[key])} ${labels[key]}`);
 for(const npc of lifeNpcs)if(e.trust[npc])lines.push(`${names[npc]} trust ${e.trust[npc]>0?'+':''}${e.trust[npc]}`);
 for(const c of e.relationshipChanges)for(const key of ['support','rivalry','reciprocity'] as const)if(c[key]!==undefined)lines.push(`${names[c.npc]}: ${key==='support'?(c[key]?'support unlocked':'support paused'):key==='rivalry'?(c[key]?'rivalry begins':'rivalry eased'):(c[key]?'favor to return':'favor returned')}`);
 for(const flag of e.flagsAdded)lines.push(`Path: ${flag.replaceAll('_',' ')}`);
 for(const flag of e.flagsRemoved)lines.push(`Resolved: ${flag.replaceAll('_',' ')}`);
 return lines.length?lines:['No resource or trust change'];
}
function log(g:Game,message:string){g.log.unshift(message);g.log=g.log.slice(0,32);}
function active(g:Game,p:Player){
 if(!enabled(g))throw Error('Life events are available in new neighborhood games');
 if(g.status!=='playing')throw Error('The game is not running');
 if(g.players[g.turn]?.id!==p.id||!g.players.includes(p))throw Error('It is another player’s turn');
 if(!life(p))throw Error('Life events are not initialized');
}

function rawStartEvent(p:Player,eventId:LifeEventId):EventStart{
 const ally=(npc:LifeNpc)=>good(p,npc),craft=p.craft??0;
 switch(eventId){
 case 'unexpected_patron':return{title:'An envelope, finally',body:'A delayed neighborhood grant unexpectedly comes through. Everyone receives a share, with extra help for people whose cash buffer is thin. Jo says it could buy a beginning, not just another bill.',impact:p.cash<economyThresholds(p).hardship?'Your larger hardship payment creates room to breathe, and perhaps to try something you kept postponing.':p.housing?'Your household receives a modest grant. Stability gives you choices about what this money could make possible.':craft>=3?'The grant could buy materials for work nobody has commissioned yet. You do not have to wait to be chosen.':'A small grant arrives just as you were deciding what to do next. The money is yours to keep or turn into a first step.',change:{cash:p.cash<economyThresholds(p).hardship?260:p.cash<economyThresholds(p).modest?180:100,joy:6,flagsAdded:['unexpected_grant']}};
 case 'invitation':return{title:'The unplanned invitation',body:'Mina’s collaborator cancels before a small showcase. She asks you to bring whatever you actually do, even if you have never thought of it as a performance.',impact:craft>=3?'An opening for your creative work arrives before it feels completely ready. This could become a different kind of life.':p.skill>=3?'Your practical knowledge could become a surprisingly good workshop. You had not thought of yourself as someone with an audience.':p.social>=6?'Mina wants the story of the people you brought together. For once you are being invited into the spotlight.':'You were not looking for a stage. Mina thinks an unfinished idea is enough to begin.',change:{joy:ally('mina')?10:6,social:p.social>=6?1:0,flagsAdded:['unexpected_invitation']}};
 case 'vacancy':return{title:'One empty window',body:'An empty corner shop becomes available for a one-day pop-up, with no long lease. The decision is due this week. Everyone sees a different future through the same window.',impact:p.job>=2?'You imagine somewhere to try an independent service before leaving the security of your job.':craft>=3?'You can see a studio with a public door. A one-day version might fit even when the bigger dream does not.':p.social>=6?'You imagine a room that belongs to the neighborhood. People you already know could help open it.':p.housing?'Your home is a steady base. This could be a small experiment beyond it.':'A whole new direction is suddenly visible, but you are allowed to start smaller than the dream.',change:{joy:7,energy:lifeNpcs.some(n=>good(p,n))?4:0,flagsAdded:['unexpected_opening']}};
 case 'work_reset':{
  const lostRole=p.job>=1;
  return{title:'The rota is rewritten',body:'A major employer cuts a contract. Hours disappear across the neighborhood, and Jo’s workshop loses its maintenance booking.',impact:lostRole?`Your ${p.job===3?'lead':p.job===2?'specialist':'support'} role is cut back one level. Your earned skills remain; you can recover the role or build another route.`:`Your entry-level role is safe, but a cancelled shift takes ${ally('jo')?'a smaller bite thanks to Jo’s referral':'a bite'} out of your buffer.`,change:{cash:lostRole?-(ally('jo')?80:160):-(ally('jo')?40:90),job:lostRole?-1:0,joy:-7,flagsAdded:['career_interrupted']},context:{jobBefore:p.job}};
 }
 case 'venue_lost':return{title:'The stage goes dark',body:'The café loses its evening venue slot. Mina’s first proper showcase is cancelled after weeks of rehearsal. Her dream needs a new shape.',impact:p.social>=6?'Your wider circle has already bought tickets, so you absorb refunds and the disappointment of letting them down.':craft>=3?'You lose the paid opening slot you had been preparing. Your practice still counts.':p.housing?'Your studio could hold a smaller night. Mina asks whether a living-room audience might be enough.':'Without a venue or a big circle, a smaller shared performance may be the way forward.',change:{cash:p.social>=6?-110:craft>=3?-100:-35,joy:ally('mina')?-4:-9,flagsAdded:['mina_show_delayed']}};
 case 'garden_setback':return{title:'A harvest that didn’t happen',body:'The garden’s irrigation pump fails while a produce collection falls through. Eli cannot deliver the pantry harvest everyone expected.',impact:p.social>=6?'You had committed produce to neighbors. Replacing a share costs more, and the failed promise stings.':p.housing?'You were counting on the harvest to stock your own kitchen; you need replacement groceries.':craft>=3?'You recognize a repairable pump, but the lost harvest cannot be brought back.':'Your shared food budget takes a hit. The next planting is still possible.',change:{cash:-(p.social>=6?140:p.housing?100:60)+(ally('eli')?30:0),energy:craft>=3?-3:-7,joy:-5,flagsAdded:['harvest_lost']}};
 case 'repair_bill':return{title:'The unexpected repair',body:'A leak reaches the block’s shared storage. Swollen plywood shelves and rusted hand tools must be repaired before the space can reopen; nobody is hurt.',impact:p.housing?`Your own place needs extra drying and repairs. ${ally('jo')?'Jo helps keep the bill down.':'A bigger home brings a bigger bill.'}`:craft>=3?'Your stored materials take the hardest hit. One craft level is temporarily set back while you rebuild your toolkit.':'Your shared household splits a smaller repair bill, but the disruption drains your energy.',change:{cash:-(p.housing?280:craft>=3?200:120)+(ally('jo')?60:0),craft:!p.housing&&craft>=3?-1:0,energy:-(p.housing?12:8),joy:-5,flagsAdded:['repairs_unfinished']},context:{craftBefore:craft}};
 case 'festival_split':return{title:'One night, two promises',body:'A rescheduled neighborhood fundraiser lands on Mina’s replacement guitar night. Eli needs organizers; Mina needs people who will actually show up.',impact:p.social>=6?'Both groups had counted on your network. Cancelling plans costs your circle a connection and some happiness.':p.job>=2?'Your work deadline makes the clash sharper; you cannot be everywhere this week.':craft>=3?'Your planned display belongs at both events, but you only have one set of work.':'Your smaller circle means fewer promises to undo, though you still have to choose where to stand.',change:{social:p.social>=6?-1:0,energy:p.job>=2?-6:-3,joy:-6,flagsAdded:['promises_collided']}};
 case 'commission_dispute':return{title:'The credit goes missing',body:'A local buyer puts a community-made design under one name and withdraws the shared commission. Jo is furious; the public project will need a different home.',impact:craft>=3?'Your work was central to the commission. Lost materials cost you more, and the missing credit sets back your creative confidence.':p.job>=2?'You spent professional time coordinating the buyer. A cancelled fee and a public awkwardness land on you.':p.social>=6?'People know you introduced the buyer. A connection cools while you explain what happened.':'You lose a small contribution, but you still get to decide how to treat Jo and the other makers.',change:{cash:-(craft>=3?240:p.job>=2?170:70)+(ally('jo')?40:0),joy:craft>=3?-10:-5,social:p.social>=6?-1:0,flagsAdded:['commission_lost']}};
 case 'crossroads':{
  const path=p.job>=2||p.skill>=4?'career':craft>=3?'creative':p.social>=6?'community':'emerging';
  return{title:'The place went to someone else',body:'The neighborhood’s funded residency goes to another applicant. Mina, Eli and Jo each know what it is like to miss the future they pictured.',impact:path==='career'?'Your plan to turn a funded residency into a senior role stalls. Your skills still belong to you.':path==='creative'?'The residency was meant to launch your work. The rejection hurts, but it does not erase your craft.':path==='community'?'Your plan for a full-time community post falls through. The people you brought together are still here.':'The first big opening did not work out. There are smaller starts that do not need a gatekeeper.',change:{cash:p.cash>=1500?-180:p.cash>=500?-90:-30,joy:-11,flagsAdded:['residency_missed']},context:{path}};
 }
 }
}

function startEvent(p:Player,eventId:LifeEventId,g:Game):EventStart{const e=rawStartEvent(p,eventId),old=e.change.cash??0,cash=economyLifeCash(p,eventId,old),shiftOnly=storyMode(g)&&eventId==='work_reset'&&Number(e.context?.jobBefore)===0;return{...e,body:economyCashText(p,e.body,old,cash),impact:economyCashText(p,e.impact,old,cash),change:{...e.change,cash,...(shiftOnly?{flagsAdded:['shift_lost']}: {})}};}

const trustNeed=(p:Player,npc:LifeNpc)=>good(p,npc)?'':`Needs ${names[npc]}’s support or trust +1; an honest check-in can help`;
const returnFavor=(npc:LifeNpc):LifeRelationshipChange=>({npc,reciprocity:false,support:true,rivalry:false});
const askFavor=(npc:LifeNpc):LifeRelationshipChange=>({npc,reciprocity:true,support:true,rivalry:false});
function rawChoicesFor(p:Player,g:Game,r:LifeReceipt):Choice[]{
 const craft=p.craft??0;
 const fallback=(title:string,outcome:string,change:Proposal={}):Choice=>({id:'take_stock',title,body:'No time, money or energy required. This remains available even if the week is already full.',outcome,change:{joy:3,...change},safe:true});
 switch(r.eventId){
 case 'unexpected_patron':return[
  {id:'back_calling',title:'Back the work you keep postponing',body:'Use part of the grant for materials and one focused hour. This starts a path; it does not promise a future payout.',outcome:'You turn some breathing room into a first piece of work. Jo helps you see a craft and a practical skill you can keep developing.',change:{hours:-1,cash:-100,energy:-5,craft:1,skill:1,joy:5,trust:{jo:1},relationshipChanges:[{npc:'jo',support:true}],flagsAdded:['invested_in_calling']}},
  {id:'repay_eli',title:'Put resources back into Eli’s co-op',body:'Replace shared supplies and leave something for the next person.',outcome:'Some of the surprise money stays in the neighborhood. Eli sees that help can make a round trip, and welcomes you into the co-op.',change:{cash:-50,social:2,joy:5,trust:{eli:2},relationshipChanges:[returnFavor('eli')],flagsAdded:['shared_resources','food_coop']}},
  {id:'seed_evening',title:storyMode(g)?'Back Mina’s rehearsal materials':'Seed Mina’s independent evening',body:'Help an artist build a small opportunity of her own.',outcome:storyMode(g)?'Mina can replace worn strings and make rehearsal notes. It supports the work; it does not book a venue or promise the later set.':'Mina can book a small room without waiting on another venue. You helped make a beginning she controls.',change:{hours:-1,cash:-80,joy:9,social:1,trust:{mina:2},relationshipChanges:[returnFavor('mina')],flagsAdded:['mina_independent_evening']}},
  fallback('Keep a cushion for your next step','You let the grant stay in your account. A quiet reserve is a real opportunity: the next decision does not have to be made in a rush.',{joy:5,flagsAdded:['built_buffer']})
 ];
 case 'invitation':return[
  {id:'honest_debut',title:'Bring the unfinished thing',body:'Take the invitation seriously without pretending your work is polished. No craft minimum required.',outcome:'The debut is imperfect. One real conversation makes a next step visible, and you leave knowing that making things could be part of your life.',change:{hours:-2,cash:-20,energy:-8,craft:1,social:1,joy:10,trust:{mina:1},relationshipChanges:[{npc:'mina',support:true,rivalry:false}],flagsAdded:['honest_debut','unexpected_calling']}},
  {id:'first_workshop',title:'Give your first practical workshop',body:'Two earned skills become a paid teaching session. This could be the start of mentoring work.',outcome:'People pay to learn something you already know. Your day job has unexpectedly opened a teaching route.',change:{hours:-2,energy:-7,cash:180,skill:1,social:1,joy:7,trust:{mina:1},relationshipChanges:[{npc:'mina',support:true}],flagsAdded:['first_workshop','unexpected_calling']},requirement:p.skill>=2?'':'Needs 2 skills'},
  {id:'shared_evening',title:'Make it a shared evening',body:'Three connections let you invite Jo and Eli to bring their work too.',outcome:'The evening is less polished and more alive. You discover that hosting other people can be its own creative calling.',change:{hours:-2,cash:-25,energy:-7,social:3,joy:8,trust:{mina:1,eli:1,jo:1},relationshipChanges:[{npc:'mina',support:true},{npc:'eli',support:true},{npc:'jo',support:true}],flagsAdded:['shared_stage','unexpected_calling']},requirement:p.social>=3?'':'Needs 3 connections'},
  fallback('Let the invitation change what you imagine','You cannot take the stage this week, and say so clearly. Being asked still shows you a possibility you had not considered.',{trust:{mina:1},flagsAdded:['new_possibility']})
 ];
 case 'vacancy':return[
  {id:'one_day_studio',title:'Try a one-day studio',body:'Spend $80 and two hours on a public experiment. No recurring rent or promised sales.',outcome:'For one afternoon your work has a public door. The shop closes that evening, but a small, real beginning stays with you.',change:{hours:-2,cash:-80,energy:-7,craft:1,joy:10,legacy:1,trust:{jo:1},relationshipChanges:[{npc:'jo',support:true}],flagsAdded:['one_day_studio','legacy_seed']}},
  {id:'shared_room',title:'Open a room with your people',body:'Four connections and a trusted neighbor let you share control as well as the work.',outcome:'The idea changes as other people shape it. A little shared room becomes a first test of something the neighborhood could keep building.',change:{hours:-2,cash:-40,energy:-8,social:2,joy:8,legacy:2,trust:{mina:1,eli:1,jo:1},relationshipChanges:[{npc:'eli',support:true}],flagsAdded:['shared_stewardship','legacy_seed']},requirement:p.social<4?'Needs 4 connections':lifeNpcs.some(n=>good(p,n))?'':'Needs support or trust +1 with a neighbor'},
  {id:'independent_service',title:'Test an independent service',body:'Three skills let you take a small paid booking without giving up your current role.',outcome:'A first independent client walks through the door. The fee is real, and you now know a second career route is possible.',change:{hours:-2,energy:-9,cash:220,skill:1,joy:7,trust:{jo:1},flagsAdded:['independent_work','first_independent_client']},requirement:p.skill>=3?'':'Needs 3 skills'},
  fallback('Choose a steadier base first','You write down one practical next step and let this particular window go. Wanting a future does not require risking your present.',{joy:5,energy:6,flagsAdded:['future_named','sustainable_start']})
 ];
 case 'work_reset':return[
  (storyMode(g)?{id:'recover_role',title:'Add a skill with career support',body:'Optional: 2 priority blocks and $100 for a practical skill. If you already meet the next role’s skill requirement, ordinary Apply at the Career Hub costs 1 priority block and $0. No recovery fee is required.',outcome:'You add a skill toward a next application. The session does not award a job; the Career Hub can use your existing and new skills when you apply.',change:{hours:-2,cash:-100,energy:-8,skill:1,joy:5},requirement:p.skill>=6?'You already have all six skills; use ordinary Apply at the Career Hub.':''}:{id:'recover_role',title:'Rebuild the career route',body:'Use your earned skills to find a comparable role. Jo can reduce the search cost.',outcome:'The first plan fell apart, but your experience travels with you. You secure a comparable role, or add a skill toward your first step up.',change:{hours:-2,cash:good(p,'jo')?-40:-100,energy:-8,job:Math.max(0,Number(r.context.jobBefore)-p.job),skill:Number(r.context.jobBefore)===0?1:0,joy:5,flagsRemoved:['career_interrupted'],flagsAdded:['career_rebuilt']},requirement:Number(r.context.jobBefore)>0&&p.skill<Number(r.context.jobBefore)*2?`Needs ${Number(r.context.jobBefore)*2} earned skills to recover that role`:''}),
  {id:'jo_referral',title:'Take Jo’s independent referral',body:'Turn a trusted connection into paid practical work and a craft foothold. You will have a favor to return.',outcome:storyMode(g)&&Number(r.context.jobBefore)===0?'Jo introduces you to a small client. Your entry-level role is still there; this referral adds another paid route after the cancelled shift.':storyMode(g)&&p.job>=Number(r.context.jobBefore)?'Jo introduces you to a small client. You have already restored your role; this independent referral is additional paid work alongside it.':'Jo introduces you to a small client. The old job is still gone, but independent work is now a real option.',change:{hours:-1,energy:-7,cash:210,craft:1,trust:{jo:1},relationshipChanges:[askFavor('jo')],flagsAdded:['independent_work'],flagsRemoved:['career_interrupted']},requirement:trustNeed(p,'jo')},
  {id:'community_pivot',title:'Start again with the block',body:'Trade two hours for connections and a small organizing fee.',outcome:'The career ladder can wait. You begin a community route with people who need your time and care.',change:{hours:-2,energy:-6,cash:100,social:2,trust:{eli:1},relationshipChanges:[{npc:'eli',support:true}],flagsAdded:['community_pivot'],flagsRemoved:['career_interrupted']}},
  storyMode(g)&&Number(r.context.jobBefore)===0?fallback('Keep your current footing','The cancelled shift reduced your buffer, but your entry-level role was not lost. You can keep working it without needing a promotion to call that steady work.',{flagsAdded:['shift_loss_acknowledged'],flagsRemoved:['career_interrupted','career_on_hold']}):storyMode(g)&&Number(r.context.jobBefore)>0&&p.job>=Number(r.context.jobBefore)?fallback('Keep your restored role steady','Your ordinary application has already restored the lost role. You keep that practical recovery and leave the optional support for another time.',{flagsAdded:['career_rebuilt'],flagsRemoved:['career_interrupted','career_on_hold']}):fallback('Let the career plan wait','You keep your existing skills and take the setback seriously. The next move can be smaller, and it can be yours.',{flagsAdded:['career_on_hold']})
 ];
 case 'venue_lost':return[
  {id:'home_show',title:'Open your home to Mina',body:'A studio turns a cancelled showcase into an intimate performance.',outcome:'The big debut is gone. Mina plays to a living room that really listens, and starts believing in the songs again.',change:{hours:-1,cash:-55,energy:-5,joy:12,social:2,trust:{mina:2},relationshipChanges:[returnFavor('mina')],flagsAdded:['mina_living_room_show'],flagsRemoved:['mina_show_delayed']},requirement:p.housing?'':'Needs your own place'},
  {id:'find_audience',title:'Bring your circle to a pop-up',body:'Use four connections to assemble a replacement audience.',outcome:'Your friends find a borrowed corner of the market. Mina has a smaller stage and a real beginning.',change:{hours:-2,cash:-25,energy:-6,joy:9,social:1,trust:{mina:2},relationshipChanges:[returnFavor('mina')],flagsAdded:['mina_popup_show'],flagsRemoved:['mina_show_delayed']},requirement:p.social>=4?'':'Needs 4 connections'},
  {id:'record_demo',title:'Make a scrappy demo together',body:'Turn three craft levels into a recording Mina can share without a venue.',outcome:'The showcase never happens. A homemade recording does, and Mina’s songs can finally travel.',change:{hours:-1,cash:-20,energy:-5,craft:1,joy:8,trust:{mina:1},relationshipChanges:[{npc:'mina',support:true,rivalry:false}],flagsAdded:['mina_demo'],flagsRemoved:['mina_show_delayed']},requirement:craft>=3?'':'Needs 3 craft levels'},
  fallback('Tell Mina a delay is not the end','You admit you cannot fix the venue this week. Mina appreciates an honest answer. The big show waits; the friendship does not.',{trust:{mina:1},flagsAdded:['mina_small_start']})
 ];
 case 'garden_setback':return[
  {id:'repair_pump',title:'Repair the pump with Jo and Eli',body:'Three craft levels let you save the equipment, though not the lost harvest.',outcome:'The harvest cannot be rescued. The repaired pump gives the next planting a fair chance, and your practical work matters.',change:{hours:-1,cash:-35,energy:-8,craft:1,joy:6,trust:{eli:1,jo:1},relationshipChanges:[returnFavor('eli')],flagsAdded:['garden_repaired'],flagsRemoved:['harvest_lost']},requirement:craft>=3?'':'Needs 3 craft levels'},
  {id:'organize_groceries',title:'Organize a replacement food run',body:'Four connections share the work and spread the grocery cost.',outcome:'The pantry gets bought-in tomatoes and bean tins, though it is not Eli’s harvest. The neighborhood learns that keeping people fed matters more than saving face.',change:{hours:-2,cash:-45,energy:-6,social:2,joy:8,trust:{eli:2},relationshipChanges:[returnFavor('eli')],flagsAdded:['pantry_kept_open'],flagsRemoved:['harvest_lost']},requirement:p.social>=4?'':'Needs 4 connections'},
  {id:'eli_coop',title:'Accept Eli’s co-op invitation',body:'An established bond opens shared grocery work and a small paid shift. Eli will need you back.',outcome:'Eli shares the co-op’s backup supplies and brings you into a steadier food network. You promise to take a later turn.',change:{hours:-1,energy:-5,cash:140,social:1,trust:{eli:1},relationshipChanges:[askFavor('eli')],flagsAdded:['food_coop']},requirement:trustNeed(p,'eli')},
  fallback('Plan a smaller next planting','You and Eli record what failed instead of pretending it worked. The first harvest is lost; a smaller next planting is still worth trying.',{trust:{eli:1},flagsAdded:['garden_restarted']})
 ];
 case 'repair_bill':return[
  {id:'fix_together',title:'Fix it with your own hands',body:'Two craft levels turn an expensive setback into a repair session.',outcome:'You replace the swollen shelf boards and clean rust from the hand tools. The setback leaves a practical skill rather than a permanent loss.',change:{hours:-2,cash:-25,energy:-10,craft:1,joy:6,trust:{jo:1},relationshipChanges:[{npc:'jo',support:true,rivalry:false}],flagsAdded:['self_repaired'],flagsRemoved:['repairs_unfinished']},requirement:craft>=2?'':'Needs 2 craft levels'},
  {id:'jo_toolkit',title:'Borrow Jo’s spare toolkit',body:'Jo’s trust unlocks a repair credit and replacement tools. Return the favor when you can.',outcome:'Jo lends a hand plane, clamps and a screwdriver that get you moving again. Owning everything yourself is no longer the only way to carry on.',change:{hours:-1,energy:-5,cash:110,craft:Math.max(0,Number(r.context.craftBefore)-craft),trust:{jo:1},relationshipChanges:[askFavor('jo')],flagsAdded:['shared_toolkit'],flagsRemoved:['repairs_unfinished']},requirement:trustNeed(p,'jo')},
  {id:'fund_repairs',title:'Pay for a full repair',body:'Spend cash to protect your remaining time and regain some energy.',outcome:'A local repairer makes the space usable again. It costs more, but you preserve time for the life you were building.',change:{cash:-150,energy:10,joy:6,craft:Math.max(0,Number(r.context.craftBefore)-craft),flagsAdded:['repairs_paid'],flagsRemoved:['repairs_unfinished']}},
  fallback('Use a smaller temporary setup','You put the big setup on hold and use what still works. The inconvenience remains, but a borrowed corner is enough to keep going.',{flagsAdded:['smaller_setup']})
 ];
 case 'festival_split':return[
  {id:'choose_mina',title:'Keep your promise to Mina',body:'Mina gets a reliable friend. Eli is disappointed; a later honest check-in can mend the strain.',outcome:'Mina’s night goes ahead with you there. Eli feels left carrying the fundraiser, and the friendship will need care.',change:{hours:-1,cash:-20,joy:12,social:1,trust:{mina:2,eli:-1},relationshipChanges:[returnFavor('mina'),{npc:'eli',rivalry:true}],flagsAdded:['chose_music']}},
  {id:'choose_eli',title:'Show up for Eli’s fundraiser',body:'Eli gets the help needed to open the doors. Mina feels passed over.',outcome:'The fundraiser works because you unfold the trestle tables and stack the soup bowls. Mina had saved you a seat; that missed promise matters.',change:{hours:-1,energy:-7,cash:70,social:2,trust:{eli:2,mina:-1},relationshipChanges:[returnFavor('eli'),{npc:'mina',rivalry:true}],flagsAdded:['chose_fundraiser']}},
  {id:'share_stage',title:'Persuade both groups to share',body:'Six connections and trust with both neighbors can turn competing events into one smaller evening.',outcome:'Neither event keeps its original shape. Mina plays a short set at the fundraiser, and Eli shares the credit. Compromise becomes something real.',change:{hours:-2,cash:-40,energy:-8,joy:10,social:2,legacy:1,trust:{mina:1,eli:1},relationshipChanges:[returnFavor('mina'),returnFavor('eli')],flagsAdded:['shared_stage'],flagsRemoved:['promises_collided']},requirement:p.social<6?'Needs 6 connections':!good(p,'mina')?'Needs Mina’s support or trust +1':!good(p,'eli')?'Needs Eli’s support or trust +1':''},
  fallback('Be honest that you cannot do both','You send a clear answer instead of disappearing. Both plans must adapt without you, but nobody is left waiting on a false promise.',{flagsAdded:['honest_limits']})
 ];
 case 'commission_dispute':return[
  {id:'stand_with_jo',title:'Ask for shared credit with Jo',body:'Spend time and effort standing beside the other makers. No payout is guaranteed or claimed.',outcome:'The buyer never restores the commission. You document everyone’s contribution and exhibit the work locally; Jo knows you stood beside them.',change:{hours:-2,energy:-8,joy:7,craft:1,trust:{jo:2},relationshipChanges:[returnFavor('jo')],flagsAdded:['shared_credit'],flagsRemoved:['commission_lost']}},
  {id:'solo_sale',title:'Take the separate solo offer',body:'Three craft levels earn a smaller independent sale, but accepting alone strains your bond with Jo.',outcome:'You earn a real fee and keep making. Jo feels the shared work became a stepping stone; that rivalry can still be repaired.',change:{hours:-1,energy:-6,cash:280,trust:{jo:-2},relationshipChanges:[{npc:'jo',rivalry:true,support:false}],flagsAdded:['solo_commission']},requirement:craft>=3?'':'Needs 3 craft levels'},
  {id:'mina_benefit',title:'Let Mina host a makers’ benefit',body:'A trusted friend brings a small audience and pays the makers from the door.',outcome:'Mina turns a lost contract into a community show. It is a smaller fee and a warmer room, with a favor to return.',change:{hours:-1,energy:-5,cash:160,joy:7,social:1,trust:{mina:1,jo:1},relationshipChanges:[askFavor('mina'),{npc:'jo',rivalry:false}],flagsAdded:['makers_benefit']},requirement:trustNeed(p,'mina')},
  fallback('Keep the work and start smaller','You archive the work with everyone’s names attached. This commission is over; the work and the possibility of a next one remain.',{trust:{jo:1},flagsAdded:['portfolio_reclaimed']})
 ];
 case 'crossroads':return[
  {id:'independent_start',title:'Build an independent first step',body:'Choose a practical next piece of work using the path you had been pursuing.',outcome:'The funded place never arrives. You make a smaller start with your own name on it, and the next chapter has something solid to grow from.',change:{hours:-2,cash:-60,energy:-8,joy:7,skill:r.context.path==='career'||r.context.path==='emerging'?1:0,craft:r.context.path==='creative'?1:0,social:r.context.path==='community'?3:0,legacy:1,flagsAdded:['independent_next_chapter'],flagsRemoved:['residency_missed']}},
  {id:'accept_support',title:'Build the next step with a friend',body:'A supportive neighbor helps you turn the rejection into a paid community experiment.',outcome:'A friend does not make the rejection disappear. They make sure you do not face it alone, and your shared experiment becomes a different future.',change:{hours:-1,energy:-5,cash:180,joy:10,social:1,legacy:1,trust:{[lifeNpcs.find(n=>good(p,n))??'mina']:1},relationshipChanges:[askFavor(lifeNpcs.find(n=>good(p,n))??'mina')],flagsAdded:['supported_next_chapter'],flagsRemoved:['residency_missed']},requirement:lifeNpcs.some(n=>good(p,n))?'':'Needs support or trust +1 with any neighbor'},
  {id:'return_favor',title:'Start by returning a favor',body:'Someone previously helped you. Put one hour into their next step, and find a new purpose alongside them.',outcome:'You help the person who helped you. The first ambition still failed, but reciprocity becomes a beginning instead of an unpaid debt.',change:{hours:-1,energy:-4,joy:12,social:2,legacy:2,trust:{[lifeNpcs.find(n=>debt(p,n))??'mina']:1},relationshipChanges:[returnFavor(lifeNpcs.find(n=>debt(p,n))??'mina')],flagsAdded:['reciprocal_next_chapter']},requirement:lifeNpcs.some(n=>debt(p,n))?'':'Available after accepting a neighbor’s favor'},
  fallback('Allow yourself a different dream','You name the disappointment without pretending it was a success. The original plan ends here; a quieter, hopeful beginning is still yours to choose.',{joy:6,flagsAdded:['different_dream']})
 ];
 }
}

const paidLifeHours:Record<string,number>={first_workshop:40,independent_service:40,jo_referral:40,community_pivot:20,eli_coop:20,choose_eli:20,solo_sale:40,mina_benefit:20,accept_support:20};
function choicesFor(p:Player,g:Game,r:LifeReceipt):Choice[]{return rawChoicesFor(p,g,r).map(c=>{const old=c.change.cash??0,cash=economyLifeCash(p,c.id,old),paidHours=hasModernEconomy(p)?paidLifeHours[c.id]??0:0;return{...c,paidHours,body:economyCashText(p,c.body,old,cash)+(paidHours?` Paid commitment: ${paidHours} hours this month; $${cash} take-home.`:''),outcome:economyCashText(p,c.outcome,old,cash),change:{...c.change,cash}};});}

/** Safe for repeat lifecycle calls and JSON reloads: each player receives the shared event once. */
export function beginLifeWeek(g:Game){
 if(!enabled(g)||g.status!=='playing')return;
 const entry=(g as LifeGame).lifeSchedule?.find(e=>e.week===g.round);if(!entry)return;
 let applied=false;
 for(const p of g.players){
  initializeLifePlayer(p);const state=life(p)!;
  if(state.receipts.some(r=>r.week===g.round))continue;
  const start=startEvent(p,entry.eventId,g),e=preview(p,start.change,true);
  const receipt:LifeReceipt={week:g.round,eventId:entry.eventId,kind:lifeOpportunityIds.includes(entry.eventId)?'opportunity':'setback',title:lifePeriodText(start.title,g),body:lifePeriodText(start.body,g),impact:lifePeriodText(start.impact,g),effects:e,choices:[],pending:true,journal:[lifePeriodText(`Week ${g.round}: ${start.impact}`,g)],context:{...start.context}};
  receipt.choices=choicesFor(p,g,receipt).map(c=>choiceKey(receipt,c.id));
  apply(p,e,lifePeriodText(`Week ${g.round}: ${start.title}`,g));state.receipts.push(receipt);applied=true;
 }
 if(applied)log(g,lifePeriodText(`Week ${g.round}: ${g.players.map(p=>currentReceipt(p,g)).find(Boolean)?.title}. Each life feels it differently.`,g));
}
export function getLifeEvent(p:Player,g:Game):LifeReceipt|null{return enabled(g)?currentReceipt(p,g)??null:null;}
const choiceKey=(r:LifeReceipt,id:string)=>`${r.week}:${r.eventId}:${id}`;
function choiceReason(p:Player,g:Game,r:LifeReceipt,c:Choice):string{
 if(!enabled(g)||!life(p))return'Available in new neighborhood games';
 if(g.status!=='playing')return'The game is not running';
 if(!r.pending)return'This week’s choice is already settled';
 if(c.requirement)return c.requirement;
 const paidReason=economyWorkReason(p,g,c.paidHours??0);if(paidReason)return paidReason;
 if(p.hours<-(c.change.hours??0))return`Needs ${-(c.change.hours??0)} time this week`;
 if((c.change.cash??0)<0&&p.cash<-(c.change.cash??0))return`Needs $${-(c.change.cash??0)} available cash`;
 if((c.change.energy??0)<0&&p.energy<-(c.change.energy??0))return`Needs ${-(c.change.energy??0)} energy; rest first`;
 return'';
}
/** Pure: rendering choices does not initialize state, consume resources, or change relationships. */
export function lifeChoices(p:Player,g:Game):LifeChoiceView[]{
 const r=getLifeEvent(p,g);if(!r||!life(p))return[];
 return choicesFor(p,g,r).map(c=>{const reason=choiceReason(p,g,r,c),e=preview(p,c.change);return{id:choiceKey(r,c.id),title:lifePeriodText(c.title,g),body:lifePeriodText(c.body,g),available:!reason,reason:lifePeriodText(reason,g),preview:e,previewText:lifeEffectText(e).map(t=>lifePeriodText(t,g)),outcome:lifePeriodText(c.outcome,g),safe:!!c.safe};});
}
/** Choice IDs include week/event so a stale retry cannot accidentally choose next week's fallback. */
export function resolveLifeChoice(g:Game,p:Player,choiceId:string):LifeReceipt{
 active(g,p);
 const previous=life(p)!.receipts.find(r=>r.resolved?.choiceId===choiceId);if(previous)return previous;
 const r=currentReceipt(p,g);if(!r)throw Error(lifePeriodText('There is no life event to resolve this week',g));
 const c=choicesFor(p,g,r).find(c=>choiceKey(r,c.id)===choiceId);if(!c)throw Error(lifePeriodText('That life choice is not available for this week',g));
 const reason=choiceReason(p,g,r,c);if(reason)throw Error(lifePeriodText(reason,g));
 const e=preview(p,c.change);recordEconomyPaidHours(p,g,c.paidHours??0);apply(p,e,lifePeriodText(`Week ${g.round}: ${c.title}`,g));
 r.pending=false;r.resolved={choiceId,title:lifePeriodText(c.title,g),outcome:lifePeriodText(c.outcome,g),effects:e,deferred:false};r.journal.push(lifePeriodText(c.outcome,g));
 log(g,lifePeriodText(`${p.name}: ${c.title}. ${c.outcome}`,g));return r;
}
/** End-week takes the visible free fallback, never a paid response. Safe to call repeatedly. */
export function deferLifeChoice(g:Game,p:Player){
 if(!enabled(g))return;
 const r=currentReceipt(p,g);if(!r?.pending)return;
 const fallback=choicesFor(p,g,r).find(c=>c.safe);if(!fallback)throw Error('A safe life-event fallback is missing');
 const result=resolveLifeChoice(g,p,choiceKey(r,fallback.id));if(result.resolved){result.resolved.deferred=true;result.journal.push(lifePeriodText('No response chosen before ending the week; the free take-stock option was used.',g));}
}
const repairPlaces:Record<LifeNpc,string>={mina:'CORNER CAFÉ',eli:'GARDEN',jo:'MAKERSPACE'};
const remoteRepair=(p:Player,npc:LifeNpc)=>(!!p.world&&p.world.region!=='alder')||p.place!==repairPlaces[npc];
function repairProposal(p:Player,npc:LifeNpc,g?:Game):Proposal{
 if(g&&storyMode(g)){const heard=life(p)?.flags.includes(`heard_${npc}`)??false;const r=relation(p,npc);return{hours:-1,joy:3,trust:{[npc]:1},relationshipChanges:heard&&r.trust>=0&&!remoteRepair(p,npc)?[{npc,rivalry:false,support:true}]:[],flagsAdded:[`heard_${npc}`]};}
 return{hours:-1,joy:3,trust:{[npc]:1},relationshipChanges:[{npc,rivalry:false,...(relation(p,npc).trust>=0?{support:true}:{}),...(relation(p,npc).reciprocity?{reciprocity:false}:{})}]};
}
/** Pure repair availability and exact effective resource/trust preview for the relationship UI. */
export function repairChoice(p:Player,g:Game,npc:LifeNpc):LifeChoiceView{
 if(!lifeNpcs.includes(npc))throw Error('Choose Mina, Eli or Jo');
 const r=relation(p,npc),change=repairProposal(p,npc,g),e=preview(p,change),remote=storyMode(g)&&remoteRepair(p,npc);
 const reason=!enabled(g)||!life(p)?'Available in new neighborhood games':g.status!=='playing'?'The game is not running':r.lastRepairWeek===g.round?'You already checked in with this neighbor this week':p.hours<1?'Needs 1 time this week':r.trust===3&&!r.rivalry&&!r.reciprocity?'Your bond is steady; no repair is needed':'';
 return{id:`repair:${npc}`,title:remote?`Call ${names[npc]} for a check-in`:`Check in with ${names[npc]}`,body:storyMode(g)?(remote?`${names[npc]} is in Alder Quay. This is a phone conversation: 1 priority block, $0. Rebuild trust, but an outstanding favor needs practical work and a strained conflict still needs an in-person follow-through.`:'1 priority block. Listen and rebuild trust. A first conversation does not erase rivalry, and a favor needs practical follow-through: pantry work for Eli, repair work for Jo, or a later reciprocal choice. A later in-person check-in can ease strain once trust recovers.'):'An honest conversation costs 1 time, eases rivalry and returns an outstanding favor. Once per neighbor each week.',available:!reason,reason:lifePeriodText(reason,g),preview:e,previewText:lifeEffectText(e).map(t=>lifePeriodText(t,g)),outcome:storyMode(g)?`You ${remote?'make a phone call to':'make time in person for'} ${names[npc]}. The conversation does not undo the past, but it makes room for the next chapter.`:`You make time for ${names[npc]}. The conversation does not undo the past, but it makes room for the next chapter.`,safe:false};
}
export function repairRelationship(g:Game,p:Player,npc:LifeNpc){
 active(g,p);const c=repairChoice(p,g,npc);if(!c.available)throw Error(c.reason);
 apply(p,c.preview,lifePeriodText(`Week ${g.round}: An honest check-in`,g));life(p)!.relationships[npc].lastRepairWeek=g.round;
 const receipt=currentReceipt(p,g);if(receipt)receipt.journal.push(c.outcome);
 log(g,`${p.name}: ${c.title}.`);return c;
}
export function relationshipViews(p:Player):LifeRelationshipView[]{
 if(life(p)?.version!==1)return[];
 return lifeNpcs.map(id=>{const r=relation(p,id);return{id,name:names[id],role:roles[id],trust:r.trust,support:r.support,rivalry:r.rivalry,reciprocity:r.reciprocity,status:r.rivalry?'Strained, with room to repair':r.trust>=2?'Trusted friend':r.trust>=1||r.support?'A growing bond':r.trust<0?'Distance, not a closed door':'Getting to know each other',history:[...r.history],...(r.lastRepairWeek!==undefined?{lastRepairWeek:r.lastRepairWeek}:{})};});
}
/** Optional hook after an existing successful NPC story action. Duplicate chapter calls are harmless. */
export function recordLifeStory(g:Game,p:Player,npc:LifeNpc,stage:number){
 if(!enabled(g)||!life(p)||!lifeNpcs.includes(npc)||stage<1||stage>3)return;
 const key=`${npc}:${stage}`;if(life(p)!.storyChapters[key])return;
 const e=preview(p,{trust:{[npc]:1},relationshipChanges:stage>=2?[{npc,support:true,rivalry:false}]:[]});
 apply(p,e,lifePeriodText(`Week ${g.round}: Shared story, chapter ${stage}`,g));life(p)!.storyChapters[key]=g.round;
}

/** Integration hook: call exactly once after each successful ordinary action, never on a preview or denied move. */
export function afterLifeAction(g:Game,p:Player,actionId:string){
 if(!enabled(g)||!life(p))return;
 const state=life(p)!;state.activityCounts??={};state.activityCounts[actionId]=(state.activityCounts[actionId]??0)+1;
 const match=/^story_(mina|eli|jo)_([1-3])$/.exec(actionId);if(match)recordLifeStory(g,p,match[1] as LifeNpc,Number(match[2]));
}

/** The free fallback never closes recovery: unfinished home/toolkit repairs remain actionable later. */
export function repairHomeChoice(p:Player,g:Game,method:'paid'|'diy'='paid'):LifeChoiceView{
 if(method!=='paid'&&method!=='diy')throw Error('Choose paid or DIY repairs');
 const receipt=life(p)?.receipts.find(r=>r.eventId==='repair_bill');
 const change:Proposal={hours:method==='paid'?-1:-2,cash:method==='paid'?economyLifeCash(p,'home_repair_paid',-120):0,energy:5,joy:5,craft:Math.max(0,Number(receipt?.context.craftBefore??0)-(p.craft??0)),flagsRemoved:['repairs_unfinished'],flagsAdded:['repairs_completed']};
 const e=preview(p,change),reason=!enabled(g)||!life(p)?'Available in new neighborhood games':g.status!=='playing'?'The game is not running':!hasFlag(p,'repairs_unfinished')?'No unfinished home or toolkit repairs':p.hours<-(change.hours??0)?`Needs ${-(change.hours??0)} time this week`:method==='paid'&&p.cash<-(change.cash??0)?`Needs $${-(change.cash??0)} available cash`:'';
 return{id:`home_repair:${method}`,title:method==='paid'?'Finish the repairs with paid help':'Finish the repairs in stages',body:lifePeriodText(method==='paid'?`1 time and $${-(change.cash??0)} finish the postponed repairs and restore damaged toolkit progress.`:'2 time, no cash needed. Work in stages to finish postponed repairs and restore damaged toolkit progress.',g),available:!reason,reason:lifePeriodText(reason,g),preview:e,previewText:lifeEffectText(e).map(t=>lifePeriodText(t,g)),outcome:'The temporary setup did its job. The repairs are finally finished, and your space and tools can support the next chapter.',safe:false};
}
export function repairHome(g:Game,p:Player,method:'paid'|'diy'='paid'){
 active(g,p);const choice=repairHomeChoice(p,g,method);if(!choice.available)throw Error(choice.reason);
 apply(p,choice.preview,lifePeriodText(`Week ${g.round}: Postponed repairs finished`,g));
 const receipt=life(p)!.receipts.find(r=>r.eventId==='repair_bill');receipt?.journal.push(choice.outcome);
 log(g,`${p.name}: ${choice.title}.`);return choice;
}
