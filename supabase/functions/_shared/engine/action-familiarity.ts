import {lifeEventPersonActor} from './person-event-responses.ts';
import type {Game,Player} from './game.ts';
import {worldChoices} from './world-life.ts';
import {getStoryView} from './story-arcs.ts';

/** Observational history only. First recorded action is not a claim about an old
 * save's unrecorded past. No relationship, currency or opportunity is changed. */
export type FamiliarityEntry={count:number;lastRound:number;lastVariant:number};
export type ActionFamiliarityState={version:1;startedRound:number;actions:Record<string,FamiliarityEntry>;people:Record<string,FamiliarityEntry>};
export type FamiliarityView={count:number;stage:'first'|'familiar'|'routine'|'custom';lastVariant:number;tracked:boolean;lastRound?:number};
export type FamiliarityContext={actionKey:string;actorIds:string[];round:number;replay:boolean};
type FamiliarityPlayer=Player&{familiarity?:ActionFamiliarityState;sharedPersonal?:{receipts:{actionId:string}[]}};
const MAX=Number.MAX_SAFE_INTEGER;
function entryView(e?:FamiliarityEntry):FamiliarityView{const count=e&&Number.isSafeInteger(e.count)&&e.count>=0?e.count:0;return{count,stage:count<2?'first':count<4?'familiar':count<7?'routine':'custom',lastVariant:e&&Number.isSafeInteger(e.lastVariant)?e.lastVariant:0,tracked:!!e,...(e?{lastRound:e.lastRound}:{})};}
/** A missing history means unrecorded, not a manufactured first-ever meeting. */
export function familiarityView(p:FamiliarityPlayer,query:{actionKey?:string;actorId?:string}):FamiliarityView{
 if(p.castRedacted||p.familiarity?.version!==1)return entryView();return entryView(query.actorId?p.familiarity.people[query.actorId]:query.actionKey?p.familiarity.actions[query.actionKey]:undefined);
}
function worldKey(actionId:string){const parts=actionId.slice(6).split(':');while(/^\d+$/.test(parts[0]??''))parts.shift();return parts.join(':');}
/** One semantic-key implementation shared by engine and all presenters. Capture
 * it before mutation, because travel and a shared claim can change the context. */
export function actionFamiliarityKey(actionId:string,p:FamiliarityPlayer,g:Game,destination?:string):string{
 if(actionId==='visit')return `visit:${p.world?.region??'alder'}:${destination??p.place}`;
 if(actionId.startsWith('world:shared:')){const parts=actionId.split(':'),region=parts[4],kind=parts[5];let qualifier='';if(kind==='reserve')qualifier=':'+parts[6];if(kind==='use'){const id=parts.slice(6).join(':');qualifier=':'+((g as Game&{sharedOpportunities?:{bookings:{id:string;purpose:string}[]}}).sharedOpportunities?.bookings.find(b=>b.id===id)?.purpose??'room');}return `shared:${region}:${kind}${qualifier}`;}
 if(actionId.startsWith('world:')){const key=worldKey(actionId);return `world:${p.world?.region??'alder'}:${key.startsWith('local:')?'regional-opening':key}`;}
 if(actionId.startsWith('cast:')){const parts=actionId.split(':');return `cast:${parts[2]}:${parts.slice(3).join(':')}`;}
 if(actionId.startsWith('motive:')){const parts=actionId.split(':');return `motive:${parts[2]}:${parts.at(-1)}`;}
 if(actionId.startsWith('story:')){const parts=actionId.split(':');return `story:${parts[1]}:${parts.slice(2).join(':').split('~')[0]}`;}
 if(actionId.startsWith('event:'))return `event:${actionId.split(':').slice(2).join(':')}`;
 return actionId;
}
function replayed(p:FamiliarityPlayer,id:string){
 if(id.startsWith('world:shared:'))return !!p.sharedPersonal?.receipts.some(r=>r.actionId===id);
 if(id.startsWith('world:'))return !!p.world?.acceptedChoices.includes(id.slice(6));
 if(id.startsWith('cast:'))return !!p.cast?.receipts.some(r=>r.id===id);
 if(id.startsWith('motive:'))return !!p.motives?.receipts.some(r=>r.id===id);
 if(id.startsWith('event:'))return !!p.life?.receipts.some(r=>r.resolved?.choiceId===id.slice(6));
 if(id.startsWith('story:')){const [,scene,choice]=id.split(':');return !!p.story?.receipts.some(r=>r.sceneId===scene&&r.choiceId===choice);}
 return false;
}
export function actionFamiliarityContext(g:Game,p:FamiliarityPlayer,id:string,destination?:string):FamiliarityContext{
 const context:FamiliarityContext={actionKey:actionFamiliarityKey(id,p,g,destination),actorIds:[],round:g.round,replay:replayed(p,id)||(id==='visit'&&destination===(p.place==='HOME'?'APARTMENTS':p.place))};
 if(context.replay)return context;
 if(id.startsWith('world:')){const choice=worldChoices(p,g).find(c=>c.id===id.slice(6));if(choice?.actorId)context.actorIds=[choice.actorId];else if(choice?.key.startsWith('talk:'))context.actorIds=[choice.key.slice(5)];else if(choice?.kind==='relationship')context.actorIds=['neri'];}
 else if(id.startsWith('cast:')||id.startsWith('motive:'))context.actorIds=[id.split(':')[2]];
 else if(id.startsWith('event:')){const actorId=lifeEventPersonActor(id,p);if(actorId)context.actorIds=[actorId];}
 else if(id.startsWith('repair:'))context.actorIds=[id.slice(7)];
 else if(id.startsWith('story:'))context.actorIds=getStoryView(g,p).scenes.find(s=>s.id===id.split(':')[1])?.characters??[];
 else if(/^story_(mina|eli|jo)_/.test(id))context.actorIds=[id.split('_')[1]];
 return context;
}
/** Called once after a successful actual state change inside the authenticated
 * command transaction. Server retries are handled before this engine is called. */
export function recordActionFamiliarity(p:FamiliarityPlayer,context:FamiliarityContext){
 if(context.replay)return;
 p.familiarity??={version:1,startedRound:context.round,actions:{},people:{}};
 if(p.familiarity.version!==1)return;
 const update=(map:Record<string,FamiliarityEntry>,key:string)=>{if(!key)return;const old=map[key];const count=Math.min(MAX,(old&&Number.isSafeInteger(old.count)&&old.count>=0?old.count:0)+1);map[key]={count,lastRound:context.round,lastVariant:old?((old.lastVariant??0)+1)%12:0};};
 update(p.familiarity.actions,context.actionKey);for(const id of new Set(context.actorIds))update(p.familiarity.people,id);
}
export function familiarityMemberPlayers(players:FamiliarityPlayer[],ownedIds:string[]):Player[]{return players.map(p=>{if(ownedIds.includes(p.id))return p;const{familiarity,...safe}=p;void familiarity;return safe;});}
