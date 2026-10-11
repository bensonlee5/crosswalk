import type {Player} from './game.ts';
import type {FoleyCue} from './foley.ts';
export type ActionSound = FoleyCue | 'endWeek' | 'start' | 'finish';

/** Reviewed against every ordinary activity in the current monthly rules.
 * null means no faithful recording yet. Never infer an action from its stat gains,
 * place, price, profession or a word such as “repair” in a relationship choice.
 * Monthly habits get one representative sound, not a loop for each implied visit.
 */
export const activitySounds: Readonly<Record<string, FoleyCue | null>> = {
  move: null,
  home_reset: null,
  home_meal: 'cook',
  home_host: null,
  career_network: null,
  friends: 'sip',
  cafe_break: 'sip',
  cafe_openmic: null,
  volunteer: null,
  community_setup: null,
  community_lead: null,
  rest: 'footsteps',
  park_picnic: null,
  park_run: null,
  park_read: 'pageTurn',
  library_read: 'pageTurn',
  library_club: 'pageTurn',
  market_cook: 'cook',
  market_taste: null,
  gym_yoga: null,
  gym_train: null,
  gym_sauna: null,
  maker_hobby: null,
  maker_repair: 'repair',
  cinema_matinee: null,
  cinema_friends: null,
  cinema_club: null,
  transit_scenic: null,
  transit_cleanup: null,
  garden_tend: null,
  garden_workshop: null,
  garden_rest: null,
  arcade_play: null,
  arcade_tabletop: null,
  arcade_host: null,
  creative_practice: null,
  weekly_opportunity: null,
  garden_project: null,
};

export function actionSound(op:string,action:string|undefined,before?:Player,after?:Player,finished=false):ActionSound|null{
 if(op==='start'||op==='create')return 'start';
 if(op!=='move'||!before||!after||before.id!==after.id)return null;
 if(action==='end')return finished?'finish':'endWeek';
 if(action==='visit')return before.place!==after.place?'footsteps':null;
 // Physical actions must really have taken place, rather than replayed a choice.
 if(!action||after.hours>=before.hours)return null;
 // Career cues require an exact new employer receipt. An application is paperwork;
 // technical/civic shifts include a documented handover, and repair-maker work
 // really is bench repair. Other roles remain quiet without a faithful recording.
 if(action.startsWith('career:')){
  const receipt=after.career?.receipts.find(r=>r.id===action);
  if(!receipt||before.career?.receipts.some(r=>r.id===action))return null;
  if(receipt.verb==='apply')return 'write';
  if(receipt.verb==='train')return receipt.place==='LIBRARY'?'pageTurn':'write';
  if(receipt.verb==='work'){const contract=after.career?.contracts.find(c=>receipt.target.startsWith(c.id+'.'));if(contract?.target==='t.practical.maker'||contract?.target==='p.bicycle-repair')return 'repair';if(contract?.field==='technical'||contract?.field==='civic')return 'write';}
  if(receipt.verb==='commission'&&receipt.target==='p.custom-repair')return 'repair';
  return null;
 }
 if(Object.prototype.hasOwnProperty.call(activitySounds,action))return activitySounds[action];
 if(action==='home_repair:diy'||action==='home_repair:paid')return 'repair';
 // Exact resolved event IDs; a relationship repair is an entirely different action.
 const event=/^event:\d+:repair_bill:fix_together$/.exec(action);
 if(event){
  const id=action.slice(6);
  if(!before.life?.receipts.some(r=>r.resolved?.choiceId===id)
    &&after.life?.receipts.some(r=>r.resolved?.choiceId===id&&!r.resolved.deferred))return 'repair';
 }
 // Shared choices can turn into “back the agreed plan” for another seat. The time
 // check above excludes that acknowledgement from pretending to do the work again.
 const story=/^story:(quay-credit|quay-friction|quay-build):([^:]+)~\d+$/.exec(action);
 if(story){
  const id=action.slice(action.lastIndexOf(':')+1);
  if(!before.story?.receipts.some(r=>r.sceneId===story[1])
    &&after.story?.receipts.some(r=>r.sceneId===story[1]&&r.choiceId===id)){
   if(story[1]==='quay-friction'&&story[2]==='repair_first')return 'repair';
   if((story[1]==='quay-credit'&&story[2]==='shared_credit')
     ||(story[1]==='quay-build'&&story[2]==='coordinate'))return 'write';
  }
 }
 // Current world-choice tokens contain both personal and shared revision fields.
 // Walking exploration is faithful; paid intercity travel may be a train or ferry.
 if(/^world:\d+:\d+:\d+:explore$/.test(action)){
  const id=action.slice(6);
  if(!before.world?.acceptedChoices.includes(id)&&after.world?.acceptedChoices.includes(id))return 'footsteps';
 }
 // World food can be flatbread, cornbread, dumplings or broth. A sip/cooking clip
 // would misrepresent most of them. Cast, motive, aspiration, work and social
 // choices likewise remain quiet until a specific, faithful recording is available.
 return null;
}
export function clockSound(before?:Player,after?:Player):'tick'|'timeUp'|null{
 if(!before||!after||before.id!==after.id||after.hours>=before.hours)return null;
 return after.hours===0?'timeUp':after.hours===1?'tick':null;
}
