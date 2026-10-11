import {careerStoryGig} from './career-story.ts';
import {financialPayQuote,recordFinancialPay} from './financial-recovery.ts';
import type {GameView as Game,Player} from './game.ts';
import {economyThresholds,economyAutomaticLoss,economyWorkReason,recordEconomyPaidHours} from './economy.ts';

/** Serializable current life events. Game imports use only delayed domain helpers.
 * Only initializeLife uses randomness, with a server-supplied integer seed. Reads are pure.
 * The existing API remains responsible for authenticated turn ownership and atomic saves.
 */
export type LifeNpc='mina'|'eli'|'jo';
export type LifeEventId='work_reset'|'repair_bill'|'unexpected_patron'|'vacancy';
export type LifeScheduleEntry={week:number;eventId:LifeEventId};
export type LifeRelationship={trust:number;support:boolean;rivalry:boolean;reciprocity:boolean;lastRepairWeek?:number;history:string[]};
export type LifeResources={cash:number;hours:number;energy:number;joy:number;skill:number;social:number;craft:number;housing:number;legacy:number};
export type LifeRelationshipChange={npc:LifeNpc;support?:boolean;rivalry?:boolean;reciprocity?:boolean};
export type LifeEffects=LifeResources & {trust:Record<LifeNpc,number>;relationshipChanges:LifeRelationshipChange[];flagsAdded:string[];flagsRemoved:string[]};
export type LifeResolution={choiceId:string;title:string;outcome:string;effects:LifeEffects;deferred:boolean};
export type LifeReceipt={week:number;eventId:LifeEventId;kind:'opportunity'|'setback';title:string;body:string;impact:string;effects:LifeEffects;choices:string[];pending:boolean;resolved?:LifeResolution;journal:string[];context:Record<string,number|string|boolean>};
export type LifePlayerState={version:1;relationships:Record<LifeNpc,LifeRelationship>;receipts:LifeReceipt[];flags:string[];activityCounts?:Record<string,number>};
export type LifeChoiceView={id:string;title:string;body:string;available:boolean;reason:string;preview:LifeEffects;previewText:string[];outcome:string;safe:boolean};
export type LifeRelationshipView={id:LifeNpc;name:string;role:string;trust:number;support:boolean;rivalry:boolean;reciprocity:boolean;status:string;history:string[];lastRepairWeek?:number};
type LifeGame=Game & {lifeSeed?:number;lifeSchedule?:LifeScheduleEntry[]};
type LifePlayer=Player & {life?:LifePlayerState};
type Proposal=Partial<LifeResources> & {trust?:Partial<Record<LifeNpc,number>>;relationshipChanges?:LifeRelationshipChange[];flagsAdded?:string[];flagsRemoved?:string[]};
type Choice={paidTakeHome?:number;paidHours?:number;id:string;title:string;body:string;outcome:string;change:Proposal;safe?:boolean;requirement?:string};
type EventStart={title:string;body:string;impact:string;change:Proposal;context?:Record<string,number|string|boolean>};
export const lifeEventIds:LifeEventId[]=['work_reset','repair_bill','unexpected_patron','vacancy'];
export const lifeOpportunityIds:LifeEventId[]=['unexpected_patron','vacancy'];
export const lifeNpcs:LifeNpc[]=['mina','eli','jo'];
const names:Record<LifeNpc,string>={mina:'Mina',eli:'Eli',jo:'Jo'};
const roles:Record<LifeNpc,string>={mina:'Songwriter and café friend',eli:'Neighborhood grower',jo:'Maker and repair mentor'};
const resourceKeys:(keyof LifeResources)[]=['cash','hours','energy','joy','skill','social','craft','housing','legacy'];
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
const emptyRelationship=():LifeRelationship=>({trust:0,support:false,rivalry:false,reciprocity:false,history:[]});
const relation=(p:Player,npc:LifeNpc):LifeRelationship=>(p as LifePlayer).life?.relationships[npc]??emptyRelationship();
const life=(p:Player)=>(p as LifePlayer).life;
/** Render authored time labels as months and priority blocks. */
export function lifePeriodText(text:string){return text.replace(/weeks/g,'months').replace(/Weeks/g,'Months').replace(/week/g,'month').replace(/Week/g,'Month').replace(/(\d+) time\b/g,(_m,n)=>`${n} priority block${n==='1'?'':'s'}`).replace(/(one|two) (focused )?hours?/gi,(_m,n)=>`${n.toLowerCase()==='two'?'two priority blocks':'one priority block'}`);}

