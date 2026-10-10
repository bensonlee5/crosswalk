import {cameoAppearances,cameoPeople,resolveCameoChoice} from './character-cameos.ts';
import {currentCastCharacter,castCanonResponse} from './character-cast-canon.ts';
import {availableHistoryScene} from './character-history-scenes.ts';
import type {Game,Player} from './game.ts';
import type {RegionId} from './world-life.ts';
import {visiblePlaces} from './world-life.ts';
import {castCharacters,type CastCharacter} from './cast-characters.ts';

export type CastMemory={week:number;text:string};
export type CastBond={phase:'met'|'shared'|'tested'|'close';approach:'listen'|'help';lastWeek:number;promise?:{due:number;status:'open'|'kept'|'missed'|'released'};conflict:boolean;repaired:boolean;memories:CastMemory[];keepsake?:string;historyScene?:{id:string;choice:'share'|'boundary';week:number}};
export type CastReceipt={id:string;title:string;body:string;outcome:string;week:number};
export type CastPlayerState={version:1;bonds:Record<string,CastBond>;receipts:CastReceipt[]};
export type CastAppearance={id:string;region:RegionId;spot:string;kind:'local'|'visitor'};
export type CastState={version:1;schedule:Record<number,CastAppearance[]>};
export type CastChoice={id:string;actionId:string;title:string;body:string;available:boolean;reason:string;previewText:string[];cost:{time:number;cash:number;energy:number};outcome:string;key:string;energy:number;joy:number};
export type CastPersonView={id:string;name:string;role:string;bio:string;goal:string;region:RegionId;spot:string;status:string;body:string[];invitation:string|null;memories:CastMemory[];tie:string;choices:CastChoice[];lastReceipt?:CastReceipt;remote:boolean;interactionKind?:'friendship'|'local'|'family';companionId?:string};
const regions:RegionId[]=['alder','saffron','glasssteppe','pelagia','embermesa'];
const essentials=['CORNER CAFÉ','COMMUNITY','THE PARK'];
const enabled=(g:Game)=>g.castVersion===1&&!!g.cast;
function hash(seed:number,text:string){let x=seed>>>0;for(const c of text){x=Math.imul(x^c.charCodeAt(0),16777619)>>>0;x^=x>>>13;}return x>>>0;}
function remember(b:CastBond,week:number,text:string){b.memories.push({week,text});b.memories=b.memories.slice(-8);}
/** New-room-only state. The server seed is never needed by a rendered view. */
export function initializeCast(g:Game){
 if(g.castVersion!==1)return;
 if(!g.cast){const schedule:CastState['schedule']={};const seed=g.lifeSeed??hash(2166136261,g.code);
 for(let week=1;week<=g.maxRounds;week++){
  const row:CastAppearance[]=[];
  for(const region of regions){const locals=castCharacters.filter(c=>c.region===region);
   for(const c of locals){const present=hash(seed,`${week}:${c.id}:present`)%100<62;const seenLast=schedule[week-1]?.some(a=>a.id===c.id&&a.region===region);
    if(present||(week>1&&!seenLast)){const venues=c.places.filter(s=>essentials.includes(s));row.push({id:c.id,region,spot:venues[hash(seed,`${week}:${c.id}:spot`)%venues.length]??'COMMUNITY',kind:'local'});}}
   if(!row.some(a=>a.region===region)){const c=locals[hash(seed,`${week}:${region}`)%locals.length];if(c)row.push({id:c.id,region,spot:'COMMUNITY',kind:'local'});}
   if(hash(seed,`${week}:${region}:guest`)%100<35){const others=castCharacters.filter(c=>c.region!==region);const c=others[hash(seed,`${week}:${region}:who`)%others.length];row.push({id:c.id,region,spot:'CORNER CAFÉ',kind:'visitor'});}
  }schedule[week]=[...row,...cameoAppearances(g.characterCanonVersion,week)];
 }g.cast={version:1,schedule};}
 for(const p of g.players)initializeCastPlayer(g,p);
}
export function initializeCastPlayer(g:Game,p:Player){if(g.castVersion===1)p.cast??={version:1,bonds:{},receipts:[]};}
/** Run on each player's end, including the final month: only actual promises expire. */
export function endCastMonth(g:Game,p:Player){if(!enabled(g)||!p.cast)return;for(const [id,b] of Object.entries(p.cast.bonds)){if(castCharacters.some(c=>c.id===id)&&b.promise?.status==='open'&&b.promise.due<=g.round){b.promise.status='missed';b.conflict=true;const c=currentCastCharacter(g,castCharacters.find(c=>c.id===id)!);remember(b,g.round,c.missed);const receipt={id:`cast:${g.round}:${id}:missed`,week:g.round,title:`A promise to ${c.name}`,body:c.missed,outcome:g.round<g.maxRounds?'The promise was missed. An honest repair remains possible.':'The promise was missed. You leave an unfinished friendship, not a closed door.'};p.cast.receipts.push(receipt);}}if(g.characterCanonVersion!==1)p.cast.receipts=p.cast.receipts.slice(-64);}
function relationshipStatus(b?:CastBond){return !b?'A new face':b.conflict?'Something to repair':b.phase==='close'?'A friendship with shared history':b.phase==='tested'?'Room for honest disagreement':b.phase==='shared'?'Someone who knows your word':'A beginning worth returning to';}
function knowsTie(p:Player,c:CastCharacter){return (p.world?.localBonds?.[c.tie.id]??0)>=1||!!p.cast?.bonds[c.tie.id]||!!p.life?.relationships[c.tie.id as 'mina'|'eli'|'jo']?.support;}
function tieText(p:Player,c:CastCharacter){const familiar=knowsTie(p,c);return `${c.tie.context}${familiar?` ${c.name} knows you have also made time for ${c.tie.name}; that shared connection makes introductions easier.`:''}`;}
function makeChoices(g:Game,p:Player,c:CastCharacter,b:CastBond|undefined,spot:string,remote:boolean):CastChoice[]{
 const later=availableHistoryScene(g,p,c.id);
 if(b?.lastWeek===g.round||b?.phase==='close'&&!b.conflict&&!later)return[];
 const rows:{key:string;title:string;body:string;outcome:string;time?:number;energy?:number;joy?:number}[]=[];
 if(later){rows.push({key:'history_share',title:later.shareTitle,body:later.shareBody,outcome:later.shareOutcome},{key:'history_boundary',title:'Leave their answer to them',body:'State a limit without carrying a message, disclosing private news or speaking for another person.',outcome:later.boundaryOutcome,time:0});}
 else if(!b){if(knowsTie(p,c))rows.push({key:'introduction',title:`Start with ${c.tie.name}’s introduction`,body:c.tie.context,outcome:`You mention the time you made for ${c.tie.name}. ${c.name} starts with the part they usually leave out. ${c.listen}`,joy:3});rows.push({key:'listen',title:'Ask what matters to them',body:c.intro,outcome:c.listen,joy:3},{key:'help',title:'Lend a hand with the small part',body:c.goal,outcome:c.help,joy:3});}
 else if(b.conflict){rows.push({key:'repair',title:'Acknowledge what happened',body:'Name the missed work or hurt before offering anything new. This does not erase it.',outcome:b.promise?.status==='missed'?(remote?c.remoteRepair??c.repair:c.repair):c.disagreementRepair,joy:2},{key:'release',title:'Be honest about your limits',body:'Do not make another promise. Leave the door open without claiming the friendship is repaired.',outcome:`You tell ${c.name} what you cannot take on. There is no replacement promise; the unfinished conversation is still there.`,time:0});}
 else if(b.promise?.status==='open'){rows.push({key:'keep',title:'Make time for the promise',body:c.invitation,outcome:remote?c.remoteKept??c.kept:c.kept,joy:5},{key:'renegotiate',title:'Tell them your plans changed',body:'Give notice instead of letting them wait. The work will take a different shape.',outcome:c.renegotiated,time:0});}
 else if(b.phase==='met'){
 if(g.round<g.maxRounds)rows.push({key:'promise',title:'Say yes to next month',body:c.invitation,outcome:`You agree to make one priority block for ${c.name} next month. If you are away, you can arrange it through the community room.`,time:0});
 rows.push({key:'share',title:'Stay for a conversation now',body:'Make room today without promising time you may not have later.',outcome:`${c.listen} You choose a conversation today, with no future obligation.`,joy:3});
 }
 else if(b.phase==='shared'){rows.push({key:'honest',title:'Say what you really think',body:c.friction,outcome:c.boundary,joy:3},{key:'rush',title:'Push for the bigger result',body:'You think the work should reach further, even if that asks more of them.',outcome:`${c.name} hears the ambition, but asks you to stop deciding how much of their life the project should cost. The conversation ends unfinished.`});}
 else if(b.phase==='tested'){rows.push({key:'accept',title:'Let them make room for you',body:remote?c.remoteSupport??c.support:c.support,outcome:`${remote?c.remoteSupport??c.support:c.support} ${c.farewell}`,energy:6,joy:5},{key:'quiet',title:'Share a quieter goodbye',body:'There is no need to turn friendship into another achievement.',outcome:c.farewell,joy:4});}
 return rows.map(row=>{const time=row.time??1;const energy=Math.min(100-p.energy,row.energy??0),joy=Math.min(100-p.joy,row.joy??0);const reason=g.status!=='playing'?'This life is complete':p.place!==spot?`Visit ${spot} first`:p.hours<time?`Needs ${time} priority block`:b?.promise?.status==='open'&&row.key==='keep'&&g.round<b.promise.due?'The agreed meeting is next month':'';const id=`cast:${g.round}:${c.id}:${row.key}`;return{id,actionId:id,key:row.key,title:row.title,body:(remote?'A message carried through the community room. ':'')+row.body,outcome:castCanonResponse(g,c.id,row.key,row.outcome,remote),available:!reason,reason,cost:{time,cash:0,energy:0},energy,joy,previewText:[`${time} priority block${time===1?'':'s'} · $0`,...(energy?[`+${energy} energy`]:[]),...(joy?[`+${joy} happiness`]:[]),row.key==='promise'?`A promise for month ${g.round+1}; one block then.`:row.key==='rush'?'A disagreement to repair; no lost money.':'This specific moment becomes part of your shared history.']};});
}
/** Pure view: reloads, movement, and rejected requests never reroll an encounter. */
export function castPeople(g:Game,p:Player):CastPersonView[]{
 if(!enabled(g))return[];const redacted=p.castRedacted===true;const personal=redacted?{version:1 as const,bonds:{} as Record<string,CastBond>,receipts:[] as CastReceipt[]}:p.cast??{version:1,bonds:{},receipts:[]};const region=p.world?.region??'alder',visible=visiblePlaces(p,g);
 const appearances=g.cast!.schedule[g.round]?.filter(a=>a.region===region)??[];
 const ids=[...new Set([...appearances.map(a=>a.id),...Object.keys(personal.bonds)])];
 return ids.filter(id=>castCharacters.some(c=>c.id===id)).map((id):CastPersonView=>{const c=currentCastCharacter(g,castCharacters.find(c=>c.id===id)!),b=personal.bonds[id],appearance=appearances.find(a=>a.id===id);const remote=!appearance;const spot=appearance&&visible.includes(appearance.spot)?appearance.spot:'COMMUNITY';
 const later=availableHistoryScene(g,p,id);
 const invitation=later?later.title:!b?null:b.conflict?`${c.name} has left a way to reopen the conversation.`:b.promise?.status==='open'?`${c.name} is expecting you in month ${b.promise.due}.`:b.phase==='close'?null:b.phase==='tested'?(remote?c.remoteSupport??c.support:c.support):b.phase==='shared'?`${c.name} wants your honest opinion. ${c.friction}`:g.round<g.maxRounds?c.invitation:null;
 const body=[later?later.body:!b?c.intro:b.conflict?(b.promise?.status==='missed'?c.missed:c.friction):b.promise?.status==='open'?c.invitation:b.phase==='met'?(g.round<g.maxRounds?c.invitation:'There is time for a conversation today, without a promise beyond this last month.'):b.phase==='shared'?c.friction:b.phase==='tested'?(remote?c.remoteSupport??c.support:c.support):c.farewell];
 if(b?.phase==='met'&&b.memories.length===1&&b.lastWeek<g.round)body.push(b.approach==='help'?c.helpCallback:c.listenCallback);
 if(b?.memories.length)body.unshift(`Last time: ${b.memories.at(-1)!.text}`);
 return{id,name:c.name,role:c.role,bio:c.bio,goal:c.goal,region:c.region,spot,status:redacted?'Relationship private':relationshipStatus(b),body:redacted?['This player’s conversations and relationship history are private.']:body,invitation:redacted?null:invitation,memories:b?.memories??[],tie:redacted?c.tie.context:tieText(p,c),remote,choices:redacted?[]:makeChoices(g,p,c,b,spot,remote),lastReceipt:[...personal.receipts].reverse().find(r=>r.id.split(':')[2]===id)};
 }).concat(cameoPeople(g,p));
}
export function resolveCastChoice(g:Game,p:Player,id:string){
 if(!enabled(g)||!p.cast)throw Error('These encounters are not part of this saved life');
 if(g.status!=='playing')throw Error('This life is not running');
 if(g.players[g.turn]?.id!==p.id)throw Error('It is another player’s turn');
 if(p.cast.receipts.some(r=>r.id===id))return;
 if(resolveCameoChoice(g,p,id))return;
 const person=castPeople(g,p).find(c=>c.choices.some(v=>v.id===id));const choice=person?.choices.find(v=>v.id===id);
 if(!person||!choice)throw Error('That encounter is no longer available');if(!choice.available)throw Error(choice.reason);
 const c=currentCastCharacter(g,castCharacters.find(c=>c.id===person.id)!);let b=p.cast.bonds[c.id];
 if(!b)b=p.cast.bonds[c.id]={phase:'met',approach:choice.key==='help'?'help':'listen',lastWeek:0,conflict:false,repaired:false,memories:[]};
 const later=availableHistoryScene(g,p,c.id);
 if(choice.key==='history_share'||choice.key==='history_boundary'){if(!later)throw Error('That later conversation is no longer available');b.historyScene={id:later.id,choice:choice.key==='history_share'?'share':'boundary',week:g.round};}
 if(choice.key==='promise')b.promise={due:g.round+1,status:'open'};
 if(choice.key==='keep'){b.promise!.status='kept';b.phase='shared';b.keepsake=c.keepsake;}
 if(choice.key==='renegotiate'){b.promise!.status='released';b.phase='shared';}
 if(choice.key==='share')b.phase='shared';
 if(choice.key==='rush')b.conflict=true;
 if(choice.key==='honest')b.phase='tested';
 if(choice.key==='repair'){b.conflict=false;b.repaired=true;b.phase='tested';}
 if(choice.key==='accept'||choice.key==='quiet')b.phase='close';
 b.lastWeek=g.round;remember(b,g.round,choice.outcome);
 p.hours-=choice.cost.time;p.energy+=choice.energy;p.joy+=choice.joy;
 const receipt={id,week:g.round,title:`${c.name}: ${choice.title}`,body:choice.body,outcome:choice.outcome};p.cast.receipts.push(receipt);if(g.characterCanonVersion!==1)p.cast.receipts=p.cast.receipts.slice(-64);
 g.log.unshift(`${p.name} made time for ${c.name}.`);g.log=g.log.slice(0,32);
}
export function castEnding(g:Game,p:Player):string[]{if(!enabled(g)||!p.cast)return[];return Object.entries(p.cast.bonds).flatMap(([id,b])=>{const authored=castCharacters.find(c=>c.id===id);if(!authored)return[];const c=currentCastCharacter(g,authored);const memory=b.memories.at(-1)?.text??c.listen;return `${c.name}: ${b.conflict?'You leave an unfinished conversation, with a way back.':b.phase==='close'?'You made a friendship with room for two lives.':b.phase==='met'?'A beginning, not yet a deep friendship.':'A few specific days changed how you know each other.'} ${b.promise?.status==='kept'?`You kept the promise. ${c.keepsake} `:b.promise?.status==='missed'?'The missed promise remains part of the story. ':''}${b.repaired?'You also found a way to repair what went wrong. ':''}${memory}`;});}

/** Only the current public appearances leave the server. Personal cast history follows seat ownership. */
export function castMemberFields(g:Game,ownedIds:string[]){if(g.castVersion!==1&&g.motivesVersion!==1)return{};return{...(g.castVersion===1?{cast:g.cast?{version:1 as const,schedule:{[g.round]:g.cast.schedule[g.round]??[]}}:undefined}:{}),players:g.players.map(p=>{if(ownedIds.includes(p.id))return p;const {cast,motives,...publicPlayer}=p;void cast;void motives;return {...publicPlayer,castRedacted:true};})};}