const hasFlag=(p:Player,flag:string)=>life(p)?.flags.includes(flag)??false;
const currentReceipt=(p:Player,g:Game)=>life(p)?.receipts.find(r=>r.week===g.round);
const good=(p:Player,npc:LifeNpc)=>!relation(p,npc).rivalry&&(relation(p,npc).trust>=1||relation(p,npc).support);
const finite=(n:number|undefined)=>Number.isFinite(n)?n!:0;

/** Initialize new players without resetting established relationship state. */
export function initializeLifePlayer(p:Player){
 const q=p as LifePlayer;if(q.life)return;
 q.life={version:1,relationships:{mina:emptyRelationship(),eli:emptyRelationship(),jo:emptyRelationship()},receipts:[],flags:[],activityCounts:{}};
}
/** Seed the private surprises around the fixed public story anchors. */
export function initializeLife(g:Game,seed:number){
 const q=g as LifeGame;
 if(!q.lifeSchedule){
  let state=finite(seed)>>>0;q.lifeSeed=state;
  const random=()=>{state=(state+0x6D2B79F5)>>>0;let t=state;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};
  const shuffle=(ids:LifeEventId[])=>{for(let i=ids.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]];}return ids;};
   // Public arcs have fixed anchors; private surprises retain a seeded, hidden varied cadence.
   // Avoid duplicate show cancellations, imaginary applications and competing public festivals.
   const opportunities=shuffle(['unexpected_patron','vacancy']).slice(0,random()<.5?1:2);
   const setbacks=shuffle(['work_reset','repair_bill']).slice(0,random()<.5?1:2);
   const chosen=shuffle([...opportunities,...setbacks]);
   const weeks=[2,4,6,8];for(let i=weeks.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[weeks[i],weeks[j]]=[weeks[j],weeks[i]];}
   q.lifeSchedule=chosen.map((eventId,i)=>({week:weeks[i],eventId})).sort((a,b)=>a.week-b.week);
 }
 for(const p of g.players)initializeLifePlayer(p);
}

/** Exact effective deltas after clamps; safe initial cash losses cannot deepen an overdraft. */
function preview(p:Player,change:Proposal,automatic=false):LifeEffects{
 const result={cash:0,hours:0,energy:0,joy:0,skill:0,social:0,craft:0,housing:0,legacy:0,trust:{mina:0,eli:0,jo:0},relationshipChanges:[],flagsAdded:[],flagsRemoved:[]} as LifeEffects;
 for(const key of resourceKeys){
  const before=finite(p[key as keyof Player] as number|undefined);let delta=finite(change[key]);
  if(key==='cash'){if(automatic&&delta<0)delta=economyAutomaticLoss(p,delta);result.cash=delta;continue;}
  const max=key==='hours'?6:key==='energy'||key==='joy'?100:key==='skill'?6:key==='craft'?8:key==='housing'?1:key==='legacy'?10:Infinity;
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
 const labels:Record<keyof LifeResources,string>={cash:'cash',hours:'time',energy:'energy',joy:'happiness',skill:'skill',social:'connections',craft:'craft',housing:'housing level',legacy:'legacy'};
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
 if(g.status!=='playing')throw Error('The game is not running');
 if(g.players[g.turn]?.id!==p.id||!g.players.includes(p))throw Error('It is another player’s turn');
 if(!life(p))throw Error('Life events are not initialized');
}

function startEvent(p:Player,eventId:LifeEventId):EventStart{
 const ally=(npc:LifeNpc)=>good(p,npc),craft=p.craft??0;
 switch(eventId){
 case 'unexpected_patron':return{title:'An envelope, finally',body:'A delayed neighborhood grant unexpectedly comes through. Everyone receives a share, with extra help for people whose cash buffer is thin. Jo says it could buy a beginning, not just another bill.',impact:p.cash<economyThresholds(p).hardship?'Your larger hardship payment creates room to breathe, and perhaps to try something you kept postponing.':p.housing?'Your household receives a modest grant. Stability gives you choices about what this money could make possible.':craft>=3?'The grant could buy materials for work nobody has commissioned yet. You do not have to wait to be chosen.':'A small grant arrives just as you were deciding what to do next. The money is yours to keep or turn into a first step.',change:{cash:p.cash<economyThresholds(p).hardship?1200:p.cash<economyThresholds(p).modest?750:350,joy:6,flagsAdded:['unexpected_grant']}};

 case 'vacancy':return{title:'One empty window',body:'An empty corner shop becomes available for a one-day pop-up, with no long lease. The decision is due this month. Everyone sees a different future through the same window.',impact:craft>=3?'You can see a studio with a public door. A one-day version might fit even when the bigger dream does not.':p.social>=6?'You imagine a room that belongs to the neighborhood. People you already know could help open it.':p.housing?'Your home is a steady base. This could be a small experiment beyond it.':'A whole new direction is suddenly visible, but you are allowed to start smaller than the dream.',change:{joy:7,energy:lifeNpcs.some(n=>good(p,n))?4:0,flagsAdded:['unexpected_opening']}};
 case 'work_reset':return{title:'The rota is rewritten',body:'A major employer cuts an outside booking. Jo’s workshop loses its maintenance booking, and a cancelled casual opening reduces your buffer.',impact:p.career?.contracts.some(c=>c.active&&c.kind==='main')?'Your agreed venue contract and experience remain in place.':'Entry applications and learning remain open; no role has been taken away.',change:{cash:-(ally('jo')?160:360),joy:-7,flagsAdded:['shift_lost']}};
 case 'repair_bill':return{title:'The unexpected repair',body:'A leak reaches the block’s shared storage. Swollen plywood shelves and rusted hand tools must be repaired before the space can reopen; nobody is hurt.',impact:p.housing?`Your own place needs extra drying and repairs. ${ally('jo')?'Jo helps keep the bill down.':'A bigger home brings a bigger bill.'}`:craft>=3?'Your stored materials take the hardest hit. One craft level is temporarily set back while you rebuild your toolkit.':'Your shared household splits a smaller repair bill, but the disruption drains your energy.',change:{cash:-(p.housing?840:craft>=3?600:360)+(ally('jo')?180:0),craft:!p.housing&&craft>=3?-1:0,energy:-(p.housing?12:8),joy:-5,flagsAdded:['repairs_unfinished']},context:{craftBefore:craft}};

 }
}


const trustNeed=(p:Player,npc:LifeNpc)=>good(p,npc)?'':`Needs ${names[npc]}’s support or trust +1; an honest check-in can help`;
const returnFavor=(npc:LifeNpc):LifeRelationshipChange=>({npc,reciprocity:false,support:true,rivalry:false});
const askFavor=(npc:LifeNpc):LifeRelationshipChange=>({npc,reciprocity:true,support:true,rivalry:false});
function rawChoicesFor(p:Player,g:Game,r:LifeReceipt):Choice[]{
 const craft=p.craft??0;
 const fallback=(title:string,outcome:string,change:Proposal={}):Choice=>({id:'take_stock',title,body:'No time, money or energy required. This remains available even if the week is already full.',outcome,change:{joy:3,...change},safe:true});
 switch(r.eventId){
 case 'unexpected_patron':return[
  {id:'back_calling',title:'Back the work you keep postponing',body:'Use part of the grant for materials and one focused hour. This starts a path; it does not promise a future payout.',outcome:'You turn some breathing room into a first piece of work. Jo helps you see a craft and a practical skill you can keep developing.',change:{hours:-1,cash:-450,energy:-5,craft:1,skill:1,joy:5,trust:{jo:1},relationshipChanges:[{npc:'jo',support:true}],flagsAdded:['invested_in_calling']}},
  {id:'repay_eli',title:'Put resources back into Eli’s co-op',body:'Replace shared supplies and leave something for the next person.',outcome:'Some of the surprise money stays in the neighborhood. Eli sees that help can make a round trip, and welcomes you into the co-op.',change:{cash:-120,social:2,joy:5,trust:{eli:2},relationshipChanges:[returnFavor('eli')],flagsAdded:['shared_resources','food_coop']}},
  {id:'seed_evening',title:'Back Mina’s rehearsal materials',body:'Help an artist build a small opportunity of her own.',outcome:'Mina can replace worn strings and make rehearsal notes. It supports the work; it does not book a venue or promise the later set.',change:{hours:-1,cash:-350,joy:9,social:1,trust:{mina:2},relationshipChanges:[returnFavor('mina')],flagsAdded:['mina_independent_evening']}},
  fallback('Keep a cushion for your next step','You let the grant stay in your account. A quiet reserve is a real opportunity: the next decision does not have to be made in a rush.',{joy:5,flagsAdded:['built_buffer']})
 ];

 case 'vacancy':return[
  {id:'one_day_studio',title:'Try a one-day studio',body:'Spend $350 and two hours on a public experiment. No recurring rent or promised sales.',outcome:'For one afternoon your work has a public door. The shop closes that evening, but a small, real beginning stays with you.',change:{hours:-2,cash:-350,energy:-7,craft:1,joy:10,legacy:1,trust:{jo:1},relationshipChanges:[{npc:'jo',support:true}],flagsAdded:['one_day_studio','legacy_seed']}},
  {id:'shared_room',title:'Open a room with your people',body:'Four connections and a trusted neighbor let you share control as well as the work.',outcome:'The idea changes as other people shape it. A little shared room becomes a first test of something the neighborhood could keep building.',change:{hours:-2,cash:-180,energy:-8,social:2,joy:8,legacy:2,trust:{mina:1,eli:1,jo:1},relationshipChanges:[{npc:'eli',support:true}],flagsAdded:['shared_stewardship','legacy_seed']},requirement:p.social<4?'Needs 4 connections':lifeNpcs.some(n=>good(p,n))?'':'Needs support or trust +1 with a neighbor'},
  {id:'independent_service',title:'Test an independent service',body:'Technical foundation preparation and paid practice let you take a small independent booking.',outcome:'A first independent client walks through the door. The fee is real, and you now know a second career route is possible.',change:{hours:-2,energy:-9,cash:880,skill:1,joy:7,trust:{jo:1},flagsAdded:['independent_work','first_independent_client']}},
  fallback('Choose a steadier base first','You write down one practical next step and let this particular window go. Wanting a future does not require risking your present.',{joy:5,energy:6,flagsAdded:['future_named','sustainable_start']})
 ];
 case 'work_reset':return[
  {id:'work_plan',title:'Make a new work plan',body:'1 priority block, $0. Review the named workplace paths and choose your own next step. Your existing contract and preparation remain yours; this conversation is not a qualification or job offer.',outcome:'You make room to review the workplace board. A course, application or shift is still a separate choice.',change:{hours:-1,cash:0,energy:-4,joy:5}},
  {id:'jo_referral',title:'Take Jo’s independent referral',body:'Turn a trusted connection into paid practical work and a craft foothold. You will have a favor to return.',outcome:'Jo introduces you to a small client for this paid practical commitment. Your accepted venue contracts and field experience remain yours.',change:{hours:-1,energy:-7,cash:650,craft:1,trust:{jo:1},relationshipChanges:[askFavor('jo')],flagsAdded:['independent_work']},requirement:trustNeed(p,'jo')},
  {id:'community_pivot',title:'Start again with the block',body:'Trade two hours for connections and a small organizing fee.',outcome:'You begin a community route with people who need your time and care.',change:{hours:-2,energy:-6,cash:400,social:2,trust:{eli:1},relationshipChanges:[{npc:'eli',support:true}],flagsAdded:['community_pivot']}},
  fallback('Keep your current footing','The cancelled outside booking reduced your buffer. Your agreed venue contracts and earned experience remain in place; your next application or shift remains your decision.',{flagsAdded:['shift_loss_acknowledged']})
 ];
 case 'repair_bill':return[
  {id:'fix_together',title:'Fix it with your own hands',body:'Two craft levels turn an expensive setback into a repair session.',outcome:'You replace the swollen shelf boards and clean rust from the hand tools. The setback leaves a practical skill rather than a permanent loss.',change:{hours:-2,cash:-100,energy:-10,craft:1,joy:6,trust:{jo:1},relationshipChanges:[{npc:'jo',support:true,rivalry:false}],flagsAdded:['self_repaired'],flagsRemoved:['repairs_unfinished']},requirement:craft>=2?'':'Needs 2 craft levels'},
  {id:'jo_toolkit',title:'Borrow Jo’s spare toolkit',body:'Jo’s trust unlocks a repair credit and replacement tools. Return the favor when you can.',outcome:'Jo lends a hand plane, clamps and a screwdriver that get you moving again. Owning everything yourself is no longer the only way to carry on.',change:{hours:-1,energy:-5,cash:350,craft:Math.max(0,Number(r.context.craftBefore)-craft),trust:{jo:1},relationshipChanges:[askFavor('jo')],flagsAdded:['shared_toolkit'],flagsRemoved:['repairs_unfinished']},requirement:trustNeed(p,'jo')},
  {id:'fund_repairs',title:'Pay for a full repair',body:'Spend cash to protect your remaining time and regain some energy.',outcome:'A local repairer makes the space usable again. It costs more, but you preserve time for the life you were building.',change:{cash:-650,energy:10,joy:6,craft:Math.max(0,Number(r.context.craftBefore)-craft),flagsAdded:['repairs_paid'],flagsRemoved:['repairs_unfinished']}},
  fallback('Use a smaller temporary setup','You put the big setup on hold and use what still works. The inconvenience remains, but a borrowed corner is enough to keep going.',{flagsAdded:['smaller_setup']})
 ];

 }
}

const paidLifeHours:Record<string,number>={independent_service:40,jo_referral:40,community_pivot:20};
function choicesFor(p:Player,g:Game,r:LifeReceipt):Choice[]{return rawChoicesFor(p,g,r).map(raw=>{const matched=careerStoryGig(g,p,raw.id),c=matched?{...raw,body:matched.body,requirement:matched.reason}:raw;const cash=c.change.cash??0,paidHours=paidLifeHours[c.id]??0,q=paidHours?financialPayQuote(g,p,cash):null;return{...c,paidHours,paidTakeHome:cash,body:c.body+(paidHours?` Paid commitment: ${paidHours} hours this month; $${cash} take-home.`:'')+(q?.repayment?` $${q.repayment} repays arrears; $${q.cash} reaches your cash balance.`:''),outcome:c.outcome,change:{...c.change,cash:q?.cash??cash}};});}

/** Safe for repeat lifecycle calls and JSON reloads: each player receives the shared event once. */
export function beginLifeWeek(g:Game){
 if(g.status!=='playing')return;
 const entry=(g as LifeGame).lifeSchedule?.find(e=>e.week===g.round);if(!entry)return;
 let applied=false;
 for(const p of g.players){
  initializeLifePlayer(p);const state=life(p)!;
  if(state.receipts.some(r=>r.week===g.round))continue;
  const start=startEvent(p,entry.eventId),e=preview(p,start.change,true);
  const receipt:LifeReceipt={week:g.round,eventId:entry.eventId,kind:lifeOpportunityIds.includes(entry.eventId)?'opportunity':'setback',title:lifePeriodText(start.title),body:lifePeriodText(start.body),impact:lifePeriodText(start.impact),effects:e,choices:[],pending:true,journal:[lifePeriodText(`Month ${g.round}: ${start.impact}`)],context:{...start.context}};
  receipt.choices=choicesFor(p,g,receipt).map(c=>choiceKey(receipt,c.id));
  apply(p,e,lifePeriodText(`Month ${g.round}: ${start.title}`));state.receipts.push(receipt);applied=true;
 }
 if(applied)log(g,lifePeriodText(`Month ${g.round}: ${g.players.map(p=>currentReceipt(p,g)).find(Boolean)?.title}. Each life feels it differently.`));
}
export function getLifeEvent(p:Player,g:Game):LifeReceipt|null{return currentReceipt(p,g)??null;}
const choiceKey=(r:LifeReceipt,id:string)=>`${r.week}:${r.eventId}:${id}`;
function choiceReason(p:Player,g:Game,r:LifeReceipt,c:Choice):string{
 if(g.status!=='playing')return'The game is not running';
 if(!r.pending)return'This week’s choice is already settled';
 if(c.requirement)return c.requirement;
 const paidReason=economyWorkReason(p,g,c.paidHours??0);if(paidReason)return paidReason;
 if(p.hours<-(c.change.hours??0))return`Needs ${-(c.change.hours??0)} time this month`;
 if((c.change.cash??0)<0&&p.cash<-(c.change.cash??0))return`Needs $${-(c.change.cash??0)} available cash`;
 if((c.change.energy??0)<0&&p.energy<-(c.change.energy??0))return`Needs ${-(c.change.energy??0)} energy; rest first`;
 return'';
}
/** Pure: rendering choices does not initialize state, consume resources, or change relationships. */
export function lifeChoices(p:Player,g:Game):LifeChoiceView[]{
 const r=getLifeEvent(p,g);if(!r||!life(p))return[];
 return choicesFor(p,g,r).map(c=>{const reason=choiceReason(p,g,r,c),e=preview(p,c.change);return{id:choiceKey(r,c.id),title:lifePeriodText(c.title),body:lifePeriodText(c.body),available:!reason,reason:lifePeriodText(reason),preview:e,previewText:lifeEffectText(e).map(t=>lifePeriodText(t)),outcome:lifePeriodText(c.outcome),safe:!!c.safe};});
}
/** Choice IDs include week/event so a stale retry cannot accidentally choose next month's fallback. */
export function resolveLifeChoice(g:Game,p:Player,choiceId:string):LifeReceipt{
 active(g,p);
 const previous=life(p)!.receipts.find(r=>r.resolved?.choiceId===choiceId);if(previous)return previous;
 const r=currentReceipt(p,g);if(!r)throw Error(lifePeriodText('There is no life event to resolve this month'));
 const c=choicesFor(p,g,r).find(c=>choiceKey(r,c.id)===choiceId);if(!c)throw Error(lifePeriodText('That life choice is not available for this month'));
 const reason=choiceReason(p,g,r,c);if(reason)throw Error(lifePeriodText(reason));
 const e=preview(p,c.change);recordEconomyPaidHours(p,g,c.paidHours??0);if(c.paidHours)recordFinancialPay(g,p,`event:${choiceId}`,c.paidTakeHome??e.cash);apply(p,e,lifePeriodText(`Month ${g.round}: ${c.title}`));
 r.pending=false;r.resolved={choiceId,title:lifePeriodText(c.title),outcome:lifePeriodText(c.outcome),effects:e,deferred:false};r.journal.push(lifePeriodText(c.outcome));
 log(g,lifePeriodText(`${p.name}: ${c.title}. ${c.outcome}`));return r;
}
/** End-week takes the visible free fallback, never a paid response. Safe to call repeatedly. */
export function deferLifeChoice(g:Game,p:Player){
 const r=currentReceipt(p,g);if(!r?.pending)return;
 const fallback=choicesFor(p,g,r).find(c=>c.safe);if(!fallback)throw Error('A safe life-event fallback is missing');
 const result=resolveLifeChoice(g,p,choiceKey(r,fallback.id));if(result.resolved){result.resolved.deferred=true;result.journal.push(lifePeriodText('No response chosen before ending the month; the free take-stock option was used.'));}
}
const repairPlaces:Record<LifeNpc,string>={mina:'CORNER CAFÉ',eli:'GARDEN',jo:'MAKERSPACE'};
const remoteRepair=(p:Player,npc:LifeNpc)=>(!!p.world&&p.world.region!=='alder')||p.place!==repairPlaces[npc];
function repairProposal(p:Player,npc:LifeNpc):Proposal{const heard=life(p)?.flags.includes(`heard_${npc}`)??false;const r=relation(p,npc);return{hours:-1,joy:3,trust:{[npc]:1},relationshipChanges:heard&&r.trust>=0&&!remoteRepair(p,npc)?[{npc,rivalry:false,support:true}]:[],flagsAdded:[`heard_${npc}`]};}
/** Pure repair availability and exact effective resource/trust preview for the relationship UI. */
export function repairChoice(p:Player,g:Game,npc:LifeNpc):LifeChoiceView{
 if(!lifeNpcs.includes(npc))throw Error('Choose Mina, Eli or Jo');
 const r=relation(p,npc),change=repairProposal(p,npc),e=preview(p,change),remote=remoteRepair(p,npc);
 const reason=g.status!=='playing'?'The game is not running':r.lastRepairWeek===g.round?'You already checked in with this neighbor this month':p.hours<1?'Needs 1 time this month':r.trust===3&&!r.rivalry&&!r.reciprocity?'Your bond is steady; no repair is needed':'';
 return{id:`repair:${npc}`,title:remote?`Call ${names[npc]} for a check-in`:`Check in with ${names[npc]}`,body:remote?`${names[npc]} is in Alder Quay. This is a phone conversation: 1 priority block, $0. Rebuild trust, but an outstanding favor needs practical work and a strained conflict still needs an in-person follow-through.`:'1 priority block. Listen and rebuild trust. A first conversation does not erase rivalry, and a favor needs practical follow-through: pantry work for Eli, repair work for Jo, or a later reciprocal choice. A later in-person check-in can ease strain once trust recovers.',available:!reason,reason:lifePeriodText(reason),preview:e,previewText:lifeEffectText(e).map(t=>lifePeriodText(t)),outcome:`You ${remote?'make a phone call to':'make time in person for'} ${names[npc]}. The conversation does not undo the past, but it makes room for the next chapter.`,safe:false};
}
export function repairRelationship(g:Game,p:Player,npc:LifeNpc){
 active(g,p);const c=repairChoice(p,g,npc);if(!c.available)throw Error(c.reason);
 apply(p,c.preview,lifePeriodText(`Month ${g.round}: An honest check-in`));life(p)!.relationships[npc].lastRepairWeek=g.round;
 const receipt=currentReceipt(p,g);if(receipt)receipt.journal.push(c.outcome);
 log(g,`${p.name}: ${c.title}.`);return c;
}
export function relationshipViews(p:Player):LifeRelationshipView[]{
 if(p.castRedacted)return [];
 return lifeNpcs.map(id=>{const r=relation(p,id);return{id,name:names[id],role:roles[id],trust:r.trust,support:r.support,rivalry:r.rivalry,reciprocity:r.reciprocity,status:r.rivalry?'Strained, with room to repair':r.trust>=2?'Trusted friend':r.trust>=1||r.support?'A growing bond':r.trust<0?'Distance, not a closed door':'Getting to know each other',history:[...r.history],...(r.lastRepairWeek!==undefined?{lastRepairWeek:r.lastRepairWeek}:{})};});
}
/** Integration hook: call exactly once after each successful ordinary action, never on a preview or denied move. */
export function afterLifeAction(g:Game,p:Player,actionId:string){
 const state=life(p)!;state.activityCounts??={};state.activityCounts[actionId]=(state.activityCounts[actionId]??0)+1;
}

/** The free fallback never closes recovery: unfinished home/toolkit repairs remain actionable later. */
export function repairHomeChoice(p:Player,g:Game,method:'paid'|'diy'='paid'):LifeChoiceView{
 if(method!=='paid'&&method!=='diy')throw Error('Choose paid or DIY repairs');
 const receipt=life(p)?.receipts.find(r=>r.eventId==='repair_bill');
 const change:Proposal={hours:method==='paid'?-1:-2,cash:method==='paid'?-480:0,energy:5,joy:5,craft:Math.max(0,Number(receipt?.context.craftBefore??0)-(p.craft??0)),flagsRemoved:['repairs_unfinished'],flagsAdded:['repairs_completed']};
 const e=preview(p,change),reason=g.status!=='playing'?'The game is not running':!hasFlag(p,'repairs_unfinished')?'No unfinished home or toolkit repairs':p.hours<-(change.hours??0)?`Needs ${-(change.hours??0)} time this month`:method==='paid'&&p.cash<-(change.cash??0)?`Needs $${-(change.cash??0)} available cash`:'';
 return{id:`home_repair:${method}`,title:method==='paid'?'Finish the repairs with paid help':'Finish the repairs in stages',body:lifePeriodText(method==='paid'?`1 time and $${-(change.cash??0)} finish the postponed repairs and restore damaged toolkit progress.`:'2 time, no cash needed. Work in stages to finish postponed repairs and restore damaged toolkit progress.'),available:!reason,reason:lifePeriodText(reason),preview:e,previewText:lifeEffectText(e).map(t=>lifePeriodText(t)),outcome:'The temporary setup did its job. The repairs are finally finished, and your space and tools can support the next chapter.',safe:false};
}
export function repairHome(g:Game,p:Player,method:'paid'|'diy'='paid'){
 active(g,p);const choice=repairHomeChoice(p,g,method);if(!choice.available)throw Error(choice.reason);
 apply(p,choice.preview,lifePeriodText(`Month ${g.round}: Postponed repairs finished`));
 const receipt=life(p)!.receipts.find(r=>r.eventId==='repair_bill');receipt?.journal.push(choice.outcome);
 log(g,`${p.name}: ${choice.title}.`);return choice;
}
